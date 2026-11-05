import { PlaySequence, BoardToken } from '../types';

/**
 * 5 Jugadas Ofensivas Fundamentales 5 vs 5 para Baloncesto Competitivo FIBA.
 * Diseñadas para Cuervos con espaciado profesional (spacing), cortes, pantallas directas,
 * pantallas ciegas (backscreen) y lectura de ventajas tácticas.
 */

// Helper para construir fichas base de Cuervos
const createCuervosTokens = (coords: { id: string; number: number; label: string; role: string; x: number; y: number; fouls?: number }[]): BoardToken[] =>
  coords.map((c) => ({
    id: c.id,
    type: 'cuervos' as const,
    playerId: c.id === 'c-1' ? 'player-1' : c.id === 'c-2' ? 'player-2' : c.id === 'c-3' ? 'player-3' : c.id === 'c-4' ? 'player-4' : 'player-5',
    number: c.number,
    label: c.label,
    role: c.role,
    x: c.x,
    y: c.y,
    fouls: c.fouls ?? 0,
  }));

// Helper para construir fichas de oponentes
const createOpponentTokens = (coords: { id: string; label: string; x: number; y: number; badge?: 'Tirador Letal' | 'Flotar (No tira)' | 'Poste Rival' | null }[]): BoardToken[] =>
  coords.map((c) => ({
    id: c.id,
    type: 'opponent' as const,
    label: c.label,
    number: parseInt(c.label.replace('O', ''), 10) || 1,
    x: c.x,
    y: c.y,
    badge: c.badge ?? null,
  }));

export const FUNDAMENTAL_5V5_PLAYS: PlaySequence[] = [
  // -------------------------------------------------------------
  // 1. PICK & ROLL CENTRAL (Bloqueo Directo y Continuación)
  // -------------------------------------------------------------
  {
    id: 'play-pick-and-roll',
    nombre: 'Pick & Roll Central',
    subtitulo: 'Bloqueo Directo y Continuación al Aro',
    descripcion: 'La jugada más letal y común en el baloncesto moderno. Genera ventaja 2v1 en cabecera obligando a la defensa a elegir entre el tiro del base o la caída del pívot.',
    tipo: 'ofensiva',
    createdAt: '2026-11-04T00:00:00.000Z',
    puntosClave: [
      'Espaciado perimetral obligatorio: los aleros abren las esquinas para evitar ayudas defensivas.',
      'El pívot (Drigo #15) debe hacer contacto hombro con hombro al plantar la pantalla.',
      'El base (Pato #7) ataca hacia el carril libre dividiendo la contención rival.',
      'Pase de bolsillo ("pocket pass") cuando el poste rival sube a ayudar.',
    ],
    frames: [
      {
        id: 'pnr-f1',
        nombre: 'Paso 1: Inicio y Subida de Pantalla',
        duracionMs: 1800,
        descripcion: 'Pato (#7) maneja el balón en cabecera. Drigo (#15) sube desde el poste medio para poner la pantalla directa. Tiradores abiertos a 45° y esquinas.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 50, y: 52 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 50, y: 24 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 80, y: 44 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 20, y: 44 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 86, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 50, y: 29, badge: 'Tirador Letal' },
            { id: 'o-2', label: 'O2', x: 74, y: 46 },
            { id: 'o-3', label: 'O3', x: 26, y: 46 },
            { id: 'o-4', label: 'O4', x: 82, y: 78 },
            { id: 'o-5', label: 'O5', x: 50, y: 60, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 24 },
        ],
      },
      {
        id: 'pnr-f2',
        nombre: 'Paso 2: Contacto de Bloqueo y Desborde',
        duracionMs: 1800,
        descripcion: 'Drigo planta el bloqueo sobre O1. Pato ataca agresivo por el hombro derecho de Drigo. O5 (poste rival) sale en contención ("drop").',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 46, y: 27 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 58, y: 32 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 80, y: 44 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 48 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 86, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 48, y: 29, badge: 'Tirador Letal' },
            { id: 'o-2', label: 'O2', x: 74, y: 46 },
            { id: 'o-3', label: 'O3', x: 28, y: 52 },
            { id: 'o-4', label: 'O4', x: 82, y: 78 },
            { id: 'o-5', label: 'O5', x: 56, y: 40, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 58, y: 32 },
        ],
      },
      {
        id: 'pnr-f3',
        nombre: 'Paso 3: Penetración y Caída ("Roll") de Drigo',
        duracionMs: 1800,
        descripcion: 'Pato penetra al tiro libre atrayendo a O1 y O5. Drigo gira el pie de pivote y cae con fuerza hacia la pintura con carril abierto.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 50, y: 58 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 64, y: 48 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 82, y: 46 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 54 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 88, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 58, y: 42, badge: 'Tirador Letal' },
            { id: 'o-2', label: 'O2', x: 76, y: 48 },
            { id: 'o-3', label: 'O3', x: 34, y: 60 },
            { id: 'o-4', label: 'O4', x: 78, y: 74 },
            { id: 'o-5', label: 'O5', x: 62, y: 52, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 64, y: 48 },
        ],
      },
      {
        id: 'pnr-f4',
        nombre: 'Paso 4: Pase de Bolsillo y Definición Bajo Aro',
        duracionMs: 1800,
        descripcion: 'Pato asiste picado a las manos de Drigo en el corazón de la zona. Drigo anota bandeja o mate incontestable contra tablero.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 50, y: 74 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 65, y: 50 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 84, y: 48 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 16, y: 60 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 88, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 62, y: 46, badge: 'Tirador Letal' },
            { id: 'o-2', label: 'O2', x: 78, y: 52 },
            { id: 'o-3', label: 'O3', x: 38, y: 68 },
            { id: 'o-4', label: 'O4', x: 68, y: 76 },
            { id: 'o-5', label: 'O5', x: 58, y: 62, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 74 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. HORNS / CUERNOS (Ataque Doble Poste Alto)
  // -------------------------------------------------------------
  {
    id: 'play-horns',
    nombre: 'Horns (Cuernos)',
    subtitulo: 'Doble Bloqueo Alto, Pop y Tiro Perimetral',
    descripcion: 'Alineación FIBA clásica con dos postes en los codos del tiro libre. Otorga al base la libertad de atacar por izquierda o derecha y combina un Roll con un Pick & Pop.',
    tipo: 'ofensiva',
    createdAt: '2026-11-04T00:00:00.000Z',
    puntosClave: [
      'Ambos postes se ubican en los codos libres (free throw elbows) para liberar toda la pintura.',
      'Los aleros se colocan en esquinas profundas para castigar cualquier ayuda defensiva.',
      'El poste que no cae al aro se abre a la línea de 3 ("Pick & Pop").',
      'Excelente contra defensas zonales y hombres pesados.',
    ],
    frames: [
      {
        id: 'horns-f1',
        nombre: 'Paso 1: Alineación en Cuernos',
        duracionMs: 1800,
        descripcion: 'Pato (#7) en cabecera. Drigo (#15) y Martin (#5) en los dos codos del tiro libre. Diego (#11) y Nico (#23) en las esquinas profundas.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 38, y: 46 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 50, y: 22 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 86, y: 84 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 14, y: 84 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 62, y: 46 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 50, y: 27 },
            { id: 'o-2', label: 'O2', x: 82, y: 80, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 18, y: 80 },
            { id: 'o-4', label: 'O4', x: 62, y: 51 },
            { id: 'o-5', label: 'O5', x: 38, y: 51, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 22 },
        ],
      },
      {
        id: 'horns-f2',
        nombre: 'Paso 2: Doble Pantalla y Elección de Salida',
        duracionMs: 1800,
        descripcion: 'Drigo y Martin suben a poner doble pantalla. Pato amaga hacia la izquierda y ataca agresivo por el bloqueo derecho de Martin.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 44, y: 26 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 64, y: 32 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 86, y: 84 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 14, y: 84 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 56, y: 26 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 54, y: 28 },
            { id: 'o-2', label: 'O2', x: 82, y: 80, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 18, y: 80 },
            { id: 'o-4', label: 'O4', x: 66, y: 38 },
            { id: 'o-5', label: 'O5', x: 42, y: 34, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 64, y: 32 },
        ],
      },
      {
        id: 'horns-f3',
        nombre: 'Paso 3: Caída de Drigo y Pop de Martin',
        duracionMs: 1800,
        descripcion: 'Drigo corta fulgurante hacia la canasta. Martin se abre a la línea de tres ("Pop"). O2 se ve obligado a descuidar a Diego para tapar a Drigo.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 48, y: 64 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 64, y: 46 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 86, y: 84 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 14, y: 84 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 68, y: 25 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 60, y: 36 },
            { id: 'o-2', label: 'O2', x: 72, y: 72, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 24, y: 76 },
            { id: 'o-4', label: 'O4', x: 66, y: 44 },
            { id: 'o-5', label: 'O5', x: 48, y: 56, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 64, y: 46 },
        ],
      },
      {
        id: 'horns-f4',
        nombre: 'Paso 4: Asistencia Teledirigida a la Esquina',
        duracionMs: 1800,
        descripcion: 'Pato lee la ayuda defensiva y saca pase preciso a la esquina derecha. Diego (#11) recibe totalmente libre para clavar el triple.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 50, y: 74 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 64, y: 46 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 86, y: 84 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 14, y: 84 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 68, y: 25 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 62, y: 40 },
            { id: 'o-2', label: 'O2', x: 74, y: 78, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 28, y: 74 },
            { id: 'o-4', label: 'O4', x: 66, y: 44 },
            { id: 'o-5', label: 'O5', x: 50, y: 70, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 86, y: 84 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. GIVE & GO / PASAR Y CORTAR
  // -------------------------------------------------------------
  {
    id: 'play-give-and-go',
    nombre: 'Give & Go (Pasar y Cortar)',
    subtitulo: 'Fundamento Puro: Pase al Ala y Puerta al Frente',
    descripcion: 'El principio táctico más antiguo e infalible del baloncesto. Se aprovecha el momento exacto en que el defensor del pasador gira la cabeza hacia el balón.',
    tipo: 'ofensiva',
    createdAt: '2026-11-04T00:00:00.000Z',
    puntosClave: [
      'Pase firme al pecho del ala a 45°.',
      'Finta obligatoria con el pie opuesto para sacar al defensor de su balance.',
      'Cambio de ritmo explosivo cortando por delante de la cara del defensor hacia el aro.',
      'Pase de devolución suave en ventaja para bandeja contra cristal.',
    ],
    frames: [
      {
        id: 'gng-f1',
        nombre: 'Paso 1: Entrada y Despeje de la Pintura',
        duracionMs: 1600,
        descripcion: 'Pato (#7) en cabecera. Drigo (#15) se sitúa en el poste bajo contrario para dejar vacía la calle central. Diego (#11) recibe a 45°.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 34, y: 74 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 50, y: 25 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 78, y: 40 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 82 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 32, y: 48 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 50, y: 30 },
            { id: 'o-2', label: 'O2', x: 74, y: 44 },
            { id: 'o-3', label: 'O3', x: 22, y: 78 },
            { id: 'o-4', label: 'O4', x: 36, y: 52 },
            { id: 'o-5', label: 'O5', x: 34, y: 78, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 25 },
        ],
      },
      {
        id: 'gng-f2',
        nombre: 'Paso 2: Pase al Ala y Finta de Despiste',
        duracionMs: 1600,
        descripcion: 'Pato pasa a Diego a 45°. Pato da un amago de retroceso y el defensor O1 comete el pecado capital: gira el cuello para ver el balón.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 34, y: 74 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 46, y: 24 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 78, y: 40 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 82 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 32, y: 48 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 50, y: 30 },
            { id: 'o-2', label: 'O2', x: 74, y: 44 },
            { id: 'o-3', label: 'O3', x: 22, y: 78 },
            { id: 'o-4', label: 'O4', x: 36, y: 52 },
            { id: 'o-5', label: 'O5', x: 34, y: 78, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 78, y: 40 },
        ],
      },
      {
        id: 'gng-f3',
        nombre: 'Paso 3: Corte Explosivo en V Hacia el Aro',
        duracionMs: 1600,
        descripcion: '¡Cambio de ritmo fulgurante! Pato le gana la espalda a O1 cortando por la calle libre. Drigo bloquea a O5 para evitar la ayuda.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 36, y: 74 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 58, y: 56 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 78, y: 40 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 82 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 32, y: 48 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 52, y: 38 },
            { id: 'o-2', label: 'O2', x: 74, y: 44 },
            { id: 'o-3', label: 'O3', x: 22, y: 78 },
            { id: 'o-4', label: 'O4', x: 36, y: 52 },
            { id: 'o-5', label: 'O5', x: 38, y: 78, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 78, y: 40 },
        ],
      },
      {
        id: 'gng-f4',
        nombre: 'Paso 4: Devolución y Bandeja Cómoda',
        duracionMs: 1600,
        descripcion: 'Diego devuelve el pase en la carrera de Pato frente al tablero. Pato recibe en el aire y define con bandeja limpia contra tablero.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 36, y: 74 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 54, y: 74 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 78, y: 40 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 82 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 32, y: 48 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 56, y: 52 },
            { id: 'o-2', label: 'O2', x: 74, y: 44 },
            { id: 'o-3', label: 'O3', x: 22, y: 78 },
            { id: 'o-4', label: 'O4', x: 36, y: 52 },
            { id: 'o-5', label: 'O5', x: 38, y: 78, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 54, y: 74 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 4. SPAIN PICK & ROLL (El Bloqueo Ciego Español)
  // -------------------------------------------------------------
  {
    id: 'play-spain-pnr',
    nombre: 'Spain Pick & Roll',
    subtitulo: 'Bloqueo Directo con Pantalla Ciega ("Backscreen")',
    descripcion: 'La jugada más indetenible del baloncesto europeo e internacional. Agrega una pantalla ciega de un tirador por la espalda del poste rival mientras este intenta defender la caída.',
    tipo: 'ofensiva',
    createdAt: '2026-11-04T00:00:00.000Z',
    puntosClave: [
      'Inicia como un Pick & Roll central estándar para engañar a la defensa.',
      'El tirador (Diego #11) se oculta en el tiro libre y clava un bloqueo ciego a la espalda de O5.',
      'El pívot rival queda inmovilizado; Drigo (#15) corta libre de marca al aro.',
      'Si el defensor del tirador ayuda al aro, Diego se abre al triple frontal ("flare").',
    ],
    frames: [
      {
        id: 'spain-f1',
        nombre: 'Paso 1: Inicio y Posicionamiento Oculto',
        duracionMs: 1800,
        descripcion: 'Pato (#7) en cabecera con balón. Drigo (#15) sube a bloquear. Diego (#11) se coloca sigilosamente en la línea de tiros libres detrás del poste rival O5.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 52, y: 36 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 50, y: 26 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 50, y: 54 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 46 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 86, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 50, y: 30 },
            { id: 'o-2', label: 'O2', x: 56, y: 56 },
            { id: 'o-3', label: 'O3', x: 24, y: 48 },
            { id: 'o-4', label: 'O4', x: 82, y: 78 },
            { id: 'o-5', label: 'O5', x: 52, y: 44, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 26 },
        ],
      },
      {
        id: 'spain-f2',
        nombre: 'Paso 2: Bloqueo Directo y Activación de la Pantalla Ciega',
        duracionMs: 1800,
        descripcion: 'Pato ataca hacia la izquierda usando el bloqueo de Drigo. Diego sube y clava una pantalla ciega por la espalda de O5 cuando este intentaba retroceder.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 50, y: 40 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 40, y: 34 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 50, y: 46 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 46 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 86, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 46, y: 32 },
            { id: 'o-2', label: 'O2', x: 56, y: 50 },
            { id: 'o-3', label: 'O3', x: 24, y: 48 },
            { id: 'o-4', label: 'O4', x: 82, y: 78 },
            { id: 'o-5', label: 'O5', x: 50, y: 44, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 40, y: 34 },
        ],
      },
      {
        id: 'spain-f3',
        nombre: 'Paso 3: Caída Libre de Drigo y Flare de Diego',
        duracionMs: 1800,
        descripcion: 'O5 choca contra la pantalla ciega de Diego. Drigo corta libre de marca al aro. Diego se abre a la línea de 3 frontal ("Flare"). Doble ventaja ofensiva.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 50, y: 68 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 38, y: 48 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 52, y: 32 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 52 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 86, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 42, y: 42 },
            { id: 'o-2', label: 'O2', x: 54, y: 46 },
            { id: 'o-3', label: 'O3', x: 26, y: 56 },
            { id: 'o-4', label: 'O4', x: 76, y: 74 },
            { id: 'o-5', label: 'O5', x: 50, y: 52, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 38, y: 48 },
        ],
      },
      {
        id: 'spain-f4',
        nombre: 'Paso 4: Asistencia de Mate o Triple Frontal',
        duracionMs: 1800,
        descripcion: 'Pato eleva un pase bombeado para el mate de Drigo (#15) bajo el aro. Si la defensa hubiese colapsado, el pase iba para el triple frontal de Diego.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 50, y: 76 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 38, y: 48 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 52, y: 30 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 18, y: 56 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 86, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 44, y: 46 },
            { id: 'o-2', label: 'O2', x: 52, y: 42 },
            { id: 'o-3', label: 'O3', x: 28, y: 62 },
            { id: 'o-4', label: 'O4', x: 70, y: 76 },
            { id: 'o-5', label: 'O5', x: 52, y: 66, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 76 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 5. MOTION OFFENSE / ATAQUE POR CONCEPTOS
  // -------------------------------------------------------------
  {
    id: 'play-motion-offense',
    nombre: 'Motion Offense',
    subtitulo: 'Pase, Bloqueo Indirecto ("Downscreen") y Puerta Atrás',
    descripcion: 'Ataque fluido por conceptos con 4 jugadores abiertos y 1 poste. Castiga a los defensores que se pegan en exceso en el perímetro con una puerta trasera fulminante.',
    tipo: 'ofensiva',
    createdAt: '2026-11-04T00:00:00.000Z',
    puntosClave: [
      'Lectura de la cadera del defensor: si sube a cortar el pase, ¡corte en puerta atrás!',
      'Pase a la cabecera e inmediato bloqueo indirecto ("downscreen") para liberar al escolta.',
      'Pase filtrado picado con bote al espacio libre.',
      'Excelente contra equipos atléticos que arriesgan buscando el robo perimetral.',
    ],
    frames: [
      {
        id: 'motion-f1',
        nombre: 'Paso 1: Estructura 4 Abiertos y 1 Interior',
        duracionMs: 1800,
        descripcion: 'Pato (#7) en 45° izquierdo. Nico (#23) en cabecera. Diego (#11) en 45° derecho. Martin (#5) en esquina derecha y Drigo (#15) en poste bajo izquierdo.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 32, y: 72 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 32, y: 36 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 74, y: 40 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 50, y: 25 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 88, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 36, y: 40 },
            { id: 'o-2', label: 'O2', x: 72, y: 44, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 50, y: 30 },
            { id: 'o-4', label: 'O4', x: 82, y: 78 },
            { id: 'o-5', label: 'O5', x: 34, y: 76, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 32, y: 36 },
        ],
      },
      {
        id: 'motion-f2',
        nombre: 'Paso 2: Inversión de Balón y Bloqueo Indirecto',
        duracionMs: 1800,
        descripcion: 'Pato pasa a Nico en cabecera y corre a poner un bloqueo indirecto abajo a Diego. El defensor O2 se anticipa agresivo para cortar el pase perimetral.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 32, y: 72 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 64, y: 46 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 76, y: 42 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 50, y: 25 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 88, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 58, y: 42 },
            { id: 'o-2', label: 'O2', x: 74, y: 36, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 50, y: 30 },
            { id: 'o-4', label: 'O4', x: 82, y: 78 },
            { id: 'o-5', label: 'O5', x: 34, y: 76, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 25 },
        ],
      },
      {
        id: 'motion-f3',
        nombre: 'Paso 3: Freno en Seco y Puerta Atrás ("Backdoor Cut")',
        duracionMs: 1800,
        descripcion: 'Al ver a O2 sobre-anticipar, Diego clava el freno y corta fulgurante a su espalda hacia la pintura vacía. Nico prepara el pase picado.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 32, y: 72 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 68, y: 38 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 62, y: 64 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 50, y: 25 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 88, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 64, y: 36 },
            { id: 'o-2', label: 'O2', x: 72, y: 44, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 50, y: 30 },
            { id: 'o-4', label: 'O4', x: 82, y: 78 },
            { id: 'o-5', label: 'O5', x: 34, y: 76, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 50, y: 25 },
        ],
      },
      {
        id: 'motion-f4',
        nombre: 'Paso 4: Pase Picado en el Espacio y Bandeja Invertida',
        duracionMs: 1800,
        descripcion: 'Nico filtra un pase milimétrico al espacio. Diego atrapa a la carrera y anota bandeja invertida apoyándose con efecto en el cristal.',
        tokens: [
          ...createCuervosTokens([
            { id: 'c-1', number: 15, label: 'C', role: 'Ancla Central', x: 32, y: 72 },
            { id: 'c-2', number: 7, label: 'PG', role: 'Guardia / Base', x: 68, y: 38 },
            { id: 'c-3', number: 11, label: 'SG', role: 'Escolta Tirador', x: 54, y: 76 },
            { id: 'c-4', number: 23, label: 'SF', role: 'Ala Rápida', x: 50, y: 25 },
            { id: 'c-5', number: 5, label: 'PF', role: 'Alero Bajo', x: 88, y: 82 },
          ]),
          ...createOpponentTokens([
            { id: 'o-1', label: 'O1', x: 64, y: 36 },
            { id: 'o-2', label: 'O2', x: 66, y: 56, badge: 'Tirador Letal' },
            { id: 'o-3', label: 'O3', x: 50, y: 30 },
            { id: 'o-4', label: 'O4', x: 78, y: 76 },
            { id: 'o-5', label: 'O5', x: 38, y: 74, badge: 'Poste Rival' },
          ]),
          { id: 'ball', type: 'ball', label: '🏀', x: 54, y: 76 },
        ],
      },
    ],
  },
];
