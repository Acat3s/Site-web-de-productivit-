// Assure-toi que Toolbox.js est déjà chargé avant ce fichier

class TodoToolbox extends Toolbox {
  constructor() {
    super({
      appName: 'Todo',
      buttonContainer: '.header-actions', // Cible le conteneur à droite du header
      features: [] // On charge depuis le JSON
    });
    this.loadFeaturesFromJSON();
  }

  async loadFeaturesFromJSON() {
    try {
      const response = await fetch('assets/js/Toolbox_Todo.json');
      const features = await response.json();
      this.features = features;
      this.saveConfig();
      this.createFeatureElements();
      this.applyEnabledFeatures();
    } catch (e) {
      console.error('Erreur lors du chargement des fonctionnalités Toolbox:', e);
    }
  }

  createFeatureElements() {
    // Export PDF
    if (!document.getElementById('export-pdf-button')) {
      const exportBtn = document.createElement('button');
      exportBtn.id = 'export-pdf-button';
      exportBtn.className = 'toolbox-feature-element';
      exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Exporter en PDF';
      exportBtn.style.display = 'none';
      exportBtn.addEventListener('click', () => this.exportPDF());
      document.querySelector('.todo-main').appendChild(exportBtn);
    }

    // Statistiques
    if (!document.getElementById('stats-container')) {
      const statsDiv = document.createElement('div');
      statsDiv.id = 'stats-container';
      statsDiv.className = 'toolbox-feature-element';
      statsDiv.style.display = 'none';
      statsDiv.innerHTML = `
        <h3>Statistiques par catégorie</h3>
        <canvas id="stats-chart" width="400" height="200"></canvas>
      `;
      document.querySelector('.todo-main').appendChild(statsDiv);
    }
  }

  resetFeatures() {
    // Masquer tous les éléments optionnels
    const exportBtn = document.getElementById('export-pdf-button');
    if (exportBtn) exportBtn.style.display = 'none';

    const statsDiv = document.getElementById('stats-container');
    if (statsDiv) statsDiv.style.display = 'none';
  }

  applyFeature(featureName) {
    if (featureName === 'Export PDF') {
      const exportBtn = document.getElementById('export-pdf-button');
      if (exportBtn) exportBtn.style.display = 'inline-block';
    }
    if (featureName === 'Statistiques par catégorie') {
      const statsDiv = document.getElementById('stats-container');
      if (statsDiv) {
        statsDiv.style.display = 'block';
        this.renderStats();
      }
    }
  }

  exportPDF() {
    // Exemple simple : impression de la liste des tâches
    window.print();
    // Pour un vrai export PDF, tu peux utiliser jsPDF ou html2pdf.js
    this.showNotification('Export PDF déclenché (exemple simple)', 'success');
  }

  renderStats() {
    // Exemple simple : compter les tâches par catégorie
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const categories = ['daily', 'weekly', 'punctual'];
    const data = categories.map(cat => (tasks[cat] ? tasks[cat].length : 0));

    // Utilise Chart.js si tu veux un vrai graphique, sinon simple texte
    const ctx = document.getElementById('stats-chart').getContext('2d');
    if (window.statsChart) window.statsChart.destroy();
    window.statsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Quotidiennes', 'Hebdomadaires', 'Ponctuelles'],
        datasets: [{
          label: 'Nombre de tâches',
          data: data,
          backgroundColor: ['#2196F3', '#4CAF50', '#FFC107']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// Initialisation

document.addEventListener('DOMContentLoaded', () => {
  window.todoToolbox = new TodoToolbox();
}); 