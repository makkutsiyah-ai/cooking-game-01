// Warung Kilat — orders.
// One job: spawn tickets, drain patience, price a serve, and score it.
// An order is a dish a customer wants, with the patience to wait for it.

import { RECIPES, COMBO_WINDOW, COMBO_STEP, COMBO_CAP, TIP_MAX } from './config.js';
import { nextOrderId, addEffect } from './state.js';
import { sfx } from './audio.js';

export function spawnInterval(G) {
  let base = G.day.spawn;
  if (G.challenge === 'rushhour') base *= 0.55;
  return base;
}

export function spawnOrder(G) {
  const menu = G.day.recipes;
  const dish = menu[Math.floor(G.rng.next() * menu.length)];
  const patience = G.day.patience * (0.9 + G.rng.next() * 0.2);
  const order = {
    id: nextOrderId(),
    dish,
    parts: RECIPES[dish].parts.slice(),
    patience,
    maxPatience: patience,
    state: 'waiting', // waiting | served | lost
    born: G.time,
  };
  G.orders.push(order);
  return order;
}

// Tick the order board: spawn new tickets, drain patience, drop timed-out ones.
export function updateOrders(G, dt) {
  if (G.frozen) return;
  G.nextOrderIn -= dt;
  if (G.nextOrderIn <= 0 && G.orders.filter((o) => o.state === 'waiting').length < G.day.maxOrders) {
    spawnOrder(G);
    G.nextOrderIn = spawnInterval(G) * (0.8 + G.rng.next() * 0.4);
  }
  for (const order of G.orders) {
    if (order.state !== 'waiting') continue;
    order.patience -= dt;
    if (order.patience <= 0) {
      order.state = 'lost';
      order.patience = 0;
      G.lost += 1;
      G.combo = 0;
      G.comboTimer = 0;
      G.hearts -= 1;
      sfx('lost');
      addEffect(G, 640, 120, 'Pesanan hangus!', '#d94f30');
      if (G.hearts <= 0) {
        endDay(G, false);
      }
    }
  }
  // Prune finished tickets once their exit animation would be done.
  G.orders = G.orders.filter((o) => o.state === 'waiting' || G.time - (o.doneAt || 0) < 1.2);
}

export function waitingOrders(G) {
  return G.orders.filter((o) => o.state === 'waiting');
}

export function oldestOrder(G) {
  const list = waitingOrders(G);
  return list.length ? list[0] : null;
}

// The plate's components, as a sorted list of ids, for recipe matching.
export function plateKey(plate) {
  return plate.map((p) => p.id).sort().join('+');
}

export function recipeKey(dish) {
  return RECIPES[dish].parts.slice().sort().join('+');
}

// Which waiting order (if any) does this plate complete?
export function matchingOrder(G) {
  const key = plateKey(G.plate);
  if (!key) return null;
  return waitingOrders(G).find((o) => recipeKey(o.dish) === key) || null;
}

// Serve the plate to one ticket. Returns 'served' | 'wrong' | 'empty'.
export function serveTo(G, order) {
  if (!G.plate.length) return 'empty';
  if (!order || order.state !== 'waiting') return 'empty';
  if (recipeKey(order.dish) !== plateKey(G.plate)) {
    // Wrong dish for this customer: the plate goes in the bin.
    G.plate = [];
    G.mistakes += 1;
    G.combo = 0;
    G.comboTimer = 0;
    G.shake = 0.35;
    sfx('error');
    addEffect(G, 997, 420, 'Salah pesanan!', '#d94f30');
    if (G.challenge === 'nomistake' && G.mistakes >= 3) {
      endDay(G, false);
    }
    return 'wrong';
  }
  const mult = Math.min(COMBO_CAP, 1 + G.combo * COMBO_STEP);
  const base = RECIPES[order.dish].price;
  const tip = Math.round(base * TIP_MAX * (order.patience / order.maxPatience));
  const earned = Math.round((base + tip) * mult);
  order.state = 'served';
  order.doneAt = G.time;
  G.coins += earned;
  G.score += earned;
  G.tips += tip;
  G.served += 1;
  G.stats.served += 1;
  G.combo += 1;
  if (G.combo > G.bestCombo) G.bestCombo = G.combo;
  G.comboTimer = COMBO_WINDOW;
  G.plate = [];
  sfx('serve');
  sfx('coin');
  addEffect(G, 997, 420, `+${earned} koin`, '#c77f1d');
  if (tip > 0) addEffect(G, 997, 448, `termasuk tip ${tip}`, '#2a7f7f');
  return 'served';
}

// Serve the plate to the first ticket it matches, if any.
export function serveFirstMatch(G) {
  const order = matchingOrder(G);
  if (!order) {
    if (G.plate.length) {
      sfx('error');
      addEffect(G, 997, 420, 'Tidak ada pesanan yang cocok', '#d94f30');
    }
    return 'empty';
  }
  return serveTo(G, order);
}

export function endDay(G, won) {
  if (G.screen !== 'play') return;
  G.screen = won ? 'dayend' : 'gameover';
  G.dayResult = {
    won,
    coins: G.coins,
    goal: G.day.goal,
    served: G.served,
    lost: G.lost,
    bestCombo: G.bestCombo,
    tips: G.tips,
  };
  if (won) sfx('levelup');
}
