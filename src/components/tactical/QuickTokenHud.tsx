import React from 'react';
import { BoardToken, Player, OpponentBadge } from '../../types';
import { X, Plus, Minus, Crosshair, EyeOff, Shield } from 'lucide-react';

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

const OPPONENT_BADGES: { id: OpponentBadge; label: string; Icon: typeof Shield }[] = [
  { id: 'Tirador Letal', label: 'Tirador', Icon: Crosshair },
  { id: 'Flotar (No tira)', label: 'Flotar', Icon: EyeOff },
  { id: 'Poste Rival', label: 'Poste', Icon: Shield },
];

const hudShell =
  'absolute top-3 left-1/2 -translate-x-1/2 z-40 glass rounded-2xl p-3 shadow-float w-[94%] max-w-xl';

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

  // Cuervos player HUD
  if (token.type === 'cuervos') {
    const linkedPlayer = players.find((p) => p.id === token.playerId) ||
      players.find((p) => p.dorsal === token.number);

    // Available bench players (present, not on court)
    const onCourtPlayerIds = new Set(tokens.filter((t) => t.type === 'cuervos' && t.playerId).map((t) => t.playerId));
    const benchCandidates = players.filter((p) => p.asistencia === 'presente' && !onCourtPlayerIds.has(p.id));

    const fouls = linkedPlayer ? linkedPlayer.faltasEnVivo : (token.fouls ?? 0);
    const fatigue = linkedPlayer ? linkedPlayer.fatiga : 0;

    return (
      <div className={hudShell}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-cuervos-black border-2 border-cuervos-orange flex items-center justify-center font-display font-bold tabular-nums text-lg text-cuervos-chalk">
              {linkedPlayer ? linkedPlayer.dorsal : token.number}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-cuervos-chalk text-sm leading-tight truncate">
                {linkedPlayer ? linkedPlayer.nombre : token.label}
              </h4>
              <span className="text-xs text-slate-400 truncate block">{token.role || linkedPlayer?.rolPrimario}</span>
            </div>
          </div>

          <button type="button" onClick={onClose} className="icon-btn -mr-1" aria-label="Cerrar panel" title="Cerrar panel">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Fouls stepper */}
          <div className="rounded-xl bg-cuervos-black/60 border border-white/10 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="eyebrow">Faltas</span>
              <span
                className={`font-display font-bold tabular-nums text-sm leading-none ${
                  fouls >= 4 ? 'text-cuervos-orange' : 'text-cuervos-chalk'
                }`}
              >
                {fouls}/5
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => linkedPlayer && onDecrementFouls(linkedPlayer.id)}
                disabled={!linkedPlayer || linkedPlayer.faltasEnVivo <= 0}
                className="btn-secondary w-10 h-10 min-h-0 px-0 disabled:opacity-30"
                aria-label="Restar falta"
              >
                <Minus className="w-4 h-4" strokeWidth={2.25} />
              </button>
              <div className="flex items-center gap-1" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`w-1.5 h-1.5 rounded-full ${
                      n <= fouls ? (n >= 4 ? 'bg-cuervos-orange' : 'bg-cuervos-chalk') : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => linkedPlayer && onIncrementFouls(linkedPlayer.id)}
                disabled={!linkedPlayer || linkedPlayer.faltasEnVivo >= 5}
                className="btn-secondary w-10 h-10 min-h-0 px-0 disabled:opacity-30"
                aria-label="Sumar falta"
              >
                <Plus className="w-4 h-4" strokeWidth={2.25} />
              </button>
            </div>
          </div>

          {/* Fatigue slider */}
          <div className="rounded-xl bg-cuervos-black/60 border border-white/10 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="eyebrow">Fatiga</span>
              <span
                className={`font-display font-bold tabular-nums text-sm leading-none ${
                  fatigue >= 75 ? 'text-cuervos-orange' : 'text-cuervos-chalk'
                }`}
              >
                {fatigue}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={fatigue}
              onChange={(e) => linkedPlayer && onSetFatigue(linkedPlayer.id, Number(e.target.value))}
              className="w-full h-10 accent-cuervos-orange"
              aria-label="Fatiga"
            />
          </div>

          {/* Quick bench substitution */}
          <div className="col-span-2 sm:col-span-1 rounded-xl bg-cuervos-black/60 border border-white/10 p-2.5">
            <span className="eyebrow block mb-1.5">Sustituir</span>
            {benchCandidates.length > 0 ? (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onSubstitute(token.id, e.target.value);
                    onClose();
                  }
                }}
                defaultValue=""
                className="field min-h-[40px] py-2 text-[13px]"
              >
                <option value="" disabled>Elegir suplente…</option>
                {benchCandidates.map((bench) => (
                  <option key={bench.id} value={bench.id}>
                    #{bench.dorsal} {bench.nombre.split(' ')[0]} ({bench.rolPrimario.split(' ')[0]})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-500">Sin suplentes disponibles</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Opponent HUD
  if (token.type === 'opponent') {
    return (
      <div className={`${hudShell} max-w-md`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center font-display font-black text-sm text-slate-950">
              {token.label}
            </div>
            <div>
              <h4 className="font-semibold text-cuervos-chalk text-sm leading-tight">Rival {token.label}</h4>
              <span className="text-xs text-slate-400">Etiqueta de scouting</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-1" aria-label="Cerrar panel">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="seg">
          {OPPONENT_BADGES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={token.badge === id}
              onClick={() => {
                onSelectOpponentBadge(token.id, id);
                onClose();
              }}
              className="seg-item"
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {token.badge && (
          <button
            type="button"
            onClick={() => {
              onSelectOpponentBadge(token.id, null);
              onClose();
            }}
            className="btn-ghost w-full mt-2 min-h-[36px] text-xs"
          >
            Quitar etiqueta
          </button>
        )}
      </div>
    );
  }

  return null;
};
