class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.initialized = false;
        this.isRTL = false;
    }

    async init() {
        // 设置初始语言
        this.currentLang = this.getCurrentLanguage();
        
        // 检查RTL语言
        this.isRTL = this.currentLang === 'ar';
        
        // 加载翻译文件
        await this.loadTranslations(this.currentLang);
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        // 应用翻译
        this.applyTranslations();
        
        // 初始化语言切换器
        this.initLanguageSwitcher();
        
        // 应用RTL样式
        this.applyRTLStyles();
        
        this.initialized = true;
        console.log(`i18n initialized with language: ${this.currentLang}, RTL: ${this.isRTL}`);
    }

    getCurrentLanguage() {
        // 尝试从URL获取
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && window.SUPPORTED_LANGUAGES?.[urlLang]) {
            localStorage.setItem('preferredLanguage', urlLang);
            return urlLang;
        }
        
        // 尝试从本地存储获取
        const storedLang = localStorage.getItem('preferredLanguage');
        if (storedLang && window.SUPPORTED_LANGUAGES?.[storedLang]) {
            return storedLang;
        }
        
        // 使用浏览器的检测函数
        if (typeof window.detectUserLanguage === 'function') {
            return window.detectUserLanguage();
        }
        
        return 'en'; // 默认英语
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`/lang/${lang}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.translations = await response.json();
        } catch (error) {
            console.warn(`Failed to load translations for ${lang}, falling back to English:`, error);
            try {
                const response = await fetch('/lang/en.json');
                this.translations = await response.json();
                this.currentLang = 'en';
                this.isRTL = false;
            } catch (fallbackError) {
                console.error('Failed to load fallback translations:', fallbackError);
                this.translations = {};
            }
        }
    }

    t(key, params = {}) {
        if (!key) return '';
        
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return this.getFallbackText(key);
            }
        }
        
        // 处理数组索引，如 "items[0]"
        if (typeof value === 'string' && value.includes('[') && value.includes(']')) {
            const arrayMatch = value.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2]);
                const array = this.t(arrayKey);
                if (Array.isArray(array) && array[index]) {
                    value = array[index];
                }
            }
        }
        
        // 如果是数组，返回第一个元素（用于简单使用）
        if (Array.isArray(value) && value.length > 0) {
            value = value[0];
        }
        
        // 处理参数替换
        if (typeof value === 'string' && params) {
            Object.keys(params).forEach(param => {
                const placeholder = `{${param}}`;
                if (value.includes(placeholder)) {
                    value = value.replace(new RegExp(placeholder, 'g'), params[param]);
                }
            });
        }
        
        return value || key;
    }

    getFallbackText(key) {
        // 尝试从英语获取
        if (this.currentLang !== 'en') {
            return key.split('.').pop() || key;
        }
        return key;
    }

    applyTranslations() {
        // 翻译所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            this.translateElement(element);
        });
        
        // 翻译 title
        const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
        if (titleKey) {
            document.title = this.t(titleKey);
        }
        
        // 翻译 meta 描述
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc?.getAttribute('data-i18n')) {
            metaDesc.setAttribute('content', this.t(metaDesc.getAttribute('data-i18n')));
        }
        
        // 更新语言切换器
        this.updateLanguageSwitcher();
        
        // 设置文档属性
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr';
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang, isRTL: this.isRTL }
        }));
    }

    translateElement(element) {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        const paramsAttr = element.getAttribute('data-i18n-params');
        const params = paramsAttr ? JSON.parse(paramsAttr) : {};
        
        const translation = this.t(key, params);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else if (element.tagName === 'OPTION') {
            element.textContent = translation;
        } else if (element.tagName === 'IMG' && element.hasAttribute('alt')) {
            element.alt = translation;
        } else if (element.hasAttribute('data-i18n-html')) {
            element.innerHTML = translation;
        } else if (element.hasAttribute('title')) {
            element.title = translation;
        } else if (element.hasAttribute('aria-label')) {
            element.setAttribute('aria-label', translation);
        } else {
            element.textContent = translation;
        }
    }

    applyRTLStyles() {
        if (!this.isRTL) return;
        
        // 添加RTL样式类
        document.documentElement.classList.add('rtl');
        
        // 动态添加RTL样式
        if (!document.querySelector('#rtl-styles')) {
            const style = document.createElement('style');
            style.id = 'rtl-styles';
            style.textContent = `
                .rtl {
                    direction: rtl;
                }
                .rtl .nav-menu {
                    margin-right: auto;
                    margin-left: 0;
                }
                .rtl .product-card,
                .rtl .model-card {
                    text-align: right;
                }
                .rtl .feature-list li {
                    padding-right: 1.5rem;
                    padding-left: 0;
                }
                .rtl .feature-list li:before {
                    right: 0;
                    left: auto;
                }
                .rtl .language-switcher {
                    margin-right: auto;
                    margin-left: 0;
                }
                .rtl .language-dropdown {
                    right: auto;
                    left: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    initLanguageSwitcher() {
        // 创建语言切换器容器
        const existingSwitcher = document.getElementById('language-switcher-container');
        if (existingSwitcher) return;
        
        const switcherContainer = document.createElement('div');
        switcherContainer.id = 'language-switcher-container';
        switcherContainer.className = 'language-switcher-container';
        
        // 添加到页面
        const header = document.querySelector('header') || document.body;
        if (header) {
            header.appendChild(switcherContainer);
        } else {
            document.body.insertBefore(switcherContainer, document.body.firstChild);
        }
        
        this.renderLanguageSwitcher();
    }

    renderLanguageSwitcher() {
        const container = document.getElementById('language-switcher-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="language-switcher">
                <button class="language-toggle" id="language-toggle" aria-label="${this.t('buttons.change_language')}">
                    <span class="current-flag">${window.SUPPORTED_LANGUAGES[this.currentLang]?.flag || '🌐'}</span>
                    <span class="current-lang">${window.SUPPORTED_LANGUAGES[this.currentLang]?.native || this.currentLang}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="language-dropdown" id="language-dropdown">
                    <div class="language-dropdown-header">
                        <h4>${this.t('language_switcher.title')}</h4>
                        <button class="close-language" id="close-language" aria-label="${this.t('buttons.close')}">×</button>
                    </div>
                    <div class="language-list" id="language-list">
                        ${Object.entries(window.SUPPORTED_LANGUAGES || {}).map(([code, lang]) => `
                            <button class="language-option ${code === this.currentLang ? 'current' : ''}" 
                                   data-lang="${code}"
                                   aria-label="${lang.native}"
                                   aria-current="${code === this.currentLang ? 'true' : 'false'}">
                                <span class="flag">${lang.flag}</span>
                                <span class="name">${lang.native}</span>
                                <span class="english-name">(${lang.name})</span>
                                ${code === this.currentLang ? 
                                    `<span class="current-indicator">${this.t('language_switcher.current')}</span>` : 
                                    ''
                                }
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // 添加事件监听
        this.bindLanguageSwitcherEvents();
    }

    bindLanguageSwitcherEvents() {
        const toggle = document.getElementById('language-toggle');
        const dropdown = document.getElementById('language-dropdown');
        const closeBtn = document.getElementById('close-language');
        
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                dropdown.classList.remove('show');
            });
        }
        
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = e.currentTarget.dataset.lang;
                if (lang !== this.currentLang) {
                    this.switchTo(lang);
                }
                dropdown.classList.remove('show');
            });
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-switcher')) {
                dropdown?.classList.remove('show');
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown?.classList.remove('show');
            }
        });
    }

    updateLanguageSwitcher() {
        const toggle = document.getElementById('language-toggle');
        if (!toggle) return;
        
        const flag = window.SUPPORTED_LANGUAGES[this.currentLang]?.flag || '🌐';
        const name = window.SUPPORTED_LANGUAGES[this.currentLang]?.native || this.currentLang;
        
        toggle.querySelector('.current-flag').textContent = flag;
        toggle.querySelector('.current-lang').textContent = name;
        
        // 更新当前指示器
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('current');
            option.setAttribute('aria-current', 'false');
            
            if (option.dataset.lang === this.currentLang) {
                option.classList.add('current');
                option.setAttribute('aria-current', 'true');
            }
        });
        
        // 更新下拉菜单中的当前指示器
        const currentIndicators = document.querySelectorAll('.current-indicator');
        currentIndicators.forEach(indicator => {
            indicator.textContent = this.t('language_switcher.current');
        });
    }

    async switchTo(lang) {
        if (lang === this.currentLang || !window.SUPPORTED_LANGUAGES?.[lang]) return;
        
        try {
            this.currentLang = lang;
            this.isRTL = lang === 'ar';
            
            // 保存到本地存储
            localStorage.setItem('preferredLanguage', lang);
            
            // 重新加载翻译
            await this.loadTranslations(lang);
            
            // 更新URL但不刷新页面
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.replaceState({}, '', url);
            
            // 重新应用翻译
            this.applyTranslations();
            
            // 重新渲染语言切换器
            this.renderLanguageSwitcher();
            
            console.log(`Language switched to: ${lang}`);
            
        } catch (error) {
            console.error('Failed to switch language:', error);
        }
    }
}

// 创建并初始化全局实例
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
    window.i18n.init().catch(console.error);
});

// 快捷函数
window.__ = (key, params) => window.i18n?.t(key, params) || key;
window.switchLanguage = (lang) => window.i18n?.switchTo(lang);
