import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { playHitSound } from '../audio.js';
import { PADDLE_CORNER_RADIUS, PI, constrain, dist } from '../constants.js';

export class Ball {
  constructor(x, y, speedX, speedY) {
    this.images = assets.ballImagesNormal;
    this.frame = 0;
    this.diameter = 24 * state.scaleFactor;
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.lastAnimationTime = 0;
    this.initialSpeed = dist(0, 0, speedX, speedY);
    this.animationInterval = 100;
  }

  setInitialSpeed(sx, sy) {
    this.initialSpeed = dist(0, 0, sx, sy);
  }

  update(gx, gy, gw, gh) {
    const paddle = state.paddleObj;

    if (state.awaitingLaunch) {
      this.x = paddle.x + paddle.w / 2 - this.diameter / 2;
      this.y = paddle.y - this.diameter;
      if (p.millis() - state.launchStartTime >= state.launchDelay) {
        triggerBallLaunch();
      }
      return false;
    }

    if (state.magnetPowerUpActive) {
      const targetX = paddle.x + paddle.w / 2 - this.diameter / 2;
      const targetY = paddle.y - this.diameter;
      this.x += (targetX - this.x) * state.magnetPullSpeed;
      this.y += (targetY - this.y) * state.magnetPullSpeed;
      if (dist(this.x, this.y, targetX, targetY) < 1) {
        this.speedX = 0;
        this.speedY = 0;
        paddle.canMove = false;
      }
    } else {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < gx + state.frameStrokeX) {
        this.x = gx + state.frameStrokeX;
        this.speedX = Math.abs(this.speedX);
      } else if (this.x + this.diameter > gx + gw - state.frameStrokeX) {
        this.x = gx + gw - state.frameStrokeX - this.diameter;
        this.speedX = -Math.abs(this.speedX);
      }
      if (this.y < gy + state.frameStrokeY) {
        this.y = gy + state.frameStrokeY;
        this.speedY = Math.abs(this.speedY);
      }

      if (this.y + this.diameter > gy + gh - state.frameStrokeY) return true;

      this.checkPaddleCollision();
    }
    return false;
  }

  checkPaddleCollision() {
    const paddle = state.paddleObj;
    const px = paddle.x, py = paddle.y, pw = paddle.w, ph = paddle.h;
    const br = this.diameter / 2;
    const bcx = this.x + br;
    const bcy = this.y + br;
    const r = PADDLE_CORNER_RADIUS * state.scaleFactor;

    const innerLeft = px + r;
    const innerRight = px + pw - r;
    const innerTop = py + r;
    const innerBottom = py + ph - r;

    const closestX = constrain(bcx, innerLeft, innerRight);
    const closestY = constrain(bcy, innerTop, innerBottom);

    const dx = bcx - closestX;
    const dy = bcy - closestY;
    const distSq = dx * dx + dy * dy;
    const touchDist = r + br;

    if (distSq >= touchDist * touchDist) return false;

    const d = Math.sqrt(distSq);
    let nx = 0, ny = -1;
    if (d > 0.001) {
      nx = dx / d;
      ny = dy / d;
    }

    const penetration = touchDist - d;
    this.x += nx * penetration;
    this.y += ny * penetration;

    const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);

    if (ny < -0.3) {
      const hitPos = constrain((bcx - px) / pw, 0, 1);
      const angle = getZoneBounceAngle(hitPos);
      this.speedX = speed * Math.sin(angle);
      this.speedY = -speed * Math.cos(angle);
    } else {
      const dot = this.speedX * nx + this.speedY * ny;
      this.speedX -= 2 * dot * nx;
      this.speedY -= 2 * dot * ny;
      const newSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
      if (newSpeed > 0.001) {
        this.speedX = (this.speedX / newSpeed) * speed;
        this.speedY = (this.speedY / newSpeed) * speed;
      }
    }

    if (this.speedY > 0) this.speedY = -this.speedY;

    playHitSound();
    return true;
  }

  display() {
    p.image(this.images[this.frame], this.x, this.y, this.diameter, this.diameter);
    const currentTime = p.millis();
    if (currentTime - this.lastAnimationTime > this.animationInterval) {
      this.frame = (this.frame + 1) % this.images.length;
      this.lastAnimationTime = currentTime;
    }
  }

  setSmallBall() {
    this.images = assets.ballImagesSmall;
    this.diameter = 12 * state.scaleFactor;
  }

  resetToNormalSize() {
    this.images = assets.ballImagesNormal;
    this.diameter = 24 * state.scaleFactor;
  }
}

function getZoneBounceAngle(hitPos) {
  if (hitPos < 0.2) return -60 * PI / 180;
  if (hitPos < 0.4) return -30 * PI / 180;
  if (hitPos < 0.6) return 0;
  if (hitPos < 0.8) return  30 * PI / 180;
  return 60 * PI / 180;
}

export function triggerBallLaunch() {
  if (!state.awaitingLaunch || state.balls.length === 0) return;
  state.awaitingLaunch = false;
  const ball = state.balls[0];
  const speed = ball.initialSpeed;
  const angle = (Math.random() * 2 - 1) * PI / 5;
  ball.speedX = speed * Math.sin(angle);
  ball.speedY = -Math.abs(speed * Math.cos(angle));
}

export function setupBall() {
  const speed = state.initialSpeed * state.scaleFactor;
  const d = 24 * state.scaleFactor;
  const paddle = state.paddleObj;
  const ball = new Ball(
    paddle.x + paddle.w / 2 - d / 2,
    paddle.y - d,
    0, 0,
  );
  ball.setInitialSpeed(speed, speed);
  state.balls.push(ball);
}

export function drawBalls() {
  for (let i = state.balls.length - 1; i >= 0; i--) {
    const ball = state.balls[i];
    if (ball.update(state.gameX, state.gameY, state.gameWidth, state.gameHeight)) {
      state.balls.splice(i, 1);
      if (state.balls.length === 0) {
        // Imported lazily to avoid circular dependency at module level
        loseLife();
      }
    } else {
      ball.display();
    }
  }
}

export function resetBall() {
  state.balls = [];
  const speed = state.initialSpeed * state.scaleFactor;
  const d = 24 * state.scaleFactor;
  const paddle = state.paddleObj;
  const ball = new Ball(
    paddle.x + paddle.w / 2 - d / 2,
    paddle.y - d,
    0, 0,
  );
  ball.setInitialSpeed(speed, speed);
  state.balls.push(ball);
  state.magnetPowerUpActive = false;
  paddle.canMove = true;
  state.awaitingLaunch = true;
  state.launchStartTime = p.millis();
}

// Late-bound reference to avoid circular import issues.
// loseLife is defined in lives.js which imports from gameFunctions.js
// which in turn imports from ball.js.
let _loseLife = null;

export function setLoseLifeFn(fn) {
  _loseLife = fn;
}

function loseLife() {
  if (_loseLife) _loseLife();
}
