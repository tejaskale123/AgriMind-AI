import React from "react";
import { useNavigate } from "react-router-dom";

function Crops() {
    const navigate = useNavigate();

    // =========================================================
    // CROP DATA
    // =========================================================

    const crops = [
        {
            name: "Soybean",
            icon: "🌱",
            description:
                "AI-powered disease detection for soybean leaves.",
            diseases: [
                "Bacterial Blight",
                "Cercospora Leaf Blight",
                "Healthy",
                "Rust",
                "Sudden Death Syndrome",
            ],
            status: "AI Detection Available",
            category: "Pulse Crop",
            supported: true,
        },

        {
            name: "Cotton",
            icon: "🌿",
            description:
                "AI-powered disease detection for cotton leaves.",
            diseases: [
                "Alternaria Leaf Spot",
                "Bacterial Blight",
                "Fusarium Wilt",
                "Healthy Leaf",
                "Verticillium Wilt",
            ],
            status: "AI Detection Available",
            category: "Fiber Crop",
            supported: true,
        },

      {
        name: "Maize",
        icon: "🌽",
        description:
            "AI-powered disease detection for maize leaves.",
        diseases: [
            "Blight",
            "Common Rust",
            "Gray Leaf Spot",
            "Healthy",
        ],
        status: "AI Detection Available",
        category: "Cereal Crop",
        supported: true,
    },

        {
            name: "Tomato",
            icon: "🍅",
            description:
                "Smart disease identification for tomato plant leaves.",
            diseases: [
                "Early Blight",
                "Late Blight",
                "Leaf Mold",
            ],
            status: "Coming Soon",
            category: "Vegetable Crop",
            supported: false,
        },

        {
            name: "Wheat",
            icon: "🌾",
            description:
                "AI-based crop health analysis for wheat leaves.",
            diseases: [
                "Leaf Rust",
                "Stem Rust",
                "Powdery Mildew",
            ],
            status: "Coming Soon",
            category: "Cereal Crop",
            supported: false,
        },

        {
            name: "Bell Pepper",
            icon: "🫑",
            description:
                "Plant health monitoring and disease detection for bell pepper.",
            diseases: [
                "Bacterial Spot",
                "Leaf Spot",
                "Mosaic Virus",
            ],
            status: "Coming Soon",
            category: "Vegetable Crop",
            supported: false,
        },
    ];

    // =========================================================
    // ANALYZE CROP
    // =========================================================

    const handleAnalyze = (crop) => {
        if (!crop.supported) {
            return;
        }

        const cropName = crop.name.trim().toLowerCase();

        sessionStorage.removeItem("selectedCrop");

        sessionStorage.setItem(
            "selectedCrop",
            cropName
        );

        navigate("/detection", {
            state: {
                crop: cropName,
            },
        });
    };

    // =========================================================
    // COUNTS
    // =========================================================

    const supportedCount = crops.filter(
        (crop) => crop.supported
    ).length;

    const comingSoonCount = crops.filter(
        (crop) => !crop.supported
    ).length;

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="crops-page">

            <style>{`

                /* =====================================================
                   PAGE
                ===================================================== */

                .crops-page {
                    min-height: 100%;
                    padding: 30px 34px 70px;
                    color: #10261a;
                    background:
                        radial-gradient(
                            circle at 90% 0%,
                            rgba(34, 197, 94, 0.07),
                            transparent 28%
                        );
                }

                .crops-page * {
                    box-sizing: border-box;
                }


                /* =====================================================
                   HEADER
                ===================================================== */

                .crops-header {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 25px;
                    margin-bottom: 25px;
                }

                .crops-title-area h1 {
                    margin: 0;
                    font-size: 36px;
                    line-height: 1.1;
                    font-weight: 900;
                    letter-spacing: -1px;
                }

                .crops-title-area p {
                    max-width: 720px;
                    margin: 10px 0 0;
                    color: #718096;
                    font-size: 15px;
                    line-height: 1.65;
                }


                /* =====================================================
                   TOP SUMMARY
                ===================================================== */

                .crop-summary {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 16px;
                    margin-bottom: 30px;
                }

                .crop-summary-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    min-height: 92px;
                    padding: 18px;
                    background: rgba(255,255,255,.96);
                    border: 1px solid #e3ebe6;
                    border-radius: 17px;
                    box-shadow:
                        0 6px 22px rgba(15,60,30,.05);
                }

                .crop-summary-icon {
                    width: 48px;
                    height: 48px;
                    min-width: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background: #ecfdf3;
                    font-size: 23px;
                }

                .crop-summary-label {
                    margin: 0 0 4px;
                    color: #718096;
                    font-size: 12px;
                    font-weight: 700;
                }

                .crop-summary-value {
                    margin: 0;
                    font-size: 23px;
                    font-weight: 900;
                }


                /* =====================================================
                   SECTION HEADER
                ===================================================== */

                .crops-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin: 34px 0 16px;
                }

                .crops-section-header h2 {
                    margin: 0;
                    font-size: 23px;
                    font-weight: 900;
                    letter-spacing: -.4px;
                }

                .crops-section-header p {
                    margin: 5px 0 0;
                    color: #718096;
                    font-size: 13px;
                }


                /* =====================================================
                   GRID
                ===================================================== */

                .crops-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 18px;
                }


                /* =====================================================
                   CARD
                ===================================================== */

                .crop-card {
                    position: relative;
                    overflow: hidden;
                    padding: 22px;
                    background: #ffffff;
                    border: 1px solid #e2ebe5;
                    border-radius: 20px;
                    box-shadow:
                        0 7px 24px rgba(15,60,30,.055);
                    transition:
                        transform .2s ease,
                        box-shadow .2s ease,
                        border-color .2s ease;
                }

                .crop-card.supported {
                    cursor: pointer;
                }

                .crop-card.supported:hover {
                    transform: translateY(-4px);
                    border-color: #86efac;
                    box-shadow:
                        0 15px 34px rgba(21,128,61,.12);
                }

                .crop-card.disabled {
                    opacity: .78;
                }

                .crop-card::after {
                    content: "";
                    position: absolute;
                    width: 120px;
                    height: 120px;
                    right: -55px;
                    top: -55px;
                    border-radius: 50%;
                    background: rgba(34,197,94,.045);
                    pointer-events: none;
                }


                /* =====================================================
                   CARD TOP
                ===================================================== */

                .crop-card-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 15px;
                }

                .crop-icon {
                    width: 58px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 16px;
                    background:
                        linear-gradient(
                            145deg,
                            #ecfdf3,
                            #dcfce7
                        );
                    font-size: 31px;
                }

                .crop-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 7px 10px;
                    border-radius: 999px;
                    background: #ecfdf3;
                    color: #15803d;
                    font-size: 10px;
                    font-weight: 850;
                    white-space: nowrap;
                }

                .crop-status::before {
                    content: "";
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #22c55e;
                }

                .crop-status.soon {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .crop-status.soon::before {
                    background: #94a3b8;
                }


                /* =====================================================
                   CARD CONTENT
                ===================================================== */

                .crop-card h3 {
                    margin: 18px 0 7px;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: -.3px;
                }

                .crop-description {
                    min-height: 42px;
                    margin: 0;
                    color: #718096;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .crop-category {
                    display: inline-flex;
                    margin-top: 13px;
                    padding: 6px 9px;
                    border-radius: 8px;
                    background: #f8faf9;
                    color: #64748b;
                    font-size: 11px;
                    font-weight: 750;
                }


                /* =====================================================
                   DISEASES
                ===================================================== */

                .crop-diseases {
                    margin-top: 19px;
                    padding-top: 17px;
                    border-top: 1px solid #edf2ef;
                }

                .crop-diseases-title {
                    margin: 0 0 10px;
                    font-size: 12px;
                    font-weight: 850;
                    color: #334155;
                }

                .disease-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 7px;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .disease-tag {
                    padding: 6px 8px;
                    border-radius: 8px;
                    background: #f8faf9;
                    color: #52616b;
                    font-size: 10px;
                    font-weight: 650;
                    line-height: 1.25;
                }


                /* =====================================================
                   BUTTON
                ===================================================== */

                .crop-button {
                    width: 100%;
                    height: 43px;
                    margin-top: 19px;
                    border: none;
                    border-radius: 11px;
                    background:
                        linear-gradient(
                            135deg,
                            #16a34a,
                            #0f8b40
                        );
                    color: #ffffff;
                    font-size: 13px;
                    font-weight: 850;
                    cursor: pointer;
                    box-shadow:
                        0 7px 16px rgba(22,163,74,.18);
                    transition: .2s ease;
                }

                .crop-button:hover {
                    transform: translateY(-1px);
                    box-shadow:
                        0 10px 20px rgba(22,163,74,.24);
                }


                /* =====================================================
                   INFO BANNER
                ===================================================== */

                .crop-info {
                    position: relative;
                    overflow: hidden;
                    margin-top: 30px;
                    padding: 25px 28px;
                    border: 1px solid #bbf7d0;
                    border-radius: 19px;
                    background:
                        linear-gradient(
                            135deg,
                            #f0fdf4,
                            #ecfdf5
                        );
                }

                .crop-info::after {
                    content: "🌱";
                    position: absolute;
                    right: 35px;
                    top: 15px;
                    font-size: 62px;
                    opacity: .13;
                }

                .crop-info h2 {
                    position: relative;
                    z-index: 1;
                    margin: 0 0 8px;
                    font-size: 19px;
                    font-weight: 900;
                    color: #14532d;
                }

                .crop-info p {
                    position: relative;
                    z-index: 1;
                    max-width: 850px;
                    margin: 0;
                    color: #166534;
                    font-size: 13px;
                    line-height: 1.7;
                }


                /* =====================================================
                   RESPONSIVE
                ===================================================== */

                @media (max-width: 1150px) {

                    .crops-grid {
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr));
                    }

                    .crop-summary {
                        grid-template-columns:
                            repeat(3, minmax(0, 1fr));
                    }
                }

                @media (max-width: 850px) {

                    .crops-page {
                        padding: 24px 20px 50px;
                    }

                    .crops-header {
                        align-items: flex-start;
                    }

                    .crops-grid {
                        grid-template-columns: 1fr;
                    }

                    .crop-summary {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 600px) {

                    .crops-page {
                        padding: 20px 15px 40px;
                    }

                    .crops-title-area h1 {
                        font-size: 29px;
                    }

                    .crops-section-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .crop-card {
                        padding: 19px;
                    }

                    .crop-info {
                        padding: 21px;
                    }

                    .crop-info::after {
                        display: none;
                    }
                }

            `}</style>


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="crops-header">

                <div className="crops-title-area">

                    <h1>
                        🌾 Supported Crops
                    </h1>

                    <p>
                        Explore the crops supported by AgriMind AI
                        and check which ones are currently available
                        for AI-powered disease detection.
                    </p>

                </div>

            </header>


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="crop-summary">

                <div className="crop-summary-card">

                    <div className="crop-summary-icon">
                        🌱
                    </div>

                    <div>
                        <p className="crop-summary-label">
                            Total Crops
                        </p>

                        <h2 className="crop-summary-value">
                            {crops.length}
                        </h2>
                    </div>

                </div>


                <div className="crop-summary-card">

                    <div className="crop-summary-icon">
                        🤖
                    </div>

                    <div>
                        <p className="crop-summary-label">
                            AI Supported
                        </p>

                        <h2 className="crop-summary-value">
                            {supportedCount}
                        </h2>
                    </div>

                </div>


                <div className="crop-summary-card">

                    <div className="crop-summary-icon">
                        🚀
                    </div>

                    <div>
                        <p className="crop-summary-label">
                            Coming Soon
                        </p>

                        <h2 className="crop-summary-value">
                            {comingSoonCount}
                        </h2>
                    </div>

                </div>

            </div>


            {/* =====================================================
                AVAILABLE CROPS
            ===================================================== */}

            <div className="crops-section-header">

                <div>

                    <h2>
                        AI Detection Available
                    </h2>

                    <p>
                        Select a crop to start disease analysis.
                    </p>

                </div>

            </div>


            <div className="crops-grid">

                {crops
                    .filter((crop) => crop.supported)
                    .map((crop) => (

                        <div
                            key={crop.name}
                            className="crop-card supported"
                            onClick={() =>
                                handleAnalyze(crop)
                            }
                        >

                            <div className="crop-card-top">

                                <div className="crop-icon">
                                    {crop.icon}
                                </div>

                                <span className="crop-status">
                                    Available
                                </span>

                            </div>


                            <h3>
                                {crop.name}
                            </h3>


                            <p className="crop-description">
                                {crop.description}
                            </p>


                            <span className="crop-category">
                                {crop.category}
                            </span>


                            <div className="crop-diseases">

                                <p className="crop-diseases-title">
                                    🦠 Detectable Conditions
                                </p>

                                <ul className="disease-list">

                                    {crop.diseases.map(
                                        (disease) => (

                                            <li
                                                key={disease}
                                                className="disease-tag"
                                            >
                                                {disease}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>


                            <button
                                type="button"
                                className="crop-button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleAnalyze(crop);
                                }}
                            >
                                🔬 Analyze {crop.name} →
                            </button>

                        </div>

                    ))}

            </div>


            {/* =====================================================
                COMING SOON
            ===================================================== */}

            <div className="crops-section-header">

                <div>

                    <h2>
                        🌱 More Crops Coming Soon
                    </h2>

                    <p>
                        These crops are planned for future AI
                        disease-detection support.
                    </p>

                </div>

            </div>


            <div className="crops-grid">

                {crops
                    .filter((crop) => !crop.supported)
                    .map((crop) => (

                        <div
                            key={crop.name}
                            className="crop-card disabled"
                        >

                            <div className="crop-card-top">

                                <div className="crop-icon">
                                    {crop.icon}
                                </div>

                                <span className="crop-status soon">
                                    Coming Soon
                                </span>

                            </div>


                            <h3>
                                {crop.name}
                            </h3>


                            <p className="crop-description">
                                {crop.description}
                            </p>


                            <span className="crop-category">
                                {crop.category}
                            </span>


                            <div className="crop-diseases">

                                <p className="crop-diseases-title">
                                    Planned Detection Classes
                                </p>

                                <ul className="disease-list">

                                    {crop.diseases.map(
                                        (disease) => (

                                            <li
                                                key={disease}
                                                className="disease-tag"
                                            >
                                                {disease}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>

                        </div>

                    ))}

            </div>


            {/* =====================================================
                INFO
            ===================================================== */}

            <div className="crop-info">

                <h2>
                    💡 How AgriMind AI Works
                </h2>

                <p>
                    Select Cotton, Soybean, or Maize, continue to Disease
                    Detection, upload a clear crop-leaf image,
                    and let the trained EfficientNet-B0 model
                    analyze the image. AgriMind AI then provides
                    the predicted condition, confidence score,
                    and available disease guidance.
                </p>

            </div>

        </div>
    );
}

export default Crops;