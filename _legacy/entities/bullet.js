import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { playCollisionSound } from '../audio.js';

export class Bullet {
  constructor(x, y, img1, img2) {
    this.x = x;
    this.y = y;
    this.image1 = img1;
    this.image2 = img2;
    this.w = img1.width * state.scaleFactor;
    this.h = img1.height * state.scaleFactor;
    this.speed = 5 * state.scaleFactor;
    this.useImage2 = false;
    this.lastAnimationTime = 0;
    this.animationInterval = 100;
  }

  update() {
    this.y -= this.speed;
    if (p.millis() - this.lastAnimationTime > this.animationInterval) {
      this.useImage2 = !this.useImage2;
      this.lastAnimationTime = p.millis();
    }
  }

  draw() {
    if (this.useImage2) {
      p.image(this.image2, this.x, this.y, this.w, this.h);
    } else {
      p.image(this.image1, this.x, this.y, this.w, this.h);
    }
  }

  isOffScreen(gameY) {
    return this.y < gameY;
  }

  checkCollision(brickX, brickY, brickW, brickH) {
    return this.x + this.w > brickX && this.x < brickX + brickW &&
           this.y + this.h > brickY && this.y < brickY + brickH;
  }
}

export function drawBullets(gy) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    bullet.update();
    bullet.draw();
    if (bullet.isOffScreen(gy)) {
      state.bullets.splice(i, 1);
    }
  }
}

export function moveBullets() {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    for (let j = state.bricks.length - 1; j >= 0; j--) {
      const brick = state.bricks[j];
      if (!brick.isRemoved && bullet.checkCollision(brick.x, brick.y, brick.w, brick.h)) {
        brick.checkCollision(bullet.x, bullet.y, bullet.w);
        playCollisionSound();
        state.bullets.splice(i, 1);
        break;
      }
    }
  }
}

export function shootBullets() {
  if (p.millis() - state.lastShootTime > state.shootInterval) {
    const paddle = state.paddleObj;
    const bulletW = assets.bulletImage1.width * state.scaleFactor;
    state.bullets.push(new Bullet(paddle.x, paddle.y, assets.bulletImage1, assets.bulletImage2));
    state.bullets.push(new Bullet(paddle.x + paddle.w - bulletW, paddle.y, assets.bulletImage1, assets.bulletImage2));
    state.lastShootTime = p.millis();
  }
}
