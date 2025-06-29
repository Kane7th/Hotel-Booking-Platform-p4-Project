import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem('token');
    fetch('/api/rooms', {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || res.status);
        return res.json();
      })
      .then(setRooms)
      .catch(e => setError(e.message));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete room?')) return;
    const t = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || res.status);
      setRooms(rs => rs.filter(r => r.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Admin: Manage Rooms</h2>
      {error && <p className="text-red-600">{error}</p>}
      <button
        className="mb-4 px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => navigate('/admin/rooms/new')}
      >
        + New Room
      </button>
      <table className="min-w-full border">
        <thead>
          <tr>
            {['#','Number','Type','Price','Status','Actions'].map(h => (
              <th key={h} className="border px-2 py-1">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id}>
              <td className="border px-2 py-1">{r.id}</td>
              <td className="border px-2 py-1">{r.room_number}</td>
              <td className="border px-2 py-1">{r.type}</td>
              <td className="border px-2 py-1">${r.price}</td>
              <td className="border px-2 py-1">{r.status}</td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  onClick={() => navigate(`/admin/rooms/${r.id}/edit`)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {rooms.length===0 && (
            <tr><td colSpan="6" className="p-4 text-center">No rooms</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
