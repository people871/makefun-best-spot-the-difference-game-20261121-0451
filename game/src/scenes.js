// The three scenes of LANTERN LANE. Every scene is drawn twice — once
// for the left panel, once for the right — by the same draw function,
// with the `variant` flag flipping exactly the listed differences.
// A difference is therefore a real change in the picture, never a
// decal pasted on top: the two panels are near-identical by construction.
//
// Panel space is 560 x 400 for every scene. Each difference carries its
// panel-local centre (x, y) and a click radius r, so a click on either
// panel at that spot finds it.

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

// A small bird: two arcs, like a distant "v" with curved wings.
function bird(ctx, x, y, s, color) {
  ctx.beginPath();
  ctx.arc(x - s, y, s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(x + s, y, s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// A paper lantern: round body, top/bottom caps, glow when lit.
function lantern(ctx, x, y, r, body, lit, t) {
  const flicker = lit ? 0.85 + 0.15 * Math.sin(t * 2 + x) : 1;
  if (lit) {
    const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.2);
    glow.addColorStop(0, 'rgba(255,190,80,' + (0.35 * flicker) + ')');
    glow.addColorStop(1, 'rgba(255,190,80,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
  }
  ellipse(ctx, x, y, r, r * 1.15, body);
  ctx.strokeStyle = 'rgba(120,30,20,0.55)';
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * Math.cos(i * 0.45), r * 1.15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  rect(ctx, x - r * 0.35, y - r * 1.3, r * 0.7, r * 0.28, '#8a5a2b');
  rect(ctx, x - r * 0.35, y + r * 1.05, r * 0.7, r * 0.28, '#8a5a2b');
}

// A sitting cat silhouette, drawn from circles and triangles.
function cat(ctx, x, y, s, color) {
  ellipse(ctx, x, y, s * 0.9, s * 0.75, color);
  circle(ctx, x, y - s * 0.85, s * 0.55, color);
  poly(ctx, [[x - s * 0.45, y - s * 1.1], [x - s * 0.55, y - s * 1.7], [x - s * 0.05, y - s * 1.25]], color);
  poly(ctx, [[x + s * 0.45, y - s * 1.1], [x + s * 0.55, y - s * 1.7], [x + s * 0.05, y - s * 1.25]], color);
  line(ctx, x + s * 0.8, y - s * 0.2, x + s * 1.5, y - s * 0.9, color, 3);
}

// ---------------------------------------------------------------------------
// Scene 1 — SUNNY MARKET. 7 differences, the gentle warm-up.
// ---------------------------------------------------------------------------
function drawMarket(ctx, variant, t) {
  const right = variant === 'right';
  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#7ec8f2');
  sky.addColorStop(0.55, '#bfe6f7');
  sky.addColorStop(1, '#fff3c4');
  rect(ctx, 0, 0, 560, 400, sky);
  circle(ctx, 95, 68, 34, '#ffd93b');
  circle(ctx, 95, 68, 26, '#ffe98a');
  if (right) {
    // Difference 1: the sun wears sunglasses on the right.
    rect(ctx, 72, 58, 46, 12, '#22223a');
    line(ctx, 72, 64, 64, 70, '#22223a', 3);
    line(ctx, 118, 64, 126, 70, '#22223a', 3);
  }
  // Clouds.
  ellipse(ctx, 210 + Math.sin(t * 0.3) * 6, 55, 42, 15, '#ffffff');
  ellipse(ctx, 240 + Math.sin(t * 0.3) * 6, 48, 30, 13, '#ffffff');
  ellipse(ctx, 430, 40, 36, 12, '#ffffff');
  // Birds: two on the left, one on the right.
  bird(ctx, 300, 80, 7, '#3a4a5a');
  if (!right) bird(ctx, 340, 62, 6, '#3a4a5a'); // Difference 7.
  // Distant rooftops.
  poly(ctx, [[0, 400], [0, 210], [90, 210], [120, 180], [150, 210], [240, 210], [240, 400]], '#e8a06a');
  poly(ctx, [[300, 400], [300, 200], [380, 200], [410, 170], [440, 200], [560, 200], [560, 400]], '#d98a5a');
  rect(ctx, 30, 230, 26, 14, '#fff7d6');
  rect(ctx, 330, 220, 26, 14, '#fff7d6');
  rect(ctx, 480, 225, 26, 14, '#fff7d6');
  // Cobble street.
  rect(ctx, 0, 300, 560, 100, '#cbb59a');
  ctx.strokeStyle = 'rgba(120,90,60,0.35)';
  ctx.lineWidth = 2;
  for (let x = 20; x < 560; x += 46) {
    ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x - 14, 400); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, 340); ctx.lineTo(560, 340); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 372); ctx.lineTo(560, 372); ctx.stroke();
  // Bunting across the top.
  line(ctx, 0, 18, 560, 18, '#5a3a2a', 2);
  const flagColors = ['#e84a5f', '#f7b731', '#2bcbba', '#8854d0', '#20bf6b'];
  for (let i = 0; i < 14; i += 1) {
    const fx = 20 + i * 40;
    poly(ctx, [[fx, 18], [fx + 26, 18], [fx + 13, 40]], flagColors[i % flagColors.length]);
  }
  // Left stall: fruit, striped awning, apple basket.
  rect(ctx, 58, 190, 14, 130, '#7a4a2b');
  rect(ctx, 216, 190, 14, 130, '#7a4a2b');
  for (let i = 0; i < 6; i += 1) {
    rect(ctx, 52 + i * 30, 158, 30, 34, i % 2 === 0 ? '#e84a5f' : '#fff7e6');
  }
  rect(ctx, 52, 192, 178, 10, '#7a4a2b');
  rect(ctx, 60, 202, 162, 78, '#a9713f');
  rect(ctx, 60, 202, 162, 8, '#8a5a2b');
  // Apples: 3 on the left, 2 on the right.
  circle(ctx, 105, 252, 13, '#e33e3e');
  circle(ctx, 135, 258, 13, '#e33e3e');
  if (!right) circle(ctx, 165, 252, 13, '#e33e3e'); // Difference 3.
  circle(ctx, 105, 240, 3, '#2f9e44');
  circle(ctx, 135, 246, 3, '#2f9e44');
  // Oranges in a basket beside.
  ellipse(ctx, 195, 262, 26, 14, '#8a5a2b');
  circle(ctx, 185, 252, 10, '#ff922b');
  circle(ctx, 205, 252, 10, '#ff922b');
  circle(ctx, 195, 244, 10, '#ff922b');
  // Signboard over the fruit stall.
  rect(ctx, 96, 108, 96, 34, '#fff7e6');
  ctx.strokeStyle = '#7a4a2b'; ctx.lineWidth = 3;
  ctx.strokeRect(96, 108, 96, 34);
  ctx.fillStyle = '#c0392b';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FRESH', 144, 132);
  if (!right) { circle(ctx, 182, 116, 5, '#e33e3e'); } // Difference 6: cherry on the sign.
  // Right stall: flowers, awning stripe colour differs.
  rect(ctx, 330, 190, 14, 130, '#5a3a6e');
  rect(ctx, 488, 190, 14, 130, '#5a3a6e');
  for (let i = 0; i < 6; i += 1) {
    // Difference 4: the awning's bright stripe is red left, teal right.
    rect(ctx, 324 + i * 30, 158, 30, 34, i % 2 === 0 ? (right ? '#2bcbba' : '#e84a5f') : '#fff7e6');
  }
  rect(ctx, 324, 192, 178, 10, '#5a3a6e');
  rect(ctx, 332, 202, 162, 78, '#7d5a9e');
  // Flower pots.
  for (let i = 0; i < 4; i += 1) {
    const fx = 356 + i * 38;
    poly(ctx, [[fx - 12, 252], [fx + 12, 252], [fx + 8, 276], [fx - 8, 276]], '#c0392b');
    circle(ctx, fx, 238, 9, ['#ff6b9d', '#ffd93b', '#a55eea', '#ff9f43'][i]);
    circle(ctx, fx - 7, 244, 6, '#ff6b9d');
    circle(ctx, fx + 7, 244, 6, '#ffd93b');
  }
  // Balloons tied to the right stall: yellow left, purple right.
  line(ctx, 520, 108, 505, 196, '#5a3a2a', 2);
  circle(ctx, 520, 90, 18, right ? '#8854d0' : '#ffd93b'); // Difference 5.
  poly(ctx, [[512, 106], [528, 106], [520, 116]], right ? '#8854d0' : '#ffd93b');
  circle(ctx, 486, 74, 13, '#2bcbba');
  line(ctx, 486, 86, 480, 196, '#5a3a2a', 2);
  // Cat on a crate by the flower stall — missing on the right.
  rect(ctx, 452, 296, 44, 26, '#8a5a2b');
  rect(ctx, 452, 296, 44, 5, '#a9713f');
  if (!right) cat(ctx, 474, 288, 13, '#3a3a4a'); // Difference 2.
  // A sleepy dog by the fruit stall, same on both sides.
  ellipse(ctx, 250, 318, 26, 12, '#b08954');
  circle(ctx, 274, 308, 11, '#b08954');
  poly(ctx, [[268, 300], [272, 290], [278, 300]], '#b08954');
  ellipse(ctx, 226, 312, 12, 7, '#d9b380');
}

const MARKET_DIFFS = [
  { id: 'sun-glasses', label: 'The sun wears sunglasses', x: 95, y: 66, r: 30 },
  { id: 'cat-missing', label: 'The cat on the crate is gone', x: 474, y: 288, r: 26 },
  { id: 'apple-count', label: 'One apple fewer in the basket', x: 165, y: 252, r: 22 },
  { id: 'awning-stripe', label: 'The flower-stall awning stripe changed colour', x: 400, y: 175, r: 26 },
  { id: 'balloon-colour', label: 'The big balloon changed colour', x: 520, y: 90, r: 24 },
  { id: 'sign-cherry', label: 'The cherry on the FRESH sign is gone', x: 182, y: 116, r: 18 },
  { id: 'bird-count', label: 'One bird fewer in the sky', x: 340, y: 62, r: 20 },
];

// ---------------------------------------------------------------------------
// Scene 2 — LANTERN FESTIVAL. 10 differences, the middle hunt.
// ---------------------------------------------------------------------------
function drawFestival(ctx, variant, t) {
  const right = variant === 'right';
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#0d1b3e');
  sky.addColorStop(0.6, '#1d2f5e');
  sky.addColorStop(1, '#3a2a5e');
  rect(ctx, 0, 0, 560, 400, sky);
  // Stars.
  const stars = [[40, 40], [150, 30], [230, 55], [330, 35], [470, 45], [520, 80], [60, 110], [260, 28], [390, 70], [500, 130]];
  ctx.fillStyle = '#fffbe6';
  for (const [sx, sy] of stars) {
    const tw = 0.5 + 0.5 * Math.sin(t * 1.5 + sx);
    ctx.globalAlpha = 0.4 + 0.6 * tw;
    circle(ctx, sx, sy, 2, '#fffbe6');
  }
  ctx.globalAlpha = 1;
  if (!right) circle(ctx, 450, 60, 2, '#fffbe6'); // Difference 3: one extra star.
  // Moon: full on the left, crescent on the right.
  circle(ctx, 90, 70, 28, '#f7ead0');
  if (right) circle(ctx, 100, 64, 24, '#1d2f5e'); // Difference 1.
  // Firework burst — only on the left.
  if (!right) {
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      line(ctx, 480, 110, 480 + Math.cos(a) * 30, 110 + Math.sin(a) * 30, i % 2 ? '#ffd93b' : '#ff6b9d', 2);
    }
    circle(ctx, 480, 110, 5, '#fffbe6');
  } // Difference 5.
  // String lights across the top.
  line(ctx, 0, 96, 560, 96, '#0a0a14', 2);
  for (let i = 0; i < 12; i += 1) {
    const bx = 24 + i * 46;
    const by = 96 + Math.sin(i * 0.9) * 6 + 8;
    const lit = !(right && i === 5); // Difference 8: one bulb is out.
    circle(ctx, bx, by, 6, lit ? ['#ffd93b', '#ff6b9d', '#2bcbba'][i % 3] : '#3a3a4a');
    if (lit) {
      const g = ctx.createRadialGradient(bx, by, 1, bx, by, 16);
      g.addColorStop(0, 'rgba(255,220,120,0.5)');
      g.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - 16, by - 16, 32, 32);
    }
  }
  // Paper lanterns on poles.
  line(ctx, 60, 150, 60, 300, '#4a2c1a', 5);
  line(ctx, 500, 150, 500, 300, '#4a2c1a', 5);
  lantern(ctx, 60, 176, 20, '#e84a5f', true, t);
  lantern(ctx, 500, 176, 20, '#e84a5f', true, t);
  // The big middle lantern changes colour: red left, gold right.
  lantern(ctx, 300, 128, 26, right ? '#f7b731' : '#e84a5f', true, t); // Difference 2.
  lantern(ctx, 180, 150, 16, '#2bcbba', true, t);
  lantern(ctx, 420, 150, 16, '#2bcbba', true, t);
  // Food stall with dumpling steam.
  rect(ctx, 120, 230, 150, 90, '#6e3b2a');
  rect(ctx, 112, 218, 166, 16, '#a9713f');
  rect(ctx, 128, 244, 134, 12, '#e8c39a');
  circle(ctx, 150, 238, 9, '#fff7e6');
  circle(ctx, 176, 238, 9, '#fff7e6');
  circle(ctx, 202, 238, 9, '#fff7e6');
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(150, 226); ctx.quadraticCurveTo(146, 214, 150, 204); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(176, 226); ctx.quadraticCurveTo(180, 214, 176, 204); ctx.stroke();
  if (!right) { // Difference 10: a third wisp of steam.
    ctx.beginPath(); ctx.moveTo(202, 226); ctx.quadraticCurveTo(198, 214, 202, 204); ctx.stroke();
  }
  // Stall flag: present on the left, gone on the right.
  line(ctx, 128, 218, 128, 176, '#4a2c1a', 3);
  if (!right) poly(ctx, [[128, 176], [156, 184], [128, 192]], '#e84a5f'); // Difference 6.
  // Koi pond at the bottom.
  const pond = ctx.createLinearGradient(0, 320, 0, 400);
  pond.addColorStop(0, '#1d4e6e');
  pond.addColorStop(1, '#0d2f4a');
  rect(ctx, 0, 320, 560, 80, pond);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(120 + i * 110, 352 + (i % 2) * 18, 34, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Koi: three on the left, two on the right.
  function koi(kx, ky, col) {
    ellipse(ctx, kx, ky, 16, 7, col);
    poly(ctx, [[kx - 16, ky], [kx - 26, ky - 8], [kx - 26, ky + 8]], col);
    circle(ctx, kx + 10, ky - 3, 2, '#222');
  }
  koi(120, 348, '#ff8c42');
  koi(230, 372, '#fff7e6');
  if (!right) koi(330, 352, '#ff6b9d'); // Difference 4.
  // Arched bridge over the pond.
  ctx.beginPath();
  ctx.moveTo(300, 330);
  ctx.quadraticCurveTo(400, 272, 500, 330);
  ctx.strokeStyle = '#8a4a2a';
  ctx.lineWidth = 14;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 330);
  ctx.quadraticCurveTo(400, 272, 500, 330);
  ctx.strokeStyle = '#a9713f';
  ctx.lineWidth = 8;
  ctx.stroke();
  // Bridge planks: one is missing on the right.
  for (let i = 0; i < 7; i += 1) {
    if (right && i === 3) continue; // Difference 7.
    const bx = 330 + i * 22;
    const by = 322 - Math.sin((i / 6) * Math.PI) * 34;
    line(ctx, bx, by - 6, bx, by + 6, '#5a3a2a', 4);
  }
  // A cat sits on the bridge — only on the right.
  if (right) cat(ctx, 400, 282, 11, '#1a1a2e'); // Difference 9.
  // Festival crowd silhouettes at the edges, same on both sides.
  circle(ctx, 36, 330, 14, '#14142a');
  rect(ctx, 20, 344, 32, 56, '#14142a');
  circle(ctx, 528, 330, 14, '#14142a');
  rect(ctx, 512, 344, 32, 56, '#14142a');
}

const FESTIVAL_DIFFS = [
  { id: 'moon-phase', label: 'The moon turned into a crescent', x: 90, y: 70, r: 30 },
  { id: 'lantern-colour', label: 'The big lantern changed colour', x: 300, y: 128, r: 28 },
  { id: 'star-count', label: 'One star vanished', x: 450, y: 60, r: 18 },
  { id: 'koi-count', label: 'One koi fewer in the pond', x: 330, y: 352, r: 24 },
  { id: 'firework', label: 'The firework burst is gone', x: 480, y: 110, r: 32 },
  { id: 'stall-flag', label: 'The stall flag is missing', x: 140, y: 184, r: 20 },
  { id: 'bridge-plank', label: 'One bridge plank is missing', x: 396, y: 300, r: 18 },
  { id: 'bulb-out', label: 'One string-light bulb went out', x: 254, y: 102, r: 16 },
  { id: 'bridge-cat', label: 'A cat appeared on the bridge', x: 400, y: 282, r: 22 },
  { id: 'steam-wisp', label: 'One wisp of dumpling steam is gone', x: 202, y: 214, r: 16 },
];

// ---------------------------------------------------------------------------
// Scene 3 — HARBOR DAWN. 12 differences, the hard hunt.
// ---------------------------------------------------------------------------
function drawHarbor(ctx, variant, t) {
  const right = variant === 'right';
  // Dawn sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#2b3a6e');
  sky.addColorStop(0.45, '#e88ca0');
  sky.addColorStop(0.7, '#ffd9a0');
  sky.addColorStop(1, '#fff3c4');
  rect(ctx, 0, 0, 560, 400, sky);
  // Rising sun over the sea.
  circle(ctx, 300, 218, 30, '#ffdf6b');
  circle(ctx, 300, 218, 22, '#fff3b0');
  // Gulls: three on the left, two on the right.
  bird(ctx, 420, 80, 7, '#2a2a3a');
  bird(ctx, 452, 66, 6, '#2a2a3a');
  if (!right) bird(ctx, 388, 62, 6, '#2a2a3a'); // Difference 3.
  // Lighthouse on the left headland.
  poly(ctx, [[52, 250], [88, 250], [80, 130], [60, 130]], '#f5f0e6');
  rect(ctx, 56, 148, 28, 14, '#e84a5f');
  rect(ctx, 58, 168, 24, 14, '#e84a5f');
  rect(ctx, 56, 190, 28, 14, '#e84a5f');
  rect(ctx, 54, 118, 32, 16, '#2a2a3a');
  circle(ctx, 70, 110, 8, '#2a2a3a');
  if (!right) {
    // Difference 1: the lamp beam shines on the left only.
    const beam = ctx.createLinearGradient(70, 110, 300, 60);
    beam.addColorStop(0, 'rgba(255,240,180,0.55)');
    beam.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = beam;
    poly(ctx, [[70, 104], [70, 116], [300, 52], [300, 168]], 'rgba(255,240,180,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(70, 104); ctx.lineTo(300, 52); ctx.lineTo(300, 168); ctx.lineTo(70, 116);
    ctx.closePath(); ctx.fill();
    circle(ctx, 70, 110, 12, '#fff3b0');
  }
  // Harbor house with a lit window and chimney smoke.
  rect(ctx, 96, 220, 70, 60, '#c98a5a');
  poly(ctx, [[90, 220], [131, 188], [172, 220]], '#8a4a2a');
  rect(ctx, 118, 244, 18, 20, right ? '#2a2a3a' : '#ffd93b'); // Difference 7: window lit.
  rect(ctx, 144, 244, 18, 20, '#2a2a3a');
  rect(ctx, 150, 192, 10, 26, '#8a4a2a');
  if (!right) { // Difference 12: chimney smoke on the left only.
    ctx.fillStyle = 'rgba(240,240,240,0.7)';
    circle(ctx, 158, 182, 7, 'rgba(240,240,240,0.7)');
    circle(ctx, 166, 172, 9, 'rgba(240,240,240,0.6)');
    circle(ctx, 176, 160, 11, 'rgba(240,240,240,0.45)');
  }
  // Sea.
  const sea = ctx.createLinearGradient(0, 250, 0, 400);
  sea.addColorStop(0, '#3a7ca8');
  sea.addColorStop(1, '#1d4e6e');
  rect(ctx, 0, 250, 560, 150, sea);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const wy = 268 + i * 24;
    ctx.beginPath();
    ctx.moveTo(20 + i * 30, wy + Math.sin(t + i) * 2);
    ctx.quadraticCurveTo(120 + i * 60, wy - 6, 240 + i * 50, wy);
    ctx.quadraticCurveTo(360 + i * 40, wy + 6, 540, wy);
    ctx.stroke();
  }
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255,220,120,0.5)';
  for (let i = 0; i < 6; i += 1) {
    const gy = 258 + i * 12;
    rect(ctx, 286 - i * 4, gy, 28 + i * 8, 3, 'rgba(255,220,120,0.45)');
  }
  // Big sailboat: sail white left, red-striped right.
  poly(ctx, [[270, 180], [270, 96], [330, 180]], right ? '#e84a5f' : '#fff7e6'); // Difference 2.
  if (right) {
    line(ctx, 282, 150, 306, 150, '#fff7e6', 5);
    line(ctx, 276, 168, 316, 168, '#fff7e6', 5);
  }
  line(ctx, 270, 92, 270, 186, '#4a2c1a', 4);
  poly(ctx, [[270, 92], [306, 100], [270, 110]], right ? '#2b6cb0' : '#e84a5f'); // Difference 8: flag colour.
  ellipse(ctx, 296, 190, 44, 12, '#8a4a2a');
  rect(ctx, 282, 176, 28, 14, '#a9713f');
  // Small rowboat.
  ellipse(ctx, 150, 300, 30, 9, '#6e3b2a');
  circle(ctx, 150, 290, 7, '#14142a');
  line(ctx, 138, 292, 162, 292, '#4a2c1a', 3);
  // Buoy bobbing — only on the left.
  if (!right) { // Difference 4.
    const bob = Math.sin(t * 1.2) * 3;
    circle(ctx, 480, 330 + bob, 10, '#e84a5f');
    rect(ctx, 474, 312 + bob, 12, 8, '#ffd93b');
  }
  // A fish jumps — only on the right.
  if (right) { // Difference 9.
    const fy = 300 - Math.abs(Math.sin(t * 2)) * 14;
    ellipse(ctx, 380, fy, 14, 6, '#9ecfff');
    poly(ctx, [[392, fy], [402, fy - 6], [402, fy + 6]], '#9ecfff');
    circle(ctx, 380, fy - 8, 5, 'rgba(255,255,255,0.6)');
    circle(ctx, 374, fy - 16, 7, 'rgba(255,255,255,0.4)');
  }
  // Dock along the bottom.
  rect(ctx, 0, 340, 560, 60, '#8a6a4a');
  ctx.strokeStyle = 'rgba(60,40,20,0.5)';
  ctx.lineWidth = 2;
  for (let x = 0; x < 560; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 340); ctx.lineTo(x, 400); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, 362); ctx.lineTo(560, 362); ctx.stroke();
  // Crates: three on the left, two on the right.
  rect(ctx, 120, 312, 28, 28, '#a9713f');
  rect(ctx, 150, 312, 28, 28, '#8a5a2b');
  if (!right) rect(ctx, 135, 284, 28, 28, '#c98a5a'); // Difference 5.
  ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 2;
  ctx.strokeRect(120, 312, 28, 28);
  ctx.strokeRect(150, 312, 28, 28);
  // Rope coil — only on the left.
  if (!right) { // Difference 6.
    ctx.strokeStyle = '#d9c39a';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(250, 352, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(250, 352, 8, 0, Math.PI * 2); ctx.stroke();
  }
  // Anchor leaning on the dock — only on the right.
  if (right) { // Difference 10.
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(200, 372, 10, Math.PI, 0); ctx.stroke();
    line(ctx, 200, 362, 200, 388, '#2a2a3a', 4);
    line(ctx, 190, 352, 210, 352, '#2a2a3a', 4);
  }
  // Crane on the right with a hook — hook only on the left.
  line(ctx, 500, 340, 500, 150, '#4a4a5a', 8);
  line(ctx, 500, 150, 544, 150, '#4a4a5a', 8);
  line(ctx, 500, 150, 470, 190, '#4a4a5a', 5);
  if (!right) { // Difference 11: the crane hook is gone on the right.
    line(ctx, 520, 150, 520, 196, '#2a2a3a', 3);
    ctx.beginPath(); ctx.arc(520, 202, 7, 0.3, Math.PI * 1.4); ctx.strokeStyle = '#2a2a3a'; ctx.lineWidth = 4; ctx.stroke();
  }
  // Net drying on a rail.
  line(ctx, 40, 340, 40, 300, '#4a2c1a', 4);
  line(ctx, 110, 340, 110, 300, '#4a2c1a', 4);
  ctx.strokeStyle = 'rgba(220,220,200,0.8)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath(); ctx.moveTo(42 + i * 16, 302); ctx.lineTo(42 + i * 16, 338); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(40, 320); ctx.lineTo(110, 320); ctx.stroke();
}

const HARBOR_DIFFS = [
  { id: 'lighthouse-beam', label: 'The lighthouse beam is off', x: 180, y: 110, r: 34 },
  { id: 'sail-stripes', label: 'The big sail turned red-striped', x: 300, y: 150, r: 30 },
  { id: 'gull-count', label: 'One gull fewer over the sea', x: 388, y: 62, r: 18 },
  { id: 'buoy', label: 'The red buoy is gone', x: 480, y: 328, r: 20 },
  { id: 'crate-stack', label: 'The top crate is missing', x: 149, y: 298, r: 24 },
  { id: 'rope-coil', label: 'The rope coil vanished', x: 250, y: 352, r: 20 },
  { id: 'window-lit', label: 'The harbor-house window went dark', x: 127, y: 254, r: 18 },
  { id: 'boat-flag', label: 'The sailboat flag turned blue', x: 288, y: 101, r: 18 },
  { id: 'jumping-fish', label: 'A fish jumped out of the water', x: 380, y: 292, r: 24 },
  { id: 'anchor', label: 'An anchor appeared on the dock', x: 200, y: 370, r: 22 },
  { id: 'crane-hook', label: 'The crane hook is missing', x: 520, y: 190, r: 20 },
  { id: 'chimney-smoke', label: 'The chimney smoke is gone', x: 166, y: 172, r: 20 },
];

// ---------------------------------------------------------------------------
// The catalogue the game plays through.
// ---------------------------------------------------------------------------
export const SCENES = [
  {
    id: 'sunny-market',
    name: 'Sunny Market',
    subtitle: 'A morning on the cobbles — 7 differences',
    difficulty: 'Easy',
    timeLimit: 180,
    differences: MARKET_DIFFS,
    draw: drawMarket,
  },
  {
    id: 'lantern-festival',
    name: 'Lantern Festival',
    subtitle: 'Paper lights over the koi pond — 10 differences',
    difficulty: 'Medium',
    timeLimit: 150,
    differences: FESTIVAL_DIFFS,
    draw: drawFestival,
  },
  {
    id: 'harbor-dawn',
    name: 'Harbor Dawn',
    subtitle: 'First light on the docks — 12 differences',
    difficulty: 'Hard',
    timeLimit: 150,
    differences: HARBOR_DIFFS,
    draw: drawHarbor,
  },
];

export const TOTAL_DIFFERENCES = SCENES.reduce((n, s) => n + s.differences.length, 0);
