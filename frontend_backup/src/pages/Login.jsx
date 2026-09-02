import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // LOGIN
    // =========================================================

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const cleanEmail = email.trim();

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!cleanEmail || !password) {
            setError("Please enter your email and password.");
            return;
        }

        if (!cleanEmail.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://127.0.0.1:8000/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                        password: password,
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
                    data.detail ||
                    data.message ||
                    "Invalid email or password."
                );
            }

            // -------------------------------------------------
            // SAVE ACCESS TOKEN
            // -------------------------------------------------

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

            // -------------------------------------------------
            // SAVE USER
            // -------------------------------------------------

            if (data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            setSuccess(
                "Login successful! Redirecting..."
            );

            setTimeout(() => {
                navigate("/");
            }, 700);

        } catch (err) {
            console.error("Login error:", err);

            setError(
                err.message ||
                "Login failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };


    // =========================================================
    // GOOGLE LOGIN
    // =========================================================

    const handleGoogleLogin = () => {
        setError(
            "Google Login is not configured yet. Please use email and password."
        );
    };


    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="login-page">

            {/* Background decoration */}

            <div className="login-glow login-glow-one"></div>

            <div className="login-glow login-glow-two"></div>


            <div className="login-container">

                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <div className="login-info">

                    {/* BRAND */}

                    <div className="brand">

                        <div className="brand-icon">
                            🌱
                        </div>

                        <div>

                            <div className="brand-name">
                                AgriMind AI
                            </div>

                            <div className="brand-subtitle">
                                Smart Agriculture Platform
                            </div>

                        </div>

                    </div>


                    {/* CONTENT */}

                    <div className="info-content">

                        <span className="welcome-badge">
                            🌾 Welcome Back
                        </span>

                        <h1>
                            Farm smarter.
                            <br />

                            <span>
                                Grow better.
                            </span>
                        </h1>

                        <p>
                            Welcome back to AgriMind AI.
                            Access intelligent crop disease
                            detection, farming recommendations,
                            analytics and your agricultural history.
                        </p>


                        {/* FEATURES */}

                        <div className="features">

                            <div className="feature">

                                <div className="feature-icon">
                                    🔬
                                </div>

                                <div>

                                    <strong>
                                        AI Disease Detection
                                    </strong>

                                    <span>
                                        Detect crop diseases using AI.
                                    </span>

                                </div>

                            </div>


                            <div className="feature">

                                <div className="feature-icon">
                                    🌿
                                </div>

                                <div>

                                    <strong>
                                        Smart Recommendations
                                    </strong>

                                    <span>
                                        Get intelligent crop guidance.
                                    </span>

                                </div>

                            </div>


                            <div className="feature">

                                <div className="feature-icon">
                                    📊
                                </div>

                                <div>

                                    <strong>
                                        Agriculture Analytics
                                    </strong>

                                    <span>
                                        Understand your farming data.
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="info-footer">

                        <span>🌱</span>

                        Smart technology for modern agriculture.

                    </div>

                </div>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="login-card">

                    {/* MOBILE BRAND */}

                    <div className="mobile-brand">
                        🌱
                    </div>


                    {/* HEADER */}

                    <div className="card-header">

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Login to your AgriMind AI account
                        </p>

                    </div>


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (

                        <div className="message error-message">

                            <span>
                                ⚠️
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {success && (

                        <div className="message success-message">

                            <span>
                                ✅
                            </span>

                            <span>
                                {success}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        LOGIN FORM
                    ================================================= */}

                    <form onSubmit={handleLogin}>

                        {/* EMAIL */}

                        <div className="form-group">

                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉️
                                </span>

                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(
                                            event.target.value
                                        );
                                        setError("");
                                        setSuccess("");
                                    }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <div className="password-label-row">

                                <label htmlFor="login-password">
                                    Password
                                </label>

                            </div>


                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(
                                            event.target.value
                                        );
                                        setError("");
                                        setSuccess("");
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
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
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? "🙈"
                                        : "👁️"}
                                </button>

                            </div>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>

                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login

                                    <span>
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </form>


                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div className="divider">

                        <span></span>

                        <p>
                            OR
                        </p>

                        <span></span>

                    </div>


                    {/* =================================================
                        GOOGLE LOGIN
                    ================================================= */}

                    <button
                        type="button"
                        className="google-button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >

                        <span className="google-icon">
                            G
                        </span>

                        <span>
                            Continue with Google
                        </span>

                    </button>


                    {/* =================================================
                        REGISTER
                    ================================================= */}

                    <div className="register-section">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create Account
                        </Link>

                    </div>


                    {/* SECURITY */}

                    <div className="security-note">

                        🔐 Your login information is securely
                        processed.

                    </div>

                </div>

            </div>


            {/* =====================================================
                CSS
            ===================================================== */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                /* =================================================
                   PAGE
                ================================================= */

                .login-page {

                    min-height: 100vh;

                    width: 100%;

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


                /* =================================================
                   MAIN CONTAINER
                ================================================= */

                .login-container {

                    width: 100%;

                    max-width: 1100px;

                    min-height: 650px;

                    display: grid;

                    grid-template-columns:
                        1fr 0.9fr;

                    background: #ffffff;

                    border-radius: 28px;

                    overflow: hidden;

                    box-shadow:
                        0 30px 80px
                        rgba(15, 23, 42, 0.13);

                    position: relative;

                    z-index: 2;
                }


                /* =================================================
                   LEFT SIDE
                ================================================= */

                .login-info {

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


                .login-info::before {

                    content: "";

                    position: absolute;

                    width: 340px;

                    height: 340px;

                    border-radius: 50%;

                    right: -150px;

                    top: -140px;

                    background:
                        rgba(255,255,255,0.08);
                }


                .login-info::after {

                    content: "";

                    position: absolute;

                    width: 280px;

                    height: 280px;

                    border-radius: 50%;

                    left: -140px;

                    bottom: -140px;

                    background:
                        rgba(255,255,255,0.06);
                }


                /* =================================================
                   BRAND
                ================================================= */

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

                    background:
                        rgba(255,255,255,0.16);

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    font-size: 29px;

                    border:
                        1px solid
                        rgba(255,255,255,0.18);
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


                /* =================================================
                   INFO CONTENT
                ================================================= */

                .info-content {

                    max-width: 490px;

                    position: relative;

                    z-index: 2;
                }


                .welcome-badge {

                    display: inline-flex;

                    padding: 8px 13px;

                    border-radius: 999px;

                    background:
                        rgba(255,255,255,0.13);

                    border:
                        1px solid
                        rgba(255,255,255,0.16);

                    font-size: 13px;

                    font-weight: 700;

                    margin-bottom: 22px;
                }


                .info-content h1 {

                    margin: 0;

                    font-size:
                        clamp(38px, 4vw, 56px);

                    line-height: 1.04;

                    letter-spacing: -2.4px;
                }


                .info-content h1 span {

                    color: #bbf7d0;
                }


                .info-content > p {

                    margin:
                        22px 0 30px;

                    font-size: 15px;

                    line-height: 1.75;

                    color:
                        rgba(255,255,255,0.78);

                    max-width: 470px;
                }


                /* =================================================
                   FEATURES
                ================================================= */

                .features {

                    display: flex;

                    flex-direction: column;

                    gap: 17px;
                }


                .feature {

                    display: flex;

                    align-items: center;

                    gap: 14px;
                }


                .feature-icon {

                    flex-shrink: 0;

                    width: 44px;

                    height: 44px;

                    border-radius: 12px;

                    background:
                        rgba(255,255,255,0.12);

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    font-size: 20px;
                }


                .feature strong {

                    display: block;

                    font-size: 14px;

                    margin-bottom: 3px;
                }


                .feature span {

                    display: block;

                    color:
                        rgba(255,255,255,0.64);

                    font-size: 12px;
                }


                .info-footer {

                    position: relative;

                    z-index: 2;

                    color:
                        rgba(255,255,255,0.58);

                    font-size: 12px;

                    display: flex;

                    align-items: center;

                    gap: 8px;
                }


                /* =================================================
                   RIGHT CARD
                ================================================= */

                .login-card {

                    padding: 48px 52px;

                    display: flex;

                    flex-direction: column;

                    justify-content: center;

                    background: #ffffff;
                }


                .mobile-brand {

                    display: none;
                }


                .card-header {

                    margin-bottom: 27px;
                }


                .card-header h2 {

                    margin: 0;

                    color: #0f172a;

                    font-size: 30px;

                    letter-spacing: -1px;
                }


                .card-header p {

                    margin:
                        8px 0 0;

                    color: #64748b;

                    font-size: 14px;

                    line-height: 1.6;
                }


                /* =================================================
                   MESSAGES
                ================================================= */

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

                    border:
                        1px solid #fecaca;
                }


                .success-message {

                    color: #166534;

                    background: #f0fdf4;

                    border:
                        1px solid #bbf7d0;
                }


                /* =================================================
                   FORM
                ================================================= */

                .form-group {

                    margin-bottom: 18px;
                }


                .form-group label {

                    display: block;

                    color: #334155;

                    font-size: 13px;

                    font-weight: 700;

                    margin-bottom: 7px;
                }


                .password-label-row {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;
                }


                /* =================================================
                   INPUT
                ================================================= */

                .input-wrapper {

                    display: flex;

                    align-items: center;

                    height: 50px;

                    border:
                        1px solid #dbe3ea;

                    border-radius: 11px;

                    background: #ffffff;

                    transition:
                        all 0.2s ease;
                }


                .input-wrapper:focus-within {

                    border-color: #22c55e;

                    box-shadow:
                        0 0 0 3px
                        rgba(34,197,94,0.10);
                }


                .input-icon {

                    width: 44px;

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

                    padding:
                        0 10px 0 0;
                }


                .input-wrapper input::placeholder {

                    color: #94a3b8;
                }


                .input-wrapper input:disabled {

                    opacity: 0.65;
                }


                /* =================================================
                   PASSWORD TOGGLE
                ================================================= */

                .password-toggle {

                    border: none;

                    background: transparent;

                    height: 100%;

                    width: 46px;

                    cursor: pointer;

                    font-size: 15px;

                    opacity: 0.7;
                }


                .password-toggle:hover {

                    opacity: 1;
                }


                /* =================================================
                   LOGIN BUTTON
                ================================================= */

                .login-button {

                    width: 100%;

                    height: 51px;

                    margin-top: 4px;

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
                        0 8px 18px
                        rgba(22,163,74,0.20);

                    transition:
                        all 0.2s ease;
                }


                .login-button:hover:not(:disabled) {

                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 12px 25px
                        rgba(22,163,74,0.27);
                }


                .login-button:disabled {

                    cursor: not-allowed;

                    opacity: 0.7;
                }


                /* =================================================
                   SPINNER
                ================================================= */

                .spinner {

                    width: 16px;

                    height: 16px;

                    border:
                        2px solid
                        rgba(255,255,255,0.4);

                    border-top-color: white;

                    border-radius: 50%;

                    animation:
                        login-spin 0.7s linear infinite;
                }


                @keyframes login-spin {

                    to {
                        transform: rotate(360deg);
                    }

                }


                /* =================================================
                   DIVIDER
                ================================================= */

                .divider {

                    display: flex;

                    align-items: center;

                    gap: 12px;

                    margin:
                        23px 0 18px;
                }


                .divider span {

                    flex: 1;

                    height: 1px;

                    background: #e5e7eb;
                }


                .divider p {

                    margin: 0;

                    color: #94a3b8;

                    font-size: 10px;

                    font-weight: 700;

                    letter-spacing: 1px;
                }


                /* =================================================
                   GOOGLE BUTTON
                ================================================= */

                .google-button {

                    width: 100%;

                    height: 49px;

                    border:
                        1px solid #dbe3ea;

                    border-radius: 11px;

                    background: #ffffff;

                    color: #334155;

                    font-size: 14px;

                    font-weight: 700;

                    cursor: pointer;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    gap: 11px;

                    transition:
                        all 0.2s ease;
                }


                .google-button:hover:not(:disabled) {

                    background: #f8fafc;

                    border-color: #cbd5e1;

                    box-shadow:
                        0 5px 15px
                        rgba(15,23,42,0.06);
                }


                .google-button:disabled {

                    cursor: not-allowed;

                    opacity: 0.6;
                }


                .google-icon {

                    width: 22px;

                    height: 22px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border-radius: 50%;

                    color: #4285f4;

                    font-size: 18px;

                    font-weight: 800;

                    font-family: Arial, sans-serif;
                }


                /* =================================================
                   REGISTER
                ================================================= */

                .register-section {

                    margin-top: 24px;

                    text-align: center;

                    font-size: 13px;

                    color: #64748b;
                }


                .register-section a {

                    margin-left: 5px;

                    color: #15803d;

                    font-weight: 800;

                    text-decoration: none;
                }


                .register-section a:hover {

                    text-decoration: underline;
                }


                /* =================================================
                   SECURITY
                ================================================= */

                .security-note {

                    margin-top: 20px;

                    padding-top: 17px;

                    border-top:
                        1px solid #eef2f7;

                    text-align: center;

                    color: #94a3b8;

                    font-size: 11px;
                }


                /* =================================================
                   BACKGROUND GLOW
                ================================================= */

                .login-glow {

                    position: fixed;

                    border-radius: 50%;

                    pointer-events: none;
                }


                .login-glow-one {

                    width: 260px;

                    height: 260px;

                    background:
                        rgba(34,197,94,0.12);

                    top: -100px;

                    right: -80px;
                }


                .login-glow-two {

                    width: 220px;

                    height: 220px;

                    background:
                        rgba(74,222,128,0.10);

                    bottom: -90px;

                    left: -70px;
                }


                /* =================================================
                   TABLET
                ================================================= */

                @media (max-width: 900px) {

                    .login-container {

                        max-width: 620px;

                        grid-template-columns: 1fr;

                        min-height: auto;
                    }


                    .login-info {

                        display: none;
                    }


                    .login-card {

                        padding:
                            42px 45px;
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


                /* =================================================
                   MOBILE
                ================================================= */

                @media (max-width: 520px) {

                    .login-page {

                        padding: 15px;
                    }


                    .login-container {

                        border-radius: 20px;
                    }


                    .login-card {

                        padding:
                            30px 22px;
                    }


                    .card-header h2 {

                        font-size: 26px;
                    }


                    .login-glow {

                        display: none;
                    }

                }

            `}</style>

        </div>
    );
}

export default Login;