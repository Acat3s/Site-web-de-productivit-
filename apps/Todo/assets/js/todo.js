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
    punctual: [],
    general: []
  };
  
  // Sélection des éléments DOM
  const viewButtons = document.querySelectorAll('.view-btn');
  const viewSections = document.querySelectorAll('.view-section');
  const editTaskModal = document.getElementById('edit-task-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const cancelTaskBtn = document.getElementById('cancel-task');
  const clearFieldBtns = document.querySelectorAll('.clear-field-btn');
  const themeToggle = document.getElementById('theme-toggle');

  // ===== INITIALISATION =====
  // Charger les tâches depuis le localStorage
  loadTasksFromLocalStorage();
  
  // Initialiser les sélecteurs de vue
  initViewSelectors();
  
  // Initialiser les lignes d'ajout rapide
  initQuickAddInputs();
  
  // Initialiser le modal d'édition
  initEditModal();
  
  // Initialiser la réinitialisation des tâches quotidiennes à minuit
  resetDailyTasksAtMidnight();
  
  // Initialiser le thème
  initTheme();
  
  // Mettre à jour toutes les vues
  updateAllViews();

  // ===== FONCTIONS D'INITIALISATION =====
  
  // Initialiser le thème
  function initTheme() {
    // Vérifier si un thème est sauvegardé dans localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Mettre à jour l'icône du bouton
    updateThemeIcon(savedTheme);
    
    // Ajouter l'écouteur d'événement pour le bouton de thème
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  }
  
  // Mettre à jour l'icône du thème
  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('i');
    if (!themeIcon) return;
    
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }
  }
  
  // Basculer entre le mode clair et sombre
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Animation de transition
    document.body.style.opacity = '0.8';
    
    setTimeout(() => {
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Mettre à jour l'icône du bouton
      updateThemeIcon(newTheme);
      
      // Sauvegarder la préférence dans localStorage
      localStorage.setItem('theme', newTheme);
      
      document.body.style.opacity = '1';
    }, 200);
  }
  
  // Initialiser les sélecteurs de vue
  function initViewSelectors() {
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const viewName = button.dataset.view;
        switchView(viewName);
      });
    });
    
    // Initialiser la navigation
    if (document.querySelector('.left-arrow')) {
      document.querySelector('.left-arrow').addEventListener('click', () => {
        const activeView = document.querySelector('.view-btn.active').dataset.view;
        
        if (activeView === 'daily') {
          // Reculer d'un jour
          currentDailyDate.setDate(currentDailyDate.getDate() - 1);
          updateDailyDisplay();
        } else if (activeView === 'weekly') {
          // Reculer d'une semaine
          currentWeeklyDate.setDate(currentWeeklyDate.getDate() - 7);
          updateWeeklyDisplay();
        }
      });
    }
    
    if (document.querySelector('.right-arrow')) {
      document.querySelector('.right-arrow').addEventListener('click', () => {
        const activeView = document.querySelector('.view-btn.active').dataset.view;
        
        if (activeView === 'daily') {
          // Avancer d'un jour
          currentDailyDate.setDate(currentDailyDate.getDate() + 1);
          updateDailyDisplay();
        } else if (activeView === 'weekly') {
          // Avancer d'une semaine
          currentWeeklyDate.setDate(currentWeeklyDate.getDate() + 7);
          updateWeeklyDisplay();
        }
      });
    }
  }
  
  // Initialiser les lignes d'ajout rapide
  function initQuickAddInputs() {
    // Sélectionner toutes les entrées d'ajout rapide
    const quickAddInputs = document.querySelectorAll('.quick-add-input');
    const quickAddButtons = document.querySelectorAll('.quick-add-button');
    
    // Ajouter les écouteurs d'événements pour chaque entrée
    quickAddInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const title = input.value;
          const category = input.dataset.view;
          quickAddTask(title, category);
          input.value = '';
        }
      });
    });
    
    // Ajouter les écouteurs d'événements pour chaque bouton
    quickAddButtons.forEach(button => {
      button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        const title = input.value;
        const category = input.dataset.view;
        quickAddTask(title, category);
        input.value = '';
      });
    });
  }
  
  // Initialiser le modal d'édition
  function initEditModal() {
    // Fermer le modal
    closeModalBtn.addEventListener('click', closeEditTaskModal);
    
    // Fermer le modal en cliquant en dehors
    window.addEventListener('click', (e) => {
      if (e.target === editTaskModal) {
        closeEditTaskModal();
      }
    });
    
    // Annuler l'édition
    cancelTaskBtn.addEventListener('click', closeEditTaskModal);
    
    // Enregistrer les modifications
    editTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEditedTask();
    });
    
    // Effacer les champs optionnels
    clearFieldBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const fieldId = btn.dataset.field;
        document.getElementById(fieldId).value = '';
      });
    });
    
    // Sélection des étiquettes
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        const value = btn.dataset.value;
        
        // Basculer la classe active
        const isActive = btn.classList.contains('active');
        
        // Désactiver tous les boutons du même groupe
        document.querySelectorAll(`.tag-btn[data-tag="${tag}"]`).forEach(b => {
          b.classList.remove('active');
        });
        
        // Activer le bouton cliqué (sauf si on clique sur un bouton déjà actif)
        if (!isActive) {
          btn.classList.add('active');
        }
      });
    });
  }

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
    } else if (viewName === 'general') {
      updateGeneralView();
    }
  }
  
  // Mise à jour de l'affichage quotidien
  function updateDailyDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const currentDateDisplay = document.getElementById('current-date');
    if (currentDateDisplay) {
      currentDateDisplay.textContent = currentDailyDate.toLocaleDateString('fr-FR', options);
    }
    
    // Gestion de la visibilité des flèches de navigation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const displayedDate = new Date(currentDailyDate);
    displayedDate.setHours(0, 0, 0, 0);
    
    // La flèche droite n'est visible que si on consulte une date antérieure à aujourd'hui
    const rightArrow = document.querySelector('.right-arrow');
    if (rightArrow) {
      if (displayedDate.getTime() < today.getTime()) {
        rightArrow.style.display = 'flex';
      } else {
        rightArrow.style.display = 'none';
      }
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
    
    const currentWeekDisplay = document.getElementById('current-week');
    if (currentWeekDisplay) {
      currentWeekDisplay.textContent = `${startOfWeek.toLocaleDateString('fr-FR', startOptions)} au ${endOfWeek.toLocaleDateString('fr-FR', endOptions)}`;
    }
    
    // Gestion de la visibilité des flèches de navigation
    const today = new Date();
    const currentWeekStart = getStartOfWeek(today);
    const displayedWeekStart = getStartOfWeek(currentWeeklyDate);
    
    // La flèche droite n'est visible que si on consulte une semaine antérieure à la semaine actuelle
    const rightArrow = document.querySelector('.right-arrow');
    if (rightArrow) {
      if (displayedWeekStart.getTime() < currentWeekStart.getTime()) {
        rightArrow.style.display = 'flex';
      } else {
        rightArrow.style.display = 'none';
      }
    }
    
    // Charger les tâches de la semaine
    loadWeeklyTasks();
  }
  
  // Mise à jour de l'affichage ponctuel
  function updatePunctualDisplay() {
    // Charger les tâches ponctuelles
    loadPunctualTasks();
  }
  
  // Mise à jour de la vue générale
  function updateGeneralView() {
    // Charger toutes les tâches
    loadGeneralTasks();
  }
  
  // Obtenir le premier jour de la semaine (lundi)
  function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que la semaine commence le lundi
    return new Date(new Date(date).setDate(diff));
  }
  
  // Vérifier si deux dates sont le même jour
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // ===== GESTION DES TÂCHES =====
  
  // Charger les tâches quotidiennes
  function loadDailyTasks() {
    // Vider la liste
    const dailyTasksList = document.getElementById('daily-tasks');
    if (!dailyTasksList) return;
    
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
    const weeklyTasksList = document.getElementById('weekly-tasks');
    if (!weeklyTasksList) return;
    
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
    const punctualTasksList = document.getElementById('punctual-tasks');
    if (!punctualTasksList) return;
    
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
  
  // Charger toutes les tâches (vue générale)
  function loadGeneralTasks() {
    // Vider la liste
    const generalTasksList = document.getElementById('general-tasks');
    if (!generalTasksList) return;
    
    generalTasksList.innerHTML = '';
    
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
      generalTasksList.appendChild(taskElement);
    });
    
    // Initialiser le drag and drop
    initSortable(generalTasksList, 'general');
  }
  
  // Initialiser le drag and drop
  function initSortable(container, category) {
    if (container && typeof Sortable !== 'undefined') {
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
    if (category === 'general') {
      // Pour la vue générale, on ne modifie pas l'ordre des tâches
      return;
    }
    
    const container = document.getElementById(`${category}-tasks`);
    if (!container) return;
    
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
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.title = 'Supprimer';
    deleteBtn.addEventListener('click', () => deleteTask(task.id, category));
    taskActions.appendChild(deleteBtn);
    
    taskHeader.appendChild(taskActions);
    taskElement.appendChild(taskHeader);
    
    // Détails de la tâche
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
    if (task.tags) {
      // Durée
      if (task.tags.duration) {
        const durationDetail = document.createElement('div');
        durationDetail.classList.add('task-detail');
        durationDetail.innerHTML = `<i class="fas fa-hourglass-half"></i> ${task.tags.duration}`;
        taskDetails.appendChild(durationDetail);
      }
      
      // Difficulté
      if (task.tags.difficulty) {
        const difficultyDetail = document.createElement('div');
        difficultyDetail.classList.add('task-detail');
        difficultyDetail.innerHTML = `<i class="fas fa-signal"></i> ${task.tags.difficulty}`;
        taskDetails.appendChild(difficultyDetail);
      }
    }
    
    // Répétition
    if (task.repetition && task.repetition.total > 0) {
      const repetitionDetail = document.createElement('div');
      repetitionDetail.classList.add('task-detail');
      repetitionDetail.innerHTML = `<i class="fas fa-redo"></i> ${task.repetition.done}/${task.repetition.total}`;
      taskDetails.appendChild(repetitionDetail);
    }
    
    // Timer
    if (task.timer && task.timer > 0) {
      const timerDetail = document.createElement('div');
      timerDetail.classList.add('task-detail');
      timerDetail.innerHTML = `<i class="fas fa-stopwatch"></i> ${task.timer} jours`;
      taskDetails.appendChild(timerDetail);
    }
    
    taskElement.appendChild(taskDetails);
    
    return taskElement;
  }
  
  // Vérifier si une tâche est réellement complétée
  function isTaskReallyCompleted(task) {
    if (task.repetition && task.repetition.total > 0) {
      return task.repetition.done >= task.repetition.total;
    }
    return task.completed;
  }
  
  // Basculer l'état de complétion d'une tâche
  function toggleTaskCompletion(taskId, category) {
    const task = tasks[category].find(t => t.id === taskId);
    if (!task) return;
    
    if (task.repetition && task.repetition.total > 0) {
      // Pour les tâches avec répétition, incrémenter le compteur
      if (task.repetition.done < task.repetition.total) {
        task.repetition.done++;
        
        // Si on atteint le total, marquer comme complétée
        if (task.repetition.done >= task.repetition.total) {
          task.completed = true;
        }
      } else {
        // Si déjà au max, réinitialiser
        task.repetition.done = 0;
        task.completed = false;
      }
    } else {
      // Pour les tâches normales, basculer l'état
      task.completed = !task.completed;
    }
    
    // Sauvegarder et mettre à jour l'affichage
    saveTasksToLocalStorage();
    updateAllViews();
  }
  
  // Ouvrir le modal d'édition de tâche
  function openEditTaskModal(taskId, category) {
    const task = tasks[category].find(t => t.id === taskId);
    if (!task) return;
    
    // Stocker l'ID de la tâche en cours d'édition
    editingTaskId = { id: taskId, category };
    
    // Remplir le formulaire avec les données de la tâche
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-time').value = task.time || '';
    document.getElementById('task-location').value = task.location || '';
    
    // Réinitialiser les étiquettes
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Sélectionner les étiquettes actives
    if (task.tags) {
      if (task.tags.duration) {
        document.querySelector(`.tag-btn[data-tag="duration"][data-value="${task.tags.duration}"]`)?.classList.add('active');
      }
      
      if (task.tags.difficulty) {
        document.querySelector(`.tag-btn[data-tag="difficulty"][data-value="${task.tags.difficulty}"]`)?.classList.add('active');
      }
    }
    
    // Répétition
    document.getElementById('repetition-total').value = task.repetition ? task.repetition.total : 0;
    
    // Timer
    document.getElementById('task-timer').value = task.timer || 0;
    
    // Afficher le modal
    editTaskModal.style.display = 'block';
  }
  
  // Fermer le modal d'édition de tâche
  function closeEditTaskModal() {
    editTaskModal.style.display = 'none';
    editingTaskId = null;
  }
  
  // Sauvegarder les modifications d'une tâche
  function saveEditedTask() {
    if (!editingTaskId) return;
    
    const { id, category } = editingTaskId;
    const task = tasks[category].find(t => t.id === id);
    if (!task) return;
    
    // Récupérer les valeurs du formulaire
    const title = document.getElementById('task-title').value;
    const time = document.getElementById('task-time').value;
    const location = document.getElementById('task-location').value;
    
    // Récupérer les étiquettes
    const durationBtn = document.querySelector('.tag-btn[data-tag="duration"].active');
    const difficultyBtn = document.querySelector('.tag-btn[data-tag="difficulty"].active');
    
    const duration = durationBtn ? durationBtn.dataset.value : null;
    const difficulty = difficultyBtn ? difficultyBtn.dataset.value : null;
    
    // Récupérer la répétition
    const repetitionTotal = parseInt(document.getElementById('repetition-total').value) || 0;
    
    // Récupérer le timer
    const timer = parseInt(document.getElementById('task-timer').value) || 0;
    
    // Mettre à jour la tâche
    task.title = title;
    task.time = time;
    task.location = location;
    task.tags = {
      duration,
      difficulty
    };
    task.repetition = {
      total: repetitionTotal,
      done: task.repetition ? Math.min(task.repetition.done, repetitionTotal) : 0
    };
    task.timer = timer;
    
    // Sauvegarder et mettre à jour l'affichage
    saveTasksToLocalStorage();
    updateAllViews();
    
    // Fermer le modal
    closeEditTaskModal();
  }
  
  // Supprimer une tâche
  function deleteTask(taskId, category) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    // Filtrer la tâche
    tasks[category] = tasks[category].filter(t => t.id !== taskId);
    
    // Sauvegarder et mettre à jour l'affichage
    saveTasksToLocalStorage();
    updateAllViews();
  }
  
  // Ajouter une tâche rapidement
  function quickAddTask(title, category) {
    if (!title.trim()) return;
    
    // Créer une nouvelle tâche
    const newTask = {
      id: generateId(),
      title,
      date: new Date().toISOString(),
      completed: false,
      tags: {},
      repetition: {
        total: 0,
        done: 0
      },
      timer: 0
    };
    
    // Ajouter la tâche à la catégorie correspondante
    tasks[category].push(newTask);
    
    // Sauvegarder et mettre à jour l'affichage
    saveTasksToLocalStorage();
    updateAllViews();
  }
  
  // Générer un ID unique
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Mettre à jour toutes les vues
  function updateAllViews() {
    const activeView = document.querySelector('.view-btn.active')?.dataset.view;
    
    if (activeView === 'daily') {
      updateDailyDisplay();
    } else if (activeView === 'weekly') {
      updateWeeklyDisplay();
    } else if (activeView === 'punctual') {
      updatePunctualDisplay();
    } else if (activeView === 'general') {
      updateGeneralView();
    }
  }
  
  // Charger les tâches depuis le localStorage
  function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    }
  }
  
  // Sauvegarder les tâches dans le localStorage
  function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
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
      // Réinitialiser et reprogrammer pour le jour suivant
      resetDailyTasksAtMidnight();
    }, msToMidnight);
  }
});
