// Assure-toi que Toolbox.js est déjà chargé avant ce fichier

// Import Firebase auth and Firestore utilities for persistence
import { auth, db } from '../../../../frontend/js/firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class TodoToolbox extends Toolbox {
  constructor() {
    super({
      appName: 'Todo',
      buttonContainer: '.header-actions', // Cible le conteneur à droite du header
      features: [] // Sera chargé depuis JSON
    });
    console.log('TodoToolbox constructor - début');
    
    // Écouter les changements d'état d'authentification
    auth.onAuthStateChanged((user) => {
      console.log('Auth state changed dans TodoToolbox:', user ? 'connecté' : 'déconnecté');
      if (user) {
        // L'utilisateur vient de se connecter, recharger depuis Firestore
        setTimeout(() => {
          console.log('Rechargement Firestore après connexion...');
          this.loadFromFirestoreAsync();
        }, 1000); // Petit délai pour s'assurer que Firestore est prêt
      }
    });
    
    this.loadFeaturesFromJSON();
    this.todoApp = window.todoApp; // Référence vers les fonctions/données de todo.js
  }

  // Override saveConfig to persist features in Firestore subcollection
  async saveConfig() {
    console.log('TodoToolbox.saveConfig() appelée avec features:', this.features);
    if (auth.currentUser) {
      console.log('Sauvegarde dans Firestore pour UID:', auth.currentUser.uid);
      const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'todo');
      await setDoc(toolboxRef, { features: this.features, updatedAt: serverTimestamp() }, { merge: true });
      console.log('Sauvegarde Firestore terminée');
    } else {
      console.log('Utilisateur non connecté, sauvegarde localStorage');
      super.saveConfig();
    }
  }

  async loadFeaturesFromJSON() {
    console.log('loadFeaturesFromJSON() - début');
    try {
      const response = await fetch('assets/js/Toolbox_Todo.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const features = await response.json();
      this.features = features;
      console.log('Features chargées depuis JSON:', this.features);
    } catch (e) {
      console.error('Erreur lors du chargement des fonctionnalités Toolbox Todo:', e);
    }
    
    // PREMIÈRE APPLICATION INSTANTANÉE avec les défauts JSON
    this.createFeatureElements();
    this.applyEnabledFeatures();
    console.log('Application instantanée des défauts JSON terminée');
    
    // CHARGEMENT FIRESTORE EN ARRIÈRE-PLAN
    this.loadFromFirestoreAsync();
    console.log('loadFeaturesFromJSON() - fin');
  }

  // Charger depuis Firestore en arrière-plan et mettre à jour si nécessaire
  async loadFromFirestoreAsync() {
    console.log('Chargement Firestore en arrière-plan...');
    
    // Attendre que l'auth soit prêt
    await this.waitForAuth();
    
    if (auth.currentUser) {
      // Sauvegarder l'ancien état pour comparaison
      const oldFeatures = JSON.stringify(this.features);
      
      // Charger la config depuis Firestore
      await this.loadConfigFromFirestore();
      console.log('Features après Firestore:', this.features);
      
      const newFeatures = JSON.stringify(this.features);
      
      // Si les features ont changé, tout mettre à jour
      if (oldFeatures !== newFeatures) {
        console.log('Les features ont changé, mise à jour complète...');
        this.createFeatureElements();
        this.applyEnabledFeatures();
        
        // IMPORTANT: Mettre à jour l'interface de la Toolbox si elle est ouverte
        this.updateToolboxInterface();
      }
      console.log('Mise à jour depuis Firestore terminée');
    }
  }

  // Mettre à jour l'interface de la Toolbox modal si elle est ouverte
  updateToolboxInterface() {
    const modal = document.getElementById(this.modalId);
    if (modal && modal.style.display === 'block') {
      console.log('Mise à jour de l\'interface Toolbox ouverte');
      this.renderFeaturesList();
    }
  }

  // Override pour s'assurer que les changements sont bien sauvegardés ET appliqués
  async toggleFeature(index, enabled) {
    console.log(`toggleFeature appelée: index=${index}, enabled=${enabled}`);
    if (index >= 0 && index < this.features.length) {
      this.features[index].enabled = enabled;
      
      // Sauvegarder immédiatement
      await this.saveConfig();
      
      // Appliquer immédiatement les changements
      this.applyEnabledFeatures();
      
      // Fermer la modale pour voir les changements
      this.closeModal();
      
      // Afficher un message de confirmation
      const featureName = this.features[index].name;
      const status = enabled ? 'activée' : 'désactivée';
      console.log(`La fonctionnalité "${featureName}" a été ${status}`);
    }
  }

  // Attendre que l'authentification soit prête
  async waitForAuth() {
    return new Promise((resolve) => {
      if (auth.currentUser) {
        console.log('Auth déjà prête');
        resolve();
      } else {
        console.log('Attente de l\'auth...');
        const unsubscribe = auth.onAuthStateChanged((user) => {
          console.log('Auth state changed:', user ? 'connecté' : 'déconnecté');
          unsubscribe();
          resolve();
        });
      }
    });
  }

  // Load saved config from Firestore subcollection
  async loadConfigFromFirestore() {
    console.log('loadConfigFromFirestore() - début');
    if (auth.currentUser) {
      console.log('Chargement depuis Firestore pour UID:', auth.currentUser.uid);
      const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'todo');
      const snap = await getDoc(toolboxRef);
      if (snap.exists() && snap.data().features) {
        console.log('Config trouvée dans Firestore:', snap.data().features);
        this.features = snap.data().features;
      } else {
        console.log('Aucune config Firestore trouvée, utilisation des défauts JSON');
      }
    } else {
      console.log('Utilisateur non connecté, pas de chargement Firestore');
    }
  }

  // Surcharger createFeatureElements pour créer les éléments nécessaires
  createFeatureElements() {
    // Créer le bouton de duplication s'il n'existe pas déjà
    if (!document.getElementById('duplicate-yesterday-button')) {
      const duplicateBtn = document.createElement('button');
      duplicateBtn.id = 'duplicate-yesterday-button';
      duplicateBtn.className = 'action-button';
      duplicateBtn.innerHTML = '<i class="fas fa-copy"></i> Dupliquer tâches d\'hier';
      duplicateBtn.title = 'Dupliquer les tâches de la veille vers aujourd\'hui';
      duplicateBtn.style.display = 'none'; // Masqué par défaut
      duplicateBtn.addEventListener('click', () => this.duplicateYesterdayTasks());
      
      // L'ajouter dans la vue quotidienne, près de la navigation de date
      const dailyViewHeader = document.querySelector('#daily-view .view-header .navigation');
      if (dailyViewHeader) {
        dailyViewHeader.appendChild(duplicateBtn);
      } else {
        // Fallback : l'ajouter dans le conteneur principal
        const todoMain = document.querySelector('.todo-main');
        if (todoMain) {
          todoMain.appendChild(duplicateBtn);
        }
      }
    }
  }

  // Surcharger resetFeatures pour masquer tous les éléments
  resetFeatures() {
    const duplicateBtn = document.getElementById('duplicate-yesterday-button');
    if (duplicateBtn) {
      duplicateBtn.style.display = 'none';
    }
  }

  // Surcharger applyFeature pour activer les fonctionnalités selon leur nom
  applyFeature(featureName) {
    if (featureName === 'Dupliquer tâches d\'hier') {
      const duplicateBtn = document.getElementById('duplicate-yesterday-button');
      if (duplicateBtn) {
        duplicateBtn.style.display = 'inline-block';
      }
    }
  }

  // ===== LOGIQUE DE DUPLICATION (DÉPLACÉE DE TODO.JS) =====
  async duplicateYesterdayTasks() {
    if (!this.todoApp) {
      console.error("todoApp n'est pas initialisé dans Toolbox_Todo.");
      this.showNotification("Erreur interne (todoApp non trouvé)", "error");
      return;
    }

    const {
      currentDailyDate,
      tasks,
      showNotification,
      updateDailyDisplay,
      loadDailyTasks,
      saveTasksToLocalStorage,
      getLocalDateString,
      isSameDay,
      generateId
    } = this.todoApp;
    
    if (!currentDailyDate || !tasks || !showNotification || !updateDailyDisplay || !loadDailyTasks || !saveTasksToLocalStorage || !getLocalDateString || !isSameDay || !generateId) {
        console.error("Une ou plusieurs dépendances de todoApp sont manquantes pour duplicateYesterdayTasks.");
        this.showNotification("Erreur: Dépendance manquante pour la duplication.", "error");
        return;
    }

    const yesterday = new Date(currentDailyDate);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);

    const yesterdayTasks = tasks.daily.filter(task => {
      const taskDateObj = new Date(task.date);
      return isSameDay(taskDateObj, yesterday);
    });

    if (yesterdayTasks.length === 0) {
      const yesterdayStr = yesterday.toLocaleDateString('fr-FR');
      showNotification(`Aucune tâche trouvée pour le ${yesterdayStr}`, "warning");
      return;
    }

    const duplicatedTasks = yesterdayTasks.map(task => {
      const newTask = { ...task };
      newTask.id = generateId();
      newTask.date = getLocalDateString(targetDate);
      newTask.completed = false;
      if (newTask.repetition && newTask.repetition.total > 0) {
        newTask.repetition.done = 0;
      }
      return newTask;
    });

    tasks.daily.push(...duplicatedTasks);
    saveTasksToLocalStorage();

    const isConnected = typeof TodoFirebaseManager !== 'undefined' &&
                        TodoFirebaseManager.isUserLoggedIn &&
                        TodoFirebaseManager.isUserLoggedIn();

    if (isConnected) {
      for (const task of duplicatedTasks) {
        try {
          await TodoFirebaseManager.addTask('daily', task);
        } catch (error) {
          console.error(`Toolbox: Erreur sauvegarde Firestore pour "${task.title}":`, error);
        }
      }
    }
    
    updateDailyDisplay();
    setTimeout(() => loadDailyTasks(), 100);

    const targetDateStr = targetDate.toLocaleDateString('fr-FR');
    const yesterdayStr = yesterday.toLocaleDateString('fr-FR');
    showNotification(`${duplicatedTasks.length} tâche(s) dupliquée(s) du ${yesterdayStr} vers le ${targetDateStr}`, "success");
  }

  // Surcharger showNotification pour utiliser celle de todo.js si disponible
  showNotification(message, type = 'info') {
    if (this.todoApp && this.todoApp.showNotification) {
      this.todoApp.showNotification(message, type);
    } else {
      // Fallback sur la méthode de base
      super.showNotification(message, type);
    }
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Toolbox === 'undefined') {
    console.error("Toolbox class is not defined. Make sure Toolbox.js is loaded before Toolbox_Todo.js");
    return;
  }
  window.todoToolbox = new TodoToolbox();
}); 