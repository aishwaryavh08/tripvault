import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import { API_BASE_URL } from "../config";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const register = async () => {
    if (!form.name || !form.email || !form.password) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        Username: form.name.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);

      showToast(res.data.message || "Registration successful", "success");
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="logo">✈️ TripVault</div>

        <h1>Create your account</h1>
        <p className="subtitle">
          Start your journey and keep your travel plans together.
        </p>

        <div className="form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button onClick={register} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>

        <div className="bottom-text">
          Already have an account?
        </div>

        <button
          className="outline-button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Register;