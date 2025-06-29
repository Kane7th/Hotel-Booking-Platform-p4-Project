from flask import Blueprint, request, jsonify
from app.models import Customer, db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.auth_helpers import admin_required

customer = Blueprint('customer', __name__)

# GET all customers (admin only)
@customer.route('/customers', methods=['GET'])
@jwt_required()
@admin_required
def get_customers():
    customers = Customer.query.all()
    return jsonify([
        {
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'phone': c.phone,
            'user_id': c.user_id
        } for c in customers
    ]), 200

# POST - Create new customer (auto-links to current user)
@customer.route('/customers', methods=['POST'])
@jwt_required()
def create_customer():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')

    if not name or not email or not phone:
        return jsonify({'error': 'All fields are required'}), 400

    if Customer.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    if Customer.query.filter_by(user_id=user_id).first():
        return jsonify({'error': 'Customer already exists for this user'}), 409

    customer = Customer(name=name, email=email, phone=phone, user_id=user_id)
    db.session.add(customer)
    db.session.commit()

    return jsonify({'message': 'Customer created successfully'}), 201

# PATCH - Update customer by ID
@customer.route('/customers/<int:id>', methods=['PATCH'])
@jwt_required()
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    data = request.get_json()

    customer.name = data.get('name', customer.name)
    customer.email = data.get('email', customer.email)
    customer.phone = data.get('phone', customer.phone)

    db.session.commit()
    return jsonify({'message': 'Customer updated successfully'}), 200

# DELETE - Remove customer by ID
@customer.route('/customers/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()

    return jsonify({'message': 'Customer deleted successfully'}), 200

# GET profile of the currently logged-in customer
@customer.route('/customer/profile', methods=['GET'])
@jwt_required()
def get_customer_profile():
    customer_id = int(get_jwt_identity())  

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Customer profile not found'}), 404

    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'email': customer.email,
        'phone': customer.phone
    }), 200