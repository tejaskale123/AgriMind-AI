import { NavLink, useNavigate } from "react-router-dom";
import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="exp-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <img src="/images/agrimind-logo.png" alt="AgriMind Logo" className="brand-logo-img" style={{ width: "32px", height: "32px", objectFit: "contain", display: "block" }} />
        </div>
        <div className="brand-text">
          <span className="brand-title">AgriMind</span>
          <span className="brand-subtitle">SMART AGRICULTURE</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink to="/detection" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <path d="m15 15 5 5" />
              <path d="M10.5 8v5" />
              <path d="M8 10.5h5" />
            </svg>
          </div>
          <span className="nav-label">Disease Detection</span>
        </NavLink>

        <NavLink to="/crops" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
              <path d="M4 21c3-4 6.5-6.5 11-9" />
            </svg>
          </div>
          <span className="nav-label">My Crops</span>
        </NavLink>

        <NavLink to="/management" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 8h10" />
              <path d="M7 12h10" />
              <path d="M7 16h6" />
            </svg>
          </div>
          <span className="nav-label">Crop Management</span>
        </NavLink>

        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <span className="nav-label">Detection History</span>
        </NavLink>

        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <span className="nav-label">Farm Analytics</span>
        </NavLink>

        <NavLink to="/insights" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.1 1.8 5.8 4.4 7.1V19a2 2 0 0 0 2 2h3.2a2 2 0 0 0 2-2v-1.9c2.6-1.3 4.4-4 4.4-7.1a8 8 0 0 0-8-8z" />
              <path d="M9 22h6" />
            </svg>
          </div>
          <span className="nav-label">AI Farming Insights</span>
        </NavLink>

        <NavLink to="/weather" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
          <span className="nav-label">Weather Advisory</span>
        </NavLink>

        <NavLink to="/learning-hub" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
          </div>
          <span className="nav-label">Learning Hub</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <div className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </div>
          <span className="nav-label">Settings</span>
        </NavLink>
      </nav>

      {/* Sidebar Logout Button (Clean, compact, and full-width) */}
      <div className="sidebar-logout-wrapper">
        <button
          type="button"
          className="sidebar-logout-action-btn"
          onClick={handleLogout}
          title="Sign out of AgriMind AI"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>

      {/* Footer Version Info */}
      <div className="sidebar-footer">
        <div className="footer-meta">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
            <path d="M4 21c3-4 6.5-6.5 11-9" />
          </svg>
          <span>AgriMind AI v1.0.0</span>
        </div>
        <div className="footer-sub">Made with <span className="heart">❤️</span> for Farmers</div>
      </div>
    </aside>
  );
}
