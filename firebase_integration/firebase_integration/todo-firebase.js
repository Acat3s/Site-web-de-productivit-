// Intégration de Firebase pour la gestion des tâches
import { auth } from '/Site-web-de-productivit-/frontend/js/firebase-config.js';
import { FirestoreManager } from './firebase-db.js';

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
      const result = await FirestoreManager.getTasks('daily', { date });
      
      if (result.success) {
        return result.data;
      } else {
        console.error('Erreur lors du chargement des tâches quotidiennes:', result.error);
        return null;
      }
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
      const result = await FirestoreManager.getTasks('weekly', { startDate, endDate });
      
      if (result.success) {
        return result.data;
      } else {
        console.error('Erreur lors du chargement des tâches hebdomadaires:', result.error);
        return null;
      }
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
      const result = await FirestoreManager.getTasks('punctual');
      
      if (result.success) {
        return result.data;
      } else {
        console.error('Erreur lors du chargement des tâches ponctuelles:', result.error);
        return null;
      }
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
      const result = await FirestoreManager.getTasks('general');
      
      if (result.success) {
        return result.data;
      } else {
        console.error('Erreur lors du chargement des tâches générales:', result.error);
        return null;
      }
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
      return await FirestoreManager.addTask(category, taskData);
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
      return await FirestoreManager.updateTask(category, taskId, taskData);
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
      return await FirestoreManager.deleteTask(category, taskId);
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
      return await FirestoreManager.updateTask(category, taskId, { 
        completed,
        completedAt: completed ? new Date() : null
      });
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
      return await FirestoreManager.updateTask(category, taskId, { repetition });
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
        const firebaseTasks = await FirestoreManager.getTasks(category);
        
        if (!firebaseTasks.success) {
          results[category] = { success: false, error: firebaseTasks.error };
          continue;
        }
        
        // Créer un map des tâches Firebase par ID local
        const firebaseTasksMap = {};
        firebaseTasks.data.forEach(task => {
          if (task.localId) {
            firebaseTasksMap[task.localId] = task;
          }
        });
        
        // Synchroniser chaque tâche locale
        const categoryResults = [];
        
        for (const localTask of localTasks[category]) {
          let result;
          
          if (firebaseTasksMap[localTask.id]) {
            // La tâche existe déjà dans Firebase, mise à jour
            const firebaseTask = firebaseTasksMap[localTask.id];
            result = await FirestoreManager.updateTask(category, firebaseTask.id, {
              ...localTask,
              localId: localTask.id
            });
          } else {
            // Nouvelle tâche à ajouter à Firebase
            result = await FirestoreManager.addTask(category, {
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
        // Récupérer les tâches depuis Firebase
        const result = await FirestoreManager.getTasks(category);
        
        if (result.success) {
          results[category] = result.data;
        } else {
          console.error(`Erreur lors de la récupération des tâches ${category}:`, result.error);
          results[category] = [];
        }
      }
      
      return { success: true, data: results };
    } catch (error) {
      console.error('Exception lors de la synchronisation depuis Firebase:', error);
      return { success: false, error };
    }
  }
  
  // ===== STATISTIQUES =====
  
  // Mettre à jour les statistiques quotidiennes
  static async updateDailyStatistics(date, completed, total) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, impossible de mettre à jour les statistiques');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      return await FirestoreManager.updateDailyStatistics({
        date,
        completed,
        total,
        rate
      });
    } catch (error) {
      console.error('Exception lors de la mise à jour des statistiques quotidiennes:', error);
      return { success: false, error };
    }
  }
  
  // Mettre à jour les statistiques hebdomadaires
  static async updateWeeklyStatistics(startDate, endDate, completed, total) {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, impossible de mettre à jour les statistiques');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      return await FirestoreManager.updateWeeklyStatistics({
        startDate,
        endDate,
        completed,
        total,
        rate
      });
    } catch (error) {
      console.error('Exception lors de la mise à jour des statistiques hebdomadaires:', error);
      return { success: false, error };
    }
  }
  
  // Récupérer toutes les statistiques
  static async getStatistics() {
    if (!this.isUserLoggedIn()) {
      console.warn('Utilisateur non connecté, impossible de récupérer les statistiques');
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      return await FirestoreManager.getStatistics();
    } catch (error) {
      console.error('Exception lors de la récupération des statistiques:', error);
      return { success: false, error };
    }
  }
}

export { TodoFirebaseManager };
