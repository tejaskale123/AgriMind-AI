import React, { useEffect, useRef, useState } from "react";

function DiseaseDetection() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [predictionResult, setPredictionResult] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);

    const fileInputRef = useRef(null);

    // =========================================================
    // CAMERA
    // =========================================================

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [cameraOpen, setCameraOpen] = useState(false);


    // =========================================================
    // DISEASE RECOMMENDATIONS
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
    // FILE VALIDATION
    // =========================================================

    const processFile = (file) => {
        if (!file) {
            return;
        }

        setError("");
        setPredictionResult(null);

        // Image validation
        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid crop leaf image."
            );
            return;
        }

        // Size validation
        if (file.size > 10 * 1024 * 1024) {
            setError(
                "Image size must be less than 10 MB."
            );
            return;
        }

        // Remove old preview
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const imageURL = URL.createObjectURL(file);

        setSelectedFile(file);
        setPreview(imageURL);
    };


    // =========================================================
    // IMAGE SELECT
    // =========================================================

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        processFile(file);

        // Allow selecting same image again
        event.target.value = "";
    };


    // =========================================================
    // DRAG EVENTS
    // =========================================================

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };


    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    };


    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        const file = event.dataTransfer.files?.[0];

        processFile(file);
    };


    // =========================================================
    // CAMERA FUNCTIONS
    // =========================================================

    const startCamera = async () => {
        try {
            setError("");

            if (!navigator.mediaDevices?.getUserMedia) {
                setError(
                    "Camera is not supported by this browser."
                );
                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },
                    audio: false
                });

            streamRef.current = stream;
            setCameraOpen(true);

        } catch (err) {
            console.error("Camera error:", err);

            setError(
                "Camera access failed. Please allow camera permission and try again."
            );

            setCameraOpen(false);
        }
    };


    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOpen(false);
    };


    const capturePhoto = () => {
        const video = videoRef.current;

        if (!video || !video.videoWidth || !video.videoHeight) {
            setError(
                "Camera is not ready yet. Please wait a moment and try again."
            );
            return;
        }

        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            setError("Unable to capture the camera image.");
            return;
        }

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setError("Unable to create the captured image.");
                    return;
                }

                const file = new File(
                    [blob],
                    "camera-leaf.jpg",
                    {
                        type: "image/jpeg"
                    }
                );

                stopCamera();
                processFile(file);
            },
            "image/jpeg",
            0.92
        );
    };


    // Connect the camera stream to the video element
    useEffect(() => {
        if (cameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;

            videoRef.current.play().catch((err) => {
                console.warn("Camera autoplay warning:", err);
            });
        }
    }, [cameraOpen]);


    // =========================================================
    // CLEAN PREVIEW + CAMERA
    // =========================================================

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }

            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, [preview]);


    // =========================================================
    // AI PREDICTION
    // =========================================================

    const handleAnalyze = async () => {

        if (!selectedFile) {
            setError(
                "Please choose a crop leaf image first."
            );
            return;
        }

        setLoading(true);
        setError("");
        setPredictionResult(null);

        try {

            const formData = new FormData();

            // FastAPI expects "file"
            formData.append(
                "file",
                selectedFile
            );


            const response = await fetch(
                "http://127.0.0.1:8000/predict",
                {
                    method: "POST",
                    body: formData,
                }
            );


            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Invalid response received from AI server."
                );
            }


            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.message ||
                    "Prediction failed."
                );
            }


            if (!data.success) {
                throw new Error(
                    "AI prediction was not successful."
                );
            }


            setPredictionResult(data);

        } catch (err) {

            console.error(
                "Prediction error:",
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
    // RESET
    // =========================================================

    const handleReset = () => {

        stopCamera();

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setSelectedFile(null);
        setPreview(null);
        setPredictionResult(null);
        setError("");
        setLoading(false);
        setDragActive(false);

    };


    // =========================================================
    // RESULT DATA
    // =========================================================

    const recommendation =
        predictionResult
            ? getRecommendation(
                predictionResult.prediction
            )
            : null;


    const isHealthy =
        predictionResult?.prediction === "Healthy";


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            className="page"
            style={{
                maxWidth: "1400px",
                margin: "0 auto",
                paddingBottom: "50px"
            }}
        >

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div
                className="page-title"
                style={{
                    marginBottom: "28px"
                }}
            >

                <h1
                    style={{
                        fontSize: "34px",
                        marginBottom: "8px"
                    }}
                >
                    🌱 Disease Detection
                </h1>

                <p>
                    Upload a clear crop leaf image and let
                    AgriMind AI analyze it using
                    EfficientNet-B0.
                </p>

            </div>


            {/* =====================================================
                UPLOAD + HOW IT WORKS
            ===================================================== */}

            {!predictionResult && (

                <div
                    className="detection-container"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(0, 1.6fr) minmax(300px, 0.8fr)",
                        gap: "24px",
                        alignItems: "stretch"
                    }}
                >

                    {/* =================================================
                        UPLOAD CARD
                    ================================================= */}

                    <div
                        className="upload-card"
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "22px",
                            padding: "38px",
                            textAlign: "center",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.05)"
                        }}
                    >

                        {!preview ? (

                            <>
                                <div
                                    style={{
                                        width: "78px",
                                        height: "78px",
                                        margin: "0 auto 18px",
                                        borderRadius: "20px",
                                        background: "#dcfce7",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "38px"
                                    }}
                                >
                                    📷
                                </div>


                                <h2
                                    style={{
                                        fontSize: "26px",
                                        marginBottom: "10px"
                                    }}
                                >
                                    Upload Leaf Image
                                </h2>


                                <p
                                    style={{
                                        color: "#6b7280",
                                        marginBottom: "25px"
                                    }}
                                >
                                    Upload a clear image of a
                                    soybean leaf for AI analysis.
                                </p>


                                {/* DRAG & DROP */}

                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    style={{
                                        border:
                                            dragActive
                                                ? "2px solid #16a34a"
                                                : "2px dashed #bbf7d0",
                                        borderRadius: "18px",
                                        padding: "35px 20px",
                                        background:
                                            dragActive
                                                ? "#f0fdf4"
                                                : "#f8fffa",
                                        cursor: "pointer",
                                        transition: "0.2s"
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize: "32px",
                                            marginBottom: "10px"
                                        }}
                                    >
                                        📤
                                    </div>

                                    <strong
                                        style={{
                                            display: "block",
                                            fontSize: "17px",
                                            marginBottom: "7px"
                                        }}
                                    >
                                        Drag & drop your image here
                                    </strong>

                                    <span
                                        style={{
                                            color: "#6b7280",
                                            fontSize: "14px"
                                        }}
                                    >
                                        or click to browse
                                    </span>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        hidden
                                        onChange={handleImageChange}
                                    />

                                </div>


                                {/* CAMERA ACTION */}

                                <div
                                    style={{
                                        marginTop: "18px",
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "12px",
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        disabled={cameraOpen}
                                        style={{
                                            padding: "13px 22px",
                                            border: "none",
                                            borderRadius: "11px",
                                            background: cameraOpen
                                                ? "#9ca3af"
                                                : "#2563eb",
                                            color: "#ffffff",
                                            fontSize: "15px",
                                            fontWeight: "700",
                                            cursor: cameraOpen
                                                ? "not-allowed"
                                                : "pointer",
                                            boxShadow:
                                                cameraOpen
                                                    ? "none"
                                                    : "0 5px 14px rgba(37,99,235,0.20)"
                                        }}
                                    >
                                        📷 Use Camera
                                    </button>
                                </div>


                                {/* LIVE CAMERA */}

                                {cameraOpen && (
                                    <div
                                        style={{
                                            marginTop: "22px",
                                            padding: "18px",
                                            borderRadius: "18px",
                                            background: "#f8fafc",
                                            border: "1px solid #e5e7eb"
                                        }}
                                    >
                                        <h3
                                            style={{
                                                marginBottom: "12px"
                                            }}
                                        >
                                            📷 Live Camera
                                        </h3>

                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            style={{
                                                width: "100%",
                                                maxWidth: "720px",
                                                maxHeight: "430px",
                                                objectFit: "cover",
                                                display: "block",
                                                margin: "0 auto",
                                                borderRadius: "16px",
                                                background: "#111827"
                                            }}
                                        />

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                gap: "12px",
                                                flexWrap: "wrap",
                                                marginTop: "16px"
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={capturePhoto}
                                                style={{
                                                    padding: "13px 24px",
                                                    border: "none",
                                                    borderRadius: "11px",
                                                    background: "#16a34a",
                                                    color: "#ffffff",
                                                    fontSize: "15px",
                                                    fontWeight: "700",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                📸 Capture Photo
                                            </button>

                                            <button
                                                type="button"
                                                onClick={stopCamera}
                                                style={{
                                                    padding: "13px 22px",
                                                    border: "1px solid #d1d5db",
                                                    borderRadius: "11px",
                                                    background: "#ffffff",
                                                    color: "#374151",
                                                    fontSize: "15px",
                                                    fontWeight: "600",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                ✕ Cancel Camera
                                            </button>
                                        </div>

                                        <p
                                            style={{
                                                marginTop: "12px",
                                                marginBottom: 0,
                                                color: "#64748b",
                                                fontSize: "13px"
                                            }}
                                        >
                                            Position the crop leaf clearly inside the camera frame.
                                        </p>
                                    </div>
                                )}


                                <div
                                    style={{
                                        marginTop: "18px",
                                        fontSize: "13px",
                                        color: "#6b7280"
                                    }}
                                >
                                    JPG, JPEG, PNG, WEBP • Maximum 10 MB
                                </div>
                            </>

                        ) : (

                            <>
                                {/* IMAGE PREVIEW */}

                                <h2
                                    style={{
                                        fontSize: "24px",
                                        marginBottom: "18px"
                                    }}
                                >
                                    🖼️ Selected Leaf Image
                                </h2>


                                <div
                                    style={{
                                        position: "relative",
                                        maxWidth: "620px",
                                        margin: "0 auto"
                                    }}
                                >

                                    <img
                                        src={preview}
                                        alt="Selected crop leaf"
                                        style={{
                                            width: "100%",
                                            maxHeight: "390px",
                                            objectFit: "contain",
                                            borderRadius: "18px",
                                            display: "block",
                                            background: "#f3f4f6",
                                            border:
                                                "1px solid #e5e7eb"
                                        }}
                                    />

                                </div>


                                {/* FILE INFORMATION */}

                                <div
                                    style={{
                                        marginTop: "15px",
                                        padding: "12px 15px",
                                        borderRadius: "10px",
                                        background: "#f8fafc",
                                        color: "#475569",
                                        fontSize: "14px",
                                        wordBreak: "break-word"
                                    }}
                                >
                                    📄 {selectedFile?.name}
                                </div>


                                {/* ACTION BUTTONS */}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "12px",
                                        flexWrap: "wrap",
                                        marginTop: "22px"
                                    }}
                                >

                                    <button
                                        type="button"
                                        onClick={handleAnalyze}
                                        disabled={loading}
                                        style={{
                                            padding:
                                                "14px 28px",
                                            border: "none",
                                            borderRadius: "12px",
                                            background:
                                                loading
                                                    ? "#9ca3af"
                                                    : "#16a34a",
                                            color: "white",
                                            fontSize: "16px",
                                            fontWeight: "700",
                                            cursor:
                                                loading
                                                    ? "not-allowed"
                                                    : "pointer",
                                            boxShadow:
                                                loading
                                                    ? "none"
                                                    : "0 6px 18px rgba(22,163,74,0.25)"
                                        }}
                                    >

                                        {loading
                                            ? "🔄 Analyzing..."
                                            : "🧠 Analyze with AgriMind AI"}

                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={loading}
                                        style={{
                                            padding:
                                                "14px 24px",
                                            border:
                                                "1px solid #d1d5db",
                                            borderRadius: "12px",
                                            background: "#ffffff",
                                            color: "#374151",
                                            fontSize: "15px",
                                            fontWeight: "600",
                                            cursor:
                                                loading
                                                    ? "not-allowed"
                                                    : "pointer"
                                        }}
                                    >
                                        ↻ Reset
                                    </button>

                                </div>


                                {/* LOADING */}

                                {loading && (

                                    <div
                                        style={{
                                            marginTop: "20px",
                                            padding: "15px",
                                            borderRadius: "12px",
                                            background: "#f0fdf4",
                                            color: "#166534",
                                            fontSize: "14px"
                                        }}
                                    >
                                        🤖 EfficientNet-B0 is analyzing
                                        your leaf image...
                                    </div>

                                )}

                            </>

                        )}

                    </div>


                    {/* =================================================
                        HOW IT WORKS
                    ================================================= */}

                    <div
                        className="info-card"
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "22px",
                            padding: "32px",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.05)"
                        }}
                    >

                        <h2
                            style={{
                                fontSize: "25px",
                                marginBottom: "28px"
                            }}
                        >
                            🔍 How AgriMind AI Works
                        </h2>


                        {/* STEP 1 */}

                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginBottom: "25px"
                            }}
                        >

                            <div
                                style={{
                                    minWidth: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "800"
                                }}
                            >
                                1
                            </div>

                            <div>
                                <h3>Upload Image</h3>
                                <p
                                    style={{
                                        color: "#6b7280",
                                        marginTop: "5px"
                                    }}
                                >
                                    Upload a clear crop leaf
                                    photograph.
                                </p>
                            </div>

                        </div>


                        {/* STEP 2 */}

                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginBottom: "25px"
                            }}
                        >

                            <div
                                style={{
                                    minWidth: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "800"
                                }}
                            >
                                2
                            </div>

                            <div>
                                <h3>AI Analysis</h3>
                                <p
                                    style={{
                                        color: "#6b7280",
                                        marginTop: "5px"
                                    }}
                                >
                                    EfficientNet-B0 analyzes
                                    visual leaf patterns.
                                </p>
                            </div>

                        </div>


                        {/* STEP 3 */}

                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginBottom: "25px"
                            }}
                        >

                            <div
                                style={{
                                    minWidth: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "800"
                                }}
                            >
                                3
                            </div>

                            <div>
                                <h3>Get Result</h3>
                                <p
                                    style={{
                                        color: "#6b7280",
                                        marginTop: "5px"
                                    }}
                                >
                                    View the predicted disease
                                    and confidence.
                                </p>
                            </div>

                        </div>


                        {/* MODEL INFO */}

                        <div
                            style={{
                                marginTop: "30px",
                                padding: "18px",
                                borderRadius: "14px",
                                background: "#f0fdf4",
                                border:
                                    "1px solid #bbf7d0"
                            }}
                        >

                            <strong>
                                🧠 AI Model
                            </strong>

                            <p
                                style={{
                                    marginTop: "5px",
                                    color: "#166534"
                                }}
                            >
                                EfficientNet-B0
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div
                    style={{
                        marginTop: "24px",
                        padding: "18px 20px",
                        borderRadius: "14px",
                        background: "#fef2f2",
                        border:
                            "1px solid #fecaca",
                        color: "#991b1b"
                    }}
                >

                    <strong>
                        ⚠️ Analysis Error
                    </strong>

                    <div
                        style={{
                            marginTop: "6px"
                        }}
                    >
                        {error}
                    </div>

                </div>

            )}


            {/* =====================================================
                AI RESULT
            ===================================================== */}

            {predictionResult && recommendation && (

                <div
                    style={{
                        marginTop: "28px",
                        background: "#ffffff",
                        border:
                            "1px solid #e5e7eb",
                        borderRadius: "22px",
                        padding: "32px",
                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.05)"
                    }}
                >

                    {/* RESULT HEADER */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            gap: "15px",
                            flexWrap: "wrap",
                            marginBottom: "24px"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    fontSize: "28px",
                                    marginBottom: "5px"
                                }}
                            >
                                🧠 AI Detection Result
                            </h2>

                            <p
                                style={{
                                    color: "#6b7280"
                                }}
                            >
                                Analysis completed successfully
                            </p>

                        </div>


                        <div
                            style={{
                                padding: "9px 16px",
                                borderRadius: "999px",
                                background: "#dcfce7",
                                color: "#166534",
                                fontWeight: "700"
                            }}
                        >
                            ✓ AI Analysis Complete
                        </div>

                    </div>


                    {/* PREDICTION SUMMARY */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "16px",
                            marginBottom: "28px"
                        }}
                    >

                        {/* CROP */}

                        <div
                            style={{
                                padding: "20px",
                                borderRadius: "16px",
                                background: "#f8fafc",
                                border:
                                    "1px solid #e5e7eb"
                            }}
                        >

                            <div
                                style={{
                                    color: "#64748b",
                                    fontSize: "14px"
                                }}
                            >
                                🌱 Crop
                            </div>

                            <strong
                                style={{
                                    display: "block",
                                    fontSize: "21px",
                                    marginTop: "7px"
                                }}
                            >
                                {predictionResult.crop ||
                                    "Soybean"}
                            </strong>

                        </div>


                        {/* PREDICTION */}

                        <div
                            style={{
                                padding: "20px",
                                borderRadius: "16px",
                                background:
                                    isHealthy
                                        ? "#f0fdf4"
                                        : "#fff7ed",
                                border:
                                    isHealthy
                                        ? "1px solid #bbf7d0"
                                        : "1px solid #fed7aa"
                            }}
                        >

                            <div
                                style={{
                                    color: "#64748b",
                                    fontSize: "14px"
                                }}
                            >
                                🦠 Predicted Condition
                            </div>

                            <strong
                                style={{
                                    display: "block",
                                    fontSize: "22px",
                                    color:
                                        isHealthy
                                            ? "#15803d"
                                            : "#c2410c",
                                    marginTop: "7px"
                                }}
                            >
                                {predictionResult.prediction}
                            </strong>

                        </div>


                        {/* CONFIDENCE */}

                        <div
                            style={{
                                padding: "20px",
                                borderRadius: "16px",
                                background: "#eff6ff",
                                border:
                                    "1px solid #bfdbfe"
                            }}
                        >

                            <div
                                style={{
                                    color: "#64748b",
                                    fontSize: "14px"
                                }}
                            >
                                🎯 Confidence
                            </div>

                            <strong
                                style={{
                                    display: "block",
                                    fontSize: "25px",
                                    color: "#1d4ed8",
                                    marginTop: "7px"
                                }}
                            >
                                {predictionResult.confidence}%
                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        RECOMMENDATION
                    ================================================= */}

                    <div
                        style={{
                            padding: "25px",
                            borderRadius: "18px",
                            background:
                                "#f8fafc",
                            border:
                                "1px solid #e2e8f0",
                            marginBottom: "28px"
                        }}
                    >

                        <h2
                            style={{
                                marginBottom: "8px"
                            }}
                        >
                            💡 AI Recommendation
                        </h2>

                        <h3
                            style={{
                                fontSize: "22px",
                                marginBottom: "8px"
                            }}
                        >
                            {recommendation.title}
                        </h3>

                        <p
                            style={{
                                color: "#475569",
                                marginBottom: "20px"
                            }}
                        >
                            {recommendation.description}
                        </p>


                        {/* ACTIONS */}

                        <div
                            style={{
                                marginBottom: "20px"
                            }}
                        >

                            <h3>
                                🌱 What You Should Do
                            </h3>

                            <ul
                                style={{
                                    paddingLeft: "22px",
                                    lineHeight: "1.8",
                                    color: "#334155"
                                }}
                            >

                                {recommendation.actions.map(
                                    (item, index) => (
                                        <li key={index}>
                                            {item}
                                        </li>
                                    )
                                )}

                            </ul>

                        </div>


                        {/* PREVENTION */}

                        <div>

                            <h3>
                                🛡️ Prevention
                            </h3>

                            <ul
                                style={{
                                    paddingLeft: "22px",
                                    lineHeight: "1.8",
                                    color: "#334155"
                                }}
                            >

                                {recommendation.prevention.map(
                                    (item, index) => (
                                        <li key={index}>
                                            {item}
                                        </li>
                                    )
                                )}

                            </ul>

                        </div>

                    </div>


                    {/* =================================================
                        CLASS PROBABILITIES
                    ================================================= */}

                    {predictionResult.probabilities && (

                        <div
                            style={{
                                marginBottom: "28px"
                            }}
                        >

                            <h2
                                style={{
                                    marginBottom: "20px"
                                }}
                            >
                                📊 Class Probabilities
                            </h2>


                            {Object.entries(
                                predictionResult.probabilities
                            ).map(
                                ([disease, probability]) => {

                                    const isTop =
                                        disease ===
                                        predictionResult.prediction;

                                    return (
                                        <div
                                            key={disease}
                                            style={{
                                                marginBottom: "17px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                    marginBottom:
                                                        "7px"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        fontWeight:
                                                            isTop
                                                                ? "700"
                                                                : "500"
                                                    }}
                                                >
                                                    {disease}
                                                </span>

                                                <strong>
                                                    {probability}%
                                                </strong>

                                            </div>


                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "11px",
                                                    background:
                                                        "#e5e7eb",
                                                    borderRadius:
                                                        "999px",
                                                    overflow:
                                                        "hidden"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            `${probability}%`,
                                                        height: "100%",
                                                        background:
                                                            isTop
                                                                ? "#16a34a"
                                                                : "#86efac",
                                                        borderRadius:
                                                            "999px",
                                                        transition:
                                                            "width 0.5s ease"
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
                        ANALYZE ANOTHER IMAGE
                    ================================================= */}

                    <div
                        style={{
                            textAlign: "center",
                            paddingTop: "10px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={handleReset}
                            style={{
                                padding: "14px 28px",
                                border: "none",
                                borderRadius: "12px",
                                background: "#15803d",
                                color: "#ffffff",
                                fontSize: "16px",
                                fontWeight: "700",
                                cursor: "pointer"
                            }}
                        >
                            🔄 Analyze Another Image
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default DiseaseDetection;