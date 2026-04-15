import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { announceToScreenReader } from '../utils.js';
import { resetBall } from '../entities/ball.js';
import { gameOver } from './gameFunctions.js';
import { DEV, devConfig } from '../dev.js';

export function drawLives(gx, gy, gh) {
  const sf = state.scaleFactor;
  const margin = 8 * sf;
  const startX = gx + margin;
  const startY = gy + gh + margin;
  const availableW = state.gameWidth - margin * 2;

  // Scale down heart size if too many lives would overflow
  let lifeSize = 24 * sf;
  let spacing = 8 * sf;
  const totalNeeded = state.vidas * lifeSize + (state.vidas - 1) * spacing;
  if (totalNeeded > availableW && state.vidas > 0) {
    lifeSize = Math.max(12 * sf, availableW / (state.vidas * 1.4));
    spacing = lifeSize * 0.3;
  }

  for (let i = 0; i < state.vidas; i++) {
    p.image(assets.vidaImagem, startX + i * (lifeSize + spacing), startY, lifeSize, lifeSize);
  }
}

export function loseLife() {
  if (DEV && devConfig.infiniteLives) {
    announceToScreenReader('[DEV] Infinite lives — resetting ball');
    resetBall();
    return;
  }
  state.vidas--;
  if (state.vidas <= 0) {
    gameOver();
  } else {
    announceToScreenReader('Ball lost! Lives remaining: ' + state.vidas);
    resetBall();
  }
}
