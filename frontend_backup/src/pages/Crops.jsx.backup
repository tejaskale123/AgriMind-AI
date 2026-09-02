import React from "react";
import { useNavigate } from "react-router-dom";

function Crops() {

    const navigate = useNavigate();

    // =========================================================
    // SUPPORTED CROPS
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
                "AI-assisted disease detection for maize crop leaves.",
            diseases: [
                "Leaf Blight",
                "Common Rust",
                "Gray Leaf Spot",
            ],
            status: "Coming Soon",
            category: "Cereal Crop",
            supported: false,
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
    // OPEN DISEASE DETECTION
    // =========================================================

    const handleAnalyze = (crop) => {


        if (!crop.supported) {
            return;
        }


        const cropName =
            crop.name
                .trim()
                .toLowerCase();


        console.log("=================================");
        console.log("🌱 CROP CARD CLICKED:", crop.name);
        console.log("🌱 CROP TO SEND:", cropName);
        console.log("=================================");


        // Clear previous crop
        sessionStorage.removeItem("selectedCrop");


        // Save current crop
        sessionStorage.setItem(
            "selectedCrop",
            cropName
        );


        console.log(
            "🌱 STORAGE AFTER SAVE:",
            sessionStorage.getItem("selectedCrop")
        );


        // Send current crop to Detection page
        navigate(
            "/detection",
            {
                state: {
                    crop: cropName
                }
            }
        );
    };

    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="page-title">

                <h1>
                    🌾 Supported Crops
                </h1>

                <p>
                    Explore crops available in the
                    AgriMind AI system and see which
                    crops are currently supported for
                    AI disease detection.
                </p>

            </div>


            {/* =====================================================
                CROP GRID
            ===================================================== */}

            <div
                className="crop-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px",
                    marginTop: "30px",
                }}
            >

                {crops.map(
                    (crop) => (

                        <div
                            key={crop.name}
                            className="crop-card"
                            style={{
                                background:
                                    "#ffffff",
                                border:
                                    "1px solid #e5e7eb",
                                borderRadius:
                                    "18px",
                                padding:
                                    "25px",
                                boxShadow:
                                    "0 6px 20px rgba(0,0,0,0.06)",
                            }}
                        >

                            {/* =================================================
                                ICON
                            ================================================= */}

                            <div
                                style={{
                                    fontSize:
                                        "45px",
                                    marginBottom:
                                        "12px",
                                }}
                            >
                                {crop.icon}
                            </div>


                            {/* =================================================
                                NAME
                            ================================================= */}

                            <h2
                                style={{
                                    margin:
                                        "0 0 8px 0",
                                    fontSize:
                                        "24px",
                                }}
                            >
                                {crop.name}
                            </h2>


                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <p
                                style={{
                                    color:
                                        "#64748b",
                                    lineHeight:
                                        "1.6",
                                    minHeight:
                                        "52px",
                                }}
                            >
                                {crop.description}
                            </p>


                            {/* =================================================
                                CATEGORY
                            ================================================= */}

                            <div
                                style={{
                                    marginTop:
                                        "12px",
                                    marginBottom:
                                        "12px",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#64748b",
                                }}
                            >
                                Category:{" "}
                                <strong>
                                    {crop.category}
                                </strong>
                            </div>


                            {/* =================================================
                                STATUS
                            ================================================= */}

                            <div
                                style={{
                                    display:
                                        "inline-block",
                                    padding:
                                        "6px 12px",
                                    borderRadius:
                                        "999px",
                                    background:
                                        crop.supported
                                            ? "#dcfce7"
                                            : "#f3f4f6",
                                    color:
                                        crop.supported
                                            ? "#166534"
                                            : "#6b7280",
                                    fontSize:
                                        "13px",
                                    fontWeight:
                                        "700",
                                    marginBottom:
                                        "16px",
                                }}
                            >
                                {crop.status}
                            </div>


                            {/* =================================================
                                DISEASE LIST
                            ================================================= */}

                            <div
                                style={{
                                    marginBottom:
                                        "18px",
                                }}
                            >

                                <h4
                                    style={{
                                        margin:
                                            "0 0 8px 0",
                                    }}
                                >
                                    🦠 Diseases
                                </h4>

                                <ul
                                    style={{
                                        paddingLeft:
                                            "20px",
                                        color:
                                            "#475569",
                                        lineHeight:
                                            "1.7",
                                    }}
                                >

                                    {crop.diseases.map(
                                        (
                                            disease
                                        ) => (

                                            <li
                                                key={
                                                    disease
                                                }
                                            >
                                                {disease}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>


                            {/* =================================================
                                ANALYZE BUTTON
                            ================================================= */}

                            {crop.supported && (

                                <button
                                    type="button"
                                    onClick={() => handleAnalyze(crop)}
                                    style={{
                                        width:
                                            "100%",
                                        padding:
                                            "13px 18px",
                                        border:
                                            "none",
                                        borderRadius:
                                            "10px",
                                        background:
                                            "#16a34a",
                                        color:
                                            "#ffffff",
                                        fontSize:
                                            "15px",
                                        fontWeight:
                                            "700",
                                        cursor:
                                            "pointer",
                                        boxShadow:
                                            "0 5px 15px rgba(22,163,74,0.20)",
                                    }}
                                >
                                    🔬 Analyze Now
                                </button>

                            )}

                        </div>

                    )
                )}

            </div>


            {/* =====================================================
                INFORMATION BOX
            ===================================================== */}

            <div
                style={{
                    marginTop:
                        "35px",
                    padding:
                        "22px",
                    background:
                        "#f0fdf4",
                    border:
                        "1px solid #bbf7d0",
                    borderRadius:
                        "16px",
                }}
            >

                <h2
                    style={{
                        marginTop:
                            0,
                    }}
                >
                    💡 How AgriMind AI Works
                </h2>

                <p
                    style={{
                        color:
                            "#166534",
                        lineHeight:
                            "1.7",
                        marginBottom:
                            0,
                    }}
                >
                    Select Cotton or Soybean,
                    upload a clear leaf image,
                    and let the trained
                    EfficientNet-B0 model
                    analyze the image for
                    possible diseases.
                </p>

            </div>

        </div>
    );
}

export default Crops;

