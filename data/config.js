/* ===== ตั้งค่าแอป =====
   app      : รหัสแอปที่ส่งไปพร้อมคะแนน (ต้องตรงกับ APPS ใน apps-script/Code.gs)
   sheetUrl : URL ของ Google Apps Script (Web app) ตัวเดียวกับ Infusion Pump Trainer
              เว้นว่างไว้ = เก็บคะแนนในเครื่องผู้เรียนเท่านั้น
   token    : รหัสลับให้ตรงกับใน Apps Script
   course   : ชื่อวิชา แสดงในหน้าผลคะแนน
*/
window.APP_CONFIG = {
  app: "incubator",
  appName: "Infant Incubator Repair Trainer",
  portal: "/medtechcenter/",   // ที่อยู่เว็บหลัก (โดเมนเดียวกัน) เว้นว่าง = ใช้หน้าล็อกอินของแอปเอง
  sheetUrl: "https://script.google.com/macros/s/AKfycbzLcs08L6W0fnHHZ5tCq8JjkXFPcux3G3_WT1t3vUC8zSo-oQKoACC3xHc67-h-yy6KTw/exec",
  token: "pump-2569",
  course: "ศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์",

  /* ข้อความขอความยินยอมตอนลงทะเบียน (PDPA) */
  pdpa: "ข้าพเจ้ายินยอมให้เก็บชื่อ รหัสหรืออีเมล หน่วยงาน และผลการเรียนในระบบนี้ เพื่อใช้บันทึกผลการเรียน ติดตามความก้าวหน้า และออกใบรับรองเท่านั้น ข้อมูลจะไม่ถูกเปิดเผยต่อบุคคลภายนอก และขอให้ลบข้อมูลได้โดยติดต่อผู้ดูแลระบบ",

  /* ใบประกาศ */
  cert: {
    org: ["ศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์"],
    title: "การฝึกซ่อมและบำรุงรักษาตู้อบทารก (Infant Incubator)",
    subject: "ของศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์",
    signer: "รศ.ดร.ณัฐดนัย สิงห์คลีวรรณ",
    signerPos: "ผู้จัดทำสื่อการเรียนรู้",
    ref: "IIT"
  },

  /* เกณฑ์ผ่าน (ต้องตรงกับ APPS.incubator.crit ใน apps-script/Code.gs) */
  criteria: {
    learnCases: 8,
    examCases: 8,
    examAvg: 70,
    quizPct: 80,
    orderTasks: 3
  }
};
