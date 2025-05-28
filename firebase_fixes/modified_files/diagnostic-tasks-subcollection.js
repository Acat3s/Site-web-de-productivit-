// diagnostic-tasks-subcollection.js
// Script de diagnostic pour la sous-collection tasks

async function diagnoseTasksSubcollection() {
  if (!window.auth?.currentUser) {
    console.error("Utilisateur non connecté");
    return;
  }

  const userId = window.auth.currentUser.uid;
  console.log("UID utilisateur:", userId);
  
  try {
    // Vérifier le token
    const token = await window.auth.currentUser.getIdToken();
    console.log("Token valide:", !!token);
    
    // Importer les fonctions Firestore
    const { collection, addDoc, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    // Tester la création d'une sous-collection tasks
    const tasksRef = collection(window.db, 'users', userId, 'tasks');
    console.log("Chemin de la sous-collection:", `users/${userId}/tasks`);
    
    // Tenter de lire les documents existants
    try {
      const snapshot = await getDocs(tasksRef);
      console.log("Lecture réussie - Nombre de tâches:", snapshot.size);
      
      // Afficher les tâches existantes
      if (snapshot.size > 0) {
        console.log("Tâches existantes:");
        snapshot.forEach(doc => {
          console.log(`- ID: ${doc.id}, Titre: ${doc.data().title || 'Sans titre'}`);
        });
      }
    } catch (readError) {
      console.error("Erreur de lecture:", readError);
      console.error("Code:", readError.code);
      console.error("Message:", readError.message);
    }
    
    // Tenter de créer un document de test
    try {
      const testTask = {
        title: "Tâche de diagnostic",
        completed: false,
        createdAt: new Date(),
        category: "test"
      };
      
      const docRef = await addDoc(tasksRef, testTask);
      console.log("Création réussie - ID:", docRef.id);
    } catch (writeError) {
      console.error("Erreur de création:", writeError);
      console.error("Code:", writeError.code);
      console.error("Message:", writeError.message);
    }
  } catch (error) {
    console.error("Erreur générale:", error);
  }
}

// Exposer la fonction globalement
window.diagnoseTasksSubcollection = diagnoseTasksSubcollection;
