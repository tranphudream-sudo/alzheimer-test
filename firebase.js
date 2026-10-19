import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com//firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBDCEUCrSxzys9qyIJq2bTQ71R5YsaEyG0",
    authDomain: "alzheimer-80f42.firebaseapp.com",
    projectId: "alzheimer-80f42",
    storageBucket: "alzheimer-80f42.firebasestorage.app",
    messagingSenderId: "848780821534",
    appId: "1:848780821534:web:fc63a2aea4e5b09425da0f",
    measurementId: "G-EL51DGL04E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };