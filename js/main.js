document.addEventListener('DOMContentLoaded', function() {
    // 常见功能初始化
    initFAQ();
    initSmoothScroll();
    initCurrentYear();
});

function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.faq-icon');
            
            // 切换当前答案
            answer.classList.toggle('show');
            
            // 更新图标
            if (icon) {
                icon.textContent = answer.classList.contains('show') ? '−' : '+';
            }
            
            // 关闭其他FAQ
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    const otherAnswer = otherQuestion.nextElementSibling;
                    const otherIcon = otherQuestion.querySelector('.faq-icon');
                    
                    otherAnswer.classList.remove('show');
                    if (otherIcon) {
                        otherIcon.textContent = '+';
                    }
                }
            });
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    if (yearElements.length > 0) {
        const currentYear = new Date().getFullYear();
        yearElements.forEach(element => {
            element.textContent = currentYear;
        });
    }
}

// Cookie Control Center 定价页面特定功能
function initPricingPage() {
    const pricingPage = document.querySelector('.pricing-tiers');
    if (!pricingPage) return;
    
    // 处理购买按钮点击
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tier = this.dataset.tier;
            const period = this.dataset.period;
            
            // 这里可以集成Paddle的结账流程
            console.log(`购买: ${tier}, 周期: ${period}`);
            
            // 显示购买模态框或重定向到Paddle
            showPurchaseModal(tier, period);
        });
    });
}

function showPurchaseModal(tier, period) {
    // 简化版购买确认
    const modal = document.createElement('div');
    modal.className = 'purchase-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Redirecting to Paddle</h3>
            <p>You will be redirected to Paddle to complete your purchase of the ${tier} plan (${period}).</p>
            <div class="modal-actions">
                <button class="btn secondary cancel-btn">Cancel</button>
                <button class="btn continue-btn">Continue</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .purchase-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
        }
        .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
    `;
    document.head.appendChild(style);
    
    // 处理按钮点击
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    modal.querySelector('.continue-btn').addEventListener('click', () => {
        // 这里应该重定向到Paddle结账页面
        window.location.href = `https://buy.paddle.com/checkout/...?product=...&period=${period}`;
    });
}
