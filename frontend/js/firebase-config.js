// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDLArxENPaPQy0Jgqk-mBloF-hZIQdSV6g",
  authDomain: "productivityhub-e7c10.firebaseapp.com",
  projectId: "productivityhub-e7c10",
  storageBucket: "productivityhub-e7c10.appspot.com",
  messagingSenderId: "237644324323",
  appId: "1:237644324323:web:267b44ff35822757c314d6"
};

// Initialisation de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

auth.useDeviceLanguage();

// Désactiver la persistance de session pour éviter certains problèmes de sécurité
// auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

window.auth = auth;
window.db = db;

export { app, auth, db }; 