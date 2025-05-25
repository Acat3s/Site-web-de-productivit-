// verify-firestore.js
async function verifyFirestoreStructure() {
  if (!window.auth?.currentUser) {
    console.error("Utilisateur non connecté");
    return;
  }

  const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

  try {
    const tasksRef = collection(window.db, 'users', window.auth.currentUser.uid, 'tasks');
    const snapshot = await getDocs(tasksRef);

    console.log("=== VÉRIFICATION DE STRUCTURE FIRESTORE ===");
    console.log("Nombre total de tâches :", snapshot.size);

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Document ID:", doc.id);
      console.log("Catégorie:", data.category);
      console.log("Date:", data.date);
      console.log("Titre:", data.title);
      console.log("Structure complète:", data);
      console.log("---");
    });
  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
  }
}

// Exposer la fonction globalement
window.verifyFirestoreStructure = verifyFirestoreStructure; 