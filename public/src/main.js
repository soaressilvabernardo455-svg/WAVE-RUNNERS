import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// WAVE RUNNER — River Rush
const root = document.getElementById('game');
const isMobile = matchMedia('(max-width: 700px)').matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x77c5df);
scene.fog = new THREE.Fog(0x77c5df, 82, 330);

const camera = new THREE.PerspectiveCamera(57, innerWidth / innerHeight, 0.1, 600);
camera.position.set(0, 6.2, 11.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.35 : 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label', 'Área de jogo Wave Runner');

scene.add(new THREE.HemisphereLight(0xdff8ff, 0x31566b, 2.25));
const sun = new THREE.DirectionalLight(0xfff3d8, 2.45);
sun.position.set(-24, 36, 22);
sun.castShadow = true;
sun.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
sun.shadow.camera.left = -42;
sun.shadow.camera.right = 42;
sun.shadow.camera.top = 42;
sun.shadow.camera.bottom = -42;
sun.shadow.bias = -0.00025;
scene.add(sun);
const coolFill = new THREE.DirectionalLight(0x72d7f6, 1.15);
coolFill.position.set(22, 13, -38);
scene.add(coolFill);

const material = (color, roughness = 0.58, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x168eaa, roughness: 0.24, metalness: 0.16,
  transparent: true, opacity: 0.94
});
const stone = material(0x748d8d, 0.88);
const stoneLight = material(0x9bb0a9, 0.8);
const grass = material(0x438a69, 0.92);
const wood = material(0x805a42, 0.8);

const riverGeometry = new THREE.PlaneGeometry(33, 520, 42, 128);
riverGeometry.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverGeometry, waterMaterial);
river.position.set(0, -0.22, -205);
river.receiveShadow = true;
scene.add(river);
const riverBase = riverGeometry.attributes.position.array.slice();

const bed = new THREE.Mesh(new THREE.PlaneGeometry(38, 525), material(0x315e60, 1));
bed.rotation.x = -Math.PI / 2;
bed.position.set(0, -2.25, -205);
scene.add(bed);

// Margens que fecham o rio: as três faixas jogáveis ficam sempre dentro delas.
for (const side of [-1, 1]) {
  const bank = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.2, 525), stone);
  bank.position.set(side * 17.2, 0.72, -205);
  bank.castShadow = true;
  bank.receiveShadow = true;
  scene.add(bank);

  const coping = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 525), stoneLight);
  coping.position.set(side * 17.2, 2.42, -205);
  coping.castShadow = true;
  scene.add(coping);

  const outerGround = new THREE.Mesh(new THREE.PlaneGeometry(110, 525), grass);
  outerGround.rotation.x = -Math.PI / 2;
  outerGround.position.set(side * 72, -0.72, -205);
  outerGround.receiveShadow = true;
  scene.add(outerGround);

  const waterline = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.16, 520),
    new THREE.MeshBasicMaterial({ color: 0x9ef3e8, transparent: true, opacity: 0.48 })
  );
  waterline.position.set(side * 16.45, 0.03, -205);
  scene.add(waterline);
}

function makeHouse(side, z, index) {
  const g = new THREE.Group();
  const wallColors = [0xf1d2a6, 0xe8b7a1, 0xd5e1c2, 0xc8dbe5, 0xe8d6ec, 0xf2dfad];
  const roofColors = [0x9d4f43, 0x315e78, 0xb36a3e, 0x52765d, 0x77516f];
  const wallMat = material(wallColors[index % wallColors.length], 0.84);
  const roofMat = material(roofColors[index % roofColors.length], 0.72);
  const house = new THREE.Mesh(new THREE.BoxGeometry(6.1, 3.9, 6.4), wallMat);
  house.position.y = 1.78;
  house.castShadow = true;
  house.receiveShadow = true;
  g.add(house);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.55, 1.75, 4), roofMat);
  roof.position.y = 4.6;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.15, 0.7), material(0xb66b55));
  chimney.position.set(side * 1.45, 5.05, -1.55);
  g.add(chimney);

  const frontX = -side * 3.12;
  for (const wz of [-1.45, 1.45]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.25, 1.06), material(0x65594e));
    frame.position.set(frontX, 2.25, wz);
    g.add(frame);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.97, 0.78),
      new THREE.MeshStandardMaterial({
        color: index % 2 ? 0x78d8ee : 0x9de8ef,
        emissive: 0x286a79, emissiveIntensity: 0.22,
        roughness: 0.18, metalness: 0.16
      })
    );
    glass.position.set(frontX - side * 0.08, 2.25, wz);
    g.add(glass);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.13, 1.16), wood);
    sill.position.set(frontX - side * 0.13, 1.67, wz);
    g.add(sill);
  }

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.05, 1.08), wood);
  doorFrame.position.set(frontX, 0.82, 0);
  g.add(doorFrame);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.82, 0.83), material(0x496b67));
  door.position.set(frontX - side * 0.08, 0.82, 0);
  g.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), material(0xffd47a, 0.3, 0.55));
  knob.position.set(frontX - side * 0.17, 0.82, -0.26);
  g.add(knob);

  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.22, 6.8), material(index % 2 ? 0x4c93a0 : 0xd68b51));
  awning.position.set(-side * 3.45, 2.9, 0);
  g.add(awning);

  const balcony = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 6.7), wood);
  balcony.position.set(-side * 4.25, 0.68, 0);
  g.add(balcony);
  for (const zPost of [-2.75, -1.4, 0, 1.4, 2.75]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.82, 0.13), stoneLight);
    post.position.set(-side * 4.95, 1.08, zPost);
    g.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 6.0), stoneLight);
  rail.position.set(-side * 4.95, 1.47, 0);
  g.add(rail);

  // Foundation meets the water so the houses look built along the river.
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(6.3, 1.55, 6.55), stone);
  foundation.position.y = -0.83;
  g.add(foundation);

  g.position.set(side * (23.6 + (index % 2) * 1.1), 0, z);
  scene.add(g);
}

function makeLamp(side, z) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.12, 4.3, 8), material(0x344c59, 0.48, 0.45));
  pole.position.y = 2.15;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.12), material(0x344c59));
  arm.position.set(-side * 0.35, 4.12, 0);
  g.add(arm);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe4a0 })
  );
  lamp.position.set(-side * 0.73, 3.98, 0);
  g.add(lamp);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcf71, transparent: true, opacity: 0.12 })
  );
  glow.position.copy(lamp.position);
  g.add(glow);
  g.position.set(side * 15.25, 0, z);
  scene.add(g);
}

function makeBridge(z, index) {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(35.5, 0.72, 4.8), material(index % 2 ? 0x9eaa9f : 0xaaa18e));
  deck.position.y = 4.8;
  deck.castShadow = true;
  deck.receiveShadow = true;
  g.add(deck);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(35.5, 0.72, 0.26), material(0x596f73));
    rail.position.set(0, 5.48, side * 2.18);
    g.add(rail);
    for (let x = -15; x <= 15; x += 3) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.28), stoneLight);
      post.position.set(x, 5.54, side * 2.18);
      g.add(post);
    }
  }
  for (const x of [-14.4, 14.4]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.2, 3.4), stone);
    pillar.position.set(x, 2.1, 0);
    pillar.castShadow = true;
    g.add(pillar);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 4.0), stoneLight);
    cap.position.set(x, 4.75, 0);
    g.add(cap);
  }
  g.position.z = z;
  scene.add(g);
}

for (let i = 0; i < 11; i++) {
  const z = -28 - i * 35;
  makeHouse(-1, z, i);
  makeHouse(1, z - 12, i + 3);
  makeLamp(-1, z - 16);
  makeLamp(1, z - 5);
}
makeBridge(-105, 0);
makeBridge(-225, 1);
makeBridge(-345, 2);

// Small submerged posts and old stone details add depth below the waterline.
for (const side of [-1, 1]) {
  for (let i = 0; i < 14; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.58, 2.5, 8), material(0x617d7c, 0.95));
    post.position.set(side * (13.8 + (i % 2) * 0.5), -1.45, -18 - i * 26);
    scene.add(post);
  }
}

function makeRider(boardColor = 0xff7047) {
  const group = new THREE.Group();
  const board = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.7, 5, 12), material(boardColor, 0.25, 0.22));
  board.scale.set(0.84, 1.0, 0.16);
  board.rotation.x = Math.PI / 2;
  board.position.y = 0.25;
  board.castShadow = true;
  group.add(board);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.055, 2.55), material(0x172f48, 0.34, 0.18));
  deck.position.y = 0.39;
  group.add(deck);
  const centerStripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 2.45), material(0xffdf8c));
  centerStripe.position.y = 0.43;
  group.add(centerStripe);
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.38), material(0xe6edf0));
    fin.position.set(side * 0.23, 0.04, 1.05);
    group.add(fin);
  }

  const skin = material(0x9a6146, 0.83);
  const shirt = material(0xffc84d, 0.78);
  const shorts = material(0x183c62, 0.7);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.58, 5, 10), shirt);
  torso.position.y = 1.38;
  torso.castShadow = true;
  group.add(torso);
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.66, 0.42), material(0xf4ad36));
  vest.position.set(0, 1.4, 0.02);
  group.add(vest);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.42), material(0x253b52));
  belt.position.y = 1.04;
  group.add(belt);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 20, 16), skin);
  head.position.y = 2.14;
  head.castShadow = true;
  group.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.325, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), material(0x25232b));
  hair.position.set(0, 2.24, 0.02);
  group.add(hair);
  const facePatch = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.04), material(0x422d29));
  facePatch.position.set(0, 2.12, -0.285);
  group.add(facePatch);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.54, 4, 8), skin);
    arm.position.set(side * 0.46, 1.4, -0.03);
    arm.rotation.z = side * 0.46;
    group.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), skin);
    hand.position.set(side * 0.64, 1.09, -0.04);
    group.add(hand);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.42, 4, 8), shorts);
    leg.position.set(side * 0.17, 0.76, 0.05);
    leg.rotation.x = -0.12;
    group.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.36), material(0x202b37));
    foot.position.set(side * 0.17, 0.48, -0.16);
    group.add(foot);
  }
  return group;
}

const LANES = [-5.35, 0, 5.35];
const player = makeRider();
scene.add(player);
player.position.set(0, 0, 3);

const remotePlayers = new Map();
const bottleMaterial = material(0x42dcf5, 0.17, 0.22);
function makeBottle() {
  const g = new THREE.Group();
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.72, 12), bottleMaterial);
  bottle.position.y = 0.42;
  g.add(bottle);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 0.18, 12), material(0x9cefff, 0.18));
  shoulder.position.y = 0.87;
  g.add(shoulder);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.13, 10), material(0x176da0));
  cap.position.y = 1.02;
  g.add(cap);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.035, 7, 20), new THREE.MeshBasicMaterial({ color: 0x9af6ff }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.13;
  g.add(ring);
  return g;
}

function makeWatercraft(jet = false) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.CapsuleGeometry(jet ? 0.62 : 0.82, jet ? 1.8 : 2.7, 5, 12),
    material(jet ? 0xf05b52 : 0xf2eee0, 0.28, 0.18)
  );
  hull.scale.set(0.86, 1, 0.42);
  hull.rotation.x = Math.PI / 2;
  hull.position.y = 0.28;
  hull.castShadow = true;
  g.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(jet ? 1.0 : 1.55, 0.22, jet ? 2.15 : 3.0), material(jet ? 0x1b354a : 0x28738a, 0.36));
  deck.position.y = 0.55;
  g.add(deck);
  if (jet) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.46, 0.78), material(0x263344));
    seat.position.set(0, 0.88, 0.03);
    g.add(seat);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.055, 7, 16), material(0x202a35));
    handle.position.set(0, 1.06, -0.76);
    g.add(handle);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.27, 0.5, 10), material(0x738b98, 0.25, 0.4));
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(0, 0.25, 1.3);
    g.add(nozzle);
  } else {
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.82, 1.28), material(0xf1e9d8, 0.34));
    cabin.position.set(0, 1.0, -0.1);
    g.add(cabin);
    const window = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.38, 0.05), material(0x51b9d1, 0.2, 0.2));
    window.position.set(0, 1.13, -0.77);
    g.add(window);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.5), material(0xffc05d, 0.5));
    roof.position.y = 1.45;
    g.add(roof);
  }
  return g;
}

const items = [];
const coins = [];
const obstacles = [];
function addBottle(lane, z) {
  const mesh = makeBottle();
  mesh.position.set(LANES[lane], 0.12, z);
  scene.add(mesh);
  items.push({ mesh, z, lane, type: 'bottle' });
}
function addCoin(lane, z) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.105, 8, 20), material(0xffd34d, 0.22, 0.62));
  mesh.position.set(LANES[lane], 1.05, z);
  mesh.rotation.y = Math.PI / 2;
  scene.add(mesh);
  coins.push({ mesh, z, lane });
}
function addObstacle(lane, z, jet) {
  const mesh = makeWatercraft(jet);
  mesh.position.set(LANES[lane], 0, z);
  scene.add(mesh);
  obstacles.push({ mesh, z, lane, jet, phase: Math.random() * 7 });
}
for (let i = 0; i < 39; i++) {
  const z = -24 - i * 12.5;
  const lane = (i * 7 + 1) % 3;
  if (i % 5 === 0) addBottle(lane, z);
  else if (i % 3 === 0) addCoin(lane, z);
  else addObstacle(lane, z, i % 2 === 0);
}
for (let i = 0; i < 24; i++) addCoin(i % 3, -38 - i * 17);

const state = {
  lane: 1, x: 0, vy: 0, jumping: false, slide: 0,
  speed: 22, distance: 0, coins: 0, bottles: 0,
  turboTime: 0, alive: true, running: false, elapsed: 0
};
const ui = {
  ping: document.getElementById('ping'),
  fps: document.getElementById('fps'),
  speed: document.getElementById('speed'),
  distance: document.getElementById('distance'),
  coins: document.getElementById('coins'),
  bottles: document.getElementById('bottle-count'),
  cells: [...document.querySelectorAll('.turbo-cells i')],
  turbo: document.getElementById('turbo-button'),
  toast: document.getElementById('toast'),
  net: document.getElementById('net-status'),
  dot: document.querySelector('.status-dot'),
  lobby: document.getElementById('lobby'),
  lobbyStatus: document.getElementById('lobby-status'),
  lobbyCount: document.getElementById('lobby-player-count'),
  lobbySlots: document.getElementById('lobby-slots')
};

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ui.toast.classList.remove('show'), 1450);
}
function setConnection(label, color) {
  ui.net.textContent = label;
  ui.lobbyStatus.textContent = label;
  ui.dot.style.background = color;
  ui.dot.style.boxShadow = '0 0 10px ' + color;
}
function updateLobbyRoster() {
  const count = Math.min(3, remotePlayers.size + 1);
  ui.lobbyCount.textContent = count + ' / 3 PILOTOS NA SALA';
  const labels = ['VOCÊ', 'PILOTO 02', 'PILOTO 03'];
  ui.lobbySlots.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'lobby-slot' + (i < count ? ' is-filled' : '');
    slot.innerHTML = '<span class="slot-avatar">' + (i === 0 ? 'W' : '✦') + '</span><span>' +
      (i < count ? labels[i] : 'AGUARDANDO PILOTO') + '</span><i></i>';
    ui.lobbySlots.appendChild(slot);
  }
}
updateLobbyRoster();

function changeLane(direction) {
  const oldLane = state.lane;
  state.lane = THREE.MathUtils.clamp(state.lane + direction, 0, 2);
  state.x = LANES[state.lane];
  if (oldLane !== state.lane) {
    player.position.x = state.x;
    player.rotation.z = direction * -0.12;
  }
}
function jump() {
  if (!state.jumping && state.running && state.alive) {
    state.vy = 8.1;
    state.jumping = true;
  }
}
function slide() {
  if (state.running && state.alive) state.slide = 0.72;
}
function turbo() {
  if (state.running && state.bottles >= 5 && state.turboTime <= 0) {
    state.bottles = 0;
    state.turboTime = 3.25;
    toast('TURBO ATIVADO!');
  }
}
function startRace() {
  if (state.running) return;
  state.running = true;
  document.body.classList.remove('in-lobby');
  ui.lobby.classList.add('hidden');
  toast('BOA ONDA! DESVIE COM GESTOS');
}
document.getElementById('start-game').addEventListener('click', startRace);
document.getElementById('training-mode').addEventListener('click', startRace);
document.getElementById('turbo-button').addEventListener('click', turbo);
document.getElementById('restart').addEventListener('click', () => location.reload());

document.addEventListener('selectstart', event => event.preventDefault());
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('dragstart', event => event.preventDefault());

const canvas = renderer.domElement;
let swipeStart = null;
canvas.addEventListener('pointerdown', event => {
  if (!state.running || event.pointerType === 'mouse') return;
  event.preventDefault();
  swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  try { canvas.setPointerCapture(event.pointerId); } catch {}
}, { passive: false });
canvas.addEventListener('pointerup', event => {
  if (!swipeStart || swipeStart.id !== event.pointerId) return;
  event.preventDefault();
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.12) {
    changeLane(dx > 0 ? 1 : -1);
  } else if (Math.abs(dy) > 42 && Math.abs(dy) > Math.abs(dx)) {
    if (dy < 0) jump();
    else slide();
  }
}, { passive: false });
canvas.addEventListener('pointercancel', () => { swipeStart = null; });

const heldKeys = new Set();
addEventListener('keydown', event => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault();
  if (event.repeat || heldKeys.has(event.code)) return;
  heldKeys.add(event.code);
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') changeLane(-1);
  if (event.code === 'ArrowRight' || event.code === 'KeyD') changeLane(1);
  if (event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') jump();
  if (event.code === 'ArrowDown' || event.code === 'KeyS') slide();
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') turbo();
});
addEventListener('keyup', event => heldKeys.delete(event.code));

function addRemote(id) {
  if (remotePlayers.has(id)) return;
  const mesh = makeRider(0x33c8e2);
  mesh.scale.setScalar(0.91);
  scene.add(mesh);
  remotePlayers.set(id, { mesh, target: new THREE.Vector3(0, 0, -5), distance: 0 });
  updateLobbyRoster();
}

const nativeApp = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const defaultServer = 'wss://wave-runner-online.onrender.com/ws';
const networkUrl = window.WAVE_RUNNER_WS_URL || (nativeApp ? defaultServer : protocol + '://' + location.host + '/ws');
let network = null;
let playerId = null;
let reconnectTimer = 0;
let sendClock = 0;
let pingClock = 0;
let fpsFrames = 0;
let fpsClock = 0;
let fpsValue = 60;
let last = performance.now();

function connect() {
  if (network && (network.readyState === WebSocket.CONNECTING || network.readyState === WebSocket.OPEN)) return;
  setConnection('CONECTANDO', '#ffc65c');
  try {
    network = new WebSocket(networkUrl);
    network.onopen = () => {
      network.send(JSON.stringify({ type: 'join', room: 'river-rush-3' }));
    };
    network.onmessage = event => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }
      if (data.type === 'welcome') {
        playerId = data.id;
        setConnection('ONLINE', '#55f2a8');
        updateLobbyRoster();
      }
      if (data.type === 'room-full') {
        setConnection('SALA CHEIA', '#ff9b66');
        toast('SALA CHEIA — TENTE NOVAMENTE');
        network.close();
        return;
      }
      if (data.type === 'pong') {
        ui.ping.textContent = Math.max(0, Math.round(performance.now() - data.sentAt)) + ' ms';
      }
      if (data.type === 'snapshot') {
        const ids = new Set();
        for (const remote of data.players || []) {
          if (remote.id === playerId) continue;
          ids.add(remote.id);
          addRemote(remote.id);
          const rider = remotePlayers.get(remote.id);
          const relative = THREE.MathUtils.clamp((remote.distance || 0) - state.distance, -135, 135);
          rider.target.set(
            LANES.reduce((best, lane) => Math.abs(lane - remote.x) < Math.abs(best - remote.x) ? lane : best, LANES[1]),
            remote.y || 0,
            3 - relative * 0.17
          );
          rider.distance = remote.distance || 0;
        }
        for (const [id, rider] of remotePlayers) {
          if (!ids.has(id)) {
            scene.remove(rider.mesh);
            remotePlayers.delete(id);
          }
        }
        updateLobbyRoster();
        const count = Math.min(3, (data.players || []).length);
        ui.lobbyCount.textContent = count + ' / 3 PILOTOS NA SALA';
      }
    };
    network.onclose = () => {
      network = null;
      playerId = null;
      setConnection('RECONECTANDO', '#ffc65c');
      updateLobbyRoster();
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 4500);
    };
    network.onerror = () => {
      if (network) network.close();
    };
  } catch {
    setConnection('OFFLINE', '#ff9b66');
  }
}
connect();

function updateRiver(time) {
  const positions = riverGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = riverBase[i * 3];
    const z = riverBase[i * 3 + 2];
    positions.array[i * 3 + 1] =
      Math.sin(x * 0.25 + time * 1.15) * 0.13 +
      Math.sin(z * 0.075 - time * 1.5) * 0.15 +
      Math.sin((x + z) * 0.045 + time * 0.8) * 0.06;
  }
  positions.needsUpdate = true;
  riverGeometry.computeVertexNormals();
}

function update(dt, time) {
  state.elapsed += dt;
  updateRiver(time);

  if (state.running && state.alive) {
    state.distance += state.speed * dt;
    state.x = LANES[state.lane];
    player.position.x = state.x;
    state.vy -= 18.5 * dt;
    let jumpHeight = player.position.y + state.vy * dt;
    if (jumpHeight <= 0) {
      jumpHeight = 0;
      state.vy = 0;
      state.jumping = false;
    }
    player.position.y = jumpHeight + Math.sin(time * 5) * 0.035;
    state.slide = Math.max(0, state.slide - dt);
    player.scale.y = state.slide > 0 ? 0.76 : 1;
    player.rotation.z = THREE.MathUtils.damp(player.rotation.z, 0, 9, dt);
    player.rotation.x = THREE.MathUtils.damp(player.rotation.x, Math.sin(time * 7) * 0.018, 3, dt);

    const boosted = state.turboTime > 0;
    if (boosted) {
      state.turboTime = Math.max(0, state.turboTime - dt);
      state.speed = 37;
    } else {
      state.speed = THREE.MathUtils.damp(state.speed, 22, 1.8, dt);
    }

    const travel = state.speed * dt;
    for (const group of [items, coins, obstacles]) {
      for (const object of group) {
        object.z += travel;
        object.mesh.position.z = object.z;
        if (object.type === 'bottle') {
          object.mesh.rotation.y += dt * 1.7;
          object.mesh.position.y = 0.15 + Math.sin(time * 3 + object.z) * 0.13;
        } else if (object.mesh.rotation) {
          object.mesh.rotation.y += dt * 0.55;
        }
        if (object.jet) object.mesh.rotation.z = Math.sin(time * 1.25 + object.phase) * 0.07;

        const dx = Math.abs(object.mesh.position.x - player.position.x);
        const dz = Math.abs(object.z - player.position.z);
        if (group === items && dz < 1.65 && dx < 1.35) {
          object.z = 9999;
          object.mesh.visible = false;
          state.bottles = Math.min(5, state.bottles + 1);
          toast('GARRAFA PRESSURIZADA +1');
        } else if (group === coins && dz < 1.55 && dx < 1.35) {
          object.z = 9999;
          object.mesh.visible = false;
          state.coins++;
        } else if (group === obstacles && dz < 1.75 && dx < 1.42 && player.position.y < 1.2 && state.slide <= 0 && !boosted) {
          state.speed = Math.max(9, state.speed * 0.64);
          toast('OBSTÁCULO! DESVIE COM UM GESTO');
          object.z = 9999;
          object.mesh.visible = false;
        }

        if (object.z > 18) {
          object.z = -455 - Math.random() * 35;
          object.lane = Math.floor(Math.random() * 3);
          object.mesh.position.x = LANES[object.lane];
          object.mesh.visible = true;
          if (object.phase !== undefined) object.phase = Math.random() * 8;
        }
      }
    }

    ui.speed.textContent = Math.round(state.speed * 3.6);
    ui.distance.textContent = Math.floor(state.distance) + ' m';
    ui.coins.textContent = String(state.coins).padStart(3, '0');
    ui.bottles.textContent = state.bottles + ' / 5';
    ui.cells.forEach((cell, index) => cell.classList.toggle('filled', index < state.bottles));
    ui.turbo.classList.toggle('ready', state.bottles >= 5);
    document.getElementById('race-progress').style.width = ((state.distance % 1200) / 12) + '%';

    if (network && network.readyState === WebSocket.OPEN) {
      sendClock += dt;
      pingClock += dt;
      if (sendClock >= 0.09) {
        sendClock = 0;
        network.send(JSON.stringify({
          type: 'state', x: player.position.x, y: player.position.y,
          z: player.position.z, distance: state.distance, coins: state.coins
        }));
      }
      if (pingClock >= 2) {
        pingClock = 0;
        network.send(JSON.stringify({ type: 'ping', sentAt: performance.now() }));
      }
    }
  }

  for (const remote of remotePlayers.values()) {
    remote.mesh.position.lerp(remote.target, Math.min(1, dt * 8));
    remote.mesh.lookAt(remote.mesh.position.x, 1.15, remote.mesh.position.z - 4);
  }

  camera.position.x = THREE.MathUtils.damp(camera.position.x, player.position.x * 0.24, 4.2, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, 6.1 + player.position.y * 0.1, 3.5, dt);
  camera.lookAt(player.position.x * 0.16, 1.15, -8.8);
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.04, (now - last) / 1000);
  last = now;
  fpsFrames++;
  fpsClock += dt;
  if (fpsClock >= 0.65) {
    fpsValue = Math.round(fpsFrames / fpsClock);
    ui.fps.textContent = fpsValue;
    fpsFrames = 0;
    fpsClock = 0;
  }
  update(dt, now * 0.001);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

setTimeout(() => {
  const loading = document.getElementById('loading');
  loading.style.opacity = 0;
  setTimeout(() => loading.remove(), 650);
}, 900);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(max-width: 700px)').matches ? 1.35 : 1.8));
});
