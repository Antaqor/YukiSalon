self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notification';
  const options = {
    body: data.body,
    icon: data.icon || '/android-chrome-192x192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
