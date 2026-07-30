import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);

      alert("Login Successful");

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
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

          <button onClick={login}>
            Login
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