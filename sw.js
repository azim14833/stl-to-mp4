const V = 'm3d-v2', CORE = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const CDN = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if(r.method !== 'GET') return;
  const u = new URL(r.url); if(u.origin !== location.origin && !CDN.includes(u.hostname)) return;
  if(r.mode === 'navigate'){
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(h => h || caches.match('./'))));
    return;
  }
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r), net = fetch(r).then(res => { if(res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
