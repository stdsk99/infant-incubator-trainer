/* ===== โมดูล 4: การทดสอบหลังซ่อม / PM ===== */
(function(){
  const D = window.PM;
  const root = document.getElementById("pm");
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const rnd = (a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
  const r1 = x=>Math.round(x*10)/10, r2=x=>Math.round(x*100)/100;
  let cur = "temp";

  /* ---------- โจทย์ฝึก: สร้างแบบสุ่ม ---------- */
  const GEN = {
    temp(){
      const t=pick(["uni","acc","over"]);
      if(t==="uni"){
        const M=r1(rnd(35.6,36.4)), bad=Math.random()<.45, pts=["A","B","C","D"].map(()=>r1(M+rnd(-0.6,0.6)));
        if(bad){ const k=Math.floor(Math.random()*4); pts[k]=r1(M+(Math.random()<.5?-1:1)*rnd(0.9,1.6)); }
        const d=r1(Math.max(...pts.map(p=>Math.abs(p-M)))), pass=d<=0.8;
        return {q:`ค่าเฉลี่ยจาก incubator analyzer: M ${M} °C · A ${pts[0]} · B ${pts[1]} · C ${pts[2]} · D ${pts[3]} °C (เตียงแนวราบ) ความสม่ำเสมอเป็นเท่าไร และผ่านเกณฑ์หรือไม่`,
          num:{label:"ค่าที่ต่างจาก M มากที่สุด (°C)", ans:d, tol:0.05}, pass,
          ex:`|A−M|=${r1(Math.abs(pts[0]-M))}, |B−M|=${r1(Math.abs(pts[1]-M))}, |C−M|=${r1(Math.abs(pts[2]-M))}, |D−M|=${r1(Math.abs(pts[3]-M))} → มากที่สุด ${d} °C เกณฑ์ ≤ 0.8 °C → ${pass?"ผ่าน":"ไม่ผ่าน ตรวจใบพัด grommet และซีลที่ทำให้ลมกระจายไม่ทั่ว"}`};
      }
      if(t==="acc"){
        const set=pick([32,34,36]), avg=r1(set+(Math.random()<.55?rnd(-1.3,1.3):(Math.random()<.5?-1:1)*rnd(1.6,2.6))), d=r1(Math.abs(avg-set)), pass=d<=1.5;
        return {q:`ตั้งโหมด Air ${set}.0 °C อุณหภูมิตู้เฉลี่ย (จุด M ขณะคงที่) วัดได้ ${avg} °C ความแม่นยำการควบคุมผ่านเกณฑ์หรือไม่`,
          num:{label:"|อุณหภูมิตู้เฉลี่ย − ค่าตั้ง| (°C)", ans:d, tol:0.05}, pass,
          ex:`|${avg} − ${set}.0| = ${d} °C เกณฑ์ ≤ 1.5 °C → ${pass?"ผ่าน":"ไม่ผ่าน ตรวจ air probe และค่าสอบเทียบ"}`};
      }
      const peak=r1(36+(Math.random()<.55?rnd(0.3,1.8):rnd(2.2,3.4))), o=r1(peak-36), pass=o<=2;
      return {q:`เปลี่ยนค่าตั้งจาก 32 เป็น 36 °C อุณหภูมิที่จุด M ขึ้นสูงสุด ${peak} °C ก่อนกลับมาคงที่ overshoot ผ่านเกณฑ์หรือไม่`,
        num:{label:"Overshoot (°C)", ans:o, tol:0.05}, pass,
        ex:`Overshoot = ${peak} − 36.0 = ${o} °C เกณฑ์ ≤ 2 °C → ${pass?"ผ่าน":"ไม่ผ่าน อุณหภูมิพุ่งเกินจนเสี่ยงให้ทารกร้อนเกิน"}`};
    },
    skin(){
      const ref=r1(rnd(35.5,37)), e=Math.random()<.55?r1(rnd(-0.3,0.3)):r1((Math.random()<.5?-1:1)*rnd(0.4,0.9)), disp=r1(ref+e), d=r1(disp-ref), pass=Math.abs(d)<=0.3;
      return {q:`แช่หัววัดผิวในน้ำอุ่น เครื่องแสดง ${disp} °C เทอร์โมมิเตอร์อ้างอิงอ่านได้ ${ref} °C ค่าต่างเท่าไร และผ่านเกณฑ์หรือไม่`,
        num:{label:"ค่าต่าง = เครื่อง − อ้างอิง (°C)", ans:d, tol:0.05}, pass,
        ex:`${disp} − ${ref} = ${d>0?"+":""}${d} °C เกณฑ์ ±0.3 °C → ${pass?"ผ่าน":"ไม่ผ่าน "+(d<0?"หัววัดอ่านต่ำกว่าจริง เครื่องจะให้ความร้อนเกิน อันตรายต่อทารก":"หัววัดอ่านสูงกว่าจริง ทารกจะได้ความร้อนไม่พอ")}`};
    },
    humid(){
      const set=pick([50,60,65,70]), ref=Math.round(set+rnd(-4,4)), e=Math.random()<.55?Math.round(rnd(-9,9)):Math.round((Math.random()<.5?-1:1)*rnd(12,20)), disp=ref+e, pass=Math.abs(e)<=10;
      return {q:`ตั้งความชื้น ${set}% เครื่องแสดง ${disp}% เครื่องวัดอ้างอิงอ่านได้ ${ref}% (เกณฑ์ตัวอย่าง ±10% RH) ผ่านหรือไม่`, pass,
        ex:`ค่าต่าง = ${disp} − ${ref} = ${e>0?"+":""}${e}% RH → ${pass?"ผ่าน":"ไม่ผ่าน ตรวจเซนเซอร์ความชื้นและระบบทำความชื้น"}`};
    },
    o2(){
      const ref=pick([21,30,40,60]), e=Math.random()<.55?r1(rnd(-2.5,2.5)):r1((Math.random()<.5?-1:1)*rnd(3.6,9)), disp=r1(ref+e), pass=Math.abs(e)<=3;
      return {q:`เครื่องวิเคราะห์ O₂ อ้างอิงอ่านได้ ${ref}% ตู้อบแสดง ${disp}% (เกณฑ์ตัวอย่าง ±3%) ผ่านหรือไม่`, pass,
        ex:`ค่าต่าง = ${disp} − ${ref} = ${e>0?"+":""}${e}% → ${pass?"ผ่าน":"ไม่ผ่าน "+(e<0?"เครื่องอ่านต่ำกว่าจริง จะจ่าย O₂ จนทารกได้สูงเกิน มักเกิดจากเซนเซอร์หมดอายุ":"เครื่องอ่านสูงกว่าจริง ทารกจะได้ O₂ ต่ำกว่าที่สั่ง")}`};
    },
    env(){
      const c=pick([
        ()=>{const v=Math.round(pick([rnd(48,59),rnd(62,70)])),p=v<=60;return {q:`ระดับเสียงในตู้ขณะทำงานปกติวัดได้ ${v} dBA ผ่านหรือไม่`,p,e:`เกณฑ์ ≤ 60 dBA → ${p?"ผ่าน":"ไม่ผ่าน ตรวจใบพัด ลูกปืนมอเตอร์ และ grommet"}`};},
        ()=>{const v=Math.round(pick([rnd(66,79),rnd(82,90)])),p=v<=80;return {q:`ระดับเสียง alarm ที่วัดภายในตู้ได้ ${v} dBA ผ่านหรือไม่`,p,e:`เกณฑ์เสียง alarm ภายในตู้ ≤ 80 dBA → ${p?"ผ่าน":"ไม่ผ่าน เสียงดังเกินทำร้ายการได้ยินของทารก"}`};},
        ()=>{const v=r2(pick([rnd(0.08,0.3),rnd(0.4,0.6)])),p=v<=0.35;return {q:`ความเร็วลมเหนือที่นอน 10 cm วัดได้ ${v} m/s ผ่านหรือไม่`,p,e:`เกณฑ์ ≤ 0.35 m/s → ${p?"ผ่าน":"ไม่ผ่าน ลมแรงทำให้ทารกเสียความร้อนจากการพาความร้อน"}`};}
      ])();
      return {q:c.q, pass:c.p, ex:c.e};
    },
    func(){
      const c=pick([
        {s:"ถอดปลั๊กขณะเครื่องทำงาน alarm ไฟดับดัง 12 นาทีจนกว่าจะเสียบกลับ และเครื่องกลับสู่โหมดเดิม",p:true,e:"ผ่าน ดังได้นานกว่า 10 นาทีตามเกณฑ์"},
        {s:"ถอดปลั๊กขณะเครื่องทำงาน alarm ไฟดับดังประมาณ 3 นาทีแล้วเงียบ",p:false,e:"ไม่ผ่าน ต้องดังได้อย่างน้อย 10 นาที ตรวจแบตเตอรี่สำรองและวงจรชาร์จ"},
        {s:"ถอดหัววัดผิวในโหมด Baby alarm Probe Failure ขึ้นทันทีพร้อมเสียงและไฟเตือน",p:true,e:"ผ่าน"},
        {s:"ทุกระบบทำงาน แต่สลักประตูด้านข้างล็อกไม่อยู่ เปิดออกได้เมื่อดันเบาๆ",p:false,e:"ไม่ผ่าน เสี่ยงทารกตก ต้องซ่อมสลักก่อน"},
        {s:"alarm ทุกชนิดทำงาน แต่ขอบยาง porthole ฉีกหนึ่งช่อง",p:false,e:"ไม่ผ่าน อากาศอุ่นรั่ว ทำให้อุณหภูมิไม่สม่ำเสมอและ O₂ ไม่ขึ้น ต้องเปลี่ยนซีล"},
        {s:"ทดสอบ alarm อุณหภูมิอากาศสูง: เมื่ออากาศถึง 38 °C เครื่องตัดฮีตเตอร์และ alarm ดัง",p:true,e:"ผ่าน"}]);
      return {q:c.s+" ผ่านหรือไม่", pass:c.p, ex:c.e};
    },
    esa(){
      const t=pick(["pe","eq","ap"]);
      if(t==="pe"){ const v=r2(pick([rnd(0.05,0.28),rnd(0.32,0.9)])), p=v<=0.3;
        return {q:`ตู้อบ Class I ความต้านทานสายดิน (รวมสายไฟ) วัดได้ ${v} Ω ผ่านเกณฑ์ IEC 62353 หรือไม่`, pass:p, ex:`เกณฑ์ ≤ 0.3 Ω → ${p?"ผ่าน":"ไม่ผ่าน ตรวจสายไฟ ขาปลั๊ก และจุดต่อสายดินภายใน"}`}; }
      if(t==="eq"){ const m=pick(["direct","alternative"]), lim=m==="direct"?500:1000, v=Math.round(pick([rnd(40,lim*0.8),rnd(lim*1.05,lim*1.6)])), p=v<=lim;
        return {q:`ตู้อบ Class I วัด equipment leakage ด้วยวิธี ${m} ได้ ${v} µA ผ่านหรือไม่`, pass:p, ex:`เกณฑ์วิธี ${m} = ≤ ${lim} µA → ${p?"ผ่าน":"ไม่ผ่าน ตรวจฉนวนฮีตเตอร์และฮิวมิดิไฟเออร์"}`}; }
      const ty=pick(["BF","BF","CF"]), lim=ty==="BF"?5000:50, v=Math.round(pick([rnd(lim*0.05,lim*0.8),rnd(lim*1.1,lim*1.8)])), p=v<=lim;
      return {q:`applied part ชนิด ${ty} วัด applied part leakage ได้ ${v} µA ผ่านหรือไม่`, pass:p, ex:`เกณฑ์ Type ${ty} = ≤ ${lim} µA → ${p?"ผ่าน":"ไม่ผ่าน"}`};
    }
  };

  function practice(id){
    const box=root.querySelector("#pm-pr"), N=5; let i=0, ok=0, q=null, step=0;
    function next(){
      if(i>=N){ box.innerHTML=`<div class="score ${ok>=4?"ok":ok>=3?"mid":"bad"}"><div class="big">${ok}/${N}</div><div>ตอบถูก</div></div><div class="tools"><button class="primary" id="pr-again">ฝึกอีกชุด</button></div>`;
        window.Score&&Score.record({key:"pm:"+id, mod:"4-ทดสอบ/PM", item:"ฝึกตัดสินผล: "+D.find(x=>x.id===id).n, score:ok, max:N});
        box.querySelector("#pr-again").onclick=()=>practice(id); return; }
      q=GEN[id](); step=q.num?0:1; draw();
    }
    function draw(fb){
      box.innerHTML=`<div class="kicker">ข้อ ${i+1} / ${N}</div><p class="pq">${esc(q.q)}</p>
        ${q.num?`<label class="nlab">${esc(q.num.label)}<input id="pr-n" type="number" step="0.01" inputmode="decimal" ${step>0?"disabled":""}></label>`:""}
        ${step===0?`<div class="tools"><button class="primary" id="pr-c">ตรวจตัวเลข</button></div>`:
          `<div class="tools"><button class="pf" data-v="1">✓ ผ่าน</button><button class="pf" data-v="0">✗ ไม่ผ่าน</button></div>`}
        <div id="pr-fb">${fb||""}</div>`;
      const c=box.querySelector("#pr-c");
      if(c) c.onclick=()=>{ const v=parseFloat(box.querySelector("#pr-n").value);
        if(isNaN(v)){ box.querySelector("#pr-fb").innerHTML=`<div class="msg bad">กรอกตัวเลขก่อน</div>`; return; }
        q.numOk=Math.abs(v-q.num.ans)<=q.num.tol; step=1;
        draw(`<div class="msg ${q.numOk?"ok":"bad"}">${q.numOk?"ตัวเลขถูกต้อง":"ยังไม่ถูก คำตอบคือ "+q.num.ans} · ต่อไปตัดสินว่าผ่านหรือไม่</div>`);
        box.querySelector("#pr-n").value=v; };
      box.querySelectorAll(".pf").forEach(b=>b.onclick=()=>{
        const good=(b.dataset.v==="1")===q.pass && (q.num?q.numOk:true);
        if(good) ok++;
        box.querySelectorAll(".pf").forEach(x=>x.disabled=true);
        box.querySelector("#pr-fb").innerHTML=`<div class="fb ${good?"good":"bad"}"><b>${good?"✓ ถูกต้อง":"✗ ยังไม่ถูก"}</b><p>${esc(q.ex)}</p><button class="primary" id="pr-nx">${i+1<N?"ข้อต่อไป →":"ดูผล"}</button></div>`;
        box.querySelector("#pr-nx").onclick=()=>{i++;next();};
      });
    }
    next();
  }

  /* ---------- เครื่องคำนวณ ---------- */
  function calc(id){
    if(id==="temp") return `<div class="calc"><h3>เครื่องคำนวณ</h3>
      <div class="cgrid"><label>ค่าตั้ง (°C)<input id="c-s" type="number" value="36.0" step="0.1" inputmode="decimal"></label>
      <label>จุด M (กลาง)<input id="c-m" type="number" value="36.2" step="0.1" inputmode="decimal"></label>
      <label>จุด A<input id="c-a" type="number" value="35.9" step="0.1" inputmode="decimal"></label>
      <label>จุด B<input id="c-b" type="number" value="36.3" step="0.1" inputmode="decimal"></label>
      <label>จุด C<input id="c-c" type="number" value="36.0" step="0.1" inputmode="decimal"></label>
      <label>จุด D<input id="c-d" type="number" value="35.6" step="0.1" inputmode="decimal"></label>
      <label>เกณฑ์ความสม่ำเสมอ (°C)<input id="c-u" type="number" value="0.8" step="0.1" inputmode="decimal"></label></div><div id="c-o" class="cout"></div>
      <p class="muted small">ใส่ค่าเฉลี่ยของแต่ละจุดขณะตู้คงที่ อุณหภูมิตู้เฉลี่ยใช้ค่าที่จุด M</p></div>`;
    if(id==="skin") return `<div class="calc"><h3>เครื่องตัดสินผล</h3>
      <div class="cgrid"><label>เครื่องแสดง (°C)<input id="c-v" type="number" value="36.2" step="0.1" inputmode="decimal"></label>
      <label>เทอร์โมมิเตอร์อ้างอิง (°C)<input id="c-r" type="number" value="36.0" step="0.1" inputmode="decimal"></label></div><div id="c-o" class="cout"></div></div>`;
    return "";
  }
  function bindCalc(id){
    const $=s=>root.querySelector(s), o=$("#c-o"); if(!o) return;
    const run=()=>{
      if(id==="temp"){ const s=+$("#c-s").value, m=+$("#c-m").value, u=+$("#c-u").value||0.8;
        const pts=["a","b","c","d"].map(k=>+$("#c-"+k).value), ds=pts.map(p=>Math.abs(p-m)), d=Math.max(...ds), w="ABCD"[ds.indexOf(d)];
        const acc=Math.abs(m-s), pu=d<=u, pa=acc<=1.5;
        o.innerHTML=`ความสม่ำเสมอ <b>${r1(d)} °C</b> (จุด ${w}) <span class="pfb ${pu?"ok":"bad"}">${pu?"ผ่าน":"ไม่ผ่าน"}</span><br>ความแม่นยำการควบคุม |M − ค่าตั้ง| = <b>${r1(acc)} °C</b> <span class="pfb ${pa?"ok":"bad"}">${pa?"ผ่าน":"ไม่ผ่าน"}</span>`; }
      if(id==="skin"){ const v=+$("#c-v").value, r=+$("#c-r").value, d=r1(v-r), p=Math.abs(d)<=0.3;
        o.innerHTML=`ค่าต่าง <b>${d>0?"+":""}${d} °C</b> <span class="pfb ${p?"ok":"bad"}">${p?"ผ่าน":"ไม่ผ่าน"}</span>${!p&&d<0?" หัววัดอ่านต่ำกว่าจริง เสี่ยงให้ความร้อนเกิน":!p?" หัววัดอ่านสูงกว่าจริง":""}`; }
    };
    root.querySelectorAll(".calc input").forEach(i=>i.addEventListener("input",run)); run();
  }

  /* ---------- แบบบันทึกผล PM ---------- */
  function form(){
    return `<details class="grp"><summary>แบบบันทึกผลการทดสอบ (คัดลอกไปใช้ได้)</summary><div class="acts" style="display:block">
      <div class="cgrid"><label>เลขครุภัณฑ์<input id="f-id"></label><label>ยี่ห้อ/รุ่น<input id="f-md"></label><label>หน่วยงาน<input id="f-w"></label><label>ผู้ทดสอบ<input id="f-by"></label></div>
      ${D.map(t=>`<label class="fchk"><span>${esc(t.n)}</span><select data-t="${t.id}"><option value="">ไม่ได้ทำ</option><option>ผ่าน</option><option>ไม่ผ่าน</option></select><input data-v="${t.id}" placeholder="ค่าที่วัดได้"></label>`).join("")}
      <div class="tools"><button class="primary" id="f-cp">สร้างข้อความบันทึก</button></div><div id="f-o"></div></div></details>`;
  }
  function bindForm(){
    const b=root.querySelector("#f-cp"); if(!b) return;
    b.onclick=async()=>{
      const v=s=>root.querySelector(s).value.trim();
      const rows=D.map(t=>{const r=root.querySelector(`[data-t="${t.id}"]`).value, m=root.querySelector(`[data-v="${t.id}"]`).value.trim(); return r?`- ${t.n}: ${r}${m?" ("+m+")":""}`:null;}).filter(Boolean);
      const all=rows.length&&rows.every(r=>r.includes(": ผ่าน"));
      const txt=`บันทึกการทดสอบตู้อบทารก (Infant incubator)\nวันที่: ${new Date().toLocaleDateString("th-TH")}\nเลขครุภัณฑ์: ${v("#f-id")||"-"} · รุ่น: ${v("#f-md")||"-"} · หน่วยงาน: ${v("#f-w")||"-"}\n${rows.join("\n")||"- ยังไม่ได้เลือกผล"}\nสรุป: ${all?"ผ่าน พร้อมใช้งาน":"ไม่ผ่าน/ไม่ครบ ห้ามใช้งาน"}\nผู้ทดสอบ: ${v("#f-by")||"-"}`;
      const ta=document.createElement("textarea"); ta.className="copybox"; ta.value=txt; root.querySelector("#f-o").replaceChildren(ta);
      try{ await navigator.clipboard.writeText(txt); b.textContent="คัดลอกแล้ว ✓"; }catch(e){ ta.select(); }
    };
  }

  function render(){
    const t=D.find(x=>x.id===cur);
    root.innerHTML=`<h1>การทดสอบหลังซ่อม / PM</h1>
      <p class="muted">ทุกงานซ่อมต้องจบด้วยการทดสอบที่ตรงกับสิ่งที่ซ่อม ก่อนส่งเครื่องกลับไปใช้กับผู้ป่วย เลือกหัวข้อการทดสอบ อ่านขั้นตอน แล้วฝึกตัดสินผลจากโจทย์สุ่ม</p>
      <div class="chips pmtabs">${D.map(x=>`<button data-id="${x.id}" class="${x.id===cur?"on":""}">${esc(x.n)}</button>`).join("")}</div>
      <div class="pmgrid">
        <div>
          <h2>${esc(t.th)}</h2><p>${esc(t.why)}</p>
          <h3>อุปกรณ์</h3><ul>${t.tools.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          <h3>ขั้นตอน</h3><ol>${t.steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
          ${t.limits?`<h3>${esc(t.limTitle||"เกณฑ์")}</h3><table class="lim">${t.limits.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table>`:""}
          <div class="formula">${esc(t.formula).replace(/\n/g,"<br>")}</div>
          <h3>ข้อควรระวัง</h3><ul>${t.tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          ${calc(cur)}
        </div>
        <aside class="logbox"><h2>ฝึกตัดสินผล</h2><div id="pm-pr"></div></aside>
      </div>
      ${form()}`;
    root.querySelectorAll(".pmtabs button").forEach(b=>b.onclick=()=>{cur=b.dataset.id;render();});
    bindCalc(cur); bindForm(); practice(cur);
  }

  window.Views=window.Views||{}; window.Views.pm={show:()=>{ if(!root.innerHTML) render(); }};
})();
