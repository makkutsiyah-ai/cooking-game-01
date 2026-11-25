// Warung Kilat — configuration: recipes, ingredients, levels, layout.
// One job: every number, name and rectangle the game uses lives here, so the
// other files read it instead of hiding magic numbers of their own.

export const W = 1280;
export const H = 720;

// Warm warung palette: cream walls, terracotta floor, teal counters, amber light.
export const COLORS = {
  wall: '#f6e7c8',
  wallDark: '#ecd9ae',
  floor: '#d98a4b',
  floorTile: '#cf7c3e',
  floorLine: '#b96a32',
  counter: '#8a5a2b',
  counterTop: '#a9713a',
  counterEdge: '#6e451f',
  teal: '#2a7f7f',
  tealDark: '#1f5f5f',
  tealLight: '#7fc4b8',
  amber: '#f2a541',
  amberDark: '#c77f1d',
  red: '#d94f30',
  redDark: '#a83a20',
  cream: '#fff6e3',
  ink: '#3a2a18',
  inkSoft: '#6b543a',
  green: '#5da24a',
  greenDark: '#3e7a30',
  gold: '#ffd23f',
  white: '#ffffff',
  shadow: 'rgba(58,42,24,0.25)',
};

// ---------------------------------------------------------------------------
// Ingredients. Each raw ingredient is picked from the pantry and either goes
// straight onto a plate (station: null) or must be processed at one station
// first (board = chop, wok = fry, grill = grill) for `time` seconds.
// ---------------------------------------------------------------------------
export const INGREDIENTS = {
  nasi:   { name: 'Nasi',   short: 'Nasi',   station: 'wok',   time: 2.5, color: '#f5efe0', dark: '#d8cdb2' },
  mie:    { name: 'Mie',    short: 'Mie',    station: 'wok',   time: 2.5, color: '#f2c14e', dark: '#c79a2e' },
  ayam:   { name: 'Ayam',   short: 'Ayam',   station: 'grill', time: 3.5, color: '#c98a4b', dark: '#8f5a24' },
  telur:  { name: 'Telur',  short: 'Telur',  station: 'wok',   time: 2.0, color: '#fff3d6', dark: '#e0b64f' },
  sayur:  { name: 'Sayur',  short: 'Sayur',  station: 'board', time: 1.5, color: '#6fbf4a', dark: '#3e7a30' },
  cabai:  { name: 'Cabai',  short: 'Cabai',  station: 'board', time: 1.5, color: '#d94f30', dark: '#a83a20' },
  kacang: { name: 'Kacang', short: 'Kacang', station: null,    time: 0,   color: '#a9713a', dark: '#6e451f' },
  teh:    { name: 'Teh',    short: 'Teh',    station: null,    time: 0,   color: '#c98a2e', dark: '#8a5a10' },
  es:     { name: 'Es',     short: 'Es',     station: null,    time: 0,   color: '#bfe8f2', dark: '#6fb7cc' },
};

export const PANTRY_ORDER = ['nasi', 'mie', 'ayam', 'telur', 'sayur', 'cabai', 'kacang', 'teh', 'es'];

// ---------------------------------------------------------------------------
// Recipes. `parts` are ingredient ids; every part must land on the plate
// (processed first where the ingredient needs it) before the dish is served.
// ---------------------------------------------------------------------------
export const RECIPES = {
  'Nasi Goreng':  { parts: ['nasi', 'telur', 'sayur'], price: 60, icon: 'nasi' },
  'Mie Goreng':   { parts: ['mie', 'ayam', 'sayur'],   price: 65, icon: 'mie' },
  'Sate Ayam':    { parts: ['ayam', 'kacang', 'cabai'], price: 70, icon: 'ayam' },
  'Gado-Gado':    { parts: ['sayur', 'telur', 'kacang'], price: 55, icon: 'sayur' },
  'Ayam Geprek':  { parts: ['ayam', 'cabai', 'nasi'],   price: 75, icon: 'cabai' },
  'Es Teh Manis': { parts: ['teh', 'es'],               price: 25, icon: 'teh' },
};

export const RECIPE_ORDER = ['Nasi Goreng', 'Mie Goreng', 'Sate Ayam', 'Gado-Gado', 'Ayam Geprek', 'Es Teh Manis'];

// Career days: which recipes are on the menu, the coin goal, the clock, and
// how fast hungry customers arrive. Each day unlocks one new recipe.
export const DAYS = [
  { day: 1, recipes: ['Nasi Goreng', 'Mie Goreng'], goal: 300, time: 150, spawn: 13, patience: 46, maxOrders: 3 },
  { day: 2, recipes: ['Nasi Goreng', 'Mie Goreng', 'Sate Ayam'], goal: 450, time: 150, spawn: 12, patience: 44, maxOrders: 3 },
  { day: 3, recipes: ['Nasi Goreng', 'Mie Goreng', 'Sate Ayam', 'Gado-Gado'], goal: 600, time: 160, spawn: 11, patience: 42, maxOrders: 4 },
  { day: 4, recipes: ['Nasi Goreng', 'Mie Goreng', 'Sate Ayam', 'Gado-Gado', 'Ayam Geprek'], goal: 800, time: 160, spawn: 10, patience: 40, maxOrders: 4 },
  { day: 5, recipes: ['Nasi Goreng', 'Mie Goreng', 'Sate Ayam', 'Gado-Gado', 'Ayam Geprek', 'Es Teh Manis'], goal: 1000, time: 170, spawn: 9, patience: 38, maxOrders: 4 },
];

export const RUSH = { recipes: RECIPE_ORDER, goal: 0, time: 120, spawn: 8, patience: 36, maxOrders: 4 };

// Three challenge types. Rush Hour floods the kitchen, Tanpa Salah ends the
// run on three mistakes, Pesanan Misteri hides the recipe on the ticket.
export const CHALLENGES = {
  none:      { name: 'Santai',          desc: 'Tanpa tantangan tambahan.' },
  rushhour:  { name: 'Rush Hour',       desc: 'Pesanan datang 2x lebih cepat.' },
  nomistake: { name: 'Tanpa Salah',     desc: 'Tiga kesalahan dan hari berakhir.' },
  mystery:   { name: 'Pesanan Misteri', desc: 'Resep di tiket disembunyikan — ingat-ingat!' },
};

export const HANDS_MAX = 2;
export const PLATE_MAX = 4;
export const COMBO_WINDOW = 20; // seconds to keep a combo alive between serves
export const COMBO_STEP = 0.1;  // +10% coins per combo step
export const COMBO_CAP = 2.0;   // combo multiplier caps at x2
export const TIP_MAX = 0.5;     // up to +50% for serving with patience left

// ---------------------------------------------------------------------------
// Layout: every rectangle the renderer draws and the input handler hit-tests.
// Canvas is 1280 x 720; the page scales it to fit the window.
// ---------------------------------------------------------------------------
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 56 },
  // Order tickets: four slots across the top, under the top bar.
  tickets: { x: 16, y: 64, w: 296, h: 88, gap: 12 },
  // Pantry: two columns of ingredient bins down the left wall.
  // Bins start at y=190 so the "RAK BAHAN" label above them (drawn at
  // y-12, i.e. 178) sits fully on the orange floor, clear of the ticket
  // row (ends y=152) and of the wall/floor seam (y=170) — the label used
  // to straddle that seam and its cream top half vanished on the wall.
  pantry: { x: 16, y: 190, w: 86, h: 84, gapX: 8, gapY: 8, cols: 2 },
  pantryLabel: { x: 16, y: 180 },
  // Workstations: three across the middle, plate and serve window on the right.
  board: { x: 232, y: 300, w: 190, h: 130, label: 'Talenan' },
  wok:   { x: 452, y: 300, w: 190, h: 130, label: 'Wajan' },
  grill: { x: 672, y: 300, w: 190, h: 130, label: 'Panggangan' },
  plate: { x: 892, y: 300, w: 210, h: 130, label: 'Piring Saji' },
  serve: { x: 892, y: 452, w: 210, h: 130, label: 'Jendela Saji' },
  trash: { x: 1132, y: 300, w: 132, h: 62, label: 'Buang' },
  // Chef home spot and station anchor points (where the chef walks to).
  chefHome: { x: 560, y: 540 },
  anchors: {
    pantry: { x: 150, y: 480 },
    board: { x: 327, y: 470 },
    wok: { x: 547, y: 470 },
    grill: { x: 767, y: 470 },
    plate: { x: 1030, y: 470 },
    serve: { x: 997, y: 610 },
    trash: { x: 1198, y: 400 },
  },
  // Bottom bar: hands, plate preview, hint line.
  bottomBar: { x: 0, y: 648, w: 1280, h: 72 },
  hands: { x: 16, y: 656, w: 56, h: 56 },
  // Top-bar buttons (right side). The sound button is 84 wide: its label
  // is text plus a drawn speaker icon (the ♪ character renders as a 4px
  // speck in headless fonts, so the icon is canvas shapes, like every
  // other icon in this game). Pause and autopilot shift right to keep the
  // 8px gaps and the 1272 right edge.
  buttons: {
    sound:    { x: 1008, y: 8, w: 84, h: 40 },
    pause:    { x: 1100, y: 8, w: 56, h: 40 },
    autopilot:{ x: 1164, y: 8, w: 108, h: 40 },
  },
  // Menu screen: two mode cards, one options row, start + demo + help.
  menu: {
    careerCard: { x: 190, y: 240, w: 430, h: 150 },
    rushCard:   { x: 660, y: 240, w: 430, h: 150 },
    dayButtons: { x: 390, y: 420, w: 92, h: 44, gap: 10 },
    challengeButtons: { x: 325, y: 420, w: 150, h: 44, gap: 10 },
    startBtn: { x: 440, y: 500, w: 400, h: 56 },
    demoBtn:  { x: 390, y: 572, w: 240, h: 40 },
    helpBtn:  { x: 650, y: 572, w: 240, h: 40 },
  },
};

// Keyboard shortcuts, shown on the help panel and the menu screen.
export const KEYS = {
  pantry: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  board: 'b', wok: 'w', grill: 'g', plate: 'p',
  serveFirst: 's', autopilot: 'a', pause: 'Escape', mute: 'm', help: 'h',
  recipeBook: 'r', trash: 't',
};
