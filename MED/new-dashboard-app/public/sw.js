// Service Worker for handling notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  if (action === 'taken') {
    // Mark medication as taken
    event.waitUntil(
      fetch('/api/medication-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: data.medicationId,
          scheduledTime: data.scheduledTime,
          date: new Date().toISOString().split('T')[0],
          takenAt: new Date().toISOString(),
        }),
      }).then(() => {
        // Show success notification
        self.registration.showNotification('Medication Recorded', {
          body: `${data.medicationName} marked as taken!`,
          icon: '/favicon.svg',
          tag: 'medication-taken',
          requireInteraction: false,
        });
      })
    );
  } else if (action === 'snooze') {
    // Schedule a new reminder in 10 minutes
    const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
    event.waitUntil(
      fetch('/api/notifications/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: data.notificationId,
          snoozeUntil: snoozeTime.toISOString(),
        }),
      })
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // Try to focus an existing window
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow('/dashboard');
        }
      })
    );
  }

  // Mark notification as read
  if (data.notificationId) {
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: data.notificationId }),
    });
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const data = event.notification.data;
  
  // Mark notification as dismissed
  if (data.notificationId) {
    fetch('/api/notifications/mark-dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: data.notificationId }),
    });
  }
});

// Handle background sync for offline scenarios
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      fetch('/api/notifications/pending')
        .then(response => response.json())
        .then(notifications => {
          notifications.forEach(notification => {
            if (new Date(notification.scheduledFor) <= new Date()) {
              self.registration.showNotification(notification.title, {
                body: notification.message,
                icon: '/favicon.svg',
                data: notification.data,
              });
            }
          });
        })
    );
  }
});

// Handle push notifications from server
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: data.data,
    requireInteraction: data.priority === 'urgent',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});