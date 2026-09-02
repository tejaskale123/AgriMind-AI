import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const fullName = formData.full_name.trim();
        const email = formData.email.trim();

        if (!fullName) {
            setError("Please enter your full name.");
            return;
        }

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        full_name: fullName,
                        email: email,
                        password: formData.password,
                    }),
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.detail || "Registration failed. Please try again."
                );
            }

            setSuccess(
                "Account created successfully! Redirecting to login..."
            );

            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirm_password: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error) {
            console.error("Registration error:", error);

            setError(
                error.message ||
                    "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            {/* Background decoration */}
            <div className="register-glow register-glow-one"></div>
            <div className="register-glow register-glow-two"></div>

            <div className="register-container">

                {/* LEFT SIDE */}
                <div className="register-info">

                    <div className="brand">
                        <div className="brand-icon">🌱</div>

                        <div>
                            <div className="brand-name">
                                AgriMind AI
                            </div>

                            <div className="brand-subtitle">
                                Smart Agriculture Platform
                            </div>
                        </div>
                    </div>

                    <div className="info-content">

                        <span className="welcome-badge">
                            🌾 AI-Powered Farming
                        </span>

                        <h1>
                            Grow smarter.
                            <br />
                            <span>Farm better.</span>
                        </h1>

                        <p>
                            Create your AgriMind AI account and get access
                            to intelligent crop disease detection,
                            recommendations, analytics and more.
                        </p>

                        <div className="benefits">

                            <div className="benefit">
                                <div className="benefit-icon">
                                    🔬
                                </div>

                                <div>
                                    <strong>
                                        AI Disease Detection
                                    </strong>

                                    <span>
                                        Analyze crop leaf images with AI.
                                    </span>
                                </div>
                            </div>

                            <div className="benefit">
                                <div className="benefit-icon">
                                    🌿
                                </div>

                                <div>
                                    <strong>
                                        Crop Recommendations
                                    </strong>

                                    <span>
                                        Get useful farming guidance.
                                    </span>
                                </div>
                            </div>

                            <div className="benefit">
                                <div className="benefit-icon">
                                    📊
                                </div>

                                <div>
                                    <strong>
                                        Farming Analytics
                                    </strong>

                                    <span>
                                        Track your agricultural insights.
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="info-footer">
                        <span>🌱</span>
                        Smart technology for modern farmers
                    </div>
                </div>


                {/* RIGHT SIDE */}
                <div className="register-card">

                    <div className="card-header">

                        <div className="mobile-brand">
                            🌱
                        </div>

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Join AgriMind AI and start farming smarter.
                        </p>

                    </div>


                    {/* ERROR */}
                    {error && (
                        <div className="message error-message">
                            <span className="message-icon">⚠️</span>

                            <span>{error}</span>
                        </div>
                    )}


                    {/* SUCCESS */}
                    {success && (
                        <div className="message success-message">
                            <span className="message-icon">✅</span>

                            <span>{success}</span>
                        </div>
                    )}


                    <form onSubmit={handleRegister}>

                        {/* FULL NAME */}
                        <div className="form-group">

                            <label htmlFor="full_name">
                                Full Name
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    👤
                                </span>

                                <input
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    disabled={loading}
                                />

                            </div>
                        </div>


                        {/* EMAIL */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉️
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    disabled={loading}
                                />

                            </div>
                        </div>


                        {/* PASSWORD */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 6 characters"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>

                            </div>

                            <div className="password-hint">
                                Use at least 6 characters.
                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}
                        <div className="form-group">

                            <label htmlFor="confirm_password">
                                Confirm Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔐
                                </span>

                                <input
                                    id="confirm_password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirm_password"
                                    value={
                                        formData.confirm_password
                                    }
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {showConfirmPassword
                                        ? "🙈"
                                        : "👁️"}
                                </button>

                            </div>
                        </div>


                        {/* REGISTER BUTTON */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <span>→</span>
                                </>
                            )}
                        </button>

                    </form>


                    {/* LOGIN */}
                    <div className="login-section">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Login
                        </Link>

                    </div>


                    <div className="security-note">
                        🔐 Your account information is securely
                        processed.
                    </div>

                </div>

            </div>


            {/* PAGE STYLES */}
            <style>{`

                * {
                    box-sizing: border-box;
                }

                .register-page {
                    min-height: 100vh;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 35px 20px;
                    background:
                        linear-gradient(
                            135deg,
                            #f0fdf4 0%,
                            #ecfdf5 45%,
                            #f8fafc 100%
                        );
                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }

                .register-container {
                    width: 100%;
                    max-width: 1100px;
                    min-height: 680px;
                    display: grid;
                    grid-template-columns: 1fr 0.9fr;
                    background: #ffffff;
                    border-radius: 28px;
                    overflow: hidden;
                    box-shadow:
                        0 30px 80px rgba(15, 23, 42, 0.13);
                    position: relative;
                    z-index: 2;
                }

                /* LEFT */

                .register-info {
                    padding: 48px;
                    background:
                        linear-gradient(
                            145deg,
                            #14532d 0%,
                            #166534 45%,
                            #15803d 100%
                        );
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                }

                .register-info::before {
                    content: "";
                    position: absolute;
                    width: 330px;
                    height: 330px;
                    border-radius: 50%;
                    right: -140px;
                    top: -130px;
                    background: rgba(255,255,255,0.08);
                }

                .register-info::after {
                    content: "";
                    position: absolute;
                    width: 260px;
                    height: 260px;
                    border-radius: 50%;
                    left: -130px;
                    bottom: -130px;
                    background: rgba(255,255,255,0.06);
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    position: relative;
                    z-index: 2;
                }

                .brand-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 15px;
                    background: rgba(255,255,255,0.16);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 29px;
                    border: 1px solid rgba(255,255,255,0.18);
                }

                .brand-name {
                    font-size: 21px;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                }

                .brand-subtitle {
                    font-size: 12px;
                    opacity: 0.72;
                    margin-top: 2px;
                }

                .info-content {
                    max-width: 490px;
                    position: relative;
                    z-index: 2;
                }

                .welcome-badge {
                    display: inline-flex;
                    padding: 8px 13px;
                    border-radius: 999px;
                    background: rgba(255,255,255,0.13);
                    border: 1px solid rgba(255,255,255,0.16);
                    font-size: 13px;
                    font-weight: 700;
                    margin-bottom: 22px;
                }

                .info-content h1 {
                    margin: 0;
                    font-size: clamp(38px, 4vw, 56px);
                    line-height: 1.04;
                    letter-spacing: -2.4px;
                }

                .info-content h1 span {
                    color: #bbf7d0;
                }

                .info-content > p {
                    margin: 22px 0 30px;
                    font-size: 15px;
                    line-height: 1.75;
                    color: rgba(255,255,255,0.78);
                    max-width: 470px;
                }

                .benefits {
                    display: flex;
                    flex-direction: column;
                    gap: 17px;
                }

                .benefit {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .benefit-icon {
                    flex-shrink: 0;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .benefit strong {
                    display: block;
                    font-size: 14px;
                    margin-bottom: 3px;
                }

                .benefit span {
                    display: block;
                    color: rgba(255,255,255,0.64);
                    font-size: 12px;
                }

                .info-footer {
                    position: relative;
                    z-index: 2;
                    color: rgba(255,255,255,0.58);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* RIGHT */

                .register-card {
                    padding: 48px 52px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: #ffffff;
                }

                .card-header {
                    margin-bottom: 27px;
                }

                .mobile-brand {
                    display: none;
                }

                .card-header h2 {
                    margin: 0;
                    color: #0f172a;
                    font-size: 30px;
                    letter-spacing: -1px;
                }

                .card-header p {
                    margin: 8px 0 0;
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .message {
                    display: flex;
                    align-items: flex-start;
                    gap: 9px;
                    padding: 12px 14px;
                    border-radius: 12px;
                    font-size: 13px;
                    line-height: 1.5;
                    margin-bottom: 18px;
                }

                .error-message {
                    color: #b91c1c;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                }

                .success-message {
                    color: #166534;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                }

                .message-icon {
                    flex-shrink: 0;
                }

                .form-group {
                    margin-bottom: 17px;
                }

                .form-group label {
                    display: block;
                    color: #334155;
                    font-size: 13px;
                    font-weight: 700;
                    margin-bottom: 7px;
                }

                .input-wrapper {
                    display: flex;
                    align-items: center;
                    height: 49px;
                    border: 1px solid #dbe3ea;
                    border-radius: 11px;
                    background: #ffffff;
                    transition: all 0.2s ease;
                }

                .input-wrapper:focus-within {
                    border-color: #22c55e;
                    box-shadow:
                        0 0 0 3px rgba(34,197,94,0.10);
                }

                .input-icon {
                    width: 43px;
                    text-align: center;
                    font-size: 16px;
                    opacity: 0.75;
                }

                .input-wrapper input {
                    flex: 1;
                    min-width: 0;
                    height: 100%;
                    border: none;
                    outline: none;
                    background: transparent;
                    color: #0f172a;
                    font-size: 14px;
                    padding: 0 10px 0 0;
                }

                .input-wrapper input::placeholder {
                    color: #94a3b8;
                }

                .input-wrapper input:disabled {
                    opacity: 0.65;
                }

                .password-toggle {
                    border: none;
                    background: transparent;
                    height: 100%;
                    width: 45px;
                    cursor: pointer;
                    font-size: 15px;
                    opacity: 0.7;
                }

                .password-toggle:hover {
                    opacity: 1;
                }

                .password-hint {
                    margin-top: 5px;
                    font-size: 11px;
                    color: #94a3b8;
                }

                .register-button {
                    width: 100%;
                    height: 50px;
                    margin-top: 5px;
                    border: none;
                    border-radius: 11px;
                    background:
                        linear-gradient(
                            135deg,
                            #16a34a,
                            #15803d
                        );
                    color: white;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    box-shadow:
                        0 8px 18px rgba(22,163,74,0.20);
                    transition: all 0.2s ease;
                }

                .register-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow:
                        0 12px 25px rgba(22,163,74,0.27);
                }

                .register-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .login-section {
                    margin-top: 23px;
                    text-align: center;
                    font-size: 13px;
                    color: #64748b;
                }

                .login-section a {
                    margin-left: 5px;
                    color: #15803d;
                    font-weight: 800;
                    text-decoration: none;
                }

                .login-section a:hover {
                    text-decoration: underline;
                }

                .security-note {
                    margin-top: 20px;
                    padding-top: 17px;
                    border-top: 1px solid #eef2f7;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 11px;
                }

                /* BACKGROUND */

                .register-glow {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(2px);
                    pointer-events: none;
                }

                .register-glow-one {
                    width: 260px;
                    height: 260px;
                    background: rgba(34,197,94,0.12);
                    top: -100px;
                    right: -80px;
                }

                .register-glow-two {
                    width: 220px;
                    height: 220px;
                    background: rgba(74,222,128,0.10);
                    bottom: -90px;
                    left: -70px;
                }

                /* RESPONSIVE */

                @media (max-width: 900px) {

                    .register-container {
                        max-width: 620px;
                        grid-template-columns: 1fr;
                        min-height: auto;
                    }

                    .register-info {
                        display: none;
                    }

                    .register-card {
                        padding: 42px 45px;
                    }

                    .mobile-brand {
                        display: flex;
                        width: 54px;
                        height: 54px;
                        border-radius: 16px;
                        align-items: center;
                        justify-content: center;
                        background: #dcfce7;
                        font-size: 28px;
                        margin-bottom: 17px;
                    }
                }

                @media (max-width: 520px) {

                    .register-page {
                        padding: 15px;
                    }

                    .register-container {
                        border-radius: 20px;
                    }

                    .register-card {
                        padding: 30px 22px;
                    }

                    .card-header h2 {
                        font-size: 26px;
                    }

                    .register-glow {
                        display: none;
                    }
                }

            `}</style>

        </div>
    );
}

export default Register;