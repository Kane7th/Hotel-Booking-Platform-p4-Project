from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Payment, Booking, db
from datetime import datetime

payment = Blueprint('payment', __name__)

# -------------------------
# GET all payments
# -------------------------
@payment.route('/payments', methods=['GET'])
@jwt_required()
def get_payments():
    payments = Payment.query.all()
    return jsonify([
        {
            'id': p.id,
            'amount': p.amount,
            'payment_date': p.payment_date.strftime('%Y-%m-%d'),
            'method': p.method,
            'booking_id': p.booking_id
        } for p in payments
    ]), 200

# -------------------------
# GET payments for a specific booking
# -------------------------
@payment.route('/bookings/<int:booking_id>/payments', methods=['GET'])
@jwt_required()
def get_payments_by_booking(booking_id):
    payments = Payment.query.filter_by(booking_id=booking_id).all()
    if not payments:
        return jsonify({'message': 'No payments found for this booking'}), 404

    return jsonify([
        {
            'id': p.id,
            'amount': p.amount,
            'payment_date': p.payment_date.strftime('%Y-%m-%d'),
            'method': p.method,
            'booking_id': p.booking_id
        } for p in payments
    ]), 200

# -------------------------
# CREATE a new payment
# -------------------------
@payment.route('/payments', methods=['POST'])
@jwt_required()
def create_payment():
    data = request.get_json()
    booking_id = data.get('booking_id')
    amount = data.get('amount')
    payment_date = data.get('payment_date')
    method = data.get('method')

    if not booking_id or not amount or not payment_date or not method:
        return jsonify({'error': 'All fields are required'}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    try:
        new_payment = Payment(
            booking_id=booking_id,
            amount=amount,
            payment_date=datetime.strptime(payment_date, '%Y-%m-%d'),
            method=method
        )
        db.session.add(new_payment)
        db.session.commit()
        return jsonify({'message': 'Payment created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------
# UPDATE a payment
# -------------------------
@payment.route('/payments/<int:id>', methods=['PATCH'])
@jwt_required()
def update_payment(id):
    payment = Payment.query.get_or_404(id)
    data = request.get_json()

    if 'amount' in data:
        payment.amount = data['amount']
    if 'payment_date' in data:
        try:
            payment.payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
    if 'method' in data:
        payment.method = data['method']

    db.session.commit()
    return jsonify({'message': 'Payment updated successfully'}), 200

# -------------------------
# DELETE a payment
# -------------------------
@payment.route('/payments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_payment(id):
    payment = Payment.query.get_or_404(id)
    db.session.delete(payment)
    db.session.commit()
    return jsonify({'message': 'Payment deleted successfully'}), 200