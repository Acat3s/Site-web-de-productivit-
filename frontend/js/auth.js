import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Écouter les changements d'état d'authentification Firebase
onAuthStateChanged(auth, (user) => {
  if (user) {
    // L'utilisateur est connecté
    console.log("Utilisateur connecté:", user.email);
    // Mettre à jour l'interface utilisateur pour l'état connecté
    updateUIForAuthenticatedUser(user);
  } else {
    // L'utilisateur est déconnecté
    console.log("Utilisateur déconnecté");
    // Mettre à jour l'interface utilisateur pour l'état déconnecté
    updateUIForUnauthenticatedUser();
  }
});

// Fonction pour l'inscription
async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw error;
  }
}

// Fonction pour la connexion
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw error;
  }
}

// Fonction pour la déconnexion
async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    throw error;
  }
}

// Fonction pour réinitialiser le mot de passe
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    throw error;
  }
}

// Fonction pour mettre à jour l'interface utilisateur pour un utilisateur connecté
function updateUIForAuthenticatedUser(user) {
  // Implémentez la logique pour mettre à jour l'interface utilisateur
  // Par exemple, afficher le nom de l'utilisateur, le bouton de déconnexion, etc.
}

// Fonction pour mettre à jour l'interface utilisateur pour un utilisateur non connecté
function updateUIForUnauthenticatedUser() {
  // Implémentez la logique pour mettre à jour l'interface utilisateur
  // Par exemple, afficher le formulaire de connexion, etc.
}

export {
  signUp,
  signIn,
  logOut,
  resetPassword
}; 