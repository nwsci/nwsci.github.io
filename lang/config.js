// 支持的6种语言
const SUPPORTED_LANGUAGES = {
    'en': { 
        name: 'English', 
        native: 'English',
        flag: '🇺🇸', 
        dir: 'ltr',
        code: 'en-US'
    },
    'zh': { 
        name: 'Chinese', 
        native: '中文',
        flag: '🇨🇳', 
        dir: 'ltr',
        code: 'zh-CN'
    },
    'es': { 
        name: 'Spanish', 
        native: 'Español',
        flag: '🇪🇸', 
        dir: 'ltr',
        code: 'es-ES'
    },
    'fr': { 
        name: 'French', 
        native: 'Français',
        flag: '🇫🇷', 
        dir: 'ltr',
        code: 'fr-FR'
    },
    'ru': { 
        name: 'Russian', 
        native: 'Русский',
        flag: '🇷🇺', 
        dir: 'ltr',
        code: 'ru-RU'
    },
    'ar': { 
        name: 'Arabic', 
        native: 'العربية',
        flag: '🇸🇦', 
        dir: 'rtl',  // 从右到左
        code: 'ar-SA'
    }
};

// 语言名称映射（用于浏览器语言检测）
const LANGUAGE_MAPPINGS = {
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'zh-HK': 'zh',
    'es-ES': 'es',
    'es-MX': 'es',
    'es-AR': 'es',
    'fr-FR': 'fr',
    'fr-CA': 'fr',
    'ru-RU': 'ru',
    'ar-SA': 'ar',
    'ar-AE': 'ar',
    'ar-EG': 'ar'
};

// 默认语言
const DEFAULT_LANGUAGE = 'en';

// 检测用户语言
function detectUserLanguage() {
    // 1. 检查URL参数 ?lang=zh
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && SUPPORTED_LANGUAGES[urlLang]) {
        localStorage.setItem('preferredLanguage', urlLang);
        return urlLang;
    }
    
    // 2. 检查本地存储
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang && SUPPORTED_LANGUAGES[storedLang]) {
        return storedLang;
    }
    
    // 3. 检查浏览器语言
    const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
    
    for (let lang of browserLanguages) {
        // 标准化语言代码
        lang = lang.split(';')[0].split('-')[0].toLowerCase();
        
        // 检查直接匹配
        if (SUPPORTED_LANGUAGES[lang]) {
            return lang;
        }
        
        // 检查完整代码映射
        const fullLang = navigator.language || navigator.userLanguage;
        if (LANGUAGE_MAPPINGS[fullLang]) {
            return LANGUAGE_MAPPINGS[fullLang];
        }
    }
    
    // 4. 默认英语
    return DEFAULT_LANGUAGE;
}

// 获取当前语言
function getCurrentLanguage() {
    return detectUserLanguage();
}

// 切换语言
function switchLanguage(lang) {
    if (SUPPORTED_LANGUAGES[lang]) {
        localStorage.setItem('preferredLanguage', lang);
        window.location.href = `${window.location.pathname}?lang=${lang}`;
    }
}

// 获取语言方向
function getLanguageDirection(lang) {
    return SUPPORTED_LANGUAGES[lang]?.dir || 'ltr';
}

// 导出配置
window.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
window.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
window.detectUserLanguage = detectUserLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.switchLanguage = switchLanguage;
window.getLanguageDirection = getLanguageDirection;
