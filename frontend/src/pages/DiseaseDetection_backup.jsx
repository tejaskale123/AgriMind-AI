import React, { useEffect, useState } from "react";

function DiseaseDetection() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const [predictionResult, setPredictionResult] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // IMAGE SELECT
    // =========================================================

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setPredictionResult(null);

        // Validate image
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        // Validate size
        if (file.size > 10 * 1024 * 1024) {
            setError("Image size must be less than 10 MB.");
            return;
        }

        setSelectedFile(file);

        // Create preview
        const imageURL = URL.createObjectURL(file);
        setPreview(imageURL);
    };


    // =========================================================
    // CLEAN PREVIEW URL
    // =========================================================

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);


    // =========================================================
    // AI PREDICTION
    // =========================================================

    const handleAnalyze = async () => {

        if (!selectedFile) {
            setError("Please choose a crop leaf image first.");
            return;
        }

        setLoading(true);
        setError("");
        setPredictionResult(null);

        try {

            // Create multipart form
            const formData = new FormData();

            // Backend expects "file"
            formData.append("file", selectedFile);


            // Send image to FastAPI
            const response = await fetch(
                "http://127.0.0.1:8000/predict",
                {
                    method: "POST",
                    body: formData,
                }
            );


            // Read response
            const data = await response.json();


            // Check backend error
            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.message ||
                    "Prediction failed."
                );
            }


            // Save AI result
            setPredictionResult(data);

        } catch (err) {

            console.error("Prediction error:", err);

            setError(
                err.message ||
                "Unable to connect to AI server."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // RESET
    // =========================================================

    const handleReset = () => {

        setSelectedFile(null);
        setPreview(null);
        setPredictionResult(null);
        setError("");

    };

    // =========================================================
// DISEASE RECOMMENDATION
// =========================================================

const getRecommendation = (prediction) => {

    const recommendations = {

        "Bacterial Blight": {
            title: "Bacterial Blight",
            description:
                "Bacterial infection affecting soybean leaves.",

            actions: [
                "Remove and properly dispose of severely affected leaves.",
                "Avoid unnecessary overhead irrigation.",
                "Maintain proper spacing and field sanitation.",
                "Monitor nearby plants for similar symptoms."
            ],

            prevention: [
                "Use healthy planting material.",
                "Maintain good field hygiene.",
                "Avoid working in the field when leaves are wet.",
                "Regularly monitor crop health."
            ]
        },


        "Cercospora Leaf Blight": {
            title: "Cercospora Leaf Blight",
            description:
                "A fungal leaf disease that can affect soybean foliage.",

            actions: [
                "Remove heavily affected plant material where practical.",
                "Improve field air circulation.",
                "Avoid excessive moisture on foliage.",
                "Monitor disease progression regularly."
            ],

            prevention: [
                "Maintain proper plant spacing.",
                "Keep the field clean.",
                "Use recommended disease-management practices.",
                "Monitor leaves regularly."
            ]
        },


        "Rust": {
            title: "Soybean Rust",
            description:
                "A fungal disease that can produce rust-like lesions on soybean leaves.",

            actions: [
                "Inspect surrounding plants for similar symptoms.",
                "Remove severely affected plant material where appropriate.",
                "Avoid prolonged leaf wetness.",
                "Consult a local agricultural expert for fungicide decisions."
            ],

            prevention: [
                "Monitor the crop regularly.",
                "Maintain good field sanitation.",
                "Use locally recommended resistant varieties when available.",
                "Follow local agricultural disease-management guidance."
            ]
        },


        "Sudden Death Syndrome": {
            title: "Sudden Death Syndrome",
            description:
                "A soybean disease associated with root infection and leaf symptoms.",

            actions: [
                "Inspect plant roots and surrounding plants.",
                "Remove severely affected plants when appropriate.",
                "Avoid excessive irrigation and poor drainage.",
                "Consult an agricultural expert for field-level management."
            ],

            prevention: [
                "Maintain good soil drainage.",
                "Use recommended varieties where available.",
                "Maintain proper crop management practices.",
                "Monitor affected areas of the field."
            ]
        },


        "Healthy": {
            title: "Healthy Soybean Plant",
            description:
                "The AI model did not detect one of the trained soybean diseases.",

            actions: [
                "Continue regular crop monitoring.",
                "Maintain proper irrigation.",
                "Maintain appropriate field nutrition.",
                "Inspect leaves regularly for new symptoms."
            ],

            prevention: [
                "Keep the field clean.",
                "Use healthy planting material.",
                "Maintain proper spacing.",
                "Monitor the crop throughout the growing season."
            ]
        }

    };


    return (
        recommendations[prediction] ||
        recommendations["Healthy"]
    );
};


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="page">

            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <div className="page-title">

                <h1>
                    🌱 Disease Detection
                </h1>

                <p>
                    Upload a crop leaf image and let
                    AgriMind AI detect possible diseases.
                </p>

            </div>


            {/* =================================================
                MAIN DETECTION AREA
            ================================================= */}

            <div className="detection-container">


                {/* =================================================
                    UPLOAD CARD
                ================================================= */}

                <div className="upload-card">

                    <div className="upload-icon">
                        📷
                    </div>


                    <h2>
                        Upload Leaf Image
                    </h2>


                    <p>
                        Select a clear image of the crop leaf
                        for AI analysis.
                    </p>


                    {/* IMAGE SELECT */}

                    <label className="upload-button">

                        📁 Choose Image

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                        />

                    </label>


                    {/* =================================================
                        IMAGE PREVIEW
                    ================================================= */}

                    {preview && (

                        <div
                            style={{
                                marginTop: "20px",
                                textAlign: "center"
                            }}
                        >

                            <img
                                src={preview}
                                alt="Selected crop leaf"
                                style={{
                                    width: "380px",
                                    maxWidth: "100%",
                                    maxHeight: "300px",
                                    objectFit: "cover",
                                    borderRadius: "12px",
                                    display: "block",
                                    margin: "0 auto 20px"
                                }}
                            />


                            {/* ANALYZE BUTTON */}

                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={loading}
                                style={{
                                    padding: "12px 25px",
                                    border: "none",
                                    borderRadius: "10px",
                                    background: loading
                                        ? "#9ca3af"
                                        : "#16a34a",
                                    color: "white",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: loading
                                        ? "not-allowed"
                                        : "pointer"
                                }}
                            >

                                {loading
                                    ? "⏳ Analyzing..."
                                    : "🧠 Analyze with AI"
                                }

                            </button>


                            {/* RESET */}

                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={loading}
                                style={{
                                    marginLeft: "10px",
                                    padding: "12px 20px",
                                    border: "1px solid #ccc",
                                    borderRadius: "10px",
                                    background: "white",
                                    color: "#333",
                                    fontSize: "15px",
                                    cursor: loading
                                        ? "not-allowed"
                                        : "pointer"
                                }}
                            >

                                Reset

                            </button>

                        </div>

                    )}


                    <small>
                        Supported formats: JPG, JPEG, PNG
                    </small>

                </div>


                {/* =================================================
                    HOW IT WORKS
                ================================================= */}

                {!predictionResult && !error && (

                    <div className="info-card">

                        <h2>
                            How it works
                        </h2>


                        <div className="step">

                            <span>1</span>

                            <div>

                                <h3>
                                    Upload Image
                                </h3>

                                <p>
                                    Select a clear crop leaf image.
                                </p>

                            </div>

                        </div>


                        <div className="step">

                            <span>2</span>

                            <div>

                                <h3>
                                    AI Analysis
                                </h3>

                                <p>
                                    EfficientNet-B0 analyzes the image.
                                </p>

                            </div>

                        </div>


                        <div className="step">

                            <span>3</span>

                            <div>

                                <h3>
                                    Get Result
                                </h3>

                                <p>
                                    View disease and confidence.
                                </p>

                            </div>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div
                    style={{
                        marginTop: "25px",
                        padding: "18px",
                        borderRadius: "12px",
                        background: "#fee2e2",
                        border: "1px solid #ef4444",
                        color: "#991b1b"
                    }}
                >

                    <strong>
                        ❌ Error
                    </strong>

                    <p style={{ marginBottom: 0 }}>
                        {error}
                    </p>

                </div>

            )}


            {/* =================================================
                AI RESULT
            ================================================= */}

            {predictionResult && (
               
                <div
                    className="result-card"
                    style={{
                        marginTop: "30px",
                        padding: "30px",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>
                        🧠 AI Detection Result
                    </h2>


                    {/* PREDICTION */}

                    <div
                        style={{
                            marginTop: "20px",
                            padding: "20px",
                            background: "#f0fdf4",
                            borderRadius: "12px"
                        }}
                    >

                        <p>
                            <strong>
                                🌱 Crop:
                            </strong>{" "}
                            {predictionResult.crop || "Soybean"}
                        </p>


                        <p>
                            <strong>
                                🦠 Predicted Disease:
                            </strong>
                        </p>


                        <h2
                            style={{
                                color: "#15803d"
                            }}
                        >
                            {predictionResult.prediction}
                        </h2>


                        <p>
                            <strong>
                                🎯 Confidence:
                            </strong>{" "}
                            {predictionResult.confidence}%
                        </p>

                    </div>


                    {/* =================================================
                        ALL PROBABILITIES
                    ================================================= */}

                    {predictionResult.probabilities && (

                        <div style={{ marginTop: "25px" }}>

                            <h3>
                                📊 Class Probabilities
                            </h3>


                            {Object.entries(
                                predictionResult.probabilities
                            ).map(
                                ([disease, probability]) => (

                                    <div
                                        key={disease}
                                        style={{
                                            marginBottom: "15px"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                marginBottom: "5px"
                                            }}
                                        >

                                            <span>
                                                {disease}
                                            </span>

                                            <strong>
                                                {probability}%
                                            </strong>

                                        </div>


                                        <div
                                            style={{
                                                width: "100%",
                                                height: "10px",
                                                background: "#e5e7eb",
                                                borderRadius: "10px",
                                                overflow: "hidden"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: `${probability}%`,
                                                    height: "100%",
                                                    background:
                                                        "#16a34a",
                                                    borderRadius:
                                                        "10px"
                                                }}
                                            />

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {/* RESET */}

                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            marginTop: "20px",
                            padding: "12px 25px",
                            border: "none",
                            borderRadius: "10px",
                            background: "#15803d",
                            color: "white",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >

                        🔄 Analyze Another Image

                    </button>

                </div>

            )}

        </div>
    );
}

export default DiseaseDetection;