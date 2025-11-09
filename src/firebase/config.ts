// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwCG-bS4MlLKj7kxcrSXtQT6Ejcc3g8-s",
  authDomain: "nabta-89a5b.firebaseapp.com",
  projectId: "nabta-89a5b",
  storageBucket: "nabta-89a5b.firebasestorage.app",
  messagingSenderId: "293021319683",
  appId: "1:293021319683:web:c3f07be60ab6f3e72f0436",
  measurementId: "G-014PV1M1HV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;