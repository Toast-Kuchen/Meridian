'use strict';
const N=24,$=i=>document.getElementById(i),R=['food','wood','stone','tools','coins'],
RI={food:'🌾',wood:'🪵',stone:'🪨',tools:'🔧',coins:'🪙'},RN={food:'Nahrung',wood:'Holz',stone:'Stein',tools:'Werkzeuge',coins:'Münzen'},ST=['','Dorf','Marktflecken','Stadt'];
const B={
road:{n:'Weg',i:'🛤️',c:{coins:1,stone:1},st:1,t:0,flat:1,sat:.3,d:'Befestigter Weg, macht den Ort ansehnlicher.'},
well:{n:'Brunnen',i:'⛲',c:{stone:8,coins:5},st:1,t:1,h:10,rh:10,s:.5,w:'#9a9a9a',r:'#7a5a35',sat:4,d:'Frisches Wasser steigert die Zufriedenheit.'},
house:{n:'Wohnhaus',i:'🏠',c:{wood:10,coins:5},st:1,t:1,h:20,w:'#dcc9a2',r:'#b04a32',home:4,d:'Fachwerkhaus für 4 Bewohner.'},
farm:{n:'Bauernhof',i:'🌾',c:{wood:15,coins:10},st:1,t:1,h:16,rh:10,w:'#c9a66b',r:'#7a5a35',job:3,prod:{food:9},d:'Baut Getreide an und ernährt die Siedlung.'},
wood:{n:'Holzfäller',i:'🪓',c:{wood:8,coins:5},st:1,t:1,h:14,rh:10,w:'#9c7a4a',r:'#5b4025',job:2,prod:{wood:6},need:1,d:'Fällt Bäume. Braucht Wald in 2 Feldern Umkreis.'},
quarry:{n:'Steinbruch',i:'⛏️',c:{wood:10,tools:2,coins:10},st:1,t:1,h:12,rh:6,w:'#a9a597',r:'#6d6a60',job:3,prod:{stone:4},need:3,d:'Bricht Stein. Braucht Hügel in 2 Feldern Umkreis.'},
smith:{n:'Schmiede',i:'🔨',c:{wood:15,stone:10,coins:20},st:2,t:1,h:20,rh:12,w:'#8d8b88',r:'#4a4a52',job:2,use:{wood:2,stone:1},prod:{tools:2},d:'Macht aus Holz und Stein Werkzeuge.'},
bakery:{n:'Bäckerei',i:'🥖',c:{wood:15,stone:10,coins:20},st:2,t:1,h:20,rh:14,w:'#e3d2ae',r:'#9a4a2c',job:2,use:{food:3},prod:{food:6},d:'Veredelt Korn zu Brot: aus 3 Nahrung werden 6.'},
market:{n:'Marktplatz',i:'🧺',c:{wood:20,stone:10,coins:30},st:2,t:1,h:12,rh:16,w:'#d8b46a',r:'#b8382a',job:2,prod:{coins:5},sat:10,d:'Handel bringt Münzen und Zufriedenheit.'},
store:{n:'Lagerhaus',i:'📦',c:{wood:25,stone:15},st:2,t:1,h:24,rh:12,w:'#b79566',r:'#6b4a2a',cap:100,d:'Erhöht das Lager aller Rohstoffe um 100.'},
burgher:{n:'Bürgerhaus',i:'🏛️',c:{wood:20,stone:15,coins:20},st:3,t:2,h:32,rh:16,w:'#d3c3a3',r:'#8a3b2a',home:8,d:'Stattliches Haus für 8 Bewohner.'}
};
const hs=(x,y)=>((x*73856093^y*19349663)>>>0)%100/100,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),cost=c=>Object.keys(c).map(k=>RI[k]+c[k]).join(' '),
rnd=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let S,og=new Map,cam={x:0,y:0,z:.8},mode=null,ghost=null,sel=null,W,H,dpr,opt={sound:1,music:1},WK=[],last=0,toastT,cv=$('c'),g=cv.getContext('2d');
const at=(x,y)=>og.get(y*N+x),idx=()=>{og=new Map;S.bld.forEach(b=>og.set(b.y*N+b.x,b))};
function genMap(){const r=rnd((Math.random()*1e9)|0),p=Array.from({length:8},()=>r()*6),n=(x,y,o)=>Math.sin(x*.45+p[o])+Math.sin(y*.4+p[o+1])+Math.sin((x+y)*.28+p[o+2])+Math.sin((x-y)*.5+p[o+3]),m=[];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=0;if(n(x,y,0)>1.2)t=1;else if(n(x,y,4)>2.1)t=3;
  if(Math.abs(x-(17+3*Math.sin(y*.35+p[0])))<1.3||Math.hypot(x-4,y-19)<1.6)t=2;if(Math.hypot(x-10,y-10)<3.6)t=0;m.push(t)}
 [[5,12],[6,12],[5,13],[6,13],[4,12]].forEach(([x,y])=>m[y*N+x]=1);[[12,4],[13,4],[12,5],[13,5],[11,4]].forEach(([x,y])=>m[y*N+x]=3);return m}
function newGame(){S={turn:1,stage:1,pop:6,sat:60,won:0,res:{food:30,wood:40,stone:10,tools:5,coins:60},map:genMap(),log:['Willkommen in Meridian!'],
 bld:[['house',9,9],['house',11,9],['farm',10,11]].map(([id,x,y])=>({id,x,y,t:0}))};idx();WK=[];mode=ghost=sel=null;centerOn(10,10)}
// ---- Wirtschaft ----
function stats(s){let home=0,jobs=0,cap=100,sb=0;for(const b of s.bld){if(b.t>0)continue;const d=B[b.id];home+=d.home||0;jobs+=d.job||0;cap+=d.cap||0;sb+=d.sat||0}return{home,jobs,cap,sb:Math.min(sb,35)}}
const EV=[s=>{s.res.food+=10;return'Gute Ernte: +10 Nahrung.'},
 s=>s.res.coins>=10?(s.res.coins-=10,s.res.wood+=15,'Ein Händler verkauft günstig Holz: +15 Holz für 10 Münzen.'):'Ein Händler zieht durch, doch das Geld fehlt.',
 s=>{s.res.coins=Math.max(0,s.res.coins-6);return'Reparaturen am Dorfweg kosten 6 Münzen.'},
 s=>s.pop<stats(s).home?(s.pop++,'Eine Familie zieht zu.'):'Reisende suchen Quartier, aber es fehlt Wohnraum.'];
function step(s,q){const k=stats(s),L=[],r=s.res,emp=Math.min(s.pop,k.jobs),eff=k.jobs?emp/k.jobs:0,
 pr=s.bld.filter(b=>!b.t&&B[b.id].prod).sort((a,b)=>!!B[a.id].use-!!B[b.id].use);
 for(const b of pr){const d=B[b.id];if(d.use){if(!Object.keys(d.use).every(x=>r[x]>=d.use[x])){L.push(d.n+': Rohstoffmangel, Produktion ruht.');continue}for(const x in d.use)r[x]-=d.use[x]}for(const x in d.prod)r[x]+=d.prod[x]*eff}
 const need=s.pop*.5,hunger=r.food<need;r.food=Math.max(0,r.food-need);if(hunger)L.push('Hunger! Die Vorräte reichen nicht.');
 r.coins=Math.max(0,r.coins+s.pop+emp-s.bld.filter(b=>!b.t&&B[b.id].job).length);
 const un=s.pop?(s.pop-emp)/s.pop:0,tg=40+k.sb+(hunger?-30:15)+(un>.4?-10:un<.15?5:0)+(s.pop>k.home?-10:0);s.sat=cl(s.sat+(tg-s.sat)*.5,0,100);
 const free=k.home-s.pop;if(hunger||s.sat<25)s.pop=Math.max(2,s.pop-1);else if(free>0&&s.sat>=45){s.pop+=Math.min(free,Math.ceil(s.pop*.2));L.push('Die Bevölkerung wächst.')}else if(free<0)s.pop=k.home;
 s.bld.forEach(b=>{if(b.t>0&&--b.t==0)L.push(B[b.id].n+' fertiggestellt.')});
 const ns=s.pop>=40?3:s.pop>=20?2:1;if(ns>s.stage){s.stage=ns;L.push('Aufstieg: '+ST[ns]+'! Neue Gebäude verfügbar.')}
 if(!q&&Math.random()<.3)L.push(EV[Math.random()*EV.length|0](s));
 for(const x of R)r[x]=Math.min(k.cap,Math.round(r[x]*10)/10);
 if(!s.won&&s.pop>=60&&s.sat>=60&&r.food>=10&&r.coins>=50){s.won=1;L.push('Meridian ist eine blühende Stadt – Sieg!')}
 s.turn++;if(!q){L.slice().reverse().forEach(l=>s.log.unshift('P'+s.turn+': '+l));s.log.length=Math.min(s.log.length,40)}return L}
// ---- Bauen ----
const near=(x,y,m)=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const a=x+i,b=y+j;if(a>=0&&b>=0&&a<N&&b<N&&S.map[b*N+a]==m)return 1}return 0};
function why(id,x,y){const d=B[id];if(x<0||y<0||x>=N||y>=N)return'Außerhalb der Karte';if(d.st>S.stage)return'Noch gesperrt';if(S.map[y*N+x])return'Nur auf freier Wiese baubar';if(at(x,y))return'Feld ist belegt';
 if(d.need&&!near(x,y,d.need))return d.need==1?'Braucht Wald in der Nähe':'Braucht Hügel in der Nähe';for(const k in d.c)if(S.res[k]<d.c[k])return'Zu wenig '+RN[k];return''}
function build(id,x,y){const d=B[id];for(const k in d.c)S.res[k]-=d.c[k];S.bld.push({id,x,y,t:d.t});idx();sfx('build');after()}
function demolish(b){const d=B[b.id];for(const k in d.c)S.res[k]+=Math.floor(d.c[k]/2);S.bld=S.bld.filter(x=>x!==b);idx();sel=null;sfx('click');after()}
function after(){ui();save()}
function nextTurn(){const L=step(S);sfx('bell',.4);toast(L.length?L.join(' '):'Eine ruhige Periode.');after();if(S.won&&!S.shown){S.shown=1;dlg('<h2>🏆 Sieg!</h2><p>Deine Siedlung ist zur blühenden Stadt gewachsen. Du kannst weiterspielen.</p>')}}
// ---- UI ----
function toast(t){const m=$('msg');m.textContent=t;m.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>m.hidden=true,4500)}
function ui(){const k=stats(S),c=JSON.parse(JSON.stringify(S));step(c,1);
 $('top').innerHTML=R.map(x=>{const d=Math.round((c.res[x]-S.res[x])*10)/10;return`<div class=ch>${RI[x]} ${Math.floor(S.res[x])}<i class="${d>=0?'up':'dn'}">${d>=0?'+':''}${d}</i></div>`}).join('')+
 `<div class=ch>👥 ${S.pop}/${k.home}<i>Arbeit ${Math.min(S.pop,k.jobs)}/${k.jobs}</i></div><div class=ch>😊 ${Math.round(S.sat)}%</div><div class=ch>🏘️ ${ST[S.stage]}<i>Ziel ${S.pop}/60</i></div>`;
 $('nx').textContent='▶ Periode '+S.turn+' beenden';bar();info()}
function bar(){$('bl').innerHTML=Object.keys(B).map(id=>{const d=B[id],lk=d.st>S.stage;return`<button class="b${lk?' lk':''}${mode==id?' on':''}" data-id="${id}">${lk?'🔒':d.i}<small>${d.n}</small><small>${cost(d.c)}</small></button>`}).join('')}
const eff=d=>(d.home?'🏠 '+d.home+' Plätze · ':'')+(d.job?'👷 '+d.job+' Jobs · ':'')+(d.use?'Verbraucht '+cost(d.use)+' · ':'')+(d.prod?'Erzeugt '+cost(d.prod)+' · ':'')+(d.sat?'😊 +'+d.sat+' · ':'')+(d.cap?'📦 +'+d.cap+' · ':'');
function info(){const e=$('info');let h='';
 if(mode){const d=B[mode],w=ghost?why(mode,ghost[0],ghost[1]):'';h=`<b>${d.i} ${d.n}</b> – ${d.d}<br>Kosten ${cost(d.c)} · Bau ${d.t} Periode(n)<br>${eff(d)}<br>${ghost?(w?'⛔ '+w:'✅ Nochmal tippen zum Bauen'):'Tippe auf ein freies Feld.'}<br><button data-a="x">Abbrechen</button>`}
 else if(sel){const d=B[sel.id];h=`<b>${d.i} ${d.n}</b> – ${d.d}<br>${eff(d)}<br>Status: ${sel.t>0?'Im Bau, noch '+sel.t+' Periode(n)':'in Betrieb'}<br><button data-a="dm">Abreißen (50% Rückerstattung)</button><button data-a="x" style="background:#2f4a2a">Schließen</button>`}
 e.innerHTML=h;e.hidden=!h}
function dlg(h){$('dlg').innerHTML=`<div class=bx>${h}<button data-a="cl">Schließen</button></div>`;$('dlg').hidden=false}
const HELP='<h2>So wird gespielt</h2><p>1. Wähle unten ein Gebäude, tippe aufs Feld, tippe nochmal zum Bauen.<br>2. „Periode beenden“ lässt die Wirtschaft laufen: Produktion, Essen, Steuern, Wachstum.<br>3. Die kleinen Zahlen oben zeigen die erwartete Änderung.<br>4. Ziehen = Karte bewegen, zwei Finger = Zoomen.<br><br>Ziel: 60 Einwohner, 60% Zufriedenheit, Nahrung ≥ 10, Münzen ≥ 50. Ohne Nahrung und Jobs sinkt die Zufriedenheit – du kannst dich jederzeit erholen.</p>';
function menu(){const k=stats(S),e=Math.min(S.pop,k.jobs);dlg(`<h2>Meridian</h2><p>Periode ${S.turn} · ${ST[S.stage]} · Einwohner ${S.pop} · Beschäftigte ${e} · Arbeitslosenquote ${S.pop?Math.round((S.pop-e)/S.pop*100):0}% · Zufriedenheit ${Math.round(S.sat)}%</p>
<button data-a="sv">💾 Speichern</button><button data-a="nw">🆕 Neues Spiel</button><button data-a="so">🔊 Ton: ${opt.sound?'an':'aus'}</button><button data-a="mu">🎵 Musik: ${opt.music?'an':'aus'}</button><button data-a="hp">❓ Anleitung</button><h3>Ereignisse</h3><div class=lg>${S.log.slice(0,12).join('<br>')}</div>`)}
$('dlg').onclick=e=>{const a=e.target.dataset.a;if(!a)return;if(a=='cl')$('dlg').hidden=true;
 else if(a=='sv'){put('save',{v:1,S,opt}).then(()=>toast('Gespeichert.'));$('dlg').hidden=true}
 else if(a=='nw'){if(confirm('Neues Spiel beginnen? Der alte Stand geht verloren.')){newGame();after();$('dlg').hidden=true}}
 else if(a=='so'){opt.sound^=1;save();menu()}else if(a=='mu'){opt.music^=1;amb();save();menu()}else if(a=='hp')dlg(HELP)};
$('info').onclick=e=>{const a=e.target.dataset.a;if(a=='x')mode=ghost=sel=null;else if(a=='dm'&&sel)demolish(sel);ui()};
$('bl').onclick=e=>{const b=e.target.closest('.b');if(!b)return;const id=b.dataset.id;if(B[id].st>S.stage)return toast('Freigeschaltet ab: '+ST[B[id].st]);sfx('click');mode=mode==id?null:id;ghost=sel=null;ui()};
$('nx').onclick=nextTurn;$('mn').onclick=menu;
$('zoom').onclick=e=>{const z=e.target.dataset.z;if(z==null)return;if(z==0)centerOn(10,10);else zoomAt(W/2,H/2,z>0?1.25:.8)};
// ---- Kamera / Eingabe ----
const P=(x,y)=>[(x-y)*32*cam.z+cam.x,((x+y)*16+16)*cam.z+cam.y];
function clamp(){const z=cam.z;cam.x=cl(cam.x,W/2-600*z,W/2+600*z);cam.y=cl(cam.y+384*z,H/2-300*z,H/2+300*z)-384*z}
function centerOn(x,y){cam.x=W/2-(x-y)*32*cam.z;cam.y=H/2-((x+y)*16+16)*cam.z;clamp()}
function zoomAt(px,py,f){const z=cl(cam.z*f,.45,2.2),k=z/cam.z;cam.x=px-(px-cam.x)*k;cam.y=py-(py-cam.y)*k;cam.z=z;clamp()}
const pick=(px,py)=>{const u=(px-cam.x)/cam.z,v=(py-cam.y)/cam.z-16;return[Math.round((u/32+v/16)/2),Math.round((v/16-u/32)/2)]};
const ptr=new Map();let moved=0,multi=0;
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptr.size==1)moved=multi=0;else multi=1;unlock()};
cv.onpointermove=e=>{const p=ptr.get(e.pointerId);if(!p)return;
 if(ptr.size==1){cam.x+=e.clientX-p.x;cam.y+=e.clientY-p.y;moved+=Math.abs(e.clientX-p.x)+Math.abs(e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;clamp()}
 else if(ptr.size==2){const a=[...ptr.values()],d0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);p.x=e.clientX;p.y=e.clientY;const d1=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(d0>10)zoomAt((a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2,d1/d0)}};
cv.onpointerup=cv.onpointercancel=e=>{const had=ptr.delete(e.pointerId);if(had&&e.type=='pointerup'&&!multi&&moved<10)tap(e.clientX,e.clientY)};
function tap(px,py){const[x,y]=pick(px,py);
 if(mode){if(ghost&&ghost[0]==x&&ghost[1]==y&&!why(mode,x,y))build(mode,x,y);else{ghost=[x,y];info();const w=why(mode,x,y);if(w)toast(w)}}
 else{const b=at(x,y);sel=b||null;sfx('click',.3);info()}}
document.addEventListener('gesturestart',e=>e.preventDefault());
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr}
addEventListener('resize',()=>{resize();clamp()});
// ---- Rendering ----
function dp(cx,cy,k){const z=cam.z;g.beginPath();g.moveTo(cx,cy-16*z*k);g.lineTo(cx+32*z*k,cy);g.lineTo(cx,cy+16*z*k);g.lineTo(cx-32*z*k,cy);g.closePath()}
const dia=(cx,cy,k,c)=>{dp(cx,cy,k);g.fillStyle=c;g.fill()},poly=(a,c)=>{g.beginPath();a.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=c;g.fill()};
function tree(cx,cy,s){const z=cam.z*s;g.fillStyle='#5a3d22';g.fillRect(cx-1.5*z,cy-8*z,3*z,9*z);g.fillStyle='#3d6a33';g.beginPath();g.arc(cx,cy-14*z,8*z,0,7);g.fill();g.fillStyle='#5a8c42';g.beginPath();g.arc(cx-2*z,cy-16*z,4.5*z,0,7);g.fill()}
function box(cx,cy,d,a){const z=cam.z;g.globalAlpha=a;if(d.flat){dia(cx,cy,.95,'#b9a27a');dia(cx,cy,.7,'#cdb98f');g.globalAlpha=1;return}
 const s=d.s||1,hw=22*s*z,hh=11*s*z,h=d.h*z,rh=(d.rh||14)*z;dia(cx+5*z,cy+3*z,.8*s+.1,'rgba(0,0,0,.2)');
 poly([[cx-hw,cy],[cx,cy+hh],[cx,cy+hh-h],[cx-hw,cy-h]],d.w);poly([[cx-hw,cy],[cx,cy+hh],[cx,cy+hh-h],[cx-hw,cy-h]],'rgba(0,0,0,.2)');
 poly([[cx,cy+hh],[cx+hw,cy],[cx+hw,cy-h],[cx,cy+hh-h]],d.w);
 poly([[cx-hw,cy-h],[cx,cy+hh-h],[cx,cy-h-rh]],d.r);poly([[cx,cy+hh-h],[cx+hw,cy-h],[cx,cy-h-rh]],d.r);poly([[cx,cy+hh-h],[cx+hw,cy-h],[cx,cy-h-rh]],'rgba(0,0,0,.18)');
 g.globalAlpha=1;g.font=14*z+'px serif';g.textAlign='center';g.fillText(d.i,cx,cy-h-rh-4*z)}
function drawB(b,cx,cy){const d=B[b.id];box(cx,cy,d,b.t>0?.55:1);if(b.t>0&&!d.flat){g.font=16*cam.z+'px serif';g.textAlign='center';g.fillText('🔨',cx,cy-30*cam.z)}}
function draw(ts){const z=cam.z,t=ts/1000,dt=Math.min(.1,(ts-last)/1000);last=ts;g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#bcd09a';g.fillRect(0,0,W,H);
 const vis=(cx,cy)=>cx>-50*z&&cx<W+50*z&&cy>-70*z&&cy<H+60*z;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const[cx,cy]=P(x,y);if(!vis(cx,cy))continue;const m=S.map[y*N+x],h=hs(x,y);
  dia(cx,cy,1.03,m==2?`hsl(205,45%,${47+3*Math.sin(t*1.5+x+y)}%)`:m==1?`hsl(100,30%,${30+h*6}%)`:m==3?`hsl(40,12%,${52+h*8}%)`:`hsl(${82+h*12},34%,${44+h*7}%)`)}
 while(WK.length<Math.min(14,Math.round(S.pop/2))&&S.bld.length)WK.push({x:S.bld[0].x,y:S.bld[0].y,tx:0,ty:0});while(WK.length>Math.round(S.pop/2))WK.pop();
 const tg=S.bld.filter(b=>!b.t&&!B[b.id].flat);
 for(const w of WK){const d=Math.hypot(w.tx-w.x,w.ty-w.y);if(d<.1&&tg.length){const b=tg[Math.random()*tg.length|0];w.tx=b.x+(Math.random()-.5)*.6;w.ty=b.y+.6}else if(d>=.1){w.x+=(w.tx-w.x)/d*.8*dt;w.y+=(w.ty-w.y)/d*.8*dt}}
 const ws=WK.slice().sort((a,b)=>a.x+a.y-b.x-b.y);let wi=0;
 for(let s=0;s<2*N;s++){for(let x=Math.max(0,s-N+1);x<=Math.min(s,N-1);x++){const y=s-x,[cx,cy]=P(x,y);if(!vis(cx,cy))continue;const m=S.map[y*N+x],b=at(x,y),h=hs(x,y);
   if(m==1){tree(cx-9*z,cy-2*z,.9+h*.3);tree(cx+8*z,cy+3*z,.8+h*.4)}else if(m==3){poly([[cx-24*z,cy],[cx-4*z,cy-14*z],[cx+6*z,cy-10*z],[cx+26*z,cy+2*z],[cx,cy+11*z]],'#a39b86');poly([[cx-4*z,cy-14*z],[cx+6*z,cy-10*z],[cx+26*z,cy+2*z],[cx+4*z,cy+2*z]],'#8d8672')}
   if(b)drawB(b,cx,cy)}
  while(wi<ws.length&&ws[wi].x+ws[wi].y<s+1){const w=ws[wi++],[px,py]=P(w.x,w.y);g.fillStyle=`hsl(${hs(wi,3)*360|0},40%,40%)`;g.fillRect(px-2*z,py-8*z,4*z,6*z);g.fillStyle='#e8c9a0';g.beginPath();g.arc(px,py-10*z,2.2*z,0,7);g.fill()}}
 if(mode&&ghost){const[cx,cy]=P(ghost[0],ghost[1]),ok=!why(mode,ghost[0],ghost[1]);dia(cx,cy,1,ok?'rgba(80,220,90,.5)':'rgba(230,60,50,.55)');box(cx,cy,B[mode],.65)}
 if(sel&&!mode){const[cx,cy]=P(sel.x,sel.y);dp(cx,cy,1.05);g.strokeStyle='#e0b048';g.lineWidth=3;g.stroke()}
 requestAnimationFrame(draw)}
// ---- Audio (Dateien in assets/audio/*.wav, austauschbar) ----
const A={on:0};
function sfx(n,v=.5){if(!opt.sound||!A.on)return;const a=new Audio('assets/audio/'+n+'.wav');a.volume=v;a.play().catch(()=>{})}
function amb(){if(!A.on)return;if(!A.w){A.w=new Audio('assets/audio/wind.wav');A.w.loop=true;A.w.volume=.3;setInterval(()=>{if(opt.music&&Math.random()<.6){const b=new Audio('assets/audio/bird.wav');b.volume=.25;b.play().catch(()=>{})}},9000)}opt.music?A.w.play().catch(()=>{}):A.w.pause()}
function unlock(){if(!A.on){A.on=1;amb()}}
// ---- Speicher (IndexedDB, atomare Transaktion, Versionsfeld) ----
const DB=()=>new Promise((ok,no)=>{const r=indexedDB.open('meridian',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const put=async(k,v)=>{const d=await DB();return new Promise((ok,no)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=ok;t.onerror=t.onabort=()=>no(t.error)})};
const get=async k=>{const d=await DB();return new Promise((ok,no)=>{const r=d.transaction('kv').objectStore('kv').get(k);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})};
let sT;function save(){clearTimeout(sT);sT=setTimeout(()=>put('save',{v:1,S,opt}).catch(()=>toast('Speichern fehlgeschlagen.')),400)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)put('save',{v:1,S,opt}).catch(()=>{})});
(async()=>{resize();try{const d=await get('save');if(d&&d.v===1&&d.S&&d.S.map&&d.S.map.length==N*N){S=d.S;opt=d.opt||opt;idx();centerOn(10,10)}}catch(e){}
 if(!S){newGame();dlg(HELP)}ui();requestAnimationFrame(draw);
 if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{})})();
