/**
 * @module storage
 * localStorage wrapper for game persistence
 */

const PREFIX = 'hexstack_';

/**
 * Save a value to localStorage
 * @param {string} key
 * @param {*} value
 */
export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) { /* quota exceeded or private browsing */ }
}

/**
 * Load a value from localStorage
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function load(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Remove a key from localStorage
 * @param {string} key
 */
export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) { /* ignore */ }
}

/**
 * Clear all game data
 */
export function clearAll() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch (e) { /* ignore */ }
}

/**
 * Load saved state into game state
 */
export function loadProgress() {
  return {
    highScore: load('highScore', 0),
    highestLevel: load('highestLevel', 1),
    unlockedLevels: load('unlockedLevels', [1]),
    soundOn: load('soundOn', true),
    levelScores: load('levelScores', {})
  };
}

/**
 * Save current progress
 */
export function saveProgress(state) {
  save('highScore', state.highScore);
  save('highestLevel', state.highestLevel);
  save('unlockedLevels', state.unlockedLevels);
  save('soundOn', state.soundOn);
  save('levelScores', state.levelScores);
}
