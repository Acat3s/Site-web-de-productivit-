from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    first_name = db.Column(db.String(100), nullable=True)
    last_name = db.Column(db.String(100), nullable=True)
    initials = db.Column(db.String(10), nullable=True)
    auth_provider = db.Column(db.String(50), default='email')  # 'email', 'google', 'apple'
    provider_id = db.Column(db.String(255), nullable=True)  # ID externe pour les providers OAuth
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def __init__(self, email, password_hash=None, first_name=None, last_name=None, 
                 initials=None, auth_provider='email', provider_id=None):
        self.email = email
        self.password_hash = password_hash
        self.first_name = first_name
        self.last_name = last_name
        self.initials = initials or self.generate_initials()
        self.auth_provider = auth_provider
        self.provider_id = provider_id
    
    def generate_initials(self):
        """Générer les initiales à partir de l'email si non fournies"""
        if self.first_name and self.last_name:
            return (self.first_name[0] + self.last_name[0]).upper()
        
        # Utiliser la première lettre de l'email
        return self.email[0].upper()
    
    def set_password(self, password):
        """Définir le mot de passe hashé"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Vérifier le mot de passe"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """Mettre à jour la date de dernière connexion"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self):
        """Convertir l'utilisateur en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'initials': self.initials,
            'auth_provider': self.auth_provider,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        } 