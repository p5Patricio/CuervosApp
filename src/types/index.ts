export type PlayerRole = 
  | 'Ancla Central'
  | 'Guardia / Base'
  | 'Ala Rápida'
  | 'Alero Bajo'
  | 'Escolta Tirador'
  | 'Sexto Hombre / Multirrol';

export interface PlayerAttributes {
  velocidad: number; // 1-10
  resistencia: number; // 1-10
  defensaInteriorRebote: number; // 1-10
  defensaExteriorRobo: number; // 1-10
}

export interface Player {
  id: string;
  nombre: string;
  dorsal: number;
  estatura: number; // in cm, e.g. 196
  rolPrimario: PlayerRole;
  rolSecundario?: PlayerRole;
  atributos: PlayerAttributes;
  asistencia: 'presente' | 'ausente';
  faltasEnVivo: number; // 0 to 5
  fatiga: number; // 0 (descansado) to 100 (exhausto)
  esTitular: boolean;
  enBanca: boolean;
  avatarColor?: string;
}

export type OpponentBadge = 'Tirador Letal' | 'Flotar (No tira)' | 'Poste Rival';

export interface BoardToken {
  id: string;
  type: 'cuervos' | 'opponent' | 'ball';
  playerId?: string;
  label: string;
  number?: number;
  x: number; // 0-100 normalized
  y: number; // 0-100 normalized
  badge?: OpponentBadge | null;
  fouls?: number;
  role?: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  isArrow: boolean;
  type: 'free' | 'arrow' | 'pass' | 'screen';
}

export type BallPositionKey = 'center' | 'wing_right' | 'wing_left' | 'corner_right' | 'corner_left';

export interface FormationStep {
  name: string;
  ballZone: BallPositionKey;
  ballCoords: { x: number; y: number };
  cuervosCoords: { role: PlayerRole; x: number; y: number; duty: string }[];
  opponentsCoords: { label: string; x: number; y: number; badge?: OpponentBadge | null }[];
  tacticalTip: string;
  weakSideFloatActive: boolean;
}

export interface DefensiveFormation {
  id: '2-1-2' | '1-3-1' | '3-2';
  nombre: string;
  apodo: string;
  cuartosRecomendados: string;
  objetivoPrincipal: string;
  reglaCritica: string;
  pasos: FormationStep[];
}

export interface PlayFrame {
  id: string;
  nombre: string;
  tokens: BoardToken[];
  trazos?: DrawingPath[];
  duracionMs?: number;
}

export interface PlaySequence {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'defensiva' | 'ofensiva';
  frames: PlayFrame[];
  createdAt: string;
}

export interface PlanBRecommendation {
  id: string;
  jugadorAfectado: Player;
  motivo: 'ausente' | 'faltas_4' | 'faltas_5' | 'fatiga_alta';
  reemplazoSugerido: Player;
  scoreMatch: number; // 0 - 100
  puestoCubierto: PlayerRole;
  esEmergenciaPosteAlto: boolean;
  consejoTactico: string;
  cambioDefensivoSugerido?: '2-1-2' | '1-3-1' | '3-2';
}

export interface TacticalCard {
  id: string;
  seccion: 'dosificacion' | 'reglas_de_oro' | 'defensas' | 'contraataque';
  titulo: string;
  subtitulo: string;
  puntosClave: string[];
  detalles: string;
  icono?: string;
}

export interface MatchQuarterScore {
  cuervos: number;
  rival: number;
}

export interface MatchRecord {
  id: string;
  fecha: string;
  equipoRival: string;
  q1: MatchQuarterScore;
  q2: MatchQuarterScore;
  q3: MatchQuarterScore;
  q4: MatchQuarterScore;
  defensaMasEfectiva: 'Zona 2-1-2 Compacta' | 'Zona 1-3-1 Agresiva' | 'Zona 3-2 Modificada' | 'Hombre a Hombre';
  nivelEnergiaQ4: 'Óptima (Pudimos presionar)' | 'Media (Aguantamos)' | 'Agotados (Cayeron piernas)';
  resultado: 'Victoria' | 'Derrota';
  notasTacticas: string;
}

export interface RivalScoutingCard {
  id: string;
  nombreEquipo: string;
  ritmoDeJuego: 'Rápido y alocado' | 'Pausado y físico' | 'Perimetral / Triplero';
  jugadoresClave: {
    dorsal: number;
    etiqueta: OpponentBadge;
    instruccionDefensiva: string;
  }[];
  fortaleza: string;
  debilidadAExplotar: string;
  defensaSugerida: '2-1-2' | '1-3-1' | '3-2';
  notas: string;
}

export type ActiveTab = 'pizarra' | 'plantilla' | 'conocimiento';
