from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Customer(Base):
    __tablename__ = 'customer'

    customer_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=False)

    bookings = relationship('Booking', back_populates='customer')


class Room(Base):
    __tablename__ = 'room'

    room_id = Column(Integer, primary_key=True, autoincrement=True)
    room_number = Column(String, nullable=False, unique=True)
    type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default='available')

    bookings = relationship('Booking', back_populates='room')


class Booking(Base):
    __tablename__ = 'booking'

    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey('customer.customer_id'), nullable=False)
    room_id = Column(Integer, ForeignKey('room.room_id'), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    status = Column(String, default='confirmed')

    customer = relationship('Customer', back_populates='bookings')
    room = relationship('Room', back_populates='bookings')
    payment = relationship('Payment', uselist=False, back_populates='booking')


class Payment(Base):
    __tablename__ = 'payment'

    payment_id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey('booking.booking_id'), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, nullable=False)
    method = Column(String, nullable=False)

    booking = relationship('Booking', back_populates='payment')
