import { p } from '../p5Context.js';
import { random } from '../constants.js';

export class Estrelinha {
  constructor(x, y, size, r, g, b) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.r = r;
    this.g = g;
    this.b = b;
    this.brightness = random(100, 255);
    this.brightnessSpeed = random(0.5, 2);
  }

  update() {
    this.brightness += this.brightnessSpeed;
    if (this.brightness > 255 || this.brightness < 100) {
      this.brightnessSpeed *= -1;
    }
  }

  display() {
    p.fill(this.r, this.g, this.b, this.brightness);
    p.rect(this.x, this.y, this.size, this.size);
  }
}
