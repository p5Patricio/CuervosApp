import React from 'react';
import { PlanBRecommendation } from '../../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  LayoutDashboard,
  Sparkles,
  Info
} from 'lucide-react';

interface PlanBAdvisorProps {
  recommendations: PlanBRecommendation[];
  onApplyPlanB: (rec: PlanBRecommendation) => void;
  onNavigateToBoard: () => void;
}

export const PlanBAdvisor: React.FC<PlanBAdvisorProps> = ({
  recommendations,
  onApplyPlanB,
  onNavigateToBoard,
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/40 via-cuervos-card to-cuervos-card border border-emerald-500/40 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Plan A en Marcha • Plantilla al 100%</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Todos los titulares están disponibles, con menos de 4 faltas y niveles óptimos de energía. La Zona 2-1-2 Compacta opera con el Ancla Central en cancha.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const affected = rec.jugadorAfectado;
        const sub = rec.reemplazoSugerido;

        return (
          <div
            key={rec.id}
            className={`border rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all ${
              rec.esEmergenciaPosteAlto
                ? 'bg-gradient-to-br from-red-950/40 via-cuervos-dark to-cuervos-card border-red-500/80 ring-2 ring-red-500/20'
                : 'bg-cuervos-card border-amber-500/60'
            }`}
          >
            {/* Top Warning Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cuervos-border/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`w-5 h-5 ${
                    rec.esEmergenciaPosteAlto ? 'text-red-400 animate-pulse' : 'text-amber-400'
                  }`}
                />
                <span className="font-black text-sm uppercase tracking-wide text-white">
                  {rec.esEmergenciaPosteAlto
                    ? '⚠️ PROTOCOLO DE EMERGENCIA: ANCLA CENTRAL FUERA DE CANCHA'
                    : '⚡ ALERTA DE SUSTITUCIÓN INTELIGENTE (PLAN B)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cuervos-elevated text-cuervos-cyan border border-cuervos-cyan/30">
                  Compatibilidad: {rec.scoreMatch}%
                </span>
              </div>
            </div>

            {/* Substitution Flow: Affected Player -> Substituted Player */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Left: Affected Player */}
              <div className="bg-cuervos-dark/80 rounded-xl p-3 border border-cuervos-border/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                    {rec.motivo === 'ausente'
                      ? 'Jugador Ausente'
                      : rec.motivo === 'faltas_5'
                      ? 'Eliminado por 5 Faltas'
                      : rec.motivo === 'faltas_4'
                      ? 'Peligro (4 Faltas acumuladas)'
                      : 'Fatiga Crítica (>75%)'}
                  </span>
                  <h4 className="font-bold text-white text-base">
                    #{affected.dorsal} {affected.nombre}
                  </h4>
                  <span className="text-xs text-slate-400">{affected.rolPrimario} ({affected.estatura} cm)</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-950 border border-red-500/50 flex items-center justify-center text-red-300 font-black font-mono">
                  #{affected.dorsal}
                </div>
              </div>

              {/* Right: Best Available Replacement */}
              <div className="bg-cuervos-dark/80 rounded-xl p-3 border border-cuervos-cyan/60 shadow-cyan-glow flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cuervos-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Mejor Reemplazo Disponible</span>
                  </span>
                  <h4 className="font-bold text-white text-base">
                    #{sub.dorsal} {sub.nombre}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>Def. Interior: <strong className="text-amber-400">{sub.atributos.defensaInteriorRebote}/10</strong></span>
                    <span>•</span>
                    <span>Vel: <strong className="text-cuervos-cyan">{sub.atributos.velocidad}/10</strong></span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-cuervos-elevated border border-cuervos-cyan text-cuervos-cyan font-black font-mono shadow-md">
                  #{sub.dorsal}
                </div>
              </div>
            </div>

            {/* Tactical Advice & System Action */}
            <div className="mt-3 bg-cuervos-950/80 rounded-xl p-3 border border-cuervos-border/50 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-200 leading-relaxed font-sans">{rec.consejoTactico}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-cuervos-border/30">
                <button
                  onClick={() => {
                    onApplyPlanB(rec);
                    onNavigateToBoard();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cuervos-cyan text-cuervos-950 font-black text-xs shadow-cyan-glow hover:bg-cuervos-cyan-hover transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Aplicar Plan B en Pizarra y Ver Rotación</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
