'use strict';
const CACHE='upward-private-v59';
const FILES=["./","./index.html","./styles.css","./journal.css","./local.css","./life.css","./hotspots.js","./weather.js","./countdown.js","./data-model.js","./backup-model.js","./local.js","./journal.js","./app.js","./icon.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest","./offline-files.json","./cats.css","./cats.js","./assets/cat-stickers/head.png","./assets/cat-stickers/sit.png","./assets/cat-stickers/nap.png","./assets/cat-stickers/meow-head.png","./assets/cat-stickers/meow.png","./assets/cat-stickers/birthday.png","./assets/cat-stickers/lounge.png","./assets/cat-stickers/legs.png","./assets/cat-stickers/hang.png","./assets/cat-stickers/lookback.png","./assets/cat-stickers/window.png","./assets/cat-stickers/curl.png","./assets/cat-stickers/loaf.png","./assets/cat-stickers/paw.png","./assets/cat-stickers/funny.png","./assets/cat-stickers/reach.png","./desk-theme.css","./assets/cat-stickers/tucked.png","./assets/cat-stickers/cuddle.png","./assets/journal/leather-notebook.png","./real-tapes.css","./assets/tapes/black-dot.png","./assets/tapes/black.png","./assets/tapes/blue-stripe.png","./assets/tapes/butter.png","./assets/tapes/cream.png","./assets/tapes/orange-dot.png","./assets/tapes/red-stripe.png","./assets/tapes/sage.png","./assets/tapes/silver.png","./assets/tapes/sky.png","./real-clips.css","./assets/clips/flowers.png","./assets/clips/lavender.png","./assets/clips/mint.png","./assets/clips/patchwork.png","./assets/clips/pink.png","./assets/clips/plaid.png","./assets/clips/red.png","./assets/clips/stars.png","./assets/clips/yellow-dot.png","./happy-notes.css","./assets/fonts/Xiaolai-journal.woff2","./assets/fonts/OFL-Xiaolai.txt","./books.css","./books.js","./health.css","./health.js","./nav-order.css","./nav-order.js","./sleep.js","./sleep.css"];
const SHELL=new Set(FILES.map(file=>new URL(file,self.location.href).pathname));
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(file=>new Request(new URL(file,self.location.href),{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('upward-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  // Cache only our explicit app shell, including mascot artwork and the supplied cat photo stickers; never private stored records or API responses.
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!SHELL.has(url.pathname))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request,{ignoreSearch:true});
    return cached||fetch(event.request);
  }));
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='CHECK_OFFLINE')return;
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    const ready=(await Promise.all(FILES.map(file=>cache.match(new URL(file,self.location.href),{ignoreSearch:true})))).every(Boolean);
    event.source?.postMessage({type:'OFFLINE_STATUS',ready,cache:CACHE});
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const url=new URL('./#countdown',self.location.href).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
    const client=windows.find(client=>new URL(client.url).origin===self.location.origin);
    if(client){await client.navigate(url);return client.focus();}return self.clients.openWindow(url);
  }));
});
