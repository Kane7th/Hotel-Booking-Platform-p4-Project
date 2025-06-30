# Hotel Booking Platform - Phase 4 Project

## Table of Contents
- [Project Description](#project-description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Project Description

The Hotel Booking Platform is a full-stack web application that allows users to browse, book, and manage hotel room reservations. This project was developed as a Phase 4 capstone project, demonstrating proficiency in full-stack development with React, Flask, and SQLAlchemy.

Key functionalities include:
- User registration and authentication
- Room browsing with filtering capabilities
- Booking management system
- Admin dashboard for property management
- Customer profile management

## Features

### User Features
- **Guest Users**:
  - Browse available rooms
  - View room details and amenities
  - Register as a customer

- **Registered Customers**:
  - Create and manage bookings
  - View booking history
  - Update profile information
  - Cancel bookings (within policy)

- **Admin Users**:
  - Manage all user accounts
  - Add/edit/remove rooms
  - View booking analytics
  - Promote/demote admin privileges

### Technical Features
- JWT-based authentication
- RESTful API design
- Responsive frontend design
- Comprehensive error handling
- Secure password storage
- CORS configuration for development/production

## Technologies Used

### Frontend
- React.js
- React Router
- Axios for API calls
- Bootstrap/React-Bootstrap for UI
- Context API for state management
- Formik/Yup for form validation

### Backend
- Python Flask
- Flask-SQLAlchemy (ORM)
- Flask-JWT-Extended (Authentication)
- Flask-CORS (Cross-Origin Resource Sharing)
- Python-dotenv (Environment variables)

### Database
- SQLite (Development)
- PostgreSQL (Production)

### Deployment
- Render (Backend)
- Vercel/Netlify (Frontend)

## Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- pip (Python package manager)
- npm/yarn (Node package manager)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Kane7th/Hotel-Booking-Platform-p4-Project.git
   cd Hotel-Booking-Platform-p4-Project/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```env
   DATABASE_URL=sqlite:///hotel_booking.db
   JWT_SECRET_KEY=your-secret-key-here
   FLASK_ENV=development
   ```

5. Initialize the database:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Database Initialization
The system comes with sample data that can be loaded by running:
```bash
python app.py
```
This will:
1. Create all database tables
2. Add an admin user (username: `admin`, password: `admin123`)
3. Add sample rooms with various amenities

## API Documentation

The API follows RESTful conventions with JSON responses. All endpoints are prefixed with `/api/`.

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register a new user |
| `/api/login` | POST | User login |
| `/api/profile` | GET | Get current user profile |
| `/api/change-password` | PATCH | Change user password |

### Rooms
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms` | GET | Get all rooms (filterable) |
| `/api/rooms/:id` | GET | Get room details |
| `/api/rooms` | POST | Create new room (admin) |
| `/api/rooms/:id` | PUT | Update room (admin) |
| `/api/rooms/:id` | DELETE | Delete room (admin) |

### Bookings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | GET | Get user bookings |
| `/api/bookings` | POST | Create new booking |
| `/api/bookings/:id/pay` | PATCH | Pay for booking |
| `/api/bookings/:id/cancel` | PATCH | Cancel booking |

### Admin
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/overview` | GET | Get admin dashboard stats |
| `/api/admin/users` | GET | Get all users |
| `/api/admin/users/:id/promote` | PATCH | Promote user to admin |
| `/api/admin/users/:id/demote` | PATCH | Demote admin to user |

## Database Schema

![Database Schema Diagram](database_schema.png)

### Tables
1. **Users**
   - id (PK)
   - username
   - email
   - password_hash
   - is_admin
   - last_login
   - created_at

2. **Customers**
   - id (PK)
   - name
   - email
   - phone
   - created_at

3. **Rooms**
   - id (PK)
   - room_number
   - type
   - price
   - status
   - description
   - amenities
   - created_at

4. **Bookings**
   - id (PK)
   - user_id (FK)
   - room_id (FK)
   - check_in
   - check_out
   - status
   - total_amount
   - payment_method
   - created_at

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. To authenticate:

1. Login via `/api/login` to receive a token
2. Include the token in subsequent requests:
   ```http
   Authorization: Bearer <your-token>
   ```

Tokens expire after 24 hours by default (configurable in `app.py`).

## Testing

### Backend Tests
Run pytest:
```bash
python -m pytest tests/
```

### Frontend Tests
Run React testing:
```bash
cd frontend
npm test
```

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL` (PostgreSQL)
   - `JWT_SECRET_KEY`
   - `FLASK_ENV=production`

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables if needed

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
