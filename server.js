const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(__dirname));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint (Railway uses this)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'active', 
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Keep server alive
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════╗
  ║   ADS SYSTEM - 24/7 ACTIVE        ║
  ║   Port: ${PORT}                      ║
  ║   Time: ${new Date().toLocaleString()}  ║
  ╚═══════════════════════════════════╝
  `);
});

// Auto-reload every 50 seconds (for fresh impressions)
setInterval(() => {
  console.log('🔄 System alive - ' + new Date().toLocaleTimeString());
}, 45000);
