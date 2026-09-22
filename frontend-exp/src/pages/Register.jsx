import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
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
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
        setSuccess("");
    };

    // =========================================================
    // REGISTRATION HANDLER (100% PRESERVED BACKEND CONTRACT)
    // =========================================================
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
            const response = await fetch("http://127.0.0.1:8000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    password: formData.password,
                }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(data.detail || data.message || "Registration failed. Please try again.");
            }

            setSuccess("Account created successfully! Redirecting to login...");

            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirm_password: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        setError("Google Sign-up is not configured yet. Please register with your email.");
    };

    return (
        <div className="exp-auth-page">
            <style>{`
                /* =========================================================
                   PREMIUM AGRIMIND AI REGISTER EXPERIENCE
                ========================================================= */
                .exp-auth-page {
                    min-height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    background: #032b1f;
                    overflow: hidden;
                    box-sizing: border-box;
                    padding: 24px;
                }

                .auth-bg-layer {
                    position: absolute;
                    inset: 0;
                    background-image: url('/images/auth_farm_bg.jpg');
                    background-size: cover;
                    background-position: center;
                    opacity: 0.38;
                    filter: saturate(1.15) contrast(1.05);
                    transform: scale(1.02);
                }

                .auth-radial-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.22) 0%, transparent 60%),
                                radial-gradient(circle at bottom right, rgba(5, 150, 105, 0.25) 0%, transparent 55%),
                                linear-gradient(135deg, rgba(3, 43, 31, 0.92) 0%, rgba(2, 30, 22, 0.96) 100%);
                }

                .auth-split-wrapper {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 1120px;
                    min-height: 680px;
                    display: grid;
                    grid-template-columns: 1.15fr 1fr;
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 28px;
                    box-shadow: 0 25px 65px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    animation: authEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes authEntrance {
                    from { opacity: 0; transform: translateY(18px) scale(0.985); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* Left Panel */
                .auth-left-brand-panel {
                    position: relative;
                    padding: 48px 44px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: linear-gradient(150deg, #064e3b 0%, #04382a 50%, #02261c 100%);
                    color: #ffffff;
                    overflow: hidden;
                }

                .left-panel-ambient-glow {
                    position: absolute;
                    bottom: -80px;
                    left: -80px;
                    width: 320px;
                    height: 320px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, transparent 70%);
                    pointer-events: none;
                }

                .auth-brand-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 2;
                }

                .brand-logo-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .brand-text-block {
                    display: flex;
                    flex-direction: column;
                }

                .brand-title {
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: -0.4px;
                    color: #ffffff;
                    line-height: 1.1;
                }

                .brand-sub {
                    font-size: 9.5px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: #6ee7b7;
                    text-transform: uppercase;
                    margin-top: 2px;
                }

                .auth-hero-copy {
                    z-index: 2;
                    margin: 30px 0;
                }

                .hero-pill-badge {
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

                .hero-headline {
                    font-size: 38px;
                    font-weight: 900;
                    line-height: 1.15;
                    letter-spacing: -1px;
                    color: #ffffff;
                    margin-bottom: 14px;
                }

                .hero-headline span {
                    background: linear-gradient(120deg, #34d399 0%, #a7f3d0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-description {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #d1fae5;
                    opacity: 0.9;
                    max-width: 440px;
                    margin-bottom: 26px;
                }

                .brand-feature-list {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    z-index: 2;
                }

                .brand-feat-card {
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

                .brand-feat-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(52, 211, 153, 0.4);
                    transform: translateY(-2px);
                }

                .feat-icon-bubble {
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

                .feat-title-txt {
                    font-size: 12px;
                    font-weight: 700;
                    color: #ffffff;
                }

                .brand-bottom-trust {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #a7f3d0;
                    opacity: 0.8;
                    z-index: 2;
                    margin-top: 18px;
                }

                /* Right Panel */
                .auth-right-form-panel {
                    padding: 44px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: #ffffff;
                }

                .form-header-block {
                    margin-bottom: 22px;
                }

                .form-leaf-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 14px;
                }

                .form-main-heading {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.6px;
                    margin-bottom: 6px;
                }

                .form-subheading {
                    font-size: 13.5px;
                    color: #64748b;
                }

                .auth-message-banner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 11px 16px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 18px;
                    animation: bannerFade 0.25s ease;
                }

                @keyframes bannerFade {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .banner-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                }

                .banner-success {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #15803d;
                }

                .auth-form-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .form-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .field-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #334155;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .field-lead-icon {
                    position: absolute;
                    left: 14px;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                }

                .auth-input-control {
                    width: 100%;
                    height: 46px;
                    padding: 0 44px 0 42px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    background: #f8fafc;
                    font-size: 13.5px;
                    color: #0f172a;
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: inherit;
                }

                .auth-input-control:hover {
                    border-color: #cbd5e1;
                    background: #ffffff;
                }

                .auth-input-control:focus {
                    border-color: #16a34a;
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
                }

                .pw-toggle-btn {
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

                .pw-toggle-btn:hover {
                    color: #334155;
                }

                .btn-auth-primary {
                    width: 100%;
                    height: 48px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    color: #ffffff;
                    font-size: 14px;
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

                .btn-auth-primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #15803d 0%, #166534 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 10px 24px rgba(22, 163, 74, 0.38);
                }

                .btn-auth-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .auth-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2.5px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .auth-divider-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin: 18px 0;
                }

                .auth-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }

                .auth-divider-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    letter-spacing: 1px;
                }

                .btn-google-auth {
                    width: 100%;
                    height: 46px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    background: #ffffff;
                    color: #334155;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s ease;
                }

                .btn-google-auth:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .auth-bottom-nav {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 18px;
                    font-size: 13px;
                    color: #64748b;
                }

                .auth-nav-link {
                    color: #16a34a;
                    font-weight: 800;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .auth-nav-link:hover {
                    color: #15803d;
                    text-decoration: underline;
                }

                @media (max-width: 900px) {
                    .auth-split-wrapper {
                        grid-template-columns: 1fr;
                        max-width: 500px;
                    }
                    .auth-left-brand-panel {
                        display: none;
                    }
                    .auth-right-form-panel {
                        padding: 34px 26px;
                    }
                }
            `}</style>

            <div className="auth-bg-layer" />
            <div className="auth-radial-overlay" />

            <div className="auth-split-wrapper">
                {/* LEFT BRAND PANEL */}
                <div className="auth-left-brand-panel">
                    <div className="left-panel-ambient-glow" />

                    <div className="auth-brand-header">
                        <div className="brand-logo-icon">
                            <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "38px", height: "38px", objectFit: "contain", display: "block" }} />
                        </div>
                        <div className="brand-text-block">
                            <span className="brand-title">AgriMind AI</span>
                            <span className="brand-sub">SMART AGRICULTURE</span>
                        </div>
                    </div>

                    <div className="auth-hero-copy">
                        <div className="hero-pill-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            Join the Smart Farming Revolution
                        </div>

                        <h1 className="hero-headline">
                            Grow Smarter.<br />
                            <span>Farm Better.</span>
                        </h1>

                        <p className="hero-description">
                            Join AgriMind AI and manage your farming intelligence, crop diagnosis, and field recommendations all in one place.
                        </p>

                        <div className="brand-feature-list">
                            <div className="brand-feat-card">
                                <div className="feat-icon-bubble">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <circle cx="10.5" cy="10.5" r="6.5" />
                                        <line x1="21" y1="21" x2="15.5" y2="15.5" />
                                    </svg>
                                </div>
                                <span className="feat-title-txt">Instant Disease Diagnosis</span>
                            </div>

                            <div className="brand-feat-card">
                                <div className="feat-icon-bubble">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <rect x="3" y="4" width="18" height="16" rx="2" />
                                        <line x1="7" y1="8" x2="17" y2="8" />
                                        <line x1="7" y1="12" x2="17" y2="12" />
                                    </svg>
                                </div>
                                <span className="feat-title-txt">Crop Growth Tracking</span>
                            </div>

                            <div className="brand-feat-card">
                                <div className="feat-icon-bubble">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <span className="feat-title-txt">Health Risk Analytics</span>
                            </div>

                            <div className="brand-feat-card">
                                <div className="feat-icon-bubble">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                </div>
                                <span className="feat-title-txt">24/7 AI Farming Assistant</span>
                            </div>
                        </div>
                    </div>

                    <div className="brand-bottom-trust">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>Protected by enterprise-grade agricultural data security</span>
                    </div>
                </div>

                {/* RIGHT REGISTER FORM */}
                <div className="auth-right-form-panel">
                    <div className="form-header-block">
                        <div className="form-leaf-icon">
                            <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "36px", height: "36px", objectFit: "contain", display: "block" }} />
                        </div>
                        <h2 className="form-main-heading">Create your account</h2>
                        <p className="form-subheading">Join AgriMind AI and manage your farming intelligence in one place.</p>
                    </div>

                    {error && (
                        <div className="auth-message-banner banner-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="auth-message-banner banner-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="auth-form-fields">
                        <div className="form-field-group">
                            <label className="field-label" htmlFor="register-fullname">
                                Full Name
                            </label>
                            <div className="input-wrapper">
                                <span className="field-lead-icon">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    id="register-fullname"
                                    type="text"
                                    name="full_name"
                                    className="auth-input-control"
                                    placeholder="e.g. Ramesh Patel"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-field-group">
                            <label className="field-label" htmlFor="register-email">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <span className="field-lead-icon">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </span>
                                <input
                                    id="register-email"
                                    type="email"
                                    name="email"
                                    className="auth-input-control"
                                    placeholder="farmer@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-field-group">
                            <label className="field-label" htmlFor="register-password">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <span className="field-lead-icon">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="auth-input-control"
                                    placeholder="At least 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="pw-toggle-btn"
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

                        <div className="form-field-group">
                            <label className="field-label" htmlFor="register-confirm-password">
                                Confirm Password
                            </label>
                            <div className="input-wrapper">
                                <span className="field-lead-icon">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="register-confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    className="auth-input-control"
                                    placeholder="Re-enter your password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="pw-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirmPassword ? (
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
                            className="btn-auth-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-spinner" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider-row">
                        <div className="auth-divider-line" />
                        <span className="auth-divider-label">OR</span>
                        <div className="auth-divider-line" />
                    </div>

                    <button
                        type="button"
                        className="btn-google-auth"
                        onClick={handleGoogleRegister}
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

                    <div className="auth-bottom-nav">
                        <span>Already have an account?</span>
                        <Link to="/login" className="auth-nav-link">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
