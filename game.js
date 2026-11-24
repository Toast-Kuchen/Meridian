'use strict';
const N=48,$=i=>document.getElementById(i),R=['food','wood','stone','tools','coins'],
RI={food:'🌾',wood:'🪵',stone:'🪨',tools:'🔧',coins:'🪙'},RN={food:'Nahrung',wood:'Holz',stone:'Stein',tools:'Werkzeuge',coins:'Münzen'},ST=['','Siedlung','Dorf','Stadt'];
const B={
road:{n:'Weg',i:'🛤️',c:{coins:1},st:1,t:0,flat:1,sz:1,d:'Befestigter Weg, macht den Ort ansehnlicher.'},
well:{n:'Brunnen',i:'⛲',c:{stone:8,coins:5},st:1,t:1,h:10,rh:10,s:.5,sz:1,w:'#9a9a9a',r:'#7a5a35',sat:8,rad:6,d:'Versorgt Wohnhäuser im Umkreis von 3 Feldern.'},
house:{n:'Wohnhaus',i:'🏠',c:{wood:10,coins:5},st:1,t:1,h:20,w:'#dcc9a2',r:'#b04a32',home:4,d:'Fachwerkhaus für 4 Bewohner.'},
farm:{n:'Bauernhof',i:'🌾',c:{wood:15,coins:10},st:1,t:1,h:16,rh:10,w:'#c9a66b',r:'#7a5a35',job:3,prod:{food:8},d:'Baut Getreide an und ernährt die Siedlung.'},
fish:{n:'Fischerhütte',i:'🎣',c:{wood:15,tools:1,coins:10},st:1,t:1,h:16,rh:10,w:'#b59a6e',r:'#4a6a7a',job:2,prod:{food:6},fish:1,need:2,water:1,d:'Pfahlhütte im Wasser am Ufer. Fängt Fischschwärme im Umkreis von 2 Feldern; der Bestand ist endlich.'},
wood:{n:'Holzfäller',i:'🪓',c:{wood:8,coins:5},st:1,t:1,h:14,rh:10,w:'#9c7a4a',r:'#5b4025',job:2,prod:{wood:6},need:1,d:'Fällt Bäume. Braucht Wald in 2 Feldern Umkreis.'},
quarry:{n:'Steinbruch',i:'⛏️',c:{wood:10,tools:2,coins:10},st:1,t:1,h:12,rh:6,w:'#a9a597',r:'#6d6a60',job:3,prod:{stone:4},need:3,d:'Bricht Stein. Braucht Hügel in 2 Feldern Umkreis.'},
smith:{n:'Schmiede',i:'🔨',c:{wood:15,stone:10,coins:20},st:2,t:2,h:20,rh:12,w:'#8d8b88',r:'#4a4a52',job:2,use:{wood:2,stone:1},prod:{tools:2},d:'Macht aus Holz und Stein Werkzeuge.'},
bakery:{n:'Bäckerei',i:'🥖',c:{wood:15,stone:10,coins:20},st:2,t:2,h:20,rh:14,w:'#e3d2ae',r:'#9a4a2c',job:2,use:{food:3},prod:{food:5},d:'Backt Brot: aus 3 Nahrung werden 5.'},
mill:{n:'Mühle',i:'🌬️',c:{wood:20,stone:10,coins:25},st:2,t:2,h:26,rh:14,w:'#e6dcc4',r:'#7a5a35',job:2,use:{food:4},prod:{food:7},d:'Mahlt Getreide: aus 4 Nahrung werden 7.'},
inn:{n:'Gasthaus',i:'🍺',c:{wood:25,stone:15,coins:35},st:2,t:2,h:24,rh:14,w:'#e0cfae',r:'#9a3b2a',job:2,prod:{coins:3},sat:10,rad:8,d:'Treffpunkt: Häuser im Umkreis von 4 Feldern sind zufriedener. Voraussetzung für das Stadthaus.'},
hosp:{n:'Spital',i:'🏥',c:{wood:30,stone:30,coins:50},st:3,t:3,h:26,rh:14,w:'#e9e4d6',r:'#4a7a9a',job:3,sat:8,rad:10,d:'Pflege für Häuser im Umkreis von 5 Feldern; halbiert die Opfer einer Seuche.'},
tower:{n:'Wachturm',i:'🗼',c:{wood:15,stone:20,coins:15},st:1,t:1,h:44,rh:14,s:.6,w:'#b8b2a2',r:'#7a3b2a',job:1,def:4,prot:6,d:'Wachposten verteidigen; Gebäude im Umkreis von 3 Feldern sind vor Plünderung geschützt.'},
guard:{n:'Wachhaus',i:'🛡️',c:{wood:15,stone:15,tools:4,coins:25},st:2,t:2,h:22,rh:14,w:'#a9a597',r:'#4a5a8a',job:3,def:6,gd:6,prot:6,d:'Wachen verteidigen, bilden Expeditionen und schützen Gebäude im Umkreis von 3 Feldern.'},
wall:{n:'Stadtmauer',i:'🧱',c:{stone:6,coins:2},st:1,t:1,h:12,rh:3,s:.9,sz:1,w:'#b5b0a0',r:'#8a8578',def:1,wall:1,prot:4,d:'Je +1 Verteidigung (max. +8) und Schutz vor Plünderung im Umkreis von 2 Feldern.'},
market:{n:'Marktplatz',i:'🧺',c:{wood:20,stone:10,coins:30},st:1,t:1,h:12,rh:16,w:'#d8b46a',r:'#b8382a',job:2,prod:{coins:5},sat:20,rad:8,d:'Bringt Münzen und erlaubt Handel; Häuser im Umkreis von 4 Feldern sind zufriedener.'},
store:{n:'Lagerhaus',i:'📦',c:{wood:25,stone:15},st:2,t:2,h:24,rh:12,w:'#b79566',r:'#6b4a2a',cap:100,d:'Erhöht das Lager aller Rohstoffe um 100.'},
burgher:{n:'Bürgerhaus',i:'🏛️',c:{wood:20,stone:15,coins:20},st:3,t:3,h:32,rh:16,w:'#d3c3a3',r:'#8a3b2a',home:8,d:'Stattliches Haus für 8 Bewohner.'}
};
const hs=(x,y)=>((x*73856093^y*19349663)>>>0)%100/100,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),cost=c=>Object.keys(c).map(k=>RI[k]+c[k]).join(' '),
rnd=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let flat=false,vg=null,shoreC=null,battle=null,zsel=null,S,og=new Map,cam={x:0,y:0,z:.8},mode=null,ghost=null,sel=null,W,H,dpr,opt={sound:1,music:1},WK=[],last=0,toastT,cv=$('c'),g=cv.getContext('2d');
const at=(x,y)=>og.get(y*N+x),idx=()=>{og=new Map;S.bld.forEach(b=>{const z=szd(B[b.id]);for(let j=0;j<z;j++)for(let i=0;i<z;i++)og.set((b.y+j)*N+b.x+i,b)})};
function genMap(){const r=rnd((Math.random()*1e9)|0),p=Array.from({length:8},()=>r()*6),n=(x,y,o)=>Math.sin(x*.45+p[o])+Math.sin(y*.4+p[o+1])+Math.sin((x+y)*.28+p[o+2])+Math.sin((x-y)*.5+p[o+3]),m=[];
 for(let y=0;y<24;y++)for(let x=0;x<24;x++){let t=0;if(n(x,y,0)>1.2)t=1;else if(n(x,y,4)>2.1)t=3;
  if(Math.abs(x-(17+3*Math.sin(y*.35+p[0])))<1.3||Math.hypot(x-4,y-19)<1.6)t=2;if(Math.hypot(x-10,y-10)<3.6)t=0;m.push(t)}
 [[14,12],[14,13],[13,14],[14,14],[15,13],[15,12]].forEach(([x,y])=>m[y*24+x]=1);[[14,8],[15,8],[14,9],[15,9],[15,10]].forEach(([x,y])=>m[y*24+x]=3);const o=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)o.push(m[(y>>1)*24+(x>>1)]);return o}
function newGame(){const cz=[0,1,2,3,5,6,7,8][Math.random()*8|0];S={cz,turn:1,stage:1,pop:6,sat:60,won:0,tax:1,exp:[0,0,0,0,1,0,0,0,0],scout:null,camp:{x:(cz%3)*16+2+(Math.random()*12|0),y:(cz/3|0)*16+2+(Math.random()*12|0)},peace:0,nr:12,raid:null,zones:[0,0,0,0,1,0,0,0,0],res:{food:20,wood:30,stone:6,tools:3,coins:40},map:genMap(),log:['Willkommen in Meridian!'],
 bld:[['store',20,20],['road',20,19],['road',21,19],['house',18,18],['house',22,18],['farm',20,22]].map(([id,x,y])=>({id,x,y,t:0}))};S.rs={};S.map.forEach((m,i)=>{if(m==1)S.rs[i]=10;if(m==3)S.rs[i]=15;if(m==2&&hs((i%N)>>2,((i/N)|0)>>2)<.35)S.rs[i]=10});idx();WK=[];mode=ghost=sel=zsel=null;centerOn(20,20)}
// ---- Wirtschaft ----
const fd=(x1,y1,z1,x2,y2,z2)=>Math.max(0,x2-(x1+z1-1),x1-(x2+z2-1))+Math.max(0,y2-(y1+z1-1),y1-(y2+z2-1)),hm=b=>b.id=='house'?[4,8,12][(b.lv||1)-1]:B[b.id].home||0,svc2=(s,b,id,r)=>s.bld.some(o=>o.id==id&&!o.t&&!o.dmg&&fd(o.x,o.y,szd(B[o.id]),b.x,b.y,szd(B[b.id]))<=r),sk=b=>b.id=='house'&&b.lv>1?(b.lv>2?'town':'burgher'):b.id,D4=[[1,0],[-1,0],[0,1],[0,-1]];
function net(s){const m=new Map,roads=new Set,q=[],ok=new Set,seen=new Set;ok.roads=roads;
 for(const b of s.bld){const z=szd(B[b.id]);for(let j=0;j<z;j++)for(let i=0;i<z;i++)m.set((b.y+j)*N+b.x+i,b)}
 for(const b of s.bld)if(b.id=='store'&&!b.t){const z=szd(B.store);for(let j=0;j<z;j++)for(let i=0;i<z;i++){q.push([b.x+i,b.y+j]);seen.add((b.y+j)*N+b.x+i)}}
 while(q.length){const[x,y]=q.shift();for(const[a,c]of D4){const X=x+a,Y=y+c,k=Y*N+X;if(X<0||Y<0||X>=N||Y>=N||seen.has(k))continue;const o=m.get(k);if(o&&o.id=='road'){seen.add(k);roads.add(k);q.push([X,Y])}}}
 for(const b of s.bld){if(b.id=='road')continue;if(b.id=='store'&&!b.t){ok.add(b);continue}const z=szd(B[b.id]);let f=0;
  for(let j=0;j<z&&!f;j++)for(let i=0;i<z&&!f;i++)for(const[a,c]of D4){const X=b.x+i+a,Y=b.y+j+c;if(X<0||Y<0||X>=N||Y>=N||(X>=b.x&&X<b.x+z&&Y>=b.y&&Y<b.y+z))continue;const k=Y*N+X,o=m.get(k);if(o&&((o.id=='road'&&roads.has(k))||(o.id=='store'&&!o.t))){f=1;break}}
  if(f)ok.add(b)}return ok}
function conn1(x,y,z){const C=net(S);for(let j=0;j<z;j++)for(let i=0;i<z;i++)for(const[a,c]of D4){const X=x+i+a,Y=y+j+c;if(X<0||Y<0||X>=N||Y>=N||(X>=x&&X<x+z&&Y>=y&&Y<y+z))continue;const o=at(X,Y);if(o&&((o.id=='road'&&C.roads.has(Y*N+X))||(o.id=='store'&&!o.t)))return 1}return 0}
function attr(s){const k=stats(s),fj=k.jobs-s.pop,rs=s.pop?s.res.food/(s.pop*.6):9,a=Math.round(s.sat*.5),b=Math.round(cl(fj/Math.max(4,s.pop*.3),-1,1)*15),c=Math.round(rs<1?-10:Math.min(1,rs/3)*20),d=Math.round(Math.min(1,(s.turn-(s.rl==null?-99:s.rl))/8)*15);return{A:a+b+c+d,a,b,c,d}}
function stats(s){const C=net(s);let home=0,jobs=0,cap=20,sb=0;const H=[];for(const b of s.bld){if(b.t>0||b.dmg||!C.has(b))continue;const d=B[b.id];home+=hm(b);jobs+=d.job||0;cap+=d.cap||0;if(d.home)H.push(b)}
 for(const b of s.bld){const d=B[b.id];if(b.t>0||b.dmg||!C.has(b)||!d.sat)continue;if(!d.rad){sb+=d.sat;continue}let c=0;for(const h of H)if(fd(b.x,b.y,szd(d),h.x,h.y,szd(B[h.id]))<=d.rad)c+=hm(h);sb+=home?d.sat*c/home:0}
 return{home,jobs,cap,sb:Math.min(sb,35),wc:home?H.reduce((a,h)=>a+(svc2(s,h,'well',6)?hm(h):0),0)/home:1}}
function tilesNear(s,x,y,m){const o=[];for(let j=-4;j<=5;j++)for(let i=-4;i<=5;i++){const a=x+i,c=y+j;if(fd(x,y,2,a,c,1)<=4&&a>=0&&c>=0&&a<N&&c<N&&s.map[c*N+a]==m&&s.rs[c*N+a]>0)o.push(c*N+a)}return o}
function harvest(s,b,m,a,L,n){let got=0;for(const i of tilesNear(s,b.x,b.y,m)){const t=Math.min(a-got,s.rs[i]);s.rs[i]-=t;got+=t;if(s.rs[i]<=0){if(m!=2)s.map[i]=0;delete s.rs[i]}if(got>=a)break}if(got<a)L.push(n+': Vorkommen in Reichweite erschöpft.');return got}
const EV=[s=>{s.res.food+=10;return'Gute Ernte: +10 Nahrung.'},
 s=>(s.ev='trader','Ein fahrender Händler ist angekommen.'),
 s=>{s.res.coins=Math.max(0,s.res.coins-6);return'Reparaturen am Dorfweg kosten 6 Münzen.'},
 s=>s.pop<stats(s).home?(s.ev='family','Eine Familie bittet um Aufnahme.'):'Reisende ziehen vorbei, es fehlt Wohnraum.'];
function step(s,q){const C=net(s),k=stats(s),L=[],r=s.res,emp=Math.min(s.pop,k.jobs),eff=k.jobs?emp/k.jobs:0,
 pr=s.bld.filter(b=>!b.t&&!b.dmg&&C.has(b)&&B[b.id].prod).sort((a,b)=>!!B[a.id].use-!!B[b.id].use);
 for(const b of pr){const d=B[b.id];if(d.use){if(!Object.keys(d.use).every(x=>r[x]>=d.use[x])){L.push(d.n+': Rohstoffmangel, Produktion ruht.');continue}for(const x in d.use)r[x]-=d.use[x]}for(const x in d.prod){let a=d.prod[x]*eff;if(d.need)a=harvest(s,b,d.need,a,L,d.n);if(d.fish)a/=1+.4*s.bld.filter(o=>o!==b&&o.id=='fish'&&Math.abs(o.x-b.x)+Math.abs(o.y-b.y)<=3).length;r[x]+=a}}
 const need=s.pop*.6,hunger=r.food<need;r.food=Math.max(0,r.food-need);s.fam=hunger?(s.fam||0)+1:0;if(hunger){L.push('Hunger! Die Vorräte reichen nicht.');if(!q){(s.bn=s.bn||[]).push('<h2>🌾 Hungersnot!</h2><p>Die Vorräte sind leer. Noch '+(4-s.fam)+' Periode(n), bis die Stadt zusammenbricht. Baue Bauernhöfe oder kaufe Nahrung am Marktplatz.</p>');if(s.fam>=4)s.lost='Hungersnot'}}
 r.coins=Math.max(0,r.coins+s.pop*[.1,.25,.45][s.tax==null?1:s.tax]+emp-s.bld.filter(b=>!b.t&&B[b.id].job).length-s.bld.filter(b=>!b.t&&B[b.id].home).length*.5);
 const un=s.pop?(s.pop-emp)/s.pop:0,tg=40+k.sb+(hunger?-30:15)+(un>.4?-10:un<.15?5:0)+(s.pop>k.home?-10:0)+(k.wc<.5?-8:0)+[10,0,-14][s.tax==null?1:s.tax];s.sat=cl(s.sat+(tg-s.sat)*.5,0,100);s.unr=s.sat<20?(s.unr||0)+1:0;if(!q&&s.unr>0){(s.bn=s.bn||[]).push('<h2>🔥 Unruhe in der Stadt</h2><p>Die Zufriedenheit liegt unter 20 %. Noch '+(3-s.unr)+' Periode(n) bis zum Aufstand. Senke die Steuern oder baue Markt, Brunnen und Gasthaus.</p>');if(s.unr>=3)s.lost='Aufstand'}
 const free=k.home-s.pop,A=attr(s).A;s.att=A;if(hunger||s.sat<25||A<30)s.pop=Math.max(2,s.pop-1);else if(free>0&&A>=50){const g1=Math.min(free,Math.max(1,Math.ceil(s.pop*.25*(A-40)/40)));s.pop+=g1;L.push('Zuzug: +'+g1+' Einwohner.')}else if(free<0)s.pop=k.home;
 if(!q&&k.wc<.5&&s.pop>=12&&Math.random()<.25){const d=Math.max(1,Math.ceil(s.pop*(s.bld.some(b=>b.id=='hosp'&&!b.t&&!b.dmg)?.05:.1)));s.pop=Math.max(2,s.pop-d);s.sat=Math.max(0,s.sat-8);L.push('Seuche! '+d+' Bewohner sind gestorben.');(s.bn=s.bn||[]).push('<h2>🤒 Seuche!</h2><p>Schlechtes Wasser: '+d+' Bewohner sind gestorben. Baue Brunnen (und ein Spital) bei den Wohnhäusern.</p>')}
 s.bld.forEach(b=>{if(b.t>0&&--b.t==0)L.push(B[b.id].n+' fertiggestellt.')});
 const ns=s.pop>=60?3:s.pop>=25?2:1;if(ns>s.stage){s.stage=ns;L.push('Aufstieg: '+ST[ns]+'! Neue Gebäude verfügbar.')}
 if(s.scout&&--s.scout.left<=0){s.exp[s.scout.z]=1;L.push('Der Erkundungstrupp ist zurück: Gebiet erkundet!'+(s.scout.z==s.cz?' Ihr habt ein Raubritterlager entdeckt!':''));s.scout=null}if(!q)raidTick(s,L);if(!q&&Math.random()<.3)L.push(EV[Math.random()*EV.length|0](s));
 for(const x of R)r[x]=Math.min(k.cap,Math.round(r[x]*10)/10);
 if(!s.won&&s.pop>=100&&s.sat>=60&&r.food>=20&&r.coins>=100){s.won=1;L.push('Meridian ist eine blühende Stadt – Sieg!')}
 s.turn++;if(!q){L.slice().reverse().forEach(l=>s.log.unshift('P'+s.turn+': '+l));s.log.length=Math.min(s.log.length,40)}return L}
const rstr=s=>(4+s.turn*.3+s.pop/15)*Math.min(1,.5+s.turn/40);
function dfn(s,g){const k=stats(s),e=k.jobs?Math.min(s.pop,k.jobs)/k.jobs:0;let a=0,w=0;for(const b of s.bld){if(b.t>0||b.dmg)continue;const d=B[b.id];if(g)a+=d.gd||0;else if(d.wall)w+=d.def;else a+=d.def||0}return g?2*a*Math.max(.5,e):a*Math.max(.5,e)+Math.min(8,w)}
function raidTick(s,L){
 if(s.peace>0){if(--s.peace==0){s.nr=s.turn+4;L.push('Neue Räuber sammeln sich am Kartenrand.')}return}
 if(s.raid){if(--s.raid.left>0){L.push('Räuber nähern sich: noch '+s.raid.left+' Periode(n)!');return}
  const D=dfn(s)+s.raid.merc,A=s.raid.str*(.8+Math.random()*.4);let rep;
  if(D>=A)rep={win:1,cnt:Math.round(s.raid.str/2),from:s.raid.from,txt:'Die Räuber wurden zurückgeschlagen! Verteidigung '+Math.round(D)+' gegen Angriff '+Math.round(A)+'.'};
  else{const f=Math.min(.5,.1+(A-D)/A*.5);for(const x of R)s.res[x]=Math.floor(s.res[x]*(1-f));const c0=s.bld.filter(b=>!b.t&&!b.dmg&&!B[b.id].flat&&!s.bld.some(p=>!p.t&&!p.dmg&&B[p.id].prot&&fd(p.x,p.y,szd(B[p.id]),b.x,b.y,szd(B[b.id]))<=B[p.id].prot));const pri=c0.filter(b=>B[b.id].prod||B[b.id].cap),c=f>.3?pri.concat(c0.filter(b=>!pri.includes(b))):pri;let n=Math.min(c.length,1+Math.floor(f*6));while(n--&&c.length)c.splice(Math.random()*c.length|0,1)[0].dmg=1;s.sat=Math.max(0,s.sat-15);s.rl=s.turn;
   rep={win:0,cnt:Math.round(s.raid.str/2),from:s.raid.from,txt:'Die Räuber plündern '+Math.round(f*100)+'% der Vorräte und beschädigen Gebäude (Reparatur 🪙5 je Gebäude). Verteidigung '+Math.round(D)+' gegen Angriff '+Math.round(A)+'.'}}
  s.rep=rep;s.raid=null;L.push(rep.txt)}
 else if(s.turn>=s.nr){s.raid={str:Math.round(rstr(s)*10)/10,left:2,merc:0};s.raid.from=EDGES(s.raid.str);s.nr=s.turn+7+(Math.random()*4|0);s.alert=1;L.push('Ein Bote meldet Räuber! Ankunft in 2 Perioden.')}}
function raidDlg(){const r=S.raid;dlg(`<h2>⚔️ Sicherheit</h2><p>Verteidigung: <b>${Math.round(dfn(S))}</b>${r?' (+'+r.merc+' Söldner)':''}</p>`+(r?`<p>Herr Stadthalter, Räuber nahen! Stärke etwa ${Math.round(r.str)}, Ankunft in ${r.left} Periode(n).</p><button data-a="mc">Söldner anheuern (🪙40, +6)</button><button data-a="tb">Tribut zahlen (🪙${Math.round(r.str*8)})</button>`:'<p>Derzeit ist kein Angriff gemeldet.</p>')+(S.peace>0?`<p>Das Lager ist zerschlagen. Frieden für ${S.peace} Perioden.</p>`:!S.exp[S.cz]?'<p>Der Standort der Räuber ist unbekannt. Erkunde die Randgebiete (🔭), um ihr Lager zu finden.</p>':`<p>Expedition: Wachenstärke ${Math.round(dfn(S,1))} gegen Lager etwa ${Math.round(rstr(S)*2.5)}.</p><button data-a="ex">Expedition gegen das Lager (🔧10 🪙40)</button>`))}
function expedition(){if(!S.exp[S.cz])return;const need=rstr(S)*2.5,pw=dfn(S,1);if(S.res.coins<40||S.res.tools<10)return toast('Benötigt 🔧10 und 🪙40.');S.res.coins-=40;S.res.tools-=10;$('dlg').hidden=true;const win=pw>=need*(.8+Math.random()*.4);
 if(win){S.peace=20;S.raid=null;S.log.unshift('Das Raubritterlager wurde zerschlagen.')}else{S.sat=Math.max(0,S.sat-5);S.log.unshift('Die Expedition scheiterte.')}
 battle={t:0,sp:'ally',src:[townC()],dst:S.camp,r:{cnt:4,title:win?'⚔️ Lager zerschlagen':'Expedition gescheitert',txt:(win?'Deine Wachen haben das Lager zerstört. Eine Weile herrscht Frieden.':'Deine Wachen waren zu schwach. Baue mehr Wachhäuser.')+' Wachenstärke '+Math.round(pw)+' gegen Lager etwa '+Math.round(need)+'.'}};after()}
$('rd').onclick=raidDlg;$('wn').onclick=()=>dlg('<h2>⚠ Aufgaben</h2>'+S.bld.filter(b=>b.pr).map(b=>`<button data-a="go:${S.bld.indexOf(b)}">${B[b.id].i} ${B[b.id].n}: ${b.pr}</button>`).join(''));
const SC={coins:15,food:6},TRD='Handel:<br>'+[['wood','🪙20 → 🪵10'],['stone','🪙24 → 🪨10'],['food','🪙15 → 🌾10'],['tools','🪙30 → 🔧5']].map(([k,l])=>`<button data-a="tr:${k}" style="background:#2f4a2a">${l}</button>`).join('')+'<br>';
function scoutable(i){const x=i%3,y=i/3|0;return!S.exp[i]&&!S.scout&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X=x+a,Y=y+b;return X>=0&&X<3&&Y>=0&&Y<3&&S.exp[Y*3+X]})}
function scoutZone(i){if(!scoutable(i))return toast('Hier ist keine Erkundung möglich.');for(const k in SC)if(S.res[k]<SC[k])return toast('Zu wenig '+RN[k]);for(const k in SC)S.res[k]-=SC[k];S.scout={z:i,left:1};zsel=null;sfx('click');toast('Der Erkundungstrupp ist unterwegs.');after()}
function trade(k){const t={wood:[20,10],stone:[24,10],food:[15,10],tools:[30,5]}[k];if(S.res.coins>=t[0]){S.res.coins-=t[0];S.res[k]=Math.min(stats(S).cap,S.res[k]+t[1]);sfx('click');after()}else toast('Zu wenig Münzen.')}
const WC=Array.from({length:8},(_,i)=>`hsl(205,45%,${44+i*.9}%)`),TC={};
function tcol(m,x,y){const k=m*1e4+y*N+x,h=hs(x,y);return TC[k]||(TC[k]=m==9?`hsl(98,14%,${24+h*5}%)`:m==1?`hsl(100,30%,${30+h*6}%)`:m==3?`hsl(40,12%,${52+h*8}%)`:`hsl(${82+h*12},34%,${44+h*7}%)`)}
function fog(){const z=cam.z;for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(S.exp[zoneOf(x,y)])continue;const[cx,cy]=P(x,y);if(cx<-40*z||cx>W+40*z||cy<-30*z||cy>H+30*z)continue;dia(cx,cy,1.04,tcol(9,x,y))}}
const zoneOf=(x,y)=>(y>>4)*3+(x>>4);
function zinfo(i){const n=S.zones.filter(Boolean).length,c={coins:30*n,wood:15*n,stone:10*n},zx=i%3,zy=i/3|0,
 adj=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X=zx+a,Y=zy+b;return X>=0&&X<3&&Y>=0&&Y<3&&S.zones[Y*3+X]}),need=n>=6?3:n>=3?2:1;let w='';
 if(!S.exp[i])w='Erst erkunden';else if(!adj)w='Nur angrenzende Gebiete erschließbar';else if(need>S.stage)w='Erst ab Stufe '+ST[need];else for(const r in c)if(S.res[r]<c[r]){w='Zu wenig '+RN[r];break}return{c,w}}
function buyZone(i){const z=zinfo(i);if(z.w)return toast(z.w);for(const k in z.c)S.res[k]-=z.c[k];S.zones[i]=1;zsel=null;sfx('build');toast('Neues Gebiet erschlossen!');after()}
// ---- Bauen ----
const near=(x,y,m)=>{for(let j=-4;j<=5;j++)for(let i=-4;i<=5;i++){const a=x+i,b=y+j;if(fd(x,y,2,a,b,1)<=4&&a>=0&&b>=0&&a<N&&b<N&&S.map[b*N+a]==m)return 1}return 0};
function why(id,x,y){const d=B[id],z=szd(d);for(let j=0;j<z;j++)for(let i=0;i<z;i++)if(x+i<0||y+j<0||x+i>=N||y+j>=N)return'Außerhalb der Karte';
 if(d.st>S.stage)return'Noch gesperrt';
 for(let j=0;j<z;j++)for(let i=0;i<z;i++){const a=x+i,b=y+j;if(!S.zones[zoneOf(a,b)])return'Gebiet noch nicht erschlossen';const m=S.map[b*N+a];if(d.water?m!=2:m)return d.water?'Nur auf Wasser baubar':'Nur auf freier Wiese baubar';if(at(a,b))return'Feld ist belegt'}
 if(d.water){let u=0;for(let j=-1;j<=z;j++)for(let i=-1;i<=z;i++){if(i>=0&&i<z&&j>=0&&j<z)continue;const a=x+i,b=y+j;if(a>=0&&b>=0&&a<N&&b<N&&S.map[b*N+a]!=2)u=1}if(!u)return'Braucht Ufer in der Nähe'}
 if(d.need&&!(d.need==2?tilesNear(S,x,y,2).length:near(x,y,d.need)))return d.need==1?'Braucht Wald in der Nähe':d.need==2?'Braucht Fischgründe in der Nähe':'Braucht Hügel in der Nähe';
 for(const k in d.c)if(S.res[k]<d.c[k])return'Zu wenig '+RN[k];return''}
function build(id,x,y){const d=B[id];for(const k in d.c)S.res[k]-=d.c[k];S.bld.push({id,x,y,t:d.t});idx();sfx('build');if(id!='road'&&id!='wall')mode=ghost=null;after()}
function demolish(b){const d=B[b.id];for(const k in d.c)S.res[k]+=Math.floor(d.c[k]/2);S.bld=S.bld.filter(x=>x!==b);idx();sel=null;sfx('click');after()}
function after(){ui();save()}
function nextTurn(){if(S.lost)return toast('Das Spiel ist verloren – starte über ☰ ein neues Spiel.');const st0=S.stage,L=step(S);if(S.rep){battle={t:0,r:S.rep,sp:'raider',src:S.rep.from,dst:townC()};S.rep=null}sfx('bell',.4);toast(L.length?L.join(' '):'Eine ruhige Periode.');after();if(S.won&&!S.shown){S.shown=1;banner('<h2>🏆 Sieg!</h2><p>Deine Siedlung ist zur blühenden Stadt gewachsen. Du kannst weiterspielen.</p>')}(S.bn||[]).splice(0).forEach(banner);if(S.lost&&!S.lostShown){S.lostShown=1;banner('<h2>💀 Niederlage: '+S.lost+'</h2><p>Deine Stadt ist untergegangen. Beginne eine neue Siedlung.</p><button data-a="nw">Neues Spiel</button>')}if(S.ev){const e=S.ev;S.ev=null;banner(e=='trader'?'<h2>🧺 Fahrender Händler</h2><p>Ein Händler bietet 15 Holz für 10 Münzen an.</p><button data-a="ev:t">Kaufen (🪙10)</button><button data-a="ev:x">Ablehnen</button>':'<h2>👨‍👩‍👧 Reisende</h2><p>Eine Familie bittet um Aufnahme. Sie braucht 5 Nahrung für die Ankunft.</p><button data-a="ev:f">Aufnehmen (🌾5)</button><button data-a="ev:x">Abweisen</button>',1)}if(S.stage>st0)banner('<h2>🏘️ Aufstieg: '+ST[S.stage]+'!</h2><p>Eure Siedlung ist gewachsen. Neue Gebäude stehen zur Verfügung.</p>');if(S.alert){S.alert=0;banner('<h2>⚔️ Räuber nahen!</h2><p>Herr Stadthalter, ein Bote meldet Räuber. Ankunft in 2 Perioden, Stärke etwa '+Math.round(S.raid.str)+'. Bereite die Verteidigung vor: Über ⚔️ kannst du Söldner anheuern oder Tribut zahlen.</p>')}}
// ---- UI ----
function toast(t){const m=$('msg');m.textContent=t;m.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>m.hidden=true,4500)}
function ui(){const k=stats(S),c=JSON.parse(JSON.stringify(S));step(c,1);const sd=Math.round((c.sat-S.sat)*10)/10;
 $('top').innerHTML=R.map(x=>{const d=Math.round((c.res[x]-S.res[x])*10)/10;return`<div class=ch>${RI[x]} ${Math.floor(S.res[x])}<i class="${d>=0?'up':'dn'}">${d>=0?'+':''}${d}</i></div>`}).join('')+
 `<div class=ch>👥 ${S.pop}/${k.home}<i>Arbeit ${Math.min(S.pop,k.jobs)}/${k.jobs} · ⭐${attr(S).A}</i></div><div class=ch>😊 ${Math.round(S.sat)}%<i class="${sd>=0?'up':'dn'}">${sd>=0?'+':''}${sd}</i></div><div class=ch>🛡️ ${Math.round(dfn(S))}${S.raid?'<i>⚔️ '+Math.round(S.raid.str)+' in '+S.raid.left+'</i>':''}</div><div class=ch>🏘️ ${ST[S.stage]}<i>Ziel ${S.pop}/100</i></div>`;
 {const C=net(S);S.bld.forEach(b=>b.pr=b.t?'':b.dmg?'beschädigt':(B[b.id].need&&!tilesNear(S,b.x,b.y,B[b.id].need).length)?'keine Vorkommen mehr':(b.id!='road'&&!C.has(b))?'keine Straßenanbindung':'')}const np=S.bld.filter(b=>b.pr).length;$('wn').hidden=!np;$('wn').textContent='⚠ '+np;$('rd').textContent='⚔️'+(S.raid?' '+S.raid.left:'');$('nx').textContent='▶ Periode '+S.turn+' beenden';bar();info()}
const CAT={'Rohstoffe':['wood','quarry','smith'],'Versorgung':['farm','fish','mill','bakery'],'Wohnen':['house','well','inn','hosp'],'Infrastruktur':['road','store','market'],'Militär':['tower','guard','wall']};let tab='Rohstoffe';
function bar(){$('tabs').innerHTML=Object.keys(CAT).map(k=>`<button data-t="${k}" class="${k==tab?'on':''}">${k}</button>`).join('');
 $('bl').innerHTML=CAT[tab].map(id=>{const d=B[id],lk=d.st>S.stage,no=!lk&&Object.keys(d.c).some(k=>S.res[k]<d.c[k]);return`<button class="b${lk?' lk':''}${no?' no':''}${mode==id?' on':''}" data-id="${id}">${lk?'🔒':d.i}<small>${d.n}</small><small>${Object.keys(d.c).map(k=>`<span class="${S.res[k]<d.c[k]?'r':''}">${RI[k]}${d.c[k]}</span>`).join(' ')}</small></button>`}).join('')}
$('tabs').onclick=e=>{const k=e.target.dataset.t;if(k){tab=k;bar()}};
const eff=d=>(d.home?'🏠 '+d.home+' Plätze · ':'')+(d.job?'👷 '+d.job+' Jobs · ':'')+(d.use?'Verbraucht '+cost(d.use)+' · ':'')+(d.prod?'Erzeugt '+cost(d.prod)+' · ':'')+(d.sat?'😊 +'+d.sat+' · ':'')+(d.cap?'📦 +'+d.cap+' · ':'')+(d.def?'🛡️ +'+d.def+' · ':'');
function info(){const e=$('info');let h='';
 if(mode=='road')h=roadPanel();
 else if(mode){const d=B[mode],w=ghost?why(mode,ghost[0],ghost[1]):'';h=`<b>${d.i} ${d.n}</b> – ${d.d}<br>Kosten ${cost(d.c)} · Bau ${d.t} Periode(n)<br>${eff(d)}<br>${ghost?rinfo(mode,ghost[0],ghost[1]):''}${ghost&&mode!='road'&&mode!='store'&&!conn1(ghost[0],ghost[1],szd(B[mode]))?'⚠ Noch ohne Straßenanbindung<br>':''}${ghost?(w?'⛔ '+w:'✅ Nochmal auf dasselbe Feld tippen zum Bauen'):''}`}
 else if(zsel!=null&&!S.exp[zsel]){const ok=scoutable(zsel);h=`<b>🔭 Unerforschtes Gebiet</b><br>${S.scout?'Ein Trupp ist bereits unterwegs.':ok?'Ein Erkundungstrupp deckt es in 1 Periode auf. Kosten '+cost(SC):'Nur an erkundete Gebiete angrenzende Gebiete lassen sich erkunden.'}<br>${ok?'<button data-a="sc">Trupp entsenden</button>':''}`}
 else if(zsel!=null){const z=zinfo(zsel);h=`<b>🗝️ Neues Baugebiet</b><br>Kosten ${cost(z.c)}<br>${z.w?'⛔ '+z.w:'✅ Erschließbar'}<br><button data-a="bz">Erschließen</button>`}
 else if(sel){const d=B[sel.id];h=`<b>${d.i} ${d.n}</b> – ${d.d}<br>${eff(d)}<br>${rinfo(sel.id,sel.x,sel.y)}Status: ${sel.dmg?'🔥 Beschädigt'+(d.home?' (Wohnraum fällt aus)':' (Produktion steht still)'):sel.t>0?'Im Bau, noch '+sel.t+' Periode(n)':'in Betrieb'}<br>${sel.id=='house'&&!sel.t?hinfo(sel):''}${sel.id=='market'&&!sel.t&&!sel.dmg?TRD:''}${sel.dmg?'<button data-a="rp" style="background:#2f4a2a">Reparieren (🪙5)</button>':''}<button data-a="dm">Abreißen (50% Rückerstattung)</button>`}
 e.innerHTML=h?h+'<button class="x" data-a="x">✕</button>':h;e.hidden=!h}
const dq=[];function banner(h,nc){if($('dlg').hidden)dlg(h,nc);else dq.push([h,nc])}
function dq2(){const q=dq.shift();dlg(q[0],q[1])}
function dlg(h,nc){$('dlg').innerHTML=`<div class=bx>${h}${nc?'':'<button data-a="cl">Schließen</button>'}</div>`;$('dlg').hidden=false}
const HELP='<h2>So wird gespielt</h2><p>Du bist der Stadthalter von Meridian. Jedes Gebäude braucht eine Straße (🛤️) zum Lagerhaus, sonst arbeitet es nicht. Wohnhäuser wertest du mit Brunnen, Markt und Gasthaus auf. Räuber bedrohen die Stadt: Türme, Wachhäuser und Mauern schützen dich – nur wenn sie siegen, plündern sie. Das ⚔️-Symbol zeigt die Lage.<br><br>1. Wähle unten ein Gebäude, tippe aufs Feld, tippe nochmal zum Bauen.<br>2. „Periode beenden“ lässt die Wirtschaft laufen: Produktion, Essen, Steuern, Wachstum.<br>3. Die kleinen Zahlen oben zeigen die erwartete Änderung.<br>4. Ziehen = Karte bewegen, zwei Finger = Zoomen.<br><br>Ziel: 100 Einwohner, 60% Zufriedenheit, Nahrung ≥ 20, Münzen ≥ 100. Dunkle Gebiete (🗝️) schaltest du per Tipp frei. Unbekannte Gebiete (❓) deckst du per Erkundungstrupp (🔭) auf, dort findest du auch das Räuberlager. Wald und Hügel sind endlich; Rohstoffe kaufst du am Marktplatz (antippen). Fischerboote stehen am Ufer auf dem Wasser. Ohne Nahrung und Jobs sinkt die Zufriedenheit – du kannst dich jederzeit erholen.</p>';
function menu(){const att=attr(S),k=stats(S),e=Math.min(S.pop,k.jobs);dlg(`<h2>Meridian</h2><p>Periode ${S.turn} · ${ST[S.stage]} · Einwohner ${S.pop} · Beschäftigte ${e} · Arbeitslosenquote ${S.pop?Math.round((S.pop-e)/S.pop*100):0}% · Zufriedenheit ${Math.round(S.sat)}%</p><p>Attraktivität (Zuzug ab 50): <b>${att.A}</b> = Zufriedenheit ${att.a} + Arbeit ${att.b} + Nahrung ${att.c} + Sicherheit ${att.d}</p>
<button data-a="sv">💾 Speichern</button><button data-a="nw">🆕 Neues Spiel</button><button data-a="tx">💰 Steuern: ${['Niedrig (+Zufriedenheit, wenig Münzen)','Normal','Hoch (viel Münzen, −Zufriedenheit)'][S.tax==null?1:S.tax]}</button><button data-a="so">🔊 Ton: ${opt.sound?'an':'aus'}</button><button data-a="mu">🎵 Musik: ${opt.music?'an':'aus'}</button><button data-a="hp">❓ Anleitung</button><h3>Ereignisse</h3><div class=lg>${S.log.slice(0,12).join('<br>')}</div>`)}
$('dlg').onclick=e=>{const a=e.target.dataset.a;if(!a)return;if(a=='cl'){$('dlg').hidden=true;if(dq.length)dq2()}
 else if(a=='sv'){put('save',{v:8,S,opt}).then(()=>toast('Gespeichert.'));$('dlg').hidden=true}
 else if(a=='nw'){if(confirm('Neues Spiel beginnen? Der alte Stand geht verloren.')){newGame();after();$('dlg').hidden=true}}
 else if(a=='tx'){S.tax=((S.tax==null?1:S.tax)+1)%3;after();menu()}else if(a=='so'){opt.sound^=1;save();menu()}else if(a=='mu'){opt.music^=1;amb();save();menu()}else if(a.startsWith('ev:')){if(a=='ev:t'){if(S.res.coins>=10){S.res.coins-=10;S.res.wood+=15}else toast('Zu wenig Münzen.')}else if(a=='ev:f'){if(S.res.food>=5&&S.pop<stats(S).home){S.res.food-=5;S.pop++}else toast('Nicht möglich: Nahrung oder Wohnraum fehlt.')}$('dlg').hidden=true;if(dq.length)dq2();after()}
 else if(a.startsWith('go:')){const b=S.bld[+a.slice(3)];if(b){$('dlg').hidden=true;sel=b;mode=ghost=zsel=null;centerOn(b.x,b.y);info()}}else if(a=='hp')dlg(HELP);else if(a=='mc'){if(S.raid&&S.res.coins>=40){S.res.coins-=40;S.raid.merc+=6;sfx('click');after();raidDlg()}else toast('Zu wenig Münzen.')}
 else if(a=='tb'&&S.raid){const c=Math.round(S.raid.str*8);if(S.res.coins>=c){S.res.coins-=c;S.raid=null;S.log.unshift('Tribut gezahlt, die Räuber ziehen ab.');after();raidDlg()}else toast('Zu wenig Münzen.')}else if(a=='ex')expedition();else if(a.startsWith('tr:')){const k=a.slice(3),t={wood:[20,10],stone:[24,10],food:[15,10],tools:[30,5]}[k];if(S.res.coins>=t[0]){S.res.coins-=t[0];S.res[k]+=t[1];sfx('click');after();menu()}else toast('Zu wenig Münzen.')}};
$('info').onclick=e=>{const a=e.target.dataset.a;if(a=='x'){mode=ghost=sel=zsel=null;rp={a:null,b:null,f:0}}else if(a&&a.startsWith('tr:'))trade(a.slice(3));else if(a=='sc'&&zsel!=null)scoutZone(zsel);else if(a=='bz'&&zsel!=null)buyZone(zsel);else if(a=='dm'&&sel)demolish(sel);else if(a=='ok'&&mode&&ghost&&!why(mode,ghost[0],ghost[1]))build(mode,ghost[0],ghost[1]);else if(a=='rb')buildRoad();else if(a=='rf')rp.f^=1;else if(a=='rr')rp={a:null,b:null,f:0};else if(a=='up'&&sel)upgrade(sel);else if(a=='rp'&&sel&&sel.dmg&&S.res.coins>=5){S.res.coins-=5;sel.dmg=0;sfx('build');after()}ui()};
$('bl').onclick=e=>{const b=e.target.closest('.b');if(!b)return;const id=b.dataset.id;if(B[id].st>S.stage)return toast('Freigeschaltet ab: '+ST[B[id].st]);sfx('click');mode=mode==id?null:id;ghost=sel=zsel=null;rp={a:null,b:null,f:0};ui()};
$('nx').onclick=nextTurn;$('mn').onclick=menu;
$('zoom').onclick=e=>{const z=e.target.dataset.z;if(z==null)return;if(z=='p'){flat=!flat;return}if(z==0)centerOn(20,20);else zoomAt(W/2,H/2,z>0?1.25:.8)};
// ---- Kamera / Eingabe ----
const P=(x,y)=>[(x-y)*16*cam.z+cam.x,((x+y)*8+8)*cam.z+cam.y];
function clamp(){const z=cam.z;cam.x=cl(cam.x,W/2-600*z,W/2+600*z);cam.y=cl(cam.y+384*z,H/2-300*z,H/2+300*z)-384*z}
function centerOn(x,y){cam.x=W/2-(x-y)*16*cam.z;cam.y=H/2-((x+y)*8+8)*cam.z;clamp()}
function zoomAt(px,py,f){const z=cl(cam.z*f,.45,2.2),k=z/cam.z;cam.x=px-(px-cam.x)*k;cam.y=py-(py-cam.y)*k;cam.z=z;clamp()}
const pick=(px,py)=>{const u=(px-cam.x)/cam.z,v=(py-cam.y)/cam.z-8;return[Math.round((u/16+v/8)/2),Math.round((v/8-u/16)/2)]};
const ptr=new Map();let moved=0,multi=0;
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptr.size==1)moved=multi=0;else multi=1;unlock()};
cv.onpointermove=e=>{const p=ptr.get(e.pointerId);if(!p)return;
 if(ptr.size==1){cam.x+=e.clientX-p.x;cam.y+=e.clientY-p.y;moved+=Math.abs(e.clientX-p.x)+Math.abs(e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;clamp()}
 else if(ptr.size==2){const a=[...ptr.values()],d0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);p.x=e.clientX;p.y=e.clientY;const d1=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(d0>10)zoomAt((a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2,d1/d0)}};
cv.onpointerup=cv.onpointercancel=e=>{const had=ptr.delete(e.pointerId);if(had&&e.type=='pointerup'&&!multi&&moved<10)tap(e.clientX,e.clientY)};
cv.onlostpointercapture=e=>ptr.delete(e.pointerId);
function tap(px,py){let[x,y]=pick(px,mode&&szd(B[mode])==2?py-8*cam.z:py);
 if(mode=='road'){if(!rp.a)rp.a=[x,y];else rp.b=[x,y];info()}
 else if(mode){if(ghost&&ghost[0]==x&&ghost[1]==y&&!why(mode,x,y))build(mode,x,y);else{ghost=[x,y];info();const w=why(mode,x,y);if(w)toast(w)}}
 else{const b=hitB(px,py)||at(x,y);sel=b||null;zsel=!b&&x>=0&&y>=0&&x<N&&y<N&&!S.zones[zoneOf(x,y)]?zoneOf(x,y):null;sfx('click',.3);info()}}
document.addEventListener('gesturestart',e=>e.preventDefault());
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr}
addEventListener('resize',()=>{resize();clamp()});
// ---- Rendering ----
function dp(cx,cy,k){const z=cam.z;g.beginPath();g.moveTo(cx,cy-8*z*k);g.lineTo(cx+16*z*k,cy);g.lineTo(cx,cy+8*z*k);g.lineTo(cx-16*z*k,cy);g.closePath()}
const dia=(cx,cy,k,c)=>{dp(cx,cy,k);g.fillStyle=c;g.fill()},poly=(a,c)=>{g.beginPath();a.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=c;g.fill()};
function tree(cx,cy,s){const z=cam.z*s;g.fillStyle='#5a3d22';g.fillRect(cx-1.5*z,cy-8*z,3*z,9*z);g.fillStyle='#3d6a33';g.beginPath();g.arc(cx,cy-14*z,8*z,0,7);g.fill();g.fillStyle='#5a8c42';g.beginPath();g.arc(cx-2*z,cy-16*z,4.5*z,0,7);g.fill()}
function treeSpr(i,x,y,sc){const c=SPR['tree'+(i%3)],z=cam.z*sc;if(c)g.drawImage(c,x-20*z,y-50*z,40*z,56*z);else tree(x,y,sc)}
function spr(c,cx,cy,a,sc=1){const z=cam.z*sc;g.globalAlpha=a;g.drawImage(c,cx-40*z,cy-84*z,80*z,110*z);g.globalAlpha=1}
function gd(x,y,m,h,cx,cy){if(m||h>.25||at(x,y))return;const c=SPR[h<.1?'flower':'tuft'],z=cam.z;if(c)g.drawImage(c,cx+(h*24-8)*z,cy+(h*14-4)*z,12*z,7.5*z)}
function shoreLines(){if(shoreC&&shoreC.m===S.map)return shoreC.l;const E=[],adj=new Map,add=(a,b)=>{const i=E.length;E.push([a,b,0]);for(const k of[a,b]){const q=k[0]+','+k[1];(adj.get(q)||adj.set(q,[]).get(q)).push(i)}};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(S.map[y*N+x]!=2)continue;[[1,0,[x+1,y],[x+1,y+1]],[0,1,[x+1,y+1],[x,y+1]],[-1,0,[x,y+1],[x,y]],[0,-1,[x,y],[x+1,y]]].forEach(([a,b,p,q])=>{const nx=x+a,ny=y+b;if(nx>=0&&ny>=0&&nx<N&&ny<N&&S.map[ny*N+nx]!=2)add(p,q)})}
 const L=[];for(let i=0;i<E.length;i++){if(E[i][2])continue;E[i][2]=1;const ch=[E[i][0],E[i][1]];
  for(const dir of[0,1])for(;;){const e=dir?ch[ch.length-1]:ch[0],j=adj.get(e[0]+','+e[1]).find(k=>!E[k][2]);if(j==null)break;E[j][2]=1;const o=E[j][0][0]==e[0]&&E[j][0][1]==e[1]?E[j][1]:E[j][0];dir?ch.push(o):ch.unshift(o)}
  L.push(ch)}shoreC={m:S.map,l:L};return L}
function shoreDraw(){const z=cam.z;g.lineJoin=g.lineCap='round';
 for(const ch of shoreLines()){const p=ch.map(([a,b])=>[(a-b)*16*z+cam.x,(a+b)*8*z+cam.y]);if(!p.some(q=>q[0]>-60&&q[0]<W+60&&q[1]>-60&&q[1]<H+60))continue;
  g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length-1;i++)g.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);g.lineTo(p[p.length-1][0],p[p.length-1][1]);
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=5*z;g.stroke();g.strokeStyle='#e6d49a';g.lineWidth=2.4*z;g.stroke()}}
function rangeFx(x,y,id){const d=B[id],r=d.need?4:d.rad||d.prot||0;if(!r)return;const z=cam.z;
 const sz=szd(d);for(let j=-r;j<=r+sz-1;j++)for(let i=-r;i<=r+sz-1;i++){const a=x+i,b=y+j;if(fd(x,y,sz,a,b,1)>r)continue;if(a<0||b<0||a>=N||b>=N)continue;const[cx,cy]=P(a,b),hit=(d.need&&S.map[b*N+a]==d.need&&S.rs[b*N+a]>0)||(d.fw&&S.map[b*N+a]==2),bb=at(a,b),hom=(d.rad&&bb&&B[bb.id].home)||(d.prot&&bb&&!B[bb.id].flat);
  dia(cx,cy,1,hit?'rgba(120,230,90,.55)':hom?'rgba(255,225,90,.55)':'rgba(255,225,120,.24)');dp(cx,cy,1);g.strokeStyle='rgba(255,240,160,.8)';g.lineWidth=1.2*z;g.stroke()}}
function rinfo(id,x,y){const d=B[id],sz=szd(d);if(d.need)return'Vorkommen in Reichweite (grün): '+Math.floor(tilesNear(S,x,y,d.need).reduce((a,i)=>a+S.rs[i],0))+'<br>';
 if(d.prot){let c=0;for(const o of S.bld)if(!B[o.id].flat&&!(o.x==x&&o.y==y)&&fd(x,y,sz,o.x,o.y,szd(B[o.id]))<=d.prot)c++;return'Schützt '+c+' Gebäude vor Plünderung (gelb)<br>'}
 if(d.rad){let c=0;for(const b of S.bld)if(!b.t&&B[b.id].home&&fd(x,y,sz,b.x,b.y,szd(B[b.id]))<=d.rad)c+=hm(b);return'Versorgt '+c+' Wohnplätze im Umkreis (gelb)<br>'}return''}
function townC(){let a=0,b=0;S.bld.forEach(o=>{a+=o.x;b+=o.y});const n=S.bld.length||1;return{x:a/n,y:b/n}}
function EDGES(st){const k=1+(st>8)+(st>16);return[0,1,2,3].sort(()=>Math.random()-.5).slice(0,k).map(e=>{const p=Math.random()*(N-1)|0;return[{x:p,y:0},{x:p,y:N-1},{x:0,y:p},{x:N-1,y:p}][e]})}
const UPC={1:{wood:20,stone:15,coins:20},2:{wood:30,stone:25,coins:40}};
function hneeds(b){return{w:svc2(S,b,'well',6),m:svc2(S,b,'market',8),i:svc2(S,b,'inn',8)}}
function hinfo(b){const n=hneeds(b),lv=b.lv||1;return`Stufe ${lv}: ${['Wohnhaus','Bürgerhaus','Stadthaus'][lv-1]} (${hm(b)} Plätze)<br>${n.w?'✅':'❌'} 💧 Brunnen · ${n.m?'✅':'❌'} 🧺 Markt · ${n.i?'✅':'❌'} 🍺 Gasthaus<br>`+(lv<3?`<button data-a="up" style="background:#2f4a2a">Aufwerten (${cost(UPC[lv])})</button><br>`:'')}
function upgrade(b){const lv=b.lv||1,n=hneeds(b);if(lv>=3)return;if(!(n.w&&n.m&&(lv==1||n.i)))return toast('Bedingungen noch nicht erfüllt.');if(S.stage<lv+1)return toast('Erst ab Stufe '+ST[lv+1]);const c=UPC[lv];for(const k in c)if(S.res[k]<c[k])return toast('Zu wenig '+RN[k]);for(const k in c)S.res[k]-=c[k];b.lv=lv+1;sfx('build');toast('Haus aufgewertet!');after()}
const szd=d=>d.sz||2,scd=d=>d.sz==1?(d.flat?.5:.6):1;
function cen(x,y,d){const[a,b]=P(x,y);return szd(d)==2?[a,b+8*cam.z]:[a,b]}
let rp={a:null,b:null,f:0};
function rpath(a,b,f){const o=[];let[x,y]=a;const sx=Math.sign(b[0]-x),sy=Math.sign(b[1]-y),H=()=>{while(x!=b[0]){o.push([x,y]);x+=sx}},V=()=>{while(y!=b[1]){o.push([x,y]);y+=sy}};f?(V(),H()):(H(),V());o.push([b[0],b[1]]);return o}
const rcells=()=>rp.a&&rp.b?rpath(rp.a,rp.b,rp.f):rp.a?[rp.a]:[];
function buildRoad(){let n=0;for(const[x,y]of rcells())if(!why('road',x,y)){S.res.coins-=B.road.c.coins;S.bld.push({id:'road',x,y,t:0});idx();n++}if(n){sfx('build');rp={a:null,b:null,f:0};after()}else toast('Hier kann kein Weg gebaut werden.')}
function roadPanel(){const c=rcells(),ok=Math.min(c.filter(([x,y])=>!why('road',x,y)).length,Math.floor(S.res.coins));let t='<b>🛤️ Weg</b> – verbindet Gebäude mit dem Lagerhaus. 🪙1 je Feld.<br>';
 t+=!rp.a?'Tippe auf den <b>Startpunkt</b>.':!rp.b?'Tippe auf den <b>Endpunkt</b>.':ok+' Felder baubar · 🪙'+ok+(c.length-ok>0?' · '+(c.length-ok)+' nicht baubar':'')+'<br>Tippe erneut, um den Endpunkt zu verschieben.';
 return t+'<br>'+(rp.b&&ok?'<button data-a="rb" style="background:#2f6a2a">✔ Bauen</button>':'')+(rp.b?'<button data-a="rf" style="background:#2f4a2a">↻ Ecke</button>':'')+(rp.a?'<button data-a="rr" style="background:#2f4a2a">Neu</button>':'')}
function rectHit(px,py,x,y,d){const z=cam.z*scd(d),[cx,cy]=cen(x,y,d),top=d.flat?16:d.h+(d.rh||0)+10;return Math.abs(px-cx)<=26*z*(d.s||1)+4*z&&py>=cy-top*z&&py<=cy+14*z}
function hitB(px,py){if(flat)return null;let best=null;for(const b of S.bld){const c=SPR[sk(b)],d=B[b.id];let hit=0;
  if(!c)hit=rectHit(px,py,b.x,b.y,d);
  else{const z=cam.z*scd(d),[cx,cy]=cen(b.x,b.y,d),u=((px-(cx-40*z))/z*c.width/80)|0,v=((py-(cy-84*z))/z*c.height/110)|0;
   if(u>=0&&v>=0&&u<c.width&&v<c.height){try{hit=c.getContext('2d').getImageData(u,v,1,1).data[3]>30}catch(e){hit=rectHit(px,py,b.x,b.y,d)}}}
  if(hit&&(!best||b.x+b.y>best.x+best.y))best=b}return best}
function wat(t){const z=cam.z*.5,E=[[1,0,32,0,0,16],[0,1,0,16,-32,0],[-1,0,-32,0,0,-16],[0,-1,0,-16,32,0]];g.lineCap='round';
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(S.map[y*N+x]!=2)continue;const[cx,cy]=P(x,y);if(cx<-40*z||cx>W+40*z||cy<-30*z||cy>H+30*z)continue;
  const o=Math.sin(t*1.2+x*2+y)*4*z;g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.2*z;g.beginPath();g.moveTo(cx-8*z+o,cy-2*z);g.lineTo(cx+2*z+o,cy-2*z);g.moveTo(cx-2*z-o,cy+5*z);g.lineTo(cx+8*z-o,cy+5*z);g.stroke();
  if(S.rs[y*N+x]>0){g.fillStyle='rgba(235,245,255,.8)';for(let k=0;k<1;k++){const fx=cx+(k*9)*z+Math.sin(t+k+x)*3*z,fy=cy+(k%2?4:-3)*z;g.beginPath();g.ellipse(fx,fy,3*z,1.4*z,0,0,7);g.fill();g.beginPath();g.moveTo(fx-3*z,fy);g.lineTo(fx-5.5*z,fy-1.6*z);g.lineTo(fx-5.5*z,fy+1.6*z);g.fill()}}}shoreDraw()}
function fx(b,cx,cy){const z=cam.z,t=performance.now()/1000,m=SM[b.id];if(m)for(let i=0;i<3;i++){const u=(t*.4+i/3)%1;g.fillStyle=`rgba(235,235,235,${.5*(1-u)})`;g.beginPath();g.arc(cx+(m[0]+u*6+Math.sin(t+i)*1.5)*z,cy+(m[1]-u*18)*z,(2+u*3)*z,0,7);g.fill()}
 if(b.id=='mill'){g.save();g.translate(cx+8*z,cy-34*z);g.rotate(t*.7);g.fillStyle='#e6d9b0';g.strokeStyle='#5a4028';g.lineWidth=1*z;for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillRect(-3.5*z,-24*z,7*z,19*z);g.strokeRect(-3.5*z,-24*z,7*z,19*z)}g.restore()}}
function box(cx,cy,d,a){const z=cam.z;g.globalAlpha=a;if(d.flat){dia(cx,cy,.95,'#b9a27a');dia(cx,cy,.7,'#cdb98f');g.globalAlpha=1;return}
 const s=d.s||1,hw=22*s*z,hh=11*s*z,h=d.h*z,rh=(d.rh||14)*z;dia(cx+5*z,cy+3*z,.8*s+.1,'rgba(0,0,0,.2)');
 poly([[cx-hw,cy],[cx,cy+hh],[cx,cy+hh-h],[cx-hw,cy-h]],d.w);poly([[cx-hw,cy],[cx,cy+hh],[cx,cy+hh-h],[cx-hw,cy-h]],'rgba(0,0,0,.2)');
 poly([[cx,cy+hh],[cx+hw,cy],[cx+hw,cy-h],[cx,cy+hh-h]],d.w);
 poly([[cx-hw,cy-h],[cx,cy+hh-h],[cx,cy-h-rh]],d.r);poly([[cx,cy+hh-h],[cx+hw,cy-h],[cx,cy-h-rh]],d.r);poly([[cx,cy+hh-h],[cx+hw,cy-h],[cx,cy-h-rh]],'rgba(0,0,0,.18)');
 g.globalAlpha=1;g.font=14*z+'px serif';g.textAlign='center';g.fillText(d.i,cx,cy-h-rh-4*z)}
function flatB(b,cx,cy){const d=B[b.id],k=szd(d),z=cam.z;g.globalAlpha=b.t>0||b.dmg?.55:1;dp(cx,cy,k*.96);g.fillStyle=d.flat?'#a89878':(d.w||'#bbb');g.fill();g.strokeStyle=d.r||'#6d5e50';g.lineWidth=2*z;g.stroke();g.globalAlpha=1;g.textAlign='center';
 if(!d.flat){g.font=(k==2?20:12)*z+'px serif';g.fillText(b.id=='house'&&b.lv>1?(b.lv>2?'🏰':'🏘️'):d.i,cx,cy+6*z)}if(b.pr||b.dmg){g.font=14*z+'px serif';g.fillText(b.dmg?'🔥':'⚠️',cx+8*z,cy-6*z)}if(b.t>0){g.font=12*z+'px serif';g.fillText('🔨',cx-8*z,cy-6*z)}}
function drawB(b,cx,cy){[cx,cy]=cen(b.x,b.y,B[b.id]);if(flat){flatB(b,cx,cy);return}const d=B[b.id],c=SPR[sk(b)];if(c){spr(c,cx,cy,b.t>0||b.dmg?.55:1,scd(d));g.textAlign='center';g.font=16*cam.z+'px serif';if(b.pr)g.fillText('⚠️',cx,cy-(d.h+(d.rh||0)+16)*cam.z);if(b.t>0)g.fillText('🔨',cx,cy-30*cam.z);if(b.dmg)g.fillText('🔥',cx,cy-34*cam.z);if(!b.t&&!b.dmg)fx(b,cx,cy);return}box(cx,cy,d,b.t>0||b.dmg?.55:1);if(b.dmg){g.font=16*cam.z+'px serif';g.textAlign='center';g.fillText('🔥',cx,cy-34*cam.z)}if(b.t>0&&!d.flat){g.font=16*cam.z+'px serif';g.textAlign='center';g.fillText('🔨',cx,cy-30*cam.z)}}
function draw(ts){if(!ptr.size&&ts-last<30){requestAnimationFrame(draw);return}const z=cam.z,t=ts/1000,dt=Math.min(.1,(ts-last)/1000);last=ts;g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#bcd09a';g.fillRect(0,0,W,H);
 const vis=(cx,cy)=>cx>-50*z&&cx<W+50*z&&cy>-70*z&&cy<H+60*z;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const[cx,cy]=P(x,y);if(!vis(cx,cy))continue;const m=S.map[y*N+x],h=hs(x,y);
  dia(cx,cy,1.03,m==2?WC[(Math.sin(t*1.5+x+y)+1)*3.99|0]:tcol(m,x,y));gd(x,y,m,h,cx,cy);if(!S.zones[zoneOf(x,y)])dia(cx,cy,1.03,'rgba(25,35,25,.5)')}
 if(mode&&ghost)rangeFx(ghost[0],ghost[1],mode);else if(sel&&!mode)rangeFx(sel.x,sel.y,sel.id);wat(t);fog();while(WK.length<Math.min(14,Math.round(S.pop/2))&&S.bld.length)WK.push({x:S.bld[0].x,y:S.bld[0].y,tx:0,ty:0});while(WK.length>Math.round(S.pop/2))WK.pop();
 const tg=S.bld.filter(b=>!b.t&&!B[b.id].flat&&!B[b.id].water);
 for(const w of WK){const d=Math.hypot(w.tx-w.x,w.ty-w.y);if(d<.1&&tg.length){const b=tg[Math.random()*tg.length|0];w.tx=b.x+Math.random()*2.4-.2;w.ty=b.y+2.3}else if(d>=.1){w.x+=(w.tx-w.x)/d*1.6*dt;w.y+=(w.ty-w.y)/d*1.6*dt}}
 const ws=WK.slice().sort((a,b)=>a.x+a.y-b.x-b.y);let wi=0;
 for(let s=0;s<2*N;s++){for(let x=Math.max(0,s-N+1);x<=Math.min(s,N-1);x++){const y=s-x,[cx,cy]=P(x,y);if(!vis(cx,cy))continue;const m=S.map[y*N+x],b=at(x,y),h=hs(x,y);
   g.globalAlpha=S.zones[zoneOf(x,y)]?1:.5;if(!S.exp[zoneOf(x,y)]||flat){}else if(m==1){treeSpr(h*3|0,cx,cy+3*z,.8+h*.2);if(h>.6)treeSpr(h*7|0,cx+7*z,cy+5*z,.6)}else if(m==3){const c=SPR.rock;if(c)g.drawImage(c,cx-22*z,cy-24*z,44*z,33*z)}
   g.globalAlpha=1;if(b&&x==b.x+szd(B[b.id])-1&&y==b.y+szd(B[b.id])-1)drawB(b,cx,cy)}
  while(wi<ws.length&&ws[wi].x+ws[wi].y<s+1){const w=ws[wi++],[px,py]=P(w.x,w.y);{const c=SPR['v'+(wi%4)];if(c)g.drawImage(c,px-5*z,py-19*z-Math.abs(Math.sin(t*8+wi))*1.5*z,10*z,20*z)}}}
 if(mode=='road'&&rp.a)for(const[x,y]of rcells()){const[cx,cy]=P(x,y),w=why('road',x,y),o=at(x,y);dia(cx,cy,1,!w?'rgba(80,220,90,.6)':w.startsWith('Zu wenig')?'rgba(240,200,60,.6)':o&&o.id=='road'?'rgba(210,210,210,.4)':'rgba(230,60,50,.6)')}
 if(mode&&ghost){const[cx,cy]=cen(ghost[0],ghost[1],B[mode]),ok=!why(mode,ghost[0],ghost[1]);dia(cx,cy,szd(B[mode]),ok?'rgba(80,220,90,.5)':'rgba(230,60,50,.55)');flat||(SPR[mode]?spr(SPR[mode],cx,cy,.65,scd(B[mode])):box(cx,cy,B[mode],.65))}
 if(sel&&!mode){const[cx,cy]=cen(sel.x,sel.y,B[sel.id]);dp(cx,cy,szd(B[sel.id])*1.05);g.strokeStyle='#e0b048';g.lineWidth=3;g.stroke()}
 {if(!vg||vg.w!=W||vg.h!=H){const gr=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(255,210,140,0)');gr.addColorStop(1,'rgba(30,20,10,.28)');vg={g:gr,w:W,h:H}}g.fillStyle=vg.g;g.fillRect(0,0,W,H)}
 if(S.exp[S.cz]){const[px,py1]=P(S.camp.x,S.camp.y),py=py1+8*z;g.globalAlpha=1;if(SPR.camp)spr(SPR.camp,px,py,S.peace?.3:1);g.font=26*z+'px serif';g.textAlign='center';}
 if(S.raid&&S.raid.from)for(const o of S.raid.from){const[qx,qy]=P(o.x,o.y);g.font=26*z+'px serif';g.textAlign='center';g.fillText('⚔️',qx,qy)}
 if(battle){battle.t+=dt/4;const n=Math.min(10,3+battle.r.cnt),sp=SPR[battle.sp];for(let i=0;i<n;i++){const u=cl(battle.t*1.2-i*.03,0,1),o=battle.src[i%battle.src.length],[px,py]=P(o.x+(battle.dst.x-o.x)*u+(i%3)*.3,o.y+(battle.dst.y-o.y)*u+(i/3|0)*.3);if(sp)g.drawImage(sp,px-6*z,py-22*z,12*z,24*z)}
  if(battle.t>=1.2){const r=battle.r;battle=null;banner(`<h2>${r.title||(r.win?'🛡️ Angriff abgewehrt':'🔥 Stadt geplündert')}</h2><p>${r.txt}</p>`);ui()}}
 for(let i=0;i<9;i++)if(!S.zones[i]){const[px,py]=P((i%3)*16+8,(i/3|0)*16+8);g.globalAlpha=1;g.font=28*z+'px serif';g.textAlign='center';g.fillText(S.scout&&S.scout.z==i?'🧭':!S.exp[i]?(scoutable(i)?'🔭':'❓'):zinfo(i).w.startsWith('Nur')?'🔒':'🗝️',px,py)}
 requestAnimationFrame(draw)}
// ---- Audio (Dateien in sound-*.wav, austauschbar) ----
const A={on:0,buf:{},ac:null};
function play(n,v,loop){const b=A.buf[n];if(!b||!A.ac)return null;const o=A.ac.createBufferSource(),q=A.ac.createGain();o.buffer=b;o.loop=!!loop;q.gain.value=v;o.connect(q);q.connect(A.ac.destination);o.start();return o}
function sfx(n,v=.5){if(opt.sound&&A.on)play(n,v)}
function amb(){if(!A.on)return;if(opt.music){if(!A.w)A.w=play('wind',.3,1);if(!A.bt)A.bt=setInterval(()=>{if(opt.music&&Math.random()<.6)play('bird',.25)},9000)}else if(A.w){try{A.w.stop()}catch(e){}A.w=null}}
function unlock(){if(A.on){if(A.ac&&A.ac.state!='running')A.ac.resume();return}A.on=1;try{A.ac=new(window.AudioContext||window.webkitAudioContext)();A.ac.resume();
 ['wind','bird','click','build','bell'].forEach(n=>fetch('sound-'+n+'.wav').then(r=>r.arrayBuffer()).then(b=>A.ac.decodeAudioData(b)).then(d=>{A.buf[n]=d;if(n=='wind')amb()}).catch(()=>{}))}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&A.ac&&A.ac.state!='running')A.ac.resume()});
// ---- Speicher (IndexedDB, atomare Transaktion, Versionsfeld) ----
let dbp;const DB=()=>dbp||(dbp=new Promise((ok,no)=>{const r=indexedDB.open('meridian',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();dbp=null};ok(r.result)};r.onerror=()=>{dbp=null;no(r.error)}}));
const put=async(k,v)=>{const d=await DB();return new Promise((ok,no)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=ok;t.onerror=t.onabort=()=>no(t.error)})};
const get=async k=>{const d=await DB();return new Promise((ok,no)=>{const r=d.transaction('kv').objectStore('kv').get(k);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})};
let sT;function save(){clearTimeout(sT);sT=setTimeout(()=>put('save',{v:8,S,opt}).catch(()=>toast('Speichern fehlgeschlagen.')),400)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)put('save',{v:8,S,opt}).catch(()=>{})});
(async()=>{resize();try{const d=await get('save');if(d&&d.v===8&&d.S&&d.S.exp&&d.S.cz!=null&&d.S.camp&&d.S.zones&&d.S.map&&d.S.map.length==N*N){S=d.S;opt=d.opt||opt;idx();centerOn(20,20)}}catch(e){}
 if(!S){newGame();dlg(HELP)}ui();requestAnimationFrame(draw);
 if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{})})();
