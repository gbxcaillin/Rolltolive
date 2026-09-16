// Outborn service worker: makes the game installable and playable offline.
// - The shell (index.html, manifest, icons) is precached on install.
// - Art (art/*) is cached on first use; its URLs carry ?v=BUILD so a new build fetches new files.
// - index.html is network-first so a deploy shows up on the next launch; if the network is down the cached copy runs.
// SW_VERSION is stamped by the deploy scripts; a new version drops old caches on activate.
const SW_VERSION = 'a22e80b 20260916-1144';
const SHELL_CACHE = 'outborn-shell-' + SW_VERSION;
const ART_CACHE = 'outborn-art-' + SW_VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL_CACHE && k !== ART_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;
  const isShell = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/manifest.webmanifest');
  if (isShell) { // network first, cache fallback
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(SHELL_CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  // everything else (art, icons): cache first, then network and store
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && (r.type === 'basic' || r.type === 'default')) { const copy = r.clone(); caches.open(ART_CACHE).then(c => c.put(req, copy)); } return r; })));
});
