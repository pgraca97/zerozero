import { p } from '../p5Context.js';

export class AnimatedStar {
  constructor(spriteSheet, x, y, frameWidth, frameHeight, totalFrames, frameInterval) {
    this.x = x;
    this.y = y;
    this.totalFrames = totalFrames;
    this.frameInterval = frameInterval;
    this.currentFrame = 0;
    this.lastFrameChangeTime = p.millis();

    this.frames = [];
    const framesPerRow = Math.floor(spriteSheet.width / frameWidth);
    for (let i = 0; i < totalFrames; i++) {
      const fx = (i % framesPerRow) * frameWidth;
      const fy = Math.floor(i / framesPerRow) * frameHeight;
      this.frames.push(spriteSheet.get(fx, fy, frameWidth, frameHeight));
    }
  }

  update() {
    if (p.millis() - this.lastFrameChangeTime > this.frameInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.lastFrameChangeTime = p.millis();
    }
  }

  display() {
    p.image(this.frames[this.currentFrame], this.x, this.y);
  }
}
