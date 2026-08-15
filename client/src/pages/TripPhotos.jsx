import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function TripPhotos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTrip = async () => {
      try {
        const response = await axios.get(`https://tripvault-u534.onrender.com/api/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTrip(response.data);
      } catch (error) {
        console.log(error);
        alert("Could not load trip photos.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, navigate]);

  if (loading) {
    return <div className="page detail-page"><div className="card">Loading photos...</div></div>;
  }

  if (!trip) {
    return null;
  }

  const photos = [];

  if (Array.isArray(trip.photos) && trip.photos.length > 0) {
    photos.push(...trip.photos.filter(Boolean));
  } else if (typeof trip.photos === "string" && trip.photos.trim()) {
    photos.push(trip.photos);
  }

  if (trip.photoUrl) {
    photos.push(trip.photoUrl);
  }

  const uniquePhotos = [...new Set(photos.filter(Boolean))];

  return (
    <div className="dashboard-page detail-page">
      <div className="detail-card">
        <button className="logout-button" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>

        <h1>{trip.title} Photos</h1>
        <p className="subtitle">{trip.destination}</p>

        {uniquePhotos.length > 0 ? (
          <div className="detail-photo-grid">
            {uniquePhotos.map((photo, index) => (
              <div className="detail-photo-item" key={`${trip._id}-${photo}-${index}`}>
                <img src={photo} alt={`${trip.title} photo ${index + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <p className="subtitle">No photos available.</p>
        )}
      </div>
    </div>
  );
}

export default TripPhotos;
