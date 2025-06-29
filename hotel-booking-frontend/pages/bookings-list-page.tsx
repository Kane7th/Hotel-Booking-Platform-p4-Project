"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, MapPin, CreditCard, X, CheckCircle, Clock } from "lucide-react"
import { apiService } from "../services/api"

export default function BookingsListPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    apiService
      .getBookings()
      .then((data) => setBookings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function cancel(id) {
    setActionLoading(id)
    try {
      const data = await apiService.cancelBooking(id.toString())
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
      const data = await apiService.payBooking(id.toString(), { method: "mobile money" })
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status: "paid" } : b)))
      alert(data.message)
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your room reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings yet</h3>
              <p className="text-gray-600 dark:text-gray-400">You haven't made any room reservations.</p>
              <Link
                href="/rooms"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
              >
                Browse Rooms
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Booking #{b.id}</h3>
                        <span
                          className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            b.status === "confirmed"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : b.status === "cancelled"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                : b.status === "paid"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>Room {b.room_id}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {b.check_in} to {b.check_out}
                          </span>
                        </div>
                        {b.total_amount && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <CreditCard className="h-4 w-4 mr-2" />
                            <span>${b.total_amount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {b.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => pay(b.id)}
                            disabled={actionLoading === b.id}
                            className="flex items-center px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === b.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <CreditCard className="h-4 w-4 mr-2" />
                            )}
                            Pay Now
                          </button>

                          <Link
                            href={`/payment/${b.id}`}
                            className="flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payment Options
                          </Link>

                          <button
                            onClick={() => cancel(b.id)}
                            disabled={actionLoading === b.id}
                            className="flex items-center px-3 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 mr-1" />
                          <span className="text-sm">Cancelled</span>
                        </div>
                      )}

                      {b.status === "paid" && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Paid</span>
                        </div>
                      )}

                      {b.status === "pending" && (
                        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
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
