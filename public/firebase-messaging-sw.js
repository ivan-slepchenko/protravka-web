
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
    const notificationOptions = {
        body: payload.notification.body
    };

    self.registration.showNotification('PIZDA', notificationOptions);
});