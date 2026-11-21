// Screenshot staging + self-test for LANTERN LANE.
//
// ?shot=cover  — Lantern Festival mid-hunt: 4 differences found (rings on
//                both panels), 6 still unfound, counter "6 LEFT", timer
//                running, score and combo live. The cover.
// ?shot=title  — the title screen with the three scene cards.
// ?shot=hint   — Sunny Market with a hint pulsing over one difference and
//                one found marker, counter "6 LEFT".
// ?shot=win    — Harbor Dawn, all 12 found, "ALL FOUND!" overlay + stats.
// ?selftest=1  — scripted play-through; results land in window.__selftest.
//
// In shot mode the game is frozen (no clock, no animation drift) so the
// capture is deterministic for a fixed seed.
import { Game } from './main.js';
import { SCENES } from './scenes.js';
import { LEFT_X, RIGHT_X, PANEL_Y } from './render.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
window.__game = game;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const selftest = params.get('selftest') === '1';

function panelPoint(panel, d) {
  const ox = panel === 'left' ? LEFT_X : RIGHT_X;
  return { x: ox + d.x, y: PANEL_Y + d.y };
}

function clickDiff(scene, diff, panel) {
  const p = panelPoint(panel, diff);
  game.onPointer(p.x, p.y);
}

function stageShot(name) {
  game.frozen = true;
  if (name === 'title') {
    game.state = 'title';
  } else if (name === 'cover') {
    // Festival, 4 found: moon, lantern, koi, firework. 6 remain.
    game.startScene(1);
    game.frozen = true;
    const s = SCENES[1];
    for (const id of ['moon-phase', 'lantern-colour', 'koi-count', 'firework']) {
      clickDiff(s, s.differences.find((d) => d.id === id), 'left');
    }
    game.timeLeft = 151; // 2:31 on the clock
    game.message = 'Found: The firework burst is gone!  +400 points — 6 still hiding.';
  } else if (name === 'hint') {
    // Market, 1 found + a live hint pulsing over the cat's spot.
    game.startScene(0);
    game.frozen = true;
    const s = SCENES[0];
    clickDiff(s, s.differences.find((d) => d.id === 'sun-glasses'), 'right');
    game.useHint();
    // Force the hint to the cat so the shot always shows the same story.
    game.hint = s.differences.find((d) => d.id === 'cat-missing');
    game.hintTimer = 3;
    game.timeLeft = 164;
    game.message = 'Hint: look near the cat on the crate — 150 points.';
  } else if (name === 'win') {
    // Harbor Dawn, all 12 found, win overlay with stats.
    game.startScene(2);
    game.frozen = true;
    const s = SCENES[2];
    for (const d of s.differences) clickDiff(s, d, 'left');
    game.timeLeft = 96;
  }
  // One render pass with the frozen clock, then signal readiness.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { window.__shotReady = true; });
  });
}

async function runSelftest() {
  const checks = {};
  const step = (name, ok) => { checks[name] = !!ok; };
  try {
    // Title -> start scene 2 via keyboard.
    game.onKey('2');
    step('startsFromTitle', game.state === 'playing' && game.scene.id === 'lantern-festival');
    step('counterStartsAt10', game.scene.differences.length - game.found.size === 10);

    // Click a real difference (moon) on the LEFT panel.
    const s = SCENES[1];
    const moon = s.differences.find((d) => d.id === 'moon-phase');
    clickDiff(s, moon, 'left');
    step('clickFindsDifference', game.found.has('moon-phase'));
    step('counterDropsTo9', game.scene.differences.length - game.found.size === 9);
    step('scoreGrows', game.score === 100);
    step('comboGrows', game.combo === 2);

    // Same difference on the RIGHT panel now counts as a miss (already found).
    const before = game.misses;
    clickDiff(s, moon, 'right');
    step('refindCountsAsMiss', game.misses === before + 1);

    // A wrong click costs 3 seconds and breaks the combo.
    const t0 = game.timeLeft;
    game.onPointer(LEFT_X + 30, PANEL_Y + 350); // empty water, no difference
    step('wrongClickCostsTime', game.timeLeft <= t0 - 2.9 && game.timeLeft >= t0 - 3.1);
    step('wrongClickBreaksCombo', game.combo === 1);

    // Hint spends one of three and points at an unfound difference.
    const hintsBefore = game.hintsLeft;
    const scoreBefore = game.score;
    game.useHint();
    step('hintSpendsOne', game.hintsLeft === hintsBefore - 1);
    step('hintPointsUnfound', !!game.hint && !game.found.has(game.hint.id));
    step('hintCosts150', game.score === Math.max(0, scoreBefore - 150));

    // Pause and resume.
    game.onKey('p');
    step('pauses', game.state === 'paused');
    const frozenTime = game.timeLeft;
    await new Promise((r) => setTimeout(r, 300));
    step('clockStopsWhenPaused', game.timeLeft === frozenTime);
    game.onKey('p');
    step('resumes', game.state === 'playing');

    // Find the rest and win.
    for (const d of s.differences) {
      if (!game.found.has(d.id)) clickDiff(s, d, 'right');
    }
    step('findsAllTen', game.found.size === 10);
    step('winsScene', game.state === 'won');
    step('timeBonusAdded', game.score > 1000);
    step('bestSaved', game.bestByScene[1] === game.score);

    // Restart works and resets the counter.
    game.onKey('r');
    step('restartResets', game.state === 'playing' && game.found.size === 0 && game.score === 0);
    step('counterBackTo10', game.scene.differences.length - game.found.size === 10);

    // Level list, then start the hard scene and lose on the clock.
    game.onKey('l');
    step('backToTitle', game.state === 'title');
    game.onKey('3');
    step('startsHarbor', game.scene.id === 'harbor-dawn');
    game.timeLeft = 0.05;
    await new Promise((r) => setTimeout(r, 300));
    step('clockRunsOut', game.state === 'lost');

    const stepNames = Object.keys(checks);
    checks.passed = stepNames.filter((k) => checks[k]).length;
    checks.total = stepNames.length;
  } catch (e) {
    checks.error = String(e);
  }
  window.__selftest = checks;
}

if (selftest) {
  void runSelftest();
} else if (shot) {
  stageShot(shot);
}
