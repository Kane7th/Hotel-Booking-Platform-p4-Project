import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RoomList from './pages/RoomList';
import RoomDetail from './pages/RoomDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import Home from './pages/Home';
import { Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Château Hotel Booking</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/bookings">My Bookings</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/book-room/:id" element={<BookingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
