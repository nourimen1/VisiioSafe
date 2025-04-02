from flask import Flask
from app.extensions import db

def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')  # Chemin relatif
    app.config.from_object('config.Config')
    db.init_app(app)
    
    from app.routes import main
    app.register_blueprint(main)
    
    return app