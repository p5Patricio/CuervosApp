import React, { useRef, useState } from 'react';
import { BoardToken, OpponentBadge } from '../../types';
import { Shield, Crosshair, EyeOff } from 'lucide-react';

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

  // Opponent scouting tag: one neutral pill style, orange accent only for the main threat
  const renderOpponentBadge = (badge?: OpponentBadge | null) => {
    if (!badge) return null;

    let Icon = Shield;
    let accentClass = 'text-slate-300 border-white/15';

    if (badge === 'Tirador Letal') {
      Icon = Crosshair;
      accentClass = 'text-cuervos-chalk border-cuervos-orange';
    } else if (badge === 'Flotar (No tira)') {
      Icon = EyeOff;
    }

    return (
      <div
        className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-px rounded-md bg-cuervos-black/90 border text-[9px] sm:text-[10px] font-semibold leading-tight flex items-center gap-1 pointer-events-none z-30 ${accentClass}`}
      >
        <Icon className={`w-2.5 h-2.5 shrink-0 ${badge === 'Tirador Letal' ? 'text-cuervos-orange' : ''}`} strokeWidth={2} />
        <span>{badge}</span>
      </div>
    );
  };

  // Foul ticks: hidden at zero, chalk until foul trouble (4+), then orange
  const renderFoulTicks = (fouls: number = 0) => {
    if (fouls <= 0) return null;
    const inTrouble = fouls >= 4;
    return (
      <div className="flex items-center justify-center gap-[2px]" aria-label={`${fouls} faltas`}>
        {Array.from({ length: Math.min(fouls, 5) }).map((_, i) => (
          <span
            key={i}
            className={`w-[3px] h-[3px] rounded-full ${inTrouble ? 'bg-cuervos-orange' : 'bg-cuervos-chalk/80'}`}
          />
        ))}
      </div>
    );
  };

  const isMoving = isDragging || isPressing || isSimulating;
  const tokenTransition = isMoving
    ? 'none'
    : 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
  const isHeld = isPressing || isDragging;

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
        title="Balón (arrastrable)"
      >
        <div
          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-token transition-transform duration-150 ${
            isHeld ? 'scale-110' : ''
          }`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
            <circle cx="16" cy="16" r="15" fill="#ED4B00" stroke="#0A0A0C" strokeWidth="1.5" />
            <g fill="none" stroke="#0A0A0C" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 16h30" />
              <path d="M16 1v30" />
              <path d="M5.4 5.4c3.6 2.9 5.6 6.4 5.6 10.6s-2 7.7-5.6 10.6" />
              <path d="M26.6 5.4c-3.6 2.9-5.6 6.4-5.6 10.6s2 7.7 5.6 10.6" />
            </g>
          </svg>
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
        className={`absolute cursor-grab active:cursor-grabbing touch-none-board touch-none select-none ${
          isHeld ? 'z-40' : 'z-20'
        } ${isDrawingMode ? 'pointer-events-none opacity-65' : ''}`}
        title={token.role ? `${token.label} — ${token.role}` : token.label}
      >
        {/* Weak-side float rule: static dashed ring, no animation */}
        {isFloating && (
          <div className="absolute -inset-1.5 rounded-full border border-dashed border-cuervos-chalk/50 pointer-events-none" />
        )}

        <div
          className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-cuervos-black border-2 sm:border-[2.5px] border-cuervos-orange shadow-token flex items-center justify-center transition-transform duration-150 ${
            isHeld ? 'scale-110' : ''
          }`}
        >
          {/* Dorsal Number */}
          <span className="font-display text-cuervos-chalk font-bold text-[15px] sm:text-xl leading-none tabular-nums tracking-normal">
            {token.number ?? '#'}
          </span>
        </div>

        {/* Name caption + fouls */}
        <div className="absolute top-full mt-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-px pointer-events-none">
          <span className="whitespace-nowrap text-[9px] sm:text-[11px] font-semibold leading-none text-cuervos-chalk [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
            {token.label}
          </span>
          {renderFoulTicks(token.fouls ?? 0)}
        </div>
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
      className={`absolute cursor-grab active:cursor-grabbing touch-none-board touch-none select-none ${
        isHeld ? 'z-40' : 'z-20'
      } ${isDrawingMode ? 'pointer-events-none opacity-65' : ''}`}
      title="Toca dos veces para cambiar etiqueta (Tirador Letal / Flotar / Poste)"
    >
      <div
        className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-cuervos-chalk border-2 border-slate-400 shadow-token flex items-center justify-center transition-transform duration-150 ${
          isHeld ? 'scale-110' : ''
        }`}
      >
        <span className="font-display text-cuervos-black font-bold text-sm sm:text-lg leading-none tracking-normal">
          {token.label}
        </span>
      </div>

      {/* Opponent Tactical Badge (Tirador Letal / Flotar / Poste Rival) */}
      {renderOpponentBadge(token.badge)}
    </div>
  );
};
