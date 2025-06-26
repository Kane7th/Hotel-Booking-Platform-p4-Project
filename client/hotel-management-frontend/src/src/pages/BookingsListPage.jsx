import React, { useEffect, useState } from "react";

function BookingsListPage({ isAdmin = false }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ type: "", status: "", start: "", end: "" });

  const token = localStorage.getItem("token");

  const fetchBookings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.start) params.append("start_date", filters.start);
    if (filters.end) params.append("end_date", filters.end);

    const url = isAdmin ? `/all_bookings` : `/bookings/history?${params.toString()}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings || data))
      .catch(() => setError("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    const res = await fetch(`/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Cancel failed");
    alert("Booking cancelled.");
    fetchBookings();
  };

  return (
    <div>
      <h2>{isAdmin ? "All Bookings (Admin)" : "Your Bookings"}</h2>

      {/* FILTERS */}
      {!isAdmin && (
        <div>
          <label>Type:</label>
          <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="deluxe">Deluxe</option>
          </select>

          <label>Status:</label>
          <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="booked">Booked</option>
          </select>

          <label>Start:</label>
          <input type="date" onChange={(e) => setFilters({ ...filters, start: e.target.value })} />

          <label>End:</label>
          <input type="date" onChange={(e) => setFilters({ ...filters, end: e.target.value })} />

          <button onClick={fetchBookings}>Apply</button>
        </div>
      )}

      {/* LOADING / ERROR */}
      {loading && <p>Loading bookings...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LIST */}
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <ul>
          {bookings.map((b) => (
            <li key={b.id}>
              <strong>Room #{b.room_id}</strong> | {b.room_type || ""} | {b.check_in} to {b.check_out} — <strong>{b.status}</strong>
              {!isAdmin && b.status !== "cancelled" && (
                <button style={{ marginLeft: "10px" }} onClick={() => handleCancel(b.id)}>
                  Cancel
                </button>
              )}
              {isAdmin && <span> — User #{b.customer_id}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookingsListPage;
