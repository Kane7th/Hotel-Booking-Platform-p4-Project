# Hotel Booking System Backend

A Flask-based REST API backend for the hotel booking system with JWT authentication and SQLAlchemy ORM.

## Features

- **User Authentication**: JWT-based authentication with Flask-JWT-Extended
- **Role-Based Access**: Admin and regular user roles
- **Customer Management**: Separate customer registration and login
- **Room Management**: CRUD operations for hotel rooms
- **Booking System**: Create, pay, and cancel bookings
- **Admin Dashboard**: User management and system overview
- **Database**: SQLAlchemy ORM with SQLite (easily configurable for PostgreSQL/MySQL)

## Quick Start

### 1. Setup

\`\`\`bash
# Run the setup script
python setup.py
\`\`\`

### 2. Manual Setup (Alternative)

\`\`\`bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Unix/Linux/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start the server
python app.py
\`\`\`

### 3. Environment Variables

Create a `.env` file with:

\`\`\`env
DATABASE_URL=sqlite:///hotel_booking.db
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
FLASK_ENV=development
FLASK_DEBUG=True
\`\`\`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PATCH /api/change-password` - Change password

### Customer Management
- `POST /api/customer/register` - Register customer
- `POST /api/customer/login` - Customer login
- `GET /api/customer/profile` - Get customer profile
- `PATCH /api/customer/<id>` - Update customer profile

### Room Management
- `GET /api/rooms` - Get all rooms (with filters)
- `GET /api/rooms/<id>` - Get specific room
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/<id>` - Update room (admin only)
- `DELETE /api/rooms/<id>` - Delete room (admin only)

### Booking Management
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/<id>/pay` - Pay for booking
- `PATCH /api/bookings/<id>/cancel` - Cancel booking

### Admin Endpoints
- `GET /api/customers` - Get all users/customers (admin only)
- `GET /api/admin/overview` - Get system overview (admin only)
- `PATCH /api/admin/promote/<id>` - Promote user to admin
- `PATCH /api/admin/demote/<id>` - Demote user from admin

## Database Schema

### Users
- id, username, email, password_hash, is_admin, last_login, created_at

### Customers
- id, name, email, phone, created_at

### Rooms
- id, room_number, type, price, status, description, amenities, created_at

### Bookings
- id, user_id, room_id, check_in, check_out, status, total_amount, payment_method, created_at

## Sample Data

The system comes with pre-populated sample data:

**Admin User:**
- Username: `admin`
- Password: `password123`

**Regular User:**
- Username: `john_doe`
- Password: `password123`

**Sample Rooms:**
- Various room types (single, double, suite)
- Different price ranges
- Sample amenities

## Development

### Adding New Endpoints

1. Define the route in `app.py`
2. Add authentication with `@jwt_required()` if needed
3. Implement business logic
4. Return JSON responses

### Database Migrations

For schema changes:

1. Modify models in `app.py`
2. Drop and recreate database: `python init_db.py`
3. For production, use Flask-Migrate for proper migrations

### Testing

\`\`\`bash
# Install testing dependencies
pip install pytest pytest-flask

# Run tests (when test files are created)
pytest
\`\`\`

## Production Deployment

1. **Environment Variables:**
   - Set `FLASK_ENV=production`
   - Use strong `JWT_SECRET_KEY`
   - Configure production database URL

2. **Database:**
   - Use PostgreSQL or MySQL instead of SQLite
   - Set up proper database backups

3. **Security:**
   - Use HTTPS
   - Configure CORS properly
   - Set up rate limiting
   - Use environment-specific secrets

4. **Deployment Options:**
   - Docker containers
   - Heroku
   - AWS/GCP/Azure
   - Traditional VPS

## CORS Configuration

The backend is configured to accept requests from any origin during development. For production, update the CORS configuration in `app.py`:

```python
CORS(app, origins=['https://yourdomain.com'])
