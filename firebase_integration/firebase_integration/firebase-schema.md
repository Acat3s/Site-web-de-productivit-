# Schéma de Base de Données Firebase pour ProductivityHub

## Introduction

Ce document présente la conception du schéma de base de données Firebase pour l'application ProductivityHub. La structure proposée utilise Firestore, la base de données NoSQL de Firebase, qui offre une excellente flexibilité, une mise à l'échelle automatique et une intégration parfaite avec Firebase Authentication.

## Structure Générale

Le schéma est organisé autour de collections principales qui séparent les différentes fonctionnalités de l'application tout en maintenant une cohérence globale. La structure prend en compte la sécurité des données, la performance des requêtes et l'évolutivité du système.

## Collections Principales

### 1. Collection `users`

Cette collection stocke les informations des utilisateurs enregistrés.

```
users/{userId}/
  - displayName: string
  - email: string
  - photoURL: string (optionnel)
  - createdAt: timestamp
  - lastLogin: timestamp
  - settings: {
      theme: string ('light' | 'dark')
      language: string ('fr' | 'en' | etc.)
      notifications: boolean
    }
```

### 2. Collection `tasks`

Cette collection stocke toutes les tâches des utilisateurs, organisées par sous-collections pour chaque catégorie.

```
tasks/{userId}/daily/{taskId}/
  - title: string
  - description: string (optionnel)
  - date: timestamp
  - completed: boolean
  - priority: string ('low' | 'medium' | 'high')
  - tags: array<string> (optionnel)
  - repetition: {
      current: number
      total: number
    } (optionnel)
  - createdAt: timestamp
  - updatedAt: timestamp
  - order: number (pour le tri personnalisé)

tasks/{userId}/weekly/{taskId}/
  - (mêmes champs que daily)

tasks/{userId}/punctual/{taskId}/
  - (mêmes champs que daily)
  - dueDate: timestamp (spécifique aux tâches ponctuelles)

tasks/{userId}/general/{taskId}/
  - (mêmes champs que daily)
```

### 3. Collection `statistics`

Cette collection stocke les statistiques d'utilisation et de performance pour chaque utilisateur.

```
statistics/{userId}/
  - dailyCompletion: {
      date: timestamp (jour)
      completed: number
      total: number
      rate: number (pourcentage)
    }[]
  - weeklyCompletion: {
      startDate: timestamp (début de semaine)
      endDate: timestamp (fin de semaine)
      completed: number
      total: number
      rate: number (pourcentage)
    }[]
  - punctualCompletion: {
      month: timestamp (mois)
      completed: number
      total: number
      rate: number (pourcentage)
    }[]
  - generalStats: {
      totalTasksCreated: number
      totalTasksCompleted: number
      averageCompletionRate: number
    }
```

### 4. Collection `videoStorage`

Cette collection gère le stockage des métadonnées des vidéos.

```
videoStorage/{userId}/videos/{videoId}/
  - title: string
  - description: string (optionnel)
  - tags: array<string> (optionnel)
  - category: string (optionnel)
  - uploadDate: timestamp
  - duration: number (en secondes)
  - size: number (en octets)
  - format: string
  - storageRef: string (référence à Firebase Storage)
  - thumbnailRef: string (référence à Firebase Storage pour la miniature)
```

### 5. Collection `planner`

Cette collection gère les événements du planificateur.

```
planner/{userId}/events/{eventId}/
  - title: string
  - description: string (optionnel)
  - startDate: timestamp
  - endDate: timestamp
  - allDay: boolean
  - location: string (optionnel)
  - color: string (code couleur)
  - reminder: timestamp (optionnel)
  - recurrence: {
      type: string ('daily' | 'weekly' | 'monthly' | 'yearly')
      interval: number
      endDate: timestamp (optionnel)
    } (optionnel)
```

### 6. Collection `notes`

Cette collection stocke les notes des utilisateurs.

```
notes/{userId}/items/{noteId}/
  - title: string
  - content: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - color: string (optionnel)
  - tags: array<string> (optionnel)
  - isPinned: boolean
```

## Règles de Sécurité Firestore

Les règles de sécurité suivantes garantissent que les utilisateurs ne peuvent accéder qu'à leurs propres données :

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
    
    // Règles pour la collection planner
    match /planner/{userId}/events/{eventId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour la collection notes
    match /notes/{userId}/items/{noteId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Configuration de Firebase Storage

Pour le stockage des vidéos et des fichiers attachés, Firebase Storage sera configuré avec les règles suivantes :

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Considérations de Performance

1. **Indexation** : Des index composites seront créés pour les requêtes fréquentes, notamment :
   - `tasks/{userId}/daily` sur les champs `date` et `completed`
   - `tasks/{userId}/weekly` sur les champs `date` et `completed`
   - `tasks/{userId}/punctual` sur les champs `dueDate` et `completed`

2. **Pagination** : Pour les collections susceptibles de devenir volumineuses (comme les tâches ou les vidéos), l'implémentation utilisera la pagination pour limiter la taille des requêtes.

3. **Mise en cache** : Les données fréquemment consultées seront mises en cache côté client pour réduire les lectures Firestore.

## Évolutivité

Le schéma est conçu pour évoluer facilement :

1. **Nouvelles fonctionnalités** : De nouvelles collections peuvent être ajoutées sans perturber la structure existante.

2. **Modifications de schéma** : Les documents peuvent être enrichis avec de nouveaux champs sans nécessiter de migration complète.

3. **Intégration avec d'autres services Firebase** : Le schéma est compatible avec Firebase Cloud Functions, Firebase Analytics et d'autres services de l'écosystème Firebase.
