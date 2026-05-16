// Eurovision 2026 — Service Worker for Push Notifications
const CACHE = 'esc2026-v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Listen for push messages from the main thread
self.addEventListener('message', e => {
  if(e.data?.type === 'CHAT_NOTIFY'){
    const { sender, message } = e.data;
    self.registration.showNotification('💬 ' + sender, {
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'chat-message',       // replaces previous notification instead of stacking
      renotify: true,            // vibrate/sound even if same tag
      data: { url: self.location.origin + '/index.html' },
      actions: [{ action: 'open', title: 'Open Chat' }]
    });
  }
});

// Notification click — focus tab or open new one
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for(const c of list){
        if(c.url.includes('eurovision') || c.url.includes('alleu.com')){
          return c.focus().then(client => {
            // Only postMessage if client is still alive
            try { client.postMessage({ type: 'OPEN_CHAT' }); } catch(e) {}
          });
        }
      }
      return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});
