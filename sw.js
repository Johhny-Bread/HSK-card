// 오프라인용 캐시. 파일을 고쳐 올릴 때는 VERSION 숫자를 하나 올려 주세요.
// 페이지와 스크립트는 인터넷이 되면 항상 새로 받고, 안 될 때만 캐시를 씀.
const VERSION = "hsk-v3";
const FILES = ["./", "index.html", "words.js", "gloss.js", "hanzi.js", "manifest.webmanifest", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = e.request.url;
  const same = url.startsWith(self.location.origin);
  if (same){
    // 네트워크 우선: 새 버전이 바로 보이게
    e.respondWith(fetch(e.request, {cache: "no-cache"}).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html"))));
    return;
  }
  // 글꼴 등 외부 파일: 캐시 우선
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && url.includes("fonts.g")){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  })));
});
