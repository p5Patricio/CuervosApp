const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', 'public', req.url.slice(1));
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><body style="background:#222;margin:0;"><img id="img" src="/logo-cuervos.svg" width="640" height="640" /></body></html>');
    return;
  }
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4567, () => {
  try {
    const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const screenshotPath = path.join(__dirname, 'svg-screenshot.png');
    execSync(`"${edge}" --headless --disable-gpu --screenshot="${screenshotPath}" --window-size=640,640 http://localhost:4567/`);
    console.log('Screenshot taken at:', screenshotPath);
    const stats = fs.statSync(screenshotPath);
    console.log('Screenshot size in bytes:', stats.size);
  } catch(e) {
    console.error('Error executing headless browser:', e.message);
  } finally {
    server.close();
  }
});
