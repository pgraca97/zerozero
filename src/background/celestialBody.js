import { p } from '../p5Context.js';
import { random, TWO_PI, CENTER } from '../constants.js';

export class CelestialBody {
  constructor(img, x, y, speedX, speedY, rotationSpeed) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.rotationSpeed = rotationSpeed;
    this.rotation = random(TWO_PI);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    if (this.x > p.width) this.x = -this.img.width;
    if (this.x < -this.img.width) this.x = p.width;
    if (this.y > p.height) this.y = -this.img.height;
    if (this.y < -this.img.height) this.y = p.height;
  }

  display() {
    p.push();
    p.translate(this.x + this.img.width / 2, this.y + this.img.height / 2);
    p.rotate(this.rotation);
    p.imageMode(CENTER);
    p.image(this.img, 0, 0);
    p.pop();
  }
}
