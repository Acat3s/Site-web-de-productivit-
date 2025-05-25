// Code de diagnostic à ajouter temporairement dans votre app To-Do List

// Suppression des imports statiques
// import { auth, db } from './firebase-config.js';
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Diagnostic complet
function diagnoseFirestore() {
  console.log('=== DIAGNOSTIC FIRESTORE ===');
  
  // 1. Vérifier Firebase
  console.log('Firebase App:', window.db?.app);
  console.log('Auth instance:', window.auth);
  console.log('Firestore instance:', window.db);
  
  // 2. Vérifier l'état d'authentification
  // Import dynamique de onAuthStateChanged si non présent
  if (window.onAuthStateChanged) {
    window.onAuthStateChanged(window.auth, (user) => {
      handleAuthState(user);
    });
  } else {
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js').then(mod => {
      mod.onAuthStateChanged(window.auth, (user) => {
        handleAuthState(user);
      });
    });
  }
}

function handleAuthState(user) {
  if (user) {
    console.log('✅ Utilisateur connecté:');
    console.log('  - UID:', user.uid);
    console.log('  - Email:', user.email);
    console.log('  - Token valide:', user.accessToken ? 'Oui' : 'Non');
    // 3. Tester l'accès à Firestore
    testFirestoreAccess(user.uid);
  } else {
    console.log('❌ Aucun utilisateur connecté');
  }
}

// Test d'accès à Firestore
async function testFirestoreAccess(userId) {
  try {
    console.log('=== TEST ACCÈS FIRESTORE ===');
    
    // Importer les fonctions Firestore dynamiquement
    const { collection, addDoc, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    // Construire le chemin selon vos règles
    const tasksRef = collection(window.db, 'users', userId, 'tasks');
    console.log('Chemin des tâches:', `users/${userId}/tasks`);
    
    // Tenter de lire les tâches existantes
    try {
      const snapshot = await getDocs(tasksRef);
      console.log('✅ Lecture réussie - Nombre de tâches:', snapshot.size);
    } catch (readError) {
      console.error('❌ Erreur de lecture:', readError);
    }
    
    // Tenter de créer une tâche de test
    try {
      const testTask = {
        title: 'Tâche de test',
        completed: false,
        createdAt: new Date(),
        userId: userId
      };
      
      const docRef = await addDoc(tasksRef, testTask);
      console.log('✅ Création réussie - ID:', docRef.id);
      
      // Supprimer la tâche de test
      const { deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      await deleteDoc(doc(window.db, 'users', userId, 'tasks', docRef.id));
      console.log('✅ Suppression de test réussie');
      
    } catch (writeError) {
      console.error('❌ Erreur de création:', writeError);
      console.error('Code d\'erreur:', writeError.code);
      console.error('Message:', writeError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Lancer le diagnostic au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(diagnoseFirestore, 1000); // Attendre 1 seconde pour l'initialisation
});

// Fonction à appeler manuellement depuis la console
window.diagnoseFirestore = diagnoseFirestore; 