import React, {
    useEffect,
    useMemo,
    useState
} from "react";

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================================
// HEALTHY CHECK
// ============================================================

const isHealthyPrediction = (value) => {

    const text = String(value || "")
        .trim()
        .toLowerCase();

    return (
        text === "healthy" ||
        text === "healthy leaf" ||
        text.includes("healthy")
    );
};


// ============================================================
// TOKEN
// ============================================================

const getToken = () => {

    const keys = [
        "access_token",
        "token",
        "accessToken",
        "authToken",
        "jwt",
        "auth"
    ];

    for (
        const storage of [
            localStorage,
            sessionStorage
        ]
    ) {

        for (const key of keys) {

            const value =
                storage.getItem(key);

            if (!value) {
                continue;
            }

            try {

                const parsed =
                    JSON.parse(value);

                if (
                    typeof parsed === "string" &&
                    parsed.length > 20
                ) {
                    return parsed;
                }

                if (parsed?.access_token) {
                    return parsed.access_token;
                }

                if (parsed?.token) {
                    return parsed.token;
                }

            } catch {

                return value;

            }
        }
    }

    return null;
};


// ============================================================
// FORMAT NAME
// ============================================================

const formatName = (value) => {

    return String(value || "Unknown")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
};


// ============================================================
// ANALYTICS COMPONENT
// ============================================================

function Analytics() {

    const [history, setHistory] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // ========================================================
    // FETCH HISTORY
    // ========================================================

    const fetchHistory = async (
        isRefresh = false
    ) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = getToken();

            if (!token) {

                throw new Error(
                    "Not authenticated. Please login again."
                );
            }

            const response =
                await fetch(
                    `${API_BASE_URL}/history`,
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

            let data = {};

            try {

                data =
                    await response.json();

            } catch {

                data = {};

            }


            if (
                response.status === 401
            ) {

                throw new Error(
                    "Authentication expired. Please login again."
                );
            }


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Failed to load analytics data."
                );
            }


            setHistory(
                Array.isArray(data.history)
                    ? data.history
                    : []
            );

        } catch (err) {

            console.error(
                "Analytics error:",
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


    // ========================================================
    // LOAD
    // ========================================================

    useEffect(() => {

        fetchHistory();

    }, []);


    // ========================================================
    // ANALYTICS CALCULATION
    // ========================================================

    const analytics = useMemo(() => {

        const total = history.length;


        if (total === 0) {

            return {

                total: 0,
                healthy: 0,
                diseased: 0,

                averageConfidence: 0,

                healthyPercentage: 0,
                diseasePercentage: 0,

                mostCommonDisease:
                    "No disease detected",

                mostCommonDiseaseCount: 0,

                diseaseCounts: {},
                cropCounts: {},

                highConfidence: 0,
                mediumConfidence: 0,
                lowConfidence: 0
            };
        }


        // ------------------------------------------------
        // HEALTHY
        // ------------------------------------------------

        const healthy =
            history.filter(
                (item) =>
                    isHealthyPrediction(
                        item.prediction
                    )
            ).length;


        const diseased =
            total - healthy;


        // ------------------------------------------------
        // CONFIDENCE
        // ------------------------------------------------

        const confidenceValues =
            history
                .map(
                    (item) =>
                        Number(item.confidence)
                )
                .filter(
                    (value) =>
                        Number.isFinite(value)
                );


        const averageConfidence =
            confidenceValues.length > 0
                ? confidenceValues.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) /
                confidenceValues.length
                : 0;


        const highConfidence =
            confidenceValues.filter(
                (value) =>
                    value >= 80
            ).length;


        const mediumConfidence =
            confidenceValues.filter(
                (value) =>
                    value >= 60 &&
                    value < 80
            ).length;


        const lowConfidence =
            confidenceValues.filter(
                (value) =>
                    value < 60
            ).length;


        // ------------------------------------------------
        // PERCENTAGES
        // ------------------------------------------------

        const healthyPercentage =
            (healthy / total) * 100;

        const diseasePercentage =
            (diseased / total) * 100;


        // ------------------------------------------------
        // DISEASE COUNTS
        // ------------------------------------------------

        const diseaseCounts = {};

        history.forEach((item) => {

            const prediction =
                item.prediction ||
                "Unknown";

            diseaseCounts[prediction] =
                (
                    diseaseCounts[prediction] ||
                    0
                ) + 1;
        });


        // ------------------------------------------------
        // CROP COUNTS
        // ------------------------------------------------

        const cropCounts = {};

        history.forEach((item) => {

            const crop =
                item.crop ||
                "Unknown";

            cropCounts[crop] =
                (
                    cropCounts[crop] ||
                    0
                ) + 1;
        });


        // ------------------------------------------------
        // DISEASE ONLY
        // ------------------------------------------------

        const diseaseOnly =
            Object.entries(
                diseaseCounts
            )
                .filter(
                    ([name]) =>
                        !isHealthyPrediction(name)
                )
                .sort(
                    ([, a], [, b]) =>
                        b - a
                );


        // ------------------------------------------------
        // MOST COMMON
        // ------------------------------------------------

        const mostCommonDisease =
            diseaseOnly.length > 0
                ? diseaseOnly[0][0]
                : "No disease detected";


        const mostCommonDiseaseCount =
            diseaseOnly.length > 0
                ? diseaseOnly[0][1]
                : 0;


        return {

            total,
            healthy,
            diseased,

            averageConfidence,

            healthyPercentage,
            diseasePercentage,

            mostCommonDisease,
            mostCommonDiseaseCount,

            diseaseCounts,
            cropCounts,

            highConfidence,
            mediumConfidence,
            lowConfidence
        };

    }, [history]);


    // ========================================================
    // SORTED DISEASES
    // ========================================================

    const sortedDiseases =
        Object.entries(
            analytics.diseaseCounts
        ).sort(
            ([, a], [, b]) =>
                b - a
        );


    // ========================================================
    // SORTED CROPS
    // ========================================================

    const sortedCrops =
        Object.entries(
            analytics.cropCounts
        ).sort(
            ([, a], [, b]) =>
                b - a
        );


    // ========================================================
    // MAX CROP COUNT
    // ========================================================

    const maxCropCount =
        sortedCrops.length > 0
            ? Math.max(
                ...sortedCrops.map(
                    ([, count]) => count
                )
            )
            : 1;


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <>
                <style>
                    {styles}
                </style>

                <div className="analytics-state">

                    <div className="state-icon">
                        <span>AI</span>
                    </div>

                    <div className="state-loader"></div>

                    <h2>
                        Loading Analytics
                    </h2>

                    <p>
                        AgriMind AI is preparing
                        your crop health insights.
                    </p>

                </div>
            </>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (
            <>
                <style>
                    {styles}
                </style>

                <div className="analytics-state">

                    <div className="state-icon error">
                        <span>!</span>
                    </div>

                    <h2>
                        Unable to Load Analytics
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            fetchHistory(true)
                        }
                    >
                        Try Again
                    </button>

                </div>
            </>
        );
    }


    // ========================================================
    // EMPTY
    // ========================================================

    if (history.length === 0) {

        return (
            <>
                <style>
                    {styles}
                </style>

                <div className="analytics-page">

                    <header className="analytics-header">

                        <div>

                            <span className="eyebrow">
                                AGRIMIND AI • INSIGHTS
                            </span>

                            <h1>
                                Analytics
                            </h1>

                            <p>
                                AI-powered insights from
                                your crop detections.
                            </p>

                        </div>

                    </header>


                    <div className="analytics-state">

                        <div className="state-icon">
                            <span>AI</span>
                        </div>

                        <h2>
                            No Analytics Yet
                        </h2>

                        <p>
                            Perform a disease detection
                            first. Your results will
                            appear here automatically.
                        </p>

                    </div>

                </div>
            </>
        );
    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (

        <div className="analytics-page">

            <style>
                {styles}
            </style>


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="analytics-header">

                <div>

                    <span className="eyebrow">
                        AGRIMIND AI • INSIGHTS
                    </span>

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        A clear overview of your
                        crop disease detection history.
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={() =>
                        fetchHistory(true)
                    }
                    disabled={refreshing}
                >

                    <span className="refresh-icon">
                        ↻
                    </span>

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="analytics-hero">

                <div className="hero-pattern"></div>

                <div className="hero-content">

                    <span className="hero-label">
                        AI CROP HEALTH OVERVIEW
                    </span>

                    <h2>

                        {analytics.diseased >
                        analytics.healthy

                            ? "Attention is needed"

                            : "Your crop health looks good"}

                    </h2>

                    <p>

                        {analytics.total} detection
                        {analytics.total !== 1
                            ? "s"
                            : ""} analyzed with an
                        average AI confidence of{" "}

                        <strong>
                            {analytics.averageConfidence.toFixed(
                                1
                            )}%
                        </strong>.

                    </p>

                </div>


                <div className="hero-score">

                    <div className="hero-score-ring">

                        <strong>
                            {analytics.healthyPercentage.toFixed(
                                1
                            )}%
                        </strong>

                        <span>
                            Healthy
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="stat-grid">


                {/* TOTAL */}

                <div className="stat-card">

                    <div className="stat-icon green">
                        <span className="chart-icon">
                            <i></i>
                            <i></i>
                            <i></i>
                        </span>
                    </div>

                    <div>

                        <span>
                            Total Detections
                        </span>

                        <strong>
                            {analytics.total}
                        </strong>

                        <small>
                            All recorded results
                        </small>

                    </div>

                </div>


                {/* HEALTHY */}

                <div className="stat-card">

                    <div className="stat-icon light-green">

                        <span className="leaf-icon">
                            <i></i>
                        </span>

                    </div>

                    <div>

                        <span>
                            Healthy
                        </span>

                        <strong className="green-text">
                            {analytics.healthy}
                        </strong>

                        <small>
                            {analytics.healthyPercentage.toFixed(
                                1
                            )}% of total
                        </small>

                    </div>

                </div>


                {/* DISEASE */}

                <div className="stat-card">

                    <div className="stat-icon red">

                        <span className="disease-icon">
                            <i></i>
                        </span>

                    </div>

                    <div>

                        <span>
                            Disease Detected
                        </span>

                        <strong className="red-text">
                            {analytics.diseased}
                        </strong>

                        <small>
                            {analytics.diseasePercentage.toFixed(
                                1
                            )}% of total
                        </small>

                    </div>

                </div>


                {/* CONFIDENCE */}

                <div className="stat-card">

                    <div className="stat-icon blue">

                        <span className="confidence-icon">
                            %
                        </span>

                    </div>

                    <div>

                        <span>
                            Avg. Confidence
                        </span>

                        <strong className="blue-text">
                            {analytics.averageConfidence.toFixed(
                                1
                            )}%
                        </strong>

                        <small>
                            AI prediction accuracy
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================================
                DISTRIBUTION + HEALTH
            ================================================= */}

            <section className="analytics-grid">


                {/* DISTRIBUTION */}

                <div className="analytics-card">

                    <div className="card-header">

                        <div>

                            <div className="section-kicker">
                                PREDICTION BREAKDOWN
                            </div>

                            <h2>
                                Detection Distribution
                            </h2>

                            <p>
                                Breakdown of all recorded
                                AI predictions.
                            </p>

                        </div>

                        <span className="result-count">
                            {analytics.total} Results
                        </span>

                    </div>


                    <div className="distribution-list">

                        {sortedDiseases.map(
                            ([disease, count]) => {

                                const percentage =
                                    (
                                        (count /
                                            analytics.total) *
                                        100
                                    );

                                const healthy =
                                    isHealthyPrediction(
                                        disease
                                    );

                                return (

                                    <div
                                        className="distribution-row"
                                        key={disease}
                                    >

                                        <div className="distribution-top">

                                            <span>

                                                <i
                                                    className={
                                                        healthy
                                                            ? "green-dot"
                                                            : "red-dot"
                                                    }
                                                />

                                                {formatName(
                                                    disease
                                                )}

                                            </span>

                                            <strong>
                                                {count}
                                            </strong>

                                        </div>


                                        <div className="bar">

                                            <div
                                                className={
                                                    healthy
                                                        ? "bar-fill healthy-bar"
                                                        : "bar-fill disease-bar"
                                                }

                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            percentage,
                                                            100
                                                        )}%`
                                                }}
                                            />

                                        </div>


                                        <small>
                                            {percentage.toFixed(
                                                1
                                            )}%
                                        </small>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>


                {/* HEALTH */}

                <div className="analytics-card health-card">

                    <div className="card-header">

                        <div>

                            <div className="section-kicker">
                                HEALTH OVERVIEW
                            </div>

                            <h2>
                                Crop Health
                            </h2>

                            <p>
                                Healthy vs disease-related
                                results.
                            </p>

                        </div>

                    </div>


                    <div
                        className="health-circle"
                        style={{
                            "--healthy":
                                analytics.healthyPercentage
                        }}
                    >

                        <div>

                            <strong>
                                {analytics.healthyPercentage.toFixed(
                                    1
                                )}%
                            </strong>

                            <span>
                                Healthy
                            </span>

                        </div>

                    </div>


                    <div className="health-legend">

                        <div>

                            <span>
                                <i className="legend-green" />
                                Healthy
                            </span>

                            <strong>
                                {analytics.healthy}
                            </strong>

                        </div>


                        <div>

                            <span>
                                <i className="legend-red" />
                                Disease
                            </span>

                            <strong>
                                {analytics.diseased}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                MOST COMMON DISEASE
            ================================================= */}

            <section className="highlight-card">

                <div className="highlight-icon">

                    <span className="search-icon"></span>

                </div>

                <div>

                    <span>
                        MOST FREQUENTLY DETECTED DISEASE
                    </span>

                    <h2>
                        {formatName(
                            analytics.mostCommonDisease
                        )}
                    </h2>

                    <p>

                        Detected{" "}

                        <strong>
                            {analytics.mostCommonDiseaseCount}
                        </strong>{" "}

                        time
                        {analytics.mostCommonDiseaseCount !==
                        1
                            ? "s"
                            : ""}{" "}
                        in your history.

                    </p>

                </div>

            </section>


            {/* =================================================
                DISEASE-WISE ANALYSIS
            ================================================= */}

            <section className="analytics-card">

                <div className="card-header">

                    <div>

                        <div className="section-kicker">
                            DISEASE INSIGHTS
                        </div>

                        <h2>
                            Disease-wise Analysis
                        </h2>

                        <p>
                            Frequency of disease-related
                            predictions.
                        </p>

                    </div>

                </div>


                <div className="disease-grid">

                    {sortedDiseases
                        .filter(
                            ([disease]) =>
                                !isHealthyPrediction(
                                    disease
                                )
                        )
                        .map(
                            ([disease, count]) => {

                                const percentage =
                                    analytics.diseased > 0
                                        ? (
                                            (count /
                                                analytics.diseased) *
                                            100
                                        )
                                        : 0;

                                return (

                                    <div
                                        className="disease-box"
                                        key={disease}
                                    >

                                        <div className="disease-title">

                                            <div>

                                                <span>
                                                    DISEASE
                                                </span>

                                                <h3>
                                                    {formatName(
                                                        disease
                                                    )}
                                                </h3>

                                            </div>

                                            <strong>
                                                {count}
                                            </strong>

                                        </div>


                                        <div className="bar">

                                            <div
                                                className="bar-fill disease-bar"
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            percentage,
                                                            100
                                                        )}%`
                                                }}
                                            />

                                        </div>


                                        <p>
                                            {percentage.toFixed(
                                                1
                                            )}% of disease detections
                                        </p>

                                    </div>

                                );

                            }
                        )}

                </div>

            </section>


            {/* =================================================
                CROP-WISE ANALYSIS
            ================================================= */}

            <section className="analytics-card crop-section">

                <div className="card-header">

                    <div>

                        <div className="section-kicker">
                            CROP PERFORMANCE
                        </div>

                        <h2>
                            Crop-wise Analysis
                        </h2>

                        <p>
                            Detection distribution across
                            your crops.
                        </p>

                    </div>

                    <span className="chart-badge">
                        Live Data
                    </span>

                </div>


                {/* BAR CHART */}

                <div className="crop-chart">

                    <div className="chart-y-axis">

                        <span>
                            {maxCropCount}
                        </span>

                        <span>
                            {Math.ceil(
                                maxCropCount * 0.75
                            )}
                        </span>

                        <span>
                            {Math.ceil(
                                maxCropCount * 0.5
                            )}
                        </span>

                        <span>
                            {Math.ceil(
                                maxCropCount * 0.25
                            )}
                        </span>

                        <span>
                            0
                        </span>

                    </div>


                    <div className="chart-area">

                        <div className="chart-grid-lines">

                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>

                        </div>


                        <div className="bars-container">

                            {sortedCrops.map(
                                ([crop, count]) => {

                                    const height =
                                        maxCropCount > 0
                                            ? (
                                                (count /
                                                    maxCropCount) *
                                                100
                                            )
                                            : 0;

                                    return (

                                        <div
                                            className="chart-column"
                                            key={crop}
                                        >

                                            <div className="bar-value">
                                                {count}
                                            </div>

                                            <div
                                                className="vertical-bar"
                                                style={{
                                                    height:
                                                        `${Math.max(
                                                            height,
                                                            7
                                                        )}%`
                                                }}
                                            >
                                                <span></span>
                                            </div>

                                            <div className="chart-label">
                                                {formatName(
                                                    crop
                                                )}
                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                </div>


                {/* CROP CARDS */}

                <div className="crop-grid">

                    {sortedCrops.map(
                        ([crop, count]) => {

                            const percentage =
                                (
                                    (count /
                                        analytics.total) *
                                    100
                                );

                            return (

                                <div
                                    className="crop-box"
                                    key={crop}
                                >

                                    <div className="crop-name">

                                        <span className="crop-icon">
                                            <i></i>
                                        </span>

                                        <strong>
                                            {formatName(crop)}
                                        </strong>

                                    </div>


                                    <b>
                                        {count}
                                    </b>


                                    <div className="bar">

                                        <div
                                            className="bar-fill crop-bar"
                                            style={{
                                                width:
                                                    `${Math.min(
                                                        percentage,
                                                        100
                                                    )}%`
                                            }}
                                        />

                                    </div>


                                    <small>
                                        {percentage.toFixed(
                                            1
                                        )}% of all detections
                                    </small>

                                </div>

                            );

                        }
                    )}

                </div>

            </section>


            {/* =================================================
                CONFIDENCE
            ================================================= */}

            <section className="analytics-card">

                <div className="card-header">

                    <div>

                        <div className="section-kicker">
                            MODEL PERFORMANCE
                        </div>

                        <h2>
                            Confidence Analysis
                        </h2>

                        <p>
                            AI prediction confidence
                            distribution.
                        </p>

                    </div>

                </div>


                <div className="confidence-grid">


                    <div className="confidence-box high">

                        <span className="confidence-dot high-dot">
                        </span>

                        <div>

                            <small>
                                HIGH CONFIDENCE
                            </small>

                            <strong>
                                {analytics.highConfidence}
                            </strong>

                            <p>
                                ≥ 80%
                            </p>

                        </div>

                    </div>


                    <div className="confidence-box medium">

                        <span className="confidence-dot medium-dot">
                        </span>

                        <div>

                            <small>
                                MEDIUM CONFIDENCE
                            </small>

                            <strong>
                                {analytics.mediumConfidence}
                            </strong>

                            <p>
                                60% - 79%
                            </p>

                        </div>

                    </div>


                    <div className="confidence-box low">

                        <span className="confidence-dot low-dot">
                        </span>

                        <div>

                            <small>
                                LOW CONFIDENCE
                            </small>

                            <strong>
                                {analytics.lowConfidence}
                            </strong>

                            <p>
                                &lt; 60%
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                AI INSIGHTS
            ================================================= */}

            <section className="ai-insights">

                <div className="insight-heading">

                    <span>
                        AGRIMIND AI
                    </span>

                    <h2>
                        AI Crop Health Insights
                    </h2>

                    <p>
                        AgriMind AI summarizes your
                        detection history to help
                        understand crop health.
                    </p>

                </div>


                <div className="insight-grid">


                    {/* STATUS */}

                    <div className="insight-item">

                        <div className="insight-number">
                            01
                        </div>

                        <span>
                            HEALTH STATUS
                        </span>

                        <h3>

                            {analytics.diseased >
                            analytics.healthy

                                ? "Attention Required"

                                : "Overall Health Looks Good"}

                        </h3>

                        <p>

                            {analytics.total} detection
                            {analytics.total !== 1
                                ? "s"
                                : ""} analyzed.

                            {" "}

                            {analytics.healthy} were
                            classified as healthy and{" "}

                            {analytics.diseased} were
                            disease-related.

                        </p>

                    </div>


                    {/* MODEL */}

                    <div className="insight-item">

                        <div className="insight-number">
                            02
                        </div>

                        <span>
                            MODEL CONFIDENCE
                        </span>

                        <h3>
                            {analytics.averageConfidence.toFixed(
                                1
                            )}%
                        </h3>

                        <p>
                            Average AI confidence across
                            the stored detection history.
                        </p>

                    </div>


                    {/* ACTION */}

                    <div className="insight-item">

                        <div className="insight-number">
                            03
                        </div>

                        <span>
                            FARMER ACTION
                        </span>

                        <h3>
                            Monitor Your Crops
                        </h3>

                        <p>
                            Inspect affected plants
                            regularly and consult local
                            agricultural guidance before
                            applying chemical treatment.
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="analytics-note">

                <span className="note-dot"></span>

                Analytics are generated from
                AgriMind AI detection history.

            </div>

        </div>
    );
}


// ============================================================
// CSS
// ============================================================

const styles = `

* {
    box-sizing: border-box;
}

.analytics-page {

    width: 100%;

    max-width: 1500px;

    margin: 0 auto;

    padding:
        32px 36px 80px;

    color: #10261a;

    background:
        linear-gradient(
            180deg,
            #f8fcfa 0%,
            #f4f9f6 100%
        );

}


/* ============================================================
   HEADER
============================================================ */

.analytics-header {

    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: 25px;

    margin-bottom: 28px;

}

.eyebrow {

    display: inline-block;

    margin-bottom: 9px;

    color: #16a34a;

    font-size: 11px;

    font-weight: 900;

    letter-spacing: 2.2px;

}

.analytics-header h1 {

    margin: 0;

    color: #092419;

    font-size: 40px;

    line-height: 1;

    font-weight: 950;

    letter-spacing: -1.5px;

}

.analytics-header p {

    margin: 10px 0 0;

    color: #718096;

    font-size: 15px;

    line-height: 1.6;

}

.refresh-button,
.primary-button {

    min-height: 46px;

    padding: 0 20px;

    border:
        1px solid #16a34a;

    border-radius: 12px;

    background: #ffffff;

    color: #15803d;

    font-size: 14px;

    font-weight: 800;

    cursor: pointer;

    transition:
        .25s ease;

}

.refresh-button:hover {

    color: #ffffff;

    background: #16a34a;

    transform:
        translateY(-2px);

    box-shadow:
        0 8px 20px
        rgba(22,163,74,.18);

}

.refresh-button:disabled {

    opacity: .6;

    cursor: not-allowed;

    transform: none;

}

.refresh-icon {

    display: inline-block;

    margin-right: 7px;

    font-size: 17px;

}


/* ============================================================
   HERO
============================================================ */

.analytics-hero {

    position: relative;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 35px;

    min-height: 235px;

    overflow: hidden;

    padding: 38px 44px;

    margin-bottom: 24px;

    border-radius: 25px;

    color: #ffffff;

    background:
        linear-gradient(
            135deg,
            #066b34 0%,
            #0b8a42 45%,
            #19b957 100%
        );

    box-shadow:
        0 18px 45px
        rgba(21,128,61,.20);

}

.hero-pattern {

    position: absolute;

    width: 390px;

    height: 390px;

    right: -110px;

    top: -190px;

    border:
        1px solid
        rgba(255,255,255,.12);

    border-radius: 50%;

    box-shadow:
        0 0 0 55px
        rgba(255,255,255,.035),
        0 0 0 110px
        rgba(255,255,255,.025);

}

.hero-content {

    position: relative;

    z-index: 2;

    max-width: 900px;

}

.hero-label {

    display: inline-flex;

    align-items: center;

    gap: 9px;

    font-size: 11px;

    font-weight: 900;

    letter-spacing: 2px;

}

.hero-label::before {

    content: "";

    width: 28px;

    height: 2px;

    border-radius: 3px;

    background:
        rgba(255,255,255,.85);

}

.hero-content h2 {

    margin: 15px 0 11px;

    font-size: 36px;

    line-height: 1.12;

    font-weight: 950;

    letter-spacing: -1px;

}

.hero-content p {

    margin: 0;

    font-size: 16px;

    line-height: 1.6;

    color:
        rgba(255,255,255,.94);

}

.hero-content p strong {

    color: #ffffff;

}

.hero-score {

    position: relative;

    z-index: 2;

    flex-shrink: 0;

}

.hero-score-ring {

    width: 150px;

    height: 150px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    border:
        1px solid
        rgba(255,255,255,.4);

    border-radius: 50%;

    background:
        rgba(255,255,255,.08);

    box-shadow:
        inset 0 0 0 12px
        rgba(255,255,255,.035);

    backdrop-filter:
        blur(4px);

}

.hero-score-ring strong {

    font-size: 31px;

    font-weight: 950;

}

.hero-score-ring span {

    margin-top: 3px;

    font-size: 13px;

    font-weight: 800;

}


/* ============================================================
   STAT GRID
============================================================ */

.stat-grid {

    display: grid;

    grid-template-columns:
        repeat(4, minmax(0, 1fr));

    gap: 18px;

    margin-bottom: 24px;

}

.stat-card {

    position: relative;

    display: flex;

    align-items: center;

    gap: 15px;

    min-height: 125px;

    padding: 22px;

    overflow: hidden;

    background: #ffffff;

    border:
        1px solid #e5e7eb;

    border-radius: 18px;

    box-shadow:
        0 7px 24px
        rgba(0,0,0,.045);

    transition:
        transform .25s ease,
        box-shadow .25s ease,
        border-color .25s ease;

}

.stat-card::after {

    content: "";

    position: absolute;

    width: 80px;

    height: 80px;

    right: -35px;

    bottom: -40px;

    border-radius: 50%;

    background:
        rgba(22,163,74,.035);

}

.stat-card:hover {

    transform:
        translateY(-4px);

    border-color:
        #ccebd7;

    box-shadow:
        0 14px 30px
        rgba(0,0,0,.07);

}

.stat-card > div:last-child {

    min-width: 0;

}

.stat-card span:not(.chart-icon):not(.leaf-icon):not(.disease-icon):not(.confidence-icon) {

    display: block;

    margin-bottom: 5px;

    color: #64748b;

    font-size: 13px;

    font-weight: 750;

}

.stat-card strong {

    display: block;

    font-size: 29px;

    line-height: 1;

    font-weight: 950;

}

.stat-card small {

    display: block;

    margin-top: 6px;

    color: #94a3b8;

    font-size: 10px;

    font-weight: 650;

}

.stat-icon {

    width: 54px;

    height: 54px;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 16px;

}

.stat-icon.green {
    background: #dcfce7;
}

.stat-icon.light-green {
    background: #ecfdf5;
}

.stat-icon.red {
    background: #fef2f2;
}

.stat-icon.blue {
    background: #eff6ff;
}

.green-text {
    color: #15803d;
}

.red-text {
    color: #dc2626;
}

.blue-text {
    color: #2563eb;
}


/* ============================================================
   CSS ICONS
============================================================ */

.chart-icon {

    width: 25px;

    height: 23px;

    display: flex !important;

    align-items: flex-end;

    justify-content: center;

    gap: 3px;

}

.chart-icon i {

    display: block;

    width: 5px;

    border-radius: 3px;

    background: #16a34a;

}

.chart-icon i:nth-child(1) {
    height: 11px;
}

.chart-icon i:nth-child(2) {
    height: 20px;
}

.chart-icon i:nth-child(3) {
    height: 15px;
}

.leaf-icon {

    position: relative;

    width: 25px;

    height: 22px;

    display: block !important;

    border:
        2px solid #16a34a;

    border-radius:
        100% 0 100% 0;

    transform:
        rotate(-35deg);

}

.leaf-icon i {

    position: absolute;

    width: 2px;

    height: 19px;

    left: 10px;

    top: 3px;

    border-radius: 2px;

    background: #16a34a;

    transform:
        rotate(40deg);

}

.disease-icon {

    position: relative;

    width: 20px;

    height: 20px;

    display: block !important;

    border:
        2px solid #dc2626;

    border-radius: 50%;

}

.disease-icon::before,
.disease-icon::after {

    content: "";

    position: absolute;

    background: #dc2626;

    border-radius: 2px;

}

.disease-icon::before {

    width: 27px;

    height: 2px;

    left: -5px;

    top: 7px;

}

.disease-icon::after {

    width: 2px;

    height: 27px;

    left: 7px;

    top: -5px;

}

.confidence-icon {

    display: block !important;

    color: #2563eb;

    font-size: 22px;

    font-weight: 950;

}


/* ============================================================
   MAIN GRID
============================================================ */

.analytics-grid {

    display: grid;

    grid-template-columns:
        minmax(0, 1.55fr)
        minmax(320px, .75fr);

    gap: 22px;

    margin-bottom: 0;

}

.analytics-card {

    padding: 27px;

    margin-bottom: 24px;

    background: #ffffff;

    border:
        1px solid #e5e7eb;

    border-radius: 19px;

    box-shadow:
        0 7px 24px
        rgba(0,0,0,.045);

}

.health-card {

    margin-bottom: 24px;

}

.card-header {

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 18px;

    margin-bottom: 25px;

}

.section-kicker {

    margin-bottom: 5px;

    color: #16a34a;

    font-size: 9px;

    font-weight: 950;

    letter-spacing: 1.7px;

}

.card-header h2 {

    margin: 0 0 7px;

    color: #10261a;

    font-size: 23px;

    line-height: 1.2;

    font-weight: 900;

    letter-spacing: -.4px;

}

.card-header p {

    margin: 0;

    color: #718096;

    font-size: 14px;

    line-height: 1.5;

}

.result-count,
.chart-badge {

    flex-shrink: 0;

    padding: 8px 13px;

    border-radius: 999px;

    background: #ecfdf5;

    color: #15803d;

    font-size: 11px;

    font-weight: 850;

}

.chart-badge {

    background: #f0fdf4;

    border:
        1px solid #dcfce7;

}


/* ============================================================
   DISTRIBUTION
============================================================ */

.distribution-list {

    display: flex;

    flex-direction: column;

    gap: 4px;

}

.distribution-row {

    padding: 7px 0 14px;

    margin-bottom: 3px;

}

.distribution-top {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    margin-bottom: 8px;

}

.distribution-top span {

    display: flex;

    align-items: center;

    gap: 9px;

    color: #475569;

    font-size: 13px;

    font-weight: 750;

}

.distribution-top strong {

    color: #10261a;

    font-size: 21px;

    font-weight: 900;

}

.bar {

    width: 100%;

    height: 9px;

    overflow: hidden;

    border-radius: 999px;

    background: #e9eef0;

}

.bar-fill {

    height: 100%;

    border-radius: 999px;

    transition:
        width .7s ease;

}

.disease-bar {

    background:
        linear-gradient(
            90deg,
            #ef4444,
            #f97316
        );

}

.healthy-bar {

    background:
        linear-gradient(
            90deg,
            #16a34a,
            #22c55e
        );

}

.crop-bar {

    background:
        linear-gradient(
            90deg,
            #15803d,
            #22c55e
        );

}

.distribution-row small {

    display: block;

    margin-top: 5px;

    color: #94a3b8;

    font-size: 11px;

}

.green-dot,
.red-dot {

    width: 8px;

    height: 8px;

    display: inline-block;

    flex-shrink: 0;

    border-radius: 50%;

}

.green-dot {

    background: #22c55e;

    box-shadow:
        0 0 0 4px
        #dcfce7;

}

.red-dot {

    background: #ef4444;

    box-shadow:
        0 0 0 4px
        #fee2e2;

}


/* ============================================================
   HEALTH CIRCLE
============================================================ */

.health-circle {

    width: 190px;

    height: 190px;

    margin:
        14px auto 27px;

    display: flex;

    align-items: center;

    justify-content: center;

    position: relative;

    border-radius: 50%;

    background:
        conic-gradient(
            #22c55e
            calc(var(--healthy) * 1%),
            #fee2e2 0
        );

    box-shadow:
        0 12px 30px
        rgba(34,197,94,.12);

}

.health-circle::before {

    content: "";

    position: absolute;

    width: 153px;

    height: 153px;

    border-radius: 50%;

    background: #ffffff;

}

.health-circle > div {

    position: relative;

    z-index: 1;

    text-align: center;

}

.health-circle strong {

    display: block;

    color: #10261a;

    font-size: 29px;

    font-weight: 950;

}

.health-circle span {

    display: block;

    margin-top: 4px;

    color: #64748b;

    font-size: 12px;

    font-weight: 700;

}

.health-legend > div {

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 13px 14px;

    margin-top: 9px;

    border:
        1px solid #edf0f1;

    border-radius: 12px;

    background: #f8fafc;

}

.health-legend span {

    display: flex;

    align-items: center;

    gap: 8px;

    color: #475569;

    font-size: 13px;

    font-weight: 750;

}

.legend-green,
.legend-red {

    width: 8px;

    height: 8px;

    display: inline-block;

    border-radius: 50%;

}

.legend-green {

    background: #22c55e;

}

.legend-red {

    background: #ef4444;

}

.health-legend strong {

    font-size: 18px;

    font-weight: 900;

}


/* ============================================================
   HIGHLIGHT
============================================================ */

.highlight-card {

    position: relative;

    display: flex;

    align-items: center;

    gap: 21px;

    overflow: hidden;

    padding: 29px;

    margin-bottom: 24px;

    border-radius: 20px;

    color: #ffffff;

    background:
        linear-gradient(
            135deg,
            #119447,
            #087a3a
        );

    box-shadow:
        0 10px 30px
        rgba(21,128,61,.16);

}

.highlight-card::after {

    content: "";

    position: absolute;

    width: 210px;

    height: 210px;

    right: -80px;

    top: -90px;

    border:
        1px solid
        rgba(255,255,255,.12);

    border-radius: 50%;

}

.highlight-icon {

    position: relative;

    z-index: 1;

    width: 62px;

    height: 62px;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 17px;

    background:
        rgba(255,255,255,.13);

    border:
        1px solid
        rgba(255,255,255,.12);

}

.search-icon {

    position: relative;

    width: 22px;

    height: 22px;

    display: block;

    border:
        3px solid #ffffff;

    border-radius: 50%;

}

.search-icon::after {

    content: "";

    position: absolute;

    width: 10px;

    height: 3px;

    right: -8px;

    bottom: -5px;

    border-radius: 4px;

    background: #ffffff;

    transform:
        rotate(45deg);

}

.highlight-card > div:last-child {

    position: relative;

    z-index: 1;

}

.highlight-card span {

    font-size: 10px;

    font-weight: 900;

    letter-spacing: 1.7px;

}

.highlight-card h2 {

    margin: 7px 0;

    font-size: 28px;

    font-weight: 950;

}

.highlight-card p {

    margin: 0;

    color:
        rgba(255,255,255,.88);

    font-size: 14px;

}

.highlight-card p strong {

    color: #ffffff;

}


/* ============================================================
   DISEASE GRID
============================================================ */

.disease-grid {

    display: grid;

    grid-template-columns:
        repeat(2, minmax(0, 1fr));

    gap: 17px;

}

.disease-box,
.crop-box {

    padding: 20px;

    border:
        1px solid #e5e7eb;

    border-radius: 15px;

    background:
        linear-gradient(
            180deg,
            #ffffff,
            #fbfdfc
        );

    transition:
        transform .25s ease,
        box-shadow .25s ease,
        border-color .25s ease;

}

.disease-box:hover,
.crop-box:hover {

    transform:
        translateY(-3px);

    border-color:
        #d8eade;

    box-shadow:
        0 10px 22px
        rgba(0,0,0,.055);

}

.disease-title {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    margin-bottom: 15px;

}

.disease-title span {

    color: #94a3b8;

    font-size: 9px;

    font-weight: 950;

    letter-spacing: 1.5px;

}

.disease-title h3 {

    margin: 5px 0 0;

    color: #10261a;

    font-size: 16px;

    font-weight: 850;

}

.disease-title > strong {

    padding: 9px 13px;

    border-radius: 10px;

    background: #fef2f2;

    color: #dc2626;

    font-size: 18px;

    font-weight: 950;

}

.disease-box p {

    margin: 9px 0 0;

    color: #718096;

    font-size: 11px;

}


/* ============================================================
   CROP CHART
============================================================ */

.crop-chart {

    display: flex;

    width: 100%;

    height: 320px;

    margin:
        5px 0 30px;

    padding:
        0 0 0 5px;

}

.chart-y-axis {

    width: 35px;

    flex-shrink: 0;

    display: flex;

    flex-direction: column;

    justify-content: space-between;

    padding:
        4px 0 36px;

}

.chart-y-axis span {

    color: #94a3b8;

    font-size: 10px;

    font-weight: 650;

    text-align: right;

}

.chart-area {

    position: relative;

    flex: 1;

    min-width: 0;

}

.chart-grid-lines {

    position: absolute;

    inset:
        0 0 36px 0;

    display: flex;

    flex-direction: column;

    justify-content: space-between;

}

.chart-grid-lines span {

    display: block;

    width: 100%;

    height: 1px;

    background: #edf1ef;

}

.bars-container {

    position: absolute;

    inset:
        0 0 0 12px;

    display: flex;

    align-items: flex-end;

    justify-content: space-around;

    gap: 16px;

    border-bottom:
        1px solid #dfe6e2;

}

.chart-column {

    position: relative;

    width: 100%;

    max-width: 100px;

    height: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: flex-end;

}

.vertical-bar {

    position: relative;

    width: min(48px, 70%);

    min-height: 12px;

    margin-bottom: 9px;

    border-radius:
        9px 9px 4px 4px;

    background:
        linear-gradient(
            180deg,
            #22c55e,
            #15803d
        );

    box-shadow:
        0 6px 15px
        rgba(21,128,61,.13);

    animation:
        chartGrow .7s ease-out;

}

.vertical-bar span {

    position: absolute;

    top: 0;

    left: 0;

    width: 100%;

    height: 2px;

    border-radius: 10px;

    background:
        rgba(255,255,255,.5);

}

.bar-value {

    margin-bottom: 6px;

    color: #10261a;

    font-size: 13px;

    font-weight: 900;

}

.chart-label {

    width: 100%;

    min-height: 28px;

    color: #64748b;

    font-size: 11px;

    font-weight: 750;

    text-align: center;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

}

@keyframes chartGrow {

    from {
        height: 0;
    }

}


/* ============================================================
   CROP GRID
============================================================ */

.crop-grid {

    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(210px, 1fr)
        );

    gap: 17px;

}

.crop-name {

    display: flex;

    align-items: center;

    gap: 10px;

}

.crop-name strong {

    color: #10261a;

    font-size: 17px;

    font-weight: 850;

}

.crop-icon {

    position: relative;

    width: 25px;

    height: 25px;

    flex-shrink: 0;

}

.crop-icon::before {

    content: "";

    position: absolute;

    left: 11px;

    top: 8px;

    width: 2px;

    height: 17px;

    border-radius: 2px;

    background: #15803d;

}

.crop-icon::after {

    content: "";

    position: absolute;

    left: 4px;

    top: 3px;

    width: 11px;

    height: 8px;

    border:
        2px solid #22c55e;

    border-radius:
        100% 0 100% 0;

    transform:
        rotate(-25deg);

}

.crop-icon i {

    position: absolute;

    left: 12px;

    top: 1px;

    width: 11px;

    height: 8px;

    border:
        2px solid #84cc16;

    border-radius:
        0 100% 0 100%;

    transform:
        rotate(20deg);

}

.crop-box > b {

    display: block;

    margin: 14px 0;

    color: #10261a;

    font-size: 28px;

    line-height: 1;

    font-weight: 950;

}

.crop-box small {

    display: block;

    margin-top: 6px;

    color: #718096;

    font-size: 11px;

}


/* ============================================================
   CONFIDENCE
============================================================ */

.confidence-grid {

    display: grid;

    grid-template-columns:
        repeat(3, minmax(0, 1fr));

    gap: 18px;

}

.confidence-box {

    display: flex;

    align-items: center;

    gap: 16px;

    min-height: 130px;

    padding: 20px;

    border-radius: 15px;

    transition:
        transform .25s ease;

}

.confidence-box:hover {

    transform:
        translateY(-3px);

}

.confidence-box.high {

    background: #f0fdf4;

    border:
        1px solid #bbf7d0;

}

.confidence-box.medium {

    background: #fffbeb;

    border:
        1px solid #fde68a;

}

.confidence-box.low {

    background: #fef2f2;

    border:
        1px solid #fecaca;

}

.confidence-dot {

    width: 30px;

    height: 30px;

    flex-shrink: 0;

    display: block;

    border-radius: 50%;

}

.high-dot {

    background:
        linear-gradient(
            135deg,
            #86efac,
            #16a34a
        );

    box-shadow:
        0 5px 12px
        rgba(22,163,74,.18);

}

.medium-dot {

    background:
        linear-gradient(
            135deg,
            #fde68a,
            #f59e0b
        );

    box-shadow:
        0 5px 12px
        rgba(245,158,11,.18);

}

.low-dot {

    background:
        linear-gradient(
            135deg,
            #fb7185,
            #dc2626
        );

    box-shadow:
        0 5px 12px
        rgba(220,38,38,.18);

}

.confidence-box small {

    display: block;

    color: #64748b;

    font-size: 9px;

    font-weight: 950;

    letter-spacing: 1.2px;

}

.confidence-box strong {

    display: block;

    margin: 5px 0;

    color: #10261a;

    font-size: 29px;

    line-height: 1;

    font-weight: 950;

}

.confidence-box p {

    margin: 0;

    color: #64748b;

    font-size: 11px;

}


/* ============================================================
   AI INSIGHTS
============================================================ */

.ai-insights {

    padding: 30px;

    margin-bottom: 24px;

    border:
        1px solid #bbf7d0;

    border-radius: 21px;

    background:
        linear-gradient(
            135deg,
            #effcf3,
            #ffffff 65%
        );

    box-shadow:
        0 7px 24px
        rgba(0,0,0,.035);

}

.insight-heading > span {

    color: #16a34a;

    font-size: 10px;

    font-weight: 950;

    letter-spacing: 2px;

}

.insight-heading h2 {

    margin: 7px 0 8px;

    color: #10261a;

    font-size: 25px;

    font-weight: 900;

}

.insight-heading p {

    max-width: 760px;

    margin: 0 0 25px;

    color: #64748b;

    font-size: 14px;

    line-height: 1.6;

}

.insight-grid {

    display: grid;

    grid-template-columns:
        repeat(3, minmax(0, 1fr));

    gap: 17px;

}

.insight-item {

    position: relative;

    padding: 22px;

    overflow: hidden;

    border:
        1px solid #e5e7eb;

    border-radius: 15px;

    background: #ffffff;

    transition:
        transform .25s ease,
        box-shadow .25s ease;

}

.insight-item:hover {

    transform:
        translateY(-3px);

    box-shadow:
        0 12px 25px
        rgba(0,0,0,.055);

}

.insight-number {

    position: absolute;

    top: 16px;

    right: 18px;

    color: #dbeee1;

    font-size: 26px;

    font-weight: 950;

}

.insight-item > span {

    color: #94a3b8;

    font-size: 9px;

    font-weight: 950;

    letter-spacing: 1.4px;

}

.insight-item h3 {

    max-width: 80%;

    margin: 10px 0;

    color: #10261a;

    font-size: 18px;

    font-weight: 900;

}

.insight-item p {

    margin: 0;

    color: #64748b;

    font-size: 13px;

    line-height: 1.7;

}


/* ============================================================
   FOOTER
============================================================ */

.analytics-note {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 8px;

    padding: 17px;

    text-align: center;

    border:
        1px solid #e5e7eb;

    border-radius: 13px;

    color: #64748b;

    background: #ffffff;

    font-size: 12px;

}

.note-dot {

    width: 6px;

    height: 6px;

    display: inline-block;

    border-radius: 50%;

    background: #22c55e;

    box-shadow:
        0 0 0 4px #dcfce7;

}


/* ============================================================
   STATES
============================================================ */

.analytics-state {

    min-height: 65vh;

    padding: 70px 25px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;

}

.state-icon {

    width: 64px;

    height: 64px;

    display: flex;

    align-items: center;

    justify-content: center;

    margin-bottom: 15px;

    border:
        2px solid #16a34a;

    border-radius: 18px;

    color: #16a34a;

    background: #ecfdf5;

}

.state-icon span {

    font-size: 20px;

    font-weight: 950;

    letter-spacing: -1px;

}

.state-icon.error {

    border-color: #dc2626;

    color: #dc2626;

    background: #fef2f2;

}

.state-loader {

    width: 25px;

    height: 25px;

    margin-bottom: 17px;

    border:
        3px solid #dcfce7;

    border-top-color: #16a34a;

    border-radius: 50%;

    animation:
        spin .8s linear infinite;

}

@keyframes spin {

    to {
        transform: rotate(360deg);
    }

}

.analytics-state h2 {

    margin: 0 0 8px;

    color: #10261a;

    font-size: 23px;

    font-weight: 900;

}

.analytics-state p {

    max-width: 600px;

    margin: 0 0 20px;

    color: #64748b;

    line-height: 1.7;

}


/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 1200px) {

    .analytics-page {
        padding:
            28px 28px 65px;
    }

    .stat-grid {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }

    .analytics-grid {
        grid-template-columns:
            1fr;
    }

}


@media (max-width: 900px) {

    .analytics-page {
        padding:
            24px 20px 55px;
    }

    .analytics-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .analytics-header h1 {
        font-size: 35px;
    }

    .analytics-hero {
        align-items: flex-start;
        flex-direction: column;
        padding: 31px;
    }

    .hero-content h2 {
        font-size: 31px;
    }

    .hero-score {
        align-self: flex-end;
    }

    .disease-grid,
    .confidence-grid,
    .insight-grid {
        grid-template-columns: 1fr;
    }

    .crop-grid {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }

}


@media (max-width: 650px) {

    .analytics-page {
        padding:
            20px 14px 45px;
    }

    .analytics-header h1 {
        font-size: 31px;
    }

    .analytics-header p {
        font-size: 14px;
    }

    .stat-grid {
        grid-template-columns: 1fr;
    }

    .analytics-hero {
        min-height: auto;
        padding: 27px 23px;
        border-radius: 20px;
    }

    .hero-content h2 {
        font-size: 27px;
    }

    .hero-content p {
        font-size: 14px;
    }

    .hero-score {
        align-self: center;
    }

    .hero-score-ring {
        width: 135px;
        height: 135px;
    }

    .analytics-card,
    .ai-insights {
        padding: 20px;
        border-radius: 17px;
    }

    .card-header {
        flex-direction: column;
    }

    .result-count,
    .chart-badge {
        align-self: flex-start;
    }

    .highlight-card {
        align-items: flex-start;
        flex-direction: column;
        padding: 24px;
    }

    .highlight-card h2 {
        font-size: 24px;
    }

    .crop-grid {
        grid-template-columns: 1fr;
    }

    .crop-chart {
        height: 270px;
    }

    .bars-container {
        gap: 7px;
    }

    .vertical-bar {
        width: min(36px, 70%);
    }

    .chart-label {
        font-size: 9px;
    }

}


@media (max-width: 420px) {

    .analytics-page {
        padding:
            17px 11px 35px;
    }

    .analytics-header h1 {
        font-size: 28px;
    }

    .analytics-hero {
        padding: 23px 19px;
    }

    .hero-content h2 {
        font-size: 24px;
    }

    .stat-card {
        padding: 18px;
    }

    .analytics-card,
    .ai-insights {
        padding: 17px;
    }

    .health-circle {
        width: 165px;
        height: 165px;
    }

    .health-circle::before {
        width: 132px;
        height: 132px;
    }

    .crop-chart {
        height: 245px;
    }

    .chart-y-axis {
        width: 27px;
    }

}

`;

export default Analytics;