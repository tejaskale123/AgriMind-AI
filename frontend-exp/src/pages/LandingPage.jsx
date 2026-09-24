import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function LandingPage() {
    const navigate = useNavigate();
    const { language, setLanguage } = useLanguage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [weatherPreview, setWeatherPreview] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [modelInfo, setModelInfo] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [newsletterMsg, setNewsletterMsg] = useState("");

    const navRef = useRef(null);

    // Scroll state for sticky navbar shadow
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown on click outside or Escape key
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setActiveDropdown(null);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setActiveDropdown(null);
                setShowDemoModal(false);
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Fetch dynamic model telemetry
    useEffect(() => {
        const fetchSystemData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/system/model-info`);
                if (res.ok) {
                    const data = await res.json();
                    setModelInfo(data);
                }
            } catch (err) {
                console.warn("Model info fetch on landing:", err);
            }

            // Check if user has geolocation or fetch default advisory
            try {
                setWeatherLoading(true);
                const wRes = await fetch(`${API_BASE_URL}/weather/current`);
                if (wRes.ok) {
                    const wData = await wRes.json();
                    if (wData && wData.success) {
                        setWeatherPreview(wData.data);
                    }
                }
            } catch (err) {
                console.warn("Weather preview fetch on landing:", err);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchSystemData();
    }, []);

    const scrollToSection = (id) => {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleNavigation = (path) => {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
        navigate(path);
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleGetStarted = () => {
        navigate("/register");
    };

    const toggleDropdown = (name) => {
        setActiveDropdown((prev) => (prev === name ? null : name));
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (userEmail && userEmail.includes("@")) {
            setNewsletterMsg("Thank you for subscribing to AgriMind farming updates!");
            setUserEmail("");
            setTimeout(() => setNewsletterMsg(""), 4000);
        }
    };

    // Supported crops based on model capabilities
    const supportedCrops = [
        {
            name: "Soybean",
            image: "/images/crop_soybean.jpg",
            category: "Legume",
            desc: "Bacterial Blight, Rust, Frogeye Leaf Spot & Sudden Death Syndrome",
            link: "/crops"
        },
        {
            name: "Cotton",
            image: "/images/crop_cotton.jpg",
            category: "Fiber Crop",
            desc: "Bacterial Blight, Boll Rot, Leaf Spot, Wilt & Mildew",
            link: "/crops"
        },
        {
            name: "Maize",
            image: "/images/crop_maize.jpg",
            category: "Cereal Grain",
            desc: "Common Rust, Blight, Gray Leaf Spot & Healthy scan",
            link: "/crops"
        },
        {
            name: "Wheat",
            image: "/images/crop_wheat.jpg",
            category: "Food Grain",
            desc: "Brown Rust, Yellow Rust & Leaf health monitoring",
            link: "/crops"
        },
        {
            name: "Rice",
            image: "/images/crop_rice.jpg",
            category: "Paddy Crop",
            desc: "Blast, Brown Spot, Sheath Blight & Stem rot guidance",
            link: "/crops"
        },
        {
            name: "Tomato",
            image: "/images/crop_tomato.jpg",
            category: "Vegetable",
            desc: "Early Blight, Late Blight, Leaf Curl & Septoria spot",
            link: "/crops"
        },
        {
            name: "Chilli",
            image: "/images/crop_chilli.jpg",
            category: "Spices",
            desc: "Anthracnose, Powdery Mildew, Mites & Viral leaf curl",
            link: "/crops"
        },
        {
            name: "Onion",
            image: "/images/crop_onion.jpg",
            category: "Horticulture",
            desc: "Purple Blotch, Downy Mildew, Stemphylium blight & rot",
            link: "/crops"
        },
    ];

    return (
        <div className="agrimind-landing-wrapper">
            <style>{`
                /* ==========================================================================
                   AGRIMIND AI PREMIUM CLEAN & ATTRACTIVE LANDING PAGE
                   Calm & Earthy Agricultural Aesthetics | Farmer-First Readability
                   ========================================================================== */
                .agrimind-landing-wrapper {
                    width: 100%;
                    min-height: 100vh;
                    background: #f8faf9;
                    color: #0d281e;
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    overflow-x: hidden;
                    box-sizing: border-box;
                    line-height: 1.5;
                }

                .landing-container {
                    max-width: 1260px;
                    margin: 0 auto;
                    padding: 0 28px;
                }

                /* ================= NAVBAR (GLASSMORPHISM & POLISHED LIFT) ================= */
                .landing-navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 78px;
                    background: rgba(255, 255, 255, 0.88);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border-bottom: 1px solid rgba(226, 236, 230, 0.8);
                    z-index: 1000;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .landing-navbar.scrolled {
                    height: 68px;
                    background: rgba(255, 255, 255, 0.96);
                    box-shadow: 0 10px 30px -10px rgba(13, 40, 30, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02);
                    border-bottom-color: #d1e2d9;
                }

                .nav-inner {
                    max-width: 1260px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 28px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .brand-logo-area {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform 0.2s ease;
                }

                .brand-logo-area:hover {
                    transform: scale(1.02);
                }

                .brand-leaf-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #e8f7ee 0%, #d1fae5 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(45, 122, 88, 0.12);
                    border: 1px solid rgba(143, 185, 168, 0.3);
                }

                .brand-text-col {
                    display: flex;
                    flex-direction: column;
                }

                .brand-main-name {
                    font-size: 21px;
                    font-weight: 800;
                    color: #0d281e;
                    letter-spacing: -0.6px;
                    line-height: 1.1;
                }

                .brand-sub-badge {
                    font-size: 9.5px;
                    font-weight: 800;
                    color: #2d7a58;
                    letter-spacing: 1.4px;
                    text-transform: uppercase;
                }

                /* Nav Dropdowns Menu */
                .nav-links-menu {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(240, 245, 242, 0.7);
                    padding: 4px 8px;
                    border-radius: 999px;
                    border: 1px solid rgba(226, 236, 230, 0.9);
                }

                .nav-dropdown-item {
                    position: relative;
                }

                .nav-dropdown-trigger {
                    background: none;
                    border: none;
                    color: #2c4238;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 7px 14px;
                    border-radius: 999px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: all 0.2s ease;
                }

                .nav-dropdown-trigger:hover,
                .nav-dropdown-trigger.active {
                    color: #1b6343;
                    background: #ffffff;
                    box-shadow: 0 2px 8px rgba(13, 40, 30, 0.06);
                }

                .dropdown-arrow {
                    font-size: 10px;
                    transition: transform 0.2s ease;
                    opacity: 0.7;
                }

                .nav-dropdown-trigger.active .dropdown-arrow {
                    transform: rotate(180deg);
                    opacity: 1;
                }

                .nav-dropdown-panel {
                    position: absolute;
                    top: calc(100% + 12px);
                    left: 0;
                    background: #ffffff;
                    border: 1px solid #dbe8e1;
                    border-radius: 20px;
                    padding: 10px;
                    min-width: 260px;
                    box-shadow: 0 20px 45px -10px rgba(13, 40, 30, 0.15), 0 6px 16px rgba(0, 0, 0, 0.04);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    z-index: 1050;
                    animation: dropdownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .dropdown-link-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: #1e293b;
                    font-size: 13.5px;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    width: 100%;
                }

                .dropdown-link-btn:hover {
                    background: #eef7f2;
                    color: #1b6343;
                    transform: translateX(4px);
                }

                .dropdown-icon-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 9px;
                    background: #e8f7ee;
                    color: #2d7a58;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                    flex-shrink: 0;
                }

                /* Right Side Controls */
                .nav-right-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .nav-lang-pill {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    background: #ffffff;
                    border: 1.5px solid #d5e5dc;
                    border-radius: 999px;
                    padding: 8px 16px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #2c4238;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
                }

                .nav-lang-pill:hover {
                    border-color: #2d7a58;
                    background: #f0f8f4;
                    transform: translateY(-1px);
                }

                .nav-login-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #2d7a58 0%, #1c5e41 100%);
                    border: none;
                    color: #ffffff;
                    padding: 9px 24px;
                    border-radius: 999px;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 6px 18px rgba(45, 122, 88, 0.28);
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .nav-login-btn:hover {
                    background: linear-gradient(135deg, #246849 0%, #154c34 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 24px rgba(45, 122, 88, 0.38);
                }

                .mobile-toggle-btn {
                    display: none;
                    background: none;
                    border: none;
                    color: #0d281e;
                    cursor: pointer;
                    padding: 6px;
                }

                /* ================= HERO SECTION (EARTHY GLOW & AMBIENT MESH) ================= */
                .landing-hero-section {
                    position: relative;
                    padding-top: 136px;
                    padding-bottom: 90px;
                    background: radial-gradient(circle at 80% 20%, rgba(143, 185, 168, 0.22) 0%, rgba(248, 250, 249, 0) 60%),
                                linear-gradient(180deg, #eef7f2 0%, #f8faf9 100%);
                    overflow: hidden;
                }

                .hero-bg-glow {
                    position: absolute;
                    top: -120px;
                    right: -120px;
                    width: 650px;
                    height: 650px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(45, 122, 88, 0.12) 0%, rgba(248, 250, 249, 0) 70%);
                    pointer-events: none;
                }

                .hero-grid-2col {
                    display: grid;
                    grid-template-columns: 1.1fr 0.9fr;
                    gap: 46px;
                    align-items: center;
                }

                .hero-content-col {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                .hero-eyebrow-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #ffffff;
                    border: 1px solid #c2ded0;
                    color: #1c5e41;
                    padding: 7px 18px;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    margin-bottom: 22px;
                    box-shadow: 0 4px 14px rgba(45, 122, 88, 0.08);
                }

                .hero-main-h1 {
                    font-size: 54px;
                    font-weight: 900;
                    color: #091f16;
                    line-height: 1.12;
                    letter-spacing: -1.4px;
                    margin: 0 0 22px 0;
                }

                .hero-main-h1 span.highlight-green {
                    color: #2d7a58;
                    background: linear-gradient(135deg, #1f6b49 0%, #2d7a58 50%, #48a779 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-lead-text {
                    font-size: 17.5px;
                    line-height: 1.65;
                    color: #3b5247;
                    margin: 0 0 34px 0;
                    max-width: 560px;
                }

                .hero-cta-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 44px;
                    flex-wrap: wrap;
                }

                .hero-primary-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: linear-gradient(135deg, #2d7a58 0%, #1b5c3e 100%);
                    color: #ffffff;
                    border: none;
                    padding: 15px 34px;
                    border-radius: 999px;
                    font-size: 15.5px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 8px 24px rgba(45, 122, 88, 0.32);
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .hero-primary-btn:hover {
                    background: linear-gradient(135deg, #246849 0%, #144930 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 28px rgba(45, 122, 88, 0.42);
                }

                .hero-secondary-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #ffffff;
                    border: 1.5px solid #cbdcd2;
                    color: #1e352b;
                    padding: 14px 28px;
                    border-radius: 999px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                    transition: all 0.2s ease;
                }

                .hero-secondary-btn:hover {
                    background: #f0f7f3;
                    border-color: #8fb9a8;
                    color: #0d281e;
                    transform: translateY(-2px);
                }

                .hero-play-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #e8f7ee;
                    color: #2d7a58;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                }

                /* Truthful Capability Strip */
                .hero-capabilities-strip {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 18px;
                    width: 100%;
                    padding-top: 28px;
                    border-top: 1.5px solid #dce8e1;
                }

                .hero-cap-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .hero-cap-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: #ffffff;
                    color: #2d7a58;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                    box-shadow: 0 4px 14px rgba(45, 122, 88, 0.08);
                    border: 1px solid #dce8e1;
                }

                .cap-texts {
                    display: flex;
                    flex-direction: column;
                }

                .cap-title {
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #0d281e;
                    line-height: 1.2;
                }

                .cap-subtitle {
                    font-size: 11.5px;
                    color: #556c60;
                }

                /* Hero Image Column */
                .hero-image-col {
                    position: relative;
                    display: flex;
                    justify-content: center;
                }

                .hero-image-frame {
                    position: relative;
                    width: 100%;
                    max-width: 490px;
                    border-radius: 30px;
                    overflow: hidden;
                    box-shadow: 0 28px 65px -10px rgba(13, 40, 30, 0.22), 0 8px 24px rgba(0, 0, 0, 0.06);
                    border: 5px solid #ffffff;
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .hero-image-frame:hover {
                    transform: translateY(-4px);
                }

                .hero-main-farmer-img {
                    width: 100%;
                    height: 520px;
                    object-fit: cover;
                    display: block;
                }

                /* ================= 6 APPS / CORE FEATURES GRID ================= */
                .features-app-section {
                    padding: 90px 0;
                    background: #ffffff;
                    position: relative;
                }

                .section-header-centered {
                    text-align: center;
                    max-width: 700px;
                    margin: 0 auto 54px auto;
                }

                .section-eyebrow {
                    font-size: 12px;
                    font-weight: 800;
                    color: #2d7a58;
                    letter-spacing: 1.6px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    display: inline-block;
                    background: #eef7f2;
                    padding: 4px 14px;
                    border-radius: 999px;
                }

                .section-title {
                    font-size: 38px;
                    font-weight: 900;
                    color: #0d281e;
                    letter-spacing: -0.8px;
                    margin: 0 0 14px 0;
                    line-height: 1.2;
                }

                .section-subtext {
                    font-size: 15.5px;
                    color: #4f685c;
                    line-height: 1.6;
                    margin: 0;
                }

                .features-six-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 26px;
                }

                .feature-app-card {
                    background: #fbfcfa;
                    border: 1.5px solid #e1ece5;
                    border-radius: 22px;
                    padding: 32px 26px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 20px rgba(13, 40, 30, 0.02);
                    cursor: pointer;
                    position: relative;
                }

                .feature-app-card:hover {
                    border-color: #8fb9a8;
                    background: #ffffff;
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px -10px rgba(45, 122, 88, 0.14);
                }

                .card-icon-round {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
                }

                .icon-bg-green { background: #e8f7ee; color: #2d7a58; }
                .icon-bg-blue { background: #e0f2fe; color: #0284c7; }
                .icon-bg-amber { background: #fef3c7; color: #d97706; }
                .icon-bg-purple { background: #f3e8ff; color: #9333ea; }
                .icon-bg-rose { background: #ffe4e6; color: #e11d48; }
                .icon-bg-emerald { background: #d1fae5; color: #059669; }

                .feature-app-card h3 {
                    font-size: 19px;
                    font-weight: 800;
                    color: #0d281e;
                    margin: 0 0 10px 0;
                    letter-spacing: -0.3px;
                }

                .feature-app-card p {
                    font-size: 14px;
                    color: #4f685c;
                    line-height: 1.55;
                    margin: 0 0 22px 0;
                    flex-grow: 1;
                }

                .card-learn-more-link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #2d7a58;
                    font-size: 14px;
                    font-weight: 800;
                    transition: gap 0.2s ease;
                }

                .feature-app-card:hover .card-learn-more-link {
                    gap: 10px;
                    color: #1b5c3e;
                }

                /* ================= SOLUTIONS SECTION ================= */
                .solutions-section {
                    padding: 90px 0;
                    background: #f3f8f5;
                    border-top: 1px solid #dce8e1;
                    border-bottom: 1px solid #dce8e1;
                }

                .workflow-steps-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 22px;
                    margin-top: 44px;
                }

                .workflow-card {
                    background: #ffffff;
                    border: 1.5px solid #dfeae2;
                    border-radius: 22px;
                    padding: 28px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    position: relative;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    box-shadow: 0 4px 16px rgba(13, 40, 30, 0.03);
                }

                .workflow-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 32px rgba(45, 122, 88, 0.1);
                    border-color: #8fb9a8;
                }

                .workflow-num {
                    font-size: 11.5px;
                    font-weight: 800;
                    color: #2d7a58;
                    background: #e8f7ee;
                    padding: 5px 12px;
                    border-radius: 8px;
                    width: fit-content;
                    letter-spacing: 0.5px;
                }

                .workflow-card h4 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0d281e;
                    margin: 0;
                }

                .workflow-card p {
                    font-size: 13.5px;
                    color: #4f685c;
                    line-height: 1.55;
                    margin: 0;
                }

                /* ================= HOW IT WORKS / PRODUCT SHOWCASE ================= */
                .showcase-how-section {
                    padding: 90px 0;
                    background: #ffffff;
                }

                .showcase-two-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 56px;
                    align-items: center;
                }

                .showcase-text-side h2 {
                    font-size: 38px;
                    font-weight: 900;
                    color: #0d281e;
                    line-height: 1.18;
                    letter-spacing: -0.8px;
                    margin: 0 0 18px 0;
                }

                .showcase-text-side p.lead {
                    font-size: 16px;
                    color: #4f685c;
                    line-height: 1.65;
                    margin-bottom: 28px;
                }

                .checkmarks-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 34px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .checkmarks-list li {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    font-size: 14.5px;
                    font-weight: 600;
                    color: #1e352b;
                }

                .check-green-badge {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: #d1fae5;
                    color: #1b5c3e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                /* Phone Device Mockup Container */
                .phone-showcase-container {
                    display: flex;
                    justify-content: center;
                    position: relative;
                }

                .phone-mockup-frame {
                    width: 325px;
                    background: #0b1a13;
                    border: 8px solid #1c3527;
                    border-radius: 40px;
                    padding: 16px;
                    box-shadow: 0 28px 70px -10px rgba(13, 40, 30, 0.35);
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    position: relative;
                }

                .phone-camera-notch {
                    width: 80px;
                    height: 16px;
                    background: #1c3527;
                    border-radius: 999px;
                    margin: 0 auto;
                }

                .phone-leaf-preview {
                    width: 100%;
                    height: 220px;
                    border-radius: 22px;
                    object-fit: cover;
                    border: 2px solid rgba(255, 255, 255, 0.12);
                }

                .phone-diagnosis-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .diag-status-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .diag-alert-badge {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11px;
                    font-weight: 800;
                    color: #b91c1c;
                    background: #fee2e2;
                    padding: 4px 9px;
                    border-radius: 6px;
                }

                .diag-conf-badge {
                    font-size: 11px;
                    font-weight: 800;
                    color: #15803d;
                    background: #dcfce7;
                    padding: 4px 9px;
                    border-radius: 6px;
                }

                .diag-title-name {
                    font-size: 16.5px;
                    font-weight: 800;
                    color: #0d281e;
                    margin: 2px 0 0 0;
                }

                .diag-crop-name {
                    font-size: 12.5px;
                    color: #556c60;
                }

                .btn-view-treatment-sm {
                    background: linear-gradient(135deg, #2d7a58 0%, #1b5c3e 100%);
                    color: #ffffff;
                    border: none;
                    padding: 10px;
                    border-radius: 12px;
                    font-size: 12.5px;
                    font-weight: 800;
                    text-align: center;
                    cursor: pointer;
                    margin-top: 4px;
                    transition: all 0.2s;
                }

                .btn-view-treatment-sm:hover {
                    background: #154c34;
                }

                /* ================= CROPS GRID ================= */
                .crops-showcase-section {
                    padding: 90px 0;
                    background: #f3f8f5;
                    border-top: 1px solid #dce8e1;
                }

                .crops-eight-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 22px;
                }

                .crop-landing-card {
                    background: #ffffff;
                    border: 1.5px solid #dfeae2;
                    border-radius: 22px;
                    overflow: hidden;
                    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 16px rgba(13, 40, 30, 0.03);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }

                .crop-landing-card:hover {
                    border-color: #2d7a58;
                    transform: translateY(-5px);
                    box-shadow: 0 16px 36px rgba(45, 122, 88, 0.14);
                }

                .crop-card-img-wrap {
                    height: 160px;
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }

                .crop-card-img-wrap img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                }

                .crop-landing-card:hover .crop-card-img-wrap img {
                    transform: scale(1.08);
                }

                .crop-cat-tag {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(255, 255, 255, 0.94);
                    backdrop-filter: blur(6px);
                    color: #1b5c3e;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .crop-card-content {
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .crop-card-title {
                    font-size: 17px;
                    font-weight: 800;
                    color: #0d281e;
                    margin: 0;
                }

                .crop-card-desc {
                    font-size: 12.5px;
                    color: #4f685c;
                    line-height: 1.45;
                    margin: 0 0 10px 0;
                }

                .crop-card-btn {
                    font-size: 12.5px;
                    font-weight: 800;
                    color: #2d7a58;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: gap 0.2s ease;
                }

                .crop-landing-card:hover .crop-card-btn {
                    gap: 8px;
                }

                /* ================= WEATHER PREVIEW SECTION ================= */
                .weather-sustainability-section {
                    padding: 90px 0;
                    background: #ffffff;
                }

                .weather-feature-strip {
                    background: linear-gradient(135deg, #f0fbf5 0%, #e6f6ee 100%);
                    border: 1.5px solid #c2ded0;
                    border-radius: 28px;
                    padding: 42px;
                    box-shadow: 0 16px 40px rgba(45, 122, 88, 0.06);
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    align-items: center;
                }

                .weather-left-info h3 {
                    font-size: 30px;
                    font-weight: 900;
                    color: #0d281e;
                    margin: 0 0 14px 0;
                    line-height: 1.2;
                }

                .weather-left-info p {
                    font-size: 15px;
                    color: #3b5247;
                    line-height: 1.65;
                    margin: 0 0 28px 0;
                }

                .weather-live-tile {
                    background: #ffffff;
                    border: 1.5px solid #d5e5dc;
                    border-radius: 22px;
                    padding: 26px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    box-shadow: 0 8px 24px rgba(13, 40, 30, 0.05);
                }

                .weather-tile-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .weather-loc-tag {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #0d281e;
                }

                .live-pill-sm {
                    background: #d1fae5;
                    color: #1b5c3e;
                    font-size: 11.5px;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 999px;
                }

                .weather-temp-hero-row {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }

                .weather-big-temp {
                    font-size: 48px;
                    font-weight: 900;
                    color: #0d281e;
                    line-height: 1;
                }

                .weather-sub-metrics {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 14px;
                    padding-top: 16px;
                    border-top: 1px solid #eef3f0;
                }

                .sub-metric-box {
                    display: flex;
                    flex-direction: column;
                }

                .sub-lbl {
                    font-size: 12px;
                    color: #556c60;
                }

                .sub-val {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0d281e;
                }

                /* ================= BUILT AROUND FARMERS' NEEDS ================= */
                .farmers-needs-section {
                    padding: 90px 0;
                    background: #f3f8f5;
                    border-top: 1px solid #dce8e1;
                    border-bottom: 1px solid #dce8e1;
                }

                .needs-three-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 26px;
                }

                .need-card {
                    background: #ffffff;
                    border: 1.5px solid #dfeae2;
                    border-radius: 22px;
                    padding: 36px 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    box-shadow: 0 4px 20px rgba(13, 40, 30, 0.03);
                    transition: transform 0.25s ease;
                }

                .need-card:hover {
                    transform: translateY(-4px);
                    border-color: #8fb9a8;
                }

                .need-card-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    background: #e8f7ee;
                    color: #2d7a58;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .need-card h3 {
                    font-size: 21px;
                    font-weight: 800;
                    color: #0d281e;
                    margin: 0;
                }

                .need-card p {
                    font-size: 14.5px;
                    color: #4f685c;
                    line-height: 1.6;
                    margin: 0;
                }

                /* ================= ABOUT SECTION ================= */
                .about-project-section {
                    padding: 90px 0;
                    background: #ffffff;
                }

                /* ================= FINAL CTA BANNER ================= */
                .final-cta-section {
                    padding: 90px 0;
                    background: linear-gradient(135deg, #0d281e 0%, #154231 100%);
                    color: #ffffff;
                    position: relative;
                    overflow: hidden;
                }

                .cta-box-center {
                    text-align: center;
                    max-width: 660px;
                    margin: 0 auto;
                }

                .cta-box-center h2 {
                    font-size: 42px;
                    font-weight: 900;
                    letter-spacing: -1px;
                    margin: 0 0 18px 0;
                    color: #ffffff;
                    line-height: 1.2;
                }

                .cta-box-center p {
                    font-size: 17px;
                    color: #c2ded0;
                    line-height: 1.6;
                    margin: 0 0 36px 0;
                }

                .btn-cta-white {
                    background: #ffffff;
                    color: #0d281e;
                    border: none;
                    padding: 16px 40px;
                    border-radius: 999px;
                    font-size: 16px;
                    font-weight: 900;
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn-cta-white:hover {
                    background: #eef7f2;
                    transform: translateY(-3px);
                    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.35);
                }

                /* ================= FOOTER ================= */
                .landing-footer {
                    background: #081912;
                    color: #8fa89b;
                    padding: 76px 0 34px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .footer-grid-5col {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr;
                    gap: 36px;
                    margin-bottom: 54px;
                }

                .footer-brand-col p {
                    font-size: 14px;
                    line-height: 1.65;
                    margin: 16px 0 22px 0;
                    max-width: 290px;
                    color: #8fa89b;
                }

                .footer-nav-col h5 {
                    font-size: 14px;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0 0 20px 0;
                    letter-spacing: 0.6px;
                }

                .footer-nav-col ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .footer-nav-col li button, .footer-nav-col li a {
                    background: none;
                    border: none;
                    color: #8fa89b;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 0;
                    text-decoration: none;
                    transition: all 0.2s;
                    text-align: left;
                }

                .footer-nav-col li button:hover, .footer-nav-col li a:hover {
                    color: #8fb9a8;
                    transform: translateX(3px);
                }

                .footer-bottom-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 28px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    font-size: 13px;
                }

                /* ================= DEMO MODAL ================= */
                .demo-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(13, 40, 30, 0.72);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }

                .demo-modal-card {
                    background: #ffffff;
                    border-radius: 26px;
                    max-width: 600px;
                    width: 100%;
                    overflow: hidden;
                    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
                    animation: dropdownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .demo-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 22px 26px;
                    background: #f3f8f5;
                    border-bottom: 1px solid #dfeae2;
                }

                .demo-modal-body {
                    padding: 30px 26px;
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                .demo-step-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                }

                .demo-step-num {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #e8f7ee;
                    color: #2d7a58;
                    font-size: 15px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                /* ================= RESPONSIVE ================= */
                /* ================= LUXURY MOTION GRAPHICS & SCROLL REVEAL ================= */
                @keyframes floatGentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.55; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.04); }
                }

                @keyframes shimmerEffect {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                @keyframes cardSlideUp {
                    from { opacity: 0; transform: translateY(22px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Scroll animation triggers */
                .motion-reveal {
                    animation: cardSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                /* Luxury Glassmorphism & High-Gloss Highlights */
                .feature-app-card, .workflow-card, .crop-landing-card, .need-card, .weather-live-tile {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .feature-app-card::after, .crop-landing-card::after, .workflow-card::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(45, 122, 88, 0.4), transparent);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .feature-app-card:hover::after, .crop-landing-card:hover::after, .workflow-card:hover::after {
                    opacity: 1;
                }

                /* Mobile Drawer Menu */
                .mobile-drawer-overlay {
                    display: none;
                }

                @media (max-width: 900px) {
                    .nav-links-menu {
                        display: none;
                    }
                    .mobile-toggle-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        border-radius: 12px;
                        background: #ffffff;
                        border: 1.5px solid #d5e5dc;
                        color: #0d281e;
                        cursor: pointer;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                    }
                    .mobile-drawer-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(13, 40, 30, 0.65);
                        backdrop-filter: blur(8px);
                        z-index: 1200;
                        animation: dropdownFade 0.25s ease;
                    }
                    .mobile-drawer-panel {
                        position: fixed;
                        top: 0;
                        right: 0;
                        width: 82%;
                        max-width: 320px;
                        height: 100%;
                        background: #ffffff;
                        box-shadow: -10px 0 40px rgba(0, 0, 0, 0.2);
                        z-index: 1201;
                        display: flex;
                        flex-direction: column;
                        padding: 24px;
                        overflow-y: auto;
                        gap: 18px;
                    }
                    .mobile-drawer-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding-bottom: 14px;
                        border-bottom: 1px solid #e2ece6;
                    }
                    .mobile-drawer-close {
                        background: #f0f7f3;
                        border: none;
                        width: 34px;
                        height: 34px;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 800;
                        color: #0d281e;
                        cursor: pointer;
                    }
                    .mobile-drawer-nav {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .mobile-drawer-link {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 14px;
                        border-radius: 12px;
                        background: #f8faf9;
                        border: 1px solid #e2ece6;
                        color: #0d281e;
                        font-size: 14.5px;
                        font-weight: 700;
                        cursor: pointer;
                        text-align: left;
                        width: 100%;
                    }
                    .mobile-drawer-link:hover {
                        background: #eef7f2;
                        color: #1b5c3e;
                    }
                }

                /* Footer Social Icons & Badges */
                .footer-social-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 18px;
                }

                .footer-social-btn {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #c2ded0;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .footer-social-btn:hover {
                    background: #2d7a58;
                    color: #ffffff;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 16px rgba(45, 122, 88, 0.4);
                }

                /* Floating animation on showcase frame */
                .phone-mockup-frame {
                    animation: floatGentle 5s ease-in-out infinite;
                }

                /* Ambient Hero Pulse */
                .hero-bg-glow {
                    animation: pulseGlow 7s ease-in-out infinite;
                }

                /* Luxury Badge Shimmer */
                .hero-eyebrow-pill {
                    position: relative;
                    overflow: hidden;
                }

                /* Responsive Layout Fixes */
                @media (max-width: 1024px) {
                    .hero-grid-2col {
                        grid-template-columns: 1fr;
                        gap: 46px;
                    }
                    .features-six-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .workflow-steps-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .crops-eight-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .weather-feature-strip {
                        grid-template-columns: 1fr;
                    }
                    .footer-grid-5col {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .landing-container {
                        padding: 0 16px;
                    }
                    .hero-main-h1 {
                        font-size: 34px;
                    }
                    .hero-capabilities-strip {
                        grid-template-columns: 1fr;
                    }
                    .showcase-two-col {
                        grid-template-columns: 1fr;
                    }
                    .features-six-grid {
                        grid-template-columns: 1fr;
                    }
                    .workflow-steps-grid {
                        grid-template-columns: 1fr;
                    }
                    .crops-eight-grid {
                        grid-template-columns: 1fr;
                    }
                    .needs-three-grid {
                        grid-template-columns: 1fr;
                    }
                    .footer-grid-5col {
                        grid-template-columns: 1fr;
                    }
                    .hero-cta-row {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .hero-primary-btn, .hero-secondary-btn {
                        justify-content: center;
                    }
                    .footer-bottom-row {
                        flex-direction: column;
                        gap: 12px;
                        text-align: center;
                    }
                }
            `}</style>

            {/* ================= TOP NAVBAR WITH DROPDOWNS ================= */}
            <header className={`landing-navbar ${scrolled ? "scrolled" : ""}`} ref={navRef}>
                <div className="nav-inner">
                    <div className="brand-logo-area" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <div className="brand-leaf-icon">
                            <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "32px", height: "32px", objectFit: "contain", display: "block" }} />
                        </div>
                        <div className="brand-text-col">
                            <span className="brand-main-name">AgriMind</span>
                            <span className="brand-sub-badge">SMART AGRICULTURE</span>
                        </div>
                    </div>

                    <nav className="nav-links-menu">
                        {/* 1. Home ▾ */}
                        <div className="nav-dropdown-item">
                            <button
                                className={`nav-dropdown-trigger ${activeDropdown === "home" ? "active" : ""}`}
                                onClick={() => toggleDropdown("home")}
                            >
                                <span>Home</span>
                                <span className="dropdown-arrow">▾</span>
                            </button>
                            {activeDropdown === "home" && (
                                <div className="nav-dropdown-panel">
                                    <button className="dropdown-link-btn" onClick={() => { setActiveDropdown(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                                        <div className="dropdown-icon-box">🏠</div>
                                        <span>Overview</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("how-it-works")}>
                                        <div className="dropdown-icon-box">⚙️</div>
                                        <span>How AgriMind Works</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("solutions")}>
                                        <div className="dropdown-icon-box">🌱</div>
                                        <span>Why AgriMind AI</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/register")}>
                                        <div className="dropdown-icon-box">🚀</div>
                                        <span>Get Started</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. Features ▾ */}
                        <div className="nav-dropdown-item">
                            <button
                                className={`nav-dropdown-trigger ${activeDropdown === "features" ? "active" : ""}`}
                                onClick={() => toggleDropdown("features")}
                            >
                                <span>Features</span>
                                <span className="dropdown-arrow">▾</span>
                            </button>
                            {activeDropdown === "features" && (
                                <div className="nav-dropdown-panel">
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/detection")}>
                                        <div className="dropdown-icon-box">🔬</div>
                                        <span>AI Disease Detection</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/crops")}>
                                        <div className="dropdown-icon-box">🌿</div>
                                        <span>Crop Management</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/weather")}>
                                        <div className="dropdown-icon-box">🌤️</div>
                                        <span>Weather & Advisory</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/insights")}>
                                        <div className="dropdown-icon-box">⚡</div>
                                        <span>AI Insights</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/history")}>
                                        <div className="dropdown-icon-box">📋</div>
                                        <span>Detection History</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/learning")}>
                                        <div className="dropdown-icon-box">📚</div>
                                        <span>Learning Hub</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. Solutions ▾ */}
                        <div className="nav-dropdown-item">
                            <button
                                className={`nav-dropdown-trigger ${activeDropdown === "solutions" ? "active" : ""}`}
                                onClick={() => toggleDropdown("solutions")}
                            >
                                <span>Solutions</span>
                                <span className="dropdown-arrow">▾</span>
                            </button>
                            {activeDropdown === "solutions" && (
                                <div className="nav-dropdown-panel">
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("solutions")}>
                                        <div className="dropdown-icon-box">🎯</div>
                                        <span>Disease Detection Solution</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("solutions")}>
                                        <div className="dropdown-icon-box">🌾</div>
                                        <span>Smart Crop Management</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("weather-preview")}>
                                        <div className="dropdown-icon-box">🌦️</div>
                                        <span>Weather Intelligence</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("solutions")}>
                                        <div className="dropdown-icon-box">💡</div>
                                        <span>AI Agricultural Insights</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/learning")}>
                                        <div className="dropdown-icon-box">📖</div>
                                        <span>Farmer Learning</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 4. Crops ▾ */}
                        <div className="nav-dropdown-item">
                            <button
                                className={`nav-dropdown-trigger ${activeDropdown === "crops" ? "active" : ""}`}
                                onClick={() => toggleDropdown("crops")}
                            >
                                <span>Crops</span>
                                <span className="dropdown-arrow">▾</span>
                            </button>
                            {activeDropdown === "crops" && (
                                <div className="nav-dropdown-panel" style={{ minWidth: "220px" }}>
                                    {supportedCrops.slice(0, 6).map((c, idx) => (
                                        <button
                                            key={`crop-nav-${idx}`}
                                            className="dropdown-link-btn"
                                            onClick={() => handleNavigation("/crops")}
                                        >
                                            <div className="dropdown-icon-box">🌱</div>
                                            <span>{c.name}</span>
                                        </button>
                                    ))}
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("crops-section")}>
                                        <div className="dropdown-icon-box">✨</div>
                                        <span>View All Supported Crops →</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 5. More ▾ */}
                        <div className="nav-dropdown-item">
                            <button
                                className={`nav-dropdown-trigger ${activeDropdown === "more" ? "active" : ""}`}
                                onClick={() => toggleDropdown("more")}
                            >
                                <span>More</span>
                                <span className="dropdown-arrow">▾</span>
                            </button>
                            {activeDropdown === "more" && (
                                <div className="nav-dropdown-panel">
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("farmers-needs")}>
                                        <div className="dropdown-icon-box">🚜</div>
                                        <span>Built for Farmers</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("about-section")}>
                                        <div className="dropdown-icon-box">ℹ️</div>
                                        <span>About AgriMind AI</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => handleNavigation("/learning")}>
                                        <div className="dropdown-icon-box">📚</div>
                                        <span>Learning Hub</span>
                                    </button>
                                    <button className="dropdown-link-btn" onClick={() => scrollToSection("contact-section")}>
                                        <div className="dropdown-icon-box">✉️</div>
                                        <span>Contact & FAQ</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* ONLY Language and Login in Navbar */}
                    <div className="nav-right-actions">
                        <div
                            className="nav-lang-pill"
                            onClick={() => setLanguage(language === "en" ? "mr" : language === "mr" ? "hi" : "en")}
                            title="Switch Language"
                        >
                            <span>🌐</span>
                            <span>{language === "mr" ? "मराठी" : language === "hi" ? "हिन्दी" : "English"}</span>
                        </div>

                        <button className="nav-login-btn" onClick={handleLogin}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            <span>Login</span>
                        </button>

                        {/* Mobile Hamburger Button */}
                        <button
                            className="mobile-toggle-btn"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Toggle navigation"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                <line x1="4" y1="6" x2="20" y2="6" />
                                <line x1="4" y1="12" x2="20" y2="12" />
                                <line x1="4" y1="18" x2="20" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer Overlay */}
                {mobileMenuOpen && (
                    <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
                        <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="mobile-drawer-header">
                                <div className="brand-logo-area">
                                    <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "30px", height: "30px" }} />
                                    <span style={{ fontSize: "18px", fontWeight: 800, color: "#0d281e" }}>AgriMind</span>
                                </div>
                                <button className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
                            </div>

                            <nav className="mobile-drawer-nav">
                                <button className="mobile-drawer-link" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                                    <span>🏠</span> Overview
                                </button>
                                <button className="mobile-drawer-link" onClick={() => scrollToSection("how-it-works")}>
                                    <span>⚙️</span> How It Works
                                </button>
                                <button className="mobile-drawer-link" onClick={() => scrollToSection("features")}>
                                    <span>✨</span> Core Features
                                </button>
                                <button className="mobile-drawer-link" onClick={() => scrollToSection("solutions")}>
                                    <span>🌱</span> Solutions
                                </button>
                                <button className="mobile-drawer-link" onClick={() => scrollToSection("crops-section")}>
                                    <span>🌾</span> Supported Crops
                                </button>
                                <button className="mobile-drawer-link" onClick={() => scrollToSection("weather-preview")}>
                                    <span>🌤️</span> Weather Advisory
                                </button>
                                <button className="mobile-drawer-link" onClick={() => scrollToSection("about-section")}>
                                    <span>ℹ️</span> About AgriMind
                                </button>
                                <button className="mobile-drawer-link" onClick={() => handleNavigation("/detection")}>
                                    <span>🔬</span> AI Disease Detection
                                </button>
                            </nav>

                            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <button
                                    className="hero-primary-btn"
                                    style={{ width: "100%", justifyContent: "center" }}
                                    onClick={handleGetStarted}
                                >
                                    Get Started Free
                                </button>
                                <button
                                    className="hero-secondary-btn"
                                    style={{ width: "100%", justifyContent: "center" }}
                                    onClick={handleLogin}
                                >
                                    Sign In to Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ================= HERO SECTION (CLEAN - NO FLOATING AI STICKERS) ================= */}
            <section className="landing-hero-section">
                <div className="hero-bg-glow" />
                <div className="landing-container">
                    <div className="hero-grid-2col">
                        <div className="hero-content-col">
                            <div className="hero-eyebrow-pill">
                                <span>🌱</span>
                                <span>AI POWERED AGRICULTURE PLATFORM</span>
                            </div>

                            <h1 className="hero-main-h1">
                                Your Farm.<br />
                                Our AI.<br />
                                <span className="highlight-green">A Brighter Tomorrow.</span>
                            </h1>

                            <p className="hero-lead-text">
                                AgriMind AI brings disease detection, crop management, weather information, agricultural insights and farmer learning into one smart platform.
                            </p>

                            <div className="hero-cta-row">
                                <button className="hero-primary-btn" onClick={handleGetStarted}>
                                    <span>Get Started Free</span>
                                    <span>→</span>
                                </button>

                                <button className="hero-secondary-btn" onClick={() => setShowDemoModal(true)}>
                                    <div className="hero-play-icon">▶</div>
                                    <span>Watch Video Demo</span>
                                </button>
                            </div>

                            {/* Truthful capabilities without fake claims */}
                            <div className="hero-capabilities-strip">
                                <div className="hero-cap-item">
                                    <div className="hero-cap-icon">🔬</div>
                                    <div className="cap-texts">
                                        <span className="cap-title">AI Disease Detection</span>
                                        <span className="cap-subtitle">Early leaf diagnosis</span>
                                    </div>
                                </div>

                                <div className="hero-cap-item">
                                    <div className="hero-cap-icon">🌿</div>
                                    <div className="cap-texts">
                                        <span className="cap-title">Multi-Crop Support</span>
                                        <span className="cap-subtitle">Grains, cereals, cash crops</span>
                                    </div>
                                </div>

                                <div className="hero-cap-item">
                                    <div className="hero-cap-icon">🌤️</div>
                                    <div className="cap-texts">
                                        <span className="cap-title">Weather Intelligence</span>
                                        <span className="cap-subtitle">Spray advisory & forecast</span>
                                    </div>
                                </div>

                                <div className="hero-cap-item">
                                    <div className="hero-cap-icon">🚜</div>
                                    <div className="cap-texts">
                                        <span className="cap-title">Crop Management</span>
                                        <span className="cap-subtitle">Growth tracking & logs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clean Hero Image - NO floating stickers */}
                        <div className="hero-image-col">
                            <div className="hero-image-frame">
                                <img
                                    src="/images/landing_hero_farmer.jpg"
                                    alt="Modern Indian Agriculture with AgriMind AI"
                                    className="hero-main-farmer-img"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= 6 CORE FEATURES SECTION ================= */}
            <section id="features" className="features-app-section">
                <div className="landing-container">
                    <div className="section-header-centered">
                        <span className="section-eyebrow">COMPREHENSIVE ECOSYSTEM</span>
                        <h2 className="section-title">Everything You Need for Smarter Agriculture</h2>
                        <p className="section-subtext">Practical AI tools designed to support everyday agricultural decisions and protect farm harvest.</p>
                    </div>

                    <div className="features-six-grid">
                        <div className="feature-app-card" onClick={() => handleNavigation("/detection")}>
                            <div className="card-icon-round icon-bg-green">🔬</div>
                            <h3>AI Disease Detection</h3>
                            <p>Upload a crop or leaf image and analyze potential plant diseases using deep learning.</p>
                            <div className="card-learn-more-link">Explore Disease Detection →</div>
                        </div>

                        <div className="feature-app-card" onClick={() => handleNavigation("/crops")}>
                            <div className="card-icon-round icon-bg-emerald">🌿</div>
                            <h3>Crop Management</h3>
                            <p>Manage crops, monitor growth stages, and organize your seasonal farming activities.</p>
                            <div className="card-learn-more-link">Manage Crops →</div>
                        </div>

                        <div className="feature-app-card" onClick={() => handleNavigation("/weather")}>
                            <div className="card-icon-round icon-bg-blue">🌤️</div>
                            <h3>Weather & Advisory</h3>
                            <p>View location-based weather, temperature, rain risk, and agricultural spray advisories.</p>
                            <div className="card-learn-more-link">Check Weather →</div>
                        </div>

                        <div className="feature-app-card" onClick={() => handleNavigation("/insights")}>
                            <div className="card-icon-round icon-bg-amber">⚡</div>
                            <h3>AI Insights</h3>
                            <p>Turn detection and crop information into useful, practical agricultural insights.</p>
                            <div className="card-learn-more-link">View AI Insights →</div>
                        </div>

                        <div className="feature-app-card" onClick={() => handleNavigation("/history")}>
                            <div className="card-icon-round icon-bg-purple">📋</div>
                            <h3>Detection History</h3>
                            <p>View previously saved AI disease detection results and track field improvements over time.</p>
                            <div className="card-learn-more-link">View History →</div>
                        </div>

                        <div className="feature-app-card" onClick={() => handleNavigation("/learning")}>
                            <div className="card-icon-round icon-bg-rose">📚</div>
                            <h3>Learning Hub</h3>
                            <p>Provide practical agricultural learning resources, disease prevention tips, and modern practices.</p>
                            <div className="card-learn-more-link">Explore Learning →</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= SOLUTIONS SECTION ================= */}
            <section id="solutions" className="solutions-section">
                <div className="landing-container">
                    <div className="section-header-centered">
                        <span className="section-eyebrow">INTEGRATED FARMING</span>
                        <h2 className="section-title">Smart Agriculture. Connected.</h2>
                        <p className="section-subtext">
                            AgriMind AI connects disease detection, crop management, weather intelligence, and farmer learning into a continuous decision-support workflow.
                        </p>
                    </div>

                    <div className="workflow-steps-grid">
                        <div className="workflow-card">
                            <span className="workflow-num">STEP 1</span>
                            <h4>Observe</h4>
                            <p>Spot any abnormalities or leaf symptoms in your field during regular crop inspection.</p>
                        </div>

                        <div className="workflow-card">
                            <span className="workflow-num">STEP 2</span>
                            <h4>Analyze</h4>
                            <p>Use AI-assisted crop analysis to identify potential disease patterns from uploaded photos.</p>
                        </div>

                        <div className="workflow-card">
                            <span className="workflow-num">STEP 3</span>
                            <h4>Understand</h4>
                            <p>Review the available diagnostic insights, organic recommendations, and weather conditions.</p>
                        </div>

                        <div className="workflow-card">
                            <span className="workflow-num">STEP 4</span>
                            <h4>Act</h4>
                            <p>Use the available information to support smart spray timing and crop management decisions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= HOW AGRIMIND WORKS (4-STEP SHOWCASE) ================= */}
            <section id="how-it-works" className="showcase-how-section">
                <div className="landing-container">
                    <div className="showcase-two-col">
                        <div className="showcase-text-side">
                            <span className="section-eyebrow">HOW AGRIMIND AI WORKS</span>
                            <h2>Simple, Accurate & Farmer-Friendly</h2>
                            <p className="lead">
                                Designed from the ground up for seamless operation in rural environments, with fast mobile diagnostics and actionable guidance.
                            </p>

                            <ul className="checkmarks-list">
                                <li>
                                    <span className="check-green-badge">01</span>
                                    <span><strong>Capture:</strong> Farmer captures or uploads a crop leaf image directly from the field.</span>
                                </li>
                                <li>
                                    <span className="check-green-badge">02</span>
                                    <span><strong>Analyze:</strong> AgriMind AI analyzes the image using the existing neural detection model.</span>
                                </li>
                                <li>
                                    <span className="check-green-badge">03</span>
                                    <span><strong>Understand:</strong> Review the detection result and supporting agricultural information.</span>
                                </li>
                                <li>
                                    <span className="check-green-badge">04</span>
                                    <span><strong>Act:</strong> Use crop management, weather advisories, and expert learning resources.</span>
                                </li>
                            </ul>

                            <button className="hero-primary-btn" onClick={handleGetStarted}>
                                <span>Get Started Free</span>
                                <span>→</span>
                            </button>
                        </div>

                        {/* Phone Mockup Demonstration */}
                        <div className="phone-showcase-container">
                            <div className="phone-mockup-frame">
                                <div className="phone-camera-notch" />
                                <img
                                    src="/images/landing_phone_leaf.jpg"
                                    alt="Leaf Disease Detection Showcase"
                                    className="phone-leaf-preview"
                                />
                                <div className="phone-diagnosis-card">
                                    <div className="diag-status-row">
                                        <span className="diag-alert-badge">● AI Analysis</span>
                                        <span className="diag-conf-badge">Confidence: 94%</span>
                                    </div>
                                    <h4 className="diag-title-name">Bacterial Leaf Spot</h4>
                                    <span className="diag-crop-name">Cotton / Soybean Crop</span>
                                    <button
                                        className="btn-view-treatment-sm"
                                        onClick={() => handleNavigation("/detection")}
                                    >
                                        Upload Leaf Image →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= EXPLORE SUPPORTED CROPS ================= */}
            <section id="crops-section" className="crops-showcase-section">
                <div className="landing-container">
                    <div className="section-header-centered">
                        <span className="section-eyebrow">AGRICULTURAL CAPABILITY</span>
                        <h2 className="section-title">Explore Supported Crops</h2>
                        <p className="section-subtext">Dedicated model architectures and diagnostic classes for prominent Indian agricultural crops.</p>
                    </div>

                    <div className="crops-eight-grid">
                        {supportedCrops.map((crop, idx) => (
                            <div
                                key={`crop-${idx}`}
                                className="crop-landing-card"
                                onClick={() => handleNavigation(crop.link)}
                            >
                                <div className="crop-card-img-wrap">
                                    <img src={crop.image} alt={crop.name} />
                                    <span className="crop-cat-tag">{crop.category}</span>
                                </div>
                                <div className="crop-card-content">
                                    <h4 className="crop-card-title">{crop.name}</h4>
                                    <p className="crop-card-desc">{crop.desc}</p>
                                    <span className="crop-card-btn">Explore Crop →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= WEATHER PREVIEW (DYNAMIC API / NO FAKE DATA) ================= */}
            <section id="weather-preview" className="weather-sustainability-section">
                <div className="landing-container">
                    <div className="weather-feature-strip">
                        <div className="weather-left-info">
                            <span className="section-eyebrow">WEATHER-AWARE FARMING</span>
                            <h3>Weather Intelligence for Farm Decisions</h3>
                            <p>
                                Sync spray activities, irrigation, and harvest planning with accurate real-time forecasts to prevent fertilizer wash-off and disease risks.
                            </p>
                            <button className="hero-primary-btn" onClick={() => handleNavigation("/weather")}>
                                <span>Check Weather for Your Farm →</span>
                            </button>
                        </div>

                        <div className="weather-live-tile">
                            <div className="weather-tile-top">
                                <div className="weather-loc-tag">
                                    <span>📍</span>
                                    <span>{weatherPreview?.location_name || "Regional Weather Station"}</span>
                                </div>
                                <span className="live-pill-sm">Live OpenWeather</span>
                            </div>

                            {weatherPreview?.current ? (
                                <>
                                    <div className="weather-temp-hero-row">
                                        <div className="weather-big-temp">
                                            {Math.round(weatherPreview.current.temperature)}°C
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f291e" }}>
                                                {weatherPreview.current.condition || "Clear"}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                Feels like {Math.round(weatherPreview.current.feels_like)}°C
                                            </div>
                                        </div>
                                    </div>

                                    <div className="weather-sub-metrics">
                                        <div className="sub-metric-box">
                                            <span className="sub-lbl">Humidity</span>
                                            <span className="sub-val">{weatherPreview.current.humidity}%</span>
                                        </div>
                                        <div className="sub-metric-box">
                                            <span className="sub-lbl">Wind</span>
                                            <span className="sub-val">{weatherPreview.current.wind_speed} km/h</span>
                                        </div>
                                        <div className="sub-metric-box">
                                            <span className="sub-lbl">Conditions</span>
                                            <span className="sub-val">Active</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b", fontSize: "13.5px" }}>
                                    <span>Location-aware weather intelligence ready for your farm.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= BUILT AROUND FARMERS' NEEDS (TRUSTWORTHY) ================= */}
            <section id="farmers-needs" className="farmers-needs-section">
                <div className="landing-container">
                    <div className="section-header-centered">
                        <span className="section-eyebrow">OUR COMMITMENT</span>
                        <h2 className="section-title">Built Around Farmers' Needs</h2>
                        <p className="section-subtext">Designed with simplicity, connectivity, and practical usefulness at every step.</p>
                    </div>

                    <div className="needs-three-grid">
                        <div className="need-card">
                            <div className="need-card-icon">🎯</div>
                            <h3>Simple</h3>
                            <p>Designed to be intuitive and straightforward for farmers to operate directly in the field on any device.</p>
                        </div>

                        <div className="need-card">
                            <div className="need-card-icon">🔗</div>
                            <h3>Connected</h3>
                            <p>Disease detection, crop management, weather advisory, and agricultural learning all available in one unified platform.</p>
                        </div>

                        <div className="need-card">
                            <div className="need-card-icon">⚡</div>
                            <h3>Practical</h3>
                            <p>Information and recommendations presented in a clear, actionable format to support real farming decisions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= ABOUT SECTION ================= */}
            <section id="about-section" className="about-project-section">
                <div className="landing-container">
                    <div className="section-header-centered" style={{ maxWidth: "820px" }}>
                        <span className="section-eyebrow">ABOUT AGRIMIND AI</span>
                        <h2 className="section-title">Technology for Healthier Crops and Stronger Farmers</h2>
                        <p className="section-subtext" style={{ fontSize: "16px", lineHeight: "1.7", marginTop: "16px" }}>
                            AgriMind AI is a smart agriculture platform designed to bring AI-assisted disease detection, crop management, weather information, agricultural insights and learning resources together in one farmer-friendly experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= FINAL CTA BANNER ================= */}
            <section className="final-cta-section">
                <div className="landing-container">
                    <div className="cta-box-center">
                        <h2>Make Your Farm Smarter With AgriMind AI</h2>
                        <p>Detect earlier. Understand better. Manage smarter.</p>
                        <button className="btn-cta-white" onClick={handleGetStarted}>
                            Get Started Free →
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer id="contact-section" className="landing-footer">
                <div className="landing-container">
                    <div className="footer-grid-5col">
                        <div className="footer-brand-col">
                            <div className="brand-logo-area" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                                <div className="brand-leaf-icon">
                                    <img src="/images/agrimind-logo.png" alt="AgriMind Logo" style={{ width: "32px", height: "32px", objectFit: "contain", display: "block" }} />
                                </div>
                                <div className="brand-text-col">
                                    <span className="brand-main-name" style={{ color: "#ffffff" }}>AgriMind</span>
                                    <span className="brand-sub-badge">SMART AGRICULTURE</span>
                                </div>
                            </div>
                            <p>Empowering farmers with artificial intelligence for healthier crops and a more sustainable agricultural future.</p>
                            
                            {/* Professional Luxury Social Media Connect */}
                            <div className="footer-social-row">
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-btn" title="Twitter / X">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-social-btn" title="LinkedIn">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                                    </svg>
                                </a>
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-social-btn" title="GitHub">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                    </svg>
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="footer-social-btn" title="YouTube">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Explore */}
                        <div className="footer-nav-col">
                            <h5>Explore</h5>
                            <ul>
                                <li><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</button></li>
                                <li><button onClick={() => scrollToSection("features")}>Features</button></li>
                                <li><button onClick={() => scrollToSection("solutions")}>Solutions</button></li>
                                <li><button onClick={() => scrollToSection("crops-section")}>Crops</button></li>
                            </ul>
                        </div>

                        {/* Platform */}
                        <div className="footer-nav-col">
                            <h5>Platform</h5>
                            <ul>
                                <li><button onClick={() => handleNavigation("/detection")}>Disease Detection</button></li>
                                <li><button onClick={() => handleNavigation("/crops")}>Crop Management</button></li>
                                <li><button onClick={() => handleNavigation("/weather")}>Weather & Advisory</button></li>
                                <li><button onClick={() => handleNavigation("/insights")}>AI Insights</button></li>
                                <li><button onClick={() => handleNavigation("/learning")}>Learning Hub</button></li>
                                <li><button onClick={() => handleNavigation("/history")}>Detection History</button></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="footer-nav-col">
                            <h5>Company</h5>
                            <ul>
                                <li><button onClick={() => scrollToSection("about-section")}>About</button></li>
                                <li><button onClick={() => scrollToSection("contact-section")}>Contact</button></li>
                                <li><button onClick={() => scrollToSection("farmers-needs")}>FAQ</button></li>
                            </ul>
                        </div>

                        {/* Account */}
                        <div className="footer-nav-col">
                            <h5>Account</h5>
                            <ul>
                                <li><button onClick={() => handleNavigation("/login")}>Login</button></li>
                                <li><button onClick={() => handleNavigation("/register")}>Register</button></li>
                                <li><button onClick={() => handleNavigation("/settings")}>Settings</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom-row">
                        <span>© 2026 AgriMind AI. All rights reserved.</span>
                        <div style={{ display: "flex", gap: "16px" }}>
                            <span>Sustainable Agriculture</span>
                            <span>•</span>
                            <span>Food Security</span>
                            <span>•</span>
                            <span>Built for Farmers</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ================= DEMO MODAL ================= */}
            {showDemoModal && (
                <div className="demo-modal-overlay" onClick={() => setShowDemoModal(false)}>
                    <div className="demo-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="demo-modal-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "20px" }}>🎬</span>
                                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f291e" }}>AgriMind AI — How It Works</h3>
                            </div>
                            <button
                                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
                                onClick={() => setShowDemoModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="demo-modal-body">
                            <div className="demo-step-row">
                                <div className="demo-step-num">1</div>
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800 }}>Upload Crop Leaf Image</h4>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Capture or upload an image of an affected leaf right from your smartphone in the field.</p>
                                </div>
                            </div>

                            <div className="demo-step-row">
                                <div className="demo-step-num">2</div>
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800 }}>Instant AI Diagnosis</h4>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>EfficientNet deep learning model inspects lesion patterns to identify potential diseases.</p>
                                </div>
                            </div>

                            <div className="demo-step-row">
                                <div className="demo-step-num">3</div>
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800 }}>Weather-Synchronized Guidance</h4>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Receive organic & chemical recommendations timed with rainfall probability for maximum effectiveness.</p>
                                </div>
                            </div>

                            <button
                                className="hero-primary-btn"
                                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
                                onClick={() => {
                                    setShowDemoModal(false);
                                    handleGetStarted();
                                }}
                            >
                                Try Disease Detection Now →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
