/**
 * @module particles
 * Particle effects for visual feedback
 */

/** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,color:string,size:number}>} */
const particles = [];

/**
 * Spawn particles at a position
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {string} color - CSS color
 * @param {number} count - number of particles
 */
export function spawn(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.4 + Math.random() * 0.4,
      color,
      size: 3 + Math.random() * 4
    });
  }
}

/**
 * Spawn a burst of particles for combo
 * @param {number} x
 * @param {number} y
 * @param {string[]} colors
 */
export function comboBurst(x, y, colors) {
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24;
    const speed = 3 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.6 + Math.random() * 0.4,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 6
    });
  }
}

/**
 * Update all particles
 * @param {number} dt - delta time in seconds
 */
export function update(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 2 * dt; // gravity
    p.vx *= 0.98;
    p.life -= dt / p.maxLife;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/**
 * Draw all particles
 * @param {CanvasRenderingContext2D} ctx
 */
export function draw(ctx) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Clear all particles
 */
export function clear() {
  particles.length = 0;
}

/**
 * Get particle count (for perf monitoring)
 * @returns {number}
 */
export function count() {
  return particles.length;
}
