/**
 * Toolbox.js
 * Module générique pour gérer les fonctionnalités optionnelles d'une application
 * 
 * Ce fichier fournit une classe Toolbox générique qui peut être étendue
 * pour créer des Toolbox spécifiques à chaque application.
 * 
 * @author Manus
 * @version 1.0.0
 */

class Toolbox {
  /**
   * Constructeur de la Toolbox
   * @param {Object} options - Options de configuration
   * @param {string} options.appName - Nom de l'application (ex: "Calendar", "Todo", "Kanban")
   * @param {string} options.buttonContainer - Sélecteur CSS du conteneur où ajouter le bouton Toolbox
   * @param {string} options.storagePrefix - Préfixe pour le stockage local (défaut: "toolbox_")
   * @param {Array} options.features - Liste des fonctionnalités disponibles
   */
  constructor(options = {}) {
    // Paramètres par défaut
    this.appName = options.appName || 'App';
    this.buttonContainer = options.buttonContainer || 'body';
    this.storagePrefix = options.storagePrefix || 'toolbox_';
    this.features = options.features || [];
    
    // Identifiants générés
    this.modalId = `toolbox-${this.appName.toLowerCase()}-modal`;
    this.storageKey = `${this.storagePrefix}${this.appName.toLowerCase()}_config`;
    
    // Initialisation
    this.init();
  }

  /**
   * Initialise la Toolbox
   */
  async init() {
    // Charger la configuration depuis le localStorage si disponible
    this.loadConfig();
    
    // Ajouter le bouton Toolbox à l'interface
    this.addToolboxButton();
    
    // Créer la modale (cachée par défaut)
    this.createModal();
    
    // Créer les éléments des fonctionnalités (masqués par défaut)
    this.createFeatureElements();
    
    // Appliquer les fonctionnalités activées
    this.applyEnabledFeatures();
    
    // Déclencher un événement pour signaler que la Toolbox est prête
    this.dispatchEvent('toolbox:ready');
  }

  /**
   * Charge la configuration depuis le localStorage
   */
  loadConfig() {
    // Essayer de charger depuis le localStorage
    const savedConfig = localStorage.getItem(this.storageKey);
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig.features && Array.isArray(parsedConfig.features)) {
          // Mettre à jour uniquement les propriétés enabled et gif
          parsedConfig.features.forEach((savedFeature, index) => {
            if (index < this.features.length) {
              this.features[index].enabled = savedFeature.enabled;
              if (savedFeature.gif) {
                this.features[index].gif = savedFeature.gif;
              }
            }
          });
        }
      } catch (e) {
        console.error(`[Toolbox ${this.appName}] Erreur lors du chargement de la configuration sauvegardée:`, e);
      }
    }
  }

  /**
   * Sauvegarde la configuration dans le localStorage
   */
  saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({ features: this.features }));
    } catch (e) {
      console.error(`[Toolbox ${this.appName}] Erreur lors de la sauvegarde de la configuration:`, e);
    }
  }

  /**
   * Ajoute le bouton Toolbox à l'interface
   */
  addToolboxButton() {
    const button = document.createElement('button');
    button.id = `toolbox-${this.appName.toLowerCase()}-btn`;
    button.className = 'toolbox-btn';
    button.innerHTML = 'Toolbox';
    button.title = 'Gérer les fonctionnalités optionnelles';
    
    // Ajouter le bouton au conteneur spécifié
    const targetElement = document.querySelector(this.buttonContainer);
    if (targetElement) {
      targetElement.appendChild(button);
    } else {
      console.warn(`[Toolbox ${this.appName}] Conteneur de bouton non trouvé: ${this.buttonContainer}`);
      document.body.appendChild(button);
    }
    
    // Ajouter l'événement pour ouvrir la modale
    button.addEventListener('click', () => this.openModal());
  }

  /**
   * Crée la modale de la Toolbox
   */
  createModal() {
    // Vérifier si la modale existe déjà
    if (document.getElementById(this.modalId)) {
      return;
    }
    
    // Créer l'élément de la modale
    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.className = 'toolbox-modal';
    
    // Contenu de la modale
    modal.innerHTML = `
      <div class="toolbox-modal-content">
        <div class="toolbox-modal-header">
          <h2>Toolbox ${this.appName}</h2>
          <span class="toolbox-close">&times;</span>
        </div>
        <div class="toolbox-modal-body">
          <p>Activez ou désactivez les fonctionnalités optionnelles de ${this.appName}.</p>
          <div id="toolbox-features-list"></div>
        </div>
      </div>
    `;
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Ajouter les événements
    const closeBtn = modal.querySelector('.toolbox-close');
    closeBtn.addEventListener('click', () => this.closeModal());
    
    // Fermer la modale si on clique en dehors
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  /**
   * Crée les éléments des fonctionnalités (masqués par défaut)
   * Cette méthode doit être surchargée dans les classes dérivées
   */
  createFeatureElements() {
    // À implémenter dans les classes dérivées
    console.log(`[Toolbox ${this.appName}] Méthode createFeatureElements() appelée mais non implémentée`);
  }

  /**
   * Ouvre la modale et affiche les fonctionnalités
   */
  openModal() {
    // Mettre à jour la liste des fonctionnalités
    this.renderFeaturesList();
    
    // Afficher la modale
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  /**
   * Ferme la modale
   */
  closeModal() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Affiche la liste des fonctionnalités dans la modale
   */
  renderFeaturesList() {
    const container = document.getElementById('toolbox-features-list');
    if (!container) {
      console.error(`[Toolbox ${this.appName}] Conteneur de fonctionnalités non trouvé`);
      return;
    }
    
    container.innerHTML = '';
    
    this.features.forEach((feature, index) => {
      const featureElement = document.createElement('div');
      featureElement.className = 'toolbox-feature';
      
      // Contenu de l'élément de fonctionnalité
      featureElement.innerHTML = `
        <div class="toolbox-feature-header">
          <h3>${feature.name}</h3>
          <label class="toolbox-switch">
            <input type="checkbox" data-index="${index}" ${feature.enabled ? 'checked' : ''}>
            <span class="toolbox-slider"></span>
          </label>
        </div>
        <p class="toolbox-feature-description">${feature.description}</p>
        <div class="toolbox-feature-gif">
          ${feature.gif ? `<img src="${feature.gif}" alt="${feature.name}">` : 
          '<div class="toolbox-gif-upload">'+
          `<label for="gif-upload-${index}">Ajouter un GIF d'illustration</label>`+
          `<input type="file" id="gif-upload-${index}" data-index="${index}" accept="image/gif">`+
          '</div>'}
        </div>
      `;
      
      container.appendChild(featureElement);
      
      // Ajouter les événements
      const checkbox = featureElement.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', (e) => {
        this.toggleFeature(parseInt(e.target.dataset.index), e.target.checked);
      });
      
      const fileInput = featureElement.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          this.handleGifUpload(parseInt(e.target.dataset.index), e.target.files[0]);
        });
      }
    });
  }

  /**
   * Active ou désactive une fonctionnalité
   * @param {number} index - Index de la fonctionnalité dans le tableau
   * @param {boolean} enabled - État d'activation
   */
  toggleFeature(index, enabled) {
    if (index >= 0 && index < this.features.length) {
      this.features[index].enabled = enabled;
      this.saveConfig();
      this.applyEnabledFeatures();
      
      // Fermer la modale après activation/désactivation pour voir les changements
      this.closeModal();
      
      // Afficher un message de confirmation
      const featureName = this.features[index].name;
      const status = enabled ? 'activée' : 'désactivée';
      this.showNotification(`La fonctionnalité "${featureName}" a été ${status} avec succès!`);
      
      // Déclencher un événement
      this.dispatchEvent('toolbox:feature:toggle', {
        feature: this.features[index],
        enabled: enabled
      });
    }
  }

  /**
   * Gère l'upload d'un GIF pour une fonctionnalité
   * @param {number} index - Index de la fonctionnalité
   * @param {File} file - Fichier GIF uploadé
   */
  handleGifUpload(index, file) {
    if (!file || !file.type.includes('gif')) {
      this.showNotification('Veuillez sélectionner un fichier GIF valide.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.features[index].gif = e.target.result;
      this.saveConfig();
      this.renderFeaturesList();
      
      // Déclencher un événement
      this.dispatchEvent('toolbox:feature:gif', {
        feature: this.features[index],
        gif: e.target.result
      });
    };
    reader.readAsDataURL(file);
  }

  /**
   * Applique les fonctionnalités activées
   */
  applyEnabledFeatures() {
    // Réinitialiser toutes les fonctionnalités
    this.resetFeatures();
    
    // Appliquer chaque fonctionnalité activée
    this.features.forEach((feature, index) => {
      if (feature.enabled) {
        this.applyFeature(feature.name);
      }
    });
  }

  /**
   * Réinitialise toutes les fonctionnalités
   * Cette méthode doit être surchargée dans les classes dérivées
   */
  resetFeatures() {
    // À implémenter dans les classes dérivées
    console.log(`[Toolbox ${this.appName}] Méthode resetFeatures() appelée mais non implémentée`);
  }

  /**
   * Applique une fonctionnalité spécifique
   * Cette méthode doit être surchargée dans les classes dérivées
   * @param {string} featureName - Nom de la fonctionnalité à appliquer
   */
  applyFeature(featureName) {
    // À implémenter dans les classes dérivées
    console.log(`[Toolbox ${this.appName}] Méthode applyFeature() appelée mais non implémentée pour: ${featureName}`);
  }

  /**
   * Affiche une notification à l'utilisateur
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (info, success, error)
   */
  showNotification(message, type = 'info') {
    alert(message);
  }

  /**
   * Déclenche un événement personnalisé
   * @param {string} name - Nom de l'événement
   * @param {Object} detail - Détails de l'événement
   */
  dispatchEvent(name, detail = {}) {
    const event = new CustomEvent(name, {
      detail: {
        toolbox: this,
        ...detail
      },
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }
}

// Exporter la classe pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Toolbox;
}
