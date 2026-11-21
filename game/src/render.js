// Panel layout and the drawing of found-difference markers, hint pulses,
// miss flashes and the sparkle particles that celebrate a find.
// The two panels sit side by side; every coordinate in scenes.js is
// panel-local (0..560, 0..400) and is mapped here to screen space.
import { clamp } from './rng.js';

export const PANEL_W = 560;
export const PANEL_H = 400;
export const PANEL_Y = 128;
export const LEFT_X = 36;
export const RIGHT_X = 684;
export const GAME_W = 1280;
export const GAME_H = 720;

// Map a screen point to { panel: 'left' | 'right' | null, x, y } in
// panel-local coordinates, or null when the point is outside both panels.
export function screenToPanel(px, py) {
  if (py >= PANEL_Y && py <= PANEL_Y + PANEL_H) {
    if (px >= LEFT_X && px <= LEFT_X + PANEL_W) {
      return { panel: 'left', x: px - LEFT_X, y: py - PANEL_Y };
    }
    if (px >= RIGHT_X && px <= RIGHT_X + PANEL_W) {
      return { panel: 'right', x: px - RIGHT_X, y: py - PANEL_Y };
    }
  }
  return null;
}

export function panelOrigin(panel) {
  return panel === 'left' ? { x: LEFT_X, y: PANEL_Y } : { x: RIGHT_X, y: PANEL_Y };
}

// One found-difference marker: a green ring with a check, drawn on BOTH
// panels at the difference's spot, plus a short-lived sparkle burst.
export class MarkerBurst {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.life = 0.9;
    this.particles = [];
    for (let i = 0; i < 14; i += 1) {
      const a = (i / 14) * Math.PI * 2;
      this.particles.push({
        x: 0, y: 0,
        vx: Math.cos(a) * (30 + (i % 3) * 22),
        vy: Math.sin(a) * (30 + (i % 3) * 22),
        r: 2 + (i % 3),
      });
    }
  }

  update(dt) {
    this.age += dt;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }
  }

  get done() { return this.age >= this.life; }

  draw(ctx, ox, oy) {
    const k = clamp(this.age / this.life, 0, 1);
    ctx.save();
    ctx.globalAlpha = 1 - k;
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(ox + this.x + p.x, oy + this.y + p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd93b';
      ctx.fill();
    }
    ctx.restore();
  }
}

// Draw one panel: the scene, then the rings for found differences, then
// the hint pulse and the miss flash when active.
export function drawPanel(ctx, scene, variant, t, found, hint, missFlash, bursts, origin) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(origin.x, origin.y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(origin.x, origin.y);
  scene.draw(ctx, variant, t);
  ctx.restore();

  // Panel frame and label.
  ctx.strokeStyle = '#2a2a3a';
  ctx.lineWidth = 4;
  ctx.strokeRect(origin.x, origin.y, PANEL_W, PANEL_H);
  ctx.fillStyle = 'rgba(20,20,40,0.75)';
  ctx.fillRect(origin.x, origin.y, 74, 26);
  ctx.fillStyle = '#fff7e6';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(variant === 'left' ? 'LEFT' : 'RIGHT', origin.x + 12, origin.y + 19);

  // Found markers on both panels.
  for (const d of found) {
    drawFoundRing(ctx, origin.x + d.x, origin.y + d.y, d.r);
  }
  // Hint pulse: a golden ring that breathes over the hinted difference.
  if (hint) {
    const pulse = 1 + 0.18 * Math.sin(t * 6);
    const r = hint.r * pulse + 6;
    ctx.save();
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 6);
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.arc(origin.x + hint.x, origin.y + hint.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  // Miss flash: a red X where the player clicked wrongly (that panel only).
  if (missFlash && missFlash.panel === variant && missFlash.age < 0.7) {
    const a = 1 - missFlash.age / 0.7;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e84a5f';
    ctx.lineWidth = 5;
    const mx = origin.x + missFlash.x;
    const my = origin.y + missFlash.y;
    ctx.beginPath();
    ctx.moveTo(mx - 12, my - 12); ctx.lineTo(mx + 12, my + 12);
    ctx.moveTo(mx + 12, my - 12); ctx.lineTo(mx - 12, my + 12);
    ctx.stroke();
    ctx.restore();
  }
  // Sparkle bursts.
  for (const b of bursts) b.draw(ctx, origin.x, origin.y);
}

export function drawFoundRing(ctx, cx, cy, r) {
  ctx.save();
  ctx.strokeStyle = '#2f9e44';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.stroke();
  // Check mark.
  ctx.strokeStyle = '#2f9e44';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.45, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.35);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.35);
  ctx.stroke();
  ctx.restore();
}
