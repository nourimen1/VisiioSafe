import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'votre-cle-secrete-ici'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///visiosafe.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_TOKEN_EXPIRES = 3600  # 1 heure