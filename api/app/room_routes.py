from flask import Blueprint, request, jsonify
from app.models import Room, db, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.auth_helpers import admin_required

room = Blueprint('room', __name__)

# GET all rooms with filters and role-aware access
@room.route('/rooms', methods=['GET'])
@jwt_required(optional=True)
def get_rooms():
    user_id = get_jwt_identity()
    show_all = False

    if user_id:
        user = User.query.get(int(user_id))
        if user and user.is_admin:
            show_all = True

    room_type = request.args.get('type')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    query = Room.query
    if not show_all:
        query = query.filter_by(status='available')

    if room_type:
        query = query.filter(Room.type.ilike(room_type))
    if min_price is not None:
        query = query.filter(Room.price >= min_price)
    if max_price is not None:
        query = query.filter(Room.price <= max_price)

    rooms = query.all()
    return jsonify([room.to_dict() for room in rooms]), 200

# GET a room by ID
@room.route('/rooms/<int:id>', methods=['GET'])
@jwt_required(optional=True)
def get_room_by_id(id):
    room = Room.query.get(id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    user_id = get_jwt_identity()
    if room.status != 'available':
        if not user_id:
            return jsonify({'error': 'Room not available'}), 403
        user = User.query.get(int(user_id))
        if not user or not user.is_admin:
            return jsonify({'error': 'Room not available'}), 403

    return jsonify(room.to_dict()), 200

# CREATE new room
@room.route('/rooms', methods=['POST'])
@jwt_required()
@admin_required
def create_room():
    data = request.get_json()
    room_number = data.get('room_number', '').strip()
    room_type = data.get('type', '').strip()
    price = data.get('price')

    if not room_number or not room_type or price is None:
        return jsonify({'error': 'All fields are required'}), 400

    try:
        price = float(price)
    except ValueError:
        return jsonify({'error': 'Price must be a number'}), 400

    if Room.query.filter_by(room_number=room_number).first():
        return jsonify({'error': 'Room number already exists'}), 409

    new_room = Room(room_number=room_number, type=room_type, price=price)
    db.session.add(new_room)
    db.session.commit()

    return jsonify({
        'message': 'Room created successfully',
        'room': new_room.to_dict()
    }), 201

# UPDATE room
@room.route('/rooms/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_room(id):
    room = Room.query.get(id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    data = request.get_json()
    room.room_number = data.get('room_number', room.room_number)
    room.type = data.get('type', room.type)
    room.price = data.get('price', room.price)
    room.status = data.get('status', room.status)

    db.session.commit()
    return jsonify({'message': 'Room updated successfully'}), 200

# DELETE room
@room.route('/rooms/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_room(id):
    room = Room.query.get(id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    db.session.delete(room)
    db.session.commit()
    return jsonify({'message': 'Room deleted successfully'}), 200
