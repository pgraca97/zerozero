import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { playCollisionSound } from '../audio.js';
import { BRICK_COLORS, random } from '../constants.js';
import { PowerUp, getPowerUpImageByType } from './powerUp.js';

export class Brick {
  constructor(x, y, brickColor, hitsRequired, points, w, h) {
    this.x = x;
    this.y = y;
    this.brickImage = assets.brickImages[brickColor];
    this.brokenBrickImage = assets.brokenBrickImages[brickColor];
    this.w = w;
    this.h = h;
    this.isBroken = false;
    this.isRemoved = false;
    this.hitsRequired = hitsRequired;
    this.points = points;
    this.glossFrameIndex = 0;
    this.glossAnimationInterval = 100;
    this.lastGlossAnimationTime = 0;
    this.isAnimatingGloss = false;
  }

  draw() {
    if (!this.isRemoved) {
      if (this.isBroken) {
        p.image(this.brokenBrickImage, this.x, this.y, this.w, this.h);
      } else {
        p.image(this.brickImage, this.x, this.y, this.w, this.h);
        this.drawGlossAnimation();
      }
    }
  }

  checkCollision(ballX, ballY, ballDiameter) {
    if (!this.isRemoved &&
        ballX + ballDiameter > this.x && ballX < this.x + this.w &&
        ballY + ballDiameter > this.y && ballY < this.y + this.h) {
      this.hitsRequired--;
      if (this.hitsRequired <= 0) {
        this.isBroken = true;
        this.isRemoved = true;
        state.remainingBricks--;
        const currentTime = p.millis();
        state.destroyedBricks[this.x + ',' + this.y] = currentTime;
        this.maybeDropPowerUp(this.x + this.w / 2, this.y + this.h / 2, currentTime);
        state.currentScore += this.points;
      } else {
        if (this.hitsRequired === 1) {
          this.isBroken = true;
        } else {
          this.isAnimatingGloss = true;
          this.lastGlossAnimationTime = p.millis();
        }
      }

      const overlapLeft = (ballX + ballDiameter) - this.x;
      const overlapRight = (this.x + this.w) - ballX;
      const overlapTop = (ballY + ballDiameter) - this.y;
      const overlapBottom = (this.y + this.h) - ballY;
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        return 'horizontal';
      }
      return 'vertical';
    }
    return false;
  }

  drawGlossAnimation() {
    if (this.isAnimatingGloss) {
      const currentTime = p.millis();
      if (currentTime - this.lastGlossAnimationTime > this.glossAnimationInterval) {
        this.glossFrameIndex = (this.glossFrameIndex + 1) % assets.glossAnimationFrames.length;
        this.lastGlossAnimationTime = currentTime;
        if (this.glossFrameIndex === 0) {
          this.isAnimatingGloss = false;
        }
      }
      p.image(assets.glossAnimationFrames[this.glossFrameIndex], this.x, this.y, this.w, this.h);
    }
  }

  maybeDropPowerUp(x, y, destroyTime) {
    if (state.activePowerUpType === 'magnet' || state.activePowerUpType === 'multiball') {
      this.dropSpecificPowerUps(x, y, destroyTime,
        ['slowBall', 'bigBar', 'life', 'fastBall', 'invertedCommands', 'smallBar', 'slowBar', 'fastBar']);
    } else {
      this.dropRandomPowerUp(x, y, destroyTime);
    }
  }

  dropSpecificPowerUps(x, y, destroyTime, allowedTypes) {
    let recentDrops = 0;
    for (const key in state.destroyedBricks) {
      if (destroyTime - state.destroyedBricks[key] <= state.dropCheckInterval) {
        recentDrops++;
      }
    }
    if (recentDrops >= state.maxPowerUpsToDrop) return;

    const powerUpType = allowedTypes[Math.floor(random(allowedTypes.length))];
    state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType(powerUpType), powerUpType));
  }

  dropRandomPowerUp(x, y, destroyTime) {
    let recentDrops = 0;
    for (const key in state.destroyedBricks) {
      if (destroyTime - state.destroyedBricks[key] <= state.dropCheckInterval) {
        recentDrops++;
      }
    }
    if (recentDrops >= state.maxPowerUpsToDrop) return;

    const chance = random(1);
    if (chance < 0.1) {
      this.dropAttackPowerUp(x, y);
    } else if (chance < 0.3) {
      this.dropDefensePowerUp(x, y);
    } else if (chance < 0.6) {
      this.dropChallengePowerUp(x, y);
    }
  }

  dropAttackPowerUp(x, y) {
    const attackChance = random(1);
    if (attackChance < 0.5) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('bullets'), 'bullets'));
    } else {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('magnet'), 'magnet'));
    }
  }

  dropDefensePowerUp(x, y) {
    const defenseChance = random(1);
    if (defenseChance < 0.2) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('slowBall'), 'slowBall'));
    } else if (defenseChance < 0.4) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('bigBar'), 'bigBar'));
    } else if (defenseChance < 1.0 && state.vidas < 5) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('life'), 'life'));
    }
  }

  dropChallengePowerUp(x, y) {
    const challengeChance = random(1);
    if (challengeChance < 0.143) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('slowBar'), 'slowBar'));
    } else if (challengeChance < 0.286) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('multiball'), 'multiball'));
    } else if (challengeChance < 0.429) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('invertedCommands'), 'invertedCommands'));
    } else if (challengeChance < 0.571) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('smallBar'), 'smallBar'));
    } else if (challengeChance < 0.714) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('fastBall'), 'fastBall'));
    } else if (challengeChance < 0.857) {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('fastBar'), 'fastBar'));
    } else {
      state.powerUps.push(new PowerUp(x, y, getPowerUpImageByType('smallBall'), 'smallBall'));
    }
  }
}

export function setupBricks() {
  const colors = BRICK_COLORS;
  const hitsArr = [4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2];
  const pointsArr = [400, 300, 200, 400, 300, 200, 400, 300, 200, 400, 300, 200];

  const numCols = 6;
  const numRows = 12;
  const innerWidth = state.gameWidth - 2 * state.frameStrokeX;
  const brickW = Math.floor(innerWidth * 0.85 / numCols);
  const brickH = Math.floor(brickW / 4);
  const totalW = numCols * brickW;
  const startX = state.gameX + (state.gameWidth - totalW) / 2;
  const startY = state.gameY + 50 * state.scaleFactor;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      state.bricks.push(new Brick(
        startX + col * brickW,
        startY + row * brickH,
        colors[row % colors.length],
        hitsArr[row % hitsArr.length],
        pointsArr[row % pointsArr.length],
        brickW,
        brickH,
      ));
    }
  }
  state.remainingBricks = state.bricks.length;
}

export function drawBricks() {
  for (const brick of state.bricks) {
    brick.draw();
  }
}

export function checkBallBrickCollisions() {
  for (const ball of state.balls) {
    for (const brick of state.bricks) {
      if (brick.isRemoved) continue;
      const side = brick.checkCollision(ball.x, ball.y, ball.diameter);
      if (side) {
        if (side === 'horizontal') {
          ball.speedX *= -1;
        } else {
          ball.speedY *= -1;
        }
        playCollisionSound();
        break;
      }
    }
  }
}

export function allBricksDestroyed() {
  return state.remainingBricks === 0;
}
