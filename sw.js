const V = 'm3d-v7', CORE = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const CDN = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V && x !== 'm3d-share').map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  if(r.method === 'POST' && new URL(r.url).pathname.endsWith('/share-target')){
    e.respondWith((async () => { try{ const fd = await r.formData(), c = await caches.open('m3d-share'); for(const k of await c.keys()) await c.delete(k); let i = 0; for(const f of fd.getAll('models')) if(f && f.name) await c.put(new URL('shared/' + (i++) + '/' + encodeURIComponent(f.name), self.registration.scope).href, new Response(f)); }catch(err){} return Response.redirect(new URL('./?share=1', self.registration.scope).href, 303); })());
    return;
  }
  if(r.method !== 'GET') return;
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
