import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCustomer() {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Admin token missing. Please login again.');
        return;
      }

      try {
        const res = await fetch(`/api/customers/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Status ${res.status}`);
        }

        const data = await res.json();
        setCustomer(data);
      } catch (err) {
        setError(`Could not load customer: ${err.message}`);
      }
    }

    loadCustomer();
  }, [id]);

  if (error) {
    return <p className="text-red-600 p-4">{error}</p>;
  }

  if (!customer) {
    return <p className="p-4">Loading customer…</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Customer Detail</h2>
      <table className="min-w-full border">
        <tbody>
          <tr>
            <th className="border px-2 py-1 text-left">ID</th>
            <td className="border px-2 py-1">{customer.id}</td>
          </tr>
          <tr>
            <th className="border px-2 py-1 text-left">Name</th>
            <td className="border px-2 py-1">{customer.name}</td>
          </tr>
          <tr>
            <th className="border px-2 py-1 text-left">Email</th>
            <td className="border px-2 py-1">{customer.email}</td>
          </tr>
          <tr>
            <th className="border px-2 py-1 text-left">Phone</th>
            <td className="border px-2 py-1">{customer.phone}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4">
        <Link
          to="/admin/customers"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back to Customers
        </Link>
      </div>
    </div>
  );
}
