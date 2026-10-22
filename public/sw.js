// Service worker do My Daily Habits: deixa o app abrir sem internet.
// Páginas: rede primeiro (para pegar versões novas), cópia salva se estiver offline.
// Arquivos (JS, CSS, ícones, sugestões): responde com a cópia salva e atualiza em segundo plano.
const CACHE = "my-daily-habits-v4";
// Fotos dos exercícios (Free Exercise DB, no GitHub): não mudam, então ficam guardadas.
const EXERCISE_CACHE = "my-daily-habits-exercicios-v1";
const EXERCISE_HOST = "raw.githubusercontent.com";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/", "/manifest.webmanifest", "/favicon.svg"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key !== EXERCISE_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET") return;

  if (url.hostname === EXERCISE_HOST && url.pathname.startsWith("/yuhonas/free-exercise-db/")) {
    event.respondWith(
      caches.open(EXERCISE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || fresh;
    }),
  );
});

// Lembretes: a função send-reminders manda { title, body, url, tag }.
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "My Daily Habits", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag ?? "lembrete-diario",
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => "focus" in client);
      if (!open) return self.clients.openWindow(url);
      return open.navigate(url).then((client) => (client ?? open).focus());
    }),
  );
});
