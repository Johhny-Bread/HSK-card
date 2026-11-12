// 오프라인용 캐시. 파일을 고쳐 올릴 때는 VERSION 숫자를 하나 올려 주세요.
const VERSION = "hsk-v2";
const FILES = ["./", "index.html", "words.js", "gloss.js", "hanzi.js", "manifest.webmanifest", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    // 글꼴처럼 처음 받는 파일도 다음부터는 오프라인에서 쓰도록 저장
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes("fonts.g"))) {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match("index.html"))));
});
