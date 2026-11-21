'use strict';
const N=24,$=i=>document.getElementById(i),R=['food','wood','stone','tools','coins'],
RI={food:'🌾',wood:'🪵',stone:'🪨',tools:'🔧',coins:'🪙'},RN={food:'Nahrung',wood:'Holz',stone:'Stein',tools:'Werkzeuge',coins:'Münzen'},ST=['','Dorf','Marktflecken','Stadt'];
const B={
road:{n:'Weg',i:'🛤️',c:{coins:1,stone:1},st:1,t:0,flat:1,sat:.3,d:'Befestigter Weg, macht den Ort ansehnlicher.'},
well:{n:'Brunnen',i:'⛲',c:{stone:8,coins:5},st:1,t:1,h:10,rh:10,s:.5,w:'#9a9a9a',r:'#7a5a35',sat:8,rad:4,d:'Versorgt Wohnhäuser im Umkreis von 4 Feldern.'},
house:{n:'Wohnhaus',i:'🏠',c:{wood:10,coins:5},st:1,t:1,h:20,w:'#dcc9a2',r:'#b04a32',home:4,d:'Fachwerkhaus für 4 Bewohner.'},
farm:{n:'Bauernhof',i:'🌾',c:{wood:15,coins:10},st:1,t:1,h:16,rh:10,w:'#c9a66b',r:'#7a5a35',job:3,prod:{food:8},d:'Baut Getreide an und ernährt die Siedlung.'},
wood:{n:'Holzfäller',i:'🪓',c:{wood:8,coins:5},st:1,t:1,h:14,rh:10,w:'#9c7a4a',r:'#5b4025',job:2,prod:{wood:6},need:1,d:'Fällt Bäume. Braucht Wald in 2 Feldern Umkreis.'},
quarry:{n:'Steinbruch',i:'⛏️',c:{wood:10,tools:2,coins:10},st:1,t:1,h:12,rh:6,w:'#a9a597',r:'#6d6a60',job:3,prod:{stone:4},need:3,d:'Bricht Stein. Braucht Hügel in 2 Feldern Umkreis.'},
smith:{n:'Schmiede',i:'🔨',c:{wood:15,stone:10,coins:20},st:2,t:1,h:20,rh:12,w:'#8d8b88',r:'#4a4a52',job:2,use:{wood:2,stone:1},prod:{tools:2},d:'Macht aus Holz und Stein Werkzeuge.'},
bakery:{n:'Bäckerei',i:'🥖',c:{wood:15,stone:10,coins:20},st:2,t:1,h:20,rh:14,w:'#e3d2ae',r:'#9a4a2c',job:2,use:{food:3},prod:{food:5},d:'Backt Brot: aus 3 Nahrung werden 5.'},
mill:{n:'Mühle',i:'🌬️',c:{wood:20,stone:10,coins:25},st:2,t:1,h:26,rh:14,w:'#e6dcc4',r:'#7a5a35',job:2,use:{food:4},prod:{food:7},d:'Mahlt Getreide: aus 4 Nahrung werden 7.'},
tower:{n:'Wachturm',i:'🗼',c:{wood:15,stone:20,coins:15},st:1,t:1,h:44,rh:14,s:.6,w:'#b8b2a2',r:'#7a3b2a',job:1,def:4,d:'Wachposten warnen und verteidigen die Stadt.'},
guard:{n:'Wachhaus',i:'🛡️',c:{wood:15,stone:15,tools:4,coins:25},st:2,t:1,h:22,rh:14,w:'#a9a597',r:'#4a5a8a',job:3,def:6,gd:6,d:'Wachen verteidigen die Stadt und bilden Expeditionen.'},
wall:{n:'Stadtmauer',i:'🧱',c:{stone:6,coins:2},st:1,t:1,h:12,rh:3,s:.9,w:'#b5b0a0',r:'#8a8578',def:1,wall:1,d:'Je +1 Verteidigung (Mauern zusammen max. +8).'},
market:{n:'Marktplatz',i:'🧺',c:{wood:20,stone:10,coins:30},st:2,t:1,h:12,rh:16,w:'#d8b46a',r:'#b8382a',job:2,prod:{coins:5},sat:20,rad:5,d:'Bringt Münzen; Häuser im Umkreis von 5 Feldern sind zufriedener.'},
store:{n:'Lagerhaus',i:'📦',c:{wood:25,stone:15},st:2,t:1,h:24,rh:12,w:'#b79566',r:'#6b4a2a',cap:100,d:'Erhöht das Lager aller Rohstoffe um 100.'},
burgher:{n:'Bürgerhaus',i:'🏛️',c:{wood:20,stone:15,coins:20},st:3,t:2,h:32,rh:16,w:'#d3c3a3',r:'#8a3b2a',home:8,d:'Stattliches Haus für 8 Bewohner.'}
};
const hs=(x,y)=>((x*73856093^y*19349663)>>>0)%100/100,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),cost=c=>Object.keys(c).map(k=>RI[k]+c[k]).join(' '),
rnd=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let shoreC=null,battle=null,zsel=null,S,og=new Map,cam={x:0,y:0,z:.8},mode=null,ghost=null,sel=null,W,H,dpr,opt={sound:1,music:1},WK=[],last=0,toastT,cv=$('c'),g=cv.getContext('2d');
const at=(x,y)=>og.get(y*N+x),idx=()=>{og=new Map;S.bld.forEach(b=>og.set(b.y*N+b.x,b))};
function genMap(){const r=rnd((Math.random()*1e9)|0),p=Array.from({length:8},()=>r()*6),n=(x,y,o)=>Math.sin(x*.45+p[o])+Math.sin(y*.4+p[o+1])+Math.sin((x+y)*.28+p[o+2])+Math.sin((x-y)*.5+p[o+3]),m=[];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=0;if(n(x,y,0)>1.2)t=1;else if(n(x,y,4)>2.1)t=3;
  if(Math.abs(x-(17+3*Math.sin(y*.35+p[0])))<1.3||Math.hypot(x-4,y-19)<1.6)t=2;if(Math.hypot(x-10,y-10)<3.6)t=0;m.push(t)}
 [[14,12],[14,13],[13,14],[14,14],[15,13],[15,12]].forEach(([x,y])=>m[y*N+x]=1);[[14,8],[15,8],[14,9],[15,9],[15,10]].forEach(([x,y])=>m[y*N+x]=3);return m}
function newGame(){S={turn:1,stage:1,pop:6,sat:60,won:0,camp:{x:1,y:1},peace:0,nr:12,raid:null,zones:[0,0,0,0,1,0,0,0,0],res:{food:20,wood:30,stone:6,tools:3,coins:40},map:genMap(),log:['Willkommen in Meridian!'],
 bld:[['house',9,9],['house',11,9],['farm',10,11]].map(([id,x,y])=>({id,x,y,t:0}))};S.rs={};S.map.forEach((m,i)=>{if(m==1)S.rs[i]=40;if(m==3)S.rs[i]=60});idx();WK=[];mode=ghost=sel=zsel=null;centerOn(10,10)}
// ---- Wirtschaft ----
function stats(s){let home=0,jobs=0,cap=100,sb=0;const H=[];for(const b of s.bld){if(b.t>0||b.dmg)continue;const d=B[b.id];home+=d.home||0;jobs+=d.job||0;cap+=d.cap||0;if(d.home)H.push(b)}
 for(const b of s.bld){const d=B[b.id];if(b.t>0||b.dmg||!d.sat)continue;if(!d.rad){sb+=d.sat;continue}let c=0;for(const h of H)if(Math.abs(h.x-b.x)+Math.abs(h.y-b.y)<=d.rad)c+=B[h.id].home;sb+=home?d.sat*c/home:0}
 return{home,jobs,cap,sb:Math.min(sb,35)}}
function tilesNear(s,x,y,m){const o=[];for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const a=x+i,c=y+j;if(a>=0&&c>=0&&a<N&&c<N&&s.map[c*N+a]==m&&s.rs[c*N+a]>0)o.push(c*N+a)}return o}
function harvest(s,b,m,a,L,n){let got=0;for(const i of tilesNear(s,b.x,b.y,m)){const t=Math.min(a-got,s.rs[i]);s.rs[i]-=t;got+=t;if(s.rs[i]<=0){s.map[i]=0;delete s.rs[i]}if(got>=a)break}if(got<a)L.push(n+': Vorkommen in Reichweite erschöpft.');return got}
const EV=[s=>{s.res.food+=10;return'Gute Ernte: +10 Nahrung.'},
 s=>s.res.coins>=10?(s.res.coins-=10,s.res.wood+=15,'Ein Händler verkauft günstig Holz: +15 Holz für 10 Münzen.'):'Ein Händler zieht durch, doch das Geld fehlt.',
 s=>{s.res.coins=Math.max(0,s.res.coins-6);return'Reparaturen am Dorfweg kosten 6 Münzen.'},
 s=>s.pop<stats(s).home?(s.pop++,'Eine Familie zieht zu.'):'Reisende suchen Quartier, aber es fehlt Wohnraum.'];
function step(s,q){const k=stats(s),L=[],r=s.res,emp=Math.min(s.pop,k.jobs),eff=k.jobs?emp/k.jobs:0,
 pr=s.bld.filter(b=>!b.t&&!b.dmg&&B[b.id].prod).sort((a,b)=>!!B[a.id].use-!!B[b.id].use);
 for(const b of pr){const d=B[b.id];if(d.use){if(!Object.keys(d.use).every(x=>r[x]>=d.use[x])){L.push(d.n+': Rohstoffmangel, Produktion ruht.');continue}for(const x in d.use)r[x]-=d.use[x]}for(const x in d.prod){let a=d.prod[x]*eff;if(d.need)a=harvest(s,b,d.need,a,L,d.n);r[x]+=a}}
 const need=s.pop*.6,hunger=r.food<need;r.food=Math.max(0,r.food-need);if(hunger)L.push('Hunger! Die Vorräte reichen nicht.');
 r.coins=Math.max(0,r.coins+s.pop*.25+emp-s.bld.filter(b=>!b.t&&B[b.id].job).length-s.bld.filter(b=>!b.t&&B[b.id].home).length*.5);
 const un=s.pop?(s.pop-emp)/s.pop:0,tg=40+k.sb+(hunger?-30:15)+(un>.4?-10:un<.15?5:0)+(s.pop>k.home?-10:0);s.sat=cl(s.sat+(tg-s.sat)*.5,0,100);
 const free=k.home-s.pop;if(hunger||s.sat<25)s.pop=Math.max(2,s.pop-1);else if(free>0&&s.sat>=45){s.pop+=Math.min(free,Math.ceil(s.pop*.2));L.push('Die Bevölkerung wächst.')}else if(free<0)s.pop=k.home;
 s.bld.forEach(b=>{if(b.t>0&&--b.t==0)L.push(B[b.id].n+' fertiggestellt.')});
 const ns=s.pop>=60?3:s.pop>=25?2:1;if(ns>s.stage){s.stage=ns;L.push('Aufstieg: '+ST[ns]+'! Neue Gebäude verfügbar.')}
 if(!q)raidTick(s,L);if(!q&&Math.random()<.3)L.push(EV[Math.random()*EV.length|0](s));
 for(const x of R)r[x]=Math.min(k.cap,Math.round(r[x]*10)/10);
 if(!s.won&&s.pop>=100&&s.sat>=60&&r.food>=20&&r.coins>=100){s.won=1;L.push('Meridian ist eine blühende Stadt – Sieg!')}
 s.turn++;if(!q){L.slice().reverse().forEach(l=>s.log.unshift('P'+s.turn+': '+l));s.log.length=Math.min(s.log.length,40)}return L}
const rstr=s=>(4+s.turn*.3+s.pop/15)*Math.min(1,.5+s.turn/40);
function dfn(s,g){const k=stats(s),e=k.jobs?Math.min(s.pop,k.jobs)/k.jobs:0;let a=0,w=0;for(const b of s.bld){if(b.t>0||b.dmg)continue;const d=B[b.id];if(g)a+=d.gd||0;else if(d.wall)w+=d.def;else a+=d.def||0}return g?2*a*Math.max(.5,e):a*Math.max(.5,e)+Math.min(8,w)}
function raidTick(s,L){
 if(s.peace>0){if(--s.peace==0){s.nr=s.turn+4;L.push('Neue Räuber sammeln sich am Kartenrand.')}return}
 if(s.raid){if(--s.raid.left>0){L.push('Räuber nähern sich: noch '+s.raid.left+' Periode(n)!');return}
  const D=dfn(s)+s.raid.merc,A=s.raid.str*(.8+Math.random()*.4);let rep;
  if(D>=A)rep={win:1,cnt:Math.round(s.raid.str/2),txt:'Die Räuber wurden zurückgeschlagen! Verteidigung '+Math.round(D)+' gegen Angriff '+Math.round(A)+'.'};
  else{const f=Math.min(.5,.1+(A-D)/A*.5);for(const x of R)s.res[x]=Math.floor(s.res[x]*(1-f));const c=s.bld.filter(b=>!b.t&&!b.dmg&&!B[b.id].flat);let n=Math.min(c.length,1+Math.floor(f*6));while(n--&&c.length)c.splice(Math.random()*c.length|0,1)[0].dmg=1;s.sat=Math.max(0,s.sat-15);
   rep={win:0,cnt:Math.round(s.raid.str/2),txt:'Die Räuber plündern '+Math.round(f*100)+'% der Vorräte und beschädigen Gebäude (Reparatur 🪙5 je Gebäude). Verteidigung '+Math.round(D)+' gegen Angriff '+Math.round(A)+'.'}}
  s.rep=rep;s.raid=null;L.push(rep.txt)}
 else if(s.turn>=s.nr){s.raid={str:Math.round(rstr(s)*10)/10,left:2,merc:0};s.nr=s.turn+7+(Math.random()*4|0);s.alert=1;L.push('Ein Bote meldet Räuber! Ankunft in 2 Perioden.')}}
function raidDlg(){const r=S.raid;dlg(`<h2>⚔️ Sicherheit</h2><p>Verteidigung: <b>${Math.round(dfn(S))}</b>${r?' (+'+r.merc+' Söldner)':''}</p>`+(r?`<p>Herr Stadthalter, Räuber nahen! Stärke etwa ${Math.round(r.str)}, Ankunft in ${r.left} Periode(n).</p><button data-a="mc">Söldner anheuern (🪙40, +6)</button><button data-a="tb">Tribut zahlen (🪙${Math.round(r.str*8)})</button>`:'<p>Derzeit ist kein Angriff gemeldet.</p>')+(S.peace>0?`<p>Das Lager ist zerschlagen. Frieden für ${S.peace} Perioden.</p>`:`<p>Expedition: Wachenstärke ${Math.round(dfn(S,1))} gegen Lager etwa ${Math.round(rstr(S)*2.5)}.</p><button data-a="ex">Expedition gegen das Lager (🔧10 🪙40)</button>`))}
function expedition(){const need=rstr(S)*2.5,pw=dfn(S,1);if(S.res.coins<40||S.res.tools<10)return toast('Benötigt 🔧10 und 🪙40.');S.res.coins-=40;S.res.tools-=10;
 if(pw>=need*(.8+Math.random()*.4)){S.peace=20;S.raid=null;S.log.unshift('Das Raubritterlager wurde zerschlagen.');after();dlg('<h2>⚔️ Lager zerschlagen</h2><p>Deine Wachen haben das Lager zerstört. Eine Weile herrscht Frieden.</p>')}
 else{S.sat=Math.max(0,S.sat-5);S.log.unshift('Die Expedition scheiterte.');after();dlg('<h2>Expedition gescheitert</h2><p>Deine Wachen waren zu schwach. Baue mehr Wachhäuser.</p>')}}
$('rd').onclick=raidDlg;
const zoneOf=(x,y)=>(y>>3)*3+(x>>3);
function zinfo(i){const n=S.zones.filter(Boolean).length,c={coins:30*n,wood:15*n,stone:10*n},zx=i%3,zy=i/3|0,
 adj=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X=zx+a,Y=zy+b;return X>=0&&X<3&&Y>=0&&Y<3&&S.zones[Y*3+X]}),need=n>=6?3:n>=3?2:1;let w='';
 if(!adj)w='Nur angrenzende Gebiete erschließbar';else if(need>S.stage)w='Erst ab Stufe '+ST[need];else for(const r in c)if(S.res[r]<c[r]){w='Zu wenig '+RN[r];break}return{c,w}}
function buyZone(i){const z=zinfo(i);if(z.w)return toast(z.w);for(const k in z.c)S.res[k]-=z.c[k];S.zones[i]=1;zsel=null;sfx('build');toast('Neues Gebiet erschlossen!');after()}
// ---- Bauen ----
const near=(x,y,m)=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const a=x+i,b=y+j;if(a>=0&&b>=0&&a<N&&b<N&&S.map[b*N+a]==m)return 1}return 0};
function why(id,x,y){const d=B[id];if(x<0||y<0||x>=N||y>=N)return'Außerhalb der Karte';if(d.st>S.stage)return'Noch gesperrt';if(!S.zones[zoneOf(x,y)])return'Gebiet noch nicht erschlossen';if(S.map[y*N+x])return'Nur auf freier Wiese baubar';if(at(x,y))return'Feld ist belegt';
 if(d.need&&!near(x,y,d.need))return d.need==1?'Braucht Wald in der Nähe':'Braucht Hügel in der Nähe';for(const k in d.c)if(S.res[k]<d.c[k])return'Zu wenig '+RN[k];return''}
function build(id,x,y){const d=B[id];for(const k in d.c)S.res[k]-=d.c[k];S.bld.push({id,x,y,t:d.t});idx();sfx('build');after()}
function demolish(b){const d=B[b.id];for(const k in d.c)S.res[k]+=Math.floor(d.c[k]/2);S.bld=S.bld.filter(x=>x!==b);idx();sel=null;sfx('click');after()}
function after(){ui();save()}
function nextTurn(){const L=step(S);if(S.rep){battle={t:0,r:S.rep};S.rep=null}sfx('bell',.4);toast(L.length?L.join(' '):'Eine ruhige Periode.');after();if(S.won&&!S.shown){S.shown=1;dlg('<h2>🏆 Sieg!</h2><p>Deine Siedlung ist zur blühenden Stadt gewachsen. Du kannst weiterspielen.</p>')}if(S.alert){S.alert=0;raidDlg()}}
// ---- UI ----
function toast(t){const m=$('msg');m.textContent=t;m.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>m.hidden=true,4500)}
function ui(){const k=stats(S),c=JSON.parse(JSON.stringify(S));step(c,1);
 $('top').innerHTML=R.map(x=>{const d=Math.round((c.res[x]-S.res[x])*10)/10;return`<div class=ch>${RI[x]} ${Math.floor(S.res[x])}<i class="${d>=0?'up':'dn'}">${d>=0?'+':''}${d}</i></div>`}).join('')+
 `<div class=ch>👥 ${S.pop}/${k.home}<i>Arbeit ${Math.min(S.pop,k.jobs)}/${k.jobs}</i></div><div class=ch>😊 ${Math.round(S.sat)}%</div><div class=ch>🛡️ ${Math.round(dfn(S))}${S.raid?'<i>⚔️ '+Math.round(S.raid.str)+' in '+S.raid.left+'</i>':''}</div><div class=ch>🏘️ ${ST[S.stage]}<i>Ziel ${S.pop}/100</i></div>`;
 $('rd').textContent='⚔️'+(S.raid?' '+S.raid.left:'');$('nx').textContent='▶ Periode '+S.turn+' beenden';bar();info()}
function bar(){$('bl').innerHTML=Object.keys(B).map(id=>{const d=B[id],lk=d.st>S.stage;return`<button class="b${lk?' lk':''}${mode==id?' on':''}" data-id="${id}">${lk?'🔒':d.i}<small>${d.n}</small><small>${cost(d.c)}</small></button>`}).join('')}
const eff=d=>(d.home?'🏠 '+d.home+' Plätze · ':'')+(d.job?'👷 '+d.job+' Jobs · ':'')+(d.use?'Verbraucht '+cost(d.use)+' · ':'')+(d.prod?'Erzeugt '+cost(d.prod)+' · ':'')+(d.sat?'😊 +'+d.sat+' · ':'')+(d.cap?'📦 +'+d.cap+' · ':'')+(d.def?'🛡️ +'+d.def+' · ':'');
function info(){const e=$('info');let h='';
 if(mode){const d=B[mode],w=ghost?why(mode,ghost[0],ghost[1]):'';h=`<b>${d.i} ${d.n}</b> – ${d.d}<br>Kosten ${cost(d.c)} · Bau ${d.t} Periode(n)<br>${eff(d)}<br>${ghost?rinfo(mode,ghost[0],ghost[1]):d.need||d.rad?'Tippe aufs Feld, um den Wirkbereich zu sehen.<br>':''}${ghost?(w?'⛔ '+w:'✅ Nochmal tippen zum Bauen'):'Tippe auf ein freies Feld.'}<br><button data-a="x">Abbrechen</button>`}
 else if(zsel!=null){const z=zinfo(zsel);h=`<b>🗝️ Neues Baugebiet</b><br>Kosten ${cost(z.c)}<br>${z.w?'⛔ '+z.w:'✅ Erschließbar'}<br><button data-a="bz">Erschließen</button><button data-a="x" style="background:#2f4a2a">Schließen</button>`}
 else if(sel){const d=B[sel.id];h=`<b>${d.i} ${d.n}</b> – ${d.d}<br>${eff(d)}<br>${rinfo(sel.id,sel.x,sel.y)}Status: ${sel.dmg?'🔥 Beschädigt':sel.t>0?'Im Bau, noch '+sel.t+' Periode(n)':'in Betrieb'}<br>${sel.dmg?'<button data-a="rp" style="background:#2f4a2a">Reparieren (🪙5)</button>':''}<button data-a="dm">Abreißen (50% Rückerstattung)</button><button data-a="x" style="background:#2f4a2a">Schließen</button>`}
 e.innerHTML=h;e.hidden=!h}
function dlg(h){$('dlg').innerHTML=`<div class=bx>${h}<button data-a="cl">Schließen</button></div>`;$('dlg').hidden=false}
const HELP='<h2>So wird gespielt</h2><p>Du bist der Stadthalter von Meridian. Räuber bedrohen die Stadt: Türme, Wachhäuser und Mauern schützen dich – nur wenn sie siegen, plündern sie. Das ⚔️-Symbol zeigt die Lage.<br><br>1. Wähle unten ein Gebäude, tippe aufs Feld, tippe nochmal zum Bauen.<br>2. „Periode beenden“ lässt die Wirtschaft laufen: Produktion, Essen, Steuern, Wachstum.<br>3. Die kleinen Zahlen oben zeigen die erwartete Änderung.<br>4. Ziehen = Karte bewegen, zwei Finger = Zoomen.<br><br>Ziel: 100 Einwohner, 60% Zufriedenheit, Nahrung ≥ 20, Münzen ≥ 100. Dunkle Gebiete (🗝️) schaltest du per Tipp frei. Wald und Hügel sind endlich; im Menü kaufst du bei Händlern Rohstoffe. Ohne Nahrung und Jobs sinkt die Zufriedenheit – du kannst dich jederzeit erholen.</p>';
function menu(){const k=stats(S),e=Math.min(S.pop,k.jobs);dlg(`<h2>Meridian</h2><p>Periode ${S.turn} · ${ST[S.stage]} · Einwohner ${S.pop} · Beschäftigte ${e} · Arbeitslosenquote ${S.pop?Math.round((S.pop-e)/S.pop*100):0}% · Zufriedenheit ${Math.round(S.sat)}%</p>
<button data-a="sv">💾 Speichern</button><button data-a="nw">🆕 Neues Spiel</button><button data-a="so">🔊 Ton: ${opt.sound?'an':'aus'}</button><button data-a="mu">🎵 Musik: ${opt.music?'an':'aus'}</button><h3>Händler</h3><button data-a="tr:wood">🪙20 → 🪵10</button><button data-a="tr:stone">🪙24 → 🪨10</button><button data-a="tr:food">🪙15 → 🌾10</button><button data-a="tr:tools">🪙30 → 🔧5</button><button data-a="hp">❓ Anleitung</button><h3>Ereignisse</h3><div class=lg>${S.log.slice(0,12).join('<br>')}</div>`)}
$('dlg').onclick=e=>{const a=e.target.dataset.a;if(!a)return;if(a=='cl')$('dlg').hidden=true;
 else if(a=='sv'){put('save',{v:3,S,opt}).then(()=>toast('Gespeichert.'));$('dlg').hidden=true}
 else if(a=='nw'){if(confirm('Neues Spiel beginnen? Der alte Stand geht verloren.')){newGame();after();$('dlg').hidden=true}}
 else if(a=='so'){opt.sound^=1;save();menu()}else if(a=='mu'){opt.music^=1;amb();save();menu()}else if(a=='hp')dlg(HELP);else if(a=='mc'){if(S.raid&&S.res.coins>=40){S.res.coins-=40;S.raid.merc+=6;sfx('click');after();raidDlg()}else toast('Zu wenig Münzen.')}
 else if(a=='tb'&&S.raid){const c=Math.round(S.raid.str*8);if(S.res.coins>=c){S.res.coins-=c;S.raid=null;S.log.unshift('Tribut gezahlt, die Räuber ziehen ab.');after();raidDlg()}else toast('Zu wenig Münzen.')}else if(a=='ex')expedition();else if(a.startsWith('tr:')){const k=a.slice(3),t={wood:[20,10],stone:[24,10],food:[15,10],tools:[30,5]}[k];if(S.res.coins>=t[0]){S.res.coins-=t[0];S.res[k]+=t[1];sfx('click');after();menu()}else toast('Zu wenig Münzen.')}};
$('info').onclick=e=>{const a=e.target.dataset.a;if(a=='x')mode=ghost=sel=zsel=null;else if(a=='bz'&&zsel!=null)buyZone(zsel);else if(a=='dm'&&sel)demolish(sel);else if(a=='rp'&&sel&&sel.dmg&&S.res.coins>=5){S.res.coins-=5;sel.dmg=0;sfx('build');after()}ui()};
$('bl').onclick=e=>{const b=e.target.closest('.b');if(!b)return;const id=b.dataset.id;if(B[id].st>S.stage)return toast('Freigeschaltet ab: '+ST[B[id].st]);sfx('click');mode=mode==id?null:id;ghost=sel=zsel=null;ui()};
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
function tap(px,py){let[x,y]=pick(px,py);if(mode&&ghost&&rectHit(px,py,ghost[0],ghost[1],B[mode]))[x,y]=ghost;
 if(mode){if(ghost&&ghost[0]==x&&ghost[1]==y&&!why(mode,x,y))build(mode,x,y);else{ghost=[x,y];info();const w=why(mode,x,y);if(w)toast(w)}}
 else{const b=hitB(px,py)||at(x,y);sel=b||null;zsel=!b&&x>=0&&y>=0&&x<N&&y<N&&!S.zones[zoneOf(x,y)]?zoneOf(x,y):null;sfx('click',.3);info()}}
document.addEventListener('gesturestart',e=>e.preventDefault());
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr}
addEventListener('resize',()=>{resize();clamp()});
// ---- Rendering ----
function dp(cx,cy,k){const z=cam.z;g.beginPath();g.moveTo(cx,cy-16*z*k);g.lineTo(cx+32*z*k,cy);g.lineTo(cx,cy+16*z*k);g.lineTo(cx-32*z*k,cy);g.closePath()}
const dia=(cx,cy,k,c)=>{dp(cx,cy,k);g.fillStyle=c;g.fill()},poly=(a,c)=>{g.beginPath();a.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=c;g.fill()};
function tree(cx,cy,s){const z=cam.z*s;g.fillStyle='#5a3d22';g.fillRect(cx-1.5*z,cy-8*z,3*z,9*z);g.fillStyle='#3d6a33';g.beginPath();g.arc(cx,cy-14*z,8*z,0,7);g.fill();g.fillStyle='#5a8c42';g.beginPath();g.arc(cx-2*z,cy-16*z,4.5*z,0,7);g.fill()}
function treeSpr(i,x,y,sc){const c=SPR['tree'+(i%3)],z=cam.z*sc;if(c)g.drawImage(c,x-20*z,y-50*z,40*z,56*z);else tree(x,y,sc)}
function spr(c,cx,cy,a){const z=cam.z;g.globalAlpha=a;g.drawImage(c,cx-40*z,cy-84*z,80*z,110*z);g.globalAlpha=1}
function gd(x,y,m,h,cx,cy){if(m||h>.4||at(x,y))return;const c=SPR[h<.1?'flower':'tuft'],z=cam.z;if(c)g.drawImage(c,cx+(h*50-12)*z,cy+(h*30-6)*z,16*z,10*z)}
function shoreLines(){if(shoreC&&shoreC.m===S.map)return shoreC.l;const E=[],adj=new Map,add=(a,b)=>{const i=E.length;E.push([a,b,0]);for(const k of[a,b]){const q=k[0]+','+k[1];(adj.get(q)||adj.set(q,[]).get(q)).push(i)}};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(S.map[y*N+x]!=2)continue;[[1,0,[x+1,y],[x+1,y+1]],[0,1,[x+1,y+1],[x,y+1]],[-1,0,[x,y+1],[x,y]],[0,-1,[x,y],[x+1,y]]].forEach(([a,b,p,q])=>{const nx=x+a,ny=y+b;if(nx>=0&&ny>=0&&nx<N&&ny<N&&S.map[ny*N+nx]!=2)add(p,q)})}
 const L=[];for(let i=0;i<E.length;i++){if(E[i][2])continue;E[i][2]=1;const ch=[E[i][0],E[i][1]];
  for(const dir of[0,1])for(;;){const e=dir?ch[ch.length-1]:ch[0],j=adj.get(e[0]+','+e[1]).find(k=>!E[k][2]);if(j==null)break;E[j][2]=1;const o=E[j][0][0]==e[0]&&E[j][0][1]==e[1]?E[j][1]:E[j][0];dir?ch.push(o):ch.unshift(o)}
  L.push(ch)}shoreC={m:S.map,l:L};return L}
function shoreDraw(){const z=cam.z;g.lineJoin=g.lineCap='round';
 for(const ch of shoreLines()){const p=ch.map(([a,b])=>[(a-b)*32*z+cam.x,(a+b)*16*z+cam.y]);if(!p.some(q=>q[0]>-60&&q[0]<W+60&&q[1]>-60&&q[1]<H+60))continue;
  g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length-1;i++)g.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);g.lineTo(p[p.length-1][0],p[p.length-1][1]);
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=7*z;g.stroke();g.strokeStyle='#e6d49a';g.lineWidth=3.2*z;g.stroke()}}
function rangeFx(x,y,id){const d=B[id],r=d.need?2:d.rad||0;if(!r)return;const z=cam.z;
 for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(!d.need&&Math.abs(i)+Math.abs(j)>r)continue;const a=x+i,b=y+j;if(a<0||b<0||a>=N||b>=N)continue;const[cx,cy]=P(a,b),hit=d.need&&S.map[b*N+a]==d.need&&S.rs[b*N+a]>0,bb=at(a,b),hom=d.rad&&bb&&B[bb.id].home;
  dia(cx,cy,1,hit?'rgba(120,230,90,.55)':hom?'rgba(255,225,90,.55)':'rgba(255,225,120,.24)');dp(cx,cy,1);g.strokeStyle='rgba(255,240,160,.8)';g.lineWidth=1.2*z;g.stroke()}}
function rinfo(id,x,y){const d=B[id];if(d.need)return'Vorkommen in Reichweite (grün): '+Math.floor(tilesNear(S,x,y,d.need).reduce((a,i)=>a+S.rs[i],0))+'<br>';
 if(d.rad){let c=0;for(const b of S.bld)if(!b.t&&B[b.id].home&&Math.abs(b.x-x)+Math.abs(b.y-y)<=d.rad)c+=B[b.id].home;return'Versorgt '+c+' Wohnplätze im Umkreis von '+d.rad+' Feldern (gelb)<br>'}return''}
function rectHit(px,py,x,y,d){const z=cam.z,[cx,cy]=P(x,y),top=d.flat?16:d.h+(d.rh||0)+10;return Math.abs(px-cx)<=26*z*(d.s||1)+4*z&&py>=cy-top*z&&py<=cy+14*z}
function hitB(px,py){let best=null;for(const b of S.bld)if(rectHit(px,py,b.x,b.y,B[b.id])&&(!best||b.x+b.y>best.x+best.y))best=b;return best}
function wat(t){const z=cam.z,E=[[1,0,32,0,0,16],[0,1,0,16,-32,0],[-1,0,-32,0,0,-16],[0,-1,0,-16,32,0]];g.lineCap='round';
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(S.map[y*N+x]!=2)continue;const[cx,cy]=P(x,y);if(cx<-40*z||cx>W+40*z||cy<-30*z||cy>H+30*z)continue;
  const o=Math.sin(t*1.2+x*2+y)*4*z;g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.2*z;g.beginPath();g.moveTo(cx-8*z+o,cy-2*z);g.lineTo(cx+2*z+o,cy-2*z);g.moveTo(cx-2*z-o,cy+5*z);g.lineTo(cx+8*z-o,cy+5*z);g.stroke();
  }shoreDraw()}
function fx(b,cx,cy){const z=cam.z,t=performance.now()/1000,m=SM[b.id];if(m)for(let i=0;i<3;i++){const u=(t*.4+i/3)%1;g.fillStyle=`rgba(235,235,235,${.5*(1-u)})`;g.beginPath();g.arc(cx+(m[0]+u*6+Math.sin(t+i)*1.5)*z,cy+(m[1]-u*18)*z,(2+u*3)*z,0,7);g.fill()}
 if(b.id=='mill'){g.save();g.translate(cx+8*z,cy-34*z);g.rotate(t*.7);g.fillStyle='#e6d9b0';g.strokeStyle='#5a4028';g.lineWidth=1*z;for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillRect(-3.5*z,-24*z,7*z,19*z);g.strokeRect(-3.5*z,-24*z,7*z,19*z)}g.restore()}}
function box(cx,cy,d,a){const z=cam.z;g.globalAlpha=a;if(d.flat){dia(cx,cy,.95,'#b9a27a');dia(cx,cy,.7,'#cdb98f');g.globalAlpha=1;return}
 const s=d.s||1,hw=22*s*z,hh=11*s*z,h=d.h*z,rh=(d.rh||14)*z;dia(cx+5*z,cy+3*z,.8*s+.1,'rgba(0,0,0,.2)');
 poly([[cx-hw,cy],[cx,cy+hh],[cx,cy+hh-h],[cx-hw,cy-h]],d.w);poly([[cx-hw,cy],[cx,cy+hh],[cx,cy+hh-h],[cx-hw,cy-h]],'rgba(0,0,0,.2)');
 poly([[cx,cy+hh],[cx+hw,cy],[cx+hw,cy-h],[cx,cy+hh-h]],d.w);
 poly([[cx-hw,cy-h],[cx,cy+hh-h],[cx,cy-h-rh]],d.r);poly([[cx,cy+hh-h],[cx+hw,cy-h],[cx,cy-h-rh]],d.r);poly([[cx,cy+hh-h],[cx+hw,cy-h],[cx,cy-h-rh]],'rgba(0,0,0,.18)');
 g.globalAlpha=1;g.font=14*z+'px serif';g.textAlign='center';g.fillText(d.i,cx,cy-h-rh-4*z)}
function drawB(b,cx,cy){const d=B[b.id],c=SPR[b.id];if(c){spr(c,cx,cy,b.t>0||b.dmg?.55:1);g.textAlign='center';g.font=16*cam.z+'px serif';if(b.t>0)g.fillText('🔨',cx,cy-30*cam.z);if(b.dmg)g.fillText('🔥',cx,cy-34*cam.z);if(!b.t&&!b.dmg)fx(b,cx,cy);return}box(cx,cy,d,b.t>0||b.dmg?.55:1);if(b.dmg){g.font=16*cam.z+'px serif';g.textAlign='center';g.fillText('🔥',cx,cy-34*cam.z)}if(b.t>0&&!d.flat){g.font=16*cam.z+'px serif';g.textAlign='center';g.fillText('🔨',cx,cy-30*cam.z)}}
function draw(ts){const z=cam.z,t=ts/1000,dt=Math.min(.1,(ts-last)/1000);last=ts;g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#bcd09a';g.fillRect(0,0,W,H);
 const vis=(cx,cy)=>cx>-50*z&&cx<W+50*z&&cy>-70*z&&cy<H+60*z;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const[cx,cy]=P(x,y);if(!vis(cx,cy))continue;const m=S.map[y*N+x],h=hs(x,y);
  dia(cx,cy,1.03,m==2?`hsl(205,45%,${47+3*Math.sin(t*1.5+x+y)}%)`:m==1?`hsl(100,30%,${30+h*6}%)`:m==3?`hsl(40,12%,${52+h*8}%)`:`hsl(${82+h*12},34%,${44+h*7}%)`);gd(x,y,m,h,cx,cy);if(!S.zones[zoneOf(x,y)])dia(cx,cy,1.03,'rgba(25,35,25,.5)')}
 if(mode&&ghost)rangeFx(ghost[0],ghost[1],mode);else if(sel&&!mode)rangeFx(sel.x,sel.y,sel.id);wat(t);while(WK.length<Math.min(14,Math.round(S.pop/2))&&S.bld.length)WK.push({x:S.bld[0].x,y:S.bld[0].y,tx:0,ty:0});while(WK.length>Math.round(S.pop/2))WK.pop();
 const tg=S.bld.filter(b=>!b.t&&!B[b.id].flat);
 for(const w of WK){const d=Math.hypot(w.tx-w.x,w.ty-w.y);if(d<.1&&tg.length){const b=tg[Math.random()*tg.length|0];w.tx=b.x+(Math.random()-.5)*.6;w.ty=b.y+.6}else if(d>=.1){w.x+=(w.tx-w.x)/d*.8*dt;w.y+=(w.ty-w.y)/d*.8*dt}}
 const ws=WK.slice().sort((a,b)=>a.x+a.y-b.x-b.y);let wi=0;
 for(let s=0;s<2*N;s++){for(let x=Math.max(0,s-N+1);x<=Math.min(s,N-1);x++){const y=s-x,[cx,cy]=P(x,y);if(!vis(cx,cy))continue;const m=S.map[y*N+x],b=at(x,y),h=hs(x,y);
   g.globalAlpha=S.zones[zoneOf(x,y)]?1:.5;if(m==1){treeSpr(h*3|0,cx-10*z,cy+1*z,.95+h*.2);treeSpr(h*7|0,cx+9*z,cy+5*z,.85+h*.25);if(h>.5)treeSpr(h*11|0,cx+1*z,cy-6*z,.8)}else if(m==3){const c=SPR.rock;if(c)g.drawImage(c,cx-40*z,cy-44*z,80*z,60*z)}
   g.globalAlpha=1;if(b)drawB(b,cx,cy)}
  while(wi<ws.length&&ws[wi].x+ws[wi].y<s+1){const w=ws[wi++],[px,py]=P(w.x,w.y);{const c=SPR['v'+(wi%4)];if(c)g.drawImage(c,px-5*z,py-19*z-Math.abs(Math.sin(t*8+wi))*1.5*z,10*z,20*z)}}}
 if(mode&&ghost){const[cx,cy]=P(ghost[0],ghost[1]),ok=!why(mode,ghost[0],ghost[1]);dia(cx,cy,1,ok?'rgba(80,220,90,.5)':'rgba(230,60,50,.55)');SPR[mode]?spr(SPR[mode],cx,cy,.65):box(cx,cy,B[mode],.65)}
 if(sel&&!mode){const[cx,cy]=P(sel.x,sel.y);dp(cx,cy,1.05);g.strokeStyle='#e0b048';g.lineWidth=3;g.stroke()}
 {const gr=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(255,210,140,0)');gr.addColorStop(1,'rgba(30,20,10,.28)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
 if(!S.peace){const[px,py]=P(S.camp.x,S.camp.y);g.globalAlpha=1;if(SPR.camp)spr(SPR.camp,px,py,1);g.font=26*z+'px serif';g.textAlign='center';if(S.raid)g.fillText('⚔️'+S.raid.left,px,py-50*z)}
 if(battle){battle.t+=dt/4;const n=Math.min(10,3+battle.r.cnt);for(let i=0;i<n;i++){const u=cl(battle.t*1.2-i*.03,0,1),[px,py]=P(S.camp.x+(10-S.camp.x)*u+(i%3)*.3,S.camp.y+(10-S.camp.y)*u+(i/3|0)*.3);{const c=SPR.raider;if(c)g.drawImage(c,px-6*z,py-22*z,12*z,24*z)}}
  if(battle.t>=1.2){const r=battle.r;battle=null;dlg(`<h2>${r.win?'🛡️ Angriff abgewehrt':'🔥 Stadt geplündert'}</h2><p>${r.txt}</p>`);ui()}}
 for(let i=0;i<9;i++)if(!S.zones[i]){const[px,py]=P((i%3)*8+4,(i/3|0)*8+4);g.globalAlpha=1;g.font=28*z+'px serif';g.textAlign='center';g.fillText(zinfo(i).w.startsWith('Nur')?'🔒':'🗝️',px,py)}
 requestAnimationFrame(draw)}
// ---- Audio (Dateien in sound-*.wav, austauschbar) ----
const A={on:0};
function sfx(n,v=.5){if(!opt.sound||!A.on)return;const a=new Audio('sound-'+n+'.wav');a.volume=v;a.play().catch(()=>{})}
function amb(){if(!A.on)return;if(!A.w){A.w=new Audio('sound-wind.wav');A.w.loop=true;A.w.volume=.3;setInterval(()=>{if(opt.music&&Math.random()<.6){const b=new Audio('sound-bird.wav');b.volume=.25;b.play().catch(()=>{})}},9000)}opt.music?A.w.play().catch(()=>{}):A.w.pause()}
function unlock(){if(!A.on){A.on=1;amb()}}
// ---- Speicher (IndexedDB, atomare Transaktion, Versionsfeld) ----
const DB=()=>new Promise((ok,no)=>{const r=indexedDB.open('meridian',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const put=async(k,v)=>{const d=await DB();return new Promise((ok,no)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=ok;t.onerror=t.onabort=()=>no(t.error)})};
const get=async k=>{const d=await DB();return new Promise((ok,no)=>{const r=d.transaction('kv').objectStore('kv').get(k);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})};
let sT;function save(){clearTimeout(sT);sT=setTimeout(()=>put('save',{v:3,S,opt}).catch(()=>toast('Speichern fehlgeschlagen.')),400)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)put('save',{v:3,S,opt}).catch(()=>{})});
(async()=>{resize();try{const d=await get('save');if(d&&d.v===3&&d.S&&d.S.camp&&d.S.zones&&d.S.map&&d.S.map.length==N*N){S=d.S;opt=d.opt||opt;idx();centerOn(10,10)}}catch(e){}
 if(!S){newGame();dlg(HELP)}ui();requestAnimationFrame(draw);
 if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{})})();
