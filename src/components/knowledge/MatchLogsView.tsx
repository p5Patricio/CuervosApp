import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { MatchRecord } from '../../types';
import { Plus, BatteryCharging, Shield, Calendar, Trash2, X } from 'lucide-react';

const scoreInputClass =
  'w-full min-h-[44px] bg-cuervos-black text-center text-base font-display font-bold tabular-nums rounded-lg border border-white/10 focus:border-cuervos-orange focus:outline-none';

export const MatchLogsView: React.FC = () => {
  const { matchLogs, addMatchLog, deleteMatchLog } = useCuervosStore();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [equipoRival, setEquipoRival] = useState('');
  const [fecha, setFecha] = useState(new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }));
  const [q1C, setQ1C] = useState(15);
  const [q1R, setQ1R] = useState(12);
  const [q2C, setQ2C] = useState(14);
  const [q2R, setQ2R] = useState(16);
  const [q3C, setQ3C] = useState(18);
  const [q3R, setQ3R] = useState(14);
  const [q4C, setQ4C] = useState(20);
  const [q4R, setQ4R] = useState(15);
  const [defensaMasEfectiva, setDefensaMasEfectiva] = useState<MatchRecord['defensaMasEfectiva']>('Zona 2-1-2 Compacta');
  const [nivelEnergiaQ4, setNivelEnergiaQ4] = useState<MatchRecord['nivelEnergiaQ4']>('Óptima (Pudimos presionar)');
  const [notasTacticas, setNotasTacticas] = useState('');

  const totalCuervos = q1C + q2C + q3C + q4C;
  const totalRival = q1R + q2R + q3R + q4R;
  const resultado: 'Victoria' | 'Derrota' = totalCuervos >= totalRival ? 'Victoria' : 'Derrota';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoRival.trim()) return;

    addMatchLog({
      fecha,
      equipoRival: equipoRival.trim(),
      q1: { cuervos: q1C, rival: q1R },
      q2: { cuervos: q2C, rival: q2R },
      q3: { cuervos: q3C, rival: q3R },
      q4: { cuervos: q4C, rival: q4R },
      defensaMasEfectiva,
      nivelEnergiaQ4,
      resultado,
      notasTacticas,
    });

    setModalOpen(false);
  };

  const quarterInputs = [
    { label: 'Q1', c: q1C, r: q1R, setC: setQ1C, setR: setQ1R },
    { label: 'Q2', c: q2C, r: q2R, setC: setQ2C, setR: setQ2R },
    { label: 'Q3', c: q3C, r: q3R, setC: setQ3C, setR: setQ3R },
    { label: 'Q4', c: q4C, r: q4R, setC: setQ4C, setR: setQ4R },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold text-cuervos-chalk leading-none uppercase">Bitácora</h3>
          <p className="mt-1.5 text-[13px] text-slate-400 leading-snug">Marcador por cuartos y energía en el Q4.</p>
        </div>

        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary px-3.5 shrink-0">
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          <span>Partido</span>
        </button>
      </div>

      {/* Match cards */}
      <div className="space-y-3">
        {matchLogs.map((m) => {
          const totC = m.q1.cuervos + m.q2.cuervos + m.q3.cuervos + m.q4.cuervos;
          const totR = m.q1.rival + m.q2.rival + m.q3.rival + m.q4.rival;
          const isWin = m.resultado === 'Victoria';
          const quarters = [m.q1, m.q2, m.q3, m.q4];

          return (
            <article key={m.id} className="surface-raised p-4 sm:p-5 space-y-4">
              {/* Result, date, delete */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider leading-none ${
                      isWin ? 'bg-cuervos-orange/15 text-orange-200' : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-cuervos-orange' : 'bg-slate-500'}`} />
                    {m.resultado}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 min-w-0">
                    <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span className="truncate">{m.fecha}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteMatchLog(m.id)}
                  className="icon-btn-danger -mr-2"
                  aria-label="Eliminar registro"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Scoreboard */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div className="min-w-0">
                  <span className="eyebrow block">Cuervos</span>
                  <span
                    className={`font-display font-bold tabular-nums text-4xl leading-none ${
                      isWin ? 'text-cuervos-chalk' : 'text-slate-300'
                    }`}
                  >
                    {totC}
                  </span>
                </div>
                <span className="pb-1 text-slate-600 font-display text-2xl leading-none">–</span>
                <div className="min-w-0 text-right">
                  <span className="eyebrow block truncate">{m.equipoRival}</span>
                  <span
                    className={`font-display font-bold tabular-nums text-4xl leading-none ${
                      isWin ? 'text-slate-400' : 'text-cuervos-chalk'
                    }`}
                  >
                    {totR}
                  </span>
                </div>
              </div>

              {/* Quarter chips; Q4 (clutch) gets the accent */}
              <div className="grid grid-cols-4 gap-1.5">
                {quarters.map((q, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg px-1 py-1.5 text-center border ${
                      idx === 3 ? 'border-cuervos-orange/40 bg-cuervos-orange/5' : 'border-white/10 bg-cuervos-black/60'
                    }`}
                  >
                    <span className={`block text-[10px] font-semibold ${idx === 3 ? 'text-orange-200' : 'text-slate-400'}`}>
                      Q{idx + 1}
                    </span>
                    <span className="block font-display font-bold tabular-nums text-[15px] leading-tight text-cuervos-chalk">
                      {q.cuervos}-{q.rival}
                    </span>
                  </div>
                ))}
              </div>

              {/* Defense & energy */}
              <dl className="space-y-2 text-[13px]">
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <dt className="text-slate-400 shrink-0">Defensa</dt>
                  <dd className="text-slate-200 font-medium ml-auto text-right">{m.defensaMasEfectiva}</dd>
                </div>
                <div className="flex items-start gap-2.5">
                  <BatteryCharging className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <dt className="text-slate-400 shrink-0">Energía Q4</dt>
                  <dd className="text-slate-200 font-medium ml-auto text-right">{m.nivelEnergiaQ4}</dd>
                </div>
              </dl>

              {/* Tactical notes */}
              {m.notasTacticas && (
                <p className="pt-3 border-t border-white/10 text-[13px] text-slate-300 leading-relaxed">
                  {m.notasTacticas}
                </p>
              )}
            </article>
          );
        })}
      </div>

      {/* Add match modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <form onSubmit={handleSubmit} className="modal-panel space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold uppercase text-cuervos-chalk leading-none">Nuevo partido</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="icon-btn -mr-2" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Equipo rival</label>
                <input
                  type="text"
                  required
                  value={equipoRival}
                  onChange={(e) => setEquipoRival(e.target.value)}
                  placeholder="Ej. Búfalos del Norte"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label">Fecha</label>
                <input type="text" required value={fecha} onChange={(e) => setFecha(e.target.value)} className="field" />
              </div>
            </div>

            {/* Score by quarters: Cuervos row on top, rival below */}
            <fieldset className="space-y-2">
              <div className="flex items-center justify-between">
                <legend className="field-label mb-0">Marcador por cuartos</legend>
                <span className="text-[11px] text-slate-500">Cuervos / Rival</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quarterInputs.map(({ label, c, r, setC, setR }) => (
                  <div key={label} className="space-y-1.5">
                    <span className="block text-center text-[11px] font-semibold text-slate-400">{label}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={c}
                      onChange={(e) => setC(Number(e.target.value))}
                      className={`${scoreInputClass} text-cuervos-chalk`}
                      aria-label={`${label} Cuervos`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={r}
                      onChange={(e) => setR(Number(e.target.value))}
                      className={`${scoreInputClass} text-slate-400`}
                      aria-label={`${label} Rival`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-right">
                Total{' '}
                <span className="font-display font-bold tabular-nums text-sm text-cuervos-chalk">
                  {totalCuervos}-{totalRival}
                </span>
              </p>
            </fieldset>

            {/* Defense & energy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Defensa más efectiva</label>
                <select
                  value={defensaMasEfectiva}
                  onChange={(e) => setDefensaMasEfectiva(e.target.value as any)}
                  className="field"
                >
                  <option value="Zona 2-1-2 Compacta">Zona 2-1-2 Compacta</option>
                  <option value="Zona 1-3-1 Agresiva">Zona 1-3-1 Agresiva</option>
                  <option value="Zona 3-2 Modificada">Zona 3-2 Modificada</option>
                  <option value="Hombre a Hombre">Hombre a Hombre</option>
                </select>
              </div>

              <div>
                <label className="field-label">Energía en Q4</label>
                <select
                  value={nivelEnergiaQ4}
                  onChange={(e) => setNivelEnergiaQ4(e.target.value as any)}
                  className="field"
                >
                  <option value="Óptima (Pudimos presionar)">Óptima (Pudimos presionar)</option>
                  <option value="Media (Aguantamos)">Media (Aguantamos)</option>
                  <option value="Agotados (Cayeron piernas)">Agotados (Cayeron piernas)</option>
                </select>
              </div>
            </div>

            {/* Tactical notes */}
            <div>
              <label className="field-label">Notas tácticas</label>
              <textarea
                rows={3}
                value={notasTacticas}
                onChange={(e) => setNotasTacticas(e.target.value)}
                placeholder="Cómo funcionó el rebote, trampas en esquinas, etc."
                className="field"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" className="btn-primary flex-1">
                Guardar partido
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
