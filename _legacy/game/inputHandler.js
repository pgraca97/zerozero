import { p } from '../p5Context.js';
import { state } from '../state.js';
import { ensureAudio, toggleMute } from '../audio.js';
import { announceToScreenReader } from '../utils.js';
import { triggerBallLaunch } from '../entities/ball.js';
import { launchBall, PowerUp, getPowerUpImageByType } from '../entities/powerUp.js';
import { loseLife } from './lives.js';
import { exitToMenu } from './gameFunctions.js';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ENTER, ESCAPE, ARROW_CURSOR }
  from '../constants.js';
import { DEV, toggleDevOverlay, nextPowerUpType } from '../dev.js';

export function clearAllKeys() {
  for (const key in state.keysPressed) {
    state.keysPressed[key] = false;
  }
  state.isShooting = false;
}

export function updateInput() {
  if (state.inputMode === 'keyboard') {
    updateKeyboardInput();
  } else if (state.inputMode === 'touch') {
    updateTouchInput();
  }
}

function updateKeyboardInput() {
  if (!state.isGameStarted) return;

  if (state.bulletsActive) {
    state.isShooting = !!state.keysPressed[32];
  }

  if (!state.paddleObj.canMove) return;
  let dir = 0;
  if (state.keysPressed[LEFT_ARROW]) dir -= 1;
  if (state.keysPressed[RIGHT_ARROW]) dir += 1;
  if (state.paddleObj.isInvertedCommands) dir *= -1;
  if (dir !== 0) state.paddleObj.move(dir);
}

function updateTouchInput() {
  if (!state.isGameStarted || !state.bulletsActive) return;
  let shooting = false;
  for (let i = 0; i < p.touches.length; i++) {
    if (isTouchInShootZone(p.touches[i].x, p.touches[i].y)) {
      shooting = true;
      break;
    }
  }
  state.isShooting = shooting;
}

function isTouchInShootZone(tx, ty) {
  return tx > state.gameX + state.gameWidth / 2 &&
         ty > state.gameY && ty < state.gameY + state.gameHeight;
}

function isMuteButtonClick(x, y) {
  return state.muteButtonSize > 0 &&
    x >= state.muteButtonX && x <= state.muteButtonX + state.muteButtonSize &&
    y >= state.muteButtonY && y <= state.muteButtonY + state.muteButtonSize;
}

function handleStartOrAction() {
  if (!state.isGameStarted && !state.isGameOver && !state.isGameWon) {
    state.inputMode = 'keyboard';
    state.isGameStarted = true;
    state.awaitingLaunch = true;
    state.launchStartTime = p.millis();
    announceToScreenReader('Game started! Mode: ' + state.inputMode);
  } else if (state.isGameStarted) {
    if (state.awaitingLaunch) triggerBallLaunch();
    if (state.bulletsActive) state.isShooting = true;
    if (state.magnetPowerUpActive && state.balls.length > 0 &&
        state.balls[0].speedX === 0 && state.balls[0].speedY === 0) {
      launchBall();
    }
  }
}

// p5 lifecycle event handlers

export function keyPressed() {
  ensureAudio();
  const wasPressed = state.keysPressed[p.keyCode];
  state.keysPressed[p.keyCode] = true;

  if (p.key === 'm' || p.key === 'M') {
    toggleMute();
    return false;
  }

  if (DEV) {
    if (p.key === 'd' || p.key === 'D') { toggleDevOverlay(); return false; }
    if (p.key === 'n' || p.key === 'N') { loseLife(); return false; }
    if ((p.key === 'b' || p.key === 'B') && state.isGameStarted) {
      state.bricks = [];
      state.remainingBricks = 0;
      return false;
    }
    if ((p.key === 'p' || p.key === 'P') && state.isGameStarted) {
      const type = nextPowerUpType();
      const img = getPowerUpImageByType(type);
      if (img) {
        const cx = state.gameX + state.gameWidth / 2;
        const cy = state.gameY + state.gameHeight * 0.3;
        state.powerUps.push(new PowerUp(cx, cy, img, type));
      }
      return false;
    }
  }

  if (p.keyCode === ESCAPE && state.isGameStarted) {
    exitToMenu();
    return false;
  }

  if (!wasPressed && (p.key === ' ' || p.keyCode === 32 || p.keyCode === ENTER ||
      p.keyCode === UP_ARROW)) {
    handleStartOrAction();
  }

  if (p.keyCode === LEFT_ARROW || p.keyCode === RIGHT_ARROW ||
      p.keyCode === UP_ARROW || p.keyCode === DOWN_ARROW ||
      p.keyCode === 32 || p.keyCode === ENTER) {
    return false;
  }
}

export function keyReleased() {
  state.keysPressed[p.keyCode] = false;

  if (p.key === ' ' || p.keyCode === 32 || p.keyCode === ENTER ||
      p.keyCode === UP_ARROW) {
    if (state.bulletsActive) state.isShooting = false;
  }
}

export function mousePressed() {
  ensureAudio();
  if (state.isTouchDevice) return false;

  if (isMuteButtonClick(p.mouseX, p.mouseY)) {
    toggleMute();
    return false;
  }

  handleStartOrAction();
  return false;
}

export function mouseReleased() {
  if (state.isTouchDevice) return false;
  if (state.bulletsActive) state.isShooting = false;
  return false;
}

export function touchStarted() {
  ensureAudio();
  if (isMuteButtonClick(p.mouseX, p.mouseY)) {
    toggleMute();
    return false;
  }

  if (!state.isGameStarted && !state.isGameOver && !state.isGameWon) {
    state.inputMode = 'touch';
    state.isGameStarted = true;
    state.awaitingLaunch = true;
    state.launchStartTime = p.millis();
    announceToScreenReader('Game started! Mode: touch');
  } else if (state.isGameStarted) {
    if (state.awaitingLaunch) triggerBallLaunch();
    if (state.bulletsActive) state.isShooting = true;
    if (state.magnetPowerUpActive && state.balls.length > 0 &&
        state.balls[0].speedX === 0 && state.balls[0].speedY === 0) {
      launchBall();
    }
  }
  return false;
}

export function touchMoved() {
  if (state.isGameStarted && state.paddleObj.canMove) {
    let deltaX = p.mouseX - p.pmouseX;
    if (state.paddleObj.isInvertedCommands) deltaX = -deltaX;
    if (deltaX !== 0) state.paddleObj.moveByDelta(deltaX);
  }
  return false;
}

export function touchEnded() {
  if (state.bulletsActive) state.isShooting = false;
  return false;
}
