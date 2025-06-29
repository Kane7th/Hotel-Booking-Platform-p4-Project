import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('customerToken');

  useEffect(() => {
    fetch('/api/customer/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        if (!r.ok) {
          const msg = await r.text();
          throw new Error(msg || 'Failed to load profile');
        }
        return r.json();
      })
      .then(data => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [token]);

  function startEdit() {
    if (!customer) return;
    setForm({ name: customer.name, email: customer.email, phone: customer.phone });
    setEditMode(true);
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError('');

    if (!customer?.id) {
      setError('Customer ID not loaded yet');
      return;
    }

    try {
      const res = await fetch(`/api/customer/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Update failed');
      } else {
        setCustomer({ ...customer, ...form });
        setEditMode(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleDelete() {
    if (!customer?.id) {
      setError('Customer ID not loaded yet');
      return;
    }

    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/customer/${customer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        localStorage.removeItem('customerToken');
        navigate('/');
      } else {
        setError('Delete failed');
      }
    } catch (err) {
      setError('Delete request failed');
    }
  }

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!customer) return <p className="p-4">Customer not found</p>;

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-2xl mb-4">Your Profile</h2>

      {!editMode ? (
        <>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>

          <button onClick={startEdit} className="mt-4 bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
          <button onClick={handleDelete} className="mt-4 ml-2 bg-red-600 text-white px-3 py-1 rounded">Delete Account</button>
        </>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-2">
          <input name="name" value={form.name} onChange={handleChange} className="block border p-2 w-full" required />
          <input name="email" value={form.email} onChange={handleChange} className="block border p-2 w-full" type="email" required />
          <input name="phone" value={form.phone} onChange={handleChange} className="block border p-2 w-full" required />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          <button type="button" onClick={() => setEditMode(false)} className="ml-2 px-4 py-2">Cancel</button>
        </form>
      )}
    </div>
  );
}
