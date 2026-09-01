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

    const [latestDetection, setLatestDetection] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showSearchResults, setShowSearchResults] =
        useState(false);


    // =========================================================
    // PROFESSIONAL SVG ICONS
    // =========================================================

    const Icon = ({
        name,
        size = 22,
        stroke = "currentColor"
    }) => {

        const common = {
            width: size,
            height: size,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke,
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        };

        if (name === "leaf") {
            return (
                <svg {...common}>
                    <path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-8 10-15Z" />
                    <path d="M5 19c3-4 6-7 11-10" />
                </svg>
            );
        }

        if (name === "search") {
            return (
                <svg {...common}>
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4 4" />
                </svg>
            );
        }

        if (name === "refresh") {
            return (
                <svg {...common}>
                    <path d="M20 11a8 8 0 0 0-14.8-4" />
                    <path d="M4 4v4h4" />
                    <path d="M4 13a8 8 0 0 0 14.8 4" />
                    <path d="M20 20v-4h-4" />
                </svg>
            );
        }

        if (name === "microscope") {
            return (
                <svg {...common}>
                    <path d="M6 20h12" />
                    <path d="M10 20a6 6 0 0 1 6-6" />
                    <path d="M8 14a5 5 0 0 0 5 5" />
                    <path d="M9 4h3l3 6-3 2-4-6Z" />
                    <path d="M12 12h5" />
                    <path d="M17 12a4 4 0 0 1 4 4v1" />
                </svg>
            );
        }

        if (name === "chart") {
            return (
                <svg {...common}>
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="m7 15 3-4 3 2 5-7" />
                </svg>
            );
        }

        if (name === "clock") {
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7v5l3 2" />
                </svg>
            );
        }

        if (name === "camera") {
            return (
                <svg {...common}>
                    <path d="M4 8h4l1.5-2h5L16 8h4v10H4Z" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
            );
        }

        if (name === "shield") {
            return (
                <svg {...common}>
                    <path d="M12 3 19 6v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            );
        }

        if (name === "upload") {
            return (
                <svg {...common}>
                    <path d="M12 16V5" />
                    <path d="m8 9 4-4 4 4" />
                    <path d="M5 16v3h14v-3" />
                </svg>
            );
        }

        if (name === "brain") {
            return (
                <svg {...common}>
                    <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3 3 3 0 0 0 2 3v2a3 3 0 0 0 3 3" />
                    <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3 3 3 0 0 1-2 3v2a3 3 0 0 1-3 3" />
                    <path d="M9 8h2v4H9" />
                    <path d="M15 8h-2v4h2" />
                    <path d="M9 16h2" />
                    <path d="M13 16h2" />
                    <path d="M12 4v16" />
                </svg>
            );
        }

        if (name === "check") {
            return (
                <svg {...common}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );
        }

        if (name === "arrow") {
            return (
                <svg {...common}>
                    <path d="M5 12h13" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );
        }

        return null;
    };


    // =========================================================
    // REAL CROP IMAGES
    // ORDER:
    // 1. Soybean
    // 2. Cotton
    // 3. Maize
    // 4. Wheat
    // 5. Tomato
    // 6. Bell Pepper
    // =========================================================

    const supportedCrops = [
        {
            name: "Soybean",

            // Actual soybean leaves image
            image:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Closeup_of_Soybean_Leaves_%2810060057825%29.jpg/1280px-Closeup_of_Soybean_Leaves_%2810060057825%29.jpg",

            status: "AI Detection Available",
            available: true
        },

        {
            name: "Cotton",

            // Actual cotton field / cotton bolls image
            image:
                "https://images.unsplash.com/photo-1762112464284-db2e871a9f4f?auto=format&fit=crop&fm=jpg&q=85&w=1200",

            status: "AI Detection Available",
            available: true
        },

       {
            name: "Maize",

            // Real maize / corn image
            image:
                "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=85",

            status: "AI Detection Available",
            available: true
        },
        {
            name: "Wheat",
            image:
                "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=85",
            status: "AI Detection Available",
            available: true
        },

        {
            name: "Tomato",

            // Real tomato crop image
            image:
                "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=85",

            status: "Coming Soon",
            available: false
        },

        {
            name: "Bell Pepper",

            // Real bell pepper image
            image:
                "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=900&q=85",

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

                const localValue =
                    localStorage.getItem(key);

                if (localValue) {

                    try {

                        const parsed =
                            JSON.parse(localValue);

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


                const sessionValue =
                    sessionStorage.getItem(key);

                if (sessionValue) {

                    try {

                        const parsed =
                            JSON.parse(sessionValue);

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
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            const data =
                await response.json();


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


            const records =
                Array.isArray(data.history)
                    ? data.history
                    : [];


            setHistory(records);


            setTotalDetections(
                data.count ??
                records.length
            );


            setLatestDetection(
                records.length > 0
                    ? records[0]
                    : null
            );

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
    // HEALTH CHECK
    // =========================================================

    const isHealthyPrediction = (prediction) => {

        if (!prediction) {
            return false;
        }

        const value =
            prediction
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

        return history.filter(
            (item) =>
                isHealthyPrediction(
                    item.prediction
                )
        ).length;

    }, [history]);


    const diseaseCount = useMemo(() => {

        return history.filter(
            (item) =>
                !isHealthyPrediction(
                    item.prediction
                )
        ).length;

    }, [history]);


    const averageConfidence = useMemo(() => {

        if (!history.length) {
            return "0.00";
        }

        const total =
            history.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.confidence || 0
                    ),
                0
            );

        return (
            total /
            history.length
        ).toFixed(2);

    }, [history]);


    const availableCropCount =
        useMemo(() => {

            return supportedCrops.filter(
                (crop) =>
                    crop.available
            ).length;

        }, []);


    // =========================================================
    // SEARCH
    // =========================================================

    const searchResults = useMemo(() => {

        const query =
            search
                .trim()
                .toLowerCase();

        if (!query) {
            return [];
        }

        const results = [];


        supportedCrops.forEach(
            (crop) => {

                if (
                    crop.name
                        .toLowerCase()
                        .includes(query)
                ) {

                    results.push({
                        type: "crop",
                        title: crop.name,
                        description:
                            crop.status,
                        action:
                            crop.available
                                ? "/detection"
                                : "/crops"
                    });
                }
            }
        );


        history.forEach(
            (item) => {

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
                        type: "history",
                        title: prediction,
                        description:
                            `${crop} • ${Number(
                                item.confidence || 0
                            ).toFixed(2)}% confidence`,
                        action: "/history"
                    });
                }
            }
        );


        const features = [
            {
                keyword: "disease",
                title: "Disease Detection",
                description:
                    "Upload a leaf image and detect crop diseases.",
                action: "/detection"
            },
            {
                keyword: "analytics",
                title: "Analytics",
                description:
                    "View detection statistics and AI performance.",
                action: "/analytics"
            },
            {
                keyword: "history",
                title: "Detection History",
                description:
                    "View previous AI detection results.",
                action: "/history"
            },
            {
                keyword: "settings",
                title: "Settings",
                description:
                    "View AI model and detection settings.",
                action: "/settings"
            }
        ];


        features.forEach(
            (feature) => {

                if (
                    feature.keyword.includes(query) ||
                    feature.title
                        .toLowerCase()
                        .includes(query)
                ) {

                    results.push({
                        type: "feature",
                        title: feature.title,
                        description:
                            feature.description,
                        action:
                            feature.action
                    });
                }
            }
        );


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

                /* =====================================================
                   BASE
                ===================================================== */

                .agrimind-dashboard {
                    min-height: 100%;
                    width: 100%;
                    max-width: 1500px;
                    margin: 0 auto;
                    padding: 30px 34px 80px;
                    box-sizing: border-box;
                    color: #10261a;

                    background:
                        radial-gradient(
                            circle at 88% 0%,
                            rgba(34,197,94,.055),
                            transparent 30%
                        );
                }

                .agrimind-dashboard * {
                    box-sizing: border-box;
                }


                /* =====================================================
                   HEADER
                ===================================================== */

                .am-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 25px;
                    margin-bottom: 26px;
                }

                .am-heading {
                    min-width: 0;
                }

                .am-dashboard-label {
                    display: inline-block;
                    margin-bottom: 9px;
                    color: #159447;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    line-height: 1;
                }

                .am-heading h1 {
                    margin: 0;
                    color: #10261a;
                    font-size: 37px;
                    line-height: 1.05;
                    font-weight: 900;
                    letter-spacing: -1.3px;
                }

                .am-heading p {
                    margin: 9px 0 0;
                    color: #718096;
                    font-size: 15px;
                }


                /* =====================================================
                   HEADER ACTIONS
                ===================================================== */

                .am-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .am-search {
                    position: relative;
                    width: 310px;
                }

                .am-search-box {
                    height: 47px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 15px;

                    background: #ffffff;

                    border: 1px solid #dce8e1;
                    border-radius: 13px;

                    box-shadow:
                        0 5px 18px
                        rgba(15,60,30,.045);
                }

                .am-search-icon {
                    display: flex;
                    color: #668171;
                }

                .am-search-box input {
                    width: 100%;
                    border: none;
                    outline: none;
                    background: transparent;

                    color: #172a1e;
                    font-family: inherit;
                    font-size: 14px;
                }

                .am-search-box input::placeholder {
                    color: #8a9990;
                }


                /* =====================================================
                   SEARCH RESULTS
                ===================================================== */

                .am-search-results {
                    position: absolute;
                    top: 55px;
                    left: 0;
                    width: 100%;
                    z-index: 100;

                    overflow: hidden;

                    background: #ffffff;

                    border: 1px solid #e2ebe5;
                    border-radius: 14px;

                    box-shadow:
                        0 18px 40px
                        rgba(0,0,0,.13);
                }

                .am-search-result {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    padding: 13px 15px;

                    cursor: pointer;

                    border-bottom:
                        1px solid #f0f4f2;
                }

                .am-search-result:last-child {
                    border-bottom: none;
                }

                .am-search-result:hover {
                    background: #f3fbf5;
                }

                .am-search-result-mark {
                    width: 34px;
                    height: 34px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 10px;

                    background: #ecfdf3;
                    color: #15803d;
                }

                .am-search-result-title {
                    color: #172a1e;
                    font-size: 14px;
                    font-weight: 800;
                }

                .am-search-result-description {
                    margin-top: 3px;
                    color: #718096;
                    font-size: 12px;
                }


                /* =====================================================
                   REFRESH
                ===================================================== */

                .am-refresh {
                    height: 47px;

                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;

                    padding: 0 17px;

                    border:
                        1px solid #22a653;

                    border-radius: 13px;

                    background: #ffffff;
                    color: #15803d;

                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 800;

                    cursor: pointer;

                    transition:
                        .2s ease;
                }

                .am-refresh:hover {
                    background: #f0fdf4;
                    transform: translateY(-1px);
                }

                .am-refresh:disabled {
                    opacity: .65;
                    cursor: wait;
                }


                /* =====================================================
                   PROFILE
                ===================================================== */

                .am-profile {
                    width: 47px;
                    height: 47px;

                    border: none;
                    border-radius: 50%;

                    background:
                        linear-gradient(
                            145deg,
                            #22c55e,
                            #07863f
                        );

                    color: #ffffff;

                    font-family: inherit;
                    font-size: 16px;
                    font-weight: 900;

                    box-shadow:
                        0 7px 17px
                        rgba(22,163,74,.23);
                }


                /* =====================================================
                   ERROR
                ===================================================== */

                .am-error {
                    margin-bottom: 22px;
                    padding: 14px 17px;

                    border: 1px solid #fecaca;
                    border-radius: 13px;

                    background: #fff7f7;
                    color: #991b1b;

                    font-size: 14px;
                }


                /* =====================================================
                   STAT GRID
                ===================================================== */

                .am-stat-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(4, minmax(0,1fr));
                    gap: 17px;
                }

                .am-stat {
                    display: flex;
                    align-items: center;
                    gap: 15px;

                    min-height: 112px;

                    padding: 20px;

                    background:
                        rgba(255,255,255,.97);

                    border: 1px solid #e3ebe6;
                    border-radius: 18px;

                    box-shadow:
                        0 5px 22px
                        rgba(15,60,30,.055);

                    transition: .2s ease;
                }

                .am-stat:hover {
                    transform: translateY(-3px);

                    box-shadow:
                        0 12px 28px
                        rgba(15,60,30,.09);
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
                    color: #15803d;
                }

                .am-stat-icon svg {
                    width: 24px;
                    height: 24px;
                }

                .am-stat-text-icon {
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .8px;
                }

                .am-stat-label {
                    margin: 0 0 5px;

                    color: #718096;

                    font-size: 12px;
                    font-weight: 750;
                }

                .am-stat-value {
                    margin: 0;

                    color: #10261a;

                    font-size: 23px;
                    line-height: 1;
                    font-weight: 900;
                }

                .am-green {
                    color: #159447 !important;
                }

                .am-red {
                    color: #dc2626 !important;
                }


                /* =====================================================
                   HERO
                ===================================================== */

                .am-hero {
                    position: relative;

                    min-height: 330px;

                    margin-top: 22px;
                    padding: 45px 50px;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 30px;

                    overflow: hidden;

                    border-radius: 26px;

                    background:
                        linear-gradient(
                            135deg,
                            #075f2c 0%,
                            #087a3a 38%,
                            #159447 70%,
                            #22a653 100%
                        );

                    color: #ffffff;

                    box-shadow:
                        0 18px 40px
                        rgba(21,128,61,.20);
                }

                .am-hero::before {
                    content: "";

                    position: absolute;

                    width: 470px;
                    height: 470px;

                    right: -170px;
                    top: -250px;

                    border-radius: 50%;

                    background:
                        rgba(255,255,255,.08);

                    pointer-events: none;
                }

                .am-hero::after {
                    content: "";

                    position: absolute;

                    width: 280px;
                    height: 280px;

                    right: 80px;
                    bottom: -225px;

                    border-radius: 50%;

                    border:
                        1px solid
                        rgba(255,255,255,.14);

                    pointer-events: none;
                }

                .am-hero-content {
                    position: relative;
                    z-index: 2;

                    max-width: 750px;
                }

                .am-hero-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;

                    color: #dcfce7;

                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 2px;
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

                    letter-spacing: -1.3px;
                }

                .am-hero p {
                    max-width: 650px;

                    margin: 0;

                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .90
                        );

                    font-size: 15px;
                    line-height: 1.7;
                }

                .am-primary-button {
                    margin-top: 26px;

                    height: 50px;

                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;

                    padding: 0 21px;

                    border: none;
                    border-radius: 13px;

                    background: #ffffff;
                    color: #087a3a;

                    font-family: inherit;

                    font-size: 13px;
                    font-weight: 900;

                    cursor: pointer;

                    box-shadow:
                        0 9px 22px
                        rgba(0,0,0,.15);

                    transition: .2s ease;
                }

                .am-primary-button:hover {
                    transform: translateY(-3px);

                    box-shadow:
                        0 13px 28px
                        rgba(0,0,0,.20);
                }


                /* =====================================================
                   REAL HERO IMAGE
                ===================================================== */

                .am-hero-art {
                    position: relative;
                    z-index: 2;

                    width: 190px;
                    height: 190px;

                    min-width: 190px;

                    margin-right: 25px;

                    overflow: hidden;

                    border-radius: 50%;

                    border:
                        2px solid
                        rgba(255,255,255,.25);

                    background:
                        rgba(255,255,255,.08);

                    box-shadow:
                        0 18px 35px
                        rgba(0,0,0,.15);
                }

                .am-hero-art img {
                    width: 100%;
                    height: 100%;

                    display: block;

                    object-fit: cover;
                }

                .am-hero-image-overlay {
                    position: absolute;
                    inset: 0;

                    background:
                        linear-gradient(
                            135deg,
                            rgba(4,80,35,.15),
                            rgba(0,0,0,.05)
                        );
                }


                /* =====================================================
                   SECTIONS
                ===================================================== */

                .am-section {
                    margin-top: 34px;
                }

                .am-section-head {
                    margin-bottom: 15px;
                }

                .am-section-head h2 {
                    display: flex;
                    align-items: center;
                    gap: 9px;

                    margin: 0;

                    color: #10261a;

                    font-size: 24px;
                    font-weight: 900;

                    letter-spacing: -.4px;
                }

                .am-section-head p {
                    margin: 6px 0 0;

                    color: #718096;

                    font-size: 14px;
                }


                /* =====================================================
                   SECTION ICON
                ===================================================== */

                .am-heading-icon {
                    display: inline-flex;

                    color: #159447;
                }

                .am-heading-icon svg {
                    width: 23px;
                    height: 23px;
                }


                /* =====================================================
                   OVERVIEW
                ===================================================== */

                .am-overview {
                    display: grid;

                    grid-template-columns:
                        repeat(3,minmax(0,1fr));

                    gap: 17px;
                }


                /* =====================================================
                   LATEST
                ===================================================== */

                .am-latest {
                    padding: 24px;

                    background: #ffffff;

                    border: 1px solid #e3ebe6;
                    border-radius: 19px;

                    box-shadow:
                        0 5px 22px
                        rgba(15,60,30,.05);
                }

                .am-latest-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 20px;
                }

                .am-latest-title {
                    margin: 0;

                    color: #10261a;

                    font-size: 20px;
                    font-weight: 900;
                }

                .am-latest-date {
                    margin: 5px 0 0;

                    color: #718096;

                    font-size: 13px;
                }

                .am-history-button {
                    height: 40px;

                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;

                    padding: 0 14px;

                    border: none;
                    border-radius: 10px;

                    background: #ecfdf3;
                    color: #15803d;

                    font-family: inherit;

                    font-size: 13px;
                    font-weight: 850;

                    cursor: pointer;
                }

                .am-latest-result {
                    margin-top: 18px;

                    padding: 21px;

                    border:
                        1px solid #bbf7d0;

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
                        repeat(3,1fr);

                    gap: 20px;
                }

                .am-detail-label {
                    color: #718096;

                    font-size: 11px;
                    font-weight: 850;

                    letter-spacing: .7px;
                    text-transform: uppercase;
                }

                .am-detail-value {
                    display: flex;
                    align-items: center;
                    gap: 7px;

                    margin-top: 6px;

                    color: #172a1e;

                    font-size: 16px;
                    font-weight: 900;
                }


                /* =====================================================
                   CROP GRID
                ===================================================== */

                .am-crop-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(3,minmax(0,1fr));

                    gap: 17px;
                }

                .am-crop-card {
                    overflow: hidden;

                    background: #ffffff;

                    border:
                        1px solid #e3ebe6;

                    border-radius: 18px;

                    cursor: pointer;

                    transition: .22s ease;
                }

                .am-crop-card:hover {
                    transform: translateY(-4px);

                    border-color: #86efac;

                    box-shadow:
                        0 14px 30px
                        rgba(21,128,61,.10);
                }


                /* =====================================================
                   CROP IMAGE
                ===================================================== */

                .am-crop-image {
                    position: relative;

                    height: 145px;

                    overflow: hidden;

                    background: #edf5ef;
                }

                .am-crop-image img {
                    width: 100%;
                    height: 100%;

                    display: block;

                    object-fit: cover;

                    transition:
                        transform .35s ease;
                }

                .am-crop-card:hover
                .am-crop-image img {
                    transform: scale(1.05);
                }

                .am-crop-image::after {
                    content: "";

                    position: absolute;
                    inset: 0;

                    background:
                        linear-gradient(
                            to top,
                            rgba(0,0,0,.24),
                            transparent 55%
                        );

                    pointer-events: none;
                }


                /* =====================================================
                   CROP CONTENT
                ===================================================== */

                .am-crop-content {
                    padding: 20px;
                }

                .am-crop-top {
                    display: flex;

                    align-items: center;
                    justify-content: space-between;

                    gap: 10px;
                }

                .am-crop-status {
                    padding: 6px 9px;

                    border-radius: 20px;

                    background: #ecfdf3;
                    color: #15803d;

                    font-size: 10px;
                    font-weight: 900;

                    white-space: nowrap;
                }

                .am-crop-status.soon {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .am-crop-card h3 {
                    margin: 0 0 7px;

                    color: #10261a;

                    font-size: 18px;
                    font-weight: 900;
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

                    display: inline-flex;
                    align-items: center;
                    gap: 5px;

                    color: #16a34a;

                    font-size: 14px;
                    font-weight: 900;
                }


                /* =====================================================
                   PROCESS
                ===================================================== */

                .am-process {
                    display: grid;

                    grid-template-columns:
                        repeat(3,minmax(0,1fr));

                    gap: 17px;
                }

                .am-process-card {
                    position: relative;

                    padding: 24px;

                    background: #ffffff;

                    border:
                        1px solid #e3ebe6;

                    border-radius: 18px;

                    transition: .2s ease;
                }

                .am-process-card:hover {
                    transform: translateY(-3px);

                    box-shadow:
                        0 12px 28px
                        rgba(15,60,30,.08);
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

                .am-process-icon {
                    width: 45px;
                    height: 45px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    margin-bottom: 14px;

                    border-radius: 12px;

                    background: #f0fdf4;
                    color: #15803d;
                }

                .am-process-icon svg {
                    width: 22px;
                    height: 22px;
                }

                .am-process-card h3 {
                    margin: 0 0 8px;

                    color: #10261a;

                    font-size: 17px;
                    font-weight: 900;
                }

                .am-process-card p {
                    margin: 0;

                    color: #718096;

                    font-size: 13px;
                    line-height: 1.6;
                }


                /* =====================================================
                   QUICK ACTIONS
                ===================================================== */

                .am-quick {
                    display: grid;

                    grid-template-columns:
                        repeat(3,minmax(0,1fr));

                    gap: 17px;
                }

                .am-quick-card {
                    padding: 23px;

                    background: #ffffff;

                    border:
                        1px solid #e3ebe6;

                    border-radius: 18px;

                    cursor: pointer;

                    transition: .2s ease;
                }

                .am-quick-card:hover {
                    transform: translateY(-3px);

                    border-color: #86efac;

                    box-shadow:
                        0 12px 28px
                        rgba(21,128,61,.09);
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
                    color: #15803d;
                }

                .am-quick-icon svg {
                    width: 24px;
                    height: 24px;
                }

                .am-quick-card h3 {
                    margin: 0 0 7px;

                    color: #10261a;

                    font-size: 17px;
                    font-weight: 900;
                }

                .am-quick-card p {
                    margin: 0;

                    color: #718096;

                    font-size: 13px;
                    line-height: 1.55;
                }

                .am-quick-arrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;

                    margin-top: 15px;

                    color: #16a34a;

                    font-size: 14px;
                    font-weight: 900;
                }


                /* =====================================================
                   EMPTY
                ===================================================== */

                .am-empty {
                    padding: 30px;

                    text-align: center;

                    color: #718096;

                    background: #f8faf9;

                    border-radius: 14px;

                    font-size: 14px;
                }


                /* =====================================================
                   RESPONSIVE
                ===================================================== */

                @media (max-width: 1150px) {

                    .am-stat-grid {
                        grid-template-columns:
                            repeat(2,1fr);
                    }

                    .am-crop-grid {
                        grid-template-columns:
                            repeat(2,1fr);
                    }

                    .am-quick {
                        grid-template-columns:
                            repeat(2,1fr);
                    }
                }


                @media (max-width: 900px) {

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

                    .am-overview,
                    .am-process {
                        grid-template-columns: 1fr;
                    }

                    .am-hero {
                        padding: 36px;
                    }

                    .am-hero h2 {
                        font-size: 34px;
                    }

                    .am-hero-art {
                        width: 145px;
                        height: 145px;
                        min-width: 145px;
                    }
                }


                @media (max-width: 650px) {

                    .agrimind-dashboard {
                        padding:
                            22px
                            17px
                            55px;
                    }

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
                        font-size: 30px;
                    }

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

                        width: 120px;
                        height: 120px;
                        min-width: 120px;

                        margin: 0;
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

            `}</style>


            {/* =================================================
               HEADER
            ================================================= */}

            <header className="am-header">

                <div className="am-heading">

                    <span className="am-dashboard-label">
                        AGRIMIND AI • SMART AGRICULTURE
                    </span>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Welcome back, {userName}
                    </p>

                </div>


                <div className="am-header-actions">

                    {/* SEARCH */}

                    <div className="am-search">

                        <div className="am-search-box">

                            <span className="am-search-icon">
                                <Icon
                                    name="search"
                                    size={19}
                                />
                            </span>

                            <input
                                value={search}
                                type="text"
                                placeholder="Search crops, diseases..."
                                onChange={(e) => {

                                    setSearch(
                                        e.target.value
                                    );

                                    setShowSearchResults(
                                        true
                                    );
                                }}
                                onFocus={() => {

                                    if (
                                        search.trim()
                                    ) {

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

                                <div className="am-search-results">

                                    {searchResults.map(
                                        (
                                            result,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    `${result.title}-${index}`
                                                }
                                                className="am-search-result"
                                                onClick={() => {

                                                    setShowSearchResults(
                                                        false
                                                    );

                                                    setSearch(
                                                        ""
                                                    );

                                                    navigate(
                                                        result.action
                                                    );
                                                }}
                                            >

                                                <div className="am-search-result-mark">

                                                    <Icon
                                                        name={
                                                            result.type ===
                                                            "crop"
                                                                ? "leaf"
                                                                : result.type ===
                                                                  "history"
                                                                ? "clock"
                                                                : "chart"
                                                        }
                                                        size={17}
                                                    />

                                                </div>

                                                <div>

                                                    <div className="am-search-result-title">
                                                        {
                                                            result.title
                                                        }
                                                    </div>

                                                    <div className="am-search-result-description">
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
                        className="am-refresh"
                        disabled={refreshing}
                        onClick={() =>
                            fetchDashboardData(
                                true
                            )
                        }
                    >

                        <Icon
                            name="refresh"
                            size={16}
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"
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
                    {error}
                </div>

            )}


            {/* =================================================
               TOP STATS
            ================================================= */}

            <div className="am-stat-grid">

                {/* SUPPORTED CROPS */}

                <div className="am-stat">

                    <div className="am-stat-icon">

                        <Icon
                            name="leaf"
                            size={25}
                        />

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


                {/* MODEL */}

                <div className="am-stat">

                    <div className="am-stat-icon am-stat-text-icon">
                        MODEL
                    </div>

                    <div>

                        <p className="am-stat-label">
                            AI Model
                        </p>

                        <h2
                            className="am-stat-value"
                            style={{
                                fontSize: "18px"
                            }}
                        >
                            EfficientNet-B0
                        </h2>

                    </div>

                </div>


                {/* STATUS */}

                <div className="am-stat">

                    <div className="am-stat-icon">

                        <Icon
                            name="shield"
                            size={24}
                        />

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


                {/* TOTAL DETECTIONS */}

                <div className="am-stat">

                    <div className="am-stat-icon">

                        <Icon
                            name="camera"
                            size={24}
                        />

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
                            navigate(
                                "/detection"
                            )
                        }
                    >

                        <Icon
                            name="microscope"
                            size={17}
                        />

                        Start Disease Detection

                        <Icon
                            name="arrow"
                            size={16}
                        />

                    </button>

                </div>


                {/* REAL AGRICULTURE IMAGE */}

                <div className="am-hero-art">

                    <img
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=85"
                        alt="Agricultural field"
                    />

                    <div className="am-hero-image-overlay" />

                </div>

            </section>


            {/* =================================================
               AI OVERVIEW
            ================================================= */}

            <section className="am-section">

                <div className="am-section-head">

                    <h2>

                        <span className="am-heading-icon">

                            <Icon
                                name="chart"
                                size={23}
                            />

                        </span>

                        AI Detection Overview

                    </h2>

                    <p>
                        Real-time insights from your detection history
                    </p>

                </div>


                <div className="am-overview">

                    {/* AVERAGE CONFIDENCE */}

                    <div className="am-stat">

                        <div className="am-stat-icon">

                            <Icon
                                name="chart"
                                size={24}
                            />

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


                    {/* HEALTHY */}

                    <div className="am-stat">

                        <div className="am-stat-icon">

                            <Icon
                                name="check"
                                size={24}
                            />

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


                    {/* DISEASE */}

                    <div className="am-stat">

                        <div className="am-stat-icon">

                            <Icon
                                name="shield"
                                size={24}
                            />

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
                                Latest AI Detection
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
                                navigate(
                                    "/history"
                                )
                            }
                        >
                            View History

                            <Icon
                                name="arrow"
                                size={15}
                            />

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

                                        <Icon
                                            name="leaf"
                                            size={17}
                                        />

                                        {
                                            latestDetection.crop
                                        }

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

                                        {
                                            latestDetection.prediction
                                        }

                                    </div>

                                </div>


                                <div>

                                    <div className="am-detail-label">
                                        Confidence
                                    </div>

                                    <div className="am-detail-value">

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
               SUPPORTED CROPS
            ================================================= */}

            <section className="am-section">

                <div className="am-section-head">

                    <h2>

                        <span className="am-heading-icon">

                            <Icon
                                name="leaf"
                                size={23}
                            />

                        </span>

                        Supported Crops

                    </h2>

                    <p>

                        {availableCropCount}
                        {" "}
                        crops currently available
                        for AI disease detection

                    </p>

                </div>


                <div className="am-crop-grid">

                    {supportedCrops.map(
                        (crop) => (

                            <div
                                key={crop.name}
                                className="am-crop-card"

                                onClick={() =>
                                    navigate(
                                        crop.available
                                            ? "/detection"
                                            : "/crops"
                                    )
                                }
                            >

                                {/* REAL CROP IMAGE */}

                                <div className="am-crop-image">

                                    <img
                                        src={
                                            crop.image
                                        }
                                        alt={`${crop.name} crop`}
                                        loading="lazy"
                                    />

                                </div>


                                {/* CROP CONTENT */}

                                <div className="am-crop-content">

                                    <div className="am-crop-top">

                                        <h3>
                                            {
                                                crop.name
                                            }
                                        </h3>

                                        <span
                                            className={`am-crop-status ${
                                                crop.available
                                                    ? ""
                                                    : "soon"
                                            }`}
                                        >

                                            {
                                                crop.status
                                            }

                                        </span>

                                    </div>


                                    <p>

                                        {crop.available
                                            ? `AI-powered disease detection for ${crop.name.toLowerCase()} leaves.`
                                            : `Disease detection for ${crop.name.toLowerCase()} is under development.`
                                        }

                                    </p>


                                    <div className="am-crop-action">

                                        {crop.available
                                            ? "Analyze Now"
                                            : "View Details"
                                        }

                                        <Icon
                                            name="arrow"
                                            size={15}
                                        />

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* =================================================
               HOW AGRIMIND AI WORKS
            ================================================= */}

            <section className="am-section">

                <div className="am-section-head">

                    <h2>
                        How AgriMind AI Works
                    </h2>

                    <p>
                        Simple three-step AI-powered crop health analysis
                    </p>

                </div>


                <div className="am-process">

                    {/* STEP 1 */}

                    <div className="am-process-card">

                        <div className="am-number">
                            1
                        </div>

                        <div className="am-process-icon">

                            <Icon
                                name="upload"
                                size={23}
                            />

                        </div>

                        <h3>
                            Upload Leaf Image
                        </h3>

                        <p>
                            Upload a clear crop leaf
                            photograph through the
                            Disease Detection module.
                        </p>

                    </div>


                    {/* STEP 2 */}

                    <div className="am-process-card">

                        <div className="am-number">
                            2
                        </div>

                        <div className="am-process-icon">

                            <Icon
                                name="brain"
                                size={23}
                            />

                        </div>

                        <h3>
                            AI Analysis
                        </h3>

                        <p>
                            EfficientNet-B0 analyzes
                            visual patterns in the
                            uploaded leaf image.
                        </p>

                    </div>


                    {/* STEP 3 */}

                    <div className="am-process-card">

                        <div className="am-number">
                            3
                        </div>

                        <div className="am-process-icon">

                            <Icon
                                name="check"
                                size={23}
                            />

                        </div>

                        <h3>
                            Get Result
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

                    {/* DISEASE DETECTION */}

                    <div
                        className="am-quick-card"
                        onClick={() =>
                            navigate(
                                "/detection"
                            )
                        }
                    >

                        <div className="am-quick-icon">

                            <Icon
                                name="microscope"
                                size={24}
                            />

                        </div>

                        <h3>
                            Disease Detection
                        </h3>

                        <p>
                            Upload a leaf image and
                            detect possible diseases.
                        </p>

                        <span className="am-quick-arrow">

                            Start Detection

                            <Icon
                                name="arrow"
                                size={15}
                            />

                        </span>

                    </div>


                    {/* ANALYTICS */}

                    <div
                        className="am-quick-card"
                        onClick={() =>
                            navigate(
                                "/analytics"
                            )
                        }
                    >

                        <div className="am-quick-icon">

                            <Icon
                                name="chart"
                                size={24}
                            />

                        </div>

                        <h3>
                            Analytics
                        </h3>

                        <p>
                            View detection statistics,
                            confidence and disease distribution.
                        </p>

                        <span className="am-quick-arrow">

                            View Analytics

                            <Icon
                                name="arrow"
                                size={15}
                            />

                        </span>

                    </div>


                    {/* HISTORY */}

                    <div
                        className="am-quick-card"
                        onClick={() =>
                            navigate(
                                "/history"
                            )
                        }
                    >

                        <div className="am-quick-icon">

                            <Icon
                                name="clock"
                                size={24}
                            />

                        </div>

                        <h3>
                            Detection History
                        </h3>

                        <p>
                            View all previous AI
                            detection results.
                        </p>

                        <span className="am-quick-arrow">

                            View History

                            <Icon
                                name="arrow"
                                size={15}
                            />

                        </span>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;