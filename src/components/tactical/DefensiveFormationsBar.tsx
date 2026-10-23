import React from 'react';
import { DefensiveFormation } from '../../types';
import { Shield, Zap, Target, Wind, Info, Compass } from 'lucide-react';

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

  const getFormationIcon = (id: string) => {
    switch (id) {
      case '2-1-2':
        return <Shield className="w-4 h-4 text-cuervos-cyan" />;
      case '1-3-1':
        return <Zap className="w-4 h-4 text-cuervos-amber" />;
      case '3-2':
        return <Target className="w-4 h-4 text-indigo-400" />;
      default:
        return <Compass className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-cuervos-card/90 backdrop-blur-md border border-cuervos-border/70 rounded-xl p-3 shadow-card space-y-3">
      {/* Formation Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Shield className="w-4 h-4 text-cuervos-cyan" />
          <span>SISTEMAS DEFENSIVOS CUERVOS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {formations.map((f) => {
            const isSelected = activeFormationId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFormation(f.id, 0)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-cuervos-elevated text-white border border-cuervos-cyan shadow-cyan-glow'
                    : 'bg-cuervos-dark/80 text-slate-400 hover:text-slate-200 hover:bg-cuervos-elevated/60 border border-transparent'
                }`}
              >
                {getFormationIcon(f.id)}
                <span>{f.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotation Steps (Balón en Centro, Banda 45°, Esquina) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cuervos-border/50">
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
          <span>Rotación según balón:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {currentFormation?.pasos.map((paso, idx) => {
            const isCurrentStep = currentStepIndex === idx;
            let stepLabel = 'Centro';
            if (paso.ballZone.includes('wing')) stepLabel = 'Banda 45°';
            if (paso.ballZone.includes('corner')) stepLabel = 'Esquina';

            return (
              <button
                key={idx}
                onClick={() => onSelectStep(idx)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  isCurrentStep
                    ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
                    : 'bg-cuervos-dark text-slate-300 hover:bg-cuervos-elevated border border-cuervos-border/40'
                }`}
              >
                {stepLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tactical Rule & Float Rule Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
        <div className="flex items-start gap-2 bg-cuervos-dark/60 rounded-lg p-2 border border-cuervos-border/30">
          <Info className="w-3.5 h-3.5 text-cuervos-cyan shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="text-slate-400 font-medium">Instrucción: </span>
            <span className="text-slate-200">{currentStep?.tacticalTip}</span>
          </div>
        </div>

        <div
          className={`flex items-start gap-2 rounded-lg p-2 border transition-colors ${
            isWeakSideFloatActive
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-sm'
              : 'bg-cuervos-dark/60 border-cuervos-border/30 text-slate-400'
          }`}
        >
          <Wind
            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
              isWeakSideFloatActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <div className="leading-tight">
            <span className="font-bold">
              {isWeakSideFloatActive ? '⚡ REGLA DEL FLOTE ACTIVA: ' : 'Regla del Flote: '}
            </span>
            <span>
              {isWeakSideFloatActive
                ? 'El lado débil se colapsa 2 metros a la pintura para descansar piernas y cerrar rebote.'
                : 'Defensa balanceada en cabecera.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
