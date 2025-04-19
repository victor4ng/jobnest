// File: src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSOMEKEYEXAMPLE",
  authDomain: "jobnest.firebaseapp.com",
  projectId: "jobnest",
  storageBucket: "jobnest.appspot.com",
  messagingSenderId: "1092923892",
  appId: "1:1092923892:web:somehash"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
