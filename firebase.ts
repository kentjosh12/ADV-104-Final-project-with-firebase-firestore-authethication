// firebase.ts
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyCpgj-lcr1STUV5KnB7YlVK7SaIgOYigyA",
  authDomain: "storage-dae8b.firebaseapp.com",
  projectId: "storage-dae8b",
  storageBucket: "storage-dae8b.firebasestorage.app",
  messagingSenderId: "773581523082",
  appId: "1:773581523082:web:e2beafe40c77d843f40573"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;