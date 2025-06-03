// Script de debug pour diagnostiquer les problèmes de Toolbox Calendar
import { auth, db } from '../../../../frontend/js/firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

async function debugCalendarToolbox() {
  console.log('=== DEBUG CALENDAR TOOLBOX ===');
  
  // 1. Vérifier l'authentification
  console.log('1. État d\'authentification:');
  console.log('auth.currentUser:', auth.currentUser);
  if (auth.currentUser) {
    console.log('UID:', auth.currentUser.uid);
    console.log('Email:', auth.currentUser.email);
  } else {
    console.log('❌ Utilisateur non connecté');
    return;
  }
  
  // 2. Vérifier l'existence du document Firestore
  console.log('\n2. Vérification Firestore:');
  try {
    const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'calendar');
    console.log('Chemin Firestore:', `users/${auth.currentUser.uid}/toolbox/calendar`);
    
    const snap = await getDoc(toolboxRef);
    if (snap.exists()) {
      console.log('✅ Document existe');
      console.log('Données:', snap.data());
    } else {
      console.log('❌ Document n\'existe pas');
    }
  } catch (error) {
    console.error('❌ Erreur Firestore:', error);
  }
  
  // 3. Vérifier l'instance Toolbox
  console.log('\n3. Instance CalendarToolbox:');
  if (window.calendarToolbox) {
    console.log('✅ Instance trouvée');
    console.log('Features actuelles:', window.calendarToolbox.features);
    console.log('App name:', window.calendarToolbox.appName);
  } else {
    console.log('❌ Instance non trouvée');
  }
  
  // 4. Vérifier les boutons aujourd'hui
  console.log('\n4. Boutons aujourd\'hui:');
  const todayButtons = document.querySelectorAll('.today-btn');
  console.log('Nombre de boutons trouvés:', todayButtons.length);
  todayButtons.forEach((btn, index) => {
    console.log(`Bouton ${index}:`, {
      visible: btn.style.display !== 'none',
      display: btn.style.display,
      text: btn.textContent
    });
  });
  
  // 5. Charger manuellement depuis Firestore
  console.log('\n5. Test de chargement manuel:');
  try {
    const toolboxRef = doc(db, 'users', auth.currentUser.uid, 'toolbox', 'calendar');
    const snap = await getDoc(toolboxRef);
    if (snap.exists() && snap.data().features) {
      console.log('Features depuis Firestore:', snap.data().features);
      
      // Appliquer manuellement
      const features = snap.data().features;
      features.forEach(feature => {
        console.log(`Feature "${feature.name}" enabled:`, feature.enabled);
        if (feature.name === "Bouton Aujourd'hui" && !feature.enabled) {
          console.log('Masquage des boutons...');
          document.querySelectorAll('.today-btn').forEach(btn => {
            btn.style.display = 'none';
            console.log('Bouton masqué:', btn);
          });
        }
      });
    }
  } catch (error) {
    console.error('Erreur test manuel:', error);
  }
  
  console.log('\n=== FIN DEBUG ===');
}

// Attendre que auth soit prêt
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Utilisateur connecté, lancement debug dans 2 secondes...');
    setTimeout(debugCalendarToolbox, 2000);
  }
});

// Fonction globale pour debug manuel
window.debugCalendarToolbox = debugCalendarToolbox; 