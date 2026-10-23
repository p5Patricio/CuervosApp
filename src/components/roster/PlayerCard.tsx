import React from 'react';
import { Player } from '../../types';
import { 
  UserCheck, 
  UserX, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Battery, 
  Zap, 
  Edit2,
  Trash2
} from 'lucide-react';

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

  return (
    <div
      className={`relative bg-cuervos-card border rounded-2xl p-4 transition-all shadow-card ${
        isAbsent
          ? 'opacity-60 border-slate-700 bg-cuervos-dark/60'
          : isFouledOut
          ? 'border-red-600/80 bg-red-950/20'
          : hasCriticalFouls
          ? 'border-amber-500/70 bg-amber-950/15'
          : 'border-cuervos-border/70 hover:border-cuervos-cyan/60'
      }`}
    >
      {/* Sole Tall Player Badge */}
      {isSoleTallPlayer && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-cuervos-cyan text-cuervos-950 font-black text-[10px] tracking-wider uppercase shadow-cyan-glow flex items-center gap-1">
          <Zap className="w-3 h-3 fill-current" />
          <span>Único Poste Alto (1.96m)</span>
        </div>
      )}

      {/* Header: Dorsal, Name, Role, Attendance Toggle */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Dorsal Circle */}
          <div
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black font-mono shadow-md border ${
              isSoleTallPlayer
                ? 'bg-cuervos-elevated border-cuervos-cyan text-cuervos-cyan shadow-cyan-glow'
                : 'bg-cuervos-elevated border-cuervos-border text-white'
            }`}
          >
            <span className="text-xs text-slate-400 font-sans leading-none">#</span>
            <span className="text-xl leading-none">{player.dorsal}</span>
          </div>

          <div>
            <h4 className="font-bold text-white text-base leading-tight flex items-center gap-2">
              <span>{player.nombre}</span>
              {player.esTitular && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Titular
                </span>
              )}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-xs font-semibold text-cuervos-cyan">{player.rolPrimario}</span>
              <span className="text-[11px] text-slate-400">• {player.estatura} cm</span>
            </div>
          </div>
        </div>

        {/* Attendance Toggle Button */}
        <button
          onClick={() => onToggleAttendance(player.id)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
            !isAbsent
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
              : 'bg-red-950/70 text-red-300 border-red-500/40 hover:bg-red-900/80'
          }`}
          title="Alternar presencia en el partido de hoy"
        >
          {!isAbsent ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Presente</span>
            </>
          ) : (
            <>
              <UserX className="w-3.5 h-3.5" />
              <span>Ausente</span>
            </>
          )}
        </button>
      </div>

      {/* Live Match Status: Fouls (0 to 5) & Fatigue Meter */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-cuervos-border/50">
        {/* Fouls Stepper */}
        <div className="bg-cuervos-dark/70 rounded-xl p-2.5 border border-cuervos-border/50">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-400 flex items-center gap-1">
              <AlertTriangle className={`w-3.5 h-3.5 ${hasCriticalFouls ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Faltas Hoy:</span>
            </span>
            <span
              className={`font-black font-mono text-sm ${
                isFouledOut ? 'text-red-500 animate-pulse' : hasCriticalFouls ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {player.faltasEnVivo} / 5
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <button
              onClick={() => onDecrementFouls(player.id)}
              disabled={player.faltasEnVivo === 0}
              className="p-1 rounded bg-cuervos-elevated hover:bg-cuervos-border text-slate-300 disabled:opacity-30"
              title="Restar falta"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`w-2.5 h-2.5 rounded-full ${
                    n <= player.faltasEnVivo
                      ? n === 5
                        ? 'bg-red-500 shadow-red-glow'
                        : n === 4
                        ? 'bg-amber-400 shadow-amber-glow'
                        : 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => onIncrementFouls(player.id)}
              disabled={player.faltasEnVivo >= 5}
              className="p-1 rounded bg-cuervos-elevated hover:bg-cuervos-border text-slate-300 disabled:opacity-30"
              title="Sumar falta cometida"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Fatigue Slider */}
        <div className="bg-cuervos-dark/70 rounded-xl p-2.5 border border-cuervos-border/50">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-400 flex items-center gap-1">
              <Battery className={`w-3.5 h-3.5 ${isHighFatigue ? 'text-red-400' : 'text-cuervos-cyan'}`} />
              <span>Fatiga en vivo:</span>
            </span>
            <span
              className={`font-black font-mono text-xs ${
                isHighFatigue ? 'text-red-400' : 'text-slate-200'
              }`}
            >
              {player.fatiga}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={player.fatiga}
            onChange={(e) => onSetFatigue(player.id, Number(e.target.value))}
            className="w-full accent-cuervos-cyan cursor-pointer bg-cuervos-border h-1.5 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
            <span>Fresco</span>
            <span>Cansado</span>
            <span>Agotado</span>
          </div>
        </div>
      </div>

      {/* Attributes Bar Grid (1 - 10) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-cuervos-border/40 text-xs">
        {/* Velocidad */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span className="text-slate-400">Velocidad</span>
            <span className="font-mono font-bold text-cuervos-cyan">{player.atributos.velocidad}/10</span>
          </div>
          <div className="w-full bg-cuervos-dark h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cuervos-cyan h-full rounded-full transition-all"
              style={{ width: `${player.atributos.velocidad * 10}%` }}
            />
          </div>
        </div>

        {/* Resistencia */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span className="text-slate-400">Resistencia</span>
            <span className="font-mono font-bold text-indigo-400">{player.atributos.resistencia}/10</span>
          </div>
          <div className="w-full bg-cuervos-dark h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${player.atributos.resistencia * 10}%` }}
            />
          </div>
        </div>

        {/* Defensa Interior / Rebote */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span className="text-slate-400">Defensa Interior / Reb</span>
            <span className="font-mono font-bold text-amber-400">
              {player.atributos.defensaInteriorRebote}/10
            </span>
          </div>
          <div className="w-full bg-cuervos-dark h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{ width: `${player.atributos.defensaInteriorRebote * 10}%` }}
            />
          </div>
        </div>

        {/* Defensa Exterior / Robo */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span className="text-slate-400">Defensa Exterior / Robo</span>
            <span className="font-mono font-bold text-emerald-400">
              {player.atributos.defensaExteriorRobo}/10
            </span>
          </div>
          <div className="w-full bg-cuervos-dark h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${player.atributos.defensaExteriorRobo * 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Edit / Delete */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-cuervos-border/30">
        <span className="text-[11px] text-slate-500">
          Estado: {player.enBanca ? '🛋️ En Banca' : '⚡ En Cancha'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(player)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-cuervos-elevated"
            title="Editar atributos"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(player.id)}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            title="Eliminar de la plantilla"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
