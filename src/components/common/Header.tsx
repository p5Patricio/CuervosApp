import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { BackupModal } from './BackupModal';
import { LayoutDashboard, Users, BookOpen, Database } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, isFullScreen } = useCuervosStore();
  const [backupOpen, setBackupOpen] = useState(false);

  // If in real full-screen mode on tactical board, hide main header to give 100% viewport to the court!
  if (isFullScreen && activeTab === 'pizarra') {
    return null;
  }

  const tabs = [
    { id: 'pizarra' as const, label: 'Pizarra', Icon: LayoutDashboard },
    { id: 'plantilla' as const, label: 'Plantilla', Icon: Users },
    { id: 'conocimiento' as const, label: 'Wiki', Icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 h-[var(--header-h)] glass border-x-0 border-t-0 px-3 sm:px-6">
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-cuervos-dark ring-1 ring-white/10 shrink-0 flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}logo-cuervos.png`}
                alt="Logo Oficial Cuervos Básquetbol"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  const fallbackUrl = `${import.meta.env.BASE_URL}logo-cuervos.svg`;
                  if (!target.src.endsWith('logo-cuervos.svg')) {
                    target.src = fallbackUrl;
                  }
                }}
              />
            </div>
            <h1 className="font-display font-bold text-cuervos-chalk text-lg uppercase leading-none tracking-[0.12em]">
              Cuervos
            </h1>
          </div>

          {/* Desktop navigation (mobile uses the bottom bar) */}
          <nav className="hidden sm:flex items-center gap-1" aria-label="Secciones">
            {tabs.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 h-10 px-3 text-sm font-semibold transition-colors ${
                    isActive ? 'text-cuervos-chalk' : 'text-slate-400 hover:text-cuervos-chalk'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-[5px] h-0.5 rounded-full bg-cuervos-orange" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Local JSON backup */}
          <button
            onClick={() => setBackupOpen(true)}
            className="ctl-icon shrink-0"
            title="Administrar copia de seguridad local JSON"
            aria-label="Respaldo JSON"
          >
            <Database className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <BackupModal isOpen={backupOpen} onClose={() => setBackupOpen(false)} />
    </>
  );
};
