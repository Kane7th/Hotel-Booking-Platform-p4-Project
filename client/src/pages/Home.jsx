import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:5000/whoami", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.warn("Invalid token, clearing from storage...");
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <div>
      <h1>🏨 Welcome to Château Hotel</h1>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <p>
            Hello, <strong>{user.username}</strong> 👋
          </p>
          {user.is_admin && (
            <p>
              You are logged in as <strong>Admin</strong>.
            </p>
          )}
        </div>
      ) : (
        <div>
          <p>
            Please <Link to="/login">Login</Link> or{" "}
            <Link to="/register">Register</Link>
          </p>
        </div>
      )}

      <p>
        <Link to="/rooms">View Available Rooms</Link>
      </p>
    </div>
  );
}

export default Home;
