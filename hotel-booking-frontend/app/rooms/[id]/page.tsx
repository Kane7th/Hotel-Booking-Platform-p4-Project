"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bed, DollarSign, MapPin, Calendar } from "lucide-react"
import { ThemeProvider } from "../../../contexts/theme-context"
import Navbar from "../../../components/navbar"
import { apiService } from "../../../services/api"

export default function RoomDetailPage() {
  const params = useParams()
  const [user, setUser] = useState(null)
  const [room, setRoom] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user
    const token = localStorage.getItem("token")
    if (token) {
      apiService
        .getProfile()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
    }

    // Load room
    if (params.id) {
      apiService
        .getRoomById(params.id as string)
        .then(setRoom)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [params.id])

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar user={user} />
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading room details...</p>
            </div>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar user={user} />
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            </div>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  if (!room) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar user={user} />
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Room not found</p>
            </div>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar user={user} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Room Image */}
            <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center">
              <div className="text-center">
                <div className="h-24 w-24 bg-blue-400 dark:bg-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white dark:text-blue-900">{room.room_number}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Room #{room.room_number}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Type</p>
                      <p className="text-lg text-gray-900 dark:text-white capitalize">{room.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price per Night</p>
                      <p className="text-lg text-gray-900 dark:text-white">${room.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Bed className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</p>
                      <span
                        className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                          room.status === "available"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>
                </div>

                {room.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{room.description}</p>
                  </div>
                )}

                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/rooms"
                  className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Rooms
                </Link>

                {room.status === "available" && (
                  <Link
                    href={`/book-room/${params.id}`}
                    className="flex items-center px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
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
    </ThemeProvider>
  )
}
