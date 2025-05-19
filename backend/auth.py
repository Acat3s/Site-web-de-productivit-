from flask import Blueprint, request, jsonify, session
from models.user import db, User
from werkzeug.security import generate_password_hash, check_password_hash
import re

auth_bp = Blueprint('auth', __name__)

# Validation d'email
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Validation de mot de passe
def is_valid_password(password):
    # Au moins 8 caractères
    return len(password) >= 8

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    # Validation des données
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email et mot de passe requis'}), 400
    
    if not is_valid_email(email):
        return jsonify({'success': False, 'message': 'Format d\'email invalide'}), 400
    
    if not is_valid_password(password):
        return jsonify({'success': False, 'message': 'Le mot de passe doit contenir au moins 8 caractères'}), 400
    
    # Vérifier si l'utilisateur existe déjà
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Cet email est déjà utilisé'}), 400
    
    # Créer un nouvel utilisateur
    hashed_password = generate_password_hash(password)
    
    # Extraire les initiales de l'email pour l'avatar
    name_part = email.split('@')[0]
    initials = name_part[0].upper()
    
    new_user = User(
        email=email,
        password_hash=hashed_password,
        initials=initials,
        auth_provider='email'
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Connecter l'utilisateur
        session['user_id'] = new_user.id
        
        return jsonify({
            'success': True,
            'message': 'Inscription réussie',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erreur lors de l\'inscription: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    # Validation des données
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email et mot de passe requis'}), 400
    
    # Rechercher l'utilisateur
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'message': 'Email ou mot de passe incorrect'}), 401
    
    # Connecter l'utilisateur
    session['user_id'] = user.id
    user.update_last_login()
    
    return jsonify({
        'success': True,
        'message': 'Connexion réussie',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Déconnecter l'utilisateur
    session.pop('user_id', None)
    
    return jsonify({
        'success': True,
        'message': 'Déconnexion réussie'
    }), 200

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({
            'authenticated': False,
            'user': None
        }), 200
    
    user = User.query.get(user_id)
    
    if not user:
        session.pop('user_id', None)
        return jsonify({
            'authenticated': False,
            'user': None
        }), 200
    
    return jsonify({
        'authenticated': True,
        'user': user.to_dict()
    }), 200 