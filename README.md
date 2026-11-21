# makefun-best-spot-the-difference-game-20261121-0451

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/people871/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/people871/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

LANTERN LANE — a spot-the-difference game. Two near-identical hand-drawn pictures side by side; find every difference before the clock runs out. Three original scenes, 29 hidden differences in all: Sunny Market (7, easy, 3:00), Lantern Festival (10, medium, 2:30), Harbor Dawn (12, hard, 2:30). Every find rings both pictures with a green check and a sparkle, builds a combo up to x5, and pays 100 points times the combo plus a 10-points-per-second time bonus on a clean sweep. A wrong click costs 3 seconds and breaks the combo; a hint (3 per scene, 150 points) pulses a golden ring over one unfound difference. Vanilla 2D canvas, all art drawn in code, synthesised WebAudio sounds, no assets, no network requests, no dependencies.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. `?shot=cover|title|hint|win` stages a deterministic screenshot frame; `?selftest=1` runs a scripted play-through and reports in `window.__selftest`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=t9cvg4vb&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>

## Controls
- **Mouse** — click a difference on either picture; the same spot counts on both
- **1 / 2 / 3 or click a card** — pick a scene on the title screen
- **H** — hint (3 per scene, −150 points) · **P / Esc** — pause · **M** — mute · **R** — restart · **L** — scene list · **N** — next scene after a win

## The scenes
- **Sunny Market** — 7 differences: the sun's sunglasses, the missing cat, the apple count, the awning stripe, the balloon colour, the cherry on the FRESH sign, the second bird.
- **Lantern Festival** — 10 differences: the moon's phase, the big lantern's colour, a missing star, a koi, the firework, the stall flag, a bridge plank, a dead string-light bulb, the cat on the bridge, a wisp of dumpling steam.
- **Harbor Dawn** — 12 differences: the lighthouse beam, the striped sail, a gull, the buoy, the top crate, the rope coil, the lit window, the boat flag, the jumping fish, the anchor, the crane hook, the chimney smoke.

## Files
- `game/index.html` — the page; `game/src/main.js` — state machine, scoring, timer; `game/src/scenes.js` — the three scenes and their 29 differences; `game/src/render.js` — panels, markers, sparkles; `game/src/hud.js` — header, counter, buttons, title/end screens; `game/src/input.js` — pointer/keyboard hit-testing; `game/src/audio.js` — synthesised WebAudio sounds; `game/src/rng.js` — seeded RNG; `game/src/shots.js` — screenshot staging + self-test.
- `main.ts` — the make.fun hand-in program (Node 22, stdlib only); `vendor/makefun-game.ts` — the kit's library, unchanged; `serve.ts` — a tiny static server for local play.
