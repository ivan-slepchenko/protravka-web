self.addEventListener('message', (event) => {

    console.log('Received message from main thread', event.data);

    if (event.data && event.data.firebaseConfig) {
        self.firebaseConfig = event.data.firebaseConfig;

        firebase.initializeApp(self.firebaseConfig);

        const messaging = firebase.messaging();

        messaging.onBackgroundMessage(function(payload) {
            console.log('Received background message ', payload);
            const notificationTitle = payload.notification.title;
            const notificationOptions = {
                body: payload.notification.body,
                icon: '/firebase-logo.png',
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }
});