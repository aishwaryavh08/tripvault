import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `https://tripvault-u534.onrender.com/api/users/${username}/profile`
        );

        setProfile(response.data);
        setBio(response.data.bio || "");

        if (token) {
          try {
            const meResponse = await axios.get(
              "https://tripvault-u534.onrender.com/api/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const currentUsername = meResponse.data.Username || meResponse.data.username;
            setIsOwner(currentUsername === username);
          } catch {
            setIsOwner(false);
          }
        }
      } catch {
        setError("User not found");
      }
    };

    fetchProfile();
  }, [username]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!isOwner) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to update your profile.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await axios.put(
        "https://tripvault-u534.onrender.com/api/users/profile",
        { bio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile((prev) => ({ ...prev, bio: response.data.bio }));
      setBio(response.data.bio);
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch {
      setError("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!profile) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="dashboard-page profile-page">
      <div className="profile-shell">
        <nav className="navbar profile-navbar">
          <div className="logo">✈️ TripVault</div>

          <div className="navbar-actions">
            <button className="logout-button" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            {isOwner && (
              <button className="logout-button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </nav>

        <div className="profile-card">
          <div className="profile-hero">
            <div className="plane">👤</div>
            <div>
              <p className="small-title">PUBLIC PROFILE</p>
              <h1>{profile.username}</h1>
              <p className="dashboard-subtitle">Travel stories and memories shared by this explorer.</p>
            </div>
          </div>

          {message && <p className="profile-message">{message}</p>}

          {isEditing ? (
            <form className="profile-form" onSubmit={handleSave}>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="5"
              />

              <div className="profile-actions">
                <button type="submit" disabled={saving} className="save-button">
                  {saving ? "Saving..." : "Save Bio"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setBio(profile.bio || "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-bio-box">
                <p>{profile.bio || "No bio yet."}</p>
              </div>
            </>
          )}

          <h2 className="profile-trips-title">Trips</h2>

          {profile.trips.length === 0 ? (
            <p className="profile-empty">No trips yet.</p>
          ) : (
            <div className="profile-trip-list">
              {profile.trips.map((trip) => (
                <div key={trip._id} className="profile-trip-item">
                  <h3>{trip.title}</h3>
                  <p>{trip.destination}</p>
                  <p>
                    {trip.startDate} - {trip.endDate}
                  </p>
                  <p>Rating: {trip.rating}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;