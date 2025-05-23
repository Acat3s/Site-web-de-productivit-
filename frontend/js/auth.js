// Système d'authentification pour ProductivityHub avec Firebase UI intégré
// ... (534 lignes du fichier sécurisé à insérer ici) ...

// Système d'authentification pour ProductivityHub
import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// État global de l'authentification
const authState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  bannerDismissed: false
};

export { authState };

// Initialisation du système d'authentification
document.addEventListener('DOMContentLoaded', () => {
  // Écouter les changements d'état d'authentification Firebase
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Récupérer les données supplémentaires de l'utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      authState.isAuthenticated = true;
      authState.user = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData?.displayName || 'Utilisateur',
        photoURL: user.photoURL || userData?.photoURL,
        initials: (user.displayName || userData?.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase()
      };
    } else {
      authState.isAuthenticated = false;
      authState.user = null;
    }
    authState.isLoading = false;
    updateAuthUI();
  });
  
  // Initialiser les éléments d'interface
  initAuthUI();
});

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
  const headerElement = document.querySelector('.header-top');
  if (!headerElement) return;
  
  const authContainer = document.createElement('div');
  authContainer.className = 'auth-container';
  headerElement.appendChild(authContainer);
  
  updateAuthButton();
}

// Mettre à jour le bouton d'authentification selon l'état
function updateAuthButton() {
  const authContainer = document.querySelector('.auth-container');
  if (!authContainer) return;
  
  authContainer.innerHTML = '';
  
  if (authState.isLoading) {
    authContainer.innerHTML = '<div class="auth-loading"><i class="fas fa-spinner fa-spin"></i></div>';
  } else if (authState.isAuthenticated && authState.user) {
    const userMenu = `
      <div class="user-menu">
        <button class="user-button" id="user-button">
          <div class="user-avatar">${authState.user.initials}</div>
        </button>
        <div class="user-dropdown" id="user-dropdown">
          <div class="user-info">
            <div class="user-name">${authState.user.displayName}</div>
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
    
    const userButton = document.getElementById('user-button');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userButton && userDropdown) {
      userButton.addEventListener('click', () => {
        userDropdown.classList.toggle('active');
      });
      
      document.addEventListener('click', (e) => {
        if (!userButton.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      });
      
      const logoutLink = document.querySelector('.logout-link');
      if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }
    }
  } else {
    const loginButton = `
      <button class="auth-button" id="login-button">
        <i class="fas fa-user"></i> Se connecter
      </button>
    `;
    
    authContainer.innerHTML = loginButton;
    
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
  if (document.getElementById('auth-modal-overlay')) return;
  
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
          </div>
          
          <div class="auth-footer">
            Déjà un compte ? <a href="#" class="switch-tab" data-target="login">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  initAuthModalEvents();
}

// Initialiser les événements de la modal d'authentification
function initAuthModalEvents() {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  const closeModal = document.getElementById('close-auth-modal');
  const authTabs = document.querySelectorAll('.auth-tab');
  const switchTabs = document.querySelectorAll('.switch-tab');
  
  if (closeModal) {
    closeModal.addEventListener('click', closeAuthModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeAuthModal();
      }
    });
  }
  
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchAuthTab(tab.dataset.tab);
    });
  });
  
  switchTabs.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab(link.dataset.target);
    });
  });
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleLogin();
    });
  }
  
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleRegister();
    });
  }

  const googleLoginBtn = document.getElementById('google-login');
  const googleRegisterBtn = document.getElementById('google-register');
  
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleGoogleLogin();
    });
  }
  
  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleGoogleLogin();
    });
  }
}

// Changer d'onglet dans la modal
function switchAuthTab(tabId) {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
  
  document.querySelectorAll('.auth-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabId}-content`);
  });
}

// Ouvrir la modal d'authentification
function openAuthModal(tab = 'login') {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (!modalOverlay) return;
  
  modalOverlay.classList.add('active');
  switchAuthTab(tab);
}

// Fermer la modal d'authentification
function closeAuthModal() {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (!modalOverlay) return;
  
  modalOverlay.classList.remove('active');
}

// Gérer la connexion
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    closeAuthModal();
  } catch (error) {
    console.error('Erreur de connexion:', error);
    errorElement.textContent = getErrorMessage(error.code);
  }
}

// Gérer l'inscription
async function handleRegister() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const errorElement = document.getElementById('register-error');
  
  if (password !== confirmPassword) {
    errorElement.textContent = 'Les mots de passe ne correspondent pas';
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Créer un document utilisateur dans Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      createdAt: new Date(),
      displayName: email.split('@')[0] // Nom d'affichage par défaut
    });
    
    closeAuthModal();
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    errorElement.textContent = getErrorMessage(error.code);
  }
}

// Gérer la déconnexion
async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
}

// Gérer la connexion avec Google
async function handleGoogleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Vérifier si c'est une nouvelle inscription
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      // Créer un document utilisateur dans Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date()
      });
    }
    
    closeAuthModal();
  } catch (error) {
    console.error('Erreur de connexion avec Google:', error);
    const errorElement = document.getElementById('login-error');
    errorElement.textContent = getErrorMessage(error.code);
  }
}

// Obtenir un message d'erreur lisible
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'L\'adresse email n\'est pas valide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée',
    'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée',
    'auth/cancelled-popup-request': 'La demande de connexion a été annulée',
    'auth/popup-blocked': 'La fenêtre de connexion a été bloquée'
  };
  
  return errorMessages[errorCode] || 'Une erreur est survenue';
}

// Ajouter le bandeau mode invité
function addGuestBanner() {
  // Ne pas créer le bandeau si l'utilisateur est connecté
  if (authState.isAuthenticated) return;
  
  // Vérifier si le bandeau existe déjà
  if (document.getElementById('guest-banner')) return;
  
  // Créer le bandeau
  const bannerHTML = `
    <div class="guest-banner" id="guest-banner">
      <div class="guest-banner-content">
        <div class="guest-banner-icon">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="guest-banner-text">
          Vous naviguez en mode <strong>invité</strong>. <a href="#" class="guest-banner-action" id="login-from-banner">Connectez-vous</a> pour accéder à toutes les fonctionnalités.
        </div>
        <button class="close-banner" id="close-banner">&times;</button>
      </div>
    </div>
  `;
  
  // Ajouter le bandeau au body
  document.body.insertAdjacentHTML('afterbegin', bannerHTML);
  
  // Ajouter les événements
  const banner = document.getElementById('guest-banner');
  const closeButton = document.getElementById('close-banner');
  const loginLink = document.getElementById('login-from-banner');
  
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      banner.style.display = 'none';
      authState.bannerDismissed = true;
    });
  }
  
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('login');
    });
  }
}

// Mettre à jour l'interface selon l'état d'authentification
function updateAuthUI() {
  updateAuthButton();
  updateGuestBadge();
}

// Mettre à jour le badge invité
function updateGuestBadge() {
  const banner = document.getElementById('guest-banner');
  if (!banner) return;
  
  // Ne pas afficher le bandeau si l'utilisateur est connecté
  if (authState.isAuthenticated) {
    banner.style.display = 'none';
    return;
  }
  
  // N'afficher le bandeau que si l'utilisateur n'est pas connecté ET que le bandeau n'a pas été fermé manuellement
  banner.style.display = authState.bannerDismissed ? 'none' : 'block';
} 