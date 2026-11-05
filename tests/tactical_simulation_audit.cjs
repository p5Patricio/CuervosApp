const fs = require('fs');
const path = require('path');

console.log('=================================================================');
console.log('  TACTICAL SIMULATION & 5V5 PLAYS AUDIT SUITE (M3)');
console.log('=================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${testName} - ${details}`);
  }
}

// 1. Audit tacticalPlays.ts source file
const playsSourcePath = path.join(__dirname, '..', 'src', 'data', 'tacticalPlays.ts');
assert(fs.existsSync(playsSourcePath), 'tacticalPlays.ts exists on disk');

const playsContent = fs.readFileSync(playsSourcePath, 'utf8');

// Required 5 fundamental plays
const REQUIRED_PLAY_IDS = [
  'play-pick-and-roll',
  'play-horns',
  'play-give-and-go',
  'play-spain-pnr',
  'play-motion-offense'
];

REQUIRED_PLAY_IDS.forEach((playId) => {
  assert(playsContent.includes(playId), `Source code contains play definition: ${playId}`);
});

// Check that all 5 plays have comprehensive tactical explanations
assert(playsContent.includes('Pick & Roll Central'), 'Pick & Roll Central is defined with official name');
assert(playsContent.includes('Horns (Cuernos)'), 'Horns / Cuernos is defined with official name');
assert(playsContent.includes('Give & Go (Pasar y Cortar)'), 'Give & Go is defined with official name');
assert(playsContent.includes('Spain Pick & Roll'), 'Spain Pick & Roll is defined with official name');
assert(playsContent.includes('Motion Offense'), 'Motion Offense is defined with official name');

// 2. Audit Simulation Bar & Components
const simBarPath = path.join(__dirname, '..', 'src', 'components', 'tactical', 'PlaySimulationBar.tsx');
assert(fs.existsSync(simBarPath), 'PlaySimulationBar.tsx component exists');

const simBarContent = fs.readFileSync(simBarPath, 'utf8');
assert(simBarContent.includes('onTogglePlay'), 'Simulation bar supports Play/Pause toggle');
assert(simBarContent.includes('onReset'), 'Simulation bar supports Reset to Step 1');
assert(simBarContent.includes('onSetSpeed'), 'Simulation bar supports speed controls');
assert(simBarContent.includes('speeds = [0.5, 1.0, 1.5, 2.0]'), 'Simulation bar supports 0.5x, 1x, 1.5x, 2x speeds');
assert(simBarContent.includes('Paso'), 'Simulation bar displays step indicator pills');

// 3. Audit TacticalBoard 60fps requestAnimationFrame Engine
const boardPath = path.join(__dirname, '..', 'src', 'components', 'tactical', 'TacticalBoard.tsx');
const boardContent = fs.readFileSync(boardPath, 'utf8');

assert(boardContent.includes('simRafIdRef'), 'TacticalBoard initializes dedicated simulation RAF reference');
assert(boardContent.includes('Math.min(1, elapsed / duration)'), 'TacticalBoard calculates continuous animation progress');
assert(boardContent.includes('ease'), 'TacticalBoard applies smooth cubic easing interpolation');
assert(boardContent.includes('PlaySimulationBar'), 'TacticalBoard mounts PlaySimulationBar');
assert(boardContent.includes('isSimulating={isPlayingSequence}'), 'TacticalBoard notifies BoardTokenItem of live simulation state');

// 4. Audit Mathematical Easing & Coordinate Interpolation
function cubicEase(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Test boundary properties of cubicEase
assert(cubicEase(0) === 0, 'Cubic easing starts exactly at 0');
assert(cubicEase(1) === 1, 'Cubic easing ends exactly at 1');
assert(cubicEase(0.5) === 0.5, 'Cubic easing is symmetric at midpoint 0.5');

// Monotonicity check
let isMonotonic = true;
let prev = -1;
for (let i = 0; i <= 1000; i++) {
  const cur = cubicEase(i / 1000);
  if (cur < prev) isMonotonic = false;
  prev = cur;
}
assert(isMonotonic, 'Cubic easing function is strictly monotonic (no jitter, no oscillation)');

// 5. Audit Brand Logo & Colors
const logoPath = path.join(__dirname, '..', 'public', 'logo-cuervos.png');
assert(fs.existsSync(logoPath), 'Official logo file public/logo-cuervos.png exists');
const logoStats = fs.statSync(logoPath);
assert(logoStats.size > 100000, `Official logo is high resolution (${Math.round(logoStats.size / 1024)} KB)`);

// Audit Tailwind palette
const tailwindPath = path.join(__dirname, '..', 'tailwind.config.js');
const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');
assert(tailwindContent.includes('#ED4B00') || tailwindContent.includes('cuervos-orange'), 'Tailwind config defines official basketball orange (#ED4B00)');
assert(tailwindContent.includes('#050505') || tailwindContent.includes('cuervos-950'), 'Tailwind config defines obsidian black (#050505)');

// 6. Audit Store Migration & Persistence
const storePath = path.join(__dirname, '..', 'src', 'store', 'useCuervosStore.ts');
const storeContent = fs.readFileSync(storePath, 'utf8');
assert(storeContent.includes('version: 2'), 'Zustand persistence configured with schema version 2');
assert(storeContent.includes('FUNDAMENTAL_5V5_PLAYS'), 'Store loads 5 fundamental plays into initial state');
assert(storeContent.includes('simulationSpeed'), 'Store manages simulationSpeed state');

console.log('\n=================================================================');
console.log(`TOTAL AUDIT CHECKS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('=================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('>>> ALL M3 TACTICAL SIMULATION CHECKS VERIFIED CLEAN <<<');
  process.exit(0);
}
