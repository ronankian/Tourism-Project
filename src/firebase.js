import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwK7-CCscxlaaFlc5YYPf_5Hkn_Fz9fWo",
  authDomain: "rosariotourismofficial.firebaseapp.com",
  projectId: "rosariotourismofficial",
  storageBucket: "rosariotourismofficial.firebasestorage.app",
  messagingSenderId: "1040453156967",
  appId: "1:1040453156967:web:74088803eb5ef7f0de54c2",
  measurementId: "G-K4B0CFCP83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
// Initialize Cloud Storage and export reference
export const storage = getStorage(app);

export default app; 