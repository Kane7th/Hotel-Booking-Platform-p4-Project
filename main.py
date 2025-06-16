from faker import Faker
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from models.models import Base, Customer, Room, Booking, Payment

engine = create_engine("sqlite:///hotel.db")
fake = Faker()

def seed():
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        # Creates the fake customers
        customers = [
            Customer(name=fake.name(), email=fake.email(), phone=fake.phone_number())
            for _ in range(5)
        ]

        # Creates the fake rooms
        rooms = [
            Room(room_number=str(100 + i), type=fake.random_element(["single", "double", "suite"]),
                 price=round(fake.random_number(digits=3), 2), status="available")
            for i in range(5)
        ]

        session.add_all(customers + rooms)
        session.commit()

        # ability to book rooms
        for i in range(3):
            booking = Booking(
                customer_id=customers[i].customer_id,
                room_id=rooms[i].room_id,
                check_in=date.today(),
                check_out=date.today() + timedelta(days=3),
                status="confirmed"
            )
            session.add(booking)
            session.flush()  # Gets the booking_id

            payment = Payment(
                booking_id=booking.booking_id,
                amount=rooms[i].price * 3,
                payment_date=date.today(),
                method="credit card"
            )
            session.add(payment)

        session.commit()
        print("✅ Seed complete.")

if __name__ == "__main__":
    seed()
