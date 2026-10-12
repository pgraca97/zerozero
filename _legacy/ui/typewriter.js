import { p } from '../p5Context.js';
import { state, assets } from '../state.js';
import { LEFT, TOP } from '../constants.js';

export class Typewriter {
  constructor(text, interval, maxWidth) {
    this.text = text;
    this.displayedText = '';
    this.index = 0;
    this.startTime = p.millis();
    this.interval = interval;
    this.isComplete = false;
    this.maxWidth = maxWidth;
  }

  update() {
    if (p.millis() - this.startTime > this.interval && !this.isComplete) {
      if (this.index < this.text.length) {
        this.displayedText += this.text.charAt(this.index);
        this.index++;
        this.startTime = p.millis();
      } else {
        this.isComplete = true;
      }
    }
  }

  display(x, y) {
    p.fill(255);
    p.textFont(assets.creditsFont);
    p.textSize(Math.max(10, 14 * state.scaleFactor));
    p.textAlign(LEFT, TOP);
    const lineH = 16 * state.scaleFactor;
    const lines = this.wrapText(this.displayedText, this.maxWidth);
    for (let i = 0; i < lines.length; i++) {
      p.text(lines[i], x, y + i * lineH);
    }
  }

  reset() {
    this.displayedText = '';
    this.index = 0;
    this.startTime = p.millis();
    this.isComplete = false;
  }

  wrapText(txt, maxW) {
    if (!txt || txt.length === 0) return [''];
    const words = txt.split(' ');
    let currentLine = words[0];
    const lines = [];

    for (let i = 1; i < words.length; i++) {
      if (p.textWidth(currentLine + ' ' + words[i]) <= maxW) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return lines;
  }

  getMessageHeight() {
    p.textFont(assets.creditsFont);
    p.textSize(Math.max(10, 14 * state.scaleFactor));
    const lineH = 16 * state.scaleFactor;
    const lines = this.wrapText(this.displayedText, this.maxWidth);
    return lines.length * lineH;
  }
}
