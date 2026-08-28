import React, {
    useEffect,
    useMemo,
    useState
} from "react";

const API_BASE_URL =
    "http://127.0.0.1:8000";

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

                if (
                    parsed?.access_token
                ) {
                    return parsed.access_token;
                }

                if (
                    parsed?.token
                ) {
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
// ANALYTICS COMPONENT
// ============================================================

function Analytics() {

    const [history, setHistory] =
        useState([]);

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

            const token =
                getToken();

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


            // ------------------------------------------------
            // AUTH ERROR
            // ------------------------------------------------

            if (
                response.status === 401
            ) {

                throw new Error(
                    "Authentication expired. Please login again."
                );
            }


            // ------------------------------------------------
            // OTHER ERROR
            // ------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Failed to load analytics data."
                );
            }


            // ------------------------------------------------
            // HISTORY
            // ------------------------------------------------

            setHistory(
                Array.isArray(
                    data.history
                )
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

    const analytics =
        useMemo(() => {

            const total =
                history.length;


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

                    mostCommonDiseaseCount:
                        0,

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
                            Number(
                                item.confidence
                            )
                    )
                    .filter(
                        (value) =>
                            Number.isFinite(
                                value
                            )
                    );


            const averageConfidence =
                confidenceValues.length > 0
                    ? confidenceValues.reduce(
                        (
                            sum,
                            value
                        ) =>
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
                (
                    (healthy / total) *
                    100
                );


            const diseasePercentage =
                (
                    (diseased / total) *
                    100
                );


            // ------------------------------------------------
            // DISEASE COUNTS
            // ------------------------------------------------

            const diseaseCounts = {};


            history.forEach(
                (item) => {

                    const prediction =
                        item.prediction ||
                        "Unknown";


                    diseaseCounts[
                        prediction
                    ] =
                        (
                            diseaseCounts[
                                prediction
                            ] || 0
                        ) + 1;
                }
            );


            // ------------------------------------------------
            // CROP COUNTS
            // ------------------------------------------------

            const cropCounts = {};


            history.forEach(
                (item) => {

                    const crop =
                        item.crop ||
                        "Unknown";


                    cropCounts[crop] =
                        (
                            cropCounts[crop] ||
                            0
                        ) + 1;
                }
            );


            // ------------------------------------------------
            // DISEASE ONLY
            // ------------------------------------------------

            const diseaseOnly =
                Object.entries(
                    diseaseCounts
                )
                    .filter(
                        ([name]) =>
                            !isHealthyPrediction(
                                name
                            )
                    )
                    .sort(
                        (
                            [, a],
                            [, b]
                        ) =>
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
                        📊
                    </div>

                    <h2>
                        Loading Analytics...
                    </h2>

                    <p>
                        AgriMind AI is loading your
                        detection insights.
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

                    <div className="state-icon">
                        ⚠️
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
                        🔄 Try Again
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
                            📊
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
                    {refreshing
                        ? "⏳ Refreshing..."
                        : "↻ Refresh"}
                </button>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="analytics-hero">

                <div className="hero-content">

                    <span>
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

                    <strong>
                        {analytics.healthyPercentage.toFixed(
                            1
                        )}%
                    </strong>

                    <span>
                        Healthy
                    </span>

                </div>

            </section>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="stat-grid">


                {/* TOTAL */}

                <div className="stat-card">

                    <div className="stat-icon green">
                        📊
                    </div>

                    <div>

                        <span>
                            Total Detections
                        </span>

                        <strong>
                            {analytics.total}
                        </strong>

                    </div>

                </div>


                {/* HEALTHY */}

                <div className="stat-card">

                    <div className="stat-icon light-green">
                        🌿
                    </div>

                    <div>

                        <span>
                            Healthy
                        </span>

                        <strong className="green-text">
                            {analytics.healthy}
                        </strong>

                    </div>

                </div>


                {/* DISEASE */}

                <div className="stat-card">

                    <div className="stat-icon red">
                        🦠
                    </div>

                    <div>

                        <span>
                            Disease Detected
                        </span>

                        <strong className="red-text">
                            {analytics.diseased}
                        </strong>

                    </div>

                </div>


                {/* CONFIDENCE */}

                <div className="stat-card">

                    <div className="stat-icon blue">
                        🎯
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

                                            {disease}

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


                {/* HEALTH */}

                <div className="analytics-card health-card">

                    <div className="card-header">

                        <div>

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
                                {analytics.healthyPercentage.toFixed(
                                    1
                                )}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                <i className="legend-red" />
                                Disease
                            </span>

                            <strong>
                                {analytics.diseasePercentage.toFixed(
                                    1
                                )}%
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
                    🔎
                </div>

                <div>

                    <span>
                        MOST FREQUENTLY DETECTED DISEASE
                    </span>

                    <h2>
                        {analytics.mostCommonDisease}
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
                DISEASE-WISE
            ================================================= */}

            <section className="analytics-card">

                <div className="card-header">

                    <div>

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
                                                    {disease}
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
                CROP-WISE
            ================================================= */}

            <section className="analytics-card">

                <div className="card-header">

                    <div>

                        <h2>
                            🌱 Crop-wise Analysis
                        </h2>

                        <p>
                            Detection distribution across
                            your crops.
                        </p>

                    </div>

                </div>


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

                                        <span>
                                            🌱
                                        </span>

                                        <strong>
                                            {crop}
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

                        <h2>
                            🎯 Confidence Analysis
                        </h2>

                        <p>
                            AI prediction confidence
                            distribution.
                        </p>

                    </div>

                </div>


                <div className="confidence-grid">


                    <div className="confidence-box high">

                        <span>
                            🟢
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

                        <span>
                            🟡
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

                        <span>
                            🔴
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
                        🤖 AI Crop Health Insights
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

                        <span>
                            HEALTH STATUS
                        </span>

                        <h3>
                            {analytics.diseased >
                            analytics.healthy

                                ? "⚠️ Attention Required"

                                : "✅ Overall Health Looks Good"}
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

                        <span>
                            FARMER ACTION
                        </span>

                        <h3>
                            🌱 Monitor Your Crops
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

                🤖 Analytics are generated from
                AgriMind AI detection history.

            </div>

        </div>
    );
}


// ============================================================
// CSS
// ============================================================

const styles = `

.analytics-page {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
    padding: 30px 34px 70px;
    color: #10261a;
}

.analytics-page * {
    box-sizing: border-box;
}

.analytics-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 25px;
    margin-bottom: 25px;
}

.eyebrow {
    display: inline-block;
    margin-bottom: 8px;
    color: #16a34a;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 2px;
}

.analytics-header h1 {
    margin: 0;
    font-size: 36px;
    font-weight: 900;
}

.analytics-header p {
    margin: 8px 0 0;
    color: #718096;
    font-size: 15px;
}

.refresh-button,
.primary-button {
    height: 44px;
    padding: 0 18px;
    border: 1px solid #16a34a;
    border-radius: 11px;
    background: #ffffff;
    color: #15803d;
    font-weight: 800;
    cursor: pointer;
}

.refresh-button:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.primary-button {
    background: #16a34a;
    color: #ffffff;
}

.analytics-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    min-height: 220px;
    padding: 35px 40px;
    margin-bottom: 22px;
    border-radius: 23px;
    color: #ffffff;
    background:
        linear-gradient(
            135deg,
            #087a3a,
            #16a34a,
            #22c55e
        );
    box-shadow:
        0 16px 38px
        rgba(21,128,61,.17);
}

.hero-content > span {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 2px;
}

.hero-content h2 {
    margin: 14px 0 10px;
    font-size: 34px;
    font-weight: 900;
}

.hero-content p {
    margin: 0;
    font-size: 16px;
}

.hero-score {
    width: 145px;
    height: 145px;
    flex-shrink: 0;
    border: 1px solid
        rgba(255,255,255,.35);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background:
        rgba(255,255,255,.08);
}

.hero-score strong {
    font-size: 30px;
}

.hero-score span {
    margin-top: 4px;
    font-size: 13px;
    font-weight: 800;
}

.stat-grid {
    display: grid;
    grid-template-columns:
        repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 22px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 22px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 17px;
    box-shadow:
        0 6px 20px
        rgba(0,0,0,.045);
}

.stat-card span {
    display: block;
    margin-bottom: 5px;
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
}

.stat-card strong {
    display: block;
    font-size: 28px;
    font-weight: 900;
}

.stat-icon {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    font-size: 26px;
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

.analytics-grid {
    display: grid;
    grid-template-columns:
        minmax(0, 1.55fr)
        minmax(300px, .75fr);
    gap: 22px;
    margin-bottom: 22px;
}

.analytics-card {
    padding: 25px;
    margin-bottom: 22px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    box-shadow:
        0 6px 22px
        rgba(0,0,0,.045);
}

.health-card {
    margin-bottom: 0;
}

.card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 24px;
}

.card-header h2 {
    margin: 0 0 7px;
    font-size: 22px;
}

.card-header p {
    margin: 0;
    color: #718096;
    font-size: 14px;
}

.result-count {
    padding: 8px 13px;
    border-radius: 999px;
    background: #ecfdf5;
    color: #15803d;
    font-size: 12px;
    font-weight: 800;
}

.distribution-row {
    margin-bottom: 22px;
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
    gap: 8px;
    font-weight: 700;
}

.distribution-top strong {
    font-size: 24px;
}

.bar {
    width: 100%;
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: #e9eef0;
}

.bar-fill {
    height: 100%;
    border-radius: 999px;
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
}

.green-dot,
.red-dot {
    width: 8px;
    height: 8px;
    display: inline-block;
    border-radius: 50%;
}

.green-dot {
    background: #22c55e;
}

.red-dot {
    background: #ef4444;
}

.health-circle {
    width: 190px;
    height: 190px;
    margin: 15px auto 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    background:
        conic-gradient(
            #22c55e
            calc(var(--healthy) * 1%),
            #fee2e2 0
        );

    position: relative;
}

.health-circle::before {
    content: "";
    position: absolute;
    width: 155px;
    height: 155px;
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
    font-size: 28px;
}

.health-circle span {
    color: #64748b;
    font-size: 13px;
}

.health-legend > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px;
    margin-top: 10px;
    border-radius: 12px;
    background: #f8fafc;
}

.health-legend span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
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
    font-size: 20px;
}

.highlight-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 27px;
    margin-bottom: 22px;
    border-radius: 19px;
    color: #ffffff;
    background:
        linear-gradient(
            135deg,
            #16a34a,
            #15803d
        );
    box-shadow:
        0 8px 25px
        rgba(21,128,61,.15);
}

.highlight-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 17px;
    background:
        rgba(255,255,255,.12);
    font-size: 30px;
}

.highlight-card span {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.7px;
}

.highlight-card h2 {
    margin: 7px 0;
    font-size: 27px;
}

.highlight-card p {
    margin: 0;
    opacity: .9;
}

.disease-grid {
    display: grid;
    grid-template-columns:
        repeat(2, minmax(0, 1fr));
    gap: 18px;
}

.disease-box,
.crop-box {
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #fbfdfc;
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
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.5px;
}

.disease-title h3 {
    margin: 5px 0 0;
    font-size: 16px;
}

.disease-title > strong {
    padding: 9px 13px;
    border-radius: 10px;
    background: #fef2f2;
    color: #dc2626;
}

.disease-box p,
.crop-box small {
    color: #718096;
    font-size: 12px;
}

.crop-grid {
    display: grid;
    grid-template-columns:
        repeat(
            auto-fit,
            minmax(220px, 1fr)
        );
    gap: 18px;
}

.crop-name {
    display: flex;
    align-items: center;
    gap: 9px;
}

.crop-name span {
    font-size: 24px;
}

.crop-name strong {
    font-size: 18px;
    text-transform: capitalize;
}

.crop-box > b {
    display: block;
    margin: 12px 0;
    font-size: 28px;
}

.confidence-grid {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 18px;
}

.confidence-box {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    border-radius: 14px;
}

.confidence-box > span {
    font-size: 28px;
}

.confidence-box small {
    display: block;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
}

.confidence-box strong {
    display: block;
    margin: 5px 0;
    font-size: 28px;
}

.confidence-box p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
}

.confidence-box.high {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
}

.confidence-box.medium {
    background: #fffbeb;
    border: 1px solid #fde68a;
}

.confidence-box.low {
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.ai-insights {
    padding: 28px;
    margin-bottom: 22px;
    border: 1px solid #bbf7d0;
    border-radius: 20px;
    background:
        linear-gradient(
            135deg,
            #f0fdf4,
            #ffffff
        );
}

.insight-heading > span {
    color: #16a34a;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 2px;
}

.insight-heading h2 {
    margin: 6px 0 8px;
    font-size: 24px;
}

.insight-heading p {
    margin: 0 0 24px;
    color: #64748b;
}

.insight-grid {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 18px;
}

.insight-item {
    padding: 20px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
}

.insight-item > span {
    color: #94a3b8;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.3px;
}

.insight-item h3 {
    margin: 10px 0;
    font-size: 18px;
}

.insight-item p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.7;
}

.analytics-note {
    padding: 17px;
    text-align: center;
    border-radius: 12px;
    color: #64748b;
    background: #f8fafc;
    font-size: 13px;
}

.analytics-state {
    min-height: 60vh;
    padding: 60px 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.state-icon {
    margin-bottom: 12px;
    font-size: 55px;
}

.analytics-state h2 {
    margin: 0 0 8px;
}

.analytics-state p {
    max-width: 600px;
    color: #64748b;
    line-height: 1.6;
}

@media (max-width: 1100px) {

    .stat-grid {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }

    .analytics-grid {
        grid-template-columns: 1fr;
    }

}

@media (max-width: 850px) {

    .analytics-page {
        padding:
            25px 20px 55px;
    }

    .analytics-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .analytics-hero {
        align-items: flex-start;
        flex-direction: column;
        padding: 30px;
    }

    .disease-grid,
    .confidence-grid,
    .insight-grid {
        grid-template-columns: 1fr;
    }

}

@media (max-width: 600px) {

    .stat-grid {
        grid-template-columns: 1fr;
    }

    .analytics-header h1 {
        font-size: 30px;
    }

    .analytics-hero {
        padding: 25px;
    }

    .hero-content h2 {
        font-size: 27px;
    }

    .analytics-card,
    .ai-insights {
        padding: 20px;
    }

    .highlight-card {
        align-items: flex-start;
        flex-direction: column;
    }

}
`;

export default Analytics;