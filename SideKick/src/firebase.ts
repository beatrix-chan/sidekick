// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    authDomain: "sidekick-91414.firebaseapp.com",
    projectId: "sidekick-91414",
    storageBucket: "sidekick-91414.firebasestorage.app",
    messagingSenderId: "292534333717",
    appId: "1:292534333717:web:78048261f0829f79a3b91c",
    measurementId: "G-7VY6BC71CC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
