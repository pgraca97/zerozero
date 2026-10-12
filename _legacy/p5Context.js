// Holds the p5 instance for all modules.
// In p5 "instance mode", every p5 function (image, fill, text, etc.)
// lives on this object instead of the global window.
// Set once in main.js before any lifecycle function runs.

/** @type {import('p5')} */
export let p = null;

export function setP5(instance) {
  p = instance;
}
