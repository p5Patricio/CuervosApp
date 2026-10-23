import React from 'react';
import { OpponentBadge, BoardToken } from '../../types';
import { Flame, EyeOff, Shield, X, Check } from 'lucide-react';

interface OpponentBadgeModalProps {
  token: BoardToken | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBadge: (badge: OpponentBadge | null) => void;
}

export const OpponentBadgeModal: React.FC<OpponentBadgeModalProps> = ({
  token,
  isOpen,
  onClose,
  onSelectBadge,
}) => {
  if (!isOpen || !token) return null;

  const badges: {
    id: OpponentBadge;
    label: string;
    desc: string;
    icon: React.ReactNode;
    colorClasses: string;
  }[] = [
    {
      id: 'Tirador Letal',
      label: 'Tirador Letal',
      desc: 'Puntear pegado, no permitir que arme el tiro, prohibido flotar.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      colorClasses: 'hover:border-amber-400 hover:bg-amber-500/10 text-amber-200',
    },
    {
      id: 'Flotar (No tira)',
      label: 'Flotar (No tira)',
      desc: 'Darle 2 metros de distancia para descansar piernas y ayudar en la pintura.',
      icon: <EyeOff className="w-5 h-5 text-cyan-400" />,
      colorClasses: 'hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-200',
    },
    {
      id: 'Poste Rival',
      label: 'Poste Rival',
      desc: 'Box-out agresivo con dos jugadores. Negar recepción bajo el aro.',
      icon: <Shield className="w-5 h-5 text-red-400" />,
      colorClasses: 'hover:border-red-500 hover:bg-red-500/10 text-red-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cuervos-dark border border-cuervos-border rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cuervos-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black font-mono shadow-red-glow">
              {token.label}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Etiqueta de Scouting</h3>
              <p className="text-[11px] text-slate-400">Rival {token.label} de la liga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cuervos-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge Options */}
        <div className="space-y-2">
          {badges.map((b) => {
            const isSelected = token.badge === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  onSelectBadge(b.id);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${b.colorClasses} ${
                  isSelected
                    ? 'border-cuervos-cyan bg-cuervos-elevated shadow-cyan-glow'
                    : 'border-cuervos-border/60 bg-cuervos-card/50'
                }`}
              >
                <div className="mt-0.5 shrink-0">{b.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{b.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-cuervos-cyan" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{b.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Clear Badge Option */}
        {token.badge && (
          <button
            onClick={() => {
              onSelectBadge(null);
              onClose();
            }}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
          >
            Quitar etiqueta táctica
          </button>
        )}
      </div>
    </div>
  );
};
