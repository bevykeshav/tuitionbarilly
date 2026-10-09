const C='tuition-v2';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png',
'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET'||r.url.includes('script.google.com'))return;
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).then(x=>{const y=x.clone();caches.open(C).then(c=>c.put('./index.html',y));return x}).catch(()=>caches.match('./index.html')));
  return;
 }
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{const y=x.clone();caches.open(C).then(c=>c.put(r,y));return x})));
});
