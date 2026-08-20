import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Selected detection for detailed view
    const [selectedDetection, setSelectedDetection] = useState(null);

    // =========================================================
    // FETCH HISTORY
    // =========================================================

    const fetchHistory = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(
                `${API_BASE_URL}/history`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to load detection history."
                );
            }

            setHistory(
                Array.isArray(data.history)
                    ? data.history.map(normalizeHistoryItem)
                    : []
            );

        } catch (err) {
            console.error(
                "History fetch error:",
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
    // LOAD HISTORY
    // =========================================================

    useEffect(() => {
        fetchHistory();
    }, []);

    // =========================================================
    // CLEAR HISTORY
    // =========================================================

    const handleClearHistory = async () => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete all detection history?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            setError("");

            const response = await fetch(
                `${API_BASE_URL}/history`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to clear history."
                );
            }

            setHistory([]);

        } catch (err) {

            console.error(
                "Clear history error:",
                err
            );

            setError(
                err.message ||
                "Unable to clear history."
            );
        }
    };

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
    // PARSE JSON ARRAY
    // =========================================================

    const getJsonArray = (value) => {

        if (Array.isArray(value)) {
            return value;
        }

        if (!value) {
            return [];
        }

        try {
            const parsed = JSON.parse(value);

            return Array.isArray(parsed)
                ? parsed
                : [];
        } catch {
            return [];
        }
    };

    // =========================================================
    // NORMALIZE HISTORY ITEM
    // =========================================================

    const normalizeHistoryItem = (item) => {
        const recommendation =
            item.recommendation &&
            typeof item.recommendation === "object"
                ? item.recommendation
                : {
                    severity: item.severity,
                    symptoms: getJsonArray(item.symptoms),
                    immediate_action: getJsonArray(item.immediate_action),
                    treatment: getJsonArray(item.treatment),
                    spray_guidance: getJsonArray(item.spray_guidance),
                    prevention: getJsonArray(item.prevention),
                    farmer_action: item.farmer_action,
                };

        return {
            ...item,
            recommendation,
        };
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "Unknown date";
        }

        try {

            const date = new Date(dateValue);

            if (Number.isNaN(date.getTime())) {
                return String(dateValue);
            }

            return date.toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short",
                }
            );

        } catch {

            return String(dateValue);
        }
    };

    // =========================================================
    // CONFIDENCE STYLE
    // =========================================================

    const getConfidenceColor = (confidence) => {

        const value = Number(confidence);

        if (value >= 80) {
            return {
                background: "#dcfce7",
                color: "#166534",
            };
        }

        if (value >= 60) {
            return {
                background: "#fef9c3",
                color: "#854d0e",
            };
        }

        return {
            background: "#fee2e2",
            color: "#991b1b",
        };
    };

    // =========================================================
    // OPEN DETAILS
    // =========================================================

    const handleViewDetails = (item) => {
        setSelectedDetection(item);
    };

    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    const handleCloseDetails = () => {
        setSelectedDetection(null);
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="page">

                <div className="page-title">
                    <h1>
                        Detection History
                    </h1>

                    <p>
                        View your previous crop disease
                        detection results.
                    </p>
                </div>

                <div className="history-empty">

                    <div
                        style={{
                            fontSize: "45px",
                            marginBottom: "10px",
                        }}
                    >
                        ⏳
                    </div>

                    <h2>
                        Loading History...
                    </h2>

                    <p>
                        Please wait while we load your
                        previous AI detection results.
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error && history.length === 0) {

        return (
            <div className="page">

                <div className="page-title">

                    <h1>
                        Detection History
                    </h1>

                    <p>
                        View your previous crop disease
                        detection results.
                    </p>

                </div>

                <div className="history-empty">

                    <div
                        style={{
                            fontSize: "45px",
                            marginBottom: "10px",
                        }}
                    >
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load History
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            fetchHistory()
                        }
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
    // MAIN UI
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
                    gap: "20px",
                    flexWrap: "wrap",
                }}
            >

                <div>

                    <h1>
                        Detection History
                    </h1>

                    <p>
                        View your previous crop disease
                        detection results.
                    </p>

                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >

                    {/* REFRESH */}

                    <button
                        onClick={() =>
                            fetchHistory(true)
                        }
                        disabled={refreshing}
                        style={{
                            padding: "10px 18px",
                            border: "1px solid #16a34a",
                            borderRadius: "8px",
                            background: "#ffffff",
                            color: "#15803d",
                            cursor: refreshing
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "700",
                        }}
                    >
                        {refreshing
                            ? "⏳ Refreshing..."
                            : "🔄 Refresh"}
                    </button>

                    {/* CLEAR */}

                    {history.length > 0 && (

                        <button
                            onClick={
                                handleClearHistory
                            }
                            style={{
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: "8px",
                                background: "#dc2626",
                                color: "#ffffff",
                                cursor: "pointer",
                                fontWeight: "700",
                            }}
                        >
                            🗑️ Clear History
                        </button>

                    )}

                </div>

            </div>

            {/* =================================================
                ERROR BANNER
            ================================================= */}

            {error && history.length > 0 && (

                <div
                    style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                    }}
                >
                    ⚠️ {error}
                </div>

            )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            {history.length > 0 && (

                <div
                    style={{
                        background:
                            "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#ffffff",
                        borderRadius: "16px",
                        padding: "24px",
                        marginBottom: "25px",
                        boxShadow:
                            "0 5px 18px rgba(0,0,0,0.10)",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            gap: "15px",
                            flexWrap: "wrap",
                        }}
                    >

                        <div>

                            <p
                                style={{
                                    margin: 0,
                                    opacity: 0.9,
                                }}
                            >
                                Total AI Detections
                            </p>

                            <h2
                                style={{
                                    margin:
                                        "5px 0 0 0",
                                    fontSize: "34px",
                                }}
                            >
                                {history.length}
                            </h2>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0 0",
                                    opacity: 0.85,
                                }}
                            >
                                Previous AI analysis
                                records
                            </p>

                        </div>

                        <div
                            style={{
                                fontSize: "48px",
                            }}
                        >
                            📊
                        </div>

                    </div>

                </div>

            )}

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {history.length === 0 ? (

                <div className="history-empty">

                    <div
                        style={{
                            fontSize: "50px",
                            marginBottom: "10px",
                        }}
                    >
                        🕘
                    </div>

                    <h2>
                        No Detection History
                    </h2>

                    <p>
                        Your previous AI detection
                        results will appear here.
                    </p>

                </div>

            ) : (

                /* =================================================
                   HISTORY CARDS
                ================================================= */

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                    }}
                >

                    {history.map((item) => {

                        const probabilities =
                            getProbabilities(
                                item.probabilities
                            );

                        const confidenceStyle =
                            getConfidenceColor(
                                item.confidence
                            );

                        return (

                            <div
                                key={item.id}
                                style={{
                                    background:
                                        "#ffffff",
                                    borderRadius:
                                        "16px",
                                    padding:
                                        "24px",
                                    boxShadow:
                                        "0 4px 18px rgba(0,0,0,0.08)",
                                    border:
                                        "1px solid #e5e7eb",
                                }}
                            >

                                {/* ==========================
                                    CARD HEADER
                                ========================== */}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        gap: "15px",
                                        flexWrap:
                                            "wrap",
                                        marginBottom:
                                            "20px",
                                    }}
                                >

                                    <div>

                                        <h2
                                            style={{
                                                margin:
                                                    "0 0 6px 0",
                                            }}
                                        >
                                            🧠 AI Detection
                                            Result
                                        </h2>

                                        <p
                                            style={{
                                                margin: 0,
                                                color:
                                                    "#6b7280",
                                            }}
                                        >
                                            📅{" "}
                                            {formatDate(
                                                item.created_at
                                            )}
                                        </p>

                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "7px 14px",
                                            background:
                                                "#f0fdf4",
                                            color:
                                                "#166534",
                                            borderRadius:
                                                "20px",
                                            fontWeight:
                                                "700",
                                        }}
                                    >
                                        #{item.id}
                                    </div>

                                </div>

                                {/* ==========================
                                    RESULT
                                ========================== */}

                                <div
                                    style={{
                                        background:
                                            "#f0fdf4",
                                        border:
                                            "1px solid #bbf7d0",
                                        borderRadius:
                                            "12px",
                                        padding:
                                            "20px",
                                        marginBottom:
                                            "20px",
                                    }}
                                >

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(auto-fit, minmax(220px, 1fr))",
                                            gap: "20px",
                                        }}
                                    >

                                        {/* CROP */}

                                        <div>

                                            <p
                                                style={{
                                                    margin:
                                                        "0 0 5px 0",
                                                    color:
                                                        "#6b7280",
                                                }}
                                            >
                                                🌱 Crop
                                            </p>

                                            <strong
                                                style={{
                                                    fontSize:
                                                        "19px",
                                                }}
                                            >
                                                {item.crop ||
                                                    "Soybean"}
                                            </strong>

                                        </div>

                                        {/* PREDICTION */}

                                        <div>

                                            <p
                                                style={{
                                                    margin:
                                                        "0 0 5px 0",
                                                    color:
                                                        "#6b7280",
                                                }}
                                            >
                                                🦠 Prediction
                                            </p>

                                            <strong
                                                style={{
                                                    fontSize:
                                                        "19px",
                                                    color:
                                                        "#15803d",
                                                }}
                                            >
                                                {item.prediction ||
                                                    "Unknown"}
                                            </strong>

                                        </div>

                                        {/* CONFIDENCE */}

                                        <div>

                                            <p
                                                style={{
                                                    margin:
                                                        "0 0 5px 0",
                                                    color:
                                                        "#6b7280",
                                                }}
                                            >
                                                🎯 Confidence
                                            </p>

                                            <span
                                                style={{
                                                    display:
                                                        "inline-block",
                                                    padding:
                                                        "6px 12px",
                                                    borderRadius:
                                                        "20px",
                                                    fontWeight:
                                                        "700",
                                                    ...confidenceStyle,
                                                }}
                                            >
                                                {Number(
                                                    item.confidence
                                                ).toFixed(2)}
                                                %
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                {/* ==========================
                                    ACTION BUTTONS
                                ========================== */}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "flex-end",
                                        gap: "10px",
                                    }}
                                >

                                    <button
                                        onClick={() =>
                                            handleViewDetails(
                                                item
                                            )
                                        }
                                        style={{
                                            padding:
                                                "10px 18px",
                                            border: "none",
                                            borderRadius:
                                                "8px",
                                            background:
                                                "#15803d",
                                            color:
                                                "#ffffff",
                                            cursor:
                                                "pointer",
                                            fontWeight:
                                                "700",
                                        }}
                                    >
                                        🔍 View Details
                                    </button>

                                </div>

                                {/* ==========================
                                    PROBABILITIES
                                ========================== */}

                                {Object.keys(
                                    probabilities
                                ).length > 0 && (

                                    <div
                                        style={{
                                            marginTop:
                                                "25px",
                                        }}
                                    >

                                        <h3
                                            style={{
                                                margin:
                                                    "0 0 18px 0",
                                            }}
                                        >
                                            📊 Class
                                            Probabilities
                                        </h3>

                                        {Object.entries(
                                            probabilities
                                        )
                                            .sort(
                                                (
                                                    [, a],
                                                    [, b]
                                                ) =>
                                                    Number(b) -
                                                    Number(a)
                                            )
                                            .map(
                                                (
                                                    [
                                                        disease,
                                                        probability,
                                                    ]
                                                ) => {

                                                    const value =
                                                        Number(
                                                            probability
                                                        );

                                                    return (

                                                        <div
                                                            key={
                                                                disease
                                                            }
                                                            style={{
                                                                marginBottom:
                                                                    "16px",
                                                            }}
                                                        >

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    justifyContent:
                                                                        "space-between",
                                                                    gap:
                                                                        "10px",
                                                                    marginBottom:
                                                                        "7px",
                                                                }}
                                                            >

                                                                <span
                                                                    style={{
                                                                        fontWeight:
                                                                            "600",
                                                                    }}
                                                                >
                                                                    {
                                                                        disease
                                                                    }
                                                                </span>

                                                                <strong>
                                                                    {value.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </strong>

                                                            </div>

                                                            <div
                                                                style={{
                                                                    width:
                                                                        "100%",
                                                                    height:
                                                                        "10px",
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
                                                                            `${Math.min(
                                                                                Math.max(
                                                                                    value,
                                                                                    0
                                                                                ),
                                                                                100
                                                                            )}%`,
                                                                        height:
                                                                            "100%",
                                                                        background:
                                                                            "#16a34a",
                                                                        borderRadius:
                                                                            "10px",
                                                                        transition:
                                                                            "width 0.4s ease",
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    );
                                                }
                                            )}

                                    </div>

                                )}

                            </div>

                        );
                    })}

                </div>

            )}

            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {selectedDetection && (

                <div
                    onClick={handleCloseDetails}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(0,0,0,0.55)",
                        display: "flex",
                        justifyContent:
                            "center",
                        alignItems:
                            "center",
                        padding: "20px",
                        zIndex: 9999,
                    }}
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        style={{
                            width: "100%",
                            maxWidth: "850px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background:
                                "#ffffff",
                            borderRadius:
                                "18px",
                            padding:
                                "28px",
                            boxShadow:
                                "0 20px 50px rgba(0,0,0,0.25)",
                        }}
                    >

                        {/* MODAL HEADER */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                gap: "15px",
                                marginBottom:
                                    "22px",
                            }}
                        >

                            <div>

                                <h2
                                    style={{
                                        margin:
                                            "0 0 5px 0",
                                    }}
                                >
                                    🧠 AI Detection Details
                                </h2>

                                <p
                                    style={{
                                        margin: 0,
                                        color:
                                            "#6b7280",
                                    }}
                                >
                                    Detection #
                                    {selectedDetection.id}
                                </p>

                            </div>

                            <button
                                onClick={
                                    handleCloseDetails
                                }
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    border: "none",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#f3f4f6",
                                    cursor:
                                        "pointer",
                                    fontSize:
                                        "20px",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                ×
                            </button>

                        </div>

                        {/* BASIC DETAILS */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "15px",
                                marginBottom:
                                    "22px",
                            }}
                        >

                            <div
                                style={{
                                    background:
                                        "#f8fafc",
                                    borderRadius:
                                        "12px",
                                    padding:
                                        "18px",
                                }}
                            >

                                <p
                                    style={{
                                        margin:
                                            "0 0 6px 0",
                                        color:
                                            "#6b7280",
                                    }}
                                >
                                    🌱 Crop
                                </p>

                                <strong
                                    style={{
                                        fontSize:
                                            "20px",
                                    }}
                                >
                                    {selectedDetection.crop ||
                                        "Soybean"}
                                </strong>

                            </div>

                            <div
                                style={{
                                    background:
                                        "#fff7ed",
                                    borderRadius:
                                        "12px",
                                    padding:
                                        "18px",
                                }}
                            >

                                <p
                                    style={{
                                        margin:
                                            "0 0 6px 0",
                                        color:
                                            "#6b7280",
                                    }}
                                >
                                    🦠 Disease
                                </p>

                                <strong
                                    style={{
                                        fontSize:
                                            "20px",
                                        color:
                                            "#c2410c",
                                    }}
                                >
                                    {selectedDetection.prediction ||
                                        "Unknown"}
                                </strong>

                            </div>

                            <div
                                style={{
                                    background:
                                        "#eff6ff",
                                    borderRadius:
                                        "12px",
                                    padding:
                                        "18px",
                                }}
                            >

                                <p
                                    style={{
                                        margin:
                                            "0 0 6px 0",
                                        color:
                                            "#6b7280",
                                    }}
                                >
                                    🎯 Confidence
                                </p>

                                <strong
                                    style={{
                                        fontSize:
                                            "20px",
                                        color:
                                            "#2563eb",
                                    }}
                                >
                                    {Number(
                                        selectedDetection.confidence
                                    ).toFixed(2)}
                                    %
                                </strong>

                            </div>

                        </div>

                        {/* DATE */}

                        <div
                            style={{
                                background:
                                    "#f0fdf4",
                                border:
                                    "1px solid #bbf7d0",
                                borderRadius:
                                    "12px",
                                padding:
                                    "16px",
                                marginBottom:
                                    "22px",
                            }}
                        >

                            <strong>
                                📅 Detection Date
                            </strong>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0 0",
                                    color:
                                        "#166534",
                                }}
                            >
                                {formatDate(
                                    selectedDetection.created_at
                                )}
                            </p>

                        </div>

                        {/* PROBABILITIES */}

                        {Object.keys(
                            getProbabilities(
                                selectedDetection.probabilities
                            )
                        ).length > 0 && (

                            <div>

                                <h3
                                    style={{
                                        margin:
                                            "0 0 18px 0",
                                    }}
                                >
                                    📊 AI Class Probabilities
                                </h3>

                                {Object.entries(
                                    getProbabilities(
                                        selectedDetection.probabilities
                                    )
                                )
                                    .sort(
                                        (
                                            [, a],
                                            [, b]
                                        ) =>
                                            Number(b) -
                                            Number(a)
                                    )
                                    .map(
                                        (
                                            [
                                                disease,
                                                probability,
                                            ]
                                        ) => {

                                            const value =
                                                Number(
                                                    probability
                                                );

                                            return (

                                                <div
                                                    key={
                                                        disease
                                                    }
                                                    style={{
                                                        marginBottom:
                                                            "15px",
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            marginBottom:
                                                                "6px",
                                                        }}
                                                    >

                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "600",
                                                            }}
                                                        >
                                                            {
                                                                disease
                                                            }
                                                        </span>

                                                        <strong>
                                                            {value.toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </strong>

                                                    </div>

                                                    <div
                                                        style={{
                                                            height:
                                                                "9px",
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
                                                                    `${Math.min(
                                                                        Math.max(
                                                                            value,
                                                                            0
                                                                        ),
                                                                        100
                                                                    )}%`,
                                                                height:
                                                                    "100%",
                                                                background:
                                                                    value >= 80
                                                                        ? "#16a34a"
                                                                        : "#86efac",
                                                                borderRadius:
                                                                    "10px",
                                                            }}
                                                        />

                                                    </div>

                                                </div>

                                            );
                                        }
                                    )}

                            </div>

                        )}

                        {/* =================================================
                            AI RECOMMENDATION
                        ================================================= */}

                        {selectedDetection.recommendation && (

                            <div
                                style={{
                                    marginTop: "25px",
                                    padding: "22px",
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "14px",
                                }}
                            >

                                <h3
                                    style={{
                                        margin: "0 0 18px 0",
                                        fontSize: "22px",
                                    }}
                                >
                                    💡 AI Recommendation
                                </h3>

                                {selectedDetection.recommendation.severity && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <strong>⚠️ Severity:</strong>{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                marginLeft: "6px",
                                                padding: "5px 12px",
                                                borderRadius: "20px",
                                                background: "#fef3c7",
                                                color: "#92400e",
                                                fontWeight: "700",
                                            }}
                                        >
                                            {selectedDetection.recommendation.severity}
                                        </span>
                                    </div>
                                )}

                                {Array.isArray(selectedDetection.recommendation.symptoms) &&
                                    selectedDetection.recommendation.symptoms.length > 0 && (
                                        <div style={{ marginBottom: "20px" }}>
                                            <h4>🔎 Symptoms</h4>
                                            <ul style={{
                                                paddingLeft: "22px",
                                                lineHeight: "1.8",
                                                color: "#334155",
                                            }}>
                                                {selectedDetection.recommendation.symptoms.map(
                                                    (item, index) => (
                                                        <li key={index}>{item}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {Array.isArray(selectedDetection.recommendation.immediate_action) &&
                                    selectedDetection.recommendation.immediate_action.length > 0 && (
                                        <div style={{ marginBottom: "20px" }}>
                                            <h4>🚨 Immediate Action</h4>
                                            <ul style={{
                                                paddingLeft: "22px",
                                                lineHeight: "1.8",
                                                color: "#334155",
                                            }}>
                                                {selectedDetection.recommendation.immediate_action.map(
                                                    (item, index) => (
                                                        <li key={index}>{item}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {Array.isArray(selectedDetection.recommendation.treatment) &&
                                    selectedDetection.recommendation.treatment.length > 0 && (
                                        <div style={{ marginBottom: "20px" }}>
                                            <h4>💊 Treatment / What You Should Do</h4>
                                            <ul style={{
                                                paddingLeft: "22px",
                                                lineHeight: "1.8",
                                                color: "#334155",
                                            }}>
                                                {selectedDetection.recommendation.treatment.map(
                                                    (item, index) => (
                                                        <li key={index}>{item}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {Array.isArray(selectedDetection.recommendation.spray_guidance) &&
                                    selectedDetection.recommendation.spray_guidance.length > 0 && (
                                        <div style={{
                                            marginBottom: "20px",
                                            padding: "16px",
                                            background: "#fff7ed",
                                            border: "1px solid #fed7aa",
                                            borderRadius: "12px",
                                        }}>
                                            <h4>🧴 Spray Guidance</h4>
                                            <ul style={{
                                                paddingLeft: "22px",
                                                lineHeight: "1.8",
                                                color: "#7c2d12",
                                            }}>
                                                {selectedDetection.recommendation.spray_guidance.map(
                                                    (item, index) => (
                                                        <li key={index}>{item}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {Array.isArray(selectedDetection.recommendation.prevention) &&
                                    selectedDetection.recommendation.prevention.length > 0 && (
                                        <div style={{ marginBottom: "20px" }}>
                                            <h4>🛡️ Prevention</h4>
                                            <ul style={{
                                                paddingLeft: "22px",
                                                lineHeight: "1.8",
                                                color: "#334155",
                                            }}>
                                                {selectedDetection.recommendation.prevention.map(
                                                    (item, index) => (
                                                        <li key={index}>{item}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {selectedDetection.recommendation.farmer_action && (
                                    <div style={{
                                        marginTop: "20px",
                                        padding: "16px 18px",
                                        borderRadius: "12px",
                                        background: "#ecfdf5",
                                        border: "1px solid #a7f3d0",
                                    }}>
                                        <h4 style={{ marginBottom: "8px" }}>
                                            👨‍🌾 Farmer Action
                                        </h4>
                                        <p style={{
                                            margin: 0,
                                            color: "#166534",
                                            lineHeight: "1.7",
                                        }}>
                                            {selectedDetection.recommendation.farmer_action}
                                        </p>
                                    </div>
                                )}

                            </div>

                        )}

                        {/* CLOSE */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "center",
                                marginTop:
                                    "25px",
                            }}
                        >

                            <button
                                onClick={
                                    handleCloseDetails
                                }
                                style={{
                                    padding:
                                        "11px 25px",
                                    border: "none",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "#15803d",
                                    color:
                                        "#ffffff",
                                    cursor:
                                        "pointer",
                                    fontWeight:
                                        "700",
                                }}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default History;