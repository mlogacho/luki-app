require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');

// Initialize DB (runs migrations on first start)
require('./database');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/auth', require('./routes/auth.routes'));
app.use('/users', require('./routes/users.routes'));
app.use('/profiles', require('./routes/profiles.routes'));
app.use('/channels', require('./routes/channels.routes'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Ha ocurrido un error interno. Por favor intenta más tarde.',
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(config.PORT, () => {
  console.log(`\n🚀 Luki Server running on port ${config.PORT} [${config.NODE_ENV}]`);
  console.log(`   Health: http://localhost:${config.PORT}/health\n`);
});

module.exports = app;
