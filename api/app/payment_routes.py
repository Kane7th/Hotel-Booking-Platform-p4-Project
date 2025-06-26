from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Payment, Booking, db
from datetime import date
from app.utils.auth_helpers import admin_required

payment = Blueprint('payment', __name__)

# -------------------------
# USER: Make a Payment for a Booking
# -------------------------
@payment.route('/pay/<int:booking_id>', methods=['POST'])
@jwt_required()
def pay_for_booking(booking_id):
    user_id = int(get_jwt_identity())
    
    booking = Booking.query.get(booking_id)
    if not booking or booking.customer.user_id != user_id:
        return jsonify({"error": "Booking not found or unauthorized"}), 403

    if booking.payment_status == "paid":
        return jsonify({"message": "Booking already paid"}), 200

    data = request.get_json()
    method = data.get('method')

    if not method:
        return jsonify({"error": "Payment method required"}), 400

    # Create payment record
    payment = Payment(
        booking_id=booking.id,
        amount=booking.room.price * (booking.check_out - booking.check_in).days,
        payment_date=date.today(),
        method=method
    )
    booking.payment_status = "paid"
    booking.payment_method = method

    db.session.add(payment)
    db.session.commit()

    return jsonify({"message": "Payment successful!"}), 200

# -------------------------
# ADMIN: Get All Payments
# -------------------------
@payment.route('/payments', methods=['GET'])
@jwt_required()
@admin_required
def get_all_payments():
    payments = Payment.query.all()
    return jsonify([
        {
            'id': p.id,
            'booking_id': p.booking_id,
            'amount': p.amount,
            'payment_date': p.payment_date.strftime('%Y-%m-%d'),
            'method': p.method
        } for p in payments
    ]), 200

# -------------------------
# ADMIN: Get Payments for a Specific Booking
# -------------------------
@payment.route('/bookings/<int:booking_id>/payments', methods=['GET'])
@jwt_required()
@admin_required
def get_booking_payments(booking_id):
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
# ADMIN: Delete a Payment
# -------------------------
@payment.route('/payments/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_payment(id):
    payment = Payment.query.get_or_404(id)
    db.session.delete(payment)
    db.session.commit()
    return jsonify({'message': 'Payment deleted successfully'}), 200
