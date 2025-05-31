// Calendrier.js - Application de calendrier pour ProductivityHub
// Couleur principale: Vert émeraude (#2ECC71)

// Variables globales
let currentDate = new Date();
let currentView = 'day'; // Vue journalière par défaut
let events = [];

// Variables pour l'interaction de création d'événements
let isDragging = false;
let dragStartY = null;
let dragEndY = null;
let dragStartElement = null;
let dragStartDate = null;
let selectionElement = null;

// Variables pour le déplacement d'événements
let isMovingEvent = false;
let movingEventElement = null;
let originalEventData = null;
let initialClickY = null;
let initialClickOffsetY = null; // Offset du clic à l'intérieur de l'événement
let hasMovedSignificantly = false;
let clickTimeout = null;

// Constantes
const HOURS_IN_DAY = 24;
const MINUTES_PER_HOUR = 60;
const TOTAL_MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_PER_HOUR;
const SLOT_HEIGHT_PX = 60; // Hauteur d'un créneau horaire en pixels
const TOTAL_HEIGHT_PX = HOURS_IN_DAY * SLOT_HEIGHT_PX;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM chargé, initialisation du calendrier");

  // Appliquer le thème sauvegardé (clé 'theme')
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Mettre à jour l'icône du thème
  updateThemeIcon(savedTheme);

  // S'assurer que seule la vue active est affichée
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`${currentView}-view`).classList.add('active');

  // Mettre à jour les boutons de vue
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-view') === currentView) {
      btn.classList.add('active');
    }
  });

  // Initialiser les gestionnaires d'événements
  initEventListeners();

  // Charger les événements depuis le stockage local
  loadEvents();

  // Afficher la vue par défaut (journalière)
  renderCurrentView();
});

// Fonction pour mettre à jour l'icône du thème
function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (!themeIcon) return;
  if (theme === 'dark') {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }
}

// Fonction pour basculer entre le mode clair et sombre (identique à To-Do)
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Animation de transition
  document.body.style.opacity = '0.8';

  setTimeout(() => {
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.style.opacity = '1';
  }, 200);
}

// Initialisation des écouteurs d'événements
function initEventListeners() {
  console.log("Initialisation des écouteurs d'événements");

  // Gestionnaire pour le bouton de changement de thème
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);

  // Gestionnaires pour les boutons de navigation
  document.querySelectorAll('.nav-arrow').forEach(arrow => {
    arrow.addEventListener('click', (e) => {
      const direction = arrow.classList.contains('left-arrow') ? -1 : 1;
      navigateCalendar(direction);
    });
  });

  // Gestionnaire pour le bouton "Aujourd'hui"
  document.querySelectorAll('.today-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDate = new Date();
      renderCurrentView();
    });
  });

  // Gestionnaires pour les boutons de vue
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Retirer la classe active de tous les boutons
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      // Ajouter la classe active au bouton cliqué
      btn.classList.add('active');

      // Changer la vue actuelle
      currentView = btn.getAttribute('data-view');

      // Masquer toutes les sections de vue
      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });

      // Afficher la section correspondante
      document.getElementById(`${currentView}-view`).classList.add('active');

      // Mettre à jour l'affichage
      renderCurrentView();
    });
  });

  // Gestionnaires pour le popup d'événement
  const popup = document.getElementById('event-popup');
  const popupOverlay = document.getElementById('event-popup-overlay');
  const closePopup = document.querySelector('.close-popup');
  const cancelBtn = document.getElementById('cancel-event');

  closePopup.addEventListener('click', () => {
    closeEventPopup();
  });

  cancelBtn.addEventListener('click', () => {
    closeEventPopup();
  });

  // Fermer le popup en cliquant sur l'overlay
  popupOverlay.addEventListener('click', () => {
    closeEventPopup();
  });

  // Gestionnaire pour le formulaire d'événement
  const eventForm = document.getElementById('event-form');
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEvent();
  });

  // Gestionnaire pour les boutons de catégorie
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Retirer la classe active de tous les boutons
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      // Ajouter la classe active au bouton cliqué
      btn.classList.add('active');

      // Appliquer la couleur comme style de fond
      btn.style.backgroundColor = btn.getAttribute('data-color');
    });
  });

  // Gestionnaire pour le bouton de suppression
  const deleteBtn = document.getElementById('delete-event');
  deleteBtn.addEventListener('click', () => {
    deleteEvent();
  });
}

// Navigation dans le calendrier
function navigateCalendar(direction) {
  switch (currentView) {
    case 'month':
      // Naviguer d'un mois
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
      break;
    case 'week':
      // Naviguer d'une semaine
      currentDate = new Date(currentDate.getTime() + direction * 7 * 24 * 60 * 60 * 1000);
      break;
    case 'day':
      // Naviguer d'un jour
      currentDate = new Date(currentDate.getTime() + direction * 24 * 60 * 60 * 1000);
      break;
    case 'agenda':
      // Naviguer d'un mois pour l'agenda aussi
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
      break;
  }

  renderCurrentView();
}

// Afficher la vue actuelle
function renderCurrentView() {
  console.log(`Rendu de la vue ${currentView}`);

  switch (currentView) {
    case 'month':
      renderMonthView();
      break;
    case 'week':
      renderWeekView();
      break;
    case 'day':
      renderDayView();
      break;
    case 'agenda':
      renderAgendaView();
      break;
  }
}

// Rendu de la vue mensuelle
function renderMonthView() {
  // Mettre à jour le titre du mois
  updateMonthTitle();

  // Obtenir le premier jour du mois
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  // Obtenir le dernier jour du mois
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Déterminer le premier jour à afficher (peut être du mois précédent)
  // En France, la semaine commence le lundi (1) et non le dimanche (0)
  let startDay = new Date(firstDay);
  let dayOfWeek = startDay.getDay(); // 0 (dimanche) à 6 (samedi)
  dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convertir pour que lundi = 0, dimanche = 6
  startDay.setDate(startDay.getDate() - dayOfWeek);

  // Générer la grille du calendrier
  const monthGrid = document.getElementById('month-grid');
  monthGrid.innerHTML = '';

  // Aujourd'hui pour la comparaison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Créer 6 semaines (42 jours) pour être sûr de couvrir tout le mois
  for (let i = 0; i < 42; i++) {
    const currentDay = new Date(startDay);
    currentDay.setDate(startDay.getDate() + i);

    // Vérifier si le jour fait partie du mois actuel
    const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();

    // Vérifier si c'est aujourd'hui
    const isToday = currentDay.getTime() === today.getTime();

    // Créer l'élément de jour
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}`;
    dayElement.dataset.date = currentDay.toISOString().split('T')[0];

    // Ajouter le numéro du jour
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = currentDay.getDate();
    dayElement.appendChild(dayNumber);

    // Ajouter les événements du jour
    const dayEvents = document.createElement('div');
    dayEvents.className = 'day-events';

    // Filtrer les événements pour ce jour
    const eventsForDay = getEventsForDay(currentDay);

    // Limiter à 3 événements affichés, avec un indicateur "+X plus" si nécessaire
    const maxEventsToShow = 3;
    const displayEvents = eventsForDay.slice(0, maxEventsToShow);

    displayEvents.forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';
      eventItem.style.backgroundColor = `${event.color}20`; // Couleur avec transparence
      eventItem.style.borderLeft = `3px solid ${event.color}`;

      const eventDot = document.createElement('span');
      eventDot.className = 'event-dot';
      eventDot.style.backgroundColor = event.color;

      const eventText = document.createElement('span');
      eventText.textContent = event.title;

      eventItem.appendChild(eventDot);
      eventItem.appendChild(eventText);

      // Ajouter un gestionnaire d'événement pour ouvrir le popup (double clic)
      eventItem.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openEventPopup(event);
      });

      dayEvents.appendChild(eventItem);
    });

    // Ajouter un indicateur s'il y a plus d'événements
    if (eventsForDay.length > maxEventsToShow) {
      const moreIndicator = document.createElement('div');
      moreIndicator.className = 'more-events';
      moreIndicator.textContent = `+${eventsForDay.length - maxEventsToShow} plus`;
      dayEvents.appendChild(moreIndicator);
    }

    dayElement.appendChild(dayEvents);

    // Ajouter un gestionnaire d'événement pour créer un nouvel événement
    dayElement.addEventListener('click', () => {
      openNewEventPopup(currentDay);
    });

    monthGrid.appendChild(dayElement);
  }
}

// Rendu de la vue hebdomadaire
function renderWeekView() {
  console.log("Rendu de la vue hebdomadaire");

  // Mettre à jour le titre de la semaine
  updateWeekTitle();

  // Obtenir le premier jour de la semaine (lundi)
  const firstDayOfWeek = getFirstDayOfWeek(currentDate);

  // Mettre à jour les en-têtes des jours
  const dayColumns = document.querySelectorAll('.day-column');
  for (let i = 0; i < 7; i++) {
    const day = new Date(firstDayOfWeek);
    day.setDate(firstDayOfWeek.getDate() + i);

    const dayName = dayColumns[i].querySelector('.day-name');
    const dayNumber = dayColumns[i].querySelector('.day-number');

    dayName.textContent = getWeekdayName(day.getDay());
    dayNumber.textContent = day.getDate();
  }

  // Générer la grille horaire
  const weekGrid = document.getElementById('week-grid');
  weekGrid.innerHTML = '';

  // Colonne des heures
  const timeColumn = document.createElement('div');
  timeColumn.className = 'time-column';

  // Heures de 0h à 23h
  for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
    const timeSlot = document.createElement('div');
    timeSlot.className = 'time-slot';
    timeSlot.textContent = `${hour}:00`;

    timeColumn.appendChild(timeSlot);
  }

  weekGrid.appendChild(timeColumn);

  // Créer une page blanche pour chaque jour avec séparations
  for (let day = 0; day < 7; day++) {
    const currentDay = new Date(firstDayOfWeek);
    currentDay.setDate(firstDayOfWeek.getDate() + day);
    const dateStr = currentDay.toISOString().split('T')[0];

    // Créer une colonne pour le jour entier
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column-content';
    dayColumn.dataset.day = day;
    dayColumn.dataset.date = dateStr;

    // Ajouter les lignes horaires pour faciliter le repérage
    for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
      const hourLine = document.createElement('div');
      hourLine.className = 'hour-line';
      hourLine.style.top = `${(hour / HOURS_IN_DAY) * 100}%`;
      dayColumn.appendChild(hourLine);

      // Ajouter des lignes pour les quarts d'heure
      for (let quarter = 1; quarter <= 3; quarter++) {
        const quarterLine = document.createElement('div');
        quarterLine.className = 'quarter-line';
        quarterLine.style.top = `${((hour + quarter * 0.25) / HOURS_IN_DAY) * 100}%`;
        dayColumn.appendChild(quarterLine);
      }
    }

    // Ajouter les gestionnaires pour le drag-and-drop de création
    setupDragAndDrop(dayColumn);

    weekGrid.appendChild(dayColumn);

    // Ajouter les événements pour ce jour
    const dayEvents = getEventsForDay(currentDay);

    dayEvents.forEach(event => {
      // Vérifier si l'événement a une heure de début
      if (event.startTime) {
        const startHour = parseInt(event.startTime.split(':')[0]);
        const startMinute = parseInt(event.startTime.split(':')[1]);

        const endHour = event.endTime ? parseInt(event.endTime.split(':')[0]) : startHour + 1;
        const endMinute = event.endTime ? parseInt(event.endTime.split(':')[1]) : 0;

        // Calculer la position et la hauteur en fonction de l'heure (sur 24h)
        const startPosition = ((startHour + startMinute / 60) / HOURS_IN_DAY) * 100;
        const duration = ((endHour - startHour) + (endMinute - startMinute) / 60) / HOURS_IN_DAY * 100;

        // Créer l'élément d'événement
        const eventElement = document.createElement('div');
        eventElement.className = 'week-event';
        eventElement.style.backgroundColor = event.color;
        eventElement.style.top = `${startPosition}%`;
        eventElement.style.height = `${duration}%`;
        eventElement.dataset.eventId = event.id;

        // Contenu de l'événement
        eventElement.innerHTML = `
          <div class="event-time">${formatTime(event.startTime)} ${event.endTime ? '- ' + formatTime(event.endTime) : ''}</div>
          <div class="event-title">${event.title}</div>
        `;

        // Ajouter les gestionnaires pour le déplacement (mousedown) et l'édition (dblclick)
        eventElement.addEventListener('mousedown', (e) => {
          e.stopPropagation(); // Empêcher la propagation pour ne pas déclencher le drag de création
          handleEventMoveStart(e, event);
        });
        eventElement.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          openEventPopup(event);
        });

        dayColumn.appendChild(eventElement);
      }
    });
  }
}

// Rendu de la vue journalière
function renderDayView() {
  console.log("Rendu de la vue journalière");

  // Mettre à jour le titre du jour
  updateDayTitle();

  // Générer la timeline
  const dayTimeline = document.getElementById('day-timeline');
  dayTimeline.innerHTML = '';

  const dateStr = currentDate.toISOString().split('T')[0];

  // Créer la colonne des heures
  const timeColumn = document.createElement('div');
  timeColumn.className = 'day-time-column';

  // Heures de 0h à 23h
  for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
    const hourLabel = document.createElement('div');
    hourLabel.className = 'hour-label';
    hourLabel.textContent = `${hour}:00`;
    timeColumn.appendChild(hourLabel);
  }

  dayTimeline.appendChild(timeColumn);

  // Créer la page blanche pour les événements
  const dayContent = document.createElement('div');
  dayContent.className = 'day-content';
  dayContent.dataset.date = dateStr;

  // Ajouter les lignes horaires pour faciliter le repérage
  for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
    const hourLine = document.createElement('div');
    hourLine.className = 'hour-line';
    hourLine.style.top = `${(hour / HOURS_IN_DAY) * 100}%`;
    dayContent.appendChild(hourLine);

    // Ajouter des lignes pour les quarts d'heure
    for (let quarter = 1; quarter <= 3; quarter++) {
      const quarterLine = document.createElement('div');
      quarterLine.className = 'quarter-line';
      quarterLine.style.top = `${((hour + quarter * 0.25) / HOURS_IN_DAY) * 100}%`;
      dayContent.appendChild(quarterLine);
    }
  }

  // Ajouter les gestionnaires pour le drag-and-drop de création
  setupDragAndDrop(dayContent);

  dayTimeline.appendChild(dayContent);

  // Ajouter les événements pour ce jour
  const dayEvents = getEventsForDay(currentDate);

  dayEvents.forEach(event => {
    // Vérifier si l'événement a une heure de début
    if (event.startTime) {
      const startHour = parseInt(event.startTime.split(':')[0]);
      const startMinute = parseInt(event.startTime.split(':')[1]);

      const endHour = event.endTime ? parseInt(event.endTime.split(':')[0]) : startHour + 1;
      const endMinute = event.endTime ? parseInt(event.endTime.split(':')[1]) : 0;

      // Calculer la position et la hauteur en fonction de l'heure (sur 24h)
      const startPosition = ((startHour + startMinute / 60) / HOURS_IN_DAY) * 100;
      const duration = ((endHour - startHour) + (endMinute - startMinute) / 60) / HOURS_IN_DAY * 100;

      // Créer l'élément d'événement
      const eventElement = document.createElement('div');
      eventElement.className = 'day-event';
      eventElement.style.backgroundColor = event.color;
      eventElement.style.top = `${startPosition}%`;
      eventElement.style.height = `${duration}%`;
      eventElement.dataset.eventId = event.id;

      // Contenu de l'événement
      eventElement.innerHTML = `
        <div class="event-time">${formatTime(event.startTime)} ${event.endTime ? '- ' + formatTime(event.endTime) : ''}</div>
        <div class="event-title">${event.title}</div>
        ${event.location ? `<div class="event-location">${event.location}</div>` : ''}
      `;

      // Ajouter les gestionnaires pour le déplacement (mousedown) et l'édition (dblclick)
      eventElement.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Empêcher la propagation pour ne pas déclencher le drag de création
        handleEventMoveStart(e, event);
      });
      eventElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openEventPopup(event);
      });

      dayContent.appendChild(eventElement);
    }
  });
}

// Rendu de la vue agenda
function renderAgendaView() {
  // Mettre à jour le titre de l'agenda
  updateAgendaTitle();

  // Générer la liste d'agenda
  const agendaList = document.getElementById('agenda-list');
  agendaList.innerHTML = '';

  // Obtenir tous les événements du mois en cours
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Créer un objet pour regrouper les événements par date
  const eventsByDate = {};

  // Filtrer les événements pour le mois en cours
  events.forEach(event => {
    const eventDate = new Date(event.date);

    // Vérifier si l'événement est dans le mois actuel
    if (eventDate >= firstDay && eventDate <= lastDay) {
      const dateKey = eventDate.toISOString().split('T')[0];

      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }

      eventsByDate[dateKey].push(event);
    }
  });

  // Trier les dates
  const sortedDates = Object.keys(eventsByDate).sort();

  // Afficher les événements par date
  sortedDates.forEach(dateKey => {
    const date = new Date(dateKey);

    // Créer l'en-tête de date
    const dateHeader = document.createElement('div');
    dateHeader.className = 'agenda-date';
    dateHeader.textContent = formatDate(date);
    agendaList.appendChild(dateHeader);

    // Trier les événements par heure
    const sortedEvents = eventsByDate[dateKey].sort((a, b) => {
      if (!a.startTime) return -1;
      if (!b.startTime) return 1;
      return a.startTime.localeCompare(b.startTime);
    });

    // Afficher les événements
    sortedEvents.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.className = 'agenda-event';

      const eventCategory = document.createElement('div');
      eventCategory.className = 'event-category';
      eventCategory.style.backgroundColor = event.color;

      const eventTime = document.createElement('div');
      eventTime.className = 'event-time';
      eventTime.textContent = event.startTime ? formatTime(event.startTime) : 'Toute la journée';

      const eventContent = document.createElement('div');
      eventContent.className = 'event-content';

      const eventTitle = document.createElement('div');
      eventTitle.className = 'event-title';
      eventTitle.textContent = event.title;

      const eventLocation = document.createElement('div');
      eventLocation.className = 'event-location';
      eventLocation.textContent = event.location || '';

      eventContent.appendChild(eventTitle);
      if (event.location) {
        eventContent.appendChild(eventLocation);
      }

      eventElement.appendChild(eventCategory);
      eventElement.appendChild(eventTime);
      eventElement.appendChild(eventContent);

      // Ajouter un gestionnaire d'événement pour ouvrir le popup (double clic)
      eventElement.addEventListener('dblclick', () => {
        openEventPopup(event);
      });

      agendaList.appendChild(eventElement);
    });
  });

  // Afficher un message si aucun événement
  if (sortedDates.length === 0) {
    const noEvents = document.createElement('div');
    noEvents.className = 'no-events';
    noEvents.textContent = 'Aucun événement ce mois-ci';
    agendaList.appendChild(noEvents);
  }
}

// Configuration du drag-and-drop pour la création d'événements
function setupDragAndDrop(element) {
  console.log("Configuration du drag-and-drop pour", element);

  // Gestionnaire mousedown
  element.addEventListener('mousedown', function(e) {
    // Vérifier si on clique sur un événement existant
    if (e.target.classList.contains('week-event') || e.target.classList.contains('day-event') ||
        e.target.parentElement.classList.contains('week-event') || e.target.parentElement.classList.contains('day-event')) {
      console.log("Clic sur un événement existant, ignoré pour la création");
      return;
    }

    console.log("Début du drag pour création d'événement");
    isDragging = true;
    dragStartElement = this;
    dragStartDate = this.dataset.date;

    // Calculer la position Y initiale
    const rect = this.getBoundingClientRect();
    dragStartY = e.clientY - rect.top;

    // Créer l'élément de sélection
    selectionElement = document.createElement('div');
    selectionElement.className = 'selection-in-progress';

    // Calculer l'heure de début en fonction de la position du clic
    const percentY = dragStartY / rect.height;
    const totalMinutes = Math.floor(percentY * HOURS_IN_DAY * 60);
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;
    const startHour = Math.floor(roundedMinutes / 60);
    const startMinute = roundedMinutes % 60;

    // Positionner l'élément de sélection
    const startPercentY = (startHour + startMinute / 60) / HOURS_IN_DAY;
    selectionElement.style.left = '0';
    selectionElement.style.right = '0';
    selectionElement.style.top = `${startPercentY * 100}%`;
    selectionElement.style.height = '0';

    // Ajouter l'élément de sélection au DOM
    this.appendChild(selectionElement);

    // Ajouter les gestionnaires pour le document entier
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    // Empêcher la sélection de texte pendant le drag
    e.preventDefault();
  });
}

// Gestionnaire pour le déplacement pendant le drag
function handleDragMove(e) {
  if (!isDragging || !selectionElement || !dragStartElement) {
    console.log("Mouvement ignoré: drag non actif ou éléments manquants");
    return;
  }

  console.log("Mouvement pendant le drag");

  // Calculer la position actuelle
  const rect = dragStartElement.getBoundingClientRect();
  dragEndY = e.clientY - rect.top;

  // Limiter à la hauteur de l'élément
  dragEndY = Math.max(0, Math.min(rect.height, dragEndY));

  // Calculer les pourcentages pour le positionnement CSS
  const startPercentY = dragStartY / rect.height;
  const endPercentY = dragEndY / rect.height;

  // Calculer les heures arrondies au quart d'heure
  const startTotalMinutes = Math.floor(startPercentY * HOURS_IN_DAY * 60);
  const startRoundedMinutes = Math.round(startTotalMinutes / 15) * 15;
  const startHour = Math.floor(startRoundedMinutes / 60);
  const startMinute = startRoundedMinutes % 60;

  const endTotalMinutes = Math.floor(endPercentY * HOURS_IN_DAY * 60);
  const endRoundedMinutes = Math.round(endTotalMinutes / 15) * 15;
  const endHour = Math.floor(endRoundedMinutes / 60);
  const endMinute = endRoundedMinutes % 60;

  // Calculer les positions en pourcentage pour le CSS
  const startPosY = (startHour + startMinute / 60) / HOURS_IN_DAY;
  const endPosY = (endHour + endMinute / 60) / HOURS_IN_DAY;

  // Mettre à jour la position et la taille de la sélection
  if (endPosY >= startPosY) {
    // Sélection vers le bas
    selectionElement.style.top = `${startPosY * 100}%`;
    selectionElement.style.height = `${(endPosY - startPosY) * 100}%`;
  } else {
    // Sélection vers le haut
    selectionElement.style.top = `${endPosY * 100}%`;
    selectionElement.style.height = `${(startPosY - endPosY) * 100}%`;
  }
}

// Gestionnaire pour la fin du drag
function handleDragEnd(e) {
  if (!isDragging || !selectionElement || !dragStartElement) {
    console.log("Fin de drag ignorée: drag non actif ou éléments manquants");

    // Nettoyer les gestionnaires
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    return;
  }

  console.log("Fin du drag pour création d'événement");

  // Calculer la position finale
  const rect = dragStartElement.getBoundingClientRect();
  dragEndY = e.clientY - rect.top;

  // Limiter à la hauteur de l'élément
  dragEndY = Math.max(0, Math.min(rect.height, dragEndY));

  // Calculer les pourcentages
  const startPercentY = dragStartY / rect.height;
  const endPercentY = dragEndY / rect.height;

  // Calculer les heures arrondies au quart d'heure
  const startTotalMinutes = Math.floor(startPercentY * HOURS_IN_DAY * 60);
  const startRoundedMinutes = Math.round(startTotalMinutes / 15) * 15;
  const startHour = Math.floor(startRoundedMinutes / 60);
  const startMinute = startRoundedMinutes % 60;

  const endTotalMinutes = Math.floor(endPercentY * HOURS_IN_DAY * 60);
  const endRoundedMinutes = Math.round(endTotalMinutes / 15) * 15;
  const endHour = Math.floor(endRoundedMinutes / 60);
  const endMinute = endRoundedMinutes % 60;

  // Vérifier si on a une sélection valide
  if (dragStartDate) {
    // Assurer que les heures sont dans le bon ordre
    let finalStartHour = startHour;
    let finalStartMinute = startMinute;
    let finalEndHour = endHour;
    let finalEndMinute = endMinute;

    if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
      // Inverser si nécessaire
      finalStartHour = endHour;
      finalStartMinute = endMinute;
      finalEndHour = startHour;
      finalEndMinute = startMinute;
    }

    // Correction : création locale pour éviter le décalage UTC
    const [year, month, day] = dragStartDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, finalStartHour, finalStartMinute, 0, 0);

    // Créer la date de fin
    const endDate = new Date(year, month - 1, day, finalEndHour, finalEndMinute, 0, 0);

    console.log(`Création d'événement de ${finalStartHour}:${finalStartMinute} à ${finalEndHour}:${finalEndMinute}`);

    // Ouvrir le popup avec les dates pré-remplies
    openNewEventPopupWithTimeRange(startDate, endDate);
  }

  // Nettoyer
  if (selectionElement && selectionElement.parentNode) {
    selectionElement.parentNode.removeChild(selectionElement);
  }

  // Supprimer les gestionnaires
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);

  // Réinitialiser les variables
  isDragging = false;
  dragStartElement = null;
  dragStartDate = null;
  dragStartY = null;
  dragEndY = null;
  selectionElement = null;
}

// Gestionnaires pour le déplacement d'événements existants
function handleEventMoveStart(e, event) {
  console.log("Début du déplacement de l'événement", event.id);

  isMovingEvent = true;
  movingEventElement = e.currentTarget;
  originalEventData = event;
  
  // Calculer la position initiale du clic par rapport à l'élément
  const rect = movingEventElement.getBoundingClientRect();
  initialClickY = e.clientY;
  initialClickOffsetY = e.clientY - rect.top; // Offset du clic à l'intérieur de l'événement
  
  hasMovedSignificantly = false;

  // Ajouter les gestionnaires pour le document entier
  document.addEventListener('mousemove', handleEventMove);
  document.addEventListener('mouseup', handleEventMoveEnd);

  // Empêcher la sélection de texte pendant le déplacement
  e.preventDefault();
}

function handleEventMove(e) {
  if (!isMovingEvent || !movingEventElement) return;

  // Vérifier si l'utilisateur a déplacé suffisamment pour considérer comme un drag
  if (!hasMovedSignificantly) {
    const moveDistance = Math.abs(e.clientY - initialClickY);
    if (moveDistance < 5) {
      return; // Ignorer les petits mouvements
    }
    hasMovedSignificantly = true;
    // Ajouter une classe pour indiquer le déplacement
    movingEventElement.classList.add('event-being-moved');
  }

  // Récupérer le conteneur parent
  const container = movingEventElement.parentNode;
  const rect = container.getBoundingClientRect();

  // Calculer la nouvelle position relative en tenant compte de l'offset initial
  // Cela garantit que l'événement reste sous le curseur au même endroit qu'au début du drag
  const newTop = e.clientY - rect.top - initialClickOffsetY;
  const containerHeight = rect.height;
  
  // Convertir en pourcentage de la hauteur du conteneur
  const percentY = Math.max(0, Math.min(1, newTop / containerHeight));
  
  // Calculer la nouvelle heure arrondie au quart d'heure
  const totalMinutes = Math.floor(percentY * HOURS_IN_DAY * 60);
  const roundedMinutes = Math.round(totalMinutes / 15) * 15;
  const newHour = Math.floor(roundedMinutes / 60);
  const newMinute = roundedMinutes % 60;

  // Calculer la nouvelle position en pourcentage
  const newPercentY = (newHour + newMinute / 60) / HOURS_IN_DAY;

  // Mettre à jour la position de l'événement
  movingEventElement.style.top = `${newPercentY * 100}%`;
}

function handleEventMoveEnd(e) {
  if (!isMovingEvent || !movingEventElement || !originalEventData) {
    // Nettoyer
    if (movingEventElement) {
      movingEventElement.classList.remove('event-being-moved');
    }

    // Supprimer les gestionnaires du document
    document.removeEventListener('mousemove', handleEventMove);
    document.removeEventListener('mouseup', handleEventMoveEnd);

    // Réinitialiser les variables
    isMovingEvent = false;
    movingEventElement = null;
    originalEventData = null;
    initialClickY = null;
    initialClickOffsetY = null;
    hasMovedSignificantly = false;
    return;
  }

  // Si l'utilisateur n'a pas déplacé suffisamment, considérer comme un clic (ne rien faire ici, géré par dblclick)
  if (!hasMovedSignificantly) {
    console.log("Déplacement non significatif, considéré comme clic simple (ignoré)");

    // Nettoyer
    movingEventElement.classList.remove('event-being-moved');

    // Supprimer les gestionnaires du document
    document.removeEventListener('mousemove', handleEventMove);
    document.removeEventListener('mouseup', handleEventMoveEnd);

    // Réinitialiser les variables
    isMovingEvent = false;
    movingEventElement = null;
    originalEventData = null;
    initialClickY = null;
    initialClickOffsetY = null;
    hasMovedSignificantly = false;
    return;
  }

  console.log("Fin du déplacement de l'événement", originalEventData.id);

  // Récupérer le conteneur parent
  const container = movingEventElement.parentNode;
  const rect = container.getBoundingClientRect();

  // Calculer la nouvelle position relative en tenant compte de l'offset initial
  const newTop = e.clientY - rect.top - initialClickOffsetY;
  const containerHeight = rect.height;
  
  // Convertir en pourcentage de la hauteur du conteneur
  const percentY = Math.max(0, Math.min(1, newTop / containerHeight));
  
  // Calculer la nouvelle heure arrondie au quart d'heure
  const totalMinutes = Math.floor(percentY * HOURS_IN_DAY * 60);
  const roundedMinutes = Math.round(totalMinutes / 15) * 15;
  const newHour = Math.floor(roundedMinutes / 60);
  const newMinute = roundedMinutes % 60;

  // Calculer la différence d'heures et minutes
  const originalStartHour = parseInt(originalEventData.startTime.split(':')[0]);
  const originalStartMinute = parseInt(originalEventData.startTime.split(':')[1]);

  // Calculer la différence en minutes
  const originalTotalMinutes = originalStartHour * 60 + originalStartMinute;
  const newTotalMinutes = newHour * 60 + newMinute;
  const minuteDiff = newTotalMinutes - originalTotalMinutes;

  // Mettre à jour l'événement
  const eventIndex = events.findIndex(event => event.id === originalEventData.id);
  if (eventIndex !== -1) {
    // Mettre à jour l'heure de début
    const updatedStartMinutes = originalTotalMinutes + minuteDiff;
    const updatedStartHour = Math.floor(updatedStartMinutes / 60);
    const updatedStartMinute = updatedStartMinutes % 60;
    events[eventIndex].startTime = `${updatedStartHour.toString().padStart(2, '0')}:${updatedStartMinute.toString().padStart(2, '0')}`;

    // Mettre à jour l'heure de fin si elle existe
    if (events[eventIndex].endTime) {
      const originalEndHour = parseInt(events[eventIndex].endTime.split(':')[0]);
      const originalEndMinute = parseInt(events[eventIndex].endTime.split(':')[1]);
      const originalEndTotalMinutes = originalEndHour * 60 + originalEndMinute;
      const updatedEndMinutes = originalEndTotalMinutes + minuteDiff;
      const updatedEndHour = Math.floor(updatedEndMinutes / 60);
      const updatedEndMinute = updatedEndMinutes % 60;
      events[eventIndex].endTime = `${updatedEndHour.toString().padStart(2, '0')}:${updatedEndMinute.toString().padStart(2, '0')}`;
    }

    console.log("Événement mis à jour après déplacement", events[eventIndex]);

    // Sauvegarder les événements
    saveEvents();
  }

  // Nettoyer
  movingEventElement.classList.remove('event-being-moved');

  // Supprimer les gestionnaires du document
  document.removeEventListener('mousemove', handleEventMove);
  document.removeEventListener('mouseup', handleEventMoveEnd);

  // Réinitialiser les variables
  isMovingEvent = false;
  movingEventElement = null;
  originalEventData = null;
  initialClickY = null;
  initialClickOffsetY = null;
  hasMovedSignificantly = false;

  // Mettre à jour l'affichage
  renderCurrentView();
}

// Mettre à jour le titre du mois
function updateMonthTitle() {
  const monthYearElement = document.getElementById('current-month-year');
  monthYearElement.textContent = formatMonthYear(currentDate);
}

// Mettre à jour le titre de la semaine
function updateWeekTitle() {
  const weekRangeElement = document.getElementById('current-week-range');
  const firstDayOfWeek = getFirstDayOfWeek(currentDate);
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

  weekRangeElement.textContent = `${firstDayOfWeek.getDate()} - ${lastDayOfWeek.getDate()} ${getMonthName(lastDayOfWeek.getMonth())} ${lastDayOfWeek.getFullYear()}`;
}

// Mettre à jour le titre du jour
function updateDayTitle() {
  const dayElement = document.getElementById('current-day');
  dayElement.textContent = formatDayDate(currentDate);
}

// Mettre à jour le titre de l'agenda
function updateAgendaTitle() {
  const agendaRangeElement = document.getElementById('current-agenda-range');
  agendaRangeElement.textContent = formatMonthYear(currentDate);
}

// Obtenir le premier jour de la semaine (lundi) pour une date donnée
function getFirstDayOfWeek(date) {
  const day = date.getDay(); // 0 (dimanche) à 6 (samedi)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que lundi soit le premier jour
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

// Formater une date au format "Mois AAAA"
function formatMonthYear(date) {
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Formater une date au format "Jour JJ Mois AAAA"
function formatDayDate(date) {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Formater une date au format "JJ Mois AAAA"
function formatDate(date) {
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Formater une heure au format "HH:MM"
function formatTime(timeString) {
  return timeString;
}

// Obtenir le nom du jour de la semaine
function getWeekdayName(day) {
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return dayNames[day];
}

// Obtenir le nom du mois
function getMonthName(month) {
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return monthNames[month];
}

// Obtenir les événements pour un jour spécifique
function getEventsForDay(date) {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getDate() === date.getDate() &&
           eventDate.getMonth() === date.getMonth() &&
           eventDate.getFullYear() === date.getFullYear();
  });
}

// Ouvrir le popup pour un nouvel événement
function openNewEventPopup(date) {
  console.log("Ouverture du popup pour nouvel événement", date);

  const popup = document.getElementById('event-popup');
  const popupOverlay = document.getElementById('event-popup-overlay');
  const popupTitle = document.getElementById('popup-title');
  const form = document.getElementById('event-form');
  const deleteBtn = document.getElementById('delete-event');

  // Configurer le popup pour un nouvel événement
  popupTitle.textContent = 'Ajouter un événement';
  form.reset();
  deleteBtn.style.display = 'none';

  // Pré-remplir la date
  document.getElementById('event-date').value = date.toISOString().split('T')[0];

  // Si une heure est spécifiée, la pré-remplir
  if (date.getHours() !== 0) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    document.getElementById('event-start-time').value = `${hours}:${minutes}`;

    // Calculer l'heure de fin par défaut (1 heure plus tard)
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 1);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    document.getElementById('event-end-time').value = `${endHours}:${endMinutes}`;
  }

  // Réinitialiser les boutons de catégorie
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.backgroundColor = btn.getAttribute('data-color');
  });

  // Stocker l'ID de l'événement (null pour un nouvel événement)
  form.dataset.eventId = '';

  // Afficher le popup
  popupOverlay.style.display = 'block';
  popup.style.display = 'block';
}

// Ouvrir le popup pour un nouvel événement avec une plage horaire
function openNewEventPopupWithTimeRange(startDate, endDate) {
  console.log("Ouverture du popup avec plage horaire", startDate, endDate);

  const popup = document.getElementById('event-popup');
  const popupOverlay = document.getElementById('event-popup-overlay');
  const popupTitle = document.getElementById('popup-title');
  const form = document.getElementById('event-form');
  const deleteBtn = document.getElementById('delete-event');

  // Configurer le popup pour un nouvel événement
  popupTitle.textContent = 'Ajouter un événement';
  form.reset();
  deleteBtn.style.display = 'none';

  // Pré-remplir la date
  document.getElementById('event-date').value = startDate.toISOString().split('T')[0];

  // Pré-remplir les heures de début et de fin
  const startHours = startDate.getHours().toString().padStart(2, '0');
  const startMinutes = startDate.getMinutes().toString().padStart(2, '0');
  document.getElementById('event-start-time').value = `${startHours}:${startMinutes}`;

  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
  document.getElementById('event-end-time').value = `${endHours}:${endMinutes}`;

  // Réinitialiser les boutons de catégorie
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.backgroundColor = btn.getAttribute('data-color');
  });

  // Stocker l'ID de l'événement (null pour un nouvel événement)
  form.dataset.eventId = '';

  // Afficher le popup
  popupOverlay.style.display = 'block';
  popup.style.display = 'block';
}

// Ouvrir le popup pour éditer un événement existant
function openEventPopup(event) {
  console.log("Ouverture du popup pour éditer l'événement", event.id);

  const popup = document.getElementById('event-popup');
  const popupOverlay = document.getElementById('event-popup-overlay');
  const popupTitle = document.getElementById('popup-title');
  const form = document.getElementById('event-form');
  const deleteBtn = document.getElementById('delete-event');

  // Configurer le popup pour éditer un événement
  popupTitle.textContent = 'Modifier l\'événement';
  form.reset();
  deleteBtn.style.display = 'block';

  // Remplir les champs avec les données de l'événement
  document.getElementById('event-title').value = event.title;
  document.getElementById('event-date').value = event.date;
  document.getElementById('event-start-time').value = event.startTime || '';
  document.getElementById('event-end-time').value = event.endTime || '';
  document.getElementById('event-location').value = event.location || '';
  document.getElementById('event-description').value = event.description || '';
  document.getElementById('reminder-time').value = event.reminder || '0';
  document.getElementById('repetition-type').value = event.repetition || 'none';

  // Sélectionner la catégorie
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.backgroundColor = btn.getAttribute('data-color');

    if (btn.getAttribute('data-color') === event.color) {
      btn.classList.add('active');
    }
  });

  // Stocker l'ID de l'événement
  form.dataset.eventId = event.id;

  // Afficher le popup
  popupOverlay.style.display = 'block';
  popup.style.display = 'block';
}

// Fermer le popup d'événement
function closeEventPopup() {
  console.log("Fermeture du popup d'événement");

  const popup = document.getElementById('event-popup');
  const popupOverlay = document.getElementById('event-popup-overlay');

  popup.style.display = 'none';
  popupOverlay.style.display = 'none';
}

// Sauvegarder un événement
function saveEvent() {
  const form = document.getElementById('event-form');
  const eventId = form.dataset.eventId;

  // Récupérer les valeurs du formulaire
  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const startTime = document.getElementById('event-start-time').value;
  const endTime = document.getElementById('event-end-time').value;
  const location = document.getElementById('event-location').value;
  const description = document.getElementById('event-description').value;
  const reminder = document.getElementById('reminder-time').value;
  const repetition = document.getElementById('repetition-type').value;

  // Récupérer la catégorie sélectionnée
  let color = '#2ECC71'; // Couleur par défaut
  const activeCategory = document.querySelector('.category-btn.active');
  if (activeCategory) {
    color = activeCategory.getAttribute('data-color');
  }

  // Créer l'objet événement
  const event = {
    id: eventId || Date.now().toString(), // Utiliser l'ID existant ou en créer un nouveau
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    color,
    reminder,
    repetition
  };

  console.log("Sauvegarde de l'événement", event);

  // Mettre à jour ou ajouter l'événement
  if (eventId) {
    // Mettre à jour un événement existant
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = event;
    }
  } else {
    // Ajouter un nouvel événement
    events.push(event);
  }

  // Sauvegarder les événements
  saveEvents();

  // Fermer le popup
  closeEventPopup();

  // Mettre à jour l'affichage
  renderCurrentView();
}

// Supprimer un événement
function deleteEvent() {
  const form = document.getElementById('event-form');
  const eventId = form.dataset.eventId;

  if (eventId) {
    console.log("Suppression de l'événement", eventId);

    // Filtrer l'événement à supprimer
    events = events.filter(event => event.id !== eventId);

    // Sauvegarder les événements
    saveEvents();

    // Fermer le popup
    closeEventPopup();

    // Mettre à jour l'affichage
    renderCurrentView();
  }
}

// Charger les événements depuis le stockage local
function loadEvents() {
  const savedEvents = localStorage.getItem('calendar-events');
  if (savedEvents) {
    events = JSON.parse(savedEvents);
    console.log("Événements chargés depuis le stockage local", events.length);
  } else {
    // Événements de démonstration
    events = [
      {
        id: '1',
        title: 'Réunion d\'équipe',
        date: '2025-05-19',
        startTime: '10:00',
        endTime: '11:30',
        location: 'Salle de conférence',
        description: 'Réunion hebdomadaire avec l\'équipe',
        color: '#4CAF50',
        reminder: '15',
        repetition: 'weekly'
      },
      {
        id: '2',
        title: 'Déjeuner avec client',
        date: '2025-05-19',
        startTime: '12:30',
        endTime: '14:00',
        location: 'Restaurant Le Gourmet',
        description: 'Discussion projet marketing',
        color: '#2196F3',
        reminder: '30',
        repetition: 'none'
      },
      {
        id: '3',
        title: 'Anniversaire de Marie',
        date: '2025-05-22',
        startTime: '',
        endTime: '',
        location: '',
        description: 'Ne pas oublier le cadeau !',
        color: '#FF9800',
        reminder: '1440',
        repetition: 'yearly'
      }
    ];
    console.log("Événements de démonstration créés", events.length);
    saveEvents();
  }
}

// Sauvegarder les événements dans le stockage local
function saveEvents() {
  localStorage.setItem('calendar-events', JSON.stringify(events));
  console.log("Événements sauvegardés dans le stockage local", events.length);
}
