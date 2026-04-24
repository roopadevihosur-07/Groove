// Simple production server: serves built frontend + proxies /api to backend
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 8080;

// Proxy all /api calls to the backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

// Serve the built React app
app.use(express.static(path.join(__dirname, 'dist')));

// All other routes → index.html (SPA)
app.get('/{*path}', (_, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Groove running at http://localhost:${PORT}`);
});
