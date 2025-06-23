from flask import Blueprint, request, jsonify
from app.models import Room, db
from flask_jwt_extended import jwt_required

room = Blueprint('room', __name__)

# GET all rooms
@room.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([room.to_dict() for room in rooms]), 200

# POST new room
@room.route('/rooms', methods=['POST'])
@jwt_required()
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

# Update a room
@room.route('/rooms/<int:id>', methods=['PATCH'])
@jwt_required()
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


# Delete a room
@room.route('/rooms/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_room(id):
    room = Room.query.get(id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    
    db.session.delete(room)
    db.session.commit()
    return jsonify({'message': 'Room deleted successfully'}), 200