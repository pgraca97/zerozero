// Dev-mode utilities. import.meta.env.DEV is true during `pnpm dev` and
// stripped (false) by Vite in production builds, so all branches guarded by
// `if (DEV)` are dead-code-eliminated from the production bundle.

export const DEV = import.meta.env.DEV;

console.log(`%c DEV MODE ACTIVE `, 'background: red; color: white; font-size: 16px; padding: 4px;');
console.log(DEV);


const params = new URLSearchParams(location.search);

// URL-param overrides, e.g.:
//   ?infiniteLives&lives=5&speed=2&powerup=multiball
export const devConfig = DEV ? {
  infiniteLives: params.has('infiniteLives'),
  startLives:    parseInt(params.get('lives')  ?? '3')   || 3,
  ballSpeed:     parseFloat(params.get('speed') ?? '5.5') || 5.5,
  spawnPowerUp:  params.get('powerup') ?? null,
} : {};

// Overlay visibility — toggled with the D key in-game.
export let devOverlayVisible = false;
export function toggleDevOverlay() { devOverlayVisible = !devOverlayVisible; }

// Cycles through every power-up type when no ?powerup= param is set.
const ALL_POWER_UP_TYPES = [
  'bullets', 'fastBall', 'multiball', 'slowBall', 'bigBar',
  'magnet', 'life', 'invertedCommands', 'smallBar', 'slowBar', 'fastBar', 'smallBall',
];
let _cycleIndex = 0;

export function nextPowerUpType() {
  if (devConfig.spawnPowerUp) return devConfig.spawnPowerUp;
  const type = ALL_POWER_UP_TYPES[_cycleIndex % ALL_POWER_UP_TYPES.length];
  _cycleIndex++;
  return type;
}
