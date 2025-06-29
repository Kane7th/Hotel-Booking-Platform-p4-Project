"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, CreditCard, MapPin, Bed, DollarSign, CheckCircle } from "lucide-react"
import { apiService } from "../services/api"

export default function BookingPage() {
  const { id } = useParams()
  const router = useRouter()

  const [room, setRoom] = useState(null)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [bookingId, setBookingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      apiService
        .getRoomById(id)
        .then(setRoom)
        .catch((err) => setError(err.message))
    }
  }, [id])

  const token = localStorage.getItem("token")

  async function handleBook(e) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const token = localStorage.getItem("token")
    if (!token) {
      setError("You must be logged in to book.")
      setLoading(false)
      return
    }

    try {
      const data = await apiService.createBooking({
        room_id: id,
        check_in: checkIn,
        check_out: checkOut,
      })
      setBookingId(data.booking.id)
      setSuccess("Booking confirmed! You can now proceed with payment.")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePay() {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const data = await apiService.payBooking(bookingId.toString(), { method: "mobile money" })
      setSuccess(data.message)
      setTimeout(() => router.push("/bookings"), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading room details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Room Header */}
          <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center">
            <Bed className="h-24 w-24 text-blue-400 dark:text-blue-300" />
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Book Room #{room.room_number}</h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="capitalize">{room.type}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-medium">${room.price}/night</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            {!bookingId ? (
              <form onSubmit={handleBook} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="checkIn"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Check-in Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        id="checkIn"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="checkOut"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Check-out Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        id="checkOut"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Book Now"
                  )}
                </button>
              </form>
            ) : (
              /* Payment Section */
              <div className="text-center">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-600 dark:text-gray-400">Booking ID: #{bookingId}</p>
                </div>

                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
