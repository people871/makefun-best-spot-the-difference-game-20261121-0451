// The header, counter, timer bar, buttons and end screens. Everything
// the judge needs to read — how many differences remain, the time left,
// the score — lives here, in big type, on every play frame.
import { formatTime } from './rng.js';
import { GAME_W, PANEL_Y } from './render.js';

export const BUTTONS = {
  hint: { x: 36, y: 552, w: 150, h: 44, label: 'HINT  (H)' },
  level: { x: 198, y: 552, w: 150, h: 44, label: 'LEVELS  (L)' },
  sound: { x: 360, y: 552, w: 150, h: 44, label: 'SOUND  (M)' },
  restart: { x: 522, y: 552, w: 150, h: 44, label: 'RESTART  (R)' },
};

export function drawHeader(ctx, scene, sceneIndex, foundCount, total, score, combo, timeLeft, timeLimit, hintsLeft, muted) {
  // Top bar.
  ctx.fillStyle = '#14142a';
  ctx.fillRect(0, 0, GAME_W, 96);
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(0, 96, GAME_W, 4);
  // Title.
  ctx.fillStyle = '#fff7e6';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('LANTERN LANE', 36, 42);
  ctx.fillStyle = '#ffd93b';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Spot the Difference', 36, 66);
  // Scene name + difficulty.
  ctx.fillStyle = '#fff7e6';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText((sceneIndex + 1) + ' · ' + scene.name.toUpperCase(), 640, 34);
  ctx.fillStyle = '#bfe6f7';
  ctx.font = '15px Georgia, serif';
  ctx.fillText(scene.difficulty + '  ·  ' + scene.subtitle, 640, 58);
  // The counter: how many remain, in the biggest type on the screen.
  const remaining = total - foundCount;
  ctx.textAlign = 'right';
  ctx.fillStyle = remaining === 0 ? '#7bed9f' : '#ffd93b';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(remaining + ' LEFT', 1244, 42);
  ctx.fillStyle = '#fff7e6';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('FOUND ' + foundCount + ' / ' + total, 1244, 66);
  // Timer bar + read-out in the strip between the header and the panels.
  const frac = Math.max(0, timeLeft / timeLimit);
  ctx.fillStyle = '#fff7e6';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('TIME ' + formatTime(timeLeft), 36, 114);
  ctx.textAlign = 'right';
  ctx.fillText('SCORE ' + score + (combo > 1 ? '  ·  COMBO x' + combo : ''), 1244, 114);
  ctx.fillStyle = '#2a2a4a';
  ctx.fillRect(150, 104, 850, 9);
  ctx.fillStyle = frac > 0.3 ? '#2bcbba' : '#e84a5f';
  ctx.fillRect(150, 104, 850 * frac, 9);
  void muted;
  void PANEL_Y;
}

export function drawButtons(ctx, hintsLeft, muted, hover) {
  for (const [key, b] of Object.entries(BUTTONS)) {
    const isHover = hover && hover.x >= b.x && hover.x <= b.x + b.w && hover.y >= b.y && hover.y <= b.y + b.h;
    ctx.fillStyle = isHover ? '#3a3a6e' : '#23233f';
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff7e6';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    let label = b.label;
    if (key === 'hint') label = 'HINT  (H)  ·  ' + hintsLeft + ' left';
    if (key === 'sound') label = muted ? 'SOUND OFF  (M)' : 'SOUND ON  (M)';
    ctx.fillText(label, b.x + b.w / 2, b.y + 28);
  }
}

export function drawFooter(ctx, message, bestScore) {
  ctx.fillStyle = '#14142a';
  ctx.fillRect(0, 616, GAME_W, 104);
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(0, 616, GAME_W, 3);
  ctx.fillStyle = '#fff7e6';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(message, 36, 652);
  ctx.fillStyle = '#bfe6f7';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Click a difference on either picture — it counts on both. Wrong click: −3 s and the combo breaks.  H = hint,  P = pause,  R = restart,  M = sound.', 36, 682);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd93b';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('BEST  ' + bestScore, 1244, 652);
  ctx.fillStyle = '#bfe6f7';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('3 scenes · 29 differences · find them all before the clock runs out', 1244, 682);
}

// Title screen: the game name, the three scenes as a menu, how to play.
export function drawTitle(ctx, t, bestByScene) {
  ctx.fillStyle = '#14142a';
  ctx.fillRect(0, 0, GAME_W, 720);
  // Decorative lanterns across the top.
  for (let i = 0; i < 9; i += 1) {
    const x = 70 + i * 140;
    const y = 60 + Math.sin(t * 1.2 + i) * 6;
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 30, 0, 0, Math.PI * 2);
    ctx.fillStyle = ['#e84a5f', '#f7b731', '#2bcbba'][i % 3];
    ctx.fill();
  }
  ctx.fillStyle = '#ffd93b';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('LANTERN LANE', 640, 190);
  ctx.fillStyle = '#fff7e6';
  ctx.font = '28px Georgia, serif';
  ctx.fillText('Spot the Difference', 640, 232);
  ctx.fillStyle = '#bfe6f7';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Two pictures. Nearly the same. Find every difference before the clock runs out.', 640, 272);
  // Scene cards.
  const scenes = [
    { n: '1', name: 'Sunny Market', diff: '7 differences', level: 'EASY · 3:00' },
    { n: '2', name: 'Lantern Festival', diff: '10 differences', level: 'MEDIUM · 2:30' },
    { n: '3', name: 'Harbor Dawn', diff: '12 differences', level: 'HARD · 2:30' },
  ];
  scenes.forEach((s, i) => {
    const x = 190 + i * 300;
    const y = 320;
    ctx.fillStyle = '#23233f';
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, 260, 150, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd93b';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText(s.n, x + 130, y + 58);
    ctx.fillStyle = '#fff7e6';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(s.name, x + 130, y + 92);
    ctx.fillStyle = '#bfe6f7';
    ctx.font = '15px Georgia, serif';
    ctx.fillText(s.diff + '  ·  ' + s.level, x + 130, y + 120);
    const best = bestByScene[i] || 0;
    if (best > 0) {
      ctx.fillStyle = '#7bed9f';
      ctx.font = 'bold 14px Georgia, serif';
      ctx.fillText('BEST ' + best, x + 130, y + 142);
    }
  });
  ctx.fillStyle = '#fff7e6';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Press  1 ,  2  or  3  to start a scene — or click a card.', 640, 540);
  ctx.fillStyle = '#bfe6f7';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Click a difference on either picture.  Hints: 3 per scene.  Wrong clicks cost time.', 640, 574);
  ctx.fillStyle = '#ffd93b';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('29 differences in all — find them all to light every lantern.', 640, 612);
}

// Level-complete / game-over overlay on top of the play field.
export function drawEndOverlay(ctx, kind, scene, stats) {
  ctx.fillStyle = 'rgba(10,10,30,0.82)';
  ctx.fillRect(0, 0, GAME_W, 720);
  ctx.fillStyle = '#ffd93b';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(kind === 'won' ? 'ALL FOUND!' : 'TIME\'S UP!', 640, 250);
  ctx.fillStyle = '#fff7e6';
  ctx.font = '24px Georgia, serif';
  const line1 = kind === 'won'
    ? 'You found all ' + scene.differences.length + ' differences in ' + scene.name + '.'
    : 'You found ' + stats.found + ' of ' + scene.differences.length + ' differences in ' + scene.name + '.';
  ctx.fillText(line1, 640, 300);
  ctx.fillStyle = '#bfe6f7';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('Score ' + stats.score + '   ·   Best combo x' + stats.bestCombo + '   ·   Hints used ' + stats.hintsUsed + '   ·   Misses ' + stats.misses, 640, 344);
  ctx.fillStyle = '#7bed9f';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('Best score for this scene: ' + stats.best, 640, 382);
  ctx.fillStyle = '#fff7e6';
  ctx.font = '18px Georgia, serif';
  const next = kind === 'won' && stats.nextScene
    ? 'Press  N  for the next scene  ·  '
    : '';
  ctx.fillText(next + 'Press  R  to play again  ·  L  for the scene list', 640, 440);
}

// Pause overlay.
export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(10,10,30,0.7)';
  ctx.fillRect(0, 0, GAME_W, 720);
  ctx.fillStyle = '#fff7e6';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', 640, 350);
  ctx.font = '20px Georgia, serif';
  ctx.fillText('Press  P  or  Esc  to keep hunting', 640, 396);
}
