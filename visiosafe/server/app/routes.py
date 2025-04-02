from flask import Blueprint, jsonify, request, render_template, send_from_directory, current_app
from app.models import User, Environment, Alert
from app.extensions import db
from datetime import datetime, timedelta
import jwt
from functools import wraps
from app.utils import token_required

main = Blueprint('main', __name__)

# Routes HTML
@main.route('/')
def home():
    return render_template('index.html')

@main.route('/payment')
def payment():
    return render_template('payment.html')

@main.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@main.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(current_app.static_folder, path)

# Routes API
@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"status": "error", "message": "Username and password required"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"status": "error", "message": "User already exists"}), 400

    user = User(username=data['username'])
    user.set_password(data['password'])
    db.session.add(user)
    
    default_env = Environment(name="Home", user_id=user.id)
    db.session.add(default_env)
    db.session.commit()

    token = jwt.encode({
        'token': user.token,
        'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_TOKEN_EXPIRES'])
    }, current_app.config['SECRET_KEY'])

    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "username": user.username,
            "environments": [{"id": default_env.id, "name": default_env.name}]
        }
    })

@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"status": "error", "message": "Credentials required"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"status": "error", "message": "Invalid credentials"}), 403

    token = jwt.encode({
        'token': user.token,
        'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_TOKEN_EXPIRES'])
    }, current_app.config['SECRET_KEY'])

    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "username": user.username,
            "environments": [{"id": env.id, "name": env.name} for env in user.environments]
        }
    })

@main.route('/environments', methods=['GET'])
@token_required
def get_environments(current_user):
    envs = Environment.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        "status": "success",
        "data": [{"id": e.id, "name": e.name} for e in envs]
    })

@main.route('/environment', methods=['POST'])
@token_required
def create_environment(current_user):
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"status": "error", "message": "Environment name required"}), 400

    env = Environment(name=data['name'], user_id=current_user.id)
    db.session.add(env)
    db.session.commit()
    return jsonify({"status": "success", "data": {"id": env.id, "name": env.name}})

@main.route('/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    alerts = Alert.query.join(Environment)\
                      .filter(Environment.user_id == current_user.id)\
                      .order_by(Alert.timestamp.desc())\
                      .limit(10).all()
    return jsonify({
        "status": "success",
        "data": [{
            "id": a.id,
            "sensor": a.sensor,
            "timestamp": a.timestamp.isoformat(),
            "environment": a.environment.name
        } for a in alerts]
    })

@main.route('/alert', methods=['POST'])
@token_required
def create_alert(current_user):
    data = request.get_json()
    if not data or not data.get('sensor') or not data.get('environment_id'):
        return jsonify({"status": "error", "message": "Missing alert data"}), 400

    env = Environment.query.filter_by(id=data['environment_id'], user_id=current_user.id).first()
    if not env:
        return jsonify({"status": "error", "message": "Environment not found"}), 404

    alert = Alert(
        environment_id=env.id,
        sensor=data['sensor'],
        status='active'
    )
    db.session.add(alert)
    db.session.commit()
    return jsonify({"status": "success", "data": {"id": alert.id}})

@main.route('/alerts/<int:alert_id>', methods=['PUT'])
@token_required
def update_alert(current_user, alert_id):
    alert = Alert.query.join(Environment)\
                      .filter(Alert.id == alert_id, Environment.user_id == current_user.id)\
                      .first()
    if not alert:
        return jsonify({"status": "error", "message": "Alert not found"}), 404

    data = request.get_json()
    if data.get('status'):
        alert.status = data['status']
        db.session.commit()

    return jsonify({"status": "success"})