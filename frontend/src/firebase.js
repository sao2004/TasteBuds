// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "tastebuds-276c4.firebaseapp.com",
  projectId: "tastebuds-276c4",
  storageBucket: "tastebuds-276c4.firebasestorage.app",
  messagingSenderId: "840316666294",
  appId: "1:840316666294:web:c02597439cc9ecd6df8117",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
