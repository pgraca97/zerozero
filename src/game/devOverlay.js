import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { DEV, devOverlayVisible, devConfig, nextPowerUpType } from '../dev.js';
import { LEFT, TOP } from '../constants.js';

export function drawDevOverlay() {
  if (!DEV || !devOverlayVisible) return;

  const sf = Math.max(state.scaleFactor || 1, 0.8);

  const nextPU = devConfig.spawnPowerUp ?? (() => {
    // Peek at next without advancing the counter
    const ALL = [
      'bullets', 'fastBall', 'multiball', 'slowBall', 'bigBar',
      'magnet', 'life', 'invertedCommands', 'smallBar', 'slowBar', 'fastBar', 'smallBall',
    ];
    // Import cycle index is internal; just show devConfig note
    return devConfig.spawnPowerUp ?? '(cycle)';
  })();

  const ballSpeed = state.balls[0]
    ? Math.sqrt(state.balls[0].speedX ** 2 + state.balls[0].speedY ** 2).toFixed(2)
    : '-';

  const lines = [
    { text: '[ DEV MODE ]',            color: [255, 220, 0] },
    { text: `lives: ${state.vidas}  infinite: ${devConfig.infiniteLives}`, color: [200, 255, 200] },
    { text: `balls: ${state.balls.length}  speed: ${ballSpeed}`, color: [200, 255, 200] },
    { text: `bricks left: ${state.remainingBricks}`, color: [200, 255, 200] },
    { text: `power-up: ${state.activePowerUpType || 'none'}`, color: [200, 255, 200] },
    { text: `score: ${state.currentScore}`, color: [200, 255, 200] },
    { text: '', color: [0, 0, 0] },
    { text: 'D  toggle overlay',       color: [180, 220, 255] },
    { text: 'N  lose a life',          color: [180, 220, 255] },
    { text: 'B  clear all bricks',     color: [180, 220, 255] },
    { text: `P  spawn: ${nextPU}`,     color: [180, 220, 255] },
  ];

  const pad   = 10;
  const lineH = Math.max(14, 15 * sf);
  const panelW = Math.max(200, 210 * sf);
  const panelH = lines.length * lineH + pad * 2;
  const panelX = 10;
  const panelY = 10;

  p.noStroke();
  p.fill(0, 0, 0, 190);
  p.rect(panelX, panelY, panelW, panelH, 4 * sf);

  if (assets.creditsFont) p.textFont(assets.creditsFont);
  p.textSize(Math.max(11, 13 * sf));
  p.textAlign(LEFT, TOP);

  for (let i = 0; i < lines.length; i++) {
    const [r, g, b] = lines[i].color;
    p.fill(r, g, b);
    p.text(lines[i].text, panelX + pad, panelY + pad + i * lineH);
  }
}
