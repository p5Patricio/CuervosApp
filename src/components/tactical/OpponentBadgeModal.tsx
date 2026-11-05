import React from 'react';
import { OpponentBadge, BoardToken } from '../../types';
import { Crosshair, EyeOff, Shield, X, Check } from 'lucide-react';

interface OpponentBadgeModalProps {
  token: BoardToken | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBadge: (badge: OpponentBadge | null) => void;
}

const BADGES: { id: OpponentBadge; desc: string; Icon: typeof Shield }[] = [
  { id: 'Tirador Letal', desc: 'Puntear pegado, no dejarlo armar el tiro. Prohibido flotar.', Icon: Crosshair },
  { id: 'Flotar (No tira)', desc: 'Darle 2 metros para descansar piernas y ayudar en la pintura.', Icon: EyeOff },
  { id: 'Poste Rival', desc: 'Box-out con dos jugadores. Negar recepción bajo el aro.', Icon: Shield },
];

export const OpponentBadgeModal: React.FC<OpponentBadgeModalProps> = ({
  token,
  isOpen,
  onClose,
  onSelectBadge,
}) => {
  if (!isOpen || !token) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel sm:max-w-sm space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Same disc as the opponent token on the board */}
            <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center font-display font-black text-sm text-slate-950">
              {token.label}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase text-cuervos-chalk leading-none">Etiqueta de scouting</h3>
              <p className="mt-1 text-xs text-slate-400">Rival {token.label}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge options */}
        <div className="space-y-2">
          {BADGES.map(({ id, desc, Icon }) => {
            const isSelected = token.badge === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  onSelectBadge(id);
                  onClose();
                }}
                className={`w-full min-h-[56px] text-left p-3 rounded-xl border transition-colors flex items-start gap-3 ${
                  isSelected
                    ? 'border-cuervos-orange bg-cuervos-orange/10'
                    : 'border-white/10 bg-cuervos-card hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] mt-0.5 shrink-0 ${isSelected ? 'text-cuervos-orange' : 'text-slate-300'}`}
                  strokeWidth={2}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-cuervos-chalk">{id}</span>
                    {isSelected && <Check className="w-4 h-4 text-cuervos-orange" strokeWidth={2.5} />}
                  </div>
                  <p className="text-[13px] text-slate-400 mt-0.5 leading-snug">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Clear badge */}
        {token.badge && (
          <button
            type="button"
            onClick={() => {
              onSelectBadge(null);
              onClose();
            }}
            className="btn-ghost w-full"
          >
            Quitar etiqueta
          </button>
        )}
      </div>
    </div>
  );
};
