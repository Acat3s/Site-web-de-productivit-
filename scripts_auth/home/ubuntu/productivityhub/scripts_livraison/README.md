# Scripts d'Authentification pour ProductivityHub

Ce dossier contient les scripts nécessaires pour implémenter le système d'authentification sur votre site ProductivityHub.

## Contenu

1. **auth.js** - Script principal pour l'authentification
   - Gestion de l'inscription
   - Gestion de la connexion
   - Gestion de la déconnexion
   - Affichage du bandeau mode invité

2. **auth.css** - Styles pour les éléments d'authentification
   - Modal de connexion/inscription
   - Bandeau mode invité
   - Bouton de connexion et menu utilisateur

3. **auth.py** - Routes backend pour l'authentification
   - Endpoints pour inscription, connexion, déconnexion
   - Vérification de l'état d'authentification

4. **user.py** - Modèle utilisateur pour la base de données
   - Structure de données utilisateur
   - Méthodes de gestion du mot de passe

5. **social_auth.js** - Script pour l'authentification via Google et Apple
   - Intégration des boutons de connexion sociale
   - Gestion des tokens OAuth

6. **social_auth.py** - Routes backend pour l'authentification sociale
   - Endpoints pour Google et Apple
   - Vérification des tokens

## Installation

1. Copiez les fichiers CSS dans votre dossier de styles
2. Copiez les fichiers JS dans votre dossier de scripts
3. Intégrez les fichiers Python dans votre application Flask

## Utilisation

### Frontend

Ajoutez ces lignes dans vos fichiers HTML :

```html
<!-- Dans le head -->
<link rel="stylesheet" href="css/auth.css">

<!-- À la fin du body -->
<script src="js/auth.js"></script>
```

### Backend

Intégrez les routes dans votre application Flask :

```python
from auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')
```

## Personnalisation

- Modifiez les couleurs dans `auth.css` pour correspondre à votre charte graphique
- Ajustez les textes dans `auth.js` selon vos besoins
- Configurez vos identifiants OAuth dans `social_auth.js` et `social_auth.py`
