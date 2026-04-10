import { p } from './p5Context.js';
import { state, assets } from './state.js';
import { BRICK_COLORS, random, constrain, mapRange, ARROW_CURSOR } from './constants.js';

import { Estrelinha } from './background/estrelinha.js';
import { CelestialBody } from './background/celestialBody.js';
import { AnimatedStar } from './background/animatedStar.js';

import { Paddle } from './entities/paddle.js';
import { setupBall, resetBall, setLoseLifeFn } from './entities/ball.js';
import { setupBricks } from './entities/brick.js';
import { setupPowerUps, deactivateActivePowerUp, shouldDeactivatePowerUp } from './entities/powerUp.js';

import { updateInput } from './game/inputHandler.js';
import { drawLives, loseLife } from './game/lives.js';
import {
  updateTitlePosition, drawReadyScreen, drawGameOver, drawGameWon,
  drawGame, drawCreditsAndHighestScore, readHighestScore, resetGame,
} from './game/gameFunctions.js';
import { DEV, devConfig } from './dev.js';
import { drawDevOverlay } from './game/devOverlay.js';

// Wire up the circular dependency: ball.js needs loseLife but can't
// import it directly without a cycle. We inject it once at startup.
setLoseLifeFn(loseLife);

// Layout

export function computeGameArea() {
  const aspect = p.width / p.height;
  const margin = aspect < 1 ? 0.04 : 0.08;
  const maxW = p.width * (1 - 2 * margin);
  const maxH = p.height * (1 - 2 * margin);

  state.gameWidth = Math.min(maxW, maxH * 3 / 4);
  state.gameHeight = state.gameWidth * 4 / 3;

  if (aspect >= 1) {
    const maxWidthFrac = constrain(
      mapRange(Math.min(p.width, p.height), 400, 900, 0.4, 0.25), 0.25, 0.4,
    );
    const widthCap = p.width * maxWidthFrac;
    if (state.gameWidth > widthCap) {
      state.gameWidth = widthCap;
      state.gameHeight = state.gameWidth * 4 / 3;
    }
  }

  state.gameX = (p.width - state.gameWidth) / 2;
  state.gameY = (p.height - state.gameHeight) / 2;
  state.scaleFactor = state.gameWidth / 480;
  state.screenScale = state.scaleFactor;
  state.frameStrokeX = 6 * state.scaleFactor;
  state.frameStrokeY = 2 * state.scaleFactor;
}

// Mute button

function drawMuteButton() {
  state.muteButtonSize = 24 * state.screenScale;
  state.muteButtonX = p.width - state.muteButtonSize - 16 * state.screenScale;
  state.muteButtonY = 16 * state.screenScale;
  const img = state.soundMuted ? assets.mutedImage : assets.unmutedImage;
  if (img) {
    p.image(img, state.muteButtonX, state.muteButtonY, state.muteButtonSize, state.muteButtonSize);
  }
}

// Background helpers

function addAnimatedStars(spriteSheet, count) {
  for (let i = 0; i < count; i++) {
    let x, y, tooClose;
    let attempts = 0;
    do {
      x = random(p.width);
      y = random(p.height);
      tooClose = false;
      for (const star of state.animatedStars) {
        if (Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2) < 150) {
          tooClose = true;
          break;
        }
      }
      attempts++;
    } while (tooClose && attempts < 100);
    if (!tooClose) {
      state.animatedStars.push(new AnimatedStar(spriteSheet, x, y, 32, 32, 12, 100));
    }
  }
}

// p5 lifecycle

export function preload() {
  assets.arcadeFont = p.loadFont('assets/ARCADECLASSIC.TTF');
  assets.creditsFont = p.loadFont('assets/DePixelBreit.ttf');

  assets.frameImage = p.loadImage('assets/newFrame.png');
  assets.titleImage = p.loadImage('assets/zerozero.png');
  assets.arrowImage = p.loadImage('assets/Arrow.png');
  assets.vidaImagem = p.loadImage('assets/Life.png');
  assets.mutedImage = p.loadImage('assets/Sound FX/muted.png');
  assets.unmutedImage = p.loadImage('assets/Sound FX/unmuted.png');

  assets.ballImagesNormal = [
    p.loadImage('assets/Ball/ball_3_blue_1.png'),
    p.loadImage('assets/Ball/ball_3_blue_2.png'),
    p.loadImage('assets/Ball/ball_3_blue_3.png'),
    p.loadImage('assets/Ball/ball_3_blue_4.png'),
  ];
  assets.ballImagesSmall = [
    p.loadImage('assets/Ball/Smaller/ball_3_blue_1.png'),
    p.loadImage('assets/Ball/Smaller/ball_3_blue_2.png'),
    p.loadImage('assets/Ball/Smaller/ball_3_blue_3.png'),
    p.loadImage('assets/Ball/Smaller/ball_3_blue_4.png'),
  ];

  assets.paddleImageNormal = p.loadImage('assets/Paddle/paddle_4_mid_silver.png');
  assets.paddleImageBig = p.loadImage('assets/Paddle/paddle_4_large_silver.png');
  assets.paddleImageSmall = p.loadImage('assets/Paddle/paddle_4_silver.png');

  for (const color of BRICK_COLORS) {
    assets.brickImages[color] = p.loadImage('assets/Blocks/block_2_mid_' + color + '.png');
    assets.brokenBrickImages[color] = p.loadImage('assets/Blocks/block_broken_2_mid_' + color + '.png');
  }
  assets.glossAnimationFrames = [
    p.loadImage('assets/Blocks/gloss_animation/gloss_animation_1.png'),
    p.loadImage('assets/Blocks/gloss_animation/gloss_animation_2.png'),
    p.loadImage('assets/Blocks/gloss_animation/gloss_animation_3.png'),
  ];

  assets.powerUpImages = {
    magnet: p.loadImage('assets/Powerups/magnet.png'),
    life: p.loadImage('assets/Powerups/life.png'),
    bullets: p.loadImage('assets/Powerups/bullets.png'),
    fastBall: p.loadImage('assets/Powerups/fast_ball.png'),
    multiball: p.loadImage('assets/Powerups/multiball.png'),
    slowBall: p.loadImage('assets/Powerups/slow_ball.png'),
    bigBar: p.loadImage('assets/Powerups/big_bar.png'),
    invertedCommands: p.loadImage('assets/Powerups/inverted_commands.png'),
    smallBar: p.loadImage('assets/Powerups/small_bar.png'),
    slowBar: p.loadImage('assets/Powerups/slow_bar.png'),
    fastBar: p.loadImage('assets/Powerups/fast_bar.png'),
    smallBall: p.loadImage('assets/Powerups/small_ball.png'),
  };

  assets.bulletImage1 = p.loadImage('assets/bullet1.png');
  assets.bulletImage2 = p.loadImage('assets/bullet2.png');

  // assets.celestialBodyImages = [
  //   p.loadImage('assets/Corpos Celestes/1.png'),
  //   p.loadImage('assets/Corpos Celestes/2.png'),
  //   p.loadImage('assets/Corpos Celestes/3.png'),
  //   p.loadImage('assets/Corpos Celestes/Ast1.png'),
  //   p.loadImage('assets/Corpos Celestes/Ast2.png'),
  //   p.loadImage('assets/Corpos Celestes/Ast3.png'),
  //   p.loadImage('assets/Corpos Celestes/Ast4.png'),
  // ];

  assets.starSprites = {
    blue: p.loadImage('assets/Corpos Celestes/Star_Blue.png'),
    green: p.loadImage('assets/Corpos Celestes/Star_Green.png'),
    red: p.loadImage('assets/Corpos Celestes/Star_Red.png'),
  };
}

export function setup() {
  const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
  canvas.elt.setAttribute('aria-label', 'ZeroZero brick breaker game');
  canvas.elt.setAttribute('tabindex', '0');

  state.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    state.prefersReducedMotion = e.matches;
  });

  p.noSmooth();
  computeGameArea();

  state.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  readHighestScore();

  for (let i = 0; i < 100; i++) {
    state.estrelinhasAzuis.push(new Estrelinha(random(p.width), random(p.height), random(1, 2), 0, 0, 255));
    state.estrelinhasVermelhas.push(new Estrelinha(random(p.width), random(p.height), random(1, 3), 255, 0, 0));
    state.estrelinhasVerdes.push(new Estrelinha(random(p.width), random(p.height), random(1, 3), 0, 255, 0));
  }

  // for (const img of assets.celestialBodyImages) {
  //   state.celestialBodies.push(new CelestialBody(
  //     img, random(p.width), random(p.height),
  //     random(-2, 2), random(-2, 2), random(-0.05, 0.05),
  //   ));
  // }

  addAnimatedStars(assets.starSprites.blue, 8);
  addAnimatedStars(assets.starSprites.green, 8);
  addAnimatedStars(assets.starSprites.red, 8);

  if (DEV) {
    state.vidas = devConfig.startLives;
    state.initialSpeed = devConfig.ballSpeed;
  }

  state.paddleObj = new Paddle();
  state.paddleObj.setup();
  setupBall();
  setupBricks();
  setupPowerUps();

  state.titleYBase = p.height * 0.12;
  state.titleY = state.titleYBase;
}

export function draw() {
  p.background(13, 12, 19);

  for (const body of state.celestialBodies) {
    if (!state.prefersReducedMotion) body.update();
    body.display();
  }
  for (const star of state.animatedStars) {
    if (!state.prefersReducedMotion) star.update();
    star.display();
  }

  updateTitlePosition();

  p.noStroke();
  for (const e of state.estrelinhasAzuis) { if (!state.prefersReducedMotion) e.update(); e.display(); }
  for (const e of state.estrelinhasVermelhas) { if (!state.prefersReducedMotion) e.update(); e.display(); }
  for (const e of state.estrelinhasVerdes) { if (!state.prefersReducedMotion) e.update(); e.display(); }

  updateInput();

  if (state.isGameOver) {
    drawGameOver();
    if (p.millis() - state.gameOverStartTime > state.gameOverDuration) {
      state.isGameOver = false;
      state.isGameStarted = false;
      resetGame();
    }
  } else if (state.isGameWon) {
    drawGameWon();
    if (p.millis() - state.gameOverStartTime > state.gameOverDuration) {
      state.isGameWon = false;
      state.isGameStarted = false;
      resetGame();
    }
  } else if (state.isGameStarted) {
    drawGame();
    drawLives(state.gameX, state.gameY, state.gameHeight);

    p.image(assets.frameImage,
      state.gameX - state.frameStrokeX, state.gameY - state.frameStrokeY,
      state.gameWidth + 2 * state.frameStrokeX, state.gameHeight + 2 * state.frameStrokeY);

    if (shouldDeactivatePowerUp()) {
      deactivateActivePowerUp();
    }
  } else {
    drawReadyScreen();
  }

  drawCreditsAndHighestScore();
  drawMuteButton();

  if (!state.isTouchDevice) {
    if (state.isGameStarted && !state.cursorHidden) {
      p.noCursor();
      state.cursorHidden = true;
    } else if (!state.isGameStarted && state.cursorHidden) {
      p.cursor(ARROW_CURSOR);
      state.cursorHidden = false;
    }
  }

  drawDevOverlay();
}

export function windowResized() {
  p.resizeCanvas(p.windowWidth, p.windowHeight);
  p.noSmooth();
  computeGameArea();
  state.paddleObj.setup();
  state.titleYBase = p.height * 0.12;
  state.titleY = state.titleYBase;
  if (!state.isGameStarted && !state.isGameOver && !state.isGameWon) {
    state.bricks = [];
    setupBricks();
    resetBall();
  }
}
