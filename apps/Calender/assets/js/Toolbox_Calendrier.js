// Assure-toi que Toolbox.js est déjà chargé avant ce fichier

// FIRST_EDIT: Import Firebase auth and Firestore utilities for persistance
import { auth, db } from '/frontend/js/firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class CalendarToolbox extends Toolbox {
  // FIRST_EDIT: Override saveConfig to persist features in Firestore subcollection
  async saveConfig() {
    if (auth.currentUser) {
      const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'calendar');
      await setDoc(toolboxRef, { features: this.features, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      super.saveConfig();
    }
  }

  constructor() {
    super({
      appName: 'Calendar',
      buttonContainer: '.header-actions',
      features: []
    });
    this.loadFeaturesFromJSON();
  }

  // FIRST_EDIT: Load JSON then Firestore overrides and apply features
  async loadFeaturesFromJSON() {
    try {
      const response = await fetch('assets/js/Toolbox_Calendrier.json');
      const features = await response.json();
      this.features = features;
    } catch (e) {
      console.error('Erreur lors du chargement des fonctionnalités Toolbox:', e);
    }
    // Charger la config depuis Firestore si l'utilisateur est connecté
    await this.loadConfigFromFirestore();
    this.createFeatureElements();
    this.applyEnabledFeatures();
  }

  createFeatureElements() {
    // Aucune création d'élément nécessaire; on agit sur les boutons existants
  }

  resetFeatures() {
    // Masquer tous les boutons 'Aujourd\'hui'
    document.querySelectorAll('.today-btn').forEach(btn => btn.style.display = 'none');
  }

  applyFeature(featureName) {
    if (featureName === "Bouton Aujourd'hui") {
      document.querySelectorAll('.today-btn').forEach(btn => btn.style.display = '');
    }
  }

  // FIRST_EDIT: Load saved config from Firestore subcollection
  async loadConfigFromFirestore() {
    if (auth.currentUser) {
      const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'calendar');
      const snap = await getDoc(toolboxRef);
      if (snap.exists() && snap.data().features) {
        this.features = snap.data().features;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.calendarToolbox = new CalendarToolbox();
}); 