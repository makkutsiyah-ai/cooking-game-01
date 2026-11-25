// Warung Kilat — screenshot staging.
// One job: put the kitchen into a fixed, readable state for each screenshot
// (?shot=board|assembly|serve|ai) and freeze the clock, so the capture is
// deterministic. The staged states are built from the game's own rules:
// real orders, real stations, real plates — never a mockup.

import { addEffect } from './state.js';

function makeOrder(G, dish, patienceFrac) {
  const max = G.day.patience;
  return {
    id: 9000 + Math.floor(G.rng.next() * 900),
    dish,
    parts: dish === 'Nasi Goreng' ? ['nasi', 'telur', 'sayur']
      : dish === 'Mie Goreng' ? ['mie', 'ayam', 'sayur']
      : dish === 'Sate Ayam' ? ['ayam', 'kacang', 'cabai']
      : ['sayur', 'telur', 'kacang'],
    patience: max * patienceFrac,
    maxPatience: max,
    state: 'waiting',
    born: 0,
  };
}

export const SHOT_NAMES = ['board', 'assembly', 'serve', 'ai'];

export function applyShot(G, name) {
  G.screen = 'play';
  G.frozen = true;
  G.time = 42;
  G.sousChef = name === 'ai';
  G.autopilot = name === 'ai';
  G.aiLog = name === 'ai' ? 'Memasak Nasi…' : '';
  G.tutorial.on = false;
  G.tutorial.done = true;
  G.orders = [];
  G.plate = [];
  G.hands = [];
  G.stations.board = { item: null, t: 0, dur: 0, done: false, byBimo: false };
  G.stations.wok = { item: null, t: 0, dur: 0, done: false, byBimo: false };
  G.stations.grill = { item: null, t: 0, dur: 0, done: false, byBimo: false };
  G.chef.x = 560;
  G.chef.y = 540;
  G.chef.tx = 560;
  G.chef.ty = 540;
  G.bimo.x = 327;
  G.bimo.y = 470;
  G.bimo.tx = 327;
  G.bimo.ty = 470;
  G.effects = [];
  G.particles = [];

  if (name === 'board') {
    // The full kitchen at work: three tickets, the wok mid-cook.
    G.coins = 120;
    G.score = 120;
    G.served = 2;
    G.combo = 2;
    G.timeLeft = 132;
    G.orders = [makeOrder(G, 'Nasi Goreng', 0.72), makeOrder(G, 'Mie Goreng', 0.55), makeOrder(G, 'Sate Ayam', 0.85)];
    G.stations.wok = { item: { id: 'nasi', cooked: false }, t: 1.25, dur: 2.5, done: false, byBimo: false };
    G.chef.x = 547;
    G.chef.y = 470;
    G.chef.tx = 547;
    G.chef.ty = 470;
  } else if (name === 'assembly') {
    // A dish mid-assembly: two parts on the plate, two stations cooking.
    G.coins = 240;
    G.score = 240;
    G.served = 4;
    G.combo = 3;
    G.timeLeft = 104;
    G.orders = [makeOrder(G, 'Nasi Goreng', 0.6), makeOrder(G, 'Mie Goreng', 0.8), makeOrder(G, 'Gado-Gado', 0.45)];
    G.plate = [{ id: 'nasi', cooked: true }, { id: 'telur', cooked: true }];
    G.stations.wok = { item: { id: 'mie', cooked: false }, t: 1.5, dur: 2.5, done: false, byBimo: false };
    G.stations.grill = { item: { id: 'ayam', cooked: false }, t: 1.4, dur: 3.5, done: false, byBimo: false };
    G.hands = [{ id: 'sayur', cooked: false }];
    G.chef.x = 1030;
    G.chef.y = 470;
    G.chef.tx = 1030;
    G.chef.ty = 470;
  } else if (name === 'serve') {
    // A finished plate, the matching ticket, the bell ready to ring.
    G.coins = 360;
    G.score = 360;
    G.served = 6;
    G.combo = 4;
    G.timeLeft = 98;
    G.orders = [makeOrder(G, 'Nasi Goreng', 0.66), makeOrder(G, 'Mie Goreng', 0.5), makeOrder(G, 'Sate Ayam', 0.78)];
    G.plate = [{ id: 'nasi', cooked: true }, { id: 'telur', cooked: true }, { id: 'sayur', cooked: true }];
    addEffect(G, 997, 340, '+120 koin', '#c77f1d');
    G.chef.x = 1030;
    G.chef.y = 470;
    G.chef.tx = 1030;
    G.chef.ty = 470;
  } else if (name === 'ai') {
    // Autopilot on: Bimo chops at the board, the wok cooks, four tickets wait.
    G.coins = 480;
    G.score = 480;
    G.served = 8;
    G.combo = 5;
    G.timeLeft = 76;
    G.orders = [makeOrder(G, 'Nasi Goreng', 0.7), makeOrder(G, 'Mie Goreng', 0.58), makeOrder(G, 'Sate Ayam', 0.82), makeOrder(G, 'Gado-Gado', 0.4)];
    G.stations.board = { item: { id: 'sayur', cooked: false }, t: 1.26, dur: 2.1, done: false, byBimo: true };
    G.stations.wok = { item: { id: 'nasi', cooked: false }, t: 0.75, dur: 2.5, done: false, byBimo: false };
    G.stations.grill = { item: { id: 'ayam', cooked: false }, t: 2.1, dur: 3.5, done: false, byBimo: false };
    G.chef.x = 767;
    G.chef.y = 470;
    G.chef.tx = 767;
    G.chef.ty = 470;
    G.bimo.x = 327;
    G.bimo.y = 470;
    G.bimo.tx = 327;
    G.bimo.ty = 470;
  }
}
