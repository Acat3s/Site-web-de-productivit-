// Configuration de la base de données Firestore pour ProductivityHub
import { auth, db } from '/Site-web-de-productivit-/frontend/js/firebase-config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Classe pour gérer les opérations de base de données
class FirestoreManager {
  
  // Obtenir l'ID de l'utilisateur courant
  static getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }
    return user.uid;
  }
  
  // ===== GESTION DES UTILISATEURS =====
  
  // Créer ou mettre à jour un profil utilisateur
  static async saveUserProfile(userData) {
    try {
      const userId = this.getCurrentUserId();
      const userRef = doc(db, 'users', userId);
      
      // Ajouter les timestamps
      const dataWithTimestamps = {
        ...userData,
        updatedAt: serverTimestamp()
      };
      
      // Vérifier si le document existe déjà
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Mettre à jour le document existant
        await updateDoc(userRef, dataWithTimestamps);
      } else {
        // Créer un nouveau document avec createdAt
        await setDoc(userRef, {
          ...dataWithTimestamps,
          createdAt: serverTimestamp()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil utilisateur:', error);
      return { success: false, error };
    }
  }
  
  // Récupérer le profil utilisateur
  static async getUserProfile() {
    try {
      const userId = this.getCurrentUserId();
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: 'Profil utilisateur non trouvé' };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      return { success: false, error };
    }
  }
  
  // ===== GESTION DES TÂCHES =====
  
  // Ajouter une nouvelle tâche
  static async addTask(category, taskData) {
    try {
      const userId = this.getCurrentUserId();
      const tasksRef = collection(db, 'tasks', userId, category);
      
      // Ajouter les timestamps et l'état initial
      const dataWithTimestamps = {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Ajouter la tâche à Firestore
      const docRef = await addDoc(tasksRef, dataWithTimestamps);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // Mettre à jour une tâche existante
  static async updateTask(category, taskId, taskData) {
    try {
      const userId = this.getCurrentUserId();
      const taskRef = doc(db, 'tasks', userId, category, taskId);
      
      // Ajouter le timestamp de mise à jour
      const dataWithTimestamp = {
        ...taskData,
        updatedAt: serverTimestamp()
      };
      
      // Mettre à jour la tâche
      await updateDoc(taskRef, dataWithTimestamp);
      
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // Supprimer une tâche
  static async deleteTask(category, taskId) {
    try {
      const userId = this.getCurrentUserId();
      const taskRef = doc(db, 'tasks', userId, category, taskId);
      
      // Supprimer la tâche
      await deleteDoc(taskRef);
      
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression d'une tâche ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // Récupérer toutes les tâches d'une catégorie
  static async getTasks(category, filters = {}) {
    try {
      const userId = this.getCurrentUserId();
      const tasksRef = collection(db, 'tasks', userId, category);
      
      // Construire la requête avec les filtres éventuels
      let queryConstraints = [];
      
      // Filtrer par date si spécifié
      if (filters.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);
        
        queryConstraints.push(where('date', '>=', startOfDay));
        queryConstraints.push(where('date', '<=', endOfDay));
      }
      
      // Filtrer par plage de dates si spécifié
      if (filters.startDate && filters.endDate) {
        queryConstraints.push(where('date', '>=', filters.startDate));
        queryConstraints.push(where('date', '<=', filters.endDate));
      }
      
      // Trier par ordre si spécifié
      if (filters.orderBy) {
        queryConstraints.push(orderBy(filters.orderBy, filters.orderDirection || 'asc'));
      }
      
      // Limiter le nombre de résultats si spécifié
      if (filters.limit) {
        queryConstraints.push(limit(filters.limit));
      }
      
      // Exécuter la requête
      const q = query(tasksRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      // Transformer les résultats
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: tasks };
    } catch (error) {
      console.error(`Erreur lors de la récupération des tâches ${category}:`, error);
      return { success: false, error };
    }
  }
  
  // ===== GESTION DES STATISTIQUES =====
  
  // Mettre à jour les statistiques quotidiennes
  static async updateDailyStatistics(statsData) {
    try {
      const userId = this.getCurrentUserId();
      const statsRef = doc(db, 'statistics', userId);
      
      // Récupérer les statistiques existantes
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        // Mettre à jour les statistiques existantes
        const currentStats = statsDoc.data();
        let dailyCompletion = currentStats.dailyCompletion || [];
        
        // Vérifier si une entrée existe déjà pour cette date
        const dateStr = statsData.date.toISOString().split('T')[0];
        const existingIndex = dailyCompletion.findIndex(item => 
          item.date.toDate().toISOString().split('T')[0] === dateStr
        );
        
        if (existingIndex >= 0) {
          // Mettre à jour l'entrée existante
          dailyCompletion[existingIndex] = statsData;
        } else {
          // Ajouter une nouvelle entrée
          dailyCompletion.push(statsData);
        }
        
        // Mettre à jour le document
        await updateDoc(statsRef, {
          dailyCompletion,
          updatedAt: serverTimestamp()
        });
      } else {
        // Créer un nouveau document de statistiques
        await setDoc(statsRef, {
          dailyCompletion: [statsData],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques quotidiennes:', error);
      return { success: false, error };
    }
  }
  
  // Mettre à jour les statistiques hebdomadaires
  static async updateWeeklyStatistics(statsData) {
    try {
      const userId = this.getCurrentUserId();
      const statsRef = doc(db, 'statistics', userId);
      
      // Récupérer les statistiques existantes
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        // Mettre à jour les statistiques existantes
        const currentStats = statsDoc.data();
        let weeklyCompletion = currentStats.weeklyCompletion || [];
        
        // Vérifier si une entrée existe déjà pour cette semaine
        const weekStartStr = statsData.startDate.toISOString().split('T')[0];
        const existingIndex = weeklyCompletion.findIndex(item => 
          item.startDate.toDate().toISOString().split('T')[0] === weekStartStr
        );
        
        if (existingIndex >= 0) {
          // Mettre à jour l'entrée existante
          weeklyCompletion[existingIndex] = statsData;
        } else {
          // Ajouter une nouvelle entrée
          weeklyCompletion.push(statsData);
        }
        
        // Mettre à jour le document
        await updateDoc(statsRef, {
          weeklyCompletion,
          updatedAt: serverTimestamp()
        });
      } else {
        // Créer un nouveau document de statistiques
        await setDoc(statsRef, {
          weeklyCompletion: [statsData],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques hebdomadaires:', error);
      return { success: false, error };
    }
  }
  
  // Récupérer toutes les statistiques
  static async getStatistics() {
    try {
      const userId = this.getCurrentUserId();
      const statsRef = doc(db, 'statistics', userId);
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        return { success: true, data: statsDoc.data() };
      } else {
        return { success: false, error: 'Statistiques non trouvées' };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { success: false, error };
    }
  }
}

export { FirestoreManager }; 