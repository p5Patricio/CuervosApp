import React, { useState } from 'react';
import { PlaySequence } from '../../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Shield, 
  Info, 
  Plus, 
  Trash2,
  Sparkles
} from 'lucide-react';

interface PlaySimulationBarProps {
  sequences: PlaySequence[];
  activeSequenceId: string | null;
  activeSequenceFrameIndex: number;
  isPlaying: boolean;
  simulationSpeed: number;
  onSelectSequence: (id: string) => void;
  onSelectFrame: (sequenceId: string, frameIndex: number) => void;
  onTogglePlay: (playing: boolean) => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
  onCreateSequence?: (name: string, tipo: 'defensiva' | 'ofensiva') => void;
  onDeleteSequence?: (id: string) => void;
}

export const PlaySimulationBar: React.FC<PlaySimulationBarProps> = ({
  sequences,
  activeSequenceId,
  activeSequenceFrameIndex,
  isPlaying,
  simulationSpeed,
  onSelectSequence,
  onSelectFrame,
  onTogglePlay,
  onReset,
  onSetSpeed,
  onCreateSequence,
  onDeleteSequence,
}) => {
  const [showTacticalInfo, setShowTacticalInfo] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPlayName, setNewPlayName] = useState('');
  const [newPlayType, setNewPlayType] = useState<'ofensiva' | 'defensiva'>('ofensiva');

  const currentSequence =
    sequences.find((s) => s.id === activeSequenceId) || sequences[0] || null;

  const currentFrame = currentSequence?.frames[activeSequenceFrameIndex] || null;

  const speeds = [0.5, 1.0, 1.5, 2.0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayName.trim() || !onCreateSequence) return;
    onCreateSequence(newPlayName.trim(), newPlayType);
    setNewPlayName('');
    setShowNewModal(false);
  };

  if (!currentSequence) return null;

  return (
    <div className="bg-cuervos-dark/95 backdrop-blur-md border border-cuervos-border/80 rounded-2xl p-2 sm:p-3 shadow-2xl space-y-2 select-none">
      {/* Top Header Row: Play Selector, Sequence Type Badge & Info Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        {/* Play Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg bg-cuervos-elevated border border-cuervos-border text-[11px] font-bold text-slate-300">
            {currentSequence.tipo === 'ofensiva' ? (
              <span className="flex items-center gap-1 text-cuervos-orange">
                <Zap className="w-3.5 h-3.5 fill-cuervos-orange" />
                <span className="hidden xs:inline">Ofensiva</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-cyan-400">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Defensiva</span>
              </span>
            )}
          </div>

          <select
            value={currentSequence.id}
            onChange={(e) => {
              onTogglePlay(false);
              onSelectSequence(e.target.value);
            }}
            className="bg-cuervos-elevated text-white text-xs sm:text-sm font-extrabold px-2.5 py-1 sm:py-1.5 rounded-xl border border-cuervos-border focus:border-cuervos-orange focus:ring-1 focus:ring-cuervos-orange/50 focus:outline-none transition-all truncate max-w-[200px] sm:max-w-xs"
          >
            {sequences.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tipo === 'ofensiva' ? '⚡' : '🛡️'} {s.nombre} ({s.frames.length} pasos)
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions (Info toggle & Add new play) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setShowTacticalInfo(!showTacticalInfo)}
            className={`p-1 sm:p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              showTacticalInfo
                ? 'bg-cuervos-orange/20 text-cuervos-orange border border-cuervos-orange/40'
                : 'bg-cuervos-elevated text-slate-400 hover:text-white border border-cuervos-border'
            }`}
            title="Mostrar/Ocultar explicaciones tácticas"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Instrucción</span>
            {showTacticalInfo ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {onCreateSequence && (
            <button
              onClick={() => setShowNewModal(true)}
              className="p-1 sm:p-1.5 rounded-lg bg-cuervos-elevated text-slate-300 hover:text-white border border-cuervos-border flex items-center gap-1 text-xs font-semibold"
              title="Crear nueva jugada personalizada"
            >
              <Plus className="w-3.5 h-3.5 text-cuervos-orange" />
              <span className="hidden lg:inline">Nueva</span>
            </button>
          )}

          {onDeleteSequence && sequences.length > 5 && !currentSequence.id.startsWith('play-') && (
            <button
              onClick={() => onDeleteSequence(currentSequence.id)}
              className="p-1 sm:p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/40"
              title="Eliminar jugada"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Controls: Play/Pause, Reset, Scrubber Steps & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 bg-cuervos-elevated/70 p-1.5 sm:p-2 rounded-xl border border-cuervos-border/60">
        {/* Play / Pause / Reset Cluster */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => onTogglePlay(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-cuervos-950 shadow-amber-glow animate-pulse'
                : 'bg-cuervos-orange text-white shadow-orange-glow hover:bg-cuervos-orange-hover'
            }`}
            title={isPlaying ? 'Pausar Simulación (Espacio)' : 'Reproducir Simulación (Espacio)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-cuervos-950" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Simular</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="p-1.5 sm:p-2 rounded-xl bg-cuervos-dark text-slate-300 hover:text-white hover:bg-cuervos-border border border-cuervos-border/70 transition-all active:scale-95"
            title="Reiniciar al Paso 1"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Step Indicator Pills / Scrubber */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-[140px] justify-start sm:justify-center">
          {currentSequence.frames.map((frame, idx) => {
            const isActive = activeSequenceFrameIndex === idx;
            return (
              <button
                key={frame.id}
                onClick={() => {
                  onTogglePlay(false);
                  onSelectFrame(currentSequence.id, idx);
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-cuervos-orange text-white shadow-orange-glow scale-105 border border-amber-300/60'
                    : 'bg-cuervos-dark text-slate-400 hover:text-white hover:bg-cuervos-border border border-cuervos-border/40'
                }`}
              >
                <span>Paso {idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Speed Multiplier Segmented Selector */}
        <div className="flex items-center gap-0.5 bg-cuervos-dark p-0.5 rounded-lg border border-cuervos-border shrink-0">
          <div className="px-1 text-slate-400" title="Velocidad de reproducción">
            <Gauge className="w-3 h-3" />
          </div>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-all ${
                simulationSpeed === s
                  ? 'bg-cuervos-orange text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Tactical Explanation & Coach Guidance Banner */}
      {showTacticalInfo && currentFrame && (
        <div className="bg-cuervos-elevated/60 border border-cuervos-orange/30 rounded-xl p-2 sm:p-2.5 animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cuervos-orange shrink-0" />
                <h4 className="text-xs sm:text-sm font-black text-white tracking-wide">
                  {currentFrame.nombre}
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">
                {currentFrame.descripcion || currentSequence.descripcion}
              </p>
            </div>
          </div>

          {/* Key Bullet Tips for the Play */}
          {currentSequence.puntosClave && currentSequence.puntosClave.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-cuervos-border/40 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
              <span className="font-bold text-amber-400">Regla clave:</span>
              <span>{currentSequence.puntosClave[activeSequenceFrameIndex % currentSequence.puntosClave.length]}</span>
            </div>
          )}
        </div>
      )}

      {/* New Play Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cuervos-dark border border-cuervos-border rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-black text-white text-base">Crear Nueva Jugada</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre de la jugada</label>
                <input
                  type="text"
                  value={newPlayName}
                  onChange={(e) => setNewPlayName(e.target.value)}
                  placeholder="Ej: Salida de Fondo Cuervos"
                  className="w-full bg-cuervos-elevated text-white px-3 py-2 rounded-xl border border-cuervos-border focus:border-cuervos-orange focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de jugada</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPlayType('ofensiva')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newPlayType === 'ofensiva'
                        ? 'bg-cuervos-orange text-white border-cuervos-orange'
                        : 'bg-cuervos-elevated text-slate-400 border-cuervos-border'
                    }`}
                  >
                    ⚡ Ofensiva
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlayType('defensiva')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newPlayType === 'defensiva'
                        ? 'bg-cyan-600 text-white border-cyan-500'
                        : 'bg-cuervos-elevated text-slate-400 border-cuervos-border'
                    }`}
                  >
                    🛡️ Defensiva
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-cuervos-elevated text-slate-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newPlayName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-cuervos-orange text-white text-xs font-black shadow-orange-glow disabled:opacity-40"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
