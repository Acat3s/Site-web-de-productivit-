# Modifications pour l'application To-Do List (v4)

## 1. Correction de la logique de répétition

### 1.1 Problèmes identifiés
- La répétition peut actuellement dépasser le nombre total (ex: 4/3)
- Les tâches avec répétition passent en vert avant d'atteindre le nombre total

### 1.2 Solutions à implémenter
- Bloquer l'incrémentation du compteur lorsque le nombre total est atteint
- Ne marquer une tâche avec répétition comme terminée (vert) que lorsque le nombre total est atteint
- Maintenir la tâche en état "non terminé" tant que le compteur n'a pas atteint le total

## 2. Statistiques par catégorie

### 2.1 Problème identifié
- Les statistiques "Tâches accomplies" sont actuellement globales

### 2.2 Solution à implémenter
- Séparer les statistiques pour chaque catégorie de todo
- Afficher le taux de complétion indépendamment pour:
  - Todo Quotidienne
  - Todo Hebdomadaire
  - Todo Ponctuel
  - Todo Générale (optionnel, car c'est un récapitulatif)

## 3. Diversification des graphiques

### 3.1 Problème identifié
- Un seul type de graphique est disponible actuellement

### 3.2 Solution à implémenter
- Ajouter une interface pour changer le type de graphique
- Types de graphiques à proposer:
  - Graphique à barres (actuel)
  - Graphique circulaire (camembert)
  - Graphique linéaire
  - Graphique radar (optionnel)
- Permettre de basculer entre les différents types via des boutons ou un sélecteur
