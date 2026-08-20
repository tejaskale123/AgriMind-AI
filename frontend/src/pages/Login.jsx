import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Invalid email or password."
        );
      }

      if (data.access_token) {
        localStorage.setItem(
          "access_token",
          data.access_token
        );
      }

      if (data.token) {
        localStorage.setItem(
          "access_token",
          data.token
        );
      }

      // Save only logged-in user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Go to dashboard
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoBox}>🌱</div>

        <h1 style={styles.title}>Welcome Back</h1>

        <p style={styles.subtitle}>
          Login to your AgriMind AI account
        </p>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>

            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.passwordInput}
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showButton}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <div style={styles.registerText}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={styles.registerButton}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #eefaf1 0%, #f7fbf8 50%, #e9f7ed 100%)",
    padding: "30px 20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "40px",
    boxSizing: "border-box",
    boxShadow: "0 15px 45px rgba(35, 95, 55, 0.12)",
    border: "1px solid #e7f1e9",
  },

  logoBox: {
    width: "64px",
    height: "64px",
    margin: "0 auto 20px",
    borderRadius: "18px",
    background: "#e6f8eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  title: {
    margin: "0",
    textAlign: "center",
    color: "#183b25",
    fontSize: "30px",
    fontWeight: "700",
  },

  subtitle: {
    textAlign: "center",
    color: "#718078",
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "32px",
  },

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#304438",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    height: "50px",
    padding: "0 15px",
    boxSizing: "border-box",
    border: "1px solid #d8e5dc",
    borderRadius: "11px",
    outline: "none",
    fontSize: "14px",
    color: "#26382d",
    background: "#fbfdfb",
  },

  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "50px",
    border: "1px solid #d8e5dc",
    borderRadius: "11px",
    background: "#fbfdfb",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    padding: "0 15px",
    fontSize: "14px",
    color: "#26382d",
    background: "transparent",
  },

  showButton: {
    border: "none",
    background: "transparent",
    color: "#29944d",
    fontWeight: "600",
    cursor: "pointer",
    padding: "0 14px",
  },

  error: {
    background: "#fff0f0",
    border: "1px solid #ffd1d1",
    color: "#c0392b",
    padding: "11px 13px",
    borderRadius: "9px",
    fontSize: "13px",
    marginBottom: "16px",
  },

  loginButton: {
    width: "100%",
    height: "52px",
    border: "none",
    borderRadius: "11px",
    background: "#29944d",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(41, 148, 77, 0.22)",
  },

  registerText: {
    textAlign: "center",
    marginTop: "25px",
    color: "#75827a",
    fontSize: "14px",
  },

  registerButton: {
    border: "none",
    background: "transparent",
    color: "#29944d",
    fontWeight: "700",
    cursor: "pointer",
    padding: "0",
    fontSize: "14px",
  },
};

export default Login;
