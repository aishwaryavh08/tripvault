import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => { 
    const fetchTrip = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/trips/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTrip(response.data);
      } catch (err) {
        console.log("TRIP DETAILS ERROR:", err);
        setError("Unable to load trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, navigate]);

  if (loading) {
    return <div className="page detail-page"><div className="card detail-card"><h2>Loading trip...</h2></div></div>;
  }

  if (error) {
    return <div className="page detail-page"><div className="card detail-card"><h2>{error}</h2></div></div>;
  }

  if (!trip) {
    return <div className="page detail-page"><div className="card detail-card"><h2>Trip not found</h2></div></div>;
  }

  // Cover image first
  const photos = [];

  if (trip.photoUrl) {
    photos.push(trip.photoUrl);
  }

  if (Array.isArray(trip.photos)) {
    photos.push(...trip.photos);
  }

  const uniquePhotos = [...new Set(photos.filter(Boolean))];

  const handlePhotoSelection = (event) => {
    setUploadError("");
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploadError("");

    if (!selectedFiles.length) {
      setUploadError("Please select at least one image to upload.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      setUploading(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/trips/${id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTrip(response.data.trip);
      setSelectedFiles([]);
      setUploadError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadErr) {
      console.log("UPLOAD ERROR:", uploadErr);
      setUploadError(
        uploadErr.response?.data?.message || "Could not upload photos."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-page detail-page">
      <div className="detail-card">
        <button className="logout-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <h1>{trip.title}</h1>

        <h3>📍 {trip.destination}</h3>

        {trip.photoUrl && (
          <div className="trip-photo-wrapper detail-cover-image">
            <img src={trip.photoUrl} alt={trip.title} className="trip-photo" />
          </div>
        )}

        <div className="detail-info-block">
          <p>
            <strong>Start Date:</strong>{" "}
            {trip.startDate
              ? new Date(trip.startDate).toLocaleDateString()
              : "Not specified"}
          </p>

          <p>
            <strong>End Date:</strong>{" "}
            {trip.endDate
              ? new Date(trip.endDate).toLocaleDateString()
              : "Not specified"}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {trip.description || "No description"}
          </p>

          <p>
            <strong>Rating:</strong> ⭐ {trip.rating || "Not rated"}
          </p>
        </div>

        <div className="photo-upload-section">
          <h2>Add More Photos</h2>

          <form onSubmit={handleUpload} className="upload-photos-form">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg, image/jpg, image/png"
              onChange={handlePhotoSelection}
            />

            {uploadError && <p className="upload-error">{uploadError}</p>}

            <button type="submit" className="save-button" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Selected Photos"}
            </button>
          </form>
        </div>

        <h2 className="detail-gallery-title">Trip Photos</h2>

        {uniquePhotos.length === 0 ? (
          <p>No photos available.</p>
        ) : (
          <div className="detail-photo-grid">
            {uniquePhotos.map((photo, index) => (
              <div className="detail-photo-item" key={`${trip._id || index}-${photo}-${index}`}>
                <img src={photo} alt={`Trip photo ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripDetails;