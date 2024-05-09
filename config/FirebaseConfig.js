// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "tutee-5361a.firebaseapp.com",
  projectId: "tutee-5361a",
  storageBucket: "tutee-5361a.appspot.com",
  messagingSenderId: "145022042197",
  appId: "1:145022042197:web:5fa9aef03e6d6e59cf14dc",
  measurementId: "G-9MFC8HVK6P"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);