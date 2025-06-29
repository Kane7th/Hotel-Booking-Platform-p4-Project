import React, { useState, useEffect } from 'react'

export default function BookingsListPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => setBookings(data))
      .catch(err => setError(err.toString()))
      .finally(() => setLoading(false))
  }, [token])

  async function cancel(id) {
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cancel failed')
      setBookings(bs =>
        bs.map(b => (b.id === id ? { ...b, status: 'cancelled' } : b))
      )
    } catch (err) {
      alert(err.message)
    }
  }

  async function pay(id) {
    try {
      const res = await fetch(`/api/bookings/${id}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ method: 'mobile money' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Pay failed')
      alert(data.message)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <p>Loading your bookings…</p>
  if (error)   return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map(b => (
            <li key={b.id} className="border p-3 rounded">
              <p>
                <strong>Booking #{b.id}</strong> — Room {b.room_id},{' '}
                {b.check_in} to {b.check_out}
              </p>
              <p>Status: <em>{b.status}</em></p>
              <div className="mt-2 space-x-2">
                {b.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => cancel(b.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => pay(b.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Pay
                    </button>
                  </>
                )}
                {b.status === 'cancelled' && (
                  <span className="text-gray-600">Cancelled</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
