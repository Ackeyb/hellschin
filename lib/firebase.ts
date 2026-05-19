import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAsXpBH1KWvGdz6nrURZBgBfGaNepMh9rQ",
  authDomain: "hellschinchiroline.firebaseapp.com",
  projectId: "hellschinchiroline",
  storageBucket: "hellschinchiroline.firebasestorage.app",
  messagingSenderId: "1000518482699",
  appId: "1:1000518482699:web:cfac1f83be87586e2c800e",
  measurementId: "G-1VTZ4VLKHT",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export async function loadAnalytics() {
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;
  return getAnalytics(app);
}
