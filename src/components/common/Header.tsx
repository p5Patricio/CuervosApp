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

  return (
    <>
      <header className="bg-cuervos-950/90 backdrop-blur-md border-b border-cuervos-border/70 sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-cuervos-dark border border-cuervos-cyan/60 shadow-cyan-glow shrink-0 flex items-center justify-center">
              <img
                src="/logo-cuervos.png"
                alt="Logo Oficial Cuervos Básquetbol"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  // Fallback to svg if png fails
                  (e.target as HTMLImageElement).src = '/logo-cuervos.svg';
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-white text-base sm:text-lg tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <span>CUERVOS</span>
                  <span className="text-cuervos-cyan text-xs font-sans tracking-normal px-1.5 py-0.2 rounded bg-cuervos-elevated border border-cuervos-cyan/30">
                    APP
                  </span>
                </h1>
                {/* Offline Badge */}
                <div className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Local-First</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden xs:block">
                Táctica FIBA • Sustituciones Inteligentes • Cancha Techada
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center bg-cuervos-dark/90 p-1 rounded-xl border border-cuervos-border/80 shadow-inner">
            <button
              onClick={() => setActiveTab('pizarra')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pizarra'
                  ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-white hover:bg-cuervos-elevated'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Pizarra Táctica</span>
              <span className="sm:hidden">Pizarra</span>
            </button>

            <button
              onClick={() => setActiveTab('plantilla')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'plantilla'
                  ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-white hover:bg-cuervos-elevated'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Plantilla & Plan B</span>
              <span className="sm:hidden">Plantilla</span>
            </button>

            <button
              onClick={() => setActiveTab('conocimiento')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'conocimiento'
                  ? 'bg-cuervos-cyan text-cuervos-950 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-white hover:bg-cuervos-elevated'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Wiki & Partidos</span>
              <span className="sm:hidden">Wiki</span>
            </button>
          </nav>

          {/* Right Actions: Local DB Backup */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setBackupOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cuervos-elevated hover:bg-cuervos-border text-slate-300 hover:text-white border border-cuervos-border/70 text-xs font-bold transition-all shadow-sm"
              title="Administrar copia de seguridad local JSON"
            >
              <Database className="w-3.5 h-3.5 text-cuervos-cyan" />
              <span className="hidden md:inline">Respaldo JSON</span>
            </button>
          </div>
        </div>
      </header>

      <BackupModal isOpen={backupOpen} onClose={() => setBackupOpen(false)} />
    </>
  );
};
