import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQp5Cv8v5kZYp8YbSrvfJy_Ytm5ISVt3w",
  authDomain: "examportal-4ca2d.firebaseapp.com",
  projectId: "examportal-4ca2d",
  storageBucket: "examportal-4ca2d.firebasestorage.app",
  messagingSenderId: "500499528526",
  appId: "1:500499528526:web:6a400db34158c09d76fc1f",
  measurementId: "G-JKDMR6RSS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
