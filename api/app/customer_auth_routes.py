from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import Customer, db
from app.utils.auth_helpers import admin_required

customer_auth = Blueprint('customer_auth', __name__)

# Register a new customer
@customer_auth.route('/customer/register', methods=['POST'])
def register_customer():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')

    if not name or not email or not phone:
        return jsonify({'error': 'Name, email, and phone are required'}), 400

    if Customer.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    customer = Customer(name=name, email=email, phone=phone)
    db.session.add(customer)
    db.session.commit()

    return jsonify({'message': 'Customer registered successfully', 'customer_id': customer.id}), 201

# Login a customer
@customer_auth.route('/customer/login', methods=['POST'])
def login_customer():
    data = request.get_json()
    email = data.get('email')
    phone = data.get('phone')

    customer = Customer.query.filter_by(email=email, phone=phone).first()
    if not customer:
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(identity=str(customer.id))

    return jsonify({
        'token': token,
        'customer': {
            'id': customer.id,
            'name': customer.name,
            'email': customer.email,
            'phone': customer.phone
        }
    }), 200

# Get customer profile (JWT protected)
@customer_auth.route('/customer/profile', methods=['GET'])
@jwt_required()
def customer_profile():
    try:
        customer_id = int(get_jwt_identity())
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid token'}), 422

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'email': customer.email,
        'phone': customer.phone
    }), 200

# Update customer info using PATCH
@customer_auth.route('/customer/<int:id>', methods=['PATCH'])
@jwt_required()
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    data = request.get_json()

    customer.name = data.get('name', customer.name)
    customer.email = data.get('email', customer.email)
    customer.phone = data.get('phone', customer.phone)

    db.session.commit()
    return jsonify({'message': 'Customer updated successfully'}), 200

# Delete customer
@customer_auth.route('/customer/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    return jsonify({'message': 'Customer deleted successfully'}), 200

# Get all customers
@customer_auth.route('/customers', methods=['GET'])
@jwt_required()
@admin_required
def get_all_customers():
    customers = Customer.query.all()
    return jsonify([
        {
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'phone': c.phone
        } for c in customers
    ]), 200

# Get one customer by ID
@customer_auth.route('/customers/<int:id>', methods=['GET'])
@jwt_required()
def get_customer_by_id(id):
    customer = Customer.query.get_or_404(id)
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'email': customer.email,
        'phone': customer.phone
    }), 200
