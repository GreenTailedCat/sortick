const CACHE_NAME = "sortick-v1-10-sorteios-salvos-cache";

const APP_SHELL = [
  "/",
  "/sorteio/",
  "/offline/",
  "/sobre/",
  "/privacidade/",
  "/termos/",
  "/sorteio-por-nomes/",
  "/roleta/",
  "/cartela-de-rifa/",
  "/bingo/",
  "/grupos/",
  "/css/style.css",
  "/js/utils.js",
  "/js/index.js",
  "/js/sorteio.js",
  "/js/pwa.js",
  "/js/official-domain.js",
  "/js/analytics.js",
  "/js/clean-url.js",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/assets/favicon.svg",
  "/assets/logo.svg",
  "/assets/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
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

function isHtmlRequest(request) {
  return request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    const redirects = {
      "/index.html": "/",
      "/sobre.html": "/sobre/",
      "/termos.html": "/termos/",
      "/privacidade.html": "/privacidade/",
      "/offline.html": "/offline/",
      "/sorteio.html": "/sorteio/"
    };

    if (Object.prototype.hasOwnProperty.call(redirects, url.pathname)) {
      url.pathname = redirects[url.pathname];
      event.respondWith(Response.redirect(url.toString(), 301));
      return;
    }
  }

  if (isHtmlRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached || caches.match("/offline/"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/offline/"));
    })
  );
});
