import React from 'react';
import { PlanBRecommendation } from '../../types';
import { ShieldAlert, CheckCircle2, LayoutDashboard, ArrowDown, Info } from 'lucide-react';

interface PlanBAdvisorProps {
  recommendations: PlanBRecommendation[];
  onApplyPlanB: (rec: PlanBRecommendation) => void;
  onNavigateToBoard: () => void;
}

const MOTIVO_LABELS: Record<PlanBRecommendation['motivo'], string> = {
  ausente: 'Ausente',
  faltas_5: 'Fuera por 5 faltas',
  faltas_4: '4 faltas',
  fatiga_alta: 'Fatiga crítica',
};

export const PlanBAdvisor: React.FC<PlanBAdvisorProps> = ({
  recommendations,
  onApplyPlanB,
  onNavigateToBoard,
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="surface-raised p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-cuervos-chalk" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-cuervos-chalk text-[15px] leading-snug">Plan A en marcha</h4>
          <p className="text-[13px] text-slate-400 mt-0.5 leading-relaxed">
            Titulares disponibles, sin cargas de faltas ni fatiga crítica. Zona 2-1-2 con el Ancla Central en cancha.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const affected = rec.jugadorAfectado;
        const sub = rec.reemplazoSugerido;
        const isEmergency = rec.esEmergenciaPosteAlto;

        return (
          <article
            key={rec.id}
            className={`surface-raised p-4 space-y-4 ${isEmergency ? 'border-cuervos-orange/60' : ''}`}
          >
            {/* Alert header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <ShieldAlert
                  className={`w-[18px] h-[18px] shrink-0 mt-px ${isEmergency ? 'text-cuervos-orange' : 'text-slate-300'}`}
                  strokeWidth={2}
                />
                <h4 className="font-semibold text-[15px] leading-snug text-cuervos-chalk">
                  {isEmergency ? 'Emergencia: Ancla Central fuera' : 'Sustitución sugerida'}
                </h4>
              </div>
              <span className="chip shrink-0 tabular-nums">{rec.scoreMatch}% match</span>
            </div>

            {/* Substitution flow: out -> in */}
            <div className="rounded-xl bg-cuervos-black/60 border border-white/10 divide-y divide-white/10">
              <div className="flex items-center gap-3 p-3">
                <span className="w-10 h-10 shrink-0 rounded-full border-2 border-slate-600 flex items-center justify-center font-display font-bold tabular-nums text-base text-slate-300">
                  {affected.dorsal}
                </span>
                <div className="min-w-0">
                  <span className="eyebrow">Sale · {MOTIVO_LABELS[rec.motivo] ?? rec.motivo}</span>
                  <p className="font-semibold text-cuervos-chalk truncate">{affected.nombre}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {affected.rolPrimario} · {affected.estatura} cm
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-3 p-3">
                <span className="absolute -top-3 left-[26px] w-6 h-6 rounded-full bg-cuervos-card border border-white/10 flex items-center justify-center">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                </span>
                <span className="w-10 h-10 shrink-0 rounded-full bg-cuervos-black border-2 border-cuervos-orange flex items-center justify-center font-display font-bold tabular-nums text-base text-cuervos-chalk">
                  {sub.dorsal}
                </span>
                <div className="min-w-0">
                  <span className="eyebrow text-orange-200">Entra</span>
                  <p className="font-semibold text-cuervos-chalk truncate">{sub.nombre}</p>
                  <p className="text-xs text-slate-400">
                    Def. int <span className="text-cuervos-chalk font-semibold tabular-nums">{sub.atributos.defensaInteriorRebote}</span>
                    {' · '}
                    Vel <span className="text-cuervos-chalk font-semibold tabular-nums">{sub.atributos.velocidad}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Tactical advice */}
            <p className="flex items-start gap-2 text-[13px] text-slate-300 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
              <span>{rec.consejoTactico}</span>
            </p>

            <button
              type="button"
              onClick={() => {
                onApplyPlanB(rec);
                onNavigateToBoard();
              }}
              className="btn-primary w-full min-h-[44px]"
            >
              <LayoutDashboard className="w-4 h-4" strokeWidth={2} />
              <span>Aplicar en pizarra</span>
            </button>
          </article>
        );
      })}
    </div>
  );
};
