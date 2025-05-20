# Guide d'intégration de Firebase Firestore dans ProductivityHub

Ce guide explique comment intégrer les nouveaux modules Firebase Firestore dans votre application ProductivityHub.

## 1. Mise à jour de la configuration Firebase

Tout d'abord, mettez à jour votre fichier `firebase-config.js` pour inclure Firestore :

```javascript
// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDLArxENPaPQy0Jgqk-mBloF-hZIQdSV6g",
  authDomain: "productivityhub-e7c10.firebaseapp.com",
  projectId: "productivityhub-e7c10",
  storageBucket: "productivityhub-e7c10.firebasestorage.app",
  messagingSenderId: "237644324323",
  appId: "1:237644324323:web:267b44ff35822757c314d6"
};

// Initialisation de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
```

## 2. Intégration des modules Firebase

Placez les nouveaux fichiers dans la structure de votre projet :

- `firebase-db.js` → `frontend/js/firebase-db.js`
- `todo-firebase.js` → `apps/Todo/js/todo-firebase.js`

## 3. Modification du fichier todo.js

Modifiez votre fichier `todo.js` pour utiliser le nouveau module `todo-firebase.js`. Voici les principales modifications à apporter :

### 3.1. Importation du module

Au début du fichier, ajoutez :

```javascript
import { TodoFirebaseManager } from './todo-firebase.js';
```

### 3.2. Modification des fonctions de chargement des tâches

Remplacez les fonctions de chargement actuelles par des versions qui utilisent Firebase :

```javascript
// Charger les tâches quotidiennes
async function loadDailyTasks() {
  // Vider la liste
  const dailyTasksList = document.getElementById('daily-tasks');
  if (!dailyTasksList) return;
  
  dailyTasksList.innerHTML = '';
  
  // Essayer de charger depuis Firebase d'abord
  const firebaseTasks = await TodoFirebaseManager.loadDailyTasks(currentDailyDate);
  
  // Si Firebase a retourné des tâches, les utiliser
  let dailyTasks = [];
  if (firebaseTasks) {
    dailyTasks = firebaseTasks;
  } else {
    // Sinon, utiliser le stockage local
    dailyTasks = tasks.daily.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, currentDailyDate);
    });
  }
  
  // Trier les tâches : non terminées d'abord, puis terminées
  const sortedTasks = [...dailyTasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });
  
  // Ajouter les tâches à la liste
  sortedTasks.forEach(task => {
    const taskElement = createTaskElement(task, 'daily');
    dailyTasksList.appendChild(taskElement);
  });
  
  // Initialiser le drag and drop
  initSortable(dailyTasksList, 'daily');
  
  // Mettre à jour les statistiques
  updateStatistics();
}
```

Faites de même pour `loadWeeklyTasks()`, `loadPunctualTasks()` et `loadGeneralTasks()`.

### 3.3. Modification des fonctions de gestion des tâches

Modifiez les fonctions d'ajout, de mise à jour et de suppression des tâches :

```javascript
// Ajouter une tâche rapidement
async function quickAddTask(title, category) {
  if (!title.trim()) return;
  
  // Créer la nouvelle tâche
  const newTask = {
    id: generateUniqueId(),
    title: title.trim(),
    description: '',
    date: new Date(),
    completed: false,
    priority: 'medium',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Ajouter à Firebase si l'utilisateur est connecté
  const firebaseResult = await TodoFirebaseManager.addTask(category, newTask);
  
  // Si l'ajout à Firebase a réussi, utiliser l'ID Firebase
  if (firebaseResult && firebaseResult.success) {
    newTask.id = firebaseResult.id;
  }
  
  // Ajouter au stockage local
  tasks[category].push(newTask);
  saveTasksToLocalStorage();
  
  // Mettre à jour l'affichage
  updateAllViews();
}

// Mettre à jour une tâche
async function updateTask(category, taskId, updatedData) {
  // Trouver l'index de la tâche dans le tableau local
  const taskIndex = tasks[category].findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) return false;
  
  // Mettre à jour la tâche locale
  const updatedTask = {
    ...tasks[category][taskIndex],
    ...updatedData,
    updatedAt: new Date()
  };
  
  tasks[category][taskIndex] = updatedTask;
  
  // Mettre à jour dans Firebase si l'utilisateur est connecté
  await TodoFirebaseManager.updateTask(category, taskId, updatedTask);
  
  // Sauvegarder dans le stockage local
  saveTasksToLocalStorage();
  
  return true;
}

// Supprimer une tâche
async function deleteTask(category, taskId) {
  // Trouver l'index de la tâche dans le tableau local
  const taskIndex = tasks[category].findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) return false;
  
  // Supprimer de Firebase si l'utilisateur est connecté
  await TodoFirebaseManager.deleteTask(category, taskId);
  
  // Supprimer du tableau local
  tasks[category].splice(taskIndex, 1);
  
  // Sauvegarder dans le stockage local
  saveTasksToLocalStorage();
  
  return true;
}
```

### 3.4. Ajout de la synchronisation

Ajoutez une fonction pour synchroniser les tâches locales avec Firebase :

```javascript
// Synchroniser les tâches avec Firebase
async function syncWithFirebase() {
  // Vérifier si l'utilisateur est connecté
  if (!TodoFirebaseManager.isUserLoggedIn()) {
    console.log('Utilisateur non connecté, synchronisation impossible');
    return;
  }
  
  try {
    // Afficher un indicateur de synchronisation
    showSyncIndicator(true);
    
    // Synchroniser les tâches locales vers Firebase
    await TodoFirebaseManager.syncTasksToFirebase(tasks);
    
    // Récupérer les tâches depuis Firebase
    const result = await TodoFirebaseManager.syncTasksFromFirebase();
    
    if (result.success) {
      // Mettre à jour les tâches locales avec les données de Firebase
      tasks.daily = result.data.daily || [];
      tasks.weekly = result.data.weekly || [];
      tasks.punctual = result.data.punctual || [];
      tasks.general = result.data.general || [];
      
      // Sauvegarder dans le stockage local
      saveTasksToLocalStorage();
      
      // Mettre à jour l'affichage
      updateAllViews();
      
      console.log('Synchronisation avec Firebase réussie');
    } else {
      console.error('Erreur lors de la synchronisation avec Firebase:', result.error);
    }
  } catch (error) {
    console.error('Exception lors de la synchronisation avec Firebase:', error);
  } finally {
    // Masquer l'indicateur de synchronisation
    showSyncIndicator(false);
  }
}

// Afficher/masquer l'indicateur de synchronisation
function showSyncIndicator(show) {
  // Créer l'indicateur s'il n'existe pas
  let syncIndicator = document.getElementById('sync-indicator');
  
  if (!syncIndicator) {
    syncIndicator = document.createElement('div');
    syncIndicator.id = 'sync-indicator';
    syncIndicator.className = 'sync-indicator';
    syncIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Synchronisation...';
    document.body.appendChild(syncIndicator);
  }
  
  // Afficher ou masquer
  syncIndicator.style.display = show ? 'flex' : 'none';
  
  // Ajouter la classe d'animation si visible
  if (show) {
    syncIndicator.classList.add('syncing');
  } else {
    syncIndicator.classList.remove('syncing');
  }
}
```

### 3.5. Ajout de la synchronisation automatique

Ajoutez la synchronisation automatique à l'initialisation et lors des changements d'état d'authentification :

```javascript
// ===== INITIALISATION =====
// Charger les tâches depuis le localStorage
loadTasksFromLocalStorage();

// Synchroniser avec Firebase si l'utilisateur est connecté
if (TodoFirebaseManager.isUserLoggedIn()) {
  syncWithFirebase();
}

// Écouter les changements d'état d'authentification
auth.onAuthStateChanged(user => {
  if (user) {
    // L'utilisateur vient de se connecter, synchroniser
    syncWithFirebase();
  }
});
```

## 4. Mise à jour des statistiques

Modifiez la fonction de mise à jour des statistiques pour utiliser Firebase :

```javascript
// Mettre à jour les statistiques
async function updateStatistics() {
  // Calculer les statistiques locales
  const dailyStats = calculateDailyStatistics();
  const weeklyStats = calculateWeeklyStatistics();
  
  // Mettre à jour les statistiques dans l'interface
  updateStatisticsDisplay(dailyStats, weeklyStats);
  
  // Enregistrer dans Firebase si l'utilisateur est connecté
  if (TodoFirebaseManager.isUserLoggedIn()) {
    // Statistiques quotidiennes
    await TodoFirebaseManager.updateDailyStatistics(
      new Date(),
      dailyStats.completed,
      dailyStats.total
    );
    
    // Statistiques hebdomadaires
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    await TodoFirebaseManager.updateWeeklyStatistics(
      startOfWeek,
      endOfWeek,
      weeklyStats.completed,
      weeklyStats.total
    );
  }
}
```

## 5. Configuration des règles Firestore

Dans la console Firebase, configurez les règles de sécurité Firestore comme suit :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règle pour la collection users
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour la collection tasks et ses sous-collections
    match /tasks/{userId}/{category}/{taskId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour la collection statistics
    match /statistics/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour la collection videoStorage
    match /videoStorage/{userId}/videos/{videoId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6. Ajout de styles CSS pour l'indicateur de synchronisation

Ajoutez ces styles à votre fichier CSS :

```css
/* Indicateur de synchronisation */
.sync-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--primary-color);
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  font-size: 14px;
  transition: opacity 0.3s ease;
}

.sync-indicator.syncing i {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## 7. Test de l'intégration

Pour tester l'intégration :

1. Connectez-vous à l'application avec un compte utilisateur
2. Créez quelques tâches et vérifiez qu'elles sont bien synchronisées avec Firebase
3. Déconnectez-vous puis reconnectez-vous pour vérifier que les tâches sont bien récupérées
4. Testez la synchronisation entre plusieurs appareils

## 8. Prochaines étapes

Une fois l'intégration de la To-Do List terminée, vous pourrez :

1. Intégrer le stockage vidéo avec Firebase Storage
2. Développer le module Planificateur avec Firestore
3. Implémenter le module Notes avec Firestore
4. Ajouter des fonctionnalités de partage et de collaboration
