import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import UserProfileMenu from "../components/UserProfileMenu";

export default function AIInsights() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Multilingual Dictionary
    const ui = {
        en: {
            eyebrow: "AI POWERED AGRICULTURE ✦",
            title: "AI Insights",
            subtitle: "Turn your crop data into actionable insights.",
            heroDesc: "Get AI-powered recommendations, early warnings and personalized farming advice for better yield and healthier crops.",
            askAiBtn: "Ask AI Anything →",
            watchDemoBtn: "Watch Demo",
            badgeAiAnalysis: "Precision AI",
            badgeRealtime: "Real-time Alerts",
            badgePersonalized: "Smart Diagnostics",
            totalAnalyses: "Total Analyses",
            totalAnalysesSub: "from last month",
            healthyPreds: "Healthy Predictions",
            healthyPredsSub: "of total",
            diseaseDetections: "Disease Detections",
            diseaseDetectionsSub: "of total",
            avgConfidence: "Average Confidence",
            avgConfidenceSub: "High model accuracy",
            tabAll: "All Insights",
            tabCrops: "Crop Insights",
            tabDisease: "Disease Alerts",
            tabYield: "Yield Predictions",
            tabFarming: "Farming Tips",
            tabMarket: "Market Insights",
            comingSoonBadge: "Coming Soon",
            time30Days: "Last 30 Days",
            cropHealthTitle: "Crop Health Overview",
            cropHealthSub: "Current health status across all analyzed crops.",
            healthyLabel: "Healthy",
            atRiskLabel: "At Risk",
            diseasedLabel: "Diseased",
            diseaseRiskTitle: "Disease Risk Analysis",
            diseaseRiskSub: "Top predicted diseases and risk levels.",
            predictionConfTitle: "Prediction Confidence",
            predictionConfSub: "Distribution of AI prediction confidence.",
            confHigh: "High (>80%)",
            confMed: "Medium (60–80%)",
            confLow: "Low (<60%)",
            topAiInsights: "Top AI Insights",
            topAiInsightsSub: "Key recommendations based on your farm data.",
            viewAllBtn: "View All →",
            viewHistoryBtn: "View History →",
            recentActivityTitle: "Recent Activity",
            seasonalInsightsTitle: "Seasonal Insights",
            seasonalInsightsSub: "AI analysis based on current season and weather conditions.",
            smartRecommendationsTitle: "Smart Farming Recommendations",
            smartRecommendationsSub: "Personalized recommendations for your farm.",
            assistantTitle: "AgriMind AI Assistant",
            assistantStatus: "Online • Ready to help",
            chatGreeting: "Hello, I'm AgriMind AI!",
            chatGreetingSub: "Ask me anything about your crops, diseases, farming practices or get personalized recommendations.",
            chatSuggestionsTitle: "Here are some things you can ask:",
            chatInputPlaceholder: "Type your question here...",
            uploadImageBtn: "Upload Image",
            voiceBtn: "Voice",
            quickActionsTitle: "Quick Actions",
            actionAnalyze: "Analyze Image",
            actionRecommendations: "Get Recommendations",
            actionPrevention: "Disease Prevention",
            actionCalendar: "Farming Calendar",
            growSmarterTitle: "Grow Smarter with AI",
            growSmarterSub: "Let AgriMind AI guide your farming journey.",
            applyBtn: "Apply",
            readMoreBtn: "Read More",
            setReminderBtn: "Set Reminder",
            comingSoonTitle: "Feature Coming Soon",
            comingSoonDesc: "This module is currently being calibrated with advanced AI backend models and will be available in the upcoming update."
        },
        mr: {
            eyebrow: "AI सक्षम शेती तंत्रज्ञान ✦",
            title: "AI अंतर्दृष्टी",
            subtitle: "तुमच्या पिकांच्या डेटाचे कृतीयोग्य अंतर्दृष्टीत रूपांतर करा.",
            heroDesc: "उत्तम उत्पादन आणि निरोगी पिकांसाठी AI-आधारित शिफारसी, पूर्वसूचना आणि वैयक्तिक सल्ला मिळवा.",
            askAiBtn: "AI ला काहीही विचारा →",
            watchDemoBtn: "डेमो पहा",
            badgeAiAnalysis: "अचूक AI",
            badgeRealtime: "थेट सूचना",
            badgePersonalized: "स्मार्ट निदान",
            totalAnalyses: "एकूण विश्लेषणे",
            totalAnalysesSub: "मागील महिन्यापासून",
            healthyPreds: "निरोगी अंदाज",
            healthyPredsSub: "एकूण पैकी",
            diseaseDetections: "रोग शोध",
            diseaseDetectionsSub: "एकूण पैकी",
            avgConfidence: "सरासरी विश्वास पातळी",
            avgConfidenceSub: "उच्च मॉडेल अचूकता",
            tabAll: "सर्व अंतर्दृष्टी",
            tabCrops: "पीक अंतर्दृष्टी",
            tabDisease: "रोग सूचना",
            tabYield: "उत्पादन अंदाज",
            tabFarming: "शेती टिप्स",
            tabMarket: "बाजार अंतर्दृष्टी",
            comingSoonBadge: "लवकरच",
            time30Days: "मागील 30 दिवस",
            cropHealthTitle: "पीक आरोग्य आढावा",
            cropHealthSub: "सर्व विश्लेषित पिकांमधील सध्याची आरोग्य स्थिती.",
            healthyLabel: "निरोगी",
            atRiskLabel: "धोक्यात",
            diseasedLabel: "रोगग्रस्त",
            diseaseRiskTitle: "रोग जोखीम विश्लेषण",
            diseaseRiskSub: "सर्वाधिक संभाव्य रोग आणि जोखीम पातळी.",
            predictionConfTitle: "अंदाज विश्वास पातळी",
            predictionConfSub: "AI अंदाजाच्या विश्वास पातळीचे वितरण.",
            confHigh: "उच्च (>80%)",
            confMed: "मध्यम (60–80%)",
            confLow: "कमी (<60%)",
            topAiInsights: "प्रमुख AI अंतर्दृष्टी",
            topAiInsightsSub: "तुमच्या शेताच्या डेटावर आधारित महत्त्वाच्या शिफारसी.",
            viewAllBtn: "सर्व पहा →",
            viewHistoryBtn: "इतिहास पहा →",
            recentActivityTitle: "अलीकडील घडामोडी",
            seasonalInsightsTitle: "हंगामी अंतर्दृष्टी",
            seasonalInsightsSub: "सध्याचा हंगाम आणि हवामानावर आधारित AI विश्लेषण.",
            smartRecommendationsTitle: "स्मार्ट शेती शिफारसी",
            smartRecommendationsSub: "तुमच्या शेतासाठी वैयक्तिक सल्ला.",
            assistantTitle: "AgriMind AI सहाय्यक",
            assistantStatus: "सक्रिय • मदतीसाठी तयार",
            chatGreeting: "नमस्कार, मी AgriMind AI आहे!",
            chatGreetingSub: "तुमची पिके, रोग, शेती पद्धती याबद्दल काहीही विचारा किंवा सल्ला मिळवा.",
            chatSuggestionsTitle: "तुम्ही पुढील प्रश्न विचारू शकता:",
            chatInputPlaceholder: "तुमचा प्रश्न इथे विचारा...",
            uploadImageBtn: "इमेज अपलोड करा",
            voiceBtn: "आवाज",
            quickActionsTitle: "जलद कृती",
            actionAnalyze: "इमेज तपासा",
            actionRecommendations: "शिफारसी मिळवा",
            actionPrevention: "रोग प्रतिबंध",
            actionCalendar: "शेती दिनदर्शिका",
            growSmarterTitle: "AI सह स्मार्ट शेती करा",
            growSmarterSub: "AgriMind AI ला तुमच्या प्रवासाचे मार्गदर्शक बनवा.",
            applyBtn: "लागू करा",
            readMoreBtn: "अधिक वाचा",
            setReminderBtn: "स्मरणपत्र लावा",
            comingSoonTitle: "वैशिष्ट्य लवकरच येत आहे",
            comingSoonDesc: "हे वैशिष्ट्य सध्या AI बॅकएंडवर तयार केले जात असून पुढील अपडेटमध्ये उपलब्ध होईल."
        },
        hi: {
            eyebrow: "AI संचालित कृषि तकनीक ✦",
            title: "AI अंतर्दृष्टि",
            subtitle: "अपने फसल डेटा को कार्रवाई योग्य अंतर्दृष्टि में बदलें।",
            heroDesc: "बेहतर उपज और स्वस्थ फसलों के लिए AI-संचालित सिफारिशें, प्रारंभिक चेतावनियां और व्यक्तिगत सलाह प्राप्त करें।",
            askAiBtn: "AI से कुछ भी पूछें →",
            watchDemoBtn: "डेमो देखें",
            badgeAiAnalysis: "सटीक AI",
            badgeRealtime: "रीयल-टाइम अलर्ट",
            badgePersonalized: "स्मार्ट निदान",
            totalAnalyses: "कुल विश्लेषण",
            totalAnalysesSub: "पिछले महीने से",
            healthyPreds: "स्वस्थ भविष्यवाणियां",
            healthyPredsSub: "कुल का",
            diseaseDetections: "रोग पहचान",
            diseaseDetectionsSub: "कुल का",
            avgConfidence: "औसत सटीकता",
            avgConfidenceSub: "उच्च मॉडल सटीकता",
            tabAll: "सभी अंतर्दृष्टि",
            tabCrops: "फसल अंतर्दृष्टि",
            tabDisease: "रोग चेतावनी",
            tabYield: "उपज पूर्वानुमान",
            tabFarming: "खेती टिप्स",
            tabMarket: "बाजार अंतर्दृष्टि",
            comingSoonBadge: "जल्द आ रहा है",
            time30Days: "पिछले 30 दिन",
            cropHealthTitle: "फसल स्वास्थ्य अवलोकन",
            cropHealthSub: "विश्लेषित फसलों की वर्तमान स्वास्थ्य स्थिति।",
            healthyLabel: "स्वस्थ",
            atRiskLabel: "जोखिम में",
            diseasedLabel: "रोगग्रस्त",
            diseaseRiskTitle: "रोग जोखिम विश्लेषण",
            diseaseRiskSub: "शीर्ष अनुमानित रोग और जोखिम स्तर।",
            predictionConfTitle: "अनुमान सटीकता",
            predictionConfSub: "AI अनुमान सटीकता का वितरण।",
            confHigh: "उच्च (>80%)",
            confMed: "मध्यम (60–80%)",
            confLow: "कम (<60%)",
            topAiInsights: "शीर्ष AI अंतर्दृष्टि",
            topAiInsightsSub: "आपके खेत के डेटा पर आधारित मुख्य सिफारिशें।",
            viewAllBtn: "सभी देखें →",
            viewHistoryBtn: "इतिहास देखें →",
            recentActivityTitle: "हाल की गतिविधि",
            seasonalInsightsTitle: "मौसमी अंतर्दृष्टि",
            seasonalInsightsSub: "वर्तमान मौसम और जलवायु पर आधारित AI विश्लेषण।",
            smartRecommendationsTitle: "स्मार्ट खेती सिफारिशें",
            smartRecommendationsSub: "आपके खेत के लिए व्यक्तिगत सिफारिशें।",
            assistantTitle: "AgriMind AI सहायक",
            assistantStatus: "ऑनलाइन • मदद के लिए तैयार",
            chatGreeting: "नमस्ते, मैं AgriMind AI हूँ!",
            chatGreetingSub: "अपनी फसलों, बीमारियों, खेती के तरीकों के बारे में पूछें या व्यक्तिगत सलाह लें।",
            chatSuggestionsTitle: "आप यह सवाल पूछ सकते हैं:",
            chatInputPlaceholder: "अपना प्रश्न यहाँ लिखें...",
            uploadImageBtn: "इमेज अपलोड करें",
            voiceBtn: "आवाज़",
            quickActionsTitle: "त्वरित कार्रवाई",
            actionAnalyze: "इमेज का विश्लेषण करें",
            actionRecommendations: "सिफारिशें प्राप्त करें",
            actionPrevention: "रोग रोकथाम",
            actionCalendar: "खेती कैलेंडर",
            growSmarterTitle: "AI के साथ स्मार्ट खेती करें",
            growSmarterSub: "AgriMind AI को अपनी खेती का मार्गदर्शक बनाएं।",
            applyBtn: "लागू करें",
            readMoreBtn: "अधिक पढ़ें",
            setReminderBtn: "रिमाइंडर सेट करें",
            comingSoonTitle: "सुविधा जल्द आ रही है",
            comingSoonDesc: "यह मॉड्यूल वर्तमान में AI बैकएंड के साथ कैलिब्रेट किया जा रहा है और जल्द ही उपलब्ध होगा।"
        }
    };

    const text = ui[language] || ui.en;

    // Farmer Profile
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

    // Filter Tabs & State
    const [activeTab, setActiveTab] = useState("all");
    const [appliedReminders, setAppliedReminders] = useState({});

    // Toast Notice State for Unwired / Coming Soon Features
    const [toastMessage, setToastMessage] = useState(null);
    const toastTimeoutRef = useRef(null);

    const showComingSoonToast = (featureName) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToastMessage({
            title: featureName ? `${featureName} — Coming Soon` : text.comingSoonTitle,
            desc: text.comingSoonDesc
        });
        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 3200);
    };

    // Interactive AI Chatbot state
    const [messages, setMessages] = useState([]);
    const [inputQuestion, setInputQuestion] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    const handleSendMessage = (textToSend) => {
        const query = textToSend || inputQuestion;
        if (!query.trim()) return;

        const userMsg = { sender: "user", text: query, time: "Just now" };
        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInputQuestion("");
        setIsTyping(true);

        setTimeout(() => {
            let reply = "Based on your farm profile, maintaining good drainage and applying bio-fungicides like Trichoderma viride will significantly mitigate disease risks.";
            const qLower = query.toLowerCase();

            if (qLower.includes("yellow") || qLower.includes("soybean")) {
                reply = "Yellowing in soybean leaves is frequently caused by early Bacterial Blight or nitrogen deficiency. Inspect leaf undersides for water-soaked lesions and avoid overhead irrigation.";
            } else if (qLower.includes("yield")) {
                reply = "To increase crop yield by 15-20%, ensure optimal plant spacing (45cm between rows), maintain balanced N-P-K fertilization, and conduct weekly scouting during pod formation.";
            } else if (qLower.includes("cotton") || qLower.includes("sow")) {
                reply = "The recommended sowing window for Cotton is late May to June with the onset of pre-monsoon showers. Use certified Bt-cotton seeds with 90x60cm spacing.";
            } else if (qLower.includes("prevention") || qLower.includes("disease")) {
                reply = "Top disease prevention protocols: 1) Certified disease-resistant seed varieties, 2) Seed treatment with bio-control agents, 3) 2-year crop rotation, 4) Immediate removal of infected plant debris.";
            } else if (qLower.includes("weather") || qLower.includes("rain")) {
                reply = "Moderate rainfall is expected over the next 5-7 days with 78% relative humidity. This high humidity favors fungal spores; delay chemical sprays until after heavy showers.";
            }

            const aiMsg = { sender: "ai", text: reply, time: "Just now" };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 800);
    };

    // Disease Risk Distribution items
    const diseaseRisks = [
        { name: "Bacterial Blight", count: 13, percentage: 35.1, dotClass: "dot-red", barClass: "bar-red" },
        { name: "Frogeye Leaf Spot", count: 6, percentage: 16.2, dotClass: "dot-orange", barClass: "bar-orange" },
        { name: "Downy Mildew", count: 4, percentage: 10.8, dotClass: "dot-amber", barClass: "bar-amber" },
        { name: "Leaf Spot", count: 3, percentage: 8.1, dotClass: "dot-green", barClass: "bar-green" },
        { name: "Anthracnose", count: 2, percentage: 5.4, dotClass: "dot-teal", barClass: "bar-teal" }
    ];

    return (
        <div className="ai-insights-page">
            <style>{`
                /* =========================================================
                   AI INSIGHTS & RISK ANALYSIS - PREMIUM AG-TECH DASHBOARD
                ========================================================= */
                .ai-insights-page {
                    width: 100%;
                    min-height: 100%;
                    background: #f4fbf7;
                    padding: 24px 36px 60px 36px;
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    box-sizing: border-box;
                    position: relative;
                }

                /* Top Navigation / Search Header */
                .ai-insights-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 2px;
                }

                .topbar-search-box {
                    flex: 1;
                    max-width: 480px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .topbar-search-box svg {
                    position: absolute;
                    left: 18px;
                    color: #94a3b8;
                    pointer-events: none;
                }

                .topbar-search-box input {
                    width: 100%;
                    height: 48px;
                    padding: 0 20px 0 50px;
                    background: #ffffff;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 9999px;
                    font-size: 14px;
                    color: #1e293b;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .topbar-search-box input:focus {
                    border-color: #16a34a;
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.14);
                }

                .topbar-search-box input::placeholder {
                    color: #94a3b8;
                }

                .topbar-user-area {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .notif-btn {
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

                .notif-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .notif-badge {
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

                .profile-pill {
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

                .profile-pill:hover {
                    border-color: #cbd5e1;
                }

                .profile-img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .profile-info {
                    display: flex;
                    flex-direction: column;
                }

                .profile-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.2;
                }

                .profile-tag {
                    font-size: 12px;
                    font-weight: 600;
                    color: #16a34a;
                }

                /* ================= PREMIUM HERO BANNER (300-340px) ================= */
                .ai-insights-hero {
                    position: relative;
                    border-radius: 22px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 34px 44px;
                    border: 1px solid rgba(255, 255, 255, 0.28);
                    box-shadow: 0 16px 40px -10px rgba(13, 38, 19, 0.25);
                    min-height: 310px;
                    box-sizing: border-box;
                }

                .ai-insights-hero-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center 30%;
                    z-index: 1;
                }

                .ai-insights-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(8, 28, 14, 0.94) 0%, rgba(13, 56, 30, 0.84) 42%, rgba(6, 78, 59, 0.38) 72%, rgba(6, 78, 59, 0.12) 100%);
                    z-index: 2;
                }

                .ai-insights-hero-content {
                    position: relative;
                    z-index: 3;
                    max-width: 580px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .ai-insights-hero-eyebrow {
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    color: #86efac;
                    margin-bottom: 2px;
                    text-transform: uppercase;
                }

                .ai-insights-hero-title {
                    font-size: 34px;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                    margin: 0;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
                }

                .ai-insights-hero-subtitle {
                    font-size: 16px;
                    font-weight: 700;
                    color: #bbf7d0;
                    margin: 0;
                }

                .ai-insights-hero-description {
                    font-size: 14px;
                    font-weight: 500;
                    color: #e2e8f0;
                    margin: 0;
                    line-height: 1.5;
                }

                .ai-insights-hero-actions {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-top: 8px;
                    flex-wrap: wrap;
                }

                .btn-ask-ai-primary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border-radius: 12px;
                    background: #22c55e;
                    color: #064e3b;
                    border: none;
                    font-size: 14.5px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
                    transition: all 0.2s ease;
                }

                .btn-ask-ai-primary:hover {
                    background: #16a34a;
                    color: #ffffff;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
                }

                .btn-watch-demo-secondary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 11px 20px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.14);
                    backdrop-filter: blur(12px);
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.28);
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-watch-demo-secondary:hover {
                    background: rgba(255, 255, 255, 0.24);
                }

                .btn-watch-demo-secondary .sub-tag {
                    font-size: 10.5px;
                    padding: 2px 7px;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.2);
                    color: #86efac;
                    font-weight: 700;
                }

                /* Right Banner Elegant Indicators */
                .ai-insights-hero-features {
                    position: relative;
                    z-index: 3;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 12px;
                }

                .ai-insights-hero-feature {
                    background: rgba(255, 255, 255, 0.16);
                    backdrop-filter: blur(14px);
                    border: 1px solid rgba(255, 255, 255, 0.28);
                    border-radius: 14px;
                    padding: 10px 18px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #ffffff;
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
                    transition: transform 0.2s ease, background 0.2s ease;
                }

                .ai-insights-hero-feature:hover {
                    background: rgba(255, 255, 255, 0.22);
                    transform: translateX(-3px);
                }

                .ai-insights-hero-feature span.icon {
                    color: #86efac;
                    font-size: 16px;
                }

                /* ================= 4 KPI SUMMARY CARDS ================= */
                .ai-insights-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 18px;
                }

                .ai-insights-stat-card {
                    background: #ffffff;
                    border-radius: 18px;
                    border: 1px solid #e2e8f0;
                    padding: 20px 22px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.03);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .ai-insights-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.06);
                }

                .kpi-icon-wrap {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .kpi-icon-mint { background: #f0fdf4; color: #16a34a; }
                .kpi-icon-green { background: #eefbf3; color: #15803d; }
                .kpi-icon-red { background: #fef2f2; color: #ef4444; }
                .kpi-icon-blue { background: #eff6ff; color: #2563eb; }

                .kpi-info-col {
                    display: flex;
                    flex-direction: column;
                }

                .kpi-number-val {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }

                .kpi-label-text {
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    margin: 2px 0 3px 0;
                }

                .kpi-sub-badge {
                    font-size: 12px;
                    font-weight: 600;
                    color: #16a34a;
                }

                .kpi-sub-muted {
                    font-size: 12px;
                    font-weight: 500;
                    color: #94a3b8;
                }

                /* ================= FILTER TABS & TIMELINE ROW ================= */
                .ai-insights-filters-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .ai-insights-tabs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #ffffff;
                    padding: 6px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
                }

                .ai-insights-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: none;
                    background: transparent;
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .ai-insights-tab:hover {
                    color: #16a34a;
                    background: #f8fafc;
                }

                .ai-insights-tab.active {
                    background: #16a34a;
                    color: #ffffff;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
                }

                .ai-insights-tab-soon {
                    opacity: 0.85;
                }

                .ai-insights-coming-soon-pill {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 6px;
                    background: #e0f2fe;
                    color: #0369a1;
                    letter-spacing: 0.02em;
                }

                .ai-insights-tab.active .ai-insights-coming-soon-pill {
                    background: rgba(255, 255, 255, 0.25);
                    color: #ffffff;
                }

                .ai-insights-date-filter {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 18px;
                    background: #ffffff;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #1e293b;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
                    transition: all 0.15s ease;
                }

                .ai-insights-date-filter:hover {
                    border-color: #cbd5e1;
                    background: #f8fafc;
                }

                /* ================= 2-COLUMN MAIN CONTENT ================= */
                .insights-main-grid {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 22px;
                    align-items: start;
                }

                .insights-left-col {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                .insights-right-col {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                .white-panel-card {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    padding: 24px;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
                }

                .panel-header-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 18px;
                }

                .panel-title-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .panel-icon-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #f0fdf4;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .panel-title-text h3 {
                    font-size: 17px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .panel-title-text p {
                    font-size: 12.5px;
                    color: #64748b;
                    margin: 2px 0 0 0;
                }

                .view-link-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #16a34a;
                    background: none;
                    border: none;
                    cursor: pointer;
                }

                .view-link-btn:hover {
                    text-decoration: underline;
                }

                /* 3-Card Row (Crop Health, Disease Risk, Prediction Confidence) */
                .tri-cards-row {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr 0.9fr;
                    gap: 16px;
                }

                .crop-health-donut-body {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }

                .donut-wrap-sm {
                    position: relative;
                    width: 105px;
                    height: 105px;
                    flex-shrink: 0;
                }

                .donut-text-center {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .donut-pct-num {
                    font-size: 17px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.1;
                }

                .donut-pct-label {
                    font-size: 10.5px;
                    font-weight: 700;
                    color: #16a34a;
                }

                .health-legend-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }

                .legend-row-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #475569;
                }

                .legend-row-item span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .legend-color-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                }

                .dot-green { background: #22c55e; }
                .dot-amber { background: #f59e0b; }
                .dot-orange { background: #f97316; }
                .dot-red { background: #ef4444; }
                .dot-teal { background: #0d9488; }

                .disease-risk-list {
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                }

                .disease-risk-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12px;
                }

                .disease-name-label {
                    width: 125px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 600;
                    color: #334155;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .risk-progress-bar-track {
                    flex: 1;
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 9999px;
                    overflow: hidden;
                }

                .risk-bar-fill {
                    height: 100%;
                    border-radius: 9999px;
                }

                .bar-red { background: #ef4444; }
                .bar-orange { background: #f97316; }
                .bar-amber { background: #f59e0b; }
                .bar-green { background: #22c55e; }
                .bar-teal { background: #0d9488; }

                .risk-metrics-col {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                }

                .conf-bars-wrap {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 105px;
                    padding-bottom: 4px;
                }

                .conf-bar-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .conf-bar-val {
                    font-size: 12px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .conf-bar-pillar {
                    width: 24px;
                    border-radius: 6px 6px 0 0;
                }

                .pillar-high { height: 60px; background: #22c55e; }
                .pillar-med { height: 28px; background: #f59e0b; }
                .pillar-low { height: 12px; background: #ef4444; }

                .conf-bar-tag {
                    font-size: 11px;
                    font-weight: 700;
                    color: #475569;
                }

                /* Row 2: Top AI Insights & Recent Activity */
                .top-insights-and-activity-row {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    gap: 16px;
                }

                .insight-cards-subgrid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .priority-insight-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 12px;
                }

                .card-header-badge-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .insight-type-badge {
                    font-size: 10.5px;
                    font-weight: 800;
                    padding: 3px 8px;
                    border-radius: 6px;
                }

                .badge-positive { background: #dcfce7; color: #15803d; }
                .badge-attention { background: #fee2e2; color: #b91c1c; }
                .badge-opportunity { background: #dbeafe; color: #1d4ed8; }

                .priority-insight-card h4 {
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                    line-height: 1.3;
                }

                .priority-insight-card p {
                    font-size: 11.5px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.4;
                }

                .btn-card-action-sub {
                    background: none;
                    border: none;
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    padding: 0;
                    text-align: left;
                }

                .action-green { color: #16a34a; }
                .action-red { color: #dc2626; }
                .action-blue { color: #2563eb; }

                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 10px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                }

                .activity-icon-sq {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .act-green { background: #dcfce7; }
                .act-red { background: #fee2e2; }
                .act-blue { background: #dbeafe; }
                .act-amber { background: #fef3c7; }

                .activity-details {
                    display: flex;
                    flex-direction: column;
                }

                .activity-title {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #0f172a;
                }

                .activity-meta {
                    font-size: 11px;
                    color: #64748b;
                }

                /* Row 3: Seasonal Insights & Recommendations */
                .seasonal-and-recs-row {
                    display: grid;
                    grid-template-columns: 1fr 1.3fr;
                    gap: 16px;
                }

                .seasonal-cards-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .seasonal-subcard {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 12px 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .seasonal-subcard:hover {
                    background: #f0fdf4;
                    border-color: #86efac;
                }

                .season-icon-sm {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .season-text-col {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .season-text-col h5 {
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }

                .season-text-col span {
                    font-size: 11.5px;
                    color: #64748b;
                }

                .recs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .rec-item {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                }

                .rec-left-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .rec-icon-wrap {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .rec-text-wrap h5 {
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }

                .rec-text-wrap p {
                    font-size: 11.5px;
                    color: #64748b;
                    margin: 0;
                }

                .btn-rec-action {
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s ease;
                }

                .btn-rec-primary {
                    background: #16a34a;
                    color: #ffffff;
                    border: none;
                }

                .btn-rec-primary:hover {
                    background: #15803d;
                }

                .btn-rec-secondary {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                }

                .btn-rec-secondary:hover {
                    background: #f1f5f9;
                }

                /* ================= RIGHT COLUMN: CHATBOT ASSISTANT ================= */
                .ai-chat-assistant-card {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
                }

                .assistant-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .assistant-avatar-img {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    object-fit: cover;
                }

                .assistant-status-col h4 {
                    font-size: 15px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }

                .assistant-status-col span {
                    font-size: 12px;
                    color: #16a34a;
                    font-weight: 600;
                }

                .chat-scroll-area {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 280px;
                    overflow-y: auto;
                    padding-right: 4px;
                }

                .chat-bubble {
                    padding: 10px 14px;
                    border-radius: 14px;
                    font-size: 12.5px;
                    line-height: 1.45;
                }

                .bubble-ai {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #1e293b;
                    align-self: flex-start;
                }

                .bubble-user {
                    background: #16a34a;
                    color: #ffffff;
                    align-self: flex-end;
                }

                .chat-prompts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    margin-top: 6px;
                }

                .prompt-suggestion-btn {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #334155;
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.15s ease;
                }

                .prompt-suggestion-btn:hover {
                    background: #f0fdf4;
                    border-color: #86efac;
                    color: #15803d;
                }

                .chat-input-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-top: 10px;
                    border-top: 1px solid #f1f5f9;
                }

                .chat-input-field {
                    flex: 1;
                    height: 40px;
                    padding: 0 14px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    font-size: 13px;
                    outline: none;
                }

                .chat-input-field:focus {
                    border-color: #22c55e;
                }

                .btn-chat-send {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #16a34a;
                    color: #ffffff;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .btn-chat-send:hover {
                    background: #15803d;
                }

                .chat-media-btn-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .btn-chat-tool {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px;
                    border-radius: 10px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .btn-chat-tool:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                /* Quick Actions */
                .quick-actions-card {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
                }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .btn-quick-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    border-radius: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #1e293b;
                    font-size: 12.5px;
                    font-weight: 700;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.15s ease;
                }

                .btn-quick-action:hover {
                    background: #f0fdf4;
                    border-color: #86efac;
                    color: #15803d;
                }

                /* Promo Card */
                .grow-smarter-card {
                    background: linear-gradient(135deg, #14532d 0%, #166534 100%);
                    border-radius: 20px;
                    padding: 22px;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    cursor: pointer;
                    box-shadow: 0 8px 24px -4px rgba(20, 83, 45, 0.3);
                    transition: transform 0.2s ease;
                }

                .grow-smarter-card:hover {
                    transform: translateY(-2px);
                }

                .grow-smarter-text h4 {
                    font-size: 16px;
                    font-weight: 800;
                    margin: 0 0 4px 0;
                }

                .grow-smarter-text p {
                    font-size: 12px;
                    color: #bbf7d0;
                    margin: 0;
                    line-height: 1.4;
                }

                /* ================= TOAST NOTIFICATION POPUP ================= */
                .exp-toast-popup {
                    position: fixed;
                    bottom: 28px;
                    right: 28px;
                    background: #0f172a;
                    color: #ffffff;
                    padding: 16px 22px;
                    border-radius: 16px;
                    box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.35);
                    z-index: 10000;
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    max-width: 380px;
                    animation: expToastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .exp-toast-icon {
                    font-size: 20px;
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .exp-toast-body h5 {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    font-weight: 800;
                    color: #ffffff;
                }

                .exp-toast-body p {
                    margin: 0;
                    font-size: 12px;
                    color: #94a3b8;
                    line-height: 1.45;
                }

                .exp-toast-close {
                    background: none;
                    border: none;
                    color: #64748b;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    margin-left: 4px;
                }

                .exp-toast-close:hover {
                    color: #ffffff;
                }

                @keyframes expToastSlideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @media (max-width: 1200px) {
                    .ai-insights-stats { grid-template-columns: repeat(2, 1fr); }
                    .insights-main-grid { grid-template-columns: 1fr; }
                    .tri-cards-row { grid-template-columns: 1fr; }
                    .top-insights-and-activity-row { grid-template-columns: 1fr; }
                    .seasonal-and-recs-row { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .ai-insights-page { padding: 18px 16px 40px 16px; gap: 16px; }
                    .ai-insights-topbar { flex-direction: column; align-items: stretch; gap: 12px; }
                    .topbar-search-box { max-width: 100%; }
                    .ai-insights-hero { padding: 26px 20px; flex-direction: column; align-items: flex-start; gap: 20px; min-height: auto; }
                    .ai-insights-hero-features { align-items: flex-start; }
                    .ai-insights-stats { grid-template-columns: 1fr; }
                    .ai-insights-filters-row { flex-direction: column; align-items: stretch; }
                    .ai-insights-tabs { overflow-x: auto; }
                    .ai-insights-date-filter { justify-content: center; }
                }
            `}</style>

            {/* ================= 1. TOPBAR ================= */}
            <div className="ai-insights-topbar">
                <div className="topbar-search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search crops, insights, questions..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                                handleSendMessage(e.target.value.trim());
                                e.target.value = "";
                            }
                        }}
                    />
                </div>

                <div className="topbar-user-area">
                    <button
                        className="notif-btn"
                        aria-label="Notifications"
                        onClick={() => showComingSoonToast("Notifications Center")}
                    >
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notif-badge">3</span>
                    </button>

                    <UserProfileMenu variant="topbar" />
                </div>
            </div>

            {/* ================= 2. PREMIUM AI INSIGHTS HERO (300-340px) ================= */}
            <div className="ai-insights-hero">
                <img
                    src="/images/ai_insights_hero_robot.jpg"
                    alt="AgriMind AI Agriculture Telemetry"
                    className="ai-insights-hero-bg"
                />
                <div className="ai-insights-hero-overlay" />

                <div className="ai-insights-hero-content">
                    <span className="ai-insights-hero-eyebrow">{text.eyebrow}</span>
                    <h1 className="ai-insights-hero-title">{text.title}</h1>
                    <h3 className="ai-insights-hero-subtitle">{text.subtitle}</h3>
                    <p className="ai-insights-hero-description">{text.heroDesc}</p>

                    <div className="ai-insights-hero-actions">
                        <button
                            className="btn-ask-ai-primary"
                            onClick={() => {
                                const input = document.querySelector(".chat-input-field");
                                input?.focus();
                            }}
                        >
                            <span>{text.askAiBtn}</span>
                        </button>
                        <button
                            className="btn-watch-demo-secondary"
                            onClick={() => showComingSoonToast("Interactive Demo Video")}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <span>{text.watchDemoBtn}</span>
                            <span className="sub-tag">{text.comingSoonBadge}</span>
                        </button>
                    </div>
                </div>

                <div className="ai-insights-hero-features">
                    <div className="ai-insights-hero-feature">
                        <span className="icon">✨</span> {text.badgeAiAnalysis}
                    </div>
                    <div className="ai-insights-hero-feature">
                        <span className="icon">🛡️</span> {text.badgeRealtime}
                    </div>
                    <div className="ai-insights-hero-feature">
                        <span className="icon">🌱</span> {text.badgePersonalized}
                    </div>
                </div>
            </div>

            {/* ================= 3. SUMMARY STATISTICS ================= */}
            <div className="ai-insights-stats">
                {/* 1. Total Analyses */}
                <div className="ai-insights-stat-card">
                    <div className="kpi-icon-wrap kpi-icon-mint">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                            <path d="M4 21c3-4 6.5-6.5 11-9" />
                        </svg>
                    </div>
                    <div className="kpi-info-col">
                        <span className="kpi-number-val">37</span>
                        <span className="kpi-label-text">{text.totalAnalyses}</span>
                        <span className="kpi-sub-badge">+12% {text.totalAnalysesSub}</span>
                    </div>
                </div>

                {/* 2. Healthy Predictions */}
                <div className="ai-insights-stat-card">
                    <div className="kpi-icon-wrap kpi-icon-green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                    </div>
                    <div className="kpi-info-col">
                        <span className="kpi-number-val">21</span>
                        <span className="kpi-label-text">{text.healthyPreds}</span>
                        <span className="kpi-sub-muted">56.8% {text.healthyPredsSub}</span>
                    </div>
                </div>

                {/* 3. Disease Detections */}
                <div className="ai-insights-stat-card">
                    <div className="kpi-icon-wrap kpi-icon-red">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="22" y1="12" x2="18" y2="12" />
                            <line x1="6" y1="12" x2="2" y2="12" />
                            <line x1="12" y1="6" x2="12" y2="2" />
                            <line x1="12" y1="22" x2="12" y2="18" />
                        </svg>
                    </div>
                    <div className="kpi-info-col">
                        <span className="kpi-number-val">16</span>
                        <span className="kpi-label-text">{text.diseaseDetections}</span>
                        <span className="kpi-sub-muted">43.2% {text.diseaseDetectionsSub}</span>
                    </div>
                </div>

                {/* 4. Average Confidence */}
                <div className="ai-insights-stat-card">
                    <div className="kpi-icon-wrap kpi-icon-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                        </svg>
                    </div>
                    <div className="kpi-info-col">
                        <span className="kpi-number-val">96.1%</span>
                        <span className="kpi-label-text">{text.avgConfidence}</span>
                        <span className="kpi-sub-muted">{text.avgConfidenceSub}</span>
                    </div>
                </div>
            </div>

            {/* ================= 4. INSIGHT CATEGORIES / FILTERS ================= */}
            <div className="ai-insights-filters-row">
                <div className="ai-insights-tabs">
                    {/* Working Tabs */}
                    <button
                        className={`ai-insights-tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        <span>{text.tabAll}</span>
                    </button>
                    <button
                        className={`ai-insights-tab ${activeTab === "crops" ? "active" : ""}`}
                        onClick={() => setActiveTab("crops")}
                    >
                        <span>{text.tabCrops}</span>
                    </button>
                    <button
                        className={`ai-insights-tab ${activeTab === "disease" ? "active" : ""}`}
                        onClick={() => setActiveTab("disease")}
                    >
                        <span>{text.tabDisease}</span>
                    </button>
                    <button
                        className={`ai-insights-tab ${activeTab === "farming" ? "active" : ""}`}
                        onClick={() => setActiveTab("farming")}
                    >
                        <span>{text.tabFarming}</span>
                    </button>

                    {/* Coming Soon Tabs */}
                    <button
                        className={`ai-insights-tab ai-insights-tab-soon ${activeTab === "yield" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("yield");
                            showComingSoonToast("Yield Predictions Analytics");
                        }}
                    >
                        <span>{text.tabYield}</span>
                        <span className="ai-insights-coming-soon-pill">{text.comingSoonBadge}</span>
                    </button>
                    <button
                        className={`ai-insights-tab ai-insights-tab-soon ${activeTab === "market" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("market");
                            showComingSoonToast("Market Trends & Mandi Prices");
                        }}
                    >
                        <span>{text.tabMarket}</span>
                        <span className="ai-insights-coming-soon-pill">{text.comingSoonBadge}</span>
                    </button>
                </div>

                <button
                    className="ai-insights-date-filter"
                    onClick={() => showComingSoonToast("Custom Date Range Filter")}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{text.time30Days}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            {/* ================= 5. MAIN CONTENT LAYOUT (WORKING + CONTENT) ================= */}
            <div className="insights-main-grid">
                
                {/* LEFT COLUMN: VISUAL CHARTS + INSIGHTS + RECOMMENDATIONS */}
                <div className="insights-left-col">
                    
                    {/* Row 1: Tri-Cards (Crop Health, Disease Risk, Prediction Confidence) */}
                    <div className="tri-cards-row">
                        
                        {/* 1. Crop Health Overview Donut */}
                        <div className="white-panel-card">
                            <div className="panel-header-row" style={{ marginBottom: "14px" }}>
                                <div className="panel-title-group">
                                    <div className="panel-icon-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div className="panel-title-text">
                                        <h3>{text.cropHealthTitle}</h3>
                                        <p>{text.cropHealthSub}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="crop-health-donut-body">
                                <div className="donut-wrap-sm">
                                    <svg width="105" height="105" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                                        <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="12" fill="transparent" />
                                        <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="12" fill="transparent" strokeDasharray="182 238" strokeDashoffset="48" />
                                        <circle cx="50" cy="50" r="38" stroke="#22c55e" strokeWidth="12" fill="transparent" strokeDasharray="135 238" strokeLinecap="round" />
                                    </svg>
                                    <div className="donut-text-center">
                                        <span className="donut-pct-num">56.8%</span>
                                        <span className="donut-pct-label">{text.healthyLabel}</span>
                                    </div>
                                </div>

                                <div className="health-legend-stack">
                                    <div className="legend-row-item">
                                        <span><span className="legend-color-dot dot-green" />{text.healthyLabel}</span>
                                        <strong>21 <span style={{ color: "#94a3b8", fontWeight: 500 }}>56.8%</span></strong>
                                    </div>
                                    <div className="legend-row-item">
                                        <span><span className="legend-color-dot dot-amber" />{text.atRiskLabel}</span>
                                        <strong>8 <span style={{ color: "#94a3b8", fontWeight: 500 }}>21.6%</span></strong>
                                    </div>
                                    <div className="legend-row-item">
                                        <span><span className="legend-color-dot dot-red" />{text.diseasedLabel}</span>
                                        <strong>8 <span style={{ color: "#94a3b8", fontWeight: 500 }}>21.6%</span></strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Disease Risk Analysis */}
                        <div className="white-panel-card">
                            <div className="panel-header-row" style={{ marginBottom: "14px" }}>
                                <div className="panel-title-group">
                                    <div className="panel-icon-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                    </div>
                                    <div className="panel-title-text">
                                        <h3>{text.diseaseRiskTitle}</h3>
                                        <p>{text.diseaseRiskSub}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="disease-risk-list">
                                {diseaseRisks.map((d) => (
                                    <div className="disease-risk-item" key={d.name}>
                                        <div className="disease-name-label">
                                            <span className={`legend-color-dot ${d.dotClass}`} />
                                            <span>{d.name}</span>
                                        </div>
                                        <div className="risk-progress-bar-track">
                                            <div className={`risk-bar-fill ${d.barClass}`} style={{ width: `${d.percentage * 2.2}%` }} />
                                        </div>
                                        <div className="risk-metrics-col">
                                            <strong>{d.count}</strong>
                                            <span style={{ color: "#64748b" }}>{d.percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Prediction Confidence */}
                        <div className="white-panel-card">
                            <div className="panel-header-row" style={{ marginBottom: "14px" }}>
                                <div className="panel-title-group">
                                    <div className="panel-icon-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="m10 15 5-3-5-3v6Z" />
                                        </svg>
                                    </div>
                                    <div className="panel-title-text">
                                        <h3>{text.predictionConfTitle}</h3>
                                        <p>{text.predictionConfSub}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="conf-bars-wrap">
                                <div className="conf-bar-column">
                                    <span className="conf-bar-val">35</span>
                                    <div className="conf-bar-pillar pillar-high" />
                                    <span className="conf-bar-tag">High</span>
                                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>&gt;80%</span>
                                </div>
                                <div className="conf-bar-column">
                                    <span className="conf-bar-val">12</span>
                                    <div className="conf-bar-pillar pillar-med" />
                                    <span className="conf-bar-tag">Medium</span>
                                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>60–80%</span>
                                </div>
                                <div className="conf-bar-column">
                                    <span className="conf-bar-val">3</span>
                                    <div className="conf-bar-pillar pillar-low" />
                                    <span className="conf-bar-tag">Low</span>
                                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>&lt;60%</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Row 2: Top AI Insights (3 cards) & Recent Activity */}
                    <div className="top-insights-and-activity-row">
                        
                        {/* Top AI Insights */}
                        <div className="white-panel-card">
                            <div className="panel-header-row">
                                <div className="panel-title-group">
                                    <div className="panel-icon-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </div>
                                    <div className="panel-title-text">
                                        <h3>{text.topAiInsights}</h3>
                                        <p>{text.topAiInsightsSub}</p>
                                    </div>
                                </div>
                                <button className="view-link-btn" onClick={() => navigate("/analytics")}>{text.viewAllBtn}</button>
                            </div>

                            <div className="insight-cards-subgrid">
                                {/* Card 1: Positive */}
                                <div className="priority-insight-card">
                                    <div>
                                        <div className="card-header-badge-row">
                                            <span style={{ fontSize: "16px" }}>🌱</span>
                                            <span className="insight-type-badge badge-positive">Positive</span>
                                        </div>
                                        <h4>Crop Health is Good</h4>
                                        <p>Your soybean crops are showing healthy growth with 87% health score.</p>
                                    </div>
                                    <button className="btn-card-action-sub action-green" onClick={() => navigate("/management")}>View Details →</button>
                                </div>

                                {/* Card 2: Attention */}
                                <div className="priority-insight-card">
                                    <div>
                                        <div className="card-header-badge-row">
                                            <span style={{ fontSize: "16px" }}>⚠️</span>
                                            <span className="insight-type-badge badge-attention">Attention</span>
                                        </div>
                                        <h4>Monitor Bacterial Blight</h4>
                                        <p>Detected 13 times. Check your crops for early signs and apply preventive measures.</p>
                                    </div>
                                    <button className="btn-card-action-sub action-red" onClick={() => navigate("/disease-detection")}>Take Action →</button>
                                </div>

                                {/* Card 3: Opportunity */}
                                <div className="priority-insight-card">
                                    <div>
                                        <div className="card-header-badge-row">
                                            <span style={{ fontSize: "16px" }}>📊</span>
                                            <span className="insight-type-badge badge-opportunity">Opportunity</span>
                                        </div>
                                        <h4>High Yield Potential</h4>
                                        <p>Based on current conditions, your expected yield is 15-20% above average this season.</p>
                                    </div>
                                    <button className="btn-card-action-sub action-blue" onClick={() => navigate("/analytics")}>View Forecast →</button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="white-panel-card">
                            <div className="panel-header-row">
                                <div className="panel-title-group">
                                    <div className="panel-icon-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="12 8 12 12 14 14" />
                                            <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
                                        </svg>
                                    </div>
                                    <div className="panel-title-text">
                                        <h3>{text.recentActivityTitle}</h3>
                                    </div>
                                </div>
                                <button className="view-link-btn" onClick={() => navigate("/history")}>{text.viewHistoryBtn}</button>
                            </div>

                            <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-icon-sq act-green">🌱</div>
                                    <div className="activity-details">
                                        <span className="activity-title">Healthy crop detected</span>
                                        <span className="activity-meta">Soybean • 2 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon-sq act-red">⚠️</div>
                                    <div className="activity-details">
                                        <span className="activity-title">Bacterial Blight detected</span>
                                        <span className="activity-meta">Cotton • 5 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon-sq act-blue">📊</div>
                                    <div className="activity-details">
                                        <span className="activity-title">Yield prediction updated</span>
                                        <span className="activity-meta">Maize • 1 day ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon-sq act-amber">☀️</div>
                                    <div className="activity-details">
                                        <span className="activity-title">Weather alert</span>
                                        <span className="activity-meta">Moderate rain expected • 1 day ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Row 3: Seasonal Insights & Smart Farming Recommendations */}
                    <div className="seasonal-and-recs-row">
                        
                        {/* Seasonal Insights */}
                        <div className="white-panel-card">
                            <div className="panel-header-row">
                                <div className="panel-title-group">
                                    <div className="panel-icon-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                        </svg>
                                    </div>
                                    <div className="panel-title-text">
                                        <h3>{text.seasonalInsightsTitle}</h3>
                                        <p>{text.seasonalInsightsSub}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="seasonal-cards-stack">
                                <div
                                    className="seasonal-subcard"
                                    onClick={() => showComingSoonToast("Kharif Seasonal Agronomy Guide")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div className="season-icon-sm">🌱</div>
                                        <div className="season-text-col">
                                            <h5>Kharif Season</h5>
                                            <span>Current Season • Optimal for Soybean, Maize</span>
                                        </div>
                                    </div>
                                    <span className="ai-insights-coming-soon-pill">{text.comingSoonBadge}</span>
                                </div>
                                <div
                                    className="seasonal-subcard"
                                    onClick={() => showComingSoonToast("Rabi Preparation Guide")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div className="season-icon-sm">🌾</div>
                                        <div className="season-text-col">
                                            <h5>Rabi Season</h5>
                                            <span>Upcoming Season • Suitable for Wheat, Chickpea</span>
                                        </div>
                                    </div>
                                    <span className="ai-insights-coming-soon-pill">{text.comingSoonBadge}</span>
                                </div>
                                <div
                                    className="seasonal-subcard"
                                    onClick={() => navigate("/weather")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div className="season-icon-sm">🌧️</div>
                                        <div className="season-text-col">
                                            <h5>Weather Outlook</h5>
                                            <span>Next 7 Days • Moderate rain expected, good for soil</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>Open →</span>
                                </div>
                            </div>
                        </div>

                        {/* Smart Recommendations */}
                        <div className="white-panel-card">
                            <div className="panel-header-row">
                                <div className="panel-title-group">
                                    <div className="panel-icon-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                        </svg>
                                    </div>
                                    <div className="panel-title-text">
                                        <h3>{text.smartRecommendationsTitle}</h3>
                                        <p>{text.smartRecommendationsSub}</p>
                                    </div>
                                </div>
                                <button className="view-link-btn" onClick={() => navigate("/disease-detection")}>{text.viewAllBtn}</button>
                            </div>

                            <div className="recs-list">
                                {/* Item 1 */}
                                <div className="rec-item">
                                    <div className="rec-left-info">
                                        <div className="rec-icon-wrap">🛡️</div>
                                        <div className="rec-text-wrap">
                                            <h5>Apply organic fungicides</h5>
                                            <p>Reduce risk of fungal diseases in soybean crops.</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-rec-action btn-rec-primary"
                                        onClick={() => setAppliedReminders((p) => ({ ...p, 1: true }))}
                                    >
                                        {appliedReminders[1] ? "Applied ✓" : text.applyBtn}
                                    </button>
                                </div>

                                {/* Item 2 */}
                                <div className="rec-item">
                                    <div className="rec-left-info">
                                        <div className="rec-icon-wrap">🌱</div>
                                        <div className="rec-text-wrap">
                                            <h5>Maintain proper spacing</h5>
                                            <p>Ensure adequate plant spacing for better air circulation.</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-rec-action btn-rec-secondary"
                                        onClick={() => navigate("/management")}
                                    >
                                        {text.readMoreBtn}
                                    </button>
                                </div>

                                {/* Item 3 */}
                                <div className="rec-item">
                                    <div className="rec-left-info">
                                        <div className="rec-icon-wrap">💧</div>
                                        <div className="rec-text-wrap">
                                            <h5>Monitor soil moisture</h5>
                                            <p>Keep soil moisture optimal for healthy crop growth.</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-rec-action btn-rec-secondary"
                                        onClick={() => setAppliedReminders((p) => ({ ...p, 3: true }))}
                                    >
                                        {appliedReminders[3] ? "Set ✓" : text.setReminderBtn}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* RIGHT COLUMN: AI CHAT ASSISTANT + QUICK ACTIONS + PROMO */}
                <div className="insights-right-col">
                    
                    {/* Chatbot Assistant */}
                    <div className="ai-chat-assistant-card">
                        <div className="assistant-header">
                            <img src="/images/ai_robot_avatar.jpg" alt="AgriMind Assistant" className="assistant-avatar-img" />
                            <div className="assistant-status-col">
                                <h4>{text.assistantTitle}</h4>
                                <span>● {text.assistantStatus}</span>
                            </div>
                        </div>

                        <div className="chat-scroll-area">
                            {/* Greeting */}
                            <div className="chat-bubble bubble-ai">
                                <strong>👋 {text.chatGreeting}</strong>
                                <p style={{ margin: "4px 0 0 0" }}>{text.chatGreetingSub}</p>
                            </div>

                            {/* Suggestions when no user messages */}
                            {messages.length === 0 && (
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>{text.chatSuggestionsTitle}</span>
                                    <div className="chat-prompts-list">
                                        <button
                                            className="prompt-suggestion-btn"
                                            onClick={() => handleSendMessage("Why are my soybean leaves yellow?")}
                                        >
                                            <span>🌿</span> Why are my soybean leaves yellow?
                                        </button>
                                        <button
                                            className="prompt-suggestion-btn"
                                            onClick={() => handleSendMessage("How can I increase crop yield?")}
                                        >
                                            <span>📈</span> How can I increase crop yield?
                                        </button>
                                        <button
                                            className="prompt-suggestion-btn"
                                            onClick={() => handleSendMessage("What is the best time to sow cotton?")}
                                        >
                                            <span>☁️</span> Best time to sow cotton?
                                        </button>
                                        <button
                                            className="prompt-suggestion-btn"
                                            onClick={() => handleSendMessage("Show disease prevention tips")}
                                        >
                                            <span>🛡️</span> Show disease prevention tips
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Message History */}
                            {messages.map((m, idx) => (
                                <div
                                    key={idx}
                                    className={`chat-bubble ${m.sender === "user" ? "bubble-user" : "bubble-ai"}`}
                                >
                                    {m.text}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="chat-bubble bubble-ai" style={{ fontStyle: "italic", color: "#16a34a" }}>
                                    AgriMind AI is thinking...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Row */}
                        <form
                            className="chat-input-row"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                        >
                            <input
                                type="text"
                                className="chat-input-field"
                                placeholder={text.chatInputPlaceholder}
                                value={inputQuestion}
                                onChange={(e) => setInputQuestion(e.target.value)}
                            />
                            <button type="submit" className="btn-chat-send" title="Send message">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </form>

                        {/* Upload / Voice tools */}
                        <div className="chat-media-btn-row">
                            <button
                                className="btn-chat-tool"
                                onClick={() => navigate("/disease-detection")}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                                <span>{text.uploadImageBtn}</span>
                            </button>
                            <button
                                className="btn-chat-tool"
                                onClick={() => showComingSoonToast("Voice Input Assistant")}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="22" />
                                </svg>
                                <span>{text.voiceBtn}</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions-card">
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{text.quickActionsTitle}</span>
                        <div className="quick-actions-grid">
                            <button className="btn-quick-action" onClick={() => navigate("/disease-detection")}>
                                <span>📷</span> {text.actionAnalyze}
                            </button>
                            <button className="btn-quick-action" onClick={() => navigate("/analytics")}>
                                <span>✨</span> {text.actionRecommendations}
                            </button>
                            <button className="btn-quick-action" onClick={() => navigate("/disease-detection")}>
                                <span>🛡️</span> {text.actionPrevention}
                            </button>
                            <button className="btn-quick-action" onClick={() => navigate("/management")}>
                                <span>📅</span> {text.actionCalendar}
                            </button>
                        </div>
                    </div>

                    {/* Promo Banner Card */}
                    <div
                        className="grow-smarter-card"
                        onClick={() => navigate("/disease-detection")}
                    >
                        <div className="grow-smarter-text">
                            <h4>{text.growSmarterTitle}</h4>
                            <p>{text.growSmarterSub}</p>
                        </div>
                        <span style={{ fontSize: "32px" }}>🌿</span>
                    </div>

                </div>

            </div>

            {/* ================= TOAST NOTIFICATION POPUP ================= */}
            {toastMessage && (
                <div className="exp-toast-popup">
                    <div className="exp-toast-icon">✨</div>
                    <div className="exp-toast-body">
                        <h5>{toastMessage.title}</h5>
                        <p>{toastMessage.desc}</p>
                    </div>
                    <button className="exp-toast-close" onClick={() => setToastMessage(null)}>✕</button>
                </div>
            )}
        </div>
    );
}
