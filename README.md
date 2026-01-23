# The House - Horror Game

A browser-based, point-and-click psychological horror game built with Next.js. The player explores a rain-soaked house, uncovers story fragments, manages sanity, and reaches multiple endings based on choices and flags.

## Quick Start
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Project Structure
- `app/`: Next.js App Router source (UI, hooks, game loop).
- `data/scenes/`: Scene JSON definitions (hotspots, text, navigation, events).
- `public/`: Scene images, audio assets, item icons.
- `editor/`: Dev-only scene editor (hotspot alignment and text editing).
- `scripts/`: Validation tools and helpers.

## Core Game Loop
- `app/components/GameCanvas.tsx`: Renders a scene, draws hotspots, handles navigation, and processes events.
- `app/hooks/useGameState.ts`: Zustand store for sanity, flags, inventory, time, and triggered events.
- `data/scenes/*.json`: Defines interactables, navigation targets, and events per scene.

## Systems Overview
### Sanity
- Range: 0–100.
- Triggers low-sanity visuals and altered text.
- UI: `app/components/SanityMeter.tsx`, `app/components/SanityEffects.tsx`, `app/components/EffectsOverlay.tsx`.

### Inventory
- Items defined in `app/lib/items.ts`.
- Item inspector shows details + sprite from `public/images/items`.

### Audio
- `app/hooks/useAudio.tsx` defines audio manifest with fallback synthesis.
- Ambient and SFX keys referenced by scenes/events.

### Endings
- Defined in `app/lib/endings.ts`.
- Evaluated in `app/page.tsx` via `checkEndingConditions`.
- Ending hints and unlock tracking in `app/components/EndingScreen.tsx`.

### Ambient Events
- Global events in `app/data/ambientEvents.ts`.
- Triggered via `app/hooks/useAmbientEvents.ts`.

## Scenes
All scenes are defined in `data/scenes/*.json`. Each scene includes:
- `backgroundImage`, `backgroundImageLowSanity`
- `interactables`: clickable rectangles with text and effects
- `navigation`: scene transitions
- `events`: on-enter, timer, sanity, or story flag triggers

## Achievements
Endings are tracked in `localStorage` and shown on the title screen.

## Dev Scene Editor
The editor is a separate dev-only Next.js app for aligning hotspot rectangles with scene art and adjusting text.

Run:
```bash
cd editor
npm install
npm run dev
```
Open `http://localhost:3001`.

Key features:
- Drag/resize hotspots and navigation boxes
- Shift to lock aspect ratio
- Snap-to-grid (1%)
- Ghost overlay for last saved positions
- Diff preview
- Autosave (~600ms after edits)

Changes are written to `data/scenes/*.json` in the repo root and take effect the next time the main game reloads.

## Audio Assets
Ambient tracks and SFX live in `public/audio/ambient` and `public/audio/sfx`.
Audio keys are mapped in `app/hooks/useAudio.tsx`.

## Item Sprites
Item icons live in `public/images/items` and are referenced in `app/lib/items.ts`.

## Validation
Run the validator to check for missing assets and mismatched references:
```bash
npm run validate:game
```

## Guides and Checklists
- `ENDING_GUIDE.md`: Step-by-step ending paths.
- `SCENARIO_CHECKLIST.md`: Story flags, items, events, and gaps.
- `ROOM_MAP.md`: Scene connectivity and background reference.

## Development Notes
- Navigation and interactable rectangles use percentages (0–100).
- Timed events use `timerDuration` in seconds.
- Endings are prioritized in `app/lib/endings.ts` (higher priority wins).
