from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth_helpers import admin_required

admin_test = Blueprint('admin_test', __name__)

@admin_test.route('/admin/ping', methods=['GET'])
@jwt_required()
@admin_required
def admin_ping():
    return jsonify({"message": "Pong! Admin access granted"}), 200
