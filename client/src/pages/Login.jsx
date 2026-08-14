import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      showToast("Login successful", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="logo">✈️ TripVault</div>

        <h1>Welcome Back</h1>

        <p className="subtitle">
          Login and continue your journey.
        </p>

        <div className="form">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        <div className="bottom-text">
          Don't have an account?
        </div>

        <button
          className="outline-button"
          onClick={() => navigate("/register")}
        >
          Create New Account
        </button>
      </div>
    </div>
  );
}

export default Login;