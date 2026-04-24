require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('./services/redis');
const { seedKnowledgeBase } = require('./services/ghost');
const { fetchLiveScamAlerts } = require('./services/tinyfish');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', rateLimit({ windowMs: 60_000, max: 120, message: 'Too many requests' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Serve built frontend in production ────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
}

// ── 404 & Error handlers ──────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await getRedisClient();
    console.log('[Redis] Connected successfully');

    // Seed Ghost knowledge base in background
    seedKnowledgeBase().catch((e) => console.warn('[Ghost] Seed skipped:', e.message));

    // Pre-warm Tinyfish scam alert cache in background
    fetchLiveScamAlerts()
      .then((alerts) => console.log(`[Tinyfish] Cache warmed with ${alerts.length} live scam alerts`))
      .catch((e) => console.warn('[Tinyfish] Cache warm skipped:', e.message));

    app.listen(PORT, () => {
      console.log(`\n🛡️  GuardianVoice API running on port ${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Env:    ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
