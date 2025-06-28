import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ user }) {
  const navigate = useNavigate()
  const onLogout = () => {
    const token = localStorage.getItem('token')
    fetch('/api/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).finally(() => {
      localStorage.removeItem('token')
      navigate('/login')
    })
  }

  return (
    <nav className="p-4 flex justify-between bg-gray-100">
      <div className="space-x-4">
        <Link to="/">Home</Link>
        {user && <Link to="/profile">Profile</Link>}
      </div>
      <div>
        {user
          ? <button onClick={onLogout} className="text-red-600">Logout</button>
          : <Link to="/login">Login</Link>
        }
      </div>
    </nav>
  )
}
