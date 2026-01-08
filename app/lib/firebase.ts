// app/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9Q8z-V9TBC6pb1BBhTlgtM9VhgB71TbE",
  authDomain: "syscope-62846.firebaseapp.com",
  projectId: "syscope-62846",
  storageBucket: "syscope-62846.firebasestorage.app",
  messagingSenderId: "451557997914",
  appId: "1:451557997914:web:4de9ed9bdd60b2b7438763",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
