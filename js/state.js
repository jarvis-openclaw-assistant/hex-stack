/**
 * @module state
 * Centralized state management for Hex Stack
 */

/** @enum {string} */
export const Screen = {
  MENU: 'menu',
  LEVEL_SELECT: 'level_select',
  SETTINGS: 'settings',
  HIGH_SCORE: 'high_score',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over'
};

/**
 * @typedef {Object} GameState
 * @property {string} screen
 * @property {number} score
 * @property {number} level
 * @property {number} highScore
 * @property {number} highestLevel
 * @property {boolean} soundOn
 * @property {number[]} unlockedLevels
 * @property {Array<Array<{color:number}>>} grid
 * @property {number} targetScore
 * @property {number} combo
 * @property {number} fillTimer
 * @property {number} fillInterval
 */

/** @type {GameState} */
const state = {
  screen: Screen.MENU,
  score: 0,
  level: 1,
  highScore: 0,
  highestLevel: 1,
  soundOn: true,
  unlockedLevels: [1],
  grid: [],
  targetScore: 0,
  combo: 0,
  fillTimer: 0,
  fillInterval: 0,
  lastTime: 0,
  particles: [],
  animating: false,
  selectedGroup: [],
  levelScores: {}
};

/** @type {Function[]} */
const listeners = [];

/**
 * Get current state (read-only copy)
 * @returns {GameState}
 */
export function getState() {
  return state;
}

/**
 * Update state and notify listeners
 * @param {Partial<GameState>} updates
 */
export function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach(fn => fn(state));
}

/**
 * Subscribe to state changes
 * @param {Function} fn
 */
export function subscribe(fn) {
  listeners.push(fn);
}
