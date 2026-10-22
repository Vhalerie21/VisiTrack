const CACHE_NAME = "visitrack-shell-v10";
const APP_SHELL = [
  new URL("./index.html", self.registration.scope).href,
  new URL("./LoginPage/Front-End/LoginPage.html", self.registration.scope).href,
  new URL("./Registration/Front-End/Registration.html", self.registration.scope).href,
  new URL("./PrivacyNotice/Front-End/PrivacyNotice.html", self.registration.scope).href,
  new URL("./SecurityDB/Front-End/SecurityDB.html", self.registration.scope).href,
  new URL("./referenceno/FRONTEND/reference.html", self.registration.scope).href,
  new URL("./qrlandingpage/FRONTEND/index.html", self.registration.scope).href,
  new URL("./qrlandingpage/FRONTEND/checkin.html", self.registration.scope).href,
  new URL("./ticketpage/FRONTEND/ticket.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/dashboard.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/visitor-logs.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/storage-slots.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/reports.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/audit-trail.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/personnel-accounts.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/settings.html", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/login-placeholder.html", self.registration.scope).href,
  new URL("./main.css", self.registration.scope).href,
  new URL("./index.css", self.registration.scope).href,
  new URL("./LoginPage/Front-End/LoginPage.css", self.registration.scope).href,
  new URL("./Registration/Front-End/Registration.css", self.registration.scope).href,
  new URL("./PrivacyNotice/Front-End/PrivacyNotice.css", self.registration.scope).href,
  new URL("./SecurityDB/Front-End/SecurityDB.css", self.registration.scope).href,
  new URL("./SecurityDB/Back-End/SecurityDB.js", self.registration.scope).href,
  new URL("./referenceno/FRONTEND/reference.css", self.registration.scope).href,
  new URL("./referenceno/FRONTEND/reference.js", self.registration.scope).href,
  new URL("./qrlandingpage/FRONTEND/tokens.css", self.registration.scope).href,
  new URL("./qrlandingpage/FRONTEND/base.css", self.registration.scope).href,
  new URL("./qrlandingpage/FRONTEND/checkin.css", self.registration.scope).href,
  new URL("./qrlandingpage/FRONTEND/checkin.js", self.registration.scope).href,
  new URL("./qrlandingpage/FRONTEND/api.js", self.registration.scope).href,
  new URL("./ticketpage/FRONTEND/ticket.css", self.registration.scope).href,
  new URL("./ticketpage/FRONTEND/ticket.js", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/tokens.css", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/base.css", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/layout.css", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/pages.css", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/config.js", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/constants.js", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/mock-data.js", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/api.js", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/ui.js", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/layout.js", self.registration.scope).href,
  new URL("./admin-dashboard/FRONTEND/app.js", self.registration.scope).href,
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
