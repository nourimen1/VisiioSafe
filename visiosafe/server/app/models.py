from app.extensions import db  # Au lieu de from .. import db
from datetime import datetime
import uuid
from .extensions import db  # Import relatif correct
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    environments = db.relationship('Environment', backref='owner', lazy=True)
    

class User(db.Model):

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Environment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    alerts = db.relationship('Alert', backref='environment', lazy=True)

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    environment_id = db.Column(db.Integer, db.ForeignKey('environment.id'), nullable=False)
    sensor = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')