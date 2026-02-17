const CACHE = "ils-readings-pwa-v23";
const ASSETS = [
  "./",
  "./index.html",
  "./ILS_Readings_fixed_v3.html",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./icons/icon-512x512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      const url = new URL(req.url);
      if (url.origin === self.location.origin) cache.put(req, fresh.clone());
      return fresh;
    } catch {
      return (await cache.match("./index.html")) || (await cache.match("./ILS_Readings_fixed_v3.html"));
    }
  })());
});
