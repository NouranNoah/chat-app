// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLyfZyODOfX7cj_fFUofiAem_4UTjBfK0",
  authDomain: "chat-app-6fa7f.firebaseapp.com",
  projectId: "chat-app-6fa7f",
  storageBucket: "chat-app-6fa7f.appspot.com",
  messagingSenderId: "975357426542",
  appId: "1:975357426542:web:5243999616545357ed5f7f",
  measurementId: "G-9VQHGV0MKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 