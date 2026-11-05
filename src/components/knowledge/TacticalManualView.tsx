import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { TacticalCard } from '../../types';
import { Plus, CheckCircle2, Star, Shield, Zap, Wind, Edit3, Trash2, X } from 'lucide-react';

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

  // Single accent color across sections; the icon shape carries the meaning
  const getSectionIcon = (sec: string) => {
    const cls = 'w-[18px] h-[18px] text-cuervos-orange';
    switch (sec) {
      case 'dosificacion':
        return <Zap className={cls} strokeWidth={2} />;
      case 'reglas_de_oro':
        return <Star className={cls} strokeWidth={2} />;
      case 'defensas':
        return <Shield className={cls} strokeWidth={2} />;
      default:
        return <Wind className={cls} strokeWidth={2} />;
    }
  };

  const SECTION_LABELS: Record<string, string> = {
    reglas_de_oro: 'Regla de oro',
    dosificacion: 'Dosificación',
    defensas: 'Defensa',
    contraataque: 'Transición',
  };

  return (
    <div className="space-y-4">
      {/* Header: title block and compact action on one row */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold text-cuervos-chalk leading-none uppercase">
            Manual Táctico
          </h3>
          <p className="mt-1.5 text-[13px] text-slate-400 leading-snug">
            Principios de nuestro estilo de juego.
          </p>
        </div>

        <button type="button" onClick={handleOpenAdd} className="btn-primary px-3.5 shrink-0">
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          <span>Principio</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {tacticalCards.map((card) => (
          <article key={card.id} className="surface-raised p-4 sm:p-5 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-cuervos-orange/10 border border-cuervos-orange/25 flex items-center justify-center">
                {getSectionIcon(card.seccion)}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <span className="eyebrow">{SECTION_LABELS[card.seccion] ?? card.seccion}</span>
                <h4 className="mt-0.5 font-semibold text-cuervos-chalk text-[15px] leading-snug">{card.titulo}</h4>
                {card.subtitulo && (
                  <p className="mt-0.5 text-[13px] text-slate-400 leading-snug">{card.subtitulo}</p>
                )}
              </div>

              <div className="flex items-center -mr-2 -mt-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(card)}
                  className="icon-btn"
                  aria-label="Editar principio"
                  title="Editar principio"
                >
                  <Edit3 className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTacticalCard(card.id)}
                  className="icon-btn-danger"
                  aria-label="Eliminar principio"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Key points */}
            <ul className="mt-4 space-y-2.5">
              {card.puntosClave.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-cuervos-orange shrink-0 mt-[3px]" strokeWidth={2} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {/* Bottom insight */}
            {card.detalles && (
              <p className="mt-4 pt-3 border-t border-white/10 text-[13px] text-slate-400 leading-relaxed">
                {card.detalles}
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Add / Edit Card Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <form
            onSubmit={handleSave}
            className="modal-panel space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold uppercase text-cuervos-chalk leading-none">
                {editingCard ? 'Editar Tarjeta Táctica' : 'Nueva Tarjeta del Manual'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="icon-btn -mr-2"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="field-label">Categoría</label>
                <select
                  value={seccion}
                  onChange={(e) => setSeccion(e.target.value as any)}
                  className="field"
                >
                  <option value="reglas_de_oro">Reglas de Oro</option>
                  <option value="dosificacion">Dosificación por Cuartos</option>
                  <option value="defensas">Esquemas Defensivos</option>
                  <option value="contraataque">Contraataque y Transición</option>
                </select>
              </div>

              <div>
                <label className="field-label">Título</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Salto Vertical Sin Faltas"
                  className="field"
                />
              </div>

              <div>
                <label className="field-label">Subtítulo / Objetivo</label>
                <input
                  type="text"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ej. Protección del poste alto en los primeros cuartos"
                  className="field"
                />
              </div>

              <div>
                <label className="field-label">
                  Puntos Clave (uno por línea)
                </label>
                <textarea
                  rows={4}
                  required
                  value={puntosRaw}
                  onChange={(e) => setPuntosRaw(e.target.value)}
                  placeholder="Línea 1...&#10;Línea 2...&#10;Línea 3..."
                  className="field"
                />
              </div>

              <div>
                <label className="field-label">Nota Táctica / Por qué</label>
                <input
                  type="text"
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
                  placeholder="Ej. Con 3 faltas en el 2do cuarto perdemos el ancla defensiva."
                  className="field"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
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
