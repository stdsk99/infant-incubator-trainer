/* ===== ข้อมูลแอนิเมชันเส้นทางสัญญาณ (โมดูล 1) =====
   ชื่อเส้นทาง (ใช้ใน f):
     key, airp, skin, hum, o2s, fans   = จากปุ่มกด/เซนเซอร์เข้า MCU
     relay = MCU → รีเลย์/SSR        htr  = รีเลย์ → ฮีตเตอร์
     fanc  = MCU → พัดลม             blow = พัดลม → ลมในตู้      heat = ฮีตเตอร์ → ลมในตู้
     disp  = MCU → จอ                buz  = MCU → buzzer / nurse call
     pwr   = ภาคจ่ายไฟ → MCU
   ชนิดสัญญาณ: cmd=คำสั่ง  fb=สัญญาณย้อนกลับ  mon=เฝ้าระวัง  out=แสดงผล  alarm=ผิดปกติ  stop=ตัดคำสั่ง
   cut = สถานะภาพตัดภายใน: run, heat:false, slow, hot, probeoff, hi (ชิ้นส่วนที่เน้น), screen, sub, buzzer
*/
window.FLOW = {
  normalLoop: [["key","cmd"],["relay","cmd"],["htr","cmd"],["heat","cmd"],["fanc","cmd"],["blow","cmd"],["airp","fb"],["skin","mon"],["hum","mon"],["o2s","mon"],["fans","mon"],["disp","out"],["pwr","pwr"]],
  scenarios: [
   {id:"normal", n:"ทำงานปกติ (โหมด Air)",
    steps:[
     {t:"ผู้ใช้เลือกโหมด Air และตั้งอุณหภูมิอากาศ 36.0 °C ผ่านปุ่มกด ค่าตั้งวิ่งเข้า MCU บนบอร์ดควบคุม",
      f:[["key","cmd"]], cut:{hi:["display"], screen:"AIR 30.2", sub:"SET 36.0 °C"}},
     {t:"MCU อ่านค่าจาก air probe ทั้งสองตัว พบว่าอากาศยังเย็นกว่าค่าตั้ง จึงคำนวณว่าต้องให้ความร้อนมากแค่ไหน",
      f:[["airp","fb"]], cut:{hi:["airprobe","control"], screen:"AIR 30.2", sub:"SET 36.0 °C"}},
     {t:"MCU สั่ง SSR บนบอร์ดรีเลย์ให้จ่ายไฟ AC ไปที่ฮีตเตอร์ ยิ่งห่างจากค่าตั้ง ยิ่งเปิดนาน รีเลย์นิรภัยต่ออยู่ในวงจรตลอดเวลาเพื่อตัดได้ทันทีเมื่อเกิดเหตุ",
      f:[["relay","cmd"],["htr","cmd"]], cut:{hi:["relay","heater"], run:true, screen:"AIR 31.5", sub:"SET 36.0 °C"}},
     {t:"พัดลมเป่าอากาศผ่านฮีตเตอร์และฮิวมิดิไฟเออร์ ลมอุ่นไหลขึ้นทางผนังเข้าห้องทารก ข้ามด้านบนตู้ แล้วไหลลงอีกด้านกลับเข้าพัดลม วนซ้ำเป็นวงปิด โดยมีอากาศใหม่ส่วนหนึ่งเติมเข้าทางแผ่นกรอง",
      f:[["fanc","cmd"],["blow","cmd"],["heat","cmd"]], cut:{hi:["fan","heater","filter"], run:true, screen:"AIR 33.8", sub:"SET 36.0 °C"}},
     {t:"ลมขาที่ไหลกลับเข้าพัดลมผ่านกล่องเซนเซอร์ air probe ซึ่งส่งค่าใหม่ให้ MCU ตลอดเวลา เมื่อเข้าใกล้ค่าตั้ง MCU ลดกำลังฮีตเตอร์ลง อุณหภูมิจึงไม่พุ่งเกิน (overshoot)",
      f:[["airp","fb"],["relay","cmd"],["htr","cmd"]], cut:{hi:["airprobe"], run:true, screen:"AIR 36.0", sub:"SET 36.0 °C"}},
     {t:"ระหว่างทำงาน MCU เฝ้าระวังรอบพัดลม อุณหภูมิ heat sink ความชื้น O₂ และสายวัดผิว ถ้าค่าใดผิดปกติจะตัดฮีตเตอร์และเตือนทันที",
      f:[["fans","mon"],["hum","mon"],["o2s","mon"],["skin","mon"]], cut:{hi:["fan","humid","o2","skinprobe"], run:true, screen:"AIR 36.0", sub:"SET 36.0 °C"}},
     {t:"MCU แสดงค่าบนจอ ส่วนภาคจ่ายไฟเลี้ยงทุกวงจรและชาร์จแบตเตอรี่สำรองที่ใช้เลี้ยง alarm ไฟดับ",
      f:[["disp","out"],["pwr","pwr"]], cut:{hi:["display","psu","battery"], run:true, screen:"AIR 36.0", sub:"SET 36.0 °C"}}
    ]},
   {id:"fan", n:"Alarm: พัดลมผิดปกติ",
    steps:[
     {t:"ตู้กำลังทำงานปกติ ฮีตเตอร์และพัดลมทำงานพร้อมกัน",
      normal:true, cut:{run:true}},
     {t:"ขุยผ้าพันแกนใบพัด รอบพัดลมลดลง เซนเซอร์วัดรอบส่งแรงดันต่ำลงให้ MCU ขณะเดียวกัน heat sink ร้อนเร็วผิดปกติเพราะลมผ่านน้อย",
      f:[["fans","alarm"],["fanc","cmd"]], cut:{run:true, slow:true, hi:["fan","heater"]}},
     {t:"ถ้าฮีตเตอร์ยังทำงานโดยไม่มีลมพาความร้อนออกไป ฮีตเตอร์จะร้อนจัดและอากาศในตู้จะร้อนไม่สม่ำเสมอ MCU จึงตัดคำสั่งไปที่รีเลย์ ฮีตเตอร์หยุดทันที",
      f:[["fans","alarm"],["relay","stop"]], cut:{run:true, slow:true, heat:false, hi:["fan","relay"]}},
     {t:"MCU สั่ง buzzer ดัง ไฟเตือนกะพริบ และส่งสัญญาณ nurse call",
      f:[["buz","alarm"]], cut:{run:true, slow:true, heat:false, hi:["display"], buzzer:true}},
     {t:"จอแสดง FAN FAILURE ตู้จะเย็นลงเรื่อยๆ ต้องย้ายทารกไปตู้อื่น แล้วส่งช่างตรวจใบพัด",
      f:[["disp","alarm"],["buz","alarm"]], cut:{run:true, slow:true, heat:false, hi:["display"], buzzer:true, screen:"⚠ FAN FAILURE"}}
    ]},
   {id:"hot", n:"Alarm: อากาศร้อนเกิน",
    steps:[
     {t:"ตู้กำลังทำงานปกติ",
      normal:true, cut:{run:true}},
     {t:"SSR ของฮีตเตอร์ช็อตค้าง ฮีตเตอร์ได้รับไฟตลอดแม้ MCU สั่งปิดแล้ว อุณหภูมิอากาศจึงสูงขึ้นเรื่อยๆ",
      f:[["htr","alarm"],["heat","cmd"],["airp","fb"]], cut:{run:true, hot:true, hi:["relay","heater"], screen:"AIR 37.4"}},
     {t:"เมื่ออากาศเกิน 38 °C (หรือ 40 °C ในโหมด override) วงจรป้องกันอุณหภูมิเกินซึ่งทำงานแยกจากซอฟต์แวร์ สั่งรีเลย์นิรภัยตัดไฟฮีตเตอร์ทั้งวงจร",
      f:[["airp","alarm"],["relay","stop"]], cut:{run:true, hot:true, heat:false, hi:["airprobe","relay"], screen:"AIR 38.2"}},
     {t:"MCU สั่ง buzzer ดังและไฟเตือนกะพริบ พัดลมยังหมุนต่อเพื่อระบายความร้อน",
      f:[["buz","alarm"],["fanc","cmd"]], cut:{run:true, hot:true, heat:false, hi:["display","fan"], buzzer:true, screen:"AIR 38.2"}},
     {t:"จอแสดง AIR TEMP > 38 °C ผู้ดูแลต้องตรวจอุณหภูมิทารกทันที ช่างต้องตรวจว่ายังมีกระแสไหลในฮีตเตอร์ขณะสั่ง OFF หรือไม่",
      f:[["disp","alarm"],["buz","alarm"]], cut:{run:true, hot:true, heat:false, hi:["display"], buzzer:true, screen:"⚠ AIR > 38°C"}}
    ]},
   {id:"probe", n:"Alarm: สายวัดผิวผิดปกติ",
    steps:[
     {t:"ตู้ทำงานในโหมด Baby โดยใช้ค่าจากสายวัดอุณหภูมิผิวควบคุมฮีตเตอร์ ตั้งผิวทารกไว้ที่ 36.5 °C",
      f:[["skin","fb"],["relay","cmd"],["htr","cmd"],["heat","cmd"],["fanc","cmd"],["blow","cmd"],["disp","out"]], cut:{run:true, hi:["skinprobe"], screen:"SKIN 36.5", sub:"SET 36.5 °C"}},
     {t:"สายวัดขาดในตรงรอยพับ วงจรเปิด ค่าที่ MCU อ่านได้หลุดออกนอกช่วงที่เป็นไปได้ทันที",
      f:[["skin","alarm"]], cut:{run:true, probeoff:true, hi:["skinprobe"], screen:"SKIN ---", sub:"SET 36.5 °C"}},
     {t:"MCU ไม่ใช้ค่าผิดปกตินี้ควบคุม เพราะถ้าเชื่อว่าทารกเย็น จะเร่งฮีตเตอร์จนทารกร้อนเกิน จึงหยุดหรือจำกัดกำลังฮีตเตอร์ตามที่ผู้ผลิตออกแบบ",
      f:[["skin","alarm"],["relay","stop"]], cut:{run:true, probeoff:true, heat:false, hi:["control","relay"], screen:"SKIN ---", sub:"SET 36.5 °C"}},
     {t:"MCU สั่ง buzzer ดัง ไฟเตือนกะพริบ และส่งสัญญาณ nurse call",
      f:[["buz","alarm"]], cut:{run:true, probeoff:true, heat:false, hi:["display"], buzzer:true, screen:"SKIN ---"}},
     {t:"จอแสดง PROBE FAILURE ผู้ดูแลตรวจการเสียบสาย ถ้าไม่หาย ช่างทดสอบโดยงอสายและลองหัววัดที่ทราบว่าดี",
      f:[["disp","alarm"],["buz","alarm"]], cut:{run:true, probeoff:true, heat:false, hi:["display"], buzzer:true, screen:"⚠ PROBE FAIL"}}
    ]}
  ]
};
