/**
 * Zin Music - Advanced Offline Service Worker
 * Supports Full Offline Playback, Background Media Caching, and Byte-Range Slicing for Offline Video/Audio
 */

const CACHE_NAME = "zin-love-cache-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.svg",
  "./favicon.ico",
  "./css/main.css",
  "./css/components.css",
  "./css/visualizer.css",
  "./css/responsive.css",
  "./js/data.js",
  "./js/thumbnail-generator.js",
  "./js/audio-engine.js",
  "./js/player.js",
  "./js/playlist.js",
  "./js/offline-manager.js",
  "./js/ui.js",
  "./js/app.js",
  "./thumbnails/zin-track-hakbang.jpg",
  "./thumbnails/zin-track-kung.jpg",
  "./thumbnails/zin-track-kung-pt2.jpg",
  "./thumbnails/zin-track-mahika.jpg",
  "./thumbnails/zin-track-slow-dance.jpg",
  "./thumbnails/zin-track-starry-night.jpg",
  "./thumbnails/zin-track-tinatangi.jpg",
  "./thumbnails/zin-track-with-u.jpg",
  "./thumbnails/clip-1.jpg",
  "./thumbnails/clip-2.jpg",
  "./thumbnails/clip-3.jpg"
];

// 1. Install & Cache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn("Some core assets failed to pre-cache:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate & Clean Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Handler with Byte-Range Support for Offline Media
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Handle Range Requests (Audio / Video seeking offline)
  const rangeHeader = request.headers.get("Range");
  if (rangeHeader) {
    event.respondWith(handleRangeRequest(request, rangeHeader));
    return;
  }

  // Cache-First for static assets, thumbnails, and media files
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background for non-media files
        if (!url.pathname.endsWith(".mp4")) {
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      // Fetch from network and cache
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation
        if (request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});

/**
 * Handles HTTP Range requests from CacheStorage to enable full offline audio/video streaming & seeking
 */
async function handleRangeRequest(request, rangeHeader) {
  try {
    const cache = await caches.open(CACHE_NAME);
    let cachedResponse = await cache.match(request, { ignoreSearch: true });

    if (!cachedResponse) {
      // Try network if online
      try {
        const netRes = await fetch(request);
        return netRes;
      } catch (e) {
        return new Response(null, { status: 404, statusText: "Offline and not cached" });
      }
    }

    const arrayBuffer = await cachedResponse.arrayBuffer();
    const totalBytes = arrayBuffer.byteLength;

    // Parse Range Header (e.g. "bytes=0-1024" or "bytes=1024-")
    const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (!matches) {
      return cachedResponse;
    }

    const start = parseInt(matches[1], 10);
    const end = matches[2] ? parseInt(matches[2], 10) : totalBytes - 1;

    if (start >= totalBytes || end >= totalBytes) {
      return new Response(null, {
        status: 416,
        statusText: "Range Not Satisfiable",
        headers: { "Content-Range": `bytes */${totalBytes}` }
      });
    }

    const slicedBuffer = arrayBuffer.slice(start, end + 1);

    return new Response(slicedBuffer, {
      status: 206,
      statusText: "Partial Content",
      headers: {
        "Content-Type": cachedResponse.headers.get("Content-Type") || "video/mp4",
        "Content-Length": slicedBuffer.byteLength.toString(),
        "Content-Range": `bytes ${start}-${end}/${totalBytes}`,
        "Accept-Ranges": "bytes"
      }
    });
  } catch (err) {
    return fetch(request).catch(() => new Response(null, { status: 500 }));
  }
}
