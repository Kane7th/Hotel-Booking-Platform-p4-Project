from faker import Faker
from datetime import timedelta, date
from app import create_app, db
from app.models import Customer, Room, Booking, Payment
from random import randint, choice, uniform
from sqlalchemy.exc import IntegrityError

fake = Faker()
app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    print("Seeding customers...")
    customers = []
    for _ in range(10):
        customer = Customer(
            name=fake.name(),
            email=fake.unique.email(),
            phone=fake.phone_number()
        )
        db.session.add(customer)
        customers.append(customer)

    print("Seeding rooms...")
    rooms = []
    for i in range(10):
        room = Room(
            room_number=str(100 + i),
            type=choice(['single', 'double', 'suite']),
            price=round(uniform(50.0, 250.0), 2),
            status="available"
        )
        db.session.add(room)
        rooms.append(room)

    db.session.commit()

    print("Seeding bookings & payments...")
    for i in range(5):
        customer = choice(customers)
        room = choice(rooms)

        check_in = fake.date_between(start_date='-10d', end_date='today')
        check_out = check_in + timedelta(days=randint(1, 5))

        booking = Booking(
            customer_id=customer.id,
            room_id=room.id,
            check_in=check_in,
            check_out=check_out,
            status=choice(['confirmed', 'checked-in', 'cancelled'])
        )
        db.session.add(booking)
        db.session.flush()  # Grab booking.id

        payment = Payment(
            booking_id=booking.id,
            amount=round(room.price * (check_out - check_in).days, 2),
            payment_date=check_in,
            method=choice(['credit card', 'paypal', 'cash'])
        )
        db.session.add(payment)

    try:
        db.session.commit()
        print("✅ Database seeded successfully.")
    except IntegrityError as e:
        db.session.rollback()
        print("❌ Seeding failed due to duplicate or constraint error:", str(e))
