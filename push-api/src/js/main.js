const applicationServerPublicKey = 'BI4VPQqyyJbIA-f95VqbjUAOYNhhCAxV6XP_nCMvGkB6i4pgrPrK54N9qTmzI6NNfhmgDGlttACcx3KjjnBhs20';
const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

const pushButton = document.getElementById('push');

let isSubscribed = false;
let swRegistration = null;

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

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    return;
  }

  pushButton.textContent = isSubscribed ? 'Disable Push Messaging' : 'Enable Push Messaging';
  pushButton.disabled = false;
}

async function subscribeUser() {
  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    
    console.log('User is subscribed.');
    console.log(JSON.stringify(subscription));

    await fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    isSubscribed = true;
    updateBtn();
  } catch (err) {
    console.error('Failed to subscribe the user: ', err);
    updateBtn();
  }
}

async function unsubscribeUser() {
  try {
    const subscription = await swRegistration.pushManager.getSubscription()
    if (!subscription) {
      return
    }

    subscription.unsubscribe();
    isSubscribed = false;
    updateBtn();
  } catch (err) {
    console.error('Error unsubscribing', err);
  }
}

async function initializeUI() {
  pushButton.addEventListener('click', function () {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  const subscription = await swRegistration.pushManager.getSubscription()
  console.log(JSON.stringify(subscription));

  isSubscribed = !(subscription === null);
  updateBtn();
}

if ('serviceWorker' in navigator && 'PushManager' in window) {

  navigator.serviceWorker.register('/js/sw.js') .then(swReg => {
    swRegistration = swReg;
    initializeUI();
  })
  .catch(function (error) {
    console.error('Service Worker Error', error);
  });
} else {
  pushButton.textContent = 'Push Not Supported';
}
