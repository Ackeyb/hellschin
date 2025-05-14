// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsXpBH1KWvGdz6nrURZBgBfGaNepMh9rQ",
  authDomain: "hellschinchiroline.firebaseapp.com",
  projectId: "hellschinchiroline",
  storageBucket: "hellschinchiroline.firebasestorage.app",
  messagingSenderId: "1000518482699",
  appId: "1:1000518482699:web:cfac1f83be87586e2c800e",
  measurementId: "G-1VTZ4VLKHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);