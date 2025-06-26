import React, { useEffect, useState } from 'react';

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/my-bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <h2>🧾 My Bookings</h2>
      {bookings.map(b => (
        <div key={b.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <p><strong>Room:</strong> {b.room.number} ({b.room.type})</p>
          <p><strong>Check-in:</strong> {b.check_in}</p>
          <p><strong>Check-out:</strong> {b.check_out}</p>
          <p><strong>Status:</strong> {b.status}</p>
          <p><strong>Payment:</strong> {b.payment_status} via {b.payment_method || 'N/A'}</p>
        </div>
      ))}
    </div>
  );
}

export default MyBookings;