import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { FibaCourtSvg } from './FibaCourtSvg';
import { BoardTokenItem } from './BoardTokenItem';
import { DrawingCanvas } from './DrawingCanvas';
import { DefensiveFormationsBar } from './DefensiveFormationsBar';
import { FramePlayerControls } from './FramePlayerControls';
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
  PlaySquare
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
    isFullScreen,
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
    addCurrentFrameToSequence,
    loadSequenceFrame,
    deleteSequence,
    setIsPlayingSequence,
    toggleFullScreen,
    players,
    incrementFouls,
    decrementFouls,
    setFatigue,
    substitutePlayerOnBoard,
  } = useCuervosStore();

  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [badgeModalToken, setBadgeModalToken] = useState<BoardToken | null>(null);
  const [selectedHudToken, setSelectedHudToken] = useState<BoardToken | null>(null);
  const [activeBottomPanel, setActiveBottomPanel] = useState<'defensas' | 'frames' | 'none'>('defensas');

  // Dragging logic via Pointer Events
  const handleDragStart = (id: string, clientX: number, clientY: number) => {
    if (drawingMode === 'draw') return;
    setDraggingTokenId(id);

    if (boardContainerRef.current) {
      const rect = boardContainerRef.current.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 100;
      const normY = ((clientY - rect.top) / rect.height) * 100;
      updateTokenPosition(id, normX, normY);
    }
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingTokenId || !boardContainerRef.current || drawingMode === 'draw') return;
      e.preventDefault();

      const rect = boardContainerRef.current.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 100;
      const normY = ((e.clientY - rect.top) / rect.height) * 100;
      updateTokenPosition(draggingTokenId, normX, normY);
    },
    [draggingTokenId, drawingMode, updateTokenPosition]
  );

  const handlePointerUp = useCallback(() => {
    if (draggingTokenId) {
      setDraggingTokenId(null);
    }
  }, [draggingTokenId]);

  useEffect(() => {
    if (draggingTokenId) {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingTokenId, handlePointerMove, handlePointerUp]);

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
    { name: 'Cian Neón', hex: '#00F0FF' },
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
      className={`flex flex-col select-none transition-all ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-cuervos-950 w-screen h-screen'
          : 'relative w-full h-[calc(100vh-4rem)] max-w-7xl mx-auto p-2 sm:p-4'
      }`}
    >
      {/* Tactical Top Floating Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-cuervos-dark/90 backdrop-blur-md border border-cuervos-border/80 px-3 py-2 rounded-xl shadow-card z-30 mb-2">
        {/* Left: Mode Toggle (Move vs Draw) */}
        <div className="flex items-center gap-1.5">
          <div className="bg-cuervos-elevated p-1 rounded-lg flex items-center gap-1 border border-cuervos-border">
            <button
              onClick={() => setDrawingMode('move')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                drawingMode === 'move'
                  ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mover Fichas</span>
            </button>
            <button
              onClick={() => setDrawingMode('draw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                drawingMode === 'draw'
                  ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dibujar Pizarra</span>
            </button>
          </div>

          {/* Drawing Tools (Visible when in Draw Mode) */}
          {drawingMode === 'draw' && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-cuervos-border animate-in fade-in">
              <div className="flex items-center gap-1">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setDrawColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      drawColor === c.hex ? 'scale-125 border-white shadow-md ring-2 ring-cuervos-cyan/60' : 'border-slate-800'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              <button
                onClick={undoLastDrawing}
                disabled={drawings.length === 0}
                className="p-1.5 rounded-md bg-cuervos-elevated text-slate-300 hover:text-white disabled:opacity-40"
                title="Deshacer último trazo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearDrawings}
                disabled={drawings.length === 0}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-cuervos-elevated text-red-400 hover:bg-red-500/20 text-xs font-semibold disabled:opacity-40"
                title="Limpiar todos los trazos"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Limpiar</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Board Layout, Reset & Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Bottom Panel Toggle */}
          <div className="flex items-center bg-cuervos-elevated rounded-lg p-0.5 border border-cuervos-border">
            <button
              onClick={() => setActiveBottomPanel(activeBottomPanel === 'defensas' ? 'none' : 'defensas')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                activeBottomPanel === 'defensas'
                  ? 'bg-cuervos-card text-cuervos-cyan border border-cuervos-cyan/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Defensas</span>
            </button>
            <button
              onClick={() => setActiveBottomPanel(activeBottomPanel === 'frames' ? 'none' : 'frames')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                activeBottomPanel === 'frames'
                  ? 'bg-cuervos-card text-cuervos-amber border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlaySquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Jugadas/Pasos</span>
            </button>
          </div>

          {/* Reset Tokens Button */}
          <button
            onClick={resetTokensToDefault}
            className="p-1.5 rounded-lg bg-cuervos-elevated text-slate-400 hover:text-white hover:bg-cuervos-border border border-cuervos-border/60"
            title="Reiniciar posiciones iniciales"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Real Fullscreen Mode Button */}
          <button
            onClick={handleToggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
              isFullScreen
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-glow'
                : 'bg-cuervos-elevated text-cuervos-cyan border-cuervos-cyan/40 hover:bg-cuervos-border'
            }`}
            title="Modo Pantalla Completa Cancha"
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Salir Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Pantalla Completa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Court Canvas Area */}
      <div className="relative flex-1 w-full min-h-0 flex items-center justify-center p-1 overflow-hidden">
        <div
          ref={boardContainerRef}
          className="relative max-h-full max-w-full aspect-[1000/933] m-auto bg-cuervos-950 rounded-2xl overflow-hidden border border-cuervos-border shadow-2xl touch-none-board"
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

          {/* Floating Live Helper Overlay */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="px-2.5 py-1 rounded-md bg-cuervos-950/80 backdrop-blur border border-cuervos-border/60 text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cuervos-cyan animate-ping" />
              <span>
                {drawingMode === 'move'
                  ? 'Arrastra a 60fps • Toca para HUD rápido • Toca 2x rival para etiqueta'
                  : 'Modo Pizarra: Dibuja flechas tácticas con el dedo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Drawers */}
      <div className="mt-2 z-30">
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

        {activeBottomPanel === 'frames' && (
          <FramePlayerControls
            sequences={sequences}
            activeSequenceId={activeSequenceId}
            activeSequenceFrameIndex={activeSequenceFrameIndex}
            isPlaying={isPlayingSequence}
            onSelectSequence={(id) => {
              const seq = sequences.find((s) => s.id === id);
              if (seq) loadSequenceFrame(id, 0);
            }}
            onSelectFrame={loadSequenceFrame}
            onCreateSequence={createSequence}
            onAddCurrentFrame={addCurrentFrameToSequence}
            onDeleteSequence={deleteSequence}
            onTogglePlay={setIsPlayingSequence}
          />
        )}
      </div>

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
