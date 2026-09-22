import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import UserProfileMenu from "../components/UserProfileMenu";

export default function LearningHub() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  // User State
  const storedUser = localStorage.getItem("user");
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }
  const farmerName = user?.full_name || "Test Farmer";
  const userRole = user?.role || "Farmer";

  // Filter & Search State
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Continue Learning State (local tracking without backend complexity)
  const [lastReadTopic, setLastReadTopic] = useState(() => {
    try {
      const saved = localStorage.getItem("agrimind_last_learning_topic");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Multilingual Dictionary
  const ui = {
    en: {
      searchPlaceholder: "Search topics, crops, diseases, or farming practices...",
      eyebrowTag: "LEARN · GROW · FARM SMARTER",
      heroTitle: "AgriMind Learning Hub",
      heroDesc: "Practical knowledge for healthier crops, higher yields and a sustainable tomorrow.",
      heroBadge1Title: "Expert Knowledge",
      heroBadge1Sub: "Simplified for Farmers",
      heroBadge2Title: "Real Farming Solutions",
      heroBadge2Sub: "Based on Field Experience",
      heroBadge3Title: "Learn Anytime",
      heroBadge3Sub: "At Your Own Pace",
      heroQuote: "“Knowledge today, better harvests tomorrow.”",
      allTopics: "All Topics",
      crops: "Crops",
      diseases: "Disease Management",
      smartFarming: "Smart Farming",
      aiTech: "AI & Technology",
      sustainability: "Sustainability",
      featuredTitle: "Featured Learning Topics",
      popularTitle: "Popular Articles",
      continueTitle: "Continue Learning",
      viewAll: "View All →",
      lessonsTag: "lessons",
      minReadTag: "min read",
      completeTag: "complete",
      continueBtn: "Continue Learning →",
      startLearningBtn: "Start First Lesson →",
      sidebarQuote: "“An educated farmer is a stronger farmer.”",
      sidebarQuoteAuthor: "— AgriMind",
      noResultsTitle: "No matching learning guides found",
      noResultsSub: "Try searching for crops (e.g. Cotton, Soybean), diseases (e.g. Blight, Rust), or topics like 'irrigation'.",
      closeGuide: "Close Guide",
      keyPointsTitle: "Key Agronomic Highlights",
      farmerActionsTitle: "Actionable Steps for Farmers",
      preventionTitle: "Prevention & Best Practices",
      connectedToolsTitle: "Connected AgriMind AI Tools",
      relatedTopicsTitle: "Related Learning Topics",
    },
    mr: {
      searchPlaceholder: "विषय, पिके, रोग किंवा शेती पद्धती शोधा...",
      eyebrowTag: "शिका · वाढवा · स्मार्ट शेती करा",
      heroTitle: "AgriMind शिक्षण केंद्र",
      heroDesc: "निरोगी पिके, अधिक उत्पादन आणि शाश्वत उद्यासाठी व्यावहारिक कृषी ज्ञान.",
      heroBadge1Title: "तज्ज्ञ ज्ञान",
      heroBadge1Sub: "शेतकऱ्यांसाठी सोपे",
      heroBadge2Title: "प्रत्यक्ष शेती उपाय",
      heroBadge2Sub: "शेत अनुभवावर आधारित",
      heroBadge3Title: "कधीही शिका",
      heroBadge3Sub: "आपल्या वेळेनुसार",
      heroQuote: "“आजचे ज्ञान, उद्याचे समृद्ध पीक.”",
      allTopics: "सर्व विषय",
      crops: "पिके",
      diseases: "रोग व्यवस्थापन",
      smartFarming: "स्मार्ट शेती",
      aiTech: "AI आणि तंत्रज्ञान",
      sustainability: "शाश्वत शेती",
      featuredTitle: "वैशिष्ट्यपूर्ण शिक्षण विषय",
      popularTitle: "लोकप्रिय लेख",
      continueTitle: "शिक्षण सुरू ठेवा",
      viewAll: "सर्व पहा →",
      lessonsTag: "धडे",
      minReadTag: "मि. वाचन",
      completeTag: "पूर्ण",
      continueBtn: "शिक्षण पुढे सुरू ठेवा →",
      startLearningBtn: "पहिला धडा सुरू करा →",
      sidebarQuote: "“सुशिक्षित शेतकरी हाच सर्वात समृद्ध शेतकरी.”",
      sidebarQuoteAuthor: "— AgriMind",
      noResultsTitle: "कोणतेही मार्गदर्शक सापडले नाही",
      noResultsSub: "वेगळ्या शब्दांनी शोधा, उदा. 'कापूस', 'सोयाबीन', 'पाणी नियोजन', किंवा 'रोग'.",
      closeGuide: "मार्गदर्शक बंद करा",
      keyPointsTitle: "महत्त्वाचे कृषी मुद्दे",
      farmerActionsTitle: "शेतकऱ्यांसाठी प्रत्यक्ष कृती",
      preventionTitle: "प्रतिबंध आणि सर्वोत्तम पद्धती",
      connectedToolsTitle: "संबंधित AgriMind AI साधने",
      relatedTopicsTitle: "संबंधित विषय",
    },
    hi: {
      searchPlaceholder: "विषय, फसलें, रोग या कृषि पद्धतियां खोजें...",
      eyebrowTag: "सीखें · बढ़ाएं · स्मार्ट खेती करें",
      heroTitle: "AgriMind शिक्षण केंद्र",
      heroDesc: "स्वस्थ फसलों, बेहतर उपज और टिकाऊ भविष्य के लिए व्यावहारिक कृषि ज्ञान।",
      heroBadge1Title: "विशेषज्ञ ज्ञान",
      heroBadge1Sub: "किसानों के लिए सरल",
      heroBadge2Title: "सटीक कृषि समाधान",
      heroBadge2Sub: "खेत के अनुभव पर आधारित",
      heroBadge3Title: "कभी भी सीखें",
      heroBadge3Sub: "अपनी गति से",
      heroQuote: "“आज का ज्ञान, कल की बेहतर फसल।”",
      allTopics: "सभी विषय",
      crops: "फसलें",
      diseases: "रोग प्रबंधन",
      smartFarming: "स्मार्ट खेती",
      aiTech: "AI और तकनीक",
      sustainability: "टिकाऊ खेती",
      featuredTitle: "प्रमुख शिक्षण विषय",
      popularTitle: "लोकप्रिय लेख",
      continueTitle: "अध्ययन जारी रखें",
      viewAll: "सभी देखें →",
      lessonsTag: "पाठ",
      minReadTag: "मिनट पठन",
      completeTag: "पूर्ण",
      continueBtn: "अध्ययन जारी रखें →",
      startLearningBtn: "पहला पाठ शुरू करें →",
      sidebarQuote: "“एक शिक्षित किसान ही सशक्त किसान है।”",
      sidebarQuoteAuthor: "— AgriMind",
      noResultsTitle: "कोई गाइड नहीं मिला",
      noResultsSub: "अन्य कीवर्ड से खोजें जैसे 'कपास', 'सोयाबीन', 'सिंचाई' या 'झुलसा'...",
      closeGuide: "गाइड बंद करें",
      keyPointsTitle: "मुख्य कृषि बिंदु",
      farmerActionsTitle: "किसानों के लिए व्यावहारिक कदम",
      preventionTitle: "रोकथाम और सर्वोत्तम अभ्यास",
      connectedToolsTitle: "जुड़े हुए AgriMind AI टूल्स",
      relatedTopicsTitle: "संबंधित शिक्षण विषय",
    }
  };

  const text = ui[language] || ui.en;

  // 1. FEATURED LEARNING TOPICS (Matching Reference Mockup Top Row)
  const featuredTopics = [
    {
      id: "cotton-cultivation",
      category: "crops",
      categoryLabel: "Crops",
      title: "Cotton Cultivation",
      description: "Complete guide from sowing to harvesting with pest scouting protocols.",
      lessons: 12,
      icon: "🌱",
      image: "/images/crop_cotton.jpg",
      summary: "Mastering cotton agronomy across Vertisols: square protection, micro-nutrient timing, and non-chemical boll rot prevention.",
      keyPoints: [
        "Optimal soil pH ranges from 6.0 to 7.5; deep black soils provide the best moisture reserves.",
        "Square initiation and boll formation are the most critical water-need stages.",
        "Proper plant canopy spacing improves airflow and cuts grey areolate mildew risk by 40%."
      ],
      farmerActions: [
        "Scout lower leaf surfaces weekly during morning hours for early aphid/whitefly signs.",
        "Apply balanced N-P-K fertilizer in split doses; avoid excessive nitrogen that causes vegetative overgrowth.",
        "Maintain clean inter-row spacing to facilitate field aeration and weed suppression."
      ],
      preventionTips: [
        "Select certified disease-tolerant hybrid varieties suitable for local rainfall.",
        "Avoid late flood irrigation that causes fungal root suffocation and boll dropping."
      ],
      relatedRoute: "/crops",
      relatedActionText: "View Cotton AI Models →",
      relatedTopicIds: ["disease-detection-guide", "ipm-management", "drip-irrigation"]
    },
    {
      id: "soybean-best-practices",
      category: "crops",
      categoryLabel: "Crops",
      title: "Soybean Best Practices",
      description: "Improve yield with modern inoculation, nodule care and pod fill management.",
      lessons: 10,
      icon: "🌿",
      image: "/images/crop_soybean.jpg",
      summary: "Comprehensive guide to soybean lifecycle management from R1 flowering to R5 pod filling for optimum protein and oil content.",
      keyPoints: [
        "Rhizobium seed treatment ensures high root nodulation and natural nitrogen assimilation.",
        "Moisture stress during pod filling directly shrinks seed weight and overall harvest volume.",
        "Foliar yellowing on lower leaves often signals early leaf blight or sudden death syndrome."
      ],
      farmerActions: [
        "Use seed drills at 30-45 cm uniform spacing to establish dense, weed-suppressing canopies.",
        "Inspect field borders regularly for sudden death or cercospora lesions.",
        "Harvest promptly when 95% of pods turn golden brown to prevent pod shattering."
      ],
      preventionTips: [
        "Rotate fields every 2 seasons with non-legume crops like maize or wheat.",
        "Ensure field drainage furrows are cleaned prior to monsoon downpours."
      ],
      relatedRoute: "/crops",
      relatedActionText: "Analyze Soybean Leaves →",
      relatedTopicIds: ["soil-health-fertility", "early-detection-diseases", "crop-growth-stages"]
    },
    {
      id: "maize-farming-guide",
      category: "crops",
      categoryLabel: "Crops",
      title: "Maize Farming Guide",
      description: "From planting to post-harvest management and foliar rust defense.",
      lessons: 8,
      icon: "🌽",
      image: "/images/crop_maize.jpg",
      summary: "Maximizing corn cob size through precision nitrogen timing, fall armyworm vigilance, and turcicum blight defense.",
      keyPoints: [
        "Maize requires timed split-nitrogen applications at knee-high and tasseling stages.",
        "Common rust and leaf blight spread rapidly during humid overcast weather spells.",
        "Adequate soil moisture during active silking determines kernel count per ear."
      ],
      farmerActions: [
        "Inspect the central leaf whorls weekly for early chewing damage.",
        "Apply the secondary top-dressing of urea just prior to tassel emergence.",
        "Avoid overhead sprinkler irrigation during active pollen shed."
      ],
      preventionTips: [
        "Choose certified hybrid seeds with proven tolerance to northern corn leaf blight.",
        "Deep plow fields post-harvest to expose soil pupae to direct sun."
      ],
      relatedRoute: "/crops",
      relatedActionText: "Explore Maize Diagnostics →",
      relatedTopicIds: ["cotton-cultivation", "ipm-management", "crop-growth-stages"]
    },
    {
      id: "tomato-crop-care",
      category: "crops",
      categoryLabel: "Crops",
      title: "Tomato Crop Care",
      description: "Disease management and high-quality horticulture production techniques.",
      lessons: 9,
      icon: "🍅",
      image: "/images/crop_tomato.jpg",
      summary: "Protected cultivation, staking architecture, calcium balancing, and early blight prevention for commercial tomato farmers.",
      keyPoints: [
        "Staking and trellising keeps foliage off wet soil, reducing early blight incidence by up to 70%.",
        "Irregular moisture cycles trigger blossom-end rot due to poor calcium uptake.",
        "Drip fertigation delivers uniform nutrients straight to root zones without wetting leaves."
      ],
      farmerActions: [
        "Prune lower suckers touching the ground to promote upward vertical airflow.",
        "Install yellow and blue sticky traps to monitor whiteflies and thrips populations.",
        "Apply organic straw mulch around roots to preserve steady moisture during heatwaves."
      ],
      preventionTips: [
        "Never work in wet fields to prevent bacterial canker spread.",
        "Rotate solanaceous crops yearly with legumes or cereals."
      ],
      relatedRoute: "/management",
      relatedActionText: "Open Crop Management →",
      relatedTopicIds: ["drip-irrigation", "soil-health-fertility", "early-detection-diseases"]
    },
    {
      id: "soil-health-fertility",
      category: "sustainability",
      categoryLabel: "Sustainability",
      title: "Soil Health & Fertility",
      description: "Build healthier soil for better yields, organic carbon, and moisture retention.",
      lessons: 7,
      icon: "🌱",
      image: "/images/crop_soil.jpg",
      summary: "Soil organic matter restoration, green manuring, pH buffering, and microbial inoculation for long-term farm resilience.",
      keyPoints: [
        "Soil Organic Carbon (SOC) > 0.75% dramatically boosts water infiltration and nutrient holding.",
        "Excessive synthetic nitrogen acidifies soil and reduces beneficial mycorrhizal fungi.",
        "Cover cropping and green manuring (Dhaincha/Sunhemp) add up to 25 kg organic N per acre."
      ],
      farmerActions: [
        "Conduct soil testing every 2 years before sowing the primary Kharif crop.",
        "Incorporate farmyard manure (FYM) enriched with Trichoderma before land preparation.",
        "Incorporate crop residues rather than burning to build long-term humus."
      ],
      preventionTips: [
        "Avoid continuous monocropping that depletes specific micronutrient reserves.",
        "Use gypsum in sodic soils or agricultural lime in acidic soils as guided by testing."
      ],
      relatedRoute: "/management",
      relatedActionText: "Manage Farm Soils →",
      relatedTopicIds: ["drip-irrigation", "ipm-management", "soybean-best-practices"]
    },
  ];

  // 2. POPULAR ARTICLES (Matching Reference Mockup Bottom Left)
  const popularArticles = [
    {
      id: "early-detection-diseases",
      category: "diseases",
      categoryLabel: "Disease Management",
      title: "Early Detection of Plant Diseases",
      description: "Learn to identify common symptoms in your crops before irreversible damage occurs.",
      readTime: "5 min read",
      image: "/images/crop_cotton.jpg",
      summary: "Visual symptom recognition guide for leaf spots, powdery mildews, vascular wilts, and rusts with early action protocols.",
      keyPoints: [
        "Inspecting the lower canopy reveals the earliest fungal spore colonization points.",
        "Angular lesions bordered by veins indicate bacterial pathogens; concentric rings signal fungal alternaria.",
        "Early morning scouting allows observing dew persistence and initial leaf wilting."
      ],
      farmerActions: [
        "Capture clear, well-lit photos using the AgriMind AI scanner at first sight of yellowing.",
        "Isolate heavily diseased plant debris away from drainage waterways.",
        "Consult local agricultural extension officers before applying broad-spectrum chemicals."
      ],
      preventionTips: [
        "Disinfect pruning equipment with 70% alcohol or diluted bleach between plots.",
        "Maintain wider crop spacing during humid monsoon cycles."
      ],
      relatedRoute: "/detection",
      relatedActionText: "Open Disease Detection →",
      relatedTopicIds: ["ipm-management", "cotton-cultivation", "soybean-best-practices"]
    },
    {
      id: "ipm-management",
      category: "smartFarming",
      categoryLabel: "Smart Farming",
      title: "Integrated Pest Management (IPM)",
      description: "Eco-friendly methods for long-term crop protection and beneficial predator conservation.",
      readTime: "7 min read",
      image: "/images/crop_soybean.jpg",
      summary: "Combining biological, cultural, physical, and targeted chemical controls to manage pests economically and sustainably.",
      keyPoints: [
        "IPM aims to suppress pest populations below economic injury levels rather than total eradication.",
        "Beneficial insects like ladybird beetles and hoverflies naturally consume thousands of aphids.",
        "Pheromone and light traps provide accurate advance warning of pest flight peaks."
      ],
      farmerActions: [
        "Install 4–5 pheromone traps per acre to monitor bollworm or spodoptera moths.",
        "Spray 5% neem seed kernel extract (NSKE) at the first threshold of sucking pests.",
        "Rotate chemical modes of action to prevent pesticide resistance development."
      ],
      preventionTips: [
        "Plant border rows of marigold or maize as natural trap and barrier crops.",
        "Avoid blanket spraying that eliminates beneficial pollinator and predator populations."
      ],
      relatedRoute: "/insights",
      relatedActionText: "Check AI Risk Analytics →",
      relatedTopicIds: ["early-detection-diseases", "soil-health-fertility", "crop-growth-stages"]
    },
    {
      id: "drip-irrigation",
      category: "sustainability",
      categoryLabel: "Sustainable Farming",
      title: "Drip Irrigation for Better Yield",
      description: "Save water and improve productivity with precision root-zone delivery and fertigation.",
      readTime: "6 min read",
      image: "/images/weather_hero_bg.jpg",
      summary: "Engineering precision water delivery: pressure compensation, filtration maintenance, and weather-synchronized scheduling.",
      keyPoints: [
        "Drip systems deliver water directly to the root zone with up to 90% water-use efficiency.",
        "Fertigation saves 30% fertilizer by delivering soluble nutrients in small, frequent doses.",
        "Keeping leaf canopies dry substantially suppresses fungal foliar infections."
      ],
      farmerActions: [
        "Flush lateral lines and clean disc/screen filters every 15 days to prevent emitter clogging.",
        "Integrate 7-day rainfall forecasts from AgriMind before scheduling long drip cycles.",
        "Operate drip systems during cool morning hours to minimize surface evaporation."
      ],
      preventionTips: [
        "Acid-treat drip lines once per season with diluted phosphoric acid if hard water causes scaling.",
        "Inspect lateral end-caps for rodent chewing or pressure leaks."
      ],
      relatedRoute: "/weather",
      relatedActionText: "Open Weather & Forecast →",
      relatedTopicIds: ["soil-health-fertility", "cotton-cultivation", "tomato-crop-care"]
    }
  ];

  // 3. CONTINUE LEARNING TOPIC (Matching Reference Mockup Bottom Right)
  const continueLearningDefault = {
    id: "crop-growth-stages",
    category: "smartFarming",
    categoryLabel: "Crop Management",
    title: "Crop Growth Stages Explained",
    description: "Understanding vegetative, reproductive, and ripening phases for precision input application.",
    progress: 60,
    progressLabel: "7 of 11 complete",
    image: "/images/detection_hero.jpg",
    summary: "A comprehensive agronomic guide to identifying BBCH growth stages in field crops to optimize irrigation, fertilizer top-dressing, and disease scouting.",
    keyPoints: [
      "Germination & Emergence: Ensure seedbed moisture without crusting.",
      "Vegetative Branching: Peak requirement for phosphorus and root-stimulating mycorrhiza.",
      "Reproductive Flowering: Maximum vulnerability to moisture stress and high-temperature pollen sterility.",
      "Maturity & Ripening: Taper off irrigation to promote uniform drying and seed hardening."
    ],
    farmerActions: [
      "Sync nitrogen applications to the exact onset of rapid vegetative branching.",
      "Protect the flag leaf in cereals and top leaves in cotton during reproductive filling.",
      "Document key stage dates in AgriMind Crop Management to track seasonal cycle timings."
    ],
    preventionTips: [
      "Avoid nutrient application past the critical physiological absorption window.",
      "Check weather forecasts for approaching heat spikes during anthesis."
    ],
    relatedRoute: "/management",
    relatedActionText: "Open Crop Management →",
    relatedTopicIds: ["cotton-cultivation", "soybean-best-practices", "early-detection-diseases"]
  };

  // Active Continue Learning Object
  const currentContinueItem = lastReadTopic || continueLearningDefault;

  // ALL TOPICS COMBINED FOR FILTERING & SEARCH
  const allTopicsCatalogue = useMemo(() => {
    const list = [...featuredTopics, ...popularArticles, continueLearningDefault];
    // Remove duplicates by id
    const map = new Map();
    list.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, []);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return allTopicsCatalogue.filter((item) => {
      // Category Filter
      let matchesCat = true;
      if (activeCategory === "crops") matchesCat = item.category === "crops";
      else if (activeCategory === "diseases") matchesCat = item.category === "diseases";
      else if (activeCategory === "smartFarming") matchesCat = item.category === "smartFarming";
      else if (activeCategory === "aiTech") matchesCat = item.category === "aiTech" || item.id.includes("detection");
      else if (activeCategory === "sustainability") matchesCat = item.category === "sustainability";

      // Search Filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const searchable = `${item.title} ${item.description || ""} ${item.summary || ""} ${item.categoryLabel || ""} ${(item.keyPoints || []).join(" ")} ${(item.farmerActions || []).join(" ")}`.toLowerCase();
      return matchesCat && searchable.includes(q);
    });
  }, [allTopicsCatalogue, activeCategory, searchQuery]);

  // Open Topic Handler with Local Learning Progress Save
  const handleOpenTopic = (topic) => {
    setSelectedTopic(topic);
    try {
      const topicToSave = {
        ...topic,
        progress: topic.progress || 80,
        progressLabel: topic.progressLabel || "In progress",
      };
      setLastReadTopic(topicToSave);
      localStorage.setItem("agrimind_last_learning_topic", JSON.stringify(topicToSave));
    } catch {
      // ignore local storage error
    }
  };

  return (
    <div className="learning-hub-page-root">
      {/* Scoped CSS styling replicating the exact reference visual design */}
      <style>{`
        .learning-hub-page-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f4f6f8;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
        }

        /* 1. TOP HEADER (Matching App Topbar with Search & Profile) */
        .lh-topbar {
          background: #ffffff;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .lh-search-wrapper {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          padding: 9px 18px;
          border-radius: 9999px;
          gap: 10px;
          width: 100%;
          max-width: 520px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .lh-search-wrapper:focus-within {
          background: #ffffff;
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
        }

        .lh-search-icon {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .lh-search-input {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-size: 13.5px;
          color: #1f2937;
        }

        .lh-topbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .lh-notif-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4b5563;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lh-notif-btn:hover {
          background: #e5e7eb;
        }

        .lh-notif-dot {
          position: absolute;
          top: 8px;
          right: 9px;
          width: 7px;
          height: 7px;
          background: #ef4444;
          border-radius: 50%;
          border: 1.5px solid #ffffff;
        }

        .lh-user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 3px 8px 3px 3px;
          border-radius: 9999px;
          transition: background 0.15s;
        }

        .lh-user-pill:hover {
          background: #f3f4f6;
        }

        .lh-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #d1d5db;
        }

        .lh-user-info {
          display: flex;
          flex-direction: column;
        }

        .lh-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
        }

        .lh-user-role {
          font-size: 11px;
          color: #16a34a;
          font-weight: 600;
        }

        /* MAIN CONTENT WRAPPER */
        .lh-content-container {
          padding: 24px 28px 48px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* 2. HERO BANNER (Pixel-Perfect Match to Reference Image) */
        .lh-hero-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(90deg, #093c28 0%, #0d5438 45%, #15734e 75%, #18865b 100%);
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(9, 60, 40, 0.25);
          display: flex;
          align-items: stretch;
          min-height: 230px;
        }

        .lh-hero-left {
          flex: 1.4;
          padding: 32px 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 2;
        }

        .lh-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #86efac;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .lh-hero-tag-icon {
          font-size: 13px;
        }

        .lh-hero-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0 0 8px 0;
          color: #ffffff;
          line-height: 1.15;
        }

        .lh-hero-sub {
          font-size: 13.5px;
          color: #d1fae5;
          line-height: 1.5;
          margin: 0 0 20px 0;
          max-width: 520px;
          opacity: 0.95;
        }

        .lh-hero-badges-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .lh-hero-badge-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .lh-badge-icon-circ {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .lh-badge-texts {
          display: flex;
          flex-direction: column;
        }

        .lh-badge-main {
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
        }

        .lh-badge-sub {
          font-size: 10.5px;
          color: #a7f3d0;
        }

        .lh-hero-right {
          flex: 1;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          overflow: hidden;
        }

        .lh-hero-bg-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center right;
          opacity: 0.95;
          mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, black 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, black 100%);
        }

        .lh-hero-handwritten-quote {
          position: relative;
          z-index: 3;
          margin: 0 32px 32px 0;
          font-family: 'Caveat', 'Georgia', cursive, serif;
          font-size: 22px;
          color: #ffffff;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
          line-height: 1.25;
          text-align: right;
          max-width: 200px;
        }

        /* 3. CATEGORY PILL FILTER BAR (Pixel-Perfect Match) */
        .lh-category-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .lh-cat-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 9999px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .lh-cat-pill-btn:hover {
          border-color: #86efac;
          color: #16a34a;
          transform: translateY(-1px);
        }

        .lh-cat-pill-btn.active {
          background: #16a34a;
          color: #ffffff;
          border-color: #16a34a;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
        }

        .lh-cat-icon {
          font-size: 14px;
        }

        /* 4. SECTION HEADERS */
        .lh-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .lh-section-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lh-section-icon {
          color: #16a34a;
          font-size: 17px;
        }

        .lh-section-heading {
          font-size: 17px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.3px;
          margin: 0;
        }

        .lh-view-all-link {
          background: none;
          border: none;
          color: #16a34a;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .lh-view-all-link:hover {
          color: #15803d;
          text-decoration: underline;
        }

        /* 5. FEATURED LEARNING TOPICS 5-COLUMN GRID */
        .lh-featured-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .lh-featured-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .lh-featured-grid {
            grid-template-columns: repeat(1, 1fr);
          }
        }

        .lh-featured-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lh-featured-card:hover {
          transform: translateY(-4px);
          border-color: #86efac;
          box-shadow: 0 10px 24px rgba(22, 163, 74, 0.12);
        }

        .lh-card-img-container {
          position: relative;
          width: 100%;
          height: 130px;
          background: #f1f5f9;
          overflow: hidden;
        }

        .lh-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .lh-featured-card:hover .lh-card-img {
          transform: scale(1.04);
        }

        .lh-card-floating-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #ffffff;
          border-radius: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          font-size: 14px;
        }

        .lh-card-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .lh-card-title {
          font-size: 14.5px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .lh-card-desc {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.45;
          margin: 0 0 14px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .lh-card-bottom-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid #f3f4f6;
        }

        .lh-lesson-pill {
          font-size: 11px;
          font-weight: 700;
          color: #16a34a;
          background: #f0fdf4;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .lh-circle-arrow-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f0fdf4;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          transition: all 0.2s;
        }

        .lh-featured-card:hover .lh-circle-arrow-btn {
          background: #16a34a;
          color: #ffffff;
        }

        /* 6. BOTTOM ROW: POPULAR ARTICLES (LEFT) + CONTINUE LEARNING (RIGHT) */
        .lh-bottom-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
        }

        @media (max-width: 992px) {
          .lh-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Left: Popular Articles List */
        .lh-popular-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          padding: 20px 22px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .lh-articles-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lh-article-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 12px;
          border-radius: 12px;
          background: #f9fafb;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .lh-article-item:hover {
          background: #ffffff;
          border-color: #d1fae5;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
          transform: translateX(3px);
        }

        .lh-article-thumb {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .lh-article-details {
          flex: 1;
          min-width: 0;
        }

        .lh-article-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 3px 0;
          line-height: 1.3;
        }

        .lh-article-desc {
          font-size: 11.5px;
          color: #6b7280;
          margin: 0 0 6px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lh-article-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
        }

        .lh-read-time {
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .lh-article-tag {
          font-weight: 700;
          color: #16a34a;
          background: #ecfdf5;
          padding: 1px 7px;
          border-radius: 4px;
        }

        /* Right: Continue Learning & Quote Card */
        .lh-continue-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .lh-continue-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          padding: 20px 22px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lh-continue-thumb-box {
          position: relative;
          width: 100%;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          background: #064e3b;
        }

        .lh-continue-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
        }

        .lh-play-circle-btn {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .lh-continue-thumb-box:hover .lh-play-circle-btn {
          transform: scale(1.1);
        }

        .lh-continue-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lh-continue-pill {
          align-self: flex-start;
          font-size: 10.5px;
          font-weight: 700;
          color: #16a34a;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .lh-continue-title {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }

        /* Progress Bar */
        .lh-progress-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        .lh-progress-track {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
        }

        .lh-progress-fill {
          height: 100%;
          background: #16a34a;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .lh-progress-percent {
          font-size: 11.5px;
          font-weight: 700;
          color: #16a34a;
        }

        .lh-progress-sub {
          font-size: 11px;
          color: #6b7280;
          margin-top: -2px;
        }

        .lh-btn-continue-cta {
          width: 100%;
          background: #16a34a;
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 4px;
        }

        .lh-btn-continue-cta:hover {
          background: #15803d;
          transform: translateY(-1px);
        }

        /* Quote Box */
        .lh-quote-card {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lh-quote-leaf {
          font-size: 20px;
          color: #16a34a;
        }

        .lh-quote-text {
          font-size: 12px;
          color: #166534;
          font-style: italic;
          line-height: 1.4;
        }

        /* DETAIL MODAL */
        .lh-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: modalOverlayFade 0.2s ease;
        }

        .lh-modal-card {
          background: #ffffff;
          border-radius: 22px;
          max-width: 740px;
          width: 100%;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .lh-modal-hero {
          background: linear-gradient(135deg, #093c28 0%, #15734e 100%);
          padding: 26px 30px;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .lh-modal-hero-title {
          font-size: 22px;
          font-weight: 800;
          margin: 4px 0;
          color: #ffffff;
        }

        .lh-modal-hero-sub {
          font-size: 13px;
          color: #d1fae5;
          margin: 0;
        }

        .lh-modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #ffffff;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .lh-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.35);
        }

        .lh-modal-body {
          padding: 24px 30px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .lh-modal-section-title {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lh-modal-list {
          margin: 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #334155;
          font-size: 13px;
          line-height: 1.5;
        }

        .lh-modal-box-green {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .lh-modal-box-green .lh-modal-section-title {
          color: #15803d;
        }

        .lh-modal-box-amber {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .lh-modal-box-amber .lh-modal-section-title {
          color: #92400e;
        }

        .lh-related-pills-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .lh-related-pill {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }

        .lh-related-pill:hover {
          background: #ecfdf5;
          border-color: #86efac;
          color: #16a34a;
        }

        .lh-modal-footer {
          padding: 16px 30px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      `}</style>

      {/* 1. TOP HEADER */}
      <header className="lh-topbar">
        <div className="lh-search-wrapper">
          <svg className="lh-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="lh-search-input"
            placeholder={text.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="lh-topbar-actions">
          <button className="lh-notif-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="lh-notif-dot" />
          </button>

          <UserProfileMenu variant="topbar" />
        </div>
      </header>

      {/* MAIN BODY WRAPPER */}
      <main className="lh-content-container">

        {/* 2. HERO BANNER */}
        <section className="lh-hero-card">
          <div className="lh-hero-left">
            <div>
              <div className="lh-hero-tag">
                <span className="lh-hero-tag-icon">🌱</span>
                <span>{text.eyebrowTag}</span>
              </div>
              <h1 className="lh-hero-title">{text.heroTitle}</h1>
              <p className="lh-hero-sub">{text.heroDesc}</p>
            </div>

            <div className="lh-hero-badges-row">
              <div className="lh-hero-badge-item">
                <div className="lh-badge-icon-circ">📖</div>
                <div className="lh-badge-texts">
                  <span className="lh-badge-main">{text.heroBadge1Title}</span>
                  <span className="lh-badge-sub">{text.heroBadge1Sub}</span>
                </div>
              </div>

              <div className="lh-hero-badge-item">
                <div className="lh-badge-icon-circ">🍃</div>
                <div className="lh-badge-texts">
                  <span className="lh-badge-main">{text.heroBadge2Title}</span>
                  <span className="lh-badge-sub">{text.heroBadge2Sub}</span>
                </div>
              </div>

              <div className="lh-hero-badge-item">
                <div className="lh-badge-icon-circ">🎓</div>
                <div className="lh-badge-texts">
                  <span className="lh-badge-main">{text.heroBadge3Title}</span>
                  <span className="lh-badge-sub">{text.heroBadge3Sub}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lh-hero-right">
            <img src="/images/farmer_avatar.jpg" alt="Indian Farmer" className="lh-hero-bg-photo" />
            <div className="lh-hero-handwritten-quote">
              {text.heroQuote}
            </div>
          </div>
        </section>

        {/* 3. CATEGORY PILL FILTER BAR */}
        <nav className="lh-category-bar">
          <button
            className={`lh-cat-pill-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <span className="lh-cat-icon">📖</span>
            <span>{text.allTopics}</span>
          </button>
          <button
            className={`lh-cat-pill-btn ${activeCategory === "crops" ? "active" : ""}`}
            onClick={() => setActiveCategory("crops")}
          >
            <span className="lh-cat-icon">🍃</span>
            <span>{text.crops}</span>
          </button>
          <button
            className={`lh-cat-pill-btn ${activeCategory === "diseases" ? "active" : ""}`}
            onClick={() => setActiveCategory("diseases")}
          >
            <span className="lh-cat-icon">🛡️</span>
            <span>{text.diseases}</span>
          </button>
          <button
            className={`lh-cat-pill-btn ${activeCategory === "smartFarming" ? "active" : ""}`}
            onClick={() => setActiveCategory("smartFarming")}
          >
            <span className="lh-cat-icon">🚜</span>
            <span>{text.smartFarming}</span>
          </button>
          <button
            className={`lh-cat-pill-btn ${activeCategory === "aiTech" ? "active" : ""}`}
            onClick={() => setActiveCategory("aiTech")}
          >
            <span className="lh-cat-icon">🧠</span>
            <span>{text.aiTech}</span>
          </button>
          <button
            className={`lh-cat-pill-btn ${activeCategory === "sustainability" ? "active" : ""}`}
            onClick={() => setActiveCategory("sustainability")}
          >
            <span className="lh-cat-icon">🌱</span>
            <span>{text.sustainability}</span>
          </button>
        </nav>

        {/* 4. FEATURED LEARNING TOPICS SECTION */}
        <section>
          <div className="lh-section-header">
            <div className="lh-section-title-box">
              <span className="lh-section-icon">★</span>
              <h2 className="lh-section-heading">{text.featuredTitle}</h2>
            </div>
            <button className="lh-view-all-link" onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}>
              {text.viewAll}
            </button>
          </div>

          <div className="lh-featured-grid">
            {filteredTopics.slice(0, 5).map((topic) => (
              <div
                key={topic.id}
                className="lh-featured-card"
                onClick={() => handleOpenTopic(topic)}
              >
                <div className="lh-card-img-container">
                  <img src={topic.image} alt={topic.title} className="lh-card-img" />
                  <div className="lh-card-floating-badge">{topic.icon || "🌱"}</div>
                </div>
                <div className="lh-card-body">
                  <div>
                    <h3 className="lh-card-title">{topic.title}</h3>
                    <p className="lh-card-desc">{topic.description}</p>
                  </div>
                  <div className="lh-card-bottom-meta">
                    <span className="lh-lesson-pill">{topic.lessons ? `${topic.lessons} ${text.lessonsTag}` : (topic.readTime || `5 ${text.minReadTag}`)}</span>
                    <span className="lh-circle-arrow-btn">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. BOTTOM ROW: POPULAR ARTICLES + CONTINUE LEARNING */}
        <section className="lh-bottom-grid">
          {/* Left: Popular Articles */}
          <div className="lh-popular-card">
            <div className="lh-section-header" style={{ marginBottom: "6px" }}>
              <div className="lh-section-title-box">
                <span className="lh-section-icon">📑</span>
                <h3 className="lh-section-heading">{text.popularTitle}</h3>
              </div>
              <button className="lh-view-all-link" onClick={() => setActiveCategory("diseases")}>
                {text.viewAll}
              </button>
            </div>

            <div className="lh-articles-list">
              {popularArticles.map((art) => (
                <div
                  key={art.id}
                  className="lh-article-item"
                  onClick={() => handleOpenTopic(art)}
                >
                  <img src={art.image} alt={art.title} className="lh-article-thumb" />
                  <div className="lh-article-details">
                    <h4 className="lh-article-title">{art.title}</h4>
                    <p className="lh-article-desc">{art.description}</p>
                    <div className="lh-article-meta-row">
                      <span className="lh-read-time">⏱️ {art.readTime}</span>
                      <span className="lh-article-tag">{art.categoryLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Continue Learning & Quote Card */}
          <div className="lh-continue-column">
            <div className="lh-continue-card">
              <div className="lh-section-header" style={{ marginBottom: "4px" }}>
                <div className="lh-section-title-box">
                  <span className="lh-section-icon">🕒</span>
                  <h3 className="lh-section-heading">{text.continueTitle}</h3>
                </div>
                <button className="lh-view-all-link" onClick={() => setActiveCategory("smartFarming")}>
                  {text.viewAll}
                </button>
              </div>

              <div className="lh-continue-thumb-box" onClick={() => handleOpenTopic(currentContinueItem)}>
                <img src={currentContinueItem.image} alt={currentContinueItem.title} className="lh-continue-img" />
                <button className="lh-play-circle-btn" aria-label="Play lesson">▶</button>
              </div>

              <div className="lh-continue-content">
                <span className="lh-continue-pill">{currentContinueItem.categoryLabel || "Crop Management"}</span>
                <h4 className="lh-continue-title">{currentContinueItem.title}</h4>
                
                <div className="lh-progress-row">
                  <div className="lh-progress-track">
                    <div className="lh-progress-fill" style={{ width: `${currentContinueItem.progress || 60}%` }} />
                  </div>
                  <span className="lh-progress-percent">{currentContinueItem.progress || 60}%</span>
                </div>
                <span className="lh-progress-sub">{currentContinueItem.progressLabel || "7 of 11 complete"}</span>

                <button
                  className="lh-btn-continue-cta"
                  onClick={() => handleOpenTopic(currentContinueItem)}
                >
                  <span>{text.continueBtn}</span>
                </button>
              </div>
            </div>

            {/* Motivational Quote Box */}
            <div className="lh-quote-card">
              <span className="lh-quote-leaf">🌱</span>
              <div className="lh-quote-text">
                {text.sidebarQuote}
                <br />
                <strong>{text.sidebarQuoteAuthor}</strong>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 6. INTERACTIVE DETAIL MODAL */}
      {selectedTopic && (
        <div className="lh-modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div className="lh-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lh-modal-hero">
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px" }}>
                  {selectedTopic.icon} {selectedTopic.categoryLabel}
                </span>
                <h2 className="lh-modal-hero-title">{selectedTopic.title}</h2>
                <p className="lh-modal-hero-sub">{selectedTopic.description}</p>
              </div>
              <button className="lh-modal-close-btn" onClick={() => setSelectedTopic(null)}>✕</button>
            </div>

            <div className="lh-modal-body">
              <div>
                <p style={{ margin: "0", fontSize: "13.5px", color: "#334155", lineHeight: "1.6" }}>
                  {selectedTopic.summary}
                </p>
              </div>

              {selectedTopic.keyPoints && selectedTopic.keyPoints.length > 0 && (
                <div>
                  <h4 className="lh-modal-section-title">📌 {text.keyPointsTitle}</h4>
                  <ul className="lh-modal-list">
                    {selectedTopic.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTopic.farmerActions && selectedTopic.farmerActions.length > 0 && (
                <div className="lh-modal-box-green">
                  <h4 className="lh-modal-section-title">🚜 {text.farmerActionsTitle}</h4>
                  <ul className="lh-modal-list" style={{ color: "#166534" }}>
                    {selectedTopic.farmerActions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTopic.preventionTips && selectedTopic.preventionTips.length > 0 && (
                <div className="lh-modal-box-amber">
                  <h4 className="lh-modal-section-title">🛡️ {text.preventionTitle}</h4>
                  <ul className="lh-modal-list" style={{ color: "#92400e" }}>
                    {selectedTopic.preventionTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Learning Topics */}
              {selectedTopic.relatedTopicIds && (
                <div>
                  <h4 className="lh-modal-section-title">🔗 {text.relatedTopicsTitle}</h4>
                  <div className="lh-related-pills-row">
                    {selectedTopic.relatedTopicIds.map((relId) => {
                      const found = allTopicsCatalogue.find((t) => t.id === relId);
                      if (!found) return null;
                      return (
                        <button
                          key={relId}
                          className="lh-related-pill"
                          onClick={() => handleOpenTopic(found)}
                        >
                          {found.icon || "📖"} {found.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="lh-modal-footer">
              <button
                style={{ background: "#e2e8f0", border: "none", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => setSelectedTopic(null)}
              >
                {text.closeGuide}
              </button>

              {selectedTopic.relatedRoute && (
                <button
                  style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedTopic(null);
                    navigate(selectedTopic.relatedRoute);
                  }}
                >
                  {selectedTopic.relatedActionText || "Open Tool →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
