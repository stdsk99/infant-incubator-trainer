/* ===== ตู้อบทารกแบบ 3 มิติ =====
   หน่วย = เซนติเมตร (ประมาณ) แกน Y ขึ้น ด้านหน้าตู้หันไป +Z
   ทุกชิ้นสร้างจากรูปทรงพื้นฐาน ไม่ได้ใช้โมเดลของผู้ผลิต */
import * as THREE from "three";
import { OrbitControls } from "./lib/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "./lib/CSS2DRenderer.js";

const MODE = new URLSearchParams(location.search).get("mode") === "clin" ? "clin" : "tech";
const PARTS = Object.assign({}, window.PARTS || {}, window.EXTRA3D || {});
const CLIN = window.CLIN3D || {}, GROUPS = window.GROUPS3D || [];
/* โหมดจอแคบ: มือถือ แท็บเล็ตแนวตั้ง และมือถือที่เปิด "เว็บไซต์เดสก์ท็อป" (ต้องตรงกับ @media ใน style.css) */
const NARROW = matchMedia("(max-width:900px), (orientation:portrait) and (max-width:1200px)");
const MOBILE = NARROW.matches;

if (MODE === "clin") {
  const b = document.getElementById("back");
  b.href = "../clinical/#lessons"; b.textContent = "← กลับวิชาคลินิก";
}

/* ---------- renderer / scene ---------- */
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
stage.prepend(renderer.domElement);
const labelR = new CSS2DRenderer();
labelR.domElement.className = "labels";
stage.appendChild(labelR.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 1, 3000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.minDistance = 70; controls.maxDistance = 900;
controls.target.set(0, 100, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(140, 260, 180); scene.add(sun);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6); fill.position.set(-160, 120, -120); scene.add(fill);

/* เงานุ่มใต้ตู้ (ภาพไล่สี ไม่ใช้ shadow map เพื่อให้มือถือลื่น) */
{
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, "rgba(30,40,55,.35)"); gr.addColorStop(1, "rgba(30,40,55,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(190, 130), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.05; scene.add(m);
}

/* ---------- วัสดุ ---------- */
const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0.05 }, o));
const M = {
  shell: mat(0xe9edf1), shellDark: mat(0xc9d0d8), frame: mat(0xdfe4ea),
  stand: mat(0x6b7684, { metalness: 0.4, roughness: 0.4 }), steel: mat(0xb8c0c9, { metalness: 0.7, roughness: 0.3 }),
  rubber: mat(0x2b3138, { roughness: 0.9 }), dark: mat(0x3a4250), black: mat(0x1f242b),
  deck: mat(0xd5dbe2), slot: mat(0x5a6573), tray: mat(0xb9c3ce), mattress: mat(0x9fd3e6, { roughness: 0.8 }),
  skin: mat(0xf1c7a5, { roughness: 0.8 }), diaper: mat(0xffffff, { roughness: 0.9 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.2, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide }),
  glassIn: new THREE.MeshStandardMaterial({ color: 0xd6eeff, transparent: true, opacity: 0.1, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide }),
  pcb: mat(0x1f7a46, { roughness: 0.6 }), pcb2: mat(0x1d5f8f, { roughness: 0.6 }), chip: mat(0x22262c),
  relay: mat(0x2f6fd6), copper: mat(0xb87333, { metalness: 0.6, roughness: 0.35 }),
  fin: mat(0xc3cad2, { metalness: 0.75, roughness: 0.3 }), coil: mat(0xc2410c, { emissive: 0x3a0e00 }),
  water: new THREE.MeshStandardMaterial({ color: 0x5aa9e6, transparent: true, opacity: 0.7, roughness: 0.15 }),
  drawer: new THREE.MeshStandardMaterial({ color: 0xf5f7fa, transparent: true, opacity: 0.55, roughness: 0.2, depthWrite: false }),
  filter: mat(0xf4f1e6, { roughness: 0.95 }), o2: mat(0x2f9e5b), o2cell: mat(0xe9eef3, { metalness: 0.2 }),
  batt: mat(0x2b3a55), cable: mat(0x2b3138, { roughness: 0.7 }), probe: mat(0xd9dee4, { metalness: 0.6, roughness: 0.25 }),
  btn: mat(0x8fa0b3)
};
const glassMats = [M.glass, M.glassIn];

/* ---------- ตัวช่วยสร้างรูปทรง ---------- */
function box(w, h, d, m, x = 0, y = 0, z = 0, parent) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z);
  if (parent) parent.add(o); return o;
}
function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, parent, seg = 28) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z);
  if (parent) parent.add(o); return o;
}
function grp(parent, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }
function tag(obj, id) { obj.traverse(o => { if (o.isMesh) o.userData.part = id; }); }

/* ทุกโหนดที่ขยับได้ต้องลงทะเบียน: เก็บตำแหน่งตั้งต้นและเวกเตอร์ "แยกชิ้นส่วน" */
const nodes = [];
function reg(node, explode = [0, 0, 0]) {
  node.userData.base = { p: node.position.clone(), r: node.rotation.clone() };
  node.userData.ex = new THREE.Vector3(...explode);
  node.userData.fx = [];
  nodes.push(node); return node;
}

/* ========== สร้างตู้ ========== */
const partRoot = {};          // id ชิ้นส่วน -> กลุ่มที่ใช้ทำกรอบเลือก
const labelAt = {};           // id -> [โหนด, ตำแหน่ง]

/* --- ขาตั้งและเสา --- */
const standG = grp(scene); partRoot.stand = standG;
box(96, 5, 8, M.stand, 0, 9, 24, standG); box(96, 5, 8, M.stand, 0, 9, -24, standG); box(10, 5, 50, M.stand, 0, 9, 0, standG);
[[-44, 24], [44, 24], [-44, -24], [44, -24]].forEach(([x, z]) => {
  const w = cyl(4, 4, 3, M.rubber, x, 4, z, standG); w.rotation.z = Math.PI / 2;
  box(3, 4, 3, M.steel, x, 7.5, z, standG);
});
box(4, 1.5, 3, mat(0xd9480f), -40, 8.5, 29, standG);          // แป้นเบรก
box(17, 50, 17, M.stand, 0, 36, 0, standG);                 // เสานอก
const colIn = box(13, 30, 13, M.steel, 0, 60, 0, standG);     // เสาใน (ยืดได้)
reg(colIn);
labelAt.stand = [standG, [0, 34, 12]];

/* --- ตัวตู้ (ทุกอย่างเหนือเสา) --- */
const body = grp(scene, 0, 74, 0); reg(body);
/* ฐานตู้ (เปลือก) */
box(100, 2, 60, M.shellDark, 0, 1, 0, body);
box(100, 22, 2, M.shell, 0, 11, 29, body); box(100, 22, 2, M.shell, 0, 11, -29, body);
box(2, 22, 56, M.shell, -49, 11, 0, body); box(2, 22, 56, M.shell, 49, 11, 0, body);
/* ขอบบนฐาน (เป็นกรอบ ตรงกลางเปิดให้มองเห็นข้างในเมื่อยกแผ่นพื้นออก) */
box(102, 1.5, 3, M.frame, 0, 22.2, 29.5, body); box(102, 1.5, 3, M.frame, 0, 22.2, -29.5, body);
box(3, 1.5, 56, M.frame, -49.5, 22.2, 0, body); box(3, 1.5, 56, M.frame, 49.5, 22.2, 0, body);

/* --- จอและแผงปุ่ม --- */
const dispG = grp(body, -14, 11, 30.6); partRoot.display = dispG; reg(dispG, [0, 0, 14]);
dispG.rotation.x = -0.12; dispG.userData.base.r.x = -0.12;
box(34, 15, 1.6, M.dark, 0, 0, 0, dispG);
{
  const c = document.createElement("canvas"); c.width = 512; c.height = 160;
  const g = c.getContext("2d");
  g.fillStyle = "#0b1d1a"; g.fillRect(0, 0, 512, 160);
  g.fillStyle = "#7df2c8"; g.font = "bold 64px monospace"; g.fillText("36.5°C", 18, 78);
  g.font = "28px monospace"; g.fillStyle = "#cfe9e1"; g.fillText("AIR  SET 36.0", 290, 50); g.fillText("RH 60%  O2 30%", 290, 98);
  g.fillStyle = "#f4b740"; g.fillText("● RUN", 22, 136);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(20, 6.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
  s.position.set(-4, 2.5, 0.85); dispG.add(s);
}
for (let i = 0; i < 4; i++) { const b = cyl(1.1, 1.1, 0.8, M.btn, 9 + (i % 2) * 4, 3.5 - Math.floor(i / 2) * 4, 0.9, dispG, 16); b.rotation.x = Math.PI / 2; }
{ const k = cyl(2, 2, 1.2, M.black, -4, -4.5, 1, dispG, 24); k.rotation.x = Math.PI / 2; }
tag(dispG, "display"); labelAt.display = [dispG, [0, 9, 2]];

/* --- แผ่นกรองอากาศ (ปลายซ้าย) --- */
const filterG = grp(body, -48, 11, 0); partRoot.filter = filterG; reg(filterG, [-20, 0, 0]);
box(1.6, 15, 24, M.shellDark, -2.6, 0, 0, filterG);
box(4, 13, 21, M.filter, 0.5, 0, 0, filterG);
for (let i = -4; i <= 4; i++) box(4.2, 12.6, 0.4, mat(0xd8d2bd), 0.5, 0, i * 2.2, filterG);
for (let i = -2; i <= 2; i++) box(0.4, 1.2, 18, M.slot, -3.5, i * 2.6, 0, filterG);
tag(filterG, "filter"); labelAt.filter = [filterG, [-4, 9, 0]];

/* --- พัดลม --- */
const fanG = grp(body, -24, 0, 0); partRoot.fan = fanG; reg(fanG, [0, 10, 0]);
cyl(5, 5, 9, M.dark, 0, 7, 0, fanG);
{ const v = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 7, 32, 1, true), mat(0xaeb7c2, { side: THREE.DoubleSide })); v.position.y = 16.5; fanG.add(v); }
const impeller = grp(fanG, 0, 16.5, 0);
cyl(3, 3, 6, M.steel, 0, 0, 0, impeller);
for (let i = 0; i < 10; i++) { const b = box(6, 5.5, 0.5, mat(0x56627a), 0, 0, 0, impeller); const a = i / 10 * Math.PI * 2; b.position.set(Math.cos(a) * 5.6, 0, Math.sin(a) * 5.6); b.rotation.y = -a + 0.5; }
tag(fanG, "fan"); labelAt.fan = [fanG, [0, 21, 0]];

/* --- ฮีตเตอร์และครีบระบายความร้อน --- */
const heatG = grp(body, 2, 0, 0); partRoot.heater = heatG; reg(heatG, [0, 6, 10]);
box(20, 2, 24, M.fin, 0, 9, 0, heatG);
for (let i = 0; i < 9; i++) box(0.8, 8, 24, M.fin, -8 + i * 2, 14, 0, heatG);
for (let k = -1; k <= 1; k++) { const r = cyl(0.9, 0.9, 22, M.coil, 0, 15, k * 6, heatG, 14); r.rotation.z = Math.PI / 2; }
box(2.5, 2, 2.5, M.black, 11.5, 11, -9, heatG);                // เทอร์มิสเตอร์ heat sink
box(3, 2.4, 3, mat(0xd9480f), 11.5, 11, -4, heatG);           // thermal cutout
tag(heatG, "heater"); labelAt.heater = [heatG, [0, 20, 0]];

/* --- ระบบทำความชื้น: ห้องต้ม + ถังน้ำแบบลิ้นชัก --- */
const humidG = grp(body, 26, 0, 0); partRoot.humid = humidG;
const boiler = grp(humidG, 0, 0, 2); reg(boiler, [8, 4, -6]);
box(14, 10, 12, M.steel, 0, 8, 0, boiler);
cyl(1.4, 1.4, 8, M.steel, 0, 16.5, 0, boiler, 14);
box(16, 1.5, 3, M.coil, 0, 4, 0, boiler);
const drawer = grp(humidG, 0, 0, 21.2); reg(drawer, [0, 0, 22]);
box(19, 9, 17, M.drawer, 0, 7.5, 0, drawer);
box(18, 5, 16, M.water, 0, 5.8, 0, drawer);
box(21, 11, 1.2, M.shell, 0, 7.5, 9.6, drawer);
box(8, 1.6, 2, M.dark, 0, 9.5, 10.6, drawer);
box(2, 5, 0.2, mat(0x5aa9e6), 7, 7, 10.25, drawer);               // ขีดระดับน้ำ
tag(humidG, "humid"); labelAt.humid = [drawer, [0, 14, 9]];

/* --- ระบบ O₂ (ปลายขวา) --- */
const o2G = grp(body, 0, 0, 0); partRoot.o2 = o2G;
const valve = grp(o2G, 40, 0, 13); reg(valve, [8, 0, 8]);
box(8, 6, 7, M.o2, 0, 8, 0, valve); cyl(1, 1, 10, M.steel, -6, 8, 0, valve, 12).rotation.z = Math.PI / 2;
const cellA = grp(o2G, 43, 11, -6), cellB = grp(o2G, 43, 11, 3);
[cellA, cellB].forEach((c, i) => {
  reg(c, [26 + i * 6, 0, 0]);
  const b = cyl(2.4, 2.4, 9, M.o2cell, 0, 0, 0, c, 20); b.rotation.z = Math.PI / 2;
  const cap = cyl(2.6, 2.6, 1.5, M.o2, 4.6, 0, 0, c, 20); cap.rotation.z = Math.PI / 2;
});
const o2Cover = grp(o2G, 50.8, 11, 0); reg(o2Cover, [16, 0, 0]);
box(1.4, 15, 26, M.shellDark, 0, 0, 0, o2Cover);
{ const n = cyl(1.2, 1.2, 4, M.steel, 2.6, -3, 8, o2Cover, 12); n.rotation.z = Math.PI / 2; }
box(0.4, 4, 8, M.o2, 0.8, 4, -6, o2Cover);
tag(o2G, "o2"); labelAt.o2 = [o2Cover, [3, 10, 0]];

/* --- กล่อง air probe (ใต้แผ่นพื้น ใกล้ช่องลมด้านหน้า) --- */
const apG = grp(body, -4, 0, 17); partRoot.airprobe = apG; reg(apG, [0, 8, 8]);
box(9, 4, 6, M.dark, 0, 19, 0, apG);
cyl(0.5, 0.5, 3, M.probe, -2, 17, 0, apG, 10); cyl(0.5, 0.5, 3, M.probe, 2, 17, 0, apG, 10);
tag(apG, "airprobe"); labelAt.airprobe = [apG, [0, 22, 0]];

/* --- ถาดอิเล็กทรอนิกส์ (ด้านหลังซ้าย ดึงออกทางหลัง) --- */
const elecG = grp(body, -24, 0, -19); reg(elecG, [0, 0, -30]);
const trayE = box(42, 1, 18, M.steel, 0, 2.5, 0, elecG);
box(44, 10, 1.2, M.shellDark, 0, 7, -9.6, elecG);                       // แผ่นหลังและมือจับ
box(10, 1.6, 2, M.dark, 0, 8, -11, elecG);
const psuG = grp(elecG, -9, 0, 0); partRoot.psu = psuG; reg(psuG, [-6, 0, 0]);
box(18, 5, 13, mat(0x9aa3ad, { metalness: 0.5 }), 0, 5.5, 0, psuG);
cyl(3, 3, 4, M.copper, 3, 5.5, 0, psuG, 18);
tag(psuG, "psu"); labelAt.psu = [psuG, [0, 9, 0]];
const battG = grp(elecG, 13, 0, 3); partRoot.battery = battG; reg(battG, [8, 0, 4]);
box(9, 4, 6, M.batt, 0, 5, 0, battG); box(2, 0.6, 1, mat(0xd9480f), -2.5, 7.3, 0, battG);
tag(battG, "battery"); labelAt.battery = [battG, [0, 8, 0]];
const relayG = grp(elecG, 0, 9.5, 0); partRoot.relay = relayG; reg(relayG, [0, 7, 0]);
box(38, 0.8, 15, M.pcb2, 0, 0, 0, relayG);
for (let i = 0; i < 3; i++) box(4, 3, 3, M.relay, -12 + i * 6, 1.9, -3, relayG);
box(5, 2, 5, M.black, 10, 1.4, 2, relayG);                              // SSR
tag(relayG, "relay"); labelAt.relay = [relayG, [8, 4, 0]];
const ctrlG = grp(elecG, 0, 13, 0); partRoot.control = ctrlG; reg(ctrlG, [0, 14, 0]);
box(38, 0.8, 15, M.pcb, 0, 0, 0, ctrlG);
box(6, 0.8, 6, M.chip, -6, 0.8, 0, ctrlG); box(3, 0.6, 2, M.chip, 4, 0.7, 3, ctrlG); box(3, 0.6, 2, M.chip, 8, 0.7, -3, ctrlG);
for (let i = 0; i < 5; i++) box(0.6, 1, 4, M.copper, 14, 0.9, -6 + i * 3, ctrlG);
tag(ctrlG, "control"); labelAt.control = [ctrlG, [-4, 4, 0]];
tag(trayE, "control");
elecG.children.filter(o => o.isMesh && !o.userData.part).forEach(o => o.userData.part = "control");

/* --- แผ่นพื้นตู้ + ที่นอน + ทารก + skin probe --- */
const deckG = grp(body, 0, 22.4, 0); partRoot.deck = deckG; reg(deckG, [0, 14, 0]);
box(96, 1.2, 56, M.deck, 0, 0.6, 0, deckG);
box(84, 1.3, 2.4, M.slot, 0, 0.65, 25, deckG); box(84, 1.3, 2.4, M.slot, 0, 0.65, -25, deckG);
deckG.children.forEach(o => o.userData.part = "deck"); labelAt.deck = [deckG, [40, 2, -22]];
const mSlide = grp(deckG, 0, 1.2, 0); reg(mSlide, [0, 12, 0]);
const mTilt = grp(mSlide, 0, 0, 0); reg(mTilt);
box(74, 1.5, 44, M.tray, 0, 0.75, 0, mTilt);
box(68, 4, 40, M.mattress, 0, 3.5, 0, mTilt);
box(4, 1.2, 10, M.dark, 0, 0.8, 22.5, mTilt);                           // มือจับถาด
tag(mTilt, "mattress"); partRoot.mattress = mSlide; labelAt.mattress = [mTilt, [-26, 6, -16]];
/* ทารก (ไม่ใช่ชิ้นส่วนที่เลือกได้) */
const baby = grp(mTilt, 0, 5.5, 0);
{
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(4.6, 9, 8, 18), M.skin); torso.rotation.z = Math.PI / 2; torso.position.set(-1, 4.6, 0); baby.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(4.4, 24, 18), M.skin); head.position.set(11.5, 4.8, 0); baby.add(head);
  const dia = new THREE.Mesh(new THREE.CapsuleGeometry(4.8, 2, 6, 16), M.diaper); dia.rotation.z = Math.PI / 2; dia.position.set(-8, 4.6, 0); baby.add(dia);
  [[-14, 2.6], [-14, -2.6]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 5, 6, 12), M.skin); l.rotation.z = Math.PI / 2; l.position.set(x, 3.4, z); baby.add(l); });
  [[2, 5.6], [2, -5.6]].forEach(([x, z]) => { const a = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 4.5, 6, 12), M.skin); a.rotation.z = Math.PI / 2 - 0.3; a.position.set(x, 4, z); baby.add(a); });
}
/* skin probe: แผ่นโพรบบนหน้าท้อง + สาย + ปลั๊กที่ขอบถาด */
const probeG = grp(mTilt, 0, 0, 0); partRoot.skinprobe = probeG; reg(probeG, [12, 8, 0]);
{
  const pad = cyl(1.8, 1.8, 0.5, M.probe, -1, 14.9, 0, probeG, 20);
  box(4.5, 0.2, 4.5, mat(0xe8c15a, { metalness: 0.5 }), -1, 14.7, 0, probeG);         // แผ่นสะท้อนความร้อน
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-1, 15, 0), new THREE.Vector3(4, 16, 4), new THREE.Vector3(14, 10, 10), new THREE.Vector3(26, 6.5, 16), new THREE.Vector3(33, 4, 20)]);
  probeG.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.35, 8), M.cable));
  box(3.4, 2, 2.2, M.dark, 34.5, 4, 20, probeG);
  box(3, 3, 0.6, M.black, 36.4, 2.5, 21.5, mTilt);                                    // ช่องเสียบที่ขอบถาด
  pad.userData.part = "skinprobe";
}
tag(probeG, "skinprobe"); labelAt.skinprobe = [probeG, [-1, 19, 0]];

/* --- ฝาครอบสองชั้น + ประตูหน้า + ช่องสอดมือ 4 ช่อง --- */
const hoodG = grp(body, 0, 23, 0); partRoot.hood = hoodG; reg(hoodG, [0, 45, 0]);
const HW = 92, HD = 54, HH = 40;
const hoodGlass = [];
function glass(w, h, d, x, y, z, m = M.glass, parent = hoodG) { const o = box(w, h, d, m, x, y, z, parent); o.renderOrder = 2; hoodGlass.push(o); return o; }
glass(HW, HH, 0.6, 0, HH / 2, -HD / 2);                 // หลัง
glass(0.6, HH, HD, -HW / 2, HH / 2, 0);                 // ซ้าย
glass(0.6, HH, HD, HW / 2, HH / 2, 0);                  // ขวา
glass(HW, 0.6, HD, 0, HH, 0);                           // บน
glass(HW, 10, 0.6, 0, HH - 5, HD / 2);                  // แถบหน้าบน
/* ผนังชั้นใน */
glass(HW - 6, HH - 4, 0.4, 0, (HH - 4) / 2, -HD / 2 + 2.5, M.glassIn);
glass(0.4, HH - 4, HD - 6, -HW / 2 + 2.5, (HH - 4) / 2, 0, M.glassIn);
glass(0.4, HH - 4, HD - 6, HW / 2 - 2.5, (HH - 4) / 2, 0, M.glassIn);
glass(HW - 6, 0.4, HD - 6, 0, HH - 2.5, 0, M.glassIn);
/* โครงขอบ */
const hoodFrame = [];
[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => hoodFrame.push(box(1.8, HH, 1.8, M.frame, sx * HW / 2, HH / 2, sz * HD / 2, hoodG)));
hoodFrame.push(box(HW, 1.8, 1.8, M.frame, 0, HH, HD / 2, hoodG), box(HW, 1.8, 1.8, M.frame, 0, HH, -HD / 2, hoodG));
hoodFrame.push(box(1.8, 1.8, HD, M.frame, -HW / 2, HH, 0, hoodG), box(1.8, 1.8, HD, M.frame, HW / 2, HH, 0, hoodG));
/* ประตูหน้า: บานพับที่ขอบล่าง พับลงด้านหน้า */
const doorPivot = grp(hoodG, 0, 0, HD / 2); reg(doorPivot, [0, 0, 6]);
glass(HW - 2, 30, 0.6, 0, 15, 0.4, M.glass, doorPivot);
hoodFrame.push(box(HW - 2, 1.6, 1.6, M.frame, 0, 30, 0.4, doorPivot));
box(6, 1.4, 1.6, M.dark, -30, 27, 1.4, doorPivot); box(6, 1.4, 1.6, M.dark, 30, 27, 1.4, doorPivot);  // สลัก
/* ช่องสอดมือ: สร้างในกรอบที่ +z คือด้านนอก บานพับอยู่ที่ขอบซ้ายของช่อง */
const portholes = [];
function porthole(parent, x, y, z, ry) {
  const g = grp(parent, x, y, z); g.rotation.y = ry;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.7, 10, 32), M.frame); g.add(ring);
  const pv = grp(g, -6.2, 0, 0.9); reg(pv);
  const disc = cyl(6, 6, 0.7, M.glass, 6.2, 0, 0, pv, 32); disc.rotation.x = Math.PI / 2; disc.renderOrder = 2; hoodGlass.push(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6, 0.45, 8, 32), mat(0xaab4bf)); rim.position.x = 6.2; pv.add(rim);
  box(1.4, 2.6, 1.4, M.dark, 11.6, 0, 0.6, pv);
  const i = portholes.length; g.traverse(o => { if (o.isMesh) o.userData.ph = i; });
  portholes.push(pv); return pv;
}
porthole(doorPivot, -22, 16, 0.8, 0);
porthole(doorPivot, 22, 16, 0.8, 0);
porthole(hoodG, -HW / 2 - 0.5, 20, 0, -Math.PI / 2);
porthole(hoodG, HW / 2 + 0.5, 20, 0, Math.PI / 2);
tag(hoodG, "hood"); labelAt.hood = [hoodG, [0, HH + 3, 0]];

/* ---------- การกระทำ (สั่งให้ชิ้นส่วนขยับ) ----------
   fx: [โหนด, ระยะเลื่อน [x,y,z], มุมหมุน [x,y,z]]  ·  req: ต้องทำการกระทำเหล่านี้ก่อน */
const A = {
  door:   { on: "เปิดประตูหน้า", off: "ปิดประตูหน้า", fx: [[doorPivot, null, [1.5, 0, 0]]] },
  ph:     { on: "เปิดช่องสอดมือทั้ง 4 ช่อง", off: "ปิดช่องสอดมือทั้งหมด", group: [0, 1, 2, 3] },
  hood:   { on: "ยกฝาครอบขึ้น", off: "วางฝาครอบลง", fx: [[hoodG, [0, 40, 0]]] },
  mout:   { on: "ดึงที่นอนออกทางประตูหน้า", off: "ดันที่นอนกลับเข้าตู้", req: ["door"], fx: [[mSlide, [0, 0, 30]]] },
  tilt:   { on: "ปรับเอียงหัวสูง", off: "ปรับที่นอนกลับแนวราบ", fx: [[mTilt, null, [0, 0, 0.13]]] },
  deck:   { on: "ยกแผ่นพื้นตู้ออก (พร้อมที่นอน)", off: "วางแผ่นพื้นตู้กลับ", req: ["hood"], fx: [[deckG, [0, 4, 66]]] },
  fan:    { on: "ยกพัดลมออก", off: "ใส่พัดลมกลับ", req: ["deck"], fx: [[fanG, [0, 30, 0]]] },
  heater: { on: "ยกฮีตเตอร์ขึ้นดู", off: "ใส่ฮีตเตอร์กลับ", req: ["deck"], fx: [[heatG, [0, 22, 0]]] },
  aprobe: { on: "ถอดกล่อง air probe", off: "ใส่กล่อง air probe กลับ", req: ["deck"], fx: [[apG, [0, 26, 0]]] },
  humid:  { on: "ดึงถังน้ำออก", off: "ดันถังน้ำกลับ", fx: [[drawer, [0, 0, 24]]] },
  filter: { on: "ดึงแผ่นกรองออก", off: "ใส่แผ่นกรองกลับ", fx: [[filterG, [-24, 0, 0]]] },
  o2cov:  { on: "เปิดฝาครอบ O₂", off: "ปิดฝาครอบ O₂", fx: [[o2Cover, [16, 0, 0]]] },
  o2cell: { on: "ถอดเซลล์ O₂ ทั้ง 2 ตัว", off: "ใส่เซลล์ O₂ กลับ", req: ["o2cov"], fx: [[cellA, [24, 0, 0]], [cellB, [32, 0, 0]]] },
  elec:   { on: "ดึงถาดอิเล็กทรอนิกส์ออกทางหลัง", off: "ดันถาดอิเล็กทรอนิกส์กลับ", fx: [[elecG, [0, 0, -34]]] },
  layers: { on: "แยกชั้นบอร์ด", off: "ประกอบชั้นบอร์ดกลับ", req: ["elec"], fx: [[relayG, [0, 8, 0]], [ctrlG, [0, 17, 0]], [battG, [10, 0, 0]], [psuG, [-6, 0, 0]]] },
  probe:  { on: "ถอดโพรบผิวออกจากตัวทารก", off: "ติดโพรบผิวกลับ", fx: [[probeG, [16, 12, 0]]] },
  height: { on: "ยกตู้ขึ้น (ปรับความสูง)", off: "ลดตู้ลง", fx: [[body, [0, 16, 0]], [colIn, [0, 16, 0]]] }
};
/* ช่องสอดมือแต่ละช่อง */
portholes.forEach((pv, i) => { A["ph" + i] = { on: "เปิดช่องสอดมือ", off: "ปิดช่องสอดมือ", fx: [[pv, null, [0, -1.7, 0]]] }; });
const PART_ACTIONS = {
  hood: ["ph", "door", "hood"], mattress: ["mout", "tilt"], deck: ["deck"], fan: ["fan"], heater: ["heater"],
  airprobe: ["aprobe"], humid: ["humid"], filter: ["filter"], o2: ["o2cov", "o2cell"],
  control: ["elec", "layers"], relay: ["elec", "layers"], psu: ["elec", "layers"], battery: ["elec", "layers"],
  skinprobe: ["probe"], stand: ["height"], display: []
};
for (const k in A) { const a = A[k]; a.t = 0; a.v = 0; (a.fx || []).forEach(([n, dp, dr]) => n.userData.fx.push([a, dp, dr])); }

function isOn(k) { return k === "ph" ? [0, 1, 2, 3].every(i => A["ph" + i].t) : !!A[k].t; }
function toggle(k) {
  const turnOn = !isOn(k);
  if (k === "ph") { [0, 1, 2, 3].forEach(i => A["ph" + i].t = turnOn ? 1 : 0); refresh(); return; }
  const a = A[k];
  if (turnOn) {
    const miss = (a.req || []).filter(r => !A[r].t);
    if (miss.length) { toast("ต้อง" + A[miss[0]].on + "ก่อน"); return; }
  } else {
    const dep = Object.keys(A).find(o => A[o].t && (A[o].req || []).includes(k));
    if (dep) { toast("ต้อง" + A[dep].off + "ก่อน"); return; }
  }
  a.t = turnOn ? 1 : 0; refresh();
}

/* ---------- ลมร้อนหมุนเวียน (อนุภาค) ---------- */
const flowCurve = new THREE.CatmullRomCurve3([
  [-24, 15, 0], [-10, 15, 0], [2, 15, 0], [18, 14, -4], [27, 15, -10], [24, 19, -22], [10, 23.5, -26],
  [0, 30, -22], [0, 42, -10], [0, 46, 4], [0, 38, 18], [-6, 26, 24], [-8, 21, 26], [-16, 16, 14], [-24, 15, 4]
].map(p => new THREE.Vector3(...p)), true);
const inCurve = new THREE.CatmullRomCurve3([[-60, 11, 4], [-49, 11, 2], [-38, 13, 0], [-26, 15, 0]].map(p => new THREE.Vector3(...p)));
const NF = MOBILE ? 70 : 150, NI = MOBILE ? 10 : 20;
const fGeo = new THREE.BufferGeometry();
fGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((NF + NI) * 3), 3));
fGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array((NF + NI) * 3), 3));
const flow = new THREE.Points(fGeo, new THREE.PointsMaterial({ size: 2.4, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
flow.visible = false; flow.renderOrder = 3; body.add(flow);
const fu = Array.from({ length: NF + NI }, (_, i) => i < NF ? i / NF : (i - NF) / NI);
const cCold = new THREE.Color(0x4dabf7), cHot = new THREE.Color(0xff6b1a), cWarm = new THREE.Color(0xffa94d), tmp = new THREE.Color();
function stepFlow(dt) {
  const pos = fGeo.attributes.position.array, col = fGeo.attributes.color.array;
  for (let i = 0; i < NF + NI; i++) {
    const loop = i < NF;
    fu[i] = (fu[i] + dt * (loop ? 0.07 : 0.22)) % 1;
    const p = (loop ? flowCurve : inCurve).getPointAt(fu[i]);
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    const u = fu[i];
    if (!loop) tmp.copy(cCold);
    else if (u < 0.12) tmp.copy(cCold).lerp(cHot, u / 0.12);
    else if (u < 0.75) tmp.copy(cHot).lerp(cWarm, (u - 0.12) / 0.63);
    else tmp.copy(cWarm).lerp(cCold, (u - 0.75) / 0.25);
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  fGeo.attributes.position.needsUpdate = true; fGeo.attributes.color.needsUpdate = true;
}

/* ---------- ป้ายชื่อ ---------- */
const SHORT = { hood: "ฝาครอบ", mattress: "ที่นอน", deck: "แผ่นพื้นตู้", filter: "แผ่นกรอง", fan: "พัดลม", heater: "ฮีตเตอร์",
  humid: "ถังน้ำ / ห้องต้ม", o2: "ระบบ O₂", airprobe: "Air probe", skinprobe: "Skin probe", display: "จอและแผงปุ่ม",
  control: "บอร์ดควบคุม", relay: "บอร์ดรีเลย์", psu: "ภาคจ่ายไฟ", battery: "แบตสำรอง", stand: "เสาและขาตั้ง" };
const labels = {}, labelObj = {};
for (const id in labelAt) {
  const [node, p] = labelAt[id];
  const el = document.createElement("div"); el.className = "lbl"; el.textContent = SHORT[id] || id;
  el.addEventListener("pointerdown", e => e.stopPropagation());
  el.addEventListener("click", e => { e.stopPropagation(); select(id); });
  const o = new CSS2DObject(el); o.position.set(...p); node.add(o); labels[id] = el; labelObj[id] = o;
}
/* ป้ายของชิ้นที่ซ่อนอยู่ในฐานตู้ แสดงเมื่อเปิดให้เห็นแล้วเท่านั้น */
const INSIDE = { fan: "deck", heater: "deck", airprobe: "deck", control: "elec", relay: "elec", psu: "elec", battery: "elec" };
function labelVis() {
  for (const id in INSIDE) labelObj[id].visible = selected === id || exV > 0.25 || A[INSIDE[id]].v > 0.5;
}

/* ---------- เลือกชิ้นส่วน ---------- */
const selBox = new THREE.BoxHelper(undefined, 0xe8590c); selBox.visible = false; selBox.material.depthTest = false; selBox.renderOrder = 5; scene.add(selBox);
let selected = null;
function select(id) {
  selected = id;
  for (const k in labels) labels[k].classList.toggle("sel", k === id);
  if (id && partRoot[id]) { selBox.setFromObject(partRoot[id]); selBox.visible = true; } else selBox.visible = false;
  renderSide();
}

const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener("pointerup", e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) { down = null; return; }
  down = null;
  const hit = pick(e);
  if (!hit) { select(null); return; }
  if (hit.object.userData.ph != null) { select("hood"); toggle("ph" + hit.object.userData.ph); return; }
  select(hit.object.userData.part);
});
renderer.domElement.addEventListener("pointermove", e => {
  if (e.buttons) return;
  const h = pick(e); renderer.domElement.style.cursor = h ? "pointer" : "grab";
});
function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(scene.children, true).filter(h => h.object.isMesh && h.object.visible && (h.object.userData.part || h.object.userData.ph != null));
  /* ถ้าฝาครอบโปร่งแสง ให้ทะลุกระจกไปเลือกชิ้นข้างในก่อน ยกเว้นแตะช่องสอดมือ */
  const solid = hits.find(h => h.object.userData.ph != null || !glassMats.includes(h.object.material));
  return solid || hits[0] || null;
}

/* ---------- แผงด้านขวา ---------- */
const side = document.getElementById("side");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function groupOf(id) { const g = GROUPS.find(g => g.ids.includes(id)); return g ? g.t : ""; }
function renderSide() {
  side.scrollTop = 0;
  if (!selected) {
    side.innerHTML = `<h2>ชิ้นส่วนทั้งหมด</h2>
      <p class="en">${MODE === "clin" ? "โหมดพยาบาล · เน้นสิ่งที่ผู้ใช้ต้องดูแล" : "โหมดช่าง · หน้าที่ หลักการ อาการเสีย และวิธีตรวจ"}</p>
      ${GROUPS.map(g => `<div class="grp">${esc(g.t)}</div><div class="plist">${g.ids.map(id => `<button data-id="${id}">${esc(SHORT[id] || id)}</button>`).join("")}</div>`).join("")}
      <p class="note">ลองทำตามลำดับจริง: ยกฝาครอบขึ้น → ยกแผ่นพื้นตู้ออก → ยกพัดลมออก ถ้าข้ามขั้น ระบบจะบอกว่าต้องทำอะไรก่อน</p>`;
    side.querySelectorAll("[data-id]").forEach(b => b.onclick = () => select(b.dataset.id));
    return;
  }
  const P = PARTS[selected] || {}, C = CLIN[selected] || {};
  const acts = (PART_ACTIONS[selected] || []).map(k => {
    const on = isOn(k), a = A[k];
    const lock = !on && k !== "ph" && (a.req || []).some(r => !A[r].t);
    const need = lock ? `<small>ต้อง${esc(A[(a.req || []).find(r => !A[r].t)].on)}ก่อน</small>` : "";
    return `<button data-a="${k}" class="${on ? "on" : ""}${lock ? " lock" : ""}">${esc(on ? a.off : a.on)}${need}</button>`;
  }).join("");
  const tech = MODE !== "clin";
  side.innerHTML = `<button class="link" id="all">← รายการทั้งหมด</button><br>
    <span class="chip">${esc(groupOf(selected))}</span>
    <h2>${esc(P.th || SHORT[selected])}</h2><div class="en">${esc(P.n || "")}</div>
    <p>${esc(tech ? (P.f || "") : (C.f || P.f || ""))}</p>
    ${acts ? `<h3>สั่งให้ขยับ</h3><div class="acts">${acts}</div>` : ""}
    ${tech && P.h ? `<h3>หลักการทำงาน</h3><p>${esc(P.h)}</p>` : ""}
    ${tech && P.x ? `<h3>อาการเสียที่พบบ่อย</h3><ul>${P.x.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    ${tech && P.c ? `<h3>วิธีตรวจเบื้องต้น</h3><ol>${P.c.map(s => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
    ${!tech && C.care ? `<div class="care"><h3>สิ่งที่พยาบาลต้องดู</h3><ul>${C.care.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}`;
  side.querySelector("#all").onclick = () => select(null);
  side.querySelectorAll("[data-a]").forEach(b => b.onclick = () => toggle(b.dataset.a));
}
function refresh() { if (selected) renderSide(); }

let toastT = 0;
function toast(msg, ok) {
  const t = document.getElementById("toast"); t.textContent = msg; t.className = "toast" + (ok ? " ok" : ""); t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600);
}

/* ---------- แถบเครื่องมือ ---------- */
const VIEWS = { iso: [[175, 180, 235], [0, 88, 0]], front: [[0, 105, 260], [0, 92, 0]], side: [[270, 110, 0], [0, 92, 0]], top: [[0, 320, 40], [0, 95, 0]] };
let camAnim = null;
let curView = "iso";
/* ระยะกล้องให้ทั้งตู้พอดีจอทุกสัดส่วน (จอแนวตั้งจะถอยกล้องออกให้เห็นครบ) */
function fitPos(v) {
  const [p, t] = VIEWS[v], tv = new THREE.Vector3(...t), dir = new THREE.Vector3(...p).sub(tv).normalize();
  const h = stage.clientHeight || 1, k = Math.max(0.3, (h - barH) / h);          // สัดส่วนความสูงที่ไม่ถูกแถบบัง
  const vf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * k), hf = 2 * Math.atan(Math.tan(vf / 2) * stage.clientWidth / (h * k));
  const dist = 100 / Math.sin(Math.min(vf, hf) / 2) * 1.04;
  return [tv.clone().addScaledVector(dir, dist), tv];
}
function view(v, instant) {
  curView = v;
  const [p1, t1] = fitPos(v);
  if (instant) { camAnim = null; camera.position.copy(p1); controls.target.copy(t1); }
  else camAnim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1, t1 };
  document.querySelectorAll("#views button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
}
document.querySelectorAll("#views button").forEach(b => b.onclick = () => view(b.dataset.v));
const bLbl = document.getElementById("b-lbl");
bLbl.onclick = () => { const on = bLbl.classList.toggle("on"); labelR.domElement.classList.toggle("off", !on); };
const HOOD_MODES = [["ปกติ", 0.2, 0.1, true], ["โปร่ง", 0.07, 0.04, true], ["ซ่อน", 0, 0, false]];
let hoodMode = 0;
const bHood = document.getElementById("b-hood");
bHood.onclick = () => {
  hoodMode = (hoodMode + 1) % 3; const [t, o1, o2, vis] = HOOD_MODES[hoodMode];
  M.glass.opacity = o1; M.glassIn.opacity = o2;
  hoodGlass.forEach(o => o.visible = vis); hoodFrame.forEach(o => o.visible = vis);
  portholes.forEach(pv => pv.parent.visible = vis);
  hoodG.children.filter(o => o.isMesh && !hoodGlass.includes(o) && !hoodFrame.includes(o)).forEach(o => o.visible = vis);
  doorPivot.children.filter(o => o.isMesh && !hoodGlass.includes(o) && !hoodFrame.includes(o)).forEach(o => o.visible = vis);
  labels.hood.style.visibility = vis ? "" : "hidden";
  bHood.textContent = "ฝาครอบ: " + t; bHood.classList.toggle("on", hoodMode > 0);
};
const bAir = document.getElementById("b-air");
bAir.onclick = () => {
  flow.visible = !flow.visible; bAir.classList.toggle("on", flow.visible);
  bAir.textContent = flow.visible ? "■ หยุดลมร้อน" : "▶ ลมร้อน";
  if (flow.visible) toast("ลมเย็นสีฟ้าเข้าทางแผ่นกรอง → พัดลม → ฮีตเตอร์ (ส้ม) → ห้องต้ม → ขึ้นช่องหลัง ผ่านทารก → ลงช่องหน้า", true);
};
const exInput = document.getElementById("explode");
let exT = 0, exV = 0;
exInput.oninput = () => { exT = exInput.value / 100; };
document.getElementById("b-reset").onclick = () => {
  for (const k in A) A[k].t = 0; exT = 0; exInput.value = 0; refresh();
};

/* ---------- วนเฟรม ---------- */
const tmpV = new THREE.Vector3();
function applyNodes() {
  for (const n of nodes) {
    const b = n.userData.base;
    n.position.copy(b.p).addScaledVector(n.userData.ex, exV);
    n.rotation.copy(b.r);
    for (const [a, dp, dr] of n.userData.fx) {
      if (!a.v) continue;
      if (dp) n.position.add(tmpV.set(dp[0], dp[1], dp[2]).multiplyScalar(a.v));
      if (dr) { n.rotation.x += dr[0] * a.v; n.rotation.y += dr[1] * a.v; n.rotation.z += dr[2] * a.v; }
    }
  }
}
const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
/* แถบเครื่องมือที่ลอยทับด้านล่างภาพ (จอกว้าง): เลื่อนภาพขึ้นให้เครื่องอยู่กลางพื้นที่ที่เหลือ ไม่ถูกแถบบัง */
let barH = 0;
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); labelR.setSize(w, h);
  const tb = document.querySelector(".bar");
  barH = tb && tb.parentElement === stage ? Math.min(tb.offsetHeight + 24, h * 0.4) : 0;
  camera.aspect = w / Math.max(h, 1);
  if (barH) camera.setViewOffset(w, h, 0, barH / 2, w, h); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
/* เปลี่ยนขนาดจอหรือหมุนเครื่อง: จัดกล้องให้พอดีใหม่ */
let lastAspect = 0, refitT = 0;
new ResizeObserver(() => {
  resize();
  if (Math.abs(camera.aspect - lastAspect) > 0.15) { lastAspect = camera.aspect; clearTimeout(refitT); refitT = setTimeout(() => view(curView, true), 60); }
}).observe(stage);
resize(); lastAspect = camera.aspect;
view("iso", true);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  for (const k in A) { const a = A[k]; a.v += Math.sign(a.t - a.v) * Math.min(Math.abs(a.t - a.v), dt * 2.2); }
  exV += (exT - exV) * Math.min(1, dt * 6);
  applyNodes(); labelVis();
  impeller.rotation.y += dt * (flow.visible ? 9 : 1.5);
  if (flow.visible) stepFlow(dt);
  if (camAnim) {
    camAnim.t = Math.min(1, camAnim.t + dt * 1.4); const e = ease(camAnim.t);
    camera.position.lerpVectors(camAnim.p0, camAnim.p1, e); controls.target.lerpVectors(camAnim.t0, camAnim.t1, e);
    if (camAnim.t >= 1) camAnim = null;
  }
  controls.update();
  if (selBox.visible && selected) selBox.setFromObject(partRoot[selected]);
  renderer.render(scene, camera); labelR.render(scene, camera);
});

/* จอแคบ: ย้ายแถบเครื่องมือมาไว้ใต้ภาพเป็นแถวเลื่อนซ้าย-ขวา และปิดป้ายชื่อไว้ก่อนเพื่อไม่ให้รก */
const bar = document.querySelector(".bar");
function layout(narrow) {
  if (narrow) document.querySelector(".main").insertBefore(bar, side);
  else stage.appendChild(bar);
  resize(); view(curView, true);
}
layout(MOBILE);
if (MOBILE) { bLbl.classList.remove("on"); labelR.domElement.classList.add("off"); }
NARROW.addEventListener("change", e => layout(e.matches));
document.getElementById("loading").remove();
renderSide();
window.__inc3d = { A, toggle, select, view };   // ใช้ทดสอบ
