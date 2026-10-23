# CuervosApp - PWA Táctica, Sustituciones y Knowledge Base

## Objective
Construir una Progressive Web App (PWA) táctil y local-first para el equipo de básquetbol "Cuervos", optimizada para canchas techadas al aire libre (modo oscuro de alto contraste), con pizarra táctica interactiva SVG FIBA a 60fps con Pointer Events, motor de sustituciones inteligentes ("Plan B" ante ausencia o faltas del ancla central), y base de conocimiento táctica con bitácora de partidos y scouting rival.

## Constraints & Context
- **Equipo real**: 1 único jugador alto (Ancla Central) y resto de estatura promedio pero muy rápidos; cansancio en el 4to cuarto en cancha de medidas reglamentarias.
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand con `persist` + Lucide React.
- **Táctil**: Pointer Events nativos (`touch-action: none`) para fluidez total en móviles y tablets sin scroll accidental.
- **Local-first**: Persistencia automática en LocalStorage con backup JSON exportable/importable.
- **Git & GitHub**: Commits limpios convencionales y publicación pública vía `gh repo create CuervosApp --public --source=. --remote=origin --push`.

## Task List
- [x] `task-1`: Inicializar proyecto Vite + React + TypeScript + Tailwind CSS + Lucide React + PWA manifest y configuración base.
- [x] `task-2`: Identidad de marca y Logo Engine de Cuervos (paleta de alto contraste, logo SVG/PNG en `public/logo-cuervos.png`, Header, PWA icons y splash screen).
- [x] `task-3`: Store global Zustand local-first con persistencia y sistema de exportación/importación JSON de respaldo + datos semilla iniciales.
- [x] `task-4`: Vista 1 (Core) - Pizarra Táctica Interactiva Full-Screen (`TacticalBoard`) con media cancha FIBA SVG, fichas arrastrables 0-100, capa de dibujo de flechas, formaciones defensivas 2-1-2 / 1-3-1 / 3-2 y creador de secuencias/frames.
- [x] `task-5`: Vista 2 - Gestión de Plantilla y Motor de Sustituciones Inteligentes ("Plan B") (`RosterManager`) con cálculo automático de reemplazos y regla de emergencia del Ancla Central.
- [x] `task-6`: Vista 3 - Base de Conocimiento y Bitácora de Partidos (`KnowledgeBase`) con manual táctico editable, bitácora de cuartos y scouting de rivales.
- [/] `task-7`: Verificación completa, compilación TypeScript (`npm run build`), documentación técnica en `README.md` e inicialización/push a GitHub con `gh repo create`.

## Effective TDD Configuration
- Mode: Functional verification and type-checking via Vite & TypeScript (`npm run build`).
- Source: Session specification.
- Runner: `npm run build` (Verified: Exit code 0, 9 precached PWA assets generated).
