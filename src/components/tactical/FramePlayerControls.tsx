import React, { useState, useEffect, useRef } from 'react';
import { PlaySequence } from '../../types';
import { Play, Pause, SkipBack, SkipForward, Plus, Film, Trash2 } from 'lucide-react';

interface FramePlayerControlsProps {
  sequences: PlaySequence[];
  activeSequenceId: string | null;
  activeSequenceFrameIndex: number;
  isPlaying: boolean;
  onSelectSequence: (id: string) => void;
  onSelectFrame: (sequenceId: string, frameIndex: number) => void;
  onCreateSequence: (name: string, tipo: 'defensiva' | 'ofensiva') => void;
  onAddCurrentFrame: (sequenceId: string, name: string) => void;
  onDeleteSequence: (id: string) => void;
  onTogglePlay: (playing: boolean) => void;
}

export const FramePlayerControls: React.FC<FramePlayerControlsProps> = ({
  sequences,
  activeSequenceId,
  activeSequenceFrameIndex,
  isPlaying,
  onSelectSequence,
  onSelectFrame,
  onCreateSequence,
  onAddCurrentFrame,
  onDeleteSequence,
  onTogglePlay,
}) => {
  const [showNewSeqModal, setShowNewSeqModal] = useState(false);
  const [newSeqName, setNewSeqName] = useState('');
  const [newSeqType, setNewSeqType] = useState<'defensiva' | 'ofensiva'>('defensiva');
  const timerRef = useRef<number | null>(null);

  const currentSequence =
    sequences.find((s) => s.id === activeSequenceId) || sequences[0] || null;

  // Auto-play timer interpolation
  useEffect(() => {
    if (isPlaying && currentSequence && currentSequence.frames.length > 1) {
      timerRef.current = window.setInterval(() => {
        const nextIndex = (activeSequenceFrameIndex + 1) % currentSequence.frames.length;
        onSelectFrame(currentSequence.id, nextIndex);
      }, 1400);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, activeSequenceFrameIndex, currentSequence, onSelectFrame]);

  const handleNextFrame = () => {
    if (!currentSequence) return;
    const nextIdx = (activeSequenceFrameIndex + 1) % currentSequence.frames.length;
    onSelectFrame(currentSequence.id, nextIdx);
  };

  const handlePrevFrame = () => {
    if (!currentSequence) return;
    const prevIdx =
      activeSequenceFrameIndex === 0
        ? currentSequence.frames.length - 1
        : activeSequenceFrameIndex - 1;
    onSelectFrame(currentSequence.id, prevIdx);
  };

  const handleSaveStep = () => {
    if (!currentSequence) return;
    const nextNum = currentSequence.frames.length + 1;
    onAddCurrentFrame(currentSequence.id, `Paso ${nextNum}`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeqName.trim()) return;
    onCreateSequence(newSeqName.trim(), newSeqType);
    setNewSeqName('');
    setShowNewSeqModal(false);
  };

  return (
    <div className="bg-cuervos-card/90 backdrop-blur-md border border-cuervos-border/70 rounded-xl p-3 shadow-card space-y-3">
      {/* Sequence Selector & Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cuervos-cyan" />
          <span className="text-xs font-semibold text-slate-300">JUGADAS POR PASOS:</span>
          {currentSequence && (
            <select
              value={currentSequence.id}
              onChange={(e) => onSelectSequence(e.target.value)}
              className="bg-cuervos-elevated text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
            >
              {sequences.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tipo === 'defensiva' ? '🛡️' : '⚡'} {s.nombre} ({s.frames.length} pasos)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewSeqModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cuervos-elevated text-cuervos-cyan hover:bg-cuervos-border/60 text-xs font-bold border border-cuervos-cyan/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Jugada</span>
          </button>

          {currentSequence && sequences.length > 1 && (
            <button
              onClick={() => onDeleteSequence(currentSequence.id)}
              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
              title="Eliminar jugada"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Frame Stepper & Playback Controls */}
      {currentSequence && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cuervos-border/50">
          {/* Steps Indicator Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentSequence.frames.map((frame, idx) => {
              const isActive = activeSequenceFrameIndex === idx;
              return (
                <button
                  key={frame.id}
                  onClick={() => {
                    onTogglePlay(false);
                    onSelectFrame(currentSequence.id, idx);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow scale-105'
                      : 'bg-cuervos-dark text-slate-400 hover:bg-cuervos-elevated hover:text-white border border-cuervos-border/40'
                  }`}
                >
                  {frame.nombre || `Paso ${idx + 1}`}
                </button>
              );
            })}

            <button
              onClick={handleSaveStep}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-cuervos-dark/80 hover:bg-cuervos-elevated text-slate-300 hover:text-cuervos-cyan border border-dashed border-cuervos-border/70 text-[11px] font-semibold"
              title="Guardar las posiciones actuales de las fichas como nuevo paso"
            >
              <Plus className="w-3 h-3" />
              <span>Guardar Paso</span>
            </button>
          </div>

          {/* Play / Next / Prev Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevFrame}
              className="p-1.5 rounded-lg bg-cuervos-dark hover:bg-cuervos-elevated text-slate-300 hover:text-white border border-cuervos-border/50"
              title="Paso anterior"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onTogglePlay(!isPlaying)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-amber-glow animate-pulse'
                  : 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Animar</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextFrame}
              className="p-1.5 rounded-lg bg-cuervos-dark hover:bg-cuervos-elevated text-slate-300 hover:text-white border border-cuervos-border/50"
              title="Siguiente paso"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* New Sequence Modal */}
      {showNewSeqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-cuervos-dark border border-cuervos-border rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Crear Nueva Jugada o Rotación</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={newSeqName}
                onChange={(e) => setNewSeqName(e.target.value)}
                placeholder="Ej. Salida Presión 1-3-1 a Contraataque"
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewSeqType('defensiva')}
                  className={`py-2 rounded-lg text-xs font-bold border ${
                    newSeqType === 'defensiva'
                      ? 'bg-cuervos-elevated border-cuervos-cyan text-white shadow-cyan-glow'
                      : 'bg-cuervos-card border-cuervos-border text-slate-400'
                  }`}
                >
                  🛡️ Defensiva
                </button>
                <button
                  type="button"
                  onClick={() => setNewSeqType('ofensiva')}
                  className={`py-2 rounded-lg text-xs font-bold border ${
                    newSeqType === 'ofensiva'
                      ? 'bg-cuervos-elevated border-amber-400 text-amber-200 shadow-amber-glow'
                      : 'bg-cuervos-card border-cuervos-border text-slate-400'
                  }`}
                >
                  ⚡ Ofensiva
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewSeqModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cuervos-cyan text-cuervos-950 font-bold text-xs shadow-cyan-glow"
              >
                Crear Jugada
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
