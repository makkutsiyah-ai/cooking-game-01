// Warung Kilat — input: mouse and keyboard.
// One job: turn clicks and keys into game actions, per screen. The kitchen
// clicks live in chef.js; this file owns the menu, pause and end screens.

import { LAYOUT, DAYS } from './config.js';
import { clickAt, keyAction, pointIn } from './chef.js';
import { setMuted } from './audio.js';

// Overlay buttons are drawn by render.js at these rectangles; the same
// geometry is used here to hit-test them.
export function overlayButtonRect(i, n) {
  const bx = 640 - ((n - 1) * 130) / 2 + i * 260 - 110;
  return { x: bx, y: 450, w: 220, h: 48 };
}

// Menu clicks. Returns a start request { mode, day, challenge, autopilot }
// when the player hits MULAI or the Autopilot demo, otherwise null.
export function handleMenuClick(G, x, y) {
  const m = LAYOUT.menu;
  if (pointIn(m.careerCard, x, y)) {
    G.menuSel.mode = 'career';
    return null;
  }
  if (pointIn(m.rushCard, x, y)) {
    G.menuSel.mode = 'rush';
    return null;
  }
  if (G.menuSel.mode === 'career') {
    const d = m.dayButtons;
    for (let i = 0; i < DAYS.length; i += 1) {
      if (pointIn({ x: d.x + i * (d.w + d.gap), y: d.y, w: d.w, h: d.h }, x, y)) {
        G.menuSel.day = i;
        return null;
      }
    }
  } else {
    const c = m.challengeButtons;
    const keys = ['none', 'rushhour', 'nomistake', 'mystery'];
    for (let i = 0; i < keys.length; i += 1) {
      if (pointIn({ x: c.x + i * (c.w + c.gap), y: c.y, w: c.w, h: c.h }, x, y)) {
        G.menuSel.challenge = keys[i];
        return null;
      }
    }
  }
  if (pointIn(m.startBtn, x, y)) {
    return {
      mode: G.menuSel.mode,
      day: G.menuSel.mode === 'career' ? G.menuSel.day : 0,
      challenge: G.menuSel.mode === 'rush' ? G.menuSel.challenge : 'none',
      autopilot: false,
    };
  }
  if (pointIn(m.demoBtn, x, y)) {
    return { mode: 'rush', day: 0, challenge: 'none', autopilot: true };
  }
  if (pointIn(m.helpBtn, x, y)) {
    G.showHelp = true;
    return null;
  }
  return null;
}

// Play-screen clicks: top-bar buttons first, then the kitchen itself.
export function handlePlayClick(G, x, y) {
  if (pointIn(LAYOUT.buttons.sound, x, y)) {
    G.muted = !G.muted;
    setMuted(G.muted);
    return 'sound';
  }
  if (pointIn(LAYOUT.buttons.pause, x, y)) {
    G.screen = 'pause';
    return 'pause';
  }
  if (pointIn(LAYOUT.buttons.autopilot, x, y)) {
    G.autopilot = !G.autopilot;
    return 'autopilot';
  }
  return clickAt(G, x, y);
}

// Overlay clicks (pause, help, book, day-end): return the label hit, or null.
export function handleOverlayClick(G, x, y, labels) {
  for (let i = 0; i < labels.length; i += 1) {
    if (pointIn(overlayButtonRect(i, labels.length), x, y)) return labels[i];
  }
  return null;
}

// Keyboard. Returns a start request when Enter is pressed on the menu.
export function handleKey(G, key) {
  if (key === 'Enter' && G.screen === 'menu' && !G.showHelp) {
    return {
      mode: G.menuSel.mode,
      day: G.menuSel.mode === 'career' ? G.menuSel.day : 0,
      challenge: G.menuSel.mode === 'rush' ? G.menuSel.challenge : 'none',
      autopilot: false,
    };
  }
  if (G.showHelp) {
    if (key === 'Escape' || key.toLowerCase() === 'h') G.showHelp = false;
    return null;
  }
  if (G.showBook) {
    if (key === 'Escape' || key.toLowerCase() === 'r') G.showBook = false;
    return null;
  }
  if (key === 'Escape') {
    if (G.screen === 'play') G.screen = 'pause';
    else if (G.screen === 'pause') G.screen = 'play';
    return null;
  }
  if (G.screen !== 'play') return null;
  const k = key.toLowerCase();
  if (k === 'h') {
    G.showHelp = true;
    return null;
  }
  if (k === 'r') {
    G.showBook = true;
    return null;
  }
  const action = keyAction(G, key);
  if (action === 'sound') {
    G.muted = !G.muted;
    setMuted(G.muted);
  } else if (action === 'autopilot') {
    G.autopilot = !G.autopilot;
  }
  return null;
}
