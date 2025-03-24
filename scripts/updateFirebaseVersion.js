require('dotenv').config(); // Load environment variables from .env
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
}

// Get the version from the command-line arguments
const version = process.argv[2];
if (!version) {
    console.error('Error: Version not provided.');
    process.exit(1);
}

// Update the version in the Firebase Realtime Database
const db = admin.database();
db.ref('/appVersion')
    .set(version)
    .then(() => {
        console.log(`Successfully updated app version to ${version}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error updating app version:', error);
        process.exit(1);
    });
