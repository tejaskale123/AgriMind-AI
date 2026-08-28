    import React, { useEffect, useRef, useState } from "react";
    import { useLocation, useNavigate } from "react-router-dom";

    function DiseaseDetection() {
        const location = useLocation();
        const navigate = useNavigate();

        // =========================================================
        // CROP
        // =========================================================

        const routeCrop = location.state?.crop || null;
        const storageCrop = sessionStorage.getItem("selectedCrop") || null;

        const selectedCrop = routeCrop || storageCrop || null;

    const supportedCrops = [
        "cotton",
        "soybean",
        "maize"
    ];

      const cropName =
        selectedCrop === "soybean"
            ? "Soybean"
            : selectedCrop === "cotton"
                ? "Cotton"
                : selectedCrop === "maize"
                    ? "Maize"
                    : "Crop";

        const cropIcon =
           selectedCrop === "soybean"
            ? "🌱"
            : selectedCrop === "maize"
                ? "🌽"
                : "🌿";

        // =========================================================
        // STATE
        // =========================================================

        const [selectedFile, setSelectedFile] = useState(null);
        const [preview, setPreview] = useState(null);

        const [predictionResult, setPredictionResult] = useState(null);
        const [recommendation, setRecommendation] = useState(null);

        const [loading, setLoading] = useState(false);
        const [recommendationLoading, setRecommendationLoading] =
            useState(false);

        const [error, setError] = useState("");
        const [dragActive, setDragActive] = useState(false);

        const [cameraOpen, setCameraOpen] = useState(false);

        const fileInputRef = useRef(null);
        const videoRef = useRef(null);
        const streamRef = useRef(null);

        // =========================================================
        // VALIDATE CROP
        // =========================================================

        useEffect(() => {
            if (!selectedCrop) {
                navigate("/crops", { replace: true });
                return;
            }

            if (!supportedCrops.includes(selectedCrop)) {
                navigate("/crops", { replace: true });
                return;
            }

            sessionStorage.setItem("selectedCrop", selectedCrop);
        }, [selectedCrop, navigate]);

        // =========================================================
        // AUTH TOKEN
        // =========================================================

        const getAuthToken = () => {
            const keys = [
                "access_token",
                "token",
                "accessToken",
                "authToken",
                "jwt",
                "auth"
            ];

            for (const key of keys) {
                const localValue = localStorage.getItem(key);

                if (localValue) {
                    try {
                        const parsed = JSON.parse(localValue);

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
                        return localValue;
                    }
                }

                const sessionValue = sessionStorage.getItem(key);

                if (sessionValue) {
                    try {
                        const parsed = JSON.parse(sessionValue);

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
                        return sessionValue;
                    }
                }
            }

            return null;
        };

        // =========================================================
        // RECOMMENDATION
        // =========================================================

        const fetchRecommendation = async (prediction) => {
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

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.detail ||
                        "Recommendation could not be loaded."
                    );
                }

                setRecommendation(data.recommendation);
            } catch (err) {
                console.error("Recommendation error:", err);
                setRecommendation(null);
            } finally {
                setRecommendationLoading(false);
            }
        };

        // =========================================================
        // FILE PROCESSING
        // =========================================================

        const processFile = (file) => {
            if (!file) return;

            setError("");
            setPredictionResult(null);
            setRecommendation(null);

            if (!file.type.startsWith("image/")) {
                setError(
                    "Please select a valid crop leaf image."
                );
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setError(
                    "Image size must be less than 10 MB."
                );
                return;
            }

            if (preview) {
                URL.revokeObjectURL(preview);
            }

            const imageURL = URL.createObjectURL(file);

            setSelectedFile(file);
            setPreview(imageURL);
        };

        const handleImageChange = (event) => {
            const file = event.target.files?.[0];

            processFile(file);

            event.target.value = "";
        };

        // =========================================================
        // DRAG & DROP
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
        // CAMERA
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

            const canvas = document.createElement("canvas");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

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
                    .catch(() => {});
            }
        }, [cameraOpen]);

        useEffect(() => {
            return () => {
                if (preview) {
                    URL.revokeObjectURL(preview);
                }

                if (streamRef.current) {
                    streamRef.current
                        .getTracks()
                        .forEach((track) =>
                            track.stop()
                        );
                }
            };
        }, [preview]);

        // =========================================================
        // ANALYZE
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

            if (!supportedCrops.includes(selectedCrop)) {
                setError(
                    "Unsupported crop. Please select Cotton or Soybean."
                );
                return;
            }

            setLoading(true);
            setError("");
            setPredictionResult(null);
            setRecommendation(null);

            try {
                const token = getAuthToken();

                if (!token) {
                    throw new Error(
                        "Not authenticated. Please logout and login again."
                    );
                }

                const formData = new FormData();

                formData.append(
                    "file",
                    selectedFile
                );

                formData.append(
                    "crop",
                    selectedCrop
                );

                const response = await fetch(
                    "http://127.0.0.1:8000/predict",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
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
                    if (response.status === 401) {
                        throw new Error(
                            "Authentication expired or invalid. Please logout and login again."
                        );
                    }

                    throw new Error(
                        data.detail ||
                        data.message ||
                        "Prediction failed."
                    );
                }

                if (!data.success) {
                    if (data.warning) {
                        setPredictionResult({
                            ...data,
                            crop:
                                data.crop ||
                                selectedCrop
                        });
                        return;
                    }

                    throw new Error(
                        "AI prediction was not successful."
                    );
                }

                const finalResult = {
                    ...data,
                    crop:
                        data.crop ||
                        selectedCrop
                };

                setPredictionResult(finalResult);

                await fetchRecommendation(
                    data.prediction
                );
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
            setRecommendation(null);
            setError("");
            setLoading(false);
            setRecommendationLoading(false);
            setDragActive(false);
        };

        // =========================================================
        // RESULT HELPERS
        // =========================================================

        const prediction =
            predictionResult?.prediction || "";

        const confidenceValue = Number(
            predictionResult?.confidence || 0
        );

        const isHealthy =
            prediction
                .toLowerCase()
                .includes("healthy");

        const confidenceThreshold = 70;

        const isLowConfidence =
            Boolean(predictionResult) &&
            (
                Number.isNaN(confidenceValue) ||
                confidenceValue <
                    confidenceThreshold
            );

        const displayCropName = String(
            predictionResult?.crop ||
            selectedCrop ||
            "cotton"
        ).replace(
            /^./,
            (char) => char.toUpperCase()
        );

        // =========================================================
        // UI
        // =========================================================

        return (
            <div className="disease-page">

                <style>{`

                    * {
                        box-sizing: border-box;
                    }

                    .disease-page {
                        min-height: 100%;
                        max-width: 1450px;
                        margin: 0 auto;
                        padding: 34px 36px 70px;
                        color: #14251b;
                        background:
                            radial-gradient(
                                circle at 90% 0%,
                                rgba(34,197,94,.07),
                                transparent 30%
                            );
                    }

                    .disease-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 25px;
                        margin-bottom: 28px;
                    }

                    .disease-title-row {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                    }

                    .disease-title-icon {
                        width: 55px;
                        height: 55px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 16px;
                        background: #dcfce7;
                        font-size: 28px;
                        box-shadow: 0 8px 20px rgba(22,163,74,.08);
                    }

                    .disease-header h1 {
                        margin: 0;
                        font-size: 34px;
                        line-height: 1.1;
                        font-weight: 900;
                        letter-spacing: -1px;
                    }

                    .disease-header p {
                        margin: 8px 0 0;
                        color: #718096;
                        font-size: 14px;
                    }

                    .crop-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 10px 15px;
                        border-radius: 999px;
                        background: #ecfdf3;
                        border: 1px solid #bbf7d0;
                        color: #15803d;
                        font-size: 13px;
                        font-weight: 800;
                        white-space: nowrap;
                    }

                    .disease-layout {
                        display: grid;
                        grid-template-columns: minmax(0, 1.55fr) minmax(300px, .75fr);
                        gap: 22px;
                        align-items: stretch;
                    }

                    .disease-card {
                        background: #ffffff;
                        border: 1px solid #e2ebe5;
                        border-radius: 22px;
                        box-shadow: 0 8px 28px rgba(15,60,30,.055);
                    }

                    .upload-panel {
                        padding: 30px;
                    }

                    .panel-heading {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 22px;
                    }

                    .panel-heading h2 {
                        margin: 0;
                        font-size: 21px;
                        font-weight: 850;
                    }

                    .panel-heading span {
                        color: #718096;
                        font-size: 12px;
                    }

                    .upload-zone {
                        min-height: 300px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        padding: 35px;
                        border: 2px dashed #9ee6b5;
                        border-radius: 19px;
                        background: linear-gradient(
                            180deg,
                            #fbfffc,
                            #f3fff6
                        );
                        cursor: pointer;
                        transition: .2s ease;
                        text-align: center;
                    }

                    .upload-zone:hover,
                    .upload-zone.active {
                        border-color: #16a34a;
                        background: #f0fdf4;
                        transform: translateY(-1px);
                    }

                    .upload-icon {
                        width: 72px;
                        height: 72px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 20px;
                        background: #dcfce7;
                        font-size: 34px;
                        margin-bottom: 17px;
                    }

                    .upload-zone h3 {
                        margin: 0 0 7px;
                        font-size: 20px;
                        font-weight: 850;
                    }

                    .upload-zone p {
                        margin: 0;
                        color: #718096;
                        font-size: 13px;
                    }

                    .browse-text {
                        margin-top: 18px;
                        padding: 11px 18px;
                        border-radius: 10px;
                        background: #15803d;
                        color: white;
                        font-size: 13px;
                        font-weight: 800;
                    }

                    .upload-meta {
                        display: flex;
                        justify-content: center;
                        gap: 18px;
                        flex-wrap: wrap;
                        margin-top: 16px;
                        color: #718096;
                        font-size: 12px;
                    }

                    .camera-button {
                        margin-top: 18px;
                        height: 43px;
                        padding: 0 18px;
                        border: 1px solid #bfdbfe;
                        border-radius: 11px;
                        background: #eff6ff;
                        color: #1d4ed8;
                        font-weight: 800;
                        cursor: pointer;
                    }

                    .preview-wrap {
                        padding: 20px;
                        border-radius: 18px;
                        background: #f8faf9;
                        border: 1px solid #e2ebe5;
                    }

                    .preview-image {
                        width: 100%;
                        max-height: 430px;
                        object-fit: contain;
                        display: block;
                        border-radius: 15px;
                        background: #eef2f0;
                    }

                    .file-name {
                        margin-top: 12px;
                        padding: 11px 13px;
                        border-radius: 10px;
                        background: white;
                        border: 1px solid #e5ebe7;
                        color: #64748b;
                        font-size: 12px;
                        word-break: break-word;
                    }

                    .action-row {
                        display: flex;
                        gap: 11px;
                        flex-wrap: wrap;
                        margin-top: 18px;
                    }

                    .primary-button {
                        height: 46px;
                        padding: 0 20px;
                        border: none;
                        border-radius: 11px;
                        background: linear-gradient(
                            135deg,
                            #15803d,
                            #16a34a
                        );
                        color: white;
                        font-weight: 850;
                        cursor: pointer;
                        box-shadow: 0 7px 17px rgba(22,163,74,.2);
                    }

                    .primary-button:hover {
                        transform: translateY(-1px);
                    }

                    .primary-button:disabled {
                        background: #94a3b8;
                        cursor: wait;
                        box-shadow: none;
                    }

                    .secondary-button {
                        height: 46px;
                        padding: 0 18px;
                        border: 1px solid #d7e2db;
                        border-radius: 11px;
                        background: white;
                        color: #334155;
                        font-weight: 750;
                        cursor: pointer;
                    }

                    .camera-panel {
                        margin-top: 18px;
                        padding: 16px;
                        border-radius: 17px;
                        background: #0f172a;
                    }

                    .camera-panel h3 {
                        margin: 0 0 12px;
                        color: white;
                        font-size: 15px;
                    }

                    .camera-video {
                        width: 100%;
                        max-height: 390px;
                        object-fit: cover;
                        border-radius: 13px;
                        background: black;
                    }

                    .camera-actions {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        flex-wrap: wrap;
                        margin-top: 13px;
                    }

                    .camera-capture {
                        height: 42px;
                        padding: 0 18px;
                        border: none;
                        border-radius: 10px;
                        background: #22c55e;
                        color: white;
                        font-weight: 800;
                        cursor: pointer;
                    }

                    .info-panel {
                        padding: 28px;
                    }

                    .info-panel h2 {
                        margin: 0 0 26px;
                        font-size: 21px;
                        font-weight: 850;
                    }

                    .workflow-step {
                        display: flex;
                        gap: 13px;
                        margin-bottom: 25px;
                    }

                    .step-number {
                        width: 39px;
                        height: 39px;
                        min-width: 39px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 12px;
                        background: #dcfce7;
                        color: #15803d;
                        font-weight: 900;
                    }

                    .workflow-step h3 {
                        margin: 0 0 5px;
                        font-size: 15px;
                    }

                    .workflow-step p {
                        margin: 0;
                        color: #718096;
                        font-size: 12px;
                        line-height: 1.6;
                    }

                    .model-box {
                        margin-top: 10px;
                        padding: 16px;
                        border-radius: 15px;
                        background: #f0fdf4;
                        border: 1px solid #bbf7d0;
                    }

                    .model-box-label {
                        color: #64748b;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: .7px;
                    }

                    .model-box strong {
                        display: block;
                        margin-top: 5px;
                        color: #15803d;
                        font-size: 17px;
                    }

                    .error-box {
                        margin-top: 20px;
                        padding: 15px 17px;
                        border: 1px solid #fecaca;
                        border-radius: 13px;
                        background: #fff7f7;
                        color: #991b1b;
                        font-size: 13px;
                    }

                    .result-card {
                        margin-top: 25px;
                        padding: 30px;
                    }

                    .result-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 15px;
                        flex-wrap: wrap;
                        margin-bottom: 22px;
                    }

                    .result-header h2 {
                        margin: 0;
                        font-size: 25px;
                    }

                    .result-header p {
                        margin: 5px 0 0;
                        color: #718096;
                        font-size: 13px;
                    }

                    .complete-badge {
                        padding: 8px 13px;
                        border-radius: 999px;
                        background: #dcfce7;
                        color: #15803d;
                        font-size: 12px;
                        font-weight: 850;
                    }

                    .result-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 14px;
                    }

                    .result-box {
                        padding: 18px;
                        border-radius: 15px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                    }

                    .result-box.green {
                        background: #f0fdf4;
                        border-color: #bbf7d0;
                    }

                    .result-box.orange {
                        background: #fff7ed;
                        border-color: #fed7aa;
                    }

                    .result-box.blue {
                        background: #eff6ff;
                        border-color: #bfdbfe;
                    }

                    .result-label {
                        color: #64748b;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: .6px;
                    }

                    .result-value {
                        margin-top: 7px;
                        font-size: 20px;
                        font-weight: 900;
                    }

                    .green-text {
                        color: #15803d;
                    }

                    .orange-text {
                        color: #c2410c;
                    }

                    .blue-text {
                        color: #1d4ed8;
                    }

                    .recommendation {
                        margin-top: 22px;
                        padding: 23px;
                        border-radius: 18px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                    }

                    .recommendation h2 {
                        margin: 0 0 5px;
                        font-size: 20px;
                    }

                    .recommendation h3 {
                        margin: 15px 0 8px;
                        font-size: 16px;
                    }

                    .recommendation ul {
                        margin: 0;
                        padding-left: 22px;
                        color: #334155;
                        line-height: 1.75;
                        font-size: 13px;
                    }

                    .severity {
                        display: inline-block;
                        margin-top: 8px;
                        padding: 6px 11px;
                        border-radius: 999px;
                        background: #fef3c7;
                        color: #92400e;
                        font-size: 11px;
                        font-weight: 800;
                    }

                    .action-info {
                        margin-top: 16px;
                        padding: 15px;
                        border-radius: 13px;
                        background: #fff7ed;
                        border: 1px solid #fed7aa;
                    }

                    .prevention-info {
                        margin-top: 16px;
                        padding: 15px;
                        border-radius: 13px;
                        background: #f0fdf4;
                        border: 1px solid #bbf7d0;
                    }

                    .spray-info {
                        margin-top: 16px;
                        padding: 15px;
                        border-radius: 13px;
                        background: #eff6ff;
                        border: 1px solid #bfdbfe;
                    }

                    .low-confidence {
                        margin-top: 22px;
                        padding: 22px;
                        border-radius: 17px;
                        background: #fffbeb;
                        border: 1px solid #fde68a;
                        color: #78350f;
                    }

                    .low-confidence h2 {
                        margin: 0 0 8px;
                        color: #92400e;
                        font-size: 20px;
                    }

                    .confidence-warning {
                        margin: 14px 0;
                        padding: 12px;
                        border-radius: 10px;
                        background: #fef3c7;
                        color: #92400e;
                        font-size: 13px;
                        font-weight: 750;
                    }

                    .probabilities {
                        margin-top: 25px;
                        padding: 22px;
                        border-radius: 18px;
                        background: white;
                        border: 1px solid #e2ebe5;
                    }

                    .probabilities h2 {
                        margin: 0 0 20px;
                        font-size: 20px;
                    }

                    .probability-row {
                        margin-bottom: 16px;
                    }

                    .probability-label {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 7px;
                        font-size: 13px;
                    }

                    .progress {
                        width: 100%;
                        height: 9px;
                        overflow: hidden;
                        border-radius: 999px;
                        background: #e5e7eb;
                    }

                    .progress-fill {
                        height: 100%;
                        border-radius: 999px;
                        background: #22c55e;
                        transition: width .5s ease;
                    }

                    .result-footer {
                        display: flex;
                        justify-content: center;
                        margin-top: 25px;
                    }

                    .another-button {
                        height: 46px;
                        padding: 0 22px;
                        border: none;
                        border-radius: 11px;
                        background: #15803d;
                        color: white;
                        font-weight: 850;
                        cursor: pointer;
                    }

                    @media (max-width: 1050px) {
                        .disease-layout {
                            grid-template-columns: 1fr;
                        }
                    }

                    @media (max-width: 750px) {
                        .disease-page {
                            padding: 24px 18px 50px;
                        }

                        .disease-header {
                            flex-direction: column;
                        }

                        .result-grid {
                            grid-template-columns: 1fr;
                        }

                        .upload-panel,
                        .info-panel,
                        .result-card {
                            padding: 22px;
                        }

                        .disease-header h1 {
                            font-size: 28px;
                        }
                    }

                    @media (max-width: 500px) {
                        .disease-title-row {
                            align-items: flex-start;
                        }

                        .disease-title-icon {
                            width: 46px;
                            height: 46px;
                            font-size: 23px;
                        }

                        .upload-zone {
                            min-height: 250px;
                            padding: 25px 15px;
                        }

                        .action-row button {
                            width: 100%;
                        }
                    }

                `}</style>

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <header className="disease-header">

                    <div>

                        <div className="disease-title-row">

                            <div className="disease-title-icon">
                                {cropIcon}
                            </div>

                            <div>

                                <h1>
                                    Disease Detection
                                </h1>

                                <p>
                                    AI-powered crop leaf
                                    disease analysis
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="crop-badge">
                        {cropIcon}
                        {cropName}
                        <span>• AI Ready</span>
                    </div>

                </header>

                {/* =====================================================
                    MAIN UPLOAD AREA
                ===================================================== */}

                {!predictionResult && (

                    <div className="disease-layout">

                        {/* =================================================
                            UPLOAD
                        ================================================= */}

                        <section className="disease-card upload-panel">

                            <div className="panel-heading">

                                <div>
                                    <h2>
                                        Analyze {cropName} Leaf
                                    </h2>

                                    <span>
                                        Upload or capture an
                                        image
                                    </span>
                                </div>

                                <span>
                                    Max 10 MB
                                </span>

                            </div>

                            {!preview ? (

                                <>

                                    <div
                                        className={`upload-zone ${
                                            dragActive
                                                ? "active"
                                                : ""
                                        }`}
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
                                            fileInputRef.current?.click()
                                        }
                                    >

                                        <div className="upload-icon">
                                            📷
                                        </div>

                                        <h3>
                                            Drop your leaf image here
                                        </h3>

                                        <p>
                                            Drag & drop your
                                            image or select
                                            one from your
                                            computer
                                        </p>

                                        <div className="browse-text">
                                            Choose Image
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            hidden
                                            onChange={
                                                handleImageChange
                                            }
                                        />

                                    </div>

                                    <div className="upload-meta">

                                        <span>
                                            ✓ JPG / PNG / WEBP
                                        </span>

                                        <span>
                                            ✓ Up to 10 MB
                                        </span>

                                        <span>
                                            ✓ Clear leaf image
                                        </span>

                                    </div>

                                    <div
                                        style={{
                                            textAlign:
                                                "center"
                                        }}
                                    >

                                        <button
                                            type="button"
                                            className="camera-button"
                                            onClick={
                                                startCamera
                                            }
                                            disabled={
                                                cameraOpen
                                            }
                                        >
                                            📷 Use Camera
                                        </button>

                                    </div>

                                    {cameraOpen && (

                                        <div className="camera-panel">

                                            <h3>
                                                Live Camera
                                            </h3>

                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="camera-video"
                                            />

                                            <div className="camera-actions">

                                                <button
                                                    type="button"
                                                    className="camera-capture"
                                                    onClick={
                                                        capturePhoto
                                                    }
                                                >
                                                    📸 Capture Photo
                                                </button>

                                                <button
                                                    type="button"
                                                    className="secondary-button"
                                                    onClick={
                                                        stopCamera
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                </>

                            ) : (

                                <>

                                    <div className="preview-wrap">

                                        <img
                                            src={preview}
                                            alt={`${cropName} leaf`}
                                            className="preview-image"
                                        />

                                        <div className="file-name">
                                            📄 {selectedFile?.name}
                                        </div>

                                    </div>

                                    <div className="action-row">

                                        <button
                                            type="button"
                                            className="primary-button"
                                            onClick={
                                                handleAnalyze
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            {loading
                                                ? "🔄 AI Analyzing..."
                                                : "🧠 Analyze with AI"}
                                        </button>

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                handleReset
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            ↻ Choose Another
                                        </button>

                                    </div>

                                    {loading && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "16px",
                                                padding:
                                                    "13px",
                                                borderRadius:
                                                    "11px",
                                                background:
                                                    "#f0fdf4",
                                                color:
                                                    "#166534",
                                                fontSize:
                                                    "13px",
                                                textAlign:
                                                    "center"
                                            }}
                                        >
                                            🤖 EfficientNet-B0
                                            is analyzing
                                            your {cropName}
                                            leaf...
                                        </div>

                                    )}

                                </>

                            )}

                        </section>

                        {/* =================================================
                            HOW IT WORKS
                        ================================================= */}

                        <aside className="disease-card info-panel">

                            <h2>
                                🤖 How AI Detection Works
                            </h2>

                            <div className="workflow-step">

                                <div className="step-number">
                                    1
                                </div>

                                <div>

                                    <h3>
                                        Upload Leaf Image
                                    </h3>

                                    <p>
                                        Upload a clear
                                        photograph of the
                                        crop leaf.
                                    </p>

                                </div>

                            </div>

                            <div className="workflow-step">

                                <div className="step-number">
                                    2
                                </div>

                                <div>

                                    <h3>
                                        AI Analysis
                                    </h3>

                                    <p>
                                        EfficientNet-B0
                                        analyzes visual
                                        patterns in the
                                        image.
                                    </p>

                                </div>

                            </div>

                            <div className="workflow-step">

                                <div className="step-number">
                                    3
                                </div>

                                <div>

                                    <h3>
                                        Get Result
                                    </h3>

                                    <p>
                                        Receive the predicted
                                        condition and
                                        confidence score.
                                    </p>

                                </div>

                            </div>

                            <div className="model-box">

                                <div className="model-box-label">
                                    AI MODEL
                                </div>

                                <strong>
                                    EfficientNet-B0
                                </strong>

                                <div
                                    style={{
                                        marginTop:
                                            "5px",
                                        color:
                                            "#64748b",
                                        fontSize:
                                            "11px"
                                    }}
                                >
                                    Crop disease
                                    classification
                                </div>

                            </div>

                        </aside>

                    </div>

                )}

                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (

                    <div className="error-box">

                        <strong>
                            ⚠️ Something went wrong
                        </strong>

                        <div
                            style={{
                                marginTop: "5px"
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

                    <section className="disease-card result-card">

                        <div className="result-header">

                            <div>

                                <h2>
                                    🧠 AI Detection Result
                                </h2>

                                <p>
                                    Analysis completed
                                </p>

                            </div>

                            <div className="complete-badge">
                                ✓ Analysis Complete
                            </div>

                        </div>

                        {/* SUMMARY */}

                        <div className="result-grid">

                            <div className="result-box">

                                <div className="result-label">
                                    Crop
                                </div>

                                <div className="result-value">
                                    {cropIcon}{" "}
                                    {displayCropName}
                                </div>

                            </div>

                            <div
                                className={`result-box ${
                                    isHealthy
                                        ? "green"
                                        : "orange"
                                }`}
                            >

                                <div className="result-label">
                                    Predicted Condition
                                </div>

                                <div
                                    className={`result-value ${
                                        isHealthy
                                            ? "green-text"
                                            : "orange-text"
                                    }`}
                                >
                                    {isHealthy
                                        ? "🌿"
                                        : "🦠"}{" "}
                                    {prediction}
                                </div>

                            </div>

                            <div className="result-box blue">

                                <div className="result-label">
                                    Confidence
                                </div>

                                <div className="result-value blue-text">
                                    🎯{" "}
                                    {confidenceValue.toFixed(2)}%
                                </div>

                            </div>

                        </div>

                        {/* LOW CONFIDENCE */}

                        {isLowConfidence ? (

                            <div className="low-confidence">

                                <h2>
                                    ⚠️ Low Confidence Prediction
                                </h2>

                                <p>
                                    AgriMind AI is not
                                    confident enough in
                                    this prediction to
                                    provide a disease
                                    recommendation.
                                </p>

                                <div className="confidence-warning">
                                    Current confidence:{" "}
                                    {confidenceValue.toFixed(2)}%
                                    {" • "}
                                    Required:{" "}
                                    {confidenceThreshold}%
                                </div>

                                <ul>
                                    <li>
                                        Upload a clearer
                                        leaf image.
                                    </li>

                                    <li>
                                        Keep the complete
                                        leaf visible.
                                    </li>

                                    <li>
                                        Avoid blurry or
                                        dark images.
                                    </li>

                                    <li>
                                        Make sure the crop
                                        is correct.
                                    </li>

                                    <li>
                                        Do not rely on a
                                        low-confidence
                                        result alone.
                                    </li>
                                </ul>

                            </div>

                        ) : recommendationLoading ? (

                            <div className="recommendation">

                                <div
                                    style={{
                                        textAlign:
                                            "center",
                                        color:
                                            "#64748b"
                                    }}
                                >
                                    🤖 Loading AI
                                    recommendation...
                                </div>

                            </div>

                        ) : recommendation ? (

                            <div className="recommendation">

                                <h2>
                                    💡 AI Recommendation
                                </h2>

                                <h3>
                                    {prediction}
                                </h3>

                                <span className="severity">
                                    Severity:{" "}
                                    {recommendation.severity ||
                                        "Not specified"}
                                </span>

                                {recommendation.symptoms?.length >
                                    0 && (

                                    <div>

                                        <h3>
                                            🌿 Symptoms
                                        </h3>

                                        <ul>
                                            {recommendation.symptoms.map(
                                                (item, index) => (
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

                                {recommendation.immediate_action?.length >
                                    0 && (

                                    <div className="action-info">

                                        <h3>
                                            ⚡ Immediate Action
                                        </h3>

                                        <ul>
                                            {recommendation.immediate_action.map(
                                                (item, index) => (
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

                                {recommendation.prevention?.length >
                                    0 && (

                                    <div className="prevention-info">

                                        <h3>
                                            🛡️ Prevention
                                        </h3>

                                        <ul>
                                            {recommendation.prevention.map(
                                                (item, index) => (
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

                                {recommendation.spray_guidance?.length >
                                    0 && (

                                    <div className="spray-info">

                                        <h3>
                                            💧 Spray Guidance
                                        </h3>

                                        <ul>
                                            {recommendation.spray_guidance.map(
                                                (item, index) => (
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

                                {recommendation.treatment?.length >
                                    0 && (

                                    <div>

                                        <h3>
                                            🩺 Treatment / What
                                            You Should Do
                                        </h3>

                                        <ul>
                                            {recommendation.treatment.map(
                                                (item, index) => (
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

                                {recommendation.farmer_action && (

                                    <div className="prevention-info">

                                        <h3>
                                            👨‍🌾 Farmer Action
                                        </h3>

                                        <p
                                            style={{
                                                margin:
                                                    0,
                                                color:
                                                    "#166534",
                                                fontSize:
                                                    "13px",
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

                            <div className="recommendation">

                                <div
                                    style={{
                                        color:
                                            "#64748b"
                                    }}
                                >
                                    Recommendation could
                                    not be loaded for this
                                    prediction.
                                </div>

                            </div>

                        )}

                        {/* =================================================
                            PROBABILITIES
                        ================================================= */}

                    {predictionResult.probabilities &&
                        localStorage.getItem("agrimind_show_probabilities") !== "false" && (

                            <div className="probabilities">

                                <h2>
                                    📊 AI Class Probabilities
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

                                        const value =
                                            Number(
                                                probability
                                            );

                                        const isTop =
                                            disease ===
                                            prediction;

                                        return (

                                            <div
                                                className="probability-row"
                                                key={
                                                    disease
                                                }
                                            >

                                                <div className="probability-label">

                                                    <span
                                                        style={{
                                                            fontWeight:
                                                                isTop
                                                                    ? 800
                                                                    : 500
                                                        }}
                                                    >
                                                        {disease}
                                                    </span>

                                                    <strong>
                                                        {value.toFixed(
                                                            2
                                                        )}%
                                                    </strong>

                                                </div>

                                                <div className="progress">

                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width:
                                                                `${Math.min(
                                                                    Math.max(
                                                                        value,
                                                                        0
                                                                    ),
                                                                    100
                                                                )}%`,
                                                            background:
                                                                isTop
                                                                    ? "#16a34a"
                                                                    : "#86efac"
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

                        <div className="result-footer">

                            <button
                                type="button"
                                className="another-button"
                                onClick={
                                    handleReset
                                }
                            >
                                🔄 Analyze Another Image
                            </button>

                        </div>

                    </section>

                )}

            </div>
        );
    }

    export default DiseaseDetection;