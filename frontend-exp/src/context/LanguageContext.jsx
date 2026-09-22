import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import translations from "../translations";


// =========================================================
// LANGUAGE CONTEXT
// =========================================================

const LanguageContext = createContext(null);


// =========================================================
// SUPPORTED LANGUAGES
// =========================================================

export const supportedLanguages = [
    {
        code: "en",
        label: "English",
        nativeLabel: "English"
    },
    {
        code: "mr",
        label: "Marathi",
        nativeLabel: "मराठी"
    },
    {
        code: "hi",
        label: "Hindi",
        nativeLabel: "हिंदी"
    }
];


// =========================================================
// GET NESTED TRANSLATION
// Example:
// t("dashboard.title")
// =========================================================

const getTranslation = (
    languageObject,
    key
) => {

    const keys = key.split(".");

    let value = languageObject;

    for (const part of keys) {

        if (
            value &&
            Object.prototype.hasOwnProperty.call(
                value,
                part
            )
        ) {
            value = value[part];
        } else {
            return null;
        }
    }

    return typeof value === "string"
        ? value
        : null;
};


// =========================================================
// PROVIDER
// =========================================================

export function LanguageProvider({
    children
}) {

    const [language, setLanguageState] =
        useState(() => {

            const savedLanguage =
                localStorage.getItem(
                    "agrimind_language"
                );

            if (
                savedLanguage &&
                translations[savedLanguage]
            ) {
                return savedLanguage;
            }

            return "en";
        });


    // =====================================================
    // CHANGE LANGUAGE
    // =====================================================

    const setLanguage = (newLanguage) => {

        if (
            !translations[newLanguage]
        ) {
            console.warn(
                `Unsupported language: ${newLanguage}`
            );

            return;
        }

        setLanguageState(newLanguage);

        localStorage.setItem(
            "agrimind_language",
            newLanguage
        );
    };


    // =====================================================
    // TRANSLATION FUNCTION
    // =====================================================

    const t = (key) => {

        const currentTranslations =
            translations[language];

        const translated =
            getTranslation(
                currentTranslations,
                key
            );

        // -------------------------------------------------
        // FALLBACK TO ENGLISH
        // -------------------------------------------------

        if (translated) {
            return translated;
        }

        const englishTranslation =
            getTranslation(
                translations.en,
                key
            );

        if (englishTranslation) {
            return englishTranslation;
        }

        // -------------------------------------------------
        // LAST FALLBACK
        // -------------------------------------------------

        console.warn(
            `Missing translation: ${key}`
        );

        return key;
    };


    // =====================================================
    // CURRENT LANGUAGE INFO
    // =====================================================

    const currentLanguage =
        useMemo(() => {

            return (
                supportedLanguages.find(
                    item =>
                        item.code === language
                ) ||
                supportedLanguages[0]
            );

        }, [language]);


    // =====================================================
    // HTML LANGUAGE
    // =====================================================

    useEffect(() => {

        document.documentElement.lang =
            language;

    }, [language]);


    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t,
            currentLanguage,
            supportedLanguages
        }),
        [
            language,
            currentLanguage
        ]
    );


    // =====================================================
    // PROVIDER
    // =====================================================

    return (
        <LanguageContext.Provider
            value={value}
        >
            {children}
        </LanguageContext.Provider>
    );
}


// =========================================================
// HOOK
// =========================================================

export function useLanguage() {

    const context =
        useContext(
            LanguageContext
        );

    if (!context) {

        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }

    return context;
}


export default LanguageContext;