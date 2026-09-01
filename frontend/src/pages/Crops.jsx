import React from "react";
import { useNavigate } from "react-router-dom";

function Crops() {
    const navigate = useNavigate();

    // =========================================================
    // CROP DATA
    // =========================================================

    const crops = [
        {
            name: "Soybean",
            image:
                "https://commons.wikimedia.org/wiki/Special:FilePath/Soybean_leaves.jpg",

            description:
                "AI-powered disease detection for soybean leaves.",

            diseases: [
                "Bacterial Blight",
                "Cercospora Leaf Blight",
                "Healthy",
                "Rust",
                "Sudden Death Syndrome",
            ],

            status: "AI Detection Available",
            category: "Pulse Crop",
            supported: true,
        },

        {
            name: "Cotton",
            image:
                "https://commons.wikimedia.org/wiki/Special:FilePath/Cotton_plant.jpg",

            description:
                "AI-powered disease detection for cotton leaves.",

            diseases: [
                "Alternaria Leaf Spot",
                "Bacterial Blight",
                "Fusarium Wilt",
                "Healthy Leaf",
                "Verticillium Wilt",
            ],

            status: "AI Detection Available",
            category: "Fiber Crop",
            supported: true,
        },

        {
            name: "Maize",
            image:
                "https://commons.wikimedia.org/wiki/Special:FilePath/Maize_plant.jpg",

            description:
                "AI-powered disease detection for maize leaves.",

            diseases: [
                "Blight",
                "Common Rust",
                "Gray Leaf Spot",
                "Healthy",
            ],

            status: "AI Detection Available",
            category: "Cereal Crop",
            supported: true,
        },

        {
            name: "Wheat",
            image:
                "https://commons.wikimedia.org/wiki/Special:FilePath/The_wheat_field.jpg",

            description:
                "AI-powered disease detection for wheat leaves.",

            diseases: [
                "Brown Rust",
                "Healthy",
                "Yellow Rust",
            ],

            status: "AI Detection Available",
            category: "Cereal Crop",
            supported: true,
        },

        {
            name: "Tomato",
            image:
                "https://commons.wikimedia.org/wiki/Special:FilePath/Tomato_plant_image.jpg",

            description:
                "Smart disease identification for tomato plant leaves.",

            diseases: [
                "Early Blight",
                "Late Blight",
                "Leaf Mold",
            ],

            status: "Coming Soon",
            category: "Vegetable Crop",
            supported: false,
        },

        {
            name: "Bell Pepper",
            image:
                "https://commons.wikimedia.org/wiki/Special:FilePath/Green_Bell_pepper_plant.jpg",

            description:
                "Plant health monitoring and disease detection for bell pepper.",

            diseases: [
                "Bacterial Spot",
                "Leaf Spot",
                "Mosaic Virus",
            ],

            status: "Coming Soon",
            category: "Vegetable Crop",
            supported: false,
        },
    ];

    // =========================================================
    // ANALYZE CROP
    // =========================================================

    const handleAnalyze = (crop) => {
        if (!crop.supported) {
            return;
        }

        const cropName = crop.name.trim().toLowerCase();

        sessionStorage.removeItem("selectedCrop");

        sessionStorage.setItem(
            "selectedCrop",
            cropName
        );

        navigate("/detection", {
            state: {
                crop: cropName,
            },
        });
    };

    // =========================================================
    // COUNTS
    // =========================================================

    const supportedCount = crops.filter(
        (crop) => crop.supported
    ).length;

    const comingSoonCount = crops.filter(
        (crop) => !crop.supported
    ).length;

    // =========================================================
    // IMAGE FALLBACK
    // =========================================================

    const handleImageError = (event) => {
        event.currentTarget.style.display = "none";

        const parent = event.currentTarget.parentElement;

        if (parent) {
            parent.classList.add("image-error");
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="crops-page">

            <style>{`

                /* =====================================================
                   PAGE
                ===================================================== */

                .crops-page {
                    width: 100%;
                    min-height: 100%;
                    padding: 34px 36px 80px;

                    color: #10261a;

                    background:
                        radial-gradient(
                            circle at 92% 0%,
                            rgba(34,197,94,.10),
                            transparent 26%
                        ),
                        radial-gradient(
                            circle at 10% 20%,
                            rgba(22,163,74,.045),
                            transparent 25%
                        ),
                        linear-gradient(
                            180deg,
                            #f8fcfa 0%,
                            #f3f8f5 100%
                        );
                }

                .crops-page * {
                    box-sizing: border-box;
                }


                /* =====================================================
                   HERO / MAIN HEADER
                ===================================================== */

                .crops-hero {
                    position: relative;
                    overflow: hidden;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 30px;

                    min-height: 205px;

                    margin-bottom: 24px;
                    padding: 30px 34px;

                    border:
                        1px solid #dcebe1;

                    border-radius: 24px;

                    background:
                        linear-gradient(
                            135deg,
                            #ffffff 0%,
                            #f5fbf7 62%,
                            #eaf8ef 100%
                        );

                    box-shadow:
                        0 12px 34px
                        rgba(15,60,30,.055);
                }

                .crops-hero::before {
                    content: "";

                    position: absolute;

                    width: 260px;
                    height: 260px;

                    right: -100px;
                    top: -130px;

                    border-radius: 50%;

                    border:
                        1px solid
                        rgba(22,163,74,.12);

                    box-shadow:
                        0 0 0 32px
                        rgba(22,163,74,.025),
                        0 0 0 65px
                        rgba(22,163,74,.018);
                }

                .crops-hero::after {
                    content: "";

                    position: absolute;

                    width: 180px;
                    height: 180px;

                    right: 105px;
                    bottom: -125px;

                    border-radius: 50%;

                    background:
                        rgba(34,197,94,.045);
                }

                .crops-hero-content {
                    position: relative;
                    z-index: 2;

                    max-width: 800px;
                }

                .crops-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;

                    margin-bottom: 10px;

                    color: #15803d;

                    font-size: 11px;
                    font-weight: 900;

                    letter-spacing: 1.8px;
                    text-transform: uppercase;
                }

                .crops-eyebrow::before {
                    content: "";

                    width: 24px;
                    height: 3px;

                    border-radius: 10px;

                    background:
                        linear-gradient(
                            90deg,
                            #16a34a,
                            #4ade80
                        );
                }

                .crops-hero h1 {
                    margin: 0;

                    color: #062417;

                    font-size: 40px;
                    line-height: 1.05;

                    font-weight: 950;

                    letter-spacing: -1.5px;
                }

                .crops-hero-description {
                    max-width: 760px;

                    margin: 12px 0 0;

                    color: #64748b;

                    font-size: 14px;
                    line-height: 1.7;
                }

                .crops-hero-badge {
                    position: relative;
                    z-index: 2;

                    flex-shrink: 0;

                    display: flex;
                    align-items: center;
                    gap: 12px;

                    padding: 13px 17px;

                    border:
                        1px solid #bbf7d0;

                    border-radius: 15px;

                    background:
                        rgba(255,255,255,.82);

                    box-shadow:
                        0 8px 22px
                        rgba(22,163,74,.07);

                    backdrop-filter: blur(10px);
                }

                .hero-badge-icon {
                    position: relative;

                    width: 39px;
                    height: 39px;

                    border-radius: 12px;

                    background:
                        linear-gradient(
                            145deg,
                            #dcfce7,
                            #bbf7d0
                        );
                }

                .hero-badge-icon::before {
                    content: "";

                    position: absolute;

                    width: 18px;
                    height: 9px;

                    left: 10px;
                    top: 13px;

                    border:
                        2px solid #15803d;

                    border-radius:
                        100% 0 100% 0;

                    transform:
                        rotate(-35deg);
                }

                .hero-badge-icon::after {
                    content: "";

                    position: absolute;

                    width: 2px;
                    height: 17px;

                    left: 19px;
                    top: 16px;

                    border-radius: 3px;

                    background: #15803d;

                    transform: rotate(25deg);
                }

                .hero-badge-label {
                    margin: 0 0 2px;

                    color: #64748b;

                    font-size: 10px;
                    font-weight: 800;

                    text-transform: uppercase;
                    letter-spacing: .8px;
                }

                .hero-badge-value {
                    margin: 0;

                    color: #14532d;

                    font-size: 13px;
                    font-weight: 900;
                }


                /* =====================================================
                   SUMMARY
                ===================================================== */

                .crop-summary {
                    display: grid;

                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));

                    gap: 17px;

                    margin-bottom: 34px;
                }

                .crop-summary-card {
                    position: relative;

                    display: flex;
                    align-items: center;

                    gap: 15px;

                    min-height: 96px;

                    padding: 19px;

                    overflow: hidden;

                    background:
                        rgba(255,255,255,.98);

                    border:
                        1px solid #e1ebe5;

                    border-radius: 17px;

                    box-shadow:
                        0 7px 24px
                        rgba(15,60,30,.045);

                    transition:
                        transform .2s ease,
                        box-shadow .2s ease,
                        border-color .2s ease;
                }

                .crop-summary-card:hover {
                    transform:
                        translateY(-3px);

                    border-color:
                        #c7ead2;

                    box-shadow:
                        0 13px 30px
                        rgba(15,60,30,.08);
                }

                .crop-summary-card::after {
                    content: "";

                    position: absolute;

                    width: 95px;
                    height: 95px;

                    right: -47px;
                    bottom: -49px;

                    border-radius: 50%;

                    background:
                        rgba(34,197,94,.055);
                }

                .crop-summary-icon {
                    position: relative;
                    z-index: 1;

                    width: 50px;
                    height: 50px;

                    min-width: 50px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 14px;

                    background:
                        #ecfdf3;
                }

                .summary-icon {
                    position: relative;

                    width: 23px;
                    height: 23px;
                }

                .summary-plant::before {
                    content: "";

                    position: absolute;

                    width: 3px;
                    height: 17px;

                    left: 11px;
                    top: 7px;

                    border-radius: 4px;

                    background: #15803d;
                }

                .summary-plant::after {
                    content: "";

                    position: absolute;

                    width: 13px;
                    height: 8px;

                    left: 1px;
                    top: 4px;

                    border:
                        2px solid #22c55e;

                    border-radius:
                        100% 0 100% 0;

                    transform:
                        rotate(-25deg);
                }

                .summary-ai {
                    border:
                        2px solid #16a34a;

                    border-radius: 7px;
                }

                .summary-ai::before {
                    content: "";

                    position: absolute;

                    width: 6px;
                    height: 6px;

                    left: 7px;
                    top: 7px;

                    border-radius: 50%;

                    background: #22c55e;
                }

                .summary-ai::after {
                    content: "";

                    position: absolute;

                    width: 27px;
                    height: 2px;

                    left: -4px;
                    top: 10px;

                    background: #16a34a;

                    box-shadow:
                        0 -7px 0 -0.2px #16a34a,
                        0 7px 0 -0.2px #16a34a;
                }

                .summary-rocket {
                    width: 20px;
                    height: 26px;

                    border:
                        2px solid #16a34a;

                    border-radius:
                        50% 50% 45% 45%;

                    transform:
                        rotate(45deg);
                }

                .summary-rocket::before {
                    content: "";

                    position: absolute;

                    width: 6px;
                    height: 6px;

                    left: 5px;
                    top: 5px;

                    border:
                        2px solid #16a34a;

                    border-radius: 50%;
                }

                .summary-rocket::after {
                    content: "";

                    position: absolute;

                    width: 7px;
                    height: 4px;

                    left: 5px;
                    bottom: -6px;

                    border-radius: 50%;

                    background: #22c55e;
                }

                .crop-summary-label {
                    margin: 0 0 4px;

                    color: #718096;

                    font-size: 11px;
                    font-weight: 800;

                    letter-spacing: .2px;
                }

                .crop-summary-value {
                    margin: 0;

                    color: #082518;

                    font-size: 26px;
                    line-height: 1;

                    font-weight: 950;
                }


                /* =====================================================
                   SECTION HEADER
                ===================================================== */

                .crops-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 20px;

                    margin:
                        34px 0 17px;
                }

                .section-title-wrap {
                    position: relative;
                }

                .section-title-wrap h2 {
                    margin: 0;

                    color: #082518;

                    font-size: 24px;
                    font-weight: 950;

                    letter-spacing: -.6px;
                }

                .section-title-wrap p {
                    margin: 5px 0 0;

                    color: #718096;

                    font-size: 13px;
                }

                .section-line {
                    width: 42px;
                    height: 3px;

                    margin-top: 10px;

                    border-radius: 10px;

                    background:
                        linear-gradient(
                            90deg,
                            #16a34a,
                            #4ade80
                        );
                }


                /* =====================================================
                   GRID
                ===================================================== */

                .crops-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));

                    gap: 20px;
                }


                /* =====================================================
                   CARD
                ===================================================== */

                .crop-card {
                    position: relative;

                    overflow: hidden;

                    background:
                        #ffffff;

                    border:
                        1px solid #e2ebe5;

                    border-radius: 20px;

                    box-shadow:
                        0 8px 27px
                        rgba(15,60,30,.052);

                    transition:
                        transform .25s ease,
                        box-shadow .25s ease,
                        border-color .25s ease;
                }

                .crop-card.supported {
                    cursor: pointer;
                }

                .crop-card.supported:hover {
                    transform:
                        translateY(-5px);

                    border-color:
                        #8be3a5;

                    box-shadow:
                        0 19px 40px
                        rgba(21,128,61,.13);
                }

                .crop-card.disabled {
                    opacity: .79;
                }


                /* =====================================================
                   IMAGE
                ===================================================== */

                .crop-image-wrap {
                    position: relative;

                    width: 100%;
                    height: 225px;

                    overflow: hidden;

                    background:
                        linear-gradient(
                            135deg,
                            #dff5e5,
                            #effaf2
                        );
                }

                .crop-image {
                    width: 100%;
                    height: 100%;

                    display: block;

                    object-fit: cover;
                    object-position: center;

                    transition:
                        transform .6s ease,
                        filter .4s ease;
                }

                .crop-card.supported:hover
                .crop-image {
                    transform:
                        scale(1.06);

                    filter:
                        saturate(1.05);
                }

                .crop-image-overlay {
                    position: absolute;

                    inset: 0;

                    background:
                        linear-gradient(
                            180deg,
                            rgba(3,15,8,.02) 25%,
                            rgba(3,15,8,.60) 100%
                        );

                    pointer-events: none;
                }

                .crop-status {
                    position: absolute;

                    right: 14px;
                    top: 14px;

                    display: inline-flex;
                    align-items: center;

                    gap: 7px;

                    padding:
                        8px 11px;

                    border:
                        1px solid
                        rgba(255,255,255,.55);

                    border-radius: 999px;

                    background:
                        rgba(255,255,255,.94);

                    color: #15803d;

                    font-size: 10px;
                    font-weight: 900;

                    white-space: nowrap;

                    box-shadow:
                        0 5px 15px
                        rgba(0,0,0,.08);

                    backdrop-filter:
                        blur(8px);
                }

                .crop-status::before {
                    content: "";

                    width: 6px;
                    height: 6px;

                    border-radius: 50%;

                    background:
                        #22c55e;

                    box-shadow:
                        0 0 0 3px
                        #dcfce7;
                }

                .crop-status.soon {
                    color: #64748b;
                }

                .crop-status.soon::before {
                    background:
                        #94a3b8;

                    box-shadow:
                        0 0 0 3px
                        #e2e8f0;
                }

                .image-category {
                    position: absolute;

                    left: 16px;
                    bottom: 15px;

                    padding:
                        7px 10px;

                    border:
                        1px solid
                        rgba(255,255,255,.35);

                    border-radius: 8px;

                    background:
                        rgba(8,37,24,.40);

                    color:
                        #ffffff;

                    font-size: 10px;
                    font-weight: 850;

                    backdrop-filter:
                        blur(7px);
                }


                /* =====================================================
                   IMAGE CROP TUNING
                ===================================================== */

                .crop-card:nth-child(1)
                .crop-image {
                    object-position:
                        center 48%;
                }

                .crop-card:nth-child(2)
                .crop-image {
                    object-position:
                        center 45%;
                }

                .crop-card:nth-child(3)
                .crop-image {
                    object-position:
                        center 50%;
                }

                .crop-card:nth-child(4)
                .crop-image {
                    object-position:
                        center 52%;
                }


                /* =====================================================
                   CARD BODY
                ===================================================== */

                .crop-card-body {
                    padding: 21px;
                }

                .crop-card h3 {
                    margin:
                        0 0 7px;

                    color: #082518;

                    font-size: 21px;
                    line-height: 1.2;

                    font-weight: 950;

                    letter-spacing: -.4px;
                }

                .crop-description {
                    min-height: 42px;

                    margin: 0;

                    color: #718096;

                    font-size: 13px;
                    line-height: 1.65;
                }


                /* =====================================================
                   DISEASES
                ===================================================== */

                .crop-diseases {
                    margin-top: 19px;
                    padding-top: 17px;

                    border-top:
                        1px solid #edf2ef;
                }

                .crop-diseases-title {
                    display: flex;
                    align-items: center;

                    gap: 8px;

                    margin:
                        0 0 10px;

                    color: #334155;

                    font-size: 11px;
                    font-weight: 900;
                }

                .disease-title-icon {
                    position: relative;

                    width: 13px;
                    height: 13px;

                    display: inline-block;

                    border:
                        2px solid #22c55e;

                    border-radius: 50%;
                }

                .disease-title-icon::before {
                    content: "";

                    position: absolute;

                    width: 5px;
                    height: 2px;

                    left: -5px;
                    top: 4px;

                    border-radius: 3px;

                    background: #22c55e;

                    box-shadow:
                        16px 0 0 #22c55e;
                }

                .disease-list {
                    display: flex;
                    flex-wrap: wrap;

                    gap: 7px;

                    margin: 0;
                    padding: 0;

                    list-style: none;
                }

                .disease-tag {
                    padding:
                        6px 8px;

                    border:
                        1px solid #e9efeb;

                    border-radius: 8px;

                    background:
                        #f8faf9;

                    color: #52616b;

                    font-size: 10px;
                    font-weight: 700;

                    line-height: 1.25;

                    transition:
                        border-color .2s ease,
                        background .2s ease,
                        color .2s ease;
                }

                .disease-tag:hover {
                    border-color:
                        #bbf7d0;

                    background:
                        #f0fdf4;

                    color:
                        #166534;
                }


                /* =====================================================
                   BUTTON
                ===================================================== */

                .crop-button {
                    position: relative;

                    width: 100%;
                    height: 45px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    gap: 9px;

                    margin-top: 19px;

                    overflow: hidden;

                    border:
                        1px solid
                        rgba(255,255,255,.08);

                    border-radius: 11px;

                    background:
                        linear-gradient(
                            135deg,
                            #16a34a,
                            #0f8b40
                        );

                    color:
                        #ffffff;

                    font-size: 13px;
                    font-weight: 900;

                    cursor: pointer;

                    box-shadow:
                        0 7px 18px
                        rgba(22,163,74,.20);

                    transition:
                        transform .2s ease,
                        box-shadow .2s ease;
                }

                .crop-button:hover {
                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 12px 25px
                        rgba(22,163,74,.27);
                }

                .crop-button::after {
                    content: "";

                    position: absolute;

                    width: 80px;
                    height: 130px;

                    left: -100px;
                    top: -35px;

                    background:
                        rgba(255,255,255,.14);

                    transform:
                        rotate(25deg);

                    transition:
                        left .55s ease;
                }

                .crop-button:hover::after {
                    left: 115%;
                }

                .analyze-icon {
                    position: relative;

                    width: 16px;
                    height: 16px;

                    border:
                        2px solid #ffffff;

                    border-radius: 50%;
                }

                .analyze-icon::after {
                    content: "";

                    position: absolute;

                    width: 7px;
                    height: 2px;

                    right: -6px;
                    bottom: -3px;

                    border-radius: 3px;

                    background:
                        #ffffff;

                    transform:
                        rotate(45deg);
                }


                /* =====================================================
                   COMING SOON
                ===================================================== */

                .coming-soon-card {
                    box-shadow:
                        0 7px 22px
                        rgba(15,60,30,.035);
                }

                .coming-soon-card .crop-image {
                    filter:
                        saturate(.78);
                }


                /* =====================================================
                   INFO
                ===================================================== */

                .crop-info {
                    position: relative;

                    overflow: hidden;

                    margin-top: 34px;

                    padding:
                        26px 30px;

                    border:
                        1px solid #b9e9c8;

                    border-radius: 20px;

                    background:
                        linear-gradient(
                            135deg,
                            #effcf3,
                            #e8faee
                        );

                    box-shadow:
                        0 7px 22px
                        rgba(22,163,74,.035);
                }

                .crop-info::before {
                    content: "";

                    position: absolute;

                    width: 190px;
                    height: 190px;

                    right: -65px;
                    top: -100px;

                    border-radius: 50%;

                    border:
                        1px solid
                        rgba(22,163,74,.10);

                    box-shadow:
                        0 0 0 35px
                        rgba(22,163,74,.025),
                        0 0 0 70px
                        rgba(22,163,74,.015);
                }

                .info-top {
                    display: flex;
                    align-items: center;

                    gap: 12px;

                    margin-bottom: 11px;
                }

                .info-icon {
                    position: relative;

                    width: 39px;
                    height: 39px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border:
                        1px solid #b9e9c8;

                    border-radius: 11px;

                    background:
                        #ffffff;
                }

                .info-icon::before {
                    content: "i";

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    width: 19px;
                    height: 19px;

                    border:
                        2px solid #15803d;

                    border-radius: 50%;

                    color: #15803d;

                    font-size: 12px;
                    font-weight: 950;
                }

                .crop-info h2 {
                    position: relative;
                    z-index: 1;

                    margin: 0;

                    color: #14532d;

                    font-size: 19px;
                    font-weight: 900;
                }

                .crop-info p {
                    position: relative;
                    z-index: 1;

                    max-width: 980px;

                    margin: 0;

                    color: #166534;

                    font-size: 13px;
                    line-height: 1.75;
                }

                .photo-credit {
                    position: relative;
                    z-index: 1;

                    margin-top: 13px !important;

                    color: #4b7a5a !important;

                    font-size: 10px !important;
                    line-height: 1.5 !important;
                }


                /* =====================================================
                   IMAGE FALLBACK
                ===================================================== */

                .crop-image-wrap.image-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background:
                        linear-gradient(
                            135deg,
                            #dcfce7,
                            #f0fdf4
                        );
                }

                .crop-image-wrap.image-error::after {
                    content: "Crop image";

                    color: #15803d;

                    font-size: 12px;
                    font-weight: 800;
                }


                /* =====================================================
                   LARGE TABLET
                ===================================================== */

                @media (max-width: 1200px) {

                    .crops-grid {
                        grid-template-columns:
                            repeat(
                                2,
                                minmax(0, 1fr)
                            );
                    }

                }


                /* =====================================================
                   TABLET
                ===================================================== */

                @media (max-width: 900px) {

                    .crops-page {
                        padding:
                            27px 22px 60px;
                    }

                    .crops-hero {
                        padding:
                            27px;
                    }

                    .crops-hero h1 {
                        font-size: 34px;
                    }

                    .crops-hero-badge {
                        display: none;
                    }

                    .crop-summary {
                        grid-template-columns:
                            repeat(
                                3,
                                minmax(0, 1fr)
                            );
                    }

                    .crop-summary-card {
                        min-height: 86px;
                        padding: 15px;
                    }

                    .crop-summary-icon {
                        width: 43px;
                        height: 43px;
                        min-width: 43px;
                    }

                    .crop-summary-value {
                        font-size: 22px;
                    }

                    .crop-image-wrap {
                        height: 205px;
                    }

                }


                /* =====================================================
                   MOBILE
                ===================================================== */

                @media (max-width: 680px) {

                    .crops-page {
                        padding:
                            20px 15px 45px;
                    }

                    .crops-hero {
                        min-height: auto;

                        padding:
                            23px 21px;

                        border-radius:
                            19px;
                    }

                    .crops-hero h1 {
                        font-size: 29px;
                        letter-spacing: -1px;
                    }

                    .crops-hero-description {
                        font-size: 13px;
                    }

                    .crops-hero::before {
                        right: -140px;
                    }

                    .crop-summary {
                        grid-template-columns: 1fr;

                        gap: 11px;

                        margin-bottom: 27px;
                    }

                    .crop-summary-card {
                        min-height: 78px;
                    }

                    .crops-grid {
                        grid-template-columns: 1fr;
                        gap: 17px;
                    }

                    .crops-section-header {
                        margin-top: 28px;
                    }

                    .section-title-wrap h2 {
                        font-size: 21px;
                    }

                    .crop-image-wrap {
                        height: 220px;
                    }

                    .crop-card-body {
                        padding: 20px;
                    }

                    .crop-info {
                        padding:
                            22px;
                    }

                }


                /* =====================================================
                   SMALL MOBILE
                ===================================================== */

                @media (max-width: 420px) {

                    .crops-page {
                        padding:
                            17px 11px 35px;
                    }

                    .crops-hero {
                        padding:
                            20px 18px;
                    }

                    .crops-hero h1 {
                        font-size: 26px;
                    }

                    .crop-image-wrap {
                        height: 195px;
                    }

                    .crop-card h3 {
                        font-size: 20px;
                    }

                    .crop-description {
                        font-size: 12px;
                    }

                    .disease-tag {
                        font-size: 9px;
                    }

                }

            `}</style>


            {/* =====================================================
                MAIN HERO
            ===================================================== */}

            <section className="crops-hero">

                <div className="crops-hero-content">

                    <div className="crops-eyebrow">
                        AGRIMIND AI · CROP INTELLIGENCE
                    </div>

                    <h1>
                        Supported Crops
                    </h1>

                    <p className="crops-hero-description">
                        Explore the crops supported by AgriMind AI
                        and choose an AI-ready crop to begin
                        intelligent plant disease analysis.
                    </p>

                </div>


                <div className="crops-hero-badge">

                    <div className="hero-badge-icon"></div>

                    <div>
                        <p className="hero-badge-label">
                            AI Crop Health
                        </p>

                        <p className="hero-badge-value">
                            Intelligent Detection
                        </p>
                    </div>

                </div>

            </section>


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="crop-summary">

                <div className="crop-summary-card">

                    <div className="crop-summary-icon">
                        <span
                            className="summary-icon summary-plant"
                        />
                    </div>

                    <div>
                        <p className="crop-summary-label">
                            Total Crops
                        </p>

                        <h2 className="crop-summary-value">
                            {crops.length}
                        </h2>
                    </div>

                </div>


                <div className="crop-summary-card">

                    <div className="crop-summary-icon">
                        <span
                            className="summary-icon summary-ai"
                        />
                    </div>

                    <div>
                        <p className="crop-summary-label">
                            AI Supported
                        </p>

                        <h2 className="crop-summary-value">
                            {supportedCount}
                        </h2>
                    </div>

                </div>


                <div className="crop-summary-card">

                    <div className="crop-summary-icon">
                        <span
                            className="summary-icon summary-rocket"
                        />
                    </div>

                    <div>
                        <p className="crop-summary-label">
                            Coming Soon
                        </p>

                        <h2 className="crop-summary-value">
                            {comingSoonCount}
                        </h2>
                    </div>

                </div>

            </div>


            {/* =====================================================
                AVAILABLE SECTION
            ===================================================== */}

            <div className="crops-section-header">

                <div className="section-title-wrap">

                    <h2>
                        AI Detection Available
                    </h2>

                    <p>
                        Select a supported crop to start disease analysis.
                    </p>

                    <div className="section-line"></div>

                </div>

            </div>


            {/* =====================================================
                AVAILABLE CROP CARDS
            ===================================================== */}

            <div className="crops-grid">

                {crops
                    .filter(
                        (crop) =>
                            crop.supported
                    )
                    .map(
                        (crop) => (

                            <div
                                key={crop.name}
                                className="crop-card supported"
                                onClick={() =>
                                    handleAnalyze(crop)
                                }
                            >

                                <div className="crop-image-wrap">

                                    <img
                                        src={crop.image}
                                        alt={`${crop.name} crop`}
                                        className="crop-image"
                                        loading="lazy"
                                        onError={
                                            handleImageError
                                        }
                                    />

                                    <div className="crop-image-overlay" />

                                    <span className="crop-status">
                                        Available
                                    </span>

                                    <span className="image-category">
                                        {crop.category}
                                    </span>

                                </div>


                                <div className="crop-card-body">

                                    <h3>
                                        {crop.name}
                                    </h3>

                                    <p className="crop-description">
                                        {crop.description}
                                    </p>


                                    <div className="crop-diseases">

                                        <p className="crop-diseases-title">

                                            <span
                                                className="disease-title-icon"
                                            />

                                            Detectable Conditions

                                        </p>


                                        <ul className="disease-list">

                                            {crop.diseases.map(
                                                (disease) => (

                                                    <li
                                                        key={disease}
                                                        className="disease-tag"
                                                    >
                                                        {disease}
                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>


                                    <button
                                        type="button"
                                        className="crop-button"
                                        onClick={(event) => {

                                            event.stopPropagation();

                                            handleAnalyze(crop);

                                        }}
                                    >

                                        <span
                                            className="analyze-icon"
                                        />

                                        Analyze {crop.name}

                                        <span>
                                            →
                                        </span>

                                    </button>

                                </div>

                            </div>

                        )
                    )}

            </div>


            {/* =====================================================
                COMING SOON
            ===================================================== */}

            <div className="crops-section-header">

                <div className="section-title-wrap">

                    <h2>
                        More Crops Coming Soon
                    </h2>

                    <p>
                        These crops are planned for future
                        AI disease-detection support.
                    </p>

                    <div className="section-line"></div>

                </div>

            </div>


            <div className="crops-grid">

                {crops
                    .filter(
                        (crop) =>
                            !crop.supported
                    )
                    .map(
                        (crop) => (

                            <div
                                key={crop.name}
                                className="crop-card disabled coming-soon-card"
                            >

                                <div className="crop-image-wrap">

                                    <img
                                        src={crop.image}
                                        alt={`${crop.name} crop`}
                                        className="crop-image"
                                        loading="lazy"
                                        onError={
                                            handleImageError
                                        }
                                    />

                                    <div className="crop-image-overlay" />

                                    <span
                                        className="crop-status soon"
                                    >
                                        Coming Soon
                                    </span>

                                    <span className="image-category">
                                        {crop.category}
                                    </span>

                                </div>


                                <div className="crop-card-body">

                                    <h3>
                                        {crop.name}
                                    </h3>

                                    <p className="crop-description">
                                        {crop.description}
                                    </p>


                                    <div className="crop-diseases">

                                        <p className="crop-diseases-title">

                                            <span
                                                className="disease-title-icon"
                                            />

                                            Planned Detection Classes

                                        </p>


                                        <ul className="disease-list">

                                            {crop.diseases.map(
                                                (disease) => (

                                                    <li
                                                        key={disease}
                                                        className="disease-tag"
                                                    >
                                                        {disease}
                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

            </div>


            {/* =====================================================
                HOW AGRIMIND WORKS
            ===================================================== */}

            <div className="crop-info">

                <div className="info-top">

                    <div className="info-icon"></div>

                    <h2>
                        How AgriMind AI Works
                    </h2>

                </div>

                <p>
                    Select Cotton, Soybean, Maize, or Wheat,
                    continue to Disease Detection, upload a clear
                    crop-leaf image, and let the trained
                    EfficientNet-B0 model analyze the image.
                    AgriMind AI then provides the predicted
                    condition, confidence score, and available
                    disease guidance.
                </p>

                <p className="photo-credit">
                    Crop photography sourced from Wikimedia Commons.
                </p>

            </div>

        </div>
    );
}

export default Crops;