import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function BookingPage() {
  const { id } = useParams()            // room ID
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bookingId, setBookingId] = useState(null)

  useEffect(() => {
    fetch(`/api/rooms/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Room not found'))
      .then(setRoom)
      .catch(err => setError(err.toString()))
  }, [id])

  const token = localStorage.getItem('token')

  async function handleBook(e) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!token) {
      setError('You must be logged in to book.')
      return
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: id,
          check_in: checkIn,
          check_out: checkOut,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      setBookingId(data.booking.id)
      setSuccess('Booked! You can now pay below.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handlePay() {
    setError(''); setSuccess('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method: 'mobile money' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      setSuccess(data.message)
      setTimeout(() => navigate('/bookings'), 1500)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error && !room) return <p style={{ color: 'red' }}>{error}</p>
  if (!room) return <p>Loading room…</p>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Book Room {room.room_number}</h2>
      <p>Type: {room.type} · Price: ${room.price}/night</p>

      <form onSubmit={handleBook} className="my-4 space-y-2">
        <div>
          <label>Check‑in:</label>
          <input
            type="date"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            required
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div>
          <label>Check‑out:</label>
          <input
            type="date"
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            required
            className="border px-2 py-1 ml-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          Book Now
        </button>
      </form>

      {bookingId && (
        <button
          onClick={handlePay}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Pay Now
        </button>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  )
}
