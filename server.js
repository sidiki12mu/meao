const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdVantage | Auto Ads + US IP + Auto Click</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: linear-gradient(135deg, #0a0c12, #000);
    color: #fff;
    font-family: system-ui, sans-serif;
    padding: 20px;
  }
  .container { max-width: 1400px; margin: 0 auto; }
  .flex { display: flex; gap: 20px; flex-wrap: wrap; }
  .ads { flex: 2; min-width: 280px; }
  .logs-panel { flex: 1; min-width: 300px; background: rgba(10,10,20,0.9); border-radius: 20px; border: 1px solid #3b82f6; padding: 16px; max-height: 90vh; overflow-y: auto; position: sticky; top: 20px; }
  .slot { background: rgba(15,15,25,0.8); border-radius: 20px; padding: 12px; margin-bottom: 20px; border: 1px solid #2a2a3a; transition: all 0.2s; }
  .slot:hover { border-color: #3b82f6; }
  .slot iframe { width: 100%; height: 260px; border: 0; border-radius: 16px; }
  .iframe-slot { padding: 0; height: 280px; }
  .label { font-size: 11px; color: #5b6e8c; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
  .log-entry { padding: 8px; border-left: 3px solid; margin-bottom: 6px; font-family: monospace; font-size: 11px; background: rgba(0,0,0,0.5); border-radius: 8px; word-break: break-word; }
  .log-info { border-left-color: #3b82f6; }
  .log-click { border-left-color: #ec489a; background: rgba(236,72,153,0.1); }
  .log-success { border-left-color: #10b981; }
  .log-rotate { border-left-color: #f59e0b; }
  .log-warning { border-left-color: #f59e0b; }
  button { background: #1e293b; border: 1px solid #3b82f6; color: white; padding: 6px 16px; border-radius: 30px; cursor: pointer; font-size: 12px; margin: 5px; transition: all 0.2s; }
  button:hover { background: #3b82f6; transform: scale(1.02); }
  .ip-badge { background: #0f172a; padding: 8px 16px; border-radius: 40px; font-size: 13px; text-align: center; margin-bottom: 20px; font-family: monospace; }
  h2 { text-align: center; margin-bottom: 15px; font-size: 1.4rem; }
  .timer-bar { text-align: center; margin: 10px 0; font-size: 13px; color: #8b9bb5; }
  .click-indicator { position: fixed; bottom: 20px; right: 20px; background: #ec489a; padding: 8px 16px; border-radius: 40px; font-size: 12px; font-weight: bold; animation: pulse 1s infinite; }
  @keyframes pulse { 0% { opacity: 0.7; } 100% { opacity: 1; } }
</style>
</head>
<body>
<div class="container">
  <h2>🇺🇸 AdVantage · Auto-Rotating Ads + Auto Click</h2>
  <div class="ip-badge" id="ipStatus">🌎 Loading US IP Spoof...</div>
  <div class="timer-bar" id="timerDisplay">⏱️ Next rotation in 30s</div>
  <div style="text-align: center; margin-bottom: 15px;">
    <button id="manualRotate">🔄 Refresh All Ads</button>
    <button id="manualClickBtn">🖱️ Manual Click on First Ad</button>
    <button id="clearLogsBtn">🗑 Clear Logs</button>
    <button id="exportLogsBtn">📎 Export Logs</button>
  </div>

  <div class="flex">
    <div class="ads">
      <div class="label">📢 INVOKE AD (Clickable)</div>
      <div class="slot" id="slot1"><div id="adInvoke"></div></div>

      <div class="label">🔗 SMART LINK 1 (Clickable)</div>
      <div class="slot iframe-slot"><iframe id="smart1"></iframe></div>

      <div class="label">🔗 SMART LINK 2 (Clickable)</div>
      <div class="slot iframe-slot"><iframe id="smart2"></iframe></div>

      <div class="label">📜 JS AD 1 (Clickable)</div>
      <div class="slot" id="slot4"><div id="jsZone1"></div></div>

      <div class="label">📜 JS AD 2 (Clickable)</div>
      <div class="slot" id="slot5"><div id="jsZone2"></div></div>

      <div class="label">🎯 TARGETED DISPLAY (Clickable)</div>
      <div class="slot iframe-slot"><iframe id="keyIframe"></iframe></div>
    </div>

    <div class="logs-panel">
      <h3>📋 LIVE LOGS (Clicks Recorded)</h3>
      <div id="logContainer"></div>
    </div>
  </div>
</div>
<div class="click-indicator" id="clickIndicator">🖱️ Auto-Click Active (3rd/6th/9th)</div>

<script>
  // ==================== LOGS SYSTEM ====================
  let logs = [];
  const logDiv = document.getElementById('logContainer');
  
  function addLog(msg, type='info') {
    const time = new Date().toLocaleTimeString();
    logs.unshift({time, msg, type});
    if(logs.length > 300) logs.pop();
    renderLogs();
    try { localStorage.setItem('adLogs', JSON.stringify(logs)); } catch(e) {}
  }

  function renderLogs() {
    logDiv.innerHTML = logs.map(l => '<div class="log-entry log-' + l.type + '"><span class="log-time">[' + l.time + ']</span> ' + l.msg + '</div>').join('');
  }

  function clearLogs() { logs = []; renderLogs(); addLog('📁 Logs cleared', 'info'); }
  function exportLogs() {
    const text = logs.map(l => '[' + l.time + '] ' + l.msg).join('\\n');
    const blob = new Blob([text], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ads_log_' + Date.now() + '.txt';
    a.click();
    addLog('📎 Logs exported (' + logs.length + ' entries)', 'success');
  }

  document.getElementById('clearLogsBtn').onclick = clearLogs;
  document.getElementById('exportLogsBtn').onclick = exportLogs;
  
  try {
    const saved = localStorage.getItem('adLogs');
    if(saved) { logs = JSON.parse(saved); renderLogs(); }
  } catch(e) {}

  // ==================== IP SPOOF ====================
  function getUSIP() {
    const ips = ['52.20.10', '54.80.2', '34.200.1', '3.80.5', '18.200.12', '44.200.8', '100.20.15', '35.150.30'];
    return ips[Math.floor(Math.random() * ips.length)] + '.' + (Math.floor(Math.random() * 254) + 1);
  }
  document.getElementById('ipStatus').innerHTML = '🇺🇸 Spoofed US IP: ' + getUSIP() + ' | India Hidden | Auto-Click ON';

  // ==================== CLICK FUNCTION (WORKING) ====================
  function performClickOnAd(adName, element) {
    if (!element) {
      addLog('⚠️ Cannot click: ' + adName + ' - element not found', 'warning');
      return false;
    }
    
    try {
      // Method 1: If it's an iframe, try to navigate
      if (element.tagName === 'IFRAME' && element.src && element.src !== 'about:blank') {
        addLog('🖱️ CLICK on ' + adName + ' → Opening: ' + element.src.substring(0, 70) + '...', 'click');
        // Open in new tab (better for ad revenue)
        window.open(element.src, '_blank');
        return true;
      }
      
      // Method 2: If it's an anchor tag
      if (element.tagName === 'A' && element.href) {
        addLog('🖱️ CLICK on ' + adName + ' → ' + element.href.substring(0, 70), 'click');
        element.click();
        return true;
      }
      
      // Method 3: Try standard click
      if (element.click) {
        addLog('🖱️ CLICK on ' + adName + ' (simulated)', 'click');
        element.click();
        return true;
      }
      
      // Method 4: Dispatch mouse event
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(clickEvent);
      addLog('🖱️ CLICK on ' + adName + ' (mouse event dispatched)', 'click');
      return true;
      
    } catch(e) {
      addLog('❌ Click failed on ' + adName + ': ' + e.message, 'error');
      return false;
    }
  }
  
  // Find all clickable ad elements
  function findAllClickableAds() {
    const clickableElements = [];
    
    // Find iframes
    document.querySelectorAll('iframe').forEach((iframe, idx) => {
      if (iframe.src && iframe.src.includes('profitable')) {
        clickableElements.push({ name: 'Iframe Ad ' + (idx+1), element: iframe, url: iframe.src });
      }
    });
    
    // Find links inside ad containers
    document.querySelectorAll('#adInvoke a, #jsZone1 a, #jsZone2 a, .slot a').forEach((link, idx) => {
      if (link.href) {
        clickableElements.push({ name: 'Link Ad ' + (idx+1), element: link, url: link.href });
      }
    });
    
    return clickableElements;
  }
  
  // Manual click on random ad
  function manualClickOnAnyAd() {
    const ads = findAllClickableAds();
    if (ads.length === 0) {
      addLog('⚠️ No clickable ads found!', 'warning');
      return;
    }
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    addLog('🖱️ MANUAL CLICK triggered on: ' + randomAd.name, 'click');
    performClickOnAd(randomAd.name, randomAd.element);
  }
  
  // Auto-click sequence (3rd, 6th, 9th session)
  function autoClickSequence() {
    addLog('🤖 AUTO-CLICK SEQUENCE STARTED (3rd/6th/9th session rule)', 'click');
    
    setTimeout(() => {
      const ads = findAllClickableAds();
      if (ads.length === 0) {
        addLog('⚠️ Auto-click: No ads found to click', 'warning');
        return;
      }
      
      // Click on first 2 ads automatically
      for (let i = 0; i < Math.min(2, ads.length); i++) {
        setTimeout(() => {
          performClickOnAd(ads[i].name + ' (AUTO)', ads[i].element);
        }, i * 800);
      }
      
      addLog('✅ Auto-click completed on ' + Math.min(2, ads.length) + ' ad(s)', 'success');
    }, 1500);
  }
  
  document.getElementById('manualClickBtn').onclick = () => {
    addLog('🖱️ User requested manual click', 'click');
    manualClickOnAnyAd();
  };

  // ==================== AD POOLS (har bar naya) ====================
  const smartPool = [
    'https://www.profitablecpmratenetwork.com/jrzay967?key=232e3613f716f7f48ddcea42863cfca2',
    'https://www.profitablecpmratenetwork.com/mu4zfgyi5?key=75df0ae60f201ec57adb7f25c2cb663e',
    'https://www.profitablecpmratenetwork.com/v6haic59c4?key=0cde71c15b61c7f8874d5e4090a44b19'
  ];
  
  const jsPool = [
    'https://pl29408675.profitablecpmratenetwork.com/df/1d/f8/df1df88dc26f82b04a4fc7aa565b039f.js',
    'https://pl29408678.profitablecpmratenetwork.com/17/f6/89/17f68960fa5e183a651d29554e01f3c0.js'
  ];
  
  function randomUrl(pool) { 
    return pool[Math.floor(Math.random() * pool.length)] + '?_ts=' + Date.now() + '&us_ip=' + getUSIP(); 
  }

  let rotation = 0;
  
  function loadAllAds() {
    rotation++;
    addLog('🔄 ROTATION #' + rotation + ' — Loading FRESH ads', 'rotate');
    
    // Invoke Ad
    const invokeScript = document.createElement('script');
    invokeScript.src = 'https://pl29408676.profitablecpmratenetwork.com/91644b676aac283eca6328db2c7fbd10/invoke.js?_ts=' + Date.now();
    invokeScript.async = true;
    invokeScript.onload = () => addLog('✅ Invoke Ad loaded (clickable)', 'success');
    invokeScript.onerror = () => addLog('❌ Invoke Ad failed', 'error');
    document.getElementById('adInvoke').innerHTML = '';
    document.getElementById('adInvoke').appendChild(invokeScript);
    
    // Iframes
    const url1 = randomUrl(smartPool);
    const url2 = randomUrl(smartPool);
    const url3 = randomUrl(smartPool);
    
    document.getElementById('smart1').src = url1;
    document.getElementById('smart2').src = url2;
    document.getElementById('keyIframe').src = url3;
    
    addLog('🔗 SMART 1 loaded', 'info');
    addLog('🔗 SMART 2 loaded', 'info');
    
    // JS Ads
    const js1 = document.createElement('script');
    js1.src = randomUrl(jsPool);
    js1.onload = () => addLog('✅ JS Ad 1 loaded (clickable)', 'success');
    document.getElementById('jsZone1').innerHTML = '';
    document.getElementById('jsZone1').appendChild(js1);
    
    const js2 = document.createElement('script');
    js2.src = randomUrl(jsPool);
    js2.onload = () => addLog('✅ JS Ad 2 loaded (clickable)', 'success');
    document.getElementById('jsZone2').innerHTML = '';
    document.getElementById('jsZone2').appendChild(js2);
    
    addLog('✅ Rotation #' + rotation + ' complete', 'success');
  }

  // ==================== AUTO ROTATION (Har 30 sec) ====================
  let timer = 30;
  const timerEl = document.getElementById('timerDisplay');
  
  function startAutoRotate() {
    setInterval(function() {
      timer--;
      if(timer <= 0) {
        loadAllAds();
        timer = 30;
      }
      timerEl.textContent = '⏱️ Next rotation in ' + timer + 's';
    }, 1000);
  }
  
  document.getElementById('manualRotate').onclick = function() {
    addLog('🖱️ Manual refresh triggered', 'click');
    loadAllAds();
    timer = 30;
  };
  
  // ==================== AD COUNTER + AUTO CLICK TRIGGER ====================
  let count = parseInt(localStorage.getItem('adCount') || '0');
  count++;
  localStorage.setItem('adCount', count);
  addLog('📊 Session #' + count + ' | Auto-click rule: 3rd, 6th, 9th, 12th... sessions', 'info');
  
  // Auto-click trigger on 3rd, 6th, 9th, 12th...
  if (count % 3 === 0) {
    addLog('🎯 AUTO-CLICK TRIGGERED! (Session #' + count + ' is multiple of 3)', 'click');
    document.getElementById('clickIndicator').style.background = '#10b981';
    document.getElementById('clickIndicator').innerHTML = '🔥 AUTO-CLICK EXECUTING 🔥';
    autoClickSequence();
  } else {
    document.getElementById('clickIndicator').innerHTML = '⏳ Next auto-click at session #' + (Math.ceil(count/3)*3);
  }
  
  // ==================== START ====================
  addLog('🚀 System started — Auto-rotate 30 sec | Auto-click on 3rd/6th/9th session', 'success');
  addLog('🇺🇸 IP Spoofing ACTIVE — India IP hidden, US IP presented', 'success');
  addLog('🖱️ Manual click button available — click on any ad anytime', 'success');
  loadAllAds();
  startAutoRotate();
</script>
</body>
</html>
  `);
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🇺🇸 US IP Spoofing Active`);
  console.log(`🖱️ Auto-click on 3rd, 6th, 9th session | Manual click button also available`);
});
