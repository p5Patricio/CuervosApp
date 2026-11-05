const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let requestedFiles = [];

const server = http.createServer((req, res) => {
  requestedFiles.push(req.url);
  console.log('HTTP REQUEST:', req.url);
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><body><img src="/logo-cuervos.svg" /></body></html>');
    return;
  }
  let filePath = path.join(process.cwd(), 'public', req.url.slice(1));
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(5678, () => {
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--dump-dom', 'http://localhost:5678/']);
  
  setTimeout(() => {
    try { proc.kill(); } catch(e) {}
    server.close();
    console.log('ALL REQUESTED FILES:', requestedFiles);
    const requestedPng = requestedFiles.includes('/logo-cuervos.png');
    console.log('Did browser fetch /logo-cuervos.png?', requestedPng);
  }, 3500);
});
