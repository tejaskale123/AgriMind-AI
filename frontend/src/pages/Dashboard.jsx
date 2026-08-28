import React, { useEffect, useMemo, useState } from "react";

function Dashboard() {
    // =========================================================
    // USER
    // =========================================================

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        user = null;
    }

    const userName =
        user?.full_name ||
        user?.name ||
        user?.username ||
        "Farmer";

    const userInitial =
        userName.trim().charAt(0).toUpperCase() || "F";


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
    // FETCH HISTORY
    // =========================================================

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const storageKeys = [
                "access_token",
                "token",
                "accessToken",
                "authToken",
                "jwt",
                "auth"
            ];

            let token = null;

            for (const key of storageKeys) {
                const localValue = localStorage.getItem(key);

                if (localValue) {
                    try {
                        const parsed = JSON.parse(localValue);

                        if (
                            typeof parsed === "string" &&
                            parsed.length > 20
                        ) {
                            token = parsed;
                            break;
                        }

                        if (parsed?.access_token) {
                            token = parsed.access_token;
                            break;
                        }

                        if (parsed?.token) {
                            token = parsed.token;
                            break;
                        }
                    } catch {
                        token = localValue;
                        break;
                    }
                }

                const sessionValue = sessionStorage.getItem(key);

                if (sessionValue) {
                    try {
                        const parsed = JSON.parse(sessionValue);

                        if (
                            typeof parsed === "string" &&
                            parsed.length > 20
                        ) {
                            token = parsed;
                            break;
                        }

                        if (parsed?.access_token) {
                            token = parsed.access_token;
                            break;
                        }

                        if (parsed?.token) {
                            token = parsed.token;
                            break;
                        }
                    } catch {
                        token = sessionValue;
                        break;
                    }
                }
            }

            if (!token) {
                throw new Error(
                    "Not authenticated. Please logout and login again."
                );
            }

            const response = await fetch(
                "http://127.0.0.1:8000/history",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error(
                        "Authentication expired or invalid. Please logout and login again."
                    );
                }

                throw new Error(
                    data.detail ||
                    "Failed to load dashboard data."
                );
            }

            const records = Array.isArray(data.history)
                ? data.history
                : [];

            setHistory(records);

            setTotalDetections(
                data.count ?? records.length
            );

            setLatestDetection(
                records.length > 0
                    ? records[0]
                    : null
            );

        } catch (err) {
            console.error("Dashboard error:", err);

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
    // HEALTH CHECK
    // =========================================================

    const isHealthyPrediction = (prediction) => {
        if (!prediction) return false;

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
    // ANALYTICS
    // =========================================================

    const healthyCount = useMemo(() => {
        return history.filter((item) =>
            isHealthyPrediction(item.prediction)
        ).length;
    }, [history]);


    const diseaseCount = useMemo(() => {
        return history.filter((item) =>
            !isHealthyPrediction(item.prediction)
        ).length;
    }, [history]);


    const averageConfidence = useMemo(() => {
        if (!history.length) return "0.00";

        const total = history.reduce(
            (sum, item) =>
                sum + Number(item.confidence || 0),
            0
        );

        return (
            total / history.length
        ).toFixed(2);
    }, [history]);


    const availableCropCount = useMemo(() => {
        return supportedCrops.filter(
            (crop) => crop.available
        ).length;
    }, []);


    // =========================================================
    // SEARCH
    // =========================================================

    const searchResults = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return [];

        const results = [];

        supportedCrops.forEach((crop) => {
            if (
                crop.name
                    .toLowerCase()
                    .includes(query)
            ) {
                results.push({
                    icon: crop.icon,
                    title: crop.name,
                    description: crop.status,
                    action: crop.available
                        ? "/detection"
                        : "/crops"
                });
            }
        });

        history.forEach((item) => {
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

        features.forEach((feature) => {
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
    // DATE
    // =========================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "No detections yet";
        }

        try {
            return new Date(dateValue).toLocaleString(
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


    const latestIsHealthy =
        isHealthyPrediction(
            latestDetection?.prediction
        );


    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="agrimind-dashboard">

            <style>{`

                /* =================================================
                   BASE
                ================================================= */

                .agrimind-dashboard {
                    min-height: 100%;
                    width: 100%;
                    max-width: 1500px;
                    margin: 0 auto;
                    padding: 30px 34px 70px;
                    color: #10261a;
                    box-sizing: border-box;
                    background:
                        radial-gradient(
                            circle at 85% 5%,
                            rgba(34,197,94,.05),
                            transparent 30%
                        );
                }

                .agrimind-dashboard * {
                    box-sizing: border-box;
                }


                /* =================================================
                   HEADER
                ================================================= */

                .am-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 26px;
                }
                
                .am-dashboard-label {
                display: inline-block;

                margin-bottom: 8px;

                color: #16a34a;

                font-size: 10px;

                font-weight: 850;

                letter-spacing: 1.8px;

                line-height: 1;
            }
                .am-heading h1 {
                    margin: 0;
                    font-size: 36px;
                    line-height: 1.1;
                    font-weight: 850;
                    letter-spacing: -1.2px;
                }

                .am-heading p {
                    margin: 8px 0 0;
                    color: #718096;
                    font-size: 15px;
                }

                .am-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .am-search {
                    position: relative;
                    width: 300px;
                }

                .am-search-box {
                    height: 46px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 15px;
                    background: #ffffff;
                    border: 1px solid #dce8e1;
                    border-radius: 13px;
                    box-shadow:
                        0 4px 16px rgba(15, 60, 30, .04);
                }

                .am-search-box span {
                    font-size: 17px;
                }

                .am-search-box input {
                    width: 100%;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 14px;
                    color: #16271d;
                }

                .am-refresh {
                    height: 46px;
                    padding: 0 17px;
                    border-radius: 13px;
                    border: 1px solid #22a653;
                    background: #ffffff;
                    color: #15803d;
                    font-weight: 750;
                    cursor: pointer;
                    transition: .2s ease;
                }

                .am-refresh:hover {
                    background: #f0fdf4;
                    transform: translateY(-1px);
                }

                .am-refresh:disabled {
                    opacity: .65;
                    cursor: wait;
                }

                .am-profile {
                    width: 46px;
                    height: 46px;
                    border: none;
                    border-radius: 50%;
                    background:
                        linear-gradient(
                            145deg,
                            #22c55e,
                            #079447
                        );
                    color: white;
                    font-weight: 850;
                    font-size: 16px;
                    box-shadow:
                        0 6px 16px rgba(22,163,74,.22);
                }


                /* =================================================
                   SEARCH RESULTS
                ================================================= */

                .am-search-results {
                    position: absolute;
                    top: 54px;
                    left: 0;
                    width: 100%;
                    z-index: 100;
                    overflow: hidden;
                    background: white;
                    border: 1px solid #e2ebe5;
                    border-radius: 14px;
                    box-shadow:
                        0 18px 40px rgba(0,0,0,.13);
                }

                .am-search-result {
                    display: flex;
                    gap: 11px;
                    padding: 12px 14px;
                    cursor: pointer;
                    border-bottom: 1px solid #f1f5f3;
                }

                .am-search-result:last-child {
                    border-bottom: none;
                }

                .am-search-result:hover {
                    background: #f0fdf4;
                }

                .am-search-result-icon {
                    font-size: 20px;
                }

                .am-search-result-title {
                    font-size: 14px;
                    font-weight: 750;
                }

                .am-search-result-description {
                    margin-top: 3px;
                    font-size: 12px;
                    color: #718096;
                }


                /* =================================================
                   ERROR
                ================================================= */

                .am-error {
                    margin-bottom: 22px;
                    padding: 14px 17px;
                    border: 1px solid #fecaca;
                    border-radius: 13px;
                    background: #fff7f7;
                    color: #991b1b;
                    font-size: 14px;
                }


                /* =================================================
                   STAT CARDS
                ================================================= */

                .am-stat-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(4, minmax(0, 1fr));
                    gap: 17px;
                }

                .am-stat {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    min-height: 112px;
                    padding: 20px;
                    background: rgba(255,255,255,.96);
                    border: 1px solid #e3ebe6;
                    border-radius: 18px;
                    box-shadow:
                        0 5px 22px rgba(15,60,30,.055);
                    transition: .2s ease;
                }

                .am-stat:hover {
                    transform: translateY(-3px);
                    box-shadow:
                        0 12px 28px rgba(15,60,30,.09);
                }

                .am-stat-icon {
                    width: 54px;
                    height: 54px;
                    min-width: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 15px;
                    background: #ecfdf3;
                    font-size: 25px;
                }

                .am-stat-label {
                    margin: 0 0 5px;
                    color: #718096;
                    font-size: 12px;
                    font-weight: 700;
                }

                .am-stat-value {
                    margin: 0;
                    color: #10261a;
                    font-size: 23px;
                    line-height: 1;
                    font-weight: 850;
                }

                .am-green {
                    color: #159447;
                }

                .am-red {
                    color: #dc2626;
                }


                /* =================================================
                   HERO
                ================================================= */

                .am-hero {
                    position: relative;
                    overflow: hidden;
                    min-height: 300px;
                    margin-top: 22px;
                    padding: 45px 48px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 24px;
                    background:
                        linear-gradient(
                            135deg,
                            #087a3a 0%,
                            #119447 45%,
                            #21b85f 100%
                        );
                    color: white;
                    box-shadow:
                        0 18px 40px rgba(21,128,61,.19);
                }

                .am-hero::before {
                    content: "";
                    position: absolute;
                    width: 430px;
                    height: 430px;
                    right: -160px;
                    top: -190px;
                    border-radius: 50%;
                    background: rgba(255,255,255,.08);
                }

                .am-hero::after {
                    content: "";
                    position: absolute;
                    width: 260px;
                    height: 260px;
                    right: 90px;
                    bottom: -210px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,.12);
                }

                .am-hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 720px;
                }

                .am-hero-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 12px;
                    font-weight: 850;
                    letter-spacing: 2.1px;
                    opacity: .9;
                }

                .am-hero-label::before {
                    content: "";
                    width: 25px;
                    height: 2px;
                    background: #bbf7d0;
                }

                .am-hero h2 {
                    margin: 14px 0 14px;
                    font-size: 40px;
                    line-height: 1.1;
                    letter-spacing: -1.1px;
                    font-weight: 900;
                }

                .am-hero p {
                    max-width: 620px;
                    margin: 0;
                    color: rgba(255,255,255,.91);
                    font-size: 15px;
                    line-height: 1.7;
                }

                .am-primary-button {
                    margin-top: 25px;
                    height: 46px;
                    padding: 0 20px;
                    border: none;
                    border-radius: 12px;
                    background: white;
                    color: #118343;
                    font-size: 14px;
                    font-weight: 850;
                    cursor: pointer;
                    box-shadow:
                        0 7px 18px rgba(0,0,0,.14);
                    transition: .2s ease;
                }

                .am-primary-button:hover {
                    transform: translateY(-2px);
                    box-shadow:
                        0 11px 23px rgba(0,0,0,.18);
                }

                .am-hero-art {
                    position: relative;
                    z-index: 2;
                    margin-right: 45px;
                    font-size: 125px;
                    filter:
                        drop-shadow(
                            0 12px 12px rgba(0,0,0,.12)
                        );
                }


                /* =================================================
                   SECTIONS
                ================================================= */

                .am-section {
                    margin-top: 32px;
                }

                .am-section-head {
                    margin-bottom: 15px;
                }

                .am-section-head h2 {
                    margin: 0;
                    font-size: 24px;
                    letter-spacing: -.4px;
                    font-weight: 850;
                }

                .am-section-head p {
                    margin: 6px 0 0;
                    color: #718096;
                    font-size: 14px;
                }


                /* =================================================
                   OVERVIEW
                ================================================= */

                .am-overview {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 17px;
                }


                /* =================================================
                   LATEST DETECTION
                ================================================= */

                .am-latest {
                    padding: 24px;
                    background: white;
                    border: 1px solid #e3ebe6;
                    border-radius: 19px;
                    box-shadow:
                        0 5px 22px rgba(15,60,30,.05);
                }

                .am-latest-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .am-latest-title {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 850;
                }

                .am-latest-date {
                    margin: 5px 0 0;
                    color: #718096;
                    font-size: 13px;
                }

                .am-history-button {
                    height: 40px;
                    padding: 0 14px;
                    border: none;
                    border-radius: 10px;
                    background: #ecfdf3;
                    color: #15803d;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .am-latest-result {
                    margin-top: 18px;
                    padding: 21px;
                    border: 1px solid #bbf7d0;
                    border-radius: 15px;
                    background: #f0fdf4;
                }

                .am-latest-result.disease {
                    border-color: #fed7aa;
                    background: #fff7ed;
                }

                .am-latest-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, 1fr);
                    gap: 20px;
                }

                .am-detail-label {
                    color: #718096;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: .7px;
                    text-transform: uppercase;
                }

                .am-detail-value {
                    margin-top: 6px;
                    font-size: 16px;
                    font-weight: 850;
                }


                /* =================================================
                   CROP CARDS
                ================================================= */

                .am-crop-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 17px;
                }

                .am-crop-card {
                    padding: 21px;
                    background: white;
                    border: 1px solid #e3ebe6;
                    border-radius: 18px;
                    cursor: pointer;
                    transition: .2s ease;
                }

                .am-crop-card:hover {
                    transform: translateY(-3px);
                    border-color: #86efac;
                    box-shadow:
                        0 12px 28px rgba(21,128,61,.09);
                }

                .am-crop-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .am-crop-icon {
                    width: 49px;
                    height: 49px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background: #ecfdf3;
                    font-size: 26px;
                }

                .am-crop-status {
                    padding: 6px 9px;
                    border-radius: 20px;
                    background: #ecfdf3;
                    color: #15803d;
                    font-size: 10px;
                    font-weight: 850;
                }

                .am-crop-status.soon {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .am-crop-card h3 {
                    margin: 16px 0 6px;
                    font-size: 18px;
                    font-weight: 850;
                }

                .am-crop-card p {
                    min-height: 40px;
                    margin: 0;
                    color: #718096;
                    font-size: 13px;
                    line-height: 1.55;
                }

                .am-crop-action {
                    margin-top: 17px;
                    color: #16a34a;
                    font-size: 14px;
                    font-weight: 850;
                }


                /* =================================================
                   HOW IT WORKS
                ================================================= */

                .am-process {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 17px;
                }

                .am-process-card {
                    position: relative;
                    padding: 24px;
                    background: white;
                    border: 1px solid #e3ebe6;
                    border-radius: 18px;
                }

                .am-number {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 17px;
                    border-radius: 12px;
                    background: #dcfce7;
                    color: #15803d;
                    font-weight: 900;
                }

                .am-process-card h3 {
                    margin: 0 0 8px;
                    font-size: 17px;
                    font-weight: 850;
                }

                .am-process-card p {
                    margin: 0;
                    color: #718096;
                    font-size: 13px;
                    line-height: 1.6;
                }


                /* =================================================
                   QUICK ACTIONS
                ================================================= */

                .am-quick {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 17px;
                }

                .am-quick-card {
                    padding: 23px;
                    background: white;
                    border: 1px solid #e3ebe6;
                    border-radius: 18px;
                    cursor: pointer;
                    transition: .2s ease;
                }

                .am-quick-card:hover {
                    transform: translateY(-3px);
                    border-color: #86efac;
                    box-shadow:
                        0 12px 28px rgba(21,128,61,.09);
                }

                .am-quick-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 15px;
                    border-radius: 14px;
                    background: #ecfdf3;
                    font-size: 24px;
                }

                .am-quick-card h3 {
                    margin: 0 0 7px;
                    font-size: 17px;
                    font-weight: 850;
                }

                .am-quick-card p {
                    margin: 0;
                    color: #718096;
                    font-size: 13px;
                    line-height: 1.55;
                }

                .am-quick-arrow {
                    display: block;
                    margin-top: 15px;
                    color: #16a34a;
                    font-size: 14px;
                    font-weight: 850;
                }


                /* =================================================
                   EMPTY
                ================================================= */

                .am-empty {
                    padding: 30px;
                    text-align: center;
                    color: #718096;
                    background: #f8faf9;
                    border-radius: 14px;
                }


                /* =================================================
                   RESPONSIVE
                ================================================= */

                @media (max-width: 1150px) {
                    .am-stat-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .am-crop-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .am-quick {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 850px) {
                    .agrimind-dashboard {
                        padding: 22px 20px 50px;
                    }

                    .am-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .am-header-actions {
                        width: 100%;
                    }

                    .am-search {
                        flex: 1;
                        width: auto;
                    }

                    .am-hero {
                        padding: 34px;
                    }

                    .am-hero h2 {
                        font-size: 32px;
                    }

                    .am-hero-art {
                        display: none;
                    }

                    .am-overview,
                    .am-process {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 600px) {
                    .am-stat-grid,
                    .am-crop-grid,
                    .am-quick {
                        grid-template-columns: 1fr;
                    }

                    .am-header-actions {
                        flex-wrap: wrap;
                    }

                    .am-search {
                        width: 100%;
                        flex-basis: 100%;
                    }

                    .am-heading h1 {
                        font-size: 29px;
                    }

                    .am-hero {
                        padding: 28px 24px;
                    }

                    .am-hero h2 {
                        font-size: 27px;
                    }

                    .am-latest-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .am-latest-grid {
                        grid-template-columns: 1fr;
                    }

                    .am-refresh {
                        flex: 1;
                    }
                }

                /* =================================================
                   STEP 5 - AGRIMIND HERO UI
                ================================================= */

                .am-hero {
                    min-height: 335px;
                    padding: 46px 50px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 30px;
                    border-radius: 26px;
                    overflow: hidden;
                    background:
                        linear-gradient(
                            135deg,
                            #075f2c 0%,
                            #087a3a 35%,
                            #16a34a 70%,
                            #22c55e 100%
                        );
                    box-shadow:
                        0 18px 40px rgba(
                            21,
                            128,
                            61,
                            0.20
                        );
                    position: relative;
                }

                .am-hero::before {
                    content: "";
                    position: absolute;
                    width: 430px;
                    height: 430px;
                    right: -150px;
                    top: -240px;
                    border-radius: 50%;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.08
                        );
                    pointer-events: none;
                }

                .am-hero::after {
                    content: "";
                    position: absolute;
                    width: 240px;
                    height: 240px;
                    right: 80px;
                    bottom: -190px;
                    border-radius: 50%;
                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.14
                        );
                    pointer-events: none;
                }

                .am-hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 760px;
                }

                .am-hero-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #dcfce7;
                    font-size: 11px;
                    font-weight: 850;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .am-hero-label::before {
                    content: "";
                    width: 28px;
                    height: 2px;
                    border-radius: 10px;
                    background: #bbf7d0;
                }

                .am-hero h2 {
                    margin: 15px 0 14px;
                    color: #ffffff;
                    font-size: 42px;
                    line-height: 1.08;
                    font-weight: 900;
                    letter-spacing: -1.2px;
                }

                .am-hero p {
                    max-width: 650px;
                    margin: 0;
                    color:
                        rgba(
                            255,
                            255,
                            255,
                            0.90
                        );
                    font-size: 15px;
                    line-height: 1.7;
                }

                .am-primary-button {
                    margin-top: 26px;
                    height: 50px;
                    padding: 0 21px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    border-radius: 13px;
                    background: #ffffff;
                    color: #087a3a;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 850;
                    cursor: pointer;
                    box-shadow:
                        0 9px 22px
                        rgba(
                            0,
                            0,
                            0,
                            0.15
                        );
                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .am-primary-button:hover {
                    transform: translateY(-3px);
                    box-shadow:
                        0 13px 28px
                        rgba(
                            0,
                            0,
                            0,
                            0.20
                        );
                }

                .am-hero-art {
                    position: relative;
                    z-index: 2;
                    width: 165px;
                    height: 165px;
                    min-width: 165px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 25px;
                    border-radius: 50%;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.09
                        );
                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.18
                        );
                    font-size: 95px;
                    filter:
                        drop-shadow(
                            0 12px 15px
                            rgba(
                                0,
                                0,
                                0.13
                            )
                        );
                }

                @media (max-width: 850px) {

                    .am-hero {
                        padding: 36px;
                    }

                    .am-hero h2 {
                        font-size: 34px;
                    }

                    .am-hero-art {
                        width: 135px;
                        height: 135px;
                        min-width: 135px;
                        font-size: 75px;
                    }
                }

                @media (max-width: 600px) {

                    .am-hero {
                        padding: 30px 24px;
                        flex-direction: column;
                        align-items: flex-start;
                        border-radius: 21px;
                    }

                    .am-hero h2 {
                        font-size: 28px;
                    }

                    .am-hero p {
                        font-size: 14px;
                    }

                    .am-primary-button {
                        width: 100%;
                    }

                    .am-hero-art {
                        align-self: center;
                        width: 115px;
                        height: 115px;
                        min-width: 115px;
                        margin: 0;
                        font-size: 65px;
                    }
                }

            `}</style>


            {/* =================================================
               HEADER
            ================================================= */}

            <header className="am-header">

                {/* LEFT SIDE */}

                <div className="am-heading">

                    <span className="am-dashboard-label">
                        AGRIMIND AI • SMART AGRICULTURE
                    </span>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Welcome back, {userName} 👋
                    </p>

                </div>


                {/* RIGHT SIDE */}

                <div className="am-header-actions">

                    {/* SEARCH */}

                    <div className="am-search">

                        <div className="am-search-box">

                            <span>
                                🔍
                            </span>

                            <input
                                value={search}
                                type="text"
                                placeholder="Search crops, diseases..."
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setShowSearchResults(true);
                                }}
                                onFocus={() => {
                                    if (search.trim()) {
                                        setShowSearchResults(true);
                                    }
                                }}
                            />

                        </div>


                        {/* SEARCH RESULTS */}

                        {showSearchResults &&
                            search.trim() &&
                            searchResults.length > 0 && (

                                <div className="am-search-results">

                                    {searchResults.map(
                                        (result, index) => (

                                            <div
                                                key={`${result.title}-${index}`}
                                                className="am-search-result"
                                                onClick={() => {
                                                    setShowSearchResults(false);
                                                    setSearch("");
                                                    navigate(result.action);
                                                }}
                                            >

                                                <div className="am-search-result-icon">
                                                    {result.icon}
                                                </div>

                                                <div>

                                                    <div className="am-search-result-title">
                                                        {result.title}
                                                    </div>

                                                    <div className="am-search-result-description">
                                                        {result.description}
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
                        className="am-refresh"
                        disabled={refreshing}
                        onClick={() => fetchDashboardData(true)}
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "↻ Refresh"
                        }
                    </button>


                    {/* PROFILE */}

                    <button
                        className="am-profile"
                        title={userName}
                    >
                        {userInitial}
                    </button>

                </div>

            </header>

            {/* =================================================
               ERROR
            ================================================= */}

            {error && (
                <div className="am-error">
                    ⚠️ {error}
                </div>
            )}


            {/* =================================================
               TOP STATS
            ================================================= */}

            <div className="am-stat-grid">

                <div className="am-stat">

                    <div className="am-stat-icon">
                        🌱
                    </div>

                    <div>
                        <p className="am-stat-label">
                            Supported Crops
                        </p>

                        <h2 className="am-stat-value">
                            {supportedCrops.length}
                        </h2>
                    </div>

                </div>


                <div className="am-stat">

                    <div className="am-stat-icon">
                        🧠
                    </div>

                    <div>
                        <p className="am-stat-label">
                            AI Model
                        </p>

                        <h2
                            className="am-stat-value"
                            style={{ fontSize: "18px" }}
                        >
                            EfficientNet-B0
                        </h2>
                    </div>

                </div>


                <div className="am-stat">

                    <div className="am-stat-icon">
                        🎯
                    </div>

                    <div>
                        <p className="am-stat-label">
                            Model Status
                        </p>

                        <h2 className="am-stat-value am-green">
                            {loading
                                ? "Loading..."
                                : "Ready"
                            }
                        </h2>
                    </div>

                </div>


                <div className="am-stat">

                    <div className="am-stat-icon">
                        📷
                    </div>

                    <div>
                        <p className="am-stat-label">
                            Total Detections
                        </p>

                        <h2 className="am-stat-value">
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

            <section className="am-hero">

                <div className="am-hero-content">

                    <div className="am-hero-label">
                        AI POWERED CROP HEALTH
                    </div>

                    <h2>
                        Detect Plant Diseases
                        <br />
                        with Artificial Intelligence
                    </h2>

                    <p>
                        Upload a crop leaf image and let
                        AgriMind AI analyze it using deep
                        learning with EfficientNet-B0.
                    </p>

                    <button
                        className="am-primary-button"
                        onClick={() =>
                            navigate("/detection")
                        }
                    >
                        🔬 Start Disease Detection →
                    </button>

                </div>


                <div className="am-hero-art">
                    🌾
                </div>

            </section>


            {/* =================================================
               AI OVERVIEW
            ================================================= */}

            <section className="am-section">

                <div className="am-section-head">

                    <h2>
                        AI Detection Overview
                    </h2>

                    <p>
                        Real-time insights from your detection history
                    </p>

                </div>


                <div className="am-overview">

                    <div className="am-stat">

                        <div className="am-stat-icon">
                            📊
                        </div>

                        <div>
                            <p className="am-stat-label">
                                Average Confidence
                            </p>

                            <h2 className="am-stat-value">
                                {averageConfidence}%
                            </h2>
                        </div>

                    </div>


                    <div className="am-stat">

                        <div className="am-stat-icon">
                            🌿
                        </div>

                        <div>
                            <p className="am-stat-label">
                                Healthy Predictions
                            </p>

                            <h2 className="am-stat-value am-green">
                                {healthyCount}
                            </h2>
                        </div>

                    </div>


                    <div className="am-stat">

                        <div className="am-stat-icon">
                            🦠
                        </div>

                        <div>
                            <p className="am-stat-label">
                                Disease Predictions
                            </p>

                            <h2 className="am-stat-value am-red">
                                {diseaseCount}
                            </h2>
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
               LATEST DETECTION
            ================================================= */}

            <section className="am-section">

                <div className="am-latest">

                    <div className="am-latest-header">

                        <div>

                            <h2 className="am-latest-title">
                                🧠 Latest AI Detection
                            </h2>

                            <p className="am-latest-date">
                                {latestDetection
                                    ? formatDate(
                                        latestDetection.created_at
                                    )
                                    : "No detections yet"
                                }
                            </p>

                        </div>


                        <button
                            className="am-history-button"
                            onClick={() =>
                                navigate("/history")
                            }
                        >
                            View History →
                        </button>

                    </div>


                    {latestDetection ? (

                        <div
                            className={`am-latest-result ${
                                latestIsHealthy
                                    ? ""
                                    : "disease"
                            }`}
                        >

                            <div className="am-latest-grid">

                                <div>

                                    <div className="am-detail-label">
                                        Crop
                                    </div>

                                    <div className="am-detail-value">
                                        🌱 {latestDetection.crop}
                                    </div>

                                </div>


                                <div>

                                    <div className="am-detail-label">
                                        Prediction
                                    </div>

                                    <div
                                        className={`am-detail-value ${
                                            latestIsHealthy
                                                ? "am-green"
                                                : "am-red"
                                        }`}
                                    >
                                        🦠 {latestDetection.prediction}
                                    </div>

                                </div>


                                <div>

                                    <div className="am-detail-label">
                                        Confidence
                                    </div>

                                    <div className="am-detail-value">
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

                        <div className="am-empty">
                            No AI detections available yet.
                        </div>

                    )}

                </div>

            </section>


            {/* =================================================
               CROPS
            ================================================= */}

            <section className="am-section">

                <div className="am-section-head">

                    <h2>
                        🌾 Supported Crops
                    </h2>

                    <p>
                        {availableCropCount} crops currently
                        available for AI disease detection
                    </p>

                </div>


                <div className="am-crop-grid">

                    {supportedCrops.map((crop) => (

                        <div
                            key={crop.name}
                            className="am-crop-card"
                            onClick={() => {
                                navigate(
                                    crop.available
                                        ? "/detection"
                                        : "/crops"
                                );
                            }}
                        >

                            <div className="am-crop-top">

                                <div className="am-crop-icon">
                                    {crop.icon}
                                </div>

                                <span
                                    className={`am-crop-status ${
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


                            <div className="am-crop-action">
                                {crop.available
                                    ? "Analyze Now →"
                                    : "View Details →"
                                }
                            </div>

                        </div>

                    ))}

                </div>

            </section>


            {/* =================================================
               HOW IT WORKS
            ================================================= */}

            <section className="am-section">

                <div className="am-section-head">

                    <h2>
                        🤖 How AgriMind AI Works
                    </h2>

                    <p>
                        Simple three-step AI-powered crop health analysis
                    </p>

                </div>


                <div className="am-process">

                    <div className="am-process-card">

                        <div className="am-number">
                            1
                        </div>

                        <h3>
                            📷 Upload Leaf Image
                        </h3>

                        <p>
                            Upload a clear crop leaf
                            photograph through the
                            Disease Detection module.
                        </p>

                    </div>


                    <div className="am-process-card">

                        <div className="am-number">
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


                    <div className="am-process-card">

                        <div className="am-number">
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

            </section>


            {/* =================================================
               QUICK ACTIONS
            ================================================= */}

            <section className="am-section">

                <div className="am-section-head">

                    <h2>
                        Quick Actions
                    </h2>

                    <p>
                        Access important AgriMind AI features
                    </p>

                </div>


                <div className="am-quick">

                    <div
                        className="am-quick-card"
                        onClick={() =>
                            navigate("/detection")
                        }
                    >

                        <div className="am-quick-icon">
                            🔬
                        </div>

                        <h3>
                            Disease Detection
                        </h3>

                        <p>
                            Upload a leaf image and
                            detect possible diseases.
                        </p>

                        <span className="am-quick-arrow">
                            Start Detection →
                        </span>

                    </div>


                    <div
                        className="am-quick-card"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >

                        <div className="am-quick-icon">
                            📊
                        </div>

                        <h3>
                            Analytics
                        </h3>

                        <p>
                            View detection statistics,
                            confidence and disease distribution.
                        </p>

                        <span className="am-quick-arrow">
                            View Analytics →
                        </span>

                    </div>


                    <div
                        className="am-quick-card"
                        onClick={() =>
                            navigate("/history")
                        }
                    >

                        <div className="am-quick-icon">
                            🕘
                        </div>

                        <h3>
                            Detection History
                        </h3>

                        <p>
                            View all previous AI
                            detection results.
                        </p>

                        <span className="am-quick-arrow">
                            View History →
                        </span>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;
