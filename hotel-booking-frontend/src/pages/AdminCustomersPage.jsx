import React, { useEffect, useState } from 'react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Admin token not found.');
        return;
      }

      try {
        const res = await fetch('/api/customers', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || `Status ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected response format');
        }

        setCustomers(data);
      } catch (err) {
        setError(`Could not load customers: ${err.message}`);
      }
    }

    loadCustomers();
  }, []);

  if (error) {
    return <p className="text-red-600 p-4">{error}</p>;
  }

  if (!customers.length) {
    return <p className="p-4">No customers found.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">All Customers</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td className="border px-2 py-1">{c.id}</td>
              <td className="border px-2 py-1">{c.name}</td>
              <td className="border px-2 py-1">{c.email}</td>
              <td className="border px-2 py-1">{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
