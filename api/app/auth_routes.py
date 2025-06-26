from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from app.models import User, db
from app.utils.auth_helpers import admin_required
from datetime import datetime

auth = Blueprint('auth', __name__)

# REGISTER NEW USER
@auth.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already in use'}), 409

        user = User(username=username, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return jsonify(user.to_dict()), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# LOGIN AND GET JWT TOKEN
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        user.last_login = datetime.utcnow()
        db.session.commit()

        token = create_access_token(identity=str(user.id))  # Identity must be a string
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

# GET USER PROFILE
@auth.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

# LOGOUT USER
@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Successfully logged out'}), 200

# CHANGE PASSWORD
@auth.route('/change-password', methods=['PATCH'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'error': 'Old and new passwords are required'}), 400

    if not user.check_password(old_password):
        return jsonify({'error': 'Old password is incorrect'}), 401

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'}), 200

# WHOAMI ROUTE
@auth.route('/whoami', methods=['GET'])
@jwt_required()
def whoami():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'is_admin': user.is_admin
    }), 200

# PROMOTE TO ADMIN
@auth.route('/admin/promote/<int:user_id>', methods=['PATCH'])
@jwt_required()
@admin_required
def promote_to_admin(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.is_admin:
        return jsonify({'message': f'{user.username} is already an admin'}), 200

    user.is_admin = True
    db.session.commit()

    return jsonify({
        'message': f'{user.username} has been promoted to admin',
        'user': user.to_dict()
    }), 200

# DEMOTE FROM ADMIN
@auth.route('/admin/demote/<int:user_id>', methods=['PATCH'])
@jwt_required()
@admin_required
def demote_from_admin(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if not user.is_admin:
        return jsonify({'message': f'{user.username} is not an admin'}), 200

    user.is_admin = False
    db.session.commit()

    return jsonify({
        'message': f'{user.username} has been demoted from admin',
        'user': user.to_dict()
    }), 200

# TOKEN TEST
@auth.route('/test-token')
@jwt_required()
def test_token():
    return jsonify({"message": "Token is valid"}), 200
