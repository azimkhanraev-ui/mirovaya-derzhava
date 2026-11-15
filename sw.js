/* Служебный работник приложения «Мировая Держава»: игра запускается и без интернета (одиночная партия).
   Сначала всегда пробуем сеть — так обновления приходят сразу; без сети берём сохранённую копию. */
const CACHE = 'md-app-v1';
const CORE = ['play.html', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('version.json') || u.pathname.includes('/download/')) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && (u.pathname.endsWith('play.html') || /\.(png|webmanifest|jpg)$/.test(u.pathname))) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(u.pathname.endsWith('play.html') ? 'play.html' : e.request, cp)); }
    return r;
  }).catch(() => caches.match(u.pathname.endsWith('play.html') ? 'play.html' : e.request).then(r => r || caches.match('play.html'))));
});
