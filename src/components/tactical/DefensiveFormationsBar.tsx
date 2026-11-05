import React from 'react';
import { DefensiveFormation } from '../../types';
import { Wind } from 'lucide-react';

interface DefensiveFormationsBarProps {
  formations: DefensiveFormation[];
  activeFormationId: '2-1-2' | '1-3-1' | '3-2' | null;
  currentStepIndex: number;
  onSelectFormation: (id: '2-1-2' | '1-3-1' | '3-2', stepIndex?: number) => void;
  onSelectStep: (stepIndex: number) => void;
  isWeakSideFloatActive: boolean;
}

export const DefensiveFormationsBar: React.FC<DefensiveFormationsBarProps> = ({
  formations,
  activeFormationId,
  currentStepIndex,
  onSelectFormation,
  onSelectStep,
  isWeakSideFloatActive,
}) => {
  const currentFormation = formations.find((f) => f.id === activeFormationId) || formations[0];
  const currentStep = currentFormation?.pasos[currentStepIndex] || currentFormation?.pasos[0];

  return (
    <div className="glass shadow-float rounded-2xl p-1.5 space-y-1.5">
      {/* Formation selector */}
      <div className="flex items-center gap-1" role="group" aria-label="Sistemas defensivos">
        {formations.map((f) => {
          const isSelected = activeFormationId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFormation(f.id, 0)}
              aria-pressed={isSelected}
              title={f.nombre}
              className={`flex-1 h-10 rounded-xl text-sm font-semibold tabular-nums transition-colors ${
                isSelected ? 'bg-cuervos-orange text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.id}
            </button>
          );
        })}
      </div>

      {/* Rotation by ball zone */}
      <div className="flex items-center gap-1 border-t border-white/5 pt-1.5" role="group" aria-label="Rotación según balón">
        {currentFormation?.pasos.map((paso, idx) => {
          const isCurrentStep = currentStepIndex === idx;
          let stepLabel = 'Centro';
          if (paso.ballZone.includes('wing')) stepLabel = 'Banda 45°';
          if (paso.ballZone.includes('corner')) stepLabel = 'Esquina';

          return (
            <button
              key={idx}
              onClick={() => onSelectStep(idx)}
              aria-pressed={isCurrentStep}
              className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-colors ${
                isCurrentStep ? 'bg-cuervos-chalk text-cuervos-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {stepLabel}
            </button>
          );
        })}
      </div>

      {/* Coaching cue + float rule */}
      <div className="px-1.5 pb-0.5 space-y-1">
        <p className="text-xs text-slate-300 leading-snug line-clamp-2">{currentStep?.tacticalTip}</p>
        <p
          className={`flex items-center gap-1.5 text-[11px] leading-tight ${
            isWeakSideFloatActive ? 'text-cuervos-chalk' : 'text-slate-500'
          }`}
        >
          <Wind
            className={`w-3.5 h-3.5 shrink-0 ${isWeakSideFloatActive ? 'text-cuervos-orange' : ''}`}
            strokeWidth={1.75}
          />
          <span>
            {isWeakSideFloatActive
              ? 'Flote activo: el lado débil colapsa 2 m a la pintura.'
              : 'Regla del flote: defensa balanceada en cabecera.'}
          </span>
        </p>
      </div>
    </div>
  );
};
