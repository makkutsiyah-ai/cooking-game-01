// Warung Kilat — the chef: movement and player actions.
// One job: turn a click or a key into one kitchen action, and walk the chef
// to the station it happened at. Actions answer at once; the walk is theatre.

import { PANTRY_ORDER, LAYOUT } from './config.js';
import { pickIngredient, useStation, addToPlate, clearPlate, isReady } from './kitchen.js';
import { serveTo, serveFirstMatch, waitingOrders } from './orders.js';
import { sfx } from './audio.js';

const CHEF_SPEED = 520; // pixels per second

// Glide the chef toward its target; called every frame.
export function updateChef(G, dt) {
  const c = G.chef;
  const dx = c.tx - c.x;
  const dy = c.ty - c.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 4) {
    const step = Math.min(dist, CHEF_SPEED * dt);
    c.x += (dx / dist) * step;
    c.y += (dy / dist) * step;
    c.dir = dx >= 0 ? 1 : -1;
    c.bob += dt * 14;
  } else {
    c.bob += dt * 4;
  }
  const b = G.bimo;
  const bdx = b.tx - b.x;
  const bdy = b.ty - b.y;
  const bdist = Math.hypot(bdx, bdy);
  if (bdist > 4) {
    const step = Math.min(bdist, 420 * dt);
    b.x += (bdx / bdist) * step;
    b.y += (bdy / bdist) * step;
    b.dir = bdx >= 0 ? 1 : -1;
    b.bob += dt * 14;
  } else {
    b.bob += dt * 4;
  }
}

// The pantry bin under a point, or null.
export function pantryHit(x, y) {
  const p = LAYOUT.pantry;
  for (let i = 0; i < PANTRY_ORDER.length; i += 1) {
    const col = i % p.cols;
    const row = Math.floor(i / p.cols);
    const bx = p.x + col * (p.w + p.gapX);
    const by = p.y + row * (p.h + p.gapY);
    if (x >= bx && x < bx + p.w && y >= by && y < by + p.h) return PANTRY_ORDER[i];
  }
  return null;
}

export function pointIn(rect, x, y) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

// One click on the kitchen, by the player or the autopilot.
// Returns a short word describing what happened (for the tutorial + AI log).
export function clickAt(G, x, y) {
  if (G.screen !== 'play') return 'screen';
  // Top-bar buttons.
  if (pointIn(LAYOUT.buttons.sound, x, y)) return 'sound';
  if (pointIn(LAYOUT.buttons.pause, x, y)) return 'pause';
  if (pointIn(LAYOUT.buttons.autopilot, x, y)) return 'autopilot';
  // Pantry bins.
  const ing = pantryHit(x, y);
  if (ing) {
    pickIngredient(G, ing);
    noteTutorial(G, 'pick', ing);
    return 'pick';
  }
  if (pointIn(LAYOUT.board, x, y)) {
    const r = useStation(G, 'board');
    noteTutorial(G, 'board', r);
    return r;
  }
  if (pointIn(LAYOUT.wok, x, y)) {
    const r = useStation(G, 'wok');
    noteTutorial(G, 'wok', r);
    return r;
  }
  if (pointIn(LAYOUT.grill, x, y)) {
    const r = useStation(G, 'grill');
    noteTutorial(G, 'grill', r);
    return r;
  }
  if (pointIn(LAYOUT.plate, x, y)) {
    const r = addToPlate(G);
    noteTutorial(G, 'plate', r);
    return r;
  }
  if (pointIn(LAYOUT.trash, x, y)) {
    clearPlate(G);
    return 'trash';
  }
  // Order tickets: serve the plate to the ticket clicked.
  const t = LAYOUT.tickets;
  const waiting = waitingOrders(G);
  for (let i = 0; i < waiting.length; i += 1) {
    const tx = t.x + i * (t.w + t.gap);
    if (x >= tx && x < tx + t.w && y >= t.y && y < t.y + t.h) {
      const r = serveTo(G, waiting[i]);
      if (r === 'served') noteTutorial(G, 'serve', r);
      return r;
    }
  }
  return 'none';
}

// Keyboard: number keys pick pantry items, letters drive stations.
export function keyAction(G, key) {
  if (G.screen !== 'play') return 'screen';
  const k = key.toLowerCase();
  if (k === 'a') return 'autopilot';
  if (k === 'm') return 'sound';
  if (k === 'p') {
    const r = addToPlate(G);
    noteTutorial(G, 'plate', r);
    return r;
  }
  if (k === 's') {
    const r = serveFirstMatch(G);
    if (r === 'served') noteTutorial(G, 'serve', r);
    return r;
  }
  if (k === 't') {
    clearPlate(G);
    return 'trash';
  }
  if (k === 'b') {
    const r = useStation(G, 'board');
    noteTutorial(G, 'board', r);
    return r;
  }
  if (k === 'w') {
    const r = useStation(G, 'wok');
    noteTutorial(G, 'wok', r);
    return r;
  }
  if (k === 'g') {
    const r = useStation(G, 'grill');
    noteTutorial(G, 'grill', r);
    return r;
  }
  const num = parseInt(k, 10);
  if (num >= 1 && num <= PANTRY_ORDER.length) {
    const ing = PANTRY_ORDER[num - 1];
    pickIngredient(G, ing);
    noteTutorial(G, 'pick', ing);
    return 'pick';
  }
  return 'none';
}

// The interactive tutorial on day one: each step waits for one action, then
// moves on. Steps are named by the action that completes them.
const TUTORIAL_STEPS = ['pick', 'wok', 'collect', 'plate', 'serve'];

export function tutorialText(G) {
  const step = TUTORIAL_STEPS[G.tutorial.step] || 'done';
  if (step === 'pick') return 'Langkah 1/5 — Klik NASI di rak bahan (kiri).';
  if (step === 'wok') return 'Langkah 2/5 — Klik WAJAN untuk memasak nasi.';
  if (step === 'collect') return 'Langkah 3/5 — Tunggu sampai matang, lalu klik WAJAN lagi untuk mengambilnya.';
  if (step === 'plate') return 'Langkah 4/5 — Klik PIRING untuk meletakkan nasi.';
  if (step === 'serve') return 'Langkah 5/5 — Tambah Telur + Sayur ke piring, lalu klik PESANAN untuk menyajikan!';
  return '';
}

function noteTutorial(G, action, detail) {
  if (!G.tutorial.on || G.tutorial.done) return;
  const step = TUTORIAL_STEPS[G.tutorial.step];
  if (!step) {
    G.tutorial.done = true;
    return;
  }
  if (step === 'pick' && action === 'pick' && detail === 'nasi') {
    G.tutorial.step += 1;
    sfx('click');
  } else if (step === 'wok' && action === 'wok' && detail === 'started') {
    G.tutorial.step += 1;
    sfx('click');
  } else if (step === 'collect' && action === 'wok' && detail === 'collected') {
    G.tutorial.step += 1;
    sfx('click');
  } else if (step === 'plate' && action === 'plate' && detail === 'added') {
    G.tutorial.step += 1;
    sfx('click');
  } else if (step === 'serve' && action === 'serve') {
    G.tutorial.step += 1;
    G.tutorial.done = true;
    sfx('levelup');
  }
}
