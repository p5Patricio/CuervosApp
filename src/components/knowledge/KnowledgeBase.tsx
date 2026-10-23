import React, { useState } from 'react';
import { TacticalManualView } from './TacticalManualView';
import { MatchLogsView } from './MatchLogsView';
import { ScoutingView } from './ScoutingView';
import { BookOpen, Trophy, Crosshair } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [subTab, setSubTab] = useState<'manual' | 'bitacora' | 'scouting'>('manual');

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cuervos-dark/80 border border-cuervos-border/70 p-3 rounded-2xl shadow-card backdrop-blur-md">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSubTab('manual')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === 'manual'
                ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
                : 'text-slate-400 hover:text-white hover:bg-cuervos-elevated'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Manual Táctico (Wiki)</span>
          </button>

          <button
            onClick={() => setSubTab('bitacora')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === 'bitacora'
                ? 'bg-amber-400 text-slate-950 shadow-amber-glow'
                : 'text-slate-400 hover:text-white hover:bg-cuervos-elevated'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Bitácora de Partidos</span>
          </button>

          <button
            onClick={() => setSubTab('scouting')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === 'scouting'
                ? 'bg-red-500 text-white shadow-red-glow'
                : 'text-slate-400 hover:text-white hover:bg-cuervos-elevated'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Scouting de Rivales</span>
          </button>
        </div>
      </div>

      {/* View router */}
      {subTab === 'manual' && <TacticalManualView />}
      {subTab === 'bitacora' && <MatchLogsView />}
      {subTab === 'scouting' && <ScoutingView />}
    </div>
  );
};
