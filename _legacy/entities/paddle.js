import { p } from '../p5Context.js';
import { state, assets } from '../state.js';

export class Paddle {
  constructor() {
    this.image = null;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.speed = 5;
    this.canMove = true;
    this.direction = 0;
    this.isInvertedCommands = false;
    this.previousSpeed = 5;
    this.isBlinking = false;
    this.blinkStartTime = 0;
    this.blinkDuration = 500;
  }

  setup() {
    this.image = assets.paddleImageNormal;
    this.w = this.image.width * state.scaleFactor;
    this.h = this.image.height * state.scaleFactor;
    this.x = state.gameX + state.gameWidth / 2 - this.w / 2;
    this.y = state.gameY + state.gameHeight - this.h - 30 * state.scaleFactor;
    this.speed = 5 * state.scaleFactor;
    this.previousSpeed = this.speed;
  }

  draw() {
    if (this.isBlinking) {
      if ((p.millis() - this.blinkStartTime) % 200 < 100) {
        p.image(this.image, this.x, this.y, this.w, this.h);
      }
      if (p.millis() - this.blinkStartTime > this.blinkDuration) {
        this.isBlinking = false;
      }
    } else {
      p.image(this.image, this.x, this.y, this.w, this.h);
    }
  }

  move(dir) {
    if (this.canMove) {
      this.x += dir * this.speed;
      this._clampPosition();
    }
  }

  setPosition(targetX) {
    if (this.canMove) {
      this.x = targetX - this.w / 2;
      this._clampPosition();
    }
  }

  moveByDelta(dx) {
    if (!this.canMove) return;
    this.x += dx;
    this._clampPosition();
  }

  _clampPosition() {
    const adjustedGameX = state.gameX + state.frameStrokeX;
    const adjustedGameWidth = state.gameWidth - 2 * state.frameStrokeX;
    if (this.x < adjustedGameX) {
      this.x = adjustedGameX;
    } else if (this.x + this.w > adjustedGameX + adjustedGameWidth) {
      this.x = adjustedGameX + adjustedGameWidth - this.w;
    }
  }

  resetSize() {
    const previousWidth = this.w;
    this.image = assets.paddleImageNormal;
    this.w = this.image.width * state.scaleFactor;
    this.h = this.image.height * state.scaleFactor;
    this.x += (previousWidth - this.w) / 2;
    this.canMove = true;
  }

  setBig() {
    this.isBlinking = true;
    this.blinkStartTime = p.millis();
    const previousWidth = this.w;
    this.image = assets.paddleImageBig;
    this.w = this.image.width * state.scaleFactor;
    this.h = this.image.height * state.scaleFactor;
    this.x -= (this.w - previousWidth) / 2;
  }

  setSmall() {
    this.isBlinking = true;
    this.blinkStartTime = p.millis();
    const previousWidth = this.w;
    this.image = assets.paddleImageSmall;
    this.w = this.image.width * state.scaleFactor;
    this.h = this.image.height * state.scaleFactor;
    this.x += (previousWidth - this.w) / 2;
  }
}
