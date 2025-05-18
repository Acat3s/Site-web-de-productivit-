document.addEventListener('DOMContentLoaded', () => {
  console.log('To-Do script loaded');

  // ===== VARIABLES GLOBALES =====
  let currentDailyDate = new Date();
  let currentWeeklyDate = new Date();
  let currentPunctualDate = new Date();
  let editingTaskId = null;
  let tasks = {
    daily: [],
    weekly: [],
    punctual: []
  };

  // ===== SÉLECTEURS DOM =====
  // Sélecteurs de vue
  const viewButtons = document.querySelectorAll('.view-btn');
  const viewSections = document.querySelectorAll('.view-section');
  
  // Navigation
  const prevDayBtn = document.getElementById('prev-day');
  const nextDayBtn = document.getElementById('next-day');
  const currentDateDisplay = document.getElementById('current-date');
  
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  const currentWeekDisplay = document.getElementById('current-week');
  
  const prevPunctualBtn = document.getElementById('prev-punctual');
  const nextPunctualBtn = document.getElementById('next-punctual');
  const currentPunctualDisplay = document.getElementById('current-punctual');
  
  // Lignes d'ajout rapide
  const dailyQuickAddInput = document.getElementById('daily-quick-add');
  const dailyQuickAddBtn = document.getElementById('daily-quick-add-btn');
  
  const weeklyQuickAddInput = document.getElementById('weekly-quick-add');
  const weeklyQuickAddBtn = document.getElementById('weekly-quick-add-btn');
  
  const punctualQuickAddInput = document.getElementById('punctual-quick-add');
  const punctualQuickAddBtn = document.getElementById('punctual-quick-add-btn');
  
  const allQuickAddInput = document.getElementById('all-quick-add');
  const allQuickAddBtn = document.getElementById('all-quick-add-btn');
  
  // Modal d'édition
  const editTaskModal = document.getElementById('edit-task-modal');
  const modalTitle = document.getElementById('modal-title');
  const closeModalBtn = document.querySelector('.close-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const saveTaskBtn = document.getElementById('save-task');
  const cancelTaskBtn = document.getElementById('cancel-task');
  const timerGroup = document.getElementById('timer-group');
  
  // Boutons d'effacement des champs
  const clearFieldBtns = document.querySelectorAll('.clear-field-btn');
  
  // Listes de tâches
  const dailyTasksList = document.getElementById('daily-tasks');
  const weeklyTasksList = document.getElementById('weekly-tasks');
  const punctualTasksList = document.getElementById('punctual-tasks');
  const allTasksList = document.getElementById('all-tasks');

  // ===== FONCTIONS DE NAVIGATION =====
  
  // Changement de vue
  function switchView(viewName) {
    viewButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      }
    });
    
    viewSections.forEach(section => {
      section.classList.remove('active');
      if (section.id === `${viewName}-view`) {
        section.classList.add('active');
      }
    });
    
    // Mise à jour des affichages selon la vue active
    if (viewName === 'daily') {
      updateDailyDisplay();
    } else if (viewName === 'weekly') {
      updateWeeklyDisplay();
    } else if (viewName === 'punctual') {
      updatePunctualDisplay();
    } else if (viewName === 'all') {
      updateAllTasksView();
    }
  }
  
  // Mise à jour de l'affichage quotidien
  function updateDailyDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = `Todo : ${currentDailyDate.toLocaleDateString('fr-FR', options)}`;
    
    // Gestion de la visibilité des flèches de navigation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const displayedDate = new Date(currentDailyDate);
    displayedDate.setHours(0, 0, 0, 0);
    
    // La flèche droite n'est visible que si on consulte une date antérieure à aujourd'hui
    if (displayedDate.getTime() < today.getTime()) {
      nextDayBtn.style.display = 'flex';
    } else {
      nextDayBtn.style.display = 'none';
    }
    
    // Charger les tâches du jour
    loadDailyTasks();
  }
  
  // Mise à jour de l'affichage hebdomadaire
  function updateWeeklyDisplay() {
    const startOfWeek = getStartOfWeek(currentWeeklyDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOptions = { day: 'numeric', month: 'short' };
    const endOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    
    currentWeekDisplay.textContent = `Todo : Semaine du ${startOfWeek.toLocaleDateString('fr-FR', startOptions)} au ${endOfWeek.toLocaleDateString('fr-FR', endOptions)}`;
    
    // Gestion de la visibilité des flèches de navigation
    const today = new Date();
    const currentWeekStart = getStartOfWeek(today);
    const displayedWeekStart = getStartOfWeek(currentWeeklyDate);
    
    // La flèche droite n'est visible que si on consulte une semaine antérieure à la semaine actuelle
    if (displayedWeekStart.getTime() < currentWeekStart.getTime()) {
      nextWeekBtn.style.display = 'flex';
    } else {
      nextWeekBtn.style.display = 'none';
    }
    
    // Charger les tâches de la semaine
    loadWeeklyTasks();
  }
  
  // Mise à jour de l'affichage ponctuel
  function updatePunctualDisplay() {
    // Pour les tâches ponctuelles, pas de date spécifique
    currentPunctualDisplay.textContent = 'Todo Ponctuel';
    
    // Masquer les flèches de navigation pour les tâches ponctuelles
    prevPunctualBtn.style.display = 'none';
    nextPunctualBtn.style.display = 'none';
    
    // Charger les tâches ponctuelles
    loadPunctualTasks();
  }
  
  // Mise à jour de la vue générale
  function updateAllTasksView() {
    // Charger toutes les tâches
    loadAllTasks();
  }
  
  // Obtenir le premier jour de la semaine (lundi)
  function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que la semaine commence le lundi
    return new Date(date.setDate(diff));
  }

  // ===== GESTION DES TÂCHES =====
  
  // Charger les tâches quotidiennes
  function loadDailyTasks() {
    // Vider la liste
    dailyTasksList.innerHTML = '';
    
    // Filtrer les tâches du jour courant
    const dailyTasks = tasks.daily.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, currentDailyDate);
    });
    
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
  }
  
  // Charger les tâches hebdomadaires
  function loadWeeklyTasks() {
    // Vider la liste
    weeklyTasksList.innerHTML = '';
    
    // Filtrer les tâches de la semaine courante
    const startOfWeek = getStartOfWeek(currentWeeklyDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weeklyTasks = tasks.weekly.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
    
    // Trier les tâches : non terminées d'abord, puis terminées
    const sortedTasks = [...weeklyTasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
    
    // Ajouter les tâches à la liste
    sortedTasks.forEach(task => {
      const taskElement = createTaskElement(task, 'weekly');
      weeklyTasksList.appendChild(taskElement);
    });
    
    // Initialiser le drag and drop
    initSortable(weeklyTasksList, 'weekly');
  }
  
  // Charger les tâches ponctuelles
  function loadPunctualTasks() {
    // Vider la liste
    punctualTasksList.innerHTML = '';
    
    // Trier les tâches : non terminées d'abord, puis terminées
    const sortedTasks = [...tasks.punctual].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
    
    // Ajouter les tâches à la liste
    sortedTasks.forEach(task => {
      const taskElement = createTaskElement(task, 'punctual');
      punctualTasksList.appendChild(taskElement);
    });
    
    // Initialiser le drag and drop
    initSortable(punctualTasksList, 'punctual');
  }
  
  // Charger toutes les tâches
  function loadAllTasks() {
    // Vider la liste
    allTasksList.innerHTML = '';
    
    // Combiner toutes les tâches
    const allTasks = [
      ...tasks.daily.map(task => ({ ...task, category: 'daily' })),
      ...tasks.weekly.map(task => ({ ...task, category: 'weekly' })),
      ...tasks.punctual.map(task => ({ ...task, category: 'punctual' }))
    ];
    
    // Trier par date et par état (non terminées d'abord)
    allTasks.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return new Date(a.date) - new Date(b.date);
    });
    
    // Ajouter les tâches à la liste
    allTasks.forEach(task => {
      const taskElement = createTaskElement(task, task.category);
      allTasksList.appendChild(taskElement);
    });
    
    // Initialiser le drag and drop
    initSortable(allTasksList, 'all');
  }
  
  // Initialiser le drag and drop
  function initSortable(container, category) {
    if (container) {
      new Sortable(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function(evt) {
          // Mettre à jour l'ordre des tâches dans le stockage
          updateTasksOrder(category);
        }
      });
    }
  }
  
  // Mettre à jour l'ordre des tâches après drag and drop
  function updateTasksOrder(category) {
    if (category === 'all') {
      // Pour la vue générale, on ne modifie pas l'ordre des tâches
      return;
    }
    
    const container = document.getElementById(`${category}-tasks`);
    const taskElements = container.querySelectorAll('.task-item');
    
    // Créer un nouvel ordre pour les tâches
    const newOrder = [];
    taskElements.forEach(element => {
      const taskId = element.dataset.id;
      const task = tasks[category].find(t => t.id === taskId);
      if (task) {
        newOrder.push(task);
      }
    });
    
    // Mettre à jour la liste des tâches
    tasks[category] = newOrder;
    
    // Sauvegarder dans le localStorage
    saveTasksToLocalStorage();
  }
  
  // Créer un élément de tâche
  function createTaskElement(task, category) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task-item');
    taskElement.dataset.id = task.id;
    
    // Vérifier si la tâche est réellement complétée
    // Pour les tâches avec répétition, elle n'est complétée que si done >= total
    const isReallyCompleted = isTaskReallyCompleted(task);
    
    // Ajouter la classe si la tâche est complétée
    if (isReallyCompleted) {
      taskElement.classList.add('completed');
    }
    
    // En-tête de la tâche
    const taskHeader = document.createElement('div');
    taskHeader.classList.add('task-header');
    
    const taskTitle = document.createElement('div');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = task.title;
    taskHeader.appendChild(taskTitle);
    
    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');
    
    // Bouton de complétion
    const completeBtn = document.createElement('button');
    completeBtn.classList.add('task-action-btn', 'complete');
    completeBtn.innerHTML = '<i class="fas fa-check"></i>';
    completeBtn.title = 'Marquer comme terminé';
    completeBtn.addEventListener('click', () => toggleTaskCompletion(task.id, category));
    taskActions.appendChild(completeBtn);
    
    // Bouton d'édition
    const editBtn = document.createElement('button');
    editBtn.classList.add('task-action-btn', 'edit');
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Modifier';
    editBtn.addEventListener('click', () => openEditTaskModal(task.id, category));
    taskActions.appendChild(editBtn);
    
    // Bouton de suppression
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('task-action-btn', 'delete');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Supprimer';
    deleteBtn.addEventListener('click', () => deleteTask(task.id, category));
    taskActions.appendChild(deleteBtn);
    
    taskHeader.appendChild(taskActions);
    taskElement.appendChild(taskHeader);
    
    // Détails de la tâche (si présents)
    if (task.time || task.location || task.tags || task.repetition || task.timer) {
      const taskDetails = document.createElement('div');
      taskDetails.classList.add('task-details');
      
      // Heure
      if (task.time) {
        const timeDetail = document.createElement('div');
        timeDetail.classList.add('task-detail');
        timeDetail.innerHTML = `<i class="fas fa-clock"></i> ${task.time}`;
        taskDetails.appendChild(timeDetail);
      }
      
      // Lieu
      if (task.location) {
        const locationDetail = document.createElement('div');
        locationDetail.classList.add('task-detail');
        locationDetail.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${task.location}`;
        taskDetails.appendChild(locationDetail);
      }
      
      // Étiquettes
      if (task.tags && (task.tags.duration || task.tags.difficulty)) {
        const tagsDetail = document.createElement('div');
        tagsDetail.classList.add('task-detail');
        tagsDetail.innerHTML = `<i class="fas fa-tags"></i> ${task.tags.duration || ''} ${task.tags.difficulty ? (task.tags.duration ? '• ' : '') + task.tags.difficulty : ''}`;
        taskDetails.appendChild(tagsDetail);
      }
      
      // Répétition
      if (task.repetition && task.repetition.total > 0) {
        const repetitionDetail = document.createElement('div');
        repetitionDetail.classList.add('task-detail');
        repetitionDetail.innerHTML = `<i class="fas fa-redo"></i> ${task.repetition.done}/${task.repetition.total}`;
        taskDetails.appendChild(repetitionDetail);
      }
      
      // Timer (uniquement pour les tâches ponctuelles)
      if (category === 'punctual' && task.timer > 0) {
        const timerDetail = document.createElement('div');
        timerDetail.classList.add('task-detail');
        timerDetail.innerHTML = `<i class="fas fa-hourglass-half"></i> À faire dans ${task.timer} jours`;
        taskDetails.appendChild(timerDetail);
      }
      
      taskElement.appendChild(taskDetails);
    }
    
    return taskElement;
  }
  
  // Vérifier si une tâche est réellement complétée (en tenant compte de la répétition)
  function isTaskReallyCompleted(task) {
    // Si la tâche a une répétition
    if (task.repetition && task.repetition.total > 0) {
      // Elle est complétée uniquement si done >= total
      return task.completed && task.repetition.done >= task.repetition.total;
    }
    
    // Sinon, on utilise simplement le flag completed
    return task.completed;
  }
  
  // Ajouter une tâche rapidement
  function quickAddTask(title, category) {
    if (!title.trim()) return;
    
    // Créer l'objet tâche avec uniquement le titre
    const task = {
      id: generateId(),
      title: title.trim(),
      date: new Date().toISOString(),
      completed: false,
      repetition: {
        total: 0,
        done: 0
      }
    };
    
    // Ajouter la tâche à la catégorie appropriée
    tasks[category].push(task);
    
    // Sauvegarder dans le localStorage
    saveTasksToLocalStorage();
    
    // Mettre à jour l'affichage
    updateAllViews();
    
    // Vider le champ d'entrée
    document.getElementById(`${category}-quick-add`).value = '';
  }
  
  // Ouvrir le modal d'édition de tâche
  function openEditTaskModal(taskId, category) {
    editingTaskId = taskId;
    
    // Trouver la tâche
    const taskToEdit = tasks[category].find(task => task.id === taskId);
    
    if (taskToEdit) {
      // Définir le titre du modal
      modalTitle.textContent = 'Modifier la tâche';
      
      // Remplir le formulaire avec les données de la tâche
      document.getElementById('edit-task-title').value = taskToEdit.title || '';
      document.getElementById('edit-task-time').value = taskToEdit.time || '';
      document.getElementById('edit-task-location').value = taskToEdit.location || '';
      
      // Étiquettes
      if (taskToEdit.tags) {
        if (taskToEdit.tags.duration) {
          document.querySelector(`input[name="duration-tag"][value="${taskToEdit.tags.duration}"]`).checked = true;
        } else {
          document.querySelectorAll('input[name="duration-tag"]').forEach(input => input.checked = false);
        }
        
        if (taskToEdit.tags.difficulty) {
          document.querySelector(`input[name="difficulty-tag"][value="${taskToEdit.tags.difficulty}"]`).checked = true;
        } else {
          document.querySelectorAll('input[name="difficulty-tag"]').forEach(input => input.checked = false);
        }
      }
      
      // Répétition
      document.getElementById('edit-task-repetition-total').value = taskToEdit.repetition?.total || '';
      
      // Timer (uniquement pour les tâches ponctuelles)
      const timerInput = document.getElementById('edit-task-timer');
      timerInput.value = taskToEdit.timer || '';
      
      // Afficher/masquer le groupe timer selon la catégorie
      if (category === 'punctual') {
        timerGroup.style.display = 'block';
      } else {
        timerGroup.style.display = 'none';
      }
      
      // Stocker la catégorie dans un attribut data pour la récupérer lors de la sauvegarde
      editTaskForm.dataset.category = category;
      
      // Afficher le modal
      editTaskModal.style.display = 'block';
    }
  }
  
  // Fermer le modal
  function closeEditTaskModal() {
    editTaskModal.style.display = 'none';
    editTaskForm.reset();
  }
  
  // Effacer un champ
  function clearField(fieldId) {
    if (fieldId === 'duration-tag' || fieldId === 'difficulty-tag') {
      // Pour les boutons radio
      document.querySelectorAll(`input[name="${fieldId}"]`).forEach(input => {
        input.checked = false;
      });
    } else {
      // Pour les champs texte et nombre
      document.getElementById(fieldId).value = '';
    }
  }
  
  // Sauvegarder une tâche
  function saveTask(event) {
    event.preventDefault();
    
    // Récupérer la catégorie depuis l'attribut data
    const category = editTaskForm.dataset.category;
    
    if (!category || !editingTaskId) return;
    
    // Récupérer les valeurs du formulaire
    const title = document.getElementById('edit-task-title').value;
    const time = document.getElementById('edit-task-time').value;
    const location = document.getElementById('edit-task-location').value;
    
    const durationTag = document.querySelector('input[name="duration-tag"]:checked')?.value;
    const difficultyTag = document.querySelector('input[name="difficulty-tag"]:checked')?.value;
    
    const repetitionTotal = parseInt(document.getElementById('edit-task-repetition-total').value) || 0;
    
    // Timer (uniquement pour les tâches ponctuelles)
    let timer = 0;
    if (category === 'punctual') {
      timer = parseInt(document.getElementById('edit-task-timer').value) || 0;
    }
    
    // Trouver la tâche à modifier
    const taskIndex = tasks[category].findIndex(task => task.id === editingTaskId);
    
    if (taskIndex !== -1) {
      // Récupérer la tâche existante
      const existingTask = tasks[category][taskIndex];
      
      // Mettre à jour la tâche
      tasks[category][taskIndex] = {
        ...existingTask,
        title,
        time,
        location,
        tags: {
          duration: durationTag,
          difficulty: difficultyTag
        },
        repetition: {
          total: repetitionTotal,
          done: Math.min(existingTask.repetition?.done || 0, repetitionTotal) // S'assurer que done ne dépasse pas total
        },
        timer
      };
      
      // Sauvegarder dans le localStorage
      saveTasksToLocalStorage();
      
      // Fermer le modal
      closeEditTaskModal();
      
      // Mettre à jour l'affichage
      updateAllViews();
    }
  }
  
  // Supprimer une tâche
  function deleteTask(taskId, category) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      // Supprimer la tâche de la catégorie
      tasks[category] = tasks[category].filter(task => task.id !== taskId);
      
      // Sauvegarder dans le localStorage
      saveTasksToLocalStorage();
      
      // Mettre à jour l'affichage
      updateAllViews();
    }
  }
  
  // Basculer l'état de complétion d'une tâche
  function toggleTaskCompletion(taskId, category) {
    // Trouver la tâche
    const taskIndex = tasks[category].findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      const task = tasks[category][taskIndex];
      
      // Si la tâche a une répétition
      if (task.repetition && task.repetition.total > 0) {
        // Si la tâche n'est pas marquée comme terminée, incrémenter le compteur
        if (!task.completed) {
          // Incrémenter le compteur, mais ne pas dépasser le total
          task.repetition.done = Math.min(task.repetition.done + 1, task.repetition.total);
          
          // Marquer la tâche comme terminée uniquement si done >= total
          task.completed = task.repetition.done >= task.repetition.total;
        } else {
          // Si la tâche est déjà marquée comme terminée, la remettre à non terminée
          // et réinitialiser le compteur à 0
          task.completed = false;
          task.repetition.done = 0;
        }
      } else {
        // Pour les tâches sans répétition, simplement inverser l'état
        task.completed = !task.completed;
      }
      
      // Sauvegarder dans le localStorage
      saveTasksToLocalStorage();
      
      // Mettre à jour l'affichage
      updateAllViews();
    }
  }
  
  // Réinitialiser les tâches quotidiennes à minuit
  function resetDailyTasksAtMidnight() {
    // Obtenir la date actuelle
    const now = new Date();
    
    // Calculer le temps jusqu'à minuit
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow - now;
    
    // Programmer la réinitialisation à minuit
    setTimeout(() => {
      // Réinitialiser les tâches quotidiennes
      tasks.daily.forEach(task => {
        // Remettre à l'état non terminé
        task.completed = false;
        
        // Réinitialiser le compteur de répétition
        if (task.repetition && task.repetition.total > 0) {
          task.repetition.done = 0;
        }
      });
      
      // Sauvegarder dans le localStorage
      saveTasksToLocalStorage();
      
      // Mettre à jour l'affichage si la vue quotidienne est active
      if (document.getElementById('daily-view').classList.contains('active')) {
        updateDailyDisplay();
      }
      
      // Programmer la prochaine réinitialisation
      resetDailyTasksAtMidnight();
    }, timeUntilMidnight);
  }
  
  // Mettre à jour toutes les vues
  function updateAllViews() {
    updateDailyDisplay();
    updateWeeklyDisplay();
    updatePunctualDisplay();
    updateAllTasksView();
    
    // Déclencher l'événement de mise à jour des statistiques
    document.dispatchEvent(new CustomEvent('tasksUpdated'));
  }
  
  // Générer un ID unique
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Vérifier si deux dates sont le même jour
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  // Sauvegarder les tâches dans le localStorage
  function saveTasksToLocalStorage() {
    localStorage.setItem('todoTasksV4', JSON.stringify(tasks));
  }
  
  // Charger les tâches depuis le localStorage
  function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('todoTasksV4');
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    }
  }

  // ===== ÉVÉNEMENTS =====
  
  // Changement de vue
  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchView(button.dataset.view);
    });
  });
  
  // Navigation jour
  prevDayBtn.addEventListener('click', () => {
    currentDailyDate.setDate(currentDailyDate.getDate() - 1);
    updateDailyDisplay();
  });
  
  nextDayBtn.addEventListener('click', () => {
    currentDailyDate.setDate(currentDailyDate.getDate() + 1);
    updateDailyDisplay();
  });
  
  // Navigation semaine
  prevWeekBtn.addEventListener('click', () => {
    currentWeeklyDate.setDate(currentWeeklyDate.getDate() - 7);
    updateWeeklyDisplay();
  });
  
  nextWeekBtn.addEventListener('click', () => {
    currentWeeklyDate.setDate(currentWeeklyDate.getDate() + 7);
    updateWeeklyDisplay();
  });
  
  // Ajout rapide de tâches
  dailyQuickAddBtn.addEventListener('click', () => {
    quickAddTask(dailyQuickAddInput.value, 'daily');
  });
  
  dailyQuickAddInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      quickAddTask(dailyQuickAddInput.value, 'daily');
    }
  });
  
  weeklyQuickAddBtn.addEventListener('click', () => {
    quickAddTask(weeklyQuickAddInput.value, 'weekly');
  });
  
  weeklyQuickAddInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      quickAddTask(weeklyQuickAddInput.value, 'weekly');
    }
  });
  
  punctualQuickAddBtn.addEventListener('click', () => {
    quickAddTask(punctualQuickAddInput.value, 'punctual');
  });
  
  punctualQuickAddInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      quickAddTask(punctualQuickAddInput.value, 'punctual');
    }
  });
  
  allQuickAddBtn.addEventListener('click', () => {
    // Pour la vue générale, ajouter à la catégorie quotidienne par défaut
    quickAddTask(allQuickAddInput.value, 'daily');
  });
  
  allQuickAddInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      quickAddTask(allQuickAddInput.value, 'daily');
    }
  });
  
  // Modal d'édition
  closeModalBtn.addEventListener('click', closeEditTaskModal);
  window.addEventListener('click', (event) => {
    if (event.target === editTaskModal) {
      closeEditTaskModal();
    }
  });
  
  // Boutons d'effacement des champs
  clearFieldBtns.forEach(button => {
    button.addEventListener('click', () => {
      clearField(button.dataset.field);
    });
  });
  
  // Formulaire d'édition
  editTaskForm.addEventListener('submit', saveTask);
  cancelTaskBtn.addEventListener('click', closeEditTaskModal);
  
  // ===== INITIALISATION =====
  
  // Charger les tâches depuis le localStorage
  loadTasksFromLocalStorage();
  
  // Initialiser l'affichage
  updateAllViews();
  
  // Programmer la réinitialisation des tâches quotidiennes à minuit
  resetDailyTasksAtMidnight();
  
  // Afficher la vue quotidienne par défaut
  switchView('daily');
});
