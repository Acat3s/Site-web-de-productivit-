// Fonction pour afficher le pop-up
function showPopup() {
  document.getElementById('event-popup-overlay').style.display = 'block';
  document.getElementById('event-popup').style.display = 'block';
}

// Fonction pour fermer le pop-up
function closePopup() {
  document.getElementById('event-popup-overlay').style.display = 'none';
  document.getElementById('event-popup').style.display = 'none';
}

// Fonction pour basculer le mode sombre
function toggleDarkMode() {
  document.body.setAttribute('data-theme', 
    document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

// Initialiser les gestionnaires d'événements
document.addEventListener('DOMContentLoaded', function() {
  // Gestionnaire pour le bouton de fermeture
  document.querySelector('.close-popup').addEventListener('click', closePopup);
  
  // Gestionnaire pour le bouton Annuler
  document.getElementById('cancel-event').addEventListener('click', closePopup);
  
  // Gestionnaire pour l'overlay
  document.getElementById('event-popup-overlay').addEventListener('click', closePopup);
  
  // Empêcher la propagation des clics dans le pop-up
  document.getElementById('event-popup').addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Gestionnaire pour le formulaire
  document.getElementById('event-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Événement enregistré avec succès !');
    closePopup();
  });
  
  // Gestionnaire pour les options de couleur
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
      // Retirer la classe selected de toutes les options
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Ajouter la classe selected à l'option cliquée
      this.classList.add('selected');
      
      // Mettre à jour la couleur de l'aperçu
      const color = this.getAttribute('data-color');
      document.getElementById('color-preview').style.backgroundColor = color;
    });
  });
  
  // Gestionnaire pour les onglets
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
      // Retirer la classe active de tous les boutons et contenus
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Ajouter la classe active au bouton cliqué
      this.classList.add('active');
      
      // Afficher le contenu correspondant
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId + '-tab').classList.add('active');
    });
  });
  
  // Gestionnaire pour le switch "Journée entière"
  document.getElementById('all-day-event').addEventListener('change', function() {
    const startTime = document.getElementById('event-start-time');
    const endTime = document.getElementById('event-end-time');
    
    if (this.checked) {
      startTime.disabled = true;
      endTime.disabled = true;
    } else {
      startTime.disabled = false;
      endTime.disabled = false;
    }
  });
}); 