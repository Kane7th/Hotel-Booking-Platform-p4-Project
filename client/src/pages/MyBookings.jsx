import React, { useEffect, useState } from 'react';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => setError('Failed to load bookings.'));
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul>
          {bookings.map(b => (
            <li key={b.id}>
              Room #{b.room_id} — {b.check_in} to {b.check_out} — <strong>{b.status}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyBookings;
