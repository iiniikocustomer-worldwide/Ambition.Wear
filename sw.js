const CACHE_NAME = 'ambition-wear-v9';
const APP_SHELL = [
  './', './index.html', './shop.html', './story.html', './contact.html', './client-account.html',
  './site.css', './responsive-fix.css', './editorial-refresh.css', './product-shopping.css',
  './bag-drawer-fix.css', './story-contact-polish.css', './layout-repair.css',
  './ui-icons.css', './mobile-nav.css', './site.js', './brand-content.js',
  './white-space-content.css', './site-features.js', './site-repair.js', './ui-icons.js',
  './app-shell.js', './client-studio.css', './client-studio.js', './manifest.json',
  './Logo_20261111_210043_0000.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then((cache) => cache.addAll(APP_SHELL))
    .catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys
      .filter((key) => key.startsWith('ambition-wear-') && key !== CACHE_NAME)
      .map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      if (response?.ok) {
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone())));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
    return;
  }

  // Try the network first so catalog and site asset changes appear immediately
  // while online; keep a cached copy for visits when the network is unavailable.
  event.respondWith(fetch(event.request).then((response) => {
    if (response?.status === 200 && response.type === 'basic') {
      event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone())));
    }
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
});
