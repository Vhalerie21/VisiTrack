const CACHE_NAME = "visitrack-shell-v9";
const APP_SHELL = [
  new URL("./index.html", self.registration.scope).href,
  new URL("./LoginPage.html", self.registration.scope).href,
  new URL("./Registration.html", self.registration.scope).href,
  new URL("./PrivacyNotice.html", self.registration.scope).href,
  new URL("./SecurityDB.html", self.registration.scope).href,
  new URL("./main.css", self.registration.scope).href,
  new URL("./index.css", self.registration.scope).href,
  new URL("./LoginPage.css", self.registration.scope).href,
  new URL("./Registration.css", self.registration.scope).href,
  new URL("./PrivacyNotice.css", self.registration.scope).href,
  new URL("./SecurityDB.css", self.registration.scope).href,
  new URL("./SecurityDB.js", self.registration.scope).href,
];
const API_PATH_PREFIX = new URL("./api/", self.registration.scope).pathname;

function isCacheableResponse(request, response) {
  const cacheControl = response.headers.get("Cache-Control") || "";
  return (
    request.method === "GET" &&
    response.status === 200 &&
    response.type === "basic" &&
    !request.headers.has("Authorization") &&
    !/\b(private|no-store)\b/i.test(cacheControl) &&
    !request.headers.has("Range")
  );
}

async function cacheResponse(request, response) {
  if (isCacheableResponse(request, response)) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

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

  if (
    requestUrl.pathname === API_PATH_PREFIX.slice(0, -1) ||
    requestUrl.pathname.startsWith(API_PATH_PREFIX)
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(async () => {
          const cachedPage = await caches.match(request, { ignoreSearch: true });
          if (cachedPage) {
            return cachedPage;
          }

          const cachedHome = await caches.match(
            new URL("./index.html", self.registration.scope).href
          );
          if (cachedHome) {
            return cachedHome;
          }

          throw new Error("No cached VisiTrack page is available offline.");
        })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!request.destination) {
          return response;
        }
        return cacheResponse(request, response);
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw new Error(`No cached response is available for ${requestUrl.pathname}.`);
      })
  );
});
