import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfileMenu({ variant = "topbar", customClassName = "" }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const [user, setUser] = useState({
        name: "Tejas Kale",
        role: "Farmer",
        email: "farmer@test.com",
        avatar: "/images/farmer_avatar.jpg",
    });

    useEffect(() => {
        try {
            const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser((prev) => ({
                    ...prev,
                    name: parsed.full_name || parsed.name || parsed.username || prev.name,
                    role: parsed.role || prev.role,
                    email: parsed.email || prev.email,
                    avatar: parsed.avatar || prev.avatar,
                }));
            }
        } catch (e) {
            // Keep default
        }
    }, []);

    // Close on click outside or Escape
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleLogout = (e) => {
        e?.stopPropagation();
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        sessionStorage.clear();
        navigate("/login");
    };

    const toggleMenu = (e) => {
        e?.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    return (
        <div
            className={`agrimind-profile-container ${variant} ${customClassName}`}
            ref={menuRef}
        >
            {/* Trigger Button */}
            <button
                type="button"
                className={`agrimind-profile-trigger ${variant}-trigger ${isOpen ? "active" : ""}`}
                onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-haspopup="true"
                title="Account Menu"
            >
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="agrimind-profile-avatar-img"
                    onError={(e) => {
                        e.currentTarget.src = "/images/farmer_avatar.jpg";
                    }}
                />
                <div className="agrimind-profile-trigger-meta">
                    <span className="agrimind-profile-trigger-name">{user.name}</span>
                    <span className="agrimind-profile-trigger-role">{user.role}</span>
                </div>
                {variant === "sidebar" ? (
                    <div className="agrimind-sidebar-trigger-actions">
                        <svg
                            className="agrimind-dots-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <circle cx="12" cy="5" r="2.2" />
                            <circle cx="12" cy="12" r="2.2" />
                            <circle cx="12" cy="19" r="2.2" />
                        </svg>
                    </div>
                ) : (
                    <svg
                        className={`agrimind-profile-arrow ${isOpen ? "rotated" : ""}`}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className={`agrimind-profile-dropdown ${variant}-dropdown`}>
                    {/* User Summary Header */}
                    <div className="agrimind-dropdown-user-header">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="agrimind-dropdown-avatar"
                            onError={(e) => {
                                e.currentTarget.src = "/images/farmer_avatar.jpg";
                            }}
                        />
                        <div className="agrimind-dropdown-user-info">
                            <h4 className="agrimind-dropdown-name">{user.name}</h4>
                            <div className="agrimind-dropdown-badge-row">
                                <span className="agrimind-dropdown-role-badge">{user.role}</span>
                            </div>
                            <p className="agrimind-dropdown-email">{user.email}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="agrimind-dropdown-divider" />

                    {/* Logout Action */}
                    <button
                        type="button"
                        className="agrimind-dropdown-logout-btn"
                        onClick={handleLogout}
                    >
                        <svg
                            width="16"
                            height="16"
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
            )}
        </div>
    );
}
