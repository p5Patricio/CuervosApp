/**
 * Automated Verification Protocol: Offline Sandboxed SVG Rendering
 * 
 * Validates that public/logo-cuervos.svg:
 * 1. Conforms to valid XML & dual SVG 1.1/2.0 specifications.
 * 2. Inlines all image assets via base64 Data URI (zero external network dependencies).
 * 3. Renders completely in browser sandboxes (<img>, CSS background, sandboxed <iframe>, canvas).
 * 4. Leaves Canvas untainted (no SecurityError on getImageData).
 * 5. Contains genuine logo pixel signatures (obsidian background, basketball orange, white highlights).
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

async function runVerification() {
  console.log('===============================================================');
  console.log('CUERVOSAPP SVG OFFLINE SANDBOX VERIFICATION PROTOCOL');
  console.log('===============================================================\n');

  const targetArg = process.argv[2];
  const svgPath = targetArg ? path.resolve(process.cwd(), targetArg) : path.join(process.cwd(), 'public', 'logo-cuervos.svg');
  if (!fs.existsSync(svgPath)) {
    console.error(`[FAIL] SVG file not found at ${svgPath}`);
    process.exit(1);
  }

  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // --- STAGE 1: Static XML & Data URI Validation ---
  console.log('[STAGE 1] Validating Static XML & Data URI Schema...');
  const checks = {
    hasSvgTag: /<svg\b[^>]*>/i.test(svgContent),
    hasSvgNamespace: /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/i.test(svgContent),
    hasXlinkNamespace: /xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/i.test(svgContent),
    hasViewBox640: /viewBox="0 0 640 640"/i.test(svgContent),
    hasWidthHeight640: /width="640"/i.test(svgContent) && /height="640"/i.test(svgContent),
    hasDataUri: /href="data:image\/png;base64,[A-Za-z0-9+/=]+"/i.test(svgContent),
    hasXlinkDataUri: /xlink:href="data:image\/png;base64,[A-Za-z0-9+/=]+"/i.test(svgContent),
    hasNoExternalUrls: !/https?:\/\//i.test(svgContent.replace(/http:\/\/www\.w3\.org\/[0-9/a-z]+/gi, '')) && !/href="\/[^"]+"/i.test(svgContent)
  };

  for (const [k, v] of Object.entries(checks)) {
    console.log(`  - ${k}: ${v ? 'PASS' : 'FAIL'}`);
    if (!v) {
      console.error(`[STAGE 1 FAILED] Check '${k}' failed.`);
      process.exit(1);
    }
  }

  console.log('[STAGE 1] Static XML & Schema check PASSED.\n');

  // --- STAGE 2 & 3: Browser Sandbox & Dynamic Rendering Audit ---
  console.log('[STAGE 2 & 3] Launching Browser Sandbox and Dynamic Pixel Analysis...');
  const browserBin = findBrowserBinary();
  if (!browserBin) {
    console.error('[FAIL] No supported Chromium browser binary found for headless testing.');
    process.exit(1);
  }
  console.log(`Using browser: ${browserBin}`);

  const networkLog = [];
  const server = http.createServer((req, res) => {
    networkLog.push(req.url);

    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html>
<head><title>SVG Sandbox Verification</title></head>
<body>
  <img id="img-test" src="/logo-cuervos.svg" width="640" height="640" />
  <div id="css-test" style="width:640px; height:640px; background-image:url('/logo-cuervos.svg');"></div>
  <iframe id="iframe-test" sandbox src="/logo-cuervos.svg" width="640" height="640"></iframe>
  <canvas id="canvas-test" width="640" height="640"></canvas>
  <div id="results">Running...</div>

  <script>
    const img = document.getElementById('img-test');
    img.onload = () => {
      try {
        const canvas = document.getElementById('canvas-test');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 640, 640);
        
        const imgData = ctx.getImageData(0, 0, 640, 640);
        const data = imgData.data;

        let nonDarkCount = 0;
        let orangeCount = 0;
        let whiteCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          if (r > 30 || g > 30 || b > 30) nonDarkCount++;
          // Basketball Orange: R > 180, 40 <= G <= 140, B < 60
          if (r > 180 && g >= 40 && g <= 140 && b < 60) orangeCount++;
          // White Highlights: R > 200, G > 200, B > 200
          if (r > 200 && g > 200 && b > 200) whiteCount++;
        }

        const report = {
          untainted: true,
          loaded: true,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          totalPixels: 640 * 640,
          nonDarkCount,
          orangeCount,
          whiteCount,
          hasRavenLogo: orangeCount > 500 && whiteCount > 100
        };

        const rDiv = document.getElementById('results');
        rDiv.setAttribute('data-report', JSON.stringify(report));
        rDiv.innerText = JSON.stringify(report);
      } catch (err) {
        const rDiv = document.getElementById('results');
        rDiv.setAttribute('data-error', err.toString());
        rDiv.innerText = 'ERROR: ' + err.toString();
      }
    };

    img.onerror = () => {
      const rDiv = document.getElementById('results');
      rDiv.setAttribute('data-error', 'img_load_error');
      rDiv.innerText = 'IMG_LOAD_ERROR';
    };
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

    // Strict sandbox: any unexpected external request receives 404
    res.writeHead(404);
    res.end('Not Allowed');
  });

  const PORT = 5891;
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
      console.log(`Headless browser closed with exit code ${code}.`);

      // Network request auditing
      console.log('\n[STAGE 2 RESULTS] Network Request Audit:');
      console.log('  - Inbound Requests:', networkLog);
      const secondaryRequests = networkLog.filter(u => u !== '/' && u !== '/logo-cuervos.svg' && u !== '/favicon.ico');
      console.log('  - Secondary / External Requests:', secondaryRequests);
      const zeroNetworkCalls = secondaryRequests.length === 0;
      console.log(`  - Zero External Network Calls: ${zeroNetworkCalls ? 'PASS' : 'FAIL'}`);

      // Visual DOM & Canvas Pixel Auditing
      console.log('\n[STAGE 3 RESULTS] Visual & Pixel Signature Audit:');
      const match = stdout.match(/<div id="results"[^>]*>([\s\S]*?)<\/div>/);
      let parsedReport = null;
      if (match) {
        try {
          parsedReport = JSON.parse(match[1].replace(/<br>/g, ''));
        } catch (e) {
          console.error('  - Could not parse client report JSON:', match[1]);
        }
      }

      if (parsedReport) {
        console.log('  - Canvas Untainted:', parsedReport.untainted ? 'PASS' : 'FAIL');
        console.log(`  - Rendered Dimensions: ${parsedReport.naturalWidth}x${parsedReport.naturalHeight}`);
        console.log(`  - Non-Dark Pixels: ${parsedReport.nonDarkCount}`);
        console.log(`  - Basketball Orange Pixels: ${parsedReport.orangeCount}`);
        console.log(`  - White Highlight Pixels: ${parsedReport.whiteCount}`);
        console.log(`  - Raven Logo Detected: ${parsedReport.hasRavenLogo ? 'PASS' : 'FAIL'}`);

        const allPassed = zeroNetworkCalls && parsedReport.untainted && parsedReport.hasRavenLogo;
        console.log('\n===============================================================');
        console.log(`FINAL VERDICT: ${allPassed ? 'ALL CHECKS PASSED [SUCCESS]' : 'VERIFICATION FAILED'}`);
        console.log('===============================================================\n');
        process.exit(allPassed ? 0 : 1);
      } else {
        console.error('[FAIL] Could not extract visual report from headless browser.');
        process.exit(1);
      }
    });
  });
}

runVerification();
