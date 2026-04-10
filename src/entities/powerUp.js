import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { playCoinSound } from '../audio.js';
import { announceToScreenReader } from '../utils.js';
import { Typewriter } from '../ui/typewriter.js';
import { Ball } from './ball.js';
import { PI, LEFT, CENTER, nf } from '../constants.js';

export class PowerUp {
  constructor(x, y, img, type) {
    this.x = x;
    this.y = y;
    this.image = img;
    this.speed = 2 * state.scaleFactor;
    this.type = type;
    this.displaySize = 24 * state.scaleFactor;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    p.image(this.image, this.x - this.displaySize / 2, this.y, this.displaySize, this.displaySize);
  }

  isOffScreen(gy, gh) {
    return this.y + this.displaySize > gy + gh;
  }

  checkCollision(px, py, pw, ph) {
    return this.x - this.displaySize / 2 < px + pw &&
           this.x + this.displaySize / 2 > px &&
           this.y < py + ph &&
           this.y + this.displaySize > py;
  }
}

export function getPowerUpImageByType(type) {
  return assets.powerUpImages[type] || null;
}

export function setupPowerUps() {
  state.powerUpIcons = {
    bullets: assets.powerUpImages.bullets,
    fastBall: assets.powerUpImages.fastBall,
    slowBall: assets.powerUpImages.slowBall,
    bigBar: assets.powerUpImages.bigBar,
    magnet: assets.powerUpImages.magnet,
    multiball: assets.powerUpImages.multiball,
    invertedCommands: assets.powerUpImages.invertedCommands,
    smallBar: assets.powerUpImages.smallBar,
    slowBar: assets.powerUpImages.slowBar,
    fastBar: assets.powerUpImages.fastBar,
    smallBall: assets.powerUpImages.smallBall,
  };

  state.powerUpMessages = {
    bullets: 'Bullets activated! Press SPACE to shoot!',
    fastBall: 'Fast Ball! The ball is now super speedy!',
    slowBall: 'Slow Ball! The ball is now slower!',
    bigBar: 'Big Bar! Your paddle is now bigger!',
    magnet: 'Magnet! The ball sticks to your paddle! Press SPACE to launch!',
    multiball: 'Multiball! Now you have multiple balls!',
    invertedCommands: 'Inverted Commands! Controls are reversed!',
    smallBar: 'Small Bar! Your paddle is now smaller!',
    slowBar: 'Slow Bar! Your paddle moves slower!',
    fastBar: 'Fast Bar! Your paddle moves faster!',
    smallBall: 'Small Ball! The ball is now smaller!',
  };

  state.typewriter = new Typewriter('', 50, 0);
}

export function drawPowerUps(gy, gh) {
  const paddle = state.paddleObj;
  for (let i = state.powerUps.length - 1; i >= 0; i--) {
    const pu = state.powerUps[i];
    pu.update();
    pu.draw();
    if (pu.isOffScreen(gy, gh)) {
      state.powerUps.splice(i, 1);
    } else if (pu.checkCollision(paddle.x, paddle.y, paddle.w, paddle.h)) {
      state.powerUps.splice(i, 1);
      for (const ball of state.balls) {
        if (ball.y + ball.diameter <= paddle.y) {
          applyPowerUp(pu);
          break;
        }
      }
    }
  }
  drawActivePowerUpTimer();
}

function drawActivePowerUpTimer() {
  if (state.activePowerUpType !== '') {
    const sf = state.scaleFactor;
    const iconSize = 24 * sf;
    const padding = 8 * sf;
    const barWidth = 120 * sf;
    const barHeight = 24 * sf;

    let barX, barY;
    const timerWidth = iconSize + padding + barWidth + padding + 50 * sf;
    const rightSpace = p.width - (state.gameX + state.gameWidth + 10 * sf);

    if (rightSpace >= timerWidth) {
      barX = state.gameX + state.gameWidth + 10 * sf;
      barY = state.gameY + state.gameHeight - 25 * sf;
    } else {
      barX = state.gameX;
      barY = state.gameY + state.gameHeight + 72 * sf;
    }

    const icon = state.powerUpIcons[state.activePowerUpType];

    if (state.activePowerUpType !== 'life' && icon) {
      p.image(icon, barX, barY, iconSize, iconSize);
    }

    if (state.activePowerUpType !== 'life' && state.activePowerUpType !== 'magnet') {
      const timeLeft = (state.powerUpDuration - (p.millis() - state.powerUpStartTime)) / 1000.0;
      const progress = timeLeft / (state.powerUpDuration / 1000.0);

      p.noStroke();
      p.fill(255, 0, 0);
      p.rect(barX + iconSize + padding, barY, barWidth * progress, barHeight);

      p.noFill();
      p.stroke(255);
      p.rect(barX + iconSize + padding, barY, barWidth, barHeight);

      p.fill(255);
      p.noStroke();
      p.textFont(assets.creditsFont);
      p.textSize(Math.max(10, 14 * sf));
      p.textAlign(LEFT, CENTER);
      p.text(nf(timeLeft, 1, 1) + 's', barX + iconSize + padding + barWidth + padding, barY + barHeight / 2);

      state.typewriter.update();
      const messageY = barY - 14 * sf - state.typewriter.getMessageHeight();
      state.typewriter.display(barX + 2, messageY);
    } else if (state.activePowerUpType === 'magnet') {
      state.typewriter.update();
      const messageY = barY + iconSize / 2 - state.typewriter.getMessageHeight() / 2;
      state.typewriter.display(barX + iconSize + padding, messageY);
    }
  }
}

function applyPowerUp(pu) {
  if (pu.type !== 'life') {
    deactivateActivePowerUp();
  }

  if (pu.type !== 'life') {
    const message = state.powerUpMessages[pu.type];
    if (message) {
      const maxW = pu.type === 'magnet'
        ? 400 * state.scaleFactor
        : (120 + 24 + 8) * state.scaleFactor;
      state.typewriter = new Typewriter(message, 50, maxW);
    }
  }

  playCoinSound();

  switch (pu.type) {
    case 'bullets': activateBullets(); break;
    case 'fastBall': activateFastBall(); break;
    case 'multiball': activateMultiball(); break;
    case 'slowBall': activateSlowBall(); break;
    case 'bigBar': activateBigBar(); break;
    case 'magnet': activateMagnet(); break;
    case 'life': addLife(); break;
    case 'invertedCommands': activateInvertedCommands(); break;
    case 'smallBar': activateSmallBar(); break;
    case 'slowBar': activateSlowBar(); break;
    case 'fastBar': activateFastBar(); break;
    case 'smallBall': activateSmallBall(); break;
  }

  if (pu.type === 'life') {
    announceToScreenReader('Extra life! Lives: ' + state.vidas);
  } else {
    announceToScreenReader(state.powerUpMessages[pu.type] || 'Power-up: ' + pu.type);
  }
}

function activateBullets() {
  state.bulletsActive = true;
  state.magnetPowerUpActive = false;
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'bullets';
  state.powerUpStartTime = p.millis();
}

function activateMultiball() {
  if (state.balls.length === 0) return;
  const mainBall = state.balls[0];
  state.balls.push(new Ball(mainBall.x, mainBall.y, -mainBall.speedX, mainBall.speedY));
  state.balls.push(new Ball(mainBall.x, mainBall.y, mainBall.speedX, -mainBall.speedY));
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'multiball';
  state.powerUpStartTime = p.millis();
}

function activateFastBall() {
  for (const ball of state.balls) {
    ball.speedX *= 1.5;
    ball.speedY *= 1.5;
  }
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'fastBall';
  state.powerUpStartTime = p.millis();
}

function activateSlowBall() {
  for (const ball of state.balls) {
    ball.speedX *= 0.5;
    ball.speedY *= 0.5;
  }
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'slowBall';
  state.powerUpStartTime = p.millis();
}

function activateMagnet() {
  state.magnetPowerUpActive = true;
  deactivateBullets();
  state.paddleObj.canMove = false;
  state.activePowerUpType = 'magnet';
}

function addLife() {
  if (state.vidas < 5) {
    state.vidas++;
  }
}

function activateInvertedCommands() {
  state.paddleObj.isInvertedCommands = true;
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'invertedCommands';
  state.powerUpStartTime = p.millis();
}

function activateBigBar() {
  deactivateActivePowerUp();
  state.paddleObj.setBig();
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'bigBar';
  state.powerUpStartTime = p.millis();
}

function activateSmallBar() {
  deactivateActivePowerUp();
  state.paddleObj.setSmall();
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'smallBar';
  state.powerUpStartTime = p.millis();
}

function activateSlowBar() {
  state.paddleObj.previousSpeed = state.paddleObj.speed;
  state.paddleObj.speed *= 0.5;
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'slowBar';
  state.powerUpStartTime = p.millis();
}

function activateFastBar() {
  state.paddleObj.previousSpeed = state.paddleObj.speed;
  state.paddleObj.speed *= 1.5;
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'fastBar';
  state.powerUpStartTime = p.millis();
}

function activateSmallBall() {
  for (const ball of state.balls) {
    ball.setSmallBall();
  }
  state.paddleObj.canMove = true;
  state.activePowerUpType = 'smallBall';
  state.powerUpStartTime = p.millis();
}

function deactivateBullets() {
  state.bulletsActive = false;
  state.isShooting = false;
}

export function deactivateActivePowerUp() {
  const paddle = state.paddleObj;
  switch (state.activePowerUpType) {
    case 'bullets':
      deactivateBullets();
      break;
    case 'multiball':
      while (state.balls.length > 1) {
        state.balls.pop();
      }
      break;
    case 'fastBall':
    case 'slowBall':
      resetBallSpeed();
      break;
    case 'bigBar':
    case 'smallBar':
      paddle.resetSize();
      break;
    case 'slowBar':
    case 'fastBar':
      paddle.speed = paddle.previousSpeed;
      break;
    case 'smallBall':
      for (const ball of state.balls) {
        ball.resetToNormalSize();
      }
      break;
    case 'invertedCommands':
      paddle.isInvertedCommands = false;
      break;
  }
  if (!state.magnetPowerUpActive) {
    paddle.canMove = true;
  }
  state.activePowerUpType = '';
}

function resetBallSpeed() {
  const speed = state.initialSpeed * state.scaleFactor;
  for (const ball of state.balls) {
    ball.speedX = speed * (ball.speedX / Math.abs(ball.speedX));
    ball.speedY = speed * (ball.speedY / Math.abs(ball.speedY));
    ball.setInitialSpeed(speed, speed);
  }
}

export function launchBall() {
  if (state.balls.length === 0) return;
  const angle = state.arrowAngle - PI / 2;
  const ball = state.balls[0];
  ball.speedX = Math.cos(angle) * ball.initialSpeed;
  ball.speedY = Math.sin(angle) * ball.initialSpeed;
  state.magnetPowerUpActive = false;
  state.paddleObj.canMove = true;
  state.activePowerUpType = '';
  state.typewriter.reset();
}

export function shouldDeactivatePowerUp() {
  return state.activePowerUpType !== 'magnet' && state.activePowerUpType !== '' &&
         p.millis() - state.powerUpStartTime > state.powerUpDuration;
}
