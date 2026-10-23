import React from 'react';
import { BoardToken, Player, OpponentBadge } from '../../types';
import { 
  X, 
  Plus, 
  Minus, 
  Battery, 
  Flame, 
  EyeOff, 
  Shield, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface QuickTokenHudProps {
  token: BoardToken | null;
  players: Player[];
  tokens: BoardToken[];
  onClose: () => void;
  onIncrementFouls: (playerId: string) => void;
  onDecrementFouls: (playerId: string) => void;
  onSetFatigue: (playerId: string, fatigue: number) => void;
  onSubstitute: (courtTokenId: string, benchPlayerId: string) => void;
  onSelectOpponentBadge: (tokenId: string, badge: OpponentBadge | null) => void;
}

export const QuickTokenHud: React.FC<QuickTokenHudProps> = ({
  token,
  players,
  tokens,
  onClose,
  onIncrementFouls,
  onDecrementFouls,
  onSetFatigue,
  onSubstitute,
  onSelectOpponentBadge,
}) => {
  if (!token) return null;

  // Cuervos Player HUD
  if (token.type === 'cuervos') {
    const linkedPlayer = players.find((p) => p.id === token.playerId) ||
      players.find((p) => p.dorsal === token.number);

    // Available bench players (present, not on court)
    const onCourtPlayerIds = new Set(tokens.filter((t) => t.type === 'cuervos' && t.playerId).map((t) => t.playerId));
    const benchCandidates = players.filter((p) => p.asistencia === 'presente' && !onCourtPlayerIds.has(p.id));

    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-cuervos-dark/95 backdrop-blur-md border border-cuervos-cyan/80 rounded-2xl p-3 shadow-cyan-glow-lg w-[94%] max-w-xl animate-in slide-in-from-top duration-200">
        <div className="flex items-center justify-between border-b border-cuervos-border/60 pb-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cuervos-elevated border border-cuervos-cyan text-cuervos-cyan flex items-center justify-center font-black font-mono shadow-sm">
              #{linkedPlayer ? linkedPlayer.dorsal : token.number}
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>{linkedPlayer ? linkedPlayer.nombre : token.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cuervos-elevated text-cuervos-cyan border border-cuervos-cyan/30">
                  {token.role || linkedPlayer?.rolPrimario}
                </span>
              </h4>
              <span className="text-[11px] text-slate-400">Control rápido en cancha (Fullscreen)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cuervos-elevated"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Fouls Stepper */}
          <div className="bg-cuervos-card/80 p-2 rounded-xl border border-cuervos-border/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Faltas:</span>
              </span>
              <span className={`font-mono font-black ${((linkedPlayer?.faltasEnVivo ?? token.fouls ?? 0) >= 4) ? 'text-red-400' : 'text-white'}`}>
                {linkedPlayer ? linkedPlayer.faltasEnVivo : (token.fouls ?? 0)} / 5
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => linkedPlayer && onDecrementFouls(linkedPlayer.id)}
                disabled={!linkedPlayer || linkedPlayer.faltasEnVivo <= 0}
                className="p-1 rounded bg-cuervos-elevated text-slate-300 hover:text-white disabled:opacity-30"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`w-2 h-2 rounded-full ${
                      n <= (linkedPlayer ? linkedPlayer.faltasEnVivo : (token.fouls ?? 0))
                        ? n >= 5 ? 'bg-red-500 animate-ping' : n === 4 ? 'bg-amber-400' : 'bg-emerald-400'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => linkedPlayer && onIncrementFouls(linkedPlayer.id)}
                disabled={!linkedPlayer || linkedPlayer.faltasEnVivo >= 5}
                className="p-1 rounded bg-cuervos-elevated text-slate-300 hover:text-white disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Fatigue Slider */}
          <div className="bg-cuervos-card/80 p-2 rounded-xl border border-cuervos-border/50 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-cuervos-cyan" />
                <span>Fatiga:</span>
              </span>
              <span className="font-mono font-black text-cuervos-cyan">
                {linkedPlayer ? linkedPlayer.fatiga : 0}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={linkedPlayer ? linkedPlayer.fatiga : 0}
              onChange={(e) => linkedPlayer && onSetFatigue(linkedPlayer.id, Number(e.target.value))}
              className="w-full accent-cuervos-cyan h-1.5"
            />
          </div>

          {/* Quick Bench Substitution */}
          <div className="bg-cuervos-card/80 p-2 rounded-xl border border-cuervos-border/50 flex flex-col justify-between">
            <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1 mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sustituir por Banca:</span>
            </span>
            {benchCandidates.length > 0 ? (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onSubstitute(token.id, e.target.value);
                    onClose();
                  }
                }}
                defaultValue=""
                className="w-full bg-cuervos-elevated text-white text-[11px] px-2 py-1 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
              >
                <option value="" disabled>Seleccionar suplente...</option>
                {benchCandidates.map((bench) => (
                  <option key={bench.id} value={bench.id}>
                    #{bench.dorsal} {bench.nombre.split(' ')[0]} ({bench.rolPrimario.split(' ')[0]})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[10px] text-slate-500 italic">No hay jugadores disponibles en banca</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Opponent HUD
  if (token.type === 'opponent') {
    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-cuervos-dark/95 backdrop-blur-md border border-red-500/80 rounded-2xl p-3 shadow-red-glow w-[92%] max-w-md animate-in slide-in-from-top duration-200">
        <div className="flex items-center justify-between border-b border-cuervos-border/60 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-md">
              {token.label}
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Rival {token.label}</h4>
              <span className="text-[10px] text-slate-400">Etiqueta táctica de asignación rápida</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cuervos-elevated"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              onSelectOpponentBadge(token.id, 'Tirador Letal');
              onClose();
            }}
            className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              token.badge === 'Tirador Letal'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-glow'
                : 'bg-cuervos-card border-cuervos-border text-slate-300 hover:border-amber-400'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Tirador Letal</span>
          </button>

          <button
            onClick={() => {
              onSelectOpponentBadge(token.id, 'Flotar (No tira)');
              onClose();
            }}
            className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              token.badge === 'Flotar (No tira)'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-glow'
                : 'bg-cuervos-card border-cuervos-border text-slate-300 hover:border-cyan-400'
            }`}
          >
            <EyeOff className="w-4 h-4 text-cyan-400" />
            <span>Flotar (No tira)</span>
          </button>

          <button
            onClick={() => {
              onSelectOpponentBadge(token.id, 'Poste Rival');
              onClose();
            }}
            className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              token.badge === 'Poste Rival'
                ? 'bg-red-500/20 border-red-500 text-red-300 shadow-red-glow'
                : 'bg-cuervos-card border-cuervos-border text-slate-300 hover:border-red-500'
            }`}
          >
            <Shield className="w-4 h-4 text-red-400" />
            <span>Poste Rival</span>
          </button>
        </div>

        {token.badge && (
          <button
            onClick={() => {
              onSelectOpponentBadge(token.id, null);
              onClose();
            }}
            className="w-full mt-2 py-1.5 text-center text-[10px] text-slate-400 hover:text-red-400 transition-colors"
          >
            Quitar etiqueta
          </button>
        )}
      </div>
    );
  }

  return null;
};
