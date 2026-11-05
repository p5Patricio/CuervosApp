import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { RivalScoutingCard, OpponentBadge } from '../../types';
import { Plus, Crosshair, EyeOff, Shield, Trash2, X, Gauge, TrendingUp, Target } from 'lucide-react';

export const ScoutingView: React.FC = () => {
  const { scoutingCards, addScoutingCard, deleteScoutingCard } = useCuervosStore();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [ritmoDeJuego, setRitmoDeJuego] = useState<RivalScoutingCard['ritmoDeJuego']>('Rápido y alocado');
  const [fortaleza, setFortaleza] = useState('');
  const [debilidadAExplotar, setDebilidadAExplotar] = useState('');
  const [defensaSugerida, setDefensaSugerida] = useState<RivalScoutingCard['defensaSugerida']>('2-1-2');
  const [notas, setNotas] = useState('');

  // Key players in form
  const [keyDorsal, setKeyDorsal] = useState(10);
  const [keyBadge, setKeyBadge] = useState<OpponentBadge>('Tirador Letal');
  const [keyInstruction, setKeyInstruction] = useState('');
  const [playersList, setPlayersList] = useState<RivalScoutingCard['jugadoresClave']>([]);

  const handleAddPlayer = () => {
    if (!keyInstruction.trim()) return;
    setPlayersList((prev) => [
      ...prev,
      {
        dorsal: Number(keyDorsal),
        etiqueta: keyBadge,
        instruccionDefensiva: keyInstruction.trim(),
      },
    ]);
    setKeyInstruction('');
    setKeyDorsal((d) => d + 1);
  };

  const handleRemovePlayer = (idx: number) => {
    setPlayersList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEquipo.trim()) return;

    addScoutingCard({
      nombreEquipo: nombreEquipo.trim(),
      ritmoDeJuego,
      fortaleza,
      debilidadAExplotar,
      defensaSugerida,
      jugadoresClave: playersList,
      notas,
    });

    // Reset
    setNombreEquipo('');
    setPlayersList([]);
    setFortaleza('');
    setDebilidadAExplotar('');
    setModalOpen(false);
  };

  // One neutral pill style; only the lethal shooter gets the orange accent
  const getBadgeVisuals = (badge: OpponentBadge) => {
    if (badge === 'Tirador Letal') {
      return { Icon: Crosshair, label: 'Tirador letal', className: 'chip-accent', iconClass: 'text-cuervos-orange' };
    }
    if (badge === 'Flotar (No tira)') {
      return { Icon: EyeOff, label: 'Flotar', className: 'chip', iconClass: 'text-slate-400' };
    }
    return { Icon: Shield, label: 'Poste', className: 'chip', iconClass: 'text-slate-400' };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold text-cuervos-chalk leading-none uppercase">Scouting</h3>
          <p className="mt-1.5 text-[13px] text-slate-400 leading-snug">A quién flotar y a quién atacar 2v1.</p>
        </div>

        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary px-3.5 shrink-0">
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          <span>Rival</span>
        </button>
      </div>

      {/* Rival cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {scoutingCards.map((scout) => (
          <article key={scout.id} className="surface-raised p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-display text-xl font-bold uppercase text-cuervos-chalk leading-tight">
                  {scout.nombreEquipo}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="chip">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    {scout.ritmoDeJuego}
                  </span>
                  <span className="chip-accent">
                    <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                    Zona {scout.defensaSugerida}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteScoutingCard(scout.id)}
                className="icon-btn-danger -mr-2 -mt-1.5"
                aria-label="Eliminar ficha de scouting"
                title="Eliminar ficha de scouting"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Strengths and weaknesses */}
            <dl className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2">
              <div className="rounded-xl bg-cuervos-black/60 border border-white/10 p-3">
                <dt className="eyebrow flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
                  Fortaleza
                </dt>
                <dd className="text-[13px] text-slate-200 leading-snug">{scout.fortaleza || '—'}</dd>
              </div>
              <div className="rounded-xl bg-cuervos-black/60 border border-cuervos-orange/25 p-3">
                <dt className="eyebrow flex items-center gap-1.5 mb-1 text-orange-200">
                  <Target className="w-3.5 h-3.5" strokeWidth={2} />
                  Dónde atacar
                </dt>
                <dd className="text-[13px] text-slate-200 leading-snug">{scout.debilidadAExplotar || '—'}</dd>
              </div>
            </dl>

            {/* Key rival players */}
            {scout.jugadoresClave.length > 0 && (
              <div>
                <span className="eyebrow block mb-2">Jugadores clave</span>
                <ul className="space-y-2">
                  {scout.jugadoresClave.map((k, idx) => {
                    const { Icon, label, className, iconClass } = getBadgeVisuals(k.etiqueta);
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        {/* Dorsal disc mirrors the opponent token on the board */}
                        <span className="w-9 h-9 shrink-0 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center font-display font-black text-sm text-slate-950 tabular-nums">
                          {k.dorsal}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <span className={className}>
                            <Icon className={`w-3.5 h-3.5 ${iconClass}`} strokeWidth={2} />
                            {label}
                          </span>
                          <p className="mt-1.5 text-[13px] text-slate-300 leading-relaxed">{k.instruccionDefensiva}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {scout.notas && (
              <p className="pt-3 border-t border-white/10 text-[13px] text-slate-400 leading-relaxed">{scout.notas}</p>
            )}
          </article>
        ))}
      </div>

      {/* Add scouting modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <form onSubmit={handleSubmit} className="modal-panel space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold uppercase text-cuervos-chalk leading-none">Nueva ficha rival</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="icon-btn -mr-2" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Equipo</label>
                <input
                  type="text"
                  required
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  placeholder="Ej. Toros del Valle"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label">Ritmo de juego</label>
                <select value={ritmoDeJuego} onChange={(e) => setRitmoDeJuego(e.target.value as any)} className="field">
                  <option value="Rápido y alocado">Rápido y alocado</option>
                  <option value="Pausado y físico">Pausado y físico</option>
                  <option value="Perimetral / Triplero">Perimetral / Triplero</option>
                </select>
              </div>
            </div>

            {/* Key players sub-form */}
            <fieldset className="rounded-xl border border-white/10 bg-cuervos-black/40 p-3 space-y-3">
              <legend className="px-1 text-xs font-semibold text-slate-300">Jugadores clave</legend>

              <div className="grid grid-cols-[5rem_1fr] gap-2">
                <div>
                  <label className="field-label">Dorsal</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={keyDorsal}
                    onChange={(e) => setKeyDorsal(Number(e.target.value))}
                    className="field text-center font-display font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="field-label">Etiqueta</label>
                  <select value={keyBadge} onChange={(e) => setKeyBadge(e.target.value as any)} className="field">
                    <option value="Tirador Letal">Tirador Letal (cubrir de cerca)</option>
                    <option value="Flotar (No tira)">Flotar (dejar tirar)</option>
                    <option value="Poste Rival">Poste Rival (box-out doble)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label">Instrucción</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keyInstruction}
                    onChange={(e) => setKeyInstruction(e.target.value)}
                    placeholder="Ej. Flotarle 2 metros"
                    className="field flex-1 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="btn-secondary w-11 px-0 min-h-[44px] shrink-0"
                    aria-label="Añadir jugador"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.25} />
                  </button>
                </div>
              </div>

              {/* Added players */}
              {playersList.length > 0 && (
                <ul className="space-y-1.5">
                  {playersList.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-[13px] bg-cuervos-dark rounded-lg border border-white/10 pl-2 pr-1 py-1"
                    >
                      <span className="font-display font-bold tabular-nums text-cuervos-chalk">#{p.dorsal}</span>
                      <span className="min-w-0 flex-1 truncate text-slate-300">{p.instruccionDefensiva}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(i)}
                        className="icon-btn-danger w-9 h-9"
                        aria-label={`Quitar dorsal ${p.dorsal}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Mayor fortaleza</label>
                <input
                  type="text"
                  value={fortaleza}
                  onChange={(e) => setFortaleza(e.target.value)}
                  placeholder="Ej. Triples de esquina"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label">Debilidad a explotar</label>
                <input
                  type="text"
                  value={debilidadAExplotar}
                  onChange={(e) => setDebilidadAExplotar(e.target.value)}
                  placeholder="Ej. Se cansan en el Q4"
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Defensa sugerida</label>
              <select value={defensaSugerida} onChange={(e) => setDefensaSugerida(e.target.value as any)} className="field">
                <option value="2-1-2">Zona 2-1-2 Compacta (ahorro de energía)</option>
                <option value="1-3-1">Zona 1-3-1 Agresiva (sorpresa y trampas)</option>
                <option value="3-2">Zona 3-2 Modificada (anti-tiradores)</option>
              </select>
            </div>

            <div>
              <label className="field-label">Notas</label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Les cuesta salir de la presión"
                className="field"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" className="btn-primary flex-1">
                Guardar scouting
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
