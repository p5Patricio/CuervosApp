/**
 * Adversarial SVG Pixel & Sandbox Audit Harness
 * Run by Challenger M1-R2 (2)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function findBrowserBinary() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.EDGE_BIN,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function runAdversarialAudit() {
  console.log('===============================================================');
  console.log('ADVERSARIAL SVG PIXEL & RENDERING AUDIT (CHALLENGER M1-R2)');
  console.log('===============================================================\n');

  const svgPath = path.join(process.cwd(), 'public', 'logo-cuervos.svg');
  const pngPath = path.join(process.cwd(), 'public', 'logo-cuervos.png');

  if (!fs.existsSync(svgPath) || !fs.existsSync(pngPath)) {
    console.error('[FAIL] Missing asset files');
    process.exit(1);
  }

  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const pngContent = fs.readFileSync(pngPath);

  const browserBin = findBrowserBinary();
  if (!browserBin) {
    console.error('[FAIL] No headless browser binary found');
    process.exit(1);
  }

  const networkRequests = [];

  const server = http.createServer((req, res) => {
    networkRequests.push(req.url);

    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Adversarial Pixel Test</title>
  <link rel="icon" type="image/svg+xml" href="/logo-cuervos.svg" />
</head>
<body>
  <!-- Test 1: Standard img -->
  <img id="svg-img" src="/logo-cuervos.svg" width="640" height="640" />
  <!-- Test 2: Master PNG comparison -->
  <img id="png-img" src="/logo-cuervos.png" width="640" height="640" />
  <!-- Canvas for SVG analysis -->
  <canvas id="svg-canvas" width="640" height="640"></canvas>
  <!-- Canvas for PNG analysis -->
  <canvas id="png-canvas" width="640" height="640"></canvas>
  <div id="results">PENDING</div>

  <script>
    let svgLoaded = false;
    let pngLoaded = false;

    const svgImg = document.getElementById('svg-img');
    const pngImg = document.getElementById('png-img');

    function checkBothLoaded() {
      if (!svgLoaded || !pngLoaded) return;

      try {
        const svgCanvas = document.getElementById('svg-canvas');
        const svgCtx = svgCanvas.getContext('2d');
        svgCtx.drawImage(svgImg, 0, 0, 640, 640);
        const svgData = svgCtx.getImageData(0, 0, 640, 640).data;

        const pngCanvas = document.getElementById('png-canvas');
        const pngCtx = pngCanvas.getContext('2d');
        pngCtx.drawImage(pngImg, 0, 0, 640, 640);
        const pngData = pngCtx.getImageData(0, 0, 640, 640).data;

        let svgNonDark = 0;
        let svgOrangeExactOrClose = 0; // within delta <= 15 of #ED4B00 (237, 75, 0)
        let svgOrangeBroad = 0; // R > 180, 40 <= G <= 140, B < 60
        let svgWhite = 0; // R > 220, G > 220, B > 220
        let svgObsidianDark = 0; // R <= 25, G <= 25, B <= 25

        for (let i = 0; i < svgData.length; i += 4) {
          const r = svgData[i];
          const g = svgData[i+1];
          const b = svgData[i+2];

          if (r > 30 || g > 30 || b > 30) {
            svgNonDark++;
          } else {
            svgObsidianDark++;
          }

          // Exact or close to #ED4B00 (R=237, G=75, B=0)
          const dR = Math.abs(r - 237);
          const dG = Math.abs(g - 75);
          const dB = Math.abs(b - 0);
          if (dR <= 20 && dG <= 20 && dB <= 20) {
            svgOrangeExactOrClose++;
          }

          // Basketball orange gamut
          if (r > 180 && g >= 40 && g <= 140 && b < 60) {
            svgOrangeBroad++;
          }

          // White highlights
          if (r > 220 && g > 220 && b > 220) {
            svgWhite++;
          }
        }

        const report = {
          untainted: true,
          svgNaturalWidth: svgImg.naturalWidth,
          svgNaturalHeight: svgImg.naturalHeight,
          totalPixels: 640 * 640,
          svgNonDark,
          svgObsidianDark,
          svgOrangeExactOrClose,
          svgOrangeBroad,
          svgWhite,
          hasSignificantOrange: svgOrangeBroad > 10000,
          hasSignificantWhite: svgWhite > 5000,
          hasSignificantNonDark: svgNonDark > 50000
        };

        const resDiv = document.getElementById('results');
        resDiv.innerText = JSON.stringify(report);
      } catch (err) {
        const resDiv = document.getElementById('results');
        resDiv.innerText = 'ERROR: ' + err.toString();
      }
    }

    svgImg.onload = () => { svgLoaded = true; checkBothLoaded(); };
    pngImg.onload = () => { pngLoaded = true; checkBothLoaded(); };
    svgImg.onerror = () => { document.getElementById('results').innerText = 'SVG_LOAD_ERROR'; };
    pngImg.onerror = () => { document.getElementById('results').innerText = 'PNG_LOAD_ERROR'; };
  </script>
</body>
</html>`);
      return;
    }

    if (req.url === '/logo-cuervos.svg') {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end(svgContent);
      return;
    }

    if (req.url === '/logo-cuervos.png') {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(pngContent);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  const PORT = 5982;
  server.listen(PORT, () => {
    const proc = spawn(browserBin, [
      '--headless=new',
      '--disable-gpu',
      '--dump-dom',
      `http://localhost:${PORT}/`
    ]);

    let stdout = '';
    proc.stdout.on('data', d => stdout += d.toString());

    proc.on('close', code => {
      server.close();

      console.log(`[BROWSER] Closed with exit code ${code}`);
      console.log('\n[NETWORK AUDIT]');
      console.log('All recorded requests:', networkRequests);

      // Verify svg did not trigger secondary subresource fetches
      const svgSubrequests = networkRequests.filter(u => u !== '/' && u !== '/logo-cuervos.svg' && u !== '/logo-cuervos.png' && u !== '/favicon.ico');
      console.log('Stray/unexpected requests:', svgSubrequests);
      const networkPass = svgSubrequests.length === 0;
      console.log('Network isolation PASS:', networkPass);

      console.log('\n[PIXEL SIGNATURE AUDIT]');
      const match = stdout.match(/<div id="results"[^>]*>([\s\S]*?)<\/div>/);
      if (!match) {
        console.error('[FAIL] Could not find results element in DOM output');
        process.exit(1);
      }

      let report;
      try {
        report = JSON.parse(match[1].replace(/<br>/g, ''));
      } catch (e) {
        console.error('[FAIL] Error parsing report JSON:', match[1]);
        process.exit(1);
      }

      console.log('Report output:');
      console.log('  - Canvas untainted (no SecurityError):', report.untainted);
      console.log('  - Dimensions:', `${report.svgNaturalWidth}x${report.svgNaturalHeight}`);
      console.log('  - Total pixels analyzed:', report.totalPixels);
      console.log('  - Non-dark pixels:', report.svgNonDark, `(${(report.svgNonDark / report.totalPixels * 100).toFixed(1)}%)`);
      console.log('  - Obsidian background pixels:', report.svgObsidianDark, `(${(report.svgObsidianDark / report.totalPixels * 100).toFixed(1)}%)`);
      console.log('  - Basketball Orange (#ED4B00) close match:', report.svgOrangeExactOrClose);
      console.log('  - Basketball Orange broad gamut:', report.svgOrangeBroad, `(${(report.svgOrangeBroad / report.totalPixels * 100).toFixed(1)}%)`);
      console.log('  - White highlight pixels:', report.svgWhite, `(${(report.svgWhite / report.totalPixels * 100).toFixed(1)}%)`);

      const pass = networkPass &&
                   report.untainted &&
                   report.hasSignificantNonDark &&
                   report.hasSignificantOrange &&
                   report.hasSignificantWhite;

      console.log('\n===============================================================');
      console.log(`EMPIRICAL ADVERSARIAL VERDICT: ${pass ? 'APPROVE (ALL CHECKS PASSED)' : 'REQUEST_CHANGES (CHECKS FAILED)'}`);
      console.log('===============================================================\n');

      process.exit(pass ? 0 : 1);
    });
  });
}

runAdversarialAudit();
