import React, { useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { PlayerCard } from './PlayerCard';
import { PlanBAdvisor } from './PlanBAdvisor';
import { PlayerModal } from './PlayerModal';
import { Player } from '../../types';
import { UserPlus, AlertTriangle, UserCheck } from 'lucide-react';

type RosterFilter = 'todos' | 'titulares' | 'banca' | 'ausentes';

const FILTERS: { id: RosterFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'titulares', label: 'Titulares' },
  { id: 'banca', label: 'Banca' },
  { id: 'ausentes', label: 'Ausentes' },
];

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

  const [filter, setFilter] = useState<RosterFilter>('todos');
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
    <div className="w-full max-w-6xl mx-auto px-4 pt-4 pb-6 sm:p-6 space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-[28px] font-bold uppercase text-cuervos-chalk leading-none">Plantilla</h2>
            <p className="mt-1.5 text-[13px] text-slate-400 leading-snug">Asistencia, faltas y fatiga en vivo.</p>
          </div>

          <button type="button" onClick={handleOpenAddModal} className="btn-primary px-3.5 shrink-0">
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            <span>Jugador</span>
          </button>
        </div>

        {/* Quick metrics */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip py-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
            <span className="text-slate-400">Presentes</span>
            <span className="font-display font-bold tabular-nums text-sm text-cuervos-chalk">
              {presentCount}/{players.length}
            </span>
          </span>

          {foulTroubleCount > 0 && (
            <span className="chip-accent py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-cuervos-orange" strokeWidth={2} />
              <span>
                {foulTroubleCount} con 4+ faltas
              </span>
            </span>
          )}
        </div>
      </header>

      {/* Plan B smart substitution engine */}
      <section className="space-y-2.5" aria-labelledby="planb-title">
        <h3 id="planb-title" className="eyebrow">
          Plan B · Sustituciones
        </h3>
        <PlanBAdvisor
          recommendations={planBRecs}
          onApplyPlanB={applyPlanBToBoard}
          onNavigateToBoard={() => setActiveTab('pizarra')}
        />
      </section>

      {/* Filters */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div role="tablist" aria-label="Filtrar jugadores" className="seg flex-1 min-w-0">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className="seg-item px-2.5"
              >
                {label}
              </button>
            ))}
          </div>
          <span className="hidden min-[400px]:inline text-xs text-slate-500 tabular-nums shrink-0">
            {filteredPlayers.length}
          </span>
        </div>

        {/* Player cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

        {filteredPlayers.length === 0 && (
          <p className="surface py-8 text-center text-sm text-slate-400">No hay jugadores en este filtro.</p>
        )}
      </section>

      {/* Player add/edit modal */}
      <PlayerModal
        player={editingPlayer}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePlayer}
      />
    </div>
  );
};
