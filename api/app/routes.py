from flask import Blueprint, jsonify
from .models import Room

main = Blueprint('main', __name__)

@main.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([
        {
            'id': room.id,
            'room_number': room.room_number,
            'type': room.type,
            'price': room.price,
            'status': room.status
        } for room in rooms
    ])

@main.route('/', methods=['GET'])
def index():
    return jsonify(message="API is live 🎯")
