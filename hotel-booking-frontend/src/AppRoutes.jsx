import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute }        from './components/ProtectedRoute';

// Auth
import LoginPage                 from './pages/LoginPage';
import RegisterPage              from './pages/RegisterPage';
// Customer auth
import CustomerRegisterPage      from './pages/CustomerRegisterPage';
import CustomerLoginPage         from './pages/CustomerLoginPage';

// User pages
import DashboardPage             from './pages/DashboardPage';
import RoomListPage              from './pages/RoomListPage';
import RoomDetailPage            from './pages/RoomDetailPage';
import BookingPage               from './pages/BookingPage';
import PaymentPage               from './pages/PaymentPage';
import BookingsListPage          from './pages/BookingsListPage';
import ProfilePage               from './pages/ProfilePage';
import ChangePasswordPage        from './pages/ChangePasswordPage';
import CustomerProfilePage       from './pages/CustomerProfilePage';

// Admin pages
import AdminDashboard            from './pages/AdminDashboard';
import AdminCustomersPage        from './pages/AdminCustomersPage';
import AdminCustomerDetailPage   from './pages/AdminCustomerDetailPage';
import AdminPaymentsPage         from './pages/AdminPaymentsPage';
import AdminBookingPaymentsPage  from './pages/AdminBookingPaymentsPage';
import AdminRoomsPage            from './pages/AdminRoomsPage';
import RoomFormPage              from './pages/RoomFormPage';
import Navbar                    from './components/Navbar';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Navbar */}
      <Route path="/navbar" element={<Navbar />} />

      {/* Public routes */}
      <Route path="/login"                element={<LoginPage />} />
      <Route path="/register"             element={<RegisterPage />} />

      {/* Customer‑only auth routes */}
      <Route path="/customer/register"    element={<CustomerRegisterPage />} />
      <Route path="/customer/login"       element={<CustomerLoginPage />} />

      {/* Protected: any logged‑in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/"                   element={<Navigate to="/rooms" replace />} />
        <Route path="/dashboard"          element={<DashboardPage />} />
        <Route path="/rooms"              element={<RoomListPage />} />
        <Route path="/rooms/:id"          element={<RoomDetailPage />} />
        <Route path="/book-room/:id"      element={<BookingPage />} />
        <Route path="/book-room/:id/pay"  element={<PaymentPage />} />
        <Route path="/bookings"           element={<BookingsListPage />} />
        <Route path="/profile"            element={<ProfilePage />} />
        <Route path="/change-password"    element={<ChangePasswordPage />} />

        {/* Customer profile management */}
        <Route path="/customer/profile"   element={<CustomerProfilePage />} />
      </Route>

      {/* Admin‑only */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin/register"                element={<RegisterPage />} />
        <Route path="/admin/login"                 element={<LoginPage />} />
        <Route path="/admin"                       element={<AdminDashboard />} />
        <Route path="/admin/customers"             element={<AdminCustomersPage />} />
        <Route path="/admin/customers/:id"         element={<AdminCustomerDetailPage />} />
        <Route path="/admin/payments"              element={<AdminPaymentsPage />} />
        <Route path="/admin/bookings/:bookingId/payments" element={<AdminBookingPaymentsPage />} />

        {/* Room management */}
        <Route path="/admin/rooms"                 element={<AdminRoomsPage />} />
        <Route path="/admin/rooms/new"             element={<RoomFormPage />} />
        <Route path="/admin/rooms/:id/edit"        element={<RoomFormPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<h1 className="text-2xl p-4">Oops! We cannot find the page you are looking for!</h1>} />
    </Routes>
  );
}
