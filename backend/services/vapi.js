const axios = require('axios');
const { getUserProfile, getConversationMemory, logCall, publishDashboardEvent, incrementScamFlag } = require('./redis');
const { analyzeCall, fetchLiveScamAlerts } = require('./tinyfish');
const { queryKnowledgeBase } = require('./ghost');

const vapiClient = axios.create({
  baseURL: 'https://api.vapi.ai',
  headers: {
    Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ── Agent system prompts ───────────────────────────────────────────────────────
function buildScamAgentPrompt(userProfile, recentMemory, scamAlerts) {
  const alertSummary = scamAlerts.slice(0, 3).map((a) => `- ${a.title}: ${a.red_flags.join(', ')}`).join('\n');
  return `You are GuardianVoice, a calm, warm, and patient AI companion for ${userProfile?.name || 'this person'}.
Your role: protect them from phone scams and help them understand AI safety.

CURRENT TOP SCAMS TO WATCH FOR:
${alertSummary}

COMMUNICATION STYLE:
- Speak slowly and clearly. Use simple words. No jargon.
- Be warm, never condescending. Say their name.
- If they describe a suspicious call, ask calm questions and guide them.
- Always reassure: "You are safe. You did the right thing by asking me."
- Never rush. If they need you to repeat, do so kindly.

ACTIONS YOU CAN TAKE:
- Analyze if a call they describe sounds like a scam
- Explain what AI, deepfakes, and phone scams are in simple terms
- Advise them on next steps (who to call, what to do)
- Alert the family dashboard when a scam is detected

Recent context: ${JSON.stringify(recentMemory.slice(0, 3))}`;
}

function buildSchedulerAgentPrompt(userProfile, recentMemory) {
  return `You are GuardianVoice Scheduler, a caring AI assistant for ${userProfile?.name || 'this person'}.
Your role: help them book doctor appointments, manage health checkups, and coordinate care.

COMMUNICATION STYLE:
- Speak slowly, clearly, and warmly.
- Confirm each detail back to them before booking.
- Use simple language: "next Tuesday" not "2026-04-28".
- Always confirm: "Does that sound right to you?"

ACTIONS YOU CAN TAKE (call these as tools):
- book_appointment: schedule a doctor/specialist visit
- check_availability: find open slots
- send_confirmation: notify family member

Recent context: ${JSON.stringify(recentMemory.slice(0, 3))}`;
}

function buildReminderAgentPrompt(userProfile) {
  return `You are GuardianVoice Reminder, a gentle AI companion for ${userProfile?.name || 'this person'}.
Your role: remind them about medications, pension dates, appointments, and daily tasks.

When calling them:
- Start with "Good [morning/afternoon], ${userProfile?.name || 'there'}! This is GuardianVoice."
- State the reminder clearly and simply.
- Ask if they've completed it. If yes, say "Wonderful! I'm so glad."
- If they have questions, answer patiently.
- Keep calls under 2 minutes.`;
}

function buildEducatorAgentPrompt(userProfile, knowledge) {
  return `You are GuardianVoice Guide, a patient AI teacher for ${userProfile?.name || 'this person'}.
Your role: explain AI, technology, and safety topics in the simplest possible terms.

KNOWLEDGE BASE EXCERPT:
${knowledge?.slice(0, 500) || 'General AI safety knowledge available.'}

RULES:
- Use analogies they know: "AI is like a very smart calculator that learned from reading millions of books."
- Never use tech jargon without immediately explaining it.
- Ask "Does that make sense?" after each explanation.
- Always validate: "That is a great question."
- If unsure, say "Let me find out the best answer for you."`;
}

// ── Create VAPI assistants ─────────────────────────────────────────────────────
async function createAssistants(userId) {
  const [profile, memory, scamAlerts] = await Promise.all([
    getUserProfile(userId),
    getConversationMemory(userId),
    fetchLiveScamAlerts(),
  ]);

  const knowledge = await queryKnowledgeBase('AI scam elder safety overview').catch(() => '');

  const assistants = [
    {
      name: 'ScamGuard',
      systemPrompt: buildScamAgentPrompt(profile, memory, scamAlerts),
      firstMessage: `Hello${profile?.name ? `, ${profile.name}` : ''}! I'm GuardianVoice. How can I help keep you safe today?`,
      tools: [
        { type: 'function', function: { name: 'analyze_scam_call', description: 'Analyze if a described phone call is a scam', parameters: { type: 'object', properties: { description: { type: 'string' } }, required: ['description'] } } },
        { type: 'function', function: { name: 'alert_family', description: 'Send scam alert to family dashboard', parameters: { type: 'object', properties: { threat_level: { type: 'string' }, details: { type: 'string' } }, required: ['threat_level', 'details'] } } },
      ],
    },
    {
      name: 'Scheduler',
      systemPrompt: buildSchedulerAgentPrompt(profile, memory),
      firstMessage: `Hi${profile?.name ? ` ${profile.name}` : ''}! I can help you schedule doctor appointments. What kind of appointment do you need?`,
      tools: [
        { type: 'function', function: { name: 'book_appointment', description: 'Book a healthcare appointment', parameters: { type: 'object', properties: { specialty: { type: 'string' }, preferred_date: { type: 'string' }, notes: { type: 'string' } }, required: ['specialty', 'preferred_date'] } } },
        { type: 'function', function: { name: 'send_family_notification', description: 'Notify family of appointment', parameters: { type: 'object', properties: { appointment_details: { type: 'string' } }, required: ['appointment_details'] } } },
      ],
    },
    {
      name: 'Educator',
      systemPrompt: buildEducatorAgentPrompt(profile, knowledge),
      firstMessage: `Hello! I'm here to help explain anything about AI, technology, or phone safety. What would you like to know?`,
    },
  ];

  const created = {};
  for (const assistant of assistants) {
    try {
      const res = await vapiClient.post('/assistant', {
        name: assistant.name,
        model: {
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          systemPrompt: assistant.systemPrompt,
          tools: assistant.tools || [],
        },
        voice: { provider: '11labs', voiceId: 'pNInz6obpgDQGcFmaJgB', stability: 0.8, similarityBoost: 0.85 },
        firstMessage: assistant.firstMessage,
        transcriber: { provider: 'deepgram', model: 'nova-3', language: 'en' },
        endCallFunctionEnabled: true,
        recordingEnabled: true,
      });
      created[assistant.name.toLowerCase()] = res.data.id;
    } catch (err) {
      console.error(`[VAPI] Failed to create ${assistant.name}:`, err.response?.data || err.message);
    }
  }
  return created;
}

// ── Start a web call ───────────────────────────────────────────────────────────
async function startWebCall(assistantId, userId) {
  const res = await vapiClient.post('/call/web', {
    assistantId,
    metadata: { userId },
  });
  return res.data;
}

// ── Make an outbound reminder call ─────────────────────────────────────────────
async function makeOutboundCall(phoneNumber, assistantId, userId, reminderText) {
  const profile = await getUserProfile(userId);
  const res = await vapiClient.post('/call/phone', {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    assistantId,
    customer: { number: phoneNumber, name: profile?.name || 'there' },
    assistantOverrides: {
      firstMessage: reminderText,
    },
    metadata: { userId, type: 'reminder' },
  });
  return res.data;
}

// ── Handle VAPI webhook events ─────────────────────────────────────────────────
async function handleWebhook(event) {
  const { type, call } = event;
  const userId = call?.metadata?.userId || 'unknown';

  switch (type) {
    case 'call-started':
      await publishDashboardEvent(userId, { type: 'call_started', callId: call.id, ts: Date.now() });
      break;

    case 'call-ended':
      await logCall(userId, { id: call.id, duration: call.duration, summary: call.summary, ts: Date.now() });
      await publishDashboardEvent(userId, { type: 'call_ended', callId: call.id, duration: call.duration, summary: call.summary });
      break;

    case 'function-call': {
      const { functionCall } = event;
      if (functionCall?.name === 'analyze_scam_call') {
        const result = await analyzeCall(functionCall.parameters.description);
        if (result.is_scam) {
          await incrementScamFlag(userId);
          await publishDashboardEvent(userId, { type: 'scam_detected', details: result, ts: Date.now() });
        }
        return result;
      }
      if (functionCall?.name === 'alert_family') {
        await publishDashboardEvent(userId, { type: 'family_alert', ...functionCall.parameters, ts: Date.now() });
        return { success: true, message: 'Family has been notified.' };
      }
      if (functionCall?.name === 'book_appointment') {
        await publishDashboardEvent(userId, { type: 'appointment_booked', ...functionCall.parameters, ts: Date.now() });
        return { success: true, confirmation: `Appointment booked for ${functionCall.parameters.preferred_date}` };
      }
      break;
    }

    default:
      break;
  }
  return null;
}

async function listCalls(limit = 20) {
  const res = await vapiClient.get(`/call?limit=${limit}`);
  return res.data || [];
}

module.exports = { createAssistants, startWebCall, makeOutboundCall, handleWebhook, listCalls };
