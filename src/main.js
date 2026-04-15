// Entry point - creates the p5 instance in "instance mode"
// and wires every lifecycle function to it.

import p5 from 'p5';
import { setP5 } from './p5Context.js';
import { preload, setup, draw, windowResized } from './sketch.js';
import {
  keyPressed, keyReleased,
  mousePressed, mouseReleased,
  touchStarted, touchMoved, touchEnded,
  clearAllKeys,
} from './game/inputHandler.js';

const sketch = (instance) => {
  // Make the instance available to every module before any lifecycle runs
  setP5(instance);

  instance.preload = preload;
  instance.setup = setup;
  instance.draw = draw;
  instance.windowResized = windowResized;

  instance.keyPressed = keyPressed;
  instance.keyReleased = keyReleased;
  instance.mousePressed = mousePressed;
  instance.mouseReleased = mouseReleased;
  instance.touchStarted = touchStarted;
  instance.touchMoved = touchMoved;
  instance.touchEnded = touchEnded;
};

new p5(sketch);

window.addEventListener('blur', clearAllKeys);
