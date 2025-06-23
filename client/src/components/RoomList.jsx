import React, { useEffect, useState } from 'react';
import { getRooms } from '../api/rooms';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Available Rooms</h2>
      {rooms.length ? (
        <ul>
          {rooms.map(room => (
            <li key={room.id}>
              Room #{room.room_number} - {room.type} - ${room.price} - {room.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No rooms available</p>
      )}
    </div>
  );
};

export default RoomList;
