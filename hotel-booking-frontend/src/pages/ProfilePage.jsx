import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Not logged in')
      return
    }
    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.error || 'Failed to fetch profile')
        setUser(data)
      }))
      .catch(err => setError(err.message))
  }, [])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!user) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl mb-4">My Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
      <p><strong>Last Login:</strong> {user.last_login || '—'}</p>
    </div>
  )
}
