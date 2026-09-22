const hi = {
    common: {
        appName: "एग्रीमाइंड AI",
        smartAgriculture: "स्मार्ट कृषि",
        farmer: "किसान",
        search: "खोजें",
        refresh: "रिफ्रेश",
        refreshing: "रिफ्रेश हो रहा है...",
        loading: "लोड हो रहा है...",
        ready: "तैयार",
        view: "देखें",
        viewDetails: "विवरण देखें",
        viewHistory: "इतिहास देखें",
        start: "शुरू करें",
        startDetection: "रोग पहचान शुरू करें",
        analyzeNow: "अभी जाँचें",
        comingSoon: "जल्द उपलब्ध होगा",
        available: "उपलब्ध",
        back: "पीछे",
        next: "आगे",
        submit: "सबमिट करें",
        cancel: "रद्द करें",
        save: "सहेजें",
        delete: "हटाएँ",
        close: "बंद करें",
        confirm: "पुष्टि करें",
        yes: "हाँ",
        no: "नहीं",
        retry: "फिर से प्रयास करें",
        error: "त्रुटि",
        success: "सफल",
        noData: "कोई जानकारी उपलब्ध नहीं है"
    },

    navigation: {
        dashboard: "डैशबोर्ड",
        diseaseDetection: "रोग पहचान",
        crops: "फसलें",
        analytics: "विश्लेषण",
        history: "जाँच इतिहास",
        settings: "सेटिंग्स",
        logout: "लॉग आउट",
        profile: "प्रोफ़ाइल"
    },

    dashboard: {
        title: "डैशबोर्ड",
        welcome: "आपका फिर से स्वागत है",
        smartAgriculture: "एग्रीमाइंड AI • स्मार्ट कृषि",

        aiPoweredCropHealth: "AI आधारित फसल स्वास्थ्य",

        heroTitleLine1: "फसलों के रोग पहचानें",
        heroTitleLine2: "कृत्रिम बुद्धिमत्ता की मदद से",

        heroDescription:
            "फसल के पत्ते की तस्वीर अपलोड करें और AgriMind AI EfficientNet-B0 डीप लर्निंग मॉडल की मदद से उसका विश्लेषण करेगा।",

        startDiseaseDetection: "रोग पहचान शुरू करें",

        supportedCrops: "समर्थित फसलें",
        supportedCropsDescription:
            "AI आधारित रोग पहचान के लिए वर्तमान में उपलब्ध फसलें",

        aiModel: "AI मॉडल",
        modelStatus: "मॉडल की स्थिति",
        totalDetections: "कुल जाँच",

        aiDetectionOverview: "AI रोग पहचान का अवलोकन",
        aiDetectionOverviewDescription:
            "आपके रोग पहचान इतिहास पर आधारित जानकारी",

        averageConfidence: "औसत विश्वास स्तर",
        healthyPredictions: "स्वस्थ अनुमान",
        diseasePredictions: "रोगग्रस्त अनुमान",

        latestAiDetection: "नवीनतम AI जाँच",
        noDetectionsYet: "अभी तक कोई जाँच नहीं हुई है",
        noAiDetections:
            "अभी तक कोई AI जाँच परिणाम उपलब्ध नहीं है।",

        howAgrimindWorks: "AgriMind AI कैसे काम करता है",
        howAgrimindWorksDescription:
            "AI आधारित फसल स्वास्थ्य विश्लेषण की सरल तीन-चरण प्रक्रिया",

        uploadLeafImage: "पत्ते की तस्वीर अपलोड करें",
        uploadLeafDescription:
            "रोग पहचान मॉड्यूल के माध्यम से फसल के पत्ते की एक स्पष्ट तस्वीर अपलोड करें।",

        aiAnalysis: "AI विश्लेषण",
        aiAnalysisDescription:
            "EfficientNet-B0 अपलोड किए गए पत्ते के दृश्य पैटर्न का विश्लेषण करता है।",

        getResult: "परिणाम प्राप्त करें",
        getResultDescription:
            "पहचानी गई स्थिति, विश्वास स्तर और सुझाव देखें।",

        quickActions: "त्वरित विकल्प",
        quickActionsDescription:
            "AgriMind AI की महत्वपूर्ण सुविधाओं तक जल्दी पहुँचें",

        diseaseDetection: "रोग पहचान",
        diseaseDetectionDescription:
            "पत्ते की तस्वीर अपलोड करके संभावित रोग पहचानें।",

        analytics: "विश्लेषण",
        analyticsDescription:
            "जाँच के आँकड़े, विश्वास स्तर और रोगों का वितरण देखें।",

        detectionHistory: "जाँच इतिहास",
        detectionHistoryDescription:
            "पहले किए गए सभी AI जाँच परिणाम देखें।",

        searchPlaceholder:
            "फसलें, रोग खोजें..."
    },

    detection: {
        title: "रोग पहचान",
        subtitle:
            "फसल के पत्ते की तस्वीर अपलोड करें और AgriMind AI उसका विश्लेषण करेगा।",

        uploadImage: "पत्ते की तस्वीर अपलोड करें",
        uploadDescription:
            "AI आधारित रोग पहचान के लिए फसल के पत्ते की स्पष्ट तस्वीर अपलोड करें।",

        chooseImage: "तस्वीर चुनें",
        dragAndDrop:
            "अपनी तस्वीर यहाँ ड्रैग और ड्रॉप करें",
        or: "या",

        supportedFormats:
            "समर्थित प्रारूप: JPG, JPEG, PNG",

        analyzeImage: "तस्वीर का विश्लेषण करें",
        analyzing: "विश्लेषण हो रहा है...",

        diseaseDetectionResult:
            "रोग पहचान परिणाम",

        crop: "फसल",
        predictedCondition: "पहचानी गई स्थिति",
        confidenceScore: "विश्वास स्तर",

        confidence: "विश्वास स्तर",
        veryHigh: "बहुत अधिक",
        high: "अधिक",
        medium: "मध्यम",
        low: "कम",

        aiClassProbabilities:
            "AI वर्ग संभावनाएँ",

        plantCareManagement:
            "फसल देखभाल और प्रबंधन",

        symptoms: "लक्षण",
        immediateAction: "तुरंत की जाने वाली कार्रवाई",
        treatment: "उपचार",
        sprayGuidance: "छिड़काव मार्गदर्शन",
        farmerAction: "किसान द्वारा की जाने वाली कार्रवाई",
        prevention: "रोकथाम",
        source: "स्रोत",

        analyzingImage:
            "AI आपकी फसल की तस्वीर का विश्लेषण कर रहा है...",

        analysisComplete:
            "विश्लेषण सफलतापूर्वक पूरा हुआ।",

        uploadAnother:
            "दूसरी तस्वीर अपलोड करें",

        invalidImage:
            "कृपया फसल के पत्ते की सही तस्वीर अपलोड करें।",

        imageTooLarge:
            "चयनित तस्वीर बहुत बड़ी है।",

        detectionFailed:
            "रोग पहचानने में समस्या हुई। कृपया फिर से प्रयास करें।",

        lowConfidence:
            "AI का विश्वास स्तर कम है। अधिक विश्वसनीय परिणाम के लिए पत्ते की अधिक स्पष्ट तस्वीर अपलोड करें।"
    },

    crops: {
        title: "फसलें",
        subtitle:
            "AgriMind AI द्वारा समर्थित फसलों की जानकारी देखें।",

        supportedCrops: "समर्थित फसलें",
        availableForDetection:
            "AI रोग पहचान के लिए उपलब्ध",

        diseaseDetectionAvailable:
            "AI रोग पहचान उपलब्ध",

        underDevelopment:
            "इस फसल के लिए रोग पहचान सुविधा विकसित की जा रही है।",

        analyzeCrop:
            "फसल की जाँच करें",

        viewCropDetails:
            "फसल का विवरण देखें",

        soybean: "सोयाबीन",
        cotton: "कपास",
        maize: "मक्का",
        wheat: "गेहूँ",
        tomato: "टमाटर",
        bellPepper: "शिमला मिर्च"
    },

    analytics: {
        title: "विश्लेषण",
        subtitle:
            "अपनी AI जाँचों की जानकारी और आँकड़े देखें।",

        totalDetections: "कुल जाँच",
        healthyPredictions:
            "स्वस्थ अनुमान",

        diseasePredictions:
            "रोगग्रस्त अनुमान",

        averageConfidence:
            "औसत विश्वास स्तर",

        diseaseDistribution:
            "रोगों का वितरण",

        detectionTrends:
            "जाँच का रुझान",

        modelPerformance:
            "AI मॉडल का प्रदर्शन",

        noAnalytics:
            "अभी तक विश्लेषण के लिए कोई जानकारी उपलब्ध नहीं है।"
    },

    history: {
        title: "जाँच इतिहास",
        subtitle:
            "अपनी पिछली AI फसल रोग पहचान के परिणाम देखें।",

        allDetections: "सभी जाँच",
        date: "दिनांक",
        crop: "फसल",
        prediction: "अनुमान",
        confidence: "विश्वास स्तर",
        action: "कार्रवाई",

        viewResult: "परिणाम देखें",
        noHistory:
            "अभी तक कोई जाँच इतिहास उपलब्ध नहीं है।",

        detectionDetails:
            "जाँच का विवरण"
    },

    settings: {
        title: "सेटिंग्स",
        subtitle:
            "अपनी AgriMind AI एप्लिकेशन सेटिंग्स प्रबंधित करें।",

        account: "खाता",
        accountInformation:
            "खाते की जानकारी",

        application: "एप्लिकेशन",
        preferences: "प्राथमिकताएँ",

        language: "भाषा",
        languageDescription:
            "AgriMind AI में उपयोग की जाने वाली भाषा चुनें।",

        english: "English",
        marathi: "मराठी",
        hindi: "हिंदी",

        aiModel: "AI मॉडल",
        currentModel: "वर्तमान AI मॉडल",

        modelInformation:
            "EfficientNet-B0",

        security: "सुरक्षा",
        logout: "लॉग आउट",

        saveChanges: "बदलाव सहेजें",
        changesSaved:
            "बदलाव सफलतापूर्वक सहेजे गए।"
    },

    auth: {
        login: "लॉग इन",
        register: "पंजीकरण",

        loginTitle: "आपका फिर से स्वागत है",
        loginSubtitle:
            "AgriMind AI का उपयोग जारी रखने के लिए लॉग इन करें।",

        registerTitle: "अपना खाता बनाएँ",
        registerSubtitle:
            "AgriMind AI का उपयोग शुरू करने के लिए खाता बनाएँ।",

        email: "ई-मेल",
        password: "पासवर्ड",
        confirmPassword:
            "पासवर्ड की पुष्टि करें",

        fullName: "पूरा नाम",
        username: "उपयोगकर्ता नाम",

        emailPlaceholder:
            "अपना ई-मेल दर्ज करें",

        passwordPlaceholder:
            "अपना पासवर्ड दर्ज करें",

        fullNamePlaceholder:
            "अपना पूरा नाम दर्ज करें",

        usernamePlaceholder:
            "अपना उपयोगकर्ता नाम दर्ज करें",

        loginButton: "लॉग इन करें",
        registerButton: "खाता बनाएँ",

        loggingIn: "लॉग इन हो रहा है...",
        registering: "खाता बनाया जा रहा है...",

        noAccount:
            "क्या आपका खाता नहीं है?",

        alreadyHaveAccount:
            "क्या आपका पहले से खाता है?",

        createAccount:
            "खाता बनाएँ",

        signIn:
            "लॉग इन करें",

        loginFailed:
            "लॉग इन असफल हुआ। कृपया अपनी जानकारी जाँचें।",

        registrationFailed:
            "पंजीकरण असफल हुआ। कृपया फिर से प्रयास करें।",

        registrationSuccessful:
            "पंजीकरण सफलतापूर्वक पूरा हुआ।"
    },

    search: {
        crop: "फसल",
        history: "इतिहास",
        feature: "सुविधा",

        diseaseDetection:
            "रोग पहचान",

        analytics:
            "विश्लेषण",

        detectionHistory:
            "जाँच इतिहास",

        settings:
            "सेटिंग्स",

        noResults:
            "कोई परिणाम नहीं मिला।"
    },

    messages: {
        loadingData:
            "डैशबोर्ड की जानकारी लोड हो रही है...",

        unableToConnect:
            "AI सर्वर से कनेक्ट नहीं हो पाया।",

        authenticationExpired:
            "लॉग इन की अवधि समाप्त हो गई है या जानकारी गलत है। कृपया फिर से लॉग इन करें।",

        notAuthenticated:
            "आप लॉग इन नहीं हैं। कृपया फिर से लॉग इन करें।",

        operationSuccessful:
            "कार्रवाई सफलतापूर्वक पूरी हुई।",

        somethingWentWrong:
            "कुछ गलत हो गया। कृपया फिर से प्रयास करें।"
    },

    diseases: {
        healthy: "स्वस्थ पत्ता",

        alternariaLeafSpot:
            "अल्टरनेरिया लीफ स्पॉट",

        anthracnose:
            "एन्थ्रेक्नोज",

        bacterialBlight:
            "बैक्टीरियल ब्लाइट",

        bollRot:
            "बॉल रॉट",

        cercosporaLeafSpot:
            "सर्कोस्पोरा लीफ स्पॉट",

        fusariumWilt:
            "फ्यूजेरियम विल्ट",

        greyAreolateMildew:
            "ग्रे एरिओलेट मिल्ड्यू",

        verticilliumWilt:
            "वर्टिसिलियम विल्ट"
    },

    model: {
        efficientNetB0:
            "EfficientNet-B0",

        modelReady:
            "मॉडल तैयार है",

        modelLoading:
            "मॉडल लोड हो रहा है",

        aiPowered:
            "AI आधारित",

        deepLearning:
            "डीप लर्निंग",

        prediction:
            "अनुमान",

        confidence:
            "विश्वास स्तर"
    }
};

export default hi;