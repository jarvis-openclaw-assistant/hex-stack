/**
 * @module levels
 * Level definitions with progressive difficulty
 */

/**
 * @typedef {Object} LevelDef
 * @property {number} id
 * @property {string} name
 * @property {number} cols - grid columns
 * @property {number} rows - grid rows
 * @property {number} colors - number of tile colors
 * @property {number} targetScore - score needed to clear level
 * @property {number} fillInterval - ms between new row fills
 * @property {number} initialRows - rows filled at start
 * @property {string} accent - CSS accent color
 */

/** @type {LevelDef[]} */
export const LEVELS = [
  {
    id: 1, name: 'First Steps',
    cols: 7, rows: 9, colors: 3, targetScore: 300,
    fillInterval: 12000, initialRows: 4, accent: '#4ecdc4'
  },
  {
    id: 2, name: 'Getting Warm',
    cols: 7, rows: 9, colors: 3, targetScore: 500,
    fillInterval: 11000, initialRows: 4, accent: '#45b7d1'
  },
  {
    id: 3, name: 'Color Burst',
    cols: 7, rows: 9, colors: 4, targetScore: 700,
    fillInterval: 10000, initialRows: 5, accent: '#f7dc6f'
  },
  {
    id: 4, name: 'Wider World',
    cols: 9, rows: 9, colors: 4, targetScore: 1000,
    fillInterval: 10000, initialRows: 5, accent: '#e74c3c'
  },
  {
    id: 5, name: 'Speed Up',
    cols: 9, rows: 9, colors: 4, targetScore: 1300,
    fillInterval: 8000, initialRows: 5, accent: '#9b59b6'
  },
  {
    id: 6, name: 'Rainbow Rush',
    cols: 9, rows: 11, colors: 5, targetScore: 1800,
    fillInterval: 8000, initialRows: 6, accent: '#e67e22'
  },
  {
    id: 7, name: 'Tall Order',
    cols: 9, rows: 11, colors: 5, targetScore: 2200,
    fillInterval: 7000, initialRows: 6, accent: '#1abc9c'
  },
  {
    id: 8, name: 'Hex Frenzy',
    cols: 11, rows: 11, colors: 5, targetScore: 2800,
    fillInterval: 6500, initialRows: 6, accent: '#e91e63'
  },
  {
    id: 9, name: 'Chromatic',
    cols: 11, rows: 11, colors: 6, targetScore: 3500,
    fillInterval: 6000, initialRows: 7, accent: '#00bcd4'
  },
  {
    id: 10, name: 'Hex Master',
    cols: 11, rows: 13, colors: 6, targetScore: 4500,
    fillInterval: 5000, initialRows: 7, accent: '#ff5722'
  },
  {
    id: 11, name: 'Overdrive',
    cols: 11, rows: 13, colors: 7, targetScore: 5500,
    fillInterval: 4500, initialRows: 8, accent: '#cddc39'
  },
  {
    id: 12, name: 'Infinity',
    cols: 13, rows: 13, colors: 7, targetScore: 7000,
    fillInterval: 4000, initialRows: 8, accent: '#ff9800'
  }
];

/** Tile colors palette */
export const TILE_COLORS = [
  '#ff6b6b', // red
  '#4ecdc4', // teal
  '#45b7d1', // blue
  '#f9ca24', // yellow
  '#a55eea', // purple
  '#ff9ff3', // pink
  '#2ed573', // green
];

/**
 * Get level definition by ID
 * @param {number} id
 * @returns {LevelDef}
 */
export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || LEVELS[0];
}
