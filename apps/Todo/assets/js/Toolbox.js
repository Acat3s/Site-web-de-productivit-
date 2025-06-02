/**
 * Toolbox.js
 * Module générique pour gérer les fonctionnalités optionnelles d'une application
 * (copié depuis Toolbox_Template/toolbox_template/js/Toolbox.js)
 */

class Toolbox {
  constructor(options = {}) {
    this.appName = options.appName || 'App';
    this.buttonContainer = options.buttonContainer || 'body';
    this.storagePrefix = options.storagePrefix || 'toolbox_';
    this.features = options.features || [];
    this.modalId = `toolbox-${this.appName.toLowerCase()}-modal`;
    this.storageKey = `${this.storagePrefix}${this.appName.toLowerCase()}_config`;
    this.init();
  }

  async init() {
    this.loadConfig();
    this.addToolboxButton();
    this.createModal();
    this.createFeatureElements();
    this.applyEnabledFeatures();
    this.dispatchEvent('toolbox:ready');
  }

  loadConfig() {
    const savedConfig = localStorage.getItem(this.storageKey);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig.features && Array.isArray(parsedConfig.features)) {
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

  saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({ features: this.features }));
    } catch (e) {
      console.error(`[Toolbox ${this.appName}] Erreur lors de la sauvegarde de la configuration:`, e);
    }
  }

  addToolboxButton() {
    const button = document.createElement('button');
    button.id = `toolbox-${this.appName.toLowerCase()}-btn`;
    button.className = 'toolbox-btn';
    button.innerHTML = 'Toolbox';
    button.title = 'Gérer les fonctionnalités optionnelles';
    const targetElement = document.querySelector(this.buttonContainer);
    if (targetElement) {
      targetElement.appendChild(button);
    } else {
      console.warn(`[Toolbox ${this.appName}] Conteneur de bouton non trouvé: ${this.buttonContainer}`);
      document.body.appendChild(button);
    }
    button.addEventListener('click', () => this.openModal());
  }

  createModal() {
    if (document.getElementById(this.modalId)) {
      return;
    }
    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.className = 'toolbox-modal';
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
    document.body.appendChild(modal);
    const closeBtn = modal.querySelector('.toolbox-close');
    closeBtn.addEventListener('click', () => this.closeModal());
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  createFeatureElements() {
    // À implémenter dans les classes dérivées
    console.log(`[Toolbox ${this.appName}] Méthode createFeatureElements() appelée mais non implémentée`);
  }

  openModal() {
    this.renderFeaturesList();
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeModal() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

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

  toggleFeature(index, enabled) {
    if (index >= 0 && index < this.features.length) {
      this.features[index].enabled = enabled;
      this.saveConfig();
      this.applyEnabledFeatures();
      this.closeModal();
      const featureName = this.features[index].name;
      const status = enabled ? 'activée' : 'désactivée';
      this.showNotification(`La fonctionnalité "${featureName}" a été ${status} avec succès!`);
      this.dispatchEvent('toolbox:feature:toggle', {
        feature: this.features[index],
        enabled: enabled
      });
    }
  }

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
      this.dispatchEvent('toolbox:feature:gif', {
        feature: this.features[index],
        gif: e.target.result
      });
    };
    reader.readAsDataURL(file);
  }

  applyEnabledFeatures() {
    this.resetFeatures();
    this.features.forEach((feature, index) => {
      if (feature.enabled) {
        this.applyFeature(feature.name);
      }
    });
  }

  resetFeatures() {
    // À implémenter dans les classes dérivées
    console.log(`[Toolbox ${this.appName}] Méthode resetFeatures() appelée mais non implémentée`);
  }

  applyFeature(featureName) {
    // À implémenter dans les classes dérivées
    console.log(`[Toolbox ${this.appName}] Méthode applyFeature() appelée mais non implémentée pour: ${featureName}`);
  }

  showNotification(message, type = 'info') {
    alert(message);
  }

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