"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Filter, Bed, DollarSign, Eye, Calendar } from "lucide-react"
import { apiService } from "../services/api"

export default function RoomListPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [type, setType] = useState("")
  const [minPrice, setMin] = useState("")
  const [maxPrice, setMax] = useState("")

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (type) params.type = type
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice

    apiService
      .getRooms(params)
      .then(setRooms)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [type, minPrice, maxPrice])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rooms...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Available Rooms</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and book your perfect room</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Rooms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Price</label>
              <input
                placeholder="$0"
                type="number"
                value={minPrice}
                onChange={(e) => setMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price</label>
              <input
                placeholder="$999"
                type="number"
                value={maxPrice}
                onChange={(e) => setMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setType("")
                  setMin("")
                  setMax("")
                }}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Room List */}
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <Bed className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more results.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Room #{r.room_number}</h3>
                      <span
                        className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          r.status === "available"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="capitalize">{r.type}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-medium">${r.price}/night</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/rooms/${r.id}`}
                      className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Link>

                    {r.status === "available" ? (
                      <Link
                        href={`/book-room/${r.id}`}
                        className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg cursor-not-allowed"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Unavailable
                      </button>
                    )}
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
