class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
        this.translations = {};
        this.elements = document.querySelectorAll('[data-lang]');
        
        this.init();
    }
    
    async init() {
        // 加载当前语言
        await this.loadLanguage(this.currentLang);
        
        // 设置语言选择器
        this.setupSelector();
        
        // 应用翻译
        this.applyTranslations();
    }
    
    async loadLanguage(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error(`Failed to load language ${lang}:`, error);
            
            // 如果失败，尝试加载英语
            if (lang !== 'en') {
                console.log('Falling back to English...');
                this.currentLang = 'en';
                await this.loadLanguage('en');
            }
        }
    }
    
    setupSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLang;
            selector.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        }
    }
    
    async switchLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // 加载新语言
        await this.loadLanguage(lang);
        
        // 应用新翻译
        this.applyTranslations();
        
        // 更新选择器
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = lang;
        }
        
        // 触发语言切换事件
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
    
    applyTranslations() {
        this.elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            if (key && this.translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = this.translations[key];
                } else {
                    element.textContent = this.translations[key];
                }
            }
        });
        
        // 更新页面语言属性
        document.documentElement.lang = this.currentLang;
    }
    
    getTranslation(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value[k] !== undefined) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
}

// 初始化语言切换器
let languageSwitcher;

document.addEventListener('DOMContentLoaded', () => {
    languageSwitcher = new LanguageSwitcher();
});
