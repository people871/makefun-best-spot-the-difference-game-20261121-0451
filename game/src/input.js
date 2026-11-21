// Pointer + keyboard input: maps canvas clicks to panel coordinates,
// hit-tests them against the scene's differences, and routes keys.
import { screenToPanel } from './render.js';
import { BUTTONS } from './hud.js';

export class Input {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.hover = null;
    canvas.addEventListener('pointermove', (e) => {
      const p = this.toCanvas(e);
      this.hover = p;
      this.game.onHover(p);
    });
    canvas.addEventListener('pointerdown', (e) => {
      const p = this.toCanvas(e);
      this.game.onPointer(p.x, p.y);
    });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.game.onKey(e.key);
    });
  }

  // Canvas is stretched to the window; scale the event back to game space.
  toCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height),
    };
  }
}

// Find the unfound difference nearest to a panel-local click, within its
// radius. Returns the difference or null.
export function hitDifference(scene, found, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const d of scene.differences) {
    if (found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= d.r && dist < bestD) {
      best = d;
      bestD = dist;
    }
  }
  return best;
}

// Which footer button (if any) sits under a canvas point.
export function hitButton(x, y) {
  for (const [key, b] of Object.entries(BUTTONS)) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return key;
  }
  return null;
}

// Which title-screen scene card (if any) sits under a canvas point.
export function hitTitleCard(x, y) {
  if (y >= 320 && y <= 470) {
    for (let i = 0; i < 3; i += 1) {
      const x0 = 190 + i * 300;
      if (x >= x0 && x <= x0 + 260) return i;
    }
  }
  return -1;
}

export { screenToPanel };
