// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4MW4pY-G32xlfBGS-LeXg0yO4SzahdZk",
  authDomain: "protravka-fea6a.firebaseapp.com",
  projectId: "protravka-fea6a",
  storageBucket: "protravka-fea6a.firebasestorage.app",
  messagingSenderId: "563545771041",
  appId: "1:563545771041:web:11d8318996f45c19702760"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;