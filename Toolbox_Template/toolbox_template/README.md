# Guide d'intégration du modèle Toolbox

Ce document explique comment intégrer et adapter le modèle Toolbox à n'importe quelle application web.

## Table des matières

1. [Introduction](#introduction)
2. [Structure des fichiers](#structure-des-fichiers)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Personnalisation](#personnalisation)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [API de référence](#api-de-référence)
8. [Bonnes pratiques](#bonnes-pratiques)

## Introduction

Le modèle Toolbox est un système modulaire qui permet d'ajouter facilement des fonctionnalités optionnelles à vos applications web. Il offre une interface utilisateur intuitive pour activer/désactiver ces fonctionnalités et permet de sauvegarder les préférences de l'utilisateur.

### Caractéristiques principales

- Interface utilisateur intuitive avec toggles
- Sauvegarde automatique des préférences dans le localStorage
- Support pour l'ajout de GIFs d'illustration
- Entièrement personnalisable et extensible
- Indépendant du framework (fonctionne avec vanilla JS, React, Vue, etc.)

## Structure des fichiers

```
Toolbox/
├── js/
│   └── Toolbox.js       # Classe principale de la Toolbox
├── css/
│   └── Toolbox.css      # Styles pour l'interface de la Toolbox
└── examples/
    ├── index.html       # Exemple d'intégration
    └── config.json      # Exemple de configuration
```

## Installation

### Étape 1 : Copier les fichiers

Copiez les dossiers `js` et `css` dans votre projet.

### Étape 2 : Inclure les fichiers dans votre HTML

```html
<!-- Dans la section head -->
<link rel="stylesheet" href="chemin/vers/Toolbox.css">

<!-- À la fin du body -->
<script src="chemin/vers/Toolbox.js"></script>
```

### Étape 3 : Créer une classe dérivée

Créez une classe qui étend la classe `Toolbox` pour personnaliser son comportement :

```javascript
class MyAppToolbox extends Toolbox {
    constructor() {
        super({
            appName: 'MonApp',
            buttonContainer: '.app-header',
            features: [
                {
                    name: "Ma Fonctionnalité",
                    description: "Description de la fonctionnalité.",
                    enabled: false,
                    gif: ""
                }
                // Ajoutez d'autres fonctionnalités ici
            ]
        });
    }
    
    // Surcharger les méthodes nécessaires
    createFeatureElements() {
        // Créer les éléments DOM pour vos fonctionnalités
    }
    
    resetFeatures() {
        // Réinitialiser l'état des fonctionnalités
    }
    
    applyFeature(featureName) {
        // Appliquer une fonctionnalité spécifique
    }
}
```

### Étape 4 : Initialiser la Toolbox

```javascript
document.addEventListener('DOMContentLoaded', function() {
    window.myAppToolbox = new MyAppToolbox();
});
```

## Configuration

La classe `Toolbox` accepte un objet de configuration avec les propriétés suivantes :

| Propriété | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `appName` | string | Nom de l'application | 'App' |
| `buttonContainer` | string | Sélecteur CSS du conteneur où ajouter le bouton Toolbox | 'body' |
| `storagePrefix` | string | Préfixe pour le stockage local | 'toolbox_' |
| `features` | array | Liste des fonctionnalités disponibles | [] |

### Structure d'une fonctionnalité

Chaque fonctionnalité est un objet avec les propriétés suivantes :

```javascript
{
    name: "Nom de la fonctionnalité",
    description: "Description détaillée de la fonctionnalité.",
    enabled: false, // État initial (activé/désactivé)
    gif: "" // URL ou data URI d'un GIF d'illustration (optionnel)
}
```

## Personnalisation

### Surcharger les méthodes clés

Pour adapter la Toolbox à votre application, vous devez surcharger certaines méthodes :

#### `createFeatureElements()`

Cette méthode est appelée lors de l'initialisation pour créer les éléments DOM nécessaires aux fonctionnalités.

```javascript
createFeatureElements() {
    // Exemple : Créer un bouton pour la fonctionnalité d'export PDF
    const exportButton = document.createElement('button');
    exportButton.id = 'export-pdf-button';
    exportButton.className = 'export-pdf-button toolbox-feature-element';
    exportButton.innerHTML = '<i class="pdf-icon">📄</i> Exporter en PDF';
    exportButton.style.display = 'none'; // Masqué par défaut
    
    // Ajouter le bouton à l'interface
    document.querySelector('.app-content').appendChild(exportButton);
}
```

#### `resetFeatures()`

Cette méthode est appelée avant d'appliquer les fonctionnalités activées pour réinitialiser l'état.

```javascript
resetFeatures() {
    // Masquer tous les éléments de fonctionnalités
    document.querySelectorAll('.toolbox-feature-element').forEach(el => {
        el.style.display = 'none';
    });
}
```

#### `applyFeature(featureName)`

Cette méthode est appelée pour chaque fonctionnalité activée.

```javascript
applyFeature(featureName) {
    switch(featureName) {
        case 'Export PDF':
            // Afficher le bouton d'export PDF
            const exportButton = document.getElementById('export-pdf-button');
            if (exportButton) {
                exportButton.style.display = 'flex';
                
                // Ajouter l'événement pour générer le PDF
                exportButton.addEventListener('click', () => this.generatePDF());
            }
            break;
        
        case 'Autre Fonctionnalité':
            // Logique pour une autre fonctionnalité
            break;
    }
}
```

### Personnaliser l'apparence

Vous pouvez personnaliser l'apparence de la Toolbox en modifiant le fichier CSS ou en ajoutant vos propres styles :

```css
/* Exemple : Personnaliser le bouton Toolbox */
.toolbox-btn {
    background-color: #ff5722;
    border-radius: 20px;
}

/* Exemple : Personnaliser la modale */
.toolbox-modal-content {
    background-color: #f5f5f5;
    border-radius: 10px;
}
```

## Exemples d'utilisation

### Exemple 1 : Fonctionnalité d'export PDF

```javascript
class TodoToolbox extends Toolbox {
    constructor() {
        super({
            appName: 'Todo',
            buttonContainer: '.app-header',
            features: [
                {
                    name: "Export PDF",
                    description: "Permet d'exporter la liste des tâches au format PDF.",
                    enabled: false,
                    gif: ""
                }
            ]
        });
    }
    
    createFeatureElements() {
        const exportButton = document.createElement('button');
        exportButton.id = 'export-pdf-button';
        exportButton.className = 'export-pdf-button toolbox-feature-element';
        exportButton.innerHTML = '<i class="pdf-icon">📄</i> Exporter en PDF';
        exportButton.style.display = 'none';
        
        document.querySelector('.todo-list').insertAdjacentElement('afterend', exportButton);
    }
    
    resetFeatures() {
        document.querySelectorAll('.toolbox-feature-element').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    applyFeature(featureName) {
        if (featureName === 'Export PDF') {
            const exportButton = document.getElementById('export-pdf-button');
            if (exportButton) {
                exportButton.style.display = 'flex';
                exportButton.addEventListener('click', () => this.generatePDF());
            }
        }
    }
    
    generatePDF() {
        // Logique pour générer un PDF
        alert('Génération du PDF en cours...');
    }
}
```

### Exemple 2 : Plusieurs fonctionnalités

```javascript
class CalendarToolbox extends Toolbox {
    constructor() {
        super({
            appName: 'Calendar',
            buttonContainer: '.calendar-header',
            features: [
                {
                    name: "Vue Année",
                    description: "Ajoute une vue annuelle au calendrier.",
                    enabled: false,
                    gif: ""
                },
                {
                    name: "Météo intégrée",
                    description: "Affiche les prévisions météo dans le calendrier.",
                    enabled: false,
                    gif: ""
                }
            ]
        });
    }
    
    // Implémentation des méthodes...
}
```

## API de référence

### Méthodes principales

| Méthode | Description |
|---------|-------------|
| `init()` | Initialise la Toolbox |
| `loadConfig()` | Charge la configuration depuis le localStorage |
| `saveConfig()` | Sauvegarde la configuration dans le localStorage |
| `addToolboxButton()` | Ajoute le bouton Toolbox à l'interface |
| `createModal()` | Crée la modale de la Toolbox |
| `createFeatureElements()` | Crée les éléments DOM pour les fonctionnalités |
| `openModal()` | Ouvre la modale et affiche les fonctionnalités |
| `closeModal()` | Ferme la modale |
| `renderFeaturesList()` | Affiche la liste des fonctionnalités dans la modale |
| `toggleFeature(index, enabled)` | Active ou désactive une fonctionnalité |
| `handleGifUpload(index, file)` | Gère l'upload d'un GIF pour une fonctionnalité |
| `applyEnabledFeatures()` | Applique toutes les fonctionnalités activées |
| `resetFeatures()` | Réinitialise l'état des fonctionnalités |
| `applyFeature(featureName)` | Applique une fonctionnalité spécifique |
| `showNotification(message, type)` | Affiche une notification à l'utilisateur |
| `dispatchEvent(name, detail)` | Déclenche un événement personnalisé |

### Événements

La Toolbox déclenche plusieurs événements que vous pouvez écouter :

```javascript
// Écouter l'événement de changement d'état d'une fonctionnalité
document.addEventListener('toolbox:feature:toggle', function(e) {
    console.log('Fonctionnalité modifiée:', e.detail.feature);
    console.log('Nouvel état:', e.detail.enabled);
});

// Écouter l'événement d'initialisation de la Toolbox
document.addEventListener('toolbox:ready', function(e) {
    console.log('Toolbox initialisée:', e.detail.toolbox);
});
```

## Bonnes pratiques

1. **Séparation des préoccupations** : Gardez la logique de la Toolbox séparée de la logique de votre application.

2. **Nommage cohérent** : Utilisez des noms de fonctionnalités clairs et descriptifs.

3. **Feedback utilisateur** : Fournissez toujours un retour visuel lorsqu'une fonctionnalité est activée ou désactivée.

4. **Performances** : Évitez de créer des éléments DOM inutiles. Préférez masquer/afficher des éléments existants.

5. **Accessibilité** : Assurez-vous que votre Toolbox est accessible aux utilisateurs de technologies d'assistance.

6. **Responsive** : Testez votre Toolbox sur différentes tailles d'écran pour garantir une bonne expérience utilisateur.

7. **Évolutivité** : Concevez votre Toolbox pour qu'elle puisse facilement accueillir de nouvelles fonctionnalités à l'avenir.

---

Pour plus d'informations ou d'assistance, consultez les exemples fournis dans le dossier `examples`.
