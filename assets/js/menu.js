// Fonction pour basculer entre le mode clair et sombre
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Animation de transition
  document.body.style.opacity = '0.8';
  
  setTimeout(() => {
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Mettre à jour l'icône du bouton
    const themeIcon = document.getElementById('theme-icon');
    if (newTheme === 'dark') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
    
    // Sauvegarder la préférence dans localStorage
    localStorage.setItem('theme', newTheme);
    
    document.body.style.opacity = '1';
  }, 200);
}

// Appliquer le thème sauvegardé ou par défaut
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Mettre à jour l'icône du bouton
  const themeIcon = document.getElementById('theme-icon');
  if (savedTheme === 'dark') {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
  
  // Ajouter des effets d'interaction aux cartes
  const appCards = document.querySelectorAll('.app-card');
  
  appCards.forEach(card => {
    // Effet de parallaxe sur l'icône
    card.addEventListener('mousemove', (e) => {
      const icon = card.querySelector('.app-icon');
      if (!icon) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 20;
      const moveY = (y - centerY) / 20;
      
      icon.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    });
    
    // Réinitialiser la position de l'icône
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.app-icon');
      if (!icon) return;
      
      icon.style.transform = 'translate(0, 0) scale(1)';
    });
  });
  
  // Animation de pulsation pour les icônes
  setInterval(() => {
    const icons = document.querySelectorAll('.app-icon');
    icons.forEach(icon => {
      icon.style.transform = 'scale(1.05)';
      setTimeout(() => {
        icon.style.transform = 'scale(1)';
      }, 500);
    });
  }, 3000);
});
