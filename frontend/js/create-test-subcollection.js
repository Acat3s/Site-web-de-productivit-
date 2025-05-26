// create-test-subcollection.js
window.createTestSubCollection = async function() {
  if (!window.auth?.currentUser) {
    alert("Connecte-toi d'abord !");
    return;
  }
  const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
  const userId = window.auth.currentUser.uid;
  const subColRef = collection(window.db, 'users', userId, 'testSubCollection');
  const docRef = await addDoc(subColRef, {
    message: "Ceci est un document de test dans une sous-collection !",
    createdAt: new Date()
  });
  alert("Sous-collection créée avec le document ID : " + docRef.id);
}; 