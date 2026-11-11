/* ===== โมดูล 7: การใช้งานสำหรับช่าง =====
   แท็บ: บทเรียน · ฝึกตั้งค่า · ตรวจก่อนใช้งาน · มุมช่าง
   คะแนน clin:sim = ฝึกตั้งค่า (5 ใบสั่ง × 2 = 10) + มุมช่าง (8 โจทย์ × 2 = 16) รวม 26 คะแนน
   ระบบส่งคะแนนครั้งเดียวเมื่อทำครบทั้งสองส่วน (เก็บผลส่วนที่ทำแล้วไว้ในเครื่องระหว่างรอ) */
(function(){
  const D=window.TECHUSE, root=document.getElementById("tech");
  if(!D||!root) return;
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const r1=x=>Math.round(x*10)/10, f1=x=>x.toFixed(1);
  const range=(a,b,s)=>{const o=[];for(let x=a;x<=b+1e-9;x+=s)o.push(r1(x));return o;};
  const TABS=[["learn","บทเรียน"],["set","ฝึกตั้งค่า"],["check","ตรวจก่อนใช้งาน"],["tech","มุมช่าง"]];
  const MOD="6-การใช้งานสำหรับช่าง";
  let tab="learn", lesson=D.lessons[0].id;

  /* ---------- คะแนนรวม 2 ส่วน ---------- */
  const K_P="iit-clin-part";
  const sid=()=>{ const p=window.Score&&Score.profile(); return p?p.sid:""; };
  function parts(){ try{ const o=JSON.parse(localStorage.getItem(K_P)); return o&&o.sid===sid()?o:{sid:sid()}; }catch(e){ return {sid:sid()}; } }
  function savePart(name, score, max){
    const o=parts(); o[name]={score, max, t:Date.now()};
    if(o.set && o.tech){
      const sc=o.set.score+o.tech.score, mx=o.set.max+o.tech.max;
      window.Score&&Score.record({key:"clin:sim", mod:MOD, item:"ฝึกตั้งค่าและมุมช่าง", score:sc, max:mx,
        detail:`ฝึกตั้งค่า ${o.set.score}/${o.set.max} · มุมช่าง ${o.tech.score}/${o.tech.max}`});
      try{ localStorage.removeItem(K_P); }catch(e){}
      return {done:true, score:sc, max:mx};
    }
    try{ localStorage.setItem(K_P, JSON.stringify(o)); }catch(e){}
    return {done:false};
  }
  function statusBar(){
    const o=parts(), b=window.Score&&Score.bestOf("clin:sim");
    const one=(k,n)=>o[k]?`<span class="tp ok">✓ ${n} ${o[k].score}/${o[k].max}</span>`:`<span class="tp">○ ${n}</span>`;
    return `<div class="tstat"><b>คะแนนโมดูลนี้</b>${one("set","ฝึกตั้งค่า")}${one("tech","มุมช่าง")}
      <span class="muted small">${b?`ดีที่สุด ${Math.round(b.v*100)}% (${b.score}/${b.max})`:"ทำครบทั้งสองส่วนแล้วระบบจึงส่งคะแนน"} · เกณฑ์ผ่าน ≥ 80%</span></div>`;
  }

  function frame(body){
    root.innerHTML=`<h1>การใช้งานสำหรับช่าง</h1>
      <p class="muted">เข้าใจว่าผู้ใช้ตั้งเครื่องอย่างไร ฝึกตั้งค่าบนแผงควบคุมจำลอง ฝึกตรวจเครื่องก่อนใช้งาน และฝึกแยกให้ออกว่าปัญหาที่ได้รับแจ้งเกิดจากการใช้งานหรือเครื่องเสีย</p>
      <div class="note small" style="margin:0 0 10px">⚠️ ${esc(D.disclaimer)}</div>
      ${statusBar()}
      <div class="chips pmtabs">${TABS.map(([id,n])=>`<button data-t="${id}" class="${tab===id?"on":""}">${n}</button>`).join("")}</div>
      <div id="tu-body">${body}</div>`;
    root.querySelectorAll(".pmtabs [data-t]").forEach(b=>b.onclick=()=>{tab=b.dataset.t;render();window.scrollTo(0,0);});
  }

  /* ---------- บทเรียน ---------- */
  function block([t,c]){
    if(t==="p") return `<p>${c}</p>`;
    if(t==="ul") return `<ul>${c.map(x=>`<li>${x}</li>`).join("")}</ul>`;
    if(t==="ol") return `<ol>${c.map(x=>`<li>${x}</li>`).join("")}</ol>`;
    if(t==="ex") return `<div class="exbox"><b>ตัวอย่าง</b><br>${esc(c).replace(/\n/g,"<br>")}</div>`;
    if(t==="tip") return `<div class="hint">💡 ${c}</div>`;
    if(t==="warn") return `<div class="msg bad">⚠️ ${c}</div>`;
    return "";
  }
  function viewLearn(){
    const L=D.lessons.find(x=>x.id===lesson), i=D.lessons.indexOf(L);
    frame(`<div class="clgrid">
      <nav class="clnav">${D.lessons.map(x=>`<button data-l="${x.id}" data-seen="tech|${x.id}" class="${x.id===lesson?"on":""}">${esc(x.n)}</button>`).join("")}</nav>
      <article class="lesson"><h2>${esc(L.n)}</h2>${L.b.map(block).join("")}
        ${L.drill?`<div id="cfg-drill"></div>`:""}
        <div class="tools">${i>0?`<button data-go="${D.lessons[i-1].id}">◀ ${esc(D.lessons[i-1].n)}</button>`:""}
        ${i<D.lessons.length-1?`<button class="primary" data-go="${D.lessons[i+1].id}">${esc(D.lessons[i+1].n)} ▶</button>`:`<button class="primary" data-tab="set">ไปฝึกตั้งค่า ▶</button>`}</div>
      </article></div>`);
    if(window.Seen) Seen.mark("tech", lesson, root);
    root.querySelectorAll("[data-l],[data-go]").forEach(b=>b.onclick=()=>{lesson=b.dataset.l||b.dataset.go;render();if(window.innerWidth<900)root.querySelector(".lesson").scrollIntoView({behavior:"smooth"});});
    const t=root.querySelector("[data-tab]"); if(t) t.onclick=()=>{tab="set";render();window.scrollTo(0,0);};
    if(L.drill) cfgDrill(root.querySelector("#cfg-drill"));
  }

  /* แบบฝึกท้ายบทที่ 5: เทียบค่าบนเครื่องกับใบบันทึก (ไม่เก็บคะแนน) */
  function cfgDrill(box){
    const items=D.configItems, badIdx=new Set(shuffle(items.map((x,k)=>k)).slice(0,3+Math.floor(Math.random()*2)));
    const order=shuffle(items.map((x,k)=>k)), mark=new Set(); let checked=false;
    function draw(){
      box.innerHTML=`<h3>แบบฝึก: หลังเปลี่ยนบอร์ดควบคุม ค่าไหนไม่ตรงกับใบบันทึก</h3>
        <p class="muted small">เทียบหน้าจอเมนูช่างกับใบบันทึกค่าตั้งเครื่องของหน่วยงาน แล้วแตะรายการบนหน้าจอที่ต้องแก้ (ไม่เก็บคะแนน)</p>
        <div class="cfggrid">
          <div class="cfgrec"><div class="tk-h"><span>📄 ใบบันทึกค่าตั้งเครื่อง</span></div>
            <dl>${items.map(x=>`<dt>${esc(x.n)}</dt><dd>${esc(x.rec)}</dd>`).join("")}</dl></div>
          <div class="cfgscr"><div class="cfgh">SERVICE › CONFIGURATION</div>
            ${order.map(k=>{ const x=items[k], bad=badIdx.has(k), m=mark.has(k);
              const cls=checked?(bad&&m?"good":bad?"miss":m?"bad":""):(m?"on":"");
              return `<button class="cfgrow ${cls}" data-k="${k}" ${checked?"disabled":""} aria-pressed="${m}"><span>${esc(x.n)}</span><b>${esc(bad?x.bad:x.rec)}</b></button>`; }).join("")}
          </div>
        </div>
        <div class="tools">${checked?`<button id="cd-new">สุ่มชุดใหม่</button>`:`<button class="primary" id="cd-chk">ตรวจคำตอบ</button>`}</div>
        <div id="cd-res"></div>`;
      box.querySelectorAll(".cfgrow").forEach(b=>b.onclick=()=>{ const k=+b.dataset.k; mark.has(k)?mark.delete(k):mark.add(k); draw(); });
      const c=box.querySelector("#cd-chk"); if(c) c.onclick=()=>{ checked=true; draw();
        const hit=[...badIdx].filter(k=>mark.has(k)).length, extra=[...mark].filter(k=>!badIdx.has(k)).length;
        box.querySelector("#cd-res").innerHTML=`<div class="fb ${hit===badIdx.size&&!extra?"good":"bad"}"><b>พบ ${hit} จาก ${badIdx.size} รายการ${extra?` · เลือกเกิน ${extra} รายการ`:""}</b>
          <ul>${[...badIdx].map(k=>`<li><b>${esc(items[k].n)}</b>: ${esc(items[k].bad)} → ${esc(items[k].rec)} · ${esc(items[k].why)}</li>`).join("")}</ul></div>`; };
      const n=box.querySelector("#cd-new"); if(n) n.onclick=()=>cfgDrill(box);
    }
    draw();
  }

  /* ---------- ฝึกตั้งค่า ---------- */
  const P=D.panel;
  function genOrder(kind){
    const hums=range(P.hum.min+20,85,5), o2s=range(25,45,1);
    const skinT=pick(range(36.0,36.8,0.1));
    const O={
      pmtest:()=>{ const t=pick([32.0,36.0]); return {mode:"air",temp:t,hum:null,o2:null, who:"งานทดสอบหลังซ่อม",
        text:`เตรียมเครื่องเพื่อทดสอบประสิทธิภาพอุณหภูมิด้วย incubator analyzer (โมดูล 4): โหมด Air ค่าตั้ง ${f1(t)} °C ปิดความชื้น ปิด O₂`}; },
      demo:()=>{ const h=pick(hums); return {mode:"skin",temp:skinT,hum:h,o2:null, who:"สาธิตให้พยาบาลใหม่",
        text:`สาธิตการตั้งเครื่อง: โหมด Skin ค่าตั้ง ${f1(skinT)} °C เปิดความชื้น ${h}% ปิด O₂`}; },
      over:()=>{ const t=pick(range(37.2,38.2,0.1)); return {mode:"air",temp:t,hum:null,o2:null, who:"ทดสอบหลังเปลี่ยนแผงปุ่มกด",
        text:`ทดสอบว่าตั้งค่าเกิน 37 °C ได้ตามปกติ: โหมด Air ค่าตั้ง ${f1(t)} °C ปิดความชื้น ปิด O₂`}; },
      full:()=>{ const h=pick(hums), o=pick(o2s); return {mode:"skin",temp:skinT,hum:h,o2:o, who:"ตรวจรับเครื่องหลังซ่อมระบบ O₂",
        text:`ตั้งให้ทุกระบบทำงานพร้อมกัน: โหมด Skin ค่าตั้ง ${f1(skinT)} °C ความชื้น ${h}% O₂ ${o}%`}; },
      reset:()=>{ const u=D.unitDefault; return {mode:u.mode,temp:u.temp,hum:u.hum,o2:u.o2, who:"ส่งคืนหน่วยงาน",
        text:`ทำความสะอาดและซ่อมเสร็จแล้ว ตั้งกลับเป็นค่าตั้งต้นของหน่วยงานก่อนส่งคืน: โหมด ${u.mode==="air"?"Air":"Skin"} ค่าตั้ง ${f1(u.temp)} °C ปิดความชื้น ปิด O₂`}; },
      skinOnly:()=>{ const t=pick(range(35.5,36.9,0.1)), o=pick(range(30,40,1)); return {mode:"skin",temp:t,hum:null,o2:o, who:"ทดสอบระบบ O₂ หลังสอบเทียบ",
        text:`ทดสอบระบบ servo O₂: โหมด Skin ค่าตั้ง ${f1(t)} °C ปิดความชื้น O₂ ${o}%`}; }
    };
    return O[kind]();
  }
  /* ค่าที่ค้างอยู่บนเครื่อง (สุ่ม) ผู้เรียนต้องตรวจทุกค่าเอง */
  function leftover(){
    const mode=pick(["air","skin"]), lim=P[mode];
    return {mode, temp:pick(range(mode==="air"?30:lim.min, lim.max, 0.1)), over:false,
      hum:Math.random()<.5?pick(range(40,80,5)):null, o2:Math.random()<.4?pick(range(25,40,1)):null, sel:"temp", msg:""};
  }
  let setRound=null;
  function newSetRound(){ setRound={orders:shuffle(D.setKinds).slice(0,5).map(genOrder), i:0, res:[]}; }

  function viewSet(){
    if(!setRound) newSetRound();
    const R=setRound;
    if(R.i>=R.orders.length) return setSummary();
    const O=R.orders[R.i], st=leftover();
    frame(`<div class="simtop"><span class="kicker">ใบสั่งที่ ${R.i+1} / ${R.orders.length} · ${esc(O.who)}</span>
        <div class="simdots">${R.orders.map((x,k)=>`<i class="${R.res[k]===true?"ok":R.res[k]===false?"bad":k===R.i?"on":""}"></i>`).join("")}</div></div>
      <div class="pmgrid">
        <div>
          <div class="order"><div class="tk-h"><span>📋 ใบสั่งงาน</span></div><p>${esc(O.text)}</p></div>
          <div class="incface" id="incface"></div>
          <p class="muted small">วิธีใช้: แตะช่องอุณหภูมิ (AIR SET หรือ SKIN SET), HUM หรือ O₂ เพื่อเลือก แล้วปรับด้วยปุ่ม ▼▲ (ปุ่มคู่ = ปรับทีละมาก) · ON/OFF เปิดปิดความชื้นหรือ O₂ ที่เลือก · MODE สลับ Air/Skin · ตั้งครบแล้วกดส่งงาน</p>
          <p class="muted small">เครื่องอาจมีค่าจากผู้ใช้ก่อนหน้าค้างอยู่ ตรวจให้ครบทุกค่า</p>
        </div>
        <aside class="logbox" id="set-side"><h2>ตรวจทานก่อนส่ง</h2>
          <p class="small muted">เทียบค่าบนจอกับใบสั่งทีละค่า: โหมด → อุณหภูมิ → ความชื้น → O₂</p>
          <div class="hint small">ค่าตั้งเกิน 37.0 °C ต้องกดปุ่ม >37 °C ก่อน</div>
          <div class="tools"><button class="primary" id="set-go">ส่งงาน</button></div></aside>
      </div>`);
    const face=root.querySelector("#incface");
    const lim=()=>P[st.mode], maxT=()=>st.over?lim().over:lim().max;
    function paint(){
      const tile=(id,lbl,val,unit,off)=>`<button class="itile ${st.sel===id?"sel":""} ${off?"off":""}" data-sel="${id}"><span>${lbl}</span><b>${val}</b><small>${unit}</small></button>`;
      face.innerHTML=`<div class="iscr">
          <div class="imode"><span class="${st.mode==="air"?"on":""}">AIR</span><span class="${st.mode==="skin"?"on":""}">SKIN</span>${st.over?`<span class="iov">&gt;37 °C</span>`:""}</div>
          <div class="itiles">${tile("temp",st.mode==="air"?"AIR SET":"SKIN SET",f1(st.temp),"°C")}
            ${tile("hum","HUM SET",st.hum===null?"OFF":st.hum,st.hum===null?"":"%",st.hum===null)}
            ${tile("o2","O₂ SET",st.o2===null?"OFF":st.o2,st.o2===null?"":"%",st.o2===null)}</div>
          <div class="imsg" role="status">${esc(st.msg)}</div></div>
        <div class="ikeys">
          <button data-k="mode">MODE</button><button data-k="over" class="${st.over?"lit":""}">&gt;37 °C</button><button data-k="onoff">ON/OFF</button>
          <button data-k="dd" aria-label="ลดมาก">▼▼</button><button data-k="d" aria-label="ลด">▼</button><button data-k="u" aria-label="เพิ่ม">▲</button><button data-k="uu" aria-label="เพิ่มมาก">▲▲</button>
        </div>`;
      face.querySelectorAll("[data-sel]").forEach(b=>b.onclick=()=>{ st.sel=b.dataset.sel; st.msg=""; paint(); });
      face.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ key(b.dataset.k); paint(); });
    }
    function key(k){
      st.msg="";
      if(k==="mode"){ st.mode=st.mode==="air"?"skin":"air"; st.temp=Math.min(Math.max(st.temp, lim().min), maxT()); return; }
      if(k==="over"){ st.over=!st.over; if(!st.over && st.temp>lim().max){ st.temp=lim().max; st.msg="ยกเลิก >37 °C ค่าตั้งลดเหลือ 37.0 °C"; } else if(st.over) st.msg="ตั้งค่าเกิน 37 °C ได้แล้ว"; return; }
      if(k==="onoff"){
        if(st.sel==="temp"){ st.msg="อุณหภูมิปิดไม่ได้ เลือกช่อง HUM หรือ O₂ ก่อน"; return; }
        if(st[st.sel]===null) st[st.sel]= st.sel==="hum"?50:30; else st[st.sel]=null; return; }
      const big=k==="uu"||k==="dd", dir=(k==="u"||k==="uu")?1:-1;
      if(st.sel==="temp"){
        let v=r1(st.temp+dir*(big?1:0.1));
        if(v>maxT()){ v=maxT(); st.msg=!st.over&&maxT()===lim().max?"ค่าตั้งสูงสุด 37.0 °C ถ้าต้องการสูงกว่านี้ให้กด >37 °C ก่อน":`ค่าตั้งสูงสุด ${f1(maxT())} °C`; }
        if(v<lim().min){ v=lim().min; st.msg=`ค่าตั้งต่ำสุดของโหมดนี้ ${f1(v)} °C`; }
        st.temp=v; return; }
      const L=P[st.sel];
      if(st[st.sel]===null){ st.msg=`${st.sel==="hum"?"ความชื้น":"O₂"} ปิดอยู่ กด ON/OFF เพื่อเปิดก่อน`; return; }
      st[st.sel]=Math.min(L.max, Math.max(L.min, st[st.sel]+dir*(big?(st.sel==="hum"?10:5):L.step)));
    }
    root.querySelector("#set-go").onclick=()=>{
      const okM=st.mode===O.mode, okT=Math.abs(st.temp-O.temp)<0.05, okH=st.hum===O.hum, okO=st.o2===O.o2, all=okM&&okT&&okH&&okO;
      R.res[R.i]=all;
      const show=v=>v===null?"OFF":v+"%";
      const side=root.querySelector("#set-side"), last=R.i===R.orders.length-1;
      face.querySelectorAll("button").forEach(b=>b.disabled=true);
      side.innerHTML=`<h2>${all?"✓ ตั้งค่าถูกต้อง +2":"✗ ยังมีค่าที่ไม่ถูก +0"}</h2>
        <ul class="gl"><li class="${okM?"ok":"bad"}">โหมด ${st.mode==="air"?"Air":"Skin"} ${okM?"✓":"✗ ควรเป็น "+(O.mode==="air"?"Air":"Skin")}</li>
        <li class="${okT?"ok":"bad"}">อุณหภูมิ ${f1(st.temp)} °C ${okT?"✓":"✗ ควรเป็น "+f1(O.temp)+" °C"}</li>
        <li class="${okH?"ok":"bad"}">ความชื้น ${show(st.hum)} ${okH?"✓":"✗ ควรเป็น "+show(O.hum)}</li>
        <li class="${okO?"ok":"bad"}">O₂ ${show(st.o2)} ${okO?"✓":"✗ ควรเป็น "+show(O.o2)}</li></ul>
        ${!okT && O.temp>37 && st.temp<=37?`<div class="msg bad">ค่าตั้งเกิน 37.0 °C ต้องกด >37 °C ก่อน จึงจะปรับขึ้นได้</div>`:""}
        ${(!okH&&O.hum===null)||(!okO&&O.o2===null)?`<div class="msg bad">มีระบบที่ค้างเปิดจากผู้ใช้ก่อนหน้า ต้องปิดให้ตรงกับใบสั่ง</div>`:""}
        <div class="tools">${last?`<button class="primary" id="set-end">ดูผลรวม</button>`:`<button class="primary" id="set-nx">ใบสั่งถัดไป →</button>`}</div>`;
      const nx=side.querySelector("#set-nx"); if(nx) nx.onclick=()=>{R.i++;viewSet();window.scrollTo(0,0);};
      const en=side.querySelector("#set-end"); if(en) en.onclick=()=>{R.i++;viewSet();window.scrollTo(0,0);};
      if(window.innerWidth<900) side.scrollIntoView({behavior:"smooth"});
    };
    paint();
  }
  function setSummary(){
    const R=setRound, ok=R.res.filter(Boolean).length, sc=ok*2, mx=R.orders.length*2;
    const s=R.saved||(R.saved=savePart("set", sc, mx));   // บันทึกครั้งเดียวต่อรอบ
    frame(`<h2>ผลฝึกตั้งค่า</h2><div class="score ${sc>=8?"ok":sc>=6?"mid":"bad"}"><div class="big">${sc}/${mx}</div><div>ตั้งถูก ${ok} จาก ${R.orders.length} ใบสั่ง</div></div>
      ${s.done?`<div class="msg ok">ทำครบทั้งสองส่วนแล้ว ส่งคะแนนโมดูลนี้ ${s.score}/${s.max} (${Math.round(s.score/s.max*100)}%)</div>`:`<p class="muted">ทำมุมช่างต่อให้ครบ ระบบจึงจะรวมคะแนนและส่ง</p>`}
      <ol class="recap">${R.orders.map((o,k)=>`<li><b>${R.res[k]?"✓":"✗"} ${esc(o.who)}</b><span>${esc(o.text)}</span></li>`).join("")}</ol>
      <div class="tools"><button id="set-again">ฝึกอีกชุด</button>${s.done?"":`<button class="primary" id="go-tech">ไปมุมช่าง ▶</button>`}</div>`);
    root.querySelector("#set-again").onclick=()=>{ newSetRound(); viewSet(); };
    const g=root.querySelector("#go-tech"); if(g) g.onclick=()=>{ tab="tech"; techRound=null; render(); };
    window.scrollTo(0,0);
  }

  /* ---------- ตรวจก่อนใช้งาน (ไม่เก็บคะแนน) ---------- */
  function viewCheck(){
    const items=D.checklist, bad=new Set(shuffle(items.map((x,k)=>k)).slice(0,D.checkBad)), ans={}; let checked=false;
    function draw(){
      const done=Object.keys(ans).length===items.length;
      frame(`<h2>ตรวจเครื่องก่อนใช้งาน</h2>
        <p class="muted">รายการที่พยาบาลตรวจก่อนรับทารก ช่างใช้รายการเดียวกันนี้ตรวจตอนรับแจ้งซ่อมและก่อนส่งคืน อ่านผลที่พบแล้วตัดสินว่าผ่านหรือไม่ผ่าน (ไม่เก็บคะแนน)</p>
        <div class="chk">${items.map((x,k)=>{ const isBad=bad.has(k), a=ans[k];
          const res=checked?((a==="bad")===isBad?"good":"bad"):"";
          return `<div class="chkrow ${res}"><div><b>${k+1}. ${esc(x.n)}</b><p>${esc(isBad?x.bad:x.ok)}</p>
            ${checked&&isBad?`<p class="act">→ ${esc(x.act)}</p>`:""}${checked&&res==="bad"&&!isBad?`<p class="act">รายการนี้ปกติ ใช้งานได้</p>`:""}</div>
            <div class="seg"><button data-k="${k}" data-a="ok" class="${a==="ok"?"on":""}" ${checked?"disabled":""}>ผ่าน</button><button data-k="${k}" data-a="bad" class="${a==="bad"?"on":""}" ${checked?"disabled":""}>ไม่ผ่าน</button></div></div>`; }).join("")}</div>
        ${checked?(()=>{ const right=items.filter((x,k)=>(ans[k]==="bad")===bad.has(k)).length;
            return `<div class="score ${right===items.length?"ok":right>=8?"mid":"bad"}"><div class="big">${right}/${items.length}</div><div>ตัดสินถูก · เครื่องนี้${bad.size?"ยังไม่พร้อมใช้":"พร้อมใช้"}</div></div>`; })():""}
        <div class="tools">${checked?`<button class="primary" id="ck-new">สุ่มเครื่องใหม่</button>`:`<button class="primary" id="ck-go" ${done?"":"disabled"}>ตรวจคำตอบ</button><span class="muted small">ตัดสินแล้ว ${Object.keys(ans).length}/${items.length}</span>`}</div>`);
      root.querySelectorAll(".chk [data-k]").forEach(b=>b.onclick=()=>{ ans[b.dataset.k]=b.dataset.a; const y=window.scrollY; draw(); window.scrollTo(0,y); });
      const g=root.querySelector("#ck-go"); if(g) g.onclick=()=>{ checked=true; draw(); };
      const n=root.querySelector("#ck-new"); if(n) n.onclick=()=>{ viewCheck(); window.scrollTo(0,0); };
    }
    draw();
  }

  /* ---------- มุมช่าง ---------- */
  let techRound=null;
  function viewTech(){
    if(!techRound) techRound={qs:shuffle(D.cases).slice(0,D.techPerRound).map(c=>({...c, ord:shuffle(c.act.map((t,k)=>k))})), i:0, step:1, sc:0, pts:[]};
    const T=techRound;
    if(T.i>=T.qs.length) return techSummary();
    const q=T.qs[T.i];
    frame(`<h2>มุมช่าง: ใช้งานผิดหรือเครื่องเสีย</h2><p class="muted">อ่านใบแจ้งซ่อม ตัดสินสาเหตุ (1 คะแนน) แล้วเลือกสิ่งที่ควรทำต่อ (1 คะแนน)</p>
      <div class="simtop"><span class="kicker">โจทย์ ${T.i+1} / ${T.qs.length}</span><div class="simdots">${T.qs.map((x,k)=>`<i class="${k<T.i?(T.pts[k]===2?"ok":"bad"):k===T.i?"on":""}"></i>`).join("")}</div></div>
      <div class="ticket"><div class="tk-h"><span>ใบแจ้งซ่อม</span></div><p>${esc(q.q)}</p></div>
      <h3>1) สาเหตุน่าจะเป็นแบบไหน</h3>
      <div class="lopts" id="tc-a">${Object.entries(D.causes).map(([k,n])=>`<button class="lopt" data-c="${k}">${esc(n)}</button>`).join("")}</div>
      <div id="tc-2"></div>`);
    let p=0;
    root.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{
      const good=b.dataset.c===q.a; if(good) p++;
      root.querySelectorAll("[data-c]").forEach(x=>{ x.disabled=true; if(x.dataset.c===q.a) x.classList.add("good"); else if(x===b) x.classList.add("bad"); });
      const box=root.querySelector("#tc-2");
      box.innerHTML=`<p class="small ${good?"":"bad-t"}">${good?"✓ ถูกต้อง":"✗ คำตอบคือ: "+esc(D.causes[q.a])}</p>
        <h3>2) ควรทำอะไรต่อ</h3><div class="lopts">${q.ord.map(k=>`<button class="lopt" data-x="${k}">${esc(q.act[k])}</button>`).join("")}</div><div id="tc-f"></div>`;
      box.querySelectorAll("[data-x]").forEach(y=>y.onclick=()=>{
        const g2=y.dataset.x==="0"; if(g2) p++;
        box.querySelectorAll("[data-x]").forEach(z=>{ z.disabled=true; if(z.dataset.x==="0") z.classList.add("good"); else if(z===y) z.classList.add("bad"); });
        T.sc+=p; T.pts[T.i]=p;
        box.querySelector("#tc-f").innerHTML=`<div class="fb ${p===2?"good":"bad"}"><b>ได้ ${p}/2 คะแนน</b><p>${esc(q.e)}</p><button class="primary" id="tc-n">${T.i+1<T.qs.length?"โจทย์ถัดไป →":"ดูผล"}</button></div>`;
        box.querySelector("#tc-n").onclick=()=>{ T.i++; viewTech(); window.scrollTo(0,0); };
      });
      if(window.innerWidth<900) box.scrollIntoView({behavior:"smooth",block:"start"});
    });
  }
  function techSummary(){
    const T=techRound, mx=T.qs.length*2, s=T.saved||(T.saved=savePart("tech", T.sc, mx));   // บันทึกครั้งเดียวต่อรอบ
    frame(`<h2>ผลมุมช่าง</h2><div class="score ${T.sc>=13?"ok":T.sc>=10?"mid":"bad"}"><div class="big">${T.sc}/${mx}</div><div>คะแนน</div></div>
      ${s.done?`<div class="msg ok">ทำครบทั้งสองส่วนแล้ว ส่งคะแนนโมดูลนี้ ${s.score}/${s.max} (${Math.round(s.score/s.max*100)}%)</div>`:`<p class="muted">ทำฝึกตั้งค่าต่อให้ครบ ระบบจึงจะรวมคะแนนและส่ง</p>`}
      <ol class="recap">${T.qs.map((q,k)=>`<li><b>${T.pts[k]}/2 · ${esc(D.causes[q.a].split(" (")[0])}</b><span>${esc(q.q)}</span></li>`).join("")}</ol>
      <div class="tools"><button id="tc-again">ทำอีกชุด</button>${s.done?"":`<button class="primary" id="go-set">ไปฝึกตั้งค่า ▶</button>`}</div>`);
    root.querySelector("#tc-again").onclick=()=>{ techRound=null; viewTech(); };
    const g=root.querySelector("#go-set"); if(g) g.onclick=()=>{ tab="set"; setRound=null; render(); };
    window.scrollTo(0,0);
  }

  function render(){ ({learn:viewLearn, set:viewSet, check:viewCheck, tech:viewTech})[tab](); }
  window.Views=window.Views||{}; window.Views.tech={show:()=>{ if(!root.innerHTML) render(); }};
})();
