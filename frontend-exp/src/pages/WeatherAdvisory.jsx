import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import UserProfileMenu from "../components/UserProfileMenu";

export default function WeatherAdvisory() {
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

  // Weather States
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & Location States
  const [searchInput, setSearchInput] = useState("");
  const [currentLocationQuery, setCurrentLocationQuery] = useState(() => {
    return sessionStorage.getItem("agrimind_selected_location") || "Pune, Maharashtra";
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // UI Interactive States
  const [mapLayer, setMapLayer] = useState("Rainfall"); // Rainfall | Temperature | Wind
  const [mapTimeframe, setMapTimeframe] = useState("Next 24 Hours");
  const [view24Hours, setView24Hours] = useState(false);
  const [showAllAlertsModal, setShowAllAlertsModal] = useState(false);
  const [showAllAdvisoryModal, setShowAllAdvisoryModal] = useState(false);
  const [showAllTipsModal, setShowAllTipsModal] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState("");

  const searchContainerRef = useRef(null);

  // Multilingual UI Texts
  const t = {
    en: {
      searchPlaceholder: "Search crops, weather, advisory, or location...",
      heroTag: "WEATHER & ADVISORY",
      heroTitle: "Farm Smarter\nwith Real-Time Weather",
      heroDesc: "Get accurate weather forecasts, location-based advisories, and AI-powered insights to protect your crops and increase yield.",
      locationInputPlaceholder: "Enter your location (e.g. Pune, Maharashtra)",
      getWeatherBtn: "Get Weather",
      detectLocation: "Use My Location",
      badgeForecast: "Weather Forecast",
      badgeForecastSub: "Real-time updates",
      badgeAdvisory: "Crop Advisory",
      badgeAdvisorySub: "Personalized advice",
      badgeAlerts: "Risk Alerts",
      badgeAlertsSub: "Early warnings",
      badgeTips: "Farming Tips",
      badgeTipsSub: "Expert guidance",
      updatedJustNow: "Updated just now",
      feelsLike: "Feels like",
      humidity: "Humidity",
      wind: "Wind",
      pressure: "Pressure",
      visibility: "Visibility",
      precipitation: "Precipitation",
      todaysForecast: "Today's Forecast",
      hourlySub: "Hourly forecast for your location",
      view24Hours: "View 24 Hours",
      view7Days: "7-Day Forecast",
      planAhead: "Plan ahead for better farming decisions",
      viewFullWeek: "View Full Week",
      cropAdvisory: "Crop Advisory",
      cropAdvisorySub: "Personalized advice based on current weather",
      viewAll: "View All",
      weatherAlerts: "Weather Alerts",
      alertsSub: "Stay informed, stay prepared",
      noAlertsTitle: "No active weather alerts",
      noAlertsSub: "Atmospheric and soil moisture conditions are stable for normal field activities.",
      farmingTips: "Farming Tips",
      farmingTipsSub: "Expert tips for better yield",
      weatherMap: "Interactive Weather Map",
      weatherMapSub: "View real-time weather conditions in your area",
      quickActions: "Quick Actions",
      quickActionsSub: "Tools for smarter farming",
      checkWeather: "Check Weather",
      checkWeatherSub: "Get latest updates",
      viewAdvisories: "View Advisories",
      viewAdvisoriesSub: "See personalized advice",
      setAlerts: "Set Alerts",
      setAlertsSub: "Get notified instantly",
      farmingCalendar: "Farming Calendar",
      farmingCalendarSub: "Plan your activities",
      refresh: "Refresh Data",
      errorTitle: "Weather data is temporarily unavailable",
      errorRetry: "Try Again",
      loadingText: "Fetching live meteorological data for",
      slogan: "Healthy Crops, Brighter Tomorrows",
    },
    mr: {
      searchPlaceholder: "पिके, हवामान, सल्ला किंवा स्थान शोधा...",
      heroTag: "हवामान आणि कृषी सल्ला",
      heroTitle: "रिअल-टाइम हवामानासह\nस्मार्ट शेती करा",
      heroDesc: "आपल्या पिकांचे रक्षण करण्यासाठी आणि उत्पादन वाढवण्यासाठी अचूक हवामान अंदाज, स्थान-आधारित सल्ला आणि AI अंतर्दृष्टी मिळवा.",
      locationInputPlaceholder: "तुमचे स्थान प्रविष्ट करा (उदा. पुणे, महाराष्ट्र)",
      getWeatherBtn: "हवामान पहा",
      detectLocation: "माझे स्थान वापरा",
      badgeForecast: "हवामान अंदाज",
      badgeForecastSub: "थेट अपडेट्स",
      badgeAdvisory: "पीक सल्ला",
      badgeAdvisorySub: "वैयक्तिक मार्गदर्शन",
      badgeAlerts: "धोका सूचना",
      badgeAlertsSub: "पूर्व चेतावणी",
      badgeTips: "शेती टिप्स",
      badgeTipsSub: "तज्ज्ञ मार्गदर्शन",
      updatedJustNow: "आत्ताच अपडेट केले",
      feelsLike: "अनुभव तापमान",
      humidity: "आर्द्रता",
      wind: "वारा",
      pressure: "हवा दाब",
      visibility: "दृश्यमानता",
      precipitation: "पर्जन्यवृष्टी",
      todaysForecast: "आजचा हवामान अंदाज",
      hourlySub: "तुमच्या स्थानासाठी तासाभराचा अंदाज",
      view24Hours: "२४ तास पहा",
      view7Days: "७ दिवसांचा हवामान अंदाज",
      planAhead: "उत्तम शेती नियोजनासाठी आगाऊ माहिती",
      viewFullWeek: "पूर्ण आठवडा पहा",
      cropAdvisory: "पीक सल्ला",
      cropAdvisorySub: "सध्याच्या हवामानानुसार शेती सल्ला",
      viewAll: "सर्व पहा",
      weatherAlerts: "हवामान सूचना",
      alertsSub: "माहितीगार राहा, सज्ज राहा",
      noAlertsTitle: "सध्या कोणतीही हवामान चेतावणी नाही",
      noAlertsSub: "शेती कामांसाठी हवामान आणि जमिनीतील ओलावा अनुकूल आहे.",
      farmingTips: "कृषी टिप्स",
      farmingTipsSub: "भरघोस उत्पादनासाठी शेती तंत्र",
      weatherMap: "परस्परसंवादी हवामान नकाशा",
      weatherMapSub: "तुमच्या परिसरातील थेट हवामान स्थिती पहा",
      quickActions: "जलद कृती",
      quickActionsSub: "स्मार्ट शेतीची साधने",
      checkWeather: "हवामान तपासा",
      checkWeatherSub: "ताजी माहिती मिळवा",
      viewAdvisories: "सल्ला पहा",
      viewAdvisoriesSub: "वैयक्तिक मार्गदर्शन",
      setAlerts: "सूचना सेट करा",
      setAlertsSub: "त्वरित माहिती मिळवा",
      farmingCalendar: "कृषी दिनदर्शिका",
      farmingCalendarSub: "कामांचे नियोजन करा",
      refresh: "ताजे करा",
      errorTitle: "हवामान माहिती सध्या उपलब्ध नाही",
      errorRetry: "पुन्हा प्रयत्न करा",
      loadingText: "थेट हवामान माहिती आणत आहे...",
      slogan: "सुदृढ पिके, समृद्ध भविष्य",
    },
    hi: {
      searchPlaceholder: "फसलें, मौसम, सलाह या स्थान खोजें...",
      heroTag: "मौसम और कृषि सलाह",
      heroTitle: "रीयल-टाइम मौसम के साथ\nस्मार्ट खेती करें",
      heroDesc: "फसलों की सुरक्षा और पैदावार बढ़ाने के लिए सटीक मौसम पूर्वानुमान, स्थान-आधारित सलाह और AI इनसाइट्स प्राप्त करें।",
      locationInputPlaceholder: "अपना स्थान दर्ज करें (उदा. पुणे, महाराष्ट्र)",
      getWeatherBtn: "मौसम देखें",
      detectLocation: "मेरा स्थान उपयोग करें",
      badgeForecast: "मौसम पूर्वानुमान",
      badgeForecastSub: "लाइव अपडेट",
      badgeAdvisory: "फसल सलाह",
      badgeAdvisorySub: "व्यक्तिगत सलाह",
      badgeAlerts: "जोखिम चेतावनी",
      badgeAlertsSub: "पूर्व चेतावनी",
      badgeTips: "खेती के टिप्स",
      badgeTipsSub: "विशेषज्ञ मार्गदर्शन",
      updatedJustNow: "अभी अपडेट किया गया",
      feelsLike: "महसूस तापमान",
      humidity: "नमी",
      wind: "हवा",
      pressure: "वायुदाब",
      visibility: "दृश्यता",
      precipitation: "वर्षा",
      todaysForecast: "आज का मौसम पूर्वानुमान",
      hourlySub: "आपके क्षेत्र का प्रति घंटा पूर्वानुमान",
      view24Hours: "24 घंटे देखें",
      view7Days: "7-दिवसीय मौसम पूर्वानुमान",
      planAhead: "बेहतर कृषि निर्णयों के लिए योजना बनाएं",
      viewFullWeek: "पूरा सप्ताह देखें",
      cropAdvisory: "फसल सलाह",
      cropAdvisorySub: "वर्तमान मौसम पर आधारित व्यक्तिगत सलाह",
      viewAll: "सभी देखें",
      weatherAlerts: "मौसम चेतावनियां",
      alertsSub: "सतर्क रहें, तैयार रहें",
      noAlertsTitle: "कोई सक्रिय मौसम चेतावनी नहीं",
      noAlertsSub: "खेत कार्यों के लिए मौसमी परिस्थितियां अनुकूल हैं।",
      farmingTips: "कृषि टिप्स",
      farmingTipsSub: "अधिक पैदावार के लिए टिप्स",
      weatherMap: "इंटरैक्टिव मौसम नक्शा",
      weatherMapSub: "अपने क्षेत्र में लाइव मौसम की स्थिति देखें",
      quickActions: "त्वरित क्रियाएं",
      quickActionsSub: "स्मार्ट खेती के उपकरण",
      checkWeather: "मौसम देखें",
      checkWeatherSub: "नवीनतम अपडेट पाएं",
      viewAdvisories: "सलाह देखें",
      viewAdvisoriesSub: "व्यक्तिगत सलाह देखें",
      setAlerts: "अलर्ट सेट करें",
      setAlertsSub: "तुरंत सूचना पाएं",
      farmingCalendar: "कृषि कैलेंडर",
      farmingCalendarSub: "गतिविधियों की योजना बनाएं",
      refresh: "रिफ्रेश करें",
      errorTitle: "मौसम की जानकारी अस्थायी रूप से अनुपलब्ध है",
      errorRetry: "पुनः प्रयास करें",
      loadingText: "लाइव मौसम डेटा प्राप्त हो रहा है...",
      slogan: "स्वस्थ फसलें, उज्ज्वल भविष्य",
    },
  };

  const currentT = t[language] || t.en;

  // Fetch Weather Function
  const fetchWeather = async (queryOrCoords, isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    let url = "http://127.0.0.1:8000/weather";
    if (typeof queryOrCoords === "object" && queryOrCoords.latitude && queryOrCoords.longitude) {
      url += `?lat=${queryOrCoords.latitude}&lon=${queryOrCoords.longitude}`;
    } else {
      const q = (typeof queryOrCoords === "string" ? queryOrCoords : currentLocationQuery).trim();
      url += `?location=${encodeURIComponent(q)}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Unable to fetch weather details.");
      }
      const data = await res.json();
      setWeatherData(data);

      if (data?.location?.formatted) {
        setCurrentLocationQuery(data.location.formatted);
        sessionStorage.setItem("agrimind_selected_location", data.location.formatted);
      }
    } catch (err) {
      console.error("[WeatherAdvisory] Error fetching weather:", err);
      setError(err.message || "Failed to load weather data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchWeather(currentLocationQuery);
  }, []);

  // Handle Location Search Input & Auto-complete Suggestions
  useEffect(() => {
    if (searchInput.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/weather/search?q=${encodeURIComponent(searchInput.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchSuggestions(data.results || []);
          setShowSuggestions(true);
        }
      } catch (e) {
        // Silently fail suggestions
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside to close location suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Geolocation Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please enter your location manually.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const { latitude, longitude } = position.coords;
        fetchWeather({ latitude, longitude });
      },
      (geoErr) => {
        setGeoLoading(false);
        setError("Location access was denied. Please enter your location manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Trigger search on Submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchInput.trim()) return;
    setShowSuggestions(false);
    fetchWeather(searchInput.trim());
  };

  const handleSelectSuggestion = (item) => {
    setShowSuggestions(false);
    setSearchInput("");
    if (item.latitude && item.longitude) {
      fetchWeather({ latitude: item.latitude, longitude: item.longitude });
    } else {
      fetchWeather(item.label || item.name);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeather(currentLocationQuery, true);
  };

  // Weather Icon Helpers
  const getWeatherIcon = (iconName, isDay = true) => {
    switch (iconName) {
      case "sunny":
        return (
          <svg className="w-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" fill="#FDE68A" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        );
      case "partly-cloudy":
        return (
          <svg className="w-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v2" stroke="#F59E0B" />
            <path d="m4.93 4.93 1.41 1.41" stroke="#F59E0B" />
            <path d="M20 12h2" stroke="#F59E0B" />
            <path d="m19.07 4.93-1.41 1.41" stroke="#F59E0B" />
            <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128A5 5 0 0 0 3 13.5a5 5 0 0 0 5 5h9a4 4 0 0 0 3.947-4.85Z" fill="#E0F2FE" />
          </svg>
        );
      case "overcast":
      case "cloudy":
        return (
          <svg className="w-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#F1F5F9" />
          </svg>
        );
      case "rain":
      case "rain-showers":
      case "drizzle":
        return (
          <svg className="w-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" fill="#E0F2FE" />
            <path d="M16 14v6" stroke="#0284C7" strokeDasharray="2 3" strokeWidth="2.5" />
            <path d="M8 14v6" stroke="#0284C7" strokeDasharray="2 3" strokeWidth="2.5" />
            <path d="M12 16v6" stroke="#0284C7" strokeDasharray="2 3" strokeWidth="2.5" />
          </svg>
        );
      case "heavy-rain":
      case "thunderstorm":
        return (
          <svg className="w-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#CBD5E1" />
            <path d="m13 16-3 5h4l-2 5" stroke="#F59E0B" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
        );
      case "fog":
        return (
          <svg className="w-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14h16" />
            <path d="M4 18h16" />
            <path d="M4 10h16" />
          </svg>
        );
      default:
        return (
          <svg className="w-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" fill="#FEF3C7" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
          </svg>
        );
    }
  };

  // Advisory Icon Picker
  const getAdvisoryIcon = (type) => {
    switch (type) {
      case "irrigation":
        return (
          <div className="adv-icon-badge blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        );
      case "pest":
        return (
          <div className="adv-icon-badge amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>
        );
      case "fertilizer":
        return (
          <div className="adv-icon-badge green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10" />
              <path d="M10 20c0-5.5 2-8 2-13 0 5 2 7.5 2 13" />
              <path d="M12 7c-2.5-3-6-3.5-6-3.5s.5 3.5 3.5 6" />
              <path d="M12 11c2.5-3 6-3.5 6-3.5s-.5 3.5-3.5 6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="adv-icon-badge green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        );
    }
  };

  const getAlertSeverityBadge = (sev) => {
    const s = (sev || "Low").toLowerCase();
    if (s.includes("high") || s.includes("danger") || s.includes("severe")) {
      return <span className="alert-badge high">High</span>;
    }
    if (s.includes("medium") || s.includes("moderate")) {
      return <span className="alert-badge medium">Medium</span>;
    }
    return <span className="alert-badge low">Low</span>;
  };

  const getAlertIcon = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("rain") || t.includes("flood")) {
      return (
        <div className="alert-icon-box rain">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M16 14v6M8 14v6M12 16v6" strokeDasharray="2 3" />
          </svg>
        </div>
      );
    }
    if (t.includes("wind") || t.includes("storm")) {
      return (
        <div className="alert-icon-box wind">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
          </svg>
        </div>
      );
    }
    return (
      <div className="alert-icon-box temp">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      </div>
    );
  };

  const current = weatherData?.current || {};
  const hourly = Array.isArray(weatherData?.hourly) ? weatherData.hourly : [];
  const daily = Array.isArray(weatherData?.daily) ? weatherData.daily : [];
  
  // Safe Array Normalization for Advisories
  const rawAdvisory = weatherData?.advisory;
  const advisories = Array.isArray(rawAdvisory)
    ? rawAdvisory
    : rawAdvisory && typeof rawAdvisory === "object"
    ? Object.keys(rawAdvisory).map((k) => ({
        id: k,
        type: k.toLowerCase().includes("pest") ? "pest" : k.toLowerCase().includes("fert") ? "fertilizer" : k.toLowerCase().includes("sow") ? "sowing" : "irrigation",
        title: rawAdvisory[k]?.title || k,
        timeframe: rawAdvisory[k]?.tag || "Daily Advisory",
        description: rawAdvisory[k]?.advice || rawAdvisory[k]?.description || "",
        status: rawAdvisory[k]?.status || "good",
      }))
    : [];

  const alerts = Array.isArray(weatherData?.alerts) ? weatherData.alerts : [];
  const tips = Array.isArray(weatherData?.farmingTips) ? weatherData.farmingTips : [];
  const locationInfo = weatherData?.location || { formatted: currentLocationQuery, name: currentLocationQuery };

  return (
    <div className="weather-advisory-page">
      {/* ================= TOPBAR ================= */}
      <header className="exp-topbar" style={{ justifyContent: "flex-end" }}>
        {/* Right Actions */}
        <div className="topbar-actions">
          {/* Language Selector */}
          <div className="lang-dropdown">
            <button className="lang-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{language === "mr" ? "मराठी" : language === "hi" ? "हिन्दी" : "English"}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="lang-menu">
              <button onClick={() => setLanguage("en")}>English</button>
              <button onClick={() => setLanguage("mr")}>मराठी (Marathi)</button>
              <button onClick={() => setLanguage("hi")}>हिन्दी (Hindi)</button>
            </div>
          </div>

          {/* Notifications */}
          <button className="icon-badge-btn" onClick={() => setShowAllAlertsModal(true)} title="Weather Alerts">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {alerts.length > 0 && <span className="badge-count red">{alerts.length}</span>}
          </button>

          {/* User Profile Dropdown */}
          <UserProfileMenu variant="topbar" />
        </div>
      </header>

      {/* ================= PAGE CONTAINER ================= */}
      <div className="weather-content-wrapper">

        {/* ================= 1. HERO BANNER ================= */}
        <section className="weather-hero-banner" style={{ backgroundImage: `url('/images/weather_hero_bg.jpg')` }}>
          <div className="hero-overlay" />
          
          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-eyebrow">
                <span className="eyebrow-line" />
                <span>{currentT.heroTag}</span>
              </div>
              <h1 className="hero-title">
                {currentT.heroTitle.split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </h1>
              <p className="hero-desc">{currentT.heroDesc}</p>

              {/* Location Search Bar */}
              <div className="hero-search-wrapper" ref={searchContainerRef}>
                <div className="search-input-box">
                  <svg className="pin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    placeholder={currentT.locationInputPlaceholder}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                  />
                  {/* Geolocation Button */}
                  <button
                    type="button"
                    className="btn-locate"
                    title={currentT.detectLocation}
                    onClick={handleDetectLocation}
                    disabled={geoLoading}
                  >
                    {geoLoading ? (
                      <span className="mini-spinner" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="6" />
                        <line x1="12" y1="18" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="6" y2="12" />
                        <line x1="18" y1="12" x2="22" y2="12" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-get-weather"
                  onClick={handleSearchSubmit}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                  <span>{currentT.getWeatherBtn}</span>
                </button>

                {/* Auto-complete Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="location-suggestions-menu">
                    {searchSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        className="suggestion-item"
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hero Right Badges & Slogan */}
            <div className="hero-right">
              <div className="hero-slogan-box">
                <span className="slogan-text">“{currentT.slogan}”</span>
                <span className="slogan-leaf">🌿</span>
              </div>

              <div className="hero-feature-badges">
                <div className="feature-pill" onClick={() => document.getElementById("todays-forecast")?.scrollIntoView({ behavior: "smooth" })}>
                  <div className="pill-icon forecast">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2" />
                    </svg>
                  </div>
                  <div className="pill-info">
                    <span className="pill-title">{currentT.badgeForecast}</span>
                    <span className="pill-sub">{currentT.badgeForecastSub}</span>
                  </div>
                </div>

                <div className="feature-pill" onClick={() => document.getElementById("crop-advisory-section")?.scrollIntoView({ behavior: "smooth" })}>
                  <div className="pill-icon advisory">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2">
                      <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                      <path d="M4 21c3-4 6.5-6.5 11-9" />
                    </svg>
                  </div>
                  <div className="pill-info">
                    <span className="pill-title">{currentT.badgeAdvisory}</span>
                    <span className="pill-sub">{currentT.badgeAdvisorySub}</span>
                  </div>
                </div>

                <div className="feature-pill" onClick={() => document.getElementById("weather-alerts-section")?.scrollIntoView({ behavior: "smooth" })}>
                  <div className="pill-icon alerts">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="pill-info">
                    <span className="pill-title">{currentT.badgeAlerts}</span>
                    <span className="pill-sub">{currentT.badgeAlertsSub}</span>
                  </div>
                </div>

                <div className="feature-pill" onClick={() => document.getElementById("farming-tips-section")?.scrollIntoView({ behavior: "smooth" })}>
                  <div className="pill-icon tips">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2">
                      <path d="M12 2a6 6 0 0 0-6 6c0 3.3 2 5.5 3 7.5h6c1-2 3-4.2 3-7.5a6 6 0 0 0-6-6Z" />
                      <path d="M9 19h6M10 22h4" />
                    </svg>
                  </div>
                  <div className="pill-info">
                    <span className="pill-title">{currentT.badgeTips}</span>
                    <span className="pill-sub">{currentT.badgeTipsSub}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ERROR STATE ================= */}
        {error && (
          <div className="weather-error-banner">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              <h4>{currentT.errorTitle}</h4>
              <p>{error}</p>
            </div>
            <button className="btn-retry" onClick={() => fetchWeather(currentLocationQuery)}>
              {currentT.errorRetry}
            </button>
          </div>
        )}

        {/* ================= 2. TOP CARDS GRID (CURRENT + HOURLY + 7-DAY) ================= */}
        <section className="weather-top-grid">
          
          {/* Card A: Current Weather Card */}
          <div className="weather-card current-weather-card">
            {loading ? (
              <div className="skeleton-container">
                <div className="skeleton line short" />
                <div className="skeleton line medium" />
                <div className="skeleton circle large" />
                <div className="skeleton-grid" />
              </div>
            ) : (
              <>
                <div className="card-header-row">
                  <div className="location-meta">
                    <div className="loc-name-row">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <h3 className="city-title">{locationInfo.formatted || locationInfo.name}</h3>
                    </div>
                    <span className="last-updated-text">
                      {currentT.updatedJustNow} • {new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <button className={`btn-refresh-data ${refreshing ? "spinning" : ""}`} onClick={handleRefresh} title={currentT.refresh}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16" />
                    </svg>
                  </button>
                </div>

                <div className="current-main-row">
                  <div className="temp-hero">
                    <div className="weather-icon-wrapper">
                      {getWeatherIcon(current.icon, current.isDay)}
                    </div>
                    <div className="temp-values">
                      <div className="temp-number">{Math.round(current.temperature ?? 28)}°C</div>
                      <div className="condition-name">{current.condition || "Partly Cloudy"}</div>
                      <div className="feels-like">{currentT.feelsLike} {Math.round(current.feelsLike ?? 30)}°C</div>
                    </div>
                  </div>

                  <div className="current-metrics-list">
                    <div className="metric-item">
                      <div className="metric-icon blue">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                      </div>
                      <div className="metric-details">
                        <span className="metric-lbl">{currentT.humidity}</span>
                        <span className="metric-val">{current.humidity ?? 72}%</span>
                      </div>
                    </div>

                    <div className="metric-item">
                      <div className="metric-icon green">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2">
                          <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                          <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                          <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                        </svg>
                      </div>
                      <div className="metric-details">
                        <span className="metric-lbl">{currentT.wind}</span>
                        <span className="metric-val">{Math.round(current.windSpeed ?? 12)} km/h</span>
                      </div>
                    </div>

                    <div className="metric-item">
                      <div className="metric-icon purple">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2">
                          <circle cx="12" cy="12" r="9" />
                          <polyline points="12 7 12 12 15 15" />
                        </svg>
                      </div>
                      <div className="metric-details">
                        <span className="metric-lbl">{currentT.pressure}</span>
                        <span className="metric-val">{Math.round(current.pressure ?? 1012)} hPa</span>
                      </div>
                    </div>

                    <div className="metric-item">
                      <div className="metric-icon slate">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <div className="metric-details">
                        <span className="metric-lbl">{currentT.visibility}</span>
                        <span className="metric-val">{(current.visibility ?? 10).toFixed(0)} km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Card B: Today's Hourly Forecast */}
          <div className="weather-card hourly-forecast-card" id="todays-forecast">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">{currentT.todaysForecast}</h3>
                <span className="card-sub">{currentT.hourlySub}</span>
              </div>
              <button className="view-action-link" onClick={() => setView24Hours(!view24Hours)}>
                {view24Hours ? "Show Less" : currentT.view24Hours} →
              </button>
            </div>

            {loading ? (
              <div className="skeleton-hourly-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton hourly-pill" />
                ))}
              </div>
            ) : (
              <div className={`hourly-scroll-track ${view24Hours ? "wrap-mode" : ""}`}>
                {(view24Hours ? hourly.slice(0, 24) : hourly.slice(0, 5)).map((item, idx) => (
                  <div key={idx} className="hourly-column-card">
                    <span className="hour-time">{item.time}</span>
                    <div className="hour-icon">
                      {getWeatherIcon(item.icon, item.isDay)}
                    </div>
                    <span className="hour-temp">{Math.round(item.temperature)}°</span>
                    {item.precipitationProbability > 0 && (
                      <div className="hour-rain">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#0284C7">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                        <span>{item.precipitationProbability}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card C: 7-Day Forecast */}
          <div className="weather-card daily-forecast-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">{currentT.view7Days}</h3>
                <span className="card-sub">{currentT.planAhead}</span>
              </div>
              <button className="view-action-link" onClick={() => setView24Hours(!view24Hours)}>
                {currentT.viewFullWeek} →
              </button>
            </div>

            {loading ? (
              <div className="skeleton-container">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="skeleton line full" />
                ))}
              </div>
            ) : (
              <div className="daily-forecast-list">
                {daily.map((day, idx) => (
                  <div key={idx} className="daily-forecast-row">
                    <div className="day-name">{day.weekday}</div>
                    <div className="day-weather-icon">
                      {getWeatherIcon(day.icon, true)}
                    </div>
                    <div className="day-rain-prob">
                      {day.precipitationProbabilityMax > 15 ? (
                        <span className="rain-badge">💧 {day.precipitationProbabilityMax}%</span>
                      ) : (
                        <span className="rain-badge none" />
                      )}
                    </div>
                    <div className="day-temp-range">
                      <span className="min-temp">{Math.round(day.minTemperature)}°</span>
                      <span className="temp-sep">/</span>
                      <span className="max-temp">{Math.round(day.maxTemperature)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* ================= 3. MIDDLE SECTION: ADVISORY + ALERTS + FARMING TIPS ================= */}
        <section className="weather-middle-grid">
          
          {/* Card 1: Crop Advisory */}
          <div className="weather-card crop-advisory-card" id="crop-advisory-section">
            <div className="card-header-row">
              <div className="card-header-icon-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2">
                  <path d="M20.5 4.5C13.5 4.5 7 7 5 14c-1 3.5 1 5.5 4.5 4.5C16.5 16.5 19.5 10 20.5 4.5Z" />
                  <path d="M4 21c3-4 6.5-6.5 11-9" />
                </svg>
                <div>
                  <h3 className="card-title">{currentT.cropAdvisory}</h3>
                  <span className="card-sub">{currentT.cropAdvisorySub}</span>
                </div>
              </div>
              <button className="view-action-link" onClick={() => setShowAllAdvisoryModal(true)}>
                {currentT.viewAll} →
              </button>
            </div>

            {loading ? (
              <div className="skeleton-container">
                <div className="skeleton line medium" />
                <div className="skeleton line medium" />
                <div className="skeleton line medium" />
              </div>
            ) : advisories.length === 0 ? (
              <div className="empty-state-box">
                <p>Weather-based advisory will appear when enough data is available.</p>
              </div>
            ) : (
              <div className="advisory-items-list">
                {advisories.map((adv) => (
                  <div key={adv.id} className="advisory-row-item">
                    {getAdvisoryIcon(adv.type)}
                    <div className="advisory-content">
                      <div className="advisory-top-line">
                        <span className="advisory-heading">{adv.title}</span>
                        <span className="advisory-tag">{adv.timeframe}</span>
                      </div>
                      <p className="advisory-desc">{adv.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Weather Alerts */}
          <div className="weather-card weather-alerts-card" id="weather-alerts-section">
            <div className="card-header-row">
              <div className="card-header-icon-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <h3 className="card-title">{currentT.weatherAlerts}</h3>
                  <span className="card-sub">{currentT.alertsSub}</span>
                </div>
              </div>
              <button className="view-action-link" onClick={() => setShowAllAlertsModal(true)}>
                {currentT.viewAll} →
              </button>
            </div>

            {loading ? (
              <div className="skeleton-container">
                <div className="skeleton line medium" />
                <div className="skeleton line medium" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="no-alerts-card-state">
                <div className="check-circle-green">✓</div>
                <div>
                  <h4>{currentT.noAlertsTitle}</h4>
                  <p>{currentT.noAlertsSub}</p>
                </div>
              </div>
            ) : (
              <div className="alerts-items-list">
                {alerts.map((al) => (
                  <div key={al.id} className="alert-row-item">
                    {getAlertIcon(al.title)}
                    <div className="alert-content">
                      <div className="alert-top-line">
                        <span className="alert-heading">{al.title}</span>
                        {getAlertSeverityBadge(al.severity)}
                      </div>
                      <p className="alert-desc">{al.description}</p>
                      {al.farmerAction && (
                        <div className="alert-action-pill">
                          <strong>Action:</strong> {al.farmerAction}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Farming Tips */}
          <div className="weather-card farming-tips-card" id="farming-tips-section">
            <div className="card-header-row">
              <div className="card-header-icon-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2">
                  <path d="M12 2a6 6 0 0 0-6 6c0 3.3 2 5.5 3 7.5h6c1-2 3-4.2 3-7.5a6 6 0 0 0-6-6Z" />
                  <path d="M9 19h6M10 22h4" />
                </svg>
                <div>
                  <h3 className="card-title">{currentT.farmingTips}</h3>
                  <span className="card-sub">{currentT.farmingTipsSub}</span>
                </div>
              </div>
              <button className="view-action-link" onClick={() => setShowAllTipsModal(true)}>
                {currentT.viewAll} →
              </button>
            </div>

            {loading ? (
              <div className="skeleton-container">
                <div className="skeleton line medium" />
                <div className="skeleton line medium" />
              </div>
            ) : (
              <div className="farming-tips-list">
                {tips.map((tip) => (
                  <div key={tip.id} className="tip-row-card">
                    <div className="tip-thumb">
                      <img
                        src={tip.image}
                        alt={tip.title}
                        onError={(e) => {
                          e.target.src = "/images/crop_soil.jpg";
                        }}
                      />
                    </div>
                    <div className="tip-text-content">
                      <h4 className="tip-title">{tip.title}</h4>
                      <p className="tip-desc">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* ================= 4. BOTTOM SECTION: INTERACTIVE MAP + QUICK ACTIONS ================= */}
        <section className="weather-bottom-grid">
          
          {/* Card A: Interactive Weather Map */}
          <div className="weather-card weather-map-card">
            <div className="card-header-row map-header">
              <div className="card-header-icon-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
                <div>
                  <h3 className="card-title">{currentT.weatherMap}</h3>
                  <span className="card-sub">{currentT.weatherMapSub}</span>
                </div>
              </div>

              {/* Map Layer Selector Controls */}
              <div className="map-controls-group">
                <select
                  className="map-select-dropdown"
                  value={mapLayer}
                  onChange={(e) => setMapLayer(e.target.value)}
                >
                  <option value="Rainfall">Rainfall</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Wind">Wind Stream</option>
                </select>

                <select
                  className="map-select-dropdown"
                  value={mapTimeframe}
                  onChange={(e) => setMapTimeframe(e.target.value)}
                >
                  <option value="Next 24 Hours">Next 24 Hours</option>
                  <option value="Live Radar">Live Radar</option>
                  <option value="7-Day Model">7-Day Model</option>
                </select>
              </div>
            </div>

            {/* Map Canvas / Visualization */}
            <div className="interactive-map-frame">
              {/* Simulated Map Visual using OpenStreetMap Tiles & Gradient Radar */}
              <iframe
                title="Weather Map Visual"
                className="osm-map-iframe"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(locationInfo.longitude || 73.85) - 0.4}%2C${(locationInfo.latitude || 18.52) - 0.3}%2C${(locationInfo.longitude || 73.85) + 0.4}%2C${(locationInfo.latitude || 18.52) + 0.3}&amp;layer=mapnik&amp;marker=${locationInfo.latitude || 18.52}%2C${locationInfo.longitude || 73.85}`}
              />

              {/* Weather Overlay Canvas */}
              <div className={`weather-radar-overlay ${mapLayer.toLowerCase()}`} />

              {/* Selected Location Center Pin Marker */}
              <div className="map-center-pin">
                <div className="pin-pulse" />
                <div className="pin-tooltip">
                  <strong>{locationInfo.name || "Pune"}</strong>
                  <span>{Math.round(current.temperature ?? 28)}°C • {current.condition || "Clear"}</span>
                </div>
              </div>

              {/* Map Legend Overlay */}
              <div className="map-legend-card">
                <span className="legend-title">{mapLayer} {mapLayer === "Rainfall" ? "(mm)" : mapLayer === "Temperature" ? "(°C)" : "(km/h)"}</span>
                <div className="legend-scale-bar" />
                <div className="legend-labels">
                  <span>{mapLayer === "Rainfall" ? "0" : mapLayer === "Temperature" ? "15°" : "0"}</span>
                  <span>{mapLayer === "Rainfall" ? "25" : mapLayer === "Temperature" ? "28°" : "20"}</span>
                  <span>{mapLayer === "Rainfall" ? "50" : mapLayer === "Temperature" ? "35°" : "40"}</span>
                  <span>{mapLayer === "Rainfall" ? "100+" : mapLayer === "Temperature" ? "42°+" : "60+"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Quick Actions */}
          <div className="weather-card quick-actions-card">
            <div className="card-header-row">
              <div className="card-header-icon-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <div>
                  <h3 className="card-title">{currentT.quickActions}</h3>
                  <span className="card-sub">{currentT.quickActionsSub}</span>
                </div>
              </div>
            </div>

            <div className="quick-actions-grid">
              <button className="quick-action-tile" onClick={handleRefresh}>
                <div className="action-tile-icon green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2">
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                </div>
                <div className="action-tile-text">
                  <span className="action-tile-title">{currentT.checkWeather}</span>
                  <span className="action-tile-sub">{currentT.checkWeatherSub}</span>
                </div>
              </button>

              <button className="quick-action-tile" onClick={() => setShowAllAdvisoryModal(true)}>
                <div className="action-tile-icon blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="action-tile-text">
                  <span className="action-tile-title">{currentT.viewAdvisories}</span>
                  <span className="action-tile-sub">{currentT.viewAdvisoriesSub}</span>
                </div>
              </button>

              <button className="quick-action-tile" onClick={() => {
                setAlertSuccessMsg("Weather alert SMS & notification subscription enabled for " + (locationInfo.name || "your area") + "!");
                setTimeout(() => setAlertSuccessMsg(""), 4000);
              }}>
                <div className="action-tile-icon purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="action-tile-text">
                  <span className="action-tile-title">{currentT.setAlerts}</span>
                  <span className="action-tile-sub">{currentT.setAlertsSub}</span>
                </div>
              </button>

              <button className="quick-action-tile" onClick={() => navigate("/management")}>
                <div className="action-tile-icon amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="action-tile-text">
                  <span className="action-tile-title">{currentT.farmingCalendar}</span>
                  <span className="action-tile-sub">{currentT.farmingCalendarSub}</span>
                </div>
              </button>
            </div>

            {/* Alert Notification Confirmation Message */}
            {alertSuccessMsg && (
              <div className="alert-success-banner">
                <span>🔔 {alertSuccessMsg}</span>
              </div>
            )}
          </div>

        </section>

      </div>

      {/* ================= MODAL: ALL ADVISORIES ================= */}
      {showAllAdvisoryModal && (
        <div className="weather-modal-overlay" onClick={() => setShowAllAdvisoryModal(false)}>
          <div className="weather-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🌾 Comprehensive Farm Weather Advisory</h3>
              <button className="btn-close-modal" onClick={() => setShowAllAdvisoryModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-intro">
                Tailored agronomic guidelines generated from real-time meteorological conditions for <strong>{locationInfo.formatted || "your farm"}</strong>.
              </p>
              <div className="modal-advisories-list">
                {advisories.map((adv) => (
                  <div key={adv.id} className="modal-advisory-item">
                    {getAdvisoryIcon(adv.type)}
                    <div>
                      <div className="modal-adv-header">
                        <h4>{adv.title}</h4>
                        <span className="adv-badge">{adv.timeframe}</span>
                      </div>
                      <p>{adv.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ALL WEATHER ALERTS ================= */}
      {showAllAlertsModal && (
        <div className="weather-modal-overlay" onClick={() => setShowAllAlertsModal(false)}>
          <div className="weather-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Meteorological Risk & Alert Center</h3>
              <button className="btn-close-modal" onClick={() => setShowAllAlertsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {alerts.length === 0 ? (
                <div className="modal-empty-alerts">
                  <div className="check-circle-green large">✓</div>
                  <h4>No Active Weather Risks</h4>
                  <p>Weather conditions in your location are safe and within normal parameters for standard farming routines.</p>
                </div>
              ) : (
                <div className="modal-alerts-list">
                  {alerts.map((al) => (
                    <div key={al.id} className="modal-alert-item">
                      {getAlertIcon(al.title)}
                      <div>
                        <div className="modal-alert-header">
                          <h4>{al.title}</h4>
                          {getAlertSeverityBadge(al.severity)}
                        </div>
                        <p className="alert-body-desc">{al.description}</p>
                        {al.farmerAction && (
                          <div className="alert-action-box">
                            <strong>Recommended Farm Action:</strong> {al.farmerAction}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ALL FARMING TIPS ================= */}
      {showAllTipsModal && (
        <div className="weather-modal-overlay" onClick={() => setShowAllTipsModal(false)}>
          <div className="weather-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💡 Expert Weather-Adapted Farming Tips</h3>
              <button className="btn-close-modal" onClick={() => setShowAllTipsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-tips-list">
                {tips.map((tip) => (
                  <div key={tip.id} className="modal-tip-item">
                    <img src={tip.image} alt={tip.title} className="modal-tip-img" />
                    <div>
                      <h4>{tip.title}</h4>
                      <p>{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
