from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Configs
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///hotel.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=9999)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt = JWTManager(app)

    # JWT error handlers
    @jwt.unauthorized_loader
    def handle_missing_token(reason):
        print("🔥 Unauthorized access:", reason)
        return jsonify({"error": "Missing token"}), 401

    @jwt.invalid_token_loader
    def handle_invalid_token(reason):
        print("🔥 Invalid token:", reason)
        return jsonify({"error": "Invalid token"}), 422

    @jwt.expired_token_loader
    def handle_expired_token(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    # Register blueprints
    from .routes import main
    from .auth_routes import auth
    from .booking_routes import booking
    from .room_routes import room
    from .customer_routes import customer 
    from .payment_routes import payment
    from .customer_auth_routes import customer_auth
    from .utils.admin_dashboard import admin_dashboard

    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(booking)
    app.register_blueprint(room)
    app.register_blueprint(customer)
    app.register_blueprint(payment)
    app.register_blueprint(customer_auth)
    app.register_blueprint(admin_dashboard)

    return app
