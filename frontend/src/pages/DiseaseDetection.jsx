import React, { useEffect, useRef, useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

function DiseaseDetection() {

    const location = useLocation();
    const navigate = useNavigate();

    // =========================================================
    // SELECTED CROP
    // =========================================================

    const routeCrop = location.state?.crop || null;

    const storageCrop =
        sessionStorage.getItem("selectedCrop") || null;

    // Route crop gets highest priority
    const selectedCrop =
        routeCrop ||
        storageCrop ||
        null;

    // =========================================================
    // DEBUG CROP
    // =========================================================

    console.log("=================================");
    console.log("🌱 ROUTE CROP:", routeCrop);
    console.log("🌱 STORAGE CROP:", storageCrop);
    console.log("🌱 FINAL SELECTED CROP:", selectedCrop);
    console.log("=================================");

    if (
        selectedCrop &&
        selectedCrop !== "cotton" &&
        selectedCrop !== "soybean"
    ) {
        console.error(
            "❌ Invalid crop:",
            selectedCrop
        );
    }

    // =========================================================
    // VALIDATE CROP
    // =========================================================

    const supportedCrops = [
        "cotton",
        "soybean"
    ];

    useEffect(() => {

        if (!selectedCrop) {

            console.warn(
                "⚠️ No crop selected. Redirecting to Crops page."
            );

            navigate("/crops", {
                replace: true
            });

            return;
        }

        if (!supportedCrops.includes(selectedCrop)) {

            console.warn(
                "⚠️ Unsupported crop:",
                selectedCrop
            );

            navigate("/crops", {
                replace: true
            });

            return;
        }

        // Keep sessionStorage synchronized
        sessionStorage.setItem(
            "selectedCrop",
            selectedCrop
        );

        console.log(
            "✅ Crop synchronized:",
            selectedCrop
        );

    }, [selectedCrop, navigate]);


    // =========================================================
    // FILE STATE
    // =========================================================

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [preview, setPreview] =
        useState(null);

    const [predictionResult, setPredictionResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [dragActive, setDragActive] =
        useState(false);


    const fileInputRef =
        useRef(null);


    // =========================================================
    // CAMERA
    // =========================================================

    const videoRef =
        useRef(null);

    const streamRef =
        useRef(null);

    const [cameraOpen, setCameraOpen] =
        useState(false);


    // =========================================================
    // RECOMMENDATION
    // =========================================================

    const [recommendation, setRecommendation] =
        useState(null);

    const [recommendationLoading, setRecommendationLoading] =
        useState(false);


    // =========================================================
    // FETCH RECOMMENDATION
    // =========================================================

    const fetchRecommendation = async (
        prediction
    ) => {

        if (!prediction) {

            setRecommendation(null);

            return;
        }

        setRecommendationLoading(true);

        try {

            const response = await fetch(
                `http://127.0.0.1:8000/recommendation/${encodeURIComponent(
                    prediction
                )}`
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.detail ||
                    "Recommendation could not be loaded."
                );
            }

            setRecommendation(
                data.recommendation
            );

        } catch (err) {

            console.error(
                "❌ Recommendation error:",
                err
            );

            setRecommendation(null);

        } finally {

            setRecommendationLoading(
                false
            );
        }
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
        setRecommendation(null);

        // Image validation

        if (
            !file.type.startsWith("image/")
        ) {

            setError(
                "Please select a valid crop leaf image."
            );

            return;
        }

        // Size validation

        if (
            file.size >
            10 * 1024 * 1024
        ) {

            setError(
                "Image size must be less than 10 MB."
            );

            return;
        }

        // Remove old preview

        if (preview) {

            URL.revokeObjectURL(
                preview
            );
        }

        const imageURL =
            URL.createObjectURL(file);

        setSelectedFile(file);
        setPreview(imageURL);
    };


    // =========================================================
    // IMAGE SELECT
    // =========================================================

    const handleImageChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];

        processFile(file);

        // Allow same image again

        event.target.value = "";
    };


    // =========================================================
    // DRAG OVER
    // =========================================================

    const handleDragOver = (
        event
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };


    // =========================================================
    // DRAG LEAVE
    // =========================================================

    const handleDragLeave = (
        event
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    };


    // =========================================================
    // DROP
    // =========================================================

    const handleDrop = (
        event
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        const file =
            event.dataTransfer.files?.[0];

        processFile(file);
    };


    // =========================================================
    // START CAMERA
    // =========================================================

    const startCamera = async () => {

        try {

            setError("");

            if (
                !navigator.mediaDevices?.getUserMedia
            ) {

                setError(
                    "Camera is not supported by this browser."
                );

                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        video: {
                            facingMode: {
                                ideal: "environment"
                            }
                        },
                        audio: false
                    }
                );

            streamRef.current =
                stream;

            setCameraOpen(true);

        } catch (err) {

            console.error(
                "❌ Camera error:",
                err
            );

            setError(
                "Camera access failed. Please allow camera permission and try again."
            );

            setCameraOpen(false);
        }
    };


    // =========================================================
    // STOP CAMERA
    // =========================================================

    const stopCamera = () => {

        if (
            streamRef.current
        ) {

            streamRef.current
                .getTracks()
                .forEach(
                    (track) =>
                        track.stop()
                );

            streamRef.current =
                null;
        }

        if (
            videoRef.current
        ) {

            videoRef.current.srcObject =
                null;
        }

        setCameraOpen(false);
    };


    // =========================================================
    // CAPTURE PHOTO
    // =========================================================

    const capturePhoto = () => {

        const video =
            videoRef.current;

        if (
            !video ||
            !video.videoWidth ||
            !video.videoHeight
        ) {

            setError(
                "Camera is not ready yet. Please wait a moment and try again."
            );

            return;
        }

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        const context =
            canvas.getContext("2d");

        if (!context) {

            setError(
                "Unable to capture the camera image."
            );

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

                    setError(
                        "Unable to create the captured image."
                    );

                    return;
                }

                const file =
                    new File(
                        [blob],
                        "camera-leaf.jpg",
                        {
                            type:
                                "image/jpeg"
                        }
                    );

                stopCamera();

                processFile(file);
            },
            "image/jpeg",
            0.92
        );
    };


    // =========================================================
    // CONNECT CAMERA
    // =========================================================

    useEffect(() => {

        if (
            cameraOpen &&
            videoRef.current &&
            streamRef.current
        ) {

            videoRef.current.srcObject =
                streamRef.current;

            videoRef.current
                .play()
                .catch(
                    (err) =>
                        console.warn(
                            "Camera autoplay warning:",
                            err
                        )
                );
        }

    }, [cameraOpen]);


    // =========================================================
    // CLEANUP
    // =========================================================

    useEffect(() => {

        return () => {

            if (preview) {

                URL.revokeObjectURL(
                    preview
                );
            }

            if (
                streamRef.current
            ) {

                streamRef.current
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );
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

        if (!selectedCrop) {

            setError(
                "No crop selected. Please go back to Crops and select Cotton or Soybean."
            );

            return;
        }

        if (
            !supportedCrops.includes(
                selectedCrop
            )
        ) {

            setError(
                `Unsupported crop: ${selectedCrop}. Supported crops are cotton and soybean.`
            );

            return;
        }

        setLoading(true);
        setError("");
        setPredictionResult(null);
        setRecommendation(null);

        try {

            // =================================================
            // FORM DATA
            // =================================================

            const formData =
                new FormData();

            // Image

            formData.append(
                "file",
                selectedFile
            );

            // IMPORTANT:
            // Send ACTUAL selected crop

            formData.append(
                "crop",
                selectedCrop
            );


            // =================================================
            // DEBUG
            // =================================================

            console.log(
                "================================="
            );

            console.log(
                "📤 SENDING TO BACKEND"
            );

            console.log(
                "📷 File:",
                selectedFile.name
            );

            console.log(
                "🌱 Crop:",
                selectedCrop
            );

            console.log(
                "================================="
            );


            // =================================================
            // API REQUEST
            // =================================================

            const response =
                await fetch(
                    "http://127.0.0.1:8000/predict",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            // =================================================
            // RESPONSE
            // =================================================

            let data;

            try {

                data =
                    await response.json();

            } catch {

                throw new Error(
                    "Invalid response received from AI server."
                );
            }


            console.log(
                "📥 BACKEND RESPONSE:",
                data
            );


            // =================================================
            // API ERROR
            // =================================================

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Prediction failed."
                );
            }


            // =================================================
            // WARNING
            // =================================================

            if (
                !data.success &&
                data.warning
            ) {

                setPredictionResult(
                    {
                        ...data,
                        crop:
                            data.crop ||
                            selectedCrop
                    }
                );

                setRecommendation(null);

                return;
            }


            // =================================================
            // SUCCESS VALIDATION
            // =================================================

            if (!data.success) {

                throw new Error(
                    "AI prediction was not successful."
                );
            }


            // =================================================
            // IMPORTANT
            // FORCE SELECTED CROP IN RESULT
            // =================================================

            const finalResult = {

                ...data,

                crop:
                    data.crop ||
                    selectedCrop
            };


            console.log(
                "🌱 FINAL RESULT CROP:",
                finalResult.crop
            );


            setPredictionResult(
                finalResult
            );


            // =================================================
            // RECOMMENDATION
            // =================================================

            await fetchRecommendation(
                data.prediction
            );

        } catch (err) {

            console.error(
                "❌ Prediction error:",
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

            URL.revokeObjectURL(
                preview
            );
        }

        setSelectedFile(null);
        setPreview(null);
        setPredictionResult(null);
        setRecommendation(null);
        setError("");
        setLoading(false);
        setRecommendationLoading(false);
        setDragActive(false);
    };


    // =========================================================
    // RESULT DATA
    // =========================================================

    const isHealthy =
        predictionResult?.prediction
            ?.toLowerCase() ===
        "healthy";

    const CONFIDENCE_THRESHOLD =
        70;

    const confidenceValue =
        Number(
            predictionResult?.confidence ??
            0
        );

    const isLowConfidence =
        Boolean(predictionResult) &&
        (
            Number.isNaN(
                confidenceValue
            ) ||
            confidenceValue <
                CONFIDENCE_THRESHOLD
        );


    // =========================================================
    // DISPLAY CROP NAME
    // =========================================================

    const displayCropName =
        (
            predictionResult?.crop ||
            selectedCrop
        )
            .toString()
            .replace(
                /^./,
                (char) =>
                    char.toUpperCase()
            );


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            className="page"
            style={{
                maxWidth:
                    "1400px",
                margin:
                    "0 auto",
                paddingBottom:
                    "50px"
            }}
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="page-title"
                style={{
                    marginBottom:
                        "28px"
                }}
            >

                <h1
                    style={{
                        fontSize:
                            "34px",
                        marginBottom:
                            "8px"
                    }}
                >
                    🌱 Disease Detection
                </h1>

                <p>
                    Upload a clear{" "}
                    {selectedCrop ===
                    "soybean"
                        ? "soybean"
                        : "cotton"}{" "}
                    leaf image and let
                    AgriMind AI analyze it
                    using EfficientNet-B0.
                </p>

            </div>


            {/* =====================================================
                UPLOAD SECTION
            ===================================================== */}

            {!predictionResult && (

                <div
                    className="detection-container"
                    style={{
                        display:
                            "grid",
                        gridTemplateColumns:
                            "minmax(0, 1.6fr) minmax(300px, 0.8fr)",
                        gap:
                            "24px",
                        alignItems:
                            "stretch"
                    }}
                >

                    {/* =================================================
                        UPLOAD CARD
                    ================================================= */}

                    <div
                        className="upload-card"
                        style={{
                            background:
                                "#ffffff",
                            border:
                                "1px solid #e5e7eb",
                            borderRadius:
                                "22px",
                            padding:
                                "38px",
                            textAlign:
                                "center",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.05)"
                        }}
                    >

                        {!preview ? (

                            <>

                                <div
                                    style={{
                                        width:
                                            "78px",
                                        height:
                                            "78px",
                                        margin:
                                            "0 auto 18px",
                                        borderRadius:
                                            "20px",
                                        background:
                                            "#dcfce7",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        fontSize:
                                            "38px"
                                    }}
                                >
                                    📷
                                </div>


                                <h2
                                    style={{
                                        fontSize:
                                            "26px",
                                        marginBottom:
                                            "10px"
                                    }}
                                >
                                    Upload{" "}
                                    {selectedCrop ===
                                    "soybean"
                                        ? "Soybean"
                                        : "Cotton"}{" "}
                                    Leaf Image
                                </h2>


                                <p
                                    style={{
                                        color:
                                            "#6b7280",
                                        marginBottom:
                                            "25px"
                                    }}
                                >
                                    Upload a clear
                                    image of a{" "}
                                    {selectedCrop ===
                                    "soybean"
                                        ? "soybean"
                                        : "cotton"}{" "}
                                    leaf for AI
                                    analysis.
                                </p>


                                {/* DRAG DROP */}

                                <div
                                    onDragOver={
                                        handleDragOver
                                    }
                                    onDragLeave={
                                        handleDragLeave
                                    }
                                    onDrop={
                                        handleDrop
                                    }
                                    onClick={() =>
                                        fileInputRef
                                            .current
                                            ?.click()
                                    }
                                    style={{
                                        border:
                                            dragActive
                                                ? "2px solid #16a34a"
                                                : "2px dashed #bbf7d0",
                                        borderRadius:
                                            "18px",
                                        padding:
                                            "35px 20px",
                                        background:
                                            dragActive
                                                ? "#f0fdf4"
                                                : "#f8fffa",
                                        cursor:
                                            "pointer",
                                        transition:
                                            "0.2s"
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize:
                                                "32px",
                                            marginBottom:
                                                "10px"
                                        }}
                                    >
                                        📤
                                    </div>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            fontSize:
                                                "17px",
                                            marginBottom:
                                                "7px"
                                        }}
                                    >
                                        Drag & drop
                                        your image
                                        here
                                    </strong>

                                    <span
                                        style={{
                                            color:
                                                "#6b7280",
                                            fontSize:
                                                "14px"
                                        }}
                                    >
                                        or click to
                                        browse
                                    </span>

                                    <input
                                        ref={
                                            fileInputRef
                                        }
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        hidden
                                        onChange={
                                            handleImageChange
                                        }
                                    />

                                </div>


                                {/* CAMERA */}

                                <div
                                    style={{
                                        marginTop:
                                            "18px",
                                        display:
                                            "flex",
                                        justifyContent:
                                            "center"
                                    }}
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            startCamera
                                        }
                                        disabled={
                                            cameraOpen
                                        }
                                        style={{
                                            padding:
                                                "13px 22px",
                                            border:
                                                "none",
                                            borderRadius:
                                                "11px",
                                            background:
                                                cameraOpen
                                                    ? "#9ca3af"
                                                    : "#2563eb",
                                            color:
                                                "#ffffff",
                                            fontSize:
                                                "15px",
                                            fontWeight:
                                                "700",
                                            cursor:
                                                cameraOpen
                                                    ? "not-allowed"
                                                    : "pointer"
                                        }}
                                    >
                                        📷 Use Camera
                                    </button>

                                </div>


                                {/* LIVE CAMERA */}

                                {cameraOpen && (

                                    <div
                                        style={{
                                            marginTop:
                                                "22px",
                                            padding:
                                                "18px",
                                            borderRadius:
                                                "18px",
                                            background:
                                                "#f8fafc",
                                            border:
                                                "1px solid #e5e7eb"
                                        }}
                                    >

                                        <h3>
                                            📷 Live Camera
                                        </h3>

                                        <video
                                            ref={
                                                videoRef
                                            }
                                            autoPlay
                                            playsInline
                                            muted
                                            style={{
                                                width:
                                                    "100%",
                                                maxWidth:
                                                    "720px",
                                                maxHeight:
                                                    "430px",
                                                objectFit:
                                                    "cover",
                                                display:
                                                    "block",
                                                margin:
                                                    "12px auto 0",
                                                borderRadius:
                                                    "16px",
                                                background:
                                                    "#111827"
                                            }}
                                        />

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "center",
                                                gap:
                                                    "12px",
                                                flexWrap:
                                                    "wrap",
                                                marginTop:
                                                    "16px"
                                            }}
                                        >

                                            <button
                                                type="button"
                                                onClick={
                                                    capturePhoto
                                                }
                                                style={{
                                                    padding:
                                                        "13px 24px",
                                                    border:
                                                        "none",
                                                    borderRadius:
                                                        "11px",
                                                    background:
                                                        "#16a34a",
                                                    color:
                                                        "#ffffff",
                                                    fontWeight:
                                                        "700",
                                                    cursor:
                                                        "pointer"
                                                }}
                                            >
                                                📸 Capture
                                                Photo
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    stopCamera
                                                }
                                                style={{
                                                    padding:
                                                        "13px 22px",
                                                    border:
                                                        "1px solid #d1d5db",
                                                    borderRadius:
                                                        "11px",
                                                    background:
                                                        "#ffffff",
                                                    color:
                                                        "#374151",
                                                    fontWeight:
                                                        "600",
                                                    cursor:
                                                        "pointer"
                                                }}
                                            >
                                                ✕ Cancel
                                            </button>

                                        </div>

                                    </div>

                                )}


                                <div
                                    style={{
                                        marginTop:
                                            "18px",
                                        fontSize:
                                            "13px",
                                        color:
                                            "#6b7280"
                                    }}
                                >
                                    JPG, JPEG, PNG,
                                    WEBP • Maximum
                                    10 MB
                                </div>

                            </>

                        ) : (

                            <>

                                <h2
                                    style={{
                                        fontSize:
                                            "24px",
                                        marginBottom:
                                            "18px"
                                    }}
                                >
                                    🖼️ Selected Leaf
                                    Image
                                </h2>


                                <div
                                    style={{
                                        position:
                                            "relative",
                                        maxWidth:
                                            "620px",
                                        margin:
                                            "0 auto"
                                    }}
                                >

                                    <img
                                        src={preview}
                                        alt={`${displayCropName} leaf`}
                                        style={{
                                            width:
                                                "100%",
                                            maxHeight:
                                                "390px",
                                            objectFit:
                                                "contain",
                                            borderRadius:
                                                "18px",
                                            display:
                                                "block",
                                            background:
                                                "#f3f4f6",
                                            border:
                                                "1px solid #e5e7eb"
                                        }}
                                    />

                                </div>


                                <div
                                    style={{
                                        marginTop:
                                            "15px",
                                        padding:
                                            "12px 15px",
                                        borderRadius:
                                            "10px",
                                        background:
                                            "#f8fafc",
                                        color:
                                            "#475569",
                                        fontSize:
                                            "14px",
                                        wordBreak:
                                            "break-word"
                                    }}
                                >
                                    📄{" "}
                                    {selectedFile?.name}
                                </div>


                                {/* ANALYZE */}

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "center",
                                        gap:
                                            "12px",
                                        flexWrap:
                                            "wrap",
                                        marginTop:
                                            "22px"
                                    }}
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            handleAnalyze
                                        }
                                        disabled={
                                            loading
                                        }
                                        style={{
                                            padding:
                                                "14px 28px",
                                            border:
                                                "none",
                                            borderRadius:
                                                "12px",
                                            background:
                                                loading
                                                    ? "#9ca3af"
                                                    : "#16a34a",
                                            color:
                                                "#ffffff",
                                            fontSize:
                                                "16px",
                                            fontWeight:
                                                "700",
                                            cursor:
                                                loading
                                                    ? "not-allowed"
                                                    : "pointer"
                                        }}
                                    >
                                        {loading
                                            ? "🔄 Analyzing..."
                                            : "🧠 Analyze with AgriMind AI"}
                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            handleReset
                                        }
                                        disabled={
                                            loading
                                        }
                                        style={{
                                            padding:
                                                "14px 24px",
                                            border:
                                                "1px solid #d1d5db",
                                            borderRadius:
                                                "12px",
                                            background:
                                                "#ffffff",
                                            color:
                                                "#374151",
                                            fontSize:
                                                "15px",
                                            fontWeight:
                                                "600",
                                            cursor:
                                                loading
                                                    ? "not-allowed"
                                                    : "pointer"
                                        }}
                                    >
                                        ↻ Reset
                                    </button>

                                </div>


                                {loading && (

                                    <div
                                        style={{
                                            marginTop:
                                                "20px",
                                            padding:
                                                "15px",
                                            borderRadius:
                                                "12px",
                                            background:
                                                "#f0fdf4",
                                            color:
                                                "#166534"
                                        }}
                                    >
                                        🤖 EfficientNet-B0
                                        is analyzing
                                        your{" "}
                                        {selectedCrop}
                                        leaf image...
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
                            background:
                                "#ffffff",
                            border:
                                "1px solid #e5e7eb",
                            borderRadius:
                                "22px",
                            padding:
                                "32px",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.05)"
                        }}
                    >

                        <h2
                            style={{
                                fontSize:
                                    "25px",
                                marginBottom:
                                    "28px"
                            }}
                        >
                            🔍 How AgriMind AI Works
                        </h2>


                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "15px",
                                marginBottom:
                                    "25px"
                            }}
                        >

                            <div
                                style={{
                                    minWidth:
                                        "42px",
                                    height:
                                        "42px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#dcfce7",
                                    color:
                                        "#15803d",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontWeight:
                                        "800"
                                }}
                            >
                                1
                            </div>

                            <div>
                                <h3>
                                    Upload Image
                                </h3>

                                <p
                                    style={{
                                        color:
                                            "#6b7280"
                                    }}
                                >
                                    Upload a clear
                                    crop leaf
                                    photograph.
                                </p>
                            </div>

                        </div>


                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "15px",
                                marginBottom:
                                    "25px"
                            }}
                        >

                            <div
                                style={{
                                    minWidth:
                                        "42px",
                                    height:
                                        "42px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#dcfce7",
                                    color:
                                        "#15803d",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontWeight:
                                        "800"
                                }}
                            >
                                2
                            </div>

                            <div>
                                <h3>
                                    AI Analysis
                                </h3>

                                <p
                                    style={{
                                        color:
                                            "#6b7280"
                                    }}
                                >
                                    EfficientNet-B0
                                    analyzes visual
                                    leaf patterns.
                                </p>
                            </div>

                        </div>


                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "15px",
                                marginBottom:
                                    "25px"
                            }}
                        >

                            <div
                                style={{
                                    minWidth:
                                        "42px",
                                    height:
                                        "42px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        "#dcfce7",
                                    color:
                                        "#15803d",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontWeight:
                                        "800"
                                }}
                            >
                                3
                            </div>

                            <div>
                                <h3>
                                    Get Result
                                </h3>

                                <p
                                    style={{
                                        color:
                                            "#6b7280"
                                    }}
                                >
                                    View the predicted
                                    disease and
                                    confidence.
                                </p>
                            </div>

                        </div>


                        <div
                            style={{
                                marginTop:
                                    "30px",
                                padding:
                                    "18px",
                                borderRadius:
                                    "14px",
                                background:
                                    "#f0fdf4",
                                border:
                                    "1px solid #bbf7d0"
                            }}
                        >

                            <strong>
                                🧠 AI Model
                            </strong>

                            <p
                                style={{
                                    marginTop:
                                        "5px",
                                    color:
                                        "#166534"
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
                        marginTop:
                            "24px",
                        padding:
                            "18px 20px",
                        borderRadius:
                            "14px",
                        background:
                            "#fef2f2",
                        border:
                            "1px solid #fecaca",
                        color:
                            "#991b1b"
                    }}
                >

                    <strong>
                        ⚠️ Analysis Error
                    </strong>

                    <div
                        style={{
                            marginTop:
                                "6px"
                        }}
                    >
                        {error}
                    </div>

                </div>

            )}


            {/* =====================================================
                RESULT
            ===================================================== */}

            {predictionResult && (

                <div
                    style={{
                        marginTop:
                            "28px",
                        background:
                            "#ffffff",
                        border:
                            "1px solid #e5e7eb",
                        borderRadius:
                            "22px",
                        padding:
                            "32px",
                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.05)"
                    }}
                >

                    {/* RESULT HEADER */}

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            gap:
                                "15px",
                            flexWrap:
                                "wrap",
                            marginBottom:
                                "24px"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    fontSize:
                                        "28px",
                                    marginBottom:
                                        "5px"
                                }}
                            >
                                🧠 AI Detection Result
                            </h2>

                            <p
                                style={{
                                    color:
                                        "#6b7280"
                                }}
                            >
                                Analysis completed
                                successfully
                            </p>

                        </div>


                        <div
                            style={{
                                padding:
                                    "9px 16px",
                                borderRadius:
                                    "999px",
                                background:
                                    "#dcfce7",
                                color:
                                    "#166534",
                                fontWeight:
                                    "700"
                            }}
                        >
                            ✓ AI Analysis Complete
                        </div>

                    </div>


                    {/* RESULT SUMMARY */}

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap:
                                "16px",
                            marginBottom:
                                "28px"
                        }}
                    >

                        {/* CROP */}

                        <div
                            style={{
                                padding:
                                    "20px",
                                borderRadius:
                                    "16px",
                                background:
                                    "#f8fafc",
                                border:
                                    "1px solid #e5e7eb"
                            }}
                        >

                            <div
                                style={{
                                    color:
                                        "#64748b",
                                    fontSize:
                                        "14px"
                                }}
                            >
                                🌱 Crop
                            </div>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "21px",
                                    marginTop:
                                        "7px"
                                }}
                            >
                                {displayCropName}
                            </strong>

                        </div>


                        {/* PREDICTION */}

                        <div
                            style={{
                                padding:
                                    "20px",
                                borderRadius:
                                    "16px",
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
                                    color:
                                        "#64748b",
                                    fontSize:
                                        "14px"
                                }}
                            >
                                🦠 Predicted Condition
                            </div>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "22px",
                                    color:
                                        isHealthy
                                            ? "#15803d"
                                            : "#c2410c",
                                    marginTop:
                                        "7px"
                                }}
                            >
                                {
                                    predictionResult.prediction
                                }
                            </strong>

                        </div>


                        {/* CONFIDENCE */}

                        <div
                            style={{
                                padding:
                                    "20px",
                                borderRadius:
                                    "16px",
                                background:
                                    "#eff6ff",
                                border:
                                    "1px solid #bfdbfe"
                            }}
                        >

                            <div
                                style={{
                                    color:
                                        "#64748b",
                                    fontSize:
                                        "14px"
                                }}
                            >
                                🎯 Confidence
                            </div>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "25px",
                                    color:
                                        "#1d4ed8",
                                    marginTop:
                                        "7px"
                                }}
                            >
                                {
                                    predictionResult.confidence
                                }%
                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        LOW CONFIDENCE
                    ================================================= */}

                    {isLowConfidence ? (

                        <div
                            style={{
                                padding:
                                    "25px",
                                borderRadius:
                                    "18px",
                                background:
                                    "#fffbeb",
                                border:
                                    "1px solid #fde68a",
                                marginBottom:
                                    "28px"
                            }}
                        >

                            <h2
                                style={{
                                    marginBottom:
                                        "10px",
                                    color:
                                        "#92400e"
                                }}
                            >
                                ⚠️ Low Confidence
                                Prediction
                            </h2>

                            <p
                                style={{
                                    color:
                                        "#78350f",
                                    lineHeight:
                                        "1.7"
                                }}
                            >
                                AgriMind AI is not
                                confident enough
                                in this prediction
                                to provide a
                                disease
                                recommendation.
                            </p>

                            <div
                                style={{
                                    padding:
                                        "14px 16px",
                                    borderRadius:
                                        "12px",
                                    background:
                                        "#fef3c7",
                                    color:
                                        "#92400e",
                                    marginBottom:
                                        "15px",
                                    fontWeight:
                                        "600"
                                }}
                            >
                                Current confidence:{" "}
                                {confidenceValue ||
                                    0}
                                % • Required
                                confidence:{" "}
                                {
                                    CONFIDENCE_THRESHOLD
                                }%
                            </div>

                            <ul
                                style={{
                                    paddingLeft:
                                        "22px",
                                    lineHeight:
                                        "1.8",
                                    color:
                                        "#78350f"
                                }}
                            >
                                <li>
                                    Upload a clearer
                                    leaf image.
                                </li>

                                <li>
                                    Keep the complete
                                    leaf visible.
                                </li>

                                <li>
                                    Avoid blurry,
                                    dark or distant
                                    images.
                                </li>

                                <li>
                                    Make sure the image
                                    is a supported crop.
                                </li>

                                <li>
                                    Do not rely on a
                                    low-confidence
                                    prediction alone.
                                </li>
                            </ul>

                        </div>

                    ) : recommendationLoading ? (

                        <div
                            style={{
                                padding:
                                    "25px",
                                borderRadius:
                                    "18px",
                                background:
                                    "#f8fafc",
                                border:
                                    "1px solid #e2e8f0",
                                marginBottom:
                                    "28px",
                                textAlign:
                                    "center"
                            }}
                        >
                            Loading AI
                            recommendation...
                        </div>

                    ) : recommendation ? (

                        <div
                            style={{
                                padding:
                                    "25px",
                                borderRadius:
                                    "18px",
                                background:
                                    "#f8fafc",
                                border:
                                    "1px solid #e2e8f0",
                                marginBottom:
                                    "28px"
                            }}
                        >

                            <h2>
                                💡 AI Recommendation
                            </h2>

                            <h3
                                style={{
                                    fontSize:
                                        "22px"
                                }}
                            >
                                {
                                    predictionResult.prediction
                                }
                            </h3>

                            <div
                                style={{
                                    display:
                                        "inline-block",
                                    padding:
                                        "6px 12px",
                                    borderRadius:
                                        "999px",
                                    background:
                                        "#fef3c7",
                                    color:
                                        "#92400e",
                                    fontWeight:
                                        "700",
                                    fontSize:
                                        "13px",
                                    marginBottom:
                                        "15px"
                                }}
                            >
                                Severity:{" "}
                                {
                                    recommendation.severity ||
                                    "Not specified"
                                }
                            </div>


                            {/* SYMPTOMS */}

                            <div
                                style={{
                                    marginBottom:
                                        "20px"
                                }}
                            >

                                <h3>
                                    🌿 Symptoms
                                </h3>

                                <ul
                                    style={{
                                        paddingLeft:
                                            "22px",
                                        lineHeight:
                                            "1.8",
                                        color:
                                            "#334155"
                                    }}
                                >

                                    {(
                                        recommendation.symptoms ||
                                        []
                                    ).map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <li
                                                key={
                                                    index
                                                }
                                            >
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>


                            {/* IMMEDIATE ACTION */}

                            {recommendation.immediate_action &&
                                recommendation.immediate_action.length >
                                    0 && (

                                    <div
                                        style={{
                                            marginTop:
                                                "20px",
                                            marginBottom:
                                                "20px",
                                            padding:
                                                "18px",
                                            borderRadius:
                                                "14px",
                                            background:
                                                "#fff7ed",
                                            border:
                                                "1px solid #fed7aa"
                                        }}
                                    >

                                        <h3
                                            style={{
                                                color:
                                                    "#9a3412"
                                            }}
                                        >
                                            ⚡ Immediate
                                            Action
                                        </h3>

                                        <ul
                                            style={{
                                                paddingLeft:
                                                    "22px",
                                                lineHeight:
                                                    "1.8",
                                                color:
                                                    "#7c2d12"
                                            }}
                                        >

                                            {recommendation.immediate_action.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {item}
                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>

                                )}


                            {/* PREVENTION */}

                            <div>

                                <h3>
                                    🛡️ Prevention
                                </h3>

                                <ul
                                    style={{
                                        paddingLeft:
                                            "22px",
                                        lineHeight:
                                            "1.8",
                                        color:
                                            "#334155"
                                    }}
                                >

                                    {(
                                        recommendation.prevention ||
                                        []
                                    ).map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <li
                                                key={
                                                    index
                                                }
                                            >
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>


                            {/* SPRAY GUIDANCE */}

                            {recommendation.spray_guidance &&
                                recommendation.spray_guidance.length >
                                    0 && (

                                    <div
                                        style={{
                                            marginTop:
                                                "20px",
                                            marginBottom:
                                                "20px",
                                            padding:
                                                "18px",
                                            borderRadius:
                                                "14px",
                                            background:
                                                "#eff6ff",
                                            border:
                                                "1px solid #bfdbfe"
                                        }}
                                    >

                                        <h3
                                            style={{
                                                color:
                                                    "#1d4ed8"
                                            }}
                                        >
                                            Spray Guidance
                                        </h3>

                                        <ul
                                            style={{
                                                paddingLeft:
                                                    "22px",
                                                lineHeight:
                                                    "1.8",
                                                color:
                                                    "#1e3a8a"
                                            }}
                                        >

                                            {recommendation.spray_guidance.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {item}
                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>

                                )}


                            {/* TREATMENT */}

                            <div
                                style={{
                                    marginTop:
                                        "20px"
                                }}
                            >

                                <h3>
                                    Treatment /
                                    What You Should Do
                                </h3>

                                <ul
                                    style={{
                                        paddingLeft:
                                            "22px",
                                        lineHeight:
                                            "1.8",
                                        color:
                                            "#334155"
                                    }}
                                >

                                    {(
                                        recommendation.treatment ||
                                        []
                                    ).map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <li
                                                key={
                                                    index
                                                }
                                            >
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>


                            {/* FARMER ACTION */}

                            {recommendation.farmer_action && (

                                <div
                                    style={{
                                        marginTop:
                                            "20px",
                                        padding:
                                            "16px 18px",
                                        borderRadius:
                                            "14px",
                                        background:
                                            "#f0fdf4",
                                        border:
                                            "1px solid #bbf7d0"
                                    }}
                                >

                                    <h3>
                                        Farmer Action
                                    </h3>

                                    <p
                                        style={{
                                            margin:
                                                0,
                                            color:
                                                "#166534",
                                            lineHeight:
                                                "1.7"
                                        }}
                                    >
                                        {
                                            recommendation.farmer_action
                                        }
                                    </p>

                                </div>

                            )}

                        </div>

                    ) : (

                        <div
                            style={{
                                padding:
                                    "25px",
                                borderRadius:
                                    "18px",
                                background:
                                    "#f8fafc",
                                border:
                                    "1px solid #e2e8f0",
                                marginBottom:
                                    "28px"
                            }}
                        >
                            Recommendation could
                            not be loaded for this
                            prediction.
                        </div>

                    )}


                    {/* =================================================
                        CLASS PROBABILITIES
                    ================================================= */}

                    {predictionResult.probabilities && (

                        <div
                            style={{
                                marginBottom:
                                    "28px"
                            }}
                        >

                            <h2
                                style={{
                                    marginBottom:
                                        "20px"
                                }}
                            >
                                📊 Class Probabilities
                            </h2>


                            {Object.entries(
                                predictionResult.probabilities
                            ).map(
                                (
                                    [
                                        disease,
                                        probability
                                    ]
                                ) => {

                                    const isTop =
                                        disease ===
                                        predictionResult.prediction;

                                    return (

                                        <div
                                            key={
                                                disease
                                            }
                                            style={{
                                                marginBottom:
                                                    "17px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
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
                                                    {
                                                        disease
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        probability
                                                    }%
                                                </strong>

                                            </div>


                                            <div
                                                style={{
                                                    width:
                                                        "100%",
                                                    height:
                                                        "11px",
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
                                                        height:
                                                            "100%",
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
                        ANALYZE ANOTHER
                    ================================================= */}

                    <div
                        style={{
                            textAlign:
                                "center",
                            paddingTop:
                                "10px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={
                                handleReset
                            }
                            style={{
                                padding:
                                    "14px 28px",
                                border:
                                    "none",
                                borderRadius:
                                    "12px",
                                background:
                                    "#15803d",
                                color:
                                    "#ffffff",
                                fontSize:
                                    "16px",
                                fontWeight:
                                    "700",
                                cursor:
                                    "pointer"
                            }}
                        >
                            🔄 Analyze Another
                            Image
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default DiseaseDetection;
