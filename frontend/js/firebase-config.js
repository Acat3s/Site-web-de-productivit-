// Configuration Firebase
const firebaseConfig = {
  // Remplacez ces valeurs par vos propres configurations Firebase
  apiKey: "AIzaSyDLArxENPaPQy0Jgqk-mBloF-hZIQdSV6g",
  authDomain: "productivityhub-e7c10.firebaseapp.com",
  projectId: "productivityhub-e7c10",
  storageBucket: "productivityhub-e7c10.firebasestorage.app",
  messagingSenderId: "237644324323",
  appId: "1:237644324323:web:267b44ff35822757c314d6"
};

// Initialisation de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; 