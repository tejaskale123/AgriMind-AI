import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import UserProfileMenu from "../components/UserProfileMenu";

export default function CropManagement() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // =========================================================
    // MULTILINGUAL DICTIONARY
    // =========================================================
    const ui = {
        en: {
            searchPlaceholder: "Search crops, tasks, or guidance...",
            eyebrow: "AGRIMIND AI • CROP MANAGEMENT",
            title: "Smart Crop Management",
            subtitle: "Manage your crops, monitor activities, and keep your farm organized with AgriMind AI.",
            sloganTop: "Healthy Crops",
            sloganSub: "Prosperous Farmers",
            sloganQuote: "“Smarter Farming Brighter Tomorrows”",
            feature1Title: "Smart Planning",
            feature1Desc: "Plan your farming activities",
            feature2Title: "Growth Monitoring",
            feature2Desc: "Track crop health & progress",
            feature3Title: "AI Recommendations",
            feature3Desc: "Get personalized guidance",
            feature4Title: "Better Yield",
            feature4Desc: "Increase productivity",
            statTotal: "Total Crops",
            statTotalSub: "In your farm profile",
            statActive: "Active Crops",
            statActiveSub: "Currently growing",
            statTasks: "Upcoming Tasks",
            statTasksSub: "This week",
            statHealth: "Avg. Plant Health",
            statHealthSub: "Across all active crops",
            tabMyCrops: "My Crops",
            tabActive: "Active",
            tabComingSoon: "Coming Soon",
            tabAll: "All Crops",
            addCropBtn: "+ Add Crop",
            plantHealthLabel: "Plant Health",
            viewDetailsBtn: "View Details",
            manageBtn: "Manage →",
            notifyMeBtn: "Notify Me",
            notifiedBtn: "Subscribed ✓",
            activeBadge: "Active",
            comingSoonBadge: "Coming Soon",
            bannerHeading: "Manage Your Crops",
            bannerSubheading: "Grow a Better Tomorrow",
            benefit1: "Track growth stages",
            benefit2: "Get AI-powered recommendations",
            benefit3: "Increase your farm productivity",
            seasonKharif: "Kharif Season",
            seasonRabi: "Rabi Season",
            sowingLabel: "Sowing:",
            harvestLabel: "Harvest:",
            modalTitle: "Add New Crop",
            modalCropName: "Crop Name",
            modalSeason: "Season",
            modalSowing: "Sowing Period",
            modalHarvest: "Harvest Period",
            modalSubmit: "Add Crop to Farm",
            modalCancel: "Cancel",
            noResultsTitle: "No matching crops or guidance found",
            noResultsSub: "Try searching by crop name (e.g. Soybean, Cotton), season, task, or clear your search.",
            clearSearchBtn: "Clear Search"
        },
        mr: {
            searchPlaceholder: "पिके, कामे किंवा मार्गदर्शन शोधा...",
            eyebrow: "AGRIMIND AI • पीक व्यवस्थापन",
            title: "स्मार्ट पीक व्यवस्थापन",
            subtitle: "आपल्या पिकांचे व्यवस्थापन करा, क्रियाकलापांचे निरीक्षण करा आणि AgriMind AI सह आपले शेत सुव्यवस्थित ठेवा.",
            sloganTop: "निरोगी पिके",
            sloganSub: "समृद्ध शेतकरी",
            sloganQuote: "“स्मार्ट शेती, उज्ज्वल भविष्य”",
            feature1Title: "स्मार्ट नियोजन",
            feature1Desc: "शेतीच्या कामांचे नियोजन करा",
            feature2Title: "वाढीचे निरीक्षण",
            feature2Desc: "पिकांचे आरोग्य व प्रगती तपासा",
            feature3Title: "AI शिफारसी",
            feature3Desc: "वैयक्तिक मार्गदर्शन मिळवा",
            feature4Title: "उत्तम उत्पादन",
            feature4Desc: "उत्पादकता वाढवा",
            statTotal: "एकूण पिके",
            statTotalSub: "तुमच्या शेतात नोंदवलेली",
            statActive: "सक्रिय पिके",
            statActiveSub: "सध्या शेतात वाढणारी",
            statTasks: "आगामी कामे",
            statTasksSub: "या आठवड्यात",
            statHealth: "सरासरी पीक आरोग्य",
            statHealthSub: "सर्व सक्रिय पिकांचे",
            tabMyCrops: "माझी पिके",
            tabActive: "सक्रिय",
            tabComingSoon: "लवकरच येत आहे",
            tabAll: "सर्व पिके",
            addCropBtn: "+ नवीन पीक जोडा",
            plantHealthLabel: "पीक आरोग्य",
            viewDetailsBtn: "तपशील पहा",
            manageBtn: "व्यवस्थापन करा →",
            notifyMeBtn: "सूचना द्या",
            notifiedBtn: "नोंद झाली ✓",
            activeBadge: "सक्रिय",
            comingSoonBadge: "लवकरच येत आहे",
            bannerHeading: "आपल्या पिकांचे व्यवस्थापन करा",
            bannerSubheading: "उद्याच्या समृद्धीसाठी",
            benefit1: "पिकांच्या वाढीच्या टप्प्यांचा मागोवा घ्या",
            benefit2: "AI-सक्षम शिफारसी मिळवा",
            benefit3: "तुमच्या शेताची उत्पादकता वाढवा",
            seasonKharif: "खरीप हंगाम",
            seasonRabi: "रब्बी हंगाम",
            sowingLabel: "पेरणी:",
            harvestLabel: "कापणी:",
            modalTitle: "नवीन पीक जोडा",
            modalCropName: "पिकाचे नाव",
            modalSeason: "हंगाम",
            modalSowing: "पेरणीचा काळ",
            modalHarvest: "कापणीचा काळ",
            modalSubmit: "पीक जोडा",
            modalCancel: "रद्द करा",
            noResultsTitle: "कोणतेही जुळणारे पीक किंवा मार्गदर्शन आढळले नाही",
            noResultsSub: "पिकाचे नाव (उदा. सोयाबीन, कापूस), हंगाम किंवा कामांनुसार शोधा किंवा शोध साफ करा.",
            clearSearchBtn: "शोध साफ करा"
        },
        hi: {
            searchPlaceholder: "फसलें, कार्य या मार्गदर्शन खोजें...",
            eyebrow: "AGRIMIND AI • फसल प्रबंधन",
            title: "स्मार्ट फसल प्रबंधन",
            subtitle: "अपनी फसलों का प्रबंधन करें, गतिविधियों की निगरानी करें और AgriMind AI के साथ अपने खेत को व्यवस्थित रखें।",
            sloganTop: "स्वस्थ फसलें",
            sloganSub: "समृद्ध किसान",
            sloganQuote: "“स्मार्ट खेती, उज्ज्वल कल”",
            feature1Title: "स्मार्ट योजना",
            feature1Desc: "खेती की गतिविधियों की योजना बनाएं",
            feature2Title: "विकास निगरानी",
            feature2Desc: "फसल स्वास्थ्य और प्रगति ट्रैक करें",
            feature3Title: "AI सिफारिशें",
            feature3Desc: "व्यक्तिगत मार्गदर्शन प्राप्त करें",
            feature4Title: "बेहतर उपज",
            feature4Desc: "उत्पादकता में वृद्धि करें",
            statTotal: "कुल फसलें",
            statTotalSub: "आपके खेत प्रोफ़ाइल में",
            statActive: "सक्रिय फसलें",
            statActiveSub: "वर्तमान में उगाई जा रही",
            statTasks: "आगामी कार्य",
            statTasksSub: "इस सप्ताह",
            statHealth: "औसत पौधा स्वास्थ्य",
            statHealthSub: "सभी सक्रिय फसलों का",
            tabMyCrops: "मेरी फसलें",
            tabActive: "सक्रिय",
            tabComingSoon: "जल्द आ रहा है",
            tabAll: "सभी फसलें",
            addCropBtn: "+ फसल जोड़ें",
            plantHealthLabel: "पौधा स्वास्थ्य",
            viewDetailsBtn: "विवरण देखें",
            manageBtn: "प्रबंधन करें →",
            notifyMeBtn: "मुझे सूचित करें",
            notifiedBtn: "दर्ज हुआ ✓",
            activeBadge: "सक्रिय",
            comingSoonBadge: "जल्द आ रहा है",
            bannerHeading: "अपनी फसलों का प्रबंधन करें",
            bannerSubheading: "एक बेहतर कल के लिए",
            benefit1: "विकास चरणों को ट्रैक करें",
            benefit2: "AI-संचालित सिफारिशें प्राप्त करें",
            benefit3: "अपनी खेत उत्पादकता बढ़ाएं",
            seasonKharif: "खरीफ मौसम",
            seasonRabi: "रबी मौसम",
            sowingLabel: "बुवाई:",
            harvestLabel: "कटाई:",
            modalTitle: "नई फसल जोड़ें",
            modalCropName: "फसल का नाम",
            modalSeason: "मौसम",
            modalSowing: "बुवाई अवधि",
            modalHarvest: "कटाई अवधि",
            modalSubmit: "खेत में जोड़ें",
            modalCancel: "रद्द करें",
            noResultsTitle: "कोई मेल खाने वाली फसल या मार्गदर्शन नहीं मिला",
            noResultsSub: "फसल के नाम (उदा. सोयाबीन, कपास), मौसम, कार्य से खोजें या सर्च साफ़ करें।",
            clearSearchBtn: "सर्च साफ़ करें"
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

    // Filter and View State
    const [activeTab, setActiveTab] = useState("myCrops"); // "myCrops" | "active" | "comingSoon" | "all"
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
    const [searchQuery, setSearchQuery] = useState("");
    const [notifiedCrops, setNotifiedCrops] = useState({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetailCrop, setSelectedDetailCrop] = useState(null);

    // Canonical Crop Management Data
    const [crops, setCrops] = useState([
        {
            id: "soybean",
            name: "Soybean",
            season: "Kharif Season",
            sowing: "Jun - Jul",
            harvest: "Oct - Nov",
            health: 87,
            status: "active",
            image: "/images/crop_soybean.jpg",
            category: "Pulse Crop",
            description: "High-protein legume crop requiring balanced nitrogen fixation and timely leaf blight monitoring.",
            tasks: ["Bacterial blight foliar inspection", "Post-emergence weed management", "Soil moisture check"],
            guidance: "Monitor leaf undersides for lesions. Maintain optimal row spacing of 45cm and avoid waterlogging."
        },
        {
            id: "cotton",
            name: "Cotton",
            season: "Kharif Season",
            sowing: "Jun - Jul",
            harvest: "Nov - Dec",
            health: 82,
            status: "active",
            image: "/images/crop_cotton.jpg",
            category: "Fiber Crop",
            description: "Fiber cash crop susceptible to boll rot and alternaria leaf spot during late humid stages.",
            tasks: ["Boll rot scouting", "Pest monitoring for sucking pests", "Potassium application"],
            guidance: "Maintain 90x60cm spacing and apply preventive bio-fungicide sprays during high humidity."
        },
        {
            id: "maize",
            name: "Maize",
            season: "Kharif Season",
            sowing: "Jun - Jul",
            harvest: "Sep - Oct",
            health: 78,
            status: "active",
            image: "/images/crop_maize.jpg",
            category: "Cereal Crop",
            description: "Fast-growing grain crop needing adequate moisture during tassel formation and rust prevention.",
            tasks: ["Tassel formation monitoring", "Common rust scouting", "Top-dressing nitrogen"],
            guidance: "Ensure uniform irrigation during silking and tassel stage. Apply organic mulch to conserve moisture."
        },
        {
            id: "wheat",
            name: "Wheat",
            season: "Rabi Season",
            sowing: "Nov - Dec",
            harvest: "Mar - Apr",
            health: 91,
            status: "active",
            image: "/images/crop_wheat.jpg",
            category: "Cereal Crop",
            description: "Staple winter cereal with high rust resistance and optimal tiller development under cool climates.",
            tasks: ["Crown root initiation watering", "Stripe rust inspection", "Micronutrient spray"],
            guidance: "Irrigate at CRI stage (21 days after sowing). Keep fields weed-free during early vegetative period."
        },
        {
            id: "tomato",
            name: "Tomato",
            season: "Rabi Season",
            sowing: "Oct - Nov",
            harvest: "Jan - Mar",
            health: null,
            status: "comingSoon",
            image: "/images/crop_tomato.jpg",
            category: "Vegetable Crop",
            description: "High-yield vegetable in AI model training pipeline. Disease detection models releasing soon.",
            tasks: ["Early blight prevention schedule", "Staking & pruning", "Drip fertigation setup"],
            guidance: "Tomato AI leaf diagnostics and automated blight classification releasing in upcoming update."
        },
        {
            id: "tur",
            name: "Tur (Pigeon Pea)",
            season: "Kharif Season",
            sowing: "Jun - Jul",
            harvest: "Dec - Jan",
            health: 95,
            status: "active",
            image: "/images/crop_tur.jpg",
            category: "Pulse Crop",
            description: "AI-powered disease detection for Tur (Pigeon Pea) leaves.",
            tasks: ["Leaf spot surveillance", "Micronutrient spray", "Pest monitoring"],
            guidance: "Monitor for leaf spot and webber. Ensure proper drainage during monsoon."
        }
    ]);

    // New crop form state
    const [newCropForm, setNewCropForm] = useState({
        name: "",
        season: "Kharif Season",
        sowing: "Jun - Jul",
        harvest: "Oct - Nov",
        health: 85
    });

    const handleAddCropSubmit = (e) => {
        e.preventDefault();
        if (!newCropForm.name.trim()) return;

        const newId = newCropForm.name.toLowerCase().replace(/\s+/g, "_");
        const addedCrop = {
            id: newId,
            name: newCropForm.name,
            season: newCropForm.season,
            sowing: newCropForm.sowing,
            harvest: newCropForm.harvest,
            health: Number(newCropForm.health) || 85,
            status: "active",
            image: "/images/crop_soybean.jpg",
            category: "Field Crop",
            description: "User registered field crop active in farm monitoring schedule.",
            tasks: ["Weekly field scouting", "Moisture check", "Nutrient management"],
            guidance: "Follow regional university advisory for balanced NPK fertilization and disease prevention."
        };

        setCrops((prev) => [addedCrop, ...prev]);
        setIsAddModalOpen(false);
        setNewCropForm({
            name: "",
            season: "Kharif Season",
            sowing: "Jun - Jul",
            harvest: "Oct - Nov",
            health: 85
        });
    };

    // Robust Search & Filter Logic
    const trimmedQuery = searchQuery.trim().toLowerCase();

    const filteredCrops = crops.filter((crop) => {
        let matchesSearch = true;
        if (trimmedQuery) {
            const cropName = (crop.name || "").toLowerCase();
            const cropSeason = (crop.season || "").toLowerCase();
            const cropCategory = (crop.category || "").toLowerCase();
            const cropDesc = (crop.description || "").toLowerCase();
            const cropGuidance = (crop.guidance || "").toLowerCase();
            const cropTasks = Array.isArray(crop.tasks) ? crop.tasks.join(" ").toLowerCase() : "";
            const cropStatus = (crop.status === "comingSoon" ? "coming soon upcoming rabi kharif future" : "active growing").toLowerCase();
            const cropTimelines = `${crop.sowing || ""} ${crop.harvest || ""}`.toLowerCase();

            const isGeneralTaskQuery = ["task", "tasks", "activity", "activities", "schedule", "work"].some((k) => trimmedQuery.includes(k));
            const isGeneralGuidanceQuery = ["guidance", "recommendation", "recommendations", "tip", "tips", "advice", "care", "plan", "planning", "management"].some((k) => trimmedQuery.includes(k));
            const isGeneralHealthQuery = ["health", "plant health", "healthy", "growth"].some((k) => trimmedQuery.includes(k));

            const directMatch =
                cropName.includes(trimmedQuery) ||
                cropSeason.includes(trimmedQuery) ||
                cropCategory.includes(trimmedQuery) ||
                cropDesc.includes(trimmedQuery) ||
                cropGuidance.includes(trimmedQuery) ||
                cropTasks.includes(trimmedQuery) ||
                cropStatus.includes(trimmedQuery) ||
                cropTimelines.includes(trimmedQuery);

            matchesSearch = directMatch || isGeneralTaskQuery || isGeneralGuidanceQuery || isGeneralHealthQuery;
        }

        if (!matchesSearch) return false;

        // Tab Filter Logic
        if (activeTab === "active") {
            return crop.status === "active";
        }
        if (activeTab === "comingSoon") {
            return crop.status === "comingSoon";
        }
        return true; // "all" and "myCrops"
    });

    // Dynamic Statistics
    const totalCount = crops.length;
    const activeCount = crops.filter((c) => c.status === "active").length;
    const comingSoonCount = crops.filter((c) => c.status === "comingSoon").length;
    const activeCrops = crops.filter((c) => c.status === "active" && c.health !== null);
    const avgHealth =
        activeCrops.length > 0
            ? Math.round(activeCrops.reduce((acc, c) => acc + c.health, 0) / activeCrops.length)
            : 85;

    // Actions
    const handleManage = (crop) => {
        sessionStorage.setItem("selectedCrop", crop.id);
        navigate("/detection", { state: { crop: crop.id } });
    };

    const handleToggleNotify = (id) => {
        setNotifiedCrops((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const promoBanner = (
        <div className="management-promo-banner">
            <img
                src="/images/crop_management_sprout.jpg"
                alt="Sprout Seedling"
                className="banner-sprout-art"
            />
            <div className="banner-text-content">
                <h3>{text.bannerHeading}</h3>
                <div className="banner-subhead">{text.bannerSubheading}</div>
                <div className="banner-checklist">
                    <div className="banner-check-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{text.benefit1}</span>
                    </div>
                    <div className="banner-check-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{text.benefit2}</span>
                    </div>
                    <div className="banner-check-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{text.benefit3}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="exp-crop-management-page">
            <style>{`
                /* =========================================================
                   CROP MANAGEMENT PAGE - PREMIUM AG-TECH STYLING
                ========================================================= */
                .exp-crop-management-page {
                    width: 100%;
                    min-height: 100%;
                    background: #f4fbf7;
                    padding: 24px 36px 60px 36px;
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    box-sizing: border-box;
                }

                /* Top Navigation / Search Header */
                .management-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 2px;
                }

                .cm-search-box {
                    flex: 1;
                    max-width: 480px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .cm-search-icon {
                    position: absolute;
                    left: 18px;
                    color: #64748b;
                    pointer-events: none;
                }

                .cm-search-input {
                    width: 100%;
                    height: 48px;
                    padding: 0 42px 0 50px;
                    background: #ffffff;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 9999px;
                    font-size: 14px;
                    color: #1e293b;
                    font-weight: 500;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .cm-search-input:focus {
                    border-color: #16a34a;
                    box-shadow: 0 0 0 3.5px rgba(22, 163, 74, 0.15);
                }

                .cm-search-input::placeholder {
                    color: #94a3b8;
                }

                .cm-search-clear {
                    position: absolute;
                    right: 14px;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    border: none;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.15s ease;
                }

                .cm-search-clear:hover {
                    background: #e2e8f0;
                    color: #0f172a;
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

                /* ================= PREMIUM HERO BANNER ================= */
                .cm-hero {
                    position: relative;
                    border-radius: 22px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    padding: 30px 38px 24px 38px;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    box-shadow: 0 14px 35px -8px rgba(13, 38, 19, 0.22);
                    gap: 22px;
                    min-height: 220px;
                }

                .cm-hero-image {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center 35%;
                    z-index: 1;
                }

                .cm-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(8, 28, 14, 0.88) 0%, rgba(13, 56, 30, 0.76) 50%, rgba(6, 78, 59, 0.62) 100%);
                    backdrop-filter: blur(1.5px);
                    z-index: 2;
                }

                .cm-hero-content {
                    position: relative;
                    z-index: 3;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .cm-hero-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                }

                .cm-hero-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .cm-hero-badge-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 18px;
                    background: rgba(255, 255, 255, 0.18);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4ade80;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.35);
                    flex-shrink: 0;
                }

                .cm-hero-titles {
                    display: flex;
                    flex-direction: column;
                }

                .cm-hero-eyebrow {
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    color: #86efac;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }

                .cm-hero-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                    margin: 0;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }

                .cm-hero-description {
                    font-size: 14.5px;
                    font-weight: 500;
                    color: #d1fae5;
                    margin: 6px 0 0 0;
                    max-width: 620px;
                    line-height: 1.45;
                }

                .cm-hero-slogan-card {
                    background: rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(14px);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    border-radius: 16px;
                    padding: 12px 20px;
                    text-align: right;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }

                .cm-slogan-title {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 16px;
                    font-weight: 800;
                    color: #ffffff;
                    line-height: 1.25;
                }

                .cm-slogan-quote {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #86efac;
                    font-style: italic;
                    margin-top: 4px;
                }

                /* 4 Feature Highlights inside Hero */
                .cm-hero-features {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 14px;
                }

                .cm-feature-capsule {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(14px);
                    border: 1px solid rgba(255, 255, 255, 0.28);
                    border-radius: 14px;
                    padding: 10px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: transform 0.2s ease, background 0.2s ease;
                }

                .cm-feature-capsule:hover {
                    background: rgba(255, 255, 255, 0.22);
                    transform: translateY(-2px);
                }

                .cm-feature-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.2);
                    color: #86efac;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .cm-feature-text {
                    display: flex;
                    flex-direction: column;
                }

                .cm-feature-name {
                    font-size: 13px;
                    font-weight: 800;
                    color: #ffffff;
                    line-height: 1.2;
                }

                .cm-feature-sub {
                    font-size: 11px;
                    color: #d1fae5;
                    font-weight: 500;
                }

                /* ================= 4 STATISTICS CARDS ================= */
                .crop-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 18px;
                }

                .stat-card {
                    background: #ffffff;
                    border-radius: 18px;
                    border: 1px solid #e2e8f0;
                    padding: 22px 24px;
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.03);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.06);
                }

                .stat-icon-wrap {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .stat-icon-green { background: #eefbf3; color: #16a34a; }
                .stat-icon-mint { background: #f0fdf4; color: #15803d; }
                .stat-icon-amber { background: #fffbeb; color: #d97706; }
                .stat-icon-blue { background: #eff6ff; color: #2563eb; }

                .stat-info-group {
                    display: flex;
                    flex-direction: column;
                }

                .stat-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 2px;
                }

                .stat-value {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.15;
                }

                .stat-subtext {
                    font-size: 11.5px;
                    color: #94a3b8;
                    margin-top: 4px;
                    font-weight: 500;
                }

                /* ================= CONTROLS ROW ================= */
                .crop-controls-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .filter-tabs-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #ffffff;
                    padding: 6px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
                }

                .filter-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .filter-tab-btn:hover {
                    color: #16a34a;
                    background: #f8fafc;
                }

                .filter-tab-btn.active {
                    background: #16a34a;
                    color: #ffffff;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
                }

                .right-controls-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-add-crop {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #14532d;
                    color: #ffffff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-size: 13.5px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 14px rgba(20, 83, 45, 0.25);
                }

                .btn-add-crop:hover {
                    background: #166534;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(20, 83, 45, 0.35);
                }

                .view-toggle-wrap {
                    display: flex;
                    align-items: center;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 4px;
                    gap: 4px;
                }

                .view-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .view-btn:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }

                .view-btn.active {
                    background: #f0fdf4;
                    color: #16a34a;
                }

                /* ================= CROPS GRID & CARDS ================= */
                .crops-display-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }

                .crop-management-card {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .crop-management-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 28px -4px rgba(0, 0, 0, 0.08);
                }

                .card-photo-wrapper {
                    position: relative;
                    width: 100%;
                    height: 160px;
                    background: #f1f5f9;
                    overflow: hidden;
                }

                .card-photo-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .crop-management-card:hover .card-photo-wrapper img {
                    transform: scale(1.04);
                }

                .status-badge-floating {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 12px;
                    border-radius: 9999px;
                    font-size: 11.5px;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    backdrop-filter: blur(8px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
                }

                .badge-active {
                    background: rgba(22, 163, 74, 0.92);
                    color: #ffffff;
                }

                .badge-coming {
                    background: rgba(37, 99, 235, 0.9);
                    color: #ffffff;
                }

                .card-details-body {
                    padding: 18px 20px 20px 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    flex: 1;
                    gap: 16px;
                }

                .crop-header-titles h3 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .crop-season-tag {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #64748b;
                }

                .timeline-specs-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #f1f5f9;
                }

                .timeline-spec-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                }

                .timeline-spec-item svg {
                    color: #16a34a;
                    flex-shrink: 0;
                }

                .health-progress-group {
                    margin-top: 14px;
                }

                .health-label-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }

                .health-title-text {
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                }

                .health-score-text {
                    font-size: 13px;
                    font-weight: 800;
                    color: #16a34a;
                }

                .health-bar-track {
                    width: 100%;
                    height: 7px;
                    background: #e2e8f0;
                    border-radius: 9999px;
                    overflow: hidden;
                }

                .health-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                    border-radius: 9999px;
                    transition: width 0.5s ease;
                }

                .health-fill-amber {
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                }

                .card-actions-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-top: 6px;
                }

                .btn-card-details {
                    padding: 8px 12px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #334155;
                    font-size: 12.5px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .btn-card-details:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }

                .btn-card-manage {
                    padding: 8px 12px;
                    border-radius: 10px;
                    border: none;
                    background: #16a34a;
                    color: #ffffff;
                    font-size: 12.5px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .btn-card-manage:hover {
                    background: #15803d;
                }

                .btn-card-notify {
                    width: 100%;
                    padding: 10px;
                    border-radius: 10px;
                    border: 1.5px solid #2563eb;
                    background: #eff6ff;
                    color: #1d4ed8;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    margin-top: 6px;
                }

                .btn-card-notify:hover {
                    background: #2563eb;
                    color: #ffffff;
                }

                .btn-card-notify.notified {
                    background: #f0fdf4;
                    border-color: #16a34a;
                    color: #15803d;
                }

                /* ================= NO RESULTS BOX ================= */
                .cm-no-results {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1.5px dashed #cbd5e1;
                    padding: 48px 24px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    grid-column: span 4;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
                }

                .cm-no-results-icon {
                    width: 68px;
                    height: 68px;
                    border-radius: 50%;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 4px;
                }

                .cm-no-results h4 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }

                .cm-no-results p {
                    font-size: 13.5px;
                    color: #64748b;
                    margin: 0;
                    max-width: 440px;
                    line-height: 1.5;
                }

                .cm-clear-search-btn {
                    margin-top: 6px;
                    background: #16a34a;
                    color: #ffffff;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .cm-clear-search-btn:hover {
                    background: #15803d;
                }

                /* ================= BOTTOM SECTION: COMING SOON + PROMO BANNER ================= */
                .bottom-section-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }

                .coming-soon-card {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
                }

                .management-promo-banner {
                    grid-column: span 2;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border-radius: 20px;
                    border: 1px solid #bbf7d0;
                    padding: 24px 28px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    position: relative;
                    overflow: hidden;
                }

                .banner-sprout-art {
                    width: 110px;
                    height: 110px;
                    border-radius: 18px;
                    object-fit: cover;
                    box-shadow: 0 8px 20px rgba(22, 101, 52, 0.12);
                    flex-shrink: 0;
                }

                .banner-text-content h3 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .banner-subhead {
                    font-size: 14px;
                    font-weight: 700;
                    color: #16a34a;
                    margin: 0 0 14px 0;
                }

                .banner-checklist {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .banner-check-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                }

                .banner-check-item svg {
                    color: #16a34a;
                    flex-shrink: 0;
                }

                /* Modal styling */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .modal-window {
                    background: #ffffff;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 480px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    padding: 26px 28px;
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .modal-header h3 {
                    font-size: 19px;
                    font-weight: 800;
                    margin: 0;
                    color: #0f172a;
                }

                .modal-close-btn {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #64748b;
                }

                .modal-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 14px;
                }

                .modal-form-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                }

                .modal-form-group input,
                .modal-form-group select {
                    height: 42px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    padding: 0 14px;
                    font-size: 14px;
                    outline: none;
                }

                .modal-form-group input:focus,
                .modal-form-group select:focus {
                    border-color: #22c55e;
                }

                @media (max-width: 1200px) {
                    .crop-stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .crops-display-grid { grid-template-columns: repeat(2, 1fr); }
                    .bottom-section-grid { grid-template-columns: repeat(2, 1fr); }
                    .management-promo-banner { grid-column: span 2; }
                    .cm-hero-features { grid-template-columns: repeat(2, 1fr); }
                    .cm-no-results { grid-column: span 2; }
                }

                @media (max-width: 768px) {
                    .exp-crop-management-page { padding: 18px 16px 40px 16px; gap: 16px; }
                    .management-topbar { flex-direction: column; align-items: stretch; gap: 12px; }
                    .cm-search-box { max-width: 100%; }
                    .cm-hero { padding: 22px 20px; }
                    .cm-hero-top { flex-direction: column; align-items: flex-start; }
                    .cm-hero-slogan-card { width: 100%; text-align: left; }
                    .cm-hero-features { grid-template-columns: 1fr; }
                    .crop-stats-grid { grid-template-columns: 1fr; }
                    .crops-display-grid { grid-template-columns: 1fr; }
                    .bottom-section-grid { grid-template-columns: 1fr; }
                    .management-promo-banner { grid-column: span 1; flex-direction: column; align-items: flex-start; }
                    .crop-controls-row { flex-direction: column; align-items: stretch; }
                    .cm-no-results { grid-column: span 1; }
                }
            `}</style>

            {/* ================= TOPBAR ================= */}
            <div className="management-topbar">
                <div className="cm-search-box">
                    <svg className="cm-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className="cm-search-input"
                        placeholder={text.searchPlaceholder}
                        aria-label="Search crops, tasks, or guidance"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="cm-search-clear"
                            onClick={() => setSearchQuery("")}
                            title="Clear search"
                            aria-label="Clear search query"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="topbar-user-area">
                    <button className="notif-btn" aria-label="Notifications">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notif-badge">3</span>
                    </button>

                    <UserProfileMenu variant="topbar" />
                </div>
            </div>

            {/* ================= PREMIUM HERO BANNER ================= */}
            <div className="cm-hero">
                <img
                    src="/images/crop_management_hero_premium.jpg"
                    alt="AgriMind Smart Crop Fields"
                    className="cm-hero-image"
                />
                <div className="cm-hero-overlay" />

                <div className="cm-hero-content">
                    <div className="cm-hero-top">
                        <div className="cm-hero-left">
                            <div className="cm-hero-badge-icon">
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                                    <path d="M4 21c3-4 6.5-6.5 11-9" />
                                </svg>
                            </div>
                            <div className="cm-hero-titles">
                                <span className="cm-hero-eyebrow">{text.eyebrow}</span>
                                <h1 className="cm-hero-title">{text.title}</h1>
                                <p className="cm-hero-description">{text.subtitle}</p>
                            </div>
                        </div>

                        <div className="cm-hero-slogan-card">
                            <div className="cm-slogan-title">
                                {text.sloganTop} 🌱 • {text.sloganSub}
                            </div>
                            <div className="cm-slogan-quote">{text.sloganQuote}</div>
                        </div>
                    </div>

                    {/* 4 Feature Highlights */}
                    <div className="cm-hero-features">
                        <div className="cm-feature-capsule">
                            <div className="cm-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <polyline points="9 12 11 14 15 10" />
                                </svg>
                            </div>
                            <div className="cm-feature-text">
                                <span className="cm-feature-name">{text.feature1Title}</span>
                                <span className="cm-feature-sub">{text.feature1Desc}</span>
                            </div>
                        </div>

                        <div className="cm-feature-capsule">
                            <div className="cm-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                                    <path d="M4 21c3-4 6.5-6.5 11-9" />
                                </svg>
                            </div>
                            <div className="cm-feature-text">
                                <span className="cm-feature-name">{text.feature2Title}</span>
                                <span className="cm-feature-sub">{text.feature2Desc}</span>
                            </div>
                        </div>

                        <div className="cm-feature-capsule">
                            <div className="cm-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                            <div className="cm-feature-text">
                                <span className="cm-feature-name">{text.feature3Title}</span>
                                <span className="cm-feature-sub">{text.feature3Desc}</span>
                            </div>
                        </div>

                        <div className="cm-feature-capsule">
                            <div className="cm-feature-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>
                            <div className="cm-feature-text">
                                <span className="cm-feature-name">{text.feature4Title}</span>
                                <span className="cm-feature-sub">{text.feature4Desc}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= 4 STATISTICS CARDS ================= */}
            <div className="crop-stats-grid">
                {/* 1. Total Crops */}
                <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                            <path d="M4 21c3-4 6.5-6.5 11-9" />
                        </svg>
                    </div>
                    <div className="stat-info-group">
                        <span className="stat-label">{text.statTotal}</span>
                        <span className="stat-value">{totalCount}</span>
                        <span className="stat-subtext">{text.statTotalSub}</span>
                    </div>
                </div>

                {/* 2. Active Crops */}
                <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-mint">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22v-9" />
                            <path d="M9 13c-3-2-4-5-4-9 4 0 7 1 9 4" />
                            <path d="M15 13c3-2 4-5 4-9-4 0-7 1-9 4" />
                        </svg>
                    </div>
                    <div className="stat-info-group">
                        <span className="stat-label">{text.statActive}</span>
                        <span className="stat-value">{activeCount}</span>
                        <span className="stat-subtext">{text.statActiveSub}</span>
                    </div>
                </div>

                {/* 3. Upcoming Tasks */}
                <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-amber">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x1="2" x2="16" y2="6" />
                            <line x1="8" x1="2" x2="8" y2="6" />
                            <line x1="3" x1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="stat-info-group">
                        <span className="stat-label">{text.statTasks}</span>
                        <span className="stat-value">3</span>
                        <span className="stat-subtext">{text.statTasksSub}</span>
                    </div>
                </div>

                {/* 4. Avg Plant Health */}
                <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <div className="stat-info-group">
                        <span className="stat-label">{text.statHealth}</span>
                        <span className="stat-value">{avgHealth}%</span>
                        <span className="stat-subtext">{text.statHealthSub}</span>
                    </div>
                </div>
            </div>

            {/* ================= CROP FILTER & CONTROL ROW ================= */}
            <div className="crop-controls-row">
                <div className="filter-tabs-group">
                    <button
                        className={`filter-tab-btn ${activeTab === "myCrops" ? "active" : ""}`}
                        onClick={() => setActiveTab("myCrops")}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                            <path d="M4 21c3-4 6.5-6.5 11-9" />
                        </svg>
                        <span>{text.tabMyCrops} ({totalCount})</span>
                    </button>

                    <button
                        className={`filter-tab-btn ${activeTab === "active" ? "active" : ""}`}
                        onClick={() => setActiveTab("active")}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22v-9" />
                            <path d="M9 13c-3-2-4-5-4-9 4 0 7 1 9 4" />
                            <path d="M15 13c3-2 4-5 4-9-4 0-7 1-9 4" />
                        </svg>
                        <span>{text.tabActive} ({activeCount})</span>
                    </button>

                    <button
                        className={`filter-tab-btn ${activeTab === "comingSoon" ? "active" : ""}`}
                        onClick={() => setActiveTab("comingSoon")}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{text.tabComingSoon} ({comingSoonCount})</span>
                    </button>

                    <button
                        className={`filter-tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span>{text.tabAll} ({totalCount})</span>
                    </button>
                </div>

                <div className="right-controls-group">
                    <button className="btn-add-crop" onClick={() => setIsAddModalOpen(true)}>
                        <span>{text.addCropBtn}</span>
                    </button>

                    <div className="view-toggle-wrap">
                        <button
                            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                            onClick={() => setViewMode("grid")}
                            title="Grid View"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            </svg>
                        </button>
                        <button
                            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                            onClick={() => setViewMode("list")}
                            title="List View"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= PRIMARY CROPS DISPLAY ================= */}
            {filteredCrops.length === 0 ? (
                <div className="cm-no-results">
                    <div className="cm-no-results-icon">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                    </div>
                    <h4>{text.noResultsTitle}</h4>
                    <p>{text.noResultsSub}</p>
                    {searchQuery && (
                        <button className="cm-clear-search-btn" onClick={() => setSearchQuery("")}>
                            {text.clearSearchBtn}
                        </button>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                <div className="crops-display-grid">
                    {filteredCrops.map((crop) => (
                        <div className="crop-management-card" key={crop.id}>
                            <div className="card-photo-wrapper">
                                <img src={crop.image} alt={crop.name} />
                                <div className={`status-badge-floating ${crop.status === "active" ? "badge-active" : "badge-coming"}`}>
                                    {crop.status === "active" ? (
                                        <>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>{text.activeBadge}</span>
                                        </>
                                    ) : (
                                        <span>{text.comingSoonBadge}</span>
                                    )}
                                </div>
                            </div>

                            <div className="card-details-body">
                                <div>
                                    <div className="crop-header-titles">
                                        <h3>{crop.name}</h3>
                                        <span className="crop-season-tag">{crop.season} • {crop.category}</span>
                                    </div>

                                    <div className="timeline-specs-row">
                                        <div className="timeline-spec-item">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                                <line x1="16" x1="2" x2="16" y2="6" />
                                                <line x1="8" x1="2" x2="8" y2="6" />
                                                <line x1="3" x1="10" x2="21" y2="10" />
                                            </svg>
                                            <span>{text.sowingLabel} {crop.sowing}</span>
                                        </div>
                                        <div className="timeline-spec-item">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 14 14" />
                                            </svg>
                                            <span>{text.harvestLabel} {crop.harvest}</span>
                                        </div>
                                    </div>

                                    {crop.health !== null ? (
                                        <div className="health-progress-group">
                                            <div className="health-label-row">
                                                <span className="health-title-text">{text.plantHealthLabel}</span>
                                                <span className="health-score-text">{crop.health}%</span>
                                            </div>
                                            <div className="health-bar-track">
                                                <div
                                                    className={`health-bar-fill ${crop.health < 80 ? "health-fill-amber" : ""}`}
                                                    style={{ width: `${crop.health}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: "14px", padding: "8px 12px", background: "#eff6ff", borderRadius: "8px", fontSize: "12px", color: "#1e40af", fontWeight: "600" }}>
                                            AI Diagnostic Model in Calibration
                                        </div>
                                    )}
                                </div>

                                {crop.status === "active" ? (
                                    <div className="card-actions-row">
                                        <button
                                            className="btn-card-details"
                                            onClick={() => setSelectedDetailCrop(crop)}
                                        >
                                            {text.viewDetailsBtn}
                                        </button>
                                        <button
                                            className="btn-card-manage"
                                            onClick={() => handleManage(crop)}
                                        >
                                            {text.manageBtn}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className={`btn-card-notify ${notifiedCrops[crop.id] ? "notified" : ""}`}
                                        onClick={() => handleToggleNotify(crop.id)}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                        <span>{notifiedCrops[crop.id] ? text.notifiedBtn : text.notifyMeBtn}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!trimmedQuery && (activeTab === "myCrops" || activeTab === "active")) && promoBanner}
                </div>
            ) : (
                /* List View */
                <div className="crops-display-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredCrops.map((crop) => (
                        <div
                            key={crop.id}
                            style={{
                                background: "#ffffff",
                                borderRadius: "16px",
                                border: "1px solid #e2e8f0",
                                padding: "16px 20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "20px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <img
                                    src={crop.image}
                                    alt={crop.name}
                                    style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }}
                                />
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{crop.name}</h4>
                                    <span style={{ fontSize: "12.5px", color: "#64748b" }}>{crop.season} • {crop.category}</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                                <div style={{ fontSize: "12.5px", color: "#475569", display: "flex", flexDirection: "column" }}>
                                    <span><strong>{text.sowingLabel}</strong> {crop.sowing}</span>
                                    <span><strong>{text.harvestLabel}</strong> {crop.harvest}</span>
                                </div>

                                {crop.health !== null ? (
                                    <div style={{ width: "120px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                                            <span style={{ color: "#64748b" }}>{text.plantHealthLabel}</span>
                                            <span style={{ color: "#16a34a" }}>{crop.health}%</span>
                                        </div>
                                        <div className="health-bar-track">
                                            <div className="health-bar-fill" style={{ width: `${crop.health}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>{text.comingSoonBadge}</span>
                                )}

                                <div style={{ display: "flex", gap: "10px" }}>
                                    {crop.status === "active" ? (
                                        <>
                                            <button className="btn-card-details" onClick={() => setSelectedDetailCrop(crop)}>
                                                {text.viewDetailsBtn}
                                            </button>
                                            <button className="btn-card-manage" onClick={() => handleManage(crop)}>
                                                {text.manageBtn}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className={`btn-card-notify ${notifiedCrops[crop.id] ? "notified" : ""}`}
                                            onClick={() => handleToggleNotify(crop.id)}
                                            style={{ width: "auto" }}
                                        >
                                            {notifiedCrops[crop.id] ? text.notifiedBtn : text.notifyMeBtn}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!trimmedQuery && (activeTab === "myCrops" || activeTab === "active")) && promoBanner}
                </div>
            )}

            {/* ================= MODAL: ADD CROP ================= */}
            {isAddModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-window">
                        <div className="modal-header">
                            <h3>{text.modalTitle}</h3>
                            <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddCropSubmit}>
                            <div className="modal-form-group">
                                <label>{text.modalCropName}</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Groundnut, Mustard, Sugarcane"
                                    value={newCropForm.name}
                                    onChange={(e) => setNewCropForm({ ...newCropForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>{text.modalSeason}</label>
                                <select
                                    value={newCropForm.season}
                                    onChange={(e) => setNewCropForm({ ...newCropForm, season: e.target.value })}
                                >
                                    <option value="Kharif Season">Kharif Season</option>
                                    <option value="Rabi Season">Rabi Season</option>
                                    <option value="Zaid Season">Zaid Season</option>
                                    <option value="Perennial">Perennial</option>
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div className="modal-form-group">
                                    <label>{text.modalSowing}</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Jun - Jul"
                                        value={newCropForm.sowing}
                                        onChange={(e) => setNewCropForm({ ...newCropForm, sowing: e.target.value })}
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>{text.modalHarvest}</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Oct - Nov"
                                        value={newCropForm.harvest}
                                        onChange={(e) => setNewCropForm({ ...newCropForm, harvest: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                                <button
                                    type="button"
                                    className="btn-card-details"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    {text.modalCancel}
                                </button>
                                <button
                                    type="submit"
                                    className="btn-card-manage"
                                >
                                    {text.modalSubmit}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: CROP DETAILS ================= */}
            {selectedDetailCrop && (
                <div className="modal-backdrop">
                    <div className="modal-window">
                        <div className="modal-header">
                            <h3>{selectedDetailCrop.name} — Profile</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedDetailCrop(null)}>✕</button>
                        </div>
                        <img
                            src={selectedDetailCrop.image}
                            alt={selectedDetailCrop.name}
                            style={{ width: "100%", height: "160px", borderRadius: "14px", objectFit: "cover", marginBottom: "16px" }}
                        />
                        <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.55", margin: "0 0 16px 0" }}>
                            {selectedDetailCrop.description}
                        </p>
                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                            <div>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>SEASON</span>
                                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>{selectedDetailCrop.season}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>PLANT HEALTH</span>
                                <div style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a" }}>
                                    {selectedDetailCrop.health !== null ? `${selectedDetailCrop.health}%` : "In testing"}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>CATEGORY</span>
                                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>{selectedDetailCrop.category}</div>
                            </div>
                        </div>

                        {selectedDetailCrop.guidance && (
                            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 14px", borderRadius: "12px", marginBottom: "16px" }}>
                                <div style={{ fontSize: "11.5px", fontWeight: "800", color: "#15803d", marginBottom: "4px" }}>
                                    🌱 AI AGRONOMIC GUIDANCE
                                </div>
                                <div style={{ fontSize: "12.5px", color: "#166534", lineHeight: "1.45" }}>
                                    {selectedDetailCrop.guidance}
                                </div>
                            </div>
                        )}

                        <button
                            className="btn-card-manage"
                            style={{ width: "100%" }}
                            onClick={() => {
                                const crop = selectedDetailCrop;
                                setSelectedDetailCrop(null);
                                handleManage(crop);
                            }}
                        >
                            Open in Disease Detection →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
