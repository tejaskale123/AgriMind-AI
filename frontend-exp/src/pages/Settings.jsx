import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const API_BASE_URL = "http://127.0.0.1:8000";

const DEFAULT_SETTINGS = {
    confidenceThreshold: 70,
    autoHistory: true,
    showProbabilities: true,
    notifications: true,
    language: "English",
    theme: "Light",
};

const DEFAULT_USER = {
    full_name: "Farmer",
    email: "farmer@agrimind.ai",
    role: "Farmer",
    status: "Active",
    accountType: "Farmer",
    created_at: new Date().toISOString(),
    userId: "#AGM-0001",
    avatar: "/images/farmer_avatar.jpg",
};

function getStoredSettings() {
    try {
        const stored = localStorage.getItem("agrimind_settings");
        if (!stored) return { ...DEFAULT_SETTINGS };
        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(stored),
        };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("agrimind-light", "agrimind-dark");
    body.classList.remove("agrimind-light", "agrimind-dark");

    let finalTheme = theme;
    if (theme === "System") {
        finalTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "Dark"
            : "Light";
    }

    html.classList.add(finalTheme === "Dark" ? "agrimind-dark" : "agrimind-light");
    body.classList.add(finalTheme === "Dark" ? "agrimind-dark" : "agrimind-light");
    html.setAttribute("data-theme", finalTheme === "Dark" ? "dark" : "light");
}

function getAuthToken() {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("agrimind_token") ||
        ""
    );
}

function formatMemberSince(dateStr) {
    if (!dateStr) return "Recently Joined";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Recently Joined";
        return d.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    } catch {
        return "Recently Joined";
    }
}

export default function Settings() {
    const navigate = useNavigate();
    const { language: ctxLanguage, setLanguage: setCtxLanguage } = useLanguage();

    const [settings, setSettings] = useState(getStoredSettings);
    const [user, setUser] = useState(DEFAULT_USER);
    const [profileLoading, setProfileLoading] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [modelInfo, setModelInfo] = useState({
        modelName: "EfficientNet-B0",
        supportedCropsCount: "4+ Crops",
        cropsList: "Cotton, Soybean, Maize, Wheat",
        imageSize: "224 × 224",
        device: "CPU / CUDA",
        status: "Model Ready",
        accuracy: "98.4%"
    });

    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [historyClearedMsg, setHistoryClearedMsg] = useState(false);

    // Edit Profile Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: "",
        avatar: "/images/farmer_avatar.jpg"
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    // Global Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    // Sync theme
    useEffect(() => {
        applyTheme(settings.theme);
    }, [settings.theme]);

    // Load Authenticated User & Backend Settings & Model Info
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            const token = getAuthToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // 1. Fetch User Profile
            try {
                setProfileLoading(true);
                const res = await fetch(`${API_BASE_URL}/auth/me`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user && isMounted) {
                        setUser(data.user);
                        setEditForm({
                            full_name: data.user.full_name || "",
                            avatar: data.user.avatar || "/images/farmer_avatar.jpg"
                        });
                        // Sync localStorage
                        localStorage.setItem("user", JSON.stringify(data.user));
                    }
                }
            } catch (err) {
                console.error("Failed to load user profile:", err);
            } finally {
                if (isMounted) setProfileLoading(false);
            }

            // 2. Fetch User Settings from Backend
            try {
                setSettingsLoading(true);
                const res = await fetch(`${API_BASE_URL}/settings`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.settings && isMounted) {
                        setSettings((prev) => ({
                            ...prev,
                            ...data.settings
                        }));
                        localStorage.setItem("agrimind_settings", JSON.stringify(data.settings));
                    }
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                if (isMounted) setSettingsLoading(false);
            }

            // 3. Fetch Model Info from Backend
            try {
                const res = await fetch(`${API_BASE_URL}/system/model-info`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && isMounted) {
                        const cropNames = Object.keys(data.supported_crops || {}).map(
                            c => c.charAt(0).toUpperCase() + c.slice(1)
                        );
                        setModelInfo({
                            modelName: data.model_architecture || "EfficientNet-B0",
                            supportedCropsCount: `${data.crop_count || 4}+ Crops`,
                            cropsList: cropNames.length > 0 ? cropNames.join(", ") : "Cotton, Soybean, Maize, Wheat",
                            imageSize: `${data.input_image_size || 224} × ${data.input_image_size || 224}`,
                            device: (data.device || "CPU").toUpperCase(),
                            status: data.status || "Model Ready",
                            accuracy: "98.4%"
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load model info:", err);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Search Execution with Debounce
    const executeSearch = useCallback(async (query) => {
        const trimmed = (query || "").trim();
        if (!trimmed || trimmed.length < 2) {
            setSearchResults(null);
            setIsSearching(false);
            setSearchError(null);
            return;
        }

        setIsSearching(true);
        setSearchError(null);

        try {
            const token = getAuthToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(trimmed)}`, {
                headers
            });

            if (!res.ok) {
                throw new Error(`Search request failed (${res.status})`);
            }

            const data = await res.json();
            if (data && data.success) {
                setSearchResults(data);
            } else {
                setSearchResults(null);
            }
        } catch (err) {
            console.error("Settings Search Error:", err);
            setSearchError("Search temporarily unavailable. Please try again.");
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (trimmed.length < 2) {
            setSearchResults(null);
            setIsSearching(false);
            setSearchError(null);
            return;
        }

        const timer = setTimeout(() => {
            executeSearch(trimmed);
        }, 280);

        return () => clearTimeout(timer);
    }, [searchQuery, executeSearch]);

    // Click outside search
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setShowSearchDropdown(false);
                setShowEditModal(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter" && searchResults && searchResults.results) {
            const { crops, diseases, history, insights, advice } = searchResults.results;
            const directMatch = crops?.[0] || diseases?.[0] || history?.[0] || insights?.[0] || advice?.[0];
            if (directMatch && directMatch.route) {
                setShowSearchDropdown(false);
                navigate(directMatch.route);
            }
        }
    };

    const handleResultClick = (route) => {
        setShowSearchDropdown(false);
        if (route) {
            navigate(route);
        }
    };

    const updateSetting = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Save Settings to Backend + Local Storage
    const handleSaveSettings = async () => {
        setIsSaving(true);
        setMessage("");

        // Local cache
        localStorage.setItem("agrimind_settings", JSON.stringify(settings));
        localStorage.setItem("agrimind_confidence_threshold", String(settings.confidenceThreshold));
        localStorage.setItem("agrimind_auto_history", String(settings.autoHistory));
        localStorage.setItem("agrimind_show_probabilities", String(settings.showProbabilities));
        localStorage.setItem("agrimind_notifications", String(settings.notifications));
        localStorage.setItem("agrimind_language", settings.language);
        localStorage.setItem("agrimind_theme", settings.theme);

        if (settings.language === "Marathi") setCtxLanguage("mr");
        else if (settings.language === "Hindi") setCtxLanguage("hi");
        else setCtxLanguage("en");

        window.dispatchEvent(
            new CustomEvent("agrimind-settings-changed", {
                detail: settings,
            })
        );

        try {
            const token = getAuthToken();
            if (token) {
                const payload = {
                    confidence_threshold: settings.confidenceThreshold,
                    auto_history: settings.autoHistory,
                    show_probabilities: settings.showProbabilities,
                    notifications: settings.notifications,
                    language: settings.language,
                    theme: settings.theme,
                };

                const res = await fetch(`${API_BASE_URL}/settings`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    setMessage("Settings saved and persisted successfully.");
                } else {
                    setMessage("Settings saved locally.");
                }
            } else {
                setMessage("Settings saved locally.");
            }
        } catch (err) {
            console.error("Save settings error:", err);
            setMessage("Settings saved locally (offline mode).");
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(""), 3500);
        }
    };

    // Reset Settings
    const handleResetSettings = async () => {
        setSettings({ ...DEFAULT_SETTINGS });
        localStorage.removeItem("agrimind_settings");
        localStorage.removeItem("agrimind_confidence_threshold");
        localStorage.removeItem("agrimind_auto_history");
        localStorage.removeItem("agrimind_show_probabilities");
        localStorage.removeItem("agrimind_notifications");
        localStorage.removeItem("agrimind_language");
        localStorage.removeItem("agrimind_theme");

        applyTheme("Light");
        setCtxLanguage("en");

        window.dispatchEvent(
            new CustomEvent("agrimind-settings-changed", {
                detail: DEFAULT_SETTINGS,
            })
        );

        try {
            const token = getAuthToken();
            if (token) {
                await fetch(`${API_BASE_URL}/settings`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        confidence_threshold: 70,
                        auto_history: true,
                        show_probabilities: true,
                        notifications: true,
                        language: "English",
                        theme: "Light"
                    })
                });
            }
        } catch (e) {
            console.warn("Reset sync warning:", e);
        }

        setMessage("Settings reset to defaults.");
        setTimeout(() => setMessage(""), 3500);
    };

    // Save Profile Update Modal
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setEditError("");

        const trimmedName = editForm.full_name.trim();
        if (!trimmedName || trimmedName.length < 2) {
            setEditError("Full name must be at least 2 characters.");
            return;
        }

        setEditLoading(true);

        try {
            const token = getAuthToken();
            if (!token) {
                setEditError("Authentication required. Please log in.");
                setEditLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: trimmedName,
                    avatar: editForm.avatar
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || "Failed to update profile.");
            }

            if (data.user) {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.dispatchEvent(new CustomEvent("agrimind-profile-updated", { detail: data.user }));
            }

            setShowEditModal(false);
            setMessage("Profile updated successfully.");
            setTimeout(() => setMessage(""), 3500);
        } catch (err) {
            console.error("Profile update error:", err);
            setEditError(err.message || "An unexpected error occurred.");
        } finally {
            setEditLoading(false);
        }
    };

    // Clear Detection History
    const handleClearData = async () => {
        if (!window.confirm("Are you sure you want to clear your crop detection history? This action cannot be undone.")) {
            return;
        }

        try {
            const token = getAuthToken();
            if (token) {
                await fetch(`${API_BASE_URL}/history`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (e) {
            console.warn("Backend clear failed, clearing local state", e);
        }

        setHistoryClearedMsg(true);
        setTimeout(() => setHistoryClearedMsg(false), 4000);
    };

    const Toggle = ({ checked, onChange, id }) => (
        <button
            id={id}
            type="button"
            className={`settings-toggle-btn ${checked ? "active" : ""}`}
            onClick={() => onChange(!checked)}
            aria-pressed={checked}
        >
            <span className="toggle-track">
                <span className="toggle-thumb" />
            </span>
        </button>
    );

    const AVATAR_OPTIONS = [
        "/images/farmer_avatar.jpg",
        "/images/crop_soybean.jpg",
        "/images/crop_cotton.jpg",
        "/images/crop_maize.jpg"
    ];

    return (
        <div className="exp-settings-page">
            <style>{`
                /* =========================================================
                   SETTINGS PAGE - MATCHING EXACT MOCKUP AESTHETICS
                ========================================================= */
                .exp-settings-page {
                    width: 100%;
                    min-height: 100%;
                    background: #f4fbf7;
                    padding: 24px 36px 60px 36px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    box-sizing: border-box;
                    color: #1e293b;
                    position: relative;
                }

                /* Top Navigation / Search Header */
                .settings-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 4px;
                    position: relative;
                    z-index: 100;
                }

                .topbar-search-container {
                    position: relative;
                    width: 480px;
                }

                .topbar-search-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 999px;
                    padding: 10px 20px;
                    width: 100%;
                    box-sizing: border-box;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    transition: all 0.2s;
                }

                .topbar-search-box:focus-within {
                    border-color: #16a34a;
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
                }

                .topbar-search-box input {
                    border: none;
                    outline: none;
                    background: transparent;
                    width: 100%;
                    font-size: 13.5px;
                    color: #1e293b;
                }

                .search-clear-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 0 4px;
                }
                .search-clear-btn:hover {
                    color: #0f172a;
                }

                .topbar-user-area {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .notif-btn {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #475569;
                    transition: background 0.2s;
                }
                .notif-btn:hover {
                    background: #f8fafc;
                }

                .notif-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #ef4444;
                    color: #ffffff;
                    font-size: 10.5px;
                    font-weight: 800;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #ffffff;
                }

                .profile-pill {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    padding: 4px 14px 4px 5px;
                    border-radius: 999px;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .profile-pill:hover {
                    border-color: #cbd5e1;
                }

                .profile-img {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .profile-info {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }

                .profile-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.2;
                }

                .profile-tag {
                    font-size: 11px;
                    color: #16a34a;
                    font-weight: 600;
                }

                .lang-header-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 999px;
                    padding: 8px 14px;
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .lang-header-pill:hover {
                    background: #f8fafc;
                }

                /* ================= MAIN HEADER WITH AI SYSTEM READY ================= */
                .settings-header-banner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #ffffff;
                    border: 1px solid #e2ece6;
                    border-radius: 20px;
                    padding: 22px 28px;
                    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.04);
                }

                .header-left-content {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }

                .header-leaf-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    background: #e8f7ee;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .header-titles {
                    display: flex;
                    flex-direction: column;
                }

                .header-eyebrow {
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.2px;
                    color: #16a34a;
                    text-transform: uppercase;
                    margin-bottom: 3px;
                }

                .header-main-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f291e;
                    margin: 0 0 4px 0;
                    letter-spacing: -0.5px;
                }

                .header-subtitle {
                    font-size: 13.5px;
                    color: #64748b;
                    margin: 0;
                }

                .header-status-pill {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 16px;
                    padding: 12px 18px;
                }

                .status-pulse-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #16a34a;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
                    animation: pulseDot 2s infinite ease-in-out;
                }

                @keyframes pulseDot {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                .status-pill-text {
                    display: flex;
                    flex-direction: column;
                }

                .status-pill-title {
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #15803d;
                }

                .status-pill-sub {
                    font-size: 11.5px;
                    color: #64748b;
                }

                /* ================= 2-COLUMN SETTINGS GRID ================= */
                .settings-grid-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .settings-card {
                    background: #ffffff;
                    border: 1px solid #e2ece6;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.03);
                    display: flex;
                    flex-direction: column;
                }

                .card-header-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .card-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .card-header-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    background: #e8f7ee;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card-header-text h3 {
                    font-size: 17px;
                    font-weight: 800;
                    color: #0f291e;
                    margin: 0 0 2px 0;
                }

                .card-header-text p {
                    font-size: 12.5px;
                    color: #64748b;
                    margin: 0;
                }

                .badge-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    background: #f8fafc;
                    color: #1e293b;
                    font-size: 12.5px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .badge-btn:hover {
                    background: #e2e8f0;
                    border-color: #94a3b8;
                }

                .badge-pill-ready {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 999px;
                    background: #ecfdf5;
                    border: 1px solid #bbf7d0;
                    color: #15803d;
                    font-size: 12px;
                    font-weight: 700;
                }

                /* Farmer Profile Card */
                .profile-content-split {
                    display: grid;
                    grid-template-columns: 180px 1fr;
                    gap: 24px;
                    align-items: center;
                }

                .profile-avatar-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .avatar-wrapper {
                    position: relative;
                    margin-bottom: 12px;
                }

                .large-avatar-img {
                    width: 96px;
                    height: 96px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #16a34a;
                    box-shadow: 0 4px 14px rgba(22, 163, 74, 0.15);
                }

                .avatar-camera-btn {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #0f291e;
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .avatar-camera-btn:hover {
                    background: #16a34a;
                }

                .profile-user-identity {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                }

                .farmer-name-verified {
                    font-size: 16px;
                    font-weight: 800;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .verified-check-badge {
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                }

                .farmer-email-txt {
                    font-size: 12px;
                    color: #64748b;
                }

                .active-status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 10px;
                    border-radius: 999px;
                    background: #dcfce7;
                    color: #15803d;
                    font-size: 11px;
                    font-weight: 700;
                    margin-top: 6px;
                }

                .farmer-sub-role {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    color: #475569;
                    font-weight: 600;
                    margin-top: 4px;
                }

                .profile-meta-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .meta-tile {
                    background: #f8fafc;
                    border: 1px solid #edf2f7;
                    border-radius: 14px;
                    padding: 12px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .meta-tile-label {
                    font-size: 11.5px;
                    color: #64748b;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .meta-tile-value {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #0f172a;
                }

                /* AI Model Grid */
                .ai-model-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 14px;
                }

                .model-box {
                    background: #f8fafc;
                    border: 1px solid #edf2f7;
                    border-radius: 14px;
                    padding: 14px;
                    display: flex;
                    gap: 12px;
                }

                .model-box-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #e8f7ee;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .model-box-content {
                    display: flex;
                    flex-direction: column;
                }

                .model-box-label {
                    font-size: 11.5px;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 2px;
                }

                .model-box-val {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 2px;
                }

                .model-box-desc {
                    font-size: 11.5px;
                    color: #94a3b8;
                }

                /* Detection Settings Controls */
                .detection-controls-list {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .control-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .control-row:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .control-info {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    flex: 1;
                }

                .control-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    background: #e8f7ee;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .control-text h4 {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }

                .control-text p {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                }

                .slider-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    width: 240px;
                }

                .custom-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 6px;
                    border-radius: 5px;
                    background: #cbd5e1;
                    outline: none;
                    transition: background 0.2s;
                }

                .custom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #16a34a;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }

                .slider-badge-val {
                    background: #e8f7ee;
                    color: #16a34a;
                    font-weight: 800;
                    font-size: 13px;
                    padding: 4px 10px;
                    border-radius: 8px;
                    min-width: 44px;
                    text-align: center;
                }

                /* Toggle Button */
                .settings-toggle-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    outline: none;
                }

                .toggle-track {
                    display: block;
                    width: 46px;
                    height: 26px;
                    border-radius: 13px;
                    background: #cbd5e1;
                    position: relative;
                    transition: background 0.25s ease;
                }

                .settings-toggle-btn.active .toggle-track {
                    background: #16a34a;
                }

                .toggle-thumb {
                    display: block;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #ffffff;
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    transition: transform 0.25s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }

                .settings-toggle-btn.active .toggle-thumb {
                    transform: translateX(20px);
                }

                /* Appearance & Language Section */
                .theme-options-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .theme-card-option {
                    background: #ffffff;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 14px 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .theme-card-option:hover {
                    border-color: #cbd5e1;
                    background: #f8fafc;
                }

                .theme-card-option.selected {
                    border-color: #16a34a;
                    background: #f0fdf4;
                    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
                }

                .theme-card-option .theme-check-icon {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    color: #16a34a;
                }

                .theme-opt-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                }

                .language-options-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .lang-card-option {
                    background: #ffffff;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 12px 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .lang-card-option:hover {
                    border-color: #cbd5e1;
                    background: #f8fafc;
                }

                .lang-card-option.selected {
                    border-color: #16a34a;
                    background: #f0fdf4;
                    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
                }

                .lang-card-option .lang-check-icon {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    color: #16a34a;
                }

                .lang-flag-emoji {
                    font-size: 20px;
                }

                .lang-opt-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                }

                /* System Information */
                .system-info-tiles {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }

                .system-tile {
                    background: #f8fafc;
                    border: 1px solid #edf2f7;
                    border-radius: 14px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .system-tile-top {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11.5px;
                    color: #64748b;
                    font-weight: 600;
                }

                .system-tile-val {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .system-tile-status {
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-top: 2px;
                }

                .status-dot-green {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #16a34a;
                }

                /* Data & Privacy Section */
                .data-privacy-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .privacy-item-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f8fafc;
                    border: 1px solid #edf2f7;
                    border-radius: 14px;
                    padding: 12px 16px;
                }

                .privacy-item-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .privacy-item-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    background: #e8f7ee;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .privacy-item-text h4 {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }

                .privacy-item-text p {
                    font-size: 11.5px;
                    color: #64748b;
                    margin: 0;
                }

                .btn-view-data {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #334155;
                    cursor: pointer;
                }

                .btn-view-data:hover {
                    background: #f1f5f9;
                }

                .btn-clear-danger {
                    background: #ef4444;
                    color: #ffffff;
                    border: none;
                    padding: 7px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .btn-clear-danger:hover {
                    background: #dc2626;
                }

                /* Bottom Footer Actions */
                .settings-bottom-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #ffffff;
                    border: 1px solid #e2ece6;
                    border-radius: 18px;
                    padding: 18px 24px;
                    margin-top: 4px;
                }

                .footer-brand-note {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .footer-leaf-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: #e8f7ee;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .footer-note-text h5 {
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #0f291e;
                    margin: 0 0 2px 0;
                }

                .footer-note-text p {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                }

                .footer-actions-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-reset-default {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 12px;
                    border: 1.5px solid #cbd5e1;
                    background: #ffffff;
                    color: #334155;
                    font-size: 13.5px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-reset-default:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }

                .btn-save-settings {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 24px;
                    border-radius: 12px;
                    border: none;
                    background: #16a34a;
                    color: #ffffff;
                    font-size: 13.5px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(22, 163, 74, 0.25);
                    transition: all 0.2s;
                }

                .btn-save-settings:hover:not(:disabled) {
                    background: #15803d;
                    transform: translateY(-1px);
                }

                .btn-save-settings:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* Notification / Success Pill */
                .save-feedback-banner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #ecfdf5;
                    border: 1px solid #86efac;
                    color: #15803d;
                    padding: 12px 20px;
                    border-radius: 14px;
                    font-size: 13.5px;
                    font-weight: 700;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Modal Styling */
                .settings-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.55);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.2s ease;
                }

                .settings-modal-card {
                    background: #ffffff;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    border: 1px solid #e2ece6;
                    overflow: hidden;
                    animation: modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes modalScaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .modal-title-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .modal-title-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #e8f7ee;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-header h3 {
                    font-size: 17px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .modal-close-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 4px;
                }
                .modal-close-btn:hover {
                    color: #0f172a;
                }

                .modal-body {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .modal-avatar-picker {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .avatar-preview-img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #16a34a;
                }

                .avatar-options-list {
                    display: flex;
                    gap: 10px;
                }

                .avatar-thumb-btn {
                    border: 2px solid transparent;
                    border-radius: 50%;
                    padding: 2px;
                    background: none;
                    cursor: pointer;
                }

                .avatar-thumb-btn.selected {
                    border-color: #16a34a;
                }

                .avatar-thumb-img {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                    display: block;
                }

                .modal-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .modal-form-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                }

                .modal-input {
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 10px 14px;
                    font-size: 14px;
                    color: #0f172a;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .modal-input:focus {
                    border-color: #16a34a;
                    background: #ffffff;
                }

                .modal-input:disabled {
                    background: #f1f5f9;
                    color: #64748b;
                    cursor: not-allowed;
                }

                .modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 16px 24px;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                }

                .btn-cancel {
                    padding: 9px 18px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #475569;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .btn-save-modal {
                    padding: 9px 22px;
                    border-radius: 10px;
                    border: none;
                    background: #16a34a;
                    color: #ffffff;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-save-modal:hover:not(:disabled) {
                    background: #15803d;
                }
                .btn-save-modal:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .modal-error-alert {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 12.5px;
                    font-weight: 600;
                }

                /* Responsive */
                @media (max-width: 1100px) {
                    .settings-grid-layout {
                        grid-template-columns: 1fr;
                    }
                    .topbar-search-container {
                        width: 100%;
                        max-width: 360px;
                    }
                    .system-info-tiles {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>

            {/* ================= TOPBAR ================= */}
            <div className="settings-topbar">
                <div className="topbar-search-container" ref={searchContainerRef}>
                    <div className="topbar-search-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search crops, diseases, or anything..."
                            value={searchQuery}
                            onFocus={() => setShowSearchDropdown(true)}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearchDropdown(true);
                            }}
                            onKeyDown={handleSearchKeyDown}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                type="button"
                                aria-label="Clear search"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchResults(null);
                                    setShowSearchDropdown(false);
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Global Search Dropdown */}
                    {showSearchDropdown && searchQuery.trim().length >= 2 && (
                        <div className="dashboard-search-dropdown">
                            {isSearching && (
                                <div className="search-status-box search-loading">
                                    <div className="search-spinner"></div>
                                    <span>Searching AgriMind ecosystem...</span>
                                </div>
                            )}

                            {!isSearching && searchError && (
                                <div className="search-status-box search-error">
                                    <div className="search-error-text">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <span>{searchError}</span>
                                    </div>
                                    <button
                                        className="search-retry-btn"
                                        type="button"
                                        onClick={() => executeSearch(searchQuery)}
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!isSearching && !searchError && searchResults && searchResults.total === 0 && (
                                <div className="search-status-box search-empty">
                                    <div className="search-empty-icon">🔍</div>
                                    <div className="search-empty-title">No matching results found</div>
                                    <p className="search-empty-sub">
                                        Try searching for crops (e.g. <em>Cotton, Soybean</em>), diseases (e.g. <em>Bacterial Blight, Rust</em>), or <em>weather</em>.
                                    </p>
                                </div>
                            )}

                            {!isSearching && !searchError && searchResults && searchResults.total > 0 && (
                                <div className="search-results-content">
                                    <div className="search-header-meta">
                                        <span>Found <strong>{searchResults.total}</strong> results for "{searchResults.query}"</span>
                                        <span className="search-hint-key">Press <kbd>↵ Enter</kbd> to view top result</span>
                                    </div>

                                    {/* 1. Crops */}
                                    {searchResults.results.crops && searchResults.results.crops.length > 0 && (
                                        <div className="search-category-block">
                                            <div className="search-cat-title">
                                                <span className="cat-badge cat-crop">🌱 Crops</span>
                                                <span className="cat-count">{searchResults.results.crops.length}</span>
                                            </div>
                                            <div className="search-items-list">
                                                {searchResults.results.crops.map((c, idx) => (
                                                    <div
                                                        key={`crop-${idx}`}
                                                        className="search-item-card"
                                                        onClick={() => handleResultClick(c.route)}
                                                    >
                                                        <div className="item-icon-box crop-icon-bg">🌿</div>
                                                        <div className="item-details">
                                                            <div className="item-main-row">
                                                                <span className="item-title">{c.name}</span>
                                                                <span className={`item-status-pill ${c.status === "AI Available" ? "status-avail" : "status-soon"}`}>
                                                                    {c.status}
                                                                </span>
                                                            </div>
                                                            <div className="item-desc">{c.description}</div>
                                                        </div>
                                                        <div className="item-arrow">View Crop →</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Diseases */}
                                    {searchResults.results.diseases && searchResults.results.diseases.length > 0 && (
                                        <div className="search-category-block">
                                            <div className="search-cat-title">
                                                <span className="cat-badge cat-disease">🔬 Diseases & Pathogens</span>
                                                <span className="cat-count">{searchResults.results.diseases.length}</span>
                                            </div>
                                            <div className="search-items-list">
                                                {searchResults.results.diseases.map((d, idx) => (
                                                    <div
                                                        key={`dis-${idx}`}
                                                        className="search-item-card"
                                                        onClick={() => handleResultClick(d.route)}
                                                    >
                                                        <div className="item-icon-box disease-icon-bg">🦠</div>
                                                        <div className="item-details">
                                                            <div className="item-main-row">
                                                                <span className="item-title">{d.name}</span>
                                                                <span className="item-crop-tag">{d.crop}</span>
                                                                {d.severity && (
                                                                    <span className={`item-severity-pill sev-${d.severity.toLowerCase()}`}>
                                                                        {d.severity}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="item-desc">{d.description}</div>
                                                        </div>
                                                        <div className="item-arrow">View Details →</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Detection History */}
                                    {searchResults.results.history && searchResults.results.history.length > 0 && (
                                        <div className="search-category-block">
                                            <div className="search-cat-title">
                                                <span className="cat-badge cat-history">📋 Detection History</span>
                                                <span className="cat-count">{searchResults.results.history.length}</span>
                                            </div>
                                            <div className="search-items-list">
                                                {searchResults.results.history.map((h, idx) => (
                                                    <div
                                                        key={`hist-${idx}`}
                                                        className="search-item-card"
                                                        onClick={() => handleResultClick(h.route)}
                                                    >
                                                        <div className="item-icon-box history-icon-bg">📑</div>
                                                        <div className="item-details">
                                                            <div className="item-main-row">
                                                                <span className="item-title">{h.crop} — {h.prediction}</span>
                                                                <span className="item-conf-tag">{h.confidence}</span>
                                                            </div>
                                                            <div className="item-desc">
                                                                Recorded on {h.created_at ? new Date(h.created_at).toLocaleDateString() : "recent scan"}
                                                            </div>
                                                        </div>
                                                        <div className="item-arrow">View Scan →</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. AI Insights */}
                                    {searchResults.results.insights && searchResults.results.insights.length > 0 && (
                                        <div className="search-category-block">
                                            <div className="search-cat-title">
                                                <span className="cat-badge cat-insight">⚡ AI Insights</span>
                                                <span className="cat-count">{searchResults.results.insights.length}</span>
                                            </div>
                                            <div className="search-items-list">
                                                {searchResults.results.insights.map((ins, idx) => (
                                                    <div
                                                        key={`ins-${idx}`}
                                                        className="search-item-card"
                                                        onClick={() => handleResultClick(ins.route)}
                                                    >
                                                        <div className="item-icon-box insight-icon-bg">💡</div>
                                                        <div className="item-details">
                                                            <div className="item-main-row">
                                                                <span className="item-title">{ins.title}</span>
                                                                <span className="item-cat-sub">{ins.category}</span>
                                                            </div>
                                                            <div className="item-desc">{ins.description}</div>
                                                        </div>
                                                        <div className="item-arrow">View Insight →</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 5. Farming Advice */}
                                    {searchResults.results.advice && searchResults.results.advice.length > 0 && (
                                        <div className="search-category-block">
                                            <div className="search-cat-title">
                                                <span className="cat-badge cat-advice">🌾 Farming Advice</span>
                                                <span className="cat-count">{searchResults.results.advice.length}</span>
                                            </div>
                                            <div className="search-items-list">
                                                {searchResults.results.advice.map((adv, idx) => (
                                                    <div
                                                        key={`adv-${idx}`}
                                                        className="search-item-card"
                                                        onClick={() => handleResultClick(adv.route)}
                                                    >
                                                        <div className="item-icon-box advice-icon-bg">🚜</div>
                                                        <div className="item-details">
                                                            <div className="item-main-row">
                                                                <span className="item-title">{adv.title}</span>
                                                                <span className="item-cat-sub">{adv.category}</span>
                                                            </div>
                                                            <div className="item-desc">{adv.description}</div>
                                                        </div>
                                                        <div className="item-arrow">Read Guide →</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="topbar-user-area">
                    <button className="notif-btn" aria-label="Notifications">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notif-badge">3</span>
                    </button>

                    <div className="profile-pill" onClick={() => setShowEditModal(true)}>
                        <img src={user.avatar || "/images/farmer_avatar.jpg"} alt="Farmer" className="profile-img" />
                        <div className="profile-info">
                            <span className="profile-name">{user.full_name || "Farmer"}</span>
                            <span className="profile-tag">{user.accountType || "Farmer"}</span>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    <div className="lang-header-pill" onClick={() => updateSetting("language", settings.language === "English" ? "Marathi" : settings.language === "Marathi" ? "Hindi" : "English")}>
                        <span>🌐</span>
                        <span>{settings.language}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ================= HEADER BANNER ================= */}
            <header className="settings-header-banner">
                <div className="header-left-content">
                    <div className="header-leaf-icon">
                        <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "36px", height: "36px", objectFit: "contain", display: "block" }} />
                    </div>
                    <div className="header-titles">
                        <span className="header-eyebrow">AGRIMIND AI • CONTROL CENTER</span>
                        <h1 className="header-main-title">Settings</h1>
                        <p className="header-subtitle">Manage your AgriMind AI preferences, detection behavior and account.</p>
                    </div>
                </div>

                <div className="header-status-pill">
                    <span className="status-pulse-dot" />
                    <div className="status-pill-text">
                        <span className="status-pill-title">AI System Ready</span>
                        <span className="status-pill-sub">All systems running smoothly</span>
                    </div>
                </div>
            </header>

            {/* Feedback Message */}
            {message && (
                <div className="save-feedback-banner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{message}</span>
                </div>
            )}

            {historyClearedMsg && (
                <div className="save-feedback-banner" style={{ background: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Detection history has been cleared successfully.</span>
                </div>
            )}

            {/* ================= 2-COLUMN SETTINGS GRID ================= */}
            <div className="settings-grid-layout">
                
                {/* 1. FARMER PROFILE */}
                <section className="settings-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <div className="card-header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="card-header-text">
                                <h3>Farmer Profile</h3>
                                <p>Your AgriMind AI account information.</p>
                            </div>
                        </div>

                        <button className="badge-btn" onClick={() => setShowEditModal(true)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Profile
                        </button>
                    </div>

                    <div className="profile-content-split">
                        <div className="profile-avatar-block">
                            <div className="avatar-wrapper">
                                <img src={user.avatar || "/images/farmer_avatar.jpg"} alt="Farmer Avatar" className="large-avatar-img" />
                                <button className="avatar-camera-btn" title="Change Photo" onClick={() => setShowEditModal(true)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </button>
                            </div>
                            <div className="profile-user-identity">
                                <div className="farmer-name-verified">
                                    <span>{user.full_name || "Farmer"}</span>
                                    <span className="verified-check-badge" title="Verified Account">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff"/>
                                        </svg>
                                    </span>
                                </div>
                                <span className="farmer-email-txt">{user.email || "farmer@agrimind.ai"}</span>
                                <span className="active-status-badge">{user.status || "Active"}</span>
                                <span className="farmer-sub-role">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {user.accountType || "Farmer"}
                                </span>
                            </div>
                        </div>

                        <div className="profile-meta-grid">
                            <div className="meta-tile">
                                <span className="meta-tile-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Account Type
                                </span>
                                <span className="meta-tile-value">{user.accountType || "Farmer"}</span>
                            </div>

                            <div className="meta-tile">
                                <span className="meta-tile-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    Member Since
                                </span>
                                <span className="meta-tile-value">{formatMemberSince(user.created_at)}</span>
                            </div>

                            <div className="meta-tile">
                                <span className="meta-tile-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    Account Status
                                </span>
                                <span className="meta-tile-value" style={{ color: "#16a34a" }}>{user.status || "Active"}</span>
                            </div>

                            <div className="meta-tile">
                                <span className="meta-tile-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                                    </svg>
                                    User ID
                                </span>
                                <span className="meta-tile-value" style={{ fontFamily: "monospace", fontSize: "12.5px" }}>{user.userId || (user.id ? `#AGM-${String(user.id).padStart(4, "0")}` : "#AGM-0001")}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. AI MODEL INFORMATION */}
                <section className="settings-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <div className="card-header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.5 2.1-1.2 2.8.5.3 1 .7 1.4 1.2A5.96 5.96 0 0 1 20 16a4 4 0 0 1-8 0 5.96 5.96 0 0 1 3.8-6c.4-.5.9-.9 1.4-1.2A3.99 3.99 0 0 1 16 6a4 4 0 0 0-8 0c0 1.1.5 2.1 1.2 2.8-.5.3-1 .7-1.4 1.2A5.96 5.96 0 0 0 4 16a4 4 0 0 0 8 0" />
                                </svg>
                            </div>
                            <div className="card-header-text">
                                <h3>AI Model Information</h3>
                                <p>Disease detection model details.</p>
                            </div>
                        </div>

                        <div className="badge-pill-ready">
                            <span className="status-dot-green" />
                            {modelInfo.status}
                        </div>
                    </div>

                    <div className="ai-model-grid">
                        <div className="model-box">
                            <div className="model-box-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            </div>
                            <div className="model-box-content">
                                <span className="model-box-label">Model Architecture</span>
                                <span className="model-box-val">{modelInfo.modelName}</span>
                                <span className="model-box-desc">Transfer learning backbone</span>
                            </div>
                        </div>

                        <div className="model-box">
                            <div className="model-box-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M12 2a10 10 0 0 0-9.95 9h11.95L9.5 6.5" />
                                    <path d="M12 22a10 10 0 0 0 9.95-9H10.05L14.5 17.5" />
                                </svg>
                            </div>
                            <div className="model-box-content">
                                <span className="model-box-label">Supported Crops</span>
                                <span className="model-box-val">{modelInfo.supportedCropsCount}</span>
                                <span className="model-box-desc">{modelInfo.cropsList}</span>
                            </div>
                        </div>

                        <div className="model-box">
                            <div className="model-box-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </div>
                            <div className="model-box-content">
                                <span className="model-box-label">Input Image Size</span>
                                <span className="model-box-val">{modelInfo.imageSize}</span>
                                <span className="model-box-desc">Optimized for high accuracy</span>
                            </div>
                        </div>

                        <div className="model-box">
                            <div className="model-box-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="4" y="4" width="16" height="16" rx="2" />
                                    <rect x="9" y="9" width="6" height="6" />
                                    <line x1="9" y1="1" x2="9" y2="4" />
                                    <line x1="15" y1="1" x2="15" y2="4" />
                                    <line x1="9" y1="20" x2="9" y2="23" />
                                    <line x1="15" y1="20" x2="15" y2="23" />
                                    <line x1="20" y1="9" x2="23" y2="9" />
                                    <line x1="20" y1="14" x2="23" y2="14" />
                                    <line x1="1" y1="9" x2="4" y2="9" />
                                    <line x1="1" y1="14" x2="4" y2="14" />
                                </svg>
                            </div>
                            <div className="model-box-content">
                                <span className="model-box-label">Device / Runtime</span>
                                <span className="model-box-val">{modelInfo.device}</span>
                                <span className="model-box-desc">Auto-detected execution engine</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. DETECTION SETTINGS */}
                <section className="settings-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <div className="card-header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                                </svg>
                            </div>
                            <div className="card-header-text">
                                <h3>Detection Settings</h3>
                                <p>Configure how AI detection results are handled.</p>
                            </div>
                        </div>
                    </div>

                    <div className="detection-controls-list">
                        <div className="control-row">
                            <div className="control-info">
                                <div className="control-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="6" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                </div>
                                <div className="control-text">
                                    <h4>Confidence Threshold</h4>
                                    <p>Minimum confidence required for AI predictions.</p>
                                </div>
                            </div>

                            <div className="slider-wrapper">
                                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700 }}>50%</span>
                                <input
                                    type="range"
                                    min="50"
                                    max="95"
                                    value={settings.confidenceThreshold}
                                    className="custom-slider"
                                    onChange={(e) => updateSetting("confidenceThreshold", Number(e.target.value))}
                                />
                                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700 }}>95%</span>
                                <div className="slider-badge-val">{settings.confidenceThreshold}%</div>
                            </div>
                        </div>

                        <div className="control-row">
                            <div className="control-info">
                                <div className="control-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                    </svg>
                                </div>
                                <div className="control-text">
                                    <h4>Save Detection History</h4>
                                    <p>Automatically save AI detection results to your history.</p>
                                </div>
                            </div>

                            <Toggle
                                id="toggle-save-history"
                                checked={settings.autoHistory}
                                onChange={(val) => updateSetting("autoHistory", val)}
                            />
                        </div>

                        <div className="control-row">
                            <div className="control-info">
                                <div className="control-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <div className="control-text">
                                    <h4>Show Class Probabilities</h4>
                                    <p>Display probability for every disease class in diagnosis.</p>
                                </div>
                            </div>

                            <Toggle
                                id="toggle-show-prob"
                                checked={settings.showProbabilities}
                                onChange={(val) => updateSetting("showProbabilities", val)}
                            />
                        </div>
                    </div>
                </section>

                {/* 4. APPEARANCE & LANGUAGE */}
                <section className="settings-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <div className="card-header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                                </svg>
                            </div>
                            <div className="card-header-text">
                                <h3>Appearance & Language</h3>
                                <p>Customize your AgriMind AI experience.</p>
                            </div>
                        </div>
                    </div>

                    {/* Theme Selector */}
                    <div style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155" }}>Theme</span>
                            <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>— Choose your preferred theme.</span>
                        </div>

                        <div className="theme-options-grid">
                            <div
                                className={`theme-card-option ${settings.theme === "Light" ? "selected" : ""}`}
                                onClick={() => updateSetting("theme", "Light")}
                            >
                                {settings.theme === "Light" && (
                                    <div className="theme-check-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff" />
                                        </svg>
                                    </div>
                                )}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                                <span className="theme-opt-name">Light</span>
                            </div>

                            <div
                                className={`theme-card-option ${settings.theme === "Dark" ? "selected" : ""}`}
                                onClick={() => updateSetting("theme", "Dark")}
                            >
                                {settings.theme === "Dark" && (
                                    <div className="theme-check-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff" />
                                        </svg>
                                    </div>
                                )}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                                <span className="theme-opt-name">Dark</span>
                            </div>

                            <div
                                className={`theme-card-option ${settings.theme === "System" ? "selected" : ""}`}
                                onClick={() => updateSetting("theme", "System")}
                            >
                                {settings.theme === "System" && (
                                    <div className="theme-check-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff" />
                                        </svg>
                                    </div>
                                )}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                <span className="theme-opt-name">System</span>
                            </div>
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155" }}>Language</span>
                            <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>— Select your preferred language.</span>
                        </div>

                        <div className="language-options-grid">
                            <div
                                className={`lang-card-option ${settings.language === "English" ? "selected" : ""}`}
                                onClick={() => updateSetting("language", "English")}
                            >
                                {settings.language === "English" && (
                                    <div className="lang-check-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff" />
                                        </svg>
                                    </div>
                                )}
                                <span className="lang-flag-emoji">🇺🇸</span>
                                <span className="lang-opt-title">English</span>
                            </div>

                            <div
                                className={`lang-card-option ${settings.language === "Marathi" ? "selected" : ""}`}
                                onClick={() => updateSetting("language", "Marathi")}
                            >
                                {settings.language === "Marathi" && (
                                    <div className="lang-check-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff" />
                                        </svg>
                                    </div>
                                )}
                                <span className="lang-flag-emoji">🇮🇳</span>
                                <span className="lang-opt-title">Marathi</span>
                            </div>

                            <div
                                className={`lang-card-option ${settings.language === "Hindi" ? "selected" : ""}`}
                                onClick={() => updateSetting("language", "Hindi")}
                            >
                                {settings.language === "Hindi" && (
                                    <div className="lang-check-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff" />
                                        </svg>
                                    </div>
                                )}
                                <span className="lang-flag-emoji">🇮🇳</span>
                                <span className="lang-opt-title">Hindi</span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="control-row" style={{ paddingTop: "8px" }}>
                        <div className="control-info">
                            <div className="control-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                            </div>
                            <div className="control-text">
                                <h4>Notifications</h4>
                                <p>Receive notifications about AI detection results.</p>
                            </div>
                        </div>

                        <Toggle
                            id="toggle-notifications"
                            checked={settings.notifications}
                            onChange={(val) => updateSetting("notifications", val)}
                        />
                    </div>
                </section>

                {/* 5. SYSTEM INFORMATION */}
                <section className="settings-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <div className="card-header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </div>
                            <div className="card-header-text">
                                <h3>System Information</h3>
                                <p>Current AgriMind AI system information.</p>
                            </div>
                        </div>
                    </div>

                    <div className="system-info-tiles">
                        <div className="system-tile">
                            <div className="system-tile-top">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                    <polyline points="2 17 12 22 22 17" />
                                    <polyline points="2 12 12 17 22 12" />
                                </svg>
                                <span>Application</span>
                            </div>
                            <span className="system-tile-val">AgriMind AI</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Version 1.0.0</span>
                        </div>

                        <div className="system-tile">
                            <div className="system-tile-top">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                                    <line x1="6" y1="6" x2="6.01" y2="6" />
                                    <line x1="6" y1="18" x2="6.01" y2="18" />
                                </svg>
                                <span>Backend</span>
                            </div>
                            <span className="system-tile-val">FastAPI</span>
                            <span className="system-tile-status" style={{ color: "#16a34a" }}>
                                <span className="status-dot-green" />
                                Connected
                            </span>
                        </div>

                        <div className="system-tile">
                            <div className="system-tile-top">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                </svg>
                                <span>Database</span>
                            </div>
                            <span className="system-tile-val">SQLite</span>
                            <span className="system-tile-status" style={{ color: "#16a34a" }}>
                                <span className="status-dot-green" />
                                Connected
                            </span>
                        </div>

                        <div className="system-tile">
                            <div className="system-tile-top">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.5 2.1-1.2 2.8.5.3 1 .7 1.4 1.2A5.96 5.96 0 0 1 20 16a4 4 0 0 1-8 0 5.96 5.96 0 0 1 3.8-6c.4-.5.9-.9 1.4-1.2A3.99 3.99 0 0 1 16 6a4 4 0 0 0-8 0c0 1.1.5 2.1 1.2 2.8-.5.3-1 .7-1.4 1.2A5.96 5.96 0 0 0 4 16a4 4 0 0 0 8 0" />
                                </svg>
                                <span>AI Models</span>
                            </div>
                            <span className="system-tile-val">Loaded</span>
                            <span className="system-tile-status" style={{ color: "#16a34a" }}>
                                <span className="status-dot-green" />
                                Ready
                            </span>
                        </div>
                    </div>
                </section>

                {/* 6. DATA & PRIVACY */}
                <section className="settings-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <div className="card-header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="card-header-text">
                                <h3>Data & Privacy</h3>
                                <p>Manage your data and privacy settings.</p>
                            </div>
                        </div>

                        <div className="badge-pill-ready">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Your data is safe with us
                        </div>
                    </div>

                    <div className="data-privacy-list">
                        <div className="privacy-item-row">
                            <div className="privacy-item-left">
                                <div className="privacy-item-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                    </svg>
                                </div>
                                <div className="privacy-item-text">
                                    <h4>Your Data</h4>
                                    <p>Your detection data is stored securely in your account.</p>
                                </div>
                            </div>
                            <button className="btn-view-data" onClick={() => navigate("/history")}>
                                <span>View Data</span>
                                <span>→</span>
                            </button>
                        </div>

                        <div className="privacy-item-row">
                            <div className="privacy-item-left">
                                <div className="privacy-item-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <div className="privacy-item-text">
                                    <h4>Privacy Policy</h4>
                                    <p>Read our agricultural data privacy policy.</p>
                                </div>
                            </div>
                            <button className="btn-view-data" onClick={() => alert("AgriMind AI protects your farm and crop diagnostics privacy with local encryption.")}>
                                <span>Open</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </button>
                        </div>

                        <div className="privacy-item-row">
                            <div className="privacy-item-left">
                                <div className="privacy-item-icon" style={{ background: "#fef2f2", color: "#ef4444" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </div>
                                <div className="privacy-item-text">
                                    <h4>Clear All Data</h4>
                                    <p>Delete all your detection history.</p>
                                </div>
                            </div>
                            <button className="btn-clear-danger" onClick={handleClearData}>
                                Clear All Data
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* ================= BOTTOM BAR ================= */}
            <footer className="settings-bottom-bar">
                <div className="footer-brand-note">
                    <div className="footer-leaf-icon">
                        <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "24px", height: "24px", objectFit: "contain", display: "block" }} />
                    </div>
                    <div className="footer-note-text">
                        <h5>Together for a Sustainable Future</h5>
                        <p>Smart Technology, Healthier Crops, Stronger Farmers.</p>
                    </div>
                </div>

                <div className="footer-actions-group">
                    {message && (
                        <div className="save-feedback-banner" style={{ padding: "8px 16px", fontSize: "12.5px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{message}</span>
                        </div>
                    )}

                    <button className="btn-reset-default" onClick={handleResetSettings}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        Reset to Default
                    </button>

                    <button
                        className="btn-save-settings"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </footer>

            {/* ================= EDIT PROFILE MODAL ================= */}
            {showEditModal && (
                <div className="settings-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <div className="modal-title-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h3>Edit Farmer Profile</h3>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div className="modal-body">
                                {editError && (
                                    <div className="modal-error-alert">{editError}</div>
                                )}

                                <div className="modal-avatar-picker">
                                    <img
                                        src={editForm.avatar || "/images/farmer_avatar.jpg"}
                                        alt="Avatar Preview"
                                        className="avatar-preview-img"
                                    />
                                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                                        Choose Avatar
                                    </div>
                                    <div className="avatar-options-list">
                                        {AVATAR_OPTIONS.map((av, i) => (
                                            <button
                                                key={`av-${i}`}
                                                type="button"
                                                className={`avatar-thumb-btn ${editForm.avatar === av ? "selected" : ""}`}
                                                onClick={() => setEditForm(prev => ({ ...prev, avatar: av }))}
                                            >
                                                <img src={av} alt={`Option ${i}`} className="avatar-thumb-img" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-form-group">
                                    <label htmlFor="edit-fullname">Full Name</label>
                                    <input
                                        id="edit-fullname"
                                        type="text"
                                        className="modal-input"
                                        placeholder="e.g. Ramesh Patil"
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="modal-form-group">
                                    <label htmlFor="edit-email">Email Address</label>
                                    <input
                                        id="edit-email"
                                        type="email"
                                        className="modal-input"
                                        value={user.email || ""}
                                        disabled
                                        title="Email is permanently bound to your account"
                                    />
                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                        Registered account email cannot be changed directly.
                                    </span>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save-modal"
                                    disabled={editLoading}
                                >
                                    {editLoading ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
