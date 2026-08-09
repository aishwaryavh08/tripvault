import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [Username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsername(response.data.Username || "");
        setBio(response.data.bio || "");
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          Username,
          bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Profile updated successfully!");

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message || "Could not update profile."
      );
    }
  };

  return (
    <div className="edit-profile-page dashboard-page">
      <div className="edit-profile-card trip-form-card">
        <h2>Edit Profile</h2>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <label>Username</label>

          <input
            type="text"
            value={Username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Bio</label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows="5"
          />

          <div className="form-buttons edit-profile-actions">
            <button type="submit" className="save-button">
              Save Profile
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;

