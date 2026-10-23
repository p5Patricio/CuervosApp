import React, { useEffect, useState } from 'react';
import { useCuervosStore } from './store/useCuervosStore';
import { Header } from './components/common/Header';
import { TacticalBoard } from './components/tactical/TacticalBoard';
import { RosterManager } from './components/roster/RosterManager';
import { KnowledgeBase } from './components/knowledge/KnowledgeBase';
import { LayoutDashboard, Users, BookOpen, WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, isFullScreen } = useCuervosStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cuervos-950 flex flex-col font-sans text-slate-100 antialiased selection:bg-cuervos-cyan selection:text-cuervos-950">
      {/* Header (hidden in fullscreen tactical board) */}
      <Header />

      {/* Offline Alert Strip (Only visible when offline, celebrating local-first) */}
      {!isOnline && (
        <div className="bg-amber-500 text-cuervos-950 px-4 py-1 text-center text-xs font-black flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>MODO OFFLINE CANCHA: Todas tus funciones tácticas y guardado local siguen operando al 100%.</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {activeTab === 'pizarra' && <TacticalBoard />}
        {activeTab === 'plantilla' && <RosterManager />}
        {activeTab === 'conocimiento' && <KnowledgeBase />}
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden when on board in full-screen) */}
      {(!isFullScreen || activeTab !== 'pizarra') && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-cuervos-950/95 backdrop-blur-lg border-t border-cuervos-border/70 px-4 py-2 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setActiveTab('pizarra')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'pizarra' ? 'text-cuervos-cyan' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Pizarra</span>
          </button>

          <button
            onClick={() => setActiveTab('plantilla')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'plantilla' ? 'text-cuervos-cyan' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Plantilla</span>
          </button>

          <button
            onClick={() => setActiveTab('conocimiento')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === 'conocimiento' ? 'text-cuervos-cyan' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Wiki</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
