import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { FibaCourtSvg } from './FibaCourtSvg';
import { BoardTokenItem } from './BoardTokenItem';
import { DrawingCanvas } from './DrawingCanvas';
import { DefensiveFormationsBar } from './DefensiveFormationsBar';
import { PlaySimulationBar } from './PlaySimulationBar';
import { OpponentBadgeModal } from './OpponentBadgeModal';
import { QuickTokenHud } from './QuickTokenHud';
import { BoardToken } from '../../types';
import {
  Move,
  PenTool,
  Eraser,
  Undo2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Shield,
  PlayCircle,
} from 'lucide-react';

export const TacticalBoard: React.FC = () => {
  const {
    tokens,
    drawingMode,
    drawings,
    drawColor,
    drawWidth,
    activeFormationId,
    currentStepIndex,
    formations,
    isWeakSideFloatActive,
    sequences,
    activeSequenceId,
    activeSequenceFrameIndex,
    isPlayingSequence,
    simulationSpeed,
    isFullScreen,
    setTokens,
    updateTokenPosition,
    updateOpponentBadge,
    setDrawingMode,
    setDrawColor,
    addDrawingPath,
    clearDrawings,
    undoLastDrawing,
    resetTokensToDefault,
    loadFormation,
    setFormationStep,
    createSequence,
    loadSequenceFrame,
    deleteSequence,
    setIsPlayingSequence,
    setSimulationSpeed,
    toggleFullScreen,
    players,
    incrementFouls,
    decrementFouls,
    setFatigue,
    substitutePlayerOnBoard,
  } = useCuervosStore();

  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const boardRectRef = useRef<DOMRect | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activePointerIdRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingCoordsRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const simRafIdRef = useRef<number | null>(null);

  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [badgeModalToken, setBadgeModalToken] = useState<BoardToken | null>(null);
  const [selectedHudToken, setSelectedHudToken] = useState<BoardToken | null>(null);
  const [activeBottomPanel, setActiveBottomPanel] = useState<'simulacion' | 'defensas' | 'none'>('simulacion');

  // Dragging logic via high-performance Pointer Events Pipeline
  const handleDragStart = (id: string, clientX: number, clientY: number, pointerId: number) => {
    if (drawingMode === 'draw') return;
    // Multi-touch isolation: lock against secondary touch hijacking during active drag
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== pointerId) return;

    setDraggingTokenId(id);
    activePointerIdRef.current = pointerId;

    if (boardContainerRef.current) {
      const rect = boardContainerRef.current.getBoundingClientRect();
      boardRectRef.current = rect;

      const token = tokens.find((t) => t.id === id);
      if (token) {
        // Calculate exact token center in pixels on screen
        const tokenCenterPxX = rect.left + (token.x / 100) * rect.width;
        const tokenCenterPxY = rect.top + (token.y / 100) * rect.height;
        // Grab offset between user contact point and token center (prevents center-snapping)
        dragOffsetRef.current = {
          x: clientX - tokenCenterPxX,
          y: clientY - tokenCenterPxY,
        };
      } else {
        dragOffsetRef.current = { x: 0, y: 0 };
      }
    }
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingTokenId || drawingMode === 'draw') return;
      // Filter by pointerId to prevent multi-finger coordinate hijacking
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
        return;
      }
      e.preventDefault();

      let rect = boardRectRef.current;
      if (!rect && boardContainerRef.current) {
        rect = boardContainerRef.current.getBoundingClientRect();
        boardRectRef.current = rect;
      }
      if (!rect) return;

      // Adjust for grab offset so token never teleports to touch coordinate
      const targetCenterX = e.clientX - dragOffsetRef.current.x;
      const targetCenterY = e.clientY - dragOffsetRef.current.y;

      const normX = ((targetCenterX - rect.left) / rect.width) * 100;
      const normY = ((targetCenterY - rect.top) / rect.height) * 100;

      // Boundary clamping inside court borders [5, 95] and [6, 93]
      const clampedX = Math.max(5, Math.min(95, normX));
      const clampedY = Math.max(6, Math.min(93, normY));

      pendingCoordsRef.current = { id: draggingTokenId, x: clampedX, y: clampedY };

      // Throttle updates using requestAnimationFrame (60/120fps display refresh coalescing)
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingCoordsRef.current) {
            updateTokenPosition(
              pendingCoordsRef.current.id,
              pendingCoordsRef.current.x,
              pendingCoordsRef.current.y
            );
            pendingCoordsRef.current = null;
          }
          rafIdRef.current = null;
        });
      }
    },
    [draggingTokenId, drawingMode, updateTokenPosition]
  );

  const handlePointerUp = useCallback(
    (e?: PointerEvent) => {
      // Multi-touch isolation: ignore pointerup from secondary finger touching elsewhere
      if (e && activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
        return;
      }

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (pendingCoordsRef.current) {
        updateTokenPosition(
          pendingCoordsRef.current.id,
          pendingCoordsRef.current.x,
          pendingCoordsRef.current.y
        );
        pendingCoordsRef.current = null;
      }
      setDraggingTokenId(null);
      activePointerIdRef.current = null;
      boardRectRef.current = null;
    },
    [updateTokenPosition]
  );

  useEffect(() => {
    if (draggingTokenId) {
      const handleResizeOrScroll = () => {
        if (boardContainerRef.current) {
          boardRectRef.current = boardContainerRef.current.getBoundingClientRect();
        }
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll, { passive: true });

      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll);
      };
    }
  }, [draggingTokenId, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (simRafIdRef.current !== null) {
        cancelAnimationFrame(simRafIdRef.current);
        simRafIdRef.current = null;
      }
    };
  }, []);

  // Keyboard shortcut: Space toggles play/pause simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPlayingSequence(!isPlayingSequence);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingSequence, setIsPlayingSequence]);

  // High-Precision 60fps Play Simulation Engine (requestAnimationFrame Interpolation)
  useEffect(() => {
    if (!isPlayingSequence) {
      if (simRafIdRef.current !== null) {
        cancelAnimationFrame(simRafIdRef.current);
        simRafIdRef.current = null;
      }
      return;
    }

    const currentSequence =
      sequences.find((s) => s.id === activeSequenceId) || sequences[0];
    if (!currentSequence || currentSequence.frames.length <= 1) {
      setIsPlayingSequence(false);
      return;
    }

    let currentFrameIdx = activeSequenceFrameIndex;
    let nextFrameIdx = (currentFrameIdx + 1) % currentSequence.frames.length;
    let startTokens = currentSequence.frames[currentFrameIdx].tokens;
    let endTokens = currentSequence.frames[nextFrameIdx].tokens;
    let baseDuration = currentSequence.frames[currentFrameIdx].duracionMs || 1800;
    let duration = baseDuration / simulationSpeed;
    let stepStartTime = performance.now();

    const animateLoop = (now: number) => {
      const elapsed = now - stepStartTime;
      const t = Math.min(1, elapsed / duration);

      // Smooth cubic ease-in-out curve
      const ease =
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Calculate interpolated positions for all 11 tokens
      const nextTokens = startTokens.map((start) => {
        const target = endTokens.find((item) => item.id === start.id);
        if (!target) return start;
        return {
          ...start,
          x: start.x + (target.x - start.x) * ease,
          y: start.y + (target.y - start.y) * ease,
        };
      });

      setTokens(nextTokens);

      if (t >= 1) {
        // Step finished! Advance frame
        currentFrameIdx = nextFrameIdx;
        loadSequenceFrame(currentSequence.id, currentFrameIdx);
        nextFrameIdx = (currentFrameIdx + 1) % currentSequence.frames.length;
        startTokens = currentSequence.frames[currentFrameIdx].tokens;
        endTokens = currentSequence.frames[nextFrameIdx].tokens;
        baseDuration = currentSequence.frames[currentFrameIdx].duracionMs || 1800;
        duration = baseDuration / simulationSpeed;
        stepStartTime = performance.now();
      }

      simRafIdRef.current = requestAnimationFrame(animateLoop);
    };

    simRafIdRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (simRafIdRef.current !== null) {
        cancelAnimationFrame(simRafIdRef.current);
        simRafIdRef.current = null;
      }
    };
  }, [
    isPlayingSequence,
    activeSequenceId,
    simulationSpeed,
    sequences,
    setTokens,
    loadSequenceFrame,
    setIsPlayingSequence,
  ]);

  // Request native fullscreen API when toggle is triggered
  const handleToggleFullscreen = () => {
    toggleFullScreen();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const colors = [
    { name: 'Naranja Cuervos', hex: '#ED4B00' },
    { name: 'Blanco Tiza', hex: '#F8FAFC' },
    { name: 'Gris Pizarra', hex: '#94A3B8' },
    { name: 'Rojo Alerta', hex: '#EF4444' },
  ];

  const ball = tokens.find((t) => t.type === 'ball');
  const isWeakSideFloating = (token: BoardToken) => {
    if (!isWeakSideFloatActive || token.type !== 'cuervos') return false;
    if (!ball) return token.id === 'c-4';
    if (ball.x > 55) return token.x < 45;
    if (ball.x < 45) return token.x > 55;
    return false;
  };

  const togglePanel = (panel: 'simulacion' | 'defensas') =>
    setActiveBottomPanel(activeBottomPanel === panel ? 'none' : panel);

  return (
    <div
      className={`flex flex-col select-none touch-none overscroll-none ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-cuervos-950 w-screen h-[100dvh] pb-[var(--safe-bottom)]'
          : 'relative w-full board-viewport max-w-7xl mx-auto'
      }`}
    >
      {/* Slim toolbar: icon-only on phones, 40px targets */}
      <div className="flex items-center justify-between gap-1 px-1.5 sm:px-2 h-12 shrink-0 z-30">
        <div className="flex items-center gap-1 min-w-0">
          <div className="flex items-center rounded-xl bg-white/[0.04] p-0.5" role="group" aria-label="Modo de pizarra">
            <button
              onClick={() => setDrawingMode('move')}
              aria-pressed={drawingMode === 'move'}
              className="ctl-icon"
              title="Mover fichas"
              aria-label="Mover fichas"
            >
              <Move className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setDrawingMode('draw')}
              aria-pressed={drawingMode === 'draw'}
              className="ctl-icon"
              title="Dibujar trazos"
              aria-label="Dibujar trazos"
            >
              <PenTool className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          </div>

          {/* Drawing tools (draw mode only) */}
          {drawingMode === 'draw' && (
            <div className="flex items-center gap-0.5 pl-1 ml-0.5 border-l border-white/10">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setDrawColor(c.hex)}
                  className="w-8 h-10 flex items-center justify-center"
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={drawColor === c.hex}
                >
                  <span
                    style={{ backgroundColor: c.hex }}
                    className={`block w-5 h-5 rounded-full transition-shadow ${
                      drawColor === c.hex ? 'ring-2 ring-offset-2 ring-offset-cuervos-950 ring-cuervos-chalk' : ''
                    }`}
                  />
                </button>
              ))}
              <button
                onClick={undoLastDrawing}
                disabled={drawings.length === 0}
                className="ctl-icon"
                title="Deshacer último trazo"
                aria-label="Deshacer último trazo"
              >
                <Undo2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
              <button
                onClick={clearDrawings}
                disabled={drawings.length === 0}
                className="ctl-icon"
                title="Limpiar todos los trazos"
                aria-label="Limpiar todos los trazos"
              >
                <Eraser className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {drawingMode === 'move' && (
            <>
              <button
                onClick={() => togglePanel('simulacion')}
                aria-pressed={activeBottomPanel === 'simulacion'}
                className="ctl-icon"
                title="Simulación de jugadas 5v5"
                aria-label="Simulación de jugadas"
              >
                <PlayCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => togglePanel('defensas')}
                aria-pressed={activeBottomPanel === 'defensas'}
                className="ctl-icon"
                title="Sistemas defensivos"
                aria-label="Sistemas defensivos"
              >
                <Shield className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
              <span className="w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />
              <button
                onClick={() => {
                  setIsPlayingSequence(false);
                  resetTokensToDefault();
                }}
                className="ctl-icon"
                title="Reiniciar posiciones iniciales"
                aria-label="Reiniciar posiciones iniciales"
              >
                <RotateCcw className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
            </>
          )}
          <button
            onClick={handleToggleFullscreen}
            aria-pressed={isFullScreen}
            className="ctl-icon"
            title={isFullScreen ? 'Salir de pantalla completa' : 'Cancha en pantalla completa'}
            aria-label={isFullScreen ? 'Salir de pantalla completa' : 'Cancha en pantalla completa'}
          >
            {isFullScreen ? (
              <Minimize2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
            ) : (
              <Maximize2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Court: full-bleed on phones, takes every remaining pixel */}
      <div className="relative flex-1 w-full min-h-0 flex items-center justify-center sm:px-2 overflow-hidden touch-none overscroll-none">
        <div
          ref={boardContainerRef}
          className="relative max-h-full max-w-full aspect-[1000/933] m-auto bg-cuervos-950 sm:rounded-2xl overflow-hidden sm:ring-1 sm:ring-white/10 touch-none-board touch-none overscroll-none"
        >
          {/* FIBA Half-court SVG Base */}
          <FibaCourtSvg isWeakSideFloatActive={isWeakSideFloatActive} />

          {/* Tactical Arrow / Cutting Drawing Canvas Layer */}
          <DrawingCanvas
            drawingMode={drawingMode}
            drawings={drawings}
            drawColor={drawColor}
            drawWidth={drawWidth}
            onAddDrawing={addDrawingPath}
          />

          {/* Interactive Tokens (5 Cuervos, 5 Opponents, 1 Basketball) */}
          {tokens.map((token) => (
            <BoardTokenItem
              key={token.id}
              token={token}
              isDragging={draggingTokenId === token.id}
              isDrawingMode={drawingMode === 'draw'}
              isSimulating={isPlayingSequence}
              onDragStart={handleDragStart}
              onTapToken={(id) => {
                const found = tokens.find((t) => t.id === id);
                if (found) setSelectedHudToken(found);
              }}
              onDoubleTapOpponent={(oppId) => {
                const found = tokens.find((t) => t.id === oppId);
                if (found) setBadgeModalToken(found);
              }}
              isFloating={isWeakSideFloating(token)}
            />
          ))}

          {/* Discreet state chip: only while simulating or drawing */}
          {(isPlayingSequence || drawingMode === 'draw') && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <div className="h-6 px-2 rounded-md glass text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cuervos-orange" />
                <span>{isPlayingSequence ? `Simulando ${simulationSpeed}x` : 'Modo dibujo'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact dock (simulation / defenses); detail sheets float over the court */}
      {activeBottomPanel !== 'none' && drawingMode === 'move' && (
        <div className="relative z-30 shrink-0 px-1.5 sm:px-2 pt-1.5 pb-1.5">
          {activeBottomPanel === 'simulacion' && (
            <PlaySimulationBar
              sequences={sequences}
              activeSequenceId={activeSequenceId}
              activeSequenceFrameIndex={activeSequenceFrameIndex}
              isPlaying={isPlayingSequence}
              simulationSpeed={simulationSpeed}
              onSelectSequence={(id) => {
                setIsPlayingSequence(false);
                loadSequenceFrame(id, 0);
              }}
              onSelectFrame={(sequenceId, frameIndex) => {
                setIsPlayingSequence(false);
                loadSequenceFrame(sequenceId, frameIndex);
              }}
              onTogglePlay={setIsPlayingSequence}
              onReset={() => {
                setIsPlayingSequence(false);
                const currentSeq = sequences.find((s) => s.id === activeSequenceId) || sequences[0];
                if (currentSeq) {
                  loadSequenceFrame(currentSeq.id, 0);
                }
              }}
              onSetSpeed={setSimulationSpeed}
              onCreateSequence={createSequence}
              onDeleteSequence={deleteSequence}
            />
          )}

          {activeBottomPanel === 'defensas' && (
            <DefensiveFormationsBar
              formations={formations}
              activeFormationId={activeFormationId}
              currentStepIndex={currentStepIndex}
              onSelectFormation={loadFormation}
              onSelectStep={setFormationStep}
              isWeakSideFloatActive={isWeakSideFloatActive}
            />
          )}
        </div>
      )}

      {/* Quick HUD for tapped token (Cuervos / Opponent) */}
      <QuickTokenHud
        token={selectedHudToken}
        players={players}
        tokens={tokens}
        onClose={() => setSelectedHudToken(null)}
        onIncrementFouls={incrementFouls}
        onDecrementFouls={decrementFouls}
        onSetFatigue={setFatigue}
        onSubstitute={substitutePlayerOnBoard}
        onSelectOpponentBadge={updateOpponentBadge}
      />

      {/* Opponent Badge Assignment Modal */}
      <OpponentBadgeModal
        token={badgeModalToken}
        isOpen={!!badgeModalToken}
        onClose={() => setBadgeModalToken(null)}
        onSelectBadge={(badge) => {
          if (badgeModalToken) {
            updateOpponentBadge(badgeModalToken.id, badge);
          }
        }}
      />
    </div>
  );
};
