import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import UserProfileMenu from "../components/UserProfileMenu";

const API_BASE_URL = "http://127.0.0.1:8000";

const getToken = () => {
    const keys = ["access_token", "token", "accessToken", "authToken", "jwt", "auth"];
    for (const storage of [localStorage, sessionStorage]) {
        for (const key of keys) {
            const val = storage.getItem(key);
            if (val) {
                try {
                    const parsed = JSON.parse(val);
                    if (typeof parsed === "string" && parsed.length > 20) return parsed;
                    if (parsed?.access_token) return parsed.access_token;
                    if (parsed?.token) return parsed.token;
                } catch {
                    if (val.length > 20) return val;
                }
            }
        }
    }
    return null;
};

const isHealthy = (value) => {
    const v = String(value || "").trim().toLowerCase();
    return v === "healthy" || v === "healthy leaf" || v.includes("healthy");
};

// Helper to clean and render formatted AI markdown text cleanly
const renderFormattedText = (raw) => {
    if (!raw) return null;
    if (Array.isArray(raw)) {
        return raw.map((item, i) => (
            <div key={i} className="exp-history-text-bullet">
                <span className="exp-history-bullet-dot">•</span>
                <span>{typeof item === "string" ? item.replace(/^\s*[-*•]\s*/, "") : JSON.stringify(item)}</span>
            </div>
        ));
    }
    if (typeof raw !== "string") return String(raw);

    const clean = raw.replace(/\r\n/g, "\n");
    const lines = clean.split("\n").filter((l) => l.trim().length > 0);

    return lines.map((line, idx) => {
        const isBullet = line.match(/^\s*[-*•]\s*(.*)$/);
        const textContent = isBullet ? isBullet[1] : line;

        // Parse bold **text**
        const parts = textContent.split(/(\*\*.*?\*\*)/g);
        const formatted = parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={pIdx} className="exp-history-text-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        if (isBullet) {
            return (
                <div key={idx} className="exp-history-text-bullet">
                    <span className="exp-history-bullet-dot">•</span>
                    <span>{formatted}</span>
                </div>
            );
        }

        return (
            <p key={idx} className="exp-history-text-p">
                {formatted}
            </p>
        );
    });
};

export default function DetectionHistory() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Multilingual Dictionary
    const ui = {
        en: {
            eyebrow: "DETECTION HISTORY",
            title: "Detection History",
            subtitle: "Your complete crop health analysis journey. Track, learn and grow with AI-powered insights.",
            sloganTop: "Every Detection",
            sloganSub: "Builds a Healthier Tomorrow",
            statTotal: "Total Detections",
            statTotalSub: "from last month",
            statHealthy: "Healthy",
            statHealthySub: "of total",
            statDisease: "Disease Detected",
            statDiseaseSub: "of total",
            statConfidence: "Avg. Confidence",
            statConfidenceSub: "AI prediction confidence",
            statCrops: "Crops Analyzed",
            statCropsSub: "Different crop types",
            trendTitle: "Detection Trends",
            trendSub: "Detections over the last 30 days",
            cropDistTitle: "Crop-wise Distribution",
            cropDistSub: "Detections by crop type",
            commonDiseasesTitle: "Common Diseases",
            commonDiseasesSub: "Most detected diseases",
            viewAllBtn: "View All →",
            allCrops: "All Crops",
            allResults: "All Results",
            last30Days: "Last 30 Days",
            searchPlaceholder: "Search crop, disease, or detection ID...",
            refresh: "Refresh",
            clearHistory: "Clear History",
            allDetectionsTab: "All Detections",
            healthyTab: "Healthy",
            diseasedTab: "Diseased",
            favoritesTab: "Favorites",
            gridView: "Grid View",
            listView: "List View",
            viewDetailsBtn: "View Details →",
            detailsHeading: "Detection Details",
            aiAnalysisBtn: "AI Analysis",
            classProbBtn: "Class Probabilities",
            origImageBtn: "Original Image",
            severityLabel: "Severity",
            symptomsTitle: "Observed Symptoms",
            recommendedActionsTitle: "Recommended Actions",
            treatmentGuidanceTitle: "Treatment Guidance",
            sprayGuidanceTitle: "Spray Guidance",
            preventionTitle: "Prevention Strategy",
            farmerActionTitle: "Farmer Action Plan",
            viewFullReportBtn: "View Full Report",
            askAiBtn: "Ask AI About This",
            emptyTitle: "No Detection History Yet",
            emptySub: "Upload a crop leaf image in Disease Detection to begin your AI crop health analyses.",
            startDetectionBtn: "Start Disease Detection →",
            loadingTitle: "Loading Detection History",
            loadingSub: "Retrieving your past analyses...",
            showingLabel: "Showing",
            perPage: "per page",
            healthyBadge: "Healthy",
            diseaseBadge: "Disease",
            confidenceLabel: "confidence",
            recordIdLabel: "Record ID:",
            confidenceScoreLabel: "Confidence Score",
            statusLabel: "Status",
            detectionDateLabel: "Detection Date"
        },
        mr: {
            eyebrow: "रोग शोध इतिहास",
            title: "रोग शोध इतिहास",
            subtitle: "तुमच्या पीक आरोग्याचा संपूर्ण विश्लेषणात्मक प्रवास. AI अंतर्दृष्टीसह प्रगती करा.",
            sloganTop: "प्रत्येक शोध",
            sloganSub: "उद्याचे पीक निरोगी ठेवतो",
            statTotal: "एकूण शोध",
            statTotalSub: "मागील महिन्यापासून",
            statHealthy: "निरोगी",
            statHealthySub: "एकूण पैकी",
            statDisease: "रोग आढळला",
            statDiseaseSub: "एकूण पैकी",
            statConfidence: "सरासरी विश्वास पातळी",
            statConfidenceSub: "AI मॉडेल अचूकता",
            statCrops: "विश्लेषित पिके",
            statCropsSub: "विविध पिकांचे प्रकार",
            trendTitle: "शोध कल (Trends)",
            trendSub: "मागील 30 दिवसांतील तपासणी कल",
            cropDistTitle: "पिकानुसार वितरण",
            cropDistSub: "पिकांनुसार नोंदींचे प्रमाण",
            commonDiseasesTitle: "वारंवार आढळणारे रोग",
            commonDiseasesSub: "सर्वाधिक आढळलेले रोग",
            viewAllBtn: "सर्व पहा →",
            allCrops: "सर्व पिके",
            allResults: "सर्व निकाल",
            last30Days: "मागील 30 दिवस",
            searchPlaceholder: "पीक, रोग किंवा ID शोधा...",
            refresh: "रिफ्रेश",
            clearHistory: "इतिहास साफ करा",
            allDetectionsTab: "सर्व शोध",
            healthyTab: "निरोगी",
            diseasedTab: "रोगग्रस्त",
            favoritesTab: "आवडीचे",
            gridView: "ग्रीड दृश्य",
            listView: "यादी दृश्य",
            viewDetailsBtn: "तपशील पहा →",
            detailsHeading: "शोध तपशील",
            aiAnalysisBtn: "AI विश्लेषण",
            classProbBtn: "वर्ग संभाव्यता",
            origImageBtn: "मूळ फोटो",
            severityLabel: "तीव्रता",
            symptomsTitle: "आढळलेली लक्षणे",
            recommendedActionsTitle: "शिफारस केलेल्या कृती",
            treatmentGuidanceTitle: "उपचार मार्गदर्शन",
            sprayGuidanceTitle: "फवारणी मार्गदर्शन",
            preventionTitle: "प्रतिबंधात्मक उपाय",
            farmerActionTitle: "शेतकरी कृती आराखडा",
            viewFullReportBtn: "संपूर्ण अहवाल पहा",
            askAiBtn: "AI ला याबद्दल विचारा",
            emptyTitle: "अद्याप कोणताही इतिहास नाही",
            emptySub: "प्रथम रोग शोध करा. तुमचे सर्व निकाल येथे दिसतील.",
            startDetectionBtn: "रोग शोध सुरू करा →",
            loadingTitle: "इतिहास लोड होत आहे",
            loadingSub: "माहिती गोळा केली जात आहे...",
            showingLabel: "दाखवत आहे",
            perPage: "प्रति पृष्ठ",
            healthyBadge: "निरोगी",
            diseaseBadge: "रोग आढळला",
            confidenceLabel: "विश्वास पातळी",
            recordIdLabel: "नोंद ID:",
            confidenceScoreLabel: "विश्वास पातळी",
            statusLabel: "स्थिती",
            detectionDateLabel: "शोध तारीख"
        },
        hi: {
            eyebrow: "पहचान इतिहास",
            title: "पहचान इतिहास",
            subtitle: "आपकी फसल स्वास्थ्य विश्लेषण की पूरी यात्रा। AI अंतर्दृष्टि के साथ सीखें और बढ़ें।",
            sloganTop: "प्रत्येक पहचान",
            sloganSub: "बनाए एक स्वस्थ कल",
            statTotal: "कुल पहचान",
            statTotalSub: "पिछले महीने से",
            statHealthy: "स्वस्थ",
            statHealthySub: "कुल का",
            statDisease: "रोग पहचाना गया",
            statDiseaseSub: "कुल का",
            statConfidence: "औसत सटीकता",
            statConfidenceSub: "AI मॉडल सटीकता",
            statCrops: "विश्लेषित फसलें",
            statCropsSub: "विभिन्न फसल प्रकार",
            trendTitle: "पहचान रुझान",
            trendSub: "पिछले 30 दिनों का रुझान",
            cropDistTitle: "फसल-वार वितरण",
            cropDistSub: "फसल के प्रकार अनुसार",
            commonDiseasesTitle: "सामान्य रोग",
            commonDiseasesSub: "सबसे अधिक पाए जाने वाले रोग",
            viewAllBtn: "सभी देखें →",
            allCrops: "सभी फसलें",
            allResults: "सभी परिणाम",
            last30Days: "पिछले 30 दिन",
            searchPlaceholder: "फसल, रोग या ID खोजें...",
            refresh: "रिफ्रेश",
            clearHistory: "इतिहास साफ करें",
            allDetectionsTab: "सभी पहचान",
            healthyTab: "स्वस्थ",
            diseasedTab: "रोगग्रस्त",
            favoritesTab: "पसंदीदा",
            gridView: "ग्रिड व्यू",
            listView: "लिस्ट व्यू",
            viewDetailsBtn: "विवरण देखें →",
            detailsHeading: "पहचान विवरण",
            aiAnalysisBtn: "AI विश्लेषण",
            classProbBtn: "क्लास संभावनाएँ",
            origImageBtn: "मूल फोटो",
            severityLabel: "गंभीरता",
            symptomsTitle: "लक्षण",
            recommendedActionsTitle: "अनुशंसित कार्रवाई",
            treatmentGuidanceTitle: "उपचार मार्गदर्शन",
            sprayGuidanceTitle: "छिड़काव मार्गदर्शन",
            preventionTitle: "रोकथाम रणनीति",
            farmerActionTitle: "किसान कार्य योजना",
            viewFullReportBtn: "पूरी रिपोर्ट देखें",
            askAiBtn: "AI से इसके बारे में पूछें",
            emptyTitle: "अभी कोई पहचान इतिहास नहीं है",
            emptySub: "अपनी पहली AI स्वास्थ्य पहचान करने के लिए पत्ते की फोटो अपलोड करें।",
            startDetectionBtn: "रोग पहचान शुरू करें →",
            loadingTitle: "इतिहास लोड हो रहा है",
            loadingSub: "परिणाम लोड किए जा रहे हैं...",
            showingLabel: "दिखाया जा रहा है",
            perPage: "प्रति पृष्ठ",
            healthyBadge: "स्वस्थ",
            diseaseBadge: "रोगग्रस्त",
            confidenceLabel: "सटीकता",
            recordIdLabel: "रिकॉर्ड ID:",
            confidenceScoreLabel: "सटीकता स्कोर",
            statusLabel: "स्थिति",
            detectionDateLabel: "पहचान दिनांक"
        }
    };

    const text = ui[language] || ui.en;

    // Farmer Name
    const [farmerName, setFarmerName] = useState("Farmer");
    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.name || parsed.username) {
                    setFarmerName(parsed.name || parsed.username);
                }
            } catch (e) {}
        }
    }, []);

    // State
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // Filtering & View Controls
    const [searchQuery, setSearchQuery] = useState("");
    const [cropFilter, setCropFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "healthy" | "disease" | "favorites"
    const [favoriteIds, setFavoriteIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("agrimind_favorite_detections") || "[]");
        } catch {
            return [];
        }
    });
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailTab, setDetailTab] = useState("aiAnalysis"); // "aiAnalysis" | "classProbabilities" | "originalImage"
    const [analysisCache, setAnalysisCache] = useState({});
    const [analysisLoading, setAnalysisLoading] = useState(false);

    // Toggle favorite
    const toggleFavorite = (id, e) => {
        if (e) e.stopPropagation();
        setFavoriteIds((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            localStorage.setItem("agrimind_favorite_detections", JSON.stringify(next));
            return next;
        });
    };

    // Helper to format date cleanly
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "Recent";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString(language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return dateStr;
        }
    };

    // Helper to normalize image URL
    const getValidImage = (imgPath, cropName) => {
        if (imgPath && (imgPath.startsWith("http") || imgPath.startsWith("data:") || imgPath.startsWith("/"))) {
            return imgPath;
        }
        if (imgPath && imgPath.length > 5) {
            return `${API_BASE_URL}/${imgPath.replace(/^\/+/, "")}`;
        }
        const cropLower = String(cropName || "").toLowerCase();
        if (cropLower.includes("cotton")) return "/images/crop_cotton.jpg";
        if (cropLower.includes("soybean")) return "/images/crop_soybean.jpg";
        if (cropLower.includes("maize") || cropLower.includes("corn")) return "/images/crop_maize.jpg";
        if (cropLower.includes("wheat")) return "/images/crop_wheat.jpg";
        if (cropLower.includes("tomato")) return "/images/crop_tomato.jpg";
        if (cropLower.includes("pepper")) return "/images/crop_bell_pepper.jpg";
        return "/images/sample_leaf.jpg";
    };

    // Load History from API
    const fetchHistory = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const token = getToken();
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${API_BASE_URL}/history`, {
                method: "GET",
                headers
            });

            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.history)) {
                    const mapped = data.history.map((item, idx) => {
                        const rec = item.recommendation || {};
                        let probs = item.probabilities;
                        if (typeof probs === "string") {
                            try {
                                probs = JSON.parse(probs);
                            } catch {
                                probs = null;
                            }
                        }

                        return {
                            id: item.id || `AGM-${String(idx + 1).padStart(4, "0")}`,
                            crop: item.crop || "Crop",
                            prediction: item.prediction || (isHealthy(item.crop) ? "Healthy" : "Leaf Spot"),
                            confidence: Number(item.confidence) || 0,
                            date: formatDateTime(item.created_at),
                            rawDate: item.created_at,
                            image: getValidImage(item.image_path || item.filename, item.crop),
                            severity: rec.severity || (isHealthy(item.prediction) ? "None" : "Moderate"),
                            symptoms: rec.symptoms || null,
                            immediate_action: rec.immediate_action || null,
                            treatment: rec.treatment || null,
                            spray_guidance: rec.spray_guidance || null,
                            prevention: rec.prevention || null,
                            farmer_action: rec.farmer_action || null,
                            probabilities: probs
                        };
                    });
                    setHistory(mapped);
                    return;
                }
            }
            setHistory([]);
        } catch (err) {
            console.error("History fetch error:", err);
            setHistory([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [language]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Helper to normalize crop key for API requests
    const normalizeCropKey = (crop) => {
        const c = String(crop || "").toLowerCase().trim();
        if (c.includes("cotton")) return "cotton";
        if (c.includes("soybean") || c.includes("soy")) return "soybean";
        if (c.includes("maize") || c.includes("corn")) return "maize";
        if (c.includes("wheat")) return "wheat";
        if (c.includes("pigeon") || c.includes("tur")) return "pigeon_pea";
        return c;
    };

    // Fetch live AI Analysis on-demand when opening modal if not already present
    const fetchAnalysisForRecord = useCallback(async (record) => {
        if (!record) return;

        // If this record already has symptoms or treatment, it already has analysis
        if (record.symptoms || record.treatment || record.farmer_action) {
            return;
        }

        const cacheKey = String(record.id || `${record.crop}_${record.prediction}`);
        if (analysisCache[cacheKey]) {
            const cached = analysisCache[cacheKey];
            setSelectedRecord((prev) => (prev && prev.id === record.id ? { ...prev, ...cached } : prev));
            return;
        }

        try {
            setAnalysisLoading(true);
            const token = getToken();
            const cropKey = normalizeCropKey(record.crop);
            const diseaseKey = record.prediction;
            const conf = record.confidence || 0;

            const res = await fetch(
                `${API_BASE_URL}/recommendation/stream?crop=${encodeURIComponent(cropKey)}&disease=${encodeURIComponent(diseaseKey)}&confidence=${encodeURIComponent(conf)}&language=en`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );

            if (!res.ok || !res.body) {
                setAnalysisLoading(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let accumulated = {};

            while (true) {
                const { value, done } = await reader.read();
                buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
                const events = buffer.split("\n\n");
                buffer = events.pop() || "";

                for (const event of events) {
                    const line = event.split("\n").find((item) => item.startsWith("data: "));
                    if (!line) continue;
                    try {
                        const payload = JSON.parse(line.slice(6));
                        if (payload.data) {
                            const d = payload.data;
                            accumulated = {
                                ...accumulated,
                                ...(d.severity ? { severity: d.severity } : {}),
                                ...(d.symptoms ? { symptoms: d.symptoms } : {}),
                                ...(d.immediate_action ? { immediate_action: d.immediate_action } : {}),
                                ...(d.prevention ? { prevention: d.prevention } : {}),
                                ...(d.spray_guidance ? { spray_guidance: d.spray_guidance } : {}),
                                ...(d.treatment ? { treatment: d.treatment } : {}),
                                ...(d.farmer_action ? { farmer_action: d.farmer_action } : {}),
                                ...(d.source ? { source: d.source } : {}),
                                ...(d.ai_explanation || d.explanation ? { ai_explanation: d.ai_explanation || d.explanation } : {})
                            };
                            setSelectedRecord((prev) => (prev && prev.id === record.id ? { ...prev, ...accumulated } : prev));
                        }
                    } catch {
                        // ignore malformed chunk
                    }
                }
                if (done) break;
            }

            // Save to cache and update record in history list
            setAnalysisCache((prev) => ({ ...prev, [cacheKey]: accumulated }));
            setHistory((prevList) =>
                prevList.map((item) => (item.id === record.id ? { ...item, ...accumulated } : item))
            );
        } catch (err) {
            console.error("AI Analysis fetch error:", err);
        } finally {
            setAnalysisLoading(false);
        }
    }, [analysisCache]);

    // Handle Modal Open & Close
    const handleOpenModal = (record, e) => {
        if (e) e.stopPropagation();
        const cacheKey = String(record.id || `${record.crop}_${record.prediction}`);
        const cached = analysisCache[cacheKey];
        const mergedRecord = cached ? { ...record, ...cached } : record;
        setSelectedRecord(mergedRecord);
        setDetailTab("aiAnalysis");
        setModalOpen(true);

        if (!mergedRecord.symptoms && !mergedRecord.treatment && !mergedRecord.farmer_action) {
            fetchAnalysisForRecord(mergedRecord);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setAnalysisLoading(false);
    };

    // Keyboard listener for Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && modalOpen) {
                handleCloseModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [modalOpen]);

    // Clear History
    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear all detection history? This cannot be undone.")) return;
        try {
            const token = getToken();
            const headers = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            await fetch(`${API_BASE_URL}/history`, {
                method: "DELETE",
                headers
            });
            setHistory([]);
            handleCloseModal();
        } catch (e) {
            console.error("Error clearing history:", e);
        }
    };

    // Filtered Records
    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                String(item.crop || "").toLowerCase().includes(q) ||
                String(item.prediction || "").toLowerCase().includes(q) ||
                String(item.id || "").toLowerCase().includes(q);
            if (!matchesSearch) return false;

            if (cropFilter !== "all" && String(item.crop || "").toLowerCase() !== cropFilter.toLowerCase()) {
                return false;
            }

            if (statusFilter === "healthy" && !isHealthy(item.prediction)) return false;
            if (statusFilter === "disease" && isHealthy(item.prediction)) return false;
            if (statusFilter === "favorites" && !favoriteIds.includes(item.id)) return false;

            return true;
        });
    }, [history, searchQuery, cropFilter, statusFilter, favoriteIds]);

    // Dynamic Statistics Derived 100% from Real Data
    const stats = useMemo(() => {
        const total = history.length;
        if (total === 0) {
            return {
                total: 0,
                healthy: 0,
                disease: 0,
                avgConf: 0,
                cropsCount: 0,
                cropDist: [],
                commonDiseases: [],
                highestDiseaseCount: 0,
                donutSegments: []
            };
        }
        let healthy = 0;
        let disease = 0;
        let confSum = 0;
        let validConfCount = 0;
        const cropMap = {};
        const diseaseMap = {};

        history.forEach((h) => {
            if (isHealthy(h.prediction)) healthy++;
            else disease++;

            const cVal = Number(h.confidence);
            if (!isNaN(cVal) && cVal > 0) {
                confSum += cVal;
                validConfCount++;
            }

            const c = h.crop || "Unknown";
            cropMap[c] = (cropMap[c] || 0) + 1;

            if (!isHealthy(h.prediction) && h.prediction) {
                diseaseMap[h.prediction] = (diseaseMap[h.prediction] || 0) + 1;
            }
        });

        const avgConf = validConfCount > 0 ? (confSum / validConfCount).toFixed(1) : "0.0";
        const cropsCount = Object.keys(cropMap).length;

        const cropDist = Object.entries(cropMap)
            .map(([crop, count]) => ({
                crop,
                count,
                pct: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count);

        const palette = ["#22c55e", "#84cc16", "#eab308", "#3b82f6", "#ec4899", "#f97316", "#06b6d4", "#a855f7"];
        const circumference = 2 * Math.PI * 38; // ~238.76
        let currentOffset = 0;

        const donutSegments = cropDist.map((item, idx) => {
            const strokeDash = (item.count / total) * circumference;
            const strokeDashoffset = -currentOffset;
            currentOffset += strokeDash;
            return {
                ...item,
                color: palette[idx % palette.length],
                strokeDasharray: `${strokeDash} ${circumference}`,
                strokeDashoffset
            };
        });

        const sortedDiseases = Object.entries(diseaseMap)
            .map(([diseaseName, count]) => ({
                disease: diseaseName,
                count
            }))
            .sort((a, b) => b.count - a.count);

        const highestDiseaseCount = sortedDiseases.length > 0 ? sortedDiseases[0].count : 1;

        const commonDiseases = sortedDiseases
            .map((item) => ({
                ...item,
                pct: Math.min(100, Math.round((item.count / highestDiseaseCount) * 100))
            }))
            .slice(0, 5);

        return {
            total,
            healthy,
            disease,
            avgConf,
            cropsCount,
            cropDist,
            commonDiseases,
            highestDiseaseCount,
            donutSegments
        };
    }, [history]);

    // Dynamic 30-Day Detection Trends
    const trendsData = useMemo(() => {
        const days = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
            const label = d.toLocaleDateString(language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-US", {
                day: "numeric",
                month: "short"
            });
            days.push({
                dateKey,
                label,
                healthy: 0,
                disease: 0,
                total: 0
            });
        }

        history.forEach((item) => {
            if (!item.rawDate) return;
            try {
                const itemD = new Date(item.rawDate);
                if (isNaN(itemD.getTime())) return;
                const itemKey = itemD.toISOString().split("T")[0];
                const found = days.find((day) => day.dateKey === itemKey);
                if (found) {
                    if (isHealthy(item.prediction)) found.healthy++;
                    else found.disease++;
                    found.total++;
                }
            } catch {}
        });

        // Compute peak for scaling
        let maxCount = 1;
        days.forEach((day) => {
            if (day.healthy > maxCount) maxCount = day.healthy;
            if (day.disease > maxCount) maxCount = day.disease;
        });

        // Generate SVG paths
        const width = 380;
        const height = 110;
        const padX = 10;
        const padY = 15;
        const chartW = width - padX * 2;
        const chartH = height - padY * 2;

        const healthyPoints = days.map((day, idx) => {
            const x = padX + (idx / (days.length - 1)) * chartW;
            const y = height - padY - (day.healthy / maxCount) * chartH;
            return { x, y };
        });

        const diseasePoints = days.map((day, idx) => {
            const x = padX + (idx / (days.length - 1)) * chartW;
            const y = height - padY - (day.disease / maxCount) * chartH;
            return { x, y };
        });

        const createSmoothPath = (pts) => {
            if (pts.length === 0) return "";
            if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
            let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
            for (let i = 0; i < pts.length - 1; i++) {
                const xc = (pts[i].x + pts[i + 1].x) / 2;
                const yc = (pts[i].y + pts[i + 1].y) / 2;
                d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
            }
            d += ` T ${pts[pts.length - 1].x.toFixed(1)} ${pts[pts.length - 1].y.toFixed(1)}`;
            return d;
        };

        return {
            days,
            healthyPath: createSmoothPath(healthyPoints),
            diseasePath: createSmoothPath(diseasePoints),
            hasData: history.length > 0,
            tickLabels: [
                days[0]?.label || "Day 1",
                days[7]?.label || "Day 8",
                days[14]?.label || "Day 15",
                days[21]?.label || "Day 22",
                days[29]?.label || "Today"
            ]
        };
    }, [history, language]);

    // Unique crops list for dropdown
    const availableCrops = useMemo(() => {
        const set = new Set();
        history.forEach((h) => {
            if (h.crop) set.add(h.crop);
        });
        return Array.from(set);
    }, [history]);

    // Pagination
    const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredHistory.slice(start, start + pageSize);
    }, [filteredHistory, currentPage, pageSize]);

    // Adjust page if current page exceeds total pages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    return (
        <div className="exp-history-page-root">
            <style>{`
                /* =========================================================
                   AGRIMIND AI - DETECTION HISTORY (EXP SCOPED)
                ========================================================= */
                .exp-history-page-root {
                    width: 100%;
                    min-height: 100%;
                    background: #f4fbf7;
                    padding: 24px 36px 60px 36px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    box-sizing: border-box;
                    color: #0f172a;
                }

                /* Top Navigation / Search Header */
                .exp-history-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 2px;
                }

                .exp-history-search-box {
                    flex: 1;
                    max-width: 480px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .exp-history-search-box svg {
                    position: absolute;
                    left: 18px;
                    color: #94a3b8;
                    pointer-events: none;
                }

                .exp-history-search-box input {
                    width: 100%;
                    height: 48px;
                    padding: 0 20px 0 50px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    font-size: 14px;
                    color: #1e293b;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .exp-history-search-box input:focus {
                    border-color: #22c55e;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
                }

                .exp-history-search-box input::placeholder {
                    color: #94a3b8;
                }

                .exp-history-topbar-user {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .exp-history-notif-btn {
                    position: relative;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #334155;
                    transition: all 0.2s ease;
                }

                .exp-history-notif-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .exp-history-notif-badge {
                    position: absolute;
                    top: 5px;
                    right: 6px;
                    background: #ef4444;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    width: 17px;
                    height: 17px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #ffffff;
                }

                .exp-history-profile-pill {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 4px 14px 4px 4px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .exp-history-profile-pill:hover {
                    border-color: #cbd5e1;
                }

                .exp-history-profile-img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .exp-history-profile-info {
                    display: flex;
                    flex-direction: column;
                }

                .exp-history-profile-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.2;
                }

                .exp-history-profile-tag {
                    font-size: 12px;
                    font-weight: 600;
                    color: #16a34a;
                }

                /* ================= HERO BANNER ================= */
                .exp-history-hero-card {
                    position: relative;
                    height: 130px;
                    background: linear-gradient(90deg, #dcfce7 0%, #edfbf2 55%, #bbf7d0 100%);
                    border-radius: 20px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 36px;
                    border: 1px solid rgba(187, 247, 208, 0.75);
                    box-shadow: 0 4px 20px -4px rgba(22, 101, 52, 0.06);
                }

                .exp-history-hero-bg {
                    position: absolute;
                    right: 0;
                    top: 0;
                    height: 100%;
                    width: 50%;
                    object-fit: cover;
                    object-position: center;
                    mask-image: linear-gradient(to left, rgba(0, 0, 0, 0.95) 45%, rgba(0, 0, 0, 0) 100%);
                    -webkit-mask-image: linear-gradient(to left, rgba(0, 0, 0, 0.95) 45%, rgba(0, 0, 0, 0) 100%);
                    pointer-events: none;
                }

                .exp-history-hero-left {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }

                .exp-history-leaf-badge {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #15803d;
                    box-shadow: 0 6px 16px -2px rgba(22, 101, 52, 0.12);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }

                .exp-history-hero-titles {
                    display: flex;
                    flex-direction: column;
                }

                .exp-history-eyebrow {
                    font-size: 11.5px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    color: #16a34a;
                    margin-bottom: 2px;
                }

                .exp-history-main-title {
                    font-size: 30px;
                    font-weight: 800;
                    color: #0d2613;
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                    margin: 0;
                }

                .exp-history-subtitle {
                    font-size: 13.5px;
                    font-weight: 500;
                    color: #4b6354;
                    margin: 3px 0 0 0;
                }

                .exp-history-slogan {
                    position: relative;
                    z-index: 2;
                    margin-right: 24px;
                    font-family: 'Caveat', cursive, 'Segoe Print', sans-serif;
                    font-size: 22px;
                    font-weight: 700;
                    color: #166534;
                    line-height: 1.15;
                    text-align: right;
                    transform: rotate(-2deg);
                    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.85);
                }

                /* ================= 5 SUMMARY STATISTICS CARDS ================= */
                .exp-history-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 16px;
                }

                .exp-history-stat-card {
                    background: #ffffff;
                    border-radius: 18px;
                    border: 1px solid #e2e8f0;
                    padding: 20px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.03);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .exp-history-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px -2px rgba(0, 0, 0, 0.06);
                }

                .exp-stat-icon-wrap {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .exp-icon-mint { background: #f0fdf4; color: #16a34a; }
                .exp-icon-green { background: #eefbf3; color: #15803d; }
                .exp-icon-red { background: #fef2f2; color: #ef4444; }
                .exp-icon-blue { background: #eff6ff; color: #2563eb; }
                .exp-icon-sprout { background: #f0fdf4; color: #15803d; }

                .exp-stat-info {
                    display: flex;
                    flex-direction: column;
                }

                .exp-stat-num {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.1;
                }

                .exp-stat-lbl {
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    margin-bottom: 2px;
                }

                .exp-stat-accent {
                    font-size: 11.5px;
                    font-weight: 700;
                    color: #16a34a;
                }

                .exp-stat-muted {
                    font-size: 11.5px;
                    color: #94a3b8;
                    font-weight: 500;
                }

                /* ================= 3 ANALYTICS VISUAL CARDS ROW ================= */
                .exp-history-visual-row {
                    display: grid;
                    grid-template-columns: 1.3fr 1.1fr 1fr;
                    gap: 18px;
                }

                .exp-vis-card {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    padding: 22px 24px;
                    box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.03);
                    display: flex;
                    flex-direction: column;
                }

                .exp-vis-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .exp-vis-header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .exp-vis-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    background: #f0fdf4;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .exp-vis-titles h4 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .exp-vis-titles p {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    color: #64748b;
                }

                /* Trend Line Chart Simulation with SVG */
                .exp-trend-container {
                    width: 100%;
                    height: 130px;
                }

                /* Crop-wise Donut with side legend */
                .exp-donut-body {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }

                .exp-donut-wrap {
                    position: relative;
                    width: 110px;
                    height: 110px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .exp-donut-center {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .exp-donut-num {
                    font-size: 19px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }

                .exp-donut-lbl {
                    font-size: 10px;
                    font-weight: 600;
                    color: #64748b;
                }

                .exp-crop-legend-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                    max-height: 120px;
                    overflow-y: auto;
                }

                .exp-crop-legend-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 11.5px;
                }

                .exp-crop-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 6px;
                }

                /* Common Diseases Progress list */
                .exp-common-disease-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .exp-cdisease-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12px;
                }

                .exp-cdisease-name {
                    width: 120px;
                    font-weight: 700;
                    color: #1e293b;
                    flex-shrink: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .exp-cdisease-track {
                    flex: 1;
                    height: 8px;
                    background: #f1f5f9;
                    border-radius: 9999px;
                    overflow: hidden;
                }

                .exp-cdisease-fill {
                    height: 100%;
                    border-radius: 9999px;
                    transition: width 0.3s ease;
                }

                /* ================= FILTER TOOLBAR ================= */
                .exp-history-toolbar {
                    background: #ffffff;
                    border-radius: 18px;
                    border: 1px solid #e2e8f0;
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
                }

                .exp-toolbar-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                }

                .exp-select-pill {
                    height: 40px;
                    padding: 0 14px;
                    border-radius: 10px;
                    border: 1.5px solid #cbd5e1;
                    background: #ffffff;
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                    outline: none;
                    cursor: pointer;
                }

                .exp-toolbar-search {
                    flex: 1;
                    max-width: 320px;
                    height: 40px;
                    padding: 0 14px;
                    border-radius: 10px;
                    border: 1.5px solid #cbd5e1;
                    font-size: 13px;
                    outline: none;
                }

                .exp-toolbar-search:focus {
                    border-color: #22c55e;
                }

                .exp-toolbar-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .exp-btn-refresh {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 9px 16px;
                    border-radius: 10px;
                    border: 1.5px solid #cbd5e1;
                    background: #ffffff;
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .exp-btn-refresh:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }

                .exp-btn-clear {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 9px 18px;
                    border-radius: 10px;
                    border: none;
                    background: #ef4444;
                    color: #ffffff;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .exp-btn-clear:hover {
                    background: #dc2626;
                }

                /* Tab Bar & View Toggle */
                .exp-tabs-view-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }

                .exp-tabs-list {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .exp-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 18px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .exp-tab-btn.active {
                    background: #16a34a;
                    color: #ffffff;
                    border-color: #16a34a;
                    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
                }

                .exp-view-toggle {
                    display: flex;
                    align-items: center;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 3px;
                }

                .exp-view-mode-btn {
                    padding: 7px 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: none;
                    background: transparent;
                    border-radius: 9px;
                    cursor: pointer;
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #64748b;
                }

                .exp-view-mode-btn.active {
                    background: #16a34a;
                    color: #ffffff;
                }

                /* ================= FULL-WIDTH HISTORY CARDS GRID ================= */
                .exp-history-full-container {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .exp-history-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 18px;
                    width: 100%;
                }

                .exp-history-card {
                    background: #ffffff;
                    border-radius: 18px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.03);
                    cursor: pointer;
                    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .exp-history-card:hover {
                    transform: translateY(-3px);
                    border-color: #86efac;
                    box-shadow: 0 8px 24px -4px rgba(22, 163, 74, 0.12);
                }

                .exp-card-photo-box {
                    position: relative;
                    width: 100%;
                    height: 140px;
                    background: #000000;
                    overflow: hidden;
                }

                .exp-card-photo-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .exp-history-card:hover .exp-card-photo-box img {
                    transform: scale(1.03);
                }

                .exp-fav-btn {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 13px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                    transition: transform 0.15s ease;
                }

                .exp-fav-btn:hover {
                    transform: scale(1.1);
                }

                .exp-card-status-pill {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    padding: 4px 10px;
                    border-radius: 9999px;
                    font-size: 11px;
                    font-weight: 800;
                    backdrop-filter: blur(8px);
                }

                .exp-badge-healthy {
                    background: rgba(255, 255, 255, 0.95);
                    color: #15803d;
                    border: 1px solid #86efac;
                }

                .exp-badge-disease {
                    background: rgba(255, 255, 255, 0.95);
                    color: #b91c1c;
                    border: 1px solid #fca5a5;
                }

                .exp-card-body {
                    padding: 14px 16px 16px 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    flex: 1;
                    gap: 12px;
                }

                .exp-card-crop-name {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 2px;
                }

                .exp-card-disease-bad {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #ef4444;
                    line-height: 1.3;
                }

                .exp-card-disease-good {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #16a34a;
                    line-height: 1.3;
                }

                .exp-card-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-top: 8px;
                    font-size: 11.5px;
                    color: #64748b;
                }

                .exp-btn-view-details {
                    width: 100%;
                    padding: 8px 12px;
                    border-radius: 10px;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #15803d;
                    font-size: 12.5px;
                    font-weight: 700;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.15s ease;
                }

                .exp-btn-view-details:hover {
                    background: #16a34a;
                    color: #ffffff;
                    border-color: #16a34a;
                }

                /* ================= LIST VIEW MODE ================= */
                .exp-history-list-view {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                }

                .exp-history-list-item {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 12px 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    transition: transform 0.15s ease, border-color 0.15s ease;
                    cursor: pointer;
                }

                .exp-history-list-item:hover {
                    transform: translateY(-2px);
                    border-color: #86efac;
                }

                .exp-list-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;
                }

                .exp-list-thumb {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    object-fit: cover;
                }

                .exp-list-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .exp-list-title {
                    font-size: 14.5px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .exp-list-meta {
                    font-size: 12px;
                    color: #64748b;
                    display: flex;
                    gap: 14px;
                }

                .exp-list-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                /* ================= EMPTY & LOADING STATES ================= */
                .exp-empty-container {
                    background: #ffffff;
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 20px;
                    padding: 60px 20px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }

                .exp-empty-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #f0fdf4;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                }

                .exp-empty-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .exp-empty-sub {
                    font-size: 14px;
                    color: #64748b;
                    max-width: 440px;
                    margin: 0 0 12px 0;
                }

                .exp-empty-btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    border: none;
                    background: #16a34a;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
                }

                /* Pagination Footer */
                .exp-pagination-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 10px;
                    font-size: 13px;
                    color: #64748b;
                }

                .exp-pagination-buttons {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .exp-page-btn {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .exp-page-btn:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .exp-page-btn.active {
                    background: #16a34a;
                    color: #ffffff;
                    border-color: #16a34a;
                }

                .exp-page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* ================= PREMIUM CENTERED MODAL / POPUP ================= */
                .exp-history-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    animation: expFadeIn 0.2s ease-out;
                }

                .exp-history-modal-content {
                    background: #ffffff;
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.18);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: expPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes expFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes expPopIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .exp-history-modal-header {
                    padding: 18px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #ffffff;
                }

                .exp-modal-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .exp-modal-header-badge {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #f0fdf4;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .exp-modal-title-wrap h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .exp-modal-title-wrap p {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    color: #64748b;
                }

                .exp-history-modal-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #475569;
                    font-size: 16px;
                    font-weight: 700;
                    transition: all 0.15s ease;
                }

                .exp-history-modal-close:hover {
                    background: #fee2e2;
                    color: #ef4444;
                    border-color: #fca5a5;
                }

                .exp-history-modal-body {
                    padding: 24px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .exp-modal-hero-split {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 20px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 16px;
                }

                .exp-modal-img-frame {
                    position: relative;
                    width: 100%;
                    height: 190px;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #000000;
                }

                .exp-modal-img-frame img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .exp-modal-summary-col {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .exp-modal-pred-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 6px 0;
                }

                .exp-modal-pred-disease {
                    font-size: 15px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .exp-modal-grid-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    font-size: 12px;
                    color: #475569;
                }

                .exp-modal-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #ffffff;
                    padding: 6px 10px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .exp-modal-subtabs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                }

                .exp-modal-subtab-btn {
                    flex: 1;
                    padding: 8px 12px;
                    border-radius: 9px;
                    border: none;
                    background: transparent;
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.15s ease;
                }

                .exp-modal-subtab-btn.active {
                    background: #ffffff;
                    color: #0f172a;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                }

                .exp-modal-tab-pane {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .exp-modal-severity-alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px 16px;
                    border-radius: 14px;
                    font-size: 13px;
                }

                .exp-alert-healthy {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #15803d;
                }

                .exp-alert-disease {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                }

                .exp-modal-card-section {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 16px 18px;
                }

                .exp-analysis-spinner {
                    display: inline-block;
                    width: 22px;
                    height: 22px;
                    border: 2.5px solid #cbd5e1;
                    border-top-color: #16a34a;
                    border-radius: 50%;
                    animation: expSpin 0.8s linear infinite;
                }

                @keyframes expSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .exp-modal-card-section h5 {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    font-weight: 800;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .exp-history-text-bullet {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 6px;
                    font-size: 12.5px;
                    color: #334155;
                    line-height: 1.5;
                }

                .exp-history-bullet-dot {
                    color: #16a34a;
                    font-weight: 900;
                    font-size: 16px;
                    line-height: 1;
                }

                .exp-history-text-p {
                    margin: 0 0 8px 0;
                    font-size: 12.5px;
                    color: #334155;
                    line-height: 1.5;
                }

                .exp-history-text-bold {
                    color: #0f172a;
                    font-weight: 700;
                }

                .exp-prob-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 10px;
                    font-size: 12.5px;
                }

                .exp-prob-label {
                    width: 180px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .exp-prob-track {
                    flex: 1;
                    height: 10px;
                    background: #f1f5f9;
                    border-radius: 9999px;
                    overflow: hidden;
                }

                .exp-prob-fill {
                    height: 100%;
                    border-radius: 9999px;
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                }

                .exp-history-modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #f1f5f9;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .exp-btn-report {
                    padding: 10px 18px;
                    border-radius: 10px;
                    border: 1.5px solid #cbd5e1;
                    background: #ffffff;
                    color: #1e293b;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .exp-btn-report:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }

                .exp-btn-ask-ai {
                    padding: 10px 20px;
                    border-radius: 10px;
                    border: none;
                    background: #16a34a;
                    color: #ffffff;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: background 0.15s ease;
                }

                .exp-btn-ask-ai:hover {
                    background: #15803d;
                }

                @media (max-width: 1200px) {
                    .exp-history-stats-grid { grid-template-columns: repeat(3, 1fr); }
                    .exp-history-visual-row { grid-template-columns: 1fr; }
                    .exp-history-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .exp-history-page-root { padding: 16px; }
                    .exp-history-stats-grid { grid-template-columns: 1fr; }
                    .exp-history-grid { grid-template-columns: 1fr; }
                    .exp-modal-hero-split { grid-template-columns: 1fr; }
                    .exp-history-hero-card { height: auto; padding: 20px; flex-direction: column; align-items: flex-start; gap: 14px; }
                    .exp-history-hero-bg { display: none; }
                }
            `}</style>

            {/* ================= TOPBAR ================= */}
            <div className="exp-history-topbar">
                <div className="exp-history-search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder={text.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="exp-history-topbar-user">
                    <button className="exp-history-notif-btn" aria-label="Notifications">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="exp-history-notif-badge">{history.length > 0 ? 3 : 0}</span>
                    </button>

                    <UserProfileMenu variant="topbar" />
                </div>
            </div>

            {/* ================= HERO BANNER ================= */}
            <div className="exp-history-hero-card">
                <img
                    src="/images/detection_history_hero.jpg"
                    alt="Crop Health Leaf Scanner"
                    className="exp-history-hero-bg"
                />

                <div className="exp-history-hero-left">
                    <div className="exp-history-leaf-badge">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                            <path d="M4 21c3-4 6.5-6.5 11-9" />
                        </svg>
                    </div>
                    <div className="exp-history-hero-titles">
                        <span className="exp-history-eyebrow">{text.eyebrow}</span>
                        <h1 className="exp-history-main-title">{text.title}</h1>
                        <p className="exp-history-subtitle">{text.subtitle}</p>
                    </div>
                </div>

                <div className="exp-history-slogan">
                    {text.sloganTop}<br />{text.sloganSub}
                </div>
            </div>

            {/* ================= 5 SUMMARY STATISTICS CARDS ================= */}
            <div className="exp-history-stats-grid">
                {/* 1. Total Detections */}
                <div className="exp-history-stat-card">
                    <div className="exp-stat-icon-wrap exp-icon-mint">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                            <path d="M4 21c3-4 6.5-6.5 11-9" />
                        </svg>
                    </div>
                    <div className="exp-stat-info">
                        <span className="exp-stat-lbl">{text.statTotal}</span>
                        <span className="exp-stat-num">{stats.total}</span>
                        <span className="exp-stat-accent">{stats.total > 0 ? `+${stats.total}` : "0"} {text.statTotalSub}</span>
                    </div>
                </div>

                {/* 2. Healthy */}
                <div className="exp-history-stat-card">
                    <div className="exp-stat-icon-wrap exp-icon-green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22v-9" />
                            <path d="M9 13c-3-2-4-5-4-9 4 0 7 1 9 4" />
                            <path d="M15 13c3-2 4-5 4-9-4 0-7 1-9 4" />
                        </svg>
                    </div>
                    <div className="exp-stat-info">
                        <span className="exp-stat-lbl">{text.statHealthy}</span>
                        <span className="exp-stat-num">{stats.healthy}</span>
                        <span className="exp-stat-muted">
                            {stats.total > 0 ? `${((stats.healthy / stats.total) * 100).toFixed(1)}%` : "0%"} {text.statHealthySub}
                        </span>
                    </div>
                </div>

                {/* 3. Disease Detected */}
                <div className="exp-history-stat-card">
                    <div className="exp-stat-icon-wrap exp-icon-red">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="22" y1="12" x2="18" y2="12" />
                            <line x1="6" y1="12" x2="2" y2="12" />
                            <line x1="12" y1="6" x2="12" y2="2" />
                            <line x1="12" y1="22" x2="12" y2="18" />
                        </svg>
                    </div>
                    <div className="exp-stat-info">
                        <span className="exp-stat-lbl">{text.statDisease}</span>
                        <span className="exp-stat-num">{stats.disease}</span>
                        <span className="exp-stat-muted">
                            {stats.total > 0 ? `${((stats.disease / stats.total) * 100).toFixed(1)}%` : "0%"} {text.statDiseaseSub}
                        </span>
                    </div>
                </div>

                {/* 4. Avg. Confidence */}
                <div className="exp-history-stat-card">
                    <div className="exp-stat-icon-wrap exp-icon-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                        </svg>
                    </div>
                    <div className="exp-stat-info">
                        <span className="exp-stat-lbl">{text.statConfidence}</span>
                        <span className="exp-stat-num">{stats.avgConf}%</span>
                        <span className="exp-stat-muted">{text.statConfidenceSub}</span>
                    </div>
                </div>

                {/* 5. Crops Analyzed */}
                <div className="exp-history-stat-card">
                    <div className="exp-stat-icon-wrap exp-icon-sprout">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 20h10" />
                            <path d="M10 20c0-3.3 2.7-6 6-6" />
                            <path d="M14 14c0-3.3-2.7-6-6-6" />
                            <path d="M8 8c0-3.3 2.7-6 6-6" />
                        </svg>
                    </div>
                    <div className="exp-stat-info">
                        <span className="exp-stat-lbl">{text.statCrops}</span>
                        <span className="exp-stat-num">{stats.cropsCount}</span>
                        <span className="exp-stat-muted">{text.statCropsSub}</span>
                    </div>
                </div>
            </div>

            {/* ================= 3 ANALYTICS VISUAL CARDS ROW ================= */}
            <div className="exp-history-visual-row">
                {/* 1. Detection Trends (Real 30-Day Timeline) */}
                <div className="exp-vis-card">
                    <div className="exp-vis-header">
                        <div className="exp-vis-header-left">
                            <div className="exp-vis-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <div className="exp-vis-titles">
                                <h4>{text.trendTitle}</h4>
                                <p>{text.trendSub}</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", fontSize: "11.5px", fontWeight: 700 }}>
                            <span style={{ color: "#16a34a" }}>● Healthy</span>
                            <span style={{ color: "#ef4444" }}>● Disease</span>
                        </div>
                    </div>

                    <div className="exp-trend-container">
                        <svg width="100%" height="100%" viewBox="0 0 380 120" preserveAspectRatio="none">
                            <line x1="10" y1="20" x2="370" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                            <line x1="10" y1="55" x2="370" y2="55" stroke="#f1f5f9" strokeDasharray="3 3" />
                            <line x1="10" y1="90" x2="370" y2="90" stroke="#f1f5f9" strokeDasharray="3 3" />

                            {trendsData.hasData ? (
                                <>
                                    {/* Healthy Line (Green) */}
                                    <path
                                        d={trendsData.healthyPath}
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    {/* Disease Line (Red) */}
                                    <path
                                        d={trendsData.diseasePath}
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                </>
                            ) : (
                                <>
                                    <line x1="10" y1="95" x2="370" y2="95" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                                    <text x="190" y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
                                        No trend records in last 30 days
                                    </text>
                                </>
                            )}
                        </svg>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>
                            {trendsData.tickLabels.map((lbl, idx) => (
                                <span key={idx}>{lbl}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Crop-wise Distribution (Dynamic Donut & Legend) */}
                <div className="exp-vis-card">
                    <div className="exp-vis-header">
                        <div className="exp-vis-header-left">
                            <div className="exp-vis-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="exp-vis-titles">
                                <h4>{text.cropDistTitle}</h4>
                                <p>{text.cropDistSub}</p>
                            </div>
                        </div>
                    </div>

                    <div className="exp-donut-body">
                        <div className="exp-donut-wrap">
                            <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                                {stats.donutSegments.length > 0 ? (
                                    stats.donutSegments.map((seg) => (
                                        <circle
                                            key={seg.crop}
                                            cx="50"
                                            cy="50"
                                            r="38"
                                            stroke={seg.color}
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={seg.strokeDasharray}
                                            strokeDashoffset={seg.strokeDashoffset}
                                        />
                                    ))
                                ) : (
                                    <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="12" fill="transparent" />
                                )}
                            </svg>
                            <div className="exp-donut-center">
                                <span className="exp-donut-num">{stats.total}</span>
                                <span className="exp-donut-lbl">Detections</span>
                            </div>
                        </div>

                        <div className="exp-crop-legend-list">
                            {stats.cropDist.length > 0 ? (
                                stats.donutSegments.map((cd) => (
                                    <div key={cd.crop} className="exp-crop-legend-row">
                                        <span>
                                            <span className="exp-crop-dot" style={{ background: cd.color }} />
                                            {cd.crop}
                                        </span>
                                        <strong>
                                            {cd.count} <span style={{ color: "#94a3b8", fontWeight: 500 }}>({cd.pct}%)</span>
                                        </strong>
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", padding: "10px 0" }}>
                                    No crop history recorded
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Common Diseases (Dynamic Top 5 by Count) */}
                <div className="exp-vis-card">
                    <div className="exp-vis-header">
                        <div className="exp-vis-header-left">
                            <div className="exp-vis-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="exp-vis-titles">
                                <h4>{text.commonDiseasesTitle}</h4>
                                <p>{text.commonDiseasesSub}</p>
                            </div>
                        </div>
                        <span
                            style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700, cursor: "pointer" }}
                            onClick={() => {
                                setStatusFilter("disease");
                                setCurrentPage(1);
                            }}
                        >
                            {text.viewAllBtn}
                        </span>
                    </div>

                    <div className="exp-common-disease-list">
                        {stats.commonDiseases.length > 0 ? (
                            stats.commonDiseases.map((cd, idx) => {
                                const fills = ["#ef4444", "#f59e0b", "#f97316", "#22c55e", "#10b981"];
                                return (
                                    <div key={idx} className="exp-cdisease-item">
                                        <span className="exp-cdisease-name" title={cd.disease}>{cd.disease}</span>
                                        <div className="exp-cdisease-track">
                                            <div className="exp-cdisease-fill" style={{ width: `${Math.max(10, cd.pct)}%`, background: fills[idx % fills.length] }} />
                                        </div>
                                        <strong>{cd.count}</strong>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>
                                No disease records found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= FILTER TOOLBAR ================= */}
            <div className="exp-history-toolbar">
                <div className="exp-toolbar-left">
                    <select
                        className="exp-select-pill"
                        value={cropFilter}
                        onChange={(e) => {
                            setCropFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">🌱 {text.allCrops}</option>
                        {availableCrops.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        className="exp-select-pill"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">☑️ {text.allResults}</option>
                        <option value="healthy">Healthy Only</option>
                        <option value="disease">Disease Only</option>
                        <option value="favorites">Favorites Only</option>
                    </select>

                    <select className="exp-select-pill">
                        <option value="30">📅 {text.last30Days}</option>
                        <option value="7">Last 7 Days</option>
                        <option value="all">All Time</option>
                    </select>

                    <input
                        type="text"
                        className="exp-toolbar-search"
                        placeholder={text.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="exp-toolbar-right">
                    <button className="exp-btn-refresh" onClick={() => fetchHistory(true)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        <span>{refreshing ? "Refreshing..." : text.refresh}</span>
                    </button>

                    <button className="exp-btn-clear" onClick={handleClearHistory}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>{text.clearHistory}</span>
                    </button>
                </div>
            </div>

            {/* ================= TABS & VIEW MODE ================= */}
            <div className="exp-tabs-view-row">
                <div className="exp-tabs-list">
                    <button
                        className={`exp-tab-btn ${statusFilter === "all" ? "active" : ""}`}
                        onClick={() => {
                            setStatusFilter("all");
                            setCurrentPage(1);
                        }}
                    >
                        <span>{text.allDetectionsTab} ({stats.total})</span>
                    </button>

                    <button
                        className={`exp-tab-btn ${statusFilter === "healthy" ? "active" : ""}`}
                        onClick={() => {
                            setStatusFilter("healthy");
                            setCurrentPage(1);
                        }}
                    >
                        <span>🌱 {text.healthyTab} ({stats.healthy})</span>
                    </button>

                    <button
                        className={`exp-tab-btn ${statusFilter === "disease" ? "active" : ""}`}
                        onClick={() => {
                            setStatusFilter("disease");
                            setCurrentPage(1);
                        }}
                    >
                        <span>⚠️ {text.diseasedTab} ({stats.disease})</span>
                    </button>

                    <button
                        className={`exp-tab-btn ${statusFilter === "favorites" ? "active" : ""}`}
                        onClick={() => {
                            setStatusFilter("favorites");
                            setCurrentPage(1);
                        }}
                    >
                        <span>⭐ {text.favoritesTab} ({favoriteIds.length})</span>
                    </button>
                </div>

                <div className="exp-view-toggle">
                    <button
                        className={`exp-view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span>{text.gridView}</span>
                    </button>
                    <button
                        className={`exp-view-mode-btn ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        <span>{text.listView}</span>
                    </button>
                </div>
            </div>

            {/* ================= MAIN FULL-WIDTH DETECTION HISTORY ================= */}
            <div className="exp-history-full-container">
                {loading ? (
                    <div className="exp-empty-container">
                        <div className="exp-empty-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h4 className="exp-empty-title">{text.loadingTitle}</h4>
                        <p className="exp-empty-sub">{text.loadingSub}</p>
                    </div>
                ) : paginatedItems.length === 0 ? (
                    <div className="exp-empty-container">
                        <div className="exp-empty-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                                <path d="M4 21c3-4 6.5-6.5 11-9" />
                            </svg>
                        </div>
                        <h4 className="exp-empty-title">{text.emptyTitle}</h4>
                        <p className="exp-empty-sub">{text.emptySub}</p>
                        <button className="exp-empty-btn" onClick={() => navigate("/disease-detection")}>
                            {text.startDetectionBtn}
                        </button>
                    </div>
                ) : viewMode === "grid" ? (
                    /* 4-COLUMN FULL-WIDTH GRID */
                    <div className="exp-history-grid">
                        {paginatedItems.map((item) => {
                            const isH = isHealthy(item.prediction);
                            const isFav = favoriteIds.includes(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="exp-history-card"
                                    onClick={(e) => handleOpenModal(item, e)}
                                >
                                    <div className="exp-card-photo-box">
                                        <img src={item.image} alt={item.crop} onError={(e) => { e.target.src = "/images/sample_leaf.jpg"; }} />
                                        <button
                                            className="exp-fav-btn"
                                            title="Favorite"
                                            onClick={(e) => toggleFavorite(item.id, e)}
                                        >
                                            {isFav ? "⭐" : "☆"}
                                        </button>
                                        <div className={`exp-card-status-pill ${isH ? "exp-badge-healthy" : "exp-badge-disease"}`}>
                                            {isH ? "✓ Healthy" : "⚠ Disease"}
                                        </div>
                                    </div>

                                    <div className="exp-card-body">
                                        <div>
                                            <div className="exp-card-crop-name">{item.crop}</div>
                                            <div className={isH ? "exp-card-disease-good" : "exp-card-disease-bad"}>
                                                {item.prediction}
                                            </div>

                                            <div className="exp-card-meta">
                                                <span>{isH ? "✓" : "⚠"} {item.confidence}% {text.confidenceLabel}</span>
                                                <span>🕒 {item.date}</span>
                                                <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>ID: {item.id}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="exp-btn-view-details"
                                            onClick={(e) => handleOpenModal(item, e)}
                                        >
                                            {text.viewDetailsBtn}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* FULL-WIDTH LIST VIEW */
                    <div className="exp-history-list-view">
                        {paginatedItems.map((item) => {
                            const isH = isHealthy(item.prediction);
                            const isFav = favoriteIds.includes(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="exp-history-list-item"
                                    onClick={(e) => handleOpenModal(item, e)}
                                >
                                    <div className="exp-list-left">
                                        <button
                                            className="exp-fav-btn"
                                            style={{ position: "static", transform: "none" }}
                                            onClick={(e) => toggleFavorite(item.id, e)}
                                        >
                                            {isFav ? "⭐" : "☆"}
                                        </button>
                                        <img src={item.image} alt={item.crop} className="exp-list-thumb" onError={(e) => { e.target.src = "/images/sample_leaf.jpg"; }} />
                                        <div className="exp-list-info">
                                            <div className="exp-list-title">{item.crop} — <span style={{ color: isH ? "#16a34a" : "#ef4444" }}>{item.prediction}</span></div>
                                            <div className="exp-list-meta">
                                                <span>📅 {item.date}</span>
                                                <span>🎯 {item.confidence}% Confidence</span>
                                                <span>🆔 {item.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="exp-list-actions">
                                        <span className={`exp-card-status-pill ${isH ? "exp-badge-healthy" : "exp-badge-disease"}`} style={{ position: "static" }}>
                                            {isH ? "✓ Healthy" : "⚠ Disease Detected"}
                                        </span>
                                        <button
                                            className="exp-btn-view-details"
                                            style={{ width: "auto", padding: "8px 16px" }}
                                            onClick={(e) => handleOpenModal(item, e)}
                                        >
                                            {text.viewDetailsBtn}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Footer */}
                {filteredHistory.length > 0 && (
                    <div className="exp-pagination-footer">
                        <div className="exp-pagination-buttons">
                            <button
                                className="exp-page-btn"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => (
                                <button
                                    key={pg}
                                    className={`exp-page-btn ${currentPage === pg ? "active" : ""}`}
                                    onClick={() => setCurrentPage(pg)}
                                >
                                    {pg}
                                </button>
                            ))}
                            {totalPages > 5 && <span style={{ margin: "0 4px" }}>...</span>}
                            {totalPages > 5 && (
                                <button
                                    className={`exp-page-btn ${currentPage === totalPages ? "active" : ""}`}
                                    onClick={() => setCurrentPage(totalPages)}
                                >
                                    {totalPages}
                                </button>
                            )}
                            <button
                                className="exp-page-btn"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                ›
                            </button>
                        </div>

                        <span>
                            {text.showingLabel} {Math.min(filteredHistory.length, (currentPage - 1) * pageSize + 1)}–
                            {Math.min(filteredHistory.length, currentPage * pageSize)} of {filteredHistory.length} results &nbsp;•&nbsp; {pageSize} {text.perPage}
                        </span>
                    </div>
                )}
            </div>

            {/* ================= PREMIUM CENTERED MODAL / POPUP ================= */}
            {modalOpen && selectedRecord && (
                <div
                    className="exp-history-modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleCloseModal();
                    }}
                >
                    <div className="exp-history-modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="exp-history-modal-header">
                            <div className="exp-modal-header-left">
                                <div className="exp-modal-header-badge">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                                        <path d="M4 21c3-4 6.5-6.5 11-9" />
                                    </svg>
                                </div>
                                <div className="exp-modal-title-wrap">
                                    <h3>{text.detailsHeading}</h3>
                                    <p>{selectedRecord.crop} • {selectedRecord.id}</p>
                                </div>
                            </div>

                            <button
                                className="exp-history-modal-close"
                                onClick={handleCloseModal}
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="exp-history-modal-body">
                            {/* Hero Summary Split */}
                            <div className="exp-modal-hero-split">
                                <div className="exp-modal-img-frame">
                                    <img src={selectedRecord.image} alt={selectedRecord.crop} onError={(e) => { e.target.src = "/images/sample_leaf.jpg"; }} />
                                    <div
                                        className={`exp-card-status-pill ${isHealthy(selectedRecord.prediction) ? "exp-badge-healthy" : "exp-badge-disease"}`}
                                        style={{ top: "10px", right: "10px" }}
                                    >
                                        {isHealthy(selectedRecord.prediction) ? "✓ Healthy" : "⚠ Disease Detected"}
                                    </div>
                                </div>

                                <div className="exp-modal-summary-col">
                                    <div>
                                        <h4 className="exp-modal-pred-title">{selectedRecord.crop}</h4>
                                        <div
                                            className="exp-modal-pred-disease"
                                            style={{ color: isHealthy(selectedRecord.prediction) ? "#16a34a" : "#ef4444" }}
                                        >
                                            {selectedRecord.prediction}
                                        </div>
                                    </div>

                                    <div className="exp-modal-grid-meta">
                                        <div className="exp-modal-meta-item">
                                            <span>📅</span>
                                            <span>{selectedRecord.date}</span>
                                        </div>
                                        <div className="exp-modal-meta-item">
                                            <span>🎯</span>
                                            <span>{selectedRecord.confidence}% {text.confidenceLabel}</span>
                                        </div>
                                        <div className="exp-modal-meta-item">
                                            <span>🌱</span>
                                            <span>{selectedRecord.crop}</span>
                                        </div>
                                        <div className="exp-modal-meta-item">
                                            <span>🆔</span>
                                            <span>{selectedRecord.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subtabs Bar */}
                            <div className="exp-modal-subtabs">
                                <button
                                    className={`exp-modal-subtab-btn ${detailTab === "aiAnalysis" ? "active" : ""}`}
                                    onClick={() => {
                                        setDetailTab("aiAnalysis");
                                        if (selectedRecord && !selectedRecord.symptoms && !selectedRecord.treatment && !selectedRecord.farmer_action) {
                                            fetchAnalysisForRecord(selectedRecord);
                                        }
                                    }}
                                >
                                    {text.aiAnalysisBtn}
                                </button>
                                <button
                                    className={`exp-modal-subtab-btn ${detailTab === "classProbabilities" ? "active" : ""}`}
                                    onClick={() => setDetailTab("classProbabilities")}
                                >
                                    {text.classProbBtn}
                                </button>
                                <button
                                    className={`exp-modal-subtab-btn ${detailTab === "originalImage" ? "active" : ""}`}
                                    onClick={() => setDetailTab("originalImage")}
                                >
                                    {text.origImageBtn}
                                </button>
                            </div>

                            {/* Subtab 1: AI Analysis */}
                            {detailTab === "aiAnalysis" && (
                                <div className="exp-modal-tab-pane">
                                    {/* Severity Banner */}
                                    <div className={`exp-modal-severity-alert ${isHealthy(selectedRecord.prediction) ? "exp-alert-healthy" : "exp-alert-disease"}`}>
                                        <span style={{ fontSize: "18px" }}>{isHealthy(selectedRecord.prediction) ? "✅" : "⚠️"}</span>
                                        <div>
                                            <strong>{text.severityLabel}: {selectedRecord.severity || (isHealthy(selectedRecord.prediction) ? "None" : "Moderate")}</strong>
                                            <div style={{ marginTop: "3px", opacity: 0.9 }}>
                                                {isHealthy(selectedRecord.prediction)
                                                    ? "Plant foliage displays healthy cell wall structure, normal chlorophyll index, and no fungal/bacterial lesions."
                                                    : "Pathogen activity detected. Foliar intervention recommended to prevent canopy spreading."}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Analysis Loading State */}
                                    {analysisLoading && (
                                        <div style={{ padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
                                            <span className="exp-analysis-spinner" />
                                            <p style={{ marginTop: "10px", color: "#64748b", fontSize: "13px", fontWeight: 600 }}>
                                                Loading AI analysis & management advisory...
                                            </p>
                                        </div>
                                    )}

                                    {/* Disease Overview */}
                                    {(selectedRecord.disease_overview || selectedRecord.ai_explanation || selectedRecord.explanation) && (
                                        <div className="exp-modal-card-section">
                                            <h5>📋 Disease Overview</h5>
                                            {renderFormattedText(selectedRecord.disease_overview || selectedRecord.ai_explanation || selectedRecord.explanation)}
                                        </div>
                                    )}

                                    {/* Symptoms */}
                                    {selectedRecord.symptoms && (
                                        <div className="exp-modal-card-section">
                                            <h5>🔍 {text.symptomsTitle}</h5>
                                            {renderFormattedText(selectedRecord.symptoms)}
                                        </div>
                                    )}

                                    {/* Recommended Actions */}
                                    {selectedRecord.immediate_action && (
                                        <div className="exp-modal-card-section">
                                            <h5>⚡ {text.recommendedActionsTitle}</h5>
                                            {renderFormattedText(selectedRecord.immediate_action)}
                                        </div>
                                    )}

                                    {/* Treatment Guidance */}
                                    {selectedRecord.treatment && (
                                        <div className="exp-modal-card-section">
                                            <h5>💊 {text.treatmentGuidanceTitle}</h5>
                                            {renderFormattedText(selectedRecord.treatment)}
                                        </div>
                                    )}

                                    {/* Spray Guidance */}
                                    {selectedRecord.spray_guidance && (
                                        <div className="exp-modal-card-section">
                                            <h5>🧪 {text.sprayGuidanceTitle}</h5>
                                            {renderFormattedText(selectedRecord.spray_guidance)}
                                        </div>
                                    )}

                                    {/* Prevention */}
                                    {selectedRecord.prevention && (
                                        <div className="exp-modal-card-section">
                                            <h5>🛡️ {text.preventionTitle}</h5>
                                            {renderFormattedText(selectedRecord.prevention)}
                                        </div>
                                    )}

                                    {/* Farmer Action */}
                                    {selectedRecord.farmer_action && (
                                        <div className="exp-modal-card-section">
                                            <h5>🧑‍🌾 {text.farmerActionTitle}</h5>
                                            {renderFormattedText(selectedRecord.farmer_action)}
                                        </div>
                                    )}

                                    {/* Source Reference */}
                                    {selectedRecord.source && (
                                        <div style={{ fontSize: "11.5px", color: "#64748b", padding: "4px 8px" }}>
                                            <span>Source: {typeof selectedRecord.source === "object" ? (selectedRecord.source.name || JSON.stringify(selectedRecord.source)) : selectedRecord.source}</span>
                                        </div>
                                    )}

                                    {/* Fallback when analysis is unavailable */}
                                    {!analysisLoading && !selectedRecord.symptoms && !selectedRecord.treatment && !selectedRecord.prevention && !selectedRecord.farmer_action && (
                                        <div className="exp-modal-card-section" style={{ textAlign: "center", padding: "28px 20px", color: "#64748b" }}>
                                            <p style={{ margin: 0, fontWeight: 500, fontSize: "13.5px" }}>
                                                Detailed AI analysis is not available for this detection record.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Subtab 2: Class Probabilities */}
                            {detailTab === "classProbabilities" && (
                                <div className="exp-modal-tab-pane">
                                    <div className="exp-modal-card-section">
                                        <h5>📊 {text.classProbBtn}</h5>
                                        {selectedRecord.probabilities && Object.keys(selectedRecord.probabilities).length > 0 ? (
                                            Object.entries(selectedRecord.probabilities).map(([className, score]) => {
                                                const pct = typeof score === "number" ? (score <= 1 ? (score * 100).toFixed(1) : score.toFixed(1)) : parseFloat(score) || 0;
                                                return (
                                                    <div key={className} className="exp-prob-row">
                                                        <span className="exp-prob-label">{className}</span>
                                                        <div className="exp-prob-track">
                                                            <div className="exp-prob-fill" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <strong style={{ width: "50px", textAlign: "right" }}>{pct}%</strong>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div>
                                                <div className="exp-prob-row">
                                                    <span className="exp-prob-label">{selectedRecord.prediction}</span>
                                                    <div className="exp-prob-track">
                                                        <div className="exp-prob-fill" style={{ width: `${selectedRecord.confidence}%` }} />
                                                    </div>
                                                    <strong style={{ width: "50px", textAlign: "right" }}>{selectedRecord.confidence}%</strong>
                                                </div>
                                                <div className="exp-prob-row">
                                                    <span className="exp-prob-label">Healthy Baseline</span>
                                                    <div className="exp-prob-track">
                                                        <div className="exp-prob-fill" style={{ width: `${Math.max(0, 100 - selectedRecord.confidence)}%`, background: "#94a3b8" }} />
                                                    </div>
                                                    <strong style={{ width: "50px", textAlign: "right" }}>{(100 - selectedRecord.confidence).toFixed(1)}%</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Subtab 3: Original Image */}
                            {detailTab === "originalImage" && (
                                <div className="exp-modal-tab-pane">
                                    <div className="exp-modal-card-section" style={{ textAlign: "center" }}>
                                        <h5>📷 {text.origImageBtn}</h5>
                                        <img
                                            src={selectedRecord.image}
                                            alt={selectedRecord.crop}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "380px",
                                                borderRadius: "12px",
                                                objectFit: "contain",
                                                background: "#0f172a"
                                            }}
                                            onError={(e) => { e.target.src = "/images/sample_leaf.jpg"; }}
                                        />
                                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "10px" }}>
                                            Record ID: {selectedRecord.id} &nbsp;•&nbsp; Timestamp: {selectedRecord.date}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="exp-history-modal-footer">
                            <button
                                className="exp-btn-report"
                                onClick={() => {
                                    handleCloseModal();
                                    navigate("/analytics");
                                }}
                            >
                                {text.viewFullReportBtn}
                            </button>
                            <button
                                className="exp-btn-ask-ai"
                                onClick={() => {
                                    handleCloseModal();
                                    navigate("/insights");
                                }}
                            >
                                <span>✨</span>
                                <span>{text.askAiBtn}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
