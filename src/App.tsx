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

  const navItems = [
    { id: 'pizarra' as const, label: 'Pizarra', Icon: LayoutDashboard },
    { id: 'plantilla' as const, label: 'Plantilla', Icon: Users },
    { id: 'conocimiento' as const, label: 'Wiki', Icon: BookOpen },
  ];
  const showBottomNav = !isFullScreen || activeTab !== 'pizarra';

  return (
    <div className="min-h-screen bg-cuervos-950 flex flex-col font-sans text-cuervos-chalk antialiased">
      <Header />

      {/* Offline strip: informative, not alarming */}
      {!isOnline && (
        <div className="bg-cuervos-dark border-b border-white/5 px-4 py-1 text-center text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Sin conexión — todo sigue guardado localmente</span>
        </div>
      )}

      <main className={`flex-1 flex flex-col overflow-x-hidden overscroll-none ${showBottomNav ? 'pb-nav' : ''}`}>
        {activeTab === 'pizarra' && <TacticalBoard />}
        {activeTab === 'plantilla' && <RosterManager />}
        {activeTab === 'conocimiento' && <KnowledgeBase />}
      </main>

      {/* Mobile bottom navigation */}
      {showBottomNav && (
        <nav
          aria-label="Secciones"
          className="sm:hidden fixed bottom-0 inset-x-0 z-40 glass border-x-0 border-b-0"
          style={{ paddingBottom: 'var(--safe-bottom)' }}
        >
          <div className="h-[var(--nav-h)] grid grid-cols-3">
            {navItems.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-wide transition-colors ${
                    isActive ? 'text-cuervos-chalk' : 'text-slate-500'
                  }`}
                >
                  {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-cuervos-orange" />}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cuervos-orange' : ''}`} strokeWidth={1.75} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
