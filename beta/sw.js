// 旧 beta/ 用 Service Worker の登録を解除するだけの SW。beta/ の確認版は SW を使わない（常にネットワークから取得）。
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));
