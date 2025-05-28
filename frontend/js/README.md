# Correctifs pour la création des sous-collections Firestore

## Problème résolu
Le problème principal était que le fichier `todo-firebase.js` n'était pas importé dans la page HTML, ce qui rendait `TodoFirebaseManager` indisponible pour `todo.js`. Par conséquent, la vérification de connexion échouait systématiquement et l'application basculait en mode invité.

## Fichiers corrigés

### 1. todo.html
- Ajout de l'importation de `todo-firebase.js`
- Ajout de l'importation du script bridge `todo-firebase-bridge.js`
- Réorganisation de l'ordre des scripts pour assurer une initialisation correcte
- Les modules Firebase sont maintenant chargés avant le script principal

### 2. todo-firebase-bridge.js (nouveau fichier)
- Script pour exposer `TodoFirebaseManager` globalement
- Permet aux scripts non-modules d'accéder aux fonctionnalités de `TodoFirebaseManager`

### 3. auth-firestore-sync-test.js (nouveau fichier)
- Script de diagnostic pour vérifier la synchronisation entre authentification et Firestore
- Permet de tester si `TodoFirebaseManager` est correctement disponible
- Vérifie l'état d'authentification et tente de créer la sous-collection tasks

## Comment appliquer les correctifs

1. **Pour todo.html** :
   - Remplacez votre fichier `apps/Todo/todo.html` par la version corrigée

2. **Pour todo-firebase-bridge.js** :
   - Ajoutez ce nouveau fichier dans votre dossier `frontend/js/`

3. **Pour auth-firestore-sync-test.js (optionnel)** :
   - Ajoutez ce script dans votre dossier `frontend/js/` si vous souhaitez diagnostiquer la synchronisation
   - Importez-le dans votre page HTML après les autres scripts pour l'exécuter

## Vérification après correction

1. Ouvrez la console du navigateur (F12)
2. Connectez-vous à votre compte
3. Vérifiez que les messages suivants apparaissent :
   - "TodoFirebaseManager exposé globalement"
   - "Utilisateur connecté: true"
4. Essayez d'ajouter une tâche
5. Vérifiez dans la console Firebase si la sous-collection "tasks" a été créée

Si vous rencontrez encore des problèmes, utilisez le script de diagnostic pour obtenir plus d'informations sur l'état de l'authentification et de Firestore. 