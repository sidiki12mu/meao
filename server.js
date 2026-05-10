const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Proxy all ad requests through US IP
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url');

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Forwarded-For': generateUSIP(),
        'CF-Connecting-IP': generateUSIP(),
        'X-Real-IP': generateUSIP(),
        'Accept-Language': 'en-US,en;q=0.9',
      },
      responseType: 'stream'
    });
    
    res.set(response.headers);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Proxy error');
  }
});

// Generate random US IP
function generateUSIP() {
  const ipRanges = [
    '52.20.0.1', '54.80.0.1', '34.200.0.1', '3.80.0.1',
    '18.200.0.1', '35.150.0.1', '44.200.0.1', '100.20.0.1'
  ];
  const base = ipRanges[Math.floor(Math.random() * ipRanges.length)];
  const parts = base.split('.');
  parts[3] = Math.floor(Math.random() * 254) + 1;
  return parts.join('.');
}

app.listen(3000, () => console.log('Proxy running on port 3000'));
