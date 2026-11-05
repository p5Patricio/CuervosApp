import React from 'react';
import { Player } from '../../types';
import { Plus, Minus, Edit2, Trash2, Check } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onToggleAttendance: (id: string) => void;
  onIncrementFouls: (id: string) => void;
  onDecrementFouls: (id: string) => void;
  onSetFatigue: (id: string, fatigue: number) => void;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  isSoleTallPlayer?: boolean;
}

// Attribute rows share one neutral bar style
const AttributeBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between items-baseline text-xs mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-display font-bold tabular-nums text-[13px] text-cuervos-chalk">{value}</span>
    </div>
    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
      <div className="bg-slate-300 h-full rounded-full" style={{ width: `${value * 10}%` }} />
    </div>
  </div>
);

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onToggleAttendance,
  onIncrementFouls,
  onDecrementFouls,
  onSetFatigue,
  onEdit,
  onDelete,
  isSoleTallPlayer = false,
}) => {
  const isAbsent = player.asistencia === 'ausente';
  const hasCriticalFouls = player.faltasEnVivo >= 4;
  const isFouledOut = player.faltasEnVivo >= 5;
  const isHighFatigue = player.fatiga >= 75;

  const fatigueLabel = player.fatiga >= 75 ? 'Agotado' : player.fatiga >= 40 ? 'Cansado' : 'Fresco';

  return (
    <article
      className={`surface-raised p-4 transition-opacity ${isAbsent ? 'opacity-55' : ''} ${
        hasCriticalFouls && !isAbsent ? 'border-cuervos-orange/50' : ''
      }`}
    >
      {/* Header: dorsal, name, role, attendance */}
      <div className="flex items-start gap-3">
        {/* Dorsal disc mirrors the board token */}
        <div className="w-12 h-12 shrink-0 rounded-full bg-cuervos-black border-2 border-cuervos-orange flex items-center justify-center">
          <span className="font-display font-bold tabular-nums text-xl leading-none text-cuervos-chalk">
            {player.dorsal}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-cuervos-chalk text-base leading-tight truncate">{player.nombre}</h4>
          <p className="mt-0.5 text-[13px] text-slate-400 truncate">
            {player.rolPrimario} · {player.estatura} cm
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={player.esTitular ? 'chip-accent' : 'chip'}>{player.esTitular ? 'Titular' : 'Banca'}</span>
            {isSoleTallPlayer && <span className="chip">Poste alto</span>}
          </div>
        </div>

        {/* Attendance switch */}
        <button
          type="button"
          role="switch"
          aria-checked={!isAbsent}
          onClick={() => onToggleAttendance(player.id)}
          className="shrink-0 flex flex-col items-center gap-1 min-w-[44px] -mr-1"
          title="Alternar presencia en el partido de hoy"
        >
          <span
            className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
              isAbsent ? 'bg-white/10' : 'bg-cuervos-orange'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center transition-transform ${
                isAbsent ? '' : 'translate-x-5'
              }`}
            >
              {!isAbsent && <Check className="w-3 h-3 text-cuervos-orange" strokeWidth={3} />}
            </span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400">{isAbsent ? 'Ausente' : 'Presente'}</span>
        </button>
      </div>

      {/* Live status: fouls stepper and fatigue */}
      <div className="mt-4 grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
        {/* Fouls stepper */}
        <div className="rounded-xl bg-cuervos-black/60 border border-white/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow">Faltas</span>
            <span
              className={`font-display font-bold tabular-nums text-base leading-none ${
                hasCriticalFouls ? 'text-cuervos-orange' : 'text-cuervos-chalk'
              }`}
            >
              {player.faltasEnVivo}/5{isFouledOut ? ' · Fuera' : ''}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onDecrementFouls(player.id)}
              disabled={player.faltasEnVivo === 0}
              className="btn-secondary w-10 h-10 min-h-0 px-0 disabled:opacity-30"
              aria-label="Restar falta"
            >
              <Minus className="w-4 h-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`w-2 h-2 rounded-full ${
                    n <= player.faltasEnVivo ? (n >= 4 ? 'bg-cuervos-orange' : 'bg-cuervos-chalk') : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => onIncrementFouls(player.id)}
              disabled={player.faltasEnVivo >= 5}
              className="btn-secondary w-10 h-10 min-h-0 px-0 disabled:opacity-30"
              aria-label="Sumar falta"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* Fatigue */}
        <div className="rounded-xl bg-cuervos-black/60 border border-white/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow">Fatiga</span>
            <span className="text-xs text-slate-400">
              <span className={`font-display font-bold tabular-nums text-base leading-none ${isHighFatigue ? 'text-cuervos-orange' : 'text-cuervos-chalk'}`}>
                {player.fatiga}%
              </span>{' '}
              {fatigueLabel}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={player.fatiga}
            onChange={(e) => onSetFatigue(player.id, Number(e.target.value))}
            className="w-full h-10 accent-cuervos-orange cursor-pointer"
            aria-label={`Fatiga de ${player.nombre}`}
          />
        </div>
      </div>

      {/* Attributes (1-10) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4">
        <AttributeBar label="Velocidad" value={player.atributos.velocidad} />
        <AttributeBar label="Resistencia" value={player.atributos.resistencia} />
        <AttributeBar label="Def. interior" value={player.atributos.defensaInteriorRebote} />
        <AttributeBar label="Def. exterior" value={player.atributos.defensaExteriorRobo} />
      </div>

      {/* Footer: court status, edit, delete */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${player.enBanca ? 'bg-slate-500' : 'bg-cuervos-orange'}`} />
          {player.enBanca ? 'En banca' : 'En cancha'}
        </span>

        <div className="flex items-center -mr-2">
          <button
            type="button"
            onClick={() => onEdit(player)}
            className="icon-btn"
            aria-label="Editar jugador"
            title="Editar atributos"
          >
            <Edit2 className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(player.id)}
            className="icon-btn-danger"
            aria-label="Eliminar jugador"
            title="Eliminar de la plantilla"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
};
