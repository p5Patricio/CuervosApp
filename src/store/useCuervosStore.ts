import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Player, 
  BoardToken, 
  DrawingPath, 
  DefensiveFormation, 
  PlaySequence, 
  PlayFrame,
  PlanBRecommendation,
  TacticalCard, 
  MatchRecord, 
  RivalScoutingCard,
  ActiveTab,
  OpponentBadge
} from '../types';
import { 
  INITIAL_PLAYERS, 
  INITIAL_DEFENSES, 
  INITIAL_TACTICAL_CARDS, 
  INITIAL_MATCH_LOGS, 
  INITIAL_SCOUTING, 
  DEFAULT_BOARD_TOKENS 
} from '../data/seedData';

interface CuervosState {
  // Navigation & View Mode
  activeTab: ActiveTab;
  isFullScreen: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  toggleFullScreen: () => void;

  // Tactical Board State
  tokens: BoardToken[];
  drawingMode: 'move' | 'draw';
  drawings: DrawingPath[];
  drawColor: string;
  drawWidth: number;
  activeFormationId: '2-1-2' | '1-3-1' | '3-2' | null;
  currentStepIndex: number;
  formations: DefensiveFormation[];
  isWeakSideFloatActive: boolean;

  // Sequences / Frames
  sequences: PlaySequence[];
  activeSequenceId: string | null;
  activeSequenceFrameIndex: number;
  isPlayingSequence: boolean;

  // Tactical Board Actions
  setTokens: (tokens: BoardToken[]) => void;
  updateTokenPosition: (id: string, x: number, y: number) => void;
  updateOpponentBadge: (id: string, badge: OpponentBadge | null) => void;
  setDrawingMode: (mode: 'move' | 'draw') => void;
  setDrawColor: (color: string) => void;
  setDrawWidth: (width: number) => void;
  addDrawingPath: (path: DrawingPath) => void;
  clearDrawings: () => void;
  undoLastDrawing: () => void;
  resetTokensToDefault: () => void;
  loadFormation: (id: '2-1-2' | '1-3-1' | '3-2', stepIndex?: number) => void;
  setFormationStep: (stepIndex: number) => void;

  // Play Sequences Actions
  createSequence: (name: string, tipo: 'defensiva' | 'ofensiva') => string;
  addCurrentFrameToSequence: (sequenceId: string, frameName: string) => void;
  loadSequenceFrame: (sequenceId: string, frameIndex: number) => void;
  deleteSequence: (id: string) => void;
  setIsPlayingSequence: (playing: boolean) => void;

  // Roster & Substitutions State
  players: Player[];
  selectedPlayerId: string | null;
  setSelectedPlayerId: (id: string | null) => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  toggleAttendance: (id: string) => void;
  incrementFouls: (id: string) => void;
  decrementFouls: (id: string) => void;
  setFatigue: (id: string, fatigue: number) => void;
  getSmartPlanB: () => PlanBRecommendation[];
  applyPlanBToBoard: (recommendation: PlanBRecommendation) => void;

  // Knowledge Base & Scouting State
  tacticalCards: TacticalCard[];
  matchLogs: MatchRecord[];
  scoutingCards: RivalScoutingCard[];
  addTacticalCard: (card: Omit<TacticalCard, 'id'>) => void;
  updateTacticalCard: (id: string, updates: Partial<TacticalCard>) => void;
  deleteTacticalCard: (id: string) => void;
  addMatchLog: (log: Omit<MatchRecord, 'id'>) => void;
  updateMatchLog: (id: string, updates: Partial<MatchRecord>) => void;
  deleteMatchLog: (id: string) => void;
  addScoutingCard: (card: Omit<RivalScoutingCard, 'id'>) => void;
  updateScoutingCard: (id: string, updates: Partial<RivalScoutingCard>) => void;
  deleteScoutingCard: (id: string) => void;

  // Backup & Reset Actions
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;
  resetToSeedData: () => void;
}

export const useCuervosStore = create<CuervosState>()(
  persist(
    (set, get) => ({
      activeTab: 'pizarra',
      isFullScreen: false,
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

      // Board
      tokens: DEFAULT_BOARD_TOKENS,
      drawingMode: 'move',
      drawings: [],
      drawColor: '#00F0FF',
      drawWidth: 3,
      activeFormationId: '2-1-2',
      currentStepIndex: 0,
      formations: INITIAL_DEFENSES,
      isWeakSideFloatActive: false,

      // Sequences
      sequences: [
        {
          id: 'seq-default-1',
          nombre: 'Rotación 2-1-2 de Banda a Esquina',
          descripcion: 'Demostración de cómo se cierra el ala baja y el Ancla Central protege la verticalidad sin salir de la pintura.',
          tipo: 'defensiva',
          createdAt: new Date().toISOString(),
          frames: [
            {
              id: 'frame-1',
              nombre: 'Paso 1: Balón al Centro',
              tokens: DEFAULT_BOARD_TOKENS,
              duracionMs: 1500,
            },
            {
              id: 'frame-2',
              nombre: 'Paso 2: Pase a 45°',
              tokens: DEFAULT_BOARD_TOKENS.map((t) => {
                if (t.id === 'ball') return { ...t, x: 76, y: 44 };
                if (t.id === 'c-3') return { ...t, x: 70, y: 48 }; // SG presiona
                if (t.id === 'c-2') return { ...t, x: 46, y: 48 }; // PG ayuda al medio
                if (t.id === 'c-4') return { ...t, x: 34, y: 68 }; // SF flota (lado débil)
                if (t.id === 'c-1') return { ...t, x: 56, y: 66 }; // C lado fuerte
                if (t.id === 'o-3') return { ...t, x: 76, y: 38 };
                return t;
              }),
              duracionMs: 1500,
            },
            {
              id: 'frame-3',
              nombre: 'Paso 3: Balón a la Esquina Derecha',
              tokens: DEFAULT_BOARD_TOKENS.map((t) => {
                if (t.id === 'ball') return { ...t, x: 88, y: 82 };
                if (t.id === 'c-5') return { ...t, x: 82, y: 80 }; // PF cierra esquina
                if (t.id === 'c-1') return { ...t, x: 62, y: 74 }; // C vertical aro
                if (t.id === 'c-4') return { ...t, x: 42, y: 68 }; // SF rebote lado débil
                if (t.id === 'c-3') return { ...t, x: 72, y: 62 }; // SG baja trampa
                if (t.id === 'c-2') return { ...t, x: 54, y: 52 }; // PG codo
                if (t.id === 'o-3') return { ...t, x: 88, y: 76 };
                return t;
              }),
              duracionMs: 1500,
            },
          ],
        },
      ],
      activeSequenceId: null,
      activeSequenceFrameIndex: 0,
      isPlayingSequence: false,

      setTokens: (tokens) => set({ tokens }),

      updateTokenPosition: (id, x, y) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) } : t
          ),
        })),

      updateOpponentBadge: (id, badge) =>
        set((state) => ({
          tokens: state.tokens.map((t) => (t.id === id ? { ...t, badge } : t)),
        })),

      setDrawingMode: (drawingMode) => set({ drawingMode }),
      setDrawColor: (drawColor) => set({ drawColor }),
      setDrawWidth: (drawWidth) => set({ drawWidth }),

      addDrawingPath: (path) =>
        set((state) => ({
          drawings: [...state.drawings, path],
        })),

      clearDrawings: () => set({ drawings: [] }),

      undoLastDrawing: () =>
        set((state) => ({
          drawings: state.drawings.slice(0, -1),
        })),

      resetTokensToDefault: () =>
        set({
          tokens: DEFAULT_BOARD_TOKENS,
          activeFormationId: null,
          currentStepIndex: 0,
          isWeakSideFloatActive: false,
        }),

      loadFormation: (id, stepIndex = 0) => {
        const formation = INITIAL_DEFENSES.find((f) => f.id === id);
        if (!formation) return;
        const step = formation.pasos[stepIndex] || formation.pasos[0];

        // Map coords into current tokens
        const updatedTokens: BoardToken[] = [
          // 5 Cuervos mapped by role
          ...step.cuervosCoords.map((coord, idx) => {
            const defaultToken = DEFAULT_BOARD_TOKENS[idx];
            return {
              ...defaultToken,
              role: coord.role,
              x: coord.x,
              y: coord.y,
            };
          }),
          // 5 Opponents mapped
          ...step.opponentsCoords.map((coord, idx) => {
            const oppToken = DEFAULT_BOARD_TOKENS[5 + idx];
            return {
              ...oppToken,
              label: coord.label,
              x: coord.x,
              y: coord.y,
              badge: coord.badge !== undefined ? coord.badge : oppToken.badge,
            };
          }),
          // Ball
          {
            id: 'ball',
            type: 'ball' as const,
            label: '🏀',
            x: step.ballCoords.x,
            y: step.ballCoords.y,
          },
        ];

        set({
          tokens: updatedTokens,
          activeFormationId: id,
          currentStepIndex: stepIndex,
          isWeakSideFloatActive: step.weakSideFloatActive,
        });
      },

      setFormationStep: (stepIndex) => {
        const { activeFormationId, loadFormation } = get();
        if (activeFormationId) {
          loadFormation(activeFormationId, stepIndex);
        }
      },

      // Sequence actions
      createSequence: (name, tipo) => {
        const id = `seq-${Date.now()}`;
        const newSeq: PlaySequence = {
          id,
          nombre: name,
          descripcion: 'Secuencia táctica personalizada de Cuervos',
          tipo,
          createdAt: new Date().toISOString(),
          frames: [
            {
              id: `frame-${Date.now()}-1`,
              nombre: 'Paso 1: Inicio',
              tokens: JSON.parse(JSON.stringify(get().tokens)),
              duracionMs: 1500,
            },
          ],
        };
        set((state) => ({
          sequences: [...state.sequences, newSeq],
          activeSequenceId: id,
          activeSequenceFrameIndex: 0,
        }));
        return id;
      },

      addCurrentFrameToSequence: (sequenceId, frameName) => {
        const currentTokens = JSON.parse(JSON.stringify(get().tokens));
        set((state) => ({
          sequences: state.sequences.map((seq) => {
            if (seq.id === sequenceId) {
              const newFrame: PlayFrame = {
                id: `frame-${Date.now()}`,
                nombre: frameName || `Paso ${seq.frames.length + 1}`,
                tokens: currentTokens,
                duracionMs: 1500,
              };
              return { ...seq, frames: [...seq.frames, newFrame] };
            }
            return seq;
          }),
        }));
      },

      loadSequenceFrame: (sequenceId, frameIndex) => {
        const seq = get().sequences.find((s) => s.id === sequenceId);
        if (!seq || !seq.frames[frameIndex]) return;
        set({
          tokens: JSON.parse(JSON.stringify(seq.frames[frameIndex].tokens)),
          activeSequenceId: sequenceId,
          activeSequenceFrameIndex: frameIndex,
        });
      },

      deleteSequence: (id) =>
        set((state) => ({
          sequences: state.sequences.filter((s) => s.id !== id),
          activeSequenceId: state.activeSequenceId === id ? null : state.activeSequenceId,
        })),

      setIsPlayingSequence: (isPlayingSequence) => set({ isPlayingSequence }),

      // Roster & Substitutions
      players: INITIAL_PLAYERS,
      selectedPlayerId: null,
      setSelectedPlayerId: (selectedPlayerId) => set({ selectedPlayerId }),

      addPlayer: (newPlayerData) => {
        const newPlayer: Player = {
          ...newPlayerData,
          id: `player-${Date.now()}`,
          faltasEnVivo: 0,
          fatiga: 0,
          enBanca: !newPlayerData.esTitular,
        };
        set((state) => ({ players: [...state.players, newPlayer] }));
      },

      updatePlayer: (id, updates) =>
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      toggleAttendance: (id) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id
              ? {
                  ...p,
                  asistencia: p.asistencia === 'presente' ? 'ausente' : 'presente',
                  enBanca: p.asistencia === 'presente' ? true : p.enBanca,
                }
              : p
          ),
        })),

      incrementFouls: (id) =>
        set((state) => ({
          players: state.players.map((p) => {
            if (p.id !== id) return p;
            const nextFouls = Math.min(5, p.faltasEnVivo + 1);
            return {
              ...p,
              faltasEnVivo: nextFouls,
              enBanca: nextFouls >= 5 ? true : p.enBanca,
            };
          }),
        })),

      decrementFouls: (id) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, faltasEnVivo: Math.max(0, p.faltasEnVivo - 1) } : p
          ),
        })),

      setFatigue: (id, fatiga) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, fatiga: Math.max(0, Math.min(100, fatiga)) } : p
          ),
        })),

      // Smart substitution engine ("Plan B")
      getSmartPlanB: () => {
        const { players } = get();
        const recommendations: PlanBRecommendation[] = [];

        // Identify players in trouble: Absent, 4+ fouls, or fatiga >= 75
        const problematicPlayers = players.filter(
          (p) => p.asistencia === 'ausente' || p.faltasEnVivo >= 4 || p.fatiga >= 75
        );

        problematicPlayers.forEach((p) => {
          // Available bench candidates (must be 'presente', not fouled out, not the player himself)
          const candidates = players.filter(
            (c) =>
              c.id !== p.id &&
              c.asistencia === 'presente' &&
              c.faltasEnVivo < 5 &&
              c.fatiga < 80
          );

          if (candidates.length === 0) return;

          const isTallAnchor = p.rolPrimario === 'Ancla Central';

          if (isTallAnchor) {
            // CRITICAL RULE: Mateo Torres (sole tall player) is absent/fouled out!
            // Best candidate is the one with highest defensaInteriorRebote, then resistencia, then speed
            const sortedByInsideDef = [...candidates].sort((a, b) => {
              if (b.atributos.defensaInteriorRebote !== a.atributos.defensaInteriorRebote) {
                return b.atributos.defensaInteriorRebote - a.atributos.defensaInteriorRebote;
              }
              return b.atributos.resistencia - a.atributos.resistencia;
            });

            const best = sortedByInsideDef[0];
            const matchScore = Math.min(98, best.atributos.defensaInteriorRebote * 10 + 5);

            let reasonDesc: 'ausente' | 'faltas_4' | 'faltas_5' | 'fatiga_alta' = 'ausente';
            if (p.asistencia === 'ausente') reasonDesc = 'ausente';
            else if (p.faltasEnVivo === 4) reasonDesc = 'faltas_4';
            else if (p.faltasEnVivo >= 5) reasonDesc = 'faltas_5';
            else if (p.fatiga >= 75) reasonDesc = 'fatiga_alta';

            recommendations.push({
              id: `rec-${p.id}-${best.id}`,
              jugadorAfectado: p,
              motivo: reasonDesc,
              reemplazoSugerido: best,
              scoreMatch: matchScore,
              puestoCubierto: 'Ancla Central',
              esEmergenciaPosteAlto: true,
              consejoTactico: `⚠️ ALERTA CRÍTICA: Perdimos al Ancla Central (${p.nombre}). ${best.nombre} debe ocupar el centro de la llave por su ${best.atributos.defensaInteriorRebote}/10 en Defensa Interior/Rebote. Se RECOMIENDA cambiar a Zona 1-3-1 Agresiva o 3-2 Modificada para compensar la falta de estatura con presión exterior y activar Rebote en Pandilla con los 5 jugadores cerrando el tablero.`,
              cambioDefensivoSugerido: '1-3-1',
            });
          } else {
            // General player replacement
            const sorted = [...candidates].sort((a, b) => {
              // Match by relevant attributes for perimeter/wing
              const scoreA =
                a.atributos.velocidad * 1.5 +
                a.atributos.defensaExteriorRobo * 1.5 +
                a.atributos.resistencia;
              const scoreB =
                b.atributos.velocidad * 1.5 +
                b.atributos.defensaExteriorRobo * 1.5 +
                b.atributos.resistencia;
              return scoreB - scoreA;
            });

            const best = sorted[0];
            const matchScore = Math.min(95, Math.round((best.atributos.velocidad + best.atributos.defensaExteriorRobo) * 5));

            let reasonDesc: 'ausente' | 'faltas_4' | 'faltas_5' | 'fatiga_alta' = 'ausente';
            if (p.asistencia === 'ausente') reasonDesc = 'ausente';
            else if (p.faltasEnVivo === 4) reasonDesc = 'faltas_4';
            else if (p.faltasEnVivo >= 5) reasonDesc = 'faltas_5';
            else if (p.fatiga >= 75) reasonDesc = 'fatiga_alta';

            recommendations.push({
              id: `rec-${p.id}-${best.id}`,
              jugadorAfectado: p,
              motivo: reasonDesc,
              reemplazoSugerido: best,
              scoreMatch: matchScore,
              puestoCubierto: p.rolPrimario,
              esEmergenciaPosteAlto: false,
              consejoTactico: `${best.nombre} ingresa por ${p.nombre} aportando velocidad (${best.atributos.velocidad}/10) y piernas frescas. Mantener rotación rápida y descanso por cuartos.`,
            });
          }
        });

        return recommendations;
      },

      applyPlanBToBoard: (recommendation) => {
        const { tokens, players, loadFormation } = get();
        const affected = recommendation.jugadorAfectado;
        const sub = recommendation.reemplazoSugerido;

        // Replace player on board token
        const newTokens = tokens.map((token) => {
          if (token.playerId === affected.id || (token.type === 'cuervos' && token.number === affected.dorsal)) {
            return {
              ...token,
              playerId: sub.id,
              number: sub.dorsal,
              label: sub.nombre.split(' ')[0].slice(0, 4).toUpperCase(),
              role: recommendation.puestoCubierto,
              fouls: sub.faltasEnVivo,
            };
          }
          return token;
        });

        // Update player bench statuses
        const newPlayers = players.map((p) => {
          if (p.id === affected.id) return { ...p, enBanca: true, esTitular: false };
          if (p.id === sub.id) return { ...p, enBanca: false, esTitular: true };
          return p;
        });

        set({
          tokens: newTokens,
          players: newPlayers,
        });

        // If emergency tall player and defensive change recommended, suggest loading that formation
        if (recommendation.esEmergenciaPosteAlto && recommendation.cambioDefensivoSugerido) {
          loadFormation(recommendation.cambioDefensivoSugerido, 0);
        }
      },

      // Knowledge Base
      tacticalCards: INITIAL_TACTICAL_CARDS,
      matchLogs: INITIAL_MATCH_LOGS,
      scoutingCards: INITIAL_SCOUTING,

      addTacticalCard: (card) =>
        set((state) => ({
          tacticalCards: [...state.tacticalCards, { ...card, id: `card-${Date.now()}` }],
        })),

      updateTacticalCard: (id, updates) =>
        set((state) => ({
          tacticalCards: state.tacticalCards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteTacticalCard: (id) =>
        set((state) => ({
          tacticalCards: state.tacticalCards.filter((c) => c.id !== id),
        })),

      addMatchLog: (log) =>
        set((state) => ({
          matchLogs: [{ ...log, id: `match-${Date.now()}` }, ...state.matchLogs],
        })),

      updateMatchLog: (id, updates) =>
        set((state) => ({
          matchLogs: state.matchLogs.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteMatchLog: (id) =>
        set((state) => ({
          matchLogs: state.matchLogs.filter((m) => m.id !== id),
        })),

      addScoutingCard: (card) =>
        set((state) => ({
          scoutingCards: [...state.scoutingCards, { ...card, id: `scout-${Date.now()}` }],
        })),

      updateScoutingCard: (id, updates) =>
        set((state) => ({
          scoutingCards: state.scoutingCards.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      deleteScoutingCard: (id) =>
        set((state) => ({
          scoutingCards: state.scoutingCards.filter((s) => s.id !== id),
        })),

      // Backup & Restore
      exportDatabaseJson: () => {
        const state = get();
        const exportData = {
          app: 'CuervosApp',
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          data: {
            players: state.players,
            tokens: state.tokens,
            drawings: state.drawings,
            sequences: state.sequences,
            tacticalCards: state.tacticalCards,
            matchLogs: state.matchLogs,
            scoutingCards: state.scoutingCards,
          },
        };
        return JSON.stringify(exportData, null, 2);
      },

      importDatabaseJson: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (!parsed.data) return false;
          const { players, tokens, drawings, sequences, tacticalCards, matchLogs, scoutingCards } = parsed.data;

          set({
            players: players || get().players,
            tokens: tokens || get().tokens,
            drawings: drawings || [],
            sequences: sequences || get().sequences,
            tacticalCards: tacticalCards || get().tacticalCards,
            matchLogs: matchLogs || get().matchLogs,
            scoutingCards: scoutingCards || get().scoutingCards,
          });
          return true;
        } catch (e) {
          console.error('Error importing CuervosApp database:', e);
          return false;
        }
      },

      resetToSeedData: () => {
        set({
          players: INITIAL_PLAYERS,
          tokens: DEFAULT_BOARD_TOKENS,
          drawings: [],
          formations: INITIAL_DEFENSES,
          activeFormationId: '2-1-2',
          currentStepIndex: 0,
          tacticalCards: INITIAL_TACTICAL_CARDS,
          matchLogs: INITIAL_MATCH_LOGS,
          scoutingCards: INITIAL_SCOUTING,
        });
      },
    }),
    {
      name: 'cuervos-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
