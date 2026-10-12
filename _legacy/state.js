// Centralized, mutable game state.
// Every module imports this single object.

import { GAME_OVER_DURATION, INITIAL_SPEED, LAUNCH_DELAY, MAGNET_PULL_SPEED,
         POWER_UP_DURATION, DROP_CHECK_INTERVAL, MAX_POWER_UPS_TO_DROP,
         SHOOT_INTERVAL } from './constants.js';

export const state = {
  // Game flow
  isGameStarted: false,
  isGameOver: false,
  isGameWon: false,
  newHighScore: false,
  gameOverStartTime: 0,
  gameOverDuration: GAME_OVER_DURATION,
  currentScore: 0,
  highestScore: 0,

  // Layout (set by computeGameArea)
  gameX: 0,
  gameY: 0,
  gameWidth: 0,
  gameHeight: 0,
  scaleFactor: 1,
  screenScale: 1,
  frameStrokeX: 6,
  frameStrokeY: 2,

  // Title animation
  titleY: 0,
  titleYBase: 0,
  movingUp: true,

  // Arrow (magnet power-up aiming)
  arrowAngle: -Math.PI / 4,
  arrowRotationSpeed: 0.02,

  // Entities
  paddleObj: null,
  balls: [],
  bricks: [],
  bullets: [],
  powerUps: [],

  // Lives
  vidas: 3,

  // Ball config
  initialSpeed: INITIAL_SPEED,
  awaitingLaunch: false,
  launchStartTime: 0,
  launchDelay: LAUNCH_DELAY,
  magnetPullSpeed: MAGNET_PULL_SPEED,

  // Brick tracking
  remainingBricks: 0,
  destroyedBricks: {},

  // Power-up state
  activePowerUpType: '',
  powerUpStartTime: 0,
  powerUpDuration: POWER_UP_DURATION,
  bulletsActive: false,
  magnetPowerUpActive: false,
  dropCheckInterval: DROP_CHECK_INTERVAL,
  maxPowerUpsToDrop: MAX_POWER_UPS_TO_DROP,

  // Bullet state
  isShooting: false,
  lastShootTime: 0,
  shootInterval: SHOOT_INTERVAL,

  // Input
  inputMode: 'keyboard',
  keysPressed: {},
  isTouchDevice: false,
  cursorHidden: false,

  // Audio
  soundMuted: false,
  muteButtonX: 0,
  muteButtonY: 0,
  muteButtonSize: 0,

  // Background
  estrelinhasAzuis: [],
  estrelinhasVermelhas: [],
  estrelinhasVerdes: [],
  celestialBodies: [],
  animatedStars: [],
  prefersReducedMotion: false,

  // Power-up UI
  powerUpIcons: {},
  powerUpMessages: {},
  typewriter: null,
};

// Loaded assets — set once during preload(), never mutated after.
export const assets = {
  arcadeFont: null,
  creditsFont: null,
  frameImage: null,
  titleImage: null,
  arrowImage: null,
  vidaImagem: null,
  mutedImage: null,
  unmutedImage: null,

  ballImagesNormal: [],
  ballImagesSmall: [],

  paddleImageNormal: null,
  paddleImageBig: null,
  paddleImageSmall: null,

  brickImages: {},
  brokenBrickImages: {},
  glossAnimationFrames: [],

  powerUpImages: {},

  bulletImage1: null,
  bulletImage2: null,

  celestialBodyImages: [],
  starSprites: {},
};
