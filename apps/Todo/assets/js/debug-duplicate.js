// Script de debug pour tester la fonctionnalité de duplication des tâches d'hier

function debugDuplicateYesterdayTasks() {
  console.log('=== DEBUG DUPLICATE YESTERDAY TASKS ===');
  
  // 1. Vérifier que le bouton existe
  const duplicateButton = document.getElementById('duplicate-yesterday-tasks');
  console.log('1. Bouton duplication:', duplicateButton);
  if (!duplicateButton) {
    console.error('❌ Bouton de duplication non trouvé');
    return;
  }
  
  // 2. Vérifier les tâches actuelles
  console.log('2. Tâches actuelles:');
  if (typeof tasks !== 'undefined') {
    console.log('Tâches quotidiennes:', tasks.daily);
    console.log('Nombre de tâches quotidiennes:', tasks.daily ? tasks.daily.length : 0);
  } else {
    console.error('❌ Variable tasks non définie');
    return;
  }
  
  // 3. Vérifier la date actuellement consultée
  console.log('3. Date actuellement consultée:');
  console.log('currentDailyDate:', currentDailyDate);
  console.log('currentDailyDate ISO:', currentDailyDate.toISOString().split('T')[0]);
  
  // 4. Calculer les dates comme dans la fonction
  const yesterday = new Date(currentDailyDate);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(currentDailyDate);
  targetDate.setHours(0, 0, 0, 0);
  
  console.log('4. Dates calculées:');
  console.log('Veille (source):', yesterday.toISOString().split('T')[0]);
  console.log('Date cible:', targetDate.toISOString().split('T')[0]);
  
  // 5. Afficher toutes les tâches avec leurs dates
  console.log('5. Toutes les tâches quotidiennes avec dates:');
  tasks.daily.forEach((task, index) => {
    console.log(`Tâche ${index}: "${task.title}" - Date: ${task.date}`);
  });
  
  // 6. Filtrer les tâches de la veille
  const yesterdayTasks = tasks.daily.filter(task => {
    const taskDate = new Date(task.date);
    return isSameDay(taskDate, yesterday);
  });
  
  console.log('6. Tâches de la veille trouvées:', yesterdayTasks);
  console.log('Nombre de tâches de la veille:', yesterdayTasks.length);
  
  // 7. Vérifier les tâches existantes pour la date cible
  const existingTargetTasks = tasks.daily.filter(task => {
    const taskDate = new Date(task.date);
    return isSameDay(taskDate, targetDate);
  });
  
  console.log('7. Tâches existantes pour la date cible:', existingTargetTasks);
  console.log('Nombre de tâches existantes pour la date cible:', existingTargetTasks.length);
  
  // 8. Tester la fonction isSameDay
  console.log('8. Test fonction isSameDay:');
  if (tasks.daily.length > 0) {
    const firstTask = tasks.daily[0];
    const firstTaskDate = new Date(firstTask.date);
    console.log(`Première tâche date: ${firstTask.date}`);
    console.log(`isSameDay avec veille: ${isSameDay(firstTaskDate, yesterday)}`);
    console.log(`isSameDay avec date cible: ${isSameDay(firstTaskDate, targetDate)}`);
  }
  
  // 9. Vérifier localStorage avant
  console.log('9. État localStorage AVANT duplication:');
  const tasksBefore = localStorage.getItem('tasks');
  console.log('localStorage tasks:', tasksBefore ? JSON.parse(tasksBefore) : 'null');
  
  // 10. Simuler un clic sur le bouton
  console.log('10. Test du clic sur le bouton:');
  try {
    duplicateButton.click();
    console.log('✅ Clic simulé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du clic:', error);
  }
  
  // 11. Vérifier l'état après (avec délai)
  setTimeout(() => {
    console.log('11. État APRÈS duplication:');
    console.log('Nombre total de tâches:', tasks.daily.length);
    
    const tasksAfter = localStorage.getItem('tasks');
    console.log('localStorage tasks après:', tasksAfter ? JSON.parse(tasksAfter) : 'null');
    
    const newTargetTasks = tasks.daily.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, targetDate);
    });
    console.log('Tâches pour la date cible après duplication:', newTargetTasks);
    
    console.log('=== FIN DEBUG ===');
  }, 1000);
}

// Fonction pour forcer la sauvegarde
function forceSave() {
  console.log('Forçage de la sauvegarde...');
  if (typeof saveTasksToLocalStorage !== 'undefined') {
    saveTasksToLocalStorage();
    console.log('✅ Sauvegarde forcée terminée');
  } else {
    console.error('❌ Fonction saveTasksToLocalStorage non disponible');
  }
}

// Fonction pour afficher l'état actuel
function showCurrentState() {
  console.log('=== ÉTAT ACTUEL ===');
  console.log('currentDailyDate:', currentDailyDate?.toISOString?.()?.split('T')[0] || 'undefined');
  console.log('tasks.daily:', tasks?.daily?.length || 0, 'tâches');
  console.log('localStorage dailyTasks:', localStorage.getItem('dailyTasks') ? 'présent' : 'absent');
  console.log('localStorage tasks (ancien):', localStorage.getItem('tasks') ? 'présent' : 'absent');
}

// Fonction pour nettoyer les doublons
function cleanDuplicates() {
  console.log('Nettoyage des doublons...');
  if (tasks && tasks.daily) {
    const seen = new Set();
    const originalLength = tasks.daily.length;
    tasks.daily = tasks.daily.filter(task => {
      const key = `${task.title}-${task.date}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    console.log(`Doublons supprimés: ${originalLength - tasks.daily.length}`);
    saveTasksToLocalStorage();
  }
}

// Fonction pour créer des tâches de test pour hier
function createTestTasksForYesterday() {
  console.log('Création de tâches de test pour hier...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const testTasks = [
    {
      id: 'test-' + Date.now() + '-1',
      title: 'Tâche test 1 (hier)',
      date: yesterdayStr,
      completed: false,
      time: '09:00',
      location: 'Bureau'
    },
    {
      id: 'test-' + Date.now() + '-2', 
      title: 'Tâche test 2 (hier)',
      date: yesterdayStr,
      completed: true,
      time: '14:00'
    }
  ];
  
  if (typeof tasks !== 'undefined' && tasks.daily) {
    tasks.daily.push(...testTasks);
    saveTasksToLocalStorage();
    updateDailyDisplay();
    console.log('✅ Tâches de test ajoutées:', testTasks);
  } else {
    console.error('❌ Impossible d\'ajouter les tâches de test');
  }
}

// Fonction pour vérifier quelles tâches sont affichées
function checkDisplayedTasks() {
  console.log('=== VÉRIFICATION AFFICHAGE ===');
  console.log('Date actuellement consultée:', currentDailyDate?.toISOString?.()?.split('T')[0] || 'undefined');
  
  // Vérifier les tâches dans le DOM
  const displayedTasks = document.querySelectorAll('#daily-tasks .task-item');
  console.log('Nombre de tâches affichées dans le DOM:', displayedTasks.length);
  
  displayedTasks.forEach((taskElement, index) => {
    const title = taskElement.querySelector('.task-title')?.textContent || 'Sans titre';
    const taskId = taskElement.dataset.id;
    console.log(`Tâche affichée ${index + 1}: "${title}" (ID: ${taskId})`);
  });
  
  // Vérifier les tâches en mémoire pour la date actuelle
  if (typeof currentDailyDate !== 'undefined' && tasks?.daily) {
    const currentDateStr = currentDailyDate.toISOString().split('T')[0];
    const tasksForCurrentDate = tasks.daily.filter(task => task.date === currentDateStr);
    console.log(`Tâches en mémoire pour ${currentDateStr}:`, tasksForCurrentDate.length);
    tasksForCurrentDate.forEach((task, index) => {
      console.log(`Mémoire ${index + 1}: "${task.title}" (${task.date}) - ID: ${task.id}`);
    });
  }
  
  // Vérifier localStorage
  const savedDaily = localStorage.getItem('dailyTasks');
  if (savedDaily) {
    const parsedDaily = JSON.parse(savedDaily);
    console.log('Tâches dans localStorage:', parsedDaily.length);
  } else {
    console.log('❌ Aucune tâche dans localStorage (dailyTasks)');
  }
  
  console.log('=== FIN VÉRIFICATION ===');
}

// Fonction pour vérifier la persistance après rechargement
function testPersistence() {
  console.log('=== TEST PERSISTANCE ===');
  
  // Créer une tâche de test unique
  const testTaskId = 'test-persistence-' + Date.now();
  const testTask = {
    id: testTaskId,
    title: 'TEST PERSISTANCE - ' + new Date().toLocaleTimeString(),
    date: currentDailyDate.toISOString().split('T')[0],
    completed: false,
    tags: {},
    repetition: { total: 0, done: 0 },
    timer: 0
  };
  
  console.log('Ajout tâche de test:', testTask);
  
  // Ajouter à la mémoire
  tasks.daily.push(testTask);
  console.log('Tâches en mémoire après ajout:', tasks.daily.length);
  
  // Sauvegarder
  saveTasksToLocalStorage();
  console.log('Sauvegarde effectuée');
  
  // Vérifier immédiatement
  const saved = localStorage.getItem('dailyTasks');
  if (saved) {
    const parsed = JSON.parse(saved);
    const found = parsed.find(t => t.id === testTaskId);
    console.log('Tâche trouvée dans localStorage:', found ? '✅' : '❌');
  }
  
  // Mettre à jour l'affichage
  updateDailyDisplay();
  
  console.log('=== Instructions ===');
  console.log('1. Rechargez la page');
  console.log('2. Tapez: checkDisplayedTasks()');
  console.log('3. Vérifiez si la tâche TEST PERSISTANCE est toujours là');
}

// Fonctions globales pour debug manuel
window.debugDuplicateYesterdayTasks = debugDuplicateYesterdayTasks;
window.createTestTasksForYesterday = createTestTasksForYesterday;
window.forceSave = forceSave;
window.showCurrentState = showCurrentState;
window.cleanDuplicates = cleanDuplicates;
window.checkDisplayedTasks = checkDisplayedTasks;
window.testPersistence = testPersistence;

console.log('Debug script chargé. Tapez:');
console.log('- debugDuplicateYesterdayTasks() pour tester');
console.log('- createTestTasksForYesterday() pour créer des tâches de test');
console.log('- showCurrentState() pour voir l\'état actuel');
console.log('- forceSave() pour forcer la sauvegarde');
console.log('- cleanDuplicates() pour nettoyer les doublons');
console.log('- checkDisplayedTasks() pour vérifier les tâches affichées');
console.log('- testPersistence() pour tester la persistance après rechargement'); 