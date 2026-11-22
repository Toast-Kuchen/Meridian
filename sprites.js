'use strict';
// SVG-Sprites: werden einmal in Offscreen-Canvases gerastert (80x110, 2x). Anker = Kachelmitte bei (40,84).
const SPR={},SM={};
(function(){
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),
sh=(c,f)=>'#'+[1,3,5].map(i=>{const v=parseInt(c.substr(i,2),16);return cl(Math.round(f>1?v+(255-v)*(f-1):v*f),0,255).toString(16).padStart(2,'0')}).join(''),
P=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
pl=(a,f,e='')=>`<polygon points="${P(a)}" fill="${f}" ${e}/>`,
ln=(a,b,c,w=1,o=1)=>`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`,
lp=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k],
ci=(x,y,r,f)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`,
dia=(cx,cy,hw,hh)=>[[cx-hw,cy],[cx,cy+hh],[cx+hw,cy],[cx,cy-hh]],
mk=(n,svg,w,h,sc=2)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=w*sc;c.height=h*sc;c.getContext('2d').drawImage(im,0,0,c.width,c.height);SPR[n]=c};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w*sc}" height="${h*sc}" viewBox="0 0 ${w} ${h}">${svg}</svg>`)},
base=(f='#b59a6e',o=.5)=>pl(dia(43,87,30,15),'rgba(0,0,0,.2)')+pl(dia(40,84,30,15),f,`fill-opacity="${o}"`);
function hut(o){const s=o.s||1,cx=40+(o.ox||0),cy=84+(o.oy||0),h=o.h,rh=o.rh||0,hw=26*s,hh=13*s,w=o.w,
 L=(u,v)=>[cx-hw+hw*u,cy+hh*u-v],R=(u,v)=>[cx+hw*u,cy+hh-hh*u-v];let x=pl(dia(cx+3,cy+3,hw+2,hh+1),'rgba(0,0,0,.22)');
 x+=pl([L(0,0),L(1,0),L(1,h),L(0,h)],w)+pl([R(0,0),R(1,0),R(1,h),R(0,h)],sh(w,.74));
 for(const f of[L,R]){if(o.st=='timber'){for(const u of[0,.5,1])x+=ln(f(u,0),f(u,h),'#4a3320',1.2);for(const v of[0,h*.5,h])x+=ln(f(0,v),f(1,v),'#4a3320',1.2);x+=ln(f(0,0),f(.5,h*.5),'#4a3320',.9)+ln(f(1,0),f(.5,h*.5),'#4a3320',.9)}
  else if(o.st=='stone')for(let k=1;k<h/4;k++){x+=ln(f(0,k*4),f(1,k*4),sh(w,.7),.6);for(let u=k%2?.15:.4;u<1;u+=.25)x+=ln(f(u,k*4),f(u,k*4-4),sh(w,.7),.6)}}
 const wn=(f,u,v,g)=>pl([f(u,v),f(u+.16,v),f(u+.16,v+6),f(u,v+6)],g?'#f3c969':'#2d3b4d','stroke="#efe3c4" stroke-width=".8"'),rows=o.rows||1;
 for(let r=0;r<rows;r++){const v=rows>1?h*(.25+.4*r)+1:h*.5;x+=wn(L,.6,v,o.glow)+(o.st=='timber'||rows>1?wn(L,.8,v,0):'')+wn(R,.25,v,0)+wn(R,.6,v,o.glow)}
 if(o.door){const k=L(.36,h*.3);x+=pl([L(.18,0),L(.4,0),L(.4,h*.6),L(.18,h*.6)],'#4a2f1b','stroke="#2a1a0e" stroke-width=".6"')+ci(k[0],k[1],.7,'#e0b048')}
 const TL=L(0,h),TB=L(1,h),TR=R(1,h),TT=[cx,cy-hh-h],rf=o.r;
 if(o.flat){x+=pl([TL,TB,TR,TT],sh(w,1.18),'stroke="rgba(0,0,0,.25)" stroke-width=".6"');if(o.mer)for(const u of[.1,.4,.7])x+=pl([L(u,h),L(u+.15,h),L(u+.15,h+3),L(u,h+3)],sh(w,1.05))+pl([R(u,h),R(u+.15,h),R(u+.15,h+3),R(u,h+3)],sh(w,.8))}
 else if(o.hip){const A=[cx,cy-h-rh];x+=pl([TL,TB,A],rf)+pl([TB,TR,A],sh(rf,.72))+ln(TL,A,sh(rf,.6),.6)+ln(TB,A,sh(rf,.6),.6)}
 else{const M1=lp(TL,TT,.5),M2=lp(TB,TR,.5),a=[M1[0],M1[1]-rh],b=[M2[0],M2[1]-rh];
  x+=pl([TB,TR,b],sh(w,.74))+pl([TL,TB,b,a],rf,'stroke="rgba(0,0,0,.25)" stroke-width=".6"');
  for(let k=1;k<5;k++)x+=ln(lp(TL,a,k/5),lp(TB,b,k/5),sh(rf,.7),.7,.6);
  x+=ln(a,b,sh(rf,1.25),1.4)+ln(TL,TB,sh(rf,.55),1.2);
  if(o.chim){const m=lp(a,b,o.chim);x+=`<rect x="${m[0]-3}" y="${m[1]-6}" width="6" height="9" fill="#8f7d6c"/><rect x="${m[0]-4}" y="${m[1]-8}" width="8" height="3" fill="#6d5e50"/>`;SM[o.id]=[m[0]-40,m[1]-9-84]}}
 return x}
const stall=(x,y,c)=>{const a0=[x,y-16],a1=[x+18,y-7],b0=[x,y-10],b1=[x+18,y-1];let r=ln([x,y+3],[x,y-14],'#5a4028',1.5)+ln([x+18,y+12],[x+18,y-3],'#5a4028',1.5)+pl([[x,y-2],[x+18,y+7],[x+18,y+12],[x,y+3]],'#8a6a3a')+ci(x+5,y+1,2,'#d9533a')+ci(x+10,y+3.5,2,'#e8c34a')+ci(x+14,y+5.5,2,'#7ab648');
 for(let i=0;i<3;i++)r+=pl([lp(a0,a1,i/3),lp(a0,a1,(i+1)/3),lp(b0,b1,(i+1)/3),lp(b0,b1,i/3)],i%2?'#f2ead8':c);return r},
tent=(x,y,c)=>pl([[x-12,y],[x,y-26],[x+12,y]],c,'stroke="rgba(0,0,0,.3)" stroke-width=".6"')+pl([[x,y-26],[x+12,y],[x+3,y]],'rgba(0,0,0,.22)')+pl([[x-3,y],[x,y-9],[x+3,y]],'#2a1a0e'),
log=(a,b)=>`<rect x="${a}" y="${b}" width="14" height="5" rx="2.5" fill="#8a5f34"/><ellipse cx="${a+12}" cy="${b+2.5}" rx="2" ry="2.4" fill="#d6b07a"/>`;
const D={
house:()=>base()+hut({id:'house',w:'#e6d6b0',r:'#b04a32',h:18,rh:14,st:'timber',door:1,chim:.3,glow:1}),
burgher:()=>base()+hut({id:'burgher',w:'#dccbaa',r:'#8f3b2a',h:30,rh:16,st:'timber',door:1,chim:.25,rows:2,glow:1}),
farm:()=>{let f=pl(dia(40,84,30,15),'#b8a04a','stroke="#6b5a2a"');for(let k=1;k<9;k++)f+=ln(lp([10,84],[40,69],k/9),lp([40,99],[70,84],k/9),k%2?'#8f7a2e':'#d9bd5a',1.6,.9);
 return f+hut({id:'farm',ox:-2,oy:-6,s:.55,w:'#c9a66b',r:'#7a5a35',h:16,rh:12,st:'timber',door:1})+ci(58,93,3.5,'#e0c060')+ci(63,91,3,'#d4b24e')},
wood:()=>base('#8a7a5a',.55)+hut({id:'wood',ox:-8,oy:-6,s:.6,w:'#9c7a4a',r:'#5b4025',h:14,rh:10,st:'timber',door:1})+log(48,93)+log(52,88)+log(46,88),
quarry:()=>base('#9a9484',.8)+pl(dia(40,86,22,11),'#6f6a5f')+pl(dia(40,84,20,10),'#8d887b')+pl([[34,86],[40,82],[47,86],[44,91],[36,91]],'#b9b4a6','stroke="#6f6a5f" stroke-width=".6"')+pl([[48,89],[53,86],[58,90],[54,94],[49,93]],'#a9a496','stroke="#6f6a5f" stroke-width=".6"')+ln([20,88],[20,60],'#5a4028',2)+ln([20,62],[34,72],'#5a4028',1.6)+ln([34,72],[34,84],'#333',.8)+pl([[16,90],[24,86],[28,89],[20,94]],'#c9b78e'),
smith:()=>base('#6f6a60',.5)+hut({id:'smith',w:'#8f8c86',r:'#4a4a58',h:20,rh:14,st:'stone',door:1,chim:.55})+ci(22,82,2.6,'#ff8a2a')+pl([[52,93],[60,90],[58,94],[54,95]],'#333'),
bakery:()=>base()+hut({id:'bakery',w:'#f0dfba',r:'#c8682a',h:20,rh:14,st:'timber',door:1,chim:.5,glow:1})+`<ellipse cx="58" cy="93" rx="4" ry="2.2" fill="#c98a3a"/>`,
mill:()=>base('#9a9a7a',.5)+`<path d="M25 82 A15 7.5 0 0 0 55 82 L49 44 A9 4.5 0 0 0 31 44Z" fill="#e8dec6"/><path d="M40 89.5 A15 7.5 0 0 0 55 82 L49 44 L40 48.5Z" fill="rgba(0,0,0,.2)"/><path d="M30 44 A10 5 0 0 0 50 44 L40 24Z" fill="#7a5a35"/><path d="M40 49 L50 44 L40 24Z" fill="rgba(0,0,0,.2)"/><rect x="31" y="78" width="6" height="8" rx="3" fill="#4a2f1b"/><rect x="33" y="60" width="4" height="6" fill="#2d3b4d"/>`+ci(48,50,2.5,'#5a4028'),
market:()=>base('#c9b78e',.9)+stall(14,80,'#b8382a')+stall(38,86,'#2a6aa8')+`<ellipse cx="64" cy="90" rx="4" ry="2.5" fill="#8a5f34"/>`,
store:()=>base()+hut({id:'store',w:'#b79566',r:'#6b4a2a',h:22,rh:12,st:'timber',door:1})+`<rect x="56" y="87" width="7" height="8" rx="2" fill="#8a5f34"/><rect x="56" y="90" width="7" height="1" fill="#4a3320"/>`,
well:()=>base('#9aa08a',.6)+`<path d="M28 84 v-8 a12 6 0 0 0 24 0 v8 a12 6 0 0 1 -24 0z" fill="#aaa497"/><ellipse cx="40" cy="76" rx="12" ry="6" fill="#bdb7a8"/><ellipse cx="40" cy="76" rx="8.5" ry="4" fill="#3f78a8"/>`+ln([30,76],[30,56],'#5a4028',2)+ln([50,76],[50,56],'#5a4028',2)+pl([[26,58],[40,46],[54,58]],'#8a4a30')+pl([[40,46],[54,58],[40,58]],'rgba(0,0,0,.2)')+ln([40,58],[40,70],'#ccc',.6),
tower:()=>base('#6f6a60',.4)+hut({id:'tower',s:.62,h:46,rh:16,hip:1,w:'#b8b2a2',r:'#7a3b2a',st:'stone',door:1})+ln([40,22],[40,10],'#333',.8)+pl([[40,10],[50,13],[40,16]],'#c0392b'),
guard:()=>base()+hut({id:'guard',w:'#a9a597',r:'#3d5a9a',h:22,rh:14,st:'stone',door:1})+ln([64,92],[64,58],'#4a3320',1.2)+pl([[64,58],[74,61],[64,67]],'#3d5a9a'),
fish:()=>base('#b59a6e',.5)+hut({id:'fish',s:.6,ox:-6,oy:-4,w:'#b59a6e',r:'#4a6a7a',h:14,rh:10,st:'timber',door:1})+ln([52,84],[52,96],'#5a4028',1.5)+ln([62,80],[62,92],'#5a4028',1.5)+ln([52,88],[62,84],'#d9d2b8',1)+ln([52,92],[62,88],'#d9d2b8',1)+pl([[46,94],[58,94],[56,98],[48,98]],'#8a5f34'),
wall:()=>hut({id:'wall',s:.9,h:14,flat:1,mer:1,w:'#b5b0a0',st:'stone'}),
road:()=>{let r=pl(dia(40,84,30,15),'#a89878','stroke="#7d6f55" stroke-width=".6"');for(let i=0;i<16;i++){const a=i*2.4,q=(i%5+1)/6;r+=`<ellipse cx="${(40+Math.cos(a)*q*24).toFixed(1)}" cy="${(84+Math.sin(a)*q*11).toFixed(1)}" rx="4.5" ry="2.4" fill="${i%2?'#c4b693':'#b3a487'}" stroke="#8d7f63" stroke-width=".4"/>`}return r},
camp:()=>base('#6f5a3a',.6)+tent(26,90,'#a8452f')+tent(54,88,'#7a6a4a')+ci(40,93,2.2,'#ff8a2a')+ln([36,95],[44,94],'#4a3320',1.5)+ln([40,70],[40,40],'#4a3320',1.2)+pl([[40,40],[53,44],[40,50]],'#8a1c1c')};
for(const k in D)mk(k,D[k](),80,110);
const tr=(b)=>`<ellipse cx="22" cy="51" rx="9" ry="3" fill="rgba(0,0,0,.2)"/><rect x="18" y="38" width="4" height="13" fill="#5a3d22"/>`+b;
mk('tree0',tr(pl([[20,22],[36,46],[4,46]],'#2a5e34')+pl([[20,12],[33,34],[7,34]],'#3a7b44')+pl([[20,2],[30,22],[10,22]],'#4a8c52')+pl([[20,12],[33,34],[20,34]],'rgba(0,0,0,.18)')),40,56);
mk('tree1',tr(ci(20,24,14,'#3f7a35')+ci(12,28,9,'#356b2e')+ci(29,27,9,'#4a8a3c')+ci(18,18,8,'#5a9a46')+ci(24,14,5,'#6aaa52')),40,56);
mk('tree2',`<ellipse cx="22" cy="51" rx="8" ry="3" fill="rgba(0,0,0,.2)"/><rect x="18.5" y="26" width="3" height="25" fill="#e8e4d8"/><rect x="18.5" y="32" width="3" height="1.5" fill="#444"/><rect x="18.5" y="40" width="3" height="1.5" fill="#444"/>`+ci(20,18,11,'#8fb84a')+ci(14,23,7,'#7aa840')+ci(27,22,7,'#a3c95a'),40,56);
mk('rock',pl([[10,44],[22,20],[40,10],[58,18],[72,40],[60,52],[28,52]],'#9d9686')+pl([[22,20],[40,10],[44,28],[28,36]],'#b9b2a1')+pl([[40,10],[58,18],[56,34],[44,28]],'#a8a191')+pl([[58,18],[72,40],[60,52],[56,34]],'#807a6c')+pl([[28,36],[44,28],[56,34],[60,52],[28,52]],'#8f897a')+ci(30,18,3,'#5f8a3f')+ci(36,13,2.5,'#6a9a45'),80,60);
mk('tuft',ln([4,9],[2,3],'#4f7a35',1)+ln([7,9],[8,2],'#5f8a40',1)+ln([10,9],[13,4],'#4f7a35',1),16,10,3);
mk('flower',ln([5,9],[5,4],'#4f7a35',.8)+ci(5,3.5,1.8,'#f4e04a')+ln([11,9],[11,5],'#4f7a35',.8)+ci(11,4.5,1.8,'#f2f2f2'),16,10,3);
['#a8452f','#3d6a9a','#6a8a3a','#8a6a3a'].forEach((c,i)=>mk('v'+i,`<rect x="3" y="14" width="1.8" height="6" fill="#4a3a2a"/><rect x="5.2" y="14" width="1.8" height="6" fill="#4a3a2a"/>`+pl([[2,7],[8,7],[7.5,15],[2.5,15]],c)+ci(5,4.5,2.4,'#e8c9a0')+`<path d="M2.6 4 A2.4 2.4 0 0 1 7.4 4Z" fill="${i%2?'#5a3d22':'#d9bd5a'}"/>`,10,20,3));
mk('raider',`<rect x="3.5" y="17" width="2" height="7" fill="#2a2a2a"/><rect x="6.5" y="17" width="2" height="7" fill="#2a2a2a"/>`+pl([[2.5,9],[9.5,9],[9,18],[3,18]],'#8a1c1c')+ci(6,6,2.8,'#e0b890')+`<path d="M3 5.5 A3 3 0 0 1 9 5.5Z" fill="#777"/>`+ln([10,7],[11,19],'#ddd',1)+ln([3,12],[1,16],'#6a1010',1.2),12,24,3);
})();
