const CACHE_NAME = "sortick-v1-4-2-cache";

const APP_SHELL = [
  "./",
  "./index.html",
  "./sorteio.html",
  "./offline.html",
  "./sobre.html",
  "./privacidade.html",
  "./termos.html",
  "./css/style.css",
  "./js/utils.js",
  "./js/index.js",
  "./js/sorteio.js",
  "./js/pwa.js",
  "./manifest.webmanifest",
  "./CHANGELOG.md",
  "./ROADMAP.md",
  "./DEPLOY.md",
  "./CHECKLIST.md",
  "./robots.txt",
  "./assets/favicon.svg",
  "./assets/logo.svg",
  "./assets/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./offline.html"));
    })
  );
});
