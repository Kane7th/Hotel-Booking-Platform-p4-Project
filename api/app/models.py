from . import db
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

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
