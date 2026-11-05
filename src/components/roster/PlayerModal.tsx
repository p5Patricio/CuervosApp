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
    <div className="modal-backdrop">
      <div className="modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-bold uppercase text-cuervos-chalk leading-none">
            {player ? 'Editar jugador' : 'Nuevo jugador'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn -mr-2"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="field-label">Nombre Completo / Apodo</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Lucas 'Flecha' Ramos"
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Dorsal (#)</label>
              <input
                type="number"
                min="0"
                max="99"
                required
                value={dorsal}
                onChange={(e) => setDorsal(Number(e.target.value))}
                className="field font-display font-bold tabular-nums text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="field-label">Estatura (cm)</label>
              <input
                type="number"
                min="150"
                max="220"
                required
                value={estatura}
                onChange={(e) => setEstatura(Number(e.target.value))}
                className="field font-display font-bold tabular-nums text-base"
              />
            </div>
            <div>
              <label className="field-label">Rol Táctico</label>
              <select
                value={rolPrimario}
                onChange={(e) => setRolPrimario(e.target.value as PlayerRole)}
                className="field"
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
          <div className="rounded-xl bg-cuervos-black/40 border border-white/10 p-3 space-y-4">
            <h4 className="eyebrow">
              Atributos de Rendimiento (1 a 10)
            </h4>

            {/* Velocidad */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Velocidad</span>
                <span className="font-display font-bold tabular-nums text-sm text-cuervos-chalk">{velocidad}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={velocidad}
                onChange={(e) => setVelocidad(Number(e.target.value))}
                className="w-full h-8 accent-cuervos-orange"
              />
            </div>

            {/* Resistencia */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Resistencia Física</span>
                <span className="font-display font-bold tabular-nums text-sm text-cuervos-chalk">{resistencia}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={resistencia}
                onChange={(e) => setResistencia(Number(e.target.value))}
                className="w-full h-8 accent-cuervos-orange"
              />
            </div>

            {/* Defensa Interior / Rebote */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Defensa Interior / Rebote (Crítico para Poste)</span>
                <span className="font-display font-bold tabular-nums text-sm text-cuervos-chalk">{defensaInteriorRebote}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={defensaInteriorRebote}
                onChange={(e) => setDefensaInteriorRebote(Number(e.target.value))}
                className="w-full h-8 accent-cuervos-orange"
              />
            </div>

            {/* Defensa Exterior / Robo */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Defensa Exterior / Robo de Balón</span>
                <span className="font-display font-bold tabular-nums text-sm text-cuervos-chalk">{defensaExteriorRobo}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={defensaExteriorRobo}
                onChange={(e) => setDefensaExteriorRobo(Number(e.target.value))}
                className="w-full h-8 accent-cuervos-orange"
              />
            </div>
          </div>

          {/* Starter Checkbox */}
          <div className="flex items-center gap-3 min-h-[44px]">
            <input
              type="checkbox"
              id="esTitularCheck"
              checked={esTitular}
              onChange={(e) => setEsTitular(e.target.checked)}
              className="accent-cuervos-orange w-5 h-5 rounded"
            />
            <label htmlFor="esTitularCheck" className="text-sm text-slate-200 select-none cursor-pointer">
              Jugador Titular en el Quinteto Inicial
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
