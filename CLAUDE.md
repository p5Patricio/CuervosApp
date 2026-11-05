# CuervosApp - Tactical Basketball Mobile PWA

## Project Context
CuervosApp is a local-first Progressive Web App (PWA) designed for tactical management, smart substitutions, and play simulation for the "Cuervos" basketball team.
Stack: React 18 + TypeScript + Vite + Tailwind CSS + Zustand with persist middleware.

## Critical Design Mandate: Mobile-First Redesign
The app is used almost exclusively on mobile phones (viewports 360px - 430px wide).
The user requested a complete UI/UX polish to eliminate clutter and visual aggression:
1. **Reduce Clutter ("Desamontonar"):**
   - The court is the star of the app. It must occupy maximum viewport area (80-85%+ of screen).
   - Eliminate heavy stacked drawers that compress the court into a miniature rectangle on mobile.
   - Use clean, compact floating controls (frosted glass / backdrop blur) for play simulation and formation controls.
2. **Restrain Color Palette (No "Rainbow / Arbol de Navidad"):**
   - Remove aggressive fluorescent glows, pulsing pings, and conflicting colors.
   - Use a focused, sober sports palette: Deep Obsidian (`#0A0A0C` / `#050505`), Official Basketball Orange (`#ED4B00`), Chalk White (`#F8FAFC`), and Slate neutrals.
3. **Elevate Token Aesthetics (No AI Clichés):**
   - Tokens must look like professional athletic court markers: clean circular discs with crisp bold dorsal numbers, subtle team ring, no chaotic badges or flashing effects.
   - Opponent tokens: clean contrast with clear, elegant label.
   - Basketball: crisp vector SVG basketball.
4. **Clean SVG Icons:**
   - Use elegant, clean SVG iconography with consistent 1.5px / 2px stroke width. No tacky emojis as primary UI elements.
5. **Roster Real Names:**
   - Drigo (#15, Ancla Central / Center)
   - Pato (#7, Base / Point Guard)
   - Diego (#11, Escolta / Shooting Guard)
   - Martin (#5, Ala Pvot / Power Forward)
   - Nico (#23, Alero / Small Forward)

## Code Quality & Verification
- Preserve existing data structures in `src/types/index.ts`, `src/data/seedData.ts`, and `src/data/tacticalPlays.ts`.
- Ensure all 33 tests in `npm test` continue to pass.
- Verify production build with `npm run build`.
- Conventional commits only (no AI attribution or Co-Authored-By).
