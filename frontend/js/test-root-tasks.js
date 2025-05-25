// test-root-tasks.js
window.addRootTask = async function() {
  const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
  const tasksRef = collection(window.db, 'tasks');
  const taskData = {
    title: "Tâche racine",
    completed: false,
    date: "2025-05-25",
    category: "daily"
  };
  const docRef = await addDoc(tasksRef, taskData);
  alert("Tâche racine ajoutée avec l'ID : " + docRef.id);
};

window.listRootTasks = async function() {
  const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
  const tasksRef = collection(window.db, 'tasks');
  const snapshot = await getDocs(tasksRef);
  console.log("=== TÂCHES RACINE ===");
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}; 