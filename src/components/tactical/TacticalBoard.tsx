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
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Zap
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
    { name: 'Ámbar Jugada', hex: '#F59E0B' },
    { name: 'Rojo Alerta', hex: '#EF4444' },
    { name: 'Blanco Puro', hex: '#FFFFFF' },
  ];

  const ball = tokens.find((t) => t.type === 'ball');
  const isWeakSideFloating = (token: BoardToken) => {
    if (!isWeakSideFloatActive || token.type !== 'cuervos') return false;
    if (!ball) return token.id === 'c-4';
    if (ball.x > 55) return token.x < 45;
    if (ball.x < 45) return token.x > 55;
    return false;
  };

  return (
    <div
      className={`flex flex-col select-none transition-all touch-none overscroll-none ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-cuervos-950 w-screen h-screen p-1 sm:p-2'
          : 'relative w-full h-[calc(100dvh-4.25rem)] sm:h-[calc(100dvh-4rem)] max-w-7xl mx-auto p-1 sm:p-2'
      }`}
    >
      {/* Tactical Top Compact Toolbar */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 bg-cuervos-dark/95 backdrop-blur-md border border-cuervos-border/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-card z-30 mb-1 shrink-0 overflow-x-auto no-scrollbar">
        {/* Left: Mode Toggle (Move vs Draw) */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="bg-cuervos-elevated p-0.5 sm:p-1 rounded-lg flex items-center gap-0.5 sm:gap-1 border border-cuervos-border">
            <button
              onClick={() => setDrawingMode('move')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-md text-xs font-bold transition-all ${
                drawingMode === 'move'
                  ? 'bg-cuervos-orange text-white shadow-orange-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mover</span>
            </button>
            <button
              onClick={() => setDrawingMode('draw')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-md text-xs font-bold transition-all ${
                drawingMode === 'draw'
                  ? 'bg-cuervos-orange text-white shadow-orange-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dibujar</span>
            </button>
          </div>

          {/* Drawing Tools (Visible when in Draw Mode) */}
          {drawingMode === 'draw' && (
            <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-cuervos-border animate-in fade-in">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setDrawColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-transform ${
                      drawColor === c.hex ? 'scale-125 border-white shadow-md ring-2 ring-cuervos-orange/60' : 'border-slate-800'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              <button
                onClick={undoLastDrawing}
                disabled={drawings.length === 0}
                className="p-1 sm:p-1.5 rounded-md bg-cuervos-elevated text-slate-300 hover:text-white disabled:opacity-40"
                title="Deshacer último trazo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearDrawings}
                disabled={drawings.length === 0}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-cuervos-elevated text-red-400 hover:bg-red-500/20 text-xs font-semibold disabled:opacity-40"
                title="Limpiar todos los trazos"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Limpiar</span>
              </button>
            </div>
          )}
        </div>

        {/* Center / Right: Panel Toggles (Simulación vs Defensas) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="flex items-center bg-cuervos-elevated rounded-lg p-0.5 border border-cuervos-border">
            <button
              onClick={() => setActiveBottomPanel(activeBottomPanel === 'simulacion' ? 'none' : 'simulacion')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                activeBottomPanel === 'simulacion'
                  ? 'bg-cuervos-card text-cuervos-orange border border-cuervos-orange/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cuervos-orange fill-cuervos-orange" />
              <span>Simulación 5v5</span>
            </button>
            <button
              onClick={() => setActiveBottomPanel(activeBottomPanel === 'defensas' ? 'none' : 'defensas')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                activeBottomPanel === 'defensas'
                  ? 'bg-cuervos-card text-cuervos-orange border border-cuervos-orange/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Defensas</span>
            </button>
          </div>

          {/* Reset Tokens Button */}
          <button
            onClick={() => {
              setIsPlayingSequence(false);
              resetTokensToDefault();
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-cuervos-elevated text-slate-400 hover:text-white hover:bg-cuervos-border border border-cuervos-border/60"
            title="Reiniciar posiciones iniciales"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Fullscreen Mode Button */}
          <button
            onClick={handleToggleFullscreen}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
              isFullScreen
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-glow'
                : 'bg-cuervos-elevated text-cuervos-orange border-cuervos-orange/40 hover:bg-cuervos-border'
            }`}
            title="Modo Pantalla Completa Cancha"
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Salir</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cancha Completa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Court Canvas Area (Optimized to Maximize Screen Estate) */}
      <div className="relative flex-1 w-full min-h-0 flex items-center justify-center p-0 sm:p-1 overflow-hidden touch-none overscroll-none">
        <div
          ref={boardContainerRef}
          className="relative max-h-full max-w-full aspect-[1000/933] m-auto bg-cuervos-950 rounded-2xl overflow-hidden border border-cuervos-border/90 shadow-2xl touch-none-board touch-none overscroll-none"
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

          {/* Floating Status Indicator */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="px-2.5 py-1 rounded-lg bg-cuervos-950/85 backdrop-blur-md border border-cuervos-border/70 text-[10px] text-slate-300 flex items-center gap-1.5 shadow-md">
              <span className={`w-2 h-2 rounded-full ${isPlayingSequence ? 'bg-amber-400 animate-ping' : 'bg-cuervos-orange'}`} />
              <span>
                {isPlayingSequence 
                  ? `Simulando a ${simulationSpeed}x • Pulsa Espacio para pausar`
                  : drawingMode === 'move'
                  ? 'Arrastra fichas • Toca para HUD • Doble tap rival para etiqueta'
                  : 'Modo Pizarra: Dibuja flechas tácticas con el dedo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Drawers (Simulation / Defenses) */}
      {activeBottomPanel !== 'none' && (
        <div className="mt-1 z-30 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150">
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
