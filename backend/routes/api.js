const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const vapiService = require('../services/vapi');
const tinyfishService = require('../services/tinyfish');
const nexlaService = require('../services/nexla');
const ghostService = require('../services/ghost');
const redisService = require('../services/redis');

// ── User Profile ───────────────────────────────────────────────────────────────
router.get('/user/:userId/profile', async (req, res) => {
  try {
    const profile = await redisService.getUserProfile(req.params.userId);
    res.json(profile || { id: req.params.userId, name: 'User', setupComplete: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/user/:userId/profile', async (req, res) => {
  try {
    const profile = { ...req.body, id: req.params.userId, updatedAt: Date.now() };
    await redisService.saveUserProfile(req.params.userId, profile);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Voice / VAPI ───────────────────────────────────────────────────────────────
router.post('/voice/setup/:userId', async (req, res) => {
  try {
    const assistants = await vapiService.createAssistants(req.params.userId);
    await redisService.saveUserProfile(req.params.userId, {
      ...(await redisService.getUserProfile(req.params.userId)),
      assistants,
      vapiSetup: true,
    });
    res.json({ success: true, assistants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/voice/call/web', async (req, res) => {
  const { assistantId, userId } = req.body;
  try {
    const call = await vapiService.startWebCall(assistantId, userId);
    res.json(call);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/voice/call/outbound', async (req, res) => {
  const { phoneNumber, assistantId, userId, message } = req.body;
  try {
    const call = await vapiService.makeOutboundCall(phoneNumber, assistantId, userId, message);
    res.json(call);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/voice/webhook', async (req, res) => {
  try {
    const result = await vapiService.handleWebhook(req.body);
    res.json(result || { received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Scam Protection ────────────────────────────────────────────────────────────
router.get('/scam/alerts', async (req, res) => {
  try {
    const alerts = await tinyfishService.fetchLiveScamAlerts();
    res.json({ alerts, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scam/analyze', async (req, res) => {
  const { description, userId } = req.body;
  try {
    const result = await tinyfishService.analyzeCall(description);
    if (result.is_scam && userId) {
      await redisService.incrementScamFlag(userId);
      await redisService.publishDashboardEvent(userId, { type: 'scam_detected', result, ts: Date.now() });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Reminders ─────────────────────────────────────────────────────────────────
router.get('/reminders/:userId', async (req, res) => {
  try {
    const reminders = await redisService.getReminders(req.params.userId);
    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reminders/:userId', async (req, res) => {
  try {
    const reminder = { ...req.body, id: uuidv4(), createdAt: Date.now() };
    await redisService.scheduleReminder(req.params.userId, reminder);
    await nexlaService.syncCalendarReminder({ userId: req.params.userId, ...reminder });
    await redisService.publishDashboardEvent(req.params.userId, { type: 'reminder_added', reminder });
    res.json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/reminders/:userId/:reminderId', async (req, res) => {
  try {
    await redisService.deleteReminder(req.params.userId, req.params.reminderId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Appointments ──────────────────────────────────────────────────────────────
router.post('/appointments/:userId', async (req, res) => {
  try {
    const userProfile = await redisService.getUserProfile(req.params.userId);
    const appointment = await nexlaService.bookAppointment({ userId: req.params.userId, userProfile, ...req.body });
    if (appointment.success) {
      await redisService.scheduleReminder(req.params.userId, {
        id: uuidv4(), type: 'appointment',
        title: `Doctor appointment: ${req.body.specialty}`,
        date: appointment.appointmentDate, time: '09:00',
      });
      await redisService.publishDashboardEvent(req.params.userId, { type: 'appointment_booked', appointment });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Pension & Benefits ────────────────────────────────────────────────────────
router.get('/benefits/:userId', async (req, res) => {
  try {
    const schedule = await nexlaService.getPensionSchedule(req.params.userId);
    res.json({ schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Knowledge Base (Ghost) ────────────────────────────────────────────────────
router.get('/knowledge', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await ghostService.queryKnowledgeBase(q || 'AI safety scams elderly');
    res.json({ result, query: q });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dashboard Stats ───────────────────────────────────────────────────────────
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const [stats, callLog, reminders, scamAlerts, benefits] = await Promise.all([
      redisService.getStats(req.params.userId),
      redisService.getCallLog(req.params.userId, 10),
      redisService.getReminders(req.params.userId),
      tinyfishService.fetchLiveScamAlerts(),
      nexlaService.getPensionSchedule(req.params.userId),
    ]);
    res.json({ stats, callLog, reminders, scamAlerts, benefits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SSE — live dashboard updates ──────────────────────────────────────────────
router.get('/dashboard/:userId/live', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  send({ type: 'connected', userId: req.params.userId });

  const sub = await redisService.subscribeDashboard(req.params.userId, (event) => send(event));
  const heartbeat = setInterval(() => res.write(':heartbeat\n\n'), 25000);
  req.on('close', () => { clearInterval(heartbeat); sub?.quit?.(); });
});

// ── Health ─────────────────────────────────────────────────────────────────────
router.get('/health', (_, res) => res.json({ status: 'ok', service: 'GuardianVoice API', ts: Date.now() }));

module.exports = router;
