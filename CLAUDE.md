# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ZeroZero — a brick-breaker game. Originally vanilla p5.js; migrated to **Vite + React 19 + TypeScript + Phaser 4** (Arcade physics). Deployed to GitHub Pages under base path `/zerozero/`. Backend is intentionally deferred; persistence is localStorage only.

## Commands

```bash
pnpm dev          # Vite dev server → http://localhost:5173/zerozero/
pnpm build        # production build to dist/ (transpile-only; types NOT checked here)
pnpm typecheck    # tsc --noEmit — the real type gate, run this after edits
pnpm test:e2e     # Playwright e2e (auto-starts the dev server via webServer config)
pnpm preview      # serve the production build
pnpm run deploy   # build + publish dist/ to gh-pages (NOT `pnpm deploy` — that's a pnpm built-in)
```

Run a single e2e test:
```bash
pnpm exec playwright test -g "boots to the menu"     # by title
pnpm exec playwright test tests/smoke.spec.ts:27     # by file:line
```

Green-before-done gate: `pnpm typecheck && pnpm build && pnpm test:e2e`.

## Architecture — the big picture

**React owns all UI; Phaser owns only the gameplay canvas. They never import each other** — the sole bridge is the typed `EventBus` ([src/game/EventBus.ts](src/game/EventBus.ts)). Internalize this boundary before touching either side.

- **Phaser → React** (state): `loading-progress`, `preload-complete`, `score-changed`, `lives-changed`, `level-changed`, `powerup-activated`, `powerup-cleared`, `game-over`, `level-won`, `paused`, `resumed`.
- **React → Phaser** (commands): `cmd-start` `{levelIndex, keepScore?}`, `cmd-pause`, `cmd-resume`, `cmd-quit`, `cmd-mute`.

**React side** — [src/App.tsx](src/App.tsx) is a screen state machine (`loading|menu|levelSelect|settings|playing|paused|gameOver|won`). It subscribes to EventBus on mount, renders `<PhaserGame>` (always mounted) plus screens/overlays from [src/ui/](src/ui/). The HUD/menus are plain DOM over the canvas. `<PhaserGame>` mounts one `Phaser.Game` for the component's lifetime (no StrictMode — it would double-mount the game).

**Phaser side** — scene flow `Boot → Preload → Game` ([src/game/scenes/](src/game/scenes/)). Key point: **the `Game` scene is started once and never restarted** — it stays alive across levels and pauses. `cmd-start` calls `startLevel()` which clears groups and rebuilds; EventBus command listeners are registered once in `create()`. A `phase` field (`idle|playing|over`) gates `update()`.

**Fixed virtual resolution 480×640 + `Scale.FIT`** ([src/game/config.ts](src/game/config.ts)). There is **no `scaleFactor` math** (the p5 version's was deleted) — author all positions/sizes/velocities in virtual px in config.ts. The canvas + HUD live in a centered `.stage` (CSS `aspect-ratio:3/4`, `max-width:520px`) so it isn't a giant full-height strip on desktop; `PhaserGame` runs a `ResizeObserver → game.scale.refresh()` so the canvas tracks the stage.

**Physics conventions** ([src/game/objects/](src/game/objects/)): dynamic Arcade bodies (Ball/Paddle/PowerUp/Bullet) auto-track `setDisplaySize`, so size visuals with that and the body follows. Static bodies (Brick) need `body.updateFromGameObject()` after any size/texture change. The paddle bounce is **custom continuous angle logic** (`Ball.bounceOffPaddle`: hit offset → shaped angle + paddle-velocity "english"), not physics reflection — preserve that feel. Ball speed = `baseSpeed` (ramps per paddle hit) × `speedMul` (power-ups); `normalizeSpeed()` also enforces minimum pitch so the ball can't loop horizontally. Arcade runs at `fps: 120` against tunneling. Use `declare body: Phaser.Physics.Arcade.Body` to type bodies. Import Phaser as `import Phaser from 'phaser'` (works because `esModuleInterop` is on).

**Data-driven content** ([src/game/data/](src/game/data/)):
- **Levels** (`levels.ts`): authored as row-strings + a legend mapping chars to `BrickSpec`. Adding a level = one entry in `LEVELS`. `resolveLevel()` turns it into placed bricks.
- **Power-ups** (`powerups.ts`): `POWER_UPS` metadata + `rollPowerUpDrop()` drop-probability tree (ported faithfully from the old code). Only **one timed power-up is active at a time** — applying a new one clears the previous (`applyPowerUp`/`clearActivePowerUp` switches in `Game.ts` hold the actual effects). `life` is instant; `magnet` lasts until launch (no timer); everything else is an 8s timed effect surfaced in the HUD.

**Persistence** ([src/state/storage.ts](src/state/storage.ts)): localStorage. **Keep the key `zerozero_highscore` unchanged** — existing players' scores depend on it.

**Assets**: images in `public/assets/` (served at `import.meta.env.BASE_URL`; load via `assetUrl()`). Audio is raw **Web Audio** ([src/game/audio.ts](src/game/audio.ts)), not the Phaser loader — `audio.ensure()` must be called from a user gesture. Fonts are bundled from `src/ui/fonts/` via `@font-face` in [src/ui/ui.css](src/ui/ui.css) under families `ArcadeClassic` and `DePixelBreit` (used by both React and Phaser text).

## Conventions & gotchas

- **Add a power-up**: extend `PowerUpType` (types.ts) → add a `POWER_UPS` entry → handle it in `applyEffect`/`clearActivePowerUp` in `Game.ts` → (the sprite key is derived in config.ts from `POWER_UP_FILE`).
- **DEV-only code** is gated by `import.meta.env.DEV` (tree-shaken from prod). Press **`P`** in a dev build to cycle-spawn a power-up at center — used for manual + e2e testing.
- **Dependency pins that matter**: `@vitejs/plugin-react` must stay on **`^4`** (v6 requires Vite 7). pnpm builds esbuild via `allowBuilds` in `pnpm-workspace.yaml`.
- Accessibility: gameplay announcements go through the `#game-announcer` live region via `announce()` ([src/state/announce.ts](src/state/announce.ts)).

## Testing

Playwright ([playwright.config.ts](playwright.config.ts), specs in [tests/](tests/)). The config has a `webServer` that auto-starts `pnpm dev`, so `pnpm test:e2e` works with nothing running. **Locally only chromium is enabled** (firefox/webkit browsers aren't installed; uncomment the projects + `playwright install firefox webkit` to add them). CI ([.github/workflows/playwright.yml](.github/workflows/playwright.yml)) runs the suite on push/PR to `main`. Tests assert no console/page errors leaked, so keep the console clean.

## Roadmap (deferred, in priority order)

Full-bleed React starfield (currently only inside the canvas) · richer juice (brick gloss-sheet animation, typewriter messages) · game modes · more levels · dev-mode HUD overlay · **backend (Supabase)** when re-prioritized — design outline in [docs/backend.md](docs/backend.md).

`_legacy/` holds the old p5 source for reference — inert (not built or imported). Delete with `rm -rf _legacy` once the new version is fully trusted.
