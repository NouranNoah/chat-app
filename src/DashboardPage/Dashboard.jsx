import React, { useEffect, useState } from "react";
import axios from "axios";
import './Dashboard.css'
import Cookies from 'js-cookie';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/users/getMe", {
          headers: { Authorization: token },
        });
        setUser(userRes.data.data);

        const roomsRes = await axios.get("/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(roomsRes.data.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <section className="user-info">
        <h2>Welcome, {user.username} 👋</h2>
        <p>Email: {user.email}</p>
      </section>

      <section className="room-list">
        <h3>Available Chat Rooms</h3>
        {rooms.map((room) => (
          <div key={room._id} className="room-card">
            <h4>{room.name}</h4>
            <p>{room.description || "No description"}</p>
            <button onClick={() => window.location.href = `/rooms/${room._id}`}>
              Enter Room
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
