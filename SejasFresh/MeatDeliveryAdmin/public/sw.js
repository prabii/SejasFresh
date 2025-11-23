// Service Worker for Web Push Notifications
// This enables background notifications even when browser is closed

self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Sejas Fresh', body: event.data.text() || 'New notification' };
    }
  } else {
    data = { title: 'Sejas Fresh', body: 'You have a new notification' };
  }

  const title = data.title || 'Sejas Fresh';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'sejas-admin',
    data: data.data || data.metadata || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  let url = '/';
  
  if (data.screen === 'orders') {
    url = '/orders';
  } else if (data.url) {
    url = data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service worker activated');
  event.waitUntil(self.clients.claim());
});

