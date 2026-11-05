# Mobile Athletic Design System polish
Objective: declutter and unify the whole UI for 360-430px phones (contrast, spacing, touch targets, palette).
Branch: feat/mobile-athletic-polish · Delivery: ask-on-risk · Runner: `npm test` + `npm run build`

## Specs
- S1 Opponent tokens: "Fondo blanco tiza sólido: `bg-white`", "Borde nítido: `border-2 border-slate-900`", "Texto de la ficha: `text-slate-950 font-black font-display text-sm sm:text-base leading-none tracking-normal`", clean shadow. Scouting tags ("Tirador Letal", "Flotar", "Poste") compact, no chaotic overlap, dark semi-transparent background, crisp accessible type.
- S2 Wiki sub-nav: segmented control / horizontal scroll (`overflow-x-auto no-scrollbar`), labels "Manual Táctico", "Bitácora", "Scouting", container `bg-cuervos-dark/90 border border-white/10 p-1 rounded-xl`, active orange accent, inactive legible slate; remove traffic-light colors.
- S3 Tactical manual: clean header ("Manual Táctico" + concise description), compact "+ Principio"/"+ Nuevo" button; cards p-4 on mobile, `leading-relaxed` key points, aligned Lucide icons; Edit/Delete touch targets min 36-40px.
- S4 Match logs: big clear score (`font-display font-bold tabular-nums`), compact Q1-Q4 chips, refined Victoria/Derrota label, notes and energy without saturation; new-match modal with spacious inputs and clean buttons.
- S5 Scouting: rival cards with clean tags for pace, strengths, weaknesses; key players with dorsal and defensive assignment as legible pills.
- S6 Roster: header/metrics/"Agregar Jugador" fit 360-390px; filters "Todos", "Titulares", "Banca", "Ausentes" compact horizontal bar with clear active state; PlayerCard foul +/- min 40px, elegant energy bar, starter/bench badge, clear attendance toggle; Plan B cards with clear hierarchy and tappable buttons.
- S7 Palette: Obsidian `#0A0A0C`, Orange `#ED4B00`, Chalk `#F8FAFC`/`#FFFFFF`, muted `#94A3B8`, surfaces `#121214`-`#1A1A20` with `border-white/10`; touch targets 40-44px.
- S8 Do not break store/tactics/persistence/simulation; English code comments/identifiers; `npm test` and `npm run build` clean.

## Tasks
- [ ] T1 S7 shared UI primitives in `src/index.css` (inline)
- [ ] T2 S1 opponent token + scouting tags (inline)
- [ ] T3 S2-S3 wiki nav + tactical manual (inline)
- [ ] T4 S4 match logs (inline)
- [ ] T5 S5 scouting (inline)
- [ ] T6 S6 roster, player card, Plan B, player modal (inline)
- [ ] T7 S8 verification: tests + build (inline)

## Log
- L1 (2026-11-05) User request: Lead UI/UX sprint fixing visual clutter, contrast, and design across the whole app for 360-430px phones; tasks 1-8 as stated in the session prompt (opponent token contrast, wiki segmented nav, manual, match logs, scouting, roster/PlayerCard/PlanB, palette, keep 33 tests and build green).
- Route: all tasks inline (single coherent restyle, no writer trigger: units are not independent — they share the new CSS primitives).
- Constraint found: `tests/adversarial_m2_audit.cjs` asserts token size class strings (`w-8 h-8 sm:w-11 sm:h-11`, etc.) and pointer handlers in BoardTokenItem; keep them.
