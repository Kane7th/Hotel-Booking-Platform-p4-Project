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
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState("");

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
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to book.");
      setLoading(false);
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

      setBookingId(data.booking.id);
      setSuccess("Room booked successfully! Now you can make a payment.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function payNow(bookingId) {
    const token = localStorage.getItem("token");
    setPaying(true);
    setPaymentSuccess("");

    try {
      const res = await fetch(`/bookings/${bookingId}/pay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method: "mobile money" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      setPaymentSuccess(data.message);
      setTimeout(() => navigate("/bookings"), 2000);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setPaying(false);
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
        <button type="submit" disabled={loading}>
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>

      {bookingId && (
        <button
          style={{ marginTop: "10px" }}
          onClick={() => payNow(bookingId)}
          disabled={paying}
        >
          {paying ? "Processing Payment..." : "Pay Now"}
        </button>
      )}

      {paymentSuccess && <p style={{ color: "green" }}>{paymentSuccess}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default BookingPage;
