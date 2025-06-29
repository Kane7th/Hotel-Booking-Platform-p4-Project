from app import app, db, User, Room, Customer, Booking
from datetime import datetime, date

def create_sample_data():
    with app.app_context():
        # Drop all tables and recreate
        db.drop_all()
        db.create_all()
        
        print("Creating sample data...")
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@hotel.com',
            is_admin=True
        )
        admin.set_password('password123')
        db.session.add(admin)
        
        # Create regular user
        user = User(
            username='john_doe',
            email='john@example.com',
            is_admin=False
        )
        user.set_password('password123')
        db.session.add(user)
        
        # Create sample customers
        customers = [
            Customer(name='Alice Johnson', email='alice@example.com', phone='+1-555-0123'),
            Customer(name='Bob Wilson', email='bob@example.com', phone='+1-555-0124'),
            Customer(name='Carol Davis', email='carol@example.com', phone='+1-555-0125'),
        ]
        
        for customer in customers:
            db.session.add(customer)
        
        # Create sample rooms
        rooms = [
            Room(room_number='101', type='single', price=89.99, description='Cozy single room with city view', amenities='WiFi,TV,Air Conditioning'),
            Room(room_number='102', type='double', price=129.99, description='Spacious double room with queen bed', amenities='WiFi,TV,Air Conditioning,Mini Bar'),
            Room(room_number='103', type='suite', price=249.99, description='Luxury suite with separate living area', amenities='WiFi,TV,Air Conditioning,Mini Bar,Jacuzzi'),
            Room(room_number='201', type='single', price=89.99, description='Single room on second floor', amenities='WiFi,TV,Air Conditioning'),
            Room(room_number='202', type='double', price=129.99, description='Double room with garden view', amenities='WiFi,TV,Air Conditioning,Mini Bar'),
            Room(room_number='203', type='suite', price=299.99, description='Premium suite with balcony', amenities='WiFi,TV,Air Conditioning,Mini Bar,Jacuzzi,Balcony'),
            Room(room_number='301', type='single', price=99.99, status='maintenance', description='Single room currently under maintenance', amenities='WiFi,TV,Air Conditioning'),
            Room(room_number='302', type='double', price=149.99, description='Deluxe double room with ocean view', amenities='WiFi,TV,Air Conditioning,Mini Bar,Ocean View'),
        ]
        
        for room in rooms:
            db.session.add(room)
        
        # Commit users and rooms first to get their IDs
        db.session.commit()
        
        # Create sample bookings
        bookings = [
            Booking(
                user_id=user.id,
                room_id=1,
                check_in=date(2024, 2, 1),
                check_out=date(2024, 2, 3),
                status='confirmed',
                total_amount=179.98
            ),
            Booking(
                user_id=user.id,
                room_id=2,
                check_in=date(2024, 2, 15),
                check_out=date(2024, 2, 17),
                status='paid',
                total_amount=259.98,
                payment_method='credit card'
            ),
        ]
        
        for booking in bookings:
            db.session.add(booking)
        
        db.session.commit()
        
        print("Sample data created successfully!")
        print("\nLogin credentials:")
        print("Admin: username='admin', password='password123'")
        print("User: username='john_doe', password='password123'")
        print("\nCustomer login (email + phone):")
        print("Alice: email='alice@example.com', phone='+1-555-0123'")

if __name__ == '__main__':
    create_sample_data()
