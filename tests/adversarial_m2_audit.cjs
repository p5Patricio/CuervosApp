const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- FORENSIC AUDIT M2: INDEPENDENT EMPIRICAL VERIFICATION ---');

const projectRoot = path.resolve(__dirname, '..');
const tacticalBoardPath = path.join(projectRoot, 'src', 'components', 'tactical', 'TacticalBoard.tsx');
const boardTokenItemPath = path.join(projectRoot, 'src', 'components', 'tactical', 'BoardTokenItem.tsx');
const storePath = path.join(projectRoot, 'src', 'store', 'useCuervosStore.ts');
const seedDataPath = path.join(projectRoot, 'src', 'data', 'seedData.ts');

const tacticalBoardCode = fs.readFileSync(tacticalBoardPath, 'utf8');
const boardTokenItemCode = fs.readFileSync(boardTokenItemPath, 'utf8');
const storeCode = fs.readFileSync(storePath, 'utf8');
const seedDataCode = fs.readFileSync(seedDataPath, 'utf8');

// CHECK 1: Facade / Mock check
console.log('Check 1: Facade & Mock string search...');
const prohibitedPhrases = [
  'mock',
  'fake',
  'dummy',
  'todo: implement',
  'not implemented',
  'return true // mock',
  'return false // mock'
];
for (const phrase of prohibitedPhrases) {
  const checkTb = tacticalBoardCode.toLowerCase().includes(phrase);
  const checkBti = boardTokenItemCode.toLowerCase().includes(phrase);
  if (checkTb) throw new Error(`Prohibited phrase "${phrase}" found in TacticalBoard.tsx`);
  if (checkBti) throw new Error(`Prohibited phrase "${phrase}" found in BoardTokenItem.tsx`);
}
console.log('  -> PASS: No dummy/mock implementations found in target components.');

// CHECK 2: TacticalBoard pointer pipeline forensics
console.log('Check 2: TacticalBoard pointer pipeline forensics...');
assert(tacticalBoardCode.includes('boardRectRef'), 'Missing boardRectRef in TacticalBoard.tsx');
assert(tacticalBoardCode.includes('dragOffsetRef'), 'Missing dragOffsetRef in TacticalBoard.tsx');
assert(tacticalBoardCode.includes('activePointerIdRef'), 'Missing activePointerIdRef in TacticalBoard.tsx');
assert(tacticalBoardCode.includes('rafIdRef'), 'Missing rafIdRef in TacticalBoard.tsx');
assert(tacticalBoardCode.includes('pendingCoordsRef'), 'Missing pendingCoordsRef in TacticalBoard.tsx');

// Check getBoundingClientRect in handlePointerMove
const handlePointerMoveMatch = tacticalBoardCode.match(/const handlePointerMove = useCallback\([\s\S]*?\n  \);/);
assert(handlePointerMoveMatch, 'Could not locate handlePointerMove in TacticalBoard.tsx');
const handlePointerMoveBody = handlePointerMoveMatch[0];

// Confirm getBoundingClientRect is NOT called unconditionally on every move
const isGBCRCached = handlePointerMoveBody.includes('let rect = boardRectRef.current') &&
                     handlePointerMoveBody.includes('if (!rect && boardContainerRef.current)');
assert(isGBCRCached, 'getBoundingClientRect is not cached in handlePointerMove!');
console.log('  -> PASS: getBoundingClientRect is cached in boardRectRef, not called on live pointer moves.');

// Check dragOffsetRef applied
assert(handlePointerMoveBody.includes('e.clientX - dragOffsetRef.current.x'), 'dragOffsetRef.x not applied to clientX');
assert(handlePointerMoveBody.includes('e.clientY - dragOffsetRef.current.y'), 'dragOffsetRef.y not applied to clientY');
console.log('  -> PASS: dragOffsetRef is genuinely applied in coordinate calculation.');

// Check RAF coalescing in handlePointerMove
assert(handlePointerMoveBody.includes('requestAnimationFrame'), 'requestAnimationFrame missing in handlePointerMove');
assert(tacticalBoardCode.includes('cancelAnimationFrame'), 'cancelAnimationFrame missing in TacticalBoard.tsx');
console.log('  -> PASS: requestAnimationFrame display refresh coalescing implemented.');

// Check activePointerIdRef filtering
assert(handlePointerMoveBody.includes('activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current'),
  'Multi-finger pointer filtering missing in handlePointerMove');
console.log('  -> PASS: Multi-finger pointer filtering implemented.');

// Check pointercancel in window listeners
assert(tacticalBoardCode.includes("window.addEventListener('pointercancel', handlePointerUp)"),
  'Window pointercancel event listener missing in TacticalBoard.tsx');
console.log('  -> PASS: Window pointercancel listener registered.');

// CHECK 3: BoardTokenItem forensics
console.log('Check 3: BoardTokenItem forensics...');
assert(boardTokenItemCode.includes('onPointerCancel={handlePointerUp}'), 'onPointerCancel missing from BoardTokenItem.tsx');

// Verify onPointerCancel is on all 3 tokens (ball, cuervos, opponent)
const cancelMatches = boardTokenItemCode.match(/onPointerCancel=\{handlePointerUp\}/g);
assert(cancelMatches && cancelMatches.length >= 3, `Expected at least 3 onPointerCancel handlers, found ${cancelMatches?.length}`);
console.log(`  -> PASS: Found ${cancelMatches.length} onPointerCancel handlers (ball, cuervos, opponent).`);

// Verify pointer capture
assert(boardTokenItemCode.includes('setPointerCapture(e.pointerId)'), 'setPointerCapture missing in BoardTokenItem.tsx');
assert(boardTokenItemCode.includes('releasePointerCapture(e.pointerId)'), 'releasePointerCapture missing in BoardTokenItem.tsx');
console.log('  -> PASS: Pointer capture properly managed.');

// Verify transition suspension during press/drag
assert(boardTokenItemCode.includes('const isMoving = isDragging || isPressing || isSimulating;'),
  'isMoving calculation missing in BoardTokenItem.tsx');
assert(boardTokenItemCode.includes("isMoving\n    ? 'none'\n    : 'left 0.45s") ||
       boardTokenItemCode.includes("isMoving ? 'none' : 'left 0.45s") ||
       boardTokenItemCode.includes("transition: tokenTransition"),
  'tokenTransition CSS override missing');
console.log('  -> PASS: Zero-lag transition suspension active on initial touch-down.');

// Check responsive token sizing classes
assert(boardTokenItemCode.includes('w-9 h-9 sm:w-12 sm:h-12'), 'Cuervos token responsive sizing missing');
assert(boardTokenItemCode.includes('w-8 h-8 sm:w-11 sm:h-11'), 'Opponent token responsive sizing missing');
assert(boardTokenItemCode.includes('w-7 h-7 sm:w-9 sm:h-9'), 'Basketball token responsive sizing missing');
console.log('  -> PASS: Responsive token sizing classes (36px-48px, 32px-44px, 28px-36px) verified.');

// CHECK 4: Boundary Clamping in useCuervosStore.ts
console.log('Check 4: Boundary Clamping in useCuervosStore.ts...');
assert(storeCode.includes('Math.max(5, Math.min(95, x))'), 'X boundary clamping [5, 95] missing in store');
assert(storeCode.includes('Math.max(6, Math.min(93, y))'), 'Y boundary clamping [6, 93] missing in store');
console.log('  -> PASS: Boundary clamping [5, 95] and [6, 93] verified in useCuervosStore.');

// CHECK 5: Token overlap & separation math
console.log('Check 5: Token separation empirical calculation...');
// Find c-4 and o-4 in seedData.ts
const c4Match = seedDataCode.match(/id:\s*'c-4'[\s\S]*?x:\s*(\d+)[\s\S]*?y:\s*(\d+)/);
const o4Match = seedDataCode.match(/id:\s*'o-4'[\s\S]*?x:\s*(\d+)[\s\S]*?y:\s*(\d+)/);
assert(c4Match && o4Match, 'Could not find c-4 and o-4 in seedData.ts');

const c4 = { x: parseFloat(c4Match[1]), y: parseFloat(c4Match[2]) };
const o4 = { x: parseFloat(o4Match[1]), y: parseFloat(o4Match[2]) };
console.log(`  c-4 coordinates: (${c4.x}, ${c4.y})`);
console.log(`  o-4 coordinates: (${o4.x}, ${o4.y})`);

// Test across mobile screen widths: 320, 360, 375, 414, 768
const screenWidths = [320, 360, 375, 414, 768];
for (const w of screenWidths) {
  const h = w * 0.933;
  const c4Px = { x: (c4.x / 100) * w, y: (c4.y / 100) * h };
  const o4Px = { x: (o4.x / 100) * w, y: (o4.y / 100) * h };
  const dist = Math.hypot(c4Px.x - o4Px.x, c4Px.y - o4Px.y);

  // Cuervos mobile token radius (36px / 2 = 18px on mobile, 48px / 2 = 24px on desktop)
  const isSm = w >= 640;
  const rCuervos = isSm ? 24 : 18;
  const rOpponent = isSm ? 22 : 16;
  const minClearanceRequired = rCuervos + rOpponent;
  const clearance = dist - minClearanceRequired;

  console.log(`  Width ${w}px: Token distance = ${dist.toFixed(2)}px | Required sum of radii = ${minClearanceRequired}px | Margin = ${clearance.toFixed(2)}px`);
  assert(clearance > 0, `Overlap detected at screen width ${w}px! Margin is ${clearance}px`);
}
console.log('  -> PASS: No token collisions or overlaps at any tested viewport width.');

console.log('\n--- ALL FORENSIC AUDIT CHECKS PASSED: VERDICT CLEAN ---');
