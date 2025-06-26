import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import RoomList from "./pages/RoomList";
import RoomDetail from "./pages/RoomDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookingPage from "./pages/BookingPage";
import BookingsListPage from "./pages/BookingsListPage";
import MyBookings from "./pages/MyBookings";
import Home from "./pages/Home";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/whoami", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setUser(data);
          } else {
            localStorage.removeItem("token");
          }
        });
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <Router>
      <div className="App">
        <h1>Château Hotel Booking</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
          {user && <Link to="/bookings">My Bookings</Link>}
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/rooms" element={<RoomList user={user} />} />
          <Route path="/rooms/:id" element={<RoomDetail user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/bookings" element={<MyBookings user={user} />} />
          <Route path="/rooms/:id/book" element={<BookingPage />} />
          <Route path="/bookings" element={<BookingsListPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
