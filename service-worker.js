const V='meridian-v1',F=['./','index.html','manifest.json','css/main.css','js/game.js','assets/icons/icon-180.png','assets/icons/icon-192.png','assets/icons/icon-512.png',...['wind','bird','click','build','bell'].map(n=>`assets/audio/${n}.wav`)];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
