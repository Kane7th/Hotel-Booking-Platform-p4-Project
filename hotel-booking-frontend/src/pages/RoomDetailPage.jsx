import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/rooms/${id}`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || res.status);
        return res.json();
      })
      .then(setRoom)
      .catch(e => setError(e.message));
  }, [id]);

  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!room) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-2">Room #{room.room_number}</h2>
      <p>Type: {room.type}</p>
      <p>Price: ${room.price}</p>
      <p>Status: <em className={room.status==='available'?'text-green-600':'text-red-600'}>{room.status}</em></p>
      <div className="mt-4 space-x-2">
        <Link to="/rooms" className="text-blue-600 hover:underline">← Back to list</Link>
        {room.status==='available' && (
          <Link to={`/book-room/${id}`} className="px-3 py-1 bg-green-600 text-white rounded">
            Book this room
          </Link>
        )}
      </div>
    </div>
  );
}
