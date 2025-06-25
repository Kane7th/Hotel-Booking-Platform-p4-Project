import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function BookingPage() {
  const { id } = useParams(); // room ID
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`/rooms/${id}`)
      .then((res) => res.json())
      .then(setRoom)
      .catch(() => setError("Failed to load room details"));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to book.");
      return;
    }

    try {
      const res = await fetch("/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: id,
          check_in: checkIn,
          check_out: checkOut,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setSuccess("Room booked successfully!");
      setTimeout(() => navigate("/bookings"), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!room) return <p>Loading room...</p>;

  return (
    <div>
      <h2>Book Room {room.room_number}</h2>
      <p>Type: {room.type}</p>
      <p>Price: ${room.price}</p>

      <form onSubmit={handleSubmit}>
        <label>Check-in date:</label>
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        <br />
        <label>Check-out date:</label>
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        <br />
        <button type="submit">Book Now</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default BookingPage;
