import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCOZ3EDgsSvIXZ_MSSzB93obMSeVC3JPjM",
    authDomain: "sari-sari-storage-9f8c0.firebaseapp.com",
    projectId: "sari-sari-storage-9f8c0",
    storageBucket: "sari-sari-storage-9f8c0.firebasestorage.app",
    messagingSenderId: "825901469155",
    appId: "1:825901469155:web:6347823658ddb226bea4d6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Auto-signin anonymously on app start
export const initializeAuth = async () => {
  try {
    await signInAnonymously(auth);
    console.log('✅ Signed in anonymously');
  } catch (error) {
    console.log('Anonymous auth failed:', error);
  }
};

// Initialize auth when this file loads
initializeAuth();