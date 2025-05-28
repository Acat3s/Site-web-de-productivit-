// ensure-tasks-collection.js
// Script pour forcer la création de la sous-collection tasks

async function ensureTasksCollection() {
  if (!window.auth?.currentUser) {
    console.error("Utilisateur non connecté");
    return false;
  }
  
  try {
    // Forcer le rafraîchissement du token
    await window.auth.currentUser.getIdToken(true);
    
    const { collection, addDoc, deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    // Créer un document temporaire pour s'assurer que la sous-collection existe
    const tasksRef = collection(window.db, 'users', window.auth.currentUser.uid, 'tasks');
    const tempDoc = await addDoc(tasksRef, {
      _temp: true,
      createdAt: new Date()
    });
    
    // Supprimer immédiatement le document temporaire
    await deleteDoc(doc(window.db, 'users', window.auth.currentUser.uid, 'tasks', tempDoc.id));
    
    console.log("Sous-collection 'tasks' créée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la création de la sous-collection 'tasks':", error);
    console.error("Code d'erreur:", error.code);
    console.error("Message:", error.message);
    return false;
  }
}

// Exposer la fonction globalement
window.ensureTasksCollection = ensureTasksCollection;
