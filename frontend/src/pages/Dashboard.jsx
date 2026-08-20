import React, { useEffect, useMemo, useState } from "react";

function Dashboard() {
    // =========================================================
    // LOGGED-IN USER
    // =========================================================

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch {
        user = null;
    }

    const userName =
        user?.full_name ||
        user?.name ||
        user?.username ||
        "Farmer";

    const userInitial =
        userName
            .trim()
            .charAt(0)
            .toUpperCase();

    // =========================================================
    // STATE
    // =========================================================

    const [history, setHistory] = useState([]);
    const [totalDetections, setTotalDetections] = useState(0);
    const [latestDetection, setLatestDetection] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);


    // =========================================================
    // SUPPORTED CROPS
    // =========================================================
    // Cotton is now enabled because your Cotton model is working.

    const supportedCrops = [
        {
            name: "Soybean",
            icon: "🌱",
            status: "AI Detection Available",
            available: true
        },
        {
            name: "Cotton",
            icon: "🌿",
            status: "AI Detection Available",
            available: true
        },
        {
            name: "Maize",
            icon: "🌽",
            status: "Coming Soon",
            available: false
        },
        {
            name: "Tomato",
            icon: "🍅",
            status: "Coming Soon",
            available: false
        },
        {
            name: "Wheat",
            icon: "🌾",
            status: "Coming Soon",
            available: false
        },
        {
            name: "Bell Pepper",
            icon: "🫑",
            status: "Coming Soon",
            available: false
        }
    ];


    // =========================================================
    // FETCH DASHBOARD DATA
    // =========================================================

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/history"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to load dashboard data."
                );
            }

            const records = data.history || [];

            setHistory(records);

            setTotalDetections(
                data.count ?? records.length
            );

            if (records.length > 0) {
                setLatestDetection(records[0]);
            } else {
                setLatestDetection(null);
            }

        } catch (err) {
            console.error(
                "Dashboard error:",
                err
            );

            setError(
                err.message ||
                "Unable to connect to AI server."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchDashboardData();
    }, []);


    // =========================================================
    // HEALTHY DETECTION CHECK
    // =========================================================

    const isHealthyPrediction = (prediction) => {
        if (!prediction) {
            return false;
        }

        const value = prediction
            .toString()
            .trim()
            .toLowerCase();

        return (
            value === "healthy" ||
            value === "healthy leaf" ||
            value.includes("healthy")
        );
    };


    // =========================================================
    // REAL ANALYTICS
    // =========================================================

    const healthyCount = useMemo(() => {
        return history.filter(
            item =>
                isHealthyPrediction(
                    item.prediction
                )
        ).length;
    }, [history]);


    const diseaseCount = useMemo(() => {
        return history.filter(
            item =>
                !isHealthyPrediction(
                    item.prediction
                )
        ).length;
    }, [history]);


    const averageConfidence = useMemo(() => {
        if (history.length === 0) {
            return "0.00";
        }

        const total = history.reduce(
            (sum, item) =>
                sum + Number(
                    item.confidence || 0
                ),
            0
        );

        return (
            total / history.length
        ).toFixed(2);

    }, [history]);


    // =========================================================
    // AI AVAILABLE CROPS
    // =========================================================

    const availableCropCount = useMemo(() => {
        return supportedCrops.filter(
            crop => crop.available
        ).length;
    }, []);


    // =========================================================
    // SEARCH
    // =========================================================

    const searchResults = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return [];
        }

        const results = [];


        // -----------------------------------------------------
        // CROP SEARCH
        // -----------------------------------------------------

        supportedCrops.forEach(crop => {
            if (
                crop.name
                    .toLowerCase()
                    .includes(query)
            ) {
                results.push({
                    type: "crop",
                    icon: crop.icon,
                    title: crop.name,
                    description: crop.status,
                    action: crop.available
                        ? "/detection"
                        : "/crops"
                });
            }
        });


        // -----------------------------------------------------
        // DETECTION HISTORY SEARCH
        // -----------------------------------------------------

        history.forEach(item => {
            const prediction =
                item.prediction || "";

            const crop =
                item.crop || "";

            if (
                prediction
                    .toLowerCase()
                    .includes(query) ||
                crop
                    .toLowerCase()
                    .includes(query)
            ) {
                results.push({
                    type: "detection",
                    icon: "🧠",
                    title: prediction,
                    description:
                        `${crop} • ${Number(
                            item.confidence || 0
                        ).toFixed(2)}% confidence`,
                    action: "/history"
                });
            }
        });


        // -----------------------------------------------------
        // FEATURE SEARCH
        // -----------------------------------------------------

        const features = [
            {
                keyword: "disease",
                icon: "🔬",
                title: "Disease Detection",
                description:
                    "Upload a leaf image and detect crop diseases.",
                action: "/detection"
            },
            {
                keyword: "analytics",
                icon: "📊",
                title: "Analytics",
                description:
                    "View detection statistics and AI performance.",
                action: "/analytics"
            },
            {
                keyword: "history",
                icon: "🕘",
                title: "Detection History",
                description:
                    "View previous AI detection results.",
                action: "/history"
            },
            {
                keyword: "settings",
                icon: "⚙️",
                title: "Settings",
                description:
                    "View AI model and detection settings.",
                action: "/settings"
            }
        ];

        features.forEach(feature => {
            if (
                feature.keyword.includes(query) ||
                feature.title
                    .toLowerCase()
                    .includes(query)
            ) {
                results.push(feature);
            }
        });

        return results.slice(0, 8);

    }, [search, history]);


    // =========================================================
    // NAVIGATION
    // =========================================================

    const navigate = (path) => {
        window.location.href = path;
    };


    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "No date available";
        }

        try {
            return new Date(
                dateValue
            ).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );
        } catch {
            return dateValue;
        }
    };


    // =========================================================
    // LATEST DETECTION COLOR
    // =========================================================

    const latestIsHealthy =
        isHealthyPrediction(
            latestDetection?.prediction
        );


    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="dashboard-pro">

            {/* =================================================
                PROFESSIONAL DASHBOARD STYLES
            ================================================= */}

            <style>{`

                .dashboard-pro {
                    width: 100%;
                    max-width: 1450px;
                    margin: 0 auto;
                    padding: 28px 34px 60px;
                    box-sizing: border-box;
                    color: #14231a;
                }

                .dashboard-pro * {
                    box-sizing: border-box;
                }

                /* HEADER */

                .dashboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 25px;
                    margin-bottom: 28px;
                }

                .dashboard-title h1 {
                    margin: 0;
                    font-size: 34px;
                    font-weight: 800;
                    letter-spacing: -0.8px;
                }

                .dashboard-title p {
                    margin: 7px 0 0;
                    color: #64748b;
                    font-size: 15px;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .search-wrapper {
                    position: relative;
                    width: 290px;
                }

                .search-box {
                    width: 100%;
                    height: 44px;
                    border: 1px solid #dbe4df;
                    border-radius: 12px;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    padding: 0 14px;
                    gap: 9px;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.04);
                }

                .search-box input {
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 14px;
                    color: #1f2937;
                    background: transparent;
                }

                .search-icon {
                    font-size: 17px;
                }

                .refresh-button {
                    height: 44px;
                    border: 1px solid #16a34a;
                    color: #15803d;
                    background: white;
                    border-radius: 12px;
                    padding: 0 16px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: 0.2s;
                }

                .refresh-button:hover {
                    background: #f0fdf4;
                    transform: translateY(-1px);
                }

                .profile-button {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: none;
                    background: #16a34a;
                    color: white;
                    font-weight: 800;
                    font-size: 16px;
                }

                /* SEARCH RESULTS */

                .search-results {
                    position: absolute;
                    top: 52px;
                    left: 0;
                    width: 100%;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    box-shadow: 0 14px 35px rgba(0,0,0,0.12);
                    z-index: 100;
                    overflow: hidden;
                }

                .search-result {
                    padding: 12px 14px;
                    display: flex;
                    gap: 11px;
                    cursor: pointer;
                    border-bottom: 1px solid #f1f5f9;
                }

                .search-result:last-child {
                    border-bottom: none;
                }

                .search-result:hover {
                    background: #f0fdf4;
                }

                .search-result-icon {
                    font-size: 20px;
                }

                .search-result-title {
                    font-weight: 700;
                    font-size: 14px;
                }

                .search-result-description {
                    font-size: 12px;
                    color: #64748b;
                    margin-top: 3px;
                }

                /* ERROR */

                .dashboard-error {
                    margin-bottom: 22px;
                    padding: 14px 17px;
                    border-radius: 13px;
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }

                /* STATS */

                .dashboard-stat-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(4, minmax(0, 1fr));
                    gap: 18px;
                    margin-bottom: 25px;
                }

                .dashboard-stat {
                    background: #ffffff;
                    border: 1px solid #e5ebe7;
                    border-radius: 17px;
                    padding: 21px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow:
                        0 5px 20px rgba(20,50,30,0.06);
                    transition: 0.2s;
                }

                .dashboard-stat:hover {
                    transform: translateY(-2px);
                    box-shadow:
                        0 9px 25px rgba(20,50,30,0.09);
                }

                .stat-icon-pro {
                    width: 52px;
                    height: 52px;
                    min-width: 52px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 25px;
                    background: #ecfdf3;
                }

                .stat-label {
                    margin: 0 0 5px;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 600;
                }

                .stat-value {
                    margin: 0;
                    font-size: 23px;
                    font-weight: 800;
                    color: #14231a;
                }

                .stat-value.green {
                    color: #15803d;
                }

                .stat-value.red {
                    color: #dc2626;
                }

                /* HERO */

                .hero-pro {
                    position: relative;
                    overflow: hidden;
                    border-radius: 22px;
                    padding: 42px 45px;
                    min-height: 285px;
                    background:
                        linear-gradient(
                            135deg,
                            #087f3d 0%,
                            #16a34a 52%,
                            #21b65d 100%
                        );
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow:
                        0 12px 35px rgba(21,128,61,0.20);
                }

                .hero-pro::after {
                    content: "";
                    position: absolute;
                    width: 360px;
                    height: 360px;
                    right: -130px;
                    top: -150px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.08);
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 700px;
                }

                .hero-label {
                    font-size: 12px;
                    letter-spacing: 2.2px;
                    font-weight: 800;
                    opacity: 0.85;
                }

                .hero-content h2 {
                    margin: 12px 0 12px;
                    font-size: 38px;
                    line-height: 1.15;
                    font-weight: 850;
                }

                .hero-content p {
                    max-width: 610px;
                    margin: 0;
                    line-height: 1.65;
                    font-size: 15px;
                    color: rgba(255,255,255,0.9);
                }

                .hero-button {
                    margin-top: 25px;
                    border: none;
                    background: white;
                    color: #15803d;
                    padding: 13px 20px;
                    border-radius: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    font-size: 14px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.12);
                    transition: 0.2s;
                }

                .hero-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 18px rgba(0,0,0,0.16);
                }

                .hero-visual {
                    position: relative;
                    z-index: 2;
                    font-size: 125px;
                    opacity: 0.95;
                    margin-right: 40px;
                }

                /* SECTION */

                .dashboard-section {
                    margin-top: 30px;
                }

                .section-heading {
                    margin-bottom: 15px;
                }

                .section-heading h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 800;
                }

                .section-heading p {
                    margin: 6px 0 0;
                    color: #64748b;
                    font-size: 14px;
                }

                /* OVERVIEW */

                .overview-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 18px;
                }

                /* LATEST */

                .latest-card {
                    margin-top: 25px;
                    background: white;
                    border: 1px solid #e5ebe7;
                    border-radius: 18px;
                    padding: 25px;
                    box-shadow:
                        0 5px 20px rgba(0,0,0,0.055);
                }

                .latest-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                }

                .latest-title {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 800;
                }

                .latest-date {
                    margin: 5px 0 0;
                    color: #64748b;
                    font-size: 13px;
                }

                .history-button {
                    border: none;
                    background: #ecfdf3;
                    color: #15803d;
                    padding: 10px 15px;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .latest-result {
                    margin-top: 18px;
                    padding: 20px;
                    border-radius: 14px;
                    background: #f0fdf4;
                    border: 1px solid #dcfce7;
                }

                .latest-result.disease {
                    background: #fff7ed;
                    border-color: #fed7aa;
                }

                .latest-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, 1fr);
                    gap: 20px;
                }

                .latest-item-label {
                    color: #64748b;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .latest-item-value {
                    margin-top: 6px;
                    font-size: 17px;
                    font-weight: 800;
                }

                .latest-item-value.green {
                    color: #15803d;
                }

                .latest-item-value.red {
                    color: #dc2626;
                }

                /* CROP GRID */

                .crop-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 18px;
                }

                .crop-card {
                    background: white;
                    border: 1px solid #e5ebe7;
                    border-radius: 17px;
                    padding: 21px;
                    box-shadow:
                        0 4px 16px rgba(0,0,0,0.045);
                    transition: 0.2s;
                    cursor: pointer;
                }

                .crop-card:hover {
                    transform: translateY(-3px);
                    border-color: #86efac;
                    box-shadow:
                        0 9px 24px rgba(21,128,61,0.10);
                }

                .crop-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .crop-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 13px;
                    background: #ecfdf3;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                }

                .crop-status {
                    font-size: 11px;
                    font-weight: 800;
                    padding: 6px 9px;
                    border-radius: 20px;
                    background: #ecfdf3;
                    color: #15803d;
                }

                .crop-status.soon {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .crop-card h3 {
                    margin: 16px 0 5px;
                    font-size: 18px;
                }

                .crop-card p {
                    margin: 0;
                    color: #64748b;
                    font-size: 13px;
                }

                .crop-action {
                    margin-top: 17px;
                    color: #16a34a;
                    font-size: 20px;
                    font-weight: 800;
                }

                /* HOW IT WORKS */

                .process-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 18px;
                }

                .process-card {
                    background: white;
                    border: 1px solid #e5ebe7;
                    border-radius: 17px;
                    padding: 24px;
                    position: relative;
                }

                .process-number {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: #dcfce7;
                    color: #15803d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    margin-bottom: 17px;
                }

                .process-card h3 {
                    margin: 0 0 8px;
                    font-size: 17px;
                }

                .process-card p {
                    margin: 0;
                    color: #64748b;
                    line-height: 1.55;
                    font-size: 13px;
                }

                /* QUICK ACTIONS */

                .quick-grid-pro {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 18px;
                }

                .quick-card-pro {
                    background: white;
                    border: 1px solid #e5ebe7;
                    border-radius: 17px;
                    padding: 23px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .quick-card-pro:hover {
                    transform: translateY(-3px);
                    border-color: #86efac;
                    box-shadow:
                        0 9px 24px rgba(21,128,61,0.09);
                }

                .quick-card-icon {
                    font-size: 29px;
                    margin-bottom: 13px;
                }

                .quick-card-pro h3 {
                    margin: 0 0 7px;
                    font-size: 17px;
                }

                .quick-card-pro p {
                    margin: 0;
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.55;
                }

                .quick-arrow {
                    display: block;
                    margin-top: 15px;
                    color: #16a34a;
                    font-size: 20px;
                    font-weight: 800;
                }

                /* EMPTY */

                .empty-dashboard {
                    padding: 30px;
                    text-align: center;
                    background: #f8fafc;
                    border-radius: 15px;
                    color: #64748b;
                }

                /* RESPONSIVE */

                @media (max-width: 1100px) {
                    .dashboard-stat-grid {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }

                    .crop-grid {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }

                    .quick-grid-pro {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }
                }

                @media (max-width: 800px) {
                    .dashboard-pro {
                        padding: 20px;
                    }

                    .dashboard-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .search-wrapper {
                        flex: 1;
                        width: auto;
                    }

                    .hero-pro {
                        padding: 30px;
                    }

                    .hero-content h2 {
                        font-size: 30px;
                    }

                    .hero-visual {
                        display: none;
                    }

                    .overview-grid,
                    .process-grid {
                        grid-template-columns: 1fr;
                    }

                    .latest-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 600px) {
                    .dashboard-stat-grid,
                    .crop-grid,
                    .quick-grid-pro {
                        grid-template-columns: 1fr;
                    }

                    .dashboard-title h1 {
                        font-size: 28px;
                    }

                    .refresh-button {
                        display: none;
                    }

                    .hero-content h2 {
                        font-size: 27px;
                    }

                    .latest-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }

            `}</style>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div className="dashboard-title">
                    <h1>Dashboard</h1>
                    <p>
                        Welcome, {userName} 👋
                    </p>
                </div>


                <div className="header-actions">

                    {/* SEARCH */}

                    <div className="search-wrapper">

                        <div className="search-box">

                            <span className="search-icon">
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Search dashboard..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(
                                        e.target.value
                                    );
                                    setShowSearchResults(
                                        true
                                    );
                                }}
                                onFocus={() => {
                                    if (search.trim()) {
                                        setShowSearchResults(
                                            true
                                        );
                                    }
                                }}
                            />

                        </div>


                        {showSearchResults &&
                            search.trim() &&
                            searchResults.length > 0 && (

                                <div className="search-results">

                                    {searchResults.map(
                                        (result, index) => (

                                            <div
                                                className="search-result"
                                                key={
                                                    `${result.title}-${index}`
                                                }
                                                onClick={() => {
                                                    setShowSearchResults(
                                                        false
                                                    );
                                                    navigate(
                                                        result.action
                                                    );
                                                }}
                                            >

                                                <div className="search-result-icon">
                                                    {result.icon}
                                                </div>

                                                <div>

                                                    <div className="search-result-title">
                                                        {result.title}
                                                    </div>

                                                    <div className="search-result-description">
                                                        {
                                                            result.description
                                                        }
                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>
                            )}

                    </div>


                    {/* REFRESH */}

                    <button
                        className="refresh-button"
                        onClick={() =>
                            fetchDashboardData(true)
                        }
                        disabled={refreshing}
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "↻ Refresh"
                        }
                    </button>


                    {/* PROFILE */}

                    <button
                        className="profile-button"
                        title={userName}
                    >
                        {userInitial}
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="dashboard-error">
                    ⚠️ {error}
                </div>
            )}


            {/* =================================================
                TOP STATISTICS
            ================================================= */}

            <div className="dashboard-stat-grid">

                <div className="dashboard-stat">

                    <div className="stat-icon-pro">
                        🌱
                    </div>

                    <div>
                        <p className="stat-label">
                            Supported Crops
                        </p>

                        <h2 className="stat-value">
                            {supportedCrops.length}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-stat">

                    <div className="stat-icon-pro">
                        🧠
                    </div>

                    <div>
                        <p className="stat-label">
                            AI Model
                        </p>

                        <h2
                            className="stat-value"
                            style={{
                                fontSize: "18px"
                            }}
                        >
                            EfficientNet-B0
                        </h2>
                    </div>

                </div>


                <div className="dashboard-stat">

                    <div className="stat-icon-pro">
                        🎯
                    </div>

                    <div>
                        <p className="stat-label">
                            Model Status
                        </p>

                        <h2 className="stat-value green">
                            {loading
                                ? "Loading..."
                                : "Ready"
                            }
                        </h2>
                    </div>

                </div>


                <div className="dashboard-stat">

                    <div className="stat-icon-pro">
                        📷
                    </div>

                    <div>
                        <p className="stat-label">
                            Total Detections
                        </p>

                        <h2 className="stat-value">
                            {loading
                                ? "..."
                                : totalDetections
                            }
                        </h2>
                    </div>

                </div>

            </div>


            {/* =================================================
                HERO
            ================================================= */}

            <div className="hero-pro">

                <div className="hero-content">

                    <div className="hero-label">
                        AI POWERED CROP HEALTH
                    </div>

                    <h2>
                        Detect Plant Diseases
                        <br />
                        with Artificial Intelligence
                    </h2>

                    <p>
                        Upload a crop leaf image and let
                        AgriMind AI analyze it using
                        deep learning with EfficientNet-B0.
                    </p>

                    <button
                        className="hero-button"
                        onClick={() =>
                            navigate("/detection")
                        }
                    >
                        🔬 Start Detection
                    </button>

                </div>


                <div className="hero-visual">
                    🌾
                </div>

            </div>


            {/* =================================================
                AI DETECTION OVERVIEW
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-heading">

                    <h2>
                        AI Detection Overview
                    </h2>

                    <p>
                        Real-time insights from your detection history
                    </p>

                </div>


                <div className="overview-grid">

                    <div className="dashboard-stat">

                        <div className="stat-icon-pro">
                            📊
                        </div>

                        <div>
                            <p className="stat-label">
                                Average Confidence
                            </p>

                            <h2 className="stat-value">
                                {averageConfidence}%
                            </h2>
                        </div>

                    </div>


                    <div className="dashboard-stat">

                        <div className="stat-icon-pro">
                            🌿
                        </div>

                        <div>
                            <p className="stat-label">
                                Healthy Predictions
                            </p>

                            <h2 className="stat-value green">
                                {healthyCount}
                            </h2>
                        </div>

                    </div>


                    <div className="dashboard-stat">

                        <div className="stat-icon-pro">
                            🦠
                        </div>

                        <div>
                            <p className="stat-label">
                                Disease Predictions
                            </p>

                            <h2 className="stat-value red">
                                {diseaseCount}
                            </h2>
                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                LATEST AI DETECTION
            ================================================= */}

            <div className="dashboard-section">

                <div className="latest-card">

                    <div className="latest-header">

                        <div>

                            <h2 className="latest-title">
                                🧠 Latest AI Detection
                            </h2>

                            <p className="latest-date">
                                {latestDetection
                                    ? formatDate(
                                        latestDetection.created_at
                                    )
                                    : "No detections yet"
                                }
                            </p>

                        </div>

                        <button
                            className="history-button"
                            onClick={() =>
                                navigate("/history")
                            }
                        >
                            View History →
                        </button>

                    </div>


                    {latestDetection ? (

                        <div
                            className={`latest-result ${
                                latestIsHealthy
                                    ? ""
                                    : "disease"
                            }`}
                        >

                            <div className="latest-grid">

                                <div>

                                    <div className="latest-item-label">
                                        Crop
                                    </div>

                                    <div className="latest-item-value">
                                        🌱{" "}
                                        {latestDetection.crop}
                                    </div>

                                </div>


                                <div>

                                    <div className="latest-item-label">
                                        Prediction
                                    </div>

                                    <div
                                        className={`latest-item-value ${
                                            latestIsHealthy
                                                ? "green"
                                                : "red"
                                        }`}
                                    >
                                        🦠{" "}
                                        {
                                            latestDetection.prediction
                                        }
                                    </div>

                                </div>


                                <div>

                                    <div className="latest-item-label">
                                        Confidence
                                    </div>

                                    <div className="latest-item-value">
                                        🎯{" "}
                                        {Number(
                                            latestDetection.confidence
                                        ).toFixed(2)}
                                        %
                                    </div>

                                </div>

                            </div>

                        </div>

                    ) : (

                        <div className="empty-dashboard">
                            No AI detections available yet.
                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                SUPPORTED CROPS
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-heading">

                    <h2>
                        🌾 Supported Crops
                    </h2>

                    <p>
                        {availableCropCount} crops currently
                        available for AI disease detection
                    </p>

                </div>


                <div className="crop-grid">

                    {supportedCrops.map(crop => (

                        <div
                            className="crop-card"
                            key={crop.name}
                            onClick={() => {
                                if (crop.available) {
                                    navigate(
                                        "/detection"
                                    );
                                } else {
                                    navigate(
                                        "/crops"
                                    );
                                }
                            }}
                        >

                            <div className="crop-top">

                                <div className="crop-icon">
                                    {crop.icon}
                                </div>

                                <span
                                    className={`crop-status ${
                                        crop.available
                                            ? ""
                                            : "soon"
                                    }`}
                                >
                                    {crop.status}
                                </span>

                            </div>


                            <h3>
                                {crop.name}
                            </h3>

                            <p>
                                {crop.available
                                    ? `AI-powered disease detection for ${crop.name.toLowerCase()} leaves.`
                                    : `Disease detection for ${crop.name.toLowerCase()} is under development.`
                                }
                            </p>

                            <div className="crop-action">
                                {crop.available
                                    ? "Analyze Now →"
                                    : "View Details →"
                                }
                            </div>

                        </div>

                    ))}

                </div>

            </div>


            {/* =================================================
                HOW AGRIMIND AI WORKS
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-heading">

                    <h2>
                        🤖 How AgriMind AI Works
                    </h2>

                    <p>
                        Simple three-step AI-powered crop health analysis
                    </p>

                </div>


                <div className="process-grid">

                    <div className="process-card">

                        <div className="process-number">
                            1
                        </div>

                        <h3>
                            📷 Upload Image
                        </h3>

                        <p>
                            Upload a clear crop leaf
                            photograph through the
                            Disease Detection module.
                        </p>

                    </div>


                    <div className="process-card">

                        <div className="process-number">
                            2
                        </div>

                        <h3>
                            🧠 AI Analysis
                        </h3>

                        <p>
                            EfficientNet-B0 analyzes
                            visual patterns in the
                            uploaded leaf image.
                        </p>

                    </div>


                    <div className="process-card">

                        <div className="process-number">
                            3
                        </div>

                        <h3>
                            🎯 Get Result
                        </h3>

                        <p>
                            View the predicted condition,
                            confidence score and
                            recommendations.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-heading">

                    <h2>
                        Quick Actions
                    </h2>

                    <p>
                        Access important AgriMind AI features
                    </p>

                </div>


                <div className="quick-grid-pro">

                    <div
                        className="quick-card-pro"
                        onClick={() =>
                            navigate("/detection")
                        }
                    >

                        <div className="quick-card-icon">
                            🔬
                        </div>

                        <h3>
                            Disease Detection
                        </h3>

                        <p>
                            Upload a leaf image and
                            detect possible diseases.
                        </p>

                        <span className="quick-arrow">
                            Start Detection →
                        </span>

                    </div>


                    <div
                        className="quick-card-pro"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >

                        <div className="quick-card-icon">
                            📊
                        </div>

                        <h3>
                            Analytics
                        </h3>

                        <p>
                            View detection statistics,
                            confidence and disease distribution.
                        </p>

                        <span className="quick-arrow">
                            View Analytics →
                        </span>

                    </div>


                    <div
                        className="quick-card-pro"
                        onClick={() =>
                            navigate("/history")
                        }
                    >

                        <div className="quick-card-icon">
                            🕘
                        </div>

                        <h3>
                            Detection History
                        </h3>

                        <p>
                            View all previous AI
                            detection results.
                        </p>

                        <span className="quick-arrow">
                            View History →
                        </span>

                    </div>

                </div>

            </div>


        </div>
    );
}


export default Dashboard;
