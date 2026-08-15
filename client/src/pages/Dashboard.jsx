import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import { API_BASE_URL } from "../config";

const TRIP_DRAFT_KEY = "tripvault-trip-draft";

function Dashboard() {
  const initialFormData = {
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
    rating: "",
    photoUrl: "",
  };

  const [user, setUser] = useState({});
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [dateSort, setDateSort] = useState("");
  const [photoFiles, setPhotoFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const savedDraft = localStorage.getItem(TRIP_DRAFT_KEY);

    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData((prev) => ({ ...initialFormData, ...prev, ...parsedDraft }));
      } catch (err) {
        console.log("Draft load error:", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TRIP_DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const clearTripDraft = () => {
    localStorage.removeItem(TRIP_DRAFT_KEY);
  };

  // =========================
  // GET USER + TRIPS
  // =========================

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(userResponse.data);

        const tripsResponse = await axios.get(`${API_BASE_URL}/api/trips`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTrips(tripsResponse.data);
      } catch (error) {
        console.log(error);

        localStorage.removeItem("token");
        showToast("Session expired. Please login again.", "error");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // =========================
  // ADD TRIP
  // =========================

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };
   

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("destination", formData.destination);
      if (formData.startDate) data.append("startDate", formData.startDate);
      if (formData.endDate) data.append("endDate", formData.endDate);
      if (formData.description) data.append("description", formData.description);
      if (formData.rating) data.append("rating", Number(formData.rating));
      photoFiles.forEach((file) => {
        data.append("photos", file);
      });

      let response;

      if (editingTripId) {
        response = await axios.put(`${API_BASE_URL}/api/trips/${editingTripId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTrips((prevTrips) =>
          prevTrips.map((trip) =>
            trip._id === editingTripId ? response.data : trip
          )
        );

        showToast("Trip updated successfully!", "success");
      } else {
        response = await axios.post(`${API_BASE_URL}/api/trips`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTrips((prevTrips) => [response.data, ...prevTrips]);
        showToast("Trip added successfully!", "success");
      }

      setFormData(initialFormData);
      setPhotoFiles([]);
      setPreviewUrls([]);
      clearTripDraft();
      setEditingTripId(null);
      setShowForm(false);
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Could not save trip.";

      console.error("Trip save failed:", {
        status: error.response?.status,
        endpoint: `${API_BASE_URL}/api/trips`,
        data: error.response?.data,
        message: error.message,
        title: formData.title,
        destination: formData.destination,
        photoCount: photoFiles.length,
      });

      showToast(backendMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const query = searchQuery.trim().toLowerCase();
    const ratingValue = ratingFilter ? Number(ratingFilter) : null;

    if (ratingValue !== null && trip.rating !== ratingValue) {
      return false;
    }

    if (!query) return true;

    return (
      trip.title.toLowerCase().includes(query) ||
      trip.destination.toLowerCase().includes(query)
    );
  });

  const displayedTrips = [...filteredTrips].sort((a, b) => {
    const getTime = (trip, field) =>
      trip[field] ? new Date(trip[field]).getTime() : 0;

    switch (dateSort) {
      case "startAsc":
        return getTime(a, "startDate") - getTime(b, "startDate");
      case "startDesc":
        return getTime(b, "startDate") - getTime(a, "startDate");
      case "endAsc":
        return getTime(a, "endDate") - getTime(b, "endDate");
      case "endDesc":
        return getTime(b, "endDate") - getTime(a, "endDate");
      default:
        return 0;
    }
  });

  // =========================
  // DELETE TRIP
  // =========================

  const deleteTrip = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== id));

      if (editingTripId === id) {
        setEditingTripId(null);
        setFormData(initialFormData);
        setShowForm(false);
      }

      showToast("Trip deleted successfully!", "success");
    } catch (error) {
      console.log(error);
      showToast("Could not delete trip.", "error");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const editTrip = (trip) => {
    setEditingTripId(trip._id);
    setFormData({
      title: trip.title || "",
      destination: trip.destination || "",
      startDate: trip.startDate
        ? new Date(trip.startDate).toISOString().slice(0, 10)
        : "",
      endDate: trip.endDate
        ? new Date(trip.endDate).toISOString().slice(0, 10)
        : "",
      description: trip.description || "",
      rating: trip.rating ? String(trip.rating) : "",
      photoUrl: trip.photoUrl || "",
    });
    setPhotoFiles([]);
    setPreviewUrls(trip.photoUrl ? [trip.photoUrl] : []);
    setShowForm(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    showToast("Logged out successfully", "success");
    navigate("/login");
  };

  const getCoverPhoto = (trip) => {
    if (trip.photoUrl) {
      return trip.photoUrl;
    }

    if (Array.isArray(trip.photos) && trip.photos.length > 0) {
      return trip.photos[0];
    }

    if (typeof trip.photos === "string" && trip.photos.trim()) {
      return trip.photos;
    }

    return "";
  };

  const getAdditionalPhotos = (trip) => {
    const photos = [];

    if (Array.isArray(trip.photos) && trip.photos.length > 0) {
      photos.push(...trip.photos.filter(Boolean));
    } else if (typeof trip.photos === "string" && trip.photos.trim()) {
      photos.push(trip.photos);
    }

    if (trip.photoUrl) {
      photos.push(trip.photoUrl);
    }

    const coverPhoto = getCoverPhoto(trip);
    return [...new Set(photos.filter((photo) => photo && photo !== coverPhoto))];
  };

  return (
    <div className="dashboard-page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-brand-icon">✈️</span>
          <span>TripVault</span>
        </div>

        <button
          type="button"
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div className={`navbar-actions ${menuOpen ? "mobile-open" : ""}`}>
          <button
            className="logout-button"
            onClick={() => {
              setMenuOpen(false);
              const profileName = user?.username || user?.Username || user?.name;
              if (profileName) {
                navigate(`/profile/${encodeURIComponent(profileName)}`);
              }
            }}
          >
            My Profile
          </button>

          <button
            className="logout-button"
            onClick={() => {
              setMenuOpen(false);
              navigate("/edit-profile");
            }}
          >
            Edit Profile
          </button>

          <button
            className="logout-button"
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ================= MAIN ================= */}

{loading ? (
          <div className="dashboard-content">
            <div className="empty-trip">
              <div className="empty-icon">⏳</div>
              <h3>Loading your travel dashboard...</h3>
            </div>
          </div>
        ) : (
        <div className="dashboard-content">

        {/* ================= WELCOME CARD ================= */}

        <div className="welcome-card">

          <div className="plane">
            ✈️
          </div>

          <p className="small-title">
            WELCOME TO TRIPVAULT
          </p>

          <h1>
            Hello, {user.name || "Traveller"}!
          </h1>

          <p className="dashboard-subtitle">
            Your next adventure starts here.
          </p>

          {/* USER INFO */}

          <div className="user-info">

            <div>
              <span>Name</span>
              <strong>
                {user.name || "—"}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {user.email || "—"}
              </strong>
            </div>
            <div>
              <span>Bio</span>
              <strong>
                {user.bio || "No bio yet."}
              </strong>
            </div>

          </div>

          {/* ADD TRIP BUTTON */}

          {!showForm && (
            <button
              className="explore-button"
              onClick={() => setShowForm(true)}
            >
              + Add New Trip
            </button>
          )}

        </div>

        {/* ================= ADD TRIP FORM ================= */}

        {showForm && (
          <div className="trip-form-card">

            <h2>
              {editingTripId ? "✏️ Edit Trip" : "✈️ Add New Trip"}
            </h2>

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                name="title"
                placeholder="Trip Title"
                value={formData.title}
                onChange={(e) =>
                setFormData({
                ...formData,
                title: e.target.value,
               })
                }
                required
            />
              <input
                type="text"
                name="destination"
                placeholder="Destination"
                value={formData.destination}
                onChange={(e) => setFormData({
                  ...formData,
                  destination: e.target.value,
                })
              }
                required
              />

              <label className="date-label">Start Date - End Date</label>

              <div className="date-row">

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />


              </div>

              <textarea
                name="description"
                placeholder="Trip Description"
                value={formData.description}
                onChange={handleChange}
              />

              <div className="photo-upload-block">
                <label className="photo-label">
                  Trip Photo
                </label>

                <input
                  type="file"
                  name="photo"
                  accept="image/jpeg, image/jpg, image/png"
                  multiple
                  onChange={handleFileChange}
                />

                <span className="photo-upload-help">
                  Select multiple photos The first photo will be your cover image and the rest will appear in the gallery.
                </span>
              </div>

              {/* {previewUrls && (
                <div className="photo-preview">
                  {previewUrls.map((url, index)=>}
                  (
                  <img
                    src={previewUrls[0]}
                    alt="Trip preview"
                    className="preview-image"
                  />
                  ))}
                </div>
              )} */}
              {/* {previewUrls.length > 0 && (
  <div className="photo-preview">
    {previewUrls.map((url, index) => (
      <img
        key={index}
        src={url}
        alt={`Trip preview ${index + 1}`}
        className="preview-image"
      />
    ))}
  </div>
)} */}
  {previewUrls.length > 0 && (
  <div className="photo-preview-container">

    {/* COVER IMAGE */}
    <div className="cover-preview">
      <p>Cover Image</p>

      <img
        src={previewUrls[0]}
        alt="Cover preview"
        className="preview-image"
      />
    </div>

    {/* GALLERY */}
    {previewUrls.length > 1 && (
      <div className="gallery-preview">
        <p>Gallery Photos</p>

        <div className="preview-grid">
          {previewUrls.slice(1).map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Gallery preview ${index + 1}`}
              className="preview-grid-image"
            />
          ))}
        </div>
      </div>
    )}

  </div>
)}

              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              >
                <option value="">
                  Select Rating
                </option>

                <option value="1">
                  ⭐ 1
                </option>

                <option value="2">
                  ⭐⭐ 2
                </option>

                <option value="3">
                  ⭐⭐⭐ 3
                </option>

                <option value="4">
                  ⭐⭐⭐⭐ 4
                </option>

                <option value="5">
                  ⭐⭐⭐⭐⭐ 5
                </option>
              </select>

              {/* BUTTONS */}

              <div className="form-buttons">

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingTripId ? "Update Trip" : "Save Trip"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTripId(null);
                    setPhotoFiles([]);
                    setPreviewUrls([]);
                    setFormData({
                      title: "",
                      destination: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                      rating: "",
                      photoUrl: "",
                    });
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}

        {/* ================= MY TRIPS ================= */}

        <div className="trips-section">

          <h2>
            My Journeys
          </h2>

          <div className="search-bar">
            <div className="search-row">
              <div className="search-input-wrapper">
                <span className="search-icon">🔎</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by title or destination"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="sort-filter-wrapper">
                <select
                  className="sort-filter"
                  value={dateSort}
                  onChange={(e) => setDateSort(e.target.value)}
                >
                  <option value="">Sort by date</option>
                  <option value="startDesc">Start Date: Newest</option>
                  <option value="startAsc">Start Date: Oldest</option>
                  <option value="endDesc">End Date: Newest</option>
                  <option value="endAsc">End Date: Oldest</option>
                </select>
              </div>
            </div>

            <div className="rating-filter-wrapper">
              <select
                className="rating-filter"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="1">⭐ 1 Star</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              </select>
            </div>
          </div>

          {displayedTrips.length === 0 ? (

            <div className="empty-trip">
              <div className="empty-icon">
                🌍
              </div>

              <h3>
                Add Your First Trip
              </h3>

              <p>
                Start creating memories by adding your first journey.
              </p>
            </div>

          ) : (

            <div className="trips-grid">

              {displayedTrips.map((trip) => (

                <div
                  className="trip-card"
                  key={trip._id}
                  onClick={() => navigate(`/trip/${trip._id}`)}
                  style={{ cursor: "pointer" }}
                >

                  <div className="trip-card-top">

                    <div>
                      <h3>
                        {trip.title}
                      </h3>

                      <p className="destination">
                        📍 {trip.destination}
                      </p>
                    </div>

                    <div className="trip-card-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => editTrip(trip)}
                        title="Edit trip"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteTrip(trip._id)}
                      >
                        🗑️
                      </button>
                    </div>

                  </div>

                  {(() => {
                    const coverPhoto = getCoverPhoto(trip);
                    const additionalPhotos = getAdditionalPhotos(trip);

                    return coverPhoto ? (
                      <div
                        className="trip-photo-section"
                        onClick={() => navigate(`/trip/${trip._id}/photos`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/trip/${trip._id}/photos`);
                          }
                        }}
                      >
                        <div className="trip-photo-wrapper">
                          <img
                            src={coverPhoto}
                            alt={trip.title}
                            className="trip-photo"
                            loading="lazy"
                          />
                        </div>

                        {additionalPhotos.length > 0 && (
                          <div className="trip-photo-thumbnails">
                            {additionalPhotos.slice(0, 3).map((photo, index) => (
                              <div className="trip-photo-thumb" key={`${trip._id}-${photo}-${index}`}>
                                <img src={photo} alt={`${trip.title} extra ${index + 1}`} loading="lazy" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="trip-photo-wrapper empty-photo">
                        <p>No trip photo</p>
                      </div>
                    );
                  })()}

                  <div className="trip-dates">

                    <span>
                      📅 {trip.startDate
                        ? new Date(trip.startDate).toLocaleDateString()
                        : "No start date"}
                    </span>

                    <span>
                      →
                    </span>

                    <span>
                      {trip.endDate
                        ? new Date(trip.endDate).toLocaleDateString()
                        : "No end date"}
                    </span>

                  </div>

                  {trip.description && (
                    <p className="trip-description">
                      {trip.description}
                    </p>
                  )}

                  {trip.rating && (
                    <div className="trip-rating">
                      {"⭐".repeat(trip.rating)}
                    </div>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
        )}

    </div>
  );
}

export default Dashboard;

