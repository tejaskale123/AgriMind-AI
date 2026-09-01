import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function DiseaseDetection() {
    const location = useLocation();
    const navigate = useNavigate();

    // =========================================================
    // CROP
    // =========================================================

    const routeCrop = location.state?.crop || null;
    const storageCrop =
        sessionStorage.getItem("selectedCrop") || null;

    const selectedCrop =
        routeCrop || storageCrop || null;

    const supportedCrops = [
        "cotton",
        "soybean",
        "maize",
        "wheat",
    ];

    const cropName =
        selectedCrop === "soybean"
            ? "Soybean"
            : selectedCrop === "cotton"
                ? "Cotton"
                : selectedCrop === "maize"
                    ? "Maize"
                    : selectedCrop === "wheat"
                        ? "Wheat"
                        : "Crop";

    // =========================================================
    // CROP VISUAL
    // =========================================================

    const CropIcon = () => (
        <span className="crop-icon">
            <span className="crop-icon-stem"></span>
            <span className="crop-icon-leaf leaf-one"></span>
            <span className="crop-icon-leaf leaf-two"></span>
        </span>
    );

    // =========================================================
    // STATE
    // =========================================================

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [preview, setPreview] =
        useState(null);

    const [predictionResult, setPredictionResult] =
        useState(null);

    const [recommendation, setRecommendation] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [recommendationLoading, setRecommendationLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [dragActive, setDragActive] =
        useState(false);

    const [cameraOpen, setCameraOpen] =
        useState(false);

    const fileInputRef =
        useRef(null);

    const videoRef =
        useRef(null);

    const streamRef =
        useRef(null);

    // =========================================================
    // VALIDATE CROP
    // =========================================================

    useEffect(() => {
        if (!selectedCrop) {
            navigate("/crops", {
                replace: true,
            });

            return;
        }

        if (!supportedCrops.includes(selectedCrop)) {
            navigate("/crops", {
                replace: true,
            });

            return;
        }

        sessionStorage.setItem(
            "selectedCrop",
            selectedCrop
        );
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
            "auth",
        ];

        for (const key of keys) {
            const localValue =
                localStorage.getItem(key);

            if (localValue) {
                try {
                    const parsed =
                        JSON.parse(localValue);

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

            const sessionValue =
                sessionStorage.getItem(key);

            if (sessionValue) {
                try {
                    const parsed =
                        JSON.parse(sessionValue);

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
                "Recommendation error:",
                err
            );

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

        if (
            !file.type.startsWith("image/")
        ) {
            setError(
                "Please select a valid crop leaf image."
            );

            return;
        }

        if (
            file.size >
            10 * 1024 * 1024
        ) {
            setError(
                "Image size must be less than 10 MB."
            );

            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const imageURL =
            URL.createObjectURL(file);

        setSelectedFile(file);
        setPreview(imageURL);
    };

    const handleImageChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        processFile(file);

        event.target.value = "";
    };

    // =========================================================
    // DRAG & DROP
    // =========================================================

    const handleDragOver = (
        event
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };

    const handleDragLeave = (
        event
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    };

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
    // CAMERA
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
                                ideal: "environment",
                            },
                        },
                        audio: false,
                    }
                );

            streamRef.current = stream;

            setCameraOpen(true);
        } catch (err) {
            console.error(
                "Camera error:",
                err
            );

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
                .forEach((track) =>
                    track.stop()
                );

            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject =
                null;
        }

        setCameraOpen(false);
    };

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
                                "image/jpeg",
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
                URL.revokeObjectURL(
                    preview
                );
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
                "No crop selected. Please go back to Crops and select a supported crop."
            );

            return;
        }

        if (
            !supportedCrops.includes(
                selectedCrop
            )
        ) {
            setError(
                "Unsupported crop. Please select a supported crop."
            );

            return;
        }

        setLoading(true);
        setError("");
        setPredictionResult(null);
        setRecommendation(null);

        try {
            const token =
                getAuthToken();

            if (!token) {
                throw new Error(
                    "Not authenticated. Please logout and login again."
                );
            }

            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );

            formData.append(
                "crop",
                selectedCrop
            );

            const response =
                await fetch(
                    "http://127.0.0.1:8000/predict",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: formData,
                    }
                );

            let data;

            try {
                data =
                    await response.json();
            } catch {
                throw new Error(
                    "Invalid response received from AI server."
                );
            }

            if (!response.ok) {
                if (
                    response.status === 401
                ) {
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
                            selectedCrop,
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
                    selectedCrop,
            };

            setPredictionResult(
                finalResult
            );

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
        setRecommendationLoading(
            false
        );
        setDragActive(false);
    };

    // =========================================================
    // RESULT HELPERS
    // =========================================================

    const prediction =
        predictionResult?.prediction ||
        "";

    const confidenceValue =
        Number(
            predictionResult?.confidence ||
            0
        );

    const isHealthy =
        prediction
            .toLowerCase()
            .includes("healthy");

    const confidenceThreshold = 70;

    const isLowConfidence =
        Boolean(predictionResult) &&
        (
            Number.isNaN(
                confidenceValue
            ) ||
            confidenceValue <
                confidenceThreshold
        );

    const displayCropName =
        String(
            predictionResult?.crop ||
            selectedCrop ||
            "cotton"
        ).replace(
            /^./,
            (char) =>
                char.toUpperCase()
        );

    // =========================================================
    // ICON COMPONENTS
    // =========================================================

    const UploadIcon = () => (
        <span className="upload-icon">
            <span className="upload-arrow"></span>
            <span className="upload-line"></span>
        </span>
    );

    const CameraIcon = () => (
        <span className="camera-icon">
            <span></span>
        </span>
    );

    const BrainIcon = () => (
        <span className="brain-icon">
            <span></span>
            <span></span>
            <span></span>
        </span>
    );

    const CheckIcon = () => (
        <span className="check-icon">
            ✓
        </span>
    );

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="disease-page">

            <style>{`

                /* =====================================================
                   BASE
                ===================================================== */

                .disease-page {
                    width: 100%;
                    min-height: 100%;
                    padding: 34px 36px 75px;

                    color: #10261a;

                    background:
                        radial-gradient(
                            circle at 94% 0%,
                            rgba(34,197,94,.09),
                            transparent 27%
                        ),
                        linear-gradient(
                            180deg,
                            #f8fcfa 0%,
                            #f3f8f5 100%
                        );
                }

                .disease-page *,
                .disease-page *::before,
                .disease-page *::after {
                    box-sizing: border-box;
                }


                /* =====================================================
                   HEADER
                ===================================================== */

                .disease-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;

                    gap: 25px;

                    margin-bottom: 27px;
                }

                .disease-title-row {
                    display: flex;
                    align-items: center;

                    gap: 15px;
                }

                .disease-title-box {
                    width: 56px;
                    height: 56px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border:
                        1px solid #bbf7d0;

                    border-radius: 17px;

                    background:
                        linear-gradient(
                            145deg,
                            #ecfdf5,
                            #dcfce7
                        );

                    box-shadow:
                        0 8px 20px
                        rgba(22,163,74,.08);
                }

                .disease-header h1 {
                    margin: 0;

                    color: #082518;

                    font-size: 35px;
                    line-height: 1.08;

                    font-weight: 950;

                    letter-spacing: -1.2px;
                }

                .disease-header p {
                    margin:
                        7px 0 0;

                    color: #718096;

                    font-size: 14px;
                }


                /* =====================================================
                   CROP ICON
                ===================================================== */

                .crop-icon {
                    position: relative;

                    width: 29px;
                    height: 29px;

                    display: block;
                }

                .crop-icon-stem {
                    position: absolute;

                    width: 3px;
                    height: 20px;

                    left: 13px;
                    top: 8px;

                    border-radius: 5px;

                    background:
                        #15803d;

                    transform:
                        rotate(12deg);
                }

                .crop-icon-leaf {
                    position: absolute;

                    width: 15px;
                    height: 9px;

                    border:
                        2px solid #22c55e;

                    border-radius:
                        100% 0 100% 0;
                }

                .leaf-one {
                    left: 1px;
                    top: 5px;

                    transform:
                        rotate(-25deg);
                }

                .leaf-two {
                    right: 0;
                    top: 1px;

                    transform:
                        rotate(25deg);
                }


                /* =====================================================
                   AI BADGE
                ===================================================== */

                .crop-badge {
                    display: inline-flex;
                    align-items: center;

                    gap: 9px;

                    padding:
                        10px 15px;

                    border:
                        1px solid #bbf7d0;

                    border-radius:
                        999px;

                    background:
                        rgba(255,255,255,.78);

                    color: #15803d;

                    font-size: 12px;
                    font-weight: 900;

                    box-shadow:
                        0 6px 18px
                        rgba(22,163,74,.05);

                    backdrop-filter:
                        blur(8px);
                }

                .badge-dot {
                    width: 7px;
                    height: 7px;

                    border-radius: 50%;

                    background:
                        #22c55e;

                    box-shadow:
                        0 0 0 4px
                        #dcfce7;
                }


                /* =====================================================
                   LAYOUT
                ===================================================== */

                .disease-layout {
                    display: grid;

                    grid-template-columns:
                        minmax(0, 1.55fr)
                        minmax(310px, .72fr);

                    gap: 22px;

                    align-items: stretch;
                }

                .disease-card {
                    background:
                        rgba(255,255,255,.98);

                    border:
                        1px solid #e2ebe5;

                    border-radius: 22px;

                    box-shadow:
                        0 9px 30px
                        rgba(15,60,30,.055);
                }


                /* =====================================================
                   UPLOAD PANEL
                ===================================================== */

                .upload-panel {
                    padding: 30px;
                }

                .panel-heading {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 20px;

                    margin-bottom: 21px;
                }

                .panel-heading h2 {
                    margin: 0;

                    color: #082518;

                    font-size: 21px;
                    font-weight: 950;

                    letter-spacing: -.4px;
                }

                .panel-heading p {
                    margin:
                        6px 0 0;

                    color: #718096;

                    font-size: 12px;
                }

                .file-limit {
                    color: #718096;

                    font-size: 11px;
                    font-weight: 700;

                    white-space: nowrap;
                }


                /* =====================================================
                   UPLOAD ZONE
                ===================================================== */

                .upload-zone {
                    position: relative;

                    min-height: 325px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    flex-direction: column;

                    padding: 35px;

                    border:
                        2px dashed #91e2aa;

                    border-radius: 19px;

                    background:
                        linear-gradient(
                            180deg,
                            #fbfffc,
                            #f2fff5
                        );

                    cursor: pointer;

                    text-align: center;

                    transition:
                        transform .2s ease,
                        border-color .2s ease,
                        background .2s ease,
                        box-shadow .2s ease;
                }

                .upload-zone:hover,
                .upload-zone.active {
                    transform:
                        translateY(-2px);

                    border-color:
                        #16a34a;

                    background:
                        #f0fdf4;

                    box-shadow:
                        inset 0 0 0 1px
                        rgba(34,197,94,.06);
                }


                /* =====================================================
                   UPLOAD ICON
                ===================================================== */

                .upload-icon {
                    position: relative;

                    width: 70px;
                    height: 70px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    margin-bottom: 17px;

                    border-radius: 19px;

                    background:
                        linear-gradient(
                            145deg,
                            #dcfce7,
                            #bbf7d0
                        );
                }

                .upload-arrow {
                    position: absolute;

                    width: 14px;
                    height: 14px;

                    left: 28px;
                    top: 22px;

                    border-left:
                        3px solid #15803d;

                    border-top:
                        3px solid #15803d;

                    transform:
                        rotate(45deg);
                }

                .upload-line {
                    position: absolute;

                    width: 25px;
                    height: 3px;

                    left: 22px;
                    bottom: 20px;

                    border-radius: 4px;

                    background:
                        #15803d;
                }

                .upload-line::after {
                    content: "";

                    position: absolute;

                    width: 3px;
                    height: 20px;

                    left: 11px;
                    top: -10px;

                    border-radius: 4px;

                    background:
                        #15803d;
                }

                .upload-zone h3 {
                    margin:
                        0 0 7px;

                    color: #082518;

                    font-size: 20px;
                    font-weight: 950;
                }

                .upload-zone p {
                    margin: 0;

                    color: #718096;

                    font-size: 13px;
                    line-height: 1.6;
                }

                .choose-button {
                    margin-top: 19px;

                    padding:
                        11px 20px;

                    border-radius: 10px;

                    background:
                        linear-gradient(
                            135deg,
                            #15803d,
                            #16a34a
                        );

                    color: #ffffff;

                    font-size: 12px;
                    font-weight: 900;

                    box-shadow:
                        0 7px 16px
                        rgba(22,163,74,.18);
                }


                /* =====================================================
                   UPLOAD META
                ===================================================== */

                .upload-meta {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    flex-wrap: wrap;

                    gap: 18px;

                    margin-top: 15px;

                    color: #718096;

                    font-size: 11px;
                    font-weight: 650;
                }

                .meta-check {
                    color:
                        #15803d;
                }


                /* =====================================================
                   CAMERA BUTTON
                ===================================================== */

                .camera-button-wrap {
                    display: flex;
                    justify-content: center;

                    margin-top: 16px;
                }

                .camera-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;

                    gap: 9px;

                    height: 43px;

                    padding:
                        0 18px;

                    border:
                        1px solid #bfdbfe;

                    border-radius: 11px;

                    background:
                        #eff6ff;

                    color:
                        #1d4ed8;

                    font-size: 12px;
                    font-weight: 850;

                    cursor: pointer;

                    transition:
                        transform .2s ease,
                        box-shadow .2s ease;
                }

                .camera-button:hover {
                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 7px 16px
                        rgba(29,78,216,.09);
                }

                .camera-button:disabled {
                    opacity: .55;
                    cursor: not-allowed;
                }


                /* =====================================================
                   CAMERA ICON
                ===================================================== */

                .camera-icon {
                    position: relative;

                    width: 17px;
                    height: 12px;

                    border:
                        2px solid currentColor;

                    border-radius: 3px;
                }

                .camera-icon::before {
                    content: "";

                    position: absolute;

                    width: 6px;
                    height: 3px;

                    left: 3px;
                    top: -5px;

                    border-radius: 2px;

                    background:
                        currentColor;
                }

                .camera-icon span {
                    position: absolute;

                    width: 5px;
                    height: 5px;

                    left: 4px;
                    top: 2px;

                    border:
                        1.5px solid currentColor;

                    border-radius: 50%;
                }


                /* =====================================================
                   PREVIEW
                ===================================================== */

                .preview-wrap {
                    padding: 17px;

                    border:
                        1px solid #e1ebe5;

                    border-radius: 18px;

                    background:
                        #f7faf8;
                }

                .preview-image {
                    width: 100%;
                    max-height: 430px;

                    display: block;

                    object-fit: contain;

                    border-radius: 14px;

                    background:
                        #edf2ef;
                }

                .file-name {
                    margin-top: 11px;

                    padding:
                        10px 13px;

                    border:
                        1px solid #e5ebe7;

                    border-radius: 10px;

                    background:
                        #ffffff;

                    color:
                        #64748b;

                    font-size: 11px;

                    word-break: break-word;
                }


                /* =====================================================
                   ACTIONS
                ===================================================== */

                .action-row {
                    display: flex;

                    gap: 10px;

                    flex-wrap: wrap;

                    margin-top: 17px;
                }

                .primary-button,
                .secondary-button {
                    height: 45px;

                    border-radius: 11px;

                    font-size: 12px;
                    font-weight: 900;

                    cursor: pointer;

                    transition:
                        transform .2s ease,
                        box-shadow .2s ease;
                }

                .primary-button {
                    flex: 1;

                    min-width: 190px;

                    border:
                        1px solid #16a34a;

                    background:
                        linear-gradient(
                            135deg,
                            #15803d,
                            #16a34a
                        );

                    color: #ffffff;

                    box-shadow:
                        0 8px 18px
                        rgba(22,163,74,.19);
                }

                .primary-button:hover {
                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 12px 23px
                        rgba(22,163,74,.25);
                }

                .primary-button:disabled {
                    opacity: .65;
                    cursor: wait;
                    transform: none;
                }

                .secondary-button {
                    padding:
                        0 17px;

                    border:
                        1px solid #d7e2db;

                    background:
                        #ffffff;

                    color:
                        #334155;
                }

                .secondary-button:hover {
                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 7px 15px
                        rgba(15,60,30,.06);
                }


                /* =====================================================
                   CAMERA PANEL
                ===================================================== */

                .camera-panel {
                    margin-top: 18px;

                    padding: 16px;

                    border-radius: 17px;

                    background:
                        #0b1710;

                    box-shadow:
                        0 15px 30px
                        rgba(0,0,0,.14);
                }

                .camera-panel-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    margin-bottom: 12px;

                    color: #ffffff;

                    font-size: 13px;
                    font-weight: 850;
                }

                .live-indicator {
                    display: inline-flex;
                    align-items: center;

                    gap: 6px;

                    color:
                        #86efac;

                    font-size: 10px;
                    font-weight: 800;
                }

                .live-indicator::before {
                    content: "";

                    width: 6px;
                    height: 6px;

                    border-radius: 50%;

                    background:
                        #22c55e;
                }

                .camera-video {
                    width: 100%;
                    max-height: 390px;

                    display: block;

                    object-fit: cover;

                    border-radius: 13px;

                    background:
                        #000000;
                }

                .camera-actions {
                    display: flex;
                    justify-content: center;

                    gap: 9px;

                    margin-top: 12px;
                }

                .capture-button {
                    height: 42px;

                    padding:
                        0 18px;

                    border: none;

                    border-radius: 10px;

                    background:
                        #22c55e;

                    color:
                        #052e16;

                    font-size: 12px;
                    font-weight: 900;

                    cursor: pointer;
                }


                /* =====================================================
                   INFO PANEL
                ===================================================== */

                .info-panel {
                    padding: 28px;
                }

                .info-panel-heading {
                    display: flex;
                    align-items: center;

                    gap: 11px;

                    margin-bottom: 26px;
                }

                .info-heading-icon {
                    width: 39px;
                    height: 39px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 12px;

                    background:
                        #f0fdf4;

                    border:
                        1px solid #bbf7d0;
                }

                .brain-icon {
                    position: relative;

                    width: 19px;
                    height: 19px;

                    border:
                        2px solid #15803d;

                    border-radius:
                        45% 55% 45% 55%;
                }

                .brain-icon span {
                    position: absolute;

                    width: 4px;
                    height: 4px;

                    border-radius: 50%;

                    background:
                        #22c55e;
                }

                .brain-icon span:nth-child(1) {
                    left: 4px;
                    top: 4px;
                }

                .brain-icon span:nth-child(2) {
                    right: 3px;
                    top: 7px;
                }

                .brain-icon span:nth-child(3) {
                    left: 7px;
                    bottom: 3px;
                }

                .info-panel h2 {
                    margin: 0;

                    color:
                        #082518;

                    font-size: 20px;
                    font-weight: 950;
                }

                .workflow-step {
                    display: flex;

                    gap: 13px;

                    margin-bottom: 24px;
                }

                .step-number {
                    width: 38px;
                    height: 38px;

                    min-width: 38px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 11px;

                    background:
                        #dcfce7;

                    color:
                        #15803d;

                    font-size: 13px;
                    font-weight: 950;
                }

                .workflow-step h3 {
                    margin:
                        0 0 5px;

                    color:
                        #10261a;

                    font-size: 14px;
                    font-weight: 900;
                }

                .workflow-step p {
                    margin: 0;

                    color:
                        #718096;

                    font-size: 11px;

                    line-height: 1.65;
                }

                .model-box {
                    margin-top: 7px;

                    padding:
                        16px;

                    border:
                        1px solid #bbf7d0;

                    border-radius: 15px;

                    background:
                        linear-gradient(
                            135deg,
                            #f0fdf4,
                            #ecfdf5
                        );
                }

                .model-label {
                    color:
                        #64748b;

                    font-size: 9px;
                    font-weight: 900;

                    letter-spacing:
                        1px;
                }

                .model-name {
                    margin-top: 5px;

                    color:
                        #15803d;

                    font-size: 17px;
                    font-weight: 950;
                }

                .model-description {
                    margin-top: 4px;

                    color:
                        #64748b;

                    font-size: 10px;
                }


                /* =====================================================
                   ERROR
                ===================================================== */

                .error-box {
                    display: flex;
                    align-items: flex-start;

                    gap: 10px;

                    margin-top: 20px;

                    padding:
                        14px 16px;

                    border:
                        1px solid #fecaca;

                    border-radius: 13px;

                    background:
                        #fff7f7;

                    color:
                        #991b1b;

                    font-size: 12px;

                    line-height: 1.6;
                }

                .error-title {
                    font-weight: 900;
                }


                /* =====================================================
                   LOADING
                ===================================================== */

                .loading-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    gap: 9px;

                    margin-top: 15px;

                    padding:
                        13px;

                    border:
                        1px solid #bbf7d0;

                    border-radius: 11px;

                    background:
                        #f0fdf4;

                    color:
                        #166534;

                    font-size: 12px;
                    font-weight: 750;
                }

                .loading-spinner {
                    width: 15px;
                    height: 15px;

                    border:
                        2px solid #bbf7d0;

                    border-top-color:
                        #16a34a;

                    border-radius: 50%;

                    animation:
                        spin .8s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform:
                            rotate(360deg);
                    }
                }


                /* =====================================================
                   RESULT
                ===================================================== */

                .result-card {
                    margin-top: 24px;

                    padding: 30px;
                }

                .result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 15px;

                    margin-bottom: 23px;
                }

                .result-title-wrap {
                    display: flex;
                    align-items: center;

                    gap: 12px;
                }

                .result-title-icon {
                    width: 44px;
                    height: 44px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 13px;

                    background:
                        #dcfce7;

                    color:
                        #15803d;

                    font-size: 19px;
                    font-weight: 950;
                }

                .result-header h2 {
                    margin: 0;

                    color:
                        #082518;

                    font-size: 24px;
                    font-weight: 950;
                }

                .result-header p {
                    margin:
                        5px 0 0;

                    color:
                        #718096;

                    font-size: 12px;
                }

                .complete-badge {
                    display: inline-flex;
                    align-items: center;

                    gap: 6px;

                    padding:
                        8px 12px;

                    border-radius:
                        999px;

                    background:
                        #ecfdf3;

                    border:
                        1px solid #bbf7d0;

                    color:
                        #15803d;

                    font-size: 10px;
                    font-weight: 900;
                }

                .check-icon {
                    font-size: 11px;
                    font-weight: 950;
                }


                /* =====================================================
                   RESULT GRID
                ===================================================== */

                .result-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));

                    gap: 14px;
                }

                .result-box {
                    min-height: 104px;

                    padding:
                        18px;

                    border:
                        1px solid #e2e8f0;

                    border-radius: 15px;

                    background:
                        #f8fafc;
                }

                .result-box.green {
                    border-color:
                        #bbf7d0;

                    background:
                        #f0fdf4;
                }

                .result-box.orange {
                    border-color:
                        #fed7aa;

                    background:
                        #fff7ed;
                }

                .result-box.blue {
                    border-color:
                        #bfdbfe;

                    background:
                        #eff6ff;
                }

                .result-label {
                    color:
                        #64748b;

                    font-size: 9px;
                    font-weight: 900;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        .8px;
                }

                .result-value {
                    margin-top: 9px;

                    color:
                        #10261a;

                    font-size: 18px;
                    font-weight: 950;

                    word-break:
                        break-word;
                }

                .green-text {
                    color:
                        #15803d;
                }

                .orange-text {
                    color:
                        #c2410c;
                }

                .blue-text {
                    color:
                        #1d4ed8;
                }


                /* =====================================================
                   LOW CONFIDENCE
                ===================================================== */

                .low-confidence {
                    margin-top: 20px;

                    padding:
                        21px;

                    border:
                        1px solid #fde68a;

                    border-radius: 17px;

                    background:
                        #fffbeb;
                }

                .low-confidence h2 {
                    margin:
                        0 0 7px;

                    color:
                        #92400e;

                    font-size: 18px;
                    font-weight: 950;
                }

                .low-confidence p {
                    margin: 0;

                    color:
                        #78350f;

                    font-size: 12px;
                    line-height: 1.7;
                }

                .confidence-warning {
                    margin:
                        14px 0;

                    padding:
                        11px 13px;

                    border-radius:
                        10px;

                    background:
                        #fef3c7;

                    color:
                        #92400e;

                    font-size: 11px;
                    font-weight: 800;
                }

                .low-confidence ul {
                    margin:
                        8px 0 0;

                    padding-left:
                        20px;

                    color:
                        #78350f;

                    font-size: 12px;

                    line-height: 1.8;
                }


                /* =====================================================
                   RECOMMENDATION
                ===================================================== */

                .recommendation {
                    margin-top: 21px;

                    padding:
                        23px;

                    border:
                        1px solid #e2ebe5;

                    border-radius: 18px;

                    background:
                        #fbfdfc;
                }

                .recommendation-header {
                    display: flex;
                    align-items: center;

                    gap: 10px;

                    margin-bottom: 5px;
                }

                .recommendation-icon {
                    width: 34px;
                    height: 34px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 10px;

                    background:
                        #dcfce7;

                    color:
                        #15803d;

                    font-weight:
                        950;
                }

                .recommendation h2 {
                    margin: 0;

                    color:
                        #082518;

                    font-size: 19px;
                    font-weight: 950;
                }

                .recommendation h3 {
                    margin:
                        15px 0 7px;

                    color:
                        #10261a;

                    font-size: 15px;
                    font-weight: 900;
                }

                .recommendation ul {
                    margin: 0;

                    padding-left: 21px;

                    color:
                        #334155;

                    font-size: 12px;

                    line-height: 1.8;
                }

                .severity {
                    display: inline-flex;

                    padding:
                        6px 10px;

                    border-radius:
                        999px;

                    background:
                        #fef3c7;

                    color:
                        #92400e;

                    font-size: 10px;
                    font-weight: 900;
                }

                .action-info,
                .prevention-info,
                .spray-info {
                    margin-top: 15px;

                    padding:
                        14px 16px;

                    border-radius:
                        13px;
                }

                .action-info {
                    background:
                        #fff7ed;

                    border:
                        1px solid #fed7aa;
                }

                .prevention-info {
                    background:
                        #f0fdf4;

                    border:
                        1px solid #bbf7d0;
                }

                .spray-info {
                    background:
                        #eff6ff;

                    border:
                        1px solid #bfdbfe;
                }

                .action-info h3,
                .prevention-info h3,
                .spray-info h3 {
                    margin:
                        0 0 8px;

                    font-size: 13px;
                }


                /* =====================================================
                   PROBABILITIES
                ===================================================== */

                .probabilities {
                    margin-top: 21px;

                    padding:
                        22px;

                    border:
                        1px solid #e2ebe5;

                    border-radius:
                        18px;

                    background:
                        #ffffff;
                }

                .probabilities-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    margin-bottom:
                        19px;
                }

                .probabilities h2 {
                    margin: 0;

                    color:
                        #082518;

                    font-size: 18px;
                    font-weight: 950;
                }

                .probability-note {
                    color:
                        #94a3b8;

                    font-size: 10px;
                }

                .probability-row {
                    margin-bottom: 15px;
                }

                .probability-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 15px;

                    margin-bottom: 7px;

                    color:
                        #334155;

                    font-size: 11px;
                }

                .progress {
                    width: 100%;
                    height: 8px;

                    overflow: hidden;

                    border-radius:
                        999px;

                    background:
                        #e8eee9;
                }

                .progress-fill {
                    height: 100%;

                    border-radius:
                        999px;

                    transition:
                        width .55s ease;
                }


                /* =====================================================
                   FOOTER ACTION
                ===================================================== */

                .result-footer {
                    display: flex;
                    justify-content: center;

                    margin-top:
                        24px;
                }

                .another-button {
                    height: 45px;

                    padding:
                        0 22px;

                    border:
                        1px solid #15803d;

                    border-radius:
                        11px;

                    background:
                        #15803d;

                    color:
                        #ffffff;

                    font-size: 12px;
                    font-weight: 900;

                    cursor: pointer;

                    box-shadow:
                        0 7px 17px
                        rgba(22,163,74,.17);
                }

                .another-button:hover {
                    background:
                        #166534;
                }


                /* =====================================================
                   RESPONSIVE
                ===================================================== */

                @media (max-width: 1100px) {

                    .disease-layout {
                        grid-template-columns:
                            1fr;
                    }

                    .info-panel {
                        display: grid;

                        grid-template-columns:
                            repeat(2, 1fr);

                        gap: 12px;
                    }

                    .info-panel-heading {
                        grid-column:
                            1 / -1;
                    }

                    .model-box {
                        grid-column:
                            1 / -1;
                    }

                }


                @media (max-width: 800px) {

                    .disease-page {
                        padding:
                            25px 21px 55px;
                    }

                    .disease-header {
                        flex-direction:
                            column;
                    }

                    .crop-badge {
                        align-self:
                            flex-start;
                    }

                    .result-grid {
                        grid-template-columns:
                            1fr;
                    }

                    .info-panel {
                        display:
                            block;
                    }

                    .info-panel-heading {
                        margin-bottom:
                            24px;
                    }

                }


                @media (max-width: 600px) {

                    .disease-page {
                        padding:
                            20px 14px 45px;
                    }

                    .disease-title-row {
                        align-items:
                            flex-start;
                    }

                    .disease-title-box {
                        width: 48px;
                        height: 48px;
                    }

                    .disease-header h1 {
                        font-size:
                            29px;
                    }

                    .disease-header p {
                        font-size:
                            12px;
                    }

                    .upload-panel,
                    .info-panel,
                    .result-card {
                        padding:
                            20px;
                    }

                    .panel-heading {
                        align-items:
                            flex-start;
                    }

                    .file-limit {
                        display:
                            none;
                    }

                    .upload-zone {
                        min-height:
                            270px;

                        padding:
                            25px 15px;
                    }

                    .upload-zone h3 {
                        font-size:
                            18px;
                    }

                    .upload-meta {
                        gap:
                            9px 14px;
                    }

                    .action-row {
                        flex-direction:
                            column;
                    }

                    .primary-button,
                    .secondary-button {
                        width:
                            100%;
                    }

                    .result-header {
                        align-items:
                            flex-start;

                        flex-direction:
                            column;
                    }

                }


                @media (max-width: 420px) {

                    .disease-page {
                        padding:
                            16px 10px 35px;
                    }

                    .disease-header h1 {
                        font-size:
                            26px;
                    }

                    .disease-title-box {
                        width:
                            44px;

                        height:
                            44px;
                    }

                    .upload-icon {
                        width:
                            62px;

                        height:
                            62px;
                    }

                    .crop-badge {
                        font-size:
                            10px;
                    }

                    .crop-card {
                        border-radius:
                            17px;
                    }

                }

            `}</style>


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="disease-header">

                <div className="disease-title-row">

                    <div className="disease-title-box">
                        <CropIcon />
                    </div>

                    <div>

                        <h1>
                            Disease Detection
                        </h1>

                        <p>
                            AI-powered crop leaf
                            health analysis
                        </p>

                    </div>

                </div>


                <div className="crop-badge">

                    <span className="badge-dot"></span>

                    <CropIcon />

                    {cropName}

                    <span>
                        • AI Ready
                    </span>

                </div>

            </header>


            {/* =====================================================
                MAIN
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

                                <p>
                                    Upload a clear leaf image
                                    for AI analysis
                                </p>

                            </div>

                            <span className="file-limit">
                                Maximum file size: 10 MB
                            </span>

                        </div>


                        {/* =============================================
                            EMPTY STATE
                        ============================================= */}

                        {!preview ? (

                            <>

                                <div
                                    className={
                                        `upload-zone ${
                                            dragActive
                                                ? "active"
                                                : ""
                                        }`
                                    }

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
                                >

                                    <UploadIcon />

                                    <h3>
                                        Upload your leaf image
                                    </h3>

                                    <p>
                                        Drag & drop an image
                                        here or select one
                                        from your computer
                                    </p>

                                    <div className="choose-button">
                                        Choose Image
                                    </div>

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


                                <div className="upload-meta">

                                    <span>
                                        <span className="meta-check">
                                            ✓
                                        </span>{" "}
                                        JPG / PNG / WEBP
                                    </span>

                                    <span>
                                        <span className="meta-check">
                                            ✓
                                        </span>{" "}
                                        Up to 10 MB
                                    </span>

                                    <span>
                                        <span className="meta-check">
                                            ✓
                                        </span>{" "}
                                        Clear leaf image
                                    </span>

                                </div>


                                <div className="camera-button-wrap">

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

                                        <CameraIcon />

                                        Use Camera

                                    </button>

                                </div>


                                {/* =====================================
                                    CAMERA
                                ===================================== */}

                                {cameraOpen && (

                                    <div className="camera-panel">

                                        <div className="camera-panel-title">

                                            <span>
                                                Camera Capture
                                            </span>

                                            <span className="live-indicator">
                                                LIVE
                                            </span>

                                        </div>

                                        <video
                                            ref={
                                                videoRef
                                            }

                                            autoPlay
                                            playsInline
                                            muted

                                            className="camera-video"
                                        />

                                        <div className="camera-actions">

                                            <button
                                                type="button"
                                                className="capture-button"
                                                onClick={
                                                    capturePhoto
                                                }
                                            >
                                                Capture Photo
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

                            /* =========================================
                               PREVIEW
                            ========================================= */

                            <>

                                <div className="preview-wrap">

                                    <img
                                        src={preview}
                                        alt={`${cropName} leaf`}
                                        className="preview-image"
                                    />

                                    <div className="file-name">

                                        Selected image:{" "}

                                        <strong>
                                            {selectedFile?.name}
                                        </strong>

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
                                            ? "Analyzing Image..."
                                            : "Analyze with AI"}

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
                                        Choose Another
                                    </button>

                                </div>


                                {loading && (

                                    <div className="loading-box">

                                        <span className="loading-spinner"></span>

                                        EfficientNet-B0 is
                                        analyzing your{" "}
                                        {cropName}
                                        {" "}leaf...

                                    </div>

                                )}

                            </>

                        )}

                    </section>


                    {/* =================================================
                        HOW IT WORKS
                    ================================================= */}

                    <aside className="disease-card info-panel">

                        <div className="info-panel-heading">

                            <div className="info-heading-icon">
                                <BrainIcon />
                            </div>

                            <h2>
                                How AI Detection Works
                            </h2>

                        </div>


                        <div className="workflow-step">

                            <div className="step-number">
                                01
                            </div>

                            <div>

                                <h3>
                                    Upload Leaf Image
                                </h3>

                                <p>
                                    Upload a clear,
                                    well-lit photograph
                                    of the crop leaf.
                                </p>

                            </div>

                        </div>


                        <div className="workflow-step">

                            <div className="step-number">
                                02
                            </div>

                            <div>

                                <h3>
                                    AI Analysis
                                </h3>

                                <p>
                                    EfficientNet-B0
                                    analyzes visual
                                    patterns in the
                                    submitted image.
                                </p>

                            </div>

                        </div>


                        <div className="workflow-step">

                            <div className="step-number">
                                03
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

                            <div className="model-label">
                                AI MODEL
                            </div>

                            <div className="model-name">
                                EfficientNet-B0
                            </div>

                            <div className="model-description">
                                Crop disease
                                classification
                            </div>

                        </div>

                    </aside>

                </div>

            )}


            {/* =========================================================
                ERROR
            ========================================================= */}

            {error && (

                <div className="error-box">

                    <div>

                        <div className="error-title">
                            Something went wrong
                        </div>

                        <div>
                            {error}
                        </div>

                    </div>

                </div>

            )}


            {/* =========================================================
                RESULT
            ========================================================= */}

            {predictionResult && (

                <section className="disease-card result-card">

                    <div className="result-header">

                        <div className="result-title-wrap">

                            <div className="result-title-icon">
                                <BrainIcon />
                            </div>

                            <div>

                                <h2>
                                    AI Detection Result
                                </h2>

                                <p>
                                    Analysis completed
                                    successfully
                                </p>

                            </div>

                        </div>


                        <div className="complete-badge">

                            <CheckIcon />

                            Analysis Complete

                        </div>

                    </div>


                    {/* =============================================
                        RESULT SUMMARY
                    ============================================= */}

                    <div className="result-grid">

                        <div className="result-box">

                            <div className="result-label">
                                Crop
                            </div>

                            <div className="result-value">
                                {displayCropName}
                            </div>

                        </div>


                        <div
                            className={
                                `result-box ${
                                    isHealthy
                                        ? "green"
                                        : "orange"
                                }`
                            }
                        >

                            <div className="result-label">
                                Predicted Condition
                            </div>

                            <div
                                className={
                                    `result-value ${
                                        isHealthy
                                            ? "green-text"
                                            : "orange-text"
                                    }`
                                }
                            >
                                {prediction}
                            </div>

                        </div>


                        <div className="result-box blue">

                            <div className="result-label">
                                Confidence Score
                            </div>

                            <div className="result-value blue-text">
                                {confidenceValue.toFixed(2)}%
                            </div>

                        </div>

                    </div>


                    {/* =============================================
                        LOW CONFIDENCE
                    ============================================= */}

                    {isLowConfidence ? (

                        <div className="low-confidence">

                            <h2>
                                Low Confidence Prediction
                            </h2>

                            <p>
                                AgriMind AI is not
                                confident enough in
                                this prediction to
                                provide a reliable
                                disease recommendation.
                            </p>

                            <div className="confidence-warning">

                                Current confidence:{" "}

                                {confidenceValue.toFixed(
                                    2
                                )}

                                %

                                {" • "}

                                Required:

                                {" "}

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
                                    type is correct.
                                </li>

                                <li>
                                    Do not rely on a
                                    low-confidence
                                    prediction alone.
                                </li>

                            </ul>

                        </div>

                    ) : recommendationLoading ? (

                        <div className="recommendation">

                            <div className="loading-box">

                                <span className="loading-spinner"></span>

                                Preparing AI
                                recommendation...

                            </div>

                        </div>

                    ) : recommendation ? (

                        /* =========================================
                           RECOMMENDATION
                        ========================================= */

                        <div className="recommendation">

                            <div className="recommendation-header">

                                <div className="recommendation-icon">
                                    i
                                </div>

                                <h2>
                                    AI Recommendation
                                </h2>

                            </div>


                            <h3>
                                {prediction}
                            </h3>


                            <span className="severity">

                                Severity:{" "}

                                {recommendation.severity ||
                                    "Not specified"}

                            </span>


                            {/* SYMPTOMS */}

                            {recommendation.symptoms?.length >
                                0 && (

                                <div>

                                    <h3>
                                        Symptoms
                                    </h3>

                                    <ul>

                                        {recommendation.symptoms.map(
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


                            {/* IMMEDIATE ACTION */}

                            {recommendation.immediate_action?.length >
                                0 && (

                                <div className="action-info">

                                    <h3>
                                        Immediate Action
                                    </h3>

                                    <ul>

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

                            {recommendation.prevention?.length >
                                0 && (

                                <div className="prevention-info">

                                    <h3>
                                        Prevention
                                    </h3>

                                    <ul>

                                        {recommendation.prevention.map(
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


                            {/* SPRAY */}

                            {recommendation.spray_guidance?.length >
                                0 && (

                                <div className="spray-info">

                                    <h3>
                                        Spray Guidance
                                    </h3>

                                    <ul>

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

                            {recommendation.treatment?.length >
                                0 && (

                                <div>

                                    <h3>
                                        Treatment / What
                                        You Should Do
                                    </h3>

                                    <ul>

                                        {recommendation.treatment.map(
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


                            {/* FARMER ACTION */}

                            {recommendation.farmer_action && (

                                <div className="prevention-info">

                                    <h3>
                                        Farmer Action
                                    </h3>

                                    <p
                                        style={{
                                            margin:
                                                0,

                                            color:
                                                "#166534",

                                            fontSize:
                                                "12px",

                                            lineHeight:
                                                "1.7",
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
                                        "#64748b",

                                    fontSize:
                                        "12px",
                                }}
                            >
                                Recommendation could
                                not be loaded for
                                this prediction.
                            </div>

                        </div>

                    )}


                    {/* =============================================
                        PROBABILITIES
                    ============================================= */}

                    {predictionResult.probabilities &&
                        localStorage.getItem(
                            "agrimind_show_probabilities"
                        ) !== "false" && (

                        <div className="probabilities">

                            <div className="probabilities-header">

                                <h2>
                                    AI Class Probabilities
                                </h2>

                                <span className="probability-note">
                                    Model confidence by class
                                </span>

                            </div>


                            {Object.entries(
                                predictionResult.probabilities
                            ).map(
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
                                                                ? 850
                                                                : 500,
                                                    }}
                                                >
                                                    {disease}
                                                </span>

                                                <strong>
                                                    {value.toFixed(
                                                        2
                                                    )}
                                                    %
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
                                                                : "#86efac",
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}


                    {/* =============================================
                        ANALYZE ANOTHER
                    ============================================= */}

                    <div className="result-footer">

                        <button
                            type="button"
                            className="another-button"
                            onClick={
                                handleReset
                            }
                        >
                            Analyze Another Image
                        </button>

                    </div>

                </section>

            )}

        </div>
    );
}

export default DiseaseDetection;