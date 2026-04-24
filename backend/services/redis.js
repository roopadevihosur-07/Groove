const { createClient } = require('redis');

let client = null;
let pubClient = null;
let subClient = null;

async function getRedisClient() {
  if (client && client.isOpen) return client;
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
  });
  client.on('error', (err) => console.error('[Redis] Error:', err));
  await client.connect();
  console.log('[Redis] Connected');
  return client;
}

async function getPubClient() {
  if (pubClient && pubClient.isOpen) return pubClient;
  pubClient = createClient({ url: process.env.REDIS_URL });
  await pubClient.connect();
  return pubClient;
}

async function getSubClient() {
  if (subClient && subClient.isOpen) return subClient;
  subClient = createClient({ url: process.env.REDIS_URL });
  await subClient.connect();
  return subClient;
}

// ── Agent Memory ───────────────────────────────────────────────────────────────
async function saveUserProfile(userId, profile) {
  const r = await getRedisClient();
  await r.set(`user:profile:${userId}`, JSON.stringify(profile), { EX: 86400 * 30 });
}

async function getUserProfile(userId) {
  const r = await getRedisClient();
  const data = await r.get(`user:profile:${userId}`);
  return data ? JSON.parse(data) : null;
}

async function appendConversationMemory(userId, entry) {
  const r = await getRedisClient();
  const key = `user:memory:${userId}`;
  await r.lPush(key, JSON.stringify({ ...entry, ts: Date.now() }));
  await r.lTrim(key, 0, 49); // keep last 50 entries
  await r.expire(key, 86400 * 7);
}

async function getConversationMemory(userId, count = 10) {
  const r = await getRedisClient();
  const items = await r.lRange(`user:memory:${userId}`, 0, count - 1);
  return items.map((i) => JSON.parse(i));
}

// ── Reminder Scheduler ─────────────────────────────────────────────────────────
async function scheduleReminder(userId, reminder) {
  const r = await getRedisClient();
  const key = `reminders:${userId}`;
  await r.lPush(key, JSON.stringify(reminder));
  await r.expire(key, 86400 * 90);
}

async function getReminders(userId) {
  const r = await getRedisClient();
  const items = await r.lRange(`reminders:${userId}`, 0, -1);
  return items.map((i) => JSON.parse(i));
}

async function deleteReminder(userId, reminderId) {
  const r = await getRedisClient();
  const items = await getReminders(userId);
  const updated = items.filter((i) => i.id !== reminderId);
  const key = `reminders:${userId}`;
  await r.del(key);
  for (const item of updated) await r.rPush(key, JSON.stringify(item));
}

// ── Scam Alert Cache ───────────────────────────────────────────────────────────
async function cacheScamAlerts(alerts) {
  const r = await getRedisClient();
  await r.set('scam:alerts:latest', JSON.stringify(alerts), { EX: 3600 });
}

async function getCachedScamAlerts() {
  const r = await getRedisClient();
  const data = await r.get('scam:alerts:latest');
  return data ? JSON.parse(data) : null;
}

// ── Call Log ───────────────────────────────────────────────────────────────────
async function logCall(userId, callEntry) {
  const r = await getRedisClient();
  await r.lPush(`calls:${userId}`, JSON.stringify({ ...callEntry, ts: Date.now() }));
  await r.lTrim(`calls:${userId}`, 0, 99);
  await r.expire(`calls:${userId}`, 86400 * 30);
}

async function getCallLog(userId, count = 20) {
  const r = await getRedisClient();
  const items = await r.lRange(`calls:${userId}`, 0, count - 1);
  return items.map((i) => JSON.parse(i));
}

// ── Real-time pub/sub for family dashboard ─────────────────────────────────────
async function publishDashboardEvent(userId, event) {
  const pub = await getPubClient();
  await pub.publish(`dashboard:${userId}`, JSON.stringify(event));
}

async function subscribeDashboard(userId, onMessage) {
  const sub = await getSubClient();
  await sub.subscribe(`dashboard:${userId}`, (msg) => {
    try { onMessage(JSON.parse(msg)); } catch (_) {}
  });
  return sub;
}

// ── Stats ──────────────────────────────────────────────────────────────────────
async function getStats(userId) {
  const r = await getRedisClient();
  const [calls, reminders, scamFlags] = await Promise.all([
    r.lLen(`calls:${userId}`),
    r.lLen(`reminders:${userId}`),
    r.get(`scam:flags:${userId}`),
  ]);
  return {
    totalCalls: calls || 0,
    activeReminders: reminders || 0,
    scamsBlocked: parseInt(scamFlags || '0', 10),
  };
}

async function incrementScamFlag(userId) {
  const r = await getRedisClient();
  await r.incr(`scam:flags:${userId}`);
}

module.exports = {
  getRedisClient,
  saveUserProfile, getUserProfile,
  appendConversationMemory, getConversationMemory,
  scheduleReminder, getReminders, deleteReminder,
  cacheScamAlerts, getCachedScamAlerts,
  logCall, getCallLog,
  publishDashboardEvent, subscribeDashboard,
  getStats, incrementScamFlag,
};
