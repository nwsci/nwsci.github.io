document.addEventListener('DOMContentLoaded', async () => {
  await i18n.init();
  initMobileMenu();
  initSmoothScroll();
  initPricingToggle();
  initTermsNav();
  initAnimations();
});

function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.classList.remove('active');
      });
    });
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function initPricingToggle() {
  const toggle = document.querySelector('.toggle-switch');
  const priceElements = document.querySelectorAll('.pricing-card .price-amount');
  const periodElements = document.querySelectorAll('.pricing-card .price-period');
  
  if (!toggle) return;
  
  const pricing = {
    monthly: {
      free: 0,
      monthly: 1.99,
      yearly: 1.99
    },
    yearly: {
      free: 0,
      monthly: 1.99,
      yearly: 7.99
    }
  };
  
  const periods = {
    monthly: '/mo',
    yearly: '/yr'
  };
  
  const labels = {
    monthly: {
      free: '永久免费',
      monthly: '月付',
      yearly: '年付'
    },
    yearly: {
      free: '永久免费',
      monthly: '月付',
      yearly: '年付'
    }
  };
  
  const updatePrices = (isYearly) => {
    const type = isYearly ? 'yearly' : 'monthly';
    
    priceElements.forEach(el => {
      const plan = el.getAttribute('data-plan');
      const price = pricing[type][plan];
      el.textContent = price === 0 ? 'Free' : `$${price.toFixed(2)}`;
    });
    
    periodElements.forEach(el => {
      const plan = el.getAttribute('data-plan');
      if (pricing[type][plan] === 0) {
        el.textContent = '';
      } else {
        el.textContent = periods[type];
      }
    });
  };
  
  const savedPreference = localStorage.getItem('pricingView');
  const isYearly = savedPreference === 'yearly';
  
  if (isYearly) {
    toggle.classList.add('active');
  }
  
  updatePrices(isYearly);
  
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    const newIsYearly = toggle.classList.contains('active');
    localStorage.setItem('pricingView', newIsYearly ? 'yearly' : 'monthly');
    updatePrices(newIsYearly);
  });
}

function initTermsNav() {
  const termsNav = document.querySelector('.terms-nav');
  const sections = document.querySelectorAll('.terms-content section');
  
  if (!termsNav || sections.length === 0) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        updateActiveNav(id);
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    observer.observe(section);
  });
  
  function updateActiveNav(activeId) {
    termsNav.querySelectorAll('a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
      }
    });
  }
  
  termsNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
        updateActiveNav(targetId);
      }
    });
  });
}

function initAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.product-card, .pricing-card, .terms-content section').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
  
  document.querySelectorAll('.animate-on-load').forEach(el => {
    el.classList.add('slide-up');
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

window.addEventListener('scroll', throttle(() => {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
}, 100));
