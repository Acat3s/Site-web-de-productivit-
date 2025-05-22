// Configuration Firebase
const firebaseConfig = {
  // Remplacez ces valeurs par vos propres configurations Firebase
  apiKey: "YOUR_API_KEY",
  authDomain: "productivityhub-e7c10.firebaseapp.com",
  projectId: "productivityhub-e7c10",
  storageBucket: "productivityhub-e7c10.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialisation de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth }; 