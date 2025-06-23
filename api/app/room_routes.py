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
