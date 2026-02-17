/**
 * @module ui
 * UI screens, HUD, transitions
 */

import { getState, setState, Screen } from './state.js';
import { LEVELS, getLevel } from './levels.js';
import { initGame, togglePause, handleClick, handleHover, resize as gameResize } from './game.js';
import * as audio from './audio.js';
import { saveProgress, clearAll, loadProgress } from './storage.js';
import * as particles from './particles.js';

let canvas = null;
let audioInitialized = false;

/**
 * Initialize UI
 */
export function initUI() {
  canvas = document.getElementById('gameCanvas');
  
  // Set up all button handlers
  bindButtons();
  
  // Show menu
  showScreen('menu');
}

/**
 * Ensure audio context is ready (needs user gesture)
 */
function ensureAudio() {
  if (!audioInitialized) {
    audio.initAudio();
    audioInitialized = true;
    const state = getState();
    audio.setMuted(!state.soundOn);
  }
}

/**
 * Bind all UI button handlers
 */
function bindButtons() {
  // Menu
  document.getElementById('btnPlay').addEventListener('click', () => {
    ensureAudio();
    audio.sfxClick();
    startLevel(getState().highestLevel > 1 ? getState().highestLevel : 1);
  });
  
  document.getElementById('btnLevelSelect').addEventListener('click', () => {
    ensureAudio();
    audio.sfxClick();
    showLevelSelect();
  });
  
  document.getElementById('btnHowToPlay').addEventListener('click', () => {
    ensureAudio();
    audio.sfxClick();
    showScreen('howToPlay');
    setState({ screen: Screen.MENU }); // no dedicated state needed
  });
  
  document.getElementById('btnHowToPlayBack').addEventListener('click', () => {
    audio.sfxClick();
    showScreen('menu');
    setState({ screen: Screen.MENU });
  });
  
  document.getElementById('btnSettings').addEventListener('click', () => {
    ensureAudio();
    audio.sfxClick();
    showScreen('settings');
    setState({ screen: Screen.SETTINGS });
  });
  
  document.getElementById('btnHighScore').addEventListener('click', () => {
    ensureAudio();
    audio.sfxClick();
    showHighScore();
  });
  
  // Level Select back
  document.getElementById('btnLevelBack').addEventListener('click', () => {
    audio.sfxClick();
    showScreen('menu');
    setState({ screen: Screen.MENU });
  });
  
  // Settings
  document.getElementById('btnSoundToggle').addEventListener('click', () => {
    ensureAudio();
    toggleSound();
  });
  
  document.getElementById('btnResetProgress').addEventListener('click', () => {
    audio.sfxClick();
    if (confirm('Reset all progress? This cannot be undone!')) {
      clearAll();
      const fresh = loadProgress();
      setState(fresh);
      alert('Progress reset!');
    }
  });
  
  document.getElementById('btnSettingsBack').addEventListener('click', () => {
    audio.sfxClick();
    showScreen('menu');
    setState({ screen: Screen.MENU });
  });
  
  // High Score back
  document.getElementById('btnScoreBack').addEventListener('click', () => {
    audio.sfxClick();
    showScreen('menu');
    setState({ screen: Screen.MENU });
  });
  
  // In-game
  document.getElementById('btnPause').addEventListener('click', () => {
    audio.sfxClick();
    togglePause();
    updateHUD();
  });
  
  document.getElementById('btnSoundHUD').addEventListener('click', () => {
    ensureAudio();
    toggleSound();
  });
  
  // Pause overlay
  document.getElementById('btnResume').addEventListener('click', () => {
    audio.sfxClick();
    togglePause();
    updateHUD();
  });
  
  document.getElementById('btnPauseMenu').addEventListener('click', () => {
    audio.sfxClick();
    audio.stopMusic();
    showScreen('menu');
    setState({ screen: Screen.MENU });
  });
  
  // Level Complete
  document.getElementById('btnNextLevel').addEventListener('click', () => {
    audio.sfxClick();
    const state = getState();
    const nextId = state.level + 1;
    if (nextId <= LEVELS.length) {
      startLevel(nextId);
    } else {
      showScreen('menu');
      setState({ screen: Screen.MENU });
    }
  });
  
  document.getElementById('btnLevelCompleteMenu').addEventListener('click', () => {
    audio.sfxClick();
    showScreen('menu');
    setState({ screen: Screen.MENU });
  });
  
  // Game Over
  document.getElementById('btnPlayAgain').addEventListener('click', () => {
    audio.sfxClick();
    startLevel(getState().level);
  });
  
  document.getElementById('btnGameOverMenu').addEventListener('click', () => {
    audio.sfxClick();
    showScreen('menu');
    setState({ screen: Screen.MENU });
  });
  
  // Canvas interaction — use pointer events for unified mouse+touch handling
  let usedTouch = false;
  
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    usedTouch = true;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    handleClick(
      (touch.clientX - rect.left) * scaleX,
      (touch.clientY - rect.top) * scaleY
    );
  }, { passive: false });
  
  canvas.addEventListener('click', (e) => {
    if (usedTouch) return; // prevent double-fire on touch devices
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    handleClick(
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    );
  });
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    handleHover(
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    );
  });
  
  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      const state = getState();
      if (state.screen === Screen.PLAYING || state.screen === Screen.PAUSED) {
        togglePause();
        updateHUD();
      }
    }
  });
}

/**
 * Toggle sound on/off
 */
function toggleSound() {
  const state = getState();
  const newSound = !state.soundOn;
  setState({ soundOn: newSound });
  audio.setMuted(!newSound);
  saveProgress(getState());
  updateSoundButtons();
  audio.sfxClick();
}

/**
 * Update sound button labels
 */
function updateSoundButtons() {
  const on = getState().soundOn;
  const icon = on ? '🔊' : '🔇';
  const btnHUD = document.getElementById('btnSoundHUD');
  const btnSettings = document.getElementById('btnSoundToggle');
  if (btnHUD) btnHUD.textContent = icon;
  if (btnSettings) btnSettings.textContent = `Sound: ${on ? 'ON' : 'OFF'} ${icon}`;
}

/**
 * Start a level
 * @param {number} levelId
 */
function startLevel(levelId) {
  ensureAudio();
  particles.clear();
  resizeCanvas();
  initGame(canvas, levelId);
  showScreen('game');
  audio.startMusic();
  updateHUD();
}

/**
 * Show a specific screen, hide others
 * @param {string} screenId
 */
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));
  
  const target = document.getElementById(`screen-${screenId}`);
  if (target) target.classList.add('active');
  
  // Show/hide canvas
  canvas.style.display = (screenId === 'game') ? 'block' : 'none';
  
  // Show/hide HUD
  document.getElementById('hud').style.display = (screenId === 'game') ? 'flex' : 'none';
  
  // Hide all overlays
  document.getElementById('pauseOverlay').style.display = 'none';
  document.getElementById('levelCompleteOverlay').style.display = 'none';
  document.getElementById('gameOverOverlay').style.display = 'none';
}

/**
 * Show level select screen
 */
function showLevelSelect() {
  const state = getState();
  const container = document.getElementById('levelGrid');
  container.innerHTML = '';
  
  for (const level of LEVELS) {
    const btn = document.createElement('button');
    const unlocked = state.unlockedLevels.includes(level.id);
    btn.className = `level-btn ${unlocked ? 'unlocked' : 'locked'}`;
    
    const score = state.levelScores[level.id] || 0;
    
    if (unlocked) {
      btn.innerHTML = `<span class="level-num">${level.id}</span><span class="level-name">${level.name}</span>${score > 0 ? `<span class="level-score">${score}</span>` : ''}`;
      btn.style.borderColor = level.accent;
      btn.addEventListener('click', () => {
        audio.sfxClick();
        startLevel(level.id);
      });
    } else {
      btn.innerHTML = `<span class="level-num">🔒</span><span class="level-name">${level.name}</span>`;
    }
    
    container.appendChild(btn);
  }
  
  showScreen('levelSelect');
  setState({ screen: Screen.LEVEL_SELECT });
}

/**
 * Show high score screen
 */
function showHighScore() {
  const state = getState();
  document.getElementById('displayHighScore').textContent = state.highScore;
  document.getElementById('displayHighestLevel').textContent = state.highestLevel;
  showScreen('highScore');
  setState({ screen: Screen.HIGH_SCORE });
}

/**
 * Update in-game HUD
 */
export function updateHUD() {
  const state = getState();
  document.getElementById('hudScore').textContent = state.score;
  document.getElementById('hudLevel').textContent = `Level ${state.level}`;
  
  const target = document.getElementById('hudTarget');
  if (target) target.textContent = `Target: ${state.targetScore}`;
  
  // Pause overlay
  const pauseOverlay = document.getElementById('pauseOverlay');
  if (state.screen === Screen.PAUSED) {
    pauseOverlay.style.display = 'flex';
  } else {
    pauseOverlay.style.display = 'none';
  }
  
  // Level complete
  if (state.screen === Screen.LEVEL_COMPLETE) {
    document.getElementById('lcScore').textContent = state.score;
    document.getElementById('lcLevel').textContent = state.level;
    showScreen('game');
    document.getElementById('levelCompleteOverlay').style.display = 'flex';
    canvas.style.display = 'block';
  }
  
  // Game over
  if (state.screen === Screen.GAME_OVER) {
    document.getElementById('goScore').textContent = state.score;
    document.getElementById('goHighScore').textContent = state.highScore;
    document.getElementById('goLevel').textContent = state.level;
    showScreen('game');
    document.getElementById('gameOverOverlay').style.display = 'flex';
    canvas.style.display = 'block';
  }
  
  updateSoundButtons();
}

/**
 * Resize canvas to fill game area
 */
export function resizeCanvas() {
  if (!canvas) return;
  const container = document.getElementById('gameContainer');
  const hud = document.getElementById('hud');
  const w = container.clientWidth;
  const h = container.clientHeight - (hud ? hud.offsetHeight : 50);
  canvas.width = w * window.devicePixelRatio;
  canvas.height = Math.max(h, 300) * window.devicePixelRatio;
  canvas.style.width = w + 'px';
  canvas.style.height = Math.max(h, 300) + 'px';
  gameResize();
}

/**
 * Window resize handler
 */
export function onResize() {
  if (getState().screen === Screen.PLAYING || getState().screen === Screen.PAUSED) {
    resizeCanvas();
  }
}
