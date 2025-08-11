import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtELHbkHKb5_0eDO-8A_2vZvV7CTjb9_0",
  authDomain: "rosariotourism-9cb4b.firebaseapp.com",
  projectId: "rosariotourism-9cb4b",
  storageBucket: "rosariotourism-9cb4b.firebasestorage.app",
  messagingSenderId: "448829964008",
  appId: "1:448829964008:web:c595130df371491303d35d",
  measurementId: "G-0D4GZZCP9J"
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