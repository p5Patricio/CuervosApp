const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const pngBase64 = fs.readFileSync(path.join(process.cwd(), 'public', 'logo-cuervos.png')).toString('base64');
const dataUri = `data:image/png;base64,${pngBase64}`;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<body>
  <img id="img" src="/svg-data-uri.svg" />
  <script>
    const img = document.getElementById('img');
    img.onload = () => {
      console.log('SVG_LOADED_NATURAL_SIZE:' + img.naturalWidth + 'x' + img.naturalHeight);
    };
  </script>
</body>
</html>`);
    return;
  }
  if (req.url === '/svg-data-uri.svg') {
    const svgWithBase64 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="640" height="640">
  <defs>
    <radialGradient id="bgObsidian" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#050505" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>
  </defs>
  <rect width="640" height="640" fill="url(#bgObsidian)" />
  <image href="${dataUri}" width="640" height="640" preserveAspectRatio="xMidYMid meet" />
</svg>`;
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(svgWithBase64);
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(5679, () => {
  const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--dump-dom', 'http://localhost:5679/']);
  
  setTimeout(() => {
    try { proc.kill(); } catch(e) {}
    server.close();
    console.log('Data URI test finished.');
  }, 3000);
});
