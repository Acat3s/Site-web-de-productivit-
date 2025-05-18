document.addEventListener('DOMContentLoaded', () => {
  console.log('Statistics script loaded');

  // ===== VARIABLES GLOBALES =====
  let statsData = {
    completionRates: {
      daily: 0,
      weekly: 0,
      punctual: 0,
      all: 0
    },
    postponedTasks: 0,
    averageTime: 0,
    tasksByDifficulty: {
      Facile: 0,
      Difficile: 0
    }
  };

  // Type de graphique actuel
  let currentChartType = 'bar';
  
  // Référence aux graphiques
  let tasksChart = null;
  let difficultyChart = null;
  let categoryCompletionChart = null;

  // ===== SÉLECTEURS DOM =====
  // Statistiques générales
  const completionRateElement = document.getElementById('completion-rate');
  const postponedTasksElement = document.getElementById('postponed-tasks');
  const averageTimeElement = document.getElementById('average-time');
  
  // Statistiques par catégorie
  const dailyCompletionElement = document.getElementById('daily-completion-rate');
  const weeklyCompletionElement = document.getElementById('weekly-completion-rate');
  const punctualCompletionElement = document.getElementById('punctual-completion-rate');
  
  // Conteneurs de graphiques
  const tasksChartElement = document.getElementById('tasks-chart');
  const difficultyChartElement = document.getElementById('difficulty-chart');
  const categoryCompletionChartElement = document.getElementById('category-completion-chart');
  
  // Sélecteur de type de graphique
  const chartTypeSelector = document.getElementById('chart-type-selector');
  
  // Filtres pour les statistiques
  const filtersContainer = document.createElement('div');
  filtersContainer.classList.add('filters-container');
  filtersContainer.innerHTML = `
    <button class="filter-btn active" data-period="all">Tout</button>
    <button class="filter-btn" data-period="week">7 derniers jours</button>
    <button class="filter-btn" data-period="month">30 derniers jours</button>
  `;
  
  // Ajouter les filtres avant le conteneur de graphique
  const chartContainer = document.querySelector('.chart-container');
  if (chartContainer) {
    chartContainer.parentNode.insertBefore(filtersContainer, chartContainer);
  }
  
  // Référence aux boutons de filtre
  const filterButtons = filtersContainer.querySelectorAll('.filter-btn');

  // ===== FONCTIONS DE STATISTIQUES =====
  
  // Calculer les statistiques
  function calculateStatistics(period = 'all') {
    // Récupérer les tâches depuis le localStorage
    const savedTasks = localStorage.getItem('todoTasksV4');
    if (!savedTasks) return;
    
    const tasks = JSON.parse(savedTasks);
    
    // Filtrer les tâches selon la période
    const filteredTasks = filterTasksByPeriod(tasks, period);
    
    // Calculer le taux de complétion pour chaque catégorie
    calculateCompletionRates(filteredTasks);
    
    // Calculer le nombre de tâches reportées
    calculatePostponedTasks(filteredTasks);
    
    // Calculer le temps moyen par tâche
    calculateAverageTime(filteredTasks);
    
    // Calculer les statistiques par difficulté
    calculateTasksByDifficulty(filteredTasks);
    
    // Mettre à jour l'affichage
    updateStatisticsDisplay();
    
    // Mettre à jour les graphiques
    updateAllCharts(filteredTasks);
  }
  
  // Filtrer les tâches selon la période
  function filterTasksByPeriod(tasks, period) {
    if (period === 'all') {
      return tasks;
    }
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (period === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    }
    
    const filteredTasks = {
      daily: [],
      weekly: [],
      punctual: []
    };
    
    for (const category in tasks) {
      filteredTasks[category] = tasks[category].filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= cutoffDate;
      });
    }
    
    return filteredTasks;
  }
  
  // Calculer les taux de complétion
  function calculateCompletionRates(tasks) {
    // Calculer pour chaque catégorie
    for (const category in tasks) {
      if (tasks[category].length === 0) {
        statsData.completionRates[category] = 0;
        continue;
      }
      
      // Compter les tâches réellement complétées (en tenant compte de la répétition)
      const completedTasks = tasks[category].filter(task => isTaskReallyCompleted(task)).length;
      statsData.completionRates[category] = Math.round((completedTasks / tasks[category].length) * 100);
    }
    
    // Calculer le taux global (moyenne pondérée)
    const totalTasks = Object.values(tasks).reduce((sum, categoryTasks) => sum + categoryTasks.length, 0);
    if (totalTasks === 0) {
      statsData.completionRates.all = 0;
    } else {
      let totalCompleted = 0;
      for (const category in tasks) {
        totalCompleted += tasks[category].filter(task => isTaskReallyCompleted(task)).length;
      }
      statsData.completionRates.all = Math.round((totalCompleted / totalTasks) * 100);
    }
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
  
  // Calculer le nombre de tâches reportées
  function calculatePostponedTasks(tasks) {
    // Pour cette version, nous n'avons plus de report automatique
    // Mais nous pouvons compter les tâches qui ont été marquées comme terminées puis remises à non terminées
    let postponedCount = 0;
    
    for (const category in tasks) {
      tasks[category].forEach(task => {
        if (task.postponeCount && task.postponeCount > 0) {
          postponedCount++;
        }
      });
    }
    
    statsData.postponedTasks = postponedCount;
  }
  
  // Calculer le temps moyen par tâche
  function calculateAverageTime(tasks) {
    let totalTime = 0;
    let taskCount = 0;
    
    for (const category in tasks) {
      tasks[category].forEach(task => {
        if (isTaskReallyCompleted(task)) {
          // Estimation arbitraire: Court = 30min, Long = 120min
          if (task.tags && task.tags.duration) {
            if (task.tags.duration === 'Court') {
              totalTime += 30;
            } else if (task.tags.duration === 'Long') {
              totalTime += 120;
            }
            taskCount++;
          }
        }
      });
    }
    
    statsData.averageTime = taskCount > 0 ? Math.round(totalTime / taskCount) : 0;
  }
  
  // Calculer les statistiques par difficulté
  function calculateTasksByDifficulty(tasks) {
    // Réinitialiser les compteurs
    statsData.tasksByDifficulty = {
      Facile: 0,
      Difficile: 0
    };
    
    for (const category in tasks) {
      tasks[category].forEach(task => {
        // Compter par difficulté
        if (task.tags && task.tags.difficulty) {
          statsData.tasksByDifficulty[task.tags.difficulty]++;
        }
      });
    }
  }
  
  // Mettre à jour l'affichage des statistiques
  function updateStatisticsDisplay() {
    // Taux de complétion global
    if (completionRateElement) {
      completionRateElement.textContent = `${statsData.completionRates.all}%`;
    }
    
    // Taux de complétion par catégorie
    if (dailyCompletionElement) {
      dailyCompletionElement.textContent = `${statsData.completionRates.daily}%`;
    }
    
    if (weeklyCompletionElement) {
      weeklyCompletionElement.textContent = `${statsData.completionRates.weekly}%`;
    }
    
    if (punctualCompletionElement) {
      punctualCompletionElement.textContent = `${statsData.completionRates.punctual}%`;
    }
    
    // Autres statistiques
    if (postponedTasksElement) {
      postponedTasksElement.textContent = statsData.postponedTasks;
    }
    
    if (averageTimeElement) {
      averageTimeElement.textContent = `${statsData.averageTime} min`;
    }
  }
  
  // Mettre à jour tous les graphiques
  function updateAllCharts(tasks) {
    updateTasksChart(tasks);
    updateDifficultyChart();
    updateCategoryCompletionChart();
  }
  
  // Mettre à jour le graphique des tâches
  function updateTasksChart(tasks) {
    if (!tasksChartElement) return;
    
    // Préparer les données pour le graphique
    const completedTasks = {
      daily: tasks.daily.filter(task => isTaskReallyCompleted(task)).length,
      weekly: tasks.weekly.filter(task => isTaskReallyCompleted(task)).length,
      punctual: tasks.punctual.filter(task => isTaskReallyCompleted(task)).length
    };
    
    const pendingTasks = {
      daily: tasks.daily.filter(task => !isTaskReallyCompleted(task)).length,
      weekly: tasks.weekly.filter(task => !isTaskReallyCompleted(task)).length,
      punctual: tasks.punctual.filter(task => !isTaskReallyCompleted(task)).length
    };
    
    // Détruire le graphique existant s'il y en a un
    if (tasksChart) {
      tasksChart.destroy();
    }
    
    // Configuration commune pour tous les types de graphiques
    const chartData = {
      labels: ['Quotidienne', 'Hebdomadaire', 'Ponctuel'],
      datasets: [
        {
          label: 'Tâches terminées',
          data: [completedTasks.daily, completedTasks.weekly, completedTasks.punctual],
          backgroundColor: '#2ecc71'
        },
        {
          label: 'Tâches en attente',
          data: [pendingTasks.daily, pendingTasks.weekly, pendingTasks.punctual],
          backgroundColor: '#3498db'
        }
      ]
    };
    
    // Options spécifiques selon le type de graphique
    let chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Répartition des tâches par catégorie'
        }
      }
    };
    
    // Ajouter des options spécifiques selon le type de graphique
    if (currentChartType === 'bar') {
      chartOptions.scales = {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      };
    } else if (currentChartType === 'line') {
      // Pour le graphique en ligne, on ne garde que les totaux
      chartData.datasets = [
        {
          label: 'Tâches terminées',
          data: [completedTasks.daily, completedTasks.weekly, completedTasks.punctual],
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          fill: true,
          tension: 0.4
        }
      ];
    } else if (currentChartType === 'pie') {
      // Pour le camembert, on combine les données différemment
      chartData.labels = ['Quotidienne terminées', 'Quotidienne en attente', 'Hebdomadaire terminées', 'Hebdomadaire en attente', 'Ponctuel terminées', 'Ponctuel en attente'];
      chartData.datasets = [{
        data: [
          completedTasks.daily,
          pendingTasks.daily,
          completedTasks.weekly,
          pendingTasks.weekly,
          completedTasks.punctual,
          pendingTasks.punctual
        ],
        backgroundColor: [
          '#2ecc71', // Quotidienne terminées
          '#3498db', // Quotidienne en attente
          '#27ae60', // Hebdomadaire terminées
          '#2980b9', // Hebdomadaire en attente
          '#16a085', // Ponctuel terminées
          '#1abc9c'  // Ponctuel en attente
        ]
      }];
    } else if (currentChartType === 'radar') {
      // Pour le radar, on adapte les données
      chartData.datasets = [
        {
          label: 'Tâches terminées',
          data: [completedTasks.daily, completedTasks.weekly, completedTasks.punctual],
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          borderColor: '#2ecc71',
          pointBackgroundColor: '#2ecc71'
        },
        {
          label: 'Tâches en attente',
          data: [pendingTasks.daily, pendingTasks.weekly, pendingTasks.punctual],
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: '#3498db',
          pointBackgroundColor: '#3498db'
        }
      ];
    }
    
    // Créer le graphique avec le type actuel
    tasksChart = new Chart(tasksChartElement, {
      type: currentChartType,
      data: chartData,
      options: chartOptions
    });
  }
  
  // Mettre à jour le graphique des difficultés
  function updateDifficultyChart() {
    if (!difficultyChartElement) return;
    
    // Détruire le graphique existant s'il y en a un
    if (difficultyChart) {
      difficultyChart.destroy();
    }
    
    // Données pour le graphique
    const chartData = {
      labels: ['Faciles', 'Difficiles'],
      datasets: [{
        data: [
          statsData.tasksByDifficulty.Facile,
          statsData.tasksByDifficulty.Difficile
        ],
        backgroundColor: [
          '#2ecc71',
          '#e74c3c'
        ],
        borderColor: '#f5f5f5',
        borderWidth: 1
      }]
    };
    
    // Options du graphique
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Répartition des tâches par difficulté'
        }
      }
    };
    
    // Type de graphique à utiliser (toujours en camembert pour celui-ci)
    const chartType = currentChartType === 'radar' ? 'polarArea' : 'pie';
    
    // Créer le graphique
    difficultyChart = new Chart(difficultyChartElement, {
      type: chartType,
      data: chartData,
      options: chartOptions
    });
  }
  
  // Mettre à jour le graphique des taux de complétion par catégorie
  function updateCategoryCompletionChart() {
    if (!categoryCompletionChartElement) return;
    
    // Détruire le graphique existant s'il y en a un
    if (categoryCompletionChart) {
      categoryCompletionChart.destroy();
    }
    
    // Données pour le graphique
    const chartData = {
      labels: ['Quotidienne', 'Hebdomadaire', 'Ponctuel'],
      datasets: [{
        label: 'Taux de complétion',
        data: [
          statsData.completionRates.daily,
          statsData.completionRates.weekly,
          statsData.completionRates.punctual
        ],
        backgroundColor: [
          '#2ecc71',
          '#3498db',
          '#9b59b6'
        ],
        borderColor: '#f5f5f5',
        borderWidth: 1
      }]
    };
    
    // Options du graphique
    let chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Taux de complétion par catégorie'
        }
      }
    };
    
    // Ajouter des options spécifiques selon le type de graphique
    if (currentChartType === 'bar') {
      chartOptions.scales = {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      };
    } else if (currentChartType === 'line') {
      chartOptions.scales = {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      };
      
      // Pour le graphique en ligne
      chartData.datasets = [{
        label: 'Taux de complétion',
        data: [
          statsData.completionRates.daily,
          statsData.completionRates.weekly,
          statsData.completionRates.punctual
        ],
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        fill: true,
        tension: 0.4
      }];
    }
    
    // Type de graphique à utiliser
    let chartType = currentChartType;
    if (currentChartType === 'pie' || currentChartType === 'radar') {
      // Pour ces types, on utilise un graphique spécifique
      chartType = currentChartType === 'radar' ? 'polarArea' : 'doughnut';
    }
    
    // Créer le graphique
    categoryCompletionChart = new Chart(categoryCompletionChartElement, {
      type: chartType,
      data: chartData,
      options: chartOptions
    });
  }
  
  // Changer le type de graphique
  function changeChartType(newType) {
    currentChartType = newType;
    
    // Mettre à jour les graphiques
    const savedTasks = localStorage.getItem('todoTasksV4');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      
      // Récupérer la période active
      const activeFilter = document.querySelector('.filter-btn.active');
      const period = activeFilter ? activeFilter.dataset.period : 'all';
      
      // Filtrer les tâches selon la période
      const filteredTasks = filterTasksByPeriod(tasks, period);
      
      // Mettre à jour les graphiques
      updateAllCharts(filteredTasks);
    }
  }

  // ===== ÉVÉNEMENTS =====
  
  // Mettre à jour les statistiques lorsque les tâches changent
  window.addEventListener('storage', (event) => {
    if (event.key === 'todoTasksV4') {
      // Récupérer la période active
      const activeFilter = document.querySelector('.filter-btn.active');
      const period = activeFilter ? activeFilter.dataset.period : 'all';
      
      calculateStatistics(period);
    }
  });
  
  // Créer un événement personnalisé pour mettre à jour les statistiques
  document.addEventListener('tasksUpdated', () => {
    // Récupérer la période active
    const activeFilter = document.querySelector('.filter-btn.active');
    const period = activeFilter ? activeFilter.dataset.period : 'all';
    
    calculateStatistics(period);
  });
  
  // Gérer les clics sur les filtres
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Mettre à jour l'état actif
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Recalculer les statistiques avec la période sélectionnée
      calculateStatistics(button.dataset.period);
    });
  });
  
  // Gérer les changements de type de graphique
  if (chartTypeSelector) {
    chartTypeSelector.addEventListener('change', () => {
      changeChartType(chartTypeSelector.value);
    });
  }
  
  // ===== INITIALISATION =====
  
  // Calculer les statistiques au chargement
  calculateStatistics();
});
