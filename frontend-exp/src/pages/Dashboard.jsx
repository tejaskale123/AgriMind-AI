import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import UserProfileMenu from "../components/UserProfileMenu";

export default function Dashboard() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  // User State
  const storedUser = localStorage.getItem("user");
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const farmerName = user?.full_name || "Test Farmer 2";
  const [historyCount, setHistoryCount] = useState(0);
  const [recentDetections, setRecentDetections] = useState([]);
  const [activeTab, setActiveTab] = useState("7days");

  // Global Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Real Weather State (Shared with /weather page)
  const [dashboardWeather, setDashboardWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Fetch History for Count
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://127.0.0.1:8000/history", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.history) {
            setHistoryCount(data.history.length);
            setRecentDetections(data.history.slice(0, 5));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Fetch Real Live Weather (Using shared selected location from sessionStorage)
  useEffect(() => {
    const selectedLoc = sessionStorage.getItem("agrimind_selected_location") || "Asalgaon, India";
    setWeatherLoading(true);
    fetch(`http://127.0.0.1:8000/weather?location=${encodeURIComponent(selectedLoc)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.current) {
          setDashboardWeather(data);
        }
      })
      .catch(err => {
        console.error("Dashboard weather fetch failed:", err);
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  }, []);

  // Global Search Execution
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
      const token = localStorage.getItem("access_token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`http://127.0.0.1:8000/search?q=${encodeURIComponent(trimmed)}`, {
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
      console.error("Dashboard Global Search Error:", err);
      setSearchError("Search temporarily unavailable. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce query
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

  // Click outside & Escape key listeners
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle Enter key on search input
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      if (searchResults && searchResults.results) {
        const { crops, diseases, history, insights, advice } = searchResults.results;
        const firstCrop = crops?.[0];
        const firstDisease = diseases?.[0];
        const firstHistory = history?.[0];
        const firstInsight = insights?.[0];
        const firstAdvice = advice?.[0];

        const directMatch = firstCrop || firstDisease || firstHistory || firstInsight || firstAdvice;
        if (directMatch && directMatch.route) {
          setShowSearchDropdown(false);
          navigate(directMatch.route);
        }
      }
    }
  };

  const handleResultClick = (route) => {
    setShowSearchDropdown(false);
    if (route) {
      navigate(route);
    }
  };

  const crops = [
    {
      name: "Soybean",
      status: "AI Available",
      statusType: "available",
      image: "/images/crop_soybean.jpg",
      actionText: "Analyze Now →",
      cropKey: "soybean"
    },
    {
      name: "Cotton",
      status: "AI Available",
      statusType: "available",
      image: "/images/crop_cotton.jpg",
      actionText: "Analyze Now →",
      cropKey: "cotton"
    },
    {
      name: "Maize",
      status: "AI Available",
      statusType: "available",
      image: "/images/crop_maize.jpg",
      actionText: "Analyze Now →",
      cropKey: "maize"
    },
    {
      name: "Wheat",
      status: "AI Available",
      statusType: "available",
      image: "/images/crop_wheat.jpg",
      actionText: "Analyze Now →",
      cropKey: "wheat"
    },
    {
      name: "Tomato",
      status: "Coming Soon",
      statusType: "upcoming",
      image: "/images/crop_tomato.jpg",
      actionText: "Notify Me 🔔",
      cropKey: "tomato"
    },
    {
      name: "Bell Pepper",
      status: "Coming Soon",
      statusType: "upcoming",
      image: "/images/crop_bell_pepper.jpg",
      actionText: "Notify Me 🔔",
      cropKey: "bell_pepper"
    }
  ];

  return (
    <div className="exp-dashboard-page">
      {/* ================= TOP HEADER BAR ================= */}
      <header className="exp-topbar">
        {/* Search Box with Dropdown */}
        <div className="topbar-search-container" ref={searchContainerRef}>
          <div className="topbar-search">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search crops, diseases, or get farming advice..."
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

          {/* Search Result Dropdown Panel */}
          {showSearchDropdown && searchQuery.trim().length >= 2 && (
            <div className="dashboard-search-dropdown">
              {/* Loading State */}
              {isSearching && (
                <div className="search-status-box search-loading">
                  <div className="search-spinner"></div>
                  <span>Searching AgriMind ecosystem...</span>
                </div>
              )}

              {/* Error State with Retry */}
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

              {/* No Results State */}
              {!isSearching && !searchError && searchResults && searchResults.total === 0 && (
                <div className="search-status-box search-empty">
                  <div className="search-empty-icon">🔍</div>
                  <div className="search-empty-title">No matching results found</div>
                  <p className="search-empty-sub">
                    Try searching for crops (e.g. <em>Cotton, Soybean</em>), diseases (e.g. <em>Bacterial Blight, Rust</em>), or topics like <em>spraying advice</em>.
                  </p>
                </div>
              )}

              {/* Results Groups */}
              {!isSearching && !searchError && searchResults && searchResults.total > 0 && (
                <div className="search-results-content">
                  <div className="search-header-meta">
                    <span>Found <strong>{searchResults.total}</strong> results for "{searchResults.query}"</span>
                    <span className="search-hint-key">Press <kbd>↵ Enter</kbd> to view top result</span>
                  </div>

                  {/* 1. Crops Category */}
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

                  {/* 2. Diseases Category */}
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

                  {/* 3. Detection History Category (User-Specific) */}
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

                  {/* 4. AI Insights Category */}
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

                  {/* 5. Farming Advice & Advisory */}
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

        {/* Right Section: Language, Notification, Profile */}
        <div className="topbar-actions">
          {/* Language Selector */}
          <div className="lang-dropdown">
            <button className="lang-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{language === "mr" ? "मराठी" : language === "hi" ? "हिन्दी" : "English"}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="lang-menu">
              <button onClick={() => setLanguage("en")}>English</button>
              <button onClick={() => setLanguage("mr")}>मराठी (Marathi)</button>
              <button onClick={() => setLanguage("hi")}>हिन्दी (Hindi)</button>
            </div>
          </div>

          {/* Notification Icon */}
          <button className="icon-badge-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="badge-count">3</span>
          </button>

          {/* User Profile Dropdown */}
          <UserProfileMenu variant="topbar" />
        </div>
      </header>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <div className="dashboard-grid-container">
        
        {/* ROW 1: Hero Banner + Weather Card */}
        <div className="row-hero-weather">
          {/* Hero Banner */}
          <div className="hero-banner-card" style={{ backgroundImage: "url('/images/hero_banner.jpg')" }}>
            <div className="hero-overlay">
              <div className="hero-content">
                <div className="hero-eyebrow">
                  <span>AI POWERED AGRICULTURE</span>
                  <span className="sparkle">✦</span>
                </div>
                <h1 className="hero-headline">
                  Healthier Crops<br />Brighter Tomorrows
                </h1>
                <p className="hero-description">
                  Detect plant diseases early with AI and get expert recommendations for a healthier, more productive farm.
                </p>
                <div className="hero-buttons">
                  <button className="btn-primary-detect" onClick={() => navigate("/detection")}>
                    Start Disease Detection <span>→</span>
                  </button>
                  <button className="btn-secondary-learn" onClick={() => navigate("/crops")}>
                    Learn More <span className="info-icon">ⓘ</span>
                  </button>
                </div>
              </div>

              {/* Glassmorphic AI Analysis Floating Badge */}
              <div className="glass-ai-badge">
                <div className="badge-header">
                  <div className="pulse-dot"></div>
                  <span>AI Analysis</span>
                </div>
                <ul className="badge-checklist">
                  <li>
                    <span className="check-icon">✓</span>
                    <span>Detect Disease</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span>Get Insights</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span>Take Action</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span>Grow Better</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="weather-widget-card">
            <div className="weather-top">
              <div className="location-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                <span>{dashboardWeather?.location?.formatted || dashboardWeather?.location?.name || "Asalgaon, India"}</span>
              </div>
              <span className="live-pill">Live Weather</span>
            </div>

            <div className="weather-main">
              <div className="weather-temp-group">
                <div className="weather-sun-icon">
                  {dashboardWeather?.current?.icon === "rain" || dashboardWeather?.current?.icon === "rain-showers" || dashboardWeather?.current?.icon === "drizzle" ? (
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" fill="#E0F2FE" />
                      <path d="M16 14v6" stroke="#0284C7" strokeDasharray="2 3" strokeWidth="2.5" />
                      <path d="M8 14v6" stroke="#0284C7" strokeDasharray="2 3" strokeWidth="2.5" />
                      <path d="M12 16v6" stroke="#0284C7" strokeDasharray="2 3" strokeWidth="2.5" />
                    </svg>
                  ) : dashboardWeather?.current?.icon === "cloudy" || dashboardWeather?.current?.icon === "overcast" ? (
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#F1F5F9" />
                    </svg>
                  ) : dashboardWeather?.current?.icon === "partly-cloudy" ? (
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v2" stroke="#F59E0B" />
                      <path d="m4.93 4.93 1.41 1.41" stroke="#F59E0B" />
                      <path d="M20 12h2" stroke="#F59E0B" />
                      <path d="m19.07 4.93-1.41 1.41" stroke="#F59E0B" />
                      <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128A5 5 0 0 0 3 13.5a5 5 0 0 0 5 5h9a4 4 0 0 0 3.947-4.85Z" fill="#E0F2FE" />
                    </svg>
                  ) : (
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                      <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                      <line x1="12" y1="1" x2="12" y2="3" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="21" x2="12" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="1" y1="12" x2="3" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="21" y1="12" x2="23" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div className="temp-info">
                  <div className="temp-degrees">
                    {dashboardWeather?.current ? `${Math.round(dashboardWeather.current.temperature)}°C` : "28°C"}
                  </div>
                  <div className="temp-condition">
                    {dashboardWeather?.current?.condition || "Clear"}
                  </div>
                  <div className="temp-feels">
                    Feels like {dashboardWeather?.current ? `${Math.round(dashboardWeather.current.feelsLike)}°C` : "30°C"}
                  </div>
                </div>
              </div>

              <div className="weather-stats-list">
                <div className="weather-stat-row">
                  <span className="stat-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    Humidity
                  </span>
                  <span className="stat-val">
                    {dashboardWeather?.current ? `${dashboardWeather.current.humidity}%` : "52%"}
                  </span>
                </div>
                <div className="weather-stat-row">
                  <span className="stat-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                    </svg>
                    Wind
                  </span>
                  <span className="stat-val">
                    {dashboardWeather?.current ? `${Math.round(dashboardWeather.current.windSpeed)} km/h` : "12 km/h"}
                  </span>
                </div>
                <div className="weather-stat-row">
                  <span className="stat-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="16" y1="13" x2="16" y2="21" />
                      <line x1="8" y1="13" x2="8" y2="21" />
                      <line x1="12" y1="15" x2="12" y2="23" />
                      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
                    </svg>
                    Rain Chance
                  </span>
                  <span className="stat-val">
                    {dashboardWeather?.hourly?.[0]?.precipitationProbability !== undefined
                      ? `${dashboardWeather.hourly[0].precipitationProbability}%`
                      : dashboardWeather?.current?.precipitation !== undefined
                      ? `${dashboardWeather.current.precipitation > 0 ? "60%" : "0%"}`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Landscape backdrop inside card */}
            <div className="weather-landscape-footer">
              <img src="/images/field_landscape.jpg" alt="Farmland Landscape" />
            </div>
          </div>
        </div>

        {/* ROW 2: 4 Summary Metric Cards + Seasonal Advisory */}
        <div className="row-metrics-advisory">
          {/* 4 Stat Cards */}
          <div className="stats-four-grid">
            {/* Stat 1: Supported Crops */}
            <div className="metric-box">
              <div className="metric-icon-circle green-tint">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V11" />
                  <path d="M12 11C12 6.5 15.5 3 20 3c0 4.5-3.5 8-8 8Z" />
                  <path d="M12 15C12 11.5 9 9 5 9c0 3.5 3 6 7 6Z" />
                  <path d="M7 22h10" />
                </svg>
              </div>
              <div className="metric-details">
                <div className="metric-sublabel">Supported Crops</div>
                <div className="metric-number">6</div>
                <div className="metric-footer-tag">4 Ready | 2 Coming Soon</div>
              </div>
            </div>

            {/* Stat 2: Total Detections */}
            <div className="metric-box">
              <div className="metric-icon-circle mint-tint">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <path d="M15.5 8.5C12 8.5 9.5 11 9.5 14.5c3.5 0 6-2.5 6-6Z" />
                  <path d="M9.5 14.5l-1.5 1.5" />
                </svg>
              </div>
              <div className="metric-details">
                <div className="metric-sublabel">Total Detections</div>
                <div className="metric-number">{historyCount}</div>
                <div className="metric-footer-tag">{historyCount === 0 ? "No detections yet" : `${historyCount} logs recorded`}</div>
              </div>
            </div>

            {/* Stat 3: Model Status */}
            <div className="metric-box">
              <div className="metric-icon-circle emerald-tint">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="metric-details">
                <div className="metric-sublabel">Model Status</div>
                <div className="metric-number text-ready">Ready</div>
                <div className="metric-footer-tag">EfficientNet-B0</div>
              </div>
            </div>

            {/* Stat 4: Average Confidence */}
            <div className="metric-box">
              <div className="metric-icon-circle lime-tint">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#65a30d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 7l-8.5 8.5-5-5L2 17" />
                  <polyline points="16 7 22 7 22 13" />
                  <circle cx="8.5" cy="10.5" r="1.5" fill="#65a30d" />
                  <circle cx="13.5" cy="15.5" r="1.5" fill="#65a30d" />
                </svg>
              </div>
              <div className="metric-details">
                <div className="metric-sublabel">Average Confidence</div>
                <div className="metric-number">{historyCount > 0 ? "98.2%" : "0.00%"}</div>
                <div className="metric-footer-tag">{historyCount > 0 ? "High accuracy" : "No predictions yet"}</div>
              </div>
            </div>
          </div>

          {/* Seasonal Advisory Card */}
          <div className="seasonal-advisory-card">
            <div className="advisory-content">
              <div className="advisory-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                </svg>
                <h3>Seasonal Advisory</h3>
              </div>
              <p className="advisory-body">
                Good time for crop monitoring. Regularly check for early signs of diseases.
              </p>
              <button className="advisory-link" onClick={() => navigate("/crops")}>
                View All Tips <span>→</span>
              </button>
            </div>
            <div className="advisory-thumb">
              <img src="/images/crop_advisory.jpg" alt="Seasonal Crop" />
            </div>
          </div>
        </div>

        {/* ROW 3: Supported Crops Grid (Left) + Recent Detections (Right) */}
        <div className="row-crops-recent">
          {/* Supported Crops Section */}
          <section className="supported-crops-section exp-supported-crops">
            <div className="section-head">
              <div className="head-title-group">
                <div className="head-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.3">
                    <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                    <path d="M4 21c3-4 6.5-6.5 11-9" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">Supported Crops</h2>
                  <p className="section-desc">AI disease detection available for these crops</p>
                </div>
              </div>
              <button className="view-all-pill" onClick={() => navigate("/crops")}>
                View All Crops <span>→</span>
              </button>
            </div>

            {/* 6 Crop Cards Grid (3 per row on desktop, 2 on tablet, 1 on mobile) */}
            <div className="crop-cards-grid exp-crop-cards-grid">
              {crops.map((crop) => (
                <div key={crop.name} className={`crop-card-item exp-crop-card-item ${crop.statusType}`}>
                  <div className="crop-card-img-wrap exp-crop-card-img-wrap">
                    <img src={crop.image} alt={crop.name} loading="lazy" />
                    <div className="crop-img-status-overlay">
                      <span className={`status-pill ${crop.statusType}`}>
                        {crop.statusType === "available" ? "🌿 AI Available" : "Coming Soon"}
                      </span>
                    </div>
                  </div>
                  <div className="crop-card-info exp-crop-card-info">
                    <div className="crop-card-title-row">
                      <h3 className="crop-name">{crop.name}</h3>
                      <span className="crop-model-tag">EfficientNet</span>
                    </div>
                    <button
                      className={`crop-action-btn exp-crop-action-btn ${crop.statusType}`}
                      onClick={() => crop.statusType === "available" ? navigate(`/detection?crop=${crop.cropKey}`) : null}
                    >
                      <span>{crop.actionText}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Detections Section */}
          <section className="recent-detections-card exp-recent-detections-card">
            <div className="card-head-simple">
              <div className="head-title-flex">
                <div className="head-icon-box clock-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3>Recent Detections</h3>
                  <span className="recent-det-sub">Latest AI diagnostics</span>
                </div>
              </div>
              <button className="view-all-text-btn" onClick={() => navigate("/history")}>
                View All <span>→</span>
              </button>
            </div>

            {recentDetections.length === 0 ? (
              <div className="empty-detections-state">
                <div className="empty-icon-box">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h4 className="empty-title">No detections yet</h4>
                <p className="empty-sub">Upload a leaf image to get started with AI disease detection.</p>
                <button className="upload-leaf-btn" onClick={() => navigate("/detection")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Upload Leaf Image</span>
                </button>
              </div>
            ) : (
              <div className="detections-list exp-detections-list">
                {recentDetections.map((item) => (
                  <div key={item.id} className="detection-list-item exp-recent-detection-item" onClick={() => navigate("/history")}>
                    <div className="exp-detection-item-left">
                      <div className="item-crop-badge exp-recent-detection-crop">
                        <span className="crop-leaf-bullet">🌿</span>
                        <span>{item.crop}</span>
                      </div>
                      <div className="item-main exp-recent-detection-main">
                        <div className="item-pred">{item.prediction}</div>
                        <div className="item-date">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="item-conf exp-recent-detection-confidence">
                      <div className="conf-value-pill">
                        <span className="conf-pct">{item.confidence}%</span>
                      </div>
                      <div className="conf-mini-bar-track">
                        <div className="conf-mini-bar-fill" style={{ width: `${Math.min(100, Number(item.confidence) || 0)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ROW 4: How AgriMind Works + Detection Statistics + Quick Actions */}
        <div className="row-bottom-trio">
          {/* Card 1: How AgriMind AI Works */}
          <div className="trio-card how-it-works-card">
            <div className="trio-card-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <div>
                <h3 className="trio-title">How AgriMind AI Works</h3>
                <span className="trio-subtitle">Simple steps to healthier crops</span>
              </div>
            </div>

            <div className="steps-flow">
              {/* Step 1 */}
              <div className="step-column">
                <div className="step-badge">1</div>
                <div className="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="step-title">Upload Image</div>
                <div className="step-text">Upload a clear leaf image</div>
              </div>

              <div className="step-arrow">→</div>

              {/* Step 2 */}
              <div className="step-column">
                <div className="step-badge">2</div>
                <div className="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="step-title">AI Analysis</div>
                <div className="step-text">Our AI model analyzes the image</div>
              </div>

              <div className="step-arrow">→</div>

              {/* Step 3 */}
              <div className="step-column">
                <div className="step-badge">3</div>
                <div className="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="step-title">Get Results</div>
                <div className="step-text">View disease, confidence and recommendations</div>
              </div>
            </div>
          </div>

          {/* Card 2: Detection Statistics Chart */}
          <div className="trio-card chart-card">
            <div className="trio-card-header chart-head">
              <div className="head-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <h3 className="trio-title">Detection Statistics</h3>
              </div>
              <div className="chart-filter-select">
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot green"></span>
                <span>Healthy</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot red"></span>
                <span>Diseased</span>
              </div>
            </div>

            {/* Clean SVG Vector Line Chart */}
            <div className="chart-canvas-wrap">
              <svg viewBox="0 0 460 140" className="analytics-svg-chart">
                {/* Horizontal Grid lines */}
                <line x1="30" y1="20" x2="440" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="30" y1="50" x2="440" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="30" y1="80" x2="440" y2="80" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="30" y1="110" x2="440" y2="110" stroke="#f3f4f6" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="10" y="24" fontSize="10" fill="#9ca3af">10</text>
                <text x="10" y="54" fontSize="10" fill="#9ca3af">8</text>
                <text x="10" y="84" fontSize="10" fill="#9ca3af">4</text>
                <text x="10" y="114" fontSize="10" fill="#9ca3af">0</text>

                {/* Flat/Baseline Lines for zero detections */}
                <path d="M 40 110 L 100 110 L 160 110 L 220 110 L 280 110 L 340 110 L 400 110" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                <path d="M 40 110 L 100 110 L 160 110 L 220 110 L 280 110 L 340 110 L 400 110" fill="none" stroke="#ef4444" strokeWidth="2.5" />

                {/* Small circular data points */}
                <circle cx="40" cy="110" r="3.5" fill="#22c55e" />
                <circle cx="100" cy="110" r="3.5" fill="#22c55e" />
                <circle cx="160" cy="110" r="3.5" fill="#22c55e" />
                <circle cx="220" cy="110" r="3.5" fill="#22c55e" />
                <circle cx="280" cy="110" r="3.5" fill="#22c55e" />
                <circle cx="340" cy="110" r="3.5" fill="#22c55e" />
                <circle cx="400" cy="110" r="3.5" fill="#22c55e" />

                {/* X-axis date labels */}
                <text x="30" y="130" fontSize="10" fill="#9ca3af">Sep 10</text>
                <text x="90" y="130" fontSize="10" fill="#9ca3af">Sep 11</text>
                <text x="150" y="130" fontSize="10" fill="#9ca3af">Sep 12</text>
                <text x="210" y="130" fontSize="10" fill="#9ca3af">Sep 13</text>
                <text x="270" y="130" fontSize="10" fill="#9ca3af">Sep 14</text>
                <text x="330" y="130" fontSize="10" fill="#9ca3af">Sep 15</text>
                <text x="390" y="130" fontSize="10" fill="#9ca3af">Sep 16</text>
              </svg>
            </div>
          </div>

          {/* Card 3: Quick Actions (2x2 Grid) */}
          <div className="trio-card quick-actions-card">
            <div className="trio-card-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <h3 className="trio-title">Quick Actions</h3>
            </div>

            <div className="actions-grid-2x2">
              {/* Action 1: Detect Disease */}
              <button className="action-tile-btn tile-green" onClick={() => navigate("/detection")}>
                <div className="tile-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="tile-text">
                  <strong>Detect Disease</strong>
                  <span>Upload leaf image</span>
                </div>
              </button>

              {/* Action 2: View Analytics */}
              <button className="action-tile-btn tile-blue" onClick={() => navigate("/analytics")}>
                <div className="tile-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="tile-text">
                  <strong>View Analytics</strong>
                  <span>See detailed insights</span>
                </div>
              </button>

              {/* Action 3: My Crops */}
              <button className="action-tile-btn tile-purple" onClick={() => navigate("/crops")}>
                <div className="tile-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                    <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                    <path d="M4 21c3-4 6.5-6.5 11-9" />
                  </svg>
                </div>
                <div className="tile-text">
                  <strong>My Crops</strong>
                  <span>Manage your crops</span>
                </div>
              </button>

              {/* Action 4: Farming Tips */}
              <button className="action-tile-btn tile-orange" onClick={() => navigate("/crops")}>
                <div className="tile-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                  </svg>
                </div>
                <div className="tile-text">
                  <strong>Farming Tips</strong>
                  <span>Get expert advice</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM FOOTER BAR ================= */}
        <footer className="exp-dashboard-footer">
          <div className="footer-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
            </svg>
            <span className="quote-text">"Better insights today for a greener tomorrow."</span>
          </div>
          <div className="footer-links">
            <span>Sustainable Agriculture</span>
            <span className="divider">|</span>
            <span>Food Security</span>
            <span className="divider">|</span>
            <span>A Better Future</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
