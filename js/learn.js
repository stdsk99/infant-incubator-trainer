/* ===== โหมดเรียนรู้: ฉากแอนิเมชันทีละขั้น ===== */
(function(){
  const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const STAGES = ["อาการ","ตรวจ","วินิจฉัย","ซ่อม","ทดสอบ","สรุป"];
  let muted = false;
  try{ muted = localStorage.getItem("iit-mute")==="1"; }catch(e){}

  /* ---------- ภาพตู้อบ (ใช้ร่วมกับโหมดสอบ) ---------- */
  function pumpSVG(){
    return `<svg class="lp ib" viewBox="0 0 360 252" role="img" aria-label="ภาพตู้อบทารกจำลอง แสดงสถานะการทำงาน">
      <g class="lp-part" data-p="hood"><rect class="lp-hit" x="8" y="18" width="250" height="132" rx="10"/>
        <path class="ib-hood" d="M14 150 V58 Q14 24 48 24 H218 Q252 24 252 58 V150"/>
        <circle class="ib-port" cx="60" cy="86" r="15"/><circle class="ib-port" cx="206" cy="86" r="15"/></g>
      <g class="ib-airg">
        <path class="ib-air" d="M26 150 V58 Q26 46 40 44"/><path class="ib-air" d="M240 150 V58 Q240 46 226 44"/>
        <path class="ib-air ret" d="M133 52 V124"/></g>
      <rect class="ib-mat" x="32" y="136" width="200" height="10" rx="4"/>
      <g class="ib-baby"><ellipse cx="118" cy="128" rx="30" ry="8"/><circle cx="155" cy="125" r="9"/></g>
      <g class="lp-part" data-p="skin"><rect class="lp-hit" x="112" y="106" width="140" height="28" rx="6"/>
        <path class="ib-probe" d="M124 122 C144 110 190 110 238 126"/><circle class="ib-tip" cx="124" cy="122" r="3.2"/>
        <rect x="236" y="120" width="11" height="13" rx="2" class="ib-jack"/></g>
      <rect class="ib-deck" x="12" y="150" width="246" height="70" rx="6"/>
      <path class="ib-air low" d="M38 170 H226"/>
      <g class="lp-part" data-p="airprobe"><rect class="lp-hit" x="92" y="151" width="62" height="17" rx="4"/>
        <rect x="100" y="154" width="46" height="11" rx="3" class="ib-sens"/><circle cx="112" cy="159.5" r="2.4" class="ib-th"/><circle cx="134" cy="159.5" r="2.4" class="ib-th"/></g>
      <g class="lp-part" data-p="filter"><rect class="lp-hit" x="2" y="190" width="30" height="30" rx="4"/>
        <rect x="14" y="194" width="9" height="22" rx="2" class="ib-filter"/><path class="ib-air in" d="M0 205 H14"/></g>
      <g class="lp-part" data-p="fan"><rect class="lp-hit" x="30" y="170" width="46" height="46" rx="6"/>
        <circle cx="53" cy="193" r="18" class="ib-fanring"/>
        <g class="ib-fan" style="transform-origin:53px 193px"><path d="M53 193 L53 177 Q62 183 53 193 Z M53 193 L69 193 Q63 202 53 193 Z M53 193 L53 209 Q44 203 53 193 Z M53 193 L37 193 Q43 184 53 193 Z"/></g>
        <circle cx="53" cy="193" r="2.6" class="ib-hub"/></g>
      <g class="lp-part" data-p="heater"><rect class="lp-hit" x="84" y="174" width="82" height="40" rx="6"/>
        <rect x="90" y="202" width="70" height="7" rx="2" class="ib-finsr"/>
        <path class="ib-coil" d="M90 194 l5.8 -10 l5.8 10 l5.8 -10 l5.8 10 l5.8 -10 l5.8 10 l5.8 -10 l5.8 10 l5.8 -10 l5.8 10 l5.8 -10 l5.8 10"/></g>
      <g class="lp-part" data-p="humid"><rect class="lp-hit" x="172" y="172" width="64" height="46" rx="6"/>
        <rect x="178" y="176" width="52" height="38" rx="4" class="ib-tank"/><rect x="180" y="196" width="48" height="16" rx="2" class="ib-water"/>
        <path class="ib-steam" d="M192 192 q-4 -6 0 -12 M208 192 q-4 -6 0 -12"/></g>
      <g class="lp-part" data-p="o2"><rect class="lp-hit" x="40" y="222" width="216" height="30" rx="5"/>
        <path class="ib-o2pipe" d="M44 238 H104 M146 238 H186 M218 238 H246 V220"/><path class="ib-o2flow" d="M44 238 H104 M146 238 H186 M218 238 H246 V220"/>
        <rect x="104" y="229" width="42" height="18" rx="3" class="ib-valve"/>
        <rect x="186" y="227" width="32" height="22" rx="3" class="ib-cellbox"/><rect x="190" y="230" width="10" height="16" rx="2" class="ib-cell"/><rect x="204" y="230" width="10" height="16" rx="2" class="ib-cell"/></g>
      <rect x="262" y="18" width="92" height="232" rx="10" class="lp-body"/>
      <rect x="268" y="26" width="80" height="44" rx="5" class="lp-scr"/>
      <text class="lp-scrt" x="274" y="44">AIR 36.0</text><text class="lp-scrt sm" x="274" y="61">SET 36.0 °C</text>
      <circle class="lp-led" cx="340" cy="80" r="4.5"/>
      <g class="lp-snd"><path d="M318 76 q4 4 0 8"/><path d="M324 73 q7 7 0 14"/></g>
      <circle class="lp-ac" cx="274" cy="80" r="3"/><text class="lp-t" x="280" y="83">AC</text>
      <g class="lp-part" data-p="board"><rect class="lp-hit" x="266" y="92" width="84" height="56" rx="6"/>
        <rect x="272" y="98" width="72" height="44" rx="4" class="ib-board"/><rect x="292" y="106" width="30" height="16" rx="2" class="ib-chip"/>
        <text class="lp-t" x="308" y="137" text-anchor="middle">บอร์ด / รีเลย์</text></g>
      <g class="lp-part" data-p="psu"><rect class="lp-hit" x="266" y="152" width="84" height="44" rx="6"/>
        <rect x="272" y="158" width="72" height="32" rx="4" class="ib-psu"/><text class="lp-t" x="308" y="178" text-anchor="middle">ภาคจ่ายไฟ</text></g>
      <g class="lp-part" data-p="batt"><rect class="lp-hit" x="266" y="200" width="84" height="44" rx="6"/>
        <g class="lp-batt"><rect x="288" y="212" width="34" height="16" rx="2" class="lp-st"/><rect x="322" y="216" width="3" height="8" class="lp-bt"/><rect class="lp-bl" x="290" y="214" width="30" height="12" rx="1"/></g>
        <text class="lp-t" x="308" y="240" text-anchor="middle">แบตสำรอง</text></g>
      <g class="ib-hot"><rect x="16" y="28" width="234" height="120" rx="30"/></g>
    </svg>`;
  }

  /* ภาพขยายชิ้นส่วน: ชื่อ "ชนิด_สถานะ" */
  const ZT = {probe:"ภาพขยายสายวัดอุณหภูมิผิว", scale:"ภาพขยายฮีตเตอร์ในห้องต้มน้ำ", fan:"ภาพขยายใบพัดและแกน", coil:"ภาพขยายขดลวดฮีตเตอร์", cell:"ภาพขยายเซนเซอร์ O₂ (fuel cell)", fuse:"ภาพขยาย fuse", sens:"ภาพขยายกล่องเซนเซอร์ air probe"};
  function zoomSVG(kind){
    const tool=`<g class="zm-tool"><circle cx="160" cy="16" r="12"/><path d="M154 16 h12 M160 10 v12"/></g>`;
    const k=kind.split("_")[0];
    let b="";
    if(k==="probe") b=`<rect x="4" y="30" width="132" height="30" rx="15" class="zm-cab"/>
      <path class="zm-cond ok" d="M10 39 H132 M10 51 H132"/><path class="zm-cond br" d="M10 39 H60 M70 39 H132 M10 51 H63 M73 51 H132"/>
      <path class="zm-crease" d="M60 24 l6 9 l-6 9 l6 9 l-6 9 l6 9"/><circle cx="154" cy="45" r="16" class="zm-tipb"/>
      <text x="64" y="84" text-anchor="middle" class="zm-t">รอยพับ</text><text x="154" y="84" text-anchor="middle" class="zm-t">เทอร์มิสเตอร์</text>${tool}`;
    if(k==="scale") b=`<rect x="10" y="20" width="160" height="70" rx="6" class="zm-ch"/><rect x="12" y="52" width="156" height="36" rx="4" class="zm-wat"/>
      <rect x="40" y="34" width="100" height="40" rx="10" class="zm-rod"/>
      <g class="zm-res"><circle cx="52" cy="40" r="6"/><circle cx="66" cy="36" r="5"/><circle cx="84" cy="40" r="7"/><circle cx="104" cy="35" r="5"/><circle cx="122" cy="40" r="6"/><circle cx="58" cy="70" r="6"/><circle cx="80" cy="72" r="5"/><circle cx="100" cy="70" r="7"/><circle cx="126" cy="70" r="6"/><circle cx="44" cy="56" r="5"/><circle cx="136" cy="56" r="5"/></g>
      <text x="90" y="100" text-anchor="middle" class="zm-t">ฮีตเตอร์ในห้องต้ม</text>`;
    if(k==="fan"){ let bl=""; for(let i=0;i<8;i++){const a=i*Math.PI/4; bl+=`<path d="M90 52 L${(90+30*Math.cos(a)).toFixed(1)} ${(52+30*Math.sin(a)).toFixed(1)} L${(90+30*Math.cos(a+0.35)).toFixed(1)} ${(52+30*Math.sin(a+0.35)).toFixed(1)} Z"/>`;}
      b=`<circle cx="90" cy="52" r="36" class="zm-disc"/><g class="zm-blade">${bl}</g><circle cx="90" cy="52" r="8" class="zm-hub"/>
      <g class="zm-res"><path d="M78 48 q12 -10 24 0 q-12 12 -24 0"/><path d="M80 58 q10 8 22 -2"/><path d="M74 52 q16 -18 32 2"/><path d="M84 44 q14 4 10 18"/></g>
      <text x="172" y="98" text-anchor="end" class="zm-t">แกนใบพัด</text>`; }
    if(k==="coil") b=`<rect x="10" y="62" width="160" height="16" rx="3" class="zm-fin"/>
      <path class="zm-wire ok" d="M14 48 l12 -18 l12 18 l12 -18 l12 18 l12 -18 l12 18 l12 -18 l12 18 l12 -18 l12 18 l12 -18 l12 18"/>
      <path class="zm-wire br" d="M14 48 l12 -18 l12 18 l12 -18 l12 18 l12 -18 l4 6 M96 36 l8 12 l12 -18 l12 18 l12 -18 l12 18 l12 -18 l12 18"/>
      <circle class="zm-burn" cx="92" cy="40" r="8"/><text x="90" y="96" text-anchor="middle" class="zm-t">ขดลวดฮีตเตอร์บน heat sink</text>${tool}`;
    if(k==="cell") b=`<rect x="34" y="16" width="44" height="60" rx="8" class="zm-cellb"/><rect x="102" y="16" width="44" height="60" rx="8" class="zm-cellb"/>
      <text x="56" y="40" text-anchor="middle" class="zm-t">S1</text><text x="124" y="40" text-anchor="middle" class="zm-t">S2</text>
      <text x="56" y="60" text-anchor="middle" class="zm-t zm-old zm-bad">18 mV</text><text x="124" y="60" text-anchor="middle" class="zm-t zm-old zm-bad">31 mV</text>
      <text x="56" y="60" text-anchor="middle" class="zm-t zm-new">41 mV</text><text x="124" y="60" text-anchor="middle" class="zm-t zm-new">40 mV</text>
      <text x="90" y="94" text-anchor="middle" class="zm-t zm-old">ติดตั้งเมื่อ 2 ปีก่อน · อ้างอิง ≈ 40 mV ที่ 21%</text><text x="90" y="94" text-anchor="middle" class="zm-t zm-new">เซนเซอร์ใหม่ทั้งคู่ · สอบเทียบผ่าน</text>${tool}`;
    if(k==="fuse") b=`<rect x="30" y="36" width="120" height="32" rx="14" class="zm-glass"/><rect x="18" y="34" width="22" height="36" rx="3" class="zm-cap"/><rect x="140" y="34" width="22" height="36" rx="3" class="zm-cap"/>
      <path class="zm-wire ok" d="M40 52 H140"/><path class="zm-wire br" d="M40 52 H84 M98 52 H140"/><circle class="zm-burn" cx="91" cy="52" r="14"/>
      <text x="90" y="90" text-anchor="middle" class="zm-t">fuse ขนาดเดิม</text>${tool}`;
    if(k==="sens") b=`<rect x="20" y="24" width="140" height="48" rx="8" class="zm-ch"/>
      <circle cx="62" cy="48" r="10" class="zm-th"/><circle cx="118" cy="48" r="10" class="zm-th zm-thbad"/>
      <text x="62" y="88" text-anchor="middle" class="zm-t">A 36.0 °C</text><text x="118" y="88" text-anchor="middle" class="zm-t zm-bad">B 37.3 °C</text>${tool}`;
    return `<svg class="zm zm-${k} ${kind}" viewBox="0 0 180 104" role="img" aria-label="${ZT[k]}">${b}</svg>`;
  }

  /* ---------- ใช้สถานะกับภาพ ---------- */
  function applyVis(box, v){
    v = v||{};
    const svg = box.querySelector("svg.lp"); if(!svg) return;
    clearTimeout(box._t1);
    const t1 = svg.querySelector(".lp-scrt"), t2 = svg.querySelector(".lp-scrt.sm");
    svg.classList.toggle("run", !!v.run);
    svg.classList.toggle("alarm", !!v.alarm && !v.alarmDelay);
    svg.classList.toggle("off", v.screen==="off");
    svg.classList.toggle("noheat", v.heat===false);
    svg.classList.toggle("slow", !!v.slow);
    svg.classList.toggle("hot", !!v.hot);
    svg.classList.toggle("steam", !!v.steam);
    svg.classList.toggle("o2on", !!v.o2);
    svg.classList.toggle("probeoff", !!v.probeoff);
    svg.classList.toggle("noac", v.ac===false || v.screen==="off");
    const lvl = v.batt===undefined ? 100 : v.batt, bl=svg.querySelector(".lp-bl");
    bl.setAttribute("width", Math.max(0,30*lvl/100)); bl.classList.toggle("low", lvl<25);
    const fit = (t,w)=>{ t.removeAttribute("textLength"); t.removeAttribute("lengthAdjust");
      try{ if(t.textContent && t.getComputedTextLength()>w){ t.setAttribute("textLength",w); t.setAttribute("lengthAdjust","spacingAndGlyphs"); } }catch(e){} };
    const show = (a,b)=>{ t1.textContent=a; t2.textContent=b; fit(t1,68); fit(t2,68); };
    if(v.screen==="off") show("","");
    else if(v.alarm && !v.alarmDelay) show("⚠ "+v.alarm, v.sub||"");
    else show(v.screen||"AIR 36.0", v.sub!==undefined?v.sub:(v.screen?"":"SET 36.0 °C"));
    svg.querySelectorAll(".lp-part").forEach(p=>p.classList.toggle("hl", p.dataset.p===v.hi));
    box.classList.remove("working");
    if(v.alarm && v.alarmDelay){
      svg.classList.add("run");
      box._t1 = setTimeout(()=>{ if(!v.keepRun) svg.classList.remove("run"); if(v.cutHeat) svg.classList.add("noheat"); svg.classList.add("alarm"); show("⚠ "+v.alarm, v.sub||""); beep(); }, v.alarmDelay);
    }
    const ins = box.querySelector(".ins"); if(!ins) return;
    let h="";
    if(v.gauge){ const g=v.gauge, mx=g.max||100, mn=g.min||0;
      h+=`<div class="inst"><div class="inst-n">${esc(g.n)}</div>
      <div class="gauge"><div class="g-fill"></div>${g.th!==undefined?`<div class="g-th" style="left:${Math.min(100,(g.th-mn)/(mx-mn)*100)}%"><span>${esc(g.thl||"เกณฑ์ "+g.th+(g.unit||""))}</span></div>`:""}</div>
      <div class="g-v">0${esc(g.unit||"")}</div></div>`; }
    if(v.meter) h+=`<div class="inst"><div class="inst-n">${esc(v.meter.n)}</div><div class="meter big">${esc(v.meter.v)}</div></div>`;
    if(v.zoom) h+=`<div class="inst"><div class="inst-n">${ZT[v.zoom.split("_")[0]]}</div>${zoomSVG(v.zoom)}</div>`;
    ins.innerHTML=h;
    if(v.gauge) animGauge(ins, v.gauge);
  }
  function animGauge(ins,g){
    const f=ins.querySelector(".g-fill"), t=ins.querySelector(".g-v"), mx=g.max||100, mn=g.min||0, u=g.unit||"", dp=g.dp||0;
    const bad = g.bad==="below" ? (x=>x<g.th) : g.bad==="above" ? (x=>x>g.th) : (()=>false);
    const pct = x=>Math.min(100,Math.max(0,(x-mn)/(mx-mn)*100))+"%";
    const fmt = x=>(+x).toFixed(dp);
    const from = g.still ? g.v : (g.from!==undefined?g.from:mn);
    f.style.transition="none"; f.style.width=pct(from);
    f.classList.toggle("bad",bad(from)); t.textContent=fmt(from)+u;
    if(g.still){ f.classList.toggle("bad",bad(g.v)); return; }
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      f.style.transition="width 1.6s cubic-bezier(.3,.7,.3,1), background .3s"; f.style.width=pct(g.v);
      const t0=performance.now();
      (function tick(now){ const k=Math.min(1,(now-t0)/1600), e=1-Math.pow(1-k,3), x=from+(g.v-from)*e;
        t.textContent=fmt(x)+u; f.classList.toggle("bad",bad(x)); if(k<1) requestAnimationFrame(tick); })(t0);
    }));
  }

  /* แอนิเมชันพิเศษ แล้วเรียก done เมื่อจบ */
  function runAnim(box, name, done){
    if(name==="wipe"){
      const zm=box.querySelector(".zm"); if(zm){ zm.classList.add("wiping"); }
      box._t1=setTimeout(()=>{ if(zm){zm.classList.add("clean");} setTimeout(done,500); }, 1600);
    }else if(name==="flex"){
      const zm=box.querySelector(".zm"); if(zm) zm.classList.add("flexing");
      box._t1=setTimeout(done, 1800);
    }else if(name==="work"){
      box.classList.add("working");
      box._t1=setTimeout(()=>{ box.classList.remove("working"); done(); }, 1800);
    }else if(name==="rerun"){
      box._t1=setTimeout(done, 2400);
    }else done();
  }

  let actx=null;
  function beep(){
    if(muted) return;
    try{
      actx = actx || new (window.AudioContext||window.webkitAudioContext)();
      [0,0.28,0.56].forEach(d=>{
        const o=actx.createOscillator(), g=actx.createGain();
        o.type="square"; o.frequency.value=880; g.gain.value=0.04;
        o.connect(g); g.connect(actx.destination);
        o.start(actx.currentTime+d); o.stop(actx.currentTime+d+0.16);
      });
    }catch(e){}
  }

  /* ---------- ภาพอาการสำหรับโหมดสอบ (ไม่เน้นชิ้นส่วน เพื่อไม่บอกใบ้) ---------- */
  function mini(el, c){
    el.innerHTML = `<div class="lpbox mini">${pumpSVG()}</div>`;
    const a=c.alarm||"";
    let v = a.includes("จอดับ") ? {screen:"off", ac:false} : a.startsWith("ไม่มี") ? {run:true} : {alarm:a, run:true};
    if(/FAN/.test(a)) Object.assign(v,{slow:true, heat:false});
    if(/HEATER/.test(a)) Object.assign(v,{heat:false, sub:"AIR 26.1 °C"});
    if(/HUMID/.test(a)) Object.assign(v,{sub:"RH 41% / 70%"});
    if(/O2/.test(a)) Object.assign(v,{sub:"O₂ 30%"});
    applyVis(el.querySelector(".lpbox"), v);
  }

  /* ---------- ตัวเล่นฉาก ---------- */
  function start(id, root, hooks){
    const L = window.LEARN.find(x=>x.id===id); if(!L) return;
    const st = {k:0, tries:0, firstOk:0, picked:null, answered:false, log:[]};
    const qs = L.scenes.filter(s=>s.opts).length;

    function stageBar(stage){
      const si=STAGES.indexOf(stage);
      return `<ol class="stepper">${STAGES.map((s,i)=>`<li class="${i<si?"ok":i===si?"on":""}"><span>${i+1}</span>${s}</li>`).join("")}</ol>`;
    }

    function render(){
      const sc = L.scenes[st.k];
      if(!sc){ return summary(); }
      root.innerHTML = `
        <div class="simhead"><button class="ghost" id="ln-back">← รายการเคส</button>
          <div class="meta"><button class="ghost" id="ln-mute" aria-label="เปิด/ปิดเสียง">${muted?"🔇 ปิดเสียง":"🔊 เปิดเสียง"}</button></div></div>
        <h1>${esc(L.n)} <span class="tag">โหมดเรียนรู้</span></h1>
        ${stageBar(sc.stage)}
        <div class="lgrid">
          <div class="lpbox" id="lpbox">${pumpSVG()}<div class="wrk">🔧 กำลังดำเนินการ…</div><div class="ins"></div></div>
          <div class="lstory">
            <div class="kicker">ขั้นที่ ${st.k+1} / ${L.scenes.length} · ${esc(sc.stage)}</div>
            <h2>${esc(sc.title)}</h2>
            <p>${esc(sc.text)}</p>
            ${sc.opts?`<div class="lopts">${sc.opts.map((o,i)=>`<button class="lopt" data-i="${i}">${esc(o.t)}</button>`).join("")}</div>
              <div id="fb"></div>`
            :`<div class="tools"><button class="primary" id="ln-next">${esc(sc.next||"ต่อไป")} →</button></div>`}
          </div>
        </div>`;
      const box=root.querySelector("#lpbox");
      applyVis(box, sc.vis);
      if(sc.vis && sc.vis.alarm && !sc.vis.alarmDelay) beep();
      root.querySelector("#ln-back").onclick=()=>{clearTimeout(box._t1);hooks.onBack();};
      root.querySelector("#ln-mute").onclick=e=>{muted=!muted;try{localStorage.setItem("iit-mute",muted?"1":"0")}catch(_){}
        e.currentTarget.textContent=muted?"🔇 ปิดเสียง":"🔊 เปิดเสียง";};
      const nx=root.querySelector("#ln-next"); if(nx) nx.onclick=()=>{st.k++;st.answered=false;st.tries=0;render();window.scrollTo(0,0);};
      root.querySelectorAll(".lopt").forEach(b=>b.onclick=()=>pick(+b.dataset.i));
    }

    function pick(i){
      const sc=L.scenes[st.k], o=sc.opts[i], box=root.querySelector("#lpbox");
      if(st.answered) return;
      const btns=[...root.querySelectorAll(".lopt")];
      btns.forEach(b=>b.disabled=true);
      btns[i].classList.add("picked");
      const fb=root.querySelector("#fb");
      fb.innerHTML=`<div class="fb wait">กำลังดำเนินการ… ดูภาพเครื่อง</div>`;
      const mob = window.innerWidth<900;
      if(mob) box.scrollIntoView({behavior:"smooth",block:"start"});
      if(o.vis) applyVis(box, o.vis); else applyVis(box, sc.vis);
      if(o.vis && o.vis.alarm) beep();
      runAnim(box, o.anim, ()=>{
        if(o.after){ applyVis(box, o.after); if(o.after.alarm) beep(); }
        const good = o.ok===true, mid=o.ok==="costly";
        if(good||mid){ st.answered=true; if(st.tries===0&&good) st.firstOk++; st.log.push({t:sc.title, a:(sc.opts.find(x=>x.ok===true)||o).t}); }
        else st.tries++;
        btns[i].classList.add(good?"good":mid?"mid":"bad");
        const last = st.k===L.scenes.length-1;
        fb.innerHTML=`<div class="fb ${good?"good":mid?"mid":"bad"}">
          <b>${good?"✓ ถูกต้อง":mid?"△ ได้ผล แต่ยังไม่ใช่วิธีที่ดีที่สุด":"✗ ยังไม่ใช่"}</b><p>${esc(o.fb)}</p>
          ${good||mid?`<button class="primary" id="ln-go">${last?"ดูสรุป":"ขั้นต่อไป"} →</button>`:`<button id="ln-retry">ลองตัวเลือกอื่น</button>`}</div>`;
        const go=root.querySelector("#ln-go"); if(go) go.onclick=()=>{st.k++;st.answered=false;st.tries=0;render();window.scrollTo(0,0);};
        const rt=root.querySelector("#ln-retry"); if(rt) rt.onclick=()=>{
          applyVis(box, sc.vis); fb.innerHTML="";
          btns.forEach((b,j)=>{ if(!b.classList.contains("bad")) b.disabled=false; b.classList.remove("picked"); });
        };
        if(mob) setTimeout(()=>fb.scrollIntoView({behavior:"smooth",block:"center"}), o.anim||o.vis?900:0);
      });
    }

    function summary(){
      const C = window.SIM.CASES.find(c=>c.id===id);
      window.Score&&Score.record({key:"learn:"+id, mod:"3-จำลองซ่อม (เรียนรู้)", item:L.n, score:st.firstOk, max:qs, detail:"ตอบถูกในครั้งแรก"});
      root.innerHTML = `
        <div class="simhead"><button class="ghost" id="ln-back">← รายการเคส</button></div>
        <h1>${esc(L.n)} <span class="tag">โหมดเรียนรู้</span></h1>
        ${stageBar("สรุป")}
        <div class="score ${st.firstOk===qs?"ok":st.firstOk>=qs-2?"mid":"bad"}"><div class="big">${st.firstOk}/${qs}</div><div>ข้อที่ตอบถูกในครั้งแรก</div></div>
        <h2>ลำดับการทำงานที่ถูกต้อง</h2>
        <ol class="recap">${st.log.map(l=>`<li><b>${esc(l.t)}</b><span>${esc(l.a)}</span></li>`).join("")}</ol>
        ${C?`<h2>ข้อคิด</h2><div class="learn"><p>${esc(C.learn)}</p></div>`:""}
        <div class="tools"><button id="ln-again">เรียนเคสนี้ใหม่</button>${C?`<button class="primary" id="ln-exam">ลองทำเคสนี้ในโหมดสอบ →</button>`:""}<button class="ghost" id="ln-list">รายการเคส</button></div>`;
      root.querySelector("#ln-back").onclick=hooks.onBack;
      root.querySelector("#ln-list").onclick=hooks.onBack;
      root.querySelector("#ln-again").onclick=()=>start(id,root,hooks);
      const ex=root.querySelector("#ln-exam"); if(ex) ex.onclick=()=>hooks.onExam(id);
      window.scrollTo(0,0);
    }
    render(); window.scrollTo(0,0);
  }

  window.Learn = {start, mini, has:id=>window.LEARN.some(x=>x.id===id)};
})();
