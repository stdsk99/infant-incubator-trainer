/* ===== วิชาคลินิก: การใช้ตู้อบทารกอย่างปลอดภัย =====
   หน้าแรก · บทเรียน (บันทึก read:<id> เมื่ออ่านจบ) · เครื่องจำลอง (csim) · แบบทดสอบ (../js/quiz.js) · ผลของฉัน (../js/score.js)
   เกณฑ์ผ่าน: อ่านครบ 9 บท + เครื่องจำลอง ≥ 80% + แบบทดสอบ ≥ 80% */
(function(){
  const C=window.APP_CONFIG||{}, CR=C.criteria||{}, L=window.LESSONS, S=window.CSIM;
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const has=k=>!!(window.Score&&Score.has(k));
  const bestPct=k=>{ const b=window.Score&&Score.bestOf(k); return b?Math.round(b.v*100):0; };
  const readCount=()=>L.filter(x=>has("read:"+x.id)).length;

  /* ---------- เกณฑ์สำหรับใบรับรองในแอป (../js/cert.js เรียกใช้) ---------- */
  window.CertProgress=function(hist){
    const read=new Set(), mq=new Set(); let sim=0, quiz=0;
    hist.forEach(h=>{ const k=h.key||"", p=h.max?Math.round(h.score/h.max*100):0;
      if(k.startsWith("read:")) read.add(k); if(k==="csim") sim=Math.max(sim,p); if(k==="quiz") quiz=Math.max(quiz,p); if(k.startsWith("mq:") && p>=80) mq.add(k); });
    const items=[
      {n:`อ่านบทเรียนครบ ${CR.readLessons} บท`, v:`${read.size}/${CR.readLessons}`, ok:read.size>=CR.readLessons},
      {n:`เครื่องจำลอง ≥ ${CR.simPct}%`, v:`ดีที่สุด ${sim}%`, ok:sim>=CR.simPct},
      {n:`แบบทดสอบ ≥ ${CR.quizPct}%`, v:`ดีที่สุด ${quiz}%`, ok:quiz>=CR.quizPct}];
    if(CR.modTests) items.push({n:`ผ่านสอบท้ายบทครบ ${CR.modTests} บท`, v:`${mq.size}/${CR.modTests}`, ok:mq.size>=CR.modTests});
    return {items, pass:items.every(i=>i.ok), line:`บทเรียน ${read.size} บท  ·  เครื่องจำลอง ${sim}%  ·  แบบทดสอบ ${quiz}%`};
  };

  /* ---------- หน้าแรก ---------- */
  function home(){
    const r=readCount(), s=bestPct("csim"), q=bestPct("quiz");
    const st=(ok,t)=>`<span class="tp ${ok?"ok":""}">${ok?"✓":"○"} ${t}</span>`;
    document.getElementById("home-prog").innerHTML=`<div class="tstat"><b>ความคืบหน้า</b>${st(r>=CR.readLessons,`บทเรียน ${r}/${CR.readLessons}`)}${st(s>=CR.simPct,`เครื่องจำลอง ${s}%`)}${st(q>=CR.quizPct,`แบบทดสอบ ${q}%`)}</div>`;
  }

  /* ---------- บทเรียน ---------- */
  let cur=L[0].id;
  function block([t,c]){
    if(t==="p") return `<p>${c}</p>`;
    if(t==="ul") return `<ul>${c.map(x=>`<li>${x}</li>`).join("")}</ul>`;
    if(t==="ol") return `<ol>${c.map(x=>`<li>${x}</li>`).join("")}</ol>`;
    if(t==="tbl") return `<div class="tblwrap"><table class="ltbl"><thead><tr>${c.h.map(h=>`<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${c.r.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    if(t==="basic") return `<div class="box basic"><b>พื้นฐาน</b><p>${c}</p></div>`;
    if(t==="field") return `<div class="box field"><b>หน้างาน</b><p>${c}</p></div>`;
    if(t==="tip") return `<div class="hint">💡 ${c}</div>`;
    if(t==="warn") return `<div class="msg bad">⚠️ ${c}</div>`;
    if(t==="sec") return `<h3 class="lsec">${c}</h3>`;
    if(t==="cut") return `<div class="cutw"><figure class="cutfig"></figure><div class="cutinfo" aria-live="polite"><p class="muted">แตะส่วนประกอบในภาพเพื่ออ่านว่าทำงานอย่างไร และผู้ใช้ต้องระวังอะไร</p></div></div>`;
    if(t==="mcq") return `<div class="lq"><b>ทบทวนท้ายบท</b> <span class="muted small">(ไม่นับคะแนน)</span>${c.map((q,k)=>`<div class="lqi" data-q="${k}"><p>${k+1}. ${esc(q.q)}</p><div class="lopts">${shuffle(q.o.map((o,j)=>j)).map(j=>`<button class="lopt" data-j="${j}">${esc(q.o[j])}</button>`).join("")}</div><div class="lqf"></div></div>`).join("")}</div>`;
    if(t==="sort") return `<div class="lq lsort"><b>จัดกลุ่มเหตุการณ์</b> <span class="muted small">(ไม่นับคะแนน)</span><p class="small muted">เลือกให้ทุกข้อ แล้วกดตรวจคำตอบ</p>
      ${c.items.map((it,k)=>`<div class="srow" data-s="${k}"><p>${esc(it[0])}</p><div class="seg">${c.cats.map((n,j)=>`<button data-c="${j}">${esc(n)}</button>`).join("")}</div><div class="sfb small"></div></div>`).join("")}
      <div class="tools"><button class="primary sgo" disabled>ตรวจคำตอบ</button><span class="sres"></span></div></div>`;
    return "";
  }
  /* ผูกการทำงานของบล็อกโต้ตอบในบทเรียน */
  function wire(art, X){
    const cut=art.querySelector(".cutfig");
    if(cut){ const tpl=document.getElementById("tpl-cut"); cut.innerHTML=tpl?tpl.innerHTML:"";
      const info=art.querySelector(".cutinfo"), P=window.CUTCLIN||{};
      cut.querySelectorAll(".part").forEach(g=>{ g.setAttribute("tabindex","0"); g.setAttribute("role","button");
        const pick=()=>{ const d=P[g.dataset.id]; if(!d) return; cut.querySelectorAll(".part").forEach(x=>x.classList.toggle("sel",x===g));
          info.innerHTML=`<h3>${esc(d.n)}</h3><p><b>ทำงานอย่างไร</b><br>${esc(d.f)}</p><p><b>ผู้ใช้ต้องระวัง</b><br>${esc(d.c)}</p>`; };
        g.onclick=pick; g.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(); } }; }); }
    const mq=X.b.find(b=>b[0]==="mcq");
    art.querySelectorAll(".lqi").forEach(box=>{ const q=mq[1][+box.dataset.q];
      box.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{ const good=b.dataset.j==="0";
        box.querySelectorAll("[data-j]").forEach(x=>{ x.disabled=true; if(x.dataset.j==="0") x.classList.add("good"); else if(x===b) x.classList.add("bad"); });
        box.querySelector(".lqf").innerHTML=`<div class="fb ${good?"good":"bad"}"><b>${good?"✓ ถูกต้อง":"✗ ยังไม่ถูก"}</b><p>${esc(q.e)}</p></div>`; }); });
    const so=art.querySelector(".lsort");
    if(so){ const D=X.b.find(b=>b[0]==="sort")[1], ans={}, go=so.querySelector(".sgo");
      so.querySelectorAll(".srow").forEach(r=>r.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{ if(r.dataset.locked) return; ans[r.dataset.s]=+b.dataset.c;
        r.querySelectorAll("[data-c]").forEach(x=>x.classList.toggle("on",x===b)); go.disabled=Object.keys(ans).length<D.items.length; }));
      go.onclick=()=>{ let ok=0; so.querySelectorAll(".srow").forEach(r=>{ const it=D.items[r.dataset.s], g=ans[r.dataset.s]===it[1]; if(g) ok++; r.dataset.locked=1; r.classList.add(g?"good":"bad");
          r.querySelector(".sfb").innerHTML=`${g?"✓":"✗"} <b>${esc(D.cats[it[1]])}</b> · ${esc(it[2])}`; });
        go.remove(); so.querySelector(".sres").innerHTML=`<b>ถูก ${ok}/${D.items.length}</b>`; }; }
  }
  const G=()=>window.MGate;
  const lockedL=id=>!!(G()&&G().locked(id));
  function lessons(){
    if(lockedL(cur)) cur=L[Math.min(G().frontier(),L.length-1)].id;   // บทที่ยังล็อก: พากลับไปบทที่ต้องทำต่อ
    const root=document.getElementById("lessons"), X=L.find(x=>x.id===cur), i=L.indexOf(X), done=has("read:"+X.id);
    root.innerHTML=`<h1>บทเรียน</h1>
      <p class="muted">อ่านแต่ละบทจนจบ แล้วกด "อ่านจบแล้ว" ต้องอ่านครบ ${CR.readLessons} บทจึงผ่านเกณฑ์ (อ่านแล้ว ${readCount()}/${L.length}) · เรียนตามลำดับ: บทถัดไปเปิดเมื่อสอบท้ายบทผ่าน (5 ข้อ ได้ 4 ข้อขึ้นไป) เครื่องจำลองและแบบทดสอบเปิดเมื่อผ่านครบทุกบท</p>
      <div class="clgrid">
        <nav class="clnav" aria-label="รายการบทเรียน">${L.map(x=>`<button data-l="${x.id}" class="${x.id===cur?"on":""}${lockedL(x.id)?" mlock":""}${G()&&G().passed(x.id)?" mdone":""}">${has("read:"+x.id)?"✓ ":""}${esc(x.n)}</button>`).join("")}</nav>
        <article class="lesson"><h2>${esc(X.n)}</h2>${X.b.map(block).join("")}
          <div class="srcs"><b>แหล่งอ้างอิง</b><ul>${X.src.map(([n,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a></li>`).join("")}</ul></div>
          <div class="tools">${done?`<span class="tp ok">✓ อ่านจบแล้ว</span>`:`<button class="primary" id="ls-done">อ่านจบแล้ว</button>`}
            ${i<L.length-1?`<button data-go="${L[i+1].id}">${esc(L[i+1].n)} ▶</button>`:`<a class="btn" href="#sim">ไปเครื่องจำลอง ▶</a>`}</div>
          ${G()?G().boxHTML(X.id):""}
        </article></div>`;
    root.querySelectorAll("[data-l],[data-go]").forEach(b=>b.onclick=()=>{ const id=b.dataset.l||b.dataset.go;
      if(lockedL(id)){ G().toast(G().lockMsg(id)); return; }
      cur=id; lessons(); (window.innerWidth<900?root.querySelector(".lesson"):root).scrollIntoView({behavior:"smooth"}); });
    if(G()){ G().mount(root); G().decorate(); }
    wire(root.querySelector(".lesson"), X);
    const d=root.querySelector("#ls-done");
    if(d) d.onclick=async()=>{ d.disabled=true; await Score.record({key:"read:"+X.id, mod:"บทเรียน", item:X.n, score:1, max:1}); lessons(); };
  }

  /* ---------- เครื่องจำลอง ---------- */
  let run=null;   // {si, step, pts:[[...]], opts}
  const tcls=v=>v==null?"na":v<36.5?"cold":v>37.5?"hot":"ok";
  function monitor(st){
    const f=v=>v==null?"--.-":v.toFixed(1);
    return `<div class="cmon">
      <div class="iscr"><div class="imode"><span class="${st.mode==="air"?"on":""}">AIR</span><span class="${st.mode==="skin"?"on":""}">SKIN</span>${st.photo?`<span class="iov">ส่องไฟ</span>`:""}</div>
        <div class="itiles"><div class="itile"><span>${st.mode==="air"?"AIR SET":"SKIN SET"}</span><b>${st.set==null?"--.-":f(st.set)}</b><small>°C</small></div>
          <div class="itile"><span>AIR</span><b>${f(st.air)}</b><small>°C</small></div>
          <div class="itile"><span>SKIN</span><b>${f(st.skin)}</b><small>${st.skin==null?"ไม่ได้ติด":"°C"}</small></div>
          <div class="itile ${st.hum==null?"off":""}"><span>HUM</span><b>${st.hum==null?"OFF":st.hum}</b><small>${st.hum==null?"":"%"}</small></div></div>
        <div class="imsg ${st.alarm?"alm":""}" role="status">${st.alarm?"⚠ ALARM: "+esc(st.alarm):esc(st.note||"")}</div></div>
      <div class="baby ${tcls(st.ax)}"><svg viewBox="0 0 120 70" aria-hidden="true"><ellipse cx="52" cy="44" rx="36" ry="14"/><circle cx="96" cy="36" r="14"/></svg>
        <div><small>อุณหภูมิรักแร้</small><b>${st.ax==null?"ยังไม่ได้วัด":f(st.ax)+" °C"}</b></div></div>
    </div>`;
  }
  function trendSvg(t, good, mine){
    const W=520,H=200,P=36, x0=t[0], x1=t[t.length-1], lo=34.5, hi=38.5;
    const X=v=>P+(v-x0)/(x1-x0)*(W-P*2), Y=v=>H-26-(v-lo)/(hi-lo)*(H-46);
    const path=a=>a.map((v,i)=>`${i?"L":"M"}${X(t[i]).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
    return `<svg class="trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟอุณหภูมิทารกจำลอง เส้นทึบคือผลจากการตัดสินใจของคุณ เส้นประคือเมื่อทำถูกทุกขั้น">
      <rect x="${P}" y="${Y(37.5)}" width="${W-P*2}" height="${Y(36.5)-Y(37.5)}" class="band"/>
      <text x="${W-P+4}" y="${Y(37)+4}" class="ax">ปกติ</text>
      ${[35,36,37,38].map(v=>`<line x1="${P}" x2="${W-P}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${P-6}" y="${Y(v)+4}" class="ax" text-anchor="end">${v}</text>`).join("")}
      ${t.map(v=>`<text x="${X(v)}" y="${H-8}" class="ax" text-anchor="middle">${v} นาที</text>`).join("")}
      <path d="${path(good)}" class="good"/><path d="${path(mine)}" class="mine"/>
      ${mine.map((v,i)=>`<circle cx="${X(t[i])}" cy="${Y(v)}" r="3.5" class="mine-pt"/>`).join("")}
    </svg><p class="small muted">เส้นทึบ = อุณหภูมิทารกจำลองจากการตัดสินใจของคุณ · เส้นประ = เมื่อทำถูกทุกขั้น · แถบเขียว = ช่วงปกติ 36.5–37.5 °C</p>`;
  }
  function simIntro(){
    const root=document.getElementById("sim"), b=bestPct("csim");
    root.innerHTML=`<h1>เครื่องจำลอง</h1>
      <p class="muted">${S.scenarios.length} สถานการณ์ สถานการณ์ละ 3 ขั้น ขั้นละ 1 คะแนน (นับคำตอบแรก) รวม ${S.scenarios.length*3} คะแนน ต้องได้ ≥ ${CR.simPct}% จบแต่ละสถานการณ์จะเห็นกราฟอุณหภูมิทารกจำลอง</p>
      <div class="note small" style="margin:0 0 12px">⚠️ ${esc(S.disclaimer)}</div>
      ${b?`<p class="hint">คะแนนดีที่สุดของคุณ: ${b}%</p>`:""}
      <ol class="recap">${S.scenarios.map(s=>`<li><b>${esc(s.n)}</b><span>${esc(s.lessons)}</span></li>`).join("")}</ol>
      <div class="tools"><button class="primary" id="sm-go">เริ่มเครื่องจำลอง</button></div>`;
    root.querySelector("#sm-go").onclick=()=>{ run={si:0, step:0, pts:S.scenarios.map(()=>[])}; simStep(); };
  }
  function simStep(){
    const root=document.getElementById("sim"), sc=S.scenarios[run.si], stp=sc.steps[run.step];
    const ord=shuffle(stp.opts.map((o,k)=>k));
    root.innerHTML=`<div class="simtop"><span class="kicker">สถานการณ์ ${run.si+1} / ${S.scenarios.length} · ขั้นที่ ${run.step+1} / 3</span>
        <div class="simdots">${S.scenarios.map((s,k)=>{ const p=run.pts[k], sum=p.reduce((a,b)=>a+b,0); return `<i class="${k<run.si?(sum===3?"ok":"bad"):k===run.si?"on":""}"></i>`; }).join("")}</div></div>
      <h2>${esc(sc.n)}</h2>
      <div class="pmgrid"><div>
          <div class="order"><div class="tk-h"><span>📋 สถานการณ์</span></div><p>${esc(sc.story)}</p>${sc.unit?`<p class="unit">${esc(sc.unit)}</p>`:""}</div>
          ${monitor(stp.st)}
        </div>
        <div><h3>${esc(stp.q)}</h3><div class="lopts">${ord.map(k=>`<button class="lopt" data-k="${k}">${esc(stp.opts[k][0])}</button>`).join("")}</div><div id="sm-f"></div></div>
      </div>`;
    root.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{
      const k=+b.dataset.k, good=k===0;
      run.pts[run.si][run.step]=good?1:0;
      root.querySelectorAll("[data-k]").forEach(x=>{ x.disabled=true; if(x.dataset.k==="0") x.classList.add("good"); else if(x===b) x.classList.add("bad"); });
      const f=root.querySelector("#sm-f");
      f.innerHTML=`<div class="fb ${good?"good":"bad"}"><b>${good?"✓ ถูกต้อง +1":"✗ ยังไม่เหมาะ"}</b><p>${esc(stp.opts[k][1])}</p>
        ${good?"":`<p><b>ที่ควรทำ:</b> ${esc(stp.opts[0][0])} · ${esc(stp.opts[0][1])}</p>`}
        <button class="primary" id="sm-n">${run.step<2?"ขั้นถัดไป →":"ดูผลสถานการณ์นี้"}</button></div>`;
      f.querySelector("#sm-n").onclick=()=>{ if(run.step<2){ run.step++; simStep(); } else simEnd(); window.scrollTo(0,0); };
      if(window.innerWidth<900) f.scrollIntoView({behavior:"smooth",block:"start"});
    });
  }
  function simEnd(){
    const root=document.getElementById("sim"), sc=S.scenarios[run.si], p=run.pts[run.si], n=p.reduce((a,b)=>a+b,0);
    const mine=sc.tr.good.map((g,i)=>+(sc.tr.bad[i]+(g-sc.tr.bad[i])*n/3).toFixed(2)), last=run.si===S.scenarios.length-1;
    root.innerHTML=`<div class="simtop"><span class="kicker">สถานการณ์ ${run.si+1} / ${S.scenarios.length} · ผลลัพธ์</span></div>
      <h2>${esc(sc.n)}</h2>
      <div class="score ${n===3?"ok":n===2?"mid":"bad"}"><div class="big">${n}/3</div><div>${n===3?"ตัดสินใจเหมาะสมทุกขั้น":"ยังมีขั้นที่ควรทบทวน ("+esc(sc.lessons)+")"}</div></div>
      ${trendSvg(sc.tr.t, sc.tr.good, mine)}
      <div class="tools"><button class="primary" id="sm-nx">${last?"ดูผลรวม":"สถานการณ์ถัดไป →"}</button></div>`;
    root.querySelector("#sm-nx").onclick=()=>{ if(last) simSummary(); else { run.si++; run.step=0; simStep(); } window.scrollTo(0,0); };
  }
  function simSummary(){
    const root=document.getElementById("sim"), tot=run.pts.flat().reduce((a,b)=>a+b,0), mx=S.scenarios.length*3, pct=Math.round(tot/mx*100);
    if(!run.saved){ run.saved=true;
      Score.record({key:"csim", mod:"เครื่องจำลอง", item:"เครื่องจำลอง "+S.scenarios.length+" สถานการณ์", score:tot, max:mx,
        detail:S.scenarios.map((s,k)=>s.id+" "+run.pts[k].reduce((a,b)=>a+b,0)+"/3").join(", ")}); }
    root.innerHTML=`<h1>ผลเครื่องจำลอง</h1>
      <div class="score ${pct>=CR.simPct?"ok":pct>=60?"mid":"bad"}"><div class="big">${tot}/${mx}</div><div>${pct}% ${pct>=CR.simPct?"· ผ่านเกณฑ์":"· เกณฑ์ผ่าน "+CR.simPct+"%"}</div></div>
      <ol class="recap">${S.scenarios.map((s,k)=>`<li><b>${run.pts[k].reduce((a,b)=>a+b,0)}/3 · ${esc(s.n)}</b><span>ทบทวน: ${esc(s.lessons)}</span></li>`).join("")}</ol>
      <div class="tools"><button class="primary" id="sm-again">ทำใหม่ทั้งชุด</button><a class="btn" href="#quiz">ไปแบบทดสอบ ▶</a></div>`;
    root.querySelector("#sm-again").onclick=()=>{ run={si:0, step:0, pts:S.scenarios.map(()=>[])}; simStep(); };
  }

  /* ---------- นำทาง ---------- */
  function route(){
    const v=(location.hash||"#home").slice(1), names=[...document.querySelectorAll("#nav a")].map(a=>a.dataset.v), name=names.includes(v)?v:"home";
    if(G() && G().locked(name)){ G().toast(G().lockMsg(name)); location.replace("#lessons"); return; }
    document.querySelectorAll(".view").forEach(s=>s.classList.toggle("on",s.id==="v-"+name));
    document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.dataset.v===name));
    if(name==="home") home();
    if(name==="lessons") lessons();
    if(name==="sim" && !run) simIntro();
    if(window.Views && window.Views[name]) window.Views[name].show();
    if(G()) G().decorate();
    window.scrollTo(0,0);
  }
  window.addEventListener("hashchange",route);
  if(window.MGate){
    MGate.goLesson=id=>{ if(id){ cur=id; lessons(); document.getElementById("lessons").scrollIntoView({behavior:"smooth"}); } else location.hash="#sim"; };
    MGate.onChange=()=>{ document.querySelectorAll("#lessons .clnav [data-l]").forEach(b=>{ b.classList.toggle("mlock",lockedL(b.dataset.l)); b.classList.toggle("mdone",MGate.passed(b.dataset.l)); }); };
  }
  window.addEventListener("DOMContentLoaded",()=>{
    const e=document.getElementById("report"); if(e&&C.reportEmail) e.innerHTML=`พบข้อผิดพลาดในเนื้อหา แจ้งได้ที่ <a href="mailto:${esc(C.reportEmail)}">${esc(C.reportEmail)}</a>`;
    route();
  });
})();
