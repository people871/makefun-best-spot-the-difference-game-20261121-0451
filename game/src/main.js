// LANTERN LANE — Spot the Difference. Entry point and game state machine.
//
// States: title -> playing -> paused -> won / lost -> title.
// Scoring: 100 per find, +10 per second left at the win, combo x1..x5
// grows with consecutive finds and breaks on a miss. A miss costs 3
// seconds. A hint costs 150 points and shows one unfound difference for
// 3 seconds; 3 hints per scene. Best score per scene is kept in
// localStorage under lantern-lane-best.
import { SCENES, TOTAL_DIFFERENCES } from './scenes.js';
import { SoundBank } from './audio.js';
import { makeRng, clamp } from './rng.js';
import { Input, hitDifference, hitButton, hitTitleCard, screenToPanel } from './input.js';
import { drawPanel, panelOrigin, MarkerBurst, GAME_W, GAME_H, PANEL_Y, PANEL_H } from './render.js';
import {
  drawHeader, drawButtons, drawFooter, drawTitle,
  drawEndOverlay, drawPause,
} from './hud.js';

const BEST_KEY = 'lantern-lane-best-v1';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sounds = new SoundBank();
    this.rng = makeRng(20261121);
    this.state = 'title'; // title | playing | paused | won | lost
    this.sceneIndex = 1; // festival is the richest middle scene; title picks 1/2/3
    this.scene = SCENES[this.sceneIndex];
    this.found = new Set();
    this.score = 0;
    this.combo = 1;
    this.bestCombo = 1;
    this.timeLeft = this.scene.timeLimit;
    this.hintsLeft = 3;
    this.hintsUsed = 0;
    this.misses = 0;
    this.message = 'Click a difference on either picture — the same spot counts on both.';
    this.hint = null;
    this.hintTimer = 0;
    this.missFlash = null;
    this.bursts = [];
    this.hover = null;
    this.shake = 0;
    this.t = 0;
    this.lastTickSecond = -1;
    this.bestByScene = this.loadBest();
    this.frozen = false; // shot mode: freeze time and animation
    this.input = new Input(canvas, this);
    this.last = performance.now();
    requestAnimationFrame((now) => this.frame(now));
  }

  loadBest() {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      if (!raw) return [0, 0, 0];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [0, 0, 0];
    } catch {
      return [0, 0, 0];
    }
  }

  saveBest() {
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(this.bestByScene));
    } catch { /* storage unavailable: best scores just don't persist */ }
  }

  get bestScore() { return this.bestByScene[this.sceneIndex] || 0; }

  startScene(index) {
    this.sceneIndex = index;
    this.scene = SCENES[index];
    this.found = new Set();
    this.score = 0;
    this.combo = 1;
    this.bestCombo = 1;
    this.timeLeft = this.scene.timeLimit;
    this.hintsLeft = 3;
    this.hintsUsed = 0;
    this.misses = 0;
    this.hint = null;
    this.hintTimer = 0;
    this.missFlash = null;
    this.bursts = [];
    this.shake = 0;
    this.state = 'playing';
    this.message = 'Scene ' + (index + 1) + ' — ' + this.scene.name + ': find all ' + this.scene.differences.length + ' differences.';
  }

  // -- input ---------------------------------------------------------------
  onHover(p) { this.hover = p; }

  onPointer(x, y) {
    this.sounds.ensure();
    if (this.state === 'title') {
      const card = hitTitleCard(x, y);
      if (card >= 0) { this.sounds.click(); this.startScene(card); }
      return;
    }
    if (this.state === 'won' || this.state === 'lost') {
      if (y >= 552) { /* buttons handled below */ }
      return;
    }
    if (this.state === 'paused') return;
    // Footer buttons work while playing.
    const button = hitButton(x, y);
    if (button) { this.pressButton(button); return; }
    const hit = screenToPanel(x, y);
    if (!hit) return;
    const diff = hitDifference(this.scene, this.found, hit.x, hit.y);
    if (diff) this.registerFind(diff);
    else this.registerMiss(hit);
  }

  onKey(key) {
    const k = key.toLowerCase();
    if (this.state === 'title') {
      if (k === '1') this.startScene(0);
      else if (k === '2') this.startScene(1);
      else if (k === '3') this.startScene(2);
      return;
    }
    if (k === 'p' || k === 'escape') {
      if (this.state === 'playing') { this.state = 'paused'; }
      else if (this.state === 'paused') { this.state = 'playing'; }
      return;
    }
    if (k === 'm') { this.sounds.ensure(); this.sounds.toggleMute(); return; }
    if (k === 'l') { this.state = 'title'; return; }
    if (k === 'r') { this.startScene(this.sceneIndex); return; }
    if ((this.state === 'won' || this.state === 'lost') && k === 'n') {
      if (this.state === 'won' && this.sceneIndex < SCENES.length - 1) this.startScene(this.sceneIndex + 1);
      return;
    }
    if (this.state !== 'playing') return;
    if (k === 'h') this.useHint();
  }

  pressButton(key) {
    this.sounds.ensure();
    if (key === 'hint') this.useHint();
    else if (key === 'level') this.state = 'title';
    else if (key === 'sound') this.sounds.toggleMute();
    else if (key === 'restart') this.startScene(this.sceneIndex);
  }

  useHint() {
    if (this.state !== 'playing') return;
    if (this.hintsLeft <= 0) {
      this.message = 'No hints left in this scene — trust your eyes.';
      return;
    }
    const remaining = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(this.rng() * remaining.length)];
    this.hintsLeft -= 1;
    this.hintsUsed += 1;
    this.score = Math.max(0, this.score - 150);
    this.hint = pick;
    this.hintTimer = 3;
    this.sounds.hint();
    this.message = 'Hint: look near the ' + pick.label.toLowerCase() + ' — 150 points.';
  }

  registerFind(diff) {
    this.found.add(diff.id);
    const gained = 100 * this.combo;
    this.score += gained;
    this.bursts.push(new MarkerBurst(diff.x, diff.y));
    this.sounds.found(this.combo);
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.combo = Math.min(5, this.combo + 1);
    const remaining = this.scene.differences.length - this.found.size;
    this.message = 'Found: ' + diff.label + '!  +' + gained + ' points' +
      (remaining > 0 ? ' — ' + remaining + ' still hiding.' : '');
    if (remaining === 0) this.winScene();
  }

  registerMiss(hit) {
    this.misses += 1;
    this.combo = 1;
    this.timeLeft = Math.max(0, this.timeLeft - 3);
    this.shake = 0.35;
    this.missFlash = { panel: hit.panel, x: hit.x, y: hit.y, age: 0 };
    this.sounds.miss();
    this.message = 'Not a difference — that cost 3 seconds. Look closer.';
  }

  winScene() {
    const bonus = Math.round(this.timeLeft) * 10;
    this.score += bonus;
    this.state = 'won';
    if (this.score > this.bestScore) {
      this.bestByScene[this.sceneIndex] = this.score;
      this.saveBest();
    }
    this.sounds.win();
    this.message = 'All ' + this.scene.differences.length + ' found! Time bonus +' + bonus + '.';
  }

  loseScene() {
    this.state = 'lost';
    this.sounds.miss();
    this.message = 'Out of time — ' + this.found.size + ' of ' + this.scene.differences.length + ' found.';
  }

  // -- frame ----------------------------------------------------------------
  frame(now) {
    const dt = this.frozen ? 0 : Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.frozen) this.t += dt;
    this.update(dt);
    this.render();
    requestAnimationFrame((n) => this.frame(n));
  }

  update(dt) {
    if (this.state === 'playing' && dt > 0) {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (whole <= 10 && whole !== this.lastTickSecond && whole > 0) {
        this.lastTickSecond = whole;
        this.sounds.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.loseScene();
      }
    }
    if (this.hintTimer > 0) {
      this.hintTimer -= dt;
      if (this.hintTimer <= 0) this.hint = null;
    }
    if (this.missFlash) {
      this.missFlash.age += dt;
      if (this.missFlash.age >= 0.7) this.missFlash = null;
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    for (const b of this.bursts) b.update(dt);
    this.bursts = this.bursts.filter((b) => !b.done);
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) {
      const s = this.shake * 14;
      ctx.translate((this.rng() - 0.5) * s, (this.rng() - 0.5) * s);
    }
    if (this.state === 'title') {
      drawTitle(ctx, this.t, this.bestByScene);
      ctx.restore();
      return;
    }
    // Backdrop.
    ctx.fillStyle = '#14142a';
    ctx.fillRect(-20, -20, GAME_W + 40, GAME_H + 40);
    drawHeader(ctx, this.scene, this.sceneIndex, this.found.size,
      this.scene.differences.length, this.score, this.combo,
      this.timeLeft, this.scene.timeLimit, this.hintsLeft, this.sounds.muted);
    // The two panels.
    const t = this.frozen ? 1.7 : this.t;
    drawPanel(ctx, this.scene, 'left', t, [...this.found].map((id) => this.scene.differences.find((d) => d.id === id)),
      this.hint, this.missFlash, this.bursts, panelOrigin('left'));
    drawPanel(ctx, this.scene, 'right', t, [...this.found].map((id) => this.scene.differences.find((d) => d.id === id)),
      this.hint, this.missFlash, this.bursts, panelOrigin('right'));
    // Centre divider with the scene's difference count.
    ctx.fillStyle = '#ffd93b';
    ctx.fillRect(628, PANEL_Y, 24, PANEL_H);
    ctx.save();
    ctx.translate(640, PANEL_Y + PANEL_H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#14142a';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FIND ' + this.scene.differences.length, 0, 5);
    ctx.restore();
    drawButtons(ctx, this.hintsLeft, this.sounds.muted, this.hover);
    drawFooter(ctx, this.message, this.bestScore);
    if (this.state === 'paused') drawPause(ctx);
    if (this.state === 'won' || this.state === 'lost') {
      drawEndOverlay(ctx, this.state, this.scene, {
        found: this.found.size,
        score: this.score,
        bestCombo: this.bestCombo,
        hintsUsed: this.hintsUsed,
        misses: this.misses,
        best: this.bestScore,
        nextScene: this.sceneIndex < SCENES.length - 1,
      });
    }
    ctx.restore();
  }
}
