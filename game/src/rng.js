// Seeded pseudo-random generator (mulberry32) so the game's ambient
// animation and the screenshot staging are deterministic for a given seed.
// The game never uses Math.random for anything the player can see.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic shuffle: same seed, same order. Used to lay out the
// decorative (non-difference) clutter of each scene.
export function shuffled(rng, items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
  }
  return out;
}

// Clamp a number into [lo, hi].
export function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

// Format seconds as M:SS for the timer read-out.
export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}
