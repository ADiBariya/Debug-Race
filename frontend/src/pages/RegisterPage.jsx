import { useState } from "react";
import { useAuth } from "../features/auth/features.authContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

const Register = () => {
  const { register } = useAuth(); // make sure this exists in your context
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError("REGISTRATION FAILED");
    }
  };

  return (
    <div className="auth-container">

      {/* Top Branding (same as Login + Home) */}
      <div className="auth-header">
        <h1>DEBUG RACE</h1>
        <p>Decode • Optimize • Accelerate</p>
      </div>

      {/* Card */}
      <div className="auth-card">

        <h2 className="auth-title">REGISTRATION TERMINAL</h2>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Username */}
          <div className="input-group">
            <label>USERNAME</label>
            <input
              type="text"
              required
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label>EMAIL</label>
            <input
              type="email"
              required
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              required
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="primary-btn">
            START ENGINE
          </button>

        </form>

        <p className="switch-link">
          ALREADY RACER? <Link to="/login">LOGIN</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;