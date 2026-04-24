const axios = require('axios');
const { cacheScamAlerts, getCachedScamAlerts } = require('./redis');

const TINYFISH_BASE = 'https://agent.tinyfish.ai/v1';

// Tinyfish returns SSE stream — parse events and return the COMPLETED result
async function runAutomation(url, goal) {
  const response = await axios.post(
    `${TINYFISH_BASE}/automation/run-sse`,
    { url, goal },
    {
      headers: {
        'X-API-Key': process.env.TINYFISH_API_KEY,
        'Content-Type': 'application/json',
      },
      responseType: 'text',
      timeout: 90000,
    }
  );

  // Parse SSE — find the COMPLETED event which has the actual result
  const lines = response.data.split('\n');
  let completedEvent = null;
  let lastEvent = null;

  for (const line of lines) {
    if (line.startsWith('data:')) {
      const raw = line.slice(5).trim();
      if (!raw || raw === '[DONE]') continue;
      try {
        const event = JSON.parse(raw);
        lastEvent = event;
        if (event.type === 'COMPLETE' || event.type === 'COMPLETED' || event.type === 'RESULT') {
          completedEvent = event;
        }
      } catch (_) {}
    }
  }

  const event = completedEvent || lastEvent;
  if (!event) return null;
  return event.result ?? event.output ?? event.data ?? event.answer ?? event;
}

// ── Live scam alert fetch ──────────────────────────────────────────────────────
async function fetchLiveScamAlerts() {
  const cached = await getCachedScamAlerts();
  if (cached) return cached;

  try {
    const data = await runAutomation(
      'https://consumer.ftc.gov',
      'Find the 5 most recent active phone scams targeting elderly Americans in 2026. ' +
      'Return JSON array with fields: title, description (2 sentences max), red_flags (array of 3), how_to_respond.'
    );

    // Result may be { scams: [...] } or a direct array
    const alerts = Array.isArray(data) ? data
      : Array.isArray(data?.scams) ? data.scams
      : parseJsonResponse(data, null);

    if (alerts && Array.isArray(alerts) && alerts.length) {
      await cacheScamAlerts(alerts);
      return alerts;
    }
    return getFallbackScamAlerts();
  } catch (err) {
    console.error('[Tinyfish] Scam alert fetch failed:', err.message);
    return getFallbackScamAlerts();
  }
}

// ── Analyze a specific suspicious call ────────────────────────────────────────
async function analyzeCall(callDescription) {
  try {
    const data = await runAutomation(
      'https://consumer.ftc.gov/scam-alerts',
      `A person described this suspicious phone call: "${callDescription}". ` +
      'Search for matching scam patterns. Return JSON: { is_scam: boolean, confidence: 0-100, scam_type: string, explanation: string, action: string }'
    );

    const raw = typeof data === 'object' ? data : parseJsonResponse(data, null);
    return parseJsonResponse(raw, {
      is_scam: true,
      confidence: 85,
      scam_type: 'Unknown — treat as suspicious',
      explanation: 'This matches patterns of known phone scams targeting elderly individuals.',
      action: 'Hang up immediately. Do not provide any personal information.',
    });
  } catch (err) {
    console.error('[Tinyfish] Call analysis failed:', err.message);
    return {
      is_scam: true,
      confidence: 70,
      scam_type: 'Suspicious call',
      explanation: 'Unable to verify in real time. Treating as suspicious to keep you safe.',
      action: 'When in doubt, hang up. Real organizations will contact you again by mail.',
    };
  }
}

// ── Fetch local healthcare providers ─────────────────────────────────────────
async function findHealthcareProviders(specialty, location) {
  try {
    const data = await runAutomation(
      `https://www.zocdoc.com/search?insurance_carrier=medicare&specialty=${encodeURIComponent(specialty)}&location=${encodeURIComponent(location)}`,
      'Find doctor names, availability, and addresses accepting Medicare.'
    );
    return data?.result || [];
  } catch (err) {
    console.error('[Tinyfish] Healthcare fetch failed:', err.message);
    return [];
  }
}

// ── Fetch AI safety / scam education content ──────────────────────────────────
async function fetchEducationContent(topic) {
  try {
    const data = await runAutomation(
      'https://consumer.ftc.gov/scam-alerts',
      `${topic} explained simply for seniors`
    );
    return data?.result ? [{ text: data.result }] : [];
  } catch (err) {
    console.error('[Tinyfish] Education content fetch failed:', err.message);
    return [];
  }
}

function parseJsonResponse(raw, fallback) {
  if (!raw) return fallback;
  try {
    if (typeof raw === 'object') return raw;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (_) {
    return fallback;
  }
}

function getFallbackScamAlerts() {
  return [
    {
      title: 'IRS Phone Scam',
      description: 'Fake IRS agents demand immediate payment by gift card or wire transfer.',
      red_flags: ['IRS never calls first', 'Gift card payment demand', 'Threat of arrest'],
      how_to_respond: 'Hang up. Call IRS directly at 1-800-829-1040.',
    },
    {
      title: 'Social Security Suspension Scam',
      description: 'Callers claim your Social Security number has been "suspended" due to criminal activity.',
      red_flags: ['SSA numbers cannot be suspended', 'Urgency and panic tactics', 'Asks for personal info'],
      how_to_respond: 'Hang up. Social Security never calls to suspend your number.',
    },
    {
      title: 'Grandparent Scam',
      description: 'Someone calls pretending to be your grandchild in trouble, needing money urgently.',
      red_flags: ['Urgency and secrecy demanded', 'Wire transfer or gift cards', 'Asks you not to tell family'],
      how_to_respond: 'Call your grandchild directly on their known number before sending any money.',
    },
  ];
}

module.exports = { fetchLiveScamAlerts, analyzeCall, findHealthcareProviders, fetchEducationContent };
