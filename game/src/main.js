// Warung Kilat — bootstrap and game loop.
// One job: own the canvas, the frame loop, and the screens. The rules live in
// orders.js and kitchen.js, the drawing in render.js, the input in input.js;
// this file only wires them together and keeps time.

import { W, H } from './config.js';
import { createGame, startDay } from './state.js';
import { updateOrders, endDay } from './orders.js';
import { updateStations } from './kitchen.js';
import { updateChef } from './chef.js';
import { updateSousChef, updateAutopilot } from './ai.js';
import { draw } from './render.js';
import { handleMenuClick, handlePlayClick, handleOverlayClick, handleKey } from './input.js';
import { applyShot } from './shots.js';
import { sfx } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let G = createGame('career', 0, 'none');
G.sousChef = true;

// Screenshot staging: ?shot=board|assembly|serve|ai freezes a staged kitchen.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  G = createGame('career', 2, 'none');
  G.sousChef = true;
  startDay(G);
  applyShot(G, shot);
}

function startNew(req) {
  G = createGame(req.mode, req.day, req.challenge);
  G.sousChef = true;
  startDay(G);
  if (req.autopilot) {
    G.autopilot = true;
    G.sousChef = true;
  }
}

function endButtons() {
  if (G.screen === 'dayend') {
    if (G.mode === 'career' && G.dayIndex < 4) return ['Hari Berikutnya', 'Ulangi Hari', 'Menu'];
    return ['Main Lagi', 'Menu'];
  }
  return ['Coba Lagi', 'Menu'];
}

function endAction(label) {
  if (label === 'Menu') {
    G = createGame('career', 0, 'none');
    G.sousChef = true;
    return;
  }
  if (label === 'Hari Berikutnya') {
    startNew({ mode: 'career', day: G.dayIndex + 1, challenge: 'none', autopilot: false });
    return;
  }
  if (label === 'Ulangi Hari' || label === 'Coba Lagi') {
    startNew({ mode: G.mode, day: G.dayIndex, challenge: G.challenge, autopilot: false });
    return;
  }
  if (label === 'Main Lagi') {
    startNew({ mode: G.mode, day: G.dayIndex, challenge: G.challenge, autopilot: false });
  }
}

function toCanvas(ev) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - rect.left) * (W / rect.width),
    y: (ev.clientY - rect.top) * (H / rect.height),
  };
}

canvas.addEventListener('click', (ev) => {
  const { x, y } = toCanvas(ev);
  if (G.showHelp) {
    if (handleOverlayClick(G, x, y, ['Tutup'])) G.showHelp = false;
    return;
  }
  if (G.showBook) {
    G.showBook = false;
    return;
  }
  if (G.screen === 'menu') {
    const req = handleMenuClick(G, x, y);
    if (req) startNew(req);
    return;
  }
  if (G.screen === 'pause') {
    const label = handleOverlayClick(G, x, y, ['Lanjut', 'Menu']);
    if (label === 'Lanjut') G.screen = 'play';
    else if (label === 'Menu') {
      G = createGame('career', 0, 'none');
      G.sousChef = true;
    }
    return;
  }
  if (G.screen === 'dayend' || G.screen === 'gameover') {
    const label = handleOverlayClick(G, x, y, endButtons());
    if (label) endAction(label);
    return;
  }
  if (G.screen === 'play') handlePlayClick(G, x, y);
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === ' ' || ev.key.startsWith('Arrow')) ev.preventDefault();
  const req = handleKey(G, ev.key);
  if (req) startNew(req);
});

// The frame loop: fixed-ish step, timers only while playing and unfrozen.
let last = performance.now();
let lastWholeSecond = -1;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (G.screen === 'play' && !G.frozen) {
    G.time += dt;
    G.timeLeft -= dt;
    if (G.timeLeft <= 10) {
      const whole = Math.ceil(G.timeLeft);
      if (whole !== lastWholeSecond && whole > 0) {
        lastWholeSecond = whole;
        sfx('tick');
      }
    }
    if (G.timeLeft <= 0) {
      G.timeLeft = 0;
      endDay(G, G.mode === 'rush' ? true : G.coins >= G.day.goal);
    }
    if (G.comboTimer > 0) {
      G.comboTimer -= dt;
      if (G.comboTimer <= 0) G.combo = 0;
    }
    updateOrders(G, dt);
    updateStations(G, dt);
    updateChef(G, dt);
    updateSousChef(G, dt);
    updateAutopilot(G, dt);
    for (const e of G.effects) e.t += dt;
    G.effects = G.effects.filter((e) => e.t < e.dur);
    for (const p of G.particles) {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    G.particles = G.particles.filter((p) => p.t < p.dur);
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 1.5);
  } else if (G.screen === 'play' && G.frozen) {
    // Staged screenshots still animate the chef's idle bob, not the clock.
    updateChef(G, dt);
  }
  draw(ctx, G);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Test hook: the play-test drives the game through this, never through the DOM.
window.__game = {
  get state() {
    return G;
  },
  start: startNew,
  version: 1,
};
