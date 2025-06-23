from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import datetime
from app.models import Customer, Room, Booking, Payment, User, db
from app.utils.auth_helpers import admin_required

admin_dashboard = Blueprint('admin_dashboard', __name__)

# OVERVIEW STATS
@admin_dashboard.route('/admin/overview', methods=['GET'])
@jwt_required()
@admin_required
def admin_overview():
    total_customers = Customer.query.count()
    total_rooms = Room.query.count()
    total_bookings = Booking.query.count()
    total_payments = Payment.query.count()
    total_revenue = db.session.query(func.coalesce(func.sum(Payment.amount), 0)).scalar()

    return jsonify({
        'total_customers': total_customers,
        'total_rooms': total_rooms,
        'total_bookings': total_bookings,
        'total_payments': total_payments,
        'total_revenue': round(total_revenue, 2)
    }), 200

# METRICS FOR CHARTS
@admin_dashboard.route('/admin/metrics', methods=['GET'])
@jwt_required()
@admin_required
def admin_metrics():
    bookings_by_month = db.session.query(
        func.strftime('%Y-%m', Booking.check_in).label('month'),
        func.count(Booking.id)
    ).group_by('month').all()

    revenue_by_month = db.session.query(
        func.strftime('%Y-%m', Payment.payment_date).label('month'),
        func.sum(Payment.amount)
    ).group_by('month').all()

    return jsonify({
        'monthly_bookings': {month: count for month, count in bookings_by_month},
        'monthly_revenue': {month: float(amount) for month, amount in revenue_by_month}
    }), 200

# ACTIVE USERS