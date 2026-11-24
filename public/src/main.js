import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// WAVE RUNNER — River Rush
const root = document.getElementById('game');
const isMobile = matchMedia('(max-width: 700px)').matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x77c5df);
scene.fog = new THREE.Fog(0x77c5df, 82, 330);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 700);
camera.position.set(0, 6.8, 13.6);

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

// Elementos do cenário acompanham o avanço do piloto e são reciclados para manter o rio contínuo.
const sceneryObjects = [];
const longWorldObjects = [];

const riverGeometry = new THREE.PlaneGeometry(33, 520, 42, 128);
riverGeometry.rotateX(-Math.PI / 2);
const river = new THREE.Mesh(riverGeometry, waterMaterial);
river.position.set(0, -0.22, -205);
river.receiveShadow = true;
scene.add(river);
longWorldObjects.push(river);
const riverBase = riverGeometry.attributes.position.array.slice();

const bed = new THREE.Mesh(new THREE.PlaneGeometry(38, 525), material(0x315e60, 1));
bed.rotation.x = -Math.PI / 2;
bed.position.set(0, -2.25, -205);
scene.add(bed);
longWorldObjects.push(bed);

// Margens que fecham o rio: as três faixas jogáveis ficam sempre dentro delas.
for (const side of [-1, 1]) {
  const bank = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.2, 525), stone);
  bank.position.set(side * 17.2, 0.72, -205);
  bank.castShadow = true;
  bank.receiveShadow = true;
  scene.add(bank);
  longWorldObjects.push(bank);

  const coping = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 525), stoneLight);
  coping.position.set(side * 17.2, 2.42, -205);
  coping.castShadow = true;
  scene.add(coping);
  longWorldObjects.push(coping);

  const outerGround = new THREE.Mesh(new THREE.PlaneGeometry(110, 525), grass);
  outerGround.rotation.x = -Math.PI / 2;
  outerGround.position.set(side * 72, -0.72, -205);
  outerGround.receiveShadow = true;
  scene.add(outerGround);
  longWorldObjects.push(outerGround);

  const waterline = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.16, 520),
    new THREE.MeshBasicMaterial({ color: 0x9ef3e8, transparent: true, opacity: 0.48 })
  );
  waterline.position.set(side * 16.45, 0.03, -205);
  scene.add(waterline);
  longWorldObjects.push(waterline);
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
  sceneryObjects.push(g);
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
  sceneryObjects.push(g);
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
  sceneryObjects.push(g);
}

function makeRiverTree(side, z, index) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 2.8, 7), wood);
  trunk.position.y = 1.25;
  g.add(trunk);
  const crownMat = material([0x2d7659, 0x438b62, 0x5b9b67][index % 3], 0.92);
  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25 - i * 0.12, 1), crownMat);
    crown.position.set((i - 1) * 0.55, 2.8 + (i % 2) * 0.45, (i % 2) * 0.35);
    crown.castShadow = true;
    g.add(crown);
  }
  const planter = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.18, 0.48, 8), stone);
  planter.position.y = 0.12;
  g.add(planter);
  g.position.set(side * (31.5 + (index % 2) * 1.4), -0.45, z);
  scene.add(g);
  sceneryObjects.push(g);
}

function makeDock(side, z, index) {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.28, 3.6), wood);
  deck.position.set(-side * 1.1, 0.18, 0);
  deck.castShadow = true;
  g.add(deck);
  for (let x = -3.2; x <= 1.2; x += 1.1) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 3.45), material(0xb58a61));
    plank.position.set(x, 0.34, 0);
    g.add(plank);
  }
  for (const x of [-3.25, 1.05]) {
    for (const zPost of [-1.35, 1.35]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.65, 7), wood);
      post.position.set(x, -0.42, zPost);
      g.add(post);
    }
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.09, 8, 20), material(index % 2 ? 0xffb75d : 0xf3eee0, 0.48));
  ring.position.set(-side * 1.1, 0.58, 1.0);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  g.position.set(side * 13.2, 0, z);
  scene.add(g);
  sceneryObjects.push(g);
}

for (let i = 0; i < 14; i++) {
  const z = -28 - i * 35;
  makeHouse(-1, z, i);
  makeHouse(1, z - 12, i + 3);
  makeLamp(-1, z - 16);
  makeLamp(1, z - 5);
  if (i % 2 === 0) makeRiverTree(-1, z - 10, i);
  if (i % 2 === 1) makeRiverTree(1, z - 18, i);
  if (i % 3 === 0) makeDock(i % 2 ? -1 : 1, z - 24, i);
}
makeBridge(-105, 0);
makeBridge(-225, 1);
makeBridge(-345, 2);
makeBridge(-465, 3);

// Small submerged posts and old stone details add depth below the waterline.
for (const side of [-1, 1]) {
  for (let i = 0; i < 14; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.58, 2.5, 8), material(0x617d7c, 0.95));
    post.position.set(side * (13.8 + (i % 2) * 0.5), -1.45, -18 - i * 26);
    scene.add(post);
    longWorldObjects.push(post);
  }
}

function makeRider(boardColor = 0xff7047) {
  const group = new THREE.Group();
  const boardMaterial = material(boardColor, 0.22, 0.42);
  boardMaterial.emissive.set(0x001320);
  boardMaterial.emissiveIntensity = 0.14;
  const board = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.7, 6, 14), boardMaterial);
  board.scale.set(0.84, 1.0, 0.16);
  board.rotation.x = Math.PI / 2;
  board.position.y = 0.25;
  board.castShadow = true;
  group.add(board);

  const specialAura = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.055, 8, 28), new THREE.MeshBasicMaterial({ color: 0x66f4ff, transparent: true, opacity: 0.88, depthWrite: false }));
  specialAura.rotation.x = Math.PI / 2;
  specialAura.position.y = 0.48;
  specialAura.visible = false;
  group.add(specialAura);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 2.55), material(0x172f48, 0.28, 0.28));
  deck.position.y = 0.39;
  group.add(deck);
  const centerStripe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.028, 2.42), material(0xffdf8c, 0.3, 0.4));
  centerStripe.position.y = 0.43;
  group.add(centerStripe);
  const noseMark = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 5), material(0xffffff, 0.24, 0.2));
  noseMark.rotation.x = -Math.PI / 2;
  noseMark.position.set(0, 0.43, -1.18);
  group.add(noseMark);
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.38), material(0xe6edf0, 0.32, 0.25));
    fin.position.set(side * 0.23, 0.04, 1.05);
    group.add(fin);
  }

  const body = new THREE.Group();
  group.add(body);
  const skin = material(0x9a6146, 0.78);
  const shirt = material(0xffc84d, 0.72);
  const shorts = material(0x183c62, 0.66);
  const darkCloth = material(0x123149, 0.72);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.58, 6, 12), shirt);
  torso.position.y = 1.38;
  torso.castShadow = true;
  body.add(torso);

  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.68, 0.43), material(0xf2a930, 0.58));
  vest.position.set(0, 1.4, 0.02);
  vest.castShadow = true;
  body.add(vest);
  const vestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.105, 0.445), material(0xffedac, 0.5));
  vestStripe.position.set(0, 1.5, -0.01);
  body.add(vestStripe);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.12, 0.43), darkCloth);
  belt.position.y = 1.04;
  body.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.045), material(0xffdc83, 0.3, 0.45));
  buckle.position.set(0, 1.04, -0.24);
  body.add(buckle);

  // A compact flotation pack makes the rider readable from the chase camera.
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.52, 0.27), material(0x1b536c, 0.65, 0.1));
  pack.position.set(0, 1.43, 0.31);
  pack.castShadow = true;
  body.add(pack);
  const packTop = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.29), material(0x65d9e7, 0.42, 0.15));
  packTop.position.set(0, 1.72, 0.31);
  body.add(packTop);
  for (const side of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.7, 0.055), material(0x263f50, 0.6));
    strap.position.set(side * 0.25, 1.42, 0.255);
    strap.rotation.z = side * -0.12;
    body.add(strap);
  }
  const numberPlate = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.2, 0.04), material(0x0e3d57, 0.42));
  numberPlate.position.set(0, 1.36, 0.465);
  body.add(numberPlate);
  const numberLine = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.035, 0.02), material(0x77edff, 0.35, 0.25));
  numberLine.position.set(0, 1.36, 0.491);
  body.add(numberLine);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 24, 18), skin);
  head.position.y = 2.14;
  head.castShadow = true;
  body.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.325, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56), material(0x25232b, 0.9));
  hair.position.set(0, 2.24, 0.02);
  body.add(hair);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 10), skin);
  neck.position.y = 1.91;
  body.add(neck);

  const armPivots = [];
  const legPivots = [];
  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.43, 1.68, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.112, 0.48, 5, 9), skin);
    arm.position.set(side * 0.035, -0.31, -0.015);
    arm.rotation.z = side * -0.1;
    arm.castShadow = true;
    armPivot.add(arm);
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.115, 0.15, 8), material(0xd99d72));
    wrist.position.set(side * 0.045, -0.57, -0.02);
    armPivot.add(wrist);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 9), skin);
    hand.position.set(side * 0.05, -0.66, -0.025);
    armPivot.add(hand);
    body.add(armPivot);
    armPivots.push(armPivot);

    const legPivot = new THREE.Group();
    legPivot.position.set(side * 0.17, 0.91, 0.04);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.38, 5, 9), shorts);
    leg.position.y = -0.25;
    leg.castShadow = true;
    legPivot.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.39), material(0x26333e, 0.55));
    shoe.position.set(0, -0.49, -0.13);
    legPivot.add(shoe);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.035, 0.39), material(0xe5e9e5, 0.78));
    sole.position.set(0, -0.57, -0.13);
    legPivot.add(sole);
    body.add(legPivot);
    legPivots.push(legPivot);
  }

  group.userData.body = body;
  group.userData.armPivots = armPivots;
  group.userData.legPivots = legPivots;
  group.userData.board = board;
  group.userData.specialAura = specialAura;
  group.userData.frustumCulled = false;
  group.traverse(node => { if (node.isMesh) node.frustumCulled = false; });
  return group;
}

const LANES = [-5.35, 0, 5.35];
const player = makeRider();
scene.add(player);
player.position.set(0, 0, 3);

// Anel reutilizado como efeito visual quando o jet ski especial destrói um obstáculo.
const smashFlash = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.1, 8, 24), new THREE.MeshBasicMaterial({ color: 0x72f8ff, transparent: true, opacity: 0.9, depthWrite: false }));
smashFlash.rotation.x = Math.PI / 2;
smashFlash.visible = false;
scene.add(smashFlash);
let smashFlashTime = 0;

const remotePlayers = new Map();

// Reusable wake particles. Kept as a tiny pool to avoid allocating meshes every frame.
const wakeParticles = [];
for (let i = 0; i < 12; i++) {
  const wakeMat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xd9ffff : 0x76eaff, transparent: true, opacity: 0.2, depthWrite: false });
  const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 4) * 0.035, 8, 6), wakeMat);
  puff.visible = false;
  scene.add(puff);
  wakeParticles.push(puff);
}

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
  mesh.scale.setScalar(jet ? 1.28 : 1.38);
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

let savedWallet = 0;
let savedSpecialJetSki = false;
try {
  const rawWallet = Number.parseInt(localStorage.getItem('wave_runner_coins') || '0', 10);
  savedWallet = Number.isFinite(rawWallet) ? Math.max(0, rawWallet) : 0;
  savedSpecialJetSki = localStorage.getItem('wave_runner_special_jetski') === 'true';
} catch {}

const state = {
  lane: 1, x: 0, targetX: 0, jumpY: 0, vy: 0, jumping: false, slide: 0, lean: 0,
  speed: 22, distance: 0, coins: savedWallet, runCoins: 0, bottles: 0,
  turboTime: 0, specialJetski: savedSpecialJetSki, alive: true, running: false, elapsed: 0
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
  lobbySlots: document.getElementById('lobby-slots'),
  finish: document.getElementById('finish'),
  finishTitle: document.getElementById('finish-title'),
  finishCopy: document.getElementById('finish-copy'),
  finalDistance: document.getElementById('final-distance'),
  finalCoins: document.getElementById('final-coins'),
  shop: document.getElementById('shop-modal'),
  shopBalance: document.getElementById('shop-balance'),
  shopStatus: document.getElementById('shop-status'),
  buySpecial: document.getElementById('buy-special')
};

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ui.toast.classList.remove('show'), 1450);
}

const SPECIAL_JETSKI_PRICE = 100;
let shopReturnToRace = false;
function saveWallet() {
  try { localStorage.setItem('wave_runner_coins', String(state.coins)); } catch {}
}
function applySpecialJetSkiLook() {
  const boardMaterial = player.userData.board.material;
  if (state.specialJetski) {
    boardMaterial.color.set(0x18cce8);
    boardMaterial.emissive.set(0x075a73);
    boardMaterial.emissiveIntensity = 0.72;
    player.userData.specialAura.visible = true;
  } else {
    boardMaterial.color.set(0xff7047);
    boardMaterial.emissive.set(0x001320);
    boardMaterial.emissiveIntensity = 0.14;
    player.userData.specialAura.visible = false;
  }
}
function refreshShop() {
  ui.shopBalance.textContent = String(state.coins);
  if (state.specialJetski) {
    ui.buySpecial.textContent = 'JET SKI ESPECIAL COMPRADO';
    ui.buySpecial.disabled = true;
    ui.shopStatus.textContent = 'Equipado! Você destrói obstáculos ao encostar neles.';
  } else {
    ui.buySpecial.textContent = state.coins >= SPECIAL_JETSKI_PRICE ? 'COMPRAR • 100 MOEDAS' : 'FALTAM ' + (SPECIAL_JETSKI_PRICE - state.coins) + ' MOEDAS';
    ui.buySpecial.disabled = state.coins < SPECIAL_JETSKI_PRICE;
    ui.shopStatus.textContent = 'Colete moedas durante as corridas para desbloquear o jet ski.';
  }
}
function openShop() {
  shopReturnToRace = state.running;
  if (state.running) state.running = false;
  refreshShop();
  ui.shop.classList.remove('hidden');
}
function closeShop() {
  ui.shop.classList.add('hidden');
  if (shopReturnToRace && state.alive) state.running = true;
  shopReturnToRace = false;
}
function buySpecialJetSki() {
  if (state.specialJetski) return;
  if (state.coins < SPECIAL_JETSKI_PRICE) {
    refreshShop();
    return;
  }
  state.coins -= SPECIAL_JETSKI_PRICE;
  state.specialJetski = true;
  saveWallet();
  try { localStorage.setItem('wave_runner_special_jetski', 'true'); } catch {}
  applySpecialJetSkiLook();
  refreshShop();
  ui.coins.textContent = String(state.coins).padStart(3, '0');
  toast('JET SKI ESPECIAL DESBLOQUEADO!');
}
function finishRace(message) {
  if (!state.alive) return;
  state.alive = false;
  state.running = false;
  state.speed = 0;
  ui.finishTitle.textContent = 'VOCÊ BATEU!';
  ui.finishCopy.textContent = message;
  ui.finalDistance.textContent = Math.floor(state.distance) + ' m';
  ui.finalCoins.textContent = String(state.runCoins);
  ui.finish.classList.remove('hidden');
}
applySpecialJetSkiLook();
ui.coins.textContent = String(state.coins).padStart(3, '0');
document.getElementById('shop-open')?.addEventListener('click', openShop);
document.getElementById('shop-open-lobby')?.addEventListener('click', openShop);
document.getElementById('shop-from-finish')?.addEventListener('click', openShop);
document.getElementById('shop-close')?.addEventListener('click', closeShop);
document.getElementById('buy-special')?.addEventListener('click', buySpecialJetSki);
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
  if (oldLane !== state.lane) {
    state.targetX = LANES[state.lane];
    state.lean = direction * -0.34;
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
  if (state.running || !state.alive) return;
  state.runCoins = 0;
  state.running = true;
  document.body.classList.remove('in-lobby');
  ui.lobby.classList.add('hidden');
  toast('BOA ONDA! DESVIE COM GESTOS');
}
document.getElementById('start-game').addEventListener('click', () => {
  offlineMode = false;
  if (!network || network.readyState !== WebSocket.OPEN) connect();
  startRace();
});
document.getElementById('training-mode').addEventListener('click', () => {
  offlineMode = true;
  clearTimeout(reconnectTimer);
  if (network) {
    const oldNetwork = network;
    network = null;
    oldNetwork.close();
  }
  playerId = null;
  for (const rider of remotePlayers.values()) scene.remove(rider.mesh);
  remotePlayers.clear();
  updateLobbyRoster();
  setConnection('OFFLINE • JOGO LOCAL', '#55f2a8');
  startRace();
  toast('MODO OFFLINE — BOA CORRIDA!');
});
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
let offlineMode = false;
let reconnectTimer = 0;
let sendClock = 0;
let pingClock = 0;
let fpsFrames = 0;
let fpsClock = 0;
let fpsValue = 60;
let lowFpsTime = 0;
let highFpsTime = 0;
let waterUpdateClock = 0;
let renderScale = Math.min(devicePixelRatio || 1, isMobile ? 1.25 : 1.65);
let last = performance.now();

function connect() {
  if (offlineMode) return;
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
      updateLobbyRoster();
      if (offlineMode) {
        setConnection('OFFLINE • JOGO LOCAL', '#55f2a8');
        return;
      }
      setConnection('RECONECTANDO', '#ffc65c');
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
  waterUpdateClock += dt;
  if (waterUpdateClock >= 1 / 30) {
    updateRiver(time);
    waterUpdateClock %= 1 / 30;
  }

  if (state.running && state.alive) {
    state.distance += state.speed * dt;
    // Lateral target eases toward the selected lane: no hard teleport.
    state.x = THREE.MathUtils.damp(state.x, state.targetX, 7.2, dt);
    state.x = THREE.MathUtils.clamp(state.x, LANES[0], LANES[2]);
    player.position.x = state.x;
    player.position.z = 3;
    player.visible = true;

    // Jump physics use an independent height value. The water bob is visual only,
    // so it cannot accumulate every frame and push the rider out of the camera.
    if (state.jumping) {
      state.vy -= 18.5 * dt;
      state.jumpY = Math.max(0, state.jumpY + state.vy * dt);
      if (state.jumpY <= 0) {
        state.vy = 0;
        state.jumping = false;
      }
    }
    player.position.y = state.jumpY + Math.sin(time * 6.2) * 0.022;
    state.slide = Math.max(0, state.slide - dt);
    const body = player.userData.body;
    if (body) {
      const slideFactor = state.slide > 0 ? 0.76 : 1;
      body.scale.y = THREE.MathUtils.damp(body.scale.y, slideFactor, 18, dt);
      body.position.y = THREE.MathUtils.damp(body.position.y, state.slide > 0 ? -0.22 : 0, 18, dt);
      const armSwing = Math.sin(time * 10) * (state.jumpY > 0.1 ? 0.34 : 0.1);
      player.userData.armPivots?.forEach((arm, i) => { arm.rotation.x = armSwing * (i ? -1 : 1); });
      player.userData.legPivots?.forEach((leg, i) => { leg.rotation.x = Math.sin(time * 9 + i * Math.PI) * (state.jumpY > 0.1 ? 0.32 : 0.07); });
    }
    state.lean = THREE.MathUtils.damp(state.lean, 0, 6.5, dt);
    player.rotation.z = THREE.MathUtils.damp(player.rotation.z, state.lean, 12, dt);
    player.rotation.x = THREE.MathUtils.damp(player.rotation.x, Math.sin(time * 7) * 0.018, 3, dt);

    for (let i = 0; i < wakeParticles.length; i++) {
      const puff = wakeParticles[i];
      const phase = time * 5.5 + i * 0.82;
      puff.visible = true;
      puff.position.set(player.position.x + Math.sin(phase) * (0.34 + i * 0.035), 0.075 + (i % 3) * 0.025, player.position.z + 1.0 + i * 0.22);
      const fade = 1 - i / wakeParticles.length;
      puff.material.opacity = fade * (state.turboTime > 0 ? 0.46 : 0.22);
      const size = 0.65 + Math.sin(phase) * 0.18 + (state.turboTime > 0 ? 0.3 : 0);
      puff.scale.setScalar(size);
    }

    const boosted = state.turboTime > 0;
    if (boosted) {
      state.turboTime = Math.max(0, state.turboTime - dt);
      state.speed = 37;
    } else {
      state.speed = THREE.MathUtils.damp(state.speed, 22, 1.8, dt);
    }

    const travel = state.speed * dt;
    for (const object of longWorldObjects) {
      object.position.z += travel;
      if (object.position.z > 55) object.position.z -= 520;
    }
    for (const object of sceneryObjects) {
      object.position.z += travel;
      if (object.position.z > 22) object.position.z -= 490;
    }
    for (const group of [items, coins, obstacles]) {
      for (const object of group) {
        if (!state.running || !state.alive) break;
        // Jet skis avançam mais depressa em direção ao piloto; barcos não giram.
        const objectTravel = travel * (object.jet ? 1.3 : 1);
        object.z += objectTravel;
        object.mesh.position.z = object.z;
        if (object.type === 'bottle') {
          object.mesh.rotation.y += dt * 1.7;
          object.mesh.position.y = 0.15 + Math.sin(time * 3 + object.z) * 0.13;
        } else if (group === coins) {
          object.mesh.rotation.z += dt * 1.8;
        }

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
          state.runCoins++;
          saveWallet();
          if (!ui.shop.classList.contains('hidden')) refreshShop();
        } else if (group === obstacles && dz < 2.2 && dx < 1.9) {
          if (state.specialJetski) {
            smashFlash.position.set(object.mesh.position.x, 0.85, object.z);
            smashFlash.scale.setScalar(0.38);
            smashFlash.material.opacity = 0.9;
            smashFlash.visible = true;
            smashFlashTime = 0.42;
            object.z = 9999;
            object.mesh.visible = false;
            toast('JET SKI ESPECIAL: OBSTÁCULO DESTRUÍDO!');
          } else {
            finishRace('Você atingiu um obstáculo. Desvie para as outras faixas na próxima corrida.');
            break;
          }
        }

        if (object.z > 18) {
          object.z = -455 - Math.random() * 35;
          object.lane = Math.floor(Math.random() * 3);
          object.mesh.position.x = LANES[object.lane];
          object.mesh.visible = true;
          if (object.phase !== undefined) object.phase = Math.random() * 8;
        }
      }
      if (!state.running || !state.alive) break;
    }

    ui.speed.textContent = Math.round(state.speed * 3.6);
    ui.distance.textContent = Math.floor(state.distance) + ' m';
    ui.coins.textContent = String(state.coins).padStart(3, '0');
    ui.bottles.textContent = state.bottles + ' / 5';
    ui.cells.forEach((cell, index) => cell.classList.toggle('filled', index < state.bottles));
    ui.turbo.classList.toggle('ready', state.bottles >= 5);
    document.getElementById('race-progress').style.width = ((state.distance % 1200) / 12) + '%';

    if (!offlineMode && network && network.readyState === WebSocket.OPEN) {
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

  if (smashFlashTime > 0) {
    smashFlashTime = Math.max(0, smashFlashTime - dt);
    const progress = 1 - smashFlashTime / 0.42;
    smashFlash.scale.setScalar(0.38 + progress * 1.5);
    smashFlash.material.opacity = smashFlashTime / 0.42;
    smashFlash.rotation.z += dt * 5.5;
  } else {
    smashFlash.visible = false;
  }

  if (!state.running) {
    player.visible = true;
    player.position.y = Math.sin(time * 2.2) * 0.025;
    player.rotation.z = Math.sin(time * 1.4) * 0.018;
  }

  for (const remote of remotePlayers.values()) {
    remote.mesh.visible = true;
    remote.mesh.position.lerp(remote.target, Math.min(1, dt * 7));
    remote.mesh.lookAt(remote.mesh.position.x, 1.15, remote.mesh.position.z - 4);
    const bob = remote.mesh.userData.body;
    if (bob) {
      remote.mesh.userData.armPivots?.forEach((arm, i) => { arm.rotation.x = Math.sin(time * 7 + i * Math.PI) * 0.08; });
      remote.mesh.userData.legPivots?.forEach((leg, i) => { leg.rotation.x = Math.sin(time * 7 + i * Math.PI) * 0.05; });
    }
  }

  camera.position.x = THREE.MathUtils.damp(camera.position.x, player.position.x * 0.48, 4.2, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, 6.8 + state.jumpY * 0.08, 3.2, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, 13.6, 2.5, dt);
  camera.lookAt(player.position.x * 0.32, 1.18, -9.8);
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
    if (fpsValue < 28) {
      lowFpsTime += fpsClock;
      highFpsTime = 0;
    } else if (fpsValue > 48) {
      highFpsTime += fpsClock;
      lowFpsTime = Math.max(0, lowFpsTime - fpsClock * 0.5);
    } else {
      lowFpsTime = Math.max(0, lowFpsTime - fpsClock * 0.25);
      highFpsTime = 0;
    }
    if (lowFpsTime > 3 && renderScale > 0.95) {
      renderScale = 0.95;
      renderer.setPixelRatio(renderScale);
      renderer.setSize(innerWidth, innerHeight, false);
      lowFpsTime = 0;
      toast('GRÁFICOS AJUSTADOS PARA MAIS FPS');
    } else if (highFpsTime > 8 && renderScale < Math.min(devicePixelRatio || 1, isMobile ? 1.25 : 1.65)) {
      renderScale = Math.min(devicePixelRatio || 1, isMobile ? 1.25 : 1.65);
      renderer.setPixelRatio(renderScale);
      renderer.setSize(innerWidth, innerHeight, false);
      highFpsTime = 0;
    }
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
  renderScale = Math.min(devicePixelRatio || 1, matchMedia('(max-width: 700px)').matches ? 1.25 : 1.65);
  renderer.setPixelRatio(renderScale);
});
