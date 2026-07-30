import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        alert("Session Expired. Please Login Again.");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div className="logo">✈️ TripVault</div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="plane">✈️</div>

          <p className="small-title">WELCOME TO TRIPVAULT</p>

          <h1>
            Hello, {user.name || "Traveller"}!
          </h1>

          <p className="dashboard-subtitle">
            Your next adventure starts here.
          </p>

          <div className="user-info">
            <div>
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
          </div>

          <button className="explore-button">
            Explore Your Journey
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;