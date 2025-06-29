import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function RoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [params, setParams]   = useSearchParams();

  // controlled filters
  const [type, setType]       = useState(params.get('type') || '');
  const [minPrice, setMin]    = useState(params.get('min_price') || '');
  const [maxPrice, setMax]    = useState(params.get('max_price') || '');

  useEffect(() => {
    const q = new URLSearchParams();
    if (type)     q.set('type', type);
    if (minPrice) q.set('min_price', minPrice);
    if (maxPrice) q.set('max_price', maxPrice);

    setParams(q);
    fetch(`/api/rooms?${q.toString()}`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || res.status);
        return res.json();
      })
      .then(setRooms)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [type, minPrice, maxPrice, setParams]);

  if (loading) return <p className="p-4">Loading rooms…</p>;
  if (error)   return <p className="p-4 text-red-600">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Rooms</h2>

      <div className="mb-4 flex space-x-2">
        <input
          placeholder="Type"
          value={type}
          onChange={e => setType(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          placeholder="Min price"
          type="number"
          value={minPrice}
          onChange={e => setMin(e.target.value)}
          className="border px-2 py-1 w-24"
        />
        <input
          placeholder="Max price"
          type="number"
          value={maxPrice}
          onChange={e => setMax(e.target.value)}
          className="border px-2 py-1 w-24"
        />
        <button
          onClick={() => { setType(''); setMin(''); setMax(''); }}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Clear
        </button>
      </div>

      <ul className="space-y-2">
        {rooms.map(r => (
          <li key={r.id} className="border p-3 rounded flex justify-between">
            <div>
              <strong>#{r.room_number}</strong> – {r.type} – ${r.price} –{' '}
              <em className={r.status==='available'?'text-green-600':'text-red-600'}>
                {r.status}
              </em>
            </div>
            <div className="space-x-2">
              <Link to={`/rooms/${r.id}`} className="text-blue-600 hover:underline">
                Details
              </Link>
              <Link to={`/book-room/${r.id}`} className="text-green-600 hover:underline">
                Book
              </Link>
            </div>
          </li>
        ))}
        {rooms.length===0 && <li>No rooms match your filters</li>}
      </ul>
    </div>
  );
}
