import React, { useState } from 'react';
import { TacticalManualView } from './TacticalManualView';
import { MatchLogsView } from './MatchLogsView';
import { ScoutingView } from './ScoutingView';
import { BookOpen, Trophy, Crosshair } from 'lucide-react';

type SubTab = 'manual' | 'bitacora' | 'scouting';

const SUB_TABS: { id: SubTab; label: string; Icon: typeof BookOpen }[] = [
  { id: 'manual', label: 'Manual Táctico', Icon: BookOpen },
  { id: 'bitacora', label: 'Bitácora', Icon: Trophy },
  { id: 'scouting', label: 'Scouting', Icon: Crosshair },
];

export const KnowledgeBase: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('manual');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-4 pb-6 sm:p-6 space-y-5">
      {/* Sub-tab navigation: single segmented control */}
      <nav role="tablist" aria-label="Base de conocimiento" className="seg">
        {SUB_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={subTab === id}
            onClick={() => setSubTab(id)}
            className="seg-item"
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* View router */}
      {subTab === 'manual' && <TacticalManualView />}
      {subTab === 'bitacora' && <MatchLogsView />}
      {subTab === 'scouting' && <ScoutingView />}
    </div>
  );
};
