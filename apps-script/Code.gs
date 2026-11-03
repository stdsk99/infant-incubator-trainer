/* Google Apps Script สำหรับ Repair Trainer หลายแอป (ใช้ Google Sheet และบัญชีผู้เรียนร่วมกัน)
   แอปที่รองรับ: pump = Infusion Pump Repair Trainer, incubator = Infant Incubator Repair Trainer
   1) ลงทะเบียน / เข้าสู่ระบบ / รับคะแนน (doPost)
   2) สรุปผลผ่านเกณฑ์ และออกเกียรติบัตรทางการเป็น PDF แยกตามแอป (เมนู "เกียรติบัตร" ใน Google Sheets)

   วิธีอัปเดตจากเวอร์ชันเดิม (ใช้กับ Sheet เดิมได้เลย ข้อมูลเดิมไม่หาย)
   - เปิด Google Sheet เดิม → ส่วนขยาย → Apps Script → วางโค้ดนี้ทับทั้งหมด → บันทึก
   - Deploy → Manage deployments → แก้ไข deployment เดิม → Version: New version → Deploy
     (URL เดิมยังใช้ได้ ทั้งสองแอปใช้ URL และ TOKEN เดียวกัน)
   - คะแนนเดิมที่ไม่มีคอลัมน์ "แอป" จะนับเป็นของ Infusion Pump อัตโนมัติ */

const TOKEN = 'pump-2569';          // ต้องตรงกับ token ใน data/config.js ของทุกแอป
const SHEET_NAME = 'scores';
const USER_SHEET = 'users';
const HEAD = ['เวลา', 'รหัสผู้ใช้', 'ชื่อ-สกุล', 'กลุ่ม', 'โมดูล', 'รายการ', 'คะแนน', 'เต็ม', 'ร้อยละ', 'รายละเอียด', 'key', 'ประเภทผู้เรียน', 'หน่วยงาน', 'แอป'];
const UHEAD = ['ลงทะเบียนเมื่อ', 'รหัสผู้ใช้', 'ชื่อ-สกุล', 'ประเภท', 'กลุ่ม', 'หน่วยงาน', 'ตำแหน่ง', 'pinHash (ลบเพื่อให้ตั้ง PIN ใหม่)', 'ยินยอม PDPA', 'เข้าสู่ระบบล่าสุด'];
const DEFAULT_APP = 'pump';

/* ตั้งค่าแต่ละแอป
   crit  = เกณฑ์ผ่าน (ต้องตรงกับ criteria ใน data/config.js ของแอปนั้น)
   cert  = ข้อความบนเกียรติบัตร
   ref   = คำนำหน้าเลขที่เกียรติบัตร
   tmplKey / logSheet / sumSheet / folder = ชื่อที่ใช้เก็บแม่แบบ บันทึก และไฟล์ PDF ของแอปนั้น */
const APPS = {
  pump: {
    name: 'Infusion Pump Repair Trainer',
    crit: { learnCases: 8, examCases: 8, examAvg: 70, quizPct: 80, orderTasks: 3 },
    cert: {
      org1: 'หลักสูตรเทคโนโลยีสุขภาพ คณะวิทยาศาสตร์และเทคโนโลยี',
      org2: 'มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา',
      title: 'การฝึกซ่อมและทดสอบเครื่องควบคุมการให้สารละลาย (Infusion Pump)',
      subject: 'รายวิชาเครื่องมือแพทย์',
      signer: 'รศ.ดร.ณัฐดนัย สิงห์คลีวรรณ',
      signerPos: 'อาจารย์ผู้สอนรายวิชาเครื่องมือแพทย์'
    },
    ref: 'IPT', tmplKey: 'TEMPLATE_ID', logSheet: 'เกียรติบัตร', sumSheet: 'สรุป',
    folder: 'เกียรติบัตร Infusion Pump', tmplName: 'แม่แบบเกียรติบัตร Infusion Pump Trainer'
  },
  incubator: {
    name: 'Infant Incubator Repair Trainer',
    crit: { learnCases: 8, examCases: 8, examAvg: 70, quizPct: 80, orderTasks: 3 },
    cert: {
      org1: 'หลักสูตรเทคโนโลยีสุขภาพ คณะวิทยาศาสตร์และเทคโนโลยี',
      org2: 'มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา',
      title: 'การฝึกซ่อมและบำรุงรักษาตู้อบทารก (Infant Incubator)',
      subject: 'รายวิชาเครื่องมือแพทย์',
      signer: 'รศ.ดร.ณัฐดนัย สิงห์คลีวรรณ',
      signerPos: 'อาจารย์ผู้สอนรายวิชาเครื่องมือแพทย์'
    },
    ref: 'IIT', tmplKey: 'TEMPLATE_ID_incubator', logSheet: 'เกียรติบัตร ตู้อบ', sumSheet: 'สรุป ตู้อบ',
    folder: 'เกียรติบัตร Infant Incubator', tmplName: 'แม่แบบเกียรติบัตร Infant Incubator Trainer'
  }
};
const appOf_ = a => (APPS[String(a || '').trim()] ? String(a).trim() : DEFAULT_APP);

/* ---------------- ช่วยเหลือ ---------------- */
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) { sh.appendRow(head); sh.setFrozenRows(1); }
  else if (String(sh.getRange(1, head.length).getValue()) === '') sh.getRange(1, 1, 1, head.length).setValues([head]);
  return sh;
}
function findUser_(sid) {
  const sh = sheet_(USER_SHEET, UHEAD);
  if (sh.getLastRow() < 2) return null;
  const cell = sh.getRange(2, 2, sh.getLastRow() - 1, 1).createTextFinder(sid).matchEntireCell(true).findNext();
  if (!cell) return null;
  const row = cell.getRow(), v = sh.getRange(row, 1, 1, UHEAD.length).getValues()[0];
  return { sh, row, sid: String(v[1]), name: v[2], type: v[3], sec: v[4], org: v[5], role: v[6], pin: String(v[7] || '') };
}
function profileOf_(u) {
  return { type: u.type === 'gp' ? 'gp' : 'st', sid: u.sid, name: u.name, sec: u.sec, org: u.org, role: u.role };
}

/* ---------------- รับคำขอจากเว็บ ---------------- */
function doGet() { return out_({ ok: true, apps: Object.keys(APPS).map(k => APPS[k].name) }); }

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, err: 'bad' }); }
  if (d.token !== TOKEN) return out_({ ok: false, err: 'token' });
  const sid = String(d.sid || '').trim();
  if (!sid) return out_({ ok: false, err: 'nouser' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (d.action === 'register') return out_(register_(sid, d));
    if (d.action === 'login') return out_(login_(sid, d));
    return out_(score_(sid, d));
  } finally { lock.releaseLock(); }
}

function register_(sid, d) {
  if (findUser_(sid)) return { ok: false, err: 'exists' };
  const p = d.profile || {};
  const sh = sheet_(USER_SHEET, UHEAD);
  sh.appendRow([new Date(), sid, p.name || '', p.type === 'gp' ? 'gp' : 'st', p.sec || '', p.org || '', p.role || '', d.pin || '', 'ยินยอม ' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm'), new Date()]);
  sh.getRange(sh.getLastRow(), 2).setNumberFormat('@').setValue(sid);
  return { ok: true, profile: { type: p.type === 'gp' ? 'gp' : 'st', sid, name: p.name || '', sec: p.sec || '', org: p.org || '', role: p.role || '' } };
}

/* เข้าสู่ระบบ: ส่งประวัติคะแนนกลับเฉพาะของแอปที่ขอ */
function login_(sid, d) {
  const u = findUser_(sid);
  if (!u) return { ok: false, err: 'nouser' };
  let reset = false;
  if (!u.pin) { u.sh.getRange(u.row, 8).setValue(d.pin); reset = true; }   // อาจารย์ลบ PIN ไว้ → ตั้งใหม่
  else if (u.pin !== d.pin) return { ok: false, err: 'badpin' };
  u.sh.getRange(u.row, 10).setValue(new Date());
  const app = appOf_(d.app), hist = [];
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (sh && sh.getLastRow() > 1) {
    const w = Math.max(14, sh.getLastColumn());
    sh.getRange(2, 2, sh.getLastRow() - 1, 1).createTextFinder(sid).matchEntireCell(true).findAll().forEach(c => {
      const v = sh.getRange(c.getRow(), 1, 1, Math.min(w, 14)).getValues()[0];
      if (appOf_(v[13]) !== app) return;
      hist.push({ t: new Date(v[0]).toISOString(), sid, mod: v[4], item: v[5], score: v[6], max: v[7], detail: v[9], key: v[10] });
    });
  }
  return { ok: true, reset, profile: profileOf_(u), hist };
}

function score_(sid, d) {
  const u = findUser_(sid);
  if (!u) return { ok: false, err: 'nouser' };
  if (u.pin && u.pin !== d.pin) return { ok: false, err: 'badpin' };
  const sh = sheet_(SHEET_NAME, HEAD);
  const pct = d.max ? Math.round(d.score / d.max * 100) : '';
  const isGp = u.type === 'gp';
  sh.appendRow([new Date(), sid, u.name, u.sec || '', d.mod || '', d.item || '', d.score, d.max, pct, d.detail || '', d.key || '',
    isGp ? 'บุคลากร/บุคคลทั่วไป' : 'นักศึกษา', isGp ? [u.org, u.role].filter(String).join(' · ') : '', appOf_(d.app)]);
  sh.getRange(sh.getLastRow(), 2).setNumberFormat('@').setValue(sid);
  return { ok: true };
}

/* ---------------- ทดสอบจากหน้า Apps Script (กด Run ได้) ---------------- */
function testPost() {
  const call = o => doPost({ postData: { contents: JSON.stringify(Object.assign({ token: TOKEN, sid: 'test0000', pin: 'testhash' }, o)) } }).getContent();
  Logger.log('register: ' + call({ action: 'register', profile: { type: 'st', name: 'ทดสอบ ระบบ', sec: '-' } }));
  Logger.log('login pump: ' + call({ action: 'login' }));
  Logger.log('login incubator: ' + call({ action: 'login', app: 'incubator' }));
  Logger.log('score pump: ' + call({ mod: 'ทดสอบ', item: 'ทดสอบการเชื่อมต่อ', score: 1, max: 1, key: 'test' }));
  Logger.log('score incubator: ' + call({ mod: 'ทดสอบ', item: 'ทดสอบการเชื่อมต่อ', score: 1, max: 1, key: 'test', app: 'incubator' }));
}

/* ---------------- เมนูใน Google Sheets ---------------- */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('เกียรติบัตร')
    .addSubMenu(ui.createMenu('Infusion Pump')
      .addItem('1) สร้างแม่แบบเกียรติบัตร (ครั้งแรกครั้งเดียว)', 'makeTemplate')
      .addItem('2) สรุปผลผ่านเกณฑ์', 'evaluate')
      .addItem('3) ออกเกียรติบัตรให้ผู้ผ่านเกณฑ์', 'createCertificates'))
    .addSubMenu(ui.createMenu('ตู้อบทารก (Infant Incubator)')
      .addItem('1) สร้างแม่แบบเกียรติบัตร (ครั้งแรกครั้งเดียว)', 'makeTemplateIncubator')
      .addItem('2) สรุปผลผ่านเกณฑ์', 'evaluateIncubator')
      .addItem('3) ออกเกียรติบัตรให้ผู้ผ่านเกณฑ์', 'createCertificatesIncubator'))
    .addToUi();
}

/* ชื่อฟังก์ชันเดิมของ pump คงไว้ เพื่อให้ปุ่มหรือทริกเกอร์ที่ผูกไว้ยังใช้ได้ */
function makeTemplate() { makeTemplate_('pump'); }
function evaluate() { evaluate_('pump'); }
function createCertificates() { createCertificates_('pump'); }
function makeTemplateIncubator() { makeTemplate_('incubator'); }
function evaluateIncubator() { evaluate_('incubator'); }
function createCertificatesIncubator() { createCertificates_('incubator'); }

/* สร้างแม่แบบใน Google Slides (อาจารย์เปิดไปเพิ่มโลโก้และลายเซ็นได้) */
function makeTemplate_(app) {
  const A = APPS[app], CERT = A.cert;
  const p = SlidesApp.create(A.tmplName);
  const s = p.getSlides()[0];
  s.getPageElements().forEach(e => e.remove());
  const W = p.getPageWidth(), H = p.getPageHeight();
  const box = (txt, y, h, size, bold, color) => {
    const t = s.insertTextBox(txt, 40, y, W - 80, h);
    const st = t.getText().getTextStyle();
    st.setFontSize(size).setBold(!!bold).setFontFamily('Sarabun').setForegroundColor(color || '#1d2430');
    t.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
    return t;
  };
  const r1 = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 14, 14, W - 28, H - 28);
  r1.getFill().setTransparent(); r1.getBorder().setWeight(5).getLineFill().setSolidFill('#0f7a6c');
  const r2 = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 24, 24, W - 48, H - 48);
  r2.getFill().setTransparent(); r2.getBorder().setWeight(1.5).getLineFill().setSolidFill('#b8892b');
  box(CERT.org1 + '\n' + CERT.org2, 34, 44, 13, false, '#5d6675');
  box('เกียรติบัตร', 80, 46, 34, true, '#0f7a6c');
  box('ขอมอบเกียรติบัตรฉบับนี้ไว้เพื่อแสดงว่า', 128, 22, 13, false, '#5d6675');
  box('{{name}}', 150, 36, 26, true);
  box('{{idline}}', 188, 20, 12, false, '#5d6675');
  box('ได้ผ่าน' + CERT.title + '\n' + CERT.subject + ' ตามเกณฑ์ที่กำหนดครบทุกข้อ', 212, 44, 14);
  box('{{scores}}', 258, 20, 10, false, '#5d6675');
  box('ให้ไว้ ณ วันที่ {{date}}', 280, 22, 13);
  box('………………………………………\n(' + CERT.signer + ')\n' + CERT.signerPos, 300, 56, 12);
  box('เลขที่ {{ref}}', H - 34, 14, 8, false, '#5d6675');
  PropertiesService.getScriptProperties().setProperty(A.tmplKey, p.getId());
  SpreadsheetApp.getUi().alert('สร้างแม่แบบแล้ว\n\nเปิดไฟล์ "' + A.tmplName + '" ใน Google Drive เพื่อเพิ่มโลโก้ ลายเซ็น หรือปรับตำแหน่งได้\nห้ามลบข้อความในวงเล็บปีกกา {{ }}');
}

/* อ่านคะแนนของแอปที่เลือก แล้วสรุปรายคน */
function summarize_(app) {
  const CRIT = APPS[app].crit;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return [];
  const users = {};
  const ush = ss.getSheetByName(USER_SHEET);
  if (ush && ush.getLastRow() > 1) ush.getRange(2, 1, ush.getLastRow() - 1, 7).getValues().forEach(r => {
    users[String(r[1]).trim()] = { name: r[2], type: r[3] === 'gp' ? 'บุคลากร/บุคคลทั่วไป' : 'นักศึกษา', sec: r[4], org: [r[5], r[6]].filter(String).join(' · ') };
  });
  const cols = Math.min(14, Math.max(13, sh.getLastColumn()));
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, cols).getValues();
  const P = {};
  rows.forEach(r => {
    if (appOf_(r[13]) !== app) return;
    const sid = String(r[1]).trim(); if (!sid || sid === 'test0000') return;
    const p = P[sid] = P[sid] || { sid, name: r[2], sec: r[3], type: r[11], org: r[12], learn: {}, exam: {}, order: {}, quiz: 0 };
    const key = String(r[10] || ''), sc = Number(r[6]), mx = Number(r[7]);
    if (key.indexOf('learn:') === 0) p.learn[key] = 1;
    if (key.indexOf('exam:') === 0) p.exam[key] = Math.max(p.exam[key] || 0, sc);
    if (key.indexOf('order:') === 0) p.order[key] = 1;
    if (key === 'quiz' && mx) p.quiz = Math.max(p.quiz, Math.round(sc / mx * 100));
  });
  return Object.keys(P).map(k => {
    const p = P[k], u = users[k], ev = Object.keys(p.exam).map(x => p.exam[x]);
    if (u) { p.name = u.name || p.name; p.type = u.type; p.sec = u.sec; p.org = u.org; }
    p.nLearn = Object.keys(p.learn).length; p.nExam = ev.length; p.nOrder = Object.keys(p.order).length;
    p.avg = ev.length ? Math.round(ev.reduce((a, b) => a + b, 0) / ev.length) : 0;
    p.pass = p.nLearn >= CRIT.learnCases && p.nExam >= CRIT.examCases && p.avg >= CRIT.examAvg && p.quiz >= CRIT.quizPct && p.nOrder >= CRIT.orderTasks;
    return p;
  }).sort((a, b) => a.sid.localeCompare(b.sid));
}

function evaluate_(app) {
  const A = APPS[app], list = summarize_(app);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(A.sumSheet) || ss.insertSheet(A.sumSheet);
  sh.clear();
  sh.appendRow(['รหัสผู้ใช้', 'ชื่อ-สกุล', 'ประเภท', 'กลุ่ม / หน่วยงาน', 'เรียนรู้ (เคส)', 'สอบ (เคส)', 'สอบเฉลี่ย', 'แบบทดสอบ %', 'ลำดับขั้นตอน (งาน)', 'ผลเกณฑ์']);
  list.forEach(p => sh.appendRow([p.sid, p.name, p.type || 'นักศึกษา', p.org || p.sec, p.nLearn, p.nExam, p.avg, p.quiz, p.nOrder, p.pass ? 'ผ่าน' : 'ยังไม่ผ่าน']));
  sh.setFrozenRows(1);
  SpreadsheetApp.getUi().alert(A.name + '\nสรุปแล้ว ' + list.length + ' คน ผ่านเกณฑ์ ' + list.filter(p => p.pass).length + ' คน (ดูแท็บ "' + A.sumSheet + '")');
}

function thaiDate_(d) {
  const M = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  return d.getDate() + ' ' + M[d.getMonth()] + ' พ.ศ. ' + (d.getFullYear() + 543);
}

/* ออกเกียรติบัตร PDF ให้ผู้ผ่านเกณฑ์ของแอปที่เลือก ที่ยังไม่เคยได้รับ */
function createCertificates_(app) {
  const A = APPS[app];
  const ui = SpreadsheetApp.getUi();
  const tid = PropertiesService.getScriptProperties().getProperty(A.tmplKey);
  if (!tid) { ui.alert('ยังไม่มีแม่แบบของ ' + A.name + ' ให้เลือกเมนู 1) สร้างแม่แบบเกียรติบัตร ก่อน'); return; }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const log = ss.getSheetByName(A.logSheet) || ss.insertSheet(A.logSheet);
  if (log.getLastRow() === 0) { log.appendRow(['รหัสผู้ใช้', 'ชื่อ-สกุล', 'เลขที่', 'วันที่ออก', 'ไฟล์ PDF']); log.setFrozenRows(1); }
  const issued = {};
  if (log.getLastRow() > 1) log.getRange(2, 1, log.getLastRow() - 1, 1).getValues().forEach(r => issued[String(r[0])] = 1);
  const it = DriveApp.getFoldersByName(A.folder);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(A.folder);
  const now = new Date();
  const todo = summarize_(app).filter(p => p.pass && !issued[p.sid]);
  if (!todo.length) { ui.alert('ไม่มีผู้ผ่านเกณฑ์รายใหม่ที่ต้องออกเกียรติบัตร (' + A.name + ')'); return; }
  let n = log.getLastRow();
  todo.forEach(p => {
    const ref = A.ref + '-' + (now.getFullYear() + 543) + '-' + String(n).padStart(3, '0');
    const copy = DriveApp.getFileById(tid).makeCopy('tmp ' + p.sid, folder);
    const pres = SlidesApp.openById(copy.getId());
    const isGp = String(p.type || '').indexOf('บุคลากร') === 0;
    pres.replaceAllText('{{name}}', p.name);
    pres.replaceAllText('{{idline}}', isGp ? 'หน่วยงาน ' + (p.org || '-') : 'รหัสนักศึกษา ' + p.sid);
    pres.replaceAllText('{{sid}}', p.sid);
    pres.replaceAllText('{{date}}', thaiDate_(now));
    pres.replaceAllText('{{ref}}', ref);
    pres.replaceAllText('{{scores}}', 'โหมดเรียนรู้ ' + p.nLearn + ' เคส · โหมดสอบเฉลี่ย ' + p.avg + ' คะแนน · แบบทดสอบ ' + p.quiz + '% · ลำดับขั้นตอน ' + p.nOrder + ' งาน');
    pres.saveAndClose();
    const pdf = folder.createFile(copy.getAs('application/pdf')).setName('เกียรติบัตร-' + p.sid + '-' + p.name + '.pdf');
    copy.setTrashed(true);
    log.appendRow([p.sid, p.name, ref, now, pdf.getUrl()]);
    n++;
  });
  ui.alert('ออกเกียรติบัตรแล้ว ' + todo.length + ' ฉบับ\nไฟล์อยู่ในโฟลเดอร์ "' + A.folder + '" ใน Google Drive และมีลิงก์ในแท็บ "' + A.logSheet + '"');
}
