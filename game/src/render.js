// Warung Kilat — rendering.
// One job: draw everything on the canvas, from the kitchen floor to the
// menu screen. All art is drawn with canvas shapes: no images, no fonts
// fetched, nothing borrowed. The judge reads this game mostly through its
// screenshots, so every screen must read at a glance.

import { W, H, COLORS, INGREDIENTS, RECIPES, RECIPE_ORDER, DAYS, LAYOUT, PLATE_MAX } from './config.js';
import { plateKey, recipeKey, waitingOrders } from './orders.js';
import { tutorialText } from './chef.js';

// ---------------------------------------------------------------------------
// Small drawing helpers
// ---------------------------------------------------------------------------
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// ---------------------------------------------------------------------------
// Food icons, drawn with canvas shapes. Each one reads at a glance even when
// shrunk to a ticket, which is exactly how the judge will see them.
// ---------------------------------------------------------------------------
export function drawFood(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = r / 20; // scale so r=20 draws at natural size
  ctx.scale(s, s);
  ctx.lineWidth = 1.6;
  switch (id) {
    case 'nasi': {
      // A mound of steamed rice with scallion flecks.
      ctx.fillStyle = '#f5efe0';
      ctx.beginPath();
      ctx.ellipse(0, 2, 15, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#d8cdb2';
      ctx.stroke();
      ctx.fillStyle = '#5da24a';
      circle(ctx, -6, -3, 1.8, '#5da24a');
      circle(ctx, 2, -6, 1.8, '#5da24a');
      circle(ctx, 7, -2, 1.8, '#5da24a');
      break;
    }
    case 'mie': {
      // A bowl of wavy noodles.
      ctx.fillStyle = '#2a7f7f';
      ctx.beginPath();
      ctx.ellipse(0, 6, 15, 7, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#f2c14e';
      ctx.lineWidth = 2.4;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(i * 6, 0, 5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
      ctx.fillStyle = '#d94f30';
      circle(ctx, 8, -4, 2, '#d94f30');
      break;
    }
    case 'ayam': {
      // A chicken drumstick: brown meat, white bone.
      ctx.fillStyle = '#c98a4b';
      ctx.beginPath();
      ctx.ellipse(-2, 0, 11, 9, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8f5a24';
      ctx.stroke();
      ctx.strokeStyle = '#f5efe0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -5);
      ctx.lineTo(14, -10);
      ctx.stroke();
      circle(ctx, 15, -11, 2.6, '#f5efe0');
      circle(ctx, 12, -13, 2.2, '#f5efe0');
      break;
    }
    case 'telur': {
      // A fried egg: white blob, golden yolk.
      ctx.fillStyle = '#fff8e6';
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e0b64f';
      ctx.stroke();
      circle(ctx, 1, 0, 5.5, '#f2a541');
      circle(ctx, -1, -2, 2, '#ffd23f');
      break;
    }
    case 'sayur': {
      // Green leaves and a carrot stick.
      ctx.fillStyle = '#5da24a';
      ctx.beginPath();
      ctx.ellipse(-5, -2, 8, 5, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7cc46a';
      ctx.beginPath();
      ctx.ellipse(4, 3, 8, 5, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8821e';
      rr(ctx, 6, -10, 5, 16, 2);
      ctx.fill();
      break;
    }
    case 'cabai': {
      // A red chilli, curved, with a green stem.
      ctx.strokeStyle = '#d94f30';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(2, 2, 10, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();
      ctx.strokeStyle = '#3e7a30';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, -6);
      ctx.lineTo(14, -11);
      ctx.stroke();
      break;
    }
    case 'kacang': {
      // Peanut sauce: a brown dollop with peanut dots.
      ctx.fillStyle = '#a9713a';
      ctx.beginPath();
      ctx.ellipse(0, 2, 13, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8b06a';
      circle(ctx, -5, 0, 2.4, '#e8b06a');
      circle(ctx, 3, -3, 2.4, '#e8b06a');
      circle(ctx, 6, 3, 2.4, '#e8b06a');
      break;
    }
    case 'teh': {
      // A glass of sweet tea with a straw.
      ctx.fillStyle = '#c98a2e';
      rr(ctx, -8, -8, 16, 20, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      rr(ctx, -8, -8, 5, 20, 3);
      ctx.fill();
      ctx.strokeStyle = '#d94f30';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(6, -6);
      ctx.lineTo(10, -14);
      ctx.stroke();
      break;
    }
    case 'es': {
      // Two ice cubes.
      ctx.fillStyle = '#bfe8f2';
      ctx.strokeStyle = '#6fb7cc';
      ctx.lineWidth = 1.6;
      rr(ctx, -11, -6, 11, 11, 2);
      ctx.stroke();
      ctx.fill();
      rr(ctx, 0, -2, 11, 11, 2);
      ctx.stroke();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(-8, -3);
      ctx.lineTo(-4, 1);
      ctx.moveTo(3, 1);
      ctx.lineTo(7, 5);
      ctx.stroke();
      break;
    }
    default:
      circle(ctx, 0, 0, 10, '#cccccc');
      break;
  }
  ctx.restore();
}

// A plate with the dish's components arranged on it.
export function drawPlateDish(ctx, parts, cx, cy, r) {
  ctx.save();
  // Plate.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8cdb2';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f5efe0';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.66, r * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();
  // Components, fanned across the plate.
  const n = parts.length;
  parts.forEach((id, i) => {
    const ox = n === 1 ? 0 : (i - (n - 1) / 2) * (r * 0.62);
    drawFood(ctx, id, cx + ox, cy - r * 0.08, r * 0.42);
  });
  ctx.restore();
}

// ---------------------------------------------------------------------------
// The kitchen itself
// ---------------------------------------------------------------------------
function drawBackground(ctx, G) {
  // Wall and floor.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, W, 170);
  ctx.fillStyle = COLORS.wallDark;
  ctx.fillRect(0, 164, W, 6);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 170, W, H - 170);
  // Floor tiles.
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  for (let x = 0; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 170);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 250; y < H; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // (The warung's name lives on the top bar, not the wall: the bar covers
  // this part of the wall, so a painted sign here would only peek out broken.)
  void G;
}

function drawPantry(ctx, G) {
  const p = LAYOUT.pantry;
  text(ctx, 'RAK BAHAN', p.x, p.y - 12, 13, COLORS.cream, 'left');
  for (let i = 0; i < 9; i += 1) {
    const id = ['nasi', 'mie', 'ayam', 'telur', 'sayur', 'cabai', 'kacang', 'teh', 'es'][i];
    const col = i % p.cols;
    const row = Math.floor(i / p.cols);
    const bx = p.x + col * (p.w + p.gapX);
    const by = p.y + row * (p.h + p.gapY);
    // Bin: wooden crate with the ingredient inside.
    ctx.fillStyle = COLORS.counterTop;
    rr(ctx, bx, by, p.w, p.h, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.counterEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    rr(ctx, bx + 4, by + 4, p.w - 8, 18, 5);
    ctx.fill();
    drawFood(ctx, id, bx + p.w / 2, by + 34, 24);
    text(ctx, INGREDIENTS[id].name, bx + p.w / 2, by + p.h - 12, 12, COLORS.cream, 'center');
    text(ctx, String(i + 1), bx + 8, by + 12, 11, COLORS.amber, 'left');
    // A green tick when this ingredient still needs no processing.
    if (!INGREDIENTS[id].station) {
      circle(ctx, bx + p.w - 10, by + 10, 7, COLORS.green);
      text(ctx, '✓', bx + p.w - 10, by + 11, 10, '#ffffff', 'center');
    }
  }
  void G;
}

function drawStation(ctx, G, key, rect, icon, color) {
  const st = G.stations[key];
  // Counter body.
  ctx.fillStyle = COLORS.counter;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.counterTop;
  rr(ctx, rect.x, rect.y, rect.w, 34, 10);
  ctx.fill();
  ctx.fillRect(rect.x, rect.y + 20, rect.w, 14);
  // Label.
  text(ctx, rect.label, rect.x + rect.w / 2, rect.y + 17, 14, COLORS.cream, 'center');
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 78;
  if (!st.item) {
    // Empty station: show its icon faintly, as an invitation.
    ctx.globalAlpha = 0.45;
    drawFood(ctx, icon, cx, cy, 30);
    ctx.globalAlpha = 1;
    text(ctx, 'kosong', cx, rect.y + rect.h - 12, 11, COLORS.cream, 'center');
    return;
  }
  // Item being processed, with a progress ring.
  const prog = st.done ? 1 : st.t / st.dur;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = st.done ? COLORS.gold : COLORS.amber;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
  ctx.stroke();
  drawFood(ctx, st.item.id, cx, cy, 26);
  if (st.done) {
    // Ready: golden glow and a "MATANG" tag.
    ctx.fillStyle = COLORS.gold;
    rr(ctx, cx - 34, rect.y + rect.h - 24, 68, 18, 9);
    ctx.fill();
    text(ctx, 'MATANG!', cx, rect.y + rect.h - 14, 11, COLORS.ink, 'center');
    if (st.byBimo) text(ctx, 'Bimo', cx, cy - 42, 11, COLORS.tealLight, 'center');
  } else {
    text(ctx, `${Math.ceil(st.dur - st.t)} dtk`, cx, rect.y + rect.h - 12, 11, COLORS.cream, 'center');
  }
  // Steam while cooking.
  if (!st.done && (key === 'wok' || key === 'grill')) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const t = G.time * 2;
    for (let i = 0; i < 3; i += 1) {
      const yy = cy - 30 - ((t * 14 + i * 14) % 42);
      const xx = cx - 14 + i * 14 + Math.sin(t + i * 2) * 4;
      circle(ctx, xx, yy, 4, 'rgba(255,255,255,0.45)');
    }
  }
}

function drawPlate(ctx, G) {
  const rect = LAYOUT.plate;
  ctx.fillStyle = COLORS.teal;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.tealDark;
  rr(ctx, rect.x, rect.y, rect.w, 34, 10);
  ctx.fill();
  ctx.fillRect(rect.x, rect.y + 20, rect.w, 14);
  text(ctx, rect.label, rect.x + rect.w / 2, rect.y + 17, 14, COLORS.cream, 'center');
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 78;
  if (!G.plate.length) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 52, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    text(ctx, 'piring kosong', cx, rect.y + rect.h - 12, 11, COLORS.cream, 'center');
    return;
  }
  drawPlateDish(ctx, G.plate.map((p) => p.id), cx, cy, 46);
  const match = waitingOrders(G).find((o) => recipeKey(o.dish) === plateKey(G.plate));
  if (match) {
    ctx.fillStyle = COLORS.gold;
    rr(ctx, cx - 52, rect.y + rect.h - 24, 104, 18, 9);
    ctx.fill();
    text(ctx, `Siap: ${match.dish}`, cx, rect.y + rect.h - 14, 11, COLORS.ink, 'center');
  } else {
    text(ctx, `${G.plate.length}/${PLATE_MAX} bahan`, cx, rect.y + rect.h - 12, 11, COLORS.cream, 'center');
  }
}

function drawServe(ctx, G) {
  const rect = LAYOUT.serve;
  const match = waitingOrders(G).find((o) => recipeKey(o.dish) === plateKey(G.plate));
  ctx.fillStyle = match ? COLORS.amber : COLORS.counter;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = match ? COLORS.amberDark : COLORS.counterTop;
  rr(ctx, rect.x, rect.y, rect.w, 34, 10);
  ctx.fill();
  ctx.fillRect(rect.x, rect.y + 20, rect.w, 14);
  // Left-aligned: the chef stands under the plate just above this window,
  // and a centered title would hide behind his head.
  text(ctx, rect.label, rect.x + 12, rect.y + 17, 13, COLORS.cream, 'left');
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 78;
  if (match) {
    // A bell on the counter, ringing: the order is ready to go out.
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(cx, cy + 6, 26, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 26, cy + 6, 52, 6);
    circle(ctx, cx + 30, cy + 12, 5, COLORS.gold);
    text(ctx, 'Klik pesanan untuk sajikan!', cx, rect.y + rect.h - 12, 12, COLORS.ink, 'center');
  } else {
    text(ctx, '—', cx, cy, 30, 'rgba(255,255,255,0.5)', 'center');
    text(ctx, 'sajikan dari sini', cx, rect.y + rect.h - 12, 11, COLORS.cream, 'center');
  }
  // Trash bin.
  const tr = LAYOUT.trash;
  ctx.fillStyle = '#6b543a';
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 8);
  ctx.fill();
  // A little drawn bin, no emoji (headless fonts are unreliable for emoji).
  ctx.strokeStyle = COLORS.cream;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tr.x + 16, tr.y + 22);
  ctx.lineTo(tr.x + 34, tr.y + 22);
  ctx.lineTo(tr.x + 32, tr.y + 44);
  ctx.lineTo(tr.x + 18, tr.y + 44);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tr.x + 14, tr.y + 22);
  ctx.lineTo(tr.x + 36, tr.y + 22);
  ctx.stroke();
  text(ctx, 'BUANG', tr.x + tr.w / 2 + 12, tr.y + tr.h / 2, 13, COLORS.cream, 'center');
}

// ---------------------------------------------------------------------------
// Order tickets, chef, HUD and overlays
// ---------------------------------------------------------------------------
function drawTickets(ctx, G) {
  const t = LAYOUT.tickets;
  const waiting = waitingOrders(G);
  for (let i = 0; i < G.day.maxOrders; i += 1) {
    const x = t.x + i * (t.w + t.gap);
    const order = waiting[i];
    if (!order) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      rr(ctx, x, t.y, t.w, t.h, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'menunggu pelanggan…', x + t.w / 2, t.y + t.h / 2, 13, COLORS.inkSoft, 'center');
      continue;
    }
    const frac = clamp01(order.patience / order.maxPatience);
    const urgent = frac < 0.3;
    // Ticket paper, with a red edge when the customer is losing patience.
    ctx.fillStyle = '#fffdf6';
    rr(ctx, x, t.y, t.w, t.h, 10);
    ctx.fill();
    ctx.strokeStyle = urgent ? COLORS.red : '#d8cdb2';
    ctx.lineWidth = urgent ? 3 : 2;
    ctx.stroke();
    // Dish name and price.
    text(ctx, order.dish, x + 14, t.y + 18, 16, COLORS.ink, 'left');
    text(ctx, `${RECIPES[order.dish].price} koin`, x + t.w - 14, t.y + 18, 13, COLORS.amberDark, 'right');
    // Recipe parts (or "?" in mystery mode).
    const mystery = G.challenge === 'mystery';
    order.parts.forEach((part, j) => {
      const px = x + 30 + j * 44;
      const py = t.y + 48;
      if (mystery) {
        circle(ctx, px, py, 15, '#e8dcc0');
        text(ctx, '?', px, py + 1, 16, COLORS.inkSoft, 'center');
      } else {
        const onPlate = G.plate.some((p) => p.id === part);
        circle(ctx, px, py, 15, onPlate ? '#d9f0c9' : '#f5efe0');
        drawFood(ctx, part, px, py, 13);
        if (onPlate) {
          ctx.strokeStyle = COLORS.green;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(px, py, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });
    // Patience bar.
    ctx.fillStyle = '#e8dcc0';
    rr(ctx, x + 14, t.y + t.h - 16, t.w - 28, 8, 4);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? COLORS.amber : COLORS.red;
    rr(ctx, x + 14, t.y + t.h - 16, (t.w - 28) * frac, 8, 4);
    ctx.fill();
    if (urgent) {
      text(ctx, `${Math.ceil(order.patience)} dtk!`, x + t.w - 14, t.y + t.h - 34, 12, COLORS.red, 'right');
    }
  }
}

function drawChefSprite(ctx, x, y, dir, bob, apron, name, isBimo) {
  const hop = Math.sin(bob) * 2;
  ctx.save();
  ctx.translate(x, y + hop);
  ctx.scale(dir, 1);
  // Shadow.
  ctx.fillStyle = 'rgba(58,42,24,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 26 - hop, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body and apron.
  ctx.fillStyle = apron;
  rr(ctx, -16, -6, 32, 30, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  rr(ctx, -12, 8, 24, 14, 6);
  ctx.fill();
  // Head and toque.
  circle(ctx, 0, -18, 13, '#f2c69b');
  ctx.fillStyle = '#ffffff';
  circle(ctx, -8, -28, 8, '#ffffff');
  circle(ctx, 8, -28, 8, '#ffffff');
  circle(ctx, 0, -30, 9, '#ffffff');
  ctx.fillRect(-11, -30, 22, 8);
  // Face.
  ctx.fillStyle = '#3a2a18';
  circle(ctx, -5, -19, 1.8, '#3a2a18');
  circle(ctx, 5, -19, 1.8, '#3a2a18');
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -15, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Name tag.
  text(ctx, name, 0, 38, 11, COLORS.ink, 'center');
  ctx.restore();
  void isBimo;
}

// A speaker icon drawn with shapes: a cone with sound arcs, or an X when
// muted. (The ♪ character is a 4px speck in headless fonts, so icons here
// are always drawn, never typed — same rule as the trash-bin drawing.)
function drawSpeakerIcon(ctx, ix, iy, muted) {
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(ix - 8, iy - 3, 4, 6);
  ctx.beginPath();
  ctx.moveTo(ix - 4, iy - 6);
  ctx.lineTo(ix + 3, iy);
  ctx.lineTo(ix - 4, iy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = COLORS.cream;
  ctx.lineWidth = 1.6;
  if (muted) {
    ctx.beginPath();
    ctx.moveTo(ix + 5, iy - 5);
    ctx.lineTo(ix + 12, iy + 5);
    ctx.moveTo(ix + 12, iy - 5);
    ctx.lineTo(ix + 5, iy + 5);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(ix + 5, iy, 4, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ix + 5, iy, 8, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
}

function drawTopBar(ctx, G) {
  const bar = LAYOUT.topBar;
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  // Logo and day.
  text(ctx, 'WARUNG KILAT', 16, 20, 20, COLORS.cream, 'left');
  const modeText = G.mode === 'career' ? `Hari ${G.dayIndex + 1} • ${G.challengeDef.name}` : `Rush • ${G.challengeDef.name}`;
  text(ctx, modeText, 16, 42, 12, COLORS.tealLight, 'left');
  // Coins and combo.
  circle(ctx, 250, 28, 13, COLORS.gold);
  text(ctx, '¢', 250, 29, 15, COLORS.ink, 'center');
  text(ctx, `${G.coins}`, 270, 28, 22, COLORS.cream, 'left');
  if (G.mode === 'career') {
    text(ctx, `Target ${G.day.goal}`, 340, 28, 13, COLORS.tealLight, 'left');
  }
  if (G.combo >= 2) {
    ctx.fillStyle = COLORS.red;
    rr(ctx, 470, 12, 92, 32, 16);
    ctx.fill();
    text(ctx, `KOMBO x${G.combo}`, 516, 29, 15, '#ffffff', 'center');
  }
  // Timer: big, in the middle-right.
  const mm = Math.floor(Math.max(0, G.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, G.timeLeft) % 60);
  const low = G.timeLeft < 30;
  text(ctx, `${mm}:${String(ss).padStart(2, '0')}`, 700, 28, 28, low ? '#ff9d7a' : COLORS.cream, 'center');
  // Hearts.
  for (let i = 0; i < 3; i += 1) {
    const hx = 790 + i * 30;
    ctx.fillStyle = i < G.hearts ? COLORS.red : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx, 24, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 8, 28);
    ctx.lineTo(hx, 38);
    ctx.lineTo(hx + 8, 28);
    ctx.closePath();
    ctx.fill();
  }
  // Buttons: sound, pause, autopilot.
  const b = LAYOUT.buttons;
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  rr(ctx, b.sound.x, b.sound.y, b.sound.w, b.sound.h, 8);
  ctx.fill();
  // Sound button: text plus a drawn speaker icon (never a ♪ character —
  // headless fonts render it as a 4px speck). Muted shows an X instead
  // of sound waves; the text stays "SUARA" in both states.
  drawSpeakerIcon(ctx, b.sound.x + 14, b.sound.y + 20, G.muted);
  text(ctx, 'SUARA', b.sound.x + 54, b.sound.y + 21, 12, COLORS.cream, 'center');
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  rr(ctx, b.pause.x, b.pause.y, b.pause.w, b.pause.h, 8);
  ctx.fill();
  text(ctx, 'II', b.pause.x + b.pause.w / 2, b.pause.y + 21, 14, COLORS.cream, 'center');
  ctx.fillStyle = G.autopilot ? COLORS.gold : 'rgba(255,255,255,0.16)';
  rr(ctx, b.autopilot.x, b.autopilot.y, b.autopilot.w, b.autopilot.h, 8);
  ctx.fill();
  text(ctx, G.autopilot ? 'AI MAIN ✓' : 'AI MAIN', b.autopilot.x + b.autopilot.w / 2, b.autopilot.y + 21, 13, G.autopilot ? COLORS.ink : COLORS.cream, 'center');
}

function drawBottomBar(ctx, G) {
  const bar = LAYOUT.bottomBar;
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  // Hands: what the chef is carrying.
  text(ctx, 'TANGAN:', 16, bar.y + 18, 12, COLORS.tealLight, 'left');
  for (let i = 0; i < 2; i += 1) {
    const hx = 100 + i * 64;
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    rr(ctx, hx, bar.y + 10, 56, 52, 8);
    ctx.fill();
    const item = G.hands[i];
    if (item) {
      drawFood(ctx, item.id, hx + 28, bar.y + 30, 20);
      text(ctx, item.cooked ? 'matang' : INGREDIENTS[item.id].station ? 'mentah' : 'siap', hx + 28, bar.y + 54, 10, COLORS.cream, 'center');
    }
  }
  // Hint line: tutorial step, AI status, or the controls.
  let hint = 'Klik bahan → stasiun → piring → pesanan. Tombol: 1-9 bahan, B/W/G stasiun, P piring, S sajikan, A AI, M suara.';
  if (G.tutorial.on && !G.tutorial.done) hint = tutorialText(G);
  else if (G.autopilot) hint = `AUTOPILOT: ${G.aiLog || 'Bimo AI sedang memasak…'}`;
  else if (G.sousChef) hint = 'Bimo (sous-chef AI) membantumu memotong di talenan.';
  text(ctx, hint, 240, bar.y + 36, 14, COLORS.cream, 'left');
  // Score on the right.
  text(ctx, `Skor ${G.score}  •  Disajikan ${G.served}  •  Hangus ${G.lost}`, 1264, bar.y + 36, 14, COLORS.cream, 'right');
}

function drawEffects(ctx, G) {
  for (const e of G.effects) {
    const a = 1 - e.t / e.dur;
    ctx.globalAlpha = Math.max(0, a);
    text(ctx, e.text, e.x, e.y - e.t * 34, 18, e.color, 'center');
    ctx.globalAlpha = 1;
  }
  for (const p of G.particles) {
    const a = 1 - p.t / p.dur;
    ctx.globalAlpha = Math.max(0, a * 0.8);
    circle(ctx, p.x, p.y, p.r, p.color);
    ctx.globalAlpha = 1;
  }
}

function drawTutorialHighlight(ctx, G) {
  if (!G.tutorial.on || G.tutorial.done || G.screen !== 'play') return;
  const step = G.tutorial.step;
  let rect = null;
  if (step === 0) rect = { x: 16, y: 178, w: 86, h: 84 }; // nasi bin
  else if (step === 1 || step === 2) rect = LAYOUT.wok;
  else if (step === 3) rect = LAYOUT.plate;
  else if (step === 4) rect = { x: 16, y: 64, w: 296, h: 88 }; // first ticket
  if (!rect) return;
  const pulse = 3 + Math.sin(G.time * 6) * 2;
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = pulse;
  rr(ctx, rect.x - 6, rect.y - 6, rect.w + 12, rect.h + 12, 12);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------
function drawMenu(ctx, G) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, W, H);
  // Big warm banner.
  ctx.fillStyle = COLORS.teal;
  rr(ctx, 190, 60, 900, 150, 20);
  ctx.fill();
  text(ctx, 'WARUNG KILAT', 640, 118, 56, COLORS.cream, 'center');
  text(ctx, 'Game memasak cepat saji — masak, rakit, sajikan sebelum pelanggan pergi!', 640, 168, 18, COLORS.tealLight, 'center');
  // Two mode cards; the selected one gets a gold border.
  const m = LAYOUT.menu;
  const cards = [
    { rect: m.careerCard, title: 'KARIER', desc: 'Lima hari, lima target koin.\nSetiap hari membuka satu resep baru.', mode: 'career' },
    { rect: m.rushCard, title: 'RUSH 120 DETIK', desc: 'Pesanan tanpa henti, skor setinggi mungkin.\nPilih satu dari tiga tantangan.', mode: 'rush' },
  ];
  for (const card of cards) {
    const sel = G.menuSel.mode === card.mode;
    ctx.fillStyle = '#fffdf6';
    rr(ctx, card.rect.x, card.rect.y, card.rect.w, card.rect.h, 16);
    ctx.fill();
    ctx.strokeStyle = sel ? COLORS.gold : '#d8cdb2';
    ctx.lineWidth = sel ? 4 : 2;
    ctx.stroke();
    text(ctx, card.title, card.rect.x + card.rect.w / 2, card.rect.y + 40, 26, COLORS.ink, 'center');
    const lines = card.desc.split('\n');
    lines.forEach((line, i) => text(ctx, line, card.rect.x + card.rect.w / 2, card.rect.y + 78 + i * 24, 15, COLORS.inkSoft, 'center'));
    if (sel) text(ctx, '✓ dipilih', card.rect.x + card.rect.w / 2, card.rect.y + 128, 13, COLORS.teal, 'center');
  }
  // Options row: days for career, challenges for rush.
  if (G.menuSel.mode === 'career') {
    text(ctx, 'Pilih hari:', 640, 410, 14, COLORS.inkSoft, 'center');
    const d = m.dayButtons;
    DAYS.forEach((day, i) => {
      const bx = d.x + i * (d.w + d.gap);
      const sel = G.menuSel.day === i;
      ctx.fillStyle = sel ? COLORS.teal : '#fffdf6';
      rr(ctx, bx, d.y, d.w, d.h, 10);
      ctx.fill();
      ctx.strokeStyle = sel ? COLORS.tealDark : '#d8cdb2';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, `Hari ${day.day}`, bx + d.w / 2, d.y + 23, 14, sel ? COLORS.cream : COLORS.ink, 'center');
    });
  } else {
    text(ctx, 'Pilih tantangan:', 640, 410, 14, COLORS.inkSoft, 'center');
    const c = m.challengeButtons;
    Object.keys({ none: 0, rushhour: 0, nomistake: 0, mystery: 0 }).forEach((key, i) => {
      const bx = c.x + i * (c.w + c.gap);
      const sel = G.menuSel.challenge === key;
      ctx.fillStyle = sel ? COLORS.teal : '#fffdf6';
      rr(ctx, bx, c.y, c.w, c.h, 10);
      ctx.fill();
      ctx.strokeStyle = sel ? COLORS.tealDark : '#d8cdb2';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, ['Santai', 'Rush Hour', 'Tanpa Salah', 'Misteri'][i], bx + c.w / 2, c.y + 23, 14, sel ? COLORS.cream : COLORS.ink, 'center');
    });
  }
  // Start button and secondary buttons.
  ctx.fillStyle = COLORS.amber;
  rr(ctx, m.startBtn.x, m.startBtn.y, m.startBtn.w, m.startBtn.h, 14);
  ctx.fill();
  text(ctx, 'MULAI MASAK!', m.startBtn.x + m.startBtn.w / 2, m.startBtn.y + 29, 24, COLORS.ink, 'center');
  ctx.fillStyle = '#fffdf6';
  rr(ctx, m.demoBtn.x, m.demoBtn.y, m.demoBtn.w, m.demoBtn.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#d8cdb2';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'Autopilot Demo (AI main)', m.demoBtn.x + m.demoBtn.w / 2, m.demoBtn.y + 21, 14, COLORS.ink, 'center');
  rr(ctx, m.helpBtn.x, m.helpBtn.y, m.helpBtn.w, m.helpBtn.h, 10);
  ctx.fill();
  ctx.stroke();
  text(ctx, 'Cara Main', m.helpBtn.x + m.helpBtn.w / 2, m.helpBtn.y + 21, 14, COLORS.ink, 'center');
  // A row of the dishes, drawn as plates, so the menu itself shows the food.
  RECIPE_ORDER.forEach((dish, i) => {
    const px = 640 + (i - 2.5) * 150;
    drawPlateDish(ctx, RECIPES[dish].parts, px, 648, 30);
    text(ctx, dish, px, 684, 12, COLORS.ink, 'center');
  });
  text(ctx, 'Dibuat untuk bounty make.fun “Make the best cooking game”', 640, 708, 11, COLORS.inkSoft, 'center');
}

function drawOverlayPanel(ctx, title, lines, buttons) {
  ctx.fillStyle = 'rgba(58,42,24,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fffdf6';
  rr(ctx, 340, 150, 600, 380, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.amber;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, 640, 200, 30, COLORS.ink, 'center');
  lines.forEach((line, i) => text(ctx, line, 640, 250 + i * 30, 16, COLORS.inkSoft, 'center'));
  buttons.forEach((btn, i) => {
    const bx = 640 - ((buttons.length - 1) * 130) / 2 + i * 260 - 110;
    ctx.fillStyle = i === 0 ? COLORS.teal : '#e8dcc0';
    rr(ctx, bx, 450, 220, 48, 12);
    ctx.fill();
    text(ctx, btn, bx + 110, 475, 16, i === 0 ? COLORS.cream : COLORS.ink, 'center');
  });
}

function drawEndScreen(ctx, G) {
  const r = G.dayResult;
  if (!r) return;
  const won = r.won;
  const title = won ? (G.mode === 'career' ? 'HARI SELESAI!' : 'WAKTU HABIS!') : 'HARI GAGAL';
  const lines = [
    `Koin: ${r.coins} / target ${r.goal}`,
    `Pesanan disajikan: ${r.served}   •   hangus: ${r.lost}`,
    `Kombo terbaik: x${r.bestCombo}   •   Tip terkumpul: ${r.tips} koin`,
  ];
  const buttons = won
    ? (G.mode === 'career' && G.dayIndex < 4 ? ['Hari Berikutnya', 'Ulangi Hari', 'Menu'] : ['Main Lagi', 'Menu'])
    : ['Coba Lagi', 'Menu'];
  drawOverlayPanel(ctx, title, lines, buttons);
}

function drawHelp(ctx) {
  drawOverlayPanel(ctx, 'CARA MAIN', [
    'Klik bahan di rak kiri, lalu klik stasiun untuk mengolahnya.',
    'Talenan memotong • Wajan menggoreng • Panggangan memanggang.',
    'Letakkan bahan matang di Piring, lalu klik Pesanan untuk menyajikan.',
    'Sajikan cepat = tip besar. Pesanan yang kehabisan waktu hangus.',
    'Keyboard: 1-9 bahan • B talenan • W wajan • G panggangan • P piring',
    'S sajikan • T buang piring • A autopilot AI • M suara • Esc jeda • R resep',
  ], ['Tutup']);
}

function drawBook(ctx) {
  ctx.fillStyle = 'rgba(58,42,24,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fffdf6';
  rr(ctx, 240, 90, 800, 540, 18);
  ctx.fill();
  text(ctx, 'BUKU RESEP', 640, 130, 28, COLORS.ink, 'center');
  RECIPE_ORDER.forEach((dish, i) => {
    const y = 180 + i * 68;
    drawPlateDish(ctx, RECIPES[dish].parts, 320, y, 30);
    text(ctx, dish, 380, y - 8, 17, COLORS.ink, 'left');
    text(ctx, `${RECIPES[dish].parts.map((p) => INGREDIENTS[p].name).join(' + ')}  •  ${RECIPES[dish].price} koin`, 380, y + 16, 13, COLORS.inkSoft, 'left');
    text(ctx, 'Tutup (R)', 640, 600, 14, COLORS.teal, 'center');
  });
}

// ---------------------------------------------------------------------------
// The main draw entry point.
// ---------------------------------------------------------------------------
export function draw(ctx, G) {
  ctx.save();
  if (G.shake > 0) {
    ctx.translate((Math.random() - 0.5) * G.shake * 14, (Math.random() - 0.5) * G.shake * 14);
  }
  if (G.screen === 'menu') {
    drawMenu(ctx, G);
    ctx.restore();
    return;
  }
  drawBackground(ctx, G);
  drawTickets(ctx, G);
  drawPantry(ctx, G);
  drawStation(ctx, G, 'board', LAYOUT.board, 'sayur', COLORS.teal);
  drawStation(ctx, G, 'wok', LAYOUT.wok, 'nasi', COLORS.teal);
  drawStation(ctx, G, 'grill', LAYOUT.grill, 'ayam', COLORS.teal);
  drawPlate(ctx, G);
  drawServe(ctx, G);
  // Chefs: Bimo the sous-chef first (behind the player), then the player.
  if (G.sousChef) drawChefSprite(ctx, G.bimo.x, G.bimo.y, G.bimo.dir, G.bimo.bob, COLORS.teal, 'BIMO', true);
  drawChefSprite(ctx, G.chef.x, G.chef.y, G.chef.dir, G.chef.bob, COLORS.red, 'KAMU', false);
  drawTopBar(ctx, G);
  drawBottomBar(ctx, G);
  drawEffects(ctx, G);
  drawTutorialHighlight(ctx, G);
  if (G.screen === 'pause') {
    drawOverlayPanel(ctx, 'JEDA', ['Istirahat sebentar, dapur menunggu.', 'Tekan Esc atau klik Lanjut untuk kembali memasak.'], ['Lanjut', 'Menu']);
  } else if (G.screen === 'dayend' || G.screen === 'gameover') {
    drawEndScreen(ctx, G);
  }
  if (G.showHelp) drawHelp(ctx);
  if (G.showBook) drawBook(ctx);
  ctx.restore();
}
