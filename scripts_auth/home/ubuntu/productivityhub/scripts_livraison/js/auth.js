// Système d'authentification pour ProductivityHub

// État global de l'authentification
const authState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  bannerDismissed: false
};

// Initialisation du système d'authentification
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si l'utilisateur est connecté
  checkAuthStatus();
  
  // Initialiser les éléments d'interface
  initAuthUI();
});

// Vérifier le statut d'authentification
async function checkAuthStatus() {
  try {
    authState.isLoading = true;
    updateAuthUI();
    
    const response = await fetch('/api/auth/check-auth');
    const data = await response.json();
    
    authState.isAuthenticated = data.authenticated;
    authState.user = data.user || null;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'authentification:', error);
    authState.isAuthenticated = false;
    authState.user = null;
  } finally {
    authState.isLoading = false;
    updateAuthUI();
  }
}

// Initialiser les éléments d'interface d'authentification
function initAuthUI() {
  // Ajouter le bouton de connexion à l'en-tête
  addAuthButton();
  
  // Ajouter la modal d'authentification
  addAuthModal();
  
  // Ajouter le bandeau mode invité
  addGuestBanner();
  
  // Mettre à jour l'interface selon l'état d'authentification
  updateAuthUI();
}

// Ajouter le bouton de connexion à l'en-tête
function addAuthButton() {
  // Trouver l'élément d'en-tête où ajouter le bouton
  const headerElement = document.querySelector('.header-top');
  if (!headerElement) return;
  
  // Créer le conteneur pour le bouton/menu utilisateur
  const authContainer = document.createElement('div');
  authContainer.className = 'auth-container';
  
  // Ajouter le conteneur à l'en-tête
  headerElement.appendChild(authContainer);
  
  // Mettre à jour le conteneur avec le bouton ou menu utilisateur
  updateAuthButton();
}

// Mettre à jour le bouton d'authentification selon l'état
function updateAuthButton() {
  const authContainer = document.querySelector('.auth-container');
  if (!authContainer) return;
  
  // Vider le conteneur
  authContainer.innerHTML = '';
  
  if (authState.isLoading) {
    // Afficher un indicateur de chargement
    authContainer.innerHTML = '<div class="auth-loading"><i class="fas fa-spinner fa-spin"></i></div>';
  } else if (authState.isAuthenticated && authState.user) {
    // Afficher le menu utilisateur
    const userMenu = `
      <div class="user-menu">
        <button class="user-button" id="user-button">
          <div class="user-avatar">${authState.user.initials}</div>
        </button>
        <div class="user-dropdown" id="user-dropdown">
          <div class="user-info">
            <div class="user-name">${authState.user.first_name || 'Utilisateur'} ${authState.user.last_name || ''}</div>
            <div class="user-email">${authState.user.email}</div>
          </div>
          <ul class="dropdown-menu">
            <li class="dropdown-item">
              <a href="#" class="dropdown-link">
                <i class="fas fa-user-circle"></i> Mon compte
              </a>
            </li>
            <li class="dropdown-item">
              <a href="#" class="dropdown-link logout-link">
                <i class="fas fa-sign-out-alt"></i> Déconnexion
              </a>
            </li>
          </ul>
        </div>
      </div>
    `;
    
    authContainer.innerHTML = userMenu;
    
    // Ajouter les événements pour le menu utilisateur
    const userButton = document.getElementById('user-button');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userButton && userDropdown) {
      userButton.addEventListener('click', () => {
        userDropdown.classList.toggle('active');
      });
      
      // Fermer le menu si on clique ailleurs
      document.addEventListener('click', (e) => {
        if (!userButton.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      });
      
      // Gérer la déconnexion
      const logoutLink = document.querySelector('.logout-link');
      if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }
    }
  } else {
    // Afficher le bouton de connexion
    const loginButton = `
      <button class="auth-button" id="login-button">
        <i class="fas fa-user"></i> Se connecter
      </button>
    `;
    
    authContainer.innerHTML = loginButton;
    
    // Ajouter l'événement pour ouvrir la modal de connexion
    const loginBtn = document.getElementById('login-button');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        openAuthModal('login');
      });
    }
  }
}

// Ajouter la modal d'authentification
function addAuthModal() {
  // Vérifier si la modal existe déjà
  if (document.getElementById('auth-modal-overlay')) return;
  
  // Créer la modal
  const modalHTML = `
    <div class="modal-overlay" id="auth-modal-overlay">
      <div class="auth-modal">
        <button class="close-modal" id="close-auth-modal">&times;</button>
        
        <div class="auth-tabs">
          <div class="auth-tab active" data-tab="login">Connexion</div>
          <div class="auth-tab" data-tab="register">Inscription</div>
        </div>
        
        <!-- Contenu de connexion -->
        <div class="auth-content active" id="login-content">
          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" class="form-control" placeholder="votre@email.com" required>
            </div>
            
            <div class="form-group">
              <label for="login-password">Mot de passe</label>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" required>
            </div>
            
            <div class="forgot-password">
              <a href="#" id="forgot-password-link">Mot de passe oublié ?</a>
            </div>
            
            <button type="submit" class="btn btn-primary">Se connecter</button>
            <div class="auth-error" id="login-error"></div>
          </form>
          
          <div class="divider">ou</div>
          
          <div class="social-buttons">
            <button class="btn-social btn-google" id="google-login">
              <i class="fab fa-google"></i> Continuer avec Google
            </button>
            <button class="btn-social btn-apple" id="apple-login">
              <i class="fab fa-apple"></i> Continuer avec Apple
            </button>
          </div>
          
          <div class="auth-footer">
            Pas encore de compte ? <a href="#" class="switch-tab" data-target="register">S'inscrire</a>
          </div>
        </div>
        
        <!-- Contenu d'inscription -->
        <div class="auth-content" id="register-content">
          <form class="auth-form" id="register-form">
            <div class="form-group">
              <label for="register-email">Email</label>
              <input type="email" id="register-email" class="form-control" placeholder="votre@email.com" required>
            </div>
            
            <div class="form-group">
              <label for="register-password">Mot de passe</label>
              <input type="password" id="register-password" class="form-control" placeholder="••••••••" required>
            </div>
            
            <div class="form-group">
              <label for="register-confirm-password">Confirmer le mot de passe</label>
              <input type="password" id="register-confirm-password" class="form-control" placeholder="••••••••" required>
            </div>
            
            <button type="submit" class="btn btn-primary">S'inscrire</button>
            <div class="auth-error" id="register-error"></div>
          </form>
          
          <div class="divider">ou</div>
          
          <div class="social-buttons">
            <button class="btn-social btn-google" id="google-register">
              <i class="fab fa-google"></i> Continuer avec Google
            </button>
            <button class="btn-social btn-apple" id="apple-register">
              <i class="fab fa-apple"></i> Continuer avec Apple
            </button>
          </div>
          
          <div class="auth-footer">
            Déjà un compte ? <a href="#" class="switch-tab" data-target="login">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter la modal au document
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Ajouter les événements pour la modal
  initAuthModalEvents();
}

// Initialiser les événements de la modal d'authentification
function initAuthModalEvents() {
  // Gestion des onglets
  const tabs = document.querySelectorAll('.auth-tab');
  const contents = document.querySelectorAll('.auth-content');
  const switchLinks = document.querySelectorAll('.switch-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchAuthTab(tab.dataset.tab);
    });
  });
  
  switchLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab(link.dataset.target);
    });
  });
  
  // Fermeture de la modal
  const closeBtn = document.getElementById('close-auth-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAuthModal);
  }
  
  // Clic en dehors de la modal pour fermer
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeAuthModal();
      }
    });
  }
  
  // Formulaire de connexion
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }
  
  // Formulaire d'inscription
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister();
    });
  }
}

// Changer d'onglet dans la modal d'authentification
function switchAuthTab(tabId) {
  // Désactiver tous les onglets et contenus
  const tabs = document.querySelectorAll('.auth-tab');
  const contents = document.querySelectorAll('.auth-content');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  contents.forEach(content => content.classList.remove('active'));
  
  // Activer l'onglet et le contenu correspondant
  const activeTab = document.querySelector(`.auth-tab[data-tab="${tabId}"]`);
  const activeContent = document.getElementById(`${tabId}-content`);
  
  if (activeTab && activeContent) {
    activeTab.classList.add('active');
    activeContent.classList.add('active');
  }
}

// Ouvrir la modal d'authentification
function openAuthModal(tab = 'login') {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.add('active');
    switchAuthTab(tab);
  }
}

// Fermer la modal d'authentification
function closeAuthModal() {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
  }
}

// Gérer la connexion
async function handleLogin() {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorElement = document.getElementById('login-error');
  
  if (!emailInput || !passwordInput || !errorElement) return;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Validation basique
  if (!email || !password) {
    errorElement.textContent = 'Veuillez remplir tous les champs.';
    return;
  }
  
  try {
    // Désactiver le formulaire pendant la requête
    const submitBtn = document.querySelector('#login-form .btn-primary');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connexion en cours...';
    }
    
    // Envoyer la requête de connexion
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Connexion réussie
      authState.isAuthenticated = true;
      authState.user = data.user;
      
      // Fermer la modal et mettre à jour l'interface
      closeAuthModal();
      updateAuthUI();
      
      // Recharger la page pour afficher les données utilisateur
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // Erreur de connexion
      errorElement.textContent = data.message || 'Erreur de connexion. Veuillez réessayer.';
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    errorElement.textContent = 'Erreur de connexion. Veuillez réessayer.';
  } finally {
    // Réactiver le formulaire
    const submitBtn = document.querySelector('#login-form .btn-primary');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
    }
  }
}

// Gérer l'inscription
async function handleRegister() {
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const errorElement = document.getElementById('register-error');
  
  if (!emailInput || !passwordInput || !confirmPasswordInput || !errorElement) return;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  // Validation basique
  if (!email || !password || !confirmPassword) {
    errorElement.textContent = 'Veuillez remplir tous les champs.';
    return;
  }
  
  if (password !== confirmPassword) {
    errorElement.textContent = 'Les mots de passe ne correspondent pas.';
    return;
  }
  
  try {
    // Désactiver le formulaire pendant la requête
    const submitBtn = document.querySelector('#register-form .btn-primary');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Inscription en cours...';
    }
    
    // Envoyer la requête d'inscription
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Inscription réussie
      authState.isAuthenticated = true;
      authState.user = data.user;
      
      // Fermer la modal et mettre à jour l'interface
      closeAuthModal();
      updateAuthUI();
      
      // Recharger la page pour afficher les données utilisateur
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // Erreur d'inscription
      errorElement.textContent = data.message || 'Erreur d\'inscription. Veuillez réessayer.';
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    errorElement.textContent = 'Erreur d\'inscription. Veuillez réessayer.';
  } finally {
    // Réactiver le formulaire
    const submitBtn = document.querySelector('#register-form .btn-primary');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'S\'inscrire';
    }
  }
}

// Gérer la déconnexion
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });
    
    if (response.ok) {
      // Déconnexion réussie
      authState.isAuthenticated = false;
      authState.user = null;
      
      // Mettre à jour l'interface
      updateAuthUI();
      
      // Recharger la page pour afficher l'état déconnecté
      window.location.reload();
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
}

// Ajouter le bandeau mode invité
function addGuestBanner() {
  // Ne pas afficher le bandeau si l'utilisateur est connecté ou s'il l'a déjà fermé
  if (authState.isAuthenticated || authState.bannerDismissed || localStorage.getItem('guestBannerDismissed')) {
    return;
  }
  
  // Trouver l'élément où ajouter le bandeau
  const mainElement = document.querySelector('main');
  if (!mainElement) return;
  
  // Créer le bandeau
  const bannerHTML = `
    <div class="guest-banner" id="guest-banner">
      <div class="guest-banner-content">
        <i class="fas fa-exclamation-triangle guest-banner-icon"></i>
        <p class="guest-banner-text">
          <strong>Vous êtes en mode invité.</strong> Vos données ne seront pas sauvegardées. Créez un compte pour conserver vos tâches.
        </p>
      </div>
      <div class="guest-banner-action">
        <button class="btn btn-primary" id="guest-banner-login">Créer un compte</button>
      </div>
      <button class="close-banner" id="close-guest-banner">&times;</button>
    </div>
  `;
  
  // Ajouter le bandeau au début de l'élément main
  mainElement.insertAdjacentHTML('afterbegin', bannerHTML);
  
  // Ajouter les événements pour le bandeau
  const loginBtn = document.getElementById('guest-banner-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      openAuthModal('register');
    });
  }
  
  const closeBtn = document.getElementById('close-guest-banner');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const banner = document.getElementById('guest-banner');
      if (banner) {
        banner.style.opacity = '0';
        banner.style.height = banner.offsetHeight + 'px';
        
        setTimeout(() => {
          banner.style.height = '0';
          banner.style.padding = '0';
          banner.style.margin = '0';
          
          setTimeout(() => {
            banner.style.display = 'none';
            
            // Marquer le bandeau comme fermé
            authState.bannerDismissed = true;
            localStorage.setItem('guestBannerDismissed', 'true');
          }, 300);
        }, 300);
      }
    });
  }
}

// Mettre à jour l'interface selon l'état d'authentification
function updateAuthUI() {
  // Mettre à jour le bouton d'authentification
  updateAuthButton();
  
  // Mettre à jour le bandeau mode invité
  if (!authState.isAuthenticated && !authState.isLoading) {
    addGuestBanner();
  }
  
  // Ajouter ou supprimer le badge invité
  updateGuestBadge();
}

// Mettre à jour le badge invité
function updateGuestBadge() {
  // Trouver le titre de la page
  const titleElement = document.querySelector('.title');
  if (!titleElement) return;
  
  // Supprimer le badge existant s'il y en a un
  const existingBadge = titleElement.querySelector('.guest-badge');
  if (existingBadge) {
    existingBadge.remove();
  }
  
  // Ajouter le badge si l'utilisateur n'est pas connecté
  if (!authState.isAuthenticated && !authState.isLoading) {
    const badgeHTML = `<span class="guest-badge"><i class="fas fa-user-clock"></i> Mode invité</span>`;
    titleElement.insertAdjacentHTML('beforeend', badgeHTML);
  }
}
