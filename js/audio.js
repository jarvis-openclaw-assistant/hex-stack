/**
 * @module audio
 * Web Audio API procedural music and sound effects
 */

let ctx = null;
let musicGain = null;
let sfxGain = null;
let musicOsc = null;
let musicPlaying = false;
let muted = false;

/**
 * Initialize audio context (must be called from user gesture)
 */
export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.15;
  musicGain.connect(ctx.destination);
  sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.3;
  sfxGain.connect(ctx.destination);
}

/**
 * Set mute state
 * @param {boolean} m
 */
export function setMuted(m) {
  muted = m;
  if (musicGain) musicGain.gain.value = m ? 0 : 0.15;
  if (sfxGain) sfxGain.gain.value = m ? 0 : 0.3;
}

/**
 * Play a short tone
 * @param {number} freq
 * @param {number} duration
 * @param {string} type
 * @param {number} vol
 */
function playTone(freq, duration = 0.15, type = 'square', vol = 0.3) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Sound: tile match */
export function sfxMatch() {
  playTone(523, 0.1, 'square', 0.2);
  setTimeout(() => playTone(659, 0.1, 'square', 0.2), 50);
  setTimeout(() => playTone(784, 0.15, 'square', 0.2), 100);
}

/** Sound: combo bonus */
export function sfxCombo() {
  playTone(784, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(988, 0.1, 'sine', 0.25), 80);
  setTimeout(() => playTone(1175, 0.2, 'sine', 0.25), 160);
  setTimeout(() => playTone(1318, 0.25, 'sine', 0.2), 240);
}

/** Sound: level complete */
export function sfxLevelComplete() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, 'sine', 0.25), i * 150);
  });
}

/** Sound: game over */
export function sfxGameOver() {
  playTone(440, 0.3, 'sawtooth', 0.15);
  setTimeout(() => playTone(349, 0.3, 'sawtooth', 0.15), 200);
  setTimeout(() => playTone(294, 0.5, 'sawtooth', 0.15), 400);
}

/** Sound: UI click */
export function sfxClick() {
  playTone(880, 0.05, 'sine', 0.15);
}

/**
 * Start procedural background music loop
 */
export function startMusic() {
  if (!ctx || musicPlaying) return;
  musicPlaying = true;
  
  const bassNotes = [130.81, 146.83, 164.81, 174.61, 196, 220, 246.94];
  let noteIndex = 0;
  let bassOsc = null;
  let bassGain = null;
  
  function playBassNote() {
    if (!musicPlaying) return;
    if (bassOsc) { try { bassOsc.stop(); } catch(e){} }
    
    bassOsc = ctx.createOscillator();
    bassGain = ctx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.value = bassNotes[noteIndex % bassNotes.length];
    bassGain.gain.value = 0.4;
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    bassOsc.connect(bassGain);
    bassGain.connect(musicGain);
    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.85);
    
    // Add a soft pad
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = 'sine';
    pad.frequency.value = bassNotes[noteIndex % bassNotes.length] * 2;
    padGain.gain.value = 0.15;
    padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    pad.connect(padGain);
    padGain.connect(musicGain);
    pad.start(ctx.currentTime);
    pad.stop(ctx.currentTime + 0.75);
    
    noteIndex++;
    if (musicPlaying) {
      musicOsc = setTimeout(playBassNote, 800);
    }
  }
  
  playBassNote();
}

/**
 * Stop background music
 */
export function stopMusic() {
  musicPlaying = false;
  if (musicOsc) {
    clearTimeout(musicOsc);
    musicOsc = null;
  }
}
