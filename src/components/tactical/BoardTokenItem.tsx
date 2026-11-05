import React, { useRef, useState } from 'react';
import { BoardToken, OpponentBadge } from '../../types';
import { Shield, Flame, EyeOff } from 'lucide-react';

interface BoardTokenItemProps {
  token: BoardToken;
  isDragging: boolean;
  isDrawingMode: boolean;
  isSimulating?: boolean;
  onDragStart: (id: string, clientX: number, clientY: number, pointerId: number) => void;
  onDoubleTapOpponent?: (id: string) => void;
  onTapToken?: (id: string) => void;
  isFloating?: boolean;
}

export const BoardTokenItem: React.FC<BoardTokenItemProps> = ({
  token,
  isDragging,
  isDrawingMode,
  isSimulating = false,
  onDragStart,
  onDoubleTapOpponent,
  onTapToken,
  isFloating = false,
}) => {
  const lastTapRef = useRef<number>(0);
  const [isPressing, setIsPressing] = useState(false);
  const downPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDrawingMode) return;
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if capture fails in edge cases
    }

    downPosRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;
    setIsPressing(true);

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;

    // Check double tap for opponent badge assignment
    if (token.type === 'opponent' && timeSinceLastTap < 350) {
      if (onDoubleTapOpponent) {
        onDoubleTapOpponent(token.id);
        return;
      }
    }

    onDragStart(token.id, e.clientX, e.clientY, e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!downPosRef.current) return;
    const dist = Math.hypot(e.clientX - downPosRef.current.x, e.clientY - downPosRef.current.y);
    if (dist > 5) {
      hasMovedRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    setIsPressing(false);

    // If movement was less than 5px and not a cancel event, it's a tap!
    if (e.type !== 'pointercancel' && !hasMovedRef.current && onTapToken) {
      onTapToken(token.id);
    }

    downPosRef.current = null;
    hasMovedRef.current = false;
  };

  // Badge icon & styling for opponents
  const renderOpponentBadge = (badge?: OpponentBadge | null) => {
    if (!badge) return null;

    let bgClass = 'bg-slate-800 text-slate-200 border-slate-600';
    let Icon = Shield;
    let labelText = badge;

    if (badge === 'Tirador Letal') {
      bgClass = 'bg-amber-500/90 text-slate-950 font-black border-amber-300 shadow-amber-glow animate-pulse';
      Icon = Flame;
    } else if (badge === 'Flotar (No tira)') {
      bgClass = 'bg-cyan-900/90 text-cyan-200 border-cyan-400/50';
      Icon = EyeOff;
    } else if (badge === 'Poste Rival') {
      bgClass = 'bg-red-800 text-white font-bold border-red-500';
      Icon = Shield;
    }

    return (
      <div
        className={`absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] tracking-tight flex items-center gap-1 border shadow-lg pointer-events-none z-30 ${bgClass}`}
      >
        <Icon className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" />
        <span>{labelText}</span>
      </div>
    );
  };

  // Foul indicators (1 to 5 dots)
  const renderFoulDots = (fouls: number = 0) => {
    return (
      <div className="flex items-center justify-center gap-0.5 mt-0.5">
        {[1, 2, 3, 4, 5].map((num) => {
          const isCommitted = num <= fouls;
          let dotColor = 'bg-slate-700';
          if (isCommitted) {
            if (num <= 2) dotColor = 'bg-emerald-400';
            else if (num <= 3) dotColor = 'bg-amber-400';
            else dotColor = 'bg-red-500 shadow-red-glow animate-ping';
          }
          return <span key={num} className={`w-1 h-1 rounded-full ${dotColor}`} />;
        })}
      </div>
    );
  };

  const isMoving = isDragging || isPressing || isSimulating;
  const tokenTransition = isMoving
    ? 'none'
    : 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Basketball Rendering
  if (token.type === 'ball') {
    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          left: `${token.x}%`,
          top: `${token.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: tokenTransition,
        }}
        className={`absolute z-30 cursor-grab active:cursor-grabbing touch-none-board touch-none select-none ${
          isDrawingMode ? 'pointer-events-none opacity-60' : ''
        }`}
        title="Balón Oficial (Arrastrable)"
      >
        <div
          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 border-2 border-amber-300 shadow-amber-glow flex items-center justify-center transform transition-transform duration-150 ${
            isPressing || isDragging ? 'scale-110 ring-4 ring-orange-400/40' : 'hover:scale-110'
          }`}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            {/* Basketball Seams */}
            <div className="absolute inset-0 border border-slate-900/60 rounded-full" />
            <div className="absolute w-full h-0.5 bg-slate-950/70" />
            <div className="absolute h-full w-0.5 bg-slate-950/70" />
            <div className="text-xs sm:text-sm select-none">🏀</div>
          </div>
        </div>
      </div>
    );
  }

  // Cuervos Player Rendering
  if (token.type === 'cuervos') {
    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          left: `${token.x}%`,
          top: `${token.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: tokenTransition,
        }}
        className={`absolute z-20 cursor-grab active:cursor-grabbing touch-none-board touch-none select-none ${
          isDrawingMode ? 'pointer-events-none opacity-65' : ''
        }`}
      >
        {/* Float Rule Indicator Wave */}
        {isFloating && (
          <div className="absolute -inset-2 rounded-full border border-emerald-400/60 bg-emerald-500/10 animate-ping pointer-events-none" />
        )}

        <div
          className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-cuervos-elevated to-cuervos-dark border-2 sm:border-[2.5px] border-cuervos-orange shadow-orange-glow flex flex-col items-center justify-center transform transition-transform duration-150 ${
            isPressing || isDragging
              ? 'scale-110 z-40 ring-4 ring-cuervos-orange/50 shadow-orange-glow-lg'
              : 'hover:scale-105'
          } ${isFloating ? 'ring-2 ring-emerald-400' : ''}`}
        >
          {/* Dorsal Number */}
          <span className="text-white font-black text-xs sm:text-base leading-none font-mono">
            {token.number ?? '#'}
          </span>

          {/* Name / Short Label */}
          <span className="text-cuervos-orange font-bold text-[8px] sm:text-[10px] tracking-tight leading-none mt-0.5">
            {token.label}
          </span>

          {/* Fouls Dots */}
          {renderFoulDots(token.fouls ?? 0)}
        </div>

        {/* Role Pill */}
        {token.role && (
          <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 sm:px-1.5 py-0.2 rounded bg-cuervos-950/90 text-slate-300 text-[8px] sm:text-[9px] font-medium border border-cuervos-border pointer-events-none shadow">
            {token.role.split(' ')[0]}
          </div>
        )}
      </div>
    );
  }

  // Opponent Rendering
  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={() => onDoubleTapOpponent && onDoubleTapOpponent(token.id)}
      style={{
        left: `${token.x}%`,
        top: `${token.y}%`,
        transform: 'translate(-50%, -50%)',
        transition: tokenTransition,
      }}
      className={`absolute z-20 cursor-grab active:cursor-grabbing touch-none-board touch-none select-none ${
        isDrawingMode ? 'pointer-events-none opacity-65' : ''
      }`}
      title="Toca dos veces para cambiar etiqueta (Tirador Letal / Flotar / Poste)"
    >
      <div
        className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-red-600 via-cuervos-red-dark to-red-950 border-2 sm:border-[2.5px] border-red-400 shadow-red-glow flex flex-col items-center justify-center transform transition-transform duration-150 ${
          isPressing || isDragging
            ? 'scale-110 z-40 ring-4 ring-red-400/50 shadow-red-glow'
            : 'hover:scale-105'
        }`}
      >
        <span className="text-white font-black text-xs sm:text-base leading-none font-mono">
          {token.label}
        </span>
      </div>

      {/* Opponent Tactical Badge (Tirador Letal / Flotar / Poste Rival) */}
      {renderOpponentBadge(token.badge)}
    </div>
  );
};
