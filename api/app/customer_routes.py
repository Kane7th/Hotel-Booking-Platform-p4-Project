from flask import Blueprint, request, jsonify
from app.models import Customer, db
from flask_jwt_extended import jwt_required

customer = Blueprint('customer', __name__)

# GET all customers
@customer.route('/customers', methods=['GET'])
@jwt_required()
def get_customers():
    customers = Customer.query.all()
    return jsonify([
        {
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'phone': c.phone
        } for c in customers
    ]), 200

# POST - Create new customer
@customer.route('/customers', methods=['POST'])
@jwt_required()
def create_customer():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')

    if not name or not email or not phone:
        return jsonify({'error': 'All fields are required'}), 400

    if Customer.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    customer = Customer(name=name, email=email, phone=phone)
    db.session.add(customer)
    db.session.commit()

    return jsonify({'message': 'Customer created successfully'}), 201

# PATCH - Update customer
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

# DELETE - Remove customer
@customer.route('/customers/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()

    return jsonify({'message': 'Customer deleted successfully'}), 200
