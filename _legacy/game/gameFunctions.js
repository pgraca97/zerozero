import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { announceToScreenReader } from '../utils.js';
import { nf, PI, CENTER, LEFT, RIGHT, TOP, BOTTOM } from '../constants.js';
import { DEV, devConfig } from '../dev.js';
import { drawBalls, resetBall, setupBall, triggerBallLaunch } from '../entities/ball.js';
import { setupBricks, drawBricks, checkBallBrickCollisions, allBricksDestroyed } from '../entities/brick.js';
import { drawBullets, moveBullets, shootBullets } from '../entities/bullet.js';
import { setupPowerUps, drawPowerUps, deactivateActivePowerUp, shouldDeactivatePowerUp } from '../entities/powerUp.js';
import { drawLives } from './lives.js';

// Title animation

export function updateTitlePosition() {
  const range = 10 * state.screenScale;
  const speed = 0.5 * state.screenScale;
  if (state.movingUp) {
    state.titleY -= speed;
    if (state.titleY <= state.titleYBase - range) state.movingUp = false;
  } else {
    state.titleY += speed;
    if (state.titleY >= state.titleYBase + range) state.movingUp = true;
  }
}

// Screens 

export function drawReadyScreen() {
  const ss = state.screenScale;
  const titleW = p.width * 0.35;
  const titleH = titleW * (assets.titleImage.height / assets.titleImage.width);
  p.image(assets.titleImage, p.width / 2 - titleW / 2, state.titleY, titleW, titleH);

  p.textFont(assets.arcadeFont);
  p.textSize(Math.max(20, 36 * ss));
  p.textAlign(CENTER, CENTER);
  p.fill(255, 0, 0);
  if (Math.floor(p.millis() / 500) % 2 === 0) {
    p.text('GAME IS READY TO START', p.width / 2, p.height / 2);
  }

  if (state.isTouchDevice) {
    p.textFont(assets.creditsFont);
    p.textSize(Math.max(14, 20 * ss));
    p.fill(0, 255, 0);
    if (Math.floor(p.millis() / 700) % 2 === 0) {
      p.text('TAP TO START', p.width / 2, p.height / 2 + 100 * ss);
    }
  } else {
    const menuY = p.height / 2 + 70 * ss;

    p.textFont(assets.creditsFont);
    p.textSize(Math.max(16, 26 * ss));
    p.textAlign(CENTER, CENTER);
    p.fill(255, 255, 0);
    p.text('KEYBOARD', p.width / 2, menuY);
    p.textSize(Math.max(10, 14 * ss));
    p.fill(200);
    p.text('Arrow keys + Space', p.width / 2, menuY + 25 * ss);

    p.textFont(assets.creditsFont);
    p.textSize(Math.max(14, 20 * ss));
    p.fill(0, 255, 0);
    if (Math.floor(p.millis() / 700) % 2 === 0) {
      p.text('Press SPACE or click to start', p.width / 2, p.height / 2 + 150 * ss);
    }
  }
}

export function drawGameOver() {
  const ss = state.screenScale;
  p.textFont(assets.arcadeFont);
  p.textAlign(CENTER, CENTER);
  p.fill(255, 0, 0);
  p.textSize(Math.max(32, 64 * ss));
  p.text('GAME OVER', p.width / 2, p.height / 2 - 40 * ss);

  p.textFont(assets.creditsFont);
  p.textAlign(CENTER, CENTER);
  p.fill(255);
  p.textSize(Math.max(18, 32 * ss));
  p.text('Your score was: ' + state.currentScore, p.width / 2, p.height / 2 + 30 * ss);

  if (state.newHighScore) {
    p.textSize(Math.max(16, 28 * ss));
    p.fill(255, 215, 0);
    p.text('New Highest Score!', p.width / 2, p.height / 2 + 80 * ss);
  }

  if (Math.floor(p.millis() / 500) % 2 === 0) {
    p.textSize(Math.max(12, 18 * ss));
    p.fill(255, 255, 255);
    p.text('Returning to menu...', p.width / 2, p.height / 2 + 130 * ss);
  }
}

export function drawGameWon() {
  const ss = state.screenScale;
  const bonusPoints = state.vidas * 50;
  const maxW = p.width * 0.9;

  p.textFont(assets.arcadeFont);
  p.textAlign(CENTER, CENTER);
  p.fill(0, 255, 0);
  p.textSize(Math.min(Math.max(24, 64 * ss), maxW / 5));
  p.text('YOU WIN!', p.width / 2, p.height / 2 - 50 * ss);

  p.textFont(assets.creditsFont);
  p.textAlign(CENTER, CENTER);
  p.fill(255);
  p.textSize(Math.min(Math.max(14, 28 * ss), maxW / 18));
  p.text('Your score: ' + state.currentScore, p.width / 2, p.height / 2 + 10 * ss);
  p.fill(200, 200, 255);
  p.textSize(Math.min(Math.max(12, 22 * ss), maxW / 20));
  p.text('+ ' + bonusPoints + ' lives bonus', p.width / 2, p.height / 2 + 45 * ss);

  if (state.newHighScore) {
    p.textSize(Math.min(Math.max(14, 28 * ss), maxW / 16));
    p.fill(255, 215, 0);
    p.text('New Highest Score!', p.width / 2, p.height / 2 + 90 * ss);
  }

  if (Math.floor(p.millis() / 500) % 2 === 0) {
    p.textSize(Math.min(Math.max(10, 18 * ss), maxW / 22));
    p.fill(255, 255, 255);
    p.text('Returning to menu...', p.width / 2, p.height / 2 + 130 * ss);
  }
}

// HUD

export function drawCreditsAndHighestScore() {
  const ss = state.screenScale;
  const highestScoreText = 'HIGHEST SCORE';
  const scoreText = nf(state.highestScore, 3);

  p.textFont(assets.arcadeFont);
  p.textSize(Math.max(20, 36 * ss));
  const hstWidth = p.textWidth(highestScoreText);

  p.textFont(assets.creditsFont);
  const stWidth = p.textWidth(scoreText);

  const gap = 30 * ss;
  const totalW = hstWidth + gap + stWidth;
  const startX = (p.width - totalW) / 2;
  const topMargin = 40 * ss;

  p.textFont(assets.arcadeFont);
  p.textSize(Math.max(20, 36 * ss));
  p.textAlign(LEFT, TOP);
  p.fill(255, 255, 0);
  p.text(highestScoreText, startX, topMargin);

  p.textFont(assets.creditsFont);
  p.textAlign(LEFT, TOP);
  p.fill(255, 255, 255);
  p.text(scoreText, startX + hstWidth + gap, topMargin);

  p.textFont(assets.creditsFont);
  p.textAlign(CENTER, CENTER);
  p.fill(255);
  p.textSize(Math.max(14, 20 * ss));
  p.text('\u00A9 Paulo Gra\u00E7a', p.width / 2, p.height - 30 * ss);
}

export function drawScore() {
  const sf = state.scaleFactor;
  const scoreLabel = 'Your Score';
  const scoreValue = String(state.currentScore);
  const scoreY = state.gameY + state.gameHeight + 14 * sf;

  p.textFont(assets.creditsFont);
  p.textSize(Math.max(10, 16 * sf));
  const scoreValueWidth = p.textWidth(scoreValue);
  const gap = 8 * sf;

  p.textFont(assets.arcadeFont);
  p.textAlign(RIGHT, TOP);
  p.fill(255, 0, 0);
  p.textSize(Math.max(12, 18 * sf));
  p.text(scoreLabel, state.gameX + state.gameWidth - scoreValueWidth - gap, scoreY);

  p.textFont(assets.creditsFont);
  p.fill(255, 255, 255);
  p.textSize(Math.max(10, 16 * sf));
  p.textAlign(RIGHT, TOP);
  p.text(scoreValue, state.gameX + state.gameWidth, scoreY);
}

export function drawMovementInstructions() {
  const sf = state.scaleFactor;
  let instructions;
  if (state.inputMode === 'touch') {
    instructions = 'Drag to move, tap right side to shoot';
  } else {
    instructions = 'Use arrow keys, SPACE to shoot';
  }
  p.textFont(assets.creditsFont);
  p.textSize(Math.max(10, 12 * sf));
  p.fill(255, 255, 255);
  p.textAlign(LEFT, BOTTOM);
  p.text(instructions, state.gameX, state.gameY - 6 * sf);
  if (state.inputMode !== 'touch') {
    p.textAlign(RIGHT, BOTTOM);
    p.fill(180);
    p.text('ESC: menu', state.gameX + state.gameWidth, state.gameY - 6 * sf);
  }
}

export function drawLaunchCountdown() {
  const sf = state.scaleFactor;
  const elapsed = p.millis() - state.launchStartTime;
  let remaining = Math.ceil((state.launchDelay - elapsed) / 1000);
  remaining = Math.max(remaining, 1);

  const cx = state.gameX + state.gameWidth / 2;
  const cy = state.paddleObj.y - 50 * sf;

  p.textFont(assets.arcadeFont);
  p.textAlign(CENTER, CENTER);
  p.textSize(Math.max(28, 52 * sf));
  p.fill(255, 220, 0);
  p.text(remaining, cx, cy);

  p.textFont(assets.creditsFont);
  p.textSize(Math.max(9, 11 * sf));
  p.fill(180);
  const launchHint = state.isTouchDevice ? 'TAP to launch now' : 'SPACE / CLICK to launch now';
  p.text(launchHint, cx, cy + 34 * sf);
}

export function drawArrow() {
  const sf = state.scaleFactor;
  p.push();
  const arrowScale = sf * 0.8;
  p.translate(state.paddleObj.x + state.paddleObj.w / 2, state.paddleObj.y - 10 * sf);
  p.rotate(state.arrowAngle);
  p.image(assets.arrowImage,
    -assets.arrowImage.width * arrowScale / 2,
    -assets.arrowImage.height * arrowScale - 8 * sf,
    assets.arrowImage.width * arrowScale,
    assets.arrowImage.height * arrowScale);
  p.pop();

  state.arrowAngle += state.arrowRotationSpeed;
  if (state.arrowAngle > PI / 4 || state.arrowAngle < -PI / 4) {
    state.arrowRotationSpeed *= -1;
  }
}

// Score persistence

export function readHighestScore() {
  const stored = localStorage.getItem('zerozero_highscore');
  if (stored !== null) {
    state.highestScore = parseInt(stored, 10) || 0;
  } else {
    state.highestScore = 0;
  }
}

export function writeHighestScore() {
  localStorage.setItem('zerozero_highscore', String(state.highestScore));
}

// Game flow

export function drawGame() {
  state.paddleObj.draw();
  drawBalls();

  if (state.magnetPowerUpActive && state.balls.length > 0 &&
      state.balls[0].speedX === 0 && state.balls[0].speedY === 0) {
    drawArrow();
  }

  drawBricks();
  drawPowerUps(state.gameY, state.gameHeight);
  moveBullets();
  drawBullets(state.gameY);
  checkBallBrickCollisions();
  drawScore();
  drawMovementInstructions();

  if (state.bulletsActive && state.isShooting) {
    shootBullets();
  }

  if (state.awaitingLaunch) {
    drawLaunchCountdown();
  }

  if (allBricksDestroyed()) {
    gameWon();
  }
}

export function gameOver() {
  state.newHighScore = false;
  if (state.currentScore > state.highestScore) {
    state.highestScore = state.currentScore;
    writeHighestScore();
    state.newHighScore = true;
  }
  state.isGameStarted = false;
  state.isGameOver = true;
  state.gameOverStartTime = p.millis();
  announceToScreenReader('Game over! Your score: ' + state.currentScore +
    (state.newHighScore ? '. New high score!' : ''));

  resetBall();
  state.bulletsActive = false;
  state.isShooting = false;
  state.activePowerUpType = '';
}

export function gameWon() {
  state.currentScore += state.vidas * 50;
  state.newHighScore = false;
  if (state.currentScore > state.highestScore) {
    state.highestScore = state.currentScore;
    writeHighestScore();
    state.newHighScore = true;
  }
  state.isGameStarted = false;
  state.isGameWon = true;
  state.gameOverStartTime = p.millis();
  announceToScreenReader('You win! Your score: ' + state.currentScore +
    (state.newHighScore ? '. New high score!' : ''));

  resetBall();
  state.bulletsActive = false;
  state.isShooting = false;
  state.activePowerUpType = '';
}

export function resetGame() {
  state.vidas = DEV ? devConfig.startLives : 3;
  state.currentScore = 0;
  state.bricks = [];
  setupBricks();
  state.paddleObj.resetSize();
  state.powerUps = [];
  state.destroyedBricks = {};
}

export function exitToMenu() {
  state.isGameStarted = false;
  resetBall();
  state.bricks = [];
  setupBricks();
  state.paddleObj.resetSize();
  state.paddleObj.speed = 5 * state.scaleFactor;
  state.paddleObj.isInvertedCommands = false;
  state.paddleObj.canMove = true;
  state.powerUps = [];
  state.bullets = [];
  state.bulletsActive = false;
  state.isShooting = false;
  state.magnetPowerUpActive = false;
  state.activePowerUpType = '';
  state.vidas = DEV ? devConfig.startLives : 3;
  state.currentScore = 0;
  state.destroyedBricks = {};
}
