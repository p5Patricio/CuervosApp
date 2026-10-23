import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { PlayerCard } from './PlayerCard';
import { PlanBAdvisor } from './PlanBAdvisor';
import { PlayerModal } from './PlayerModal';
import { Player } from '../../types';
import { 
  Users, 
  UserPlus, 
  AlertCircle, 
  Sparkles
} from 'lucide-react';

export const RosterManager: React.FC = () => {
  const {
    players,
    toggleAttendance,
    incrementFouls,
    decrementFouls,
    setFatigue,
    addPlayer,
    updatePlayer,
    deletePlayer,
    getSmartPlanB,
    applyPlanBToBoard,
    setActiveTab,
  } = useCuervosStore();

  const [filter, setFilter] = useState<'todos' | 'titulares' | 'banca' | 'ausentes'>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const planBRecs = getSmartPlanB();

  const handleOpenAddModal = () => {
    setEditingPlayer(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (player: Player) => {
    setEditingPlayer(player);
    setModalOpen(true);
  };

  const handleSavePlayer = (data: any) => {
    if (data.id) {
      updatePlayer(data.id, data);
    } else {
      addPlayer(data);
    }
  };

  // Filtered players
  const filteredPlayers = players.filter((p) => {
    if (filter === 'titulares') return p.esTitular;
    if (filter === 'banca') return !p.esTitular;
    if (filter === 'ausentes') return p.asistencia === 'ausente';
    return true;
  });

  const presentCount = players.filter((p) => p.asistencia === 'presente').length;
  const foulTroubleCount = players.filter((p) => p.faltasEnVivo >= 4).length;
  const maxTeamHeight = players.length > 0 ? Math.max(...players.map((p) => p.estatura)) : 180;

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cuervos-dark/80 border border-cuervos-border/70 p-4 sm:p-5 rounded-2xl shadow-card backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cuervos-cyan" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Plantilla & Motor de Sustituciones ("Plan B")
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Gestión en vivo de asistencia, faltas y fatiga. Si nuestro único poste alto se carga de faltas o falta un titular, el sistema calcula de inmediato el mejor reemplazo y adapta la pizarra.
          </p>
        </div>

        {/* Quick Stats Counter & Add Player */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cuervos-card border border-cuervos-border/80 text-xs">
            <span className="text-slate-400">Presentes:</span>
            <span className="font-mono font-bold text-emerald-400">{presentCount}/{players.length}</span>
          </div>

          {foulTroubleCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 animate-pulse">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{foulTroubleCount} en peligro de expulsión</span>
            </div>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cuervos-cyan text-cuervos-950 font-black text-xs shadow-cyan-glow hover:bg-cuervos-cyan-hover transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar Jugador</span>
          </button>
        </div>
      </div>

      {/* Plan B Smart Substitution Engine (Featured Panel) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cuervos-cyan" />
            <span>Motor de Asignación Inteligente ("¿Qué pasa si falta alguien?")</span>
          </div>
        </div>

        <PlanBAdvisor
          recommendations={planBRecs}
          onApplyPlanB={applyPlanBToBoard}
          onNavigateToBoard={() => setActiveTab('pizarra')}
        />
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-cuervos-border/60 pb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {(['todos', 'titulares', 'banca', 'ausentes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-cuervos-elevated text-cuervos-cyan border border-cuervos-cyan/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-cuervos-card'
              }`}
            >
              {tab === 'todos' ? 'Todos los Cuervos' : tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredPlayers.length} jugador(es)
        </span>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onToggleAttendance={toggleAttendance}
            onIncrementFouls={incrementFouls}
            onDecrementFouls={decrementFouls}
            onSetFatigue={setFatigue}
            onEdit={handleOpenEditModal}
            onDelete={deletePlayer}
            isSoleTallPlayer={player.rolPrimario === 'Ancla Central' || player.estatura === maxTeamHeight}
          />
        ))}
      </div>

      {/* Player Add/Edit Modal */}
      <PlayerModal
        player={editingPlayer}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePlayer}
      />
    </div>
  );
};
