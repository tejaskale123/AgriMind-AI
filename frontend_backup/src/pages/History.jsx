import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

/* ============================================================
   HELPERS
============================================================ */

const isHealthy = (value) => {
    const v = String(value || "").trim().toLowerCase();

    return (
        v === "healthy" ||
        v === "healthy leaf" ||
        v.includes("healthy")
    );
};

const jsonArray = (value) => {
    if (Array.isArray(value)) return value;

    if (!value) return [];

    try {
        const x = JSON.parse(value);

        return Array.isArray(x) ? x : [];
    } catch {
        return [];
    }
};

const probabilities = (value) => {
    if (!value) return {};

    if (
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        return value;
    }

    try {
        const x = JSON.parse(value);

        return x && typeof x === "object"
            ? x
            : {};
    } catch {
        return {};
    }
};

const normalize = (item) => ({
    ...item,

    recommendation:
        item.recommendation &&
        typeof item.recommendation === "object"
            ? item.recommendation
            : {
                  severity: item.severity,

                  symptoms: jsonArray(
                      item.symptoms
                  ),

                  immediate_action: jsonArray(
                      item.immediate_action
                  ),

                  treatment: jsonArray(
                      item.treatment
                  ),

                  spray_guidance: jsonArray(
                      item.spray_guidance
                  ),

                  prevention: jsonArray(
                      item.prevention
                  ),

                  farmer_action:
                      item.farmer_action,
              },
});


/* ============================================================
   SIMPLE PROFESSIONAL ICONS
   No emoji / sticker dependency
============================================================ */

function Icon({ type, size = "medium" }) {
    return (
        <span
            className={`ui-icon ui-icon-${type} ui-icon-${size}`}
            aria-hidden="true"
        >
            {type === "records" && (
                <>
                    <span />
                    <span />
                    <span />
                </>
            )}

            {type === "healthy" && (
                <span className="check-mark" />
            )}

            {type === "disease" && (
                <span className="disease-mark">
                    <i />
                    <i />
                    <i />
                </span>
            )}

            {type === "confidence" && (
                <span className="target-mark">
                    <i />
                </span>
            )}

            {type === "search" && (
                <>
                    <span className="search-circle" />
                    <span className="search-handle" />
                </>
            )}

            {type === "calendar" && (
                <>
                    <span className="calendar-top" />
                    <span className="calendar-body">
                        <i />
                        <i />
                        <i />
                        <i />
                    </span>
                </>
            )}

            {type === "crop" && (
                <span className="leaf-mark">
                    <i />
                </span>
            )}

            {type === "details" && (
                <span className="details-mark">
                    <i />
                    <i />
                    <i />
                </span>
            )}

            {type === "warning" && (
                <span className="warning-mark">
                    !
                </span>
            )}

            {type === "delete" && (
                <span className="delete-mark">
                    <i />
                    <i />
                </span>
            )}

            {type === "refresh" && (
                <span className="refresh-mark">
                    ↻
                </span>
            )}

            {type === "close" && (
                <span className="close-mark">
                    ×
                </span>
            )}

            {type === "recommendation" && (
                <span className="recommendation-mark">
                    <i />
                    <i />
                    <i />
                </span>
            )}

            {type === "spray" && (
                <span className="spray-mark">
                    <i />
                </span>
            )}

            {type === "farmer" && (
                <span className="farmer-mark">
                    <i />
                </span>
            )}
        </span>
    );
}


/* ============================================================
   MAIN HISTORY COMPONENT
============================================================ */

function History() {
    const [history, setHistory] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [selected, setSelected] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState("all");


    /* ========================================================
       TOKEN
    ======================================================== */

    const token = () => {
        const keys = [
            "access_token",
            "token",
            "accessToken",
            "authToken",
            "jwt",
            "auth",
        ];

        for (
            const store of [
                localStorage,
                sessionStorage,
            ]
        ) {
            for (const key of keys) {
                const value =
                    store.getItem(key);

                if (!value) continue;

                try {
                    const parsed =
                        JSON.parse(value);

                    if (
                        typeof parsed ===
                            "string" &&
                        parsed.length > 20
                    ) {
                        return parsed;
                    }

                    if (
                        parsed?.access_token
                    ) {
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


    /* ========================================================
       LOAD HISTORY
    ======================================================== */

    const load = async (
        refresh = false
    ) => {
        try {
            refresh
                ? setRefreshing(true)
                : setLoading(true);

            setError("");

            const t = token();

            if (!t) {
                throw new Error(
                    "Not authenticated. Please login again."
                );
            }

            const res = await fetch(
                `${API_BASE_URL}/history`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${t}`,

                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data =
                await res.json();

            if (res.status === 401) {
                throw new Error(
                    "Authentication expired. Please login again."
                );
            }

            if (!res.ok) {
                throw new Error(
                    data.detail ||
                        data.message ||
                        "Failed to load history."
                );
            }

            setHistory(
                Array.isArray(
                    data.history
                )
                    ? data.history.map(
                          normalize
                      )
                    : []
            );
        } catch (e) {
            console.error(e);

            setError(
                e.message ||
                    "Unable to connect to AI server."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {
        load();
    }, []);


    /* ========================================================
       CLEAR HISTORY
    ======================================================== */

    const clearHistory = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete all detection history?"
            )
        ) {
            return;
        }

        try {
            const t = token();

            if (!t) {
                throw new Error(
                    "Not authenticated. Please login again."
                );
            }

            const res = await fetch(
                `${API_BASE_URL}/history`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${t}`,

                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data =
                await res
                    .json()
                    .catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.detail ||
                        data.message ||
                        "Failed to clear history."
                );
            }

            setHistory([]);
            setSelected(null);
        } catch (e) {
            setError(
                e.message ||
                    "Unable to clear history."
            );
        }
    };


    /* ========================================================
       SUMMARY
    ======================================================== */

    const summary = useMemo(() => {
        const healthy =
            history.filter((x) =>
                isHealthy(
                    x.prediction
                )
            ).length;

        const avg = history.length
            ? history.reduce(
                  (s, x) =>
                      s +
                      Number(
                          x.confidence || 0
                      ),
                  0
              ) / history.length
            : 0;

        return {
            total: history.length,
            healthy,
            disease:
                history.length -
                healthy,
            avg,
        };
    }, [history]);


    /* ========================================================
       FILTERED RECORDS
    ======================================================== */

    const records = useMemo(() => {
        const q =
            search
                .trim()
                .toLowerCase();

        return history.filter(
            (item) => {
                const okFilter =
                    filter === "all" ||
                    (
                        filter ===
                            "healthy" &&
                        isHealthy(
                            item.prediction
                        )
                    ) ||
                    (
                        filter ===
                            "disease" &&
                        !isHealthy(
                            item.prediction
                        )
                    );

                const text =
                    `${item.id || ""} ${
                        item.crop || ""
                    } ${
                        item.prediction || ""
                    }`.toLowerCase();

                return (
                    okFilter &&
                    (!q ||
                        text.includes(q))
                );
            }
        );
    }, [
        history,
        search,
        filter,
    ]);


    /* ========================================================
       DATE FORMAT
    ======================================================== */

    const date = (value) => {
        if (!value) {
            return "Unknown date";
        }

        const d =
            new Date(value);

        return Number.isNaN(
            d.getTime()
        )
            ? String(value)
            : d.toLocaleString(
                  "en-IN",
                  {
                      dateStyle:
                          "medium",
                      timeStyle:
                          "short",
                  }
              );
    };


    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <>
                <style>
                    {styles}
                </style>

                <div className="empty">
                    <div className="emptyIcon">
                        <Icon
                            type="records"
                            size="large"
                        />
                    </div>

                    <h2>
                        Loading Detection History
                    </h2>

                    <p>
                        AgriMind AI is loading
                        your previous results...
                    </p>
                </div>
            </>
        );
    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (
        error &&
        !history.length
    ) {
        return (
            <>
                <style>
                    {styles}
                </style>

                <div className="empty">
                    <div className="emptyIcon errorIcon">
                        <Icon
                            type="warning"
                            size="large"
                        />
                    </div>

                    <h2>
                        Unable to Load History
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="greenBtn"
                        onClick={() =>
                            load()
                        }
                    >
                        <Icon
                            type="refresh"
                            size="small"
                        />

                        Try Again
                    </button>
                </div>
            </>
        );
    }


    /* ========================================================
       UI
    ======================================================== */

    return (
        <div className="history-page">
            <style>
                {styles}
            </style>


            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="header">

                <div className="header-content">

                    <span className="eyebrow">
                        AGRIMIND AI • RECORDS
                    </span>

                    <h1>
                        Detection History
                    </h1>

                    <p>
                        Review your previous
                        crop health detection
                        results and AI
                        recommendations.
                    </p>

                </div>


                <div className="actions">

                    <button
                        className="refresh"
                        onClick={() =>
                            load(true)
                        }
                        disabled={refreshing}
                    >
                        <Icon
                            type="refresh"
                            size="small"
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>


                    {history.length >
                        0 && (
                        <button
                            className="delete"
                            onClick={
                                clearHistory
                            }
                        >
                            <Icon
                                type="delete"
                                size="small"
                            />

                            Clear History
                        </button>
                    )}

                </div>

            </header>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error &&
                history.length >
                    0 && (
                    <div className="error">
                        <Icon
                            type="warning"
                            size="small"
                        />

                        <span>
                            {error}
                        </span>
                    </div>
                )}


            {/* ==================================================
                SUMMARY
            ================================================== */}

            {history.length > 0 && (
                <>

                    {/* HERO */}

                    <section className="hero">

                        <div className="heroContent">

                            <span>
                                AI DETECTION RECORDS
                            </span>

                            <h2>
                                {summary.disease >
                                summary.healthy
                                    ? "More attention is needed"
                                    : "Your recorded crop health looks good"}
                            </h2>

                            <p>
                                {summary.total}{" "}
                                detection
                                {summary.total !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                recorded with
                                average AI
                                confidence of{" "}
                                <b>
                                    {summary.avg.toFixed(
                                        1
                                    )}
                                    %
                                </b>
                                .
                            </p>

                        </div>


                        <div className="heroCount">

                            <b>
                                {summary.total}
                            </b>

                            <span>
                                Total Records
                            </span>

                        </div>

                    </section>


                    {/* STATS */}

                    <section className="stats">

                        <Stat
                            icon="records"
                            label="Total Detections"
                            value={
                                summary.total
                            }
                        />

                        <Stat
                            icon="healthy"
                            label="Healthy"
                            value={
                                summary.healthy
                            }
                            cls="green"
                        />

                        <Stat
                            icon="disease"
                            label="Disease Detected"
                            value={
                                summary.disease
                            }
                            cls="red"
                        />

                        <Stat
                            icon="confidence"
                            label="Avg. Confidence"
                            value={`${summary.avg.toFixed(
                                1
                            )}%`}
                            cls="blue"
                        />

                    </section>


                    {/* TOOLBAR */}

                    <section className="toolbar">

                        <div className="search">

                            <Icon
                                type="search"
                                size="small"
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Search crop, disease or ID..."
                            />

                            {search && (
                                <button
                                    className="clearSearch"
                                    onClick={() =>
                                        setSearch(
                                            ""
                                        )
                                    }
                                >
                                    ×
                                </button>
                            )}

                        </div>


                        <div className="filters">

                            <button
                                className={
                                    filter ===
                                    "all"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter(
                                        "all"
                                    )
                                }
                            >
                                All (
                                {
                                    summary.total
                                }
                                )
                            </button>


                            <button
                                className={
                                    filter ===
                                    "healthy"
                                        ? "active healthy"
                                        : "healthy"
                                }
                                onClick={() =>
                                    setFilter(
                                        "healthy"
                                    )
                                }
                            >
                                <Icon
                                    type="healthy"
                                    size="tiny"
                                />

                                Healthy (
                                {
                                    summary.healthy
                                }
                                )
                            </button>


                            <button
                                className={
                                    filter ===
                                    "disease"
                                        ? "active disease"
                                        : "disease"
                                }
                                onClick={() =>
                                    setFilter(
                                        "disease"
                                    )
                                }
                            >
                                <Icon
                                    type="disease"
                                    size="tiny"
                                />

                                Disease (
                                {
                                    summary.disease
                                }
                                )
                            </button>

                        </div>

                    </section>

                </>
            )}


            {/* ==================================================
                EMPTY / RECORD LIST
            ================================================== */}

            {!history.length ? (

                <div className="empty">

                    <div className="emptyIcon">
                        <Icon
                            type="records"
                            size="large"
                        />
                    </div>

                    <h2>
                        No Detection History Yet
                    </h2>

                    <p>
                        Perform your first AI
                        disease detection.
                        Your result will appear
                        here automatically.
                    </p>

                </div>

            ) : !records.length ? (

                <div className="empty compact">

                    <div className="emptyIcon">
                        <Icon
                            type="search"
                            size="large"
                        />
                    </div>

                    <h2>
                        No Matching Results
                    </h2>

                    <p>
                        Try another search
                        term or filter.
                    </p>

                    <button
                        className="greenBtn"
                        onClick={() => {
                            setSearch("");
                            setFilter("all");
                        }}
                    >
                        Reset Filters
                    </button>

                </div>

            ) : (

                <div className="list">

                    {records.map(
                        (item) => (
                            <HistoryCard
                                key={
                                    item.id ||
                                    `${item.created_at}-${item.prediction}`
                                }
                                item={item}
                                onDetails={() =>
                                    setSelected(
                                        item
                                    )
                                }
                                date={date}
                            />
                        )
                    )}

                </div>

            )}


            {/* ==================================================
                MODAL
            ================================================== */}

            {selected && (
                <Modal
                    item={selected}
                    close={() =>
                        setSelected(null)
                    }
                    date={date}
                />
            )}

        </div>
    );
}


/* ============================================================
   STAT
============================================================ */

function Stat({
    icon,
    label,
    value,
    cls = "",
}) {
    return (
        <div className="stat">

            <div
                className={`statIcon ${cls}`}
            >
                <Icon
                    type={icon}
                    size="medium"
                />
            </div>

            <div>

                <span>
                    {label}
                </span>

                <b className={cls}>
                    {value}
                </b>

            </div>

        </div>
    );
}


/* ============================================================
   HISTORY CARD
============================================================ */

function HistoryCard({
    item,
    onDetails,
    date,
}) {
    const healthy =
        isHealthy(
            item.prediction
        );

    const probs =
        probabilities(
            item.probabilities
        );

    const confidence =
        Number(
            item.confidence || 0
        );

    return (
        <article className="card">

            {/* CARD HEADER */}

            <div className="cardTop">

                <div className="titleRow">

                    <div
                        className={`recordIcon ${
                            healthy
                                ? "goodBg"
                                : "badBg"
                        }`}
                    >
                        <Icon
                            type={
                                healthy
                                    ? "healthy"
                                    : "disease"
                            }
                            size="medium"
                        />
                    </div>


                    <div>

                        <small>
                            AI DETECTION
                        </small>

                        <h2>
                            {
                                item.prediction ||
                                "Unknown Prediction"
                            }
                        </h2>

                        <p className="dateText">

                            <Icon
                                type="calendar"
                                size="tiny"
                            />

                            {date(
                                item.created_at
                            )}

                        </p>

                    </div>

                </div>


                <span
                    className={`badge ${
                        healthy
                            ? "good"
                            : "bad"
                    }`}
                >
                    <span className="statusDot" />

                    {healthy
                        ? "Healthy"
                        : "Disease Detected"}
                </span>

            </div>


            {/* RESULT GRID */}

            <div className="resultGrid">

                <Info
                    label="CROP"
                    value={
                        item.crop ||
                        "Unknown Crop"
                    }
                    icon="crop"
                />


                <Info
                    label="CONFIDENCE"
                    value={`${confidence.toFixed(
                        2
                    )}%`}
                    progress={
                        confidence
                    }
                />


                <Info
                    label="RECORD"
                    value={`#${
                        item.id ?? "—"
                    }`}
                />

            </div>


            {/* PROBABILITIES */}

            {Object.keys(probs)
                .length > 0 && (
                <div className="probSection">

                    <div className="sectionTitleRow">

                        <div>

                            <h3>
                                AI Class
                                Probabilities
                            </h3>

                            <p>
                                Confidence
                                across detected
                                classes.
                            </p>

                        </div>

                        <span className="sectionTag">
                            AI ANALYSIS
                        </span>

                    </div>


                    {Object.entries(
                        probs
                    )
                        .sort(
                            ([, a], [, b]) =>
                                Number(b) -
                                Number(a)
                        )
                        .map(
                            ([
                                name,
                                val,
                            ]) => (
                                <Bar
                                    key={name}
                                    name={name}
                                    value={Number(
                                        val
                                    )}
                                />
                            )
                        )}

                </div>
            )}


            {/* FOOTER */}

            <div className="footer">

                <span>
                    AgriMind AI analysis
                    record
                </span>

                <button
                    onClick={onDetails}
                >
                    <Icon
                        type="details"
                        size="tiny"
                    />

                    View Full Details

                    <span className="arrow">
                        →
                    </span>
                </button>

            </div>

        </article>
    );
}


/* ============================================================
   INFO
============================================================ */

function Info({
    label,
    value,
    progress,
    icon,
}) {
    return (
        <div className="info">

            <span>

                {icon && (
                    <Icon
                        type={icon}
                        size="tiny"
                    />
                )}

                {label}

            </span>

            <b>
                {value}
            </b>


            {progress !==
                undefined && (
                <div className="mini">

                    <i
                        style={{
                            width: `${
                                Math.min(
                                    Math.max(
                                        progress,
                                        0
                                    ),
                                    100
                                )
                            }%`,
                        }}
                    />

                </div>
            )}

        </div>
    );
}


/* ============================================================
   PROBABILITY BAR
============================================================ */

function Bar({
    name,
    value,
}) {
    const healthy =
        isHealthy(name);

    return (
        <div className="barRow">

            <div>

                <span>
                    {name}
                </span>

                <b>
                    {value.toFixed(2)}%
                </b>

            </div>

            <div className="track">

                <i
                    className={
                        healthy
                            ? "greenBar"
                            : "redBar"
                    }
                    style={{
                        width: `${
                            Math.min(
                                Math.max(
                                    value,
                                    0
                                ),
                                100
                            )
                        }%`,
                    }}
                />

            </div>

        </div>
    );
}


/* ============================================================
   RECOMMENDATION LIST
============================================================ */

function ListSection({
    title,
    items,
}) {
    if (
        !Array.isArray(items) ||
        !items.length
    ) {
        return null;
    }

    return (
        <div className="recSection">

            <h4>
                {title}
            </h4>

            <ul>
                {items.map(
                    (x, i) => (
                        <li key={i}>
                            {x}
                        </li>
                    )
                )}
            </ul>

        </div>
    );
}


/* ============================================================
   MODAL
============================================================ */

function Modal({
    item,
    close,
    date,
}) {
    const probs =
        probabilities(
            item.probabilities
        );

    const rec =
        item.recommendation;

    const healthy =
        isHealthy(
            item.prediction
        );

    return (
        <div
            className="overlay"
            onClick={close}
        >

            <div
                className="modal"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                {/* MODAL HEADER */}

                <div className="modalHead">

                    <div>

                        <span className="eyebrow">
                            AGRIMIND AI • DETECTION
                        </span>

                        <h2>
                            Detection Details
                        </h2>

                        <p>
                            Record #
                            {item.id ??
                                "—"}
                        </p>

                    </div>


                    <button
                        className="x"
                        onClick={close}
                        aria-label="Close"
                    >
                        <Icon
                            type="close"
                            size="small"
                        />
                    </button>

                </div>


                {/* MODAL BASIC DATA */}

                <div className="modalGrid">

                    <Info
                        label="CROP"
                        value={
                            item.crop ||
                            "Unknown Crop"
                        }
                        icon="crop"
                    />

                    <Info
                        label="PREDICTION"
                        value={
                            item.prediction ||
                            "Unknown"
                        }
                        icon={
                            healthy
                                ? "healthy"
                                : "disease"
                        }
                    />

                    <Info
                        label="CONFIDENCE"
                        value={`${Number(
                            item.confidence ||
                                0
                        ).toFixed(2)}%`}
                        progress={Number(
                            item.confidence ||
                                0
                        )}
                    />

                </div>


                {/* DATE */}

                <div className="dateBox">

                    <b>

                        <Icon
                            type="calendar"
                            size="tiny"
                        />

                        Detection Date

                    </b>

                    <span>
                        {date(
                            item.created_at
                        )}
                    </span>

                </div>


                {/* PROBABILITIES */}

                {Object.keys(probs)
                    .length > 0 && (
                    <div className="modalSection">

                        <div className="sectionTitleRow">

                            <div>

                                <h3>
                                    AI Class
                                    Probabilities
                                </h3>

                                <p>
                                    Model confidence
                                    distribution.
                                </p>

                            </div>

                        </div>


                        {Object.entries(
                            probs
                        )
                            .sort(
                                ([, a], [, b]) =>
                                    Number(b) -
                                    Number(a)
                            )
                            .map(
                                ([
                                    name,
                                    val,
                                ]) => (
                                    <Bar
                                        key={
                                            name
                                        }
                                        name={
                                            name
                                        }
                                        value={Number(
                                            val
                                        )}
                                    />
                                )
                            )}

                    </div>
                )}


                {/* RECOMMENDATION */}

                {rec && (
                    <div className="recommendation">

                        <div className="recHead">

                            <div className="recIconBox">
                                <Icon
                                    type="recommendation"
                                    size="medium"
                                />
                            </div>

                            <section>

                                <span>
                                    AGRIMIND AI
                                </span>

                                <h3>
                                    AI Crop Health
                                    Recommendation
                                </h3>

                            </section>

                        </div>


                        {/* SEVERITY */}

                        {rec.severity && (
                            <div className="severity">

                                <b>

                                    <Icon
                                        type="warning"
                                        size="tiny"
                                    />

                                    Severity

                                </b>

                                <span>
                                    {
                                        rec.severity
                                    }
                                </span>

                            </div>
                        )}


                        <ListSection
                            title="Symptoms"
                            items={
                                rec.symptoms
                            }
                        />


                        <ListSection
                            title="Immediate Action"
                            items={
                                rec.immediate_action
                            }
                        />


                        <ListSection
                            title="Treatment / What You Should Do"
                            items={
                                rec.treatment
                            }
                        />


                        <ListSection
                            title="Prevention"
                            items={
                                rec.prevention
                            }
                        />


                        {Array.isArray(
                            rec.spray_guidance
                        ) &&
                            rec
                                .spray_guidance
                                .length >
                                0 && (
                                <div className="spray">

                                    <h4>

                                        <Icon
                                            type="spray"
                                            size="tiny"
                                        />

                                        Spray Guidance

                                    </h4>

                                    <ul>

                                        {rec.spray_guidance.map(
                                            (
                                                x,
                                                i
                                            ) => (
                                                <li
                                                    key={
                                                        i
                                                    }
                                                >
                                                    {
                                                        x
                                                    }
                                                </li>
                                            )
                                        )}

                                    </ul>

                                </div>
                            )}


                        {rec.farmer_action && (
                            <div className="farmer">

                                <h4>

                                    <Icon
                                        type="farmer"
                                        size="tiny"
                                    />

                                    Farmer Action

                                </h4>

                                <p>
                                    {
                                        rec.farmer_action
                                    }
                                </p>

                            </div>
                        )}

                    </div>
                )}


                {/* MODAL FOOTER */}

                <div className="modalFooter">

                    <button
                        onClick={close}
                    >
                        Close Details
                    </button>

                </div>

            </div>

        </div>
    );
}


/* ============================================================
   COMPLETE HISTORY PAGE CSS
============================================================ */

const styles = `

/* ============================================================
   BASE
============================================================ */

.history-page {
    min-height: 100%;

    padding:
        32px
        34px
        80px;

    color:
        #10261a;

    background:
        radial-gradient(
            circle at 90% 0%,
            rgba(34, 197, 94, .06),
            transparent 32%
        );
}

.history-page *,
.history-page *::before,
.history-page *::after {
    box-sizing: border-box;
}


/* ============================================================
   HEADER
============================================================ */

.header {
    display: flex;

    align-items: flex-end;

    justify-content:
        space-between;

    gap: 28px;

    margin-bottom: 26px;
}

.header-content {
    min-width: 0;
}

.eyebrow {
    display: inline-block;

    margin-bottom: 8px;

    color:
        #16a34a;

    font-size: 11px;

    font-weight: 900;

    letter-spacing:
        2px;
}

.header h1 {
    margin: 0;

    color:
        #09251a;

    font-size: 38px;

    font-weight: 950;

    letter-spacing:
        -1.3px;

    line-height:
        1.08;
}

.header p {
    margin:
        9px 0 0;

    max-width: 700px;

    color:
        #718096;

    font-size: 15px;

    line-height:
        1.55;
}

.actions {
    display: flex;

    align-items: center;

    gap: 10px;

    flex-wrap: wrap;
}


/* ============================================================
   BUTTONS
============================================================ */

.refresh,
.delete,
.greenBtn {
    height: 45px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 8px;

    padding:
        0 17px;

    border-radius:
        11px;

    font-size: 12px;

    font-weight: 850;

    cursor: pointer;

    transition:
        transform .2s ease,
        box-shadow .2s ease,
        background .2s ease;
}

.refresh {
    border:
        1px solid #16a34a;

    background:
        #ffffff;

    color:
        #15803d;
}

.refresh:hover {
    background:
        #f0fdf4;

    box-shadow:
        0 7px 18px
        rgba(21,128,61,.10);
}

.delete {
    border:
        1px solid #dc2626;

    background:
        #dc2626;

    color:
        #ffffff;
}

.delete:hover {
    background:
        #b91c1c;

    box-shadow:
        0 7px 18px
        rgba(220,38,38,.15);
}

.refresh:disabled {
    opacity: .6;

    cursor:
        not-allowed;
}

.greenBtn {
    margin-top: 20px;

    border:
        0;

    background:
        #15803d;

    color:
        white;
}

.greenBtn:hover {
    transform:
        translateY(-1px);

    box-shadow:
        0 8px 20px
        rgba(21,128,61,.18);
}


/* ============================================================
   ERROR
============================================================ */

.error {
    display: flex;

    align-items: center;

    gap: 9px;

    margin-bottom: 20px;

    padding:
        13px 16px;

    border:
        1px solid #fecaca;

    border-radius:
        12px;

    background:
        #fff7f7;

    color:
        #991b1b;

    font-size: 13px;

    font-weight: 650;
}


/* ============================================================
   HERO
============================================================ */

.hero {
    position: relative;

    display: flex;

    align-items: center;

    justify-content:
        space-between;

    gap: 30px;

    min-height:
        220px;

    margin-bottom:
        22px;

    padding:
        36px 42px;

    overflow: hidden;

    border-radius:
        24px;

    color:
        white;

    background:
        linear-gradient(
            135deg,
            #067536 0%,
            #109447 52%,
            #22c55e 100%
        );

    box-shadow:
        0 18px 42px
        rgba(21,128,61,.18);
}

.hero::after {
    content: "";

    position: absolute;

    width: 360px;
    height: 360px;

    right: -130px;
    top: -190px;

    border:
        1px solid
        rgba(255,255,255,.15);

    border-radius:
        50%;
}

.heroContent {
    position: relative;

    z-index: 1;

    max-width:
        820px;
}

.heroContent > span {
    font-size: 11px;

    font-weight: 900;

    letter-spacing:
        2px;

    opacity:
        .88;
}

.hero h2 {
    margin:
        12px 0 9px;

    font-size:
        32px;

    font-weight:
        950;

    letter-spacing:
        -.8px;
}

.hero p {
    margin:
        0;

    color:
        rgba(255,255,255,.91);

    font-size:
        15px;

    line-height:
        1.65;
}

.heroCount {
    position: relative;

    z-index: 2;

    width:
        124px;

    height:
        124px;

    min-width:
        124px;

    display: flex;

    flex-direction:
        column;

    align-items:
        center;

    justify-content:
        center;

    border:
        1px solid
        rgba(255,255,255,.30);

    border-radius:
        50%;

    background:
        rgba(255,255,255,.11);

    backdrop-filter:
        blur(4px);
}

.heroCount b {
    font-size:
        32px;

    line-height:
        1;
}

.heroCount span {
    margin-top:
        6px;

    font-size:
        10px;

    font-weight:
        800;

    letter-spacing:
        .6px;
}


/* ============================================================
   STATS
============================================================ */

.stats {
    display:
        grid;

    grid-template-columns:
        repeat(
            4,
            minmax(0, 1fr)
        );

    gap:
        16px;

    margin-bottom:
        22px;
}

.stat {
    min-height:
        108px;

    display:
        flex;

    align-items:
        center;

    gap:
        15px;

    padding:
        19px;

    border:
        1px solid #e3ebe6;

    border-radius:
        17px;

    background:
        #ffffff;

    box-shadow:
        0 7px 24px
        rgba(15,60,30,.055);

    transition:
        transform .2s ease,
        box-shadow .2s ease;
}

.stat:hover {
    transform:
        translateY(-2px);

    box-shadow:
        0 12px 28px
        rgba(15,60,30,.08);
}

.statIcon {
    width:
        54px;

    height:
        54px;

    min-width:
        54px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border-radius:
        15px;

    background:
        #dcfce7;
}

.statIcon.red {
    background:
        #fff1f2;
}

.statIcon.blue {
    background:
        #eff6ff;
}

.stat span {
    display:
        block;

    margin-bottom:
        5px;

    color:
        #718096;

    font-size:
        12px;

    font-weight:
        750;
}

.stat b {
    display:
        block;

    color:
        #10261a;

    font-size:
        25px;

    font-weight:
        900;
}

.stat b.green {
    color:
        #15803d;
}

.stat b.red {
    color:
        #dc2626;
}

.stat b.blue {
    color:
        #2563eb;
}


/* ============================================================
   TOOLBAR
============================================================ */

.toolbar {
    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        16px;

    margin-bottom:
        20px;

    padding:
        14px;

    border:
        1px solid #e3ebe6;

    border-radius:
        17px;

    background:
        #ffffff;

    box-shadow:
        0 5px 20px
        rgba(15,60,30,.04);
}

.search {
    width:
        min(450px, 100%);

    height:
        46px;

    display:
        flex;

    align-items:
        center;

    gap:
        10px;

    padding:
        0 14px;

    border:
        1px solid #dce8e1;

    border-radius:
        11px;

    background:
        #f8faf9;

    transition:
        border .2s ease,
        box-shadow .2s ease;
}

.search:focus-within {
    border-color:
        #86efac;

    box-shadow:
        0 0 0 3px
        rgba(34,197,94,.08);
}

.search input {
    width:
        100%;

    border:
        0;

    outline:
        0;

    background:
        transparent;

    color:
        #172b20;

    font-size:
        13px;
}

.search input::placeholder {
    color:
        #94a3b8;
}

.clearSearch {
    width:
        25px;

    height:
        25px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border:
        0;

    border-radius:
        50%;

    background:
        #e2e8e5;

    color:
        #64748b;

    cursor:
        pointer;

    font-size:
        16px;

    line-height:
        1;
}

.filters {
    display:
        flex;

    gap:
        7px;

    flex-wrap:
        wrap;
}

.filters button {
    min-height:
        39px;

    display:
        inline-flex;

    align-items:
        center;

    justify-content:
        center;

    gap:
        6px;

    padding:
        0 13px;

    border:
        1px solid #dfe8e2;

    border-radius:
        10px;

    background:
        #ffffff;

    color:
        #64748b;

    cursor:
        pointer;

    font-size:
        12px;

    font-weight:
        800;

    transition:
        .2s ease;
}

.filters button:hover {
    border-color:
        #bbf7d0;

    background:
        #f8fffa;
}

.filters button.active {
    border-color:
        #86efac;

    background:
        #ecfdf3;

    color:
        #15803d;
}

.filters button.active.disease {
    border-color:
        #fecaca;

    background:
        #fff1f2;

    color:
        #dc2626;
}


/* ============================================================
   RECORD LIST
============================================================ */

.list {
    display:
        flex;

    flex-direction:
        column;

    gap:
        18px;
}


/* ============================================================
   CARD
============================================================ */

.card {
    padding:
        25px;

    border:
        1px solid #e3ebe6;

    border-radius:
        20px;

    background:
        #ffffff;

    box-shadow:
        0 7px 24px
        rgba(15,60,30,.05);

    transition:
        transform .2s ease,
        box-shadow .2s ease;
}

.card:hover {
    transform:
        translateY(-2px);

    box-shadow:
        0 13px 32px
        rgba(15,60,30,.08);
}

.cardTop {
    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        18px;

    margin-bottom:
        20px;
}

.titleRow {
    display:
        flex;

    align-items:
        center;

    gap:
        14px;

    min-width:
        0;
}

.recordIcon {
    width:
        56px;

    height:
        56px;

    min-width:
        56px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border-radius:
        16px;
}

.goodBg {
    background:
        #dcfce7;
}

.badBg {
    background:
        #fff1f2;
}

.titleRow small {
    color:
        #94a3b8;

    font-size:
        9px;

    font-weight:
        900;

    letter-spacing:
        1.6px;
}

.titleRow h2 {
    margin:
        4px 0;

    color:
        #10261a;

    font-size:
        19px;

    font-weight:
        900;

    line-height:
        1.25;
}

.dateText {
    display:
        flex;

    align-items:
        center;

    gap:
        5px;

    margin:
        0;

    color:
        #718096;

    font-size:
        12px;
}

.badge {
    display:
        inline-flex;

    align-items:
        center;

    gap:
        7px;

    padding:
        9px 13px;

    border-radius:
        999px;

    font-size:
        11px;

    font-weight:
        900;

    white-space:
        nowrap;
}

.badge.good {
    background:
        #ecfdf3;

    color:
        #15803d;
}

.badge.bad {
    background:
        #fff1f2;

    color:
        #dc2626;
}

.statusDot {
    width:
        7px;

    height:
        7px;

    border-radius:
        50%;

    background:
        currentColor;
}


/* ============================================================
   RESULT GRID
============================================================ */

.resultGrid,
.modalGrid {
    display:
        grid;

    grid-template-columns:
        repeat(
            3,
            minmax(0, 1fr)
        );

    gap:
        12px;
}

.info {
    padding:
        16px;

    border:
        1px solid #edf2ef;

    border-radius:
        13px;

    background:
        #fbfdfc;
}

.info > span {
    display:
        flex;

    align-items:
        center;

    gap:
        5px;

    margin-bottom:
        8px;

    color:
        #94a3b8;

    font-size:
        9px;

    font-weight:
        900;

    letter-spacing:
        1.2px;
}

.info > b {
    display:
        block;

    color:
        #10261a;

    font-size:
        16px;

    font-weight:
        850;
}

.mini {
    height:
        7px;

    overflow:
        hidden;

    margin-top:
        10px;

    border-radius:
        99px;

    background:
        #e9efeb;
}

.mini i {
    display:
        block;

    height:
        100%;

    border-radius:
        99px;

    background:
        linear-gradient(
            90deg,
            #16a34a,
            #4ade80
        );
}


/* ============================================================
   PROBABILITY SECTION
============================================================ */

.probSection {
    padding-top:
        20px;

    margin-top:
        20px;

    border-top:
        1px solid #edf2ef;
}

.sectionTitleRow {
    display:
        flex;

    align-items:
        flex-start;

    justify-content:
        space-between;

    gap:
        15px;

    margin-bottom:
        17px;
}

.sectionTitleRow h3 {
    margin:
        0 0 4px;

    color:
        #10261a;

    font-size:
        16px;

    font-weight:
        900;
}

.sectionTitleRow p {
    margin:
        0;

    color:
        #718096;

    font-size:
        12px;
}

.sectionTag {
    padding:
        6px 9px;

    border-radius:
        999px;

    background:
        #f0fdf4;

    color:
        #15803d;

    font-size:
        9px;

    font-weight:
        900;

    letter-spacing:
        1px;

    white-space:
        nowrap;
}

.barRow {
    margin-bottom:
        14px;
}

.barRow > div:first-child {
    display:
        flex;

    justify-content:
        space-between;

    gap:
        15px;

    margin-bottom:
        7px;
}

.barRow span,
.barRow b {
    color:
        #52635a;

    font-size:
        12px;
}

.barRow b {
    color:
        #10261a;

    font-weight:
        850;
}

.track {
    height:
        9px;

    overflow:
        hidden;

    border-radius:
        99px;

    background:
        #edf2ef;
}

.track i {
    display:
        block;

    height:
        100%;

    border-radius:
        99px;
}

.greenBar {
    background:
        linear-gradient(
            90deg,
            #16a34a,
            #4ade80
        );
}

.redBar {
    background:
        linear-gradient(
            90deg,
            #ef4444,
            #f97316
        );
}


/* ============================================================
   FOOTER
============================================================ */

.footer {
    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        15px;

    margin-top:
        19px;

    padding-top:
        16px;

    border-top:
        1px solid #edf2ef;
}

.footer > span {
    color:
        #94a3b8;

    font-size:
        11px;
}

.footer button {
    height:
        41px;

    display:
        inline-flex;

    align-items:
        center;

    justify-content:
        center;

    gap:
        7px;

    padding:
        0 15px;

    border:
        0;

    border-radius:
        10px;

    background:
        #15803d;

    color:
        #ffffff;

    cursor:
        pointer;

    font-size:
        12px;

    font-weight:
        850;

    transition:
        .2s ease;
}

.footer button:hover {
    background:
        #166534;

    transform:
        translateY(-1px);
}

.arrow {
    font-size:
        16px;
}


/* ============================================================
   EMPTY STATE
============================================================ */

.empty {
    max-width:
        700px;

    margin:
        70px auto;

    padding:
        58px 30px;

    text-align:
        center;

    border:
        1px solid #e3ebe6;

    border-radius:
        20px;

    background:
        #ffffff;

    box-shadow:
        0 9px 28px
        rgba(15,60,30,.055);
}

.emptyIcon {
    width:
        70px;

    height:
        70px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    margin:
        0 auto 17px;

    border-radius:
        20px;

    background:
        #ecfdf3;
}

.errorIcon {
    background:
        #fff1f2;
}

.empty h2 {
    margin:
        0 0 9px;

    color:
        #10261a;

    font-size:
        24px;

    font-weight:
        900;
}

.empty p {
    max-width:
        560px;

    margin:
        0 auto;

    color:
        #718096;

    font-size:
        13px;

    line-height:
        1.65;
}

.compact {
    margin:
        35px auto;
}


/* ============================================================
   MODAL OVERLAY
============================================================ */

.overlay {
    position:
        fixed;

    inset:
        0;

    z-index:
        9999;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    padding:
        20px;

    background:
        rgba(
            7,
            20,
            12,
            .64
        );

    backdrop-filter:
        blur(6px);
}

.modal {
    width:
        100%;

    max-width:
        920px;

    max-height:
        91vh;

    overflow-y:
        auto;

    padding:
        30px;

    border:
        1px solid
        rgba(255,255,255,.45);

    border-radius:
        23px;

    background:
        #ffffff;

    box-shadow:
        0 30px 80px
        rgba(0,0,0,.28);
}

.modal::-webkit-scrollbar {
    width:
        8px;
}

.modal::-webkit-scrollbar-thumb {
    border-radius:
        20px;

    background:
        #cbd5d0;
}


/* ============================================================
   MODAL HEADER
============================================================ */

.modalHead {
    display:
        flex;

    justify-content:
        space-between;

    gap:
        20px;

    margin-bottom:
        22px;
}

.modalHead h2 {
    margin:
        0 0 5px;

    color:
        #10261a;

    font-size:
        25px;

    font-weight:
        900;
}

.modalHead p {
    margin:
        0;

    color:
        #718096;

    font-size:
        12px;
}

.x {
    width:
        40px;

    height:
        40px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border:
        0;

    border-radius:
        50%;

    background:
        #f1f5f3;

    color:
        #475569;

    cursor:
        pointer;

    transition:
        .2s ease;
}

.x:hover {
    background:
        #e2e8e5;

    transform:
        rotate(4deg);
}


/* ============================================================
   DATE
============================================================ */

.dateBox {
    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        15px;

    margin:
        18px 0;

    padding:
        15px 17px;

    border:
        1px solid #bbf7d0;

    border-radius:
        12px;

    background:
        #f0fdf4;

    font-size:
        12px;
}

.dateBox b {
    display:
        flex;

    align-items:
        center;

    gap:
        7px;

    color:
        #166534;
}

.dateBox span {
    color:
        #166534;

    font-weight:
        750;
}


/* ============================================================
   MODAL SECTION
============================================================ */

.modalSection {
    padding:
        22px;

    margin-bottom:
        20px;

    border:
        1px solid #edf2ef;

    border-radius:
        16px;

    background:
        #fbfdfc;
}

.modalSection h3 {
    margin:
        0 0 4px;

    font-size:
        16px;

    font-weight:
        900;
}


/* ============================================================
   RECOMMENDATION
============================================================ */

.recommendation {
    padding:
        23px;

    border:
        1px solid #bbf7d0;

    border-radius:
        18px;

    background:
        linear-gradient(
            135deg,
            #f0fdf4,
            #ffffff
        );
}

.recHead {
    display:
        flex;

    align-items:
        center;

    gap:
        13px;

    margin-bottom:
        20px;
}

.recIconBox {
    width:
        50px;

    height:
        50px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border-radius:
        14px;

    background:
        #dcfce7;
}

.recHead section > span {
    color:
        #16a34a;

    font-size:
        9px;

    font-weight:
        900;

    letter-spacing:
        1.5px;
}

.recHead h3 {
    margin:
        3px 0 0;

    color:
        #10261a;

    font-size:
        19px;

    font-weight:
        900;
}


/* ============================================================
   SEVERITY
============================================================ */

.severity {
    display:
        flex;

    align-items:
        center;

    gap:
        9px;

    padding:
        12px;

    margin-bottom:
        20px;

    border:
        1px solid #fde68a;

    border-radius:
        11px;

    background:
        #fffbeb;
}

.severity b {
    display:
        flex;

    align-items:
        center;

    gap:
        6px;

    color:
        #92400e;

    font-size:
        12px;
}

.severity span {
    padding:
        5px 10px;

    border-radius:
        99px;

    background:
        #fef3c7;

    color:
        #92400e;

    font-size:
        11px;

    font-weight:
        800;
}


/* ============================================================
   RECOMMENDATION SECTIONS
============================================================ */

.recSection {
    padding:
        17px 0;

    border-top:
        1px solid #e0f2e6;
}

.recSection h4,
.spray h4,
.farmer h4 {
    display:
        flex;

    align-items:
        center;

    gap:
        7px;

    margin:
        0 0 9px;

    color:
        #17372a;

    font-size:
        14px;

    font-weight:
        900;
}

.recSection ul,
.spray ul {
    margin:
        0;

    padding-left:
        22px;

    color:
        #334155;

    font-size:
        13px;

    line-height:
        1.8;
}

.recSection li {
    padding-left:
        3px;

    margin-bottom:
        3px;
}


/* ============================================================
   SPRAY
============================================================ */

.spray {
    padding:
        17px;

    margin:
        14px 0;

    border:
        1px solid #fed7aa;

    border-radius:
        12px;

    background:
        #fff7ed;
}

.spray h4 {
    color:
        #7c2d12;
}

.spray ul {
    color:
        #7c2d12;
}


/* ============================================================
   FARMER
============================================================ */

.farmer {
    margin-top:
        15px;

    padding:
        17px 18px;

    border:
        1px solid #a7f3d0;

    border-radius:
        12px;

    background:
        #ecfdf5;
}

.farmer h4 {
    color:
        #166534;
}

.farmer p {
    margin:
        0;

    color:
        #166534;

    font-size:
        13px;

    line-height:
        1.75;
}


/* ============================================================
   MODAL FOOTER
============================================================ */

.modalFooter {
    display:
        flex;

    justify-content:
        center;

    margin-top:
        24px;
}

.modalFooter button {
    height:
        44px;

    padding:
        0 25px;

    border:
        0;

    border-radius:
        10px;

    background:
        #15803d;

    color:
        #ffffff;

    cursor:
        pointer;

    font-size:
        12px;

    font-weight:
        850;

    transition:
        .2s ease;
}

.modalFooter button:hover {
    background:
        #166534;

    transform:
        translateY(-1px);
}


/* ============================================================
   PROFESSIONAL CSS ICON SYSTEM
============================================================ */

.ui-icon {
    position:
        relative;

    display:
        inline-flex;

    flex:
        0 0 auto;

    align-items:
        center;

    justify-content:
        center;

    color:
        currentColor;
}

.ui-icon-tiny {
    width:
        15px;

    height:
        15px;
}

.ui-icon-small {
    width:
        18px;

    height:
        18px;
}

.ui-icon-medium {
    width:
        25px;

    height:
        25px;
}

.ui-icon-large {
    width:
        32px;

    height:
        32px;
}


/* Records icon */

.ui-icon-records {
    display:
        flex;

    align-items:
        flex-end;

    gap:
        3px;

    padding:
        4px;
}

.ui-icon-records > span {
    display:
        block;

    width:
        4px;

    border-radius:
        2px 2px 1px 1px;

    background:
        #16a34a;
}

.ui-icon-records > span:nth-child(1) {
    height:
        12px;
}

.ui-icon-records > span:nth-child(2) {
    height:
        18px;
}

.ui-icon-records > span:nth-child(3) {
    height:
        15px;
}


/* Healthy icon */

.ui-icon-healthy {
    color:
        #15803d;
}

.check-mark {
    width:
        13px;

    height:
        7px;

    border-left:
        3px solid currentColor;

    border-bottom:
        3px solid currentColor;

    transform:
        rotate(-45deg);

    margin-top:
        -3px;
}


/* Disease icon */

.ui-icon-disease {
    color:
        #dc2626;
}

.disease-mark {
    position:
        relative;

    width:
        17px;

    height:
        17px;

    border:
        2px solid currentColor;

    border-radius:
        50%;
}

.disease-mark::before,
.disease-mark::after {
    content:
        "";

    position:
        absolute;

    border-radius:
        50%;

    background:
        currentColor;
}

.disease-mark::before {
    width:
        5px;

    height:
        5px;

    top:
        2px;

    left:
        3px;
}

.disease-mark::after {
    width:
        4px;

    height:
        4px;

    right:
        2px;

    bottom:
        3px;
}

.disease-mark i {
    position:
        absolute;

    width:
        4px;

    height:
        4px;

    border-radius:
        50%;

    background:
        currentColor;
}

.disease-mark i:nth-child(1) {
    left:
        -5px;

    top:
        6px;
}

.disease-mark i:nth-child(2) {
    right:
        -5px;

    top:
        5px;
}

.disease-mark i:nth-child(3) {
    bottom:
        -4px;

    left:
        7px;
}


/* Confidence */

.ui-icon-confidence {
    color:
        #2563eb;
}

.target-mark {
    width:
        18px;

    height:
        18px;

    border:
        2px solid currentColor;

    border-radius:
        50%;
}

.target-mark::before {
    content:
        "";

    position:
        absolute;

    inset:
        4px;

    border:
        2px solid currentColor;

    border-radius:
        50%;
}

.target-mark i {
    width:
        4px;

    height:
        4px;

    border-radius:
        50%;

    background:
        currentColor;
}


/* Search */

.ui-icon-search {
    color:
        #64748b;
}

.search-circle {
    position:
        absolute;

    width:
        11px;

    height:
        11px;

    left:
        1px;

    top:
        1px;

    border:
        2px solid currentColor;

    border-radius:
        50%;
}

.search-handle {
    position:
        absolute;

    width:
        7px;

    height:
        2px;

    left:
        11px;

    top:
        12px;

    border-radius:
        2px;

    background:
        currentColor;

    transform:
        rotate(45deg);

    transform-origin:
        left center;
}


/* Calendar */

.ui-icon-calendar {
    color:
        #64748b;
}

.calendar-top {
    position:
        absolute;

    top:
        2px;

    left:
        3px;

    right:
        3px;

    height:
        4px;

    border:
        1.5px solid currentColor;

    border-bottom:
        0;

    border-radius:
        3px 3px 0 0;
}

.calendar-body {
    position:
        absolute;

    left:
        3px;

    right:
        3px;

    bottom:
        2px;

    top:
        5px;

    display:
        grid;

    grid-template-columns:
        repeat(2, 1fr);

    gap:
        2px;

    padding:
        3px;

    border:
        1.5px solid currentColor;

    border-radius:
        0 0 3px 3px;
}

.calendar-body i {
    width:
        2px;

    height:
        2px;

    margin:
        auto;

    border-radius:
        50%;

    background:
        currentColor;
}


/* Crop / leaf */

.ui-icon-crop {
    color:
        #15803d;
}

.leaf-mark {
    position:
        relative;

    width:
        18px;

    height:
        13px;

    border:
        2px solid currentColor;

    border-radius:
        100% 0 100% 0;

    transform:
        rotate(-35deg);
}

.leaf-mark::after {
    content:
        "";

    position:
        absolute;

    width:
        2px;

    height:
        14px;

    left:
        7px;

    top:
        3px;

    background:
        currentColor;

    transform:
        rotate(38deg);
}

.leaf-mark i {
    display:
        none;
}


/* Details */

.ui-icon-details {
    color:
        currentColor;
}

.details-mark {
    width:
        16px;

    height:
        16px;

    display:
        flex;

    flex-direction:
        column;

    justify-content:
        center;

    gap:
        3px;

    padding:
        3px;

    border:
        1.7px solid currentColor;

    border-radius:
        4px;
}

.details-mark i {
    display:
        block;

    width:
        8px;

    height:
        1.5px;

    border-radius:
        2px;

    background:
        currentColor;
}


/* Warning */

.ui-icon-warning {
    color:
        #dc2626;
}

.warning-mark {
    width:
        17px;

    height:
        17px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border:
        2px solid currentColor;

    border-radius:
        50%;

    font-size:
        10px;

    font-weight:
        900;
}


/* Delete */

.ui-icon-delete {
    color:
        currentColor;
}

.delete-mark {
    position:
        relative;

    width:
        15px;

    height:
        17px;

    border:
        1.8px solid currentColor;

    border-top:
        0;

    border-radius:
        0 0 3px 3px;
}

.delete-mark::before {
    content:
        "";

    position:
        absolute;

    width:
        19px;

    height:
        2px;

    left:
        -4px;

    top:
        -4px;

    border-radius:
        2px;

    background:
        currentColor;
}

.delete-mark::after {
    content:
        "";

    position:
        absolute;

    width:
        7px;

    height:
        2px;

    left:
        2px;

    top:
        -7px;

    border-radius:
        2px;

    background:
        currentColor;
}

.delete-mark i {
    position:
        absolute;

    width:
        1.5px;

    height:
        8px;

    top:
        4px;

    background:
        currentColor;
}

.delete-mark i:nth-child(1) {
    left:
        4px;
}

.delete-mark i:nth-child(2) {
    right:
        4px;
}


/* Refresh */

.ui-icon-refresh {
    color:
        currentColor;
}

.refresh-mark {
    font-size:
        19px;

    font-weight:
        800;

    line-height:
        1;
}


/* Close */

.ui-icon-close {
    color:
        currentColor;
}

.close-mark {
    font-size:
        27px;

    line-height:
        1;

    font-weight:
        400;
}


/* Recommendation */

.ui-icon-recommendation {
    color:
        #15803d;
}

.recommendation-mark {
    position:
        relative;

    width:
        18px;

    height:
        18px;

    border:
        2px solid currentColor;

    border-radius:
        50%;
}

.recommendation-mark::before {
    content:
        "";

    position:
        absolute;

    width:
        6px;

    height:
        6px;

    left:
        4px;

    top:
        4px;

    border-radius:
        50%;

    background:
        currentColor;
}

.recommendation-mark i {
    position:
        absolute;

    width:
        3px;

    height:
        3px;

    border-radius:
        50%;

    background:
        currentColor;
}

.recommendation-mark i:nth-child(1) {
    top:
        -5px;

    left:
        6px;
}

.recommendation-mark i:nth-child(2) {
    bottom:
        -5px;

    left:
        6px;
}

.recommendation-mark i:nth-child(3) {
    right:
        -5px;

    top:
        6px;
}


/* Spray */

.ui-icon-spray {
    color:
        #c2410c;
}

.spray-mark {
    width:
        14px;

    height:
        16px;

    border:
        2px solid currentColor;

    border-radius:
        3px 3px 5px 5px;

    position:
        relative;
}

.spray-mark::before {
    content:
        "";

    position:
        absolute;

    width:
        7px;

    height:
        2px;

    top:
        -4px;

    left:
        2px;

    background:
        currentColor;
}


/* Farmer */

.ui-icon-farmer {
    color:
        #166534;
}

.farmer-mark {
    width:
        16px;

    height:
        16px;

    border:
        2px solid currentColor;

    border-radius:
        50% 50% 45% 45%;
}

.farmer-mark::before {
    content:
        "";

    position:
        absolute;

    width:
        6px;

    height:
        6px;

    left:
        3px;

    top:
        2px;

    border-radius:
        50%;

    background:
        currentColor;
}


/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 1150px) {

    .stats {
        grid-template-columns:
            repeat(
                2,
                1fr
            );
    }

    .toolbar {
        align-items:
            stretch;

        flex-direction:
            column;
    }

    .search {
        width:
            100%;
    }

}


@media (max-width: 850px) {

    .history-page {
        padding:
            25px
            20px
            60px;
    }

    .header {
        align-items:
            flex-start;

        flex-direction:
            column;
    }

    .hero {
        align-items:
            flex-start;

        padding:
            30px;
    }

    .hero h2 {
        font-size:
            27px;
    }

    .resultGrid,
    .modalGrid {
        grid-template-columns:
            1fr;
    }

    .cardTop {
        align-items:
            flex-start;

        flex-direction:
            column;
    }

    .badge {
        align-self:
            flex-start;
    }

}


@media (max-width: 600px) {

    .history-page {
        padding:
            22px
            16px
            50px;
    }

    .stats {
        grid-template-columns:
            1fr;
    }

    .header h1 {
        font-size:
            30px;
    }

    .hero {
        flex-direction:
            column;

        padding:
            25px;
    }

    .heroCount {
        width:
            105px;

        height:
            105px;

        min-width:
            105px;
    }

    .card {
        padding:
            18px;
    }

    .footer {
        align-items:
            stretch;

        flex-direction:
            column;
    }

    .footer button {
        width:
            100%;
    }

    .modal {
        max-height:
            94vh;

        padding:
            20px;
    }

    .dateBox {
        align-items:
            flex-start;

        flex-direction:
            column;
    }

    .modalHead h2 {
        font-size:
            21px;
    }

}

`;

export default History;