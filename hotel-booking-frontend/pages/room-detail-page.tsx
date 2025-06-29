"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Bed, DollarSign, MapPin, Calendar } from "lucide-react"

export default function RoomDetailPage() {
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/rooms/${id}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || res.status)
        return res.json()
      })
      .then(setRoom)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Room not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Room Image */}
          <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Bed className="h-24 w-24 text-blue-400" />
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Room #{room.room_number}</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Room Type</p>
                    <p className="text-lg text-gray-900 capitalize">{room.type}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price per Night</p>
                    <p className="text-lg text-gray-900">${room.price}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Availability</p>
                    <span
                      className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                        room.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/rooms"
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Rooms
              </Link>

              {room.status === "available" && (
                <Link
                  to={`/book-room/${id}`}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book This Room
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
