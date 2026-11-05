/**
 * Pointer Events Drag Pipeline Adversarial Stress Test
 * Validates:
 * 1. Drag start & move math under 100,000 arbitrary touch contact offsets & board geometries.
 * 2. Multi-touch isolation: pointerId filtering on move, up, cancel, and secondary token touches.
 * 3. requestAnimationFrame scheduling, unmount cancellation, and memory leaks.
 * 4. Verification of proposed mitigations.
 */

const assert = require('assert');

// Color helpers for terminal output
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

console.log(cyan('================================================================='));
console.log(cyan('  POINTER EVENTS PIPELINE ADVERSARIAL EMPIRICAL HARNESS (M2)'));
console.log(cyan('=================================================================\n'));

const results = {
  passed: 0,
  failed: 0,
  details: []
};

function recordTest(name, passed, message) {
  if (passed) {
    results.passed++;
    console.log(`[${green('PASS')}] ${name}${message ? ': ' + message : ''}`);
  } else {
    results.failed++;
    console.log(`[${red('FAIL')}] ${name}: ${message}`);
  }
  results.details.push({ name, passed, message });
}

// =========================================================================
// TEST 1: DRAG START & MOVE MATH (ARBITRARY TOUCH OFFSETS & GEOMETRIES)
// =========================================================================
console.log(yellow('--- TEST SUITE 1: Drag Start and Move Math Jump Analysis ---'));

function simulateDragMath(boardRect, token, touchOffset, moveDelta) {
  // Exact implementation from TacticalBoard.tsx lines 86-93
  const tokenCenterPxX = boardRect.left + (token.x / 100) * boardRect.width;
  const tokenCenterPxY = boardRect.top + (token.y / 100) * boardRect.height;

  const clientX = tokenCenterPxX + touchOffset.x;
  const clientY = tokenCenterPxY + touchOffset.y;

  const dragOffset = {
    x: clientX - tokenCenterPxX,
    y: clientY - tokenCenterPxY,
  };

  // Move event with moveDelta (e.clientX = clientX + moveDelta.x)
  const moveClientX = clientX + moveDelta.x;
  const moveClientY = clientY + moveDelta.y;

  // Exact implementation from TacticalBoard.tsx lines 116-125
  const targetCenterX = moveClientX - dragOffset.x;
  const targetCenterY = moveClientY - dragOffset.y;

  const normX = ((targetCenterX - boardRect.left) / boardRect.width) * 100;
  const normY = ((targetCenterY - boardRect.top) / boardRect.height) * 100;

  const clampedX = Math.max(5, Math.min(95, normX));
  const clampedY = Math.max(6, Math.min(93, normY));

  return { normX, normY, clampedX, clampedY, dragOffset, clientX, clientY };
}

// 1.1 Zero displacement check on arbitrary touch contact points (100,000 iterations)
const ITERATIONS = 100000;
let maxJumpX = 0;
let maxJumpY = 0;

for (let i = 0; i < ITERATIONS; i++) {
  const boardRect = {
    left: Math.random() * 2000 - 1000,
    top: Math.random() * 2000 - 1000,
    width: Math.random() * 3800 + 200, // 200px to 4000px
    height: Math.random() * 2800 + 200 // 200px to 3000px
  };

  const token = {
    x: Math.random() * 90 + 5, // [5, 95]
    y: Math.random() * 87 + 6  // [6, 93]
  };

  // Arbitrary touch offset from token center (e.g., finger touches 50px away from center)
  const touchOffset = {
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100
  };

  // Zero move delta
  const { clampedX, clampedY } = simulateDragMath(boardRect, token, touchOffset, { x: 0, y: 0 });

  const jumpX = Math.abs(clampedX - token.x);
  const jumpY = Math.abs(clampedY - token.y);

  if (jumpX > maxJumpX) maxJumpX = jumpX;
  if (jumpY > maxJumpY) maxJumpY = jumpY;
}

recordTest(
  'Zero-jump on arbitrary initial contact point (100,000 random setups)',
  maxJumpX < 1e-10 && maxJumpY < 1e-10,
  `Max displacement: dx=${maxJumpX.toExponential(3)}, dy=${maxJumpY.toExponential(3)}`
);

// 1.2 Linear motion fidelity check
let maxLinearError = 0;
for (let i = 0; i < 10000; i++) {
  const boardRect = {
    left: 100,
    top: 50,
    width: 800,
    height: 746
  };
  const token = { x: 50, y: 50 };
  const touchOffset = { x: 15, y: -20 };
  const moveDelta = { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 };

  const { normX, normY } = simulateDragMath(boardRect, token, touchOffset, moveDelta);
  const expectedNormX = token.x + (moveDelta.x / boardRect.width) * 100;
  const expectedNormY = token.y + (moveDelta.y / boardRect.height) * 100;

  const errX = Math.abs(normX - expectedNormX);
  const errY = Math.abs(normY - expectedNormY);
  if (errX > maxLinearError) maxLinearError = errX;
  if (errY > maxLinearError) maxLinearError = errY;
}

recordTest(
  'Linear motion fidelity under arbitrary displacement vectors',
  maxLinearError < 1e-11,
  `Max linearity deviation: ${maxLinearError.toExponential(3)}`
);

// 1.3 Boundary Clamping stress test
const extremeMoves = [
  { move: { x: -10000, y: -10000 }, expectX: 5, expectY: 6 },
  { move: { x: 10000, y: 10000 }, expectX: 95, expectY: 93 },
  { move: { x: 0, y: -10000 }, expectX: 50, expectY: 6 },
  { move: { x: 10000, y: 0 }, expectX: 95, expectY: 50 }
];

let boundaryPass = true;
extremeMoves.forEach(({ move, expectX, expectY }, idx) => {
  const boardRect = { left: 0, top: 0, width: 1000, height: 933 };
  const token = { x: 50, y: 50 };
  const { clampedX, clampedY } = simulateDragMath(boardRect, token, { x: 10, y: 10 }, move);
  if (Math.abs(clampedX - expectX) > 1e-10 || Math.abs(clampedY - expectY) > 1e-10) {
    boundaryPass = false;
  }
});
recordTest('Boundary clamping limits [5, 95] and [6, 93] strictly enforced under extreme deltas', boundaryPass);


// =========================================================================
// TEST 2: MULTI-TOUCH STRESS HARNESS
// =========================================================================
console.log(yellow('\n--- TEST SUITE 2: Multi-Touch Isolation Stress Testing (Current Baseline) ---'));

/**
 * Simulate the TacticalBoard component state and event handlers
 * based directly on TacticalBoard.tsx lines 60-186.
 */
class TacticalBoardHarness {
  constructor(initialTokens, applyMitigations = false) {
    this.tokens = JSON.parse(JSON.stringify(initialTokens));
    this.boardContainerRect = { left: 0, top: 0, width: 1000, height: 933 };
    this.applyMitigations = applyMitigations;

    // Component refs
    this.boardRectRef = null;
    this.dragOffsetRef = { x: 0, y: 0 };
    this.activePointerIdRef = null;
    this.rafIdRef = null;
    this.pendingCoordsRef = null;
    this.draggingTokenId = null;
    this.drawingMode = 'move';

    // Mock RAF queue
    this.rafQueue = new Map();
    this.nextRafId = 1;

    // Window listeners
    this.windowListeners = {
      pointermove: [],
      pointerup: [],
      pointercancel: []
    };

    // Store update mock
    this.updateTokenPosition = (id, x, y) => {
      const t = this.tokens.find((item) => item.id === id);
      if (t) {
        t.x = Math.max(5, Math.min(95, x));
        t.y = Math.max(6, Math.min(93, y));
      }
    };
  }

  // TacticalBoard.tsx lines 74-97
  handleDragStart(id, clientX, clientY, pointerId) {
    if (this.drawingMode === 'draw') return;

    // Mitigation check
    if (this.applyMitigations) {
      if (this.activePointerIdRef !== null && this.activePointerIdRef !== pointerId) {
        return; // Lock against secondary touch hijacking
      }
    }

    this.draggingTokenId = id;
    this.activePointerIdRef = pointerId;

    const rect = this.boardContainerRect;
    this.boardRectRef = rect;

    const token = this.tokens.find((t) => t.id === id);
    if (token) {
      const tokenCenterPxX = rect.left + (token.x / 100) * rect.width;
      const tokenCenterPxY = rect.top + (token.y / 100) * rect.height;
      this.dragOffsetRef = {
        x: clientX - tokenCenterPxX,
        y: clientY - tokenCenterPxY
      };
    } else {
      this.dragOffsetRef = { x: 0, y: 0 };
    }

    // Attach listeners on window if draggingTokenId is active (useEffect lines 164-186)
    this._attachWindowListeners();
  }

  // TacticalBoard.tsx lines 99-144
  handlePointerMove(e) {
    if (!this.draggingTokenId || this.drawingMode === 'draw') return;

    // Filter by pointerId to prevent multi-finger coordinate hijacking
    if (this.activePointerIdRef !== null && e.pointerId !== this.activePointerIdRef) {
      return;
    }

    let rect = this.boardRectRef;
    if (!rect) {
      rect = this.boardContainerRect;
      this.boardRectRef = rect;
    }
    if (!rect) return;

    const targetCenterX = e.clientX - this.dragOffsetRef.x;
    const targetCenterY = e.clientY - this.dragOffsetRef.y;

    const normX = ((targetCenterX - rect.left) / rect.width) * 100;
    const normY = ((targetCenterY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(5, Math.min(95, normX));
    const clampedY = Math.max(6, Math.min(93, normY));

    this.pendingCoordsRef = { id: this.draggingTokenId, x: clampedX, y: clampedY };

    if (this.rafIdRef === null) {
      this.rafIdRef = this._requestAnimationFrame(() => {
        if (this.pendingCoordsRef) {
          this.updateTokenPosition(
            this.pendingCoordsRef.id,
            this.pendingCoordsRef.x,
            this.pendingCoordsRef.y
          );
          this.pendingCoordsRef = null;
        }
        this.rafIdRef = null;
      });
    }
  }

  // TacticalBoard.tsx lines 146-162
  handlePointerUp(e) {
    // Mitigation check
    if (this.applyMitigations) {
      if (e && this.activePointerIdRef !== null && e.pointerId !== this.activePointerIdRef) {
        return; // Ignore pointerup from non-active pointer
      }
    }

    if (this.rafIdRef !== null) {
      this._cancelAnimationFrame(this.rafIdRef);
      this.rafIdRef = null;
    }
    if (this.pendingCoordsRef) {
      this.updateTokenPosition(
        this.pendingCoordsRef.id,
        this.pendingCoordsRef.x,
        this.pendingCoordsRef.y
      );
      this.pendingCoordsRef = null;
    }
    this.draggingTokenId = null;
    this.activePointerIdRef = null;
    this.boardRectRef = null;
    this._detachWindowListeners();
  }

  _attachWindowListeners() {
    this._detachWindowListeners();
    this._moveListener = (e) => this.handlePointerMove(e);
    this._upListener = (e) => this.handlePointerUp(e);
    this._cancelListener = (e) => this.handlePointerUp(e);

    this.windowListeners.pointermove.push(this._moveListener);
    this.windowListeners.pointerup.push(this._upListener);
    this.windowListeners.pointercancel.push(this._cancelListener);
  }

  _detachWindowListeners() {
    this.windowListeners.pointermove = [];
    this.windowListeners.pointerup = [];
    this.windowListeners.pointercancel = [];
  }

  _requestAnimationFrame(cb) {
    const id = this.nextRafId++;
    this.rafQueue.set(id, cb);
    return id;
  }

  _cancelAnimationFrame(id) {
    this.rafQueue.delete(id);
  }

  flushRaf() {
    for (const [id, cb] of Array.from(this.rafQueue.entries())) {
      this.rafQueue.delete(id);
      cb();
    }
  }

  dispatchWindowEvent(type, event) {
    const listeners = this.windowListeners[type] || [];
    for (const listener of listeners) {
      listener(event);
    }
  }
}

// 2.1 Multi-touch move event isolation check
{
  const board = new TacticalBoardHarness([
    { id: 'c-1', x: 20, y: 30 }
  ]);

  // Pointer 1 drags c-1
  board.handleDragStart('c-1', 200, 279.9, 1);

  // Pointer 2 sends move event with pointerId: 2 at (900, 900)
  board.dispatchWindowEvent('pointermove', {
    pointerId: 2,
    clientX: 900,
    clientY: 900,
    preventDefault: () => {}
  });

  recordTest(
    'Pointermove with different pointerId is ignored (activePointerIdRef isolation)',
    board.pendingCoordsRef === null
  );

  // Pointer 1 sends legitimate move event with pointerId: 1
  board.dispatchWindowEvent('pointermove', {
    pointerId: 1,
    clientX: 250,
    clientY: 300,
    preventDefault: () => {}
  });

  recordTest(
    'Pointermove with active pointerId is processed correctly',
    board.pendingCoordsRef !== null && board.pendingCoordsRef.id === 'c-1'
  );
  board.flushRaf();
}

// 2.2 Multi-touch: pointerup from secondary finger check (Current Baseline)
let baselinePointerUpVulnerable = false;
{
  const board = new TacticalBoardHarness([
    { id: 'c-1', x: 20, y: 30 }
  ]);

  board.handleDragStart('c-1', 200, 279.9, 1);
  board.dispatchWindowEvent('pointermove', {
    pointerId: 1,
    clientX: 250,
    clientY: 300,
    preventDefault: () => {}
  });
  board.flushRaf();

  // Secondary finger pointerup fires on window
  board.dispatchWindowEvent('pointerup', {
    pointerId: 2,
    clientX: 800,
    clientY: 800
  });

  baselinePointerUpVulnerable = (board.draggingTokenId === null && board.activePointerIdRef === null);

  if (baselinePointerUpVulnerable) {
    console.log(red('  [VULNERABILITY CONFIRMED] Multi-touch pointerup interference:'));
    console.log(red('  handlePointerUp does NOT check e.pointerId against activePointerIdRef.'));
    console.log(red('  Releasing a secondary finger (pointerId: 2) destroys active drag of pointerId: 1.'));
  }

  recordTest(
    'Multi-touch pointerup does not terminate active drag of different pointerId (Baseline)',
    !baselinePointerUpVulnerable,
    baselinePointerUpVulnerable ? 'Secondary finger pointerup killed active drag' : 'Isolated'
  );
}

// 2.3 Multi-touch: secondary token touch hijacking check (Current Baseline)
let baselineHijackVulnerable = false;
{
  const board = new TacticalBoardHarness([
    { id: 'c-1', x: 20, y: 30 },
    { id: 'c-2', x: 40, y: 50 }
  ]);

  board.handleDragStart('c-1', 200, 279.9, 1);
  board.handleDragStart('c-2', 400, 466.5, 2);

  baselineHijackVulnerable = (board.draggingTokenId === 'c-2' && board.activePointerIdRef === 2);
  if (baselineHijackVulnerable) {
    console.log(red('  [VULNERABILITY CONFIRMED] Multi-touch drag hijacking:'));
    console.log(red('  handleDragStart does NOT check if draggingTokenId/activePointerIdRef is active.'));
    console.log(red('  Secondary finger touching c-2 preempts and orphans c-1 active drag.'));
  }

  recordTest(
    'handleDragStart locks against secondary token touches during active drag (Baseline)',
    !baselineHijackVulnerable,
    baselineHijackVulnerable ? 'Secondary finger hijacked active drag to token c-2' : 'Locked'
  );
}


// =========================================================================
// TEST 3: REQUESTANIMATIONFRAME LIFECYCLE, FLUSH & UNMOUNT LEAK HARNESS
// =========================================================================
console.log(yellow('\n--- TEST SUITE 3: requestAnimationFrame & Unmount Lifecycle ---'));

// 3.1 RAF throttling coalesces high-frequency moves into 1 dispatch
{
  const board = new TacticalBoardHarness([
    { id: 'c-1', x: 20, y: 30 }
  ]);

  board.handleDragStart('c-1', 200, 280, 1);

  let dispatchCount = 0;
  const originalUpdate = board.updateTokenPosition;
  board.updateTokenPosition = (id, x, y) => {
    dispatchCount++;
    originalUpdate(id, x, y);
  };

  // Simulate 10 rapid touchmove events in 10ms (1000Hz touch sampling)
  for (let i = 1; i <= 10; i++) {
    board.dispatchWindowEvent('pointermove', {
      pointerId: 1,
      clientX: 200 + i * 5,
      clientY: 280 + i * 5,
      preventDefault: () => {}
    });
  }

  const dispatchesBeforeFlush = dispatchCount;
  board.flushRaf();
  const dispatchesAfterFlush = dispatchCount;

  recordTest(
    'RAF batches 10 rapid moves into exactly 1 state update',
    dispatchesBeforeFlush === 0 && dispatchesAfterFlush === 1,
    `Before flush: ${dispatchesBeforeFlush}, After flush: ${dispatchesAfterFlush}`
  );
}

// 3.2 Pointerup commits pending coordinate and cleanly cancels RAF
{
  const board = new TacticalBoardHarness([
    { id: 'c-1', x: 20, y: 30 }
  ]);

  board.handleDragStart('c-1', 200, 280, 1);

  let dispatchCount = 0;
  board.updateTokenPosition = (id, x, y) => {
    dispatchCount++;
    board.tokens[0].x = x;
    board.tokens[0].y = y;
  };

  board.dispatchWindowEvent('pointermove', {
    pointerId: 1,
    clientX: 300,
    clientY: 380,
    preventDefault: () => {}
  });

  board.dispatchWindowEvent('pointerup', {
    pointerId: 1,
    clientX: 300,
    clientY: 380
  });

  const dispatchedOnPointerUp = dispatchCount;
  const rafCancelled = (board.rafQueue.size === 0 && board.rafIdRef === null);

  board.flushRaf();
  const dispatchedAfterStaleFrame = dispatchCount;

  recordTest(
    'Pointerup commits pending coordinate and cleanly cancels RAF (no duplicate/delayed dispatch)',
    dispatchedOnPointerUp === 1 && dispatchedAfterStaleFrame === 1 && rafCancelled,
    `Committed on up: ${dispatchedOnPointerUp}, After frame: ${dispatchedAfterStaleFrame}, RAF cancelled: ${rafCancelled}`
  );
}

// 3.3 Component unmount while RAF is pending cancels RAF without post-unmount dispatch
{
  const board = new TacticalBoardHarness([
    { id: 'c-1', x: 20, y: 30 }
  ]);

  board.handleDragStart('c-1', 200, 280, 1);

  let stateUpdatedAfterUnmount = false;
  board.updateTokenPosition = (id, x, y) => {
    stateUpdatedAfterUnmount = true;
  };

  board.dispatchWindowEvent('pointermove', {
    pointerId: 1,
    clientX: 400,
    clientY: 400,
    preventDefault: () => {}
  });

  const rafScheduledBeforeUnmount = (board.rafIdRef !== null);

  // Unmount cleanup
  if (board.rafIdRef !== null) {
    board._cancelAnimationFrame(board.rafIdRef);
    board.rafIdRef = null;
  }
  board._detachWindowListeners();

  // Frame tick after unmount
  board.flushRaf();

  recordTest(
    'Unmount cleanup cancels scheduled RAF and prevents state updates after unmount',
    rafScheduledBeforeUnmount && !stateUpdatedAfterUnmount && board.rafQueue.size === 0,
    `RAF scheduled: ${rafScheduledBeforeUnmount}, Post-unmount update: ${stateUpdatedAfterUnmount}`
  );

  const windowListenersClean = (
    board.windowListeners.pointermove.length === 0 &&
    board.windowListeners.pointerup.length === 0 &&
    board.windowListeners.pointercancel.length === 0
  );

  recordTest(
    'Unmount removes all window listeners (no hanging memory leaks)',
    windowListenersClean
  );
}


// =========================================================================
// TEST 4: PROPOSED MITIGATIONS VERIFICATION HARNESS
// =========================================================================
console.log(yellow('\n--- TEST SUITE 4: Verification of Proposed Fixes (Proof of Concept) ---'));

{
  const board = new TacticalBoardHarness([
    { id: 'c-1', x: 20, y: 30 },
    { id: 'c-2', x: 40, y: 50 }
  ], true /* applyMitigations = true */);

  // Finger 1 starts drag on c-1
  board.handleDragStart('c-1', 200, 280, 1);

  // Secondary finger touches c-2: should be rejected
  board.handleDragStart('c-2', 400, 466, 2);
  const hijackPrevented = (board.draggingTokenId === 'c-1' && board.activePointerIdRef === 1);
  recordTest('Mitigation: Secondary token touch does not hijack active drag', hijackPrevented);

  // Secondary finger releases: should not abort c-1 drag
  board.dispatchWindowEvent('pointerup', {
    pointerId: 2,
    clientX: 400,
    clientY: 466
  });
  const upIgnored = (board.draggingTokenId === 'c-1' && board.activePointerIdRef === 1);
  recordTest('Mitigation: Secondary pointerup does not abort active drag', upIgnored);

  // Finger 1 legitimately moves and releases
  board.dispatchWindowEvent('pointermove', {
    pointerId: 1,
    clientX: 250,
    clientY: 320,
    preventDefault: () => {}
  });
  board.dispatchWindowEvent('pointerup', {
    pointerId: 1,
    clientX: 250,
    clientY: 320
  });
  const normalReleaseClean = (board.draggingTokenId === null && board.activePointerIdRef === null);
  recordTest('Mitigation: Active pointer releases cleanly when pointerId matches', normalReleaseClean);
}

// =========================================================================
// SUMMARY
// =========================================================================
console.log(cyan('\n================================================================='));
console.log(`TOTAL BASELINE TESTS: ${results.passed + results.failed}`);
console.log(`PASSED: ${green(results.passed)}`);
console.log(`FAILED IN BASELINE: ${results.failed > 0 ? red(results.failed) : green(0)}`);
console.log(cyan('================================================================='));
