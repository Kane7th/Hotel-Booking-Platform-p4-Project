from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///hotel_booking.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Error Handlers
@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"Invalid token: {error}")
    return jsonify({'error': 'Invalid token'}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"Missing token: {error}")
    return jsonify({'error': 'Missing token'}), 401


# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat()
        }

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat()
        }

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_number = db.Column(db.String(10), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # single, double, suite
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='available')  # available, booked, maintenance
    description = db.Column(db.Text)
    amenities = db.Column(db.Text)  # JSON string of amenities
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', backref='room', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'room_number': self.room_number,
            'type': self.type,
            'price': self.price,
            'status': self.status,
            'description': self.description,
            'amenities': self.amenities.split(',') if self.amenities else [],
            'created_at': self.created_at.isoformat()
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='confirmed')  # confirmed, paid, cancelled
    total_amount = db.Column(db.Float)
    payment_method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'room_id': self.room_id,
            'check_in': self.check_in.isoformat(),
            'check_out': self.check_out.isoformat(),
            'status': self.status,
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'created_at': self.created_at.isoformat()
        }

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 409
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ('username', 'password')):
            return jsonify({'error': 'Missing username or password'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            access_token = create_access_token(identity=str(user.id))
            return jsonify({
                'token': access_token,
                'user': user.to_dict()
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/change-password', methods=['PATCH'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        data = request.get_json()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.check_password(data['old_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Customer Routes
@app.route('/api/customer/register', methods=['POST'])
def customer_register():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ('name', 'email', 'phone')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if Customer.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        customer = Customer(
            name=data['name'],
            email=data['email'],
            phone=data['phone']
        )
        
        db.session.add(customer)
        db.session.commit()
        
        return jsonify(customer.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customer/login', methods=['POST'])
def customer_login():
    try:
        data = request.get_json()
        
        customer = Customer.query.filter_by(
            email=data['email'],
            phone=data['phone']
        ).first()
        
        if not customer:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=f"customer_{customer.id}")
        
        return jsonify({
            'token': access_token,
            'customer': customer.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customer/profile', methods=['GET'])
@jwt_required()
def get_customer_profile():
    try:
        identity = get_jwt_identity()
        if not identity.startswith('customer_'):
            return jsonify({'error': 'Invalid token'}), 401
        
        customer_id = int(identity.split('_')[1])
        customer = Customer.query.get(customer_id)
        
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        return jsonify(customer.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customer/<int:customer_id>', methods=['PATCH'])
@jwt_required()
def update_customer_profile(customer_id):
    try:
        identity = get_jwt_identity()
        if not identity.startswith('customer_'):
            return jsonify({'error': 'Invalid token'}), 401
        
        token_customer_id = int(identity.split('_')[1])
        if token_customer_id != customer_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        data = request.get_json()
        customer.name = data.get('name', customer.name)
        customer.email = data.get('email', customer.email)
        customer.phone = data.get('phone', customer.phone)
        
        db.session.commit()
        
        return jsonify(customer.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Room Routes
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    try:
        # Get query parameters
        room_type = request.args.get('type', '')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        
        # Build query
        query = Room.query
        
        if room_type:
            query = query.filter(Room.type.ilike(f'%{room_type}%'))
        
        if min_price is not None:
            query = query.filter(Room.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Room.price <= max_price)
        
        rooms = query.all()
        return jsonify([room.to_dict() for room in rooms])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    try:
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'error': 'Room not found'}), 404
        
        return jsonify(room.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rooms', methods=['POST'])
@jwt_required()
def create_room():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        room = Room(
            room_number=data['room_number'],
            type=data['type'],
            price=data['price'],
            description=data.get('description', ''),
            amenities=','.join(data.get('amenities', []))
        )
        
        db.session.add(room)
        db.session.commit()
        
        return jsonify(room.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rooms/<int:room_id>', methods=['PUT'])
@jwt_required()
def update_room(room_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'error': 'Room not found'}), 404
        
        data = request.get_json()
        
        room.room_number = data.get('room_number', room.room_number)
        room.type = data.get('type', room.type)
        room.price = data.get('price', room.price)
        room.status = data.get('status', room.status)
        room.description = data.get('description', room.description)
        room.amenities = ','.join(data.get('amenities', room.amenities.split(',') if room.amenities else []))
        
        db.session.commit()
        
        return jsonify(room.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rooms/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'error': 'Room not found'}), 404
        
        db.session.delete(room)
        db.session.commit()
        
        return jsonify({'message': 'Room deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Booking Routes
@app.route('/api/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    try:
        user_id = get_jwt_identity()
        bookings = Booking.query.filter_by(user_id=user_id).all()
        
        return jsonify([booking.to_dict() for booking in bookings])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate room exists and is available
        room = Room.query.get(data['room_id'])
        if not room:
            return jsonify({'error': 'Room not found'}), 404
        
        if room.status != 'available':
            return jsonify({'error': 'Room is not available'}), 400
        
        # Parse dates
        check_in = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(data['check_out'], '%Y-%m-%d').date()
        
        if check_in >= check_out:
            return jsonify({'error': 'Check-out date must be after check-in date'}), 400
        
        # Check for conflicting bookings
        conflicting_booking = Booking.query.filter(
            Booking.room_id == data['room_id'],
            Booking.status != 'cancelled',
            Booking.check_in < check_out,
            Booking.check_out > check_in
        ).first()
        
        if conflicting_booking:
            return jsonify({'error': 'Room is already booked for the selected dates'}), 400
        
        # Calculate total amount
        nights = (check_out - check_in).days
        total_amount = room.price * nights
        
        # Create booking
        booking = Booking(
            user_id=user_id,
            room_id=data['room_id'],
            check_in=check_in,
            check_out=check_out,
            total_amount=total_amount
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({'booking': booking.to_dict()}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bookings/<int:booking_id>/pay', methods=['PATCH'])
@jwt_required()
def pay_booking(booking_id):
    try:
        user_id = get_jwt_identity()
        booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.status != 'confirmed':
            return jsonify({'error': 'Booking cannot be paid'}), 400
        
        data = request.get_json()
        booking.status = 'paid'
        booking.payment_method = data.get('method', 'unknown')
        
        db.session.commit()
        
        return jsonify({'message': 'Payment successful! Your booking is confirmed.'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bookings/<int:booking_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_booking(booking_id):
    try:
        user_id = get_jwt_identity()
        booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.status == 'cancelled':
            return jsonify({'error': 'Booking is already cancelled'}), 400
        
        booking.status = 'cancelled'
        db.session.commit()
        
        return jsonify({'message': 'Booking cancelled successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Routes
@app.route('/api/customers', methods=['GET'])
@jwt_required()
def get_all_customers():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get all users and customers
        users = User.query.all()
        customers = Customer.query.all()
        
        # Combine and format
        all_users = []
        for u in users:
            user_dict = u.to_dict()
            all_users.append(user_dict)
        
        for c in customers:
            customer_dict = c.to_dict()
            customer_dict['username'] = customer_dict['name']
            customer_dict['is_admin'] = False
            all_users.append(customer_dict)
        
        return jsonify(all_users)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/overview', methods=['GET'])
@jwt_required()
def get_admin_overview():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        total_users = User.query.count() + Customer.query.count()
        total_bookings = Booking.query.count()
        
        # Calculate total revenue from paid bookings
        paid_bookings = Booking.query.filter_by(status='paid').all()
        total_revenue = sum(booking.total_amount or 0 for booking in paid_bookings)
        
        return jsonify({
            'totalUsers': total_users,
            'totalBookings': total_bookings,
            'totalRevenue': round(total_revenue, 2)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/promote/<int:user_id>', methods=['PATCH'])
@jwt_required()
def promote_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        
        if not admin or not admin.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_admin = True
        db.session.commit()
        
        return jsonify({'message': 'User promoted to admin'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/demote/<int:user_id>', methods=['PATCH'])
@jwt_required()
def demote_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = User.query.get(admin_id)
        
        if not admin or not admin.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_admin = False
        db.session.commit()
        
        return jsonify({'message': 'User demoted from admin'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database and create sample data
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@hotel.com',
                is_admin=True
            )
            admin.set_password('password123')
            db.session.add(admin)
        
        # Create sample rooms if not exist
        if not Room.query.first():
            sample_rooms = [
                Room(room_number='101', type='single', price=89.99, description='Cozy single room with city view', amenities='WiFi,TV,Air Conditioning'),
                Room(room_number='102', type='double', price=129.99, description='Spacious double room with queen bed', amenities='WiFi,TV,Air Conditioning,Mini Bar'),
                Room(room_number='103', type='suite', price=249.99, description='Luxury suite with separate living area', amenities='WiFi,TV,Air Conditioning,Mini Bar,Jacuzzi'),
                Room(room_number='201', type='single', price=89.99, description='Single room on second floor', amenities='WiFi,TV,Air Conditioning'),
                Room(room_number='202', type='double', price=129.99, description='Double room with garden view', amenities='WiFi,TV,Air Conditioning,Mini Bar'),
                Room(room_number='203', type='suite', price=299.99, description='Premium suite with balcony', amenities='WiFi,TV,Air Conditioning,Mini Bar,Jacuzzi,Balcony'),
                Room(room_number='301', type='single', price=99.99, status='maintenance', description='Single room currently under maintenance', amenities='WiFi,TV,Air Conditioning'),
                Room(room_number='302', type='double', price=149.99, description='Deluxe double room with ocean view', amenities='WiFi,TV,Air Conditioning,Mini Bar,Ocean View'),
            ]
            
            for room in sample_rooms:
                db.session.add(room)
        
        db.session.commit()
        print("Database initialized with sample data!")

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
