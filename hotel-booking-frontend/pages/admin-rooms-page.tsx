"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"  
import { Plus, Edit, Trash2, Bed } from "lucide-react"

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const router = useRouter()  

  useEffect(() => {
    const t = localStorage.getItem("token")
    fetch("/rooms", {
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json"  },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || res.status)
        return res.json()
      })
      .then(setRooms)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    if (!window.confirm("Delete room?")) return
    setDeleteLoading(id)
    const t = localStorage.getItem("token")
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error((await res.json()).error || res.status)
      setRooms((rs) => rs.filter((r) => r.id !== id))
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Rooms</h1>
            <p className="text-gray-600">Add, edit, and manage hotel rooms</p>
          </div>
          <button
            onClick={() => router.push("/admin/rooms/new")}  
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Room
          </button>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Bed className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">#{r.room_number}</div>
                          <div className="text-sm text-gray-500">ID: {r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{r.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${r.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          r.status === "available"
                            ? "bg-green-100 text-green-800"
                            : r.status === "booked"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/admin/rooms/${r.id}/edit`)}  // Changed from navigate
                        className="flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleteLoading === r.id}
                        className="flex items-center text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleteLoading === r.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <Bed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p>No rooms found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}