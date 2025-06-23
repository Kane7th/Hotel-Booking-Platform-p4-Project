from . import db
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username
        }
    

class Customer(db.Model):
    __tablename__ = 'customers'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=False)

    bookings = relationship('Booking', back_populates='customer', cascade='all, delete-orphan')


class Room(db.Model):
    __tablename__ = 'rooms'

    id = Column(Integer, primary_key=True)
    room_number = Column(String, nullable=False, unique=True)
    type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default='available')

    bookings = relationship('Booking', back_populates='room', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'room_number': self.room_number,
            'type': self.type,
            'price': self.price,
            'status': self.status
    }

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    status = Column(String, default='confirmed')

    customer = relationship('Customer', back_populates='bookings')
    room = relationship('Room', back_populates='bookings')
    payment = relationship('Payment', back_populates='booking', uselist=False, cascade='all, delete-orphan')


class Payment(db.Model):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey('bookings.id'), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, nullable=False)
    method = Column(String, nullable=False)

    booking = relationship('Booking', back_populates='payment')
