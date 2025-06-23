import React, { useEffect, useState } from 'react';
import API from '../api';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    API.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch((err) => console.error('Error fetching rooms:', err));
  }, []);

  return (
    <div className="p-4">
      <h2>Available Rooms</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <strong>Room {room.room_number}</strong> — {room.type} — ${room.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;
