const CACHE='wos-v8';
// オフライン対応の対象（ホームから辿れる4ツール＋ホーム自身）。他の独立ツールは対象外。
const APP_FILES=['./','./index.html','./gear-gem-calculator.html','./fc-calculator.html','./resource-calc.html','./heal-calculator.html','./manifest.json','./sw.js'];
const APP_URLS=new Set(APP_FILES.map(f=>new URL(f,self.registration.scope).href));
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  // 対象外のページ（phase2/3、予定告知メーカー等）はキャッシュせずネットワークにそのまま任せる
  if(!APP_URLS.has(e.request.url)) return;
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,clone));
      return res;
    }))
  );
});
