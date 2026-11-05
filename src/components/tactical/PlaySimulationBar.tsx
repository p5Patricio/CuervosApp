import React, { useState } from 'react';
import { PlaySequence } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  Zap,
  Shield,
  Plus,
  Trash2,
  X,
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
  const [showTacticalInfo, setShowTacticalInfo] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPlayName, setNewPlayName] = useState('');
  const [newPlayType, setNewPlayType] = useState<'ofensiva' | 'defensiva'>('ofensiva');

  const currentSequence =
    sequences.find((s) => s.id === activeSequenceId) || sequences[0] || null;

  const currentFrame = currentSequence?.frames[activeSequenceFrameIndex] || null;

  const speeds = [0.5, 1.0, 1.5, 2.0];
  const nextSpeed = speeds[(speeds.indexOf(simulationSpeed) + 1) % speeds.length] ?? 1.0;
  const offensivePlays = sequences.filter((s) => s.tipo === 'ofensiva');
  const defensivePlays = sequences.filter((s) => s.tipo !== 'ofensiva');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayName.trim() || !onCreateSequence) return;
    onCreateSequence(newPlayName.trim(), newPlayType);
    setNewPlayName('');
    setShowNewModal(false);
  };

  if (!currentSequence) return null;

  const renderPlayOption = (s: PlaySequence) => (
    <option key={s.id} value={s.id}>
      {s.nombre} · {s.frames.length} pasos
    </option>
  );

  const selectFrame = (idx: number) => {
    onTogglePlay(false);
    onSelectFrame(currentSequence.id, idx);
  };

  return (
    <div className="relative select-none">
      {/* Detail sheet: floats above the dock so the court never shrinks */}
      {showTacticalInfo && (
        <div className="absolute bottom-full mb-2 inset-x-0 glass shadow-float rounded-2xl p-3 space-y-3 max-h-[46dvh] overflow-y-auto z-40">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {currentSequence.tipo === 'ofensiva' ? (
                  <Zap className="w-3 h-3 text-cuervos-orange" strokeWidth={2} />
                ) : (
                  <Shield className="w-3 h-3 text-slate-300" strokeWidth={2} />
                )}
                <span>
                  {currentSequence.tipo === 'ofensiva' ? 'Ofensiva' : 'Defensiva'} · Paso{' '}
                  {activeSequenceFrameIndex + 1}/{currentSequence.frames.length}
                </span>
              </div>
              {currentFrame && (
                <h4 className="font-display text-lg font-bold text-cuervos-chalk leading-tight mt-0.5">
                  {currentFrame.nombre}
                </h4>
              )}
            </div>
            <button
              onClick={() => setShowTacticalInfo(false)}
              className="ctl-icon -mr-1.5 -mt-1.5 shrink-0"
              aria-label="Cerrar detalles"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          </div>

          {currentFrame && (
            <p className="text-[13px] text-slate-300 leading-snug">
              {currentFrame.descripcion || currentSequence.descripcion}
            </p>
          )}

          {currentSequence.puntosClave && currentSequence.puntosClave.length > 0 && (
            <p className="text-xs text-slate-400 leading-snug border-l-2 border-cuervos-orange pl-2">
              <span className="font-semibold text-cuervos-chalk">Regla clave: </span>
              {currentSequence.puntosClave[activeSequenceFrameIndex % currentSequence.puntosClave.length]}
            </p>
          )}

          {/* Step pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {currentSequence.frames.map((frame, idx) => {
              const isActive = activeSequenceFrameIndex === idx;
              return (
                <button
                  key={frame.id}
                  onClick={() => selectFrame(idx)}
                  aria-pressed={isActive}
                  className={`h-9 px-3 rounded-lg text-xs font-semibold shrink-0 border transition-colors ${
                    isActive
                      ? 'bg-cuervos-orange border-cuervos-orange text-white'
                      : 'border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  Paso {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Speed + management actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center rounded-lg border border-white/10 p-0.5" role="group" aria-label="Velocidad">
              {speeds.map((sp) => (
                <button
                  key={sp}
                  onClick={() => onSetSpeed(sp)}
                  aria-pressed={simulationSpeed === sp}
                  className={`h-8 px-2.5 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                    simulationSpeed === sp ? 'bg-cuervos-chalk text-cuervos-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5">
              <button onClick={onReset} className="ctl-icon" title="Reiniciar al Paso 1" aria-label="Reiniciar al Paso 1">
                <RotateCcw className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
              {onCreateSequence && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="ctl-icon"
                  title="Crear nueva jugada personalizada"
                  aria-label="Nueva jugada"
                >
                  <Plus className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
              )}
              {onDeleteSequence && sequences.length > 5 && !currentSequence.id.startsWith('play-') && (
                <button
                  onClick={() => onDeleteSequence(currentSequence.id)}
                  className="ctl-icon hover:text-red-400"
                  title="Eliminar jugada"
                  aria-label="Eliminar jugada"
                >
                  <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compact dock */}
      <div className="glass shadow-float rounded-2xl px-1.5 pt-1.5 pb-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTogglePlay(!isPlaying)}
            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
              isPlaying
                ? 'bg-cuervos-chalk text-cuervos-black'
                : 'bg-cuervos-orange text-white hover:bg-cuervos-orange-hover'
            }`}
            title={isPlaying ? 'Pausar Simulación (Espacio)' : 'Reproducir Simulación (Espacio)'}
            aria-label={isPlaying ? 'Pausar simulación' : 'Reproducir simulación'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" strokeWidth={2} fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 translate-x-px" strokeWidth={2} fill="currentColor" />
            )}
          </button>

          <div className="relative flex-1 min-w-0">
            <select
              value={currentSequence.id}
              onChange={(e) => {
                onTogglePlay(false);
                onSelectSequence(e.target.value);
              }}
              aria-label="Seleccionar jugada"
              className="w-full h-11 appearance-none bg-transparent text-cuervos-chalk text-sm font-semibold pl-2 pr-6 rounded-xl truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-cuervos-orange [&>optgroup]:bg-cuervos-dark [&_option]:bg-cuervos-dark"
            >
              {offensivePlays.length > 0 && (
                <optgroup label="Ofensivas">{offensivePlays.map(renderPlayOption)}</optgroup>
              )}
              {defensivePlays.length > 0 && (
                <optgroup label="Defensivas">{defensivePlays.map(renderPlayOption)}</optgroup>
              )}
            </select>
            <ChevronUp
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-180 text-slate-500 pointer-events-none"
              strokeWidth={2}
            />
          </div>

          <button
            onClick={() => onSetSpeed(nextSpeed)}
            className="h-11 min-w-[44px] px-2 shrink-0 rounded-xl text-xs font-semibold tabular-nums text-slate-300 hover:text-white"
            title="Cambiar velocidad de reproducción"
            aria-label={`Velocidad ${simulationSpeed}x`}
          >
            {simulationSpeed}x
          </button>

          <button
            onClick={() => setShowTacticalInfo(!showTacticalInfo)}
            aria-pressed={showTacticalInfo}
            aria-expanded={showTacticalInfo}
            className="ctl-icon shrink-0"
            title="Mostrar/Ocultar explicaciones tácticas"
            aria-label="Detalles de la jugada"
          >
            <ChevronUp
              className={`w-[18px] h-[18px] transition-transform ${showTacticalInfo ? 'rotate-180' : ''}`}
              strokeWidth={1.75}
            />
          </button>
        </div>

        {/* Step track: thin segments, each a full-width tap target */}
        <div className="flex items-center gap-1 px-1" role="group" aria-label="Pasos de la jugada">
          {currentSequence.frames.map((frame, idx) => (
            <button
              key={frame.id}
              onClick={() => selectFrame(idx)}
              aria-label={`Paso ${idx + 1}`}
              aria-current={activeSequenceFrameIndex === idx ? 'step' : undefined}
              className="flex-1 h-5 flex items-center"
            >
              <span
                className={`block w-full h-[3px] rounded-full transition-colors ${
                  idx === activeSequenceFrameIndex
                    ? 'bg-cuervos-orange'
                    : idx < activeSequenceFrameIndex
                    ? 'bg-cuervos-chalk/50'
                    : 'bg-white/10'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* New Play Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cuervos-dark border border-white/10 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-cuervos-chalk text-xl uppercase tracking-wide">Nueva jugada</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label htmlFor="new-play-name" className="text-xs text-slate-400 block mb-1">
                  Nombre de la jugada
                </label>
                <input
                  id="new-play-name"
                  type="text"
                  value={newPlayName}
                  onChange={(e) => setNewPlayName(e.target.value)}
                  placeholder="Ej: Salida de Fondo Cuervos"
                  className="w-full bg-cuervos-black text-cuervos-chalk h-11 px-3 rounded-xl border border-white/10 focus:border-cuervos-orange focus:outline-none text-base"
                  autoFocus
                />
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Tipo de jugada</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPlayType('ofensiva')}
                    aria-pressed={newPlayType === 'ofensiva'}
                    className={`flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      newPlayType === 'ofensiva'
                        ? 'bg-cuervos-orange text-white border-cuervos-orange'
                        : 'text-slate-400 border-white/10'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" strokeWidth={2} />
                    Ofensiva
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlayType('defensiva')}
                    aria-pressed={newPlayType === 'defensiva'}
                    className={`flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      newPlayType === 'defensiva'
                        ? 'bg-cuervos-chalk text-cuervos-black border-cuervos-chalk'
                        : 'text-slate-400 border-white/10'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                    Defensiva
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="h-10 px-4 rounded-xl text-slate-300 text-sm font-semibold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newPlayName.trim()}
                  className="h-10 px-5 rounded-xl bg-cuervos-orange text-white text-sm font-bold hover:bg-cuervos-orange-hover disabled:opacity-40"
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
