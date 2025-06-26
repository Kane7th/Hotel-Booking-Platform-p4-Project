import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/rooms/${id}`);
        if (!res.ok) throw new Error('Failed to fetch room details');
        const data = await res.json();
        setRoom(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchRoom();
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!room) return <p>Loading room details...</p>;

  return (
    <div>
      <h2>Room {room.room_number}</h2>
      <p>Type: {room.type}</p>
      <p>Price: £{room.price}</p>
      <p>Status: {room.status}</p>

      {room.status === 'available' ? (
        <button onClick={() => navigate(`/book-room/${room.id}`)}>Book this room</button>
      ) : (
        <p style={{ color: 'gray' }}>This room is not available for booking.</p>
      )}
    </div>
  );
}

export default RoomDetail;
