import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { TacticalCard } from '../../types';
import { BookOpen, Plus, CheckCircle2, Star, Shield, Zap, Wind, Edit3, Trash2, X } from 'lucide-react';

export const TacticalManualView: React.FC = () => {
  const { tacticalCards, addTacticalCard, updateTacticalCard, deleteTacticalCard } = useCuervosStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<TacticalCard | null>(null);

  // Form states
  const [seccion, setSeccion] = useState<TacticalCard['seccion']>('reglas_de_oro');
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [puntosRaw, setPuntosRaw] = useState('');
  const [detalles, setDetalles] = useState('');

  const handleOpenAdd = () => {
    setEditingCard(null);
    setSeccion('reglas_de_oro');
    setTitulo('');
    setSubtitulo('');
    setPuntosRaw('');
    setDetalles('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: TacticalCard) => {
    setEditingCard(c);
    setSeccion(c.seccion);
    setTitulo(c.titulo);
    setSubtitulo(c.subtitulo);
    setPuntosRaw(c.puntosClave.join('\n'));
    setDetalles(c.detalles);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const puntosClave = puntosRaw
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    if (editingCard) {
      updateTacticalCard(editingCard.id, {
        seccion,
        titulo,
        subtitulo,
        puntosClave,
        detalles,
      });
    } else {
      addTacticalCard({
        seccion,
        titulo,
        subtitulo,
        puntosClave,
        detalles,
      });
    }
    setModalOpen(false);
  };

  const getSectionIcon = (sec: string) => {
    switch (sec) {
      case 'dosificacion':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'reglas_de_oro':
        return <Star className="w-5 h-5 text-cuervos-cyan fill-cuervos-cyan/20" />;
      case 'defensas':
        return <Shield className="w-5 h-5 text-indigo-400" />;
      default:
        return <Wind className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cuervos-cyan" />
            <span>Manual Táctico Interactivo de Cuervos</span>
          </h3>
          <p className="text-xs text-slate-400">
            Principios irremplazables de nuestro estilo de juego en canchas exteriores techadas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cuervos-elevated text-cuervos-cyan border border-cuervos-cyan/40 hover:bg-cuervos-border text-xs font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Principio</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tacticalCards.map((card) => (
          <div
            key={card.id}
            className="bg-cuervos-card border border-cuervos-border/70 rounded-2xl p-5 shadow-card hover:border-cuervos-cyan/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cuervos-dark border border-cuervos-border">
                    {getSectionIcon(card.seccion)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base leading-snug">{card.titulo}</h4>
                    <span className="text-xs text-slate-400">{card.subtitulo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(card)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-cuervos-elevated"
                    title="Editar principio"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTacticalCard(card.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-2 mt-3 text-xs text-slate-200">
                {card.puntosClave.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-cuervos-dark/60 p-2.5 rounded-xl border border-cuervos-border/30">
                    <CheckCircle2 className="w-4 h-4 text-cuervos-cyan shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Insight */}
            {card.detalles && (
              <div className="mt-4 pt-3 border-t border-cuervos-border/40 text-[11px] text-slate-400 italic">
                "{card.detalles}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Card Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSave}
            className="bg-cuervos-dark border border-cuervos-border rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-cuervos-border pb-3">
              <h3 className="font-bold text-white text-base">
                {editingCard ? 'Editar Tarjeta Táctica' : 'Nueva Tarjeta del Manual'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cuervos-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                <select
                  value={seccion}
                  onChange={(e) => setSeccion(e.target.value as any)}
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                >
                  <option value="reglas_de_oro">Reglas de Oro</option>
                  <option value="dosificacion">Dosificación por Cuartos</option>
                  <option value="defensas">Esquemas Defensivos</option>
                  <option value="contraataque">Contraataque y Transición</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Salto Vertical Sin Faltas"
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subtítulo / Objetivo</label>
                <input
                  type="text"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ej. Protección del poste alto en los primeros cuartos"
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Puntos Clave (uno por línea)
                </label>
                <textarea
                  rows={4}
                  required
                  value={puntosRaw}
                  onChange={(e) => setPuntosRaw(e.target.value)}
                  placeholder="Línea 1...&#10;Línea 2...&#10;Línea 3..."
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nota Táctica / Por qué</label>
                <input
                  type="text"
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
                  placeholder="Ej. Con 3 faltas en el 2do cuarto perdemos el ancla defensiva."
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-cuervos-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cuervos-cyan text-cuervos-950 font-black text-xs shadow-cyan-glow"
              >
                Guardar Principio
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
