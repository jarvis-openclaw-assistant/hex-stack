/**
 * @module game
 * Core game logic: hex grid, matching, filling
 */

import { getState, setState, Screen } from './state.js';
import { getLevel, TILE_COLORS } from './levels.js';
import * as particles from './particles.js';
import * as audio from './audio.js';
import { saveProgress } from './storage.js';

/** Hex tile size (will be computed dynamically) */
let hexSize = 28;
let gridOffsetX = 0;
let gridOffsetY = 0;
let canvas = null;
let ctxCanvas = null;

/** @type {Array<Array<{color:number, falling:number, scale:number}|null>>} */
let grid = [];
let cols = 7;
let rows = 9;
let numColors = 3;
let hoverGroup = [];
let fillTimer = 0;

/**
 * Initialize game for a level
 * @param {HTMLCanvasElement} c
 * @param {number} levelId
 */
export function initGame(c, levelId) {
  canvas = c;
  ctxCanvas = canvas.getContext('2d');
  const level = getLevel(levelId);
  cols = level.cols;
  rows = level.rows;
  numColors = level.colors;
  fillTimer = 0;
  hoverGroup = [];
  
  // Create empty grid
  grid = [];
  for (let col = 0; col < cols; col++) {
    grid[col] = [];
    for (let row = 0; row < rows; row++) {
      grid[col][row] = null;
    }
  }
  
  // Fill initial rows from bottom
  for (let col = 0; col < cols; col++) {
    for (let row = rows - level.initialRows; row < rows; row++) {
      grid[col][row] = { color: Math.floor(Math.random() * numColors), falling: 0, scale: 1 };
    }
  }
  
  computeLayout();
  
  setState({
    screen: Screen.PLAYING,
    score: 0,
    level: levelId,
    combo: 0,
    targetScore: level.targetScore,
    fillInterval: level.fillInterval,
    animating: false
  });
}

/**
 * Compute hex layout based on canvas size
 */
function computeLayout() {
  if (!canvas) return;
  const w = canvas.width;
  const h = canvas.height;
  
  // Calculate hex size to fit grid in canvas
  const maxHexW = w / (cols * 1.55 + 0.5);
  const maxHexH = h / (rows * 1.75 + 1);
  hexSize = Math.min(maxHexW, maxHexH, 32);
  
  const gridW = cols * hexSize * 1.55;
  const gridH = rows * hexSize * 1.75;
  gridOffsetX = (w - gridW) / 2 + hexSize;
  gridOffsetY = (h - gridH) / 2 + hexSize;
}

/**
 * Get pixel position of a hex cell
 * @param {number} col
 * @param {number} row
 * @returns {{x:number, y:number}}
 */
function hexToPixel(col, row) {
  const x = gridOffsetX + col * hexSize * 1.55;
  const y = gridOffsetY + row * hexSize * 1.75 + (col % 2 === 1 ? hexSize * 0.875 : 0);
  return { x, y };
}

/**
 * Get grid cell from pixel position
 * @param {number} px
 * @param {number} py
 * @returns {{col:number, row:number}|null}
 */
function pixelToHex(px, py) {
  let bestDist = Infinity;
  let bestCol = -1, bestRow = -1;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const { x, y } = hexToPixel(col, row);
      const dx = px - x;
      const dy = py - y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist && dist < hexSize * hexSize * 1.5) {
        bestDist = dist;
        bestCol = col;
        bestRow = row;
      }
    }
  }
  if (bestCol >= 0) return { col: bestCol, row: bestRow };
  return null;
}

/**
 * Get hex neighbors
 * @param {number} col
 * @param {number} row
 * @returns {Array<{col:number, row:number}>}
 */
function getNeighbors(col, row) {
  const even = col % 2 === 0;
  const dirs = even
    ? [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[0,1]]
    : [[-1,0],[0,-1],[1,0],[-1,1],[1,1],[0,1]];
  return dirs
    .map(([dc, dr]) => ({ col: col + dc, row: row + dr }))
    .filter(({ col: c, row: r }) => c >= 0 && c < cols && r >= 0 && r < rows);
}

/**
 * Find connected group of same color using flood fill
 * @param {number} col
 * @param {number} row
 * @returns {Array<{col:number, row:number}>}
 */
function findGroup(col, row) {
  const tile = grid[col][row];
  if (!tile) return [];
  const color = tile.color;
  const visited = new Set();
  const group = [];
  const stack = [{ col, row }];
  while (stack.length > 0) {
    const { col: c, row: r } = stack.pop();
    const key = `${c},${r}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const t = grid[c][r];
    if (!t || t.color !== color) continue;
    group.push({ col: c, row: r });
    for (const n of getNeighbors(c, r)) {
      stack.push(n);
    }
  }
  return group;
}

/**
 * Handle click/tap on canvas
 * @param {number} px
 * @param {number} py
 */
export function handleClick(px, py) {
  const state = getState();
  if (state.screen !== Screen.PLAYING || state.animating) return;
  
  const cell = pixelToHex(px, py);
  if (!cell) return;
  
  const group = findGroup(cell.col, cell.row);
  if (group.length < 3) return;
  
  // Clear the group
  audio.sfxMatch();
  
  const tile = grid[group[0].col][group[0].row];
  const tileColor = TILE_COLORS[tile.color];
  
  // Spawn particles at each cleared tile
  for (const { col, row } of group) {
    const { x, y } = hexToPixel(col, row);
    particles.spawn(x, y, tileColor, 6);
    grid[col][row] = null;
  }
  
  // Score: base points * group size * combo multiplier
  const basePoints = group.length * 10;
  const combo = state.combo + 1;
  const comboMultiplier = Math.min(combo, 5);
  const points = basePoints * comboMultiplier;
  
  if (combo >= 3) {
    audio.sfxCombo();
    const center = hexToPixel(group[0].col, group[0].row);
    particles.comboBurst(center.x, center.y, TILE_COLORS.slice(0, numColors));
  }
  
  const newScore = state.score + points;
  const newHighScore = Math.max(newScore, state.highScore);
  
  setState({
    score: newScore,
    highScore: newHighScore,
    combo,
    animating: true
  });
  
  // Drop tiles down after short delay
  setTimeout(() => {
    applyGravity();
    setState({ animating: false });
    
    // Check level complete
    if (newScore >= state.targetScore) {
      levelComplete();
    }
  }, 150);
}

/**
 * Apply gravity - tiles fall down to fill gaps
 */
function applyGravity() {
  for (let col = 0; col < cols; col++) {
    // Compact column downward
    let writeRow = rows - 1;
    for (let row = rows - 1; row >= 0; row--) {
      if (grid[col][row] !== null) {
        if (writeRow !== row) {
          grid[col][writeRow] = grid[col][row];
          grid[col][row] = null;
        }
        writeRow--;
      }
    }
  }
}

/**
 * Add a new row of tiles at the top, pushing everything down
 */
function addRow() {
  const state = getState();
  if (state.screen !== Screen.PLAYING) return;
  
  // Check if top row has any tiles (game over condition)
  for (let col = 0; col < cols; col++) {
    if (grid[col][0] !== null) {
      gameOver();
      return;
    }
  }
  
  // Shift everything down by one
  for (let col = 0; col < cols; col++) {
    for (let row = rows - 1; row > 0; row--) {
      grid[col][row] = grid[col][row - 1];
    }
    // New tile at top
    grid[col][0] = { color: Math.floor(Math.random() * numColors), falling: 0, scale: 1 };
  }
  
  // Check game over after shift
  for (let col = 0; col < cols; col++) {
    if (grid[col][rows - 1] !== null && grid[col][rows - 2] !== null) {
      // Check if board is nearly full
      let filled = 0;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (grid[c][r] !== null) filled++;
        }
      }
      if (filled > cols * rows * 0.9) {
        gameOver();
        return;
      }
    }
  }
  
  setState({ combo: 0 });
}

/**
 * Handle level completion
 */
function levelComplete() {
  const state = getState();
  audio.sfxLevelComplete();
  audio.stopMusic();
  
  const nextLevel = state.level + 1;
  const unlocked = [...state.unlockedLevels];
  if (!unlocked.includes(nextLevel) && nextLevel <= 12) {
    unlocked.push(nextLevel);
  }
  
  const levelScores = { ...state.levelScores };
  levelScores[state.level] = Math.max(levelScores[state.level] || 0, state.score);
  
  setState({
    screen: Screen.LEVEL_COMPLETE,
    unlockedLevels: unlocked,
    highestLevel: Math.max(state.highestLevel, nextLevel),
    levelScores
  });
  
  saveProgress(getState());
}

/**
 * Handle game over
 */
function gameOver() {
  const state = getState();
  audio.sfxGameOver();
  audio.stopMusic();
  
  const levelScores = { ...state.levelScores };
  levelScores[state.level] = Math.max(levelScores[state.level] || 0, state.score);
  
  setState({
    screen: Screen.GAME_OVER,
    highScore: Math.max(state.score, state.highScore),
    levelScores
  });
  
  saveProgress(getState());
}

/**
 * Handle hover for group highlighting
 * @param {number} px
 * @param {number} py
 */
export function handleHover(px, py) {
  const state = getState();
  if (state.screen !== Screen.PLAYING || state.animating) {
    hoverGroup = [];
    return;
  }
  const cell = pixelToHex(px, py);
  if (!cell) { hoverGroup = []; return; }
  const group = findGroup(cell.col, cell.row);
  hoverGroup = group.length >= 3 ? group : [];
}

/**
 * Update game state
 * @param {number} dt - delta time in seconds
 */
export function update(dt) {
  const state = getState();
  if (state.screen !== Screen.PLAYING) return;
  
  // Fill timer
  fillTimer += dt * 1000;
  if (fillTimer >= state.fillInterval) {
    fillTimer = 0;
    addRow();
  }
  
  particles.update(dt);
}

/**
 * Draw the game
 */
export function draw() {
  if (!ctxCanvas || !canvas) return;
  const ctx = ctxCanvas;
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.clearRect(0, 0, w, h);
  
  // Draw grid background
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const { x, y } = hexToPixel(col, row);
      drawHex(ctx, x, y, hexSize * 0.85, null, true);
    }
  }
  
  // Draw tiles
  const hoverSet = new Set(hoverGroup.map(h => `${h.col},${h.row}`));
  
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const tile = grid[col][row];
      if (!tile) continue;
      const { x, y } = hexToPixel(col, row);
      const isHover = hoverSet.has(`${col},${row}`);
      const size = hexSize * 0.8 * (isHover ? 0.9 : 1);
      const color = TILE_COLORS[tile.color];
      
      drawHex(ctx, x, y, size, color, false, isHover);
    }
  }
  
  // Draw fill timer bar at top
  const state = getState();
  if (state.screen === Screen.PLAYING && state.fillInterval > 0) {
    const barW = w * 0.8;
    const barH = 4;
    const barX = (w - barW) / 2;
    const barY = 6;
    const progress = fillTimer / state.fillInterval;
    
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    
    const barColor = progress > 0.8 ? '#ff6b6b' : progress > 0.5 ? '#f9ca24' : '#4ecdc4';
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * progress, barH);
  }
  
  // Draw particles
  particles.draw(ctx);
}

/**
 * Draw a hexagon
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {number} size
 * @param {string|null} color
 * @param {boolean} outline - if true, draw outline only
 * @param {boolean} glow
 */
function drawHex(ctx, x, y, size, color, outline = false, glow = false) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  
  if (outline) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (color) {
    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
    }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Inner highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/**
 * Resize handler
 */
export function resize() {
  computeLayout();
}

/**
 * Toggle pause
 */
export function togglePause() {
  const state = getState();
  if (state.screen === Screen.PLAYING) {
    setState({ screen: Screen.PAUSED });
    audio.stopMusic();
  } else if (state.screen === Screen.PAUSED) {
    setState({ screen: Screen.PLAYING });
    audio.startMusic();
  }
}

/**
 * Check if game is active
 * @returns {boolean}
 */
export function isActive() {
  const s = getState().screen;
  return s === Screen.PLAYING || s === Screen.PAUSED;
}
