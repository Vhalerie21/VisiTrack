const CACHE_NAME = "visitrack-shell-v4";
const APP_SHELL = [
  new URL("./index.html", self.registration.scope).href,
  new URL("./LoginPage.html", self.registration.scope).href,
  new URL("./main.css", self.registration.scope).href,
  new URL("./index.css", self.registration.scope).href,
  new URL("./LoginPage.css", self.registration.scope).href,
];
const APP_SHELL_URLS = new Set(APP_SHELL);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith("visitrack-shell-") &&
              cacheName !== CACHE_NAME
          )
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const page = requestUrl.pathname.endsWith("/LoginPage.html")
          ? "./LoginPage.html"
          : "./index.html";
        const cachedPage = await caches.match(
          new URL(page, self.registration.scope).href
        );
        if (cachedPage) {
          return cachedPage;
        }
        throw new Error("No cached VisiTrack page is available offline.");
      })
    );
    return;
  }

  if (!APP_SHELL_URLS.has(requestUrl.href)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request);
    })
  );
});
