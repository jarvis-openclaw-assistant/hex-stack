/**
 * @module main
 * Entry point for Hex Stack game
 */

import { getState, setState, subscribe, Screen } from './state.js';
import { loadProgress, saveProgress } from './storage.js';
import { initUI, updateHUD, onResize } from './ui.js';
import { update as gameUpdate, draw as gameDraw, isActive } from './game.js';

let lastTime = 0;

/**
 * Main game loop running at 60fps via requestAnimationFrame
 * @param {number} timestamp
 */
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap dt
  lastTime = timestamp;
  
  const state = getState();
  
  if (state.screen === Screen.PLAYING) {
    gameUpdate(dt);
    gameDraw();
    updateHUD();
  } else if (state.screen === Screen.PAUSED) {
    gameDraw(); // still draw, just don't update
  }
  
  requestAnimationFrame(gameLoop);
}

/**
 * Initialize the application
 */
function init() {
  // Load saved progress
  const saved = loadProgress();
  setState(saved);
  
  // Init UI
  initUI();
  
  // Handle resize
  window.addEventListener('resize', onResize);
  
  // Start game loop
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
