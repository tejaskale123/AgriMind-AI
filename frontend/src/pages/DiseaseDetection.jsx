import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function DiseaseDetection() {
    const { language } = useLanguage();

    const ui = {
        en: {
            title: "Disease Detection",
            subtitle: "AI-powered crop leaf health analysis",
            aiReady: "AI Ready",
            analyzeLeaf: (crop) => `Analyze ${crop} Leaf`,
            uploadClear: "Upload a clear leaf image for AI analysis",
            maxSize: "Maximum file size: 10 MB",
            uploadTitle: "Upload your leaf image",
            uploadDesc: "Drag & drop an image here or select one from your computer",
            chooseImage: "Choose Image",
            formats: "JPG / PNG / WEBP",
            size: "Up to 10 MB",
            clearLeaf: "Clear leaf image",
            useCamera: "Use Camera",
            cameraCapture: "Camera Capture",
            live: "LIVE",
            capturePhoto: "Capture Photo",
            cancel: "Cancel",
            selectedImage: "Selected image:",
            analyze: "Analyze with AI",
            analyzing: "Analyzing Image...",
            chooseAnother: "Choose Another",
            analyzingLeaf: (crop) => `EfficientNet-B0 is analyzing your ${crop} leaf...`,
            howWorks: "How AI Detection Works",
            uploadStep: "Upload Leaf Image",
            uploadStepDesc: "Upload a clear, well-lit photograph of the crop leaf.",
            analysisStep: "AI Analysis",
            analysisStepDesc: "EfficientNet-B0 analyzes visual patterns in the submitted image.",
            resultStep: "Get Result",
            resultStepDesc: "Receive the predicted condition and confidence score.",
            aiModel: "AI MODEL",
            cropDiseaseClassification: "Crop disease classification",
            somethingWrong: "Something went wrong",
            resultTitle: "Disease Detection Result",
            completed: "Analysis completed successfully",
            analysisComplete: "Analysis Complete",
            crop: "Crop",
            predictedCondition: "Predicted Condition",
            confidenceScore: "Confidence Score",
            aiExplanation: "AI Explanation",
            geminiAssistant: "Gemini AI Assistant",
            lowConfidence: "Low Confidence Prediction",
            lowConfidenceDesc: "AgriMind AI is not confident enough in this prediction to provide a reliable disease recommendation.",
            currentConfidence: "Current confidence:",
            required: "Required:",
            clearImage: "Upload a clearer leaf image.",
            completeLeaf: "Keep the complete leaf visible.",
            avoidBlurry: "Avoid blurry or dark images.",
            correctCrop: "Make sure the crop type is correct.",
            dontRely: "Do not rely on a low-confidence prediction alone.",
            plantCare: "Plant Care & Management",
            verify: "Please verify this result",
            verifyDesc: "AI prediction may not be completely accurate. Please compare the detected condition with the visible symptoms on your crop. If the result does not match your crop, upload a clear image again or consult a local agricultural expert before taking treatment or spray action.",
            severity: "Severity:",
            notSpecified: "Not specified",
            symptoms: "Symptoms",
            immediateAction: "Immediate Action",
            prevention: "Prevention",
            sprayGuidance: "Spray Guidance",
            treatment: "Treatment / What You Should Do",
            farmerAction: "Farmer Action",
            recommendationFailed: "Recommendation could not be loaded for this prediction.",
            preparingRecommendation: "Preparing AI recommendation...",
            probabilities: "AI Class Probabilities",
            probabilityNote: "Model confidence by class",
            anotherImage: "Analyze Another Image",
            noDetections: "No detections yet",
            invalidImage: "Please select a valid crop leaf image.",
            tooLarge: "Image size must be less than 10 MB.",
            cameraUnsupported: "Camera is not supported by this browser.",
            cameraFailed: "Camera access failed. Please allow camera permission and try again.",
            cameraNotReady: "Camera is not ready yet. Please wait a moment and try again.",
            captureFailed: "Unable to capture the camera image.",
            createImageFailed: "Unable to create the captured image.",
            noCrop: "No crop selected. Please go back to Crops and select a supported crop.",
            unsupportedCrop: "Unsupported crop. Please select a supported crop.",
            notAuthenticated: "Not authenticated. Please logout and login again.",
            authExpired: "Authentication expired or invalid. Please logout and login again.",
            predictionFailed: "Prediction failed.",
            invalidResponse: "Invalid response received from AI server.",
            predictionNotSuccessful: "AI prediction was not successful.",
            unableConnect: "Unable to connect to AI server.",
            streamFailed: "Recommendation stream could not be started.",
            recommendationError: "Unable to load the recommendation.",
            loading: "Loading..."
        },
        mr: {
            title: "रोग शोध",
            subtitle: "AI द्वारे पिकाच्या पानांच्या आरोग्याचे विश्लेषण",
            aiReady: "AI तयार आहे",
            analyzeLeaf: (crop) => `${crop} पानाचे विश्लेषण करा`,
            uploadClear: "AI विश्लेषणासाठी पिकाच्या पानाचा स्पष्ट फोटो अपलोड करा",
            maxSize: "कमाल फाइल आकार: 10 MB",
            uploadTitle: "पानाचा फोटो अपलोड करा",
            uploadDesc: "इमेज इथे Drag & Drop करा किंवा संगणकातून निवडा",
            chooseImage: "इमेज निवडा",
            formats: "JPG / PNG / WEBP",
            size: "10 MB पर्यंत",
            clearLeaf: "पानाचा स्पष्ट फोटो",
            useCamera: "कॅमेरा वापरा",
            cameraCapture: "कॅमेरा कॅप्चर",
            live: "LIVE",
            capturePhoto: "फोटो कॅप्चर करा",
            cancel: "रद्द करा",
            selectedImage: "निवडलेली इमेज:",
            analyze: "AI ने विश्लेषण करा",
            analyzing: "इमेजचे विश्लेषण सुरू आहे...",
            chooseAnother: "दुसरी इमेज निवडा",
            analyzingLeaf: (crop) => `EfficientNet-B0 तुमच्या ${crop} पानाचे विश्लेषण करत आहे...`,
            howWorks: "AI रोग शोध कसा काम करतो",
            uploadStep: "पानाचा फोटो अपलोड करा",
            uploadStepDesc: "पिकाच्या पानाचा स्पष्ट आणि योग्य प्रकाशातील फोटो अपलोड करा.",
            analysisStep: "AI विश्लेषण",
            analysisStepDesc: "EfficientNet-B0 अपलोड केलेल्या पानातील दृश्य नमुन्यांचे विश्लेषण करते.",
            resultStep: "निकाल मिळवा",
            resultStepDesc: "संभाव्य स्थिती आणि confidence score मिळवा.",
            aiModel: "AI मॉडेल",
            cropDiseaseClassification: "पिकांच्या रोगांचे वर्गीकरण",
            somethingWrong: "काहीतरी चूक झाली",
            resultTitle: "रोग शोध परिणाम",
            completed: "विश्लेषण यशस्वीरित्या पूर्ण झाले",
            analysisComplete: "विश्लेषण पूर्ण",
            crop: "पीक",
            predictedCondition: "अंदाजित स्थिती",
            confidenceScore: "विश्वास पातळी",
            aiExplanation: "AI स्पष्टीकरण",
            geminiAssistant: "Gemini AI सहाय्यक",
            lowConfidence: "कमी Confidence असलेला अंदाज",
            lowConfidenceDesc: "या अंदाजावर विश्वासार्ह रोगाची शिफारस देण्यासाठी AgriMind AI ला पुरेसा विश्वास नाही.",
            currentConfidence: "सध्याचा confidence:",
            required: "आवश्यक:",
            clearImage: "पानाचा अधिक स्पष्ट फोटो अपलोड करा.",
            completeLeaf: "संपूर्ण पान फोटोमध्ये दिसू द्या.",
            avoidBlurry: "धूसर किंवा अंधुक फोटो टाळा.",
            correctCrop: "पिकाचा प्रकार योग्य आहे याची खात्री करा.",
            dontRely: "फक्त कमी-confidence अंदाजावर अवलंबून राहू नका.",
            plantCare: "पिकाची काळजी व व्यवस्थापन",
            verify: "हा निकाल पडताळून पहा",
            verifyDesc: "AI चा अंदाज पूर्णपणे अचूक असेलच असे नाही. तुमच्या पिकावर दिसणाऱ्या लक्षणांशी आढळलेली स्थिती तपासा. निकाल पिकाशी जुळत नसल्यास पुन्हा स्पष्ट फोटो अपलोड करा किंवा उपचार अथवा फवारणी करण्यापूर्वी स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या.",
            severity: "तीव्रता:",
            notSpecified: "नमूद केलेले नाही",
            symptoms: "लक्षणे",
            immediateAction: "तात्काळ कृती",
            prevention: "प्रतिबंध",
            sprayGuidance: "फवारणी मार्गदर्शन",
            treatment: "उपचार / आपण काय करावे",
            farmerAction: "शेतकऱ्याची कृती",
            recommendationFailed: "या अंदाजासाठी शिफारस लोड करता आली नाही.",
            preparingRecommendation: "AI शिफारस तयार करत आहे...",
            probabilities: "AI वर्ग संभाव्यता",
            probabilityNote: "प्रत्येक वर्गाची Model confidence",
            anotherImage: "दुसऱ्या इमेजचे विश्लेषण करा",
            noDetections: "अजून कोणतेही डिटेक्शन नाही",
            invalidImage: "कृपया पिकाच्या पानाची वैध इमेज निवडा.",
            tooLarge: "इमेजचा आकार 10 MB पेक्षा कमी असावा.",
            cameraUnsupported: "या ब्राउझरमध्ये कॅमेरा समर्थित नाही.",
            cameraFailed: "कॅमेरा सुरू करता आला नाही. कृपया कॅमेरा परवानगी द्या आणि पुन्हा प्रयत्न करा.",
            cameraNotReady: "कॅमेरा अजून तयार नाही. कृपया थोडा वेळ थांबा आणि पुन्हा प्रयत्न करा.",
            captureFailed: "कॅमेऱ्यातील इमेज कॅप्चर करता आली नाही.",
            createImageFailed: "कॅप्चर केलेली इमेज तयार करता आली नाही.",
            noCrop: "पीक निवडलेले नाही. कृपया Crops मध्ये जाऊन समर्थित पीक निवडा.",
            unsupportedCrop: "असमर्थित पीक. कृपया समर्थित पीक निवडा.",
            notAuthenticated: "तुम्ही लॉगिन केलेले नाही. कृपया logout करून पुन्हा login करा.",
            authExpired: "Authentication कालबाह्य किंवा अवैध आहे. कृपया logout करून पुन्हा login करा.",
            predictionFailed: "Prediction अयशस्वी झाले.",
            invalidResponse: "AI server कडून अवैध response मिळाला.",
            predictionNotSuccessful: "AI prediction यशस्वी झाले नाही.",
            unableConnect: "AI server शी कनेक्ट होता आले नाही.",
            streamFailed: "Recommendation stream सुरू करता आला नाही.",
            recommendationError: "शिफारस लोड करता आली नाही.",
            loading: "लोड होत आहे..."
        },
        hi: {
            title: "रोग पहचान",
            subtitle: "AI द्वारा फसल के पत्ते के स्वास्थ्य का विश्लेषण",
            aiReady: "AI तैयार है",
            analyzeLeaf: (crop) => `${crop} पत्ते का विश्लेषण करें`,
            uploadClear: "AI विश्लेषण के लिए फसल के पत्ते की स्पष्ट फोटो अपलोड करें",
            maxSize: "अधिकतम फ़ाइल आकार: 10 MB",
            uploadTitle: "पत्ते की फोटो अपलोड करें",
            uploadDesc: "इमेज यहाँ Drag & Drop करें या कंप्यूटर से चुनें",
            chooseImage: "इमेज चुनें",
            formats: "JPG / PNG / WEBP",
            size: "10 MB तक",
            clearLeaf: "पत्ते की स्पष्ट इमेज",
            useCamera: "कैमरा इस्तेमाल करें",
            cameraCapture: "कैमरा कैप्चर",
            live: "LIVE",
            capturePhoto: "फोटो कैप्चर करें",
            cancel: "रद्द करें",
            selectedImage: "चयनित इमेज:",
            analyze: "AI से विश्लेषण करें",
            analyzing: "इमेज का विश्लेषण हो रहा है...",
            chooseAnother: "दूसरी इमेज चुनें",
            analyzingLeaf: (crop) => `EfficientNet-B0 आपके ${crop} पत्ते का विश्लेषण कर रहा है...`,
            howWorks: "AI रोग पहचान कैसे काम करती है",
            uploadStep: "पत्ते की इमेज अपलोड करें",
            uploadStepDesc: "फसल के पत्ते की स्पष्ट और अच्छी रोशनी वाली फोटो अपलोड करें।",
            analysisStep: "AI विश्लेषण",
            analysisStepDesc: "EfficientNet-B0 अपलोड किए गए पत्ते के दृश्य पैटर्न का विश्लेषण करता है।",
            resultStep: "परिणाम प्राप्त करें",
            resultStepDesc: "अनुमानित स्थिति और confidence score प्राप्त करें।",
            aiModel: "AI मॉडल",
            cropDiseaseClassification: "फसल रोग वर्गीकरण",
            somethingWrong: "कुछ गलत हो गया",
            resultTitle: "रोग पहचान परिणाम",
            completed: "विश्लेषण सफलतापूर्वक पूरा हुआ",
            analysisComplete: "विश्लेषण पूरा",
            crop: "फसल",
            predictedCondition: "अनुमानित स्थिति",
            confidenceScore: "Confidence Score",
            aiExplanation: "AI स्पष्टीकरण",
            geminiAssistant: "Gemini AI सहायक",
            lowConfidence: "कम Confidence वाला अनुमान",
            lowConfidenceDesc: "विश्वसनीय रोग की सिफारिश देने के लिए AgriMind AI को इस अनुमान पर पर्याप्त विश्वास नहीं है।",
            currentConfidence: "वर्तमान confidence:",
            required: "आवश्यक:",
            clearImage: "पत्ते की अधिक स्पष्ट फोटो अपलोड करें।",
            completeLeaf: "पूरा पत्ता फोटो में दिखाई देना चाहिए।",
            avoidBlurry: "धुंधली या अंधेरी फोटो से बचें।",
            correctCrop: "सुनिश्चित करें कि फसल का प्रकार सही है।",
            dontRely: "केवल कम-confidence वाले अनुमान पर निर्भर न रहें।",
            plantCare: "पौधे की देखभाल और प्रबंधन",
            verify: "कृपया इस परिणाम की पुष्टि करें",
            verifyDesc: "AI का अनुमान पूरी तरह सटीक नहीं हो सकता। अपने खेत में दिखाई देने वाले लक्षणों से पहचानी गई स्थिति की तुलना करें। यदि परिणाम आपकी फसल से मेल नहीं खाता है, तो दोबारा स्पष्ट फोटो अपलोड करें या उपचार अथवा छिड़काव से पहले स्थानीय कृषि विशेषज्ञ से सलाह लें।",
            severity: "गंभीरता:",
            notSpecified: "निर्दिष्ट नहीं",
            symptoms: "लक्षण",
            immediateAction: "तत्काल कार्रवाई",
            prevention: "रोकथाम",
            sprayGuidance: "छिड़काव मार्गदर्शन",
            treatment: "उपचार / आपको क्या करना चाहिए",
            farmerAction: "किसान की कार्रवाई",
            recommendationFailed: "इस अनुमान के लिए सिफारिश लोड नहीं हो सकी।",
            preparingRecommendation: "AI सिफारिश तैयार कर रहा है...",
            probabilities: "AI क्लास संभावनाएँ",
            probabilityNote: "प्रत्येक क्लास का Model confidence",
            anotherImage: "दूसरी इमेज का विश्लेषण करें",
            noDetections: "अभी कोई डिटेक्शन नहीं है",
            invalidImage: "कृपया फसल के पत्ते की वैध इमेज चुनें।",
            tooLarge: "इमेज का आकार 10 MB से कम होना चाहिए।",
            cameraUnsupported: "इस ब्राउज़र में कैमरा समर्थित नहीं है।",
            cameraFailed: "कैमरा एक्सेस नहीं हो सका। कृपया कैमरा अनुमति दें और फिर प्रयास करें।",
            cameraNotReady: "कैमरा अभी तैयार नहीं है। कृपया थोड़ी देर प्रतीक्षा करें और फिर प्रयास करें।",
            captureFailed: "कैमरा इमेज कैप्चर नहीं हो सकी।",
            createImageFailed: "कैप्चर की गई इमेज बनाई नहीं जा सकी।",
            noCrop: "कोई फसल चयनित नहीं है। कृपया Crops में जाकर समर्थित फसल चुनें।",
            unsupportedCrop: "असमर्थित फसल। कृपया समर्थित फसल चुनें।",
            notAuthenticated: "आप प्रमाणित नहीं हैं। कृपया logout करके फिर login करें।",
            authExpired: "Authentication समाप्त या अमान्य है। कृपया logout करके फिर login करें।",
            predictionFailed: "Prediction विफल हुआ।",
            invalidResponse: "AI server से अमान्य response मिला।",
            predictionNotSuccessful: "AI prediction सफल नहीं हुआ।",
            unableConnect: "AI server से कनेक्ट नहीं हो सका।",
            streamFailed: "Recommendation stream शुरू नहीं हो सका।",
            recommendationError: "सिफारिश लोड नहीं हो सकी।",
            loading: "लोड हो रहा है..."
        }
    };

    const text = ui[language] || ui.en;

    const location = useLocation();
    const navigate = useNavigate();

    // =========================================================
    // CROP
    // =========================================================

    const routeCrop = location.state?.crop || null;
    const storageCrop =
        sessionStorage.getItem("selectedCrop") || null;

    const rawSelectedCrop =
        routeCrop || storageCrop || null;

    const selectedCrop =
        rawSelectedCrop === "tur"
            ? "pigeon_pea"
            : rawSelectedCrop;
    const supportedCrops = [
        "cotton",
        "soybean",
        "maize",
        "wheat",
        "pigeon_pea",
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
                        : selectedCrop === "pigeon_pea"
                            ? "Tur (Pigeon Pea)"
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

    const normalizeRecommendation = (value) => {
        if (!value) return null;

        const arrayFields = [
            "symptoms",
            "immediate_action",
            "prevention",
            "spray_guidance",
            "treatment",
        ];

        return arrayFields.reduce(
            (normalized, field) => ({
                ...normalized,
                [field]: Array.isArray(normalized[field])
                    ? normalized[field]
                    : normalized[field]
                        ? [normalized[field]]
                        : [],
            }),
            { ...value }
        );
    };

    const streamRecommendation = async (
        prediction,
        confidence
    ) => {
        setRecommendation({});
        setRecommendationLoading(true);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/recommendation/stream?crop=${encodeURIComponent(
                    selectedCrop
                )}&disease=${encodeURIComponent(
                    prediction
                )}&confidence=${encodeURIComponent(
                    confidence
                )}&language=${encodeURIComponent(
                    language
                )}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${getAuthToken()}`,
                    },
                }
            );

            if (!response.ok || !response.body) {
                throw new Error(
                    text.streamFailed
                );
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } =
                    await reader.read();

                buffer += decoder.decode(
                    value || new Uint8Array(),
                    { stream: !done }
                );

                const events = buffer.split("\n\n");
                buffer = events.pop() || "";

                for (const event of events) {
                    const line = event
                        .split("\n")
                        .find((item) =>
                            item.startsWith("data: ")
                        );

                    if (!line) continue;

                    const payload = JSON.parse(
                        line.slice(6)
                    );

                    if (payload.error) {
                        throw new Error(payload.error);
                    }

                    if (payload.data) {
                        setRecommendation((current) =>
                            normalizeRecommendation({
                                ...current,
                                ...payload.data,
                            })
                        );
                        setRecommendationLoading(false);
                    }
                }

                if (done) break;
            }
        } catch (err) {
            console.error(
                "Recommendation stream error:",
                err
            );
            setRecommendation(null);
            setError(
                err.message ||
                text.recommendationError
            );
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
                text.invalidImage
            );

            return;
        }

        if (
            file.size >
            10 * 1024 * 1024
        ) {
            setError(
                text.tooLarge
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
                    text.cameraUnsupported
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
                text.cameraFailed
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
                text.cameraNotReady
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
                text.captureFailed
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
                        text.createImageFailed
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
                text.noCrop
            );

            return;
        }

        if (
            !supportedCrops.includes(
                selectedCrop
            )
        ) {
            setError(
                text.unsupportedCrop
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
                    text.notAuthenticated
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
                    text.invalidResponse
                );
            }

            if (!response.ok) {
                if (
                    response.status === 401
                ) {
                    throw new Error(
                        text.authExpired
                    );
                }

                throw new Error(
                    data.detail ||
                    data.message ||
                    text.predictionFailed
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
                    text.predictionNotSuccessful
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

            await streamRecommendation(
                data.prediction,
                data.confidence
            );
        } catch (err) {
            console.error(
                "Prediction error:",
                err
            );

            setError(
                err.message ||
                text.unableConnect
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
                    content: ";

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
                    content: ";

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
                    content: ";

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
                GEMINI AI EXPLANATION
                ===================================================== */

                .ai-explanation {
                    margin-top: 21px;

                    padding: 22px 23px;

                    border:
                        1px solid #bbf7d0;

                    border-radius: 18px;

                    background:
                        linear-gradient(
                            135deg,
                            #f0fdf4,
                            #ecfdf5
                        );

                    box-shadow:
                        0 6px 18px
                        rgba(22,163,74,.05);
                }

                .ai-explanation-header {
                    display: flex;
                    align-items: center;

                    gap: 10px;

                    margin-bottom: 12px;
                }

                .ai-explanation-icon {
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

                    font-size: 16px;
                    font-weight: 950;
                }

                .ai-explanation h2 {
                    margin: 0;

                    color:
                        #082518;

                    font-size: 19px;
                    font-weight: 950;
                }

                .ai-explanation-label {
                    margin:
                        0 0 8px;

                    color:
                        #15803d;

                    font-size: 10px;
                    font-weight: 900;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        .7px;
                }

                .ai-explanation p {
                    margin: 0;

                    color:
                        #334155;

                    font-size: 13px;

                    line-height: 1.75;
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

                .ai-verification-warning {
                    margin: 18px 0 22px;
                    padding: 18px 20px;
                    border: 2px solid #dc2626;
                    border-radius: 12px;
                    background: #fef2f2;
                    color: #991b1b;
                }

                .ai-verification-warning strong {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 17px;
                    color: #b91c1c;
                }

                .ai-verification-warning p {
                    margin: 0;
                    line-height: 1.6;
                    font-size: 15px;
                    color: #7f1d1d;
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
                            {text.title}
                        </h1>

                        <p>
                            {text.subtitle}
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
                                    {text.analyzeLeaf(cropName)}
                                </h2>

                                <p>
                                    {text.uploadClear}
                                </p>

                            </div>

                            <span className="file-limit">
                                {text.maxSize}
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
                                        {text.uploadTitle}
                                    </h3>

                                    <p>
                                        {text.uploadDesc}
                                    </p>

                                    <div className="choose-button">
                                        {text.chooseImage}
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
                                        {text.formats}
                                    </span>

                                    <span>
                                        <span className="meta-check">
                                            ✓
                                        </span>{" "}
                                        {text.size}
                                    </span>

                                    <span>
                                        <span className="meta-check">
                                            ✓
                                        </span>{" "}
                                        {text.clearLeaf}
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

                                        {text.useCamera}

                                    </button>

                                </div>


                                {/* =====================================
                                    CAMERA
                                ===================================== */}

                                {cameraOpen && (

                                    <div className="camera-panel">

                                        <div className="camera-panel-title">

                                            <span>
                                                {text.cameraCapture}
                                            </span>

                                            <span className="live-indicator">
                                                {text.live}
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
                                                {text.capturePhoto}
                                            </button>

                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={
                                                    stopCamera
                                                }
                                            >
                                                {text.cancel}
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

                                        {text.selectedImage}{" "}

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
                                            ? text.analyzing
                                            : text.analyze}

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
                                        {text.chooseAnother}
                                    </button>

                                </div>


                                {loading && (

                                    <div className="loading-box">

                                        <span className="loading-spinner"></span>

                                        {text.analyzingLeaf(cropName)}

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
                                {text.howWorks}
                            </h2>

                        </div>


                        <div className="workflow-step">

                            <div className="step-number">
                                01
                            </div>

                            <div>

                                <h3>
                                    {text.uploadStep}
                                </h3>

                                <p>
                                    {text.uploadStepDesc}
                                </p>

                            </div>

                        </div>


                        <div className="workflow-step">

                            <div className="step-number">
                                02
                            </div>

                            <div>

                                <h3>
                                    {text.analysisStep}
                                </h3>

                                <p>
                                    {text.analysisStepDesc}
                                </p>

                            </div>

                        </div>


                        <div className="workflow-step">

                            <div className="step-number">
                                03
                            </div>

                            <div>

                                <h3>
                                    {text.resultStep}
                                </h3>

                                <p>
                                    {text.resultStepDesc}
                                </p>

                            </div>

                        </div>


                        <div className="model-box">

                            <div className="model-label">
                                {text.aiModel}
                            </div>

                            <div className="model-name">
                                EfficientNet-B0
                            </div>

                            <div className="model-description">
                                {text.cropDiseaseClassification}
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
                            {text.somethingWrong}
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
                                    {text.resultTitle} 
                                </h2>

                                <p>
                                    {text.completed}
                                </p>

                            </div>

                        </div>


                        <div className="complete-badge">

                            <CheckIcon />

                            {text.analysisComplete}

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
                                {text.predictedCondition}
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
                                {text.confidenceScore}
                            </div>

                            <div className="result-value blue-text">
                                {confidenceValue.toFixed(2)}%
                            </div>

                        </div>

                    </div>


                    {/* =============================================
                        LOW CONFIDENCE
                    ============================================= */}

                    {/* =====================================================
                        GEMINI AI EXPLANATION
                    ===================================================== */}

                    {predictionResult?.ai_explanation && !isLowConfidence && (

                        <div className="ai-explanation">

                            <div className="ai-explanation-header">

                                <div className="ai-explanation-icon">
                                    AI
                                </div>

                                <h2>
                                    {text.aiExplanation}
                                </h2>

                            </div>

                            <p className="ai-explanation-label">
                                {text.geminiAssistant}
                            </p>

                            <p>
                                {predictionResult.ai_explanation}
                            </p>

                        </div>

                    )}


                    {isLowConfidence ? (

                        <div className="low-confidence">

                            <h2>
                                {text.lowConfidence}
                            </h2>

                            <p>
                                {text.lowConfidenceDesc}
                            </p>

                            <div className="confidence-warning">

                                {text.currentConfidence}{" "}

                                {confidenceValue.toFixed(
                                    2
                                )}

                                %

                                {" • "}

                                {text.required}:

                                {" "}

                                {confidenceThreshold}%

                            </div>

                            <ul>

                                <li>
                                    {text.clearImage}
                                </li>

                                <li>
                                    {text.completeLeaf}
                                </li>

                                <li>
                                    {text.avoidBlurry}
                                </li>

                                <li>
                                    {text.correctCrop}
                                </li>

                                <li>
                                    {text.dontRely}
                                </li>

                            </ul>

                        </div>

                    ) : recommendationLoading ? (

                        <div className="recommendation">

                            <div className="loading-box">

                                <span className="loading-spinner"></span>

                                {text.preparingRecommendation}

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
                                    {text.plantCare}
                                </h2>

                            </div>


                            <div className="ai-verification-warning">
                                <strong>⚠️ {text.verify}</strong>

                                <p>
                                    {text.verifyDesc}
                                </p>
                            </div>

                            <h3>
                                {prediction}
                            </h3>


                            <span className="severity">

                                {text.severity}{" "}

                                {recommendation.severity ||
                                    text.notSpecified}

                            </span>


                            {/* SYMPTOMS */}

                            {recommendation.symptoms?.length >
                                0 && (

                                <div>

                                    <h3>
                                        {text.symptoms}
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
                                        {text.immediateAction}
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
                                        {text.prevention}
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
                                        {text.sprayGuidance}
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
                                        {text.treatment}
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
                                        {text.farmerAction}
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
                                {text.recommendationFailed}
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
                                    {text.probabilities}
                                </h2>

                                <span className="probability-note">
                                    {text.probabilityNote}
                                </span>

                            </div>


                            {Object.entries(
                                predictionResult.probabilities
                            )
                                .filter(
                                    ([disease]) =>
                                        disease !== "Anthracnose"
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
                            {text.anotherImage}
                        </button>

                    </div>

                </section>

            )}

        </div>
    );
}

export default DiseaseDetection;
