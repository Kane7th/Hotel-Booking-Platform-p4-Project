import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          axios.get('/api/admin/overview', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{stats?.total_customers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Rooms</h3>
          <p>{stats?.total_rooms}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{stats?.total_bookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${stats?.total_revenue?.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="admin-section">
        <h2>User Management</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.is_admin ? 'Yes' : 'No'}</td>
                <td>
                  {!user.is_admin && (
                    <button onClick={() => promoteUser(user.id)}>Promote</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};