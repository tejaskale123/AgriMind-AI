import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // LOGIN HANDLER (100% PRESERVED BACKEND CONTRACT)
    // =========================================================
    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const cleanEmail = email.trim();

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

            const response = await fetch("http://127.0.0.1:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: cleanEmail,
                    password: password,
                }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(data.detail || data.message || "Invalid email or password.");
            }

            // Save access token
            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
            }
            if (data.token) {
                localStorage.setItem("access_token", data.token);
            }

            // Save user info
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            setSuccess("Login successful! Redirecting to dashboard...");

            setTimeout(() => {
                navigate("/");
            }, 700);
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Google Login Placeholder notice (100% Preserved)
    const handleGoogleLogin = () => {
        setError("Google Login is not configured yet. Please use email and password.");
    };

    return (
        <div className="exp5-auth-page">
            <style>{`
                /* =========================================================
                   EXP5 SCOPED STYLES — PREMIUM AGRIMIND AUTHENTICATION
                ========================================================= */
                .exp5-auth-page {
                    min-height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    background: #02261a;
                    overflow-x: hidden;
                    box-sizing: border-box;
                    padding: 24px;
                }

                /* Background Image with Dark Forest Green Tint & Soft Blur */
                .exp5-auth-bg-layer {
                    position: absolute;
                    inset: 0;
                    background-image: url('/images/auth_farm_bg.jpg');
                    background-size: cover;
                    background-position: center;
                    opacity: 0.36;
                    filter: saturate(1.15) contrast(1.05) blur(1px);
                    transform: scale(1.03);
                    pointer-events: none;
                }

                .exp5-auth-radial-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.22) 0%, transparent 60%),
                                radial-gradient(circle at bottom left, rgba(5, 150, 105, 0.28) 0%, transparent 55%),
                                linear-gradient(135deg, rgba(2, 38, 26, 0.94) 0%, rgba(1, 24, 16, 0.97) 100%);
                    pointer-events: none;
                }

                /* Main 2-Column Card */
                .exp5-login-card {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 1080px;
                    min-height: 640px;
                    display: grid;
                    grid-template-columns: 1.15fr 1fr;
                    background: rgba(255, 255, 255, 0.985);
                    border-radius: 28px;
                    box-shadow: 0 25px 65px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    animation: exp5Entrance 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes exp5Entrance {
                    from { opacity: 0; transform: translateY(16px) scale(0.985); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ================= LEFT BRAND PANEL ================= */
                .exp5-brand-panel {
                    position: relative;
                    padding: 48px 44px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: linear-gradient(150deg, #064e3b 0%, #04382a 50%, #02261c 100%);
                    color: #ffffff;
                    overflow: hidden;
                }

                .exp5-ambient-glow {
                    position: absolute;
                    top: -80px;
                    right: -80px;
                    width: 340px;
                    height: 340px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(52, 211, 153, 0.22) 0%, transparent 70%);
                    pointer-events: none;
                }

                .exp5-brand-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 2;
                }

                .exp5-brand-logo {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .exp5-brand-titles {
                    display: flex;
                    flex-direction: column;
                }

                .exp5-brand-title {
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: -0.4px;
                    color: #ffffff;
                    line-height: 1.1;
                }

                .exp5-brand-sub {
                    font-size: 9.5px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: #6ee7b7;
                    text-transform: uppercase;
                    margin-top: 2px;
                }

                .exp5-hero-copy {
                    z-index: 2;
                    margin: 36px 0;
                }

                .exp5-hero-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(16, 185, 129, 0.16);
                    border: 1px solid rgba(52, 211, 153, 0.3);
                    color: #a7f3d0;
                    font-size: 11.5px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    backdrop-filter: blur(8px);
                }

                .exp5-headline {
                    font-size: 38px;
                    font-weight: 900;
                    line-height: 1.15;
                    letter-spacing: -1px;
                    color: #ffffff;
                    margin-bottom: 14px;
                }

                .exp5-headline span {
                    background: linear-gradient(120deg, #34d399 0%, #a7f3d0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .exp5-description {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #d1fae5;
                    opacity: 0.9;
                    max-width: 440px;
                    margin-bottom: 28px;
                }

                /* Feature Cards */
                .exp5-feature-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    z-index: 2;
                }

                .exp5-feat-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 11px 14px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                }

                .exp5-feat-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(52, 211, 153, 0.4);
                    transform: translateY(-2px);
                }

                .exp5-feat-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    background: rgba(16, 185, 129, 0.25);
                    color: #6ee7b7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .exp5-feat-text {
                    font-size: 12px;
                    font-weight: 700;
                    color: #ffffff;
                }

                .exp5-brand-footer {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #a7f3d0;
                    opacity: 0.8;
                    z-index: 2;
                    margin-top: 18px;
                }

                /* ================= RIGHT FORM PANEL ================= */
                .exp5-form-panel {
                    padding: 50px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: #ffffff;
                }

                .exp5-form-header {
                    margin-bottom: 26px;
                }

                .exp5-leaf-badge {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                }

                .exp5-form-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.6px;
                    margin-bottom: 6px;
                }

                .exp5-form-sub {
                    font-size: 13.5px;
                    color: #64748b;
                }

                /* Alert Banners */
                .exp5-alert-banner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    animation: exp5Fade 0.25s ease;
                }

                @keyframes exp5Fade {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .exp5-alert-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                }

                .exp5-alert-success {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #15803d;
                }

                /* Form Fields */
                .exp5-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .exp5-field-row {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .exp5-field-label {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #334155;
                }

                .exp5-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .exp5-input-icon {
                    position: absolute;
                    left: 14px;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                }

                .exp5-login-input {
                    width: 100%;
                    height: 48px;
                    padding: 0 44px 0 42px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    background: #f8fafc;
                    font-size: 14px;
                    color: #0f172a;
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: inherit;
                }

                .exp5-login-input:hover {
                    border-color: #cbd5e1;
                    background: #ffffff;
                }

                .exp5-login-input:focus {
                    border-color: #16a34a;
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
                }

                .exp5-eye-btn {
                    position: absolute;
                    right: 12px;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 6px;
                    border-radius: 6px;
                    transition: color 0.2s;
                }

                .exp5-eye-btn:hover {
                    color: #334155;
                }

                /* Action Button */
                .exp5-login-button {
                    width: 100%;
                    height: 50px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    color: #ffffff;
                    font-size: 14.5px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
                    transition: all 0.2s ease;
                    margin-top: 4px;
                }

                .exp5-login-button:hover:not(:disabled) {
                    background: linear-gradient(135deg, #15803d 0%, #166534 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 10px 24px rgba(22, 163, 74, 0.38);
                }

                .exp5-login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .exp5-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2.5px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: exp5Spin 0.7s linear infinite;
                }

                @keyframes exp5Spin {
                    to { transform: rotate(360deg); }
                }

                /* Divider */
                .exp5-divider-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin: 22px 0;
                }

                .exp5-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }

                .exp5-divider-text {
                    font-size: 11.5px;
                    font-weight: 800;
                    color: #94a3b8;
                    letter-spacing: 1px;
                }

                /* Google Button */
                .exp5-google-btn {
                    width: 100%;
                    height: 48px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    background: #ffffff;
                    color: #334155;
                    font-size: 13.5px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s ease;
                }

                .exp5-google-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                /* Bottom Link */
                .exp5-bottom-nav {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 24px;
                    font-size: 13px;
                    color: #64748b;
                }

                .exp5-nav-link {
                    color: #16a34a;
                    font-weight: 800;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .exp5-nav-link:hover {
                    color: #15803d;
                    text-decoration: underline;
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .exp5-login-card {
                        grid-template-columns: 1fr;
                        max-width: 500px;
                    }
                    .exp5-brand-panel {
                        display: none;
                    }
                    .exp5-form-panel {
                        padding: 38px 28px;
                    }
                }
            `}</style>

            {/* Background Layers */}
            <div className="exp5-auth-bg-layer" />
            <div className="exp5-auth-radial-overlay" />

            {/* Main Login Card */}
            <div className="exp5-login-card">
                {/* LEFT BRAND PANEL */}
                <div className="exp5-brand-panel">
                    <div className="exp5-ambient-glow" />

                    <div className="exp5-brand-header">
                        <div className="exp5-brand-logo">
                            <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "38px", height: "38px", objectFit: "contain", display: "block" }} />
                        </div>
                        <div className="exp5-brand-titles">
                            <span className="exp5-brand-title">AgriMind AI</span>
                            <span className="exp5-brand-sub">SMART AGRICULTURE</span>
                        </div>
                    </div>

                    <div className="exp5-hero-copy">
                        <div className="exp5-hero-pill">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            Intelligent Crop Intelligence
                        </div>

                        <h1 className="exp5-headline">
                            Farm Smarter.<br />
                            <span>Grow Better.</span>
                        </h1>

                        <p className="exp5-description">
                            Intelligent agriculture technology for healthier crops and smarter farming decisions.
                        </p>

                        <div className="exp5-feature-grid">
                            <div className="exp5-feat-card">
                                <div className="exp5-feat-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <circle cx="10.5" cy="10.5" r="6.5" />
                                        <line x1="21" y1="21" x2="15.5" y2="15.5" />
                                    </svg>
                                </div>
                                <span className="exp5-feat-text">AI Disease Detection</span>
                            </div>

                            <div className="exp5-feat-card">
                                <div className="exp5-feat-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <rect x="3" y="4" width="18" height="16" rx="2" />
                                        <line x1="7" y1="8" x2="17" y2="8" />
                                        <line x1="7" y1="12" x2="17" y2="12" />
                                    </svg>
                                </div>
                                <span className="exp5-feat-text">Smart Crop Management</span>
                            </div>

                            <div className="exp5-feat-card">
                                <div className="exp5-feat-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <span className="exp5-feat-text">Farm Analytics</span>
                            </div>

                            <div className="exp5-feat-card">
                                <div className="exp5-feat-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                </div>
                                <span className="exp5-feat-text">AI Farming Insights</span>
                            </div>
                        </div>
                    </div>

                    <div className="exp5-brand-footer">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>Empowering modern farmers with precision AI</span>
                    </div>
                </div>

                {/* RIGHT LOGIN PANEL */}
                <div className="exp5-form-panel">
                    <div className="exp5-form-header">
                        <div className="exp5-leaf-badge">
                            <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "36px", height: "36px", objectFit: "contain", display: "block" }} />
                        </div>
                        <h2 className="exp5-form-title">Welcome Back</h2>
                        <p className="exp5-form-sub">Sign in to continue to AgriMind AI.</p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="exp5-alert-banner exp5-alert-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="exp5-alert-banner exp5-alert-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="exp5-form-group">
                        <div className="exp5-field-row">
                            <label className="exp5-field-label" htmlFor="login-email">
                                Email Address
                            </label>
                            <div className="exp5-input-wrap">
                                <span className="exp5-input-icon">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </span>
                                <input
                                    id="login-email"
                                    type="email"
                                    className="exp5-login-input"
                                    placeholder="farmer@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="exp5-field-row">
                            <label className="exp5-field-label" htmlFor="login-password">
                                Password
                            </label>
                            <div className="exp5-input-wrap">
                                <span className="exp5-input-icon">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    className="exp5-login-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="exp5-eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="exp5-login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="exp5-spinner" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Login</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="exp5-divider-row">
                        <div className="exp5-divider-line" />
                        <span className="exp5-divider-text">OR</span>
                        <div className="exp5-divider-line" />
                    </div>

                    <button
                        type="button"
                        className="exp5-google-btn"
                        onClick={handleGoogleLogin}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.92 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                            />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <div className="exp5-bottom-nav">
                        <span>Don't have an account?</span>
                        <Link to="/register" className="exp5-nav-link">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
