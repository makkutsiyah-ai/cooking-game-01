// Warung Kilat — the AI: Bimo the sous-chef and the autopilot.
// One job: decide what the kitchen's AI does. Bimo chops what the oldest
// order needs and carries it to the plate; the autopilot plays the whole game
// with the same actions the player has (pick, cook, plate, serve).

import { INGREDIENTS, HANDS_MAX } from './config.js';
import { stationOf, isReady, missingFor, plateMissing, pickIngredient, useStation, addToPlate, clearPlate } from './kitchen.js';
import { oldestOrder, waitingOrders, serveTo, matchingOrder } from './orders.js';
import { sfx } from './audio.js';

// Bimo works the chopping board: he takes the oldest order's missing chopped
// ingredient, chops it, and carries it straight to the plate.
export function updateSousChef(G, dt) {
  if (!G.sousChef || G.screen !== 'play' || G.frozen) return;
  const bimo = G.bimo;
  const order = oldestOrder(G);
  if (!order) return;
  const missing = missingFor(G, order);
  // Bimo only handles board work (sayur, cabai).
  const chopNeed = missing.find((id) => stationOf(id) === 'board');
  const board = G.stations.board;
  if (bimo.working) {
    // Carrying a chopped item to the plate.
    bimo.tx = 1030;
    bimo.ty = 470;
    if (Math.hypot(bimo.x - 1030, bimo.y - 470) < 24) {
      G.plate.push(bimo.working);
      bimo.working = null;
      sfx('place');
    }
    return;
  }
  if (board.item && board.done && board.byBimo) {
    // Pick up his finished chopping.
    bimo.working = board.item;
    board.item = null;
    board.t = 0;
    board.dur = 0;
    board.done = false;
    board.byBimo = false;
    return;
  }
  if (!board.item && chopNeed) {
    // Start chopping: Bimo is slower than the player (1.4x time).
    board.item = { id: chopNeed, cooked: false };
    board.t = 0;
    board.dur = INGREDIENTS[chopNeed].time * 1.4;
    board.done = false;
    board.byBimo = true;
    bimo.tx = 327;
    bimo.ty = 470;
    sfx('chop');
  }
}

// The autopilot plays with the player's own actions, one decision per tick.
// Greedy and honest: oldest order first, longest job first.
export function updateAutopilot(G, dt) {
  if (!G.autopilot || G.screen !== 'play' || G.frozen) return;
  G.aiTick -= dt;
  if (G.aiTick > 0) return;
  G.aiTick = 0.18;
  const order = oldestOrder(G);
  if (!order) {
    G.aiLog = 'Menunggu pesanan…';
    return;
  }
  const missing = missingFor(G, order);
  const waiting = waitingOrders(G);
  const wanted = new Set();
  for (const o of waiting) for (const p of o.parts) wanted.add(p);

  // 0. A finished item no waiting order needs blocks its station forever, so
  // clear it: collect it (when the plate is empty, so the bin cannot eat a
  // good dish) and throw it away.
  if (!G.plate.length) {
    for (const key of ['board', 'wok', 'grill']) {
      const st = G.stations[key];
      if (st.item && st.done && !wanted.has(st.item.id) && G.hands.length < HANDS_MAX) {
        useStation(G, key);
        clearPlate(G);
        G.aiLog = 'Membuang bahan basi…';
        return;
      }
    }
  }

  // 1. A station finished something some waiting order needs: collect it.
  for (const key of ['board', 'wok', 'grill']) {
    const st = G.stations[key];
    if (st.item && st.done && wanted.has(st.item.id) && G.hands.length < HANDS_MAX) {
      const doneId = st.item.id;
      useStation(G, key);
      G.aiLog = `Mengambil ${INGREDIENTS[doneId].name} matang`;
      return;
    }
  }
  // 2. A ready item in hand belongs on the plate (it is part of this order
  // and not on the plate yet). Plate that exact item, not the first ready
  // one — the hands may also hold a stale component for another dish.
  const plateNeed = plateMissing(G, order);
  const readyIdx = G.hands.findIndex((h) => isReady(h) && plateNeed.includes(h.id));
  if (readyIdx >= 0) {
    addToPlate(G, readyIdx);
    G.aiLog = 'Merakit di piring…';
    return;
  }
  // 3. The plate completes an order: serve it.
  const match = matchingOrder(G);
  if (match) {
    serveTo(G, match);
    G.aiLog = `Menyajikan ${match.dish}!`;
    return;
  }
  // 4. Start the longest missing job on an idle station.
  const byTime = missing.slice().sort((a, b) => INGREDIENTS[b].time - INGREDIENTS[a].time);
  for (const id of byTime) {
    const station = stationOf(id);
    if (!station) continue; // ready ingredients are picked below
    if (G.stations[station].item) continue; // station busy
    const handIdx = G.hands.findIndex((h) => h.id === id && !h.cooked);
    if (handIdx >= 0) {
      useStation(G, station);
      G.aiLog = `Memasak ${INGREDIENTS[id].name}…`;
      return;
    }
    if (G.hands.length < HANDS_MAX) {
      pickIngredient(G, id);
      G.aiLog = `Mengambil ${INGREDIENTS[id].name}`;
      return;
    }
  }
  // 5. Pick a ready ingredient the order needs.
  for (const id of missing) {
    if (!stationOf(id) && G.hands.length < HANDS_MAX) {
      pickIngredient(G, id);
      G.aiLog = `Mengambil ${INGREDIENTS[id].name}`;
      return;
    }
  }
  // 6. Nothing to do right now: clear a plate that cannot become any dish.
  // A partial plate that is still a subset of some waiting order's recipe
  // is kept — the next order often wants the same dish.
  if (G.plate.length && !waitingOrders(G).some((o) => G.plate.every((p) => o.parts.includes(p.id)))) {
    G.plate = [];
    G.aiLog = 'Membersihkan piring…';
  }
}
