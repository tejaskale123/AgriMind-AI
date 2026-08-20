import React, { useEffect, useState } from "react";

const DEFAULT_SETTINGS = {
    confidenceThreshold: 70,
    autoHistory: true,
    showProbabilities: true,
    notifications: true,
    language: "English",
    theme: "Light",
};

const translations = {
    English: {
        settings: "Settings",
        subtitle: "Manage your AgriMind AI preferences.",
        aiModel: "AI Model",
        aiModelDesc: "Information about the disease detection model.",
        model: "Model",
        crop: "Supported Crop",
        imageSize: "Input Image Size",
        device: "Device",
        detection: "Detection Settings",
        detectionDesc: "Configure how AI detection results are displayed.",
        confidence: "Confidence Threshold",
        confidenceDesc: "Minimum confidence level for AI predictions.",
        history: "Save Detection History",
        historyDesc: "Automatically save AI detection results.",
        probabilities: "Show Class Probabilities",
        probabilitiesDesc: "Display probability for every disease class.",
        appearance: "Appearance",
        appearanceDesc: "Customize how AgriMind AI looks.",
        theme: "Theme",
        language: "Language",
        languageDesc: "Select your preferred application language.",
        notifications: "Notifications",
        notificationsDesc: "Receive notifications about AI detection results.",
        system: "System Information",
        systemDesc: "Current AgriMind AI system information.",
        application: "Application",
        version: "Version",
        backend: "Backend",
        database: "Database",
        ready: "Ready",
        connected: "Connected",
        active: "Active",
        save: "Save Settings",
        reset: "Reset",
        saved: "Settings saved successfully.",
        resetDone: "Settings reset successfully.",
        light: "Light",
        dark: "Dark",
        systemTheme: "System",
        on: "ON",
        off: "OFF",
    },

    Marathi: {
        settings: "सेटिंग्ज",
        subtitle: "तुमच्या AgriMind AI च्या सेटिंग्ज व्यवस्थापित करा.",
        aiModel: "AI मॉडेल",
        aiModelDesc: "रोग शोधणाऱ्या AI मॉडेलची माहिती.",
        model: "मॉडेल",
        crop: "समर्थित पीक",
        imageSize: "इनपुट इमेज आकार",
        device: "डिव्हाइस",
        detection: "डिटेक्शन सेटिंग्ज",
        detectionDesc: "AI डिटेक्शनचे परिणाम कसे दाखवायचे ते सेट करा.",
        confidence: "Confidence Threshold",
        confidenceDesc: "AI prediction साठी किमान confidence level.",
        history: "Detection History सेव्ह करा",
        historyDesc: "AI detection चे परिणाम आपोआप सेव्ह करा.",
        probabilities: "Class Probabilities दाखवा",
        probabilitiesDesc: "प्रत्येक disease class ची probability दाखवा.",
        appearance: "दिसण्याची सेटिंग्ज",
        appearanceDesc: "AgriMind AI चा appearance बदला.",
        theme: "Theme",
        language: "भाषा",
        languageDesc: "तुमची आवडती application language निवडा.",
        notifications: "Notifications",
        notificationsDesc: "AI detection results साठी notifications मिळवा.",
        system: "System Information",
        systemDesc: "AgriMind AI system ची सध्याची माहिती.",
        application: "Application",
        version: "Version",
        backend: "Backend",
        database: "Database",
        ready: "तयार",
        connected: "Connected",
        active: "Active",
        save: "सेटिंग्ज सेव्ह करा",
        reset: "Reset",
        saved: "सेटिंग्ज यशस्वीपणे सेव्ह झाल्या.",
        resetDone: "सेटिंग्ज default वर reset झाल्या.",
        light: "Light",
        dark: "Dark",
        systemTheme: "System",
        on: "ON",
        off: "OFF",
    },

    Hindi: {
        settings: "सेटिंग्स",
        subtitle: "अपनी AgriMind AI preferences manage करें।",
        aiModel: "AI मॉडल",
        aiModelDesc: "Disease detection AI model की जानकारी।",
        model: "मॉडल",
        crop: "Supported Crop",
        imageSize: "Input Image Size",
        device: "Device",
        detection: "Detection Settings",
        detectionDesc: "AI detection results कैसे दिखाए जाएं यह configure करें।",
        confidence: "Confidence Threshold",
        confidenceDesc: "AI prediction के लिए minimum confidence level।",
        history: "Detection History Save करें",
        historyDesc: "AI detection results automatically save करें।",
        probabilities: "Class Probabilities दिखाएं",
        probabilitiesDesc: "हर disease class की probability दिखाएं।",
        appearance: "Appearance",
        appearanceDesc: "AgriMind AI का appearance customize करें।",
        theme: "Theme",
        language: "भाषा",
        languageDesc: "अपनी पसंदीदा application language चुनें।",
        notifications: "Notifications",
        notificationsDesc: "AI detection results के बारे में notifications प्राप्त करें।",
        system: "System Information",
        systemDesc: "AgriMind AI system की current information।",
        application: "Application",
        version: "Version",
        backend: "Backend",
        database: "Database",
        ready: "Ready",
        connected: "Connected",
        active: "Active",
        save: "Settings Save करें",
        reset: "Reset",
        saved: "Settings successfully save हो गईं।",
        resetDone: "Settings default पर reset हो गईं।",
        light: "Light",
        dark: "Dark",
        systemTheme: "System",
        on: "ON",
        off: "OFF",
    },
};


function getStoredSettings() {
    try {
        const stored = localStorage.getItem("agrimind_settings");

        if (!stored) {
            return DEFAULT_SETTINGS;
        }

        const parsed = JSON.parse(stored);

        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
        };

    } catch (error) {
        console.error("Unable to load settings:", error);
        return DEFAULT_SETTINGS;
    }
}


function applyTheme(theme) {

    const html = document.documentElement;
    const body = document.body;

    // Remove old theme classes
    html.classList.remove(
        "agrimind-light",
        "agrimind-dark"
    );

    body.classList.remove(
        "agrimind-light",
        "agrimind-dark"
    );

    // DARK
    if (theme === "Dark") {

        html.classList.add("agrimind-dark");
        body.classList.add("agrimind-dark");

        html.setAttribute(
            "data-theme",
            "dark"
        );

    }

    // SYSTEM
    else if (theme === "System") {

        const darkMode =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        if (darkMode) {

            html.classList.add(
                "agrimind-dark"
            );

            body.classList.add(
                "agrimind-dark"
            );

            html.setAttribute(
                "data-theme",
                "dark"
            );

        } else {

            html.classList.add(
                "agrimind-light"
            );

            body.classList.add(
                "agrimind-light"
            );

            html.setAttribute(
                "data-theme",
                "light"
            );
        }

    }

    // LIGHT
    else {

        html.classList.add(
            "agrimind-light"
        );

        body.classList.add(
            "agrimind-light"
        );

        html.setAttribute(
            "data-theme",
            "light"
        );
    }
}

function Settings() {

    const [settings, setSettings] =
        useState(getStoredSettings);

    const [message, setMessage] =
        useState("");


    const t =
        translations[settings.language] ||
        translations.English;


    // =========================================================
    // APPLY SAVED THEME ON PAGE LOAD
    // =========================================================

    useEffect(() => {

        applyTheme(settings.theme);

    }, [settings.theme]);


    // =========================================================
    // SYSTEM THEME CHANGE
    // =========================================================

    useEffect(() => {

        if (settings.theme !== "System") {
            return;
        }

        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        const handleChange = () => {
            applyTheme("System");
        };

        mediaQuery.addEventListener(
            "change",
            handleChange
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleChange
            );
        };

    }, [settings.theme]);


    // =========================================================
    // UPDATE SETTING
    // =========================================================

    const updateSetting = (key, value) => {

        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));

    };


    // =========================================================
    // SAVE SETTINGS
    // =========================================================

    const handleSaveSettings = () => {

        localStorage.setItem(
            "agrimind_settings",
            JSON.stringify(settings)
        );


        // Keep old keys for compatibility
        localStorage.setItem(
            "agrimind_confidence_threshold",
            settings.confidenceThreshold
        );

        localStorage.setItem(
            "agrimind_auto_history",
            String(settings.autoHistory)
        );

        localStorage.setItem(
            "agrimind_show_probabilities",
            String(settings.showProbabilities)
        );

        localStorage.setItem(
            "agrimind_notifications",
            String(settings.notifications)
        );

        localStorage.setItem(
            "agrimind_language",
            settings.language
        );

        localStorage.setItem(
            "agrimind_theme",
            settings.theme
        );


        // Notify other React components
        window.dispatchEvent(
            new CustomEvent(
                "agrimind-settings-changed",
                {
                    detail: settings,
                }
            )
        );


        setMessage(t.saved);

        setTimeout(() => {
            setMessage("");
        }, 3000);
    };


    // =========================================================
    // RESET SETTINGS
    // =========================================================

    const handleResetSettings = () => {

        setSettings({
            ...DEFAULT_SETTINGS,
        });


        localStorage.removeItem(
            "agrimind_settings"
        );

        localStorage.removeItem(
            "agrimind_confidence_threshold"
        );

        localStorage.removeItem(
            "agrimind_auto_history"
        );

        localStorage.removeItem(
            "agrimind_show_probabilities"
        );

        localStorage.removeItem(
            "agrimind_notifications"
        );

        localStorage.removeItem(
            "agrimind_language"
        );

        localStorage.removeItem(
            "agrimind_theme"
        );


        applyTheme(
            DEFAULT_SETTINGS.theme
        );


        window.dispatchEvent(
            new CustomEvent(
                "agrimind-settings-changed",
                {
                    detail: DEFAULT_SETTINGS,
                }
            )
        );


        setMessage(
            translations[
                DEFAULT_SETTINGS.language
            ].resetDone
        );

        setTimeout(() => {
            setMessage("");
        }, 3000);
    };


    // =========================================================
    // TOGGLE COMPONENT
    // =========================================================

    const Toggle = ({
        checked,
        onChange,
    }) => {

        return (
            <label
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                }}
            >

                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                        onChange(
                            event.target.checked
                        )
                    }
                    style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                    }}
                />

                <strong>
                    {checked
                        ? t.on
                        : t.off}
                </strong>

            </label>
        );
    };


    return (

        <div className="page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-title">

                <h1>
                    ⚙️ {t.settings}
                </h1>

                <p>
                    {t.subtitle}
                </p>

            </div>


            {/* =================================================
                AI MODEL
            ================================================= */}

            <div className="settings-card">

                <div className="settings-section-title">

                    <h2>
                        🤖 {t.aiModel}
                    </h2>

                    <p>
                        {t.aiModelDesc}
                    </p>

                </div>


                <div className="setting-row">

                    <div>
                        <h3>{t.model}</h3>

                        <p>
                            EfficientNet-B0
                        </p>
                    </div>

                    <span className="status">
                        {t.ready}
                    </span>

                </div>


                <div className="setting-row">

                    <div>
                        <h3>{t.crop}</h3>

                        <p>
                            Soybean
                        </p>
                    </div>

                </div>


                <div className="setting-row">

                    <div>
                        <h3>{t.imageSize}</h3>

                        <p>
                            224 × 224 pixels
                        </p>
                    </div>

                </div>


                <div className="setting-row">

                    <div>
                        <h3>{t.device}</h3>

                        <p>
                            CPU / CUDA when available
                        </p>
                    </div>

                </div>

            </div>


            {/* =================================================
                DETECTION SETTINGS
            ================================================= */}

            <div className="settings-card">

                <div className="settings-section-title">

                    <h2>
                        🔬 {t.detection}
                    </h2>

                    <p>
                        {t.detectionDesc}
                    </p>

                </div>


                {/* CONFIDENCE */}

                <div className="setting-row">

                    <div>

                        <h3>
                            {t.confidence}
                        </h3>

                        <p>
                            {t.confidenceDesc}
                        </p>

                    </div>


                    <div
                        className="setting-control"
                        style={{
                            minWidth: "220px",
                        }}
                    >

                        <strong>
                            {settings.confidenceThreshold}%
                        </strong>

                        <input
                            type="range"
                            min="50"
                            max="95"
                            step="1"
                            value={
                                settings.confidenceThreshold
                            }
                            onChange={(event) =>
                                updateSetting(
                                    "confidenceThreshold",
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />

                    </div>

                </div>


                {/* HISTORY */}

                <div className="setting-row">

                    <div>

                        <h3>
                            {t.history}
                        </h3>

                        <p>
                            {t.historyDesc}
                        </p>

                    </div>


                    <Toggle
                        checked={
                            settings.autoHistory
                        }
                        onChange={(value) =>
                            updateSetting(
                                "autoHistory",
                                value
                            )
                        }
                    />

                </div>


                {/* PROBABILITIES */}

                <div className="setting-row">

                    <div>

                        <h3>
                            {t.probabilities}
                        </h3>

                        <p>
                            {t.probabilitiesDesc}
                        </p>

                    </div>


                    <Toggle
                        checked={
                            settings.showProbabilities
                        }
                        onChange={(value) =>
                            updateSetting(
                                "showProbabilities",
                                value
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                APPEARANCE
            ================================================= */}

            <div className="settings-card">

                <div className="settings-section-title">

                    <h2>
                        🎨 {t.appearance}
                    </h2>

                    <p>
                        {t.appearanceDesc}
                    </p>

                </div>


                {/* THEME */}

                <div className="setting-row">

                    <div>

                        <h3>
                            {t.theme}
                        </h3>

                        <p>
                            Choose the application appearance.
                        </p>

                    </div>


                    <select
                        value={settings.theme}
                        onChange={(event) =>
                            updateSetting(
                                "theme",
                                event.target.value
                            )
                        }
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "15px",
                            cursor: "pointer",
                        }}
                    >

                        <option value="Light">
                            ☀️ {t.light}
                        </option>

                        <option value="Dark">
                            🌙 {t.dark}
                        </option>

                        <option value="System">
                            💻 {t.systemTheme}
                        </option>

                    </select>

                </div>


                {/* LANGUAGE */}

                <div className="setting-row">

                    <div>

                        <h3>
                            🌐 {t.language}
                        </h3>

                        <p>
                            {t.languageDesc}
                        </p>

                    </div>


                    <select
                        value={
                            settings.language
                        }
                        onChange={(event) =>
                            updateSetting(
                                "language",
                                event.target.value
                            )
                        }
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "15px",
                            cursor: "pointer",
                        }}
                    >

                        <option value="English">
                            🇬🇧 English
                        </option>

                        <option value="Marathi">
                            🇮🇳 मराठी
                        </option>

                        <option value="Hindi">
                            🇮🇳 हिंदी
                        </option>

                    </select>

                </div>


                {/* NOTIFICATIONS */}

                <div className="setting-row">

                    <div>

                        <h3>
                            🔔 {t.notifications}
                        </h3>

                        <p>
                            {t.notificationsDesc}
                        </p>

                    </div>


                    <Toggle
                        checked={
                            settings.notifications
                        }
                        onChange={(value) =>
                            updateSetting(
                                "notifications",
                                value
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                SYSTEM INFORMATION
            ================================================= */}

            <div className="settings-card">

                <div className="settings-section-title">

                    <h2>
                        💻 {t.system}
                    </h2>

                    <p>
                        {t.systemDesc}
                    </p>

                </div>


                <div className="setting-row">

                    <div>

                        <h3>
                            {t.application}
                        </h3>

                        <p>
                            AgriMind AI
                        </p>

                    </div>

                </div>


                <div className="setting-row">

                    <div>

                        <h3>
                            {t.version}
                        </h3>

                        <p>
                            v1.0.0
                        </p>

                    </div>

                </div>


                <div className="setting-row">

                    <div>

                        <h3>
                            {t.backend}
                        </h3>

                        <p>
                            FastAPI
                        </p>

                    </div>

                    <span className="status">
                        {t.connected}
                    </span>

                </div>


                <div className="setting-row">

                    <div>

                        <h3>
                            {t.database}
                        </h3>

                        <p>
                            SQLite
                        </p>

                    </div>

                    <span className="status">
                        {t.active}
                    </span>

                </div>

            </div>


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="settings-actions">

                <button
                    className="save-settings-btn"
                    onClick={
                        handleSaveSettings
                    }
                >
                    💾 {t.save}
                </button>


                <button
                    className="reset-settings-btn"
                    onClick={
                        handleResetSettings
                    }
                >
                    🔄 {t.reset}
                </button>

            </div>


            {/* =================================================
                MESSAGE
            ================================================= */}

            {message && (

                <div className="settings-message">

                    ✅ {message}

                </div>

            )}

        </div>
    );
}


export default Settings;