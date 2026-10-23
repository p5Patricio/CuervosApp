import React, { useRef, useState } from 'react';
import { BoardToken, OpponentBadge } from '../../types';
import { Shield, Flame, EyeOff } from 'lucide-react';

interface BoardTokenItemProps {
  token: BoardToken;
  isDragging: boolean;
  isDrawingMode: boolean;
  onDragStart: (id: string, clientX: number, clientY: number) => void;
  onDoubleTapOpponent?: (id: string) => void;
  isFloating?: boolean;
}

export const BoardTokenItem: React.FC<BoardTokenItemProps> = ({
  token,
  isDragging,
  isDrawingMode,
  onDragStart,
  onDoubleTapOpponent,
  isFloating = false,
}) => {
  const lastTapRef = useRef<number>(0);
  const [isPressing, setIsPressing] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDrawingMode) return;
    e.stopPropagation();

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

    setIsPressing(true);
    onDragStart(token.id, e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsPressing(false);
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
        className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] tracking-tight flex items-center gap-1 border shadow-lg pointer-events-none z-30 ${bgClass}`}
      >
        <Icon className="w-2.5 h-2.5 shrink-0" />
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

  // Basketball Rendering
  if (token.type === 'ball') {
    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
          left: `${token.x}%`,
          top: `${token.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: isDragging ? 'none' : 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={`absolute z-30 cursor-grab active:cursor-grabbing touch-none-board select-none ${
          isDrawingMode ? 'pointer-events-none opacity-60' : ''
        }`}
        title="Balón Oficial (Arrastrable)"
      >
        <div
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 border-2 border-amber-300 shadow-amber-glow flex items-center justify-center transform transition-transform ${
            isPressing || isDragging ? 'scale-125 ring-4 ring-orange-400/40' : 'hover:scale-110'
          }`}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            {/* Basketball Seams */}
            <div className="absolute inset-0 border border-slate-900/60 rounded-full" />
            <div className="absolute w-full h-0.5 bg-slate-950/70" />
            <div className="absolute h-full w-0.5 bg-slate-950/70" />
            <div className="text-sm select-none">🏀</div>
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
        onPointerUp={handlePointerUp}
        style={{
          left: `${token.x}%`,
          top: `${token.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: isDragging ? 'none' : 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={`absolute z-20 cursor-grab active:cursor-grabbing touch-none-board select-none ${
          isDrawingMode ? 'pointer-events-none opacity-65' : ''
        }`}
      >
        {/* Float Rule Indicator Wave */}
        {isFloating && (
          <div className="absolute -inset-2 rounded-full border border-emerald-400/60 bg-emerald-500/10 animate-ping pointer-events-none" />
        )}

        <div
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-cuervos-elevated to-cuervos-dark border-2 sm:border-[2.5px] border-cuervos-cyan shadow-cyan-glow flex flex-col items-center justify-center transform transition-all ${
            isPressing || isDragging
              ? 'scale-125 z-40 ring-4 ring-cuervos-cyan/50 shadow-cyan-glow-lg'
              : 'hover:scale-105'
          } ${isFloating ? 'ring-2 ring-emerald-400' : ''}`}
        >
          {/* Dorsal Number */}
          <span className="text-white font-black text-sm sm:text-base leading-none font-mono">
            {token.number ?? '#'}
          </span>

          {/* Name / Short Label */}
          <span className="text-cuervos-cyan font-bold text-[9px] sm:text-[10px] tracking-tight leading-none mt-0.5">
            {token.label}
          </span>

          {/* Fouls Dots */}
          {renderFoulDots(token.fouls ?? 0)}
        </div>

        {/* Role Pill */}
        {token.role && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 rounded bg-cuervos-950/90 text-slate-300 text-[9px] font-medium border border-cuervos-border pointer-events-none shadow">
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
      onPointerUp={handlePointerUp}
      onDoubleClick={() => onDoubleTapOpponent && onDoubleTapOpponent(token.id)}
      style={{
        left: `${token.x}%`,
        top: `${token.y}%`,
        transform: 'translate(-50%, -50%)',
        transition: isDragging ? 'none' : 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={`absolute z-20 cursor-grab active:cursor-grabbing touch-none-board select-none ${
        isDrawingMode ? 'pointer-events-none opacity-65' : ''
      }`}
      title="Toca dos veces para cambiar etiqueta (Tirador Letal / Flotar / Poste)"
    >
      <div
        className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-red-600 via-cuervos-red-dark to-red-950 border-2 sm:border-[2.5px] border-red-400 shadow-red-glow flex flex-col items-center justify-center transform transition-all ${
          isPressing || isDragging
            ? 'scale-125 z-40 ring-4 ring-red-400/50 shadow-red-glow'
            : 'hover:scale-105'
        }`}
      >
        <span className="text-white font-black text-sm sm:text-base leading-none font-mono">
          {token.label}
        </span>
      </div>

      {/* Opponent Tactical Badge (Tirador Letal / Flotar / Poste Rival) */}
      {renderOpponentBadge(token.badge)}
    </div>
  );
};
