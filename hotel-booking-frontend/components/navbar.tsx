"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, User, Home, Calendar, Shield, Bed } from "lucide-react"
import ThemeToggle from "./theme-toggle"

export default function Navbar({ user }) {
  const pathname = usePathname()

  const onLogout = async () => {
    const token = localStorage.getItem("token")
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("customerToken")
      localStorage.removeItem("customerInfo")
      window.location.href = "/"
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400">
              <Home className="h-6 w-6" />
              <span>HotelBooking</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  isActive("/")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>

              <Link
                href="/rooms"
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  isActive("/rooms")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Bed className="h-4 w-4" />
                <span>Rooms</span>
              </Link>

              {user && (
                <>
                  <Link
                    href="/profile"
                    className={`flex items-center space-x-1 transition-colors duration-200 ${
                      isActive("/profile")
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/bookings"
                    className={`flex items-center space-x-1 transition-colors duration-200 ${
                      isActive("/bookings")
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>

                  {user.is_admin && (
                    <Link
                      href="/admin"
                      className={`flex items-center space-x-1 transition-colors duration-200 ${
                        isActive("/admin")
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, <span className="font-medium text-gray-900 dark:text-gray-100">{user.username}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
