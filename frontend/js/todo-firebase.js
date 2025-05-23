// Intégration de Firebase pour la gestion des tâches
import { auth, db } from './firebase-config.js';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Classe pour gérer les tâches avec Firebase
class TodoFirebaseManager {
  
  // Vérifier si l'utilisateur est connecté
  static isUserLoggedIn() {
    return auth.currentUser !== null;
  }
  
  // ===== OPÉRATIONS DE LECTURE =====
  
  // Charger les tâches quotidiennes pour une date spécifique
  static async loadDailyTasks(date) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return null;
    }
    
    try {
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
      const q = query(tasksRef, where('category', '==', 'daily'), where('date', '==', date));
      const querySnapshot = await getDocs(q);
      
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('Exception lors du chargement des tâches quotidiennes:', error);
      return null;
    }
  }
  
  // Charger les tâches hebdomadaires pour une semaine spécifique
  static async loadWeeklyTasks(startDate, endDate) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return null;
    }
    
    try {
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
      const q = query(
        tasksRef,
        where('category', '==', 'weekly'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('Exception lors du chargement des tâches hebdomadaires:', error);
      return null;
    }
  }
  
  // Charger les tâches ponctuelles
  static async loadPunctualTasks() {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return null;
    }
    
    try {
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
      const q = query(tasksRef, where('category', '==', 'punctual'));
      const querySnapshot = await getDocs(q);
      
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('Exception lors du chargement des tâches ponctuelles:', error);
      return null;
    }
  }
  
  // Charger les tâches générales
  static async loadGeneralTasks() {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return null;
    }
    
    try {
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
      const q = query(tasksRef, where('category', '==', 'general'));
      const querySnapshot = await getDocs(q);
      
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('Exception lors du chargement des tâches générales:', error);
      return null;
    }
  }
  
  // ===== OPÉRATIONS D'ÉCRITURE =====
  
  // Ajouter une nouvelle tâche
  static async addTask(category, taskData) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error(`Exception lors de l'ajout d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // Mettre à jour une tâche existante
  static async updateTask(category, taskId, taskData) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...taskData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Exception lors de la mise à jour d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // Supprimer une tâche
  static async deleteTask(category, taskId) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
      
      return { success: true };
    } catch (error) {
      console.error(`Exception lors de la suppression d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // Marquer une tâche comme terminée ou non terminée
  static async toggleTaskCompletion(category, taskId, completed) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      await updateDoc(taskRef, { 
        completed,
        completedAt: completed ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Exception lors du changement d'état d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // Mettre à jour la répétition d'une tâche
  static async updateTaskRepetition(category, taskId, repetition) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, utilisation du stockage local');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      await updateDoc(taskRef, { 
        repetition,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Exception lors de la mise à jour de la répétition d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // ===== SYNCHRONISATION =====
  
  // Synchroniser les tâches locales avec Firebase
  static async syncTasksToFirebase(localTasks) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, impossible de synchroniser');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const categories = ['daily', 'weekly', 'punctual', 'general'];
      const results = {};
      
      for (const category of categories) {
        if (!localTasks[category]) continue;
        
        // Récupérer les tâches existantes dans Firebase
        const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
        const q = query(tasksRef, where('category', '==', category));
        const querySnapshot = await getDocs(q);
        
        // Créer un map des tâches Firebase par ID local
        const firebaseTasksMap = {};
        querySnapshot.forEach(doc => {
          const task = doc.data();
          if (task.localId) {
            firebaseTasksMap[task.localId] = { id: doc.id, ...task };
          }
        });
        
        // Synchroniser chaque tâche locale
        const categoryResults = [];
        
        for (const localTask of localTasks[category]) {
          let result;
          
          if (firebaseTasksMap[localTask.id]) {
            // La tâche existe déjà dans Firebase, mise à jour
            const firebaseTask = firebaseTasksMap[localTask.id];
            result = await this.updateTask(category, firebaseTask.id, {
              ...localTask,
              localId: localTask.id
            });
          } else {
            // Nouvelle tâche à ajouter à Firebase
            result = await this.addTask(category, {
              ...localTask,
              localId: localTask.id
            });
          }
          
          categoryResults.push(result);
        }
        
        results[category] = categoryResults;
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Exception lors de la synchronisation des tâches:', error);
      return { success: false, error };
    }
  }
  
  // Synchroniser les tâches Firebase avec le stockage local
  static async syncTasksFromFirebase() {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, impossible de synchroniser');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const categories = ['daily', 'weekly', 'punctual', 'general'];
      const results = {};
      
      for (const category of categories) {
        const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
        const q = query(tasksRef, where('category', '==', category));
        const querySnapshot = await getDocs(q);
        
        const tasks = [];
        querySnapshot.forEach(doc => {
          const task = doc.data();
          tasks.push({
            ...task,
            id: task.localId || doc.id // Utiliser l'ID local s'il existe
          });
        });
        
        results[category] = { success: true, data: tasks };
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Exception lors de la synchronisation des tâches:', error);
      return { success: false, error };
    }
  }
}

export { TodoFirebaseManager }; 