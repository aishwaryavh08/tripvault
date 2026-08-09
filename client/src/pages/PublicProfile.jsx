import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${username}/profile`
        );

        setProfile(response.data);
      } catch (error) {
        console.log(error);
        alert("Profile not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  return (
    <div className="public-profile-page">

      <button onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="profile-card">

        <h1>@{profile.username}</h1>

        <p>
          {profile.bio || "No bio added yet."}
        </p>

      </div>

      <div className="profile-trips">

        <h2>My Journeys</h2>

        {profile.trips.length === 0 ? (
          <p>No trips yet.</p>
        ) : (
          <div className="trips-grid">

            {profile.trips.map((trip) => (
              <div
                className="trip-card"
                key={trip._id}
                onClick={() => navigate(`/trip/${trip._id}`)}
                style={{ cursor: "pointer" }}
              >

                <h3>{trip.title}</h3>

                <p>📍 {trip.destination}</p>

                <p>
                  {trip.startDate
                    ? new Date(trip.startDate).toLocaleDateString()
                    : "No start date"}
                </p>

                {trip.rating && (
                  <p>
                    {"⭐".repeat(trip.rating)}
                  </p>
                )}

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default PublicProfile;