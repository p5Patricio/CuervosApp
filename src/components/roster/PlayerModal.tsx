import React, { useState, useEffect } from 'react';
import { Player, PlayerRole } from '../../types';
import { X, Check } from 'lucide-react';

interface PlayerModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: Omit<Player, 'id'> | (Partial<Player> & { id: string })) => void;
}

const ROLES: PlayerRole[] = [
  'Ancla Central',
  'Guardia / Base',
  'Ala Rápida',
  'Alero Bajo',
  'Escolta Tirador',
  'Sexto Hombre / Multirrol',
];

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [dorsal, setDorsal] = useState(0);
  const [estatura, setEstatura] = useState(180);
  const [rolPrimario, setRolPrimario] = useState<PlayerRole>('Guardia / Base');
  const [velocidad, setVelocidad] = useState(8);
  const [resistencia, setResistencia] = useState(8);
  const [defensaInteriorRebote, setDefensaInteriorRebote] = useState(7);
  const [defensaExteriorRobo, setDefensaExteriorRobo] = useState(8);
  const [esTitular, setEsTitular] = useState(true);

  useEffect(() => {
    if (player) {
      setNombre(player.nombre);
      setDorsal(player.dorsal);
      setEstatura(player.estatura);
      setRolPrimario(player.rolPrimario);
      setVelocidad(player.atributos.velocidad);
      setResistencia(player.atributos.resistencia);
      setDefensaInteriorRebote(player.atributos.defensaInteriorRebote);
      setDefensaExteriorRobo(player.atributos.defensaExteriorRobo);
      setEsTitular(player.esTitular);
    } else {
      setNombre('');
      setDorsal(10);
      setEstatura(180);
      setRolPrimario('Guardia / Base');
      setVelocidad(8);
      setResistencia(8);
      setDefensaInteriorRebote(6);
      setDefensaExteriorRobo(7);
      setEsTitular(true);
    }
  }, [player, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const data = {
      nombre: nombre.trim(),
      dorsal: Number(dorsal),
      estatura: Number(estatura),
      rolPrimario,
      atributos: {
        velocidad: Number(velocidad),
        resistencia: Number(resistencia),
        defensaInteriorRebote: Number(defensaInteriorRebote),
        defensaExteriorRobo: Number(defensaExteriorRobo),
      },
      asistencia: player?.asistencia ?? ('presente' as const),
      faltasEnVivo: player?.faltasEnVivo ?? 0,
      fatiga: player?.fatiga ?? 0,
      esTitular,
      enBanca: !esTitular,
    };

    if (player) {
      onSave({ ...data, id: player.id });
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cuervos-dark border border-cuervos-border rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cuervos-border pb-3 mb-4">
          <h3 className="font-bold text-white text-base">
            {player ? 'Editar Jugador Cuervos' : 'Agregar Nuevo Jugador a Cuervos'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cuervos-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo / Apodo</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Lucas 'Flecha' Ramos"
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dorsal (#)</label>
              <input
                type="number"
                min="0"
                max="99"
                required
                value={dorsal}
                onChange={(e) => setDorsal(Number(e.target.value))}
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estatura (cm)</label>
              <input
                type="number"
                min="150"
                max="220"
                required
                value={estatura}
                onChange={(e) => setEstatura(Number(e.target.value))}
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rol Táctico</label>
              <select
                value={rolPrimario}
                onChange={(e) => setRolPrimario(e.target.value as PlayerRole)}
                className="w-full bg-cuervos-elevated text-white text-xs px-3 py-2 rounded-lg border border-cuervos-border focus:border-cuervos-cyan focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attributes Range Sliders (1 - 10) */}
          <div className="bg-cuervos-card/70 rounded-xl p-3 border border-cuervos-border/50 space-y-3">
            <h4 className="text-xs font-bold text-cuervos-cyan uppercase tracking-wider">
              Atributos de Rendimiento (1 a 10)
            </h4>

            {/* Velocidad */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Velocidad</span>
                <span className="font-mono font-bold text-cuervos-cyan">{velocidad}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={velocidad}
                onChange={(e) => setVelocidad(Number(e.target.value))}
                className="w-full accent-cuervos-cyan"
              />
            </div>

            {/* Resistencia */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Resistencia Física</span>
                <span className="font-mono font-bold text-indigo-400">{resistencia}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={resistencia}
                onChange={(e) => setResistencia(Number(e.target.value))}
                className="w-full accent-indigo-400"
              />
            </div>

            {/* Defensa Interior / Rebote */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Defensa Interior / Rebote (Crítico para Poste)</span>
                <span className="font-mono font-bold text-amber-400">{defensaInteriorRebote}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={defensaInteriorRebote}
                onChange={(e) => setDefensaInteriorRebote(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Defensa Exterior / Robo */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Defensa Exterior / Robo de Balón</span>
                <span className="font-mono font-bold text-emerald-400">{defensaExteriorRobo}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={defensaExteriorRobo}
                onChange={(e) => setDefensaExteriorRobo(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>

          {/* Starter Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="esTitularCheck"
              checked={esTitular}
              onChange={(e) => setEsTitular(e.target.checked)}
              className="accent-cuervos-cyan w-4 h-4 rounded"
            />
            <label htmlFor="esTitularCheck" className="text-xs text-slate-300 select-none cursor-pointer">
              Jugador Titular en el Quinteto Inicial
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cuervos-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cuervos-cyan text-cuervos-950 font-black text-xs shadow-cyan-glow hover:bg-cuervos-cyan-hover transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Jugador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
