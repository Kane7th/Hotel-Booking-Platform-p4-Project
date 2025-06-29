"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, CreditCard, X, CheckCircle, Clock } from "lucide-react"

export default function BookingsListPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetch("/api/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Fetch failed")))
      .then((data) => setBookings(data))
      .catch((err) => setError(err.toString()))
      .finally(() => setLoading(false))
  }, [token])

  async function cancel(id) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Cancel failed")
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)))
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function pay(id) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/bookings/${id}/pay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method: "mobile money" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Pay failed")
      alert(data.message)
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your room reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">You haven't made any room reservations.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">Booking #{b.id}</h3>
                        <span
                          className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            b.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : b.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>Room {b.room_id}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {b.check_in} to {b.check_out}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {b.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => pay(b.id)}
                            disabled={actionLoading === b.id}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === b.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <CreditCard className="h-4 w-4 mr-2" />
                            )}
                            Pay
                          </button>
                          <button
                            onClick={() => cancel(b.id)}
                            disabled={actionLoading === b.id}
                            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === b.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Cancel
                          </button>
                        </>
                      )}

                      {b.status === "cancelled" && (
                        <div className="flex items-center text-gray-500">
                          <X className="h-4 w-4 mr-1" />
                          <span className="text-sm">Cancelled</span>
                        </div>
                      )}

                      {b.status === "paid" && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Paid</span>
                        </div>
                      )}

                      {b.status === "pending" && (
                        <div className="flex items-center text-yellow-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
