import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerLoginPage() {
  const [form, setForm] = useState({ email: '', phone: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Login failed');
    } else {
      localStorage.setItem('customerToken', data.token);
      navigate('/customer/profile');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Customer Login</h2>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input name="email" placeholder="Email" className="block border p-2 w-full" type="email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" className="block border p-2 w-full" onChange={handleChange} required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  );
}
