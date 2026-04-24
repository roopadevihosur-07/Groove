const axios = require('axios');

const ghostClient = axios.create({
  baseURL: process.env.GHOST_BASE_URL || 'https://api.tigerdata.io/v1',
  headers: {
    Authorization: `Bearer ${process.env.GHOST_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Built-in knowledge base for demo (fallback when Ghost API unavailable)
const BUILT_IN_KNOWLEDGE = {
  scam_types: `
    PHONE SCAMS TARGETING ELDERLY PEOPLE (2026):
    1. IRS Impersonation: Fake agents demand gift card payment. IRS NEVER calls first.
    2. Social Security Scams: Claim your number is "suspended." SSA never does this.
    3. Medicare Fraud: Offer free equipment in exchange for your Medicare ID.
    4. Grandparent Scam: Pretend to be a grandchild in trouble needing money fast.
    5. Tech Support Scam: Say your computer has a virus, ask for remote access.
    6. Lottery/Prize Scam: Say you won but need to pay fees first to collect.
    7. Romance Scam: Build fake relationships online to request money.
    RED FLAGS for ALL: urgency, secrecy, gift card payments, wire transfers.
  `,
  what_is_ai: `
    WHAT IS ARTIFICIAL INTELLIGENCE (AI):
    AI is computer software that can do things that normally need human intelligence.
    Like: understanding what you say, answering questions, recognizing pictures.
    AI learned by reading millions of books, websites, and conversations.
    AI does NOT have feelings. It is very smart but not alive.
    AI cannot access your bank account unless YOU give it permission.
    Safe AI tools: GuardianVoice, Google Assistant, Siri, Alexa.
    Always: never give your passwords or bank info to any AI or caller.
  `,
  what_is_deepfake: `
    WHAT IS A DEEPFAKE:
    A deepfake is a fake video or audio made by a computer to look or sound real.
    Someone can make a video that looks like your grandchild asking for money.
    Someone can clone a voice to sound exactly like someone you know.
    HOW TO SPOT DEEPFAKES: 
    - Blurry edges around faces in videos
    - Voice sounds slightly robotic or echo-y
    - They avoid answering specific personal questions
    WHAT TO DO: Always call back on a known number before sending money.
  `,
  pension_guide: `
    PENSION AND SOCIAL SECURITY GUIDE:
    Social Security payments arrive on a fixed schedule — no one can "hold" them.
    Medicare covers hospital, doctor, and some drug costs for people 65+.
    Pension scams: No one can "protect" or "upgrade" your pension for a fee.
    Government agencies contact you BY MAIL first, never by phone.
    Your benefits are YOURS. No court can freeze them without written notice.
    If you think someone is stealing your benefits, call 1-800-772-1213 (SSA).
  `,
  medication_reminders: `
    MEDICATION SAFETY TIPS:
    Take medications at the same time each day — link to meals or bedtime.
    Never stop a prescribed medication without talking to your doctor first.
    Keep a written list of all medications to show any new doctor.
    Ask your pharmacist if you are unsure how to take a new medication.
    Store medications in a cool, dry place — not the bathroom cabinet.
    If you miss a dose: take it as soon as you remember, unless it's close to the next dose.
  `,
};

// ── Query the Ghost knowledge base ────────────────────────────────────────────
async function queryKnowledgeBase(query) {
  try {
    const res = await ghostClient.post('/query', {
      query,
      collection: 'guardian_voice_kb',
      top_k: 3,
    });
    return res.data?.results?.map((r) => r.text).join('\n\n') || selectLocalKnowledge(query);
  } catch (err) {
    console.warn('[Ghost] API unavailable, using built-in knowledge:', err.message);
    return selectLocalKnowledge(query);
  }
}

// ── Ingest content into Ghost ─────────────────────────────────────────────────
async function ingestDocument(content, metadata) {
  try {
    const res = await ghostClient.post('/ingest', {
      content,
      metadata,
      collection: 'guardian_voice_kb',
    });
    return res.data;
  } catch (err) {
    console.error('[Ghost] Ingest failed:', err.message);
    return null;
  }
}

// ── Seed the knowledge base with elder care content ───────────────────────────
async function seedKnowledgeBase() {
  const docs = Object.entries(BUILT_IN_KNOWLEDGE).map(([key, content]) => ({
    content,
    metadata: { topic: key, source: 'guardian_voice_builtin', version: '1.0' },
  }));

  console.log('[Ghost] Seeding knowledge base with', docs.length, 'documents...');
  const results = await Promise.allSettled(docs.map((d) => ingestDocument(d.content, d.metadata)));
  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`[Ghost] Seeded ${succeeded}/${docs.length} documents`);
  return succeeded;
}

function selectLocalKnowledge(query) {
  const q = query.toLowerCase();
  if (q.includes('scam') || q.includes('fraud') || q.includes('suspicious')) return BUILT_IN_KNOWLEDGE.scam_types;
  if (q.includes('deepfake') || q.includes('fake video') || q.includes('fake voice')) return BUILT_IN_KNOWLEDGE.what_is_deepfake;
  if (q.includes('ai') || q.includes('artificial intelligence') || q.includes('robot')) return BUILT_IN_KNOWLEDGE.what_is_ai;
  if (q.includes('pension') || q.includes('social security') || q.includes('medicare') || q.includes('benefit')) return BUILT_IN_KNOWLEDGE.pension_guide;
  if (q.includes('medication') || q.includes('medicine') || q.includes('pill') || q.includes('dose')) return BUILT_IN_KNOWLEDGE.medication_reminders;
  return BUILT_IN_KNOWLEDGE.scam_types;
}

module.exports = { queryKnowledgeBase, ingestDocument, seedKnowledgeBase };
