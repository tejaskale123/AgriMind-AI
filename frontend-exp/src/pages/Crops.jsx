import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Crops() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [filterOnlySupported, setFilterOnlySupported] = useState(false);

    // Multilingual dictionary preserving all existing languages (en, mr, hi)
    const ui = {
        en: {
            eyebrow: "AGRIMIND AI · CROP INTELLIGENCE",
            title: "Supported Crops",
            heroDescription:
                "Explore the crops supported by AgriMind AI and choose an AI-ready crop to begin intelligent plant disease analysis.",
            featureAi: "AI-Powered",
            featureAiSub: "Disease Detection",
            featureAccurate: "Accurate Results",
            featureAccurateSub: "Trained AI Model",
            featureHealthier: "Healthier Crops",
            featureHealthierSub: "Better Yield",
            featureSustainable: "Sustainable Farming",
            featureSustainableSub: "For a Greener Tomorrow",
            totalCrops: "Total Crops",
            totalCropsSub: "Crops in our database",
            aiSupported: "AI Supported",
            aiSupportedSub: "Ready for detection",
            comingSoon: "Coming Soon",
            comingSoonSub: "In development",
            selectACrop: "SELECT A CROP",
            aiDetectionAvailable: "AI Disease Detection Available",
            selectCrop: "Select a supported crop to start disease analysis.",
            filterAll: "All Crops",
            filterSupportedOnly: "AI Supported Only",
            available: "Available",
            detectableConditions: "Detectable Conditions",
            analyze: "Analyze",
            comingSoonBadge: "Coming Soon",
            trainingNotice: "Coming soon for disease detection. We are training our AI model.",
            howWorks: "How AgriMind AI Works",
            howWorksText:
                "Select Soybean, Cotton, Maize, or Wheat, continue to Disease Detection, upload a clear crop-leaf image, and let the trained EfficientNet-B0 model analyze the image. AgriMind AI then provides the predicted condition, confidence score, and available disease guidance.",
            photoCredit: "Crop photos are sourced from Wikimedia Commons and AgriMind Datasets.",
            categories: {
                "Pulse Crop": "Pulse Crop",
                "Fiber Crop": "Fiber Crop",
                "Cereal Crop": "Cereal Crop",
                "Vegetable Crop": "Vegetable Crop",
            },
            diseases: {
                "Bacterial Blight": "Bacterial Blight",
                "Cercospora Leaf Blight": "Cercospora Leaf Blight",
                "Healthy": "Healthy",
                "Rust": "Rust",
                "Sudden Death Syndrome": "Sudden Death Syndrome",
                "Alternaria Leaf Spot": "Alternaria Leaf Spot",
                "Fusarium Wilt": "Fusarium Wilt",
                "Healthy Leaf": "Healthy Leaf",
                "Verticillium Wilt": "Verticillium Wilt",
                "Blight": "Blight",
                "Common Rust": "Common Rust",
                "Gray Leaf Spot": "Gray Leaf Spot",
                "Brown Rust": "Brown Rust",
                "Yellow Rust": "Yellow Rust",
                "Leaf Spot": "Leaf Spot",
                "Powdery Mildew": "Powdery Mildew",
            },
            descriptions: {
                Soybean: "AI-powered disease detection for soybean leaves.",
                Cotton: "AI-powered disease detection for cotton leaves.",
                Maize: "AI-powered disease detection for maize leaves.",
                Wheat: "AI-powered disease detection for wheat leaves.",
                Tomato: "Coming soon for disease detection. We are training our AI model.",
                "Bell Pepper": "Coming soon for disease detection. We are training our AI model.",
            },
        },
        mr: {
            eyebrow: "AGRIMIND AI · पीक बुद्धिमत्ता",
            title: "समर्थित पिके",
            heroDescription:
                "AgriMind AI द्वारे समर्थित पिके पहा आणि बुद्धिमान रोग विश्लेषण सुरू करण्यासाठी AI-सक्षम पीक निवडा.",
            featureAi: "AI-सक्षम",
            featureAiSub: "रोग शोध",
            featureAccurate: "अचूक परिणाम",
            featureAccurateSub: "प्रशिक्षित AI मॉडेल",
            featureHealthier: "निरोगी पिके",
            featureHealthierSub: "अधिक उत्पादन",
            featureSustainable: "शाश्वत शेती",
            featureSustainableSub: "हरित उद्यासाठी",
            totalCrops: "एकूण पिके",
            totalCropsSub: "डेटाबेसमधील पिके",
            aiSupported: "AI समर्थित",
            aiSupportedSub: "तपासणीसाठी सज्ज",
            comingSoon: "लवकरच उपलब्ध",
            comingSoonSub: "विकासाधीन",
            selectACrop: "पीक निवडा",
            aiDetectionAvailable: "AI रोग शोध उपलब्ध",
            selectCrop: "रोग विश्लेषण सुरू करण्यासाठी समर्थित पीक निवडा.",
            filterAll: "सर्व पिके",
            filterSupportedOnly: "फक्त AI समर्थित",
            available: "उपलब्ध",
            detectableConditions: "शोधता येणाऱ्या स्थिती",
            analyze: "विश्लेषण करा",
            comingSoonBadge: "लवकरच उपलब्ध",
            trainingNotice: "रोग शोधासाठी लवकरच उपलब्ध. आम्ही आमच्या AI मॉडेलला प्रशिक्षित करत आहोत.",
            howWorks: "AgriMind AI कसे काम करते",
            howWorksText:
                "सोयाबीन, कापूस, मका किंवा गहू निवडा, रोग शोध पेजवर जा, पिकाच्या पानाचा स्पष्ट फोटो अपलोड करा आणि प्रशिक्षित EfficientNet-B0 मॉडेलला प्रतिमेचे विश्लेषण करू द्या. त्यानंतर AgriMind AI अंदाजित स्थिती, विश्वास पातळी आणि उपलब्ध रोग मार्गदर्शन देते.",
            photoCredit: "पिकांचे फोटो Wikimedia Commons व AgriMind डेटासेटमधून घेतले आहेत.",
            categories: {
                "Pulse Crop": "कडधान्य पीक",
                "Fiber Crop": "तंतू पीक",
                "Cereal Crop": "तृणधान्य पीक",
                "Vegetable Crop": "भाजीपाला पीक",
            },
            diseases: {
                "Bacterial Blight": "जिवाणूजन्य करपा",
                "Cercospora Leaf Blight": "सर्कोस्पोरा पान करपा",
                "Healthy": "निरोगी",
                "Rust": "तांबेरा",
                "Sudden Death Syndrome": "अचानक कोमेजणे सिंड्रोम",
                "Alternaria Leaf Spot": "अल्टरनेरिया पानावरील ठिपके",
                "Fusarium Wilt": "फ्युजेरियम मर",
                "Healthy Leaf": "निरोगी पान",
                "Verticillium Wilt": "व्हर्टिसिलियम मर",
                "Blight": "करपा",
                "Common Rust": "सामान्य तांबेरा",
                "Gray Leaf Spot": "करड्या पानावरील ठिपके",
                "Brown Rust": "तपकिरी तांबेरा",
                "Yellow Rust": "पिवळा तांबेरा",
                "Leaf Spot": "पानावरील ठिपके",
                "Powdery Mildew": "भुरी रोग",
            },
            descriptions: {
                Soybean: "सोयाबीनच्या पानांसाठी AI-आधारित रोग शोध.",
                Cotton: "कापसाच्या पानांसाठी AI-आधारित रोग शोध.",
                Maize: "मक्याच्या पानांसाठी AI-आधारित रोग शोध.",
                Wheat: "गव्हाच्या पानांसाठी AI-आधारित रोग शोध.",
                Tomato: "रोग शोधासाठी लवकरच उपलब्ध. आम्ही आमच्या AI मॉडेलला प्रशिक्षित करत आहोत.",
                "Bell Pepper": "रोग शोधासाठी लवकरच उपलब्ध. आम्ही आमच्या AI मॉडेलला प्रशिक्षित करत आहोत.",
            },
        },
        hi: {
            eyebrow: "AGRIMIND AI · फसल बुद्धिमत्ता",
            title: "समर्थित फसलें",
            heroDescription:
                "AgriMind AI द्वारा समर्थित फसलों को देखें और बुद्धिमान रोग विश्लेषण शुरू करने के लिए AI-सक्षम फसल चुनें।",
            featureAi: "AI-संचालित",
            featureAiSub: "रोग पहचान",
            featureAccurate: "सटीक परिणाम",
            featureAccurateSub: "प्रशिक्षित AI मॉडल",
            featureHealthier: "स्वस्थ फसलें",
            featureHealthierSub: "बेहतर उपज",
            featureSustainable: "सतत खेती",
            featureSustainableSub: "हरित कल के लिए",
            totalCrops: "कुल फसलें",
            totalCropsSub: "डेटाबेस में फसलें",
            aiSupported: "AI समर्थित",
            aiSupportedSub: "पहचान के लिए तैयार",
            comingSoon: "जल्द उपलब्ध",
            comingSoonSub: "विकास में",
            selectACrop: "फसल चुनें",
            aiDetectionAvailable: "AI रोग पहचान उपलब्ध",
            selectCrop: "रोग विश्लेषण शुरू करने के लिए समर्थित फसल चुनें।",
            filterAll: "सभी फसलें",
            filterSupportedOnly: "केवल AI समर्थित",
            available: "उपलब्ध",
            detectableConditions: "पहचानी जा सकने वाली स्थितियाँ",
            analyze: "विश्लेषण करें",
            comingSoonBadge: "जल्द उपलब्ध",
            trainingNotice: "रोग पहचान के लिए जल्द आ रहा है। हम अपने AI मॉडल को प्रशिक्षित कर रहे हैं।",
            howWorks: "AgriMind AI कैसे काम करता है",
            howWorksText:
                "सोयाबीन, कपास, मक्का या गेहूँ चुनें, रोग पहचान पेज पर जाएँ, पत्ते की स्पष्ट तस्वीर अपलोड करें और प्रशिक्षित EfficientNet-B0 मॉडल को तस्वीर का विश्लेषण करने दें। इसके बाद AgriMind AI अनुमानित स्थिति, विश्वास स्तर और उपलब्ध रोग मार्गदर्शन प्रदान करता है।",
            photoCredit: "फसल की तस्वीरें Wikimedia Commons और AgriMind डेटासेट से ली गई हैं।",
            categories: {
                "Pulse Crop": "दलहन फसल",
                "Fiber Crop": "रेशेदार फसल",
                "Cereal Crop": "अनाज फसल",
                "Vegetable Crop": "सब्जी फसल",
            },
            diseases: {
                "Bacterial Blight": "जीवाणु झुलसा",
                "Cercospora Leaf Blight": "सर्कोस्पोरा पत्ती झुलसा",
                "Healthy": "स्वस्थ",
                "Rust": "रस्ट",
                "Sudden Death Syndrome": "अचानक मृत्यु सिंड्रोम",
                "Alternaria Leaf Spot": "अल्टरनेरिया पत्ती धब्बा",
                "Fusarium Wilt": "फ्यूजेरियम मुरझान",
                "Healthy Leaf": "स्वस्थ पत्ती",
                "Verticillium Wilt": "वर्टिसिलियम मुरझान",
                "Blight": "झुलसा",
                "Common Rust": "सामान्य रस्ट",
                "Gray Leaf Spot": "ग्रे पत्ती धब्बा",
                "Brown Rust": "भूरा रस्ट",
                "Yellow Rust": "पीला रस्ट",
                "Leaf Spot": "पत्ती धब्बा",
                "Powdery Mildew": "चूर्णिल आसिता",
            },
            descriptions: {
                Soybean: "सोयाबीन के पत्तों के लिए AI-आधारित रोग पहचान।",
                Cotton: "कपास के पत्तों के लिए AI-आधारित रोग पहचान।",
                Maize: "मक्का के पत्तों के लिए AI-आधारित रोग पहचान।",
                Wheat: "गेहूँ के पत्तों के लिए AI-आधारित रोग पहचान।",
                Tomato: "रोग पहचान के लिए जल्द उपलब्ध। हम अपने AI मॉडल को प्रशिक्षित कर रहे हैं।",
                "Bell Pepper": "रोग पहचान के लिए जल्द उपलब्ध। हम अपने AI मॉडल को प्रशिक्षित कर रहे हैं।",
            },
        },
    };

    const text = ui[language] || ui.en;

    const getCategoryLabel = (value) =>
        text.categories[value] || ui.en.categories[value] || value;

    const getDiseaseLabel = (value) =>
        text.diseases[value] || ui.en.diseases[value] || value;

    const getCropDescription = (name, fallback) =>
        text.descriptions[name] || ui.en.descriptions[name] || fallback;

    // 6 Canonical Crops with high-res local images and Wikimedia fallback
    const crops = [
        {
            name: "Soybean",
            image: "/images/crop_soybean.jpg",
            fallbackImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Soybean_leaves.jpg",
            description: "AI-powered disease detection for soybean leaves.",
            diseases: [
                "Bacterial Blight",
                "Cercospora Leaf Blight",
                "Rust",
                "Sudden Death Syndrome",
                "Healthy",
            ],
            category: "Pulse Crop",
            supported: true,
            cropKey: "soybean",
            icon: "🌱",
        },
        {
            name: "Cotton",
            image: "/images/crop_cotton.jpg",
            fallbackImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Cotton_plant.jpg",
            description: "AI-powered disease detection for cotton leaves.",
            diseases: [
                "Alternaria Leaf Spot",
                "Bacterial Blight",
                "Fusarium Wilt",
                "Healthy Leaf",
                "Verticillium Wilt",
            ],
            category: "Fiber Crop",
            supported: true,
            cropKey: "cotton",
            icon: "☁️",
        },
        {
            name: "Maize",
            image: "/images/crop_maize.jpg",
            fallbackImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Maize_plant.jpg",
            description: "AI-powered disease detection for maize leaves.",
            diseases: [
                "Blight",
                "Common Rust",
                "Gray Leaf Spot",
                "Healthy",
            ],
            category: "Cereal Crop",
            supported: true,
            cropKey: "maize",
            icon: "🌽",
        },
        {
            name: "Wheat",
            image: "/images/crop_wheat.jpg",
            fallbackImage: "https://commons.wikimedia.org/wiki/Special:FilePath/The_wheat_field.jpg",
            description: "AI-powered disease detection for wheat leaves.",
            diseases: [
                "Brown Rust",
                "Yellow Rust",
                "Leaf Spot",
                "Powdery Mildew",
                "Healthy",
            ],
            category: "Cereal Crop",
            supported: true,
            cropKey: "wheat",
            icon: "🌾",
        },
        {
            name: "Tomato",
            image: "/images/crop_tomato.jpg",
            fallbackImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Tomato_plant_image.jpg",
            description: "Coming soon for disease detection. We are training our AI model.",
            diseases: [],
            category: "Vegetable Crop",
            supported: false,
            cropKey: "tomato",
            icon: "🍅",
        },
        {
            name: "Bell Pepper",
            image: "/images/crop_bell_pepper.jpg",
            fallbackImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Green_Bell_pepper_plant.jpg",
            description: "Coming soon for disease detection. We are training our AI model.",
            diseases: [],
            category: "Vegetable Crop",
            supported: false,
            cropKey: "bell_pepper",
            icon: "🫑",
        },
    ];

    const handleAnalyze = (crop) => {
        if (!crop.supported) return;
        const cropName = crop.cropKey || crop.name.trim().toLowerCase();
        sessionStorage.removeItem("selectedCrop");
        sessionStorage.setItem("selectedCrop", cropName);
        navigate("/detection", {
            state: { crop: cropName },
        });
    };

    const supportedCount = crops.filter((c) => c.supported).length;
    const comingSoonCount = crops.filter((c) => !c.supported).length;

    const displayedCrops = filterOnlySupported
        ? crops.filter((c) => c.supported)
        : crops;

    return (
        <div className="premium-crops-page">
            <style>{`
                /* =========================================================
                   PREMIUM CROPS PAGE STYLES - PIXEL PERFECT DESIGN
                ========================================================= */
                .premium-crops-page {
                    width: 100%;
                    min-height: 100%;
                    padding: 32px 36px 80px 36px;
                    background-color: #f4f7f5;
                    color: #111827;
                    box-sizing: border-box;
                }

                .premium-crops-page * {
                    box-sizing: border-box;
                }

                /* ================= SECTION 1: HERO ================= */
                .crops-hero-card {
                    position: relative;
                    border-radius: 26px;
                    overflow: hidden;
                    background-color: #ffffff;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    margin-bottom: 26px;
                    min-height: 255px;
                    display: flex;
                }

                .crops-hero-banner-bg {
                    position: absolute;
                    inset: 0;
                    background-image: url('/images/crops_hero.jpg');
                    background-size: cover;
                    background-position: right center;
                }

                .crops-hero-gradient-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        90deg,
                        #ffffff 0%,
                        #ffffff 48%,
                        rgba(255, 255, 255, 0.94) 58%,
                        rgba(255, 255, 255, 0.5) 75%,
                        rgba(255, 255, 255, 0.1) 100%
                    );
                }

                .crops-hero-inner {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 34px 44px;
                }

                .crops-hero-left {
                    max-width: 620px;
                }

                .crops-eyebrow-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11.5px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    color: #15803d;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }

                .eyebrow-icon-leaf {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                    background: #dcfce7;
                    border-radius: 6px;
                    color: #16a34a;
                }

                .crops-hero-title {
                    font-size: 38px;
                    font-weight: 900;
                    letter-spacing: -1px;
                    color: #052e16;
                    line-height: 1.15;
                    margin: 0 0 12px 0;
                }

                .crops-hero-sub {
                    font-size: 14px;
                    color: #4b5563;
                    line-height: 1.6;
                    margin: 0 0 24px 0;
                }

                .crops-hero-features {
                    display: flex;
                    align-items: center;
                    gap: 28px;
                    flex-wrap: wrap;
                }

                .feature-pill-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .feature-icon-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #dcfce7;
                    color: #15803d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .feature-text-group {
                    display: flex;
                    flex-direction: column;
                }

                .feature-text-main {
                    font-size: 12.5px;
                    font-weight: 800;
                    color: #111827;
                    line-height: 1.2;
                }

                .feature-text-sub {
                    font-size: 10.5px;
                    color: #6b7280;
                }

                .crops-hero-right {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 20px;
                }

                .hero-farmers-badge {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(34, 197, 94, 0.25);
                    border-radius: 18px;
                    padding: 14px 22px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
                    text-align: right;
                }

                .hero-farmers-badge h4 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #15803d;
                    line-height: 1.2;
                    margin: 0;
                    font-family: 'Segoe UI', cursive, sans-serif;
                }

                /* ================= SECTION 2: METRICS ================= */
                .crop-stats-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 22px;
                    margin-bottom: 34px;
                }

                .stat-box-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 22px 26px;
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .stat-box-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
                }

                .stat-icon-wrapper {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .stat-icon-wrapper.green {
                    background: #eaf8ef;
                    color: #16a34a;
                }

                .stat-icon-wrapper.blue {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .stat-icon-wrapper.amber {
                    background: #fef3c7;
                    color: #d97706;
                }

                .stat-info-group {
                    display: flex;
                    flex-direction: column;
                }

                .stat-top-label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #4b5563;
                    margin-bottom: 2px;
                }

                .stat-big-number {
                    font-size: 30px;
                    font-weight: 900;
                    color: #111827;
                    line-height: 1.1;
                }

                .stat-sub-caption {
                    font-size: 11.5px;
                    color: #9ca3af;
                    margin-top: 2px;
                }

                /* ================= SECTION 3: HEADER & FILTER ================= */
                .crops-section-bar {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    margin-bottom: 22px;
                }

                .section-eyebrow-tag {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    color: #15803d;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }

                .section-eyebrow-tag::before {
                    content: "";
                    width: 18px;
                    height: 3.5px;
                    background: #16a34a;
                    border-radius: 2px;
                }

                .crops-main-heading {
                    font-size: 26px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .crops-main-sub {
                    font-size: 13.5px;
                    color: #64748b;
                    margin: 0;
                }

                .filter-dropdown-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 9px 18px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #1e293b;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                    transition: all 0.2s;
                }

                .filter-dropdown-btn:hover {
                    border-color: #16a34a;
                    background: #f8fafc;
                }

                .filter-dropdown-btn.active {
                    background: #f0fdf4;
                    border-color: #86efac;
                    color: #15803d;
                }

                /* ================= SECTION 4: 6 CROP CARDS ================= */
                .crops-cards-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 36px;
                }

                .crop-item-card {
                    background: #ffffff;
                    border-radius: 22px;
                    overflow: hidden;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }

                .crop-item-card.is-available:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(22, 163, 74, 0.12);
                }

                /* Crop Card Image Header */
                .card-image-box {
                    position: relative;
                    width: 100%;
                    height: 195px;
                    overflow: hidden;
                    background-color: #f1f5f9;
                }

                .crop-photo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.4s ease;
                }

                .crop-item-card:hover .crop-photo {
                    transform: scale(1.05);
                }

                /* Badges on Image */
                .badge-category-dark {
                    position: absolute;
                    bottom: 12px;
                    left: 14px;
                    background: rgba(15, 23, 42, 0.82);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 5px 12px;
                    border-radius: 8px;
                    letter-spacing: 0.3px;
                }

                .badge-availability {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 9999px;
                    font-size: 11.5px;
                    font-weight: 800;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .badge-availability.available {
                    background: rgba(255, 255, 255, 0.95);
                    color: #15803d;
                    border: 1px solid #bbf7d0;
                }

                .badge-availability.available .dot {
                    width: 7px;
                    height: 7px;
                    background: #16a34a;
                    border-radius: 50%;
                }

                .badge-availability.upcoming {
                    background: rgba(255, 255, 255, 0.95);
                    color: #b45309;
                    border: 1px solid #fde68a;
                }

                .badge-availability.upcoming .clock-icon {
                    display: inline-flex;
                }

                /* Crop Card Content Body */
                .card-details-box {
                    padding: 22px 22px 24px 22px;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .card-title-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 6px;
                }

                .crop-symbol-icon {
                    font-size: 18px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .crop-name-heading {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .crop-desc-text {
                    font-size: 12.5px;
                    color: #64748b;
                    line-height: 1.5;
                    margin: 0 0 16px 0;
                    min-height: 38px;
                }

                /* Conditions Area */
                .conditions-block {
                    margin-bottom: 22px;
                    flex: 1;
                }

                .conditions-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11.5px;
                    font-weight: 800;
                    color: #15803d;
                    margin-bottom: 10px;
                }

                .disease-tags-flow {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 7px;
                }

                .disease-pill-tag {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #334155;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 9px;
                    border-radius: 7px;
                }

                /* Action CTA Buttons */
                .card-cta-btn {
                    width: 100%;
                    padding: 12px 18px;
                    border-radius: 12px;
                    font-size: 13.5px;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }

                .card-cta-btn.btn-analyze {
                    background: #16a34a;
                    color: #ffffff;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
                }

                .card-cta-btn.btn-analyze:hover {
                    background: #15803d;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
                }

                .card-cta-btn.btn-disabled {
                    background: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                    border: 1px solid #e2e8f0;
                }

                /* ================= SECTION 5: HOW IT WORKS ================= */
                .crops-how-card {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    background-color: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 28px 36px;
                }

                .crops-how-content {
                    max-width: 680px;
                }

                .how-head-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .how-info-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #dcfce7;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                }

                .how-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .how-desc {
                    font-size: 13.5px;
                    color: #475569;
                    line-height: 1.65;
                    margin: 0 0 14px 0;
                }

                .how-credit-footnote {
                    font-size: 11px;
                    color: #94a3b8;
                    margin: 0;
                }

                .crops-how-visual {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .how-visual-badge {
                    text-align: right;
                    font-size: 15px;
                    font-weight: 800;
                    color: #15803d;
                    font-family: 'Segoe UI', cursive, sans-serif;
                    line-height: 1.25;
                }

                .how-sprout-img {
                    width: 110px;
                    height: 110px;
                    border-radius: 20px;
                    object-fit: cover;
                    border: 2px solid #dcfce7;
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
                }

                /* ================= RESPONSIVENESS ================= */
                @media (max-width: 1200px) {
                    .crops-cards-container {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 860px) {
                    .crop-stats-row {
                        grid-template-columns: 1fr;
                    }
                    .crops-cards-container {
                        grid-template-columns: 1fr;
                    }
                    .crops-hero-inner {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .crops-hero-right {
                        justify-content: flex-start;
                        padding-right: 0;
                    }
                    .crops-how-card {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .crops-section-bar {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 14px;
                    }
                }

                @media (max-width: 640px) {
                    .premium-crops-page {
                        padding: 20px 16px 60px 16px;
                    }
                    .crops-hero-title {
                        font-size: 28px;
                    }
                    .crops-hero-inner {
                        padding: 24px 20px;
                    }
                }
            `}</style>

            {/* ================= SECTION 1: HERO ================= */}
            <div className="crops-hero-card">
                <div className="crops-hero-banner-bg" />
                <div className="crops-hero-gradient-overlay" />
                <div className="crops-hero-inner">
                    <div className="crops-hero-left">
                        <div className="crops-eyebrow-badge">
                            <span className="eyebrow-icon-leaf">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                                    <path d="M4 21c3-4 6.5-6.5 11-9" />
                                </svg>
                            </span>
                            <span>{text.eyebrow}</span>
                        </div>
                        <h1 className="crops-hero-title">{text.title}</h1>
                        <p className="crops-hero-sub">{text.heroDescription}</p>

                        <div className="crops-hero-features">
                            <div className="feature-pill-item">
                                <div className="feature-icon-circle">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                                        <path d="M4 21c3-4 6.5-6.5 11-9" />
                                    </svg>
                                </div>
                                <div className="feature-text-group">
                                    <span className="feature-text-main">{text.featureAi}</span>
                                    <span className="feature-text-sub">{text.featureAiSub}</span>
                                </div>
                            </div>

                            <div className="feature-pill-item">
                                <div className="feature-icon-circle">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <div className="feature-text-group">
                                    <span className="feature-text-main">{text.featureAccurate}</span>
                                    <span className="feature-text-sub">{text.featureAccurateSub}</span>
                                </div>
                            </div>

                            <div className="feature-pill-item">
                                <div className="feature-icon-circle">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </div>
                                <div className="feature-text-group">
                                    <span className="feature-text-main">{text.featureHealthier}</span>
                                    <span className="feature-text-sub">{text.featureHealthierSub}</span>
                                </div>
                            </div>

                            <div className="feature-pill-item">
                                <div className="feature-icon-circle">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                </div>
                                <div className="feature-text-group">
                                    <span className="feature-text-main">{text.featureSustainable}</span>
                                    <span className="feature-text-sub">{text.featureSustainableSub}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="crops-hero-right">
                        <div className="hero-farmers-badge">
                            <h4>
                                Healthy<br />Plants<br />Happier<br />Farmers
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= SECTION 2: METRICS ================= */}
            <div className="crop-stats-row">
                <div className="stat-box-card">
                    <div className="stat-icon-wrapper green">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                            <path d="M4 21c3-4 6.5-6.5 11-9" />
                        </svg>
                    </div>
                    <div className="stat-info-group">
                        <span className="stat-top-label">{text.totalCrops}</span>
                        <span className="stat-big-number">{crops.length}</span>
                        <span className="stat-sub-caption">{text.totalCropsSub}</span>
                    </div>
                </div>

                <div className="stat-box-card">
                    <div className="stat-icon-wrapper blue">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </div>
                    <div className="stat-info-group">
                        <span className="stat-top-label">{text.aiSupported}</span>
                        <span className="stat-big-number">{supportedCount}</span>
                        <span className="stat-sub-caption">{text.aiSupportedSub}</span>
                    </div>
                </div>

                <div className="stat-box-card">
                    <div className="stat-icon-wrapper amber">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="stat-info-group">
                        <span className="stat-top-label">{text.comingSoon}</span>
                        <span className="stat-big-number">{comingSoonCount}</span>
                        <span className="stat-sub-caption">{text.comingSoonSub}</span>
                    </div>
                </div>
            </div>

            {/* ================= SECTION 3: HEADER & FILTER ================= */}
            <div className="crops-section-bar">
                <div>
                    <div className="section-eyebrow-tag">{text.selectACrop}</div>
                    <h2 className="crops-main-heading">{text.aiDetectionAvailable}</h2>
                    <p className="crops-main-sub">{text.selectCrop}</p>
                </div>

                <button
                    type="button"
                    className={`filter-dropdown-btn ${filterOnlySupported ? "active" : ""}`}
                    onClick={() => setFilterOnlySupported(!filterOnlySupported)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                    </svg>
                    <span>{filterOnlySupported ? text.filterAll : text.filterSupportedOnly}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            {/* ================= SECTION 4: CROP CARDS ================= */}
            <div className="crops-cards-container">
                {displayedCrops.map((crop) => (
                    <div
                        key={crop.name}
                        className={`crop-item-card ${crop.supported ? "is-available" : "is-upcoming"}`}
                        onClick={() => crop.supported && handleAnalyze(crop)}
                        style={{ cursor: crop.supported ? "pointer" : "default" }}
                    >
                        {/* Image Header with Category & Availability Badges */}
                        <div className="card-image-box">
                            <img
                                src={crop.image}
                                alt={crop.name}
                                className="crop-photo"
                                onError={(e) => {
                                    if (e.target.src !== crop.fallbackImage) {
                                        e.target.src = crop.fallbackImage;
                                    }
                                }}
                            />

                            <span className="badge-category-dark">
                                {getCategoryLabel(crop.category)}
                            </span>

                            {crop.supported ? (
                                <span className="badge-availability available">
                                    <span className="dot" />
                                    <span>{text.available}</span>
                                </span>
                            ) : (
                                <span className="badge-availability upcoming">
                                    <span className="clock-icon">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </span>
                                    <span>{text.comingSoonBadge}</span>
                                </span>
                            )}
                        </div>

                        {/* Card Content Body */}
                        <div className="card-details-box">
                            <div className="card-title-row">
                                <span className="crop-symbol-icon">{crop.icon}</span>
                                <h3 className="crop-name-heading">{crop.name}</h3>
                            </div>

                            <p className="crop-desc-text">
                                {getCropDescription(crop.name, crop.description)}
                            </p>

                            {/* Conditions Area */}
                            <div className="conditions-block">
                                {crop.supported && crop.diseases.length > 0 && (
                                    <>
                                        <div className="conditions-header">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="3" />
                                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                                            </svg>
                                            <span>{text.detectableConditions}</span>
                                        </div>
                                        <div className="disease-tags-flow">
                                            {crop.diseases.map((disease) => (
                                                <span key={disease} className="disease-pill-tag">
                                                    {getDiseaseLabel(disease)}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Action CTA Button */}
                            {crop.supported ? (
                                <button
                                    type="button"
                                    className="card-cta-btn btn-analyze"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnalyze(crop);
                                    }}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <span>
                                        {text.analyze} {crop.name} →
                                    </span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="card-cta-btn btn-disabled"
                                    disabled
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span>{text.comingSoonBadge}</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= SECTION 5: HOW IT WORKS ================= */}
            <div className="crops-how-card">
                <div className="crops-how-content">
                    <div className="how-head-group">
                        <div className="how-info-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <h3 className="how-title">{text.howWorks}</h3>
                    </div>
                    <p className="how-desc">{text.howWorksText}</p>
                    <p className="how-credit-footnote">{text.photoCredit}</p>
                </div>

                <div className="crops-how-visual">
                    <div className="how-visual-badge">
                        Small<br />Steps<br />Greener<br />Tomorrows
                    </div>
                    <img
                        src="/images/sprout_soil.jpg"
                        alt="Young healthy sprout"
                        className="how-sprout-img"
                    />
                </div>
            </div>
        </div>
    );
}
