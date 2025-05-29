// Script de test pour vérifier la disponibilité de TodoFirebaseManager
// et la synchronisation entre authentification et Firestore

console.log("=== DIAGNOSTIC DE SYNCHRONISATION AUTH/FIRESTORE ===");

// Vérifier si TodoFirebaseManager est disponible globalement
console.log("TodoFirebaseManager disponible:", typeof TodoFirebaseManager !== 'undefined');

// Vérifier l'état d'authentification
if (typeof auth !== 'undefined') {
  console.log("Objet auth disponible:", true);
  console.log("Utilisateur connecté:", auth.currentUser !== null);
  if (auth.currentUser) {
    console.log("UID utilisateur:", auth.currentUser.uid);
    console.log("Email utilisateur:", auth.currentUser.email);
  }
} else {
  console.log("Objet auth non disponible");
}

// Vérifier l'état authState
if (typeof authState !== 'undefined') {
  console.log("Objet authState disponible:", true);
  console.log("authState.isAuthenticated:", authState.isAuthenticated);
  console.log("authState.user:", authState.user);
} else {
  console.log("Objet authState non disponible");
}

// Vérifier si TodoFirebaseManager.isUserLoggedIn() fonctionne
if (typeof TodoFirebaseManager !== 'undefined' && TodoFirebaseManager.isUserLoggedIn) {
  console.log("TodoFirebaseManager.isUserLoggedIn() disponible:", true);
  console.log("Résultat de TodoFirebaseManager.isUserLoggedIn():", TodoFirebaseManager.isUserLoggedIn());
} else {
  console.log("TodoFirebaseManager.isUserLoggedIn() non disponible");
}

// Tester la création de la sous-collection tasks
if (typeof TodoFirebaseManager !== 'undefined' && TodoFirebaseManager.ensureTasksCollection) {
  console.log("TodoFirebaseManager.ensureTasksCollection() disponible:", true);
  
  // Exécuter le test après un court délai pour s'assurer que l'authentification est établie
  setTimeout(() => {
    if (TodoFirebaseManager.isUserLoggedIn()) {
      console.log("Test de création de sous-collection en cours...");
      TodoFirebaseManager.ensureTasksCollection()
        .then(result => {
          console.log("Résultat de ensureTasksCollection():", result);
        })
        .catch(error => {
          console.error("Erreur lors de ensureTasksCollection():", error);
        });
    } else {
      console.log("Utilisateur non connecté, test de création de sous-collection ignoré");
    }
  }, 2000);
} else {
  console.log("TodoFirebaseManager.ensureTasksCollection() non disponible");
}

console.log("=== FIN DU DIAGNOSTIC ===");
