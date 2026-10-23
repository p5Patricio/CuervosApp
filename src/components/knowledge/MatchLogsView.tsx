import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { MatchRecord } from '../../types';
import { Trophy, Plus, BatteryCharging, Shield, Calendar, Trash2, X } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Bitácora de Partidos & Desglose por Cuartos</span>
          </h3>
          <p className="text-xs text-slate-400">
            Registro de efectividad defensiva y control de fatiga en el 4to cuarto.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cuervos-elevated text-cuervos-cyan border border-cuervos-cyan/40 hover:bg-cuervos-border text-xs font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Partido</span>
        </button>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {matchLogs.map((m) => {
          const totC = m.q1.cuervos + m.q2.cuervos + m.q3.cuervos + m.q4.cuervos;
          const totR = m.q1.rival + m.q2.rival + m.q3.rival + m.q4.rival;
          const isWin = m.resultado === 'Victoria';

          return (
            <div
              key={m.id}
              className="bg-cuervos-card border border-cuervos-border/70 rounded-2xl p-5 shadow-card hover:border-cuervos-cyan/40 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cuervos-border/50 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      isWin
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-950 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {m.resultado}
                  </span>
                  <div>
                    <h4 className="font-black text-white text-base">
                      Cuervos <span className="font-mono text-cuervos-cyan">{totC}</span> - <span className="font-mono text-slate-300">{totR}</span> {m.equipoRival}
                    </h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{m.fecha}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteMatchLog(m.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quarter by Quarter Breakdown Table */}
              <div className="grid grid-cols-5 text-center text-xs bg-cuervos-dark/70 rounded-xl p-2.5 border border-cuervos-border/40 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">1° Cuarto</span>
                  <span className="font-bold text-white">{m.q1.cuervos} - {m.q1.rival}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">2° Cuarto</span>
                  <span className="font-bold text-white">{m.q2.cuervos} - {m.q2.rival}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">3° Cuarto</span>
                  <span className="font-bold text-white">{m.q3.cuervos} - {m.q3.rival}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">4° Cuarto (Clutch)</span>
                  <span className="font-bold text-amber-400">{m.q4.cuervos} - {m.q4.rival}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Total</span>
                  <span className="font-black text-cuervos-cyan">{totC} - {totR}</span>
                </div>
              </div>

              {/* Insights: Defense & Energy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-cuervos-dark/50 p-2 rounded-lg border border-cuervos-border/30">
                  <Shield className="w-4 h-4 text-cuervos-cyan shrink-0" />
                  <span className="text-slate-400">Defensa más efectiva: </span>
                  <strong className="text-slate-200">{m.defensaMasEfectiva}</strong>
                </div>

                <div className="flex items-center gap-2 bg-cuervos-dark/50 p-2 rounded-lg border border-cuervos-border/30">
                  <BatteryCharging className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-400">Nivel de Energía Q4: </span>
                  <strong className="text-slate-200">{m.nivelEnergiaQ4}</strong>
                </div>
              </div>

              {/* Tactical Notes */}
              {m.notasTacticas && (
                <div className="text-xs text-slate-300 bg-cuervos-elevated/40 p-2.5 rounded-xl border border-cuervos-border/30">
                  <strong className="text-slate-400 font-semibold block mb-0.5">Notas Tácticas del Partido:</strong>
                  {m.notasTacticas}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Match Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-cuervos-dark border border-cuervos-border rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-cuervos-border pb-3">
              <h3 className="font-bold text-white text-base">Registrar Nuevo Partido</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cuervos-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Equipo Rival</label>
                <input
                  type="text"
                  required
                  value={equipoRival}
                  onChange={(e) => setEquipoRival(e.target.value)}
                  placeholder="Ej. Búfalos del Norte"
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                <input
                  type="text"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Score by quarters */}
            <div className="bg-cuervos-card/70 rounded-xl p-3 border border-cuervos-border/50 space-y-2">
              <span className="text-xs font-bold text-cuervos-cyan block">Marcador por Cuartos</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Q1 */}
                <div>
                  <span className="text-slate-400 text-[10px] block">Q1 (C - R)</span>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <input
                      type="number"
                      value={q1C}
                      onChange={(e) => setQ1C(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-white font-mono"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={q1R}
                      onChange={(e) => setQ1R(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Q2 */}
                <div>
                  <span className="text-slate-400 text-[10px] block">Q2 (C - R)</span>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <input
                      type="number"
                      value={q2C}
                      onChange={(e) => setQ2C(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-white font-mono"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={q2R}
                      onChange={(e) => setQ2R(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Q3 */}
                <div>
                  <span className="text-slate-400 text-[10px] block">Q3 (C - R)</span>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <input
                      type="number"
                      value={q3C}
                      onChange={(e) => setQ3C(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-white font-mono"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={q3R}
                      onChange={(e) => setQ3R(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Q4 */}
                <div>
                  <span className="text-slate-400 text-[10px] block">Q4 (C - R)</span>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <input
                      type="number"
                      value={q4C}
                      onChange={(e) => setQ4C(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-white font-mono"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={q4R}
                      onChange={(e) => setQ4R(Number(e.target.value))}
                      className="w-11 bg-cuervos-elevated text-center py-1 rounded text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Defense & Energy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Defensa Más Efectiva</label>
                <select
                  value={defensaMasEfectiva}
                  onChange={(e) => setDefensaMasEfectiva(e.target.value as any)}
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                >
                  <option value="Zona 2-1-2 Compacta">Zona 2-1-2 Compacta</option>
                  <option value="Zona 1-3-1 Agresiva">Zona 1-3-1 Agresiva</option>
                  <option value="Zona 3-2 Modificada">Zona 3-2 Modificada</option>
                  <option value="Hombre a Hombre">Hombre a Hombre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nivel de Energía Q4</label>
                <select
                  value={nivelEnergiaQ4}
                  onChange={(e) => setNivelEnergiaQ4(e.target.value as any)}
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                >
                  <option value="Óptima (Pudimos presionar)">Óptima (Pudimos presionar)</option>
                  <option value="Media (Aguantamos)">Media (Aguantamos)</option>
                  <option value="Agotados (Cayeron piernas)">Agotados (Cayeron piernas)</option>
                </select>
              </div>
            </div>

            {/* Tactical Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas Tácticas y Claves</label>
              <textarea
                rows={3}
                value={notasTacticas}
                onChange={(e) => setNotasTacticas(e.target.value)}
                placeholder="Anotar cómo funcionó el rebote, trampas en esquinas, etc."
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
              />
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
                Guardar Partido
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
