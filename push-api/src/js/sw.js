const applicationServerPublicKey = 'BI4VPQqyyJbIA-f95VqbjUAOYNhhCAxV6XP_nCMvGkB6i4pgrPrK54N9qTmzI6NNfhmgDGlttACcx3KjjnBhs20';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icon.png',
    badge: '/images/badge.png'
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  console.log(event)

  event.waitUntil(clients.openWindow('http://localhost:5000'));
});

self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(applicationServerPublicKey)
    })
      .then(function (newSubscription) {
        console.log('[Service Worker] New subscription: ', newSubscription);
      })
  );
});
