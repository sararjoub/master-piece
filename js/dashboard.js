/* ============================================
   ===== DASHBOARD PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. Count-up Animation للأرقام
    // ============================================
    const statValues = document.querySelectorAll('.stat-value');

    const animateCountUp = (element) => {
        const target = parseInt(element.dataset.count) || 0;
        const duration = 1200;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function (easeOutQuad)
            const eased = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(target * eased);
            
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(animate);
    };

    // تشغيل Count-up عند ظهور الإحصائيات
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const value = entry.target;
                if (!value.dataset.animated) {
                    value.dataset.animated = 'true';
                    animateCountUp(value);
                }
                statsObserver.unobserve(value);
            }
        });
    }, { threshold: 0.3 });

    statValues.forEach(value => statsObserver.observe(value));

    // ============================================
    // 2. زر "Find New Partners"
    // ============================================
    const findPartnersBtn = document.getElementById('findPartnersBtn');

    if (findPartnersBtn) {
        findPartnersBtn.addEventListener('click', () => {
            showNotification('Opening partner search...', 'info');
            setTimeout(() => {
                window.location.href = 'skill-partners.html';
            }, 700);
        });
    }

    // ============================================
    // 3. أزرار "View Profile" للموصى بهم
    // ============================================
    const viewPartnerBtns = document.querySelectorAll('.view-partner-btn');

    viewPartnerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const partner = btn.dataset.partner;
            showNotification(`Loading ${partner.replace(/-/g, ' ')}...`, 'info');

            setTimeout(() => {
                window.location.href = `partner-profile.html?partner=${partner}`;
            }, 700);
        });
    });

    // ============================================
    // 4. النقر على Recommended Card
    // ============================================
    const recommendedCards = document.querySelectorAll('.recommended-card');

    recommendedCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-partner-btn')) return;
            const btn = card.querySelector('.view-partner-btn');
            if (btn) btn.click();
        });
    });

    // ============================================
    // 5. النقر على طلب (Request Item)
    // ============================================
    const requestItems = document.querySelectorAll('.request-item');

    requestItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            showNotification('Opening request details...', 'info');
            setTimeout(() => {
                window.location.href = 'swap-requests.html';
            }, 700);
        });
    });

    // ============================================
    // 6. دالة التنبيهات
    // ============================================
    function showNotification(message, type = 'info') {
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
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
        }, 1800);
    }

});