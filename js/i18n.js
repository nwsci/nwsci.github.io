const i18n = {
  currentLang: 'en',
  translations: {},
  
  async init() {
    const savedLang = localStorage.getItem('preferredLanguage');
    this.currentLang = savedLang || 'en';
    await this.loadLanguage(this.currentLang);
    this.updateLanguageSwitcher();
  },
  
  async loadLanguage(lang) {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang} language file`);
      }
      this.translations = await response.json();
      this.currentLang = lang;
      this.applyTranslations();
      localStorage.setItem('preferredLanguage', lang);
    } catch (error) {
      console.error('Error loading language:', error);
      if (lang !== 'en') {
        this.loadLanguage('en');
      }
    }
  },
  
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.get(key);
      if (translation) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
        element.setAttribute('data-i18n-key', key);
      }
    });
    
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translation = this.get(key);
      if (translation) {
        element.innerHTML = translation;
      }
    });
    
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.get(key);
      if (translation) {
        element.setAttribute('title', translation);
      }
    });
  },
  
  get(key) {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  },
  
  t(key) {
    return this.get(key);
  },
  
  updateLanguageSwitcher() {
    const activeBtn = document.querySelector('.language-dropdown button.active');
    if (activeBtn) {
      const lang = activeBtn.getAttribute('data-lang');
      document.querySelectorAll('.language-dropdown button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === this.currentLang) {
          btn.classList.add('active');
        }
      });
    }
    
    const langLabels = {
      'en': 'English',
      'zh': '中文'
    };
    
    const currentLabel = langLabels[this.currentLang] || 'Language';
    document.querySelectorAll('.language-btn span:not(.caret)').forEach(span => {
      span.textContent = currentLabel;
    });
  },
  
  switchLanguage(lang) {
    if (lang !== this.currentLang) {
      this.loadLanguage(lang);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
