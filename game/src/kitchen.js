// Warung Kilat — the kitchen: stations, plate and hands.
// One job: every rule about picking up, processing and plating food.
// An item is { id, cooked }: raw from the pantry, cooked once its station
// finishes it (ingredients with no station are ready as picked).

import { INGREDIENTS, PLATE_MAX, HANDS_MAX } from './config.js';
import { addEffect, addParticles } from './state.js';
import { waitingOrders } from './orders.js';
import { sfx } from './audio.js';

// Does this ingredient still need processing before it can be plated?
export function needsProcessing(id) {
  return INGREDIENTS[id].station !== null;
}

export function stationOf(id) {
  return INGREDIENTS[id].station;
}

// Is this item ready to go on a plate?
export function isReady(item) {
  if (!item) return false;
  return item.cooked || !needsProcessing(item.id);
}

// Tick the three stations: advance processing, ding when a dish is ready.
export function updateStations(G, dt) {
  if (G.frozen) return;
  for (const key of ['board', 'wok', 'grill']) {
    const st = G.stations[key];
    if (st.item && !st.done) {
      st.t += dt;
      if (st.t >= st.dur) {
        st.done = true;
        st.item.cooked = true;
        sfx('ready');
        addEffect(G, stationCenter(key).x, stationCenter(key).y - 60, 'Matang!', '#2a7f7f');
      }
    }
  }
}

export function stationCenter(key) {
  if (key === 'board') return { x: 327, y: 365 };
  if (key === 'wok') return { x: 547, y: 365 };
  return { x: 767, y: 365 }; // grill
}

// Pick a raw ingredient from the pantry into the chef's hands.
export function pickIngredient(G, id) {
  if (G.hands.length >= HANDS_MAX) {
    sfx('error');
    addEffect(G, 120, 640, 'Tangan penuh!', '#d94f30');
    return false;
  }
  G.hands.push({ id, cooked: false });
  G.stats.picked += 1;
  G.chef.tx = 150;
  G.chef.ty = 480;
  sfx('pick');
  return true;
}

// Use a station: place a matching raw item from the hands, or collect a
// finished one back into the hands. Returns what happened.
export function useStation(G, key) {
  const st = G.stations[key];
  G.chef.tx = { board: 327, wok: 547, grill: 767 }[key];
  G.chef.ty = 470;
  if (st.item && st.done) {
    // Collect the finished component.
    if (G.hands.length >= HANDS_MAX) {
      sfx('error');
      addEffect(G, 997, 620, 'Tangan penuh — kosongkan dulu', '#d94f30');
      return 'hands-full';
    }
    const item = st.item;
    st.item = null;
    st.t = 0;
    st.dur = 0;
    st.done = false;
    st.byBimo = false;
    G.hands.push(item);
    sfx('pick');
    return 'collected';
  }
  if (st.item && !st.done) {
    sfx('click');
    return 'busy';
  }
  // Station is empty: find a hand item this station can process.
  const idx = G.hands.findIndex((h) => !h.cooked && stationOf(h.id) === key);
  if (idx < 0) {
    sfx('error');
    addEffect(G, stationCenter(key).x, stationCenter(key).y + 80, 'Bukan di sini', '#d94f30');
    return 'nothing';
  }
  const item = G.hands.splice(idx, 1)[0];
  st.item = item;
  st.t = 0;
  st.dur = INGREDIENTS[item.id].time;
  st.done = false;
  st.byBimo = false;
  if (key === 'board') {
    G.stats.chopped += 1;
    sfx('chop');
  } else {
    G.stats.cooked += 1;
    sfx('sizzle');
    addParticles(G, stationCenter(key).x, stationCenter(key).y - 20, '#dddddd', 6);
  }
  return 'started';
}

// Put a ready component from the hands onto the plate. With no index given,
// the first ready component some waiting order needs (and the plate does not
// already hold) is used; anything else in the hands is left alone, so a
// stale component can never sneak onto the plate ahead of a needed one.
export function addToPlate(G, wantIdx = -1) {
  G.chef.tx = 1030;
  G.chef.ty = 470;
  let idx = wantIdx;
  if (idx < 0 || idx >= G.hands.length || !isReady(G.hands[idx])) {
    idx = G.hands.findIndex(
      (h) =>
        isReady(h) &&
        waitingOrders(G).some((o) => o.parts.includes(h.id) && !G.plate.some((p) => p.id === h.id)),
    );
  }
  if (idx < 0) {
    if (G.hands.some((h) => isReady(h))) {
      sfx('error');
      addEffect(G, 997, 470, 'Tidak ada pesanan yang butuh ini', '#d94f30');
      return 'unneeded';
    }
    if (G.hands.length) {
      sfx('error');
      addEffect(G, 997, 470, 'Masih mentah — masak dulu!', '#d94f30');
      return 'raw';
    }
    sfx('click');
    return 'empty';
  }
  const item = G.hands[idx];
  if (G.plate.length >= PLATE_MAX) {
    sfx('error');
    addEffect(G, 997, 470, 'Piring penuh!', '#d94f30');
    return 'full';
  }
  G.hands.splice(idx, 1);
  G.plate.push(item);
  sfx('place');
  addParticles(G, 997, 365, '#ffd23f', 5);
  return 'added';
}

// Empty the plate and the hands into the bin (no penalty, just lost work).
export function clearPlate(G) {
  if (!G.plate.length && !G.hands.length) return false;
  G.plate = [];
  G.hands = [];
  sfx('click');
  return true;
}

// Which parts of this order are not on the plate yet (wherever they are:
// in the hands, on a station, or still in the pantry)? The autopilot plates
// from this list; `missingFor` answers a different question — which parts
// are not secured anywhere at all.
export function plateMissing(G, order) {
  const onPlate = {};
  for (const p of G.plate) onPlate[p.id] = (onPlate[p.id] || 0) + 1;
  const need = {};
  for (const part of order.parts) need[part] = (need[part] || 0) + 1;
  const missing = [];
  for (const part of Object.keys(need)) {
    if ((onPlate[part] || 0) < need[part]) missing.push(part);
  }
  return missing;
}

// Which components is the kitchen still missing for the oldest waiting order?
// "Have" means on the plate, ready in the hands, or still cooking at a
// station. A finished item sitting on a station is NOT counted as have: it
// still has to be collected, and until it is, its station stays blocked.
export function missingFor(G, order) {
  const have = {};
  for (const p of G.plate) have[p.id] = (have[p.id] || 0) + 1;
  for (const h of G.hands) {
    if (isReady(h)) have[h.id] = (have[h.id] || 0) + 1;
  }
  for (const key of ['board', 'wok', 'grill']) {
    const st = G.stations[key];
    if (st.item && !st.done) have[st.item.id] = (have[st.item.id] || 0) + 1;
  }
  const need = {};
  for (const part of order.parts) need[part] = (need[part] || 0) + 1;
  const missing = [];
  for (const part of Object.keys(need)) {
    if ((have[part] || 0) < need[part]) missing.push(part);
  }
  return missing;
}
