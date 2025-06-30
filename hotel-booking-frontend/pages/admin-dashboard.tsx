"use client"

import { useState, useEffect } from "react"
import { Users, Shield, ShieldOff, Calendar, DollarSign, Loader2 } from "lucide-react"
import { apiService } from "../services/api"

type User = {
  id: number
  name?: string
  username?: string
  email: string
  is_admin: boolean
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState({
    stats: true,
    users: true,
    actions: false
  })
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalBookings: 0, 
    totalRevenue: 0 
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true, users: true }))
        setError("")
        
        // Fetch data in parallel
        const [statsData, usersData] = await Promise.all([
          apiService.getAdminOverview(),
          apiService.getCustomers()
        ])
        
        setStats(statsData)
        setUsers(usersData)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setLoading(prev => ({ ...prev, stats: false, users: false }))
      }
    }

    fetchData()
  }, [])

  const toggleAdmin = async (userId: number, makeAdmin: boolean) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }))
      
      if (makeAdmin) {
        await apiService.promoteUser(userId)
      } else {
        await apiService.demoteUser(userId)
      }
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_admin: makeAdmin } : u
        )
      )
    } catch (err) {
      console.error("Toggle admin error:", err)
      setError(err.message || "Failed to update user role")
    } finally {
      setLoading(prev => ({ ...prev, actions: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users and system overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            title="Total Users"
            value={users.length}
            loading={loading.users}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
          />
          
          <StatCard 
            icon={<Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />}
            title="Total Bookings"
            value={stats.totalBookings}
            loading={loading.stats}
            iconBg="bg-green-100 dark:bg-green-900/30"
          />
          
          <StatCard 
            icon={<DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
            title="Total Revenue"
            value={`$${stats.totalRevenue}`}
            loading={loading.stats}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
          />
        </div>

        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              User Management
            </h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            {loading.users ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <UserTable 
                users={users} 
                onToggleAdmin={toggleAdmin} 
                loading={loading.actions}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// StatCard Component
function StatCard({ icon, title, value, loading, iconBg }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`p-2 ${iconBg} rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          {loading ? (
            <Loader2 className="h-6 w-6 mt-1 animate-spin text-gray-400" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// UserTable Component
function UserTable({ users, onToggleAdmin, loading }) {
  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name || user.username}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
              {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.is_admin
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                }`}
              >
                {user.is_admin ? "Admin" : "User"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => onToggleAdmin(user.id, !user.is_admin)}
                disabled={loading}
                className={`flex items-center space-x-1 ${
                  user.is_admin
                    ? "text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    : "text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                }`}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : user.is_admin ? (
                  <>
                    <ShieldOff className="h-4 w-4" />
                    <span>Demote</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Promote</span>
                  </>
                )}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}