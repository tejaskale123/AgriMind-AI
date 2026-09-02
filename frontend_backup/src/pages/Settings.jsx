import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const DEFAULT_SETTINGS = {
    confidenceThreshold: 70,
    autoHistory: true,
    showProbabilities: true,
    notifications: true,
    language: "English",
    theme: "Light",
};

const DEFAULT_USER = {
    full_name: "Test Farmer",
    email: "farmer@example.com",
    role: "Farmer",
    status: "Active",
    created_at: null,
};

const translations = {
    English: {
        settings: "Settings",
        subtitle: "Manage your AgriMind AI preferences and account.",
        profile: "Farmer Profile",
        profileDesc: "Your AgriMind AI account information.",
        aiModel: "AI Model",
        aiModelDesc: "Disease detection model information.",
        detection: "Detection Settings",
        detectionDesc: "Configure how AI detection results are handled.",
        appearance: "Appearance",
        appearanceDesc: "Customize the AgriMind AI experience.",
        system: "System Information",
        systemDesc: "Current AgriMind AI system information.",
        model: "Model",
        crop: "Supported Crop",
        imageSize: "Input Image Size",
        device: "Device",
        name: "Farmer Name",
        email: "Email Address",
        role: "Account Type",
        accountStatus: "Account Status",
        accountCreated: "Account Created",
        confidence: "Confidence Threshold",
        confidenceDesc: "Minimum confidence required for AI predictions.",
        history: "Save Detection History",
        historyDesc: "Automatically save AI detection results.",
        probabilities: "Show Class Probabilities",
        probabilitiesDesc: "Display probability for every disease class.",
        theme: "Theme",
        language: "Language",
        languageDesc: "Select your preferred application language.",
        notifications: "Notifications",
        notificationsDesc: "Receive notifications about AI detection results.",
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
        loading: "Loading profile...",
    },

    Marathi: {
        settings: "सेटिंग्ज",
        subtitle: "तुमच्या AgriMind AI सेटिंग्ज आणि अकाउंटचे व्यवस्थापन करा.",
        profile: "शेतकरी प्रोफाइल",
        profileDesc: "तुमच्या AgriMind AI अकाउंटची माहिती.",
        aiModel: "AI मॉडेल",
        aiModelDesc: "रोग शोधणाऱ्या AI मॉडेलची माहिती.",
        detection: "डिटेक्शन सेटिंग्ज",
        detectionDesc: "AI डिटेक्शनचे परिणाम कसे हाताळायचे ते सेट करा.",
        appearance: "दिसण्याची सेटिंग्ज",
        appearanceDesc: "AgriMind AI चा appearance बदला.",
        system: "System Information",
        systemDesc: "AgriMind AI system ची सध्याची माहिती.",
        model: "मॉडेल",
        crop: "समर्थित पीक",
        imageSize: "इनपुट इमेज आकार",
        device: "डिव्हाइस",
        name: "शेतकऱ्याचे नाव",
        email: "ई-मेल",
        role: "अकाउंट प्रकार",
        accountStatus: "अकाउंट स्थिती",
        accountCreated: "अकाउंट तयार केले",
        confidence: "Confidence Threshold",
        confidenceDesc: "AI prediction साठी किमान confidence level.",
        history: "Detection History सेव्ह करा",
        historyDesc: "AI detection चे परिणाम आपोआप सेव्ह करा.",
        probabilities: "Class Probabilities दाखवा",
        probabilitiesDesc: "प्रत्येक disease class ची probability दाखवा.",
        theme: "Theme",
        language: "भाषा",
        languageDesc: "तुमची आवडती application language निवडा.",
        notifications: "Notifications",
        notificationsDesc: "AI detection results साठी notifications मिळवा.",
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
        loading: "प्रोफाइल लोड होत आहे...",
    },

    Hindi: {
        settings: "सेटिंग्स",
        subtitle: "अपनी AgriMind AI settings और account manage करें।",
        profile: "Farmer Profile",
        profileDesc: "आपके AgriMind AI account की जानकारी।",
        aiModel: "AI मॉडल",
        aiModelDesc: "Disease detection AI model की जानकारी।",
        detection: "Detection Settings",
        detectionDesc: "AI detection results को configure करें।",
        appearance: "Appearance",
        appearanceDesc: "AgriMind AI का appearance customize करें।",
        system: "System Information",
        systemDesc: "AgriMind AI system की current information।",
        model: "मॉडल",
        crop: "Supported Crop",
        imageSize: "Input Image Size",
        device: "Device",
        name: "Farmer Name",
        email: "Email Address",
        role: "Account Type",
        accountStatus: "Account Status",
        accountCreated: "Account Created",
        confidence: "Confidence Threshold",
        confidenceDesc: "AI prediction के लिए minimum confidence level।",
        history: "Detection History Save करें",
        historyDesc: "AI detection results automatically save करें।",
        probabilities: "Class Probabilities दिखाएं",
        probabilitiesDesc: "हर disease class की probability दिखाएं।",
        theme: "Theme",
        language: "भाषा",
        languageDesc: "अपनी पसंदीदा application language चुनें।",
        notifications: "Notifications",
        notificationsDesc: "AI detection results के notifications प्राप्त करें।",
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
        loading: "Profile loading...",
    },
};

function getStoredSettings() {
    try {
        const stored = localStorage.getItem("agrimind_settings");

        if (!stored) {
            return { ...DEFAULT_SETTINGS };
        }

        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(stored),
        };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("agrimind-light", "agrimind-dark");
    body.classList.remove("agrimind-light", "agrimind-dark");

    let finalTheme = theme;

    if (theme === "System") {
        finalTheme = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "Dark"
            : "Light";
    }

    html.classList.add(
        finalTheme === "Dark"
            ? "agrimind-dark"
            : "agrimind-light"
    );

    body.classList.add(
        finalTheme === "Dark"
            ? "agrimind-dark"
            : "agrimind-light"
    );

    html.setAttribute(
        "data-theme",
        finalTheme === "Dark" ? "dark" : "light"
    );
}

function getAuthToken() {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("agrimind_token") ||
        ""
    );
}

function Settings() {
    const [settings, setSettings] = useState(
        getStoredSettings
    );

    const [user, setUser] = useState(DEFAULT_USER);
    const [profileLoading, setProfileLoading] = useState(true);
    const [message, setMessage] = useState("");

    const t =
        translations[settings.language] ||
        translations.English;

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = getAuthToken();

                if (!token) {
                    setProfileLoading(false);
                    return;
                }

                const response = await fetch(
                    `${API_BASE_URL}/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load current user."
                    );
                }

                const data = await response.json();

                if (data?.user) {
                    setUser({
                        ...DEFAULT_USER,
                        ...data.user,
                    });
                }
            } catch (error) {
                console.error(
                    "Profile loading error:",
                    error
                );
            } finally {
                setProfileLoading(false);
            }
        };

        loadUser();
    }, []);

    useEffect(() => {
        applyTheme(settings.theme);
    }, [settings.theme]);

    const updateSetting = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSaveSettings = () => {
        localStorage.setItem(
            "agrimind_settings",
            JSON.stringify(settings)
        );

        localStorage.setItem(
            "agrimind_confidence_threshold",
            String(settings.confidenceThreshold)
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

        applyTheme("Light");

        window.dispatchEvent(
            new CustomEvent(
                "agrimind-settings-changed",
                {
                    detail: DEFAULT_SETTINGS,
                }
            )
        );

        setMessage(
            translations.English.resetDone
        );

        setTimeout(() => {
            setMessage("");
        }, 3000);
    };

    const Toggle = ({
        checked,
        onChange,
    }) => {
        return (
            <button
                type="button"
                className={`am-toggle ${
                    checked ? "active" : ""
                }`}
                onClick={() => onChange(!checked)}
                aria-pressed={checked}
            >
                <span className="am-toggle-knob" />
                <span className="am-toggle-text">
                    {checked ? t.on : t.off}
                </span>
            </button>
        );
    };

    const formatDate = (date) => {
        if (!date) return "—";

        try {
            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return "—";
        }
    };

    const initial =
        (user.full_name || "F")
            .charAt(0)
            .toUpperCase();

    return (
        <div className="am-settings-page">
            <style>{styles}</style>

            {/* HEADER */}

            <header className="am-settings-header">
                <div>
                    <span className="am-settings-eyebrow">
                        AGRIMIND AI • CONTROL CENTER
                    </span>

                    <h1>
                        ⚙️ {t.settings}
                    </h1>

                    <p>
                        {t.subtitle}
                    </p>
                </div>

                <div className="am-settings-header-badge">
                    <span className="am-live-dot" />
                    AI System Ready
                </div>
            </header>

            {/* PROFILE */}

            <section className="am-settings-card am-profile-card">
                <div className="am-card-heading">
                    <div className="am-card-heading-icon">
                        👨‍🌾
                    </div>

                    <div>
                        <h2>{t.profile}</h2>
                        <p>{t.profileDesc}</p>
                    </div>
                </div>

                {profileLoading ? (
                    <div className="am-loading">
                        <span>⏳</span>
                        {t.loading}
                    </div>
                ) : (
                    <>
                        <div className="am-profile-banner">
                            <div className="am-avatar">
                                {initial}
                            </div>

                            <div className="am-profile-main">
                                <h3>
                                    {user.full_name}
                                </h3>

                                <p>
                                    {user.email}
                                </p>

                                <span className="am-status-pill">
                                    <i />
                                    {user.status || "Active"}
                                </span>
                            </div>

                            <div className="am-profile-role">
                                👨‍🌾 Farmer
                            </div>
                        </div>

                        <div className="am-info-grid">
                            <InfoItem
                                label={t.name}
                                value={user.full_name}
                            />

                            <InfoItem
                                label={t.email}
                                value={user.email}
                            />

                            <InfoItem
                                label={t.role}
                                value={user.role}
                            />

                            <InfoItem
                                label={t.accountCreated}
                                value={formatDate(
                                    user.created_at
                                )}
                            />
                        </div>
                    </>
                )}
            </section>

            {/* AI MODEL */}

            <section className="am-settings-card">
                <SectionHeader
                    icon="🤖"
                    title={t.aiModel}
                    description={t.aiModelDesc}
                />

                <div className="am-model-grid">
                    <ModelItem
                        icon="🧠"
                        label={t.model}
                        value="EfficientNet-B0"
                        badge={`✓ ${t.ready}`}
                    />

                    <ModelItem
                        icon="🌱"
                        label={t.crop}
                        value="Cotton & Soybean"
                    />

                    <ModelItem
                        icon="🖼️"
                        label={t.imageSize}
                        value="224 × 224 px"
                    />

                    <ModelItem
                        icon="⚡"
                        label={t.device}
                        value="CPU / CUDA"
                    />
                </div>
            </section>

            {/* DETECTION */}

            <section className="am-settings-card">
                <SectionHeader
                    icon="🔬"
                    title={t.detection}
                    description={t.detectionDesc}
                />

                <div className="am-setting-row">
                    <div className="am-setting-copy">
                        <h3>{t.confidence}</h3>
                        <p>{t.confidenceDesc}</p>
                    </div>

                    <div className="am-range-box">
                        <div className="am-range-head">
                            <strong>
                                {settings.confidenceThreshold}%
                            </strong>

                            <span>50–95%</span>
                        </div>

                        <input
                            type="range"
                            min="50"
                            max="95"
                            value={
                                settings.confidenceThreshold
                            }
                            onChange={(e) =>
                                updateSetting(
                                    "confidenceThreshold",
                                    Number(e.target.value)
                                )
                            }
                        />
                    </div>
                </div>

                <div className="am-setting-row">
                    <div className="am-setting-copy">
                        <h3>{t.history}</h3>
                        <p>{t.historyDesc}</p>
                    </div>

                    <Toggle
                        checked={settings.autoHistory}
                        onChange={(value) =>
                            updateSetting(
                                "autoHistory",
                                value
                            )
                        }
                    />
                </div>

                <div className="am-setting-row">
                    <div className="am-setting-copy">
                        <h3>{t.probabilities}</h3>
                        <p>{t.probabilitiesDesc}</p>
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
            </section>

            {/* APPEARANCE */}

            <section className="am-settings-card">
                <SectionHeader
                    icon="🎨"
                    title={t.appearance}
                    description={t.appearanceDesc}
                />

                <div className="am-setting-row">
                    <div className="am-setting-copy">
                        <h3>{t.theme}</h3>
                        <p>
                            Choose the application appearance.
                        </p>
                    </div>

                    <select
                        className="am-select"
                        value={settings.theme}
                        onChange={(e) =>
                            updateSetting(
                                "theme",
                                e.target.value
                            )
                        }
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

                <div className="am-setting-row">
                    <div className="am-setting-copy">
                        <h3>🌐 {t.language}</h3>
                        <p>{t.languageDesc}</p>
                    </div>

                    <select
                        className="am-select"
                        value={settings.language}
                        onChange={(e) =>
                            updateSetting(
                                "language",
                                e.target.value
                            )
                        }
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

                <div className="am-setting-row">
                    <div className="am-setting-copy">
                        <h3>🔔 {t.notifications}</h3>
                        <p>{t.notificationsDesc}</p>
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
            </section>

            {/* SYSTEM */}

            <section className="am-settings-card">
                <SectionHeader
                    icon="💻"
                    title={t.system}
                    description={t.systemDesc}
                />

                <div className="am-system-grid">
                    <SystemItem
                        label={t.application}
                        value="AgriMind AI"
                    />

                    <SystemItem
                        label={t.version}
                        value="v1.0.0"
                    />

                    <SystemItem
                        label={t.backend}
                        value="FastAPI"
                        status={`🟢 ${t.connected}`}
                    />

                    <SystemItem
                        label={t.database}
                        value="SQLite"
                        status={`🟢 ${t.active}`}
                    />
                </div>
            </section>

            {/* ACTIONS */}

            <div className="am-settings-actions">
                <button
                    className="am-save-btn"
                    onClick={handleSaveSettings}
                >
                    💾 {t.save}
                </button>

                <button
                    className="am-reset-btn"
                    onClick={handleResetSettings}
                >
                    ↻ {t.reset}
                </button>
            </div>

            {message && (
                <div className="am-settings-message">
                    <span>✓</span>
                    {message}
                </div>
            )}
        </div>
    );
}

function SectionHeader({
    icon,
    title,
    description,
}) {
    return (
        <div className="am-card-heading">
            <div className="am-card-heading-icon">
                {icon}
            </div>

            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="am-info-item">
            <span>{label}</span>
            <strong>{value || "—"}</strong>
        </div>
    );
}

function ModelItem({
    icon,
    label,
    value,
    badge,
}) {
    return (
        <div className="am-model-item">
            <div className="am-model-icon">
                {icon}
            </div>

            <div>
                <span>{label}</span>
                <strong>{value}</strong>

                {badge && (
                    <small>{badge}</small>
                )}
            </div>
        </div>
    );
}

function SystemItem({
    label,
    value,
    status,
}) {
    return (
        <div className="am-system-item">
            <span>{label}</span>

            <strong>{value}</strong>

            {status && (
                <small>{status}</small>
            )}
        </div>
    );
}

const styles = `
.am-settings-page {
    width: 100%;
    max-width: 1450px;
    margin: 0 auto;
    padding: 32px 36px 70px;
    color: #10261a;
}

.am-settings-page * {
    box-sizing: border-box;
}

.am-settings-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
}

.am-settings-eyebrow {
    display: block;
    margin-bottom: 8px;
    color: #16a34a;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 2px;
}

.am-settings-header h1 {
    margin: 0;
    font-size: 37px;
    font-weight: 900;
    letter-spacing: -1.2px;
}

.am-settings-header p {
    margin: 8px 0 0;
    color: #718096;
    font-size: 15px;
}

.am-settings-header-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: 1px solid #bbf7d0;
    border-radius: 999px;
    background: #f0fdf4;
    color: #15803d;
    font-size: 12px;
    font-weight: 800;
}

.am-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 4px #dcfce7;
}

.am-settings-card {
    margin-bottom: 19px;
    padding: 25px;
    border: 1px solid #e3ebe6;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 6px 24px rgba(15, 60, 30, .045);
}

.am-card-heading {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 23px;
}

.am-card-heading-icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: #ecfdf3;
    font-size: 23px;
}

.am-card-heading h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
}

.am-card-heading p {
    margin: 5px 0 0;
    color: #718096;
    font-size: 13px;
}

.am-profile-banner {
    display: flex;
    align-items: center;
    gap: 17px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #dff3e5;
    border-radius: 17px;
    background: linear-gradient(135deg, #f0fdf4, #ffffff);
}

.am-avatar {
    width: 64px;
    height: 64px;
    min-width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: linear-gradient(145deg, #22c55e, #07883e);
    color: #ffffff;
    font-size: 26px;
    font-weight: 900;
    box-shadow: 0 8px 20px rgba(22, 163, 74, .2);
}

.am-profile-main {
    flex: 1;
    min-width: 0;
}

.am-profile-main h3 {
    margin: 0 0 4px;
    font-size: 18px;
}

.am-profile-main p {
    margin: 0 0 8px;
    color: #64748b;
    font-size: 13px;
}

.am-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 9px;
    border-radius: 999px;
    background: #dcfce7;
    color: #15803d;
    font-size: 10px;
    font-weight: 850;
}

.am-status-pill i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
}

.am-profile-role {
    padding: 9px 12px;
    border-radius: 10px;
    background: #ffffff;
    color: #15803d;
    border: 1px solid #d8eee0;
    font-size: 12px;
    font-weight: 800;
}

.am-info-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.am-info-item {
    padding: 15px;
    border-radius: 13px;
    background: #f8faf9;
}

.am-info-item span {
    display: block;
    margin-bottom: 6px;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .8px;
}

.am-info-item strong {
    display: block;
    color: #1e293b;
    font-size: 13px;
    word-break: break-word;
}

.am-model-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 13px;
}

.am-model-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 88px;
    padding: 15px;
    border: 1px solid #edf2ef;
    border-radius: 14px;
    background: #fbfdfc;
}

.am-model-icon {
    width: 43px;
    height: 43px;
    min-width: 43px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #ecfdf3;
    font-size: 20px;
}

.am-model-item span,
.am-system-item > span {
    display: block;
    margin-bottom: 5px;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.am-model-item strong {
    display: block;
    font-size: 14px;
}

.am-model-item small {
    display: inline-block;
    margin-top: 5px;
    color: #15803d;
    font-size: 10px;
    font-weight: 800;
}

.am-setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    padding: 19px 0;
    border-top: 1px solid #eef2f0;
}

.am-setting-row:first-of-type {
    border-top: none;
}

.am-setting-copy {
    flex: 1;
}

.am-setting-copy h3 {
    margin: 0 0 5px;
    font-size: 14px;
    font-weight: 850;
}

.am-setting-copy p {
    max-width: 650px;
    margin: 0;
    color: #718096;
    font-size: 12px;
    line-height: 1.6;
}

.am-range-box {
    width: 270px;
}

.am-range-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.am-range-head strong {
    color: #15803d;
    font-size: 16px;
}

.am-range-head span {
    color: #94a3b8;
    font-size: 10px;
}

.am-range-box input {
    width: 100%;
    accent-color: #16a34a;
    cursor: pointer;
}

.am-toggle {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 78px;
    height: 38px;
    padding: 4px 9px 4px 5px;
    border: 1px solid #dbe5df;
    border-radius: 999px;
    background: #f8faf9;
    color: #64748b;
    cursor: pointer;
    transition: .2s ease;
}

.am-toggle.active {
    border-color: #86efac;
    background: #dcfce7;
    color: #15803d;
}

.am-toggle-knob {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0,0,0,.12);
    transition: .2s ease;
}

.am-toggle.active .am-toggle-knob {
    transform: translateX(38px);
}

.am-toggle-text {
    position: absolute;
    right: 9px;
    font-size: 10px;
    font-weight: 900;
}

.am-toggle:not(.active) .am-toggle-text {
    left: 39px;
    right: auto;
}

.am-select {
    min-width: 150px;
    padding: 11px 13px;
    border: 1px solid #dbe5df;
    border-radius: 11px;
    outline: none;
    background: #ffffff;
    color: #1e293b;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
}

.am-select:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, .1);
}

.am-system-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 13px;
}

.am-system-item {
    padding: 17px;
    border: 1px solid #edf2ef;
    border-radius: 14px;
    background: #fbfdfc;
}

.am-system-item strong {
    display: block;
    margin-bottom: 7px;
    font-size: 14px;
}

.am-system-item small {
    color: #15803d;
    font-size: 10px;
    font-weight: 800;
}

.am-settings-actions {
    display: flex;
    gap: 12px;
    margin: 25px 0 12px;
}

.am-save-btn,
.am-reset-btn {
    height: 46px;
    padding: 0 19px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
    transition: .2s ease;
}

.am-save-btn {
    border: none;
    background: #16a34a;
    color: #ffffff;
    box-shadow: 0 7px 18px rgba(22, 163, 74, .2);
}

.am-save-btn:hover {
    background: #15803d;
    transform: translateY(-1px);
}

.am-reset-btn {
    border: 1px solid #dbe5df;
    background: #ffffff;
    color: #64748b;
}

.am-reset-btn:hover {
    border-color: #fca5a5;
    color: #dc2626;
    background: #fff7f7;
}

.am-settings-message {
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 11px 15px;
    border: 1px solid #bbf7d0;
    border-radius: 11px;
    background: #f0fdf4;
    color: #15803d;
    font-size: 12px;
    font-weight: 750;
}

.am-loading {
    padding: 35px;
    text-align: center;
    color: #64748b;
    font-size: 13px;
}

@media (max-width: 1100px) {
    .am-info-grid,
    .am-model-grid,
    .am-system-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 800px) {
    .am-settings-page {
        padding: 24px 20px 50px;
    }

    .am-settings-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .am-settings-header h1 {
        font-size: 31px;
    }

    .am-profile-role {
        display: none;
    }

    .am-setting-row {
        align-items: flex-start;
        flex-direction: column;
        gap: 16px;
    }

    .am-range-box {
        width: 100%;
    }

    .am-select,
    .am-toggle {
        align-self: flex-start;
    }
}

@media (max-width: 560px) {
    .am-info-grid,
    .am-model-grid,
    .am-system-grid {
        grid-template-columns: 1fr;
    }

    .am-profile-banner {
        align-items: flex-start;
    }

    .am-settings-card {
        padding: 19px;
    }

    .am-settings-actions {
        flex-direction: column;
    }

    .am-save-btn,
    .am-reset-btn {
        width: 100%;
    }
}
`;

export default Settings;