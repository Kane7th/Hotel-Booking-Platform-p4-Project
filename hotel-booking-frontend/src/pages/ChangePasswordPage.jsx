import { useState } from 'react'

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ old_password: '', new_password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = e => {
    setError('')
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    if (!form.old_password || !form.new_password) {
      setError('Both fields are required')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      setSuccess(data.message)
      setForm({ old_password: '', new_password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl mb-4">Change Password</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {success && <div className="text-green-600 mb-3">{success}</div>}
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <input
          type="password"
          name="old_password"
          placeholder="Current Password"
          value={form.old_password}
          onChange={onChange}
          className="border p-2 rounded"
        />
        <input
          type="password"
          name="new_password"
          placeholder="New Password"
          value={form.new_password}
          onChange={onChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
        >
          {loading ? 'Updating…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
