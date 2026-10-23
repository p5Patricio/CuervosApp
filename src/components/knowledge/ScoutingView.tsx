import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { RivalScoutingCard, OpponentBadge } from '../../types';
import { Crosshair, Plus, Flame, EyeOff, Shield, Trash2, X } from 'lucide-react';

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

  const getBadgeVisuals = (badge: OpponentBadge) => {
    if (badge === 'Tirador Letal') {
      return {
        icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
        badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
      };
    }
    if (badge === 'Flotar (No tira)') {
      return {
        icon: <EyeOff className="w-3.5 h-3.5 text-cyan-400" />,
        badgeClass: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
      };
    }
    return {
      icon: <Shield className="w-3.5 h-3.5 text-red-400" />,
      badgeClass: 'bg-red-950/70 text-red-300 border-red-500/40',
    };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-red-400" />
            <span>Scouting de Rivales de la Liga</span>
          </h3>
          <p className="text-xs text-slate-400">
            A qué dorsales rivales dejar tirar de lejos para descansar y a quiénes hacerles trampa 2v1.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cuervos-elevated text-cuervos-cyan border border-cuervos-cyan/40 hover:bg-cuervos-border text-xs font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Ficha Rival</span>
        </button>
      </div>

      {/* Rival Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoutingCards.map((scout) => (
          <div
            key={scout.id}
            className="bg-cuervos-card border border-cuervos-border/70 rounded-2xl p-5 shadow-card hover:border-red-500/40 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-cuervos-border/50 pb-3">
              <div>
                <h4 className="font-black text-white text-lg">{scout.nombreEquipo}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cuervos-elevated text-slate-300 border border-cuervos-border">
                    {scout.ritmoDeJuego}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/40">
                    Defensa sugerida: Zona {scout.defensaSugerida}
                  </span>
                </div>
              </div>

              <button
                onClick={() => deleteScoutingCard(scout.id)}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                title="Eliminar ficha de scouting"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Key Players Targeted */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Instrucciones Específicas por Jugador Rival:
              </span>
              <div className="space-y-2">
                {scout.jugadoresClave.map((k, idx) => {
                  const visuals = getBadgeVisuals(k.etiqueta);
                  return (
                    <div
                      key={idx}
                      className="bg-cuervos-dark/80 p-2.5 rounded-xl border border-cuervos-border/40 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-500/50 flex items-center justify-center text-red-300 font-mono font-black shrink-0">
                          #{k.dorsal}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${visuals.badgeClass}`}
                            >
                              {visuals.icon}
                              <span>{k.etiqueta}</span>
                            </span>
                          </div>
                          <p className="text-slate-300 leading-tight">{k.instruccionDefensiva}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-cuervos-border/30">
              <div className="bg-cuervos-dark/50 p-2 rounded-lg border border-cuervos-border/20">
                <span className="text-slate-400 text-[10px] font-bold block mb-0.5">Su Fortaleza:</span>
                <span className="text-slate-200">{scout.fortaleza}</span>
              </div>
              <div className="bg-cuervos-dark/50 p-2 rounded-lg border border-emerald-500/20">
                <span className="text-emerald-400 text-[10px] font-bold block mb-0.5">Dónde Lastimarlos:</span>
                <span className="text-emerald-200">{scout.debilidadAExplotar}</span>
              </div>
            </div>

            {scout.notas && (
              <p className="text-[11px] text-slate-400 italic bg-cuervos-elevated/30 p-2 rounded-lg border border-cuervos-border/20">
                "{scout.notas}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Scouting Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-cuervos-dark border border-cuervos-border rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-cuervos-border pb-3">
              <h3 className="font-bold text-white text-base">Crear Ficha de Scouting de Rival</h3>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Equipo</label>
                <input
                  type="text"
                  required
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  placeholder="Ej. Toros del Valle"
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ritmo de Juego</label>
                <select
                  value={ritmoDeJuego}
                  onChange={(e) => setRitmoDeJuego(e.target.value as any)}
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
                >
                  <option value="Rápido y alocado">Rápido y alocado</option>
                  <option value="Pausado y físico">Pausado y físico</option>
                  <option value="Perimetral / Triplero">Perimetral / Triplero</option>
                </select>
              </div>
            </div>

            {/* Targeted Players Sub-form */}
            <div className="bg-cuervos-card/70 rounded-xl p-3 border border-cuervos-border/50 space-y-2">
              <span className="text-xs font-bold text-slate-200 block">Identificar Jugadores Clave</span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Dorsal (#)</label>
                  <input
                    type="number"
                    value={keyDorsal}
                    onChange={(e) => setKeyDorsal(Number(e.target.value))}
                    className="w-full bg-cuervos-elevated text-white text-xs px-2 py-1.5 rounded-lg border border-cuervos-border font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Etiqueta Táctica</label>
                  <select
                    value={keyBadge}
                    onChange={(e) => setKeyBadge(e.target.value as any)}
                    className="w-full bg-cuervos-elevated text-white text-xs px-2 py-1.5 rounded-lg border border-cuervos-border"
                  >
                    <option value="Tirador Letal">Tirador Letal (Cubrir de cerca)</option>
                    <option value="Flotar (No tira)">Flotar (No tira - Dejar tirar)</option>
                    <option value="Poste Rival">Poste Rival (Box-out doble)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Instrucción para el equipo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keyInstruction}
                    onChange={(e) => setKeyInstruction(e.target.value)}
                    placeholder="Ej. Flotarle 2 metros; si penetra se le dobla el alto."
                    className="flex-1 bg-cuervos-elevated text-white text-xs px-2 py-1.5 rounded-lg border border-cuervos-border"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="px-3 py-1.5 rounded-lg bg-cuervos-cyan text-cuervos-950 font-bold text-xs"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              {/* Added players list */}
              {playersList.length > 0 && (
                <div className="space-y-1 pt-2">
                  {playersList.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-cuervos-dark p-1.5 rounded-lg border border-cuervos-border/40">
                      <span>#{p.dorsal} ({p.etiqueta}): {p.instruccionDefensiva}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(i)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mayor Fortaleza</label>
                <input
                  type="text"
                  value={fortaleza}
                  onChange={(e) => setFortaleza(e.target.value)}
                  placeholder="Ej. Tiran muchos triples de esquina"
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Debilidad a Explotar</label>
                <input
                  type="text"
                  value={debilidadAExplotar}
                  onChange={(e) => setDebilidadAExplotar(e.target.value)}
                  placeholder="Ej. Se cansan en el Q4 si corremos"
                  className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Defensa Sugerida para Cuervos</label>
              <select
                value={defensaSugerida}
                onChange={(e) => setDefensaSugerida(e.target.value as any)}
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border"
              >
                <option value="2-1-2">Zona 2-1-2 Compacta (Ahorro de energía)</option>
                <option value="1-3-1">Zona 1-3-1 Agresiva (Sorpresa y trampas)</option>
                <option value="3-2">Zona 3-2 Modificada (Anti-tiradores)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas Adicionales</label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Les cuesta salir de la presión si forzamos al poste a botar"
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border"
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
                Guardar Scouting
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
