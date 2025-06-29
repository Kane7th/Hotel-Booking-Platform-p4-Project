import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function RoomFormPage() {
  const { id } = useParams(); // if no id, we’re creating
  const navigate = useNavigate();

  const [form, setForm]   = useState({ room_number:'', type:'', price:'', status:'available' });
  const [error, setError] = useState('');

  // if editing, fetch existing
  useEffect(() => {
    if (!id) return;
    const t = localStorage.getItem('token');
    fetch(`/api/rooms/${id}`, { headers:{ Authorization:`Bearer ${t}` }})
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error||r.status);
        return r.json();
      })
      .then(data => setForm(data))
      .catch(e => setError(e.message));
  }, [id]);

  function handleChange(e) {
    setForm({...form, [e.target.name]: e.target.value});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const t = localStorage.getItem('token');
    const method = id ? 'PATCH' : 'POST';
    const url    = id ? `/api/rooms/${id}` : '/api/rooms';
    try {
      const res = await fetch(url, {
        method,
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${t}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error||res.status);
      navigate('/admin/rooms');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">{id ? 'Edit' : 'New'} Room</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Number:</label>
          <input
            name="room_number"
            value={form.room_number}
            onChange={handleChange}
            className="border px-2 py-1 ml-2"
            required
          />
        </div>
        <div>
          <label>Type:</label>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border px-2 py-1 ml-2"
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="border px-2 py-1 ml-2"
            required
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border px-2 py-1 ml-2"
          >
            <option>available</option>
            <option>booked</option>
            <option>under maintenance</option>
          </select>
        </div>

        <div className="space-x-2">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            {id ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/rooms')}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
