import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [error, setError]       = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/payments', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || res.status);
        return res.json();
      })
      .then(setPayments)
      .catch((e) => setError(e.message));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this payment?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || res.status);
      setPayments((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">All Payments</h2>
      {error && <p className="text-red-600">{error}</p>}
      <table className="min-w-full border">
        <thead>
          <tr>
            {['ID','Booking#','Amount','Date','Method','Actions'].map((h) => (
              <th key={h} className="border px-2 py-1">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="border px-2 py-1">{p.id}</td>
              <td className="border px-2 py-1">
                <Link to={`/admin/bookings/${p.booking_id}/payments`} className="text-blue-600 hover:underline">
                  {p.booking_id}
                </Link>
              </td>
              <td className="border px-2 py-1">${p.amount.toFixed(2)}</td>
              <td className="border px-2 py-1">{p.payment_date}</td>
              <td className="border px-2 py-1">{p.method}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr><td colSpan="6" className="p-4 text-center">No payments found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
