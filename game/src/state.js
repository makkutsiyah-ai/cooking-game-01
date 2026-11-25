// Warung Kilat — game state.
// One job: build a fresh game, start a day, and hold every mutable fact about
// a run (orders, stations, plate, hands, score, combo, tutorial) in one place.

import { DAYS, RUSH, CHALLENGES } from './config.js';
import { makeRng } from './random.js';

let orderSeq = 0;

export function emptyStation() {
  return { item: null, t: 0, dur: 0, done: false, byBimo: false };
}

export function createGame(mode, dayIndex, challenge) {
  const day = mode === 'career' ? DAYS[dayIndex] : RUSH;
  const seed = 20261125 + dayIndex * 7919 + (mode === 'rush' ? 13 : 0);
  const G = {
    screen: 'menu', // menu | play | pause | dayend | gameover
    mode, // 'career' | 'rush'
    dayIndex,
    day,
    challenge: challenge || 'none',
    challengeDef: CHALLENGES[challenge || 'none'],
    seed,
    rng: makeRng(seed),
    time: 0,
    timeLeft: day.time,
    coins: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    comboTimer: 0,
    mistakes: 0,
    hearts: 3,
    served: 0,
    lost: 0,
    tips: 0,
    orders: [],
    nextOrderIn: 2.5,
    stations: { board: emptyStation(), wok: emptyStation(), grill: emptyStation() },
    plate: [], // [{ id, cooked }]
    hands: [], // [{ id, cooked }]
    chef: { x: 560, y: 540, tx: 560, ty: 540, dir: 1, bob: 0, busy: null },
    bimo: { on: false, x: 327, y: 470, tx: 327, ty: 470, dir: 1, bob: 0, working: null },
    sousChef: false, // Bimo the helper, toggled from the menu / top bar
    autopilot: false,
    aiTick: 0,
    aiLog: '',
    tutorial: { on: mode === 'career' && dayIndex === 0, step: 0, done: false },
    showHelp: false,
    showBook: false,
    frozen: false, // screenshot staging freezes the clock
    muted: false,
    effects: [], // floating texts and steam puffs
    particles: [],
    shake: 0,
    flash: null,
    dayResult: null, // { won, coins, served, lost, bestCombo }
    menuSel: { mode: 'career', day: 0, challenge: 'none' },
    stats: { picked: 0, cooked: 0, chopped: 0, served: 0 },
  };
  return G;
}

export function nextOrderId() {
  orderSeq += 1;
  return orderSeq;
}

// Start (or restart) the day this game object already holds.
export function startDay(G) {
  G.screen = 'play';
  G.time = 0;
  G.timeLeft = G.day.time;
  G.coins = 0;
  G.score = 0;
  G.combo = 0;
  G.bestCombo = 0;
  G.comboTimer = 0;
  G.mistakes = 0;
  G.hearts = 3;
  G.served = 0;
  G.lost = 0;
  G.tips = 0;
  G.orders = [];
  G.nextOrderIn = 2.0;
  G.stations = { board: emptyStation(), wok: emptyStation(), grill: emptyStation() };
  G.plate = [];
  G.hands = [];
  G.chef.x = 560;
  G.chef.y = 540;
  G.chef.tx = 560;
  G.chef.ty = 540;
  G.effects = [];
  G.particles = [];
  G.tutorial.step = 0;
  G.tutorial.done = !(G.tutorial.on);
  G.dayResult = null;
  G.autopilot = false;
  G.aiTick = 0;
}

// Coins earned for a serve, before tip: dish price times the combo multiplier.
export function comboMultiplier(G) {
  return Math.min(2, 1 + G.combo * 0.1);
}

// Push a floating "+120" style note above a point on the canvas.
export function addEffect(G, x, y, text, color) {
  G.effects.push({ x, y, text, color: color || '#2a7f7f', t: 0, dur: 1.4 });
  if (G.effects.length > 24) G.effects.shift();
}

export function addParticles(G, x, y, color, n) {
  for (let i = 0; i < n; i += 1) {
    G.particles.push({
      x: x + (G.rng.next() - 0.5) * 36,
      y: y + (G.rng.next() - 0.5) * 12,
      vx: (G.rng.next() - 0.5) * 30,
      vy: -18 - G.rng.next() * 30,
      r: 2 + G.rng.next() * 4,
      color,
      t: 0,
      dur: 0.9 + G.rng.next() * 0.6,
    });
  }
  if (G.particles.length > 160) G.particles.splice(0, G.particles.length - 160);
}
