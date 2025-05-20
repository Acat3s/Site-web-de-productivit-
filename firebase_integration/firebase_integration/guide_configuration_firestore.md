# Guide de Configuration de Firebase Firestore

Ce guide vous explique pas à pas comment configurer Firebase Firestore pour votre projet ProductivityHub et mettre en place les règles de sécurité appropriées.

## 1. Activer Firestore dans votre projet Firebase

1. Connectez-vous à la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet "productivityhub-e7c10"
3. Dans le menu de gauche, cliquez sur "Firestore Database"
4. Cliquez sur "Créer une base de données"
5. Choisissez le mode "Production" pour les règles de sécurité
6. Sélectionnez l'emplacement de la base de données le plus proche de vos utilisateurs (par exemple, "eur3" pour l'Europe)
7. Cliquez sur "Suivant" puis "Activer"

## 2. Mettre à jour votre fichier firebase-config.js

Modifiez votre fichier `firebase-config.js` pour inclure Firestore :

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

## 3. Configurer les règles de sécurité Firestore

1. Dans la console Firebase, allez dans "Firestore Database"
2. Cliquez sur l'onglet "Règles"
3. Remplacez les règles existantes par les suivantes :

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

4. Cliquez sur "Publier"

## 4. Intégrer les fichiers dans votre projet

1. Placez les fichiers de l'archive ZIP dans votre structure de projet :
   - `firebase-db.js` → `frontend/js/firebase-db.js`
   - `todo-firebase.js` → `apps/Todo/js/todo-firebase.js`

2. Assurez-vous que les chemins d'importation sont corrects dans vos fichiers :
   - Dans `todo-firebase.js`, vérifiez que le chemin d'importation de `firebase-db.js` est correct
   - Dans `todo.js`, ajoutez l'importation de `todo-firebase.js`

## 5. Modifier votre fichier todo.js

Suivez les instructions détaillées dans le fichier `integration-guide.md` pour adapter votre fichier `todo.js` afin qu'il utilise Firestore.

## 6. Créer les index Firestore nécessaires

Pour optimiser les performances des requêtes, créez les index composites suivants :

1. Dans la console Firebase, allez dans "Firestore Database" > "Indexes"
2. Cliquez sur "Ajouter un index"
3. Créez les index suivants :

   a. Collection : `tasks/{userId}/daily`
      - Champs : `date` (Ascending), `completed` (Ascending)
      - Portée de la requête : Collection

   b. Collection : `tasks/{userId}/weekly`
      - Champs : `date` (Ascending), `completed` (Ascending)
      - Portée de la requête : Collection

   c. Collection : `tasks/{userId}/punctual`
      - Champs : `dueDate` (Ascending), `completed` (Ascending)
      - Portée de la requête : Collection

4. Cliquez sur "Créer l'index" pour chacun d'eux

## 7. Tester l'intégration

1. Ouvrez votre application dans le navigateur
2. Connectez-vous avec un compte utilisateur
3. Créez quelques tâches et vérifiez qu'elles sont bien synchronisées avec Firebase
   - Vous pouvez vérifier dans la console Firebase > Firestore Database > Data
4. Déconnectez-vous puis reconnectez-vous pour vérifier que les tâches sont bien récupérées
5. Testez la synchronisation entre plusieurs appareils ou navigateurs

## 8. Dépannage

Si vous rencontrez des problèmes :

1. **Erreurs de console** : Vérifiez la console du navigateur pour les messages d'erreur
2. **Problèmes d'importation** : Assurez-vous que tous les chemins d'importation sont corrects
3. **Erreurs d'accès Firestore** : Vérifiez que les règles de sécurité sont correctement configurées
4. **Problèmes de synchronisation** : Vérifiez que l'utilisateur est bien connecté avant d'essayer d'accéder à Firestore

## 9. Activation de Firebase Storage (pour le stockage vidéo)

Si vous souhaitez également configurer Firebase Storage pour le stockage des vidéos :

1. Dans la console Firebase, allez dans "Storage"
2. Cliquez sur "Commencer"
3. Choisissez le mode "Production" pour les règles de sécurité
4. Sélectionnez l'emplacement du bucket (idéalement le même que pour Firestore)
5. Cliquez sur "Suivant" puis "Terminé"
6. Configurez les règles de sécurité suivantes :

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

7. Importez le module Storage dans votre fichier de configuration :

```javascript
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
const storage = getStorage(app);
export { auth, db, storage };
```
