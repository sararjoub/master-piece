

document.addEventListener('DOMContentLoaded', () => {

    // 1. عناصر الصفحة
    let billingButtons = document.querySelectorAll('.billing-btn');
    let priceAmounts = document.querySelectorAll('.price-amount');
    let planButtons = document.querySelectorAll('.plan-btn[data-plan]');
    let upgradeModal = document.getElementById('upgradeModal');
    let cancelUpgrade = document.getElementById('cancelUpgrade');
    let confirmUpgrade = document.getElementById('confirmUpgrade');
    let startTrialBtn = document.getElementById('startTrialBtn');

    let currentBilling = 'monthly';
    let selectedPlan = null;

    // 2. Billing Toggle (Monthly / Yearly)
    billingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            let billing = btn.dataset.billing;
            if (billing === currentBilling) return;

            currentBilling = billing;

            // تحديث active
            billingButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // تحديث الأسعار
            priceAmounts.forEach(price => {
                let newValue = price.dataset[billing];
                // تأثير الأنيميشن
                price.style.transform = 'scale(1.2)';
                price.style.color = 'var(--primary)';
                
                setTimeout(() => {
                    price.textContent = newValue;
                    price.style.transform = 'scale(1)';
                    setTimeout(() => {
                        price.style.color = '';
                    }, 200);
                }, 150);
            });

            // تحديث Period
            document.querySelectorAll('.price-period').forEach(p => {
                p.textContent = billing === 'monthly' ? '/month' : '/month, billed yearly';
            });
        });
    });

    // 3. Plan Selection (فتح Modal)
    planButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            let plan = btn.dataset.plan;
            selectedPlan = plan;

            let planNames = {
                'plus': 'Plus',
                'pro': 'Pro'
            };

            let planPrices = {
                'plus': { monthly: '$9/month', yearly: '$7/month' },
                'pro': { monthly: '$19/month', yearly: '$15/month' }
            };

            // تحديث Modal
            document.getElementById('selectedPlanName').textContent = planNames[plan];
            document.getElementById('summaryPlan').textContent = planNames[plan];
            document.getElementById('summaryBilling').textContent = 
                currentBilling === 'monthly' ? 'Monthly' : 'Yearly';
            document.getElementById('summaryTotal').textContent = 
                planPrices[plan][currentBilling];

            // فتح Modal
            upgradeModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    });

    // 4. زر "Start Free Trial"
    if (startTrialBtn) {
        startTrialBtn.addEventListener('click', () => {
            // نفتح Modal Plus (الأكثر شيوعاً)
            selectedPlan = 'plus';
            document.getElementById('selectedPlanName').textContent = 'Plus';
            document.getElementById('summaryPlan').textContent = 'Plus';
            document.getElementById('summaryBilling').textContent = 'Free Trial';
            document.getElementById('summaryTotal').textContent = '$0 for 7 days';

            upgradeModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }

    // 5. إغلاق Modal
    function closeModal() {
        upgradeModal.classList.add('hidden');
        document.body.style.overflow = '';
        selectedPlan = null;
    }

    if (cancelUpgrade) cancelUpgrade.addEventListener('click', closeModal);

    if (upgradeModal) {
        upgradeModal.addEventListener('click', (e) => {
            if (e.target === upgradeModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && upgradeModal && !upgradeModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // 6. تأكيد الترقية
    if (confirmUpgrade) {
        confirmUpgrade.addEventListener('click', () => {
            let originalText = confirmUpgrade.textContent;
            confirmUpgrade.textContent = 'Processing...';
            confirmUpgrade.disabled = true;
            confirmUpgrade.style.opacity = '0.7';

            // ✅ لاحقاً: سيتم إرسال الطلب للـ Backend
            setTimeout(() => {
                confirmUpgrade.textContent = '✓ Success!';
                showNotification(`Welcome to ${selectedPlan === 'plus' ? 'Plus' : 'Pro'}! 🎉`, 'success');

                setTimeout(() => {
                    closeModal();
                    confirmUpgrade.textContent = originalText;
                    confirmUpgrade.disabled = false;
                    confirmUpgrade.style.opacity = '1';

                    // تحديث حالة الـ Free Plan
                    let freeBtn = document.querySelector('.plan-btn[data-plan="free"]');
                    if (freeBtn) freeBtn.textContent = 'Current Plan';

                    // تغيير الزر المختار
                    let selectedBtn = document.querySelector(`.plan-btn[data-plan="${selectedPlan}"]`);
                    if (selectedBtn) {
                        selectedBtn.textContent = '✓ Current Plan';
                        selectedBtn.disabled = true;
                        selectedBtn.style.opacity = '0.7';
                    }
                }, 1200);
            }, 1500);
        });
    }

    // 7. تأثير Hover على البطاقات
    let pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            let icon = card.querySelector('.plan-icon');
            if (icon) icon.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
    });

    
    // 8. تأثير النقر على FAQ
    let faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                // إغلاق الآخرين (اختياري)
                // faqItems.forEach(other => {
                //     if (other !== item) other.open = false;
                // });
            }
        });
    });

    function showNotification(message, type = 'info') {
        let oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();

        let notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span class="notification-message">${message}</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

});