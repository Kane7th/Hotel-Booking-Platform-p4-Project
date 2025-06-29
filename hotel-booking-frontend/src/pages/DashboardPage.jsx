import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filter state
  const [typeFilter, setTypeFilter] = useState('');
  const [minPrice, setMinPrice]     = useState('');
  const [maxPrice, setMaxPrice]     = useState('');

  // build query string
  function buildQuery() {
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    if (minPrice)   params.set('min_price', minPrice);
    if (maxPrice)   params.set('max_price', maxPrice);
    return params.toString() ? `?${params.toString()}` : '';
  }

  // fetch rooms whenever filters change
  useEffect(() => {
    setLoading(true);
    fetch(`/api/rooms${buildQuery()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRooms(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [typeFilter, minPrice, maxPrice]);

  if (loading) return <p>Loading rooms…</p>;
  if (error)   return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Available Rooms</h2>

      <div className="flex gap-4 mb-6">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>

        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          className="border p-2 w-24"
        />

        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          className="border p-2 w-24"
        />

        <button
          onClick={() => { setTypeFilter(''); setMinPrice(''); setMaxPrice(''); }}
          className="bg-gray-200 px-4 rounded"
        >
          Clear Filters
        </button>
      </div>

      {rooms.length === 0 ? (
        <p>No rooms match those filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="border rounded p-4 shadow">
              <h3 className="text-xl">Room #{room.room_number}</h3>
              <p>Type: {room.type}</p>
              <p>Price: ${room.price.toFixed(2)}</p>
              <p>Status: {room.status}</p>
              {room.status === 'available' ? (
                <Link
                  to={`/book-room/${room.id}`}
                  className="mt-2 inline-block bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Book Now
                </Link>
              ) : (
                <span className="mt-2 inline-block text-gray-500">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
