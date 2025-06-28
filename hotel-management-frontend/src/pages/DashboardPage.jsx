import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.username}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/bookings" className="p-4 bg-white rounded shadow hover:bg-gray-50">
          <h2 className="text-xl font-semibold">My Bookings</h2>
          <p>View and manage your reservations</p>
        </Link>
        {user?.is_admin && (
          <Link to="/admin" className="p-4 bg-white rounded shadow hover:bg-gray-50">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p>Manage system settings</p>
          </Link>
        )}
      </div>
    </div>
  )
}