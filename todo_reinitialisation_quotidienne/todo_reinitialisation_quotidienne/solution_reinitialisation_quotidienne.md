# Solution pour la réinitialisation quotidienne des tâches

## Analyse du problème

Après analyse du code de l'application Todo List, j'ai identifié les points suivants :

1. L'application dispose d'une fonction `resetDailyTasksAtMidnight()` qui est appelée à l'initialisation, mais cette fonction ne fait que programmer un nouveau rappel pour le jour suivant sans réinitialiser les tâches.

2. Il n'existe pas de mécanisme pour réinitialiser automatiquement l'état `completed` des tâches quotidiennes chaque jour.

3. L'application utilise Firestore pour stocker les tâches lorsque l'utilisateur est connecté, et localStorage lorsqu'il ne l'est pas.

## Solution proposée

Je propose d'implémenter une solution côté client qui vérifiera si les tâches quotidiennes doivent être réinitialisées à chaque chargement de l'application et à minuit. Cette solution ne nécessite pas de tâches planifiées côté serveur.

### 1. Ajouter une fonction de vérification de la date de dernière réinitialisation

Cette fonction vérifiera si la dernière réinitialisation a eu lieu aujourd'hui ou non, et réinitialisera les tâches si nécessaire.

### 2. Modifier la fonction `resetDailyTasksAtMidnight()` pour réinitialiser effectivement les tâches

La fonction actuelle ne fait que se reprogrammer pour le jour suivant, sans réinitialiser les tâches.

### 3. Ajouter une fonction de réinitialisation des tâches quotidiennes

Cette fonction réinitialisera l'état `completed` de toutes les tâches quotidiennes et synchronisera avec Firestore si l'utilisateur est connecté.

## Implémentation détaillée

Voici les modifications à apporter au code :

1. Ajouter une fonction pour vérifier et réinitialiser les tâches quotidiennes :

```javascript
// Vérifier si les tâches quotidiennes doivent être réinitialisées
function checkAndResetDailyTasks() {
  // Récupérer la date de dernière réinitialisation
  const lastResetDate = localStorage.getItem('lastDailyTasksReset');
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  
  // Si la dernière réinitialisation n'a pas eu lieu aujourd'hui, réinitialiser les tâches
  if (lastResetDate !== today) {
    console.log('Réinitialisation des tâches quotidiennes...');
    resetDailyTasks();
    
    // Mettre à jour la date de dernière réinitialisation
    localStorage.setItem('lastDailyTasksReset', today);
  }
}
```

2. Modifier la fonction `resetDailyTasksAtMidnight()` pour appeler la réinitialisation :

```javascript
// Réinitialiser les tâches quotidiennes à minuit
function resetDailyTasksAtMidnight() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // demain
    0, 0, 0 // minuit
  );
  
  const msToMidnight = night.getTime() - now.getTime();
  
  // Programmer la réinitialisation
  setTimeout(() => {
    // Réinitialiser les tâches quotidiennes
    resetDailyTasks();
    
    // Mettre à jour la date de dernière réinitialisation
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastDailyTasksReset', today);
    
    // Reprogrammer pour le jour suivant
    resetDailyTasksAtMidnight();
  }, msToMidnight);
}
```

3. Ajouter une fonction de réinitialisation des tâches quotidiennes :

```javascript
// Réinitialiser les tâches quotidiennes
async function resetDailyTasks() {
  console.log('Réinitialisation des tâches quotidiennes en cours...');
  
  // Réinitialiser les tâches quotidiennes locales
  tasks.daily.forEach(task => {
    task.completed = false;
    if (task.repetition && task.repetition.total > 0) {
      task.repetition.done = 0;
    }
  });
  
  // Sauvegarder localement
  saveTasksToLocalStorage();
  
  // Synchroniser avec Firebase si connecté
  const isConnected = typeof TodoFirebaseManager !== 'undefined' && 
                      TodoFirebaseManager.isUserLoggedIn && 
                      TodoFirebaseManager.isUserLoggedIn();
  
  if (isConnected) {
    try {
      console.log('Synchronisation des tâches réinitialisées avec Firestore...');
      
      // Pour chaque tâche quotidienne, mettre à jour son état dans Firestore
      for (const task of tasks.daily) {
        await TodoFirebaseManager.updateTask('daily', task.id, {
          ...task,
          completed: false,
          repetition: task.repetition || { total: 0, done: 0 },
          updatedAt: new Date()
        });
      }
      
      console.log('Synchronisation terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec Firestore:', error);
    }
  }
  
  // Mettre à jour l'affichage
  updateAllViews();
  
  console.log('Réinitialisation des tâches quotidiennes terminée');
}
```

4. Appeler la fonction de vérification au chargement de l'application :

```javascript
// ===== INITIALISATION =====
// Vérifier si l'utilisateur est connecté et initialiser en conséquence
setTimeout(initializeWithAuthCheck, 1000);

// Vérifier si les tâches quotidiennes doivent être réinitialisées
checkAndResetDailyTasks();

// Initialiser les sélecteurs de vue
initViewSelectors();
```

## Avantages de cette solution

1. **Entièrement côté client** : Ne nécessite pas de tâches planifiées côté serveur.
2. **Robuste** : Vérifie à chaque chargement de l'application si une réinitialisation est nécessaire.
3. **Automatique** : Se réinitialise automatiquement à minuit.
4. **Compatible avec Firestore** : Synchronise les changements avec Firestore si l'utilisateur est connecté.
5. **Non intrusive** : S'intègre facilement dans le code existant.

## Limites et considérations

1. La réinitialisation ne se produira que si l'application est ouverte à minuit ou rechargée après minuit.
2. Si l'utilisateur utilise l'application sur plusieurs appareils, la réinitialisation pourrait ne pas être synchronisée immédiatement entre les appareils.
