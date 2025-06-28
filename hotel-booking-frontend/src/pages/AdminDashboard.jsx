import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .catch(console.error)

    // Fetch all users from /api/customers or /api/users
    fetch('/api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.error || 'Failed to load users')
        setUsers(data)
      }))
      .catch(err => setError(err.message))
  }, [])

  const toggleAdmin = async (userId, makeAdmin) => {
    const token = localStorage.getItem('token')
    const url = makeAdmin
      ? `/api/admin/promote/${userId}`
      : `/api/admin/demote/${userId}`

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // update local
      setUsers(us =>
        us.map(u =>
          u.id === userId ? { ...u, is_admin: makeAdmin } : u
        )
      )
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl mb-4">Admin: Manage Users</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Admin?</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="border p-2">{u.name || u.username}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.is_admin ? 'Yes' : 'No'}</td>
              <td className="border p-2 space-x-2">
                {u.is_admin ? (
                  <button
                    onClick={() => toggleAdmin(u.id, false)}
                    className="text-sm text-red-600"
                  >
                    Demote
                  </button>
                ) : (
                  <button
                    onClick={() => toggleAdmin(u.id, true)}
                    className="text-sm text-blue-600"
                  >
                    Promote
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
