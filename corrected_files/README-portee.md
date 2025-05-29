# Rapport de correction : Problème d'affichage des tâches Firestore

## Problème identifié
L'erreur `Uncaught ReferenceError: loadTasksFromFirestore is not defined` indique que la fonction `loadTasksFromFirestore` n'est pas accessible au moment où elle est appelée dans `initializeWithAuthCheck`.

## Cause du problème
Dans le fichier `todo.js` original :
1. La fonction `loadTasksFromFirestore` est définie **après** son utilisation dans `initializeWithAuthCheck`
2. Les deux fonctions sont déclarées à l'intérieur du bloc `DOMContentLoaded`, ce qui limite leur portée
3. Les variables `tasks` sont locales au bloc `DOMContentLoaded`, ce qui les rend inaccessibles aux fonctions externes

## Solution implémentée
J'ai complètement restructuré le code pour résoudre ces problèmes :

1. **Déplacement des fonctions critiques hors du bloc DOMContentLoaded** :
   - `loadTasksFromFirestore`
   - `loadTasksFromLocalStorage`
   - `initializeWithAuthCheck`
   sont maintenant déclarées au niveau global, avant toute utilisation

2. **Utilisation de variables globales via window** :
   - `window.tasks` au lieu de `tasks` local
   - `window.updateAllViews` pour rendre la fonction accessible globalement
   - Toutes les références aux variables de tâches utilisent maintenant `window.tasks`

3. **Initialisation explicite des variables globales** :
   ```javascript
   // Initialisation globale des variables
   window.tasks = {
     daily: [],
     weekly: [],
     punctual: [],
     general: []
   };
   ```

## Résultat attendu
Avec ces modifications :
1. L'erreur `loadTasksFromFirestore is not defined` ne devrait plus apparaître
2. Les tâches créées dans Firestore s'afficheront automatiquement dans l'interface
3. La synchronisation entre Firestore et l'interface fonctionnera correctement

## Comment tester
1. Remplacez votre fichier `apps/Todo/assets/js/todo.js` par la version corrigée
2. Connectez-vous à votre compte
3. Ajoutez une tâche
4. Vérifiez qu'elle apparaît dans l'interface
5. Rafraîchissez la page et vérifiez que la tâche est toujours visible (chargée depuis Firestore)

## Remarques techniques
- Cette solution maintient la compatibilité avec le code existant
- L'utilisation de `window` pour les variables globales est une pratique courante pour résoudre les problèmes de portée
- Les fonctions asynchrones sont maintenant correctement déclarées avant leur utilisation
