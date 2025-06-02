# Scripts modifiés pour l'application Todo List

Ce dossier contient les fichiers qui ont été modifiés pour répondre à la demande suivante :

1. Ajout d'un bouton "Dupliquer les tâches d'hier" qui permet de copier toutes les tâches de la veille vers aujourd'hui en réinitialisant leur statut (les tâches complétées redeviennent incomplètes).

## Fichiers inclus

- **todo.html** : Le fichier HTML principal avec le nouveau bouton de duplication
- **todo.js** : Le fichier JavaScript modifié pour gérer la duplication des tâches
- **todo.css** : Les styles CSS modifiés pour le nouveau bouton

## Comment utiliser ces fichiers

Pour intégrer ces modifications dans votre projet :

1. Remplacez le fichier `todo.html` dans le dossier `/apps/Todo/`
2. Remplacez le fichier `todo.js` dans le dossier `/apps/Todo/assets/js/`
3. Remplacez le fichier `todo.css` dans le dossier `/apps/Todo/assets/css/`

## Modifications apportées

### Dans todo.html
- Ajout du bouton "Dupliquer les tâches d'hier" dans la vue quotidienne

### Dans todo.js
- Ajout de la fonction `duplicateYesterdayTasks()` qui permet de :
  - Récupérer les tâches de la veille
  - Les copier vers la journée actuelle
  - Réinitialiser leur statut (les tâches complétées redeviennent incomplètes)
- Ajout d'un écouteur d'événement pour le nouveau bouton

### Dans todo.css
- Ajout de styles pour le nouveau bouton de duplication
