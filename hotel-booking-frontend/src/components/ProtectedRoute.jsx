import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function ProtectedRoute({ adminOnly = false }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    fetch('/api/whoami', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('token')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading…</p>

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !user.is_admin) {
    // Logged in but not admin
    return <h1 className="text-red-600 p-4">403 — Admins only</h1>
  }

  // Authorized: render nested routes
  return <Outlet />
}
