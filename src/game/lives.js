import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { announceToScreenReader } from '../utils.js';
import { resetBall } from '../entities/ball.js';
import { gameOver } from './gameFunctions.js';

export function drawLives(gx, gy, gh) {
  const lifeSize = 24 * state.scaleFactor;
  const spacing = 8 * state.scaleFactor;
  const startX = gx + 8 * state.scaleFactor;
  const startY = gy + gh + 8 * state.scaleFactor;

  for (let i = 0; i < state.vidas; i++) {
    p.image(assets.vidaImagem, startX + i * (lifeSize + spacing), startY, lifeSize, lifeSize);
  }
}

export function loseLife() {
  state.vidas--;
  if (state.vidas <= 0) {
    gameOver();
  } else {
    announceToScreenReader('Ball lost! Lives remaining: ' + state.vidas);
    resetBall();
  }
}
