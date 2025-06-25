from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Booking, Room, db
from datetime import datetime
from app.utils.auth_helpers import admin_required

booking = Blueprint('booking', __name__)

# CREATE A NEW BOOKING
@booking.route('/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json()
    room_id = data.get('room_id')
    check_in_str = data.get('check_in')
    check_out_str = data.get('check_out')

    try:
        check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
        check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    room = Room.query.get(room_id)
    if not room or room.status != 'available':
        return jsonify({'error': 'Room not available'}), 400

    new_booking = Booking(
        customer_id=user_id,
        room_id=room_id,
        check_in=check_in,
        check_out=check_out
    )

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
def get_user_bookings():
    user_id = int(get_jwt_identity())
    bookings = Booking.query.filter_by(customer_id=user_id).all()
    return jsonify([
        {
            'id': b.id,
            'room_id': b.room_id,
            'check_in': b.check_in.isoformat(),
            'check_out': b.check_out.isoformat(),
            'status': b.status
        } for b in bookings
    ]), 200


# GET ALL BOOKINGS FOR ADMIN
@booking.route('/all_bookings', methods=['GET'])
@jwt_required()
@admin_required
def get_all_bookings():
    bookings = Booking.query.all()
    return jsonify([
        {
            'id': b.id,
            'customer_id': b.customer_id,
            'room_id': b.room_id,
            'check_in': b.check_in.isoformat(),
            'check_out': b.check_out.isoformat(),
            'status': b.status
        } for b in bookings
    ]), 200


# CANCEL BOOKING
@booking.route('/bookings/<int:booking_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.customer_id != user_id:
        return jsonify({'error': 'Unauthorized: This booking is not yours'}), 403
    if booking.check_in <= datetime.today().date():
        return jsonify({'error': 'Too late to cancel: Check-in has already started or passed'}), 400

    booking.status = 'cancelled'
    if booking.room:
        booking.room.status = 'available'

    db.session.commit()
    return jsonify({'message': 'Booking cancelled successfully'}), 200


# GET BOOKING HISTORY WITH FILTERS
@booking.route('/bookings/history', methods=['GET'])
@jwt_required()
def get_booking_history():
    user_id = int(get_jwt_identity())
    query = Booking.query.join(Room).filter(Booking.customer_id == user_id)

    room_type = request.args.get('type')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    if room_type:
        query = query.filter(Room.type == room_type)

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            query = query.filter(Booking.check_in >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            query = query.filter(Booking.check_out <= end_date)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    bookings = paginated.items

    return jsonify({
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page,
        'bookings': [
            {
                'id': b.id,
                'room_id': b.room_id,
                'room_type': b.room.type,
                'check_in': b.check_in.isoformat(),
                'check_out': b.check_out.isoformat(),
                'status': b.status
            } for b in bookings
        ]
    }), 200


# MAKE PAYMENT FOR A BOOKING
@booking.route('/bookings/<int:booking_id>/pay', methods=['PATCH'])
@jwt_required()
def make_payment(booking_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    method = data.get('method')

    booking = Booking.query.get_or_404(booking_id)

    if booking.customer_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    if booking.status != 'confirmed':
        return jsonify({'error': 'Only confirmed bookings can be paid for'}), 400
    if booking.payment_status == 'paid':
        return jsonify({'message': 'Booking already paid'}), 200

    booking.payment_method = method
    booking.payment_status = 'paid'

    db.session.commit()
    return jsonify({
        'message': 'Payment successful',
        'payment_method': method
    }), 200
