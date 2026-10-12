import { state, assets } from './state.js';

let audioCtx = null;
let audioBuffers = {};
let bgMusicSource = null;
let bgMusicGain = null;

export function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    loadAllSounds();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

async function loadAllSounds() {
  const files = {
    backgroundMusic: 'assets/Sound FX/5 - Stellar Drift (Loop)_louder.mp3',
    collision: 'assets/Sound FX/Retro3.mp3',
    coin: 'assets/Sound FX/Coin.wav',
    hit: 'assets/Sound FX/Hit.wav',
  };
  await Promise.all(
    Object.entries(files).map(async ([name, url]) => {
      try {
        const resp = await fetch(url);
        const arr = await resp.arrayBuffer();
        audioBuffers[name] = await audioCtx.decodeAudioData(arr);
      } catch (e) {
        console.warn('Failed to load sound:', name, e);
      }
    }),
  );
  if (!state.soundMuted) startBackgroundMusic();
}

function playBuffer(name, volume) {
  if (state.soundMuted || !audioCtx || !audioBuffers[name]) return;
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffers[name];
  const gain = audioCtx.createGain();
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
}

export function startBackgroundMusic() {
  stopBackgroundMusic();
  if (state.soundMuted || !audioCtx || !audioBuffers.backgroundMusic) return;
  bgMusicSource = audioCtx.createBufferSource();
  bgMusicSource.buffer = audioBuffers.backgroundMusic;
  bgMusicSource.loop = true;
  bgMusicGain = audioCtx.createGain();
  bgMusicGain.gain.value = 0.5;
  bgMusicSource.connect(bgMusicGain);
  bgMusicGain.connect(audioCtx.destination);
  bgMusicSource.start(0);
}

export function stopBackgroundMusic() {
  if (bgMusicSource) {
    try { bgMusicSource.stop(); } catch (_) { /* already stopped */ }
    bgMusicSource = null;
    bgMusicGain = null;
  }
}

export function toggleMute() {
  state.soundMuted = !state.soundMuted;
  if (state.soundMuted) {
    stopBackgroundMusic();
  } else if (audioCtx) {
    startBackgroundMusic();
  }
}

export function suspendAudio() {
  if (audioCtx && audioCtx.state === 'running') {
    audioCtx.suspend();
  }
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended' && !state.soundMuted) {
    audioCtx.resume();
  }
}

export function playHitSound() { playBuffer('hit', 0.5); }
export function playCollisionSound() { playBuffer('collision', 1.0); }
export function playCoinSound() { playBuffer('coin', 0.3); }
