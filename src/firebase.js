import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRvmRbvQqpq4Iy3is3JyuFKLHnFxopPfk",
  authDomain: "nutmegauth.firebaseapp.com",
  projectId: "nutmegauth",
  storageBucket: "nutmegauth.firebasestorage.app",
  messagingSenderId: "835382529265",
  appId: "1:835382529265:web:f3b4dee083d31146c52d50"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);