import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [method, setMethod] = useState('credit card');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handlePay(e) {
    e.preventDefault();
    setError(''); setMessage('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/pay/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      setMessage(data.message);
      // after success, navigate back to bookings
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Pay for Booking #{bookingId}</h2>
      <form onSubmit={handlePay} className="space-y-2">
        <label>
          Method:
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="ml-2 border px-2 py-1"
          >
            <option>credit card</option>
            <option>cash</option>
            <option>mobile money</option>
            <option>paypal</option>
          </select>
        </label>
        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Pay Now
          </button>
          <Link to="/bookings" className="ml-4 text-blue-600 hover:underline">
            ← Back
          </Link>
        </div>
        {message && <p className="text-green-600">{message}</p>}
        {error   && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
