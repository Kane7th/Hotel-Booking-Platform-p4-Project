import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username"
          className="w-full border px-3 py-2" />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password"
          className="w-full border px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 w-full">Login</button>
      </form>
    </div>
  )
}

export default LoginPage
