import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function Analytics() {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // FETCH HISTORY
    // =========================================================

    const fetchHistory = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/history`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
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

        }
    };


    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {

        fetchHistory();

    }, []);


    // =========================================================
    // PARSE PROBABILITIES
    // =========================================================

    const getProbabilities = (probabilities) => {

        if (!probabilities) {
            return {};
        }

        if (
            typeof probabilities === "object" &&
            !Array.isArray(probabilities)
        ) {
            return probabilities;
        }

        try {

            return JSON.parse(probabilities);

        } catch {

            return {};

        }
    };


    // =========================================================
    // HEALTHY CLASS CHECK
    // =========================================================

    const isHealthyPrediction = (prediction) => {

        const value = String(prediction || "")
            .toLowerCase()
            .trim();

        return (
            value === "healthy" ||
            value === "healthy leaf"
        );
    };


    // =========================================================
    // ANALYTICS CALCULATION
    // =========================================================

    const analytics = useMemo(() => {

        const total = history.length;

        if (total === 0) {

            return {
                total: 0,
                healthy: 0,
                diseased: 0,
                averageConfidence: 0,
                mostCommonDisease: "N/A",
                diseaseCounts: {},
            };

        }


        // -----------------------------------------------------
        // HEALTHY COUNT
        // -----------------------------------------------------

      const healthy = history.filter(
      item => isHealthyPrediction(item.prediction)
      ).length;

        // -----------------------------------------------------
        // DISEASE COUNT
        // -----------------------------------------------------

        const diseased =
            total - healthy;


        // -----------------------------------------------------
        // AVERAGE CONFIDENCE
        // -----------------------------------------------------

        const confidenceValues =
            history
                .map(item =>
                    Number(item.confidence)
                )
                .filter(value =>
                    Number.isFinite(value)
                );


        const averageConfidence =
            confidenceValues.length > 0
                ? confidenceValues.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / confidenceValues.length
                : 0;


        // -----------------------------------------------------
        // DISEASE COUNTS
        // -----------------------------------------------------

        const diseaseCounts = {};

        history.forEach(item => {

            const disease =
                item.prediction ||
                "Unknown";

            diseaseCounts[disease] =
                (diseaseCounts[disease] || 0) + 1;

        });


        // -----------------------------------------------------
        // MOST FREQUENTLY DETECTED DISEASE
        // -----------------------------------------------------
        // Healthy is excluded here because this section
        // should show the most frequently detected disease.

        const diseaseOnlyCounts = Object.entries(
        diseaseCounts
        ).filter(
        ([disease]) =>
            !isHealthyPrediction(disease)
    )


        const sortedDiseases =
            diseaseOnlyCounts.sort(
                ([, a], [, b]) =>
                    b - a
            );


        const mostCommonDisease =
            sortedDiseases.length > 0
                ? sortedDiseases[0][0]
                : "No disease detected";


        const mostCommonDiseaseCount =
            sortedDiseases.length > 0
                ? sortedDiseases[0][1]
                : 0;


       return {

        total,

        healthy,

        diseased,

        averageConfidence,

        mostCommonDisease,

        mostCommonDiseaseCount,

        diseaseCounts,

    };

    }, [history]);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="page">

                <div className="page-title">

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        Analyze your crop disease
                        detection results.
                    </p>

                </div>


                <div
                    className="history-empty"
                    style={{
                        textAlign: "center",
                        padding: "60px",
                    }}
                >

                    <div
                        style={{
                            fontSize: "50px",
                        }}
                    >
                        📊
                    </div>

                    <h2>
                        Loading Analytics...
                    </h2>

                    <p>
                        Please wait while we
                        calculate your analytics.
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (
            <div className="page">

                <div className="page-title">

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        Analyze your crop disease
                        detection results.
                    </p>

                </div>


                <div
                    className="history-empty"
                    style={{
                        textAlign: "center",
                        padding: "60px",
                    }}
                >

                    <div
                        style={{
                            fontSize: "50px",
                        }}
                    >
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Analytics
                    </h2>

                    <p>
                        {error}
                    </p>


                    <button
                        onClick={fetchHistory}
                        style={{
                            marginTop: "18px",
                            padding: "11px 22px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#16a34a",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontWeight: "700",
                        }}
                    >
                        🔄 Try Again
                    </button>

                </div>

            </div>
        );
    }


    // =========================================================
    // EMPTY DATA
    // =========================================================

    if (history.length === 0) {

        return (
            <div className="page">

                <div className="page-title">

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        Analyze your crop disease
                        detection results.
                    </p>

                </div>


                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "60px",
                        textAlign: "center",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.08)",
                    }}
                >

                    <div
                        style={{
                            fontSize: "55px",
                        }}
                    >
                        📊
                    </div>

                    <h2>
                        No Analytics Available
                    </h2>

                    <p
                        style={{
                            color: "#6b7280",
                        }}
                    >
                        Perform some disease detections
                        first to see analytics.
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // MAIN ANALYTICS UI
    // =========================================================

    return (
        <div className="page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="page-title"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                }}
            >

                <div>

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        AI-powered insights from your
                        crop disease detections.
                    </p>

                </div>


                <button
                    onClick={fetchHistory}
                    style={{
                        padding: "10px 18px",
                        border: "1px solid #16a34a",
                        borderRadius: "8px",
                        background: "#ffffff",
                        color: "#15803d",
                        cursor: "pointer",
                        fontWeight: "700",
                    }}
                >
                    🔄 Refresh Analytics
                </button>

            </div>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "25px",
                }}
            >

                {/* TOTAL */}

                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "22px",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.08)",
                        border:
                            "1px solid #e5e7eb",
                    }}
                >

                    <div
                        style={{
                            fontSize: "32px",
                        }}
                    >
                        📊
                    </div>

                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "5px",
                        }}
                    >
                        Total Detections
                    </p>

                    <h2
                        style={{
                            margin: 0,
                            fontSize: "32px",
                        }}
                    >
                        {analytics.total}
                    </h2>

                </div>


                {/* HEALTHY */}

                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "22px",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.08)",
                        border:
                            "1px solid #bbf7d0",
                    }}
                >

                    <div
                        style={{
                            fontSize: "32px",
                        }}
                    >
                        🌿
                    </div>

                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "5px",
                        }}
                    >
                        Healthy
                    </p>

                    <h2
                        style={{
                            margin: 0,
                            color: "#15803d",
                            fontSize: "32px",
                        }}
                    >
                        {analytics.healthy}
                    </h2>

                </div>


                {/* DISEASE */}

                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "22px",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.08)",
                        border:
                            "1px solid #fecaca",
                    }}
                >

                    <div
                        style={{
                            fontSize: "32px",
                        }}
                    >
                        🦠
                    </div>

                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "5px",
                        }}
                    >
                        Disease Detected
                    </p>

                    <h2
                        style={{
                            margin: 0,
                            color: "#dc2626",
                            fontSize: "32px",
                        }}
                    >
                        {analytics.diseased}
                    </h2>

                </div>


                {/* CONFIDENCE */}

                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "22px",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.08)",
                        border:
                            "1px solid #bfdbfe",
                    }}
                >

                    <div
                        style={{
                            fontSize: "32px",
                        }}
                    >
                        🎯
                    </div>

                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "5px",
                        }}
                    >
                        Average Confidence
                    </p>

                    <h2
                        style={{
                            margin: 0,
                            color: "#2563eb",
                            fontSize: "32px",
                        }}
                    >
                        {analytics.averageConfidence.toFixed(
                            2
                        )}
                        %
                    </h2>

                </div>

            </div>


            {/* =================================================
                MOST COMMON DISEASE
            ================================================= */}

            <div
                style={{
                    background:
                        "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#ffffff",
                    borderRadius: "16px",
                    padding: "25px",
                    marginBottom: "25px",
                    boxShadow:
                        "0 5px 18px rgba(0,0,0,0.10)",
                }}
            >

                <p
                    style={{
                        margin: 0,
                        opacity: 0.9,
                    }}
                >
                    🔎 Most Frequently Detected Disease
                </p>

                <h2
                    style={{
                        margin:
                            "8px 0 0 0",
                        fontSize: "28px",
                    }}
                >
                    {analytics.mostCommonDisease}
                </h2>

            </div>


            {/* =================================================
                DISEASE DISTRIBUTION
            ================================================= */}

            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "25px",
                    boxShadow:
                        "0 4px 18px rgba(0,0,0,0.08)",
                    marginBottom: "25px",
                }}
            >

                <h2
                    style={{
                        marginTop: 0,
                    }}
                >
                    📈 Detection Distribution
                </h2>

                <p
                    style={{
                        color: "#6b7280",
                    }}
                >
                    Distribution of detected classes
                    across all AI predictions.
                </p>


                {Object.entries(
                    analytics.diseaseCounts
                )
                    .sort(
                        ([, a], [, b]) =>
                            b - a
                    )
                    .map(
                        (
                            [
                                disease,
                                count,
                            ]
                        ) => {

                            const percentage =
                                (
                                    count /
                                    analytics.total
                                ) * 100;

                            return (

                                <div
                                    key={disease}
                                    style={{
                                        marginBottom:
                                            "20px",
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            gap: "10px",
                                            marginBottom:
                                                "7px",
                                        }}
                                    >

                                        <strong>
                                            {disease}
                                        </strong>

                                        <span>
                                            {count} (
                                            {percentage.toFixed(
                                                1
                                            )}
                                            %)
                                        </span>

                                    </div>


                                    <div
                                        style={{
                                            width:
                                                "100%",
                                            height:
                                                "14px",
                                            background:
                                                "#e5e7eb",
                                            borderRadius:
                                                "10px",
                                            overflow:
                                                "hidden",
                                        }}
                                    >

                                        <div
                                            style={{
                                                width:
                                                    `${percentage}%`,
                                                height:
                                                    "100%",
                                                background:
                                                    "#16a34a",
                                                borderRadius:
                                                    "10px",
                                                transition:
                                                    "width 0.5s ease",
                                            }}
                                        />

                                    </div>

                                </div>

                            );
                        }
                    )}

            </div>
           {/* =================================================
    DISEASE-WISE ANALYSIS
================================================= */}

<div
    style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "25px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        marginBottom: "25px",
    }}
>

    <h2
        style={{
            marginTop: 0,
            marginBottom: "8px",
        }}
    >
        🦠 Disease-wise Analysis
    </h2>

    <p
        style={{
            color: "#6b7280",
            marginBottom: "22px",
        }}
    >
      Summary of disease detections across the stored
      crop analysis history.
    </p>


 {Object.entries(analytics.diseaseCounts)
    .filter(
        ([disease]) =>
            !isHealthyPrediction(disease)
    )
    .sort(
        ([, a], [, b]) => b - a
    )
        .map(
            ([disease, count]) => {

                // Disease-wise percentage is calculated
                // only among disease detections, not healthy results.
                const percentage =
                    analytics.diseased > 0
                        ? (count / analytics.diseased) * 100
                        : 0;

                return (
                    <div
                        key={disease}
                        style={{
                            marginBottom: "22px",
                        }}
                    >

                        {/* Disease name + count */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                                gap: "10px",
                            }}
                        >

                            <strong
                                style={{
                                    fontSize: "16px",
                                }}
                            >
                                {disease}
                            </strong>

                            <span
                                style={{
                                    fontWeight: "600",
                                    color: "#374151",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {count} detection
                                {count !== 1 ? "s" : ""} (
                                {percentage.toFixed(1)}%)
                            </span>

                        </div>


                        {/* Progress bar */}

                        <div
                            style={{
                                width: "100%",
                                height: "12px",
                                background: "#e5e7eb",
                                borderRadius: "10px",
                                overflow: "hidden",
                            }}
                        >

                            <div
                                style={{
                                    width: `${percentage}%`,
                                    height: "100%",
                                    background:
                                        "linear-gradient(90deg, #16a34a, #22c55e)",
                                    borderRadius: "10px",
                                    transition:
                                        "width 0.5s ease",
                                }}
                            />

                        </div>

                    </div>
                );
            }
        )}

</div>

            {/* =================================================
                HEALTH STATUS
            ================================================= */}

            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "25px",
                    boxShadow:
                        "0 4px 18px rgba(0,0,0,0.08)",
                    marginBottom: "25px",
                }}
            >

                <h2
                    style={{
                        marginTop: 0,
                    }}
                >
                    🌱 Crop Health Overview
                </h2>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                    }}
                >

                    {/* HEALTHY */}

                    <div
                        style={{
                            background: "#f0fdf4",
                            border:
                                "1px solid #bbf7d0",
                            borderRadius: "12px",
                            padding: "20px",
                        }}
                    >

                        <p
                            style={{
                                margin:
                                    "0 0 8px 0",
                                color:
                                    "#166534",
                            }}
                        >
                            Healthy Percentage
                        </p>

                        <h2
                            style={{
                                margin: 0,
                                color:
                                    "#15803d",
                            }}
                        >
                            {(
                                (
                                    analytics.healthy /
                                    analytics.total
                                ) * 100
                            ).toFixed(1)}
                            %
                        </h2>

                    </div>


                    {/* DISEASE */}

                    <div
                        style={{
                            background: "#fef2f2",
                            border:
                                "1px solid #fecaca",
                            borderRadius: "12px",
                            padding: "20px",
                        }}
                    >

                        <p
                            style={{
                                margin:
                                    "0 0 8px 0",
                                color:
                                    "#991b1b",
                            }}
                        >
                            Disease Percentage
                        </p>

                        <h2
                            style={{
                                margin: 0,
                                color:
                                    "#dc2626",
                            }}
                        >
                            {(
                                (
                                    analytics.diseased /
                                    analytics.total
                                ) * 100
                            ).toFixed(1)}
                            %
                        </h2>

                    </div>

                </div>

            </div>
          
                       {/* =================================================
                AI CROP HEALTH INSIGHTS
            ================================================= */}

            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "25px",
                    boxShadow:
                        "0 4px 18px rgba(0,0,0,0.08)",
                    marginBottom: "25px",
                    border: "1px solid #e5e7eb",
                }}
            >

                <h2
                    style={{
                        marginTop: 0,
                        marginBottom: "8px",
                    }}
                >
                    🤖 AI Crop Health Insights
                </h2>

                <p
                    style={{
                        color: "#64748b",
                        marginBottom: "22px",
                    }}
                >
                   AgriMind AI summarizes the current
                   detection history to help understand
                   overall crop health.
                </p>


                {/* OVERALL STATUS */}

                <div
                    style={{
                        padding: "18px",
                        borderRadius: "14px",
                        background:
                            analytics.diseased > analytics.healthy
                                ? "#fff7ed"
                                : "#f0fdf4",
                        border:
                            analytics.diseased > analytics.healthy
                                ? "1px solid #fed7aa"
                                : "1px solid #bbf7d0",
                        marginBottom: "20px",
                    }}
                >

                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom: "8px",
                        }}
                    >
                        {analytics.diseased > analytics.healthy
                            ? "⚠️ Attention Required"
                            : "✅ Overall Crop Health Looks Good"}
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            lineHeight: "1.7",
                            color: "#475569",
                        }}
                    >
                        {analytics.total} detection
                        {analytics.total !== 1 ? "s" : ""} analyzed.
                        {" "}
                        {analytics.healthy} detection
                        {analytics.healthy !== 1 ? "s" : ""} were
                        classified as healthy, while{" "}
                        {analytics.diseased} detection
                        {analytics.diseased !== 1 ? "s" : ""} showed
                        disease-related conditions.
                    </p>

                </div>


                {/* MOST COMMON RESULT */}

                <div
                    style={{
                        marginBottom: "20px",
                    }}
                >

                    <h3>
                       🔎 Most Frequently Detected Disease
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: "#334155",
                            lineHeight: "1.7",
                        }}
                    >
                        The most frequently detected disease is{" "}
                        <strong>
                            {analytics.mostCommonDisease}
                        </strong>.
                    </p>

                </div>


                {/* DISEASE ATTENTION */}

                <div
                    style={{
                        marginBottom: "20px",
                    }}
                >

                    <h3>
                        ⚠️ Disease Attention
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: "#334155",
                            lineHeight: "1.7",
                        }}
                    >
                        {analytics.diseased > 0
                            ? `${analytics.diseased} detection${analytics.diseased !== 1 ? "s" : ""} were classified as disease-related. Farmers should inspect affected plants and monitor nearby plants for similar symptoms.`
                            : "No disease-related detections are currently present in the history."}
                    </p>

                </div>


                {/* CONFIDENCE INSIGHT */}

                <div
                    style={{
                        marginBottom: "20px",
                    }}
                >

                    <h3>
                        🎯 Model Confidence
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: "#334155",
                            lineHeight: "1.7",
                        }}
                    >
                        The average AI prediction confidence
                        across the stored detection history is{" "}
                        <strong>
                            {analytics.averageConfidence.toFixed(2)}%
                        </strong>.
                        {" "}
                        Results should still be verified using
                        crop symptoms and local agricultural guidance.
                    </p>

                </div>


                {/* FARMER ACTION */}

                <div
                    style={{
                        padding: "18px",
                        borderRadius: "14px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                    }}
                >

                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom: "8px",
                        }}
                    >
                        👨‍🌾 Farmer Action
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: "#166534",
                            lineHeight: "1.7",
                        }}
                    >
                      Regularly inspect crop plants,
                      monitor areas showing disease symptoms,
                      and consult a local agriculture expert
                      before applying chemical treatment.
                    </p>

                </div>

            </div>

            {/* =================================================
                FOOTER NOTE
            ================================================= */}

            <div
                style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "18px",
                    color: "#64748b",
                    textAlign: "center",
                }}
            >

                🤖 Analytics are generated from
                AgriMind AI detection history.

            </div>

        </div>
    );
}

export default Analytics;