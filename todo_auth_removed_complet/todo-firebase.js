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

// Suppression de l'import de authState pour éviter l'injection de l'interface d'authentification
// import { authState } from './auth.js';

// État d'authentification simplifié pour éviter la dépendance à auth.js
const authStateSimple = {
  isAuthenticated: false,
  user: null
};

// Classe pour gérer les tâches avec Firebase
class TodoFirebaseManager {
  
  // Vérifier si l'utilisateur est connecté - Méthode améliorée
  static isUserLoggedIn() {
    // Vérification directe de auth.currentUser au lieu de authState
    const isLoggedIn = auth.currentUser !== null;
    console.log("TodoFirebaseManager.isUserLoggedIn() - État:", isLoggedIn);
    console.log("auth.currentUser:", auth.currentUser);
    
    // Mise à jour de l'état d'authentification simplifié
    authStateSimple.isAuthenticated = isLoggedIn;
    authStateSimple.user = auth.currentUser;
    
    return isLoggedIn;
  }
  
  // Vérifier si l'utilisateur est connecté avec un token valide
  static async isUserLoggedInWithValidToken() {
    if (!auth.currentUser) {
      console.log("TodoFirebaseManager.isUserLoggedInWithValidToken() - Utilisateur non connecté");
      return false;
    }
    
    try {
      // Forcer le rafraîchissement du token pour s'assurer qu'il est valide
      await auth.currentUser.getIdToken(true);
      console.log("TodoFirebaseManager.isUserLoggedInWithValidToken() - Token valide");
      return true;
    } catch (error) {
      console.error("Erreur de validation du token:", error);
      return false;
    }
  }
  
  // Créer explicitement la sous-collection tasks
  static async ensureTasksCollection() {
    if (!auth.currentUser) {
      console.error("Utilisateur non connecté");
      return false;
    }
    
    try {
      // Forcer le rafraîchissement du token
      await auth.currentUser.getIdToken(true);
      
      // Créer un document temporaire pour s'assurer que la sous-collection existe
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
      const tempDoc = await addDoc(tasksRef, {
        _temp: true,
        createdAt: new Date()
      });
      
      // Supprimer immédiatement le document temporaire
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', tempDoc.id));
      
      console.log("Sous-collection 'tasks' créée avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de la sous-collection 'tasks':", error);
      console.error("Code d'erreur:", error.code);
      console.error("Message:", error.message);
      return false;
    }
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
  
  // Fonction de réessai pour les opérations Firestore
  static async retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Tentative ${attempt}/${maxRetries} échouée:`, error);
        lastError = error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
  
  // Ajouter une nouvelle tâche - Méthode améliorée
  static async addTask(category, taskData) {
    // Utiliser la fonction de réessai pour gérer les problèmes de synchronisation
    return this.retryOperation(async () => {
      // Vérification robuste de l'authentification
      if (!auth.currentUser) {
        console.error("Erreur : utilisateur non authentifié");
        alert('Erreur : utilisateur non connecté.');
        return { success: false, error: 'Utilisateur non connecté' };
      }
      
      const uid = auth.currentUser.uid;
      console.log("UID utilisateur :", uid);
      
      try {
        // S'assurer que la sous-collection existe
        await this.ensureTasksCollection();
        
        const tasksRef = collection(db, 'users', uid, 'tasks');
        console.log("Chemin Firestore :", `users/${uid}/tasks`);
        
        const docRef = await addDoc(tasksRef, {
          ...taskData,
          category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log("Tâche ajoutée avec succès, ID:", docRef.id);
        alert('Tâche ajoutée avec succès dans Firestore !');
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error("Erreur Firestore détaillée :", error.code, error.message);
        alert('Erreur lors de l\'ajout de la tâche : ' + error.message);
        return { success: false, error };
      }
    });
  }
  
  // Mettre à jour une tâche existante - Méthode améliorée
  static async updateTask(category, taskId, taskData) {
    return this.retryOperation(async () => {
      if (!auth.currentUser) {
        console.error("Erreur : utilisateur non authentifié");
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
    });
  }
  
  // Supprimer une tâche - Méthode améliorée
  static async deleteTask(category, taskId) {
    return this.retryOperation(async () => {
      if (!auth.currentUser) {
        console.error("Erreur : utilisateur non authentifié");
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
    });
  }
  
  // Marquer une tâche comme terminée ou non terminée - Méthode améliorée
  static async toggleTaskCompletion(category, taskId, completed) {
    return this.retryOperation(async () => {
      if (!auth.currentUser) {
        console.error("Erreur : utilisateur non authentifié");
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
    });
  }
  
  // Mettre à jour la répétition d'une tâche - Méthode améliorée
  static async updateTaskRepetition(category, taskId, repetition) {
    return this.retryOperation(async () => {
      if (!auth.currentUser) {
        console.error("Erreur : utilisateur non authentifié");
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
    });
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
