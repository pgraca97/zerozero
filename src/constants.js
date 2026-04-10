// Math constants
export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;
export const HALF_PI = Math.PI / 2;

// p5 alignment / mode constants (string values)
export const CENTER = 'center';
export const LEFT = 'left';
export const RIGHT = 'right';
export const TOP = 'top';
export const BOTTOM = 'bottom';

// Key codes
export const LEFT_ARROW = 37;
export const RIGHT_ARROW = 39;
export const UP_ARROW = 38;
export const DOWN_ARROW = 40;
export const ENTER = 13;
export const ESCAPE = 27;
export const ARROW_CURSOR = 'default';

// Game constants
export const PADDLE_CORNER_RADIUS = 6;
export const INITIAL_SPEED = 5.5;
export const LAUNCH_DELAY = 2000;
export const MAGNET_PULL_SPEED = 0.1;
export const POWER_UP_DURATION = 8000;
export const DROP_CHECK_INTERVAL = 1500;
export const MAX_POWER_UPS_TO_DROP = 3;
export const SHOOT_INTERVAL = 300;
export const GAME_OVER_DURATION = 10000;

export const BRICK_COLORS = [
  'black', 'blue', 'brown', 'gold', 'green', 'lightblue',
  'orange', 'pink', 'purple', 'red', 'silver', 'yellow',
];

// Utility functions (replace p5 math helpers)
export function constrain(val, lo, hi) {
  return Math.max(lo, Math.min(hi, val));
}

export function mapRange(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

export function lerp(start, stop, amt) {
  return start + (stop - start) * amt;
}

export function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function random(a, b) {
  if (a === undefined) return Math.random();
  if (b === undefined) return Math.random() * a;
  return a + Math.random() * (b - a);
}

export function nf(num, leftDigits, rightDigits) {
  if (rightDigits !== undefined) {
    const str = num.toFixed(rightDigits);
    const [intPart, decPart] = str.split('.');
    return intPart.padStart(leftDigits, '0') + '.' + decPart;
  }
  return String(Math.floor(num)).padStart(leftDigits, '0');
}
