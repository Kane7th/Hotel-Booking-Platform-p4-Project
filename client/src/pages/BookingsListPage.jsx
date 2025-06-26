import React, { useState, useEffect } from "react";

function BookingsListPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setError("");
      })
      .catch(() => setError("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        <ul>
          {bookings.map((b) => (
            <li key={b.id}>
              Room #{b.room_id} from {b.check_in} to {b.check_out} —{" "}
              <strong>{b.status}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookingsListPage;
