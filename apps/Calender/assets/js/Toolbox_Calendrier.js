// Assure-toi que Toolbox.js est déjà chargé avant ce fichier

// FIRST_EDIT: Import Firebase auth and Firestore utilities for persistance
import { auth, db } from '../../../../frontend/js/firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class CalendarToolbox extends Toolbox {
  // FIRST_EDIT: Override saveConfig to persist features in Firestore subcollection
  async saveConfig() {
    console.log('CalendarToolbox.saveConfig() appelée avec features:', this.features);
    if (auth.currentUser) {
      console.log('Sauvegarde dans Firestore pour UID:', auth.currentUser.uid);
      const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'calendar');
      await setDoc(toolboxRef, { features: this.features, updatedAt: serverTimestamp() }, { merge: true });
      console.log('Sauvegarde Firestore terminée');
    } else {
      console.log('Utilisateur non connecté, sauvegarde localStorage');
      super.saveConfig();
    }
  }

  constructor() {
    super({
      appName: 'Calendar',
      buttonContainer: '.header-actions',
      features: []
    });
    console.log('CalendarToolbox constructor - début');
    
    // Écouter les changements d'état d'authentification
    auth.onAuthStateChanged((user) => {
      console.log('Auth state changed dans CalendarToolbox:', user ? 'connecté' : 'déconnecté');
      if (user) {
        // L'utilisateur vient de se connecter, recharger depuis Firestore
        setTimeout(() => {
          console.log('Rechargement Firestore après connexion...');
          this.loadFromFirestoreAsync();
        }, 1000); // Petit délai pour s'assurer que Firestore est prêt
      }
    });
    
    this.loadFeaturesFromJSON();
  }

  // FIRST_EDIT: Load JSON then Firestore overrides and apply features
  async loadFeaturesFromJSON() {
    console.log('loadFeaturesFromJSON() - début');
    try {
      const response = await fetch('assets/js/Toolbox_Calendrier.json');
      const features = await response.json();
      this.features = features;
      console.log('Features chargées depuis JSON:', this.features);
    } catch (e) {
      console.error('Erreur lors du chargement des fonctionnalités Toolbox:', e);
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

  createFeatureElements() {
    // Aucune création d'élément nécessaire; on agit sur les boutons existants
    console.log('createFeatureElements() appelée');
  }

  resetFeatures() {
    // Masquer tous les boutons 'Aujourd\'hui'
    console.log('resetFeatures() - masquage de tous les boutons today-btn');
    document.querySelectorAll('.today-btn').forEach(btn => btn.style.display = 'none');
  }

  applyFeature(featureName) {
    console.log('applyFeature() appelée pour:', featureName);
    if (featureName === "Bouton Aujourd'hui") {
      console.log('Affichage des boutons today-btn');
      document.querySelectorAll('.today-btn').forEach(btn => btn.style.display = '');
    }
  }

  // FIRST_EDIT: Load saved config from Firestore subcollection
  async loadConfigFromFirestore() {
    console.log('loadConfigFromFirestore() - début');
    if (auth.currentUser) {
      console.log('Chargement depuis Firestore pour UID:', auth.currentUser.uid);
      const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'calendar');
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
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready - création de CalendarToolbox');
  window.calendarToolbox = new CalendarToolbox();
}); 