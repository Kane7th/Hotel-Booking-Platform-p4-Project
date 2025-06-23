from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Booking, Room, db
from datetime import datetime
from app.utils.auth_helpers import admin_required

# Define the booking blueprint
booking = Blueprint('booking', __name__)

# CREATE A NEW BOOKING
@booking.route('/bookings', methods=['POST'])
@jwt_required()

def test_token():
    user_id = get_jwt_identity()
    return jsonify({'msg': f'You are logged in as user {user_id}'}), 200

def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json()

    room_id = data.get('room_id')
    check_in_str = data.get('check_in')
    check_out_str = data.get('check_out')

    # Validate date format
    try:
        check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
        check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Check room
    room = Room.query.get(room_id)
    if not room or room.status != 'available':
        return jsonify({'error': 'Room not available'}), 400

    # Create booking
    new_booking = Booking(
        customer_id=user_id,
        room_id=room_id,
        check_in=check_in,
        check_out=check_out
    )

    # Update room status
    room.status = 'booked'

    db.session.add(new_booking)
    db.session.commit()

    return jsonify({
        'message': 'Booking created successfully',
        'booking': {
            'id': new_booking.id,
            'room_id': new_booking.room_id,
            'check_in': new_booking.check_in.isoformat(),
            'check_out': new_booking.check_out.isoformat(),
            'status': new_booking.status
        }
    }), 201


# GET USER BOOKINGS
@booking.route('/bookings', methods=['GET'])
@jwt_required()
@admin_required
def get_user_bookings():
    user_id = int(get_jwt_identity())
    bookings = Booking.query.filter_by(customer_id=user_id).all()
    
    result = []
    for b in bookings:
        result.append({
            'id': b.id,
            'room_id': b.room_id,
            'check_in': b.check_in.isoformat(),
            'check_out': b.check_out.isoformat(),
            'status': b.status
        })
    
    return jsonify(result), 200

# GET ALL BOOKINGS FOR ADMIN/STAFF
@booking.route('/all_bookings', methods=['GET'])
@jwt_required()
@admin_required
def get_all_bookings():
    bookings = Booking.query.all()

    result = []
    for b in bookings:
        result.append({
            'id': b.id,
            'customer_id': b.customer_id,
            'room_id': b.room_id,
            'check_in': b.check_in.isoformat(),
            'check_out': b.check_out.isoformat(),
            'status': b.status
        })

    return jsonify(result), 200