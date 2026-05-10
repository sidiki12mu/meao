const express = require('express');
const app = express();

app.use(express.static('public'));

// Simple IP spoofing middleware
app.use((req, res, next) => {
  // Generate fake US IP
  const fakeIP = generateUSIP();
  req.headers['x-forwarded-for'] = fakeIP;
  req.headers['x-real-ip'] = fakeIP;
  req.headers['cf-connecting-ip'] = fakeIP;
  next();
});

function generateUSIP() {
  const prefixes = ['52.20', '54.80', '34.200', '3.80', '18.200', '44.200', '100.20'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🇺🇸 US IP Spoofing Active`);
});
