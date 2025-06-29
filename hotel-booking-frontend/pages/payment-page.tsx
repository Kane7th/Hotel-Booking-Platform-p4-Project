"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react"
import { apiService } from "../services/api"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId

  const [method, setMethod] = useState("credit card")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handlePay(e) {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const data = await apiService.payBooking(bookingId as string, { method })
      setMessage(data.message)
      setTimeout(() => router.push("/bookings"), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-white">Payment</h1>
              <p className="text-green-100">Complete your booking payment</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Booking #{bookingId}</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose your preferred payment method</p>
            </div>

            {message && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handlePay} className="space-y-6">
              <div>
                <label htmlFor="method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payment Method
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                >
                  <option value="credit card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="mobile money">Mobile Money</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 px-4 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Pay Now"
                  )}
                </button>

                <Link
                  href="/bookings"
                  className="flex items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
