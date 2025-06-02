# Scripts modifiés pour le calendrier

Ce dossier contient les fichiers qui ont été modifiés pour répondre aux demandes suivantes :

1. Suppression du champ "Catégorie" dans le popup "Ajouter un événement"
2. Ajout d'un sélecteur de couleur personnalisable
3. Amélioration esthétique du popup

## Fichiers inclus

- **index.html** : Le fichier HTML principal avec le nouveau popup et le sélecteur de couleur
- **calendrier.js** : Le fichier JavaScript modifié pour gérer la sélection de couleur personnalisée
- **popup.css** : Les nouveaux styles CSS pour le popup amélioré

## Comment utiliser ces fichiers

Pour intégrer ces modifications dans votre projet :

1. Remplacez le fichier `index.html` dans le dossier `/apps/Calender/`
2. Remplacez le fichier `calendrier.js` dans le dossier `/apps/Calender/assets/js/`
3. Vous pouvez soit :
   - Intégrer le contenu de `popup.css` dans votre fichier CSS existant
   - Ou ajouter ce fichier dans `/apps/Calender/assets/css/` et l'inclure via une balise link dans index.html

## Modifications apportées

### Dans index.html
- Suppression du bloc de boutons de catégorie
- Ajout d'un nouveau bloc pour le sélecteur de couleur personnalisable
- Intégration des nouveaux styles CSS directement dans le fichier

### Dans calendrier.js
- Adaptation des fonctions d'ouverture du popup pour initialiser le sélecteur de couleur
- Modification de la fonction de sauvegarde pour utiliser la couleur personnalisée
- Mise à jour de la fonction d'édition pour afficher la couleur existante

### Dans popup.css
- Nouveaux styles pour le sélecteur de couleur
- Amélioration générale de l'apparence du popup
- Optimisation pour différentes tailles d'écran
