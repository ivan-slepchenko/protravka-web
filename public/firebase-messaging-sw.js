importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');
const firebaseConfig = {
    apiKey: 'AIzaSyB4MW4pY-G32xlfBGS-LeXg0yO4SzahdZk',
    authDomain: 'protravka-fea6a.firebaseapp.com',
    projectId: 'protravka-fea6a',
    storageBucket: 'protravka-fea6a.firebasestorage.app',
    messagingSenderId: '563545771041',
    appId: 'BGBaGqkM83WPDgLWhv7TKL88I6Jxv14yTM37zYs1O5-53c3bffSnr2GL34EGnOxTNQ0PoW_t9dsS3ZnjM6RzagE'
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);
    self.registration.showNotification(payload.data.title, {
        body: payload.data.body,
        data: payload.data, // Add click_action to data
        requireInteraction: true,
        actions: [{
            action: 'open',
            title: 'Open'
        }]
    });
});

function focusOrOpenWindow(clickAction) {
    return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if ('focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(clickAction || '/'); // Fallback to '/' if clickAction is not defined
        }
    });
}

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(focusOrOpenWindow(clickAction));
});