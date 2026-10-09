/* ============================================
   ===== PROFILE PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. زر "Edit Profile"
    // ============================================
    const editProfileBtn = document.getElementById('editProfileBtn');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            showNotification('Opening profile editor...', 'info');
            setTimeout(() => {
                window.location.href = 'settings.html';
            }, 800);
        });
    }

    // ============================================
    // 2. أزرار "Edit" لكل قسم
    // ============================================
    const blockEditBtns = document.querySelectorAll('.block-edit-btn');

    blockEditBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            const sectionNames = {
                'about': 'About',
                'teach': 'Can Teach skills',
                'learn': 'Wants to Learn skills'
            };

            showNotification(`Editing ${sectionNames[section] || section}...`, 'info');
        });
    });

    // ============================================
    // 3. Count-up Animation للأرقام في Stats
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCountUp = (element, target) => {
        const duration = 1200;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
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

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.dataset.animated) {
                    el.dataset.animated = 'true';
                    const target = parseInt(el.textContent) || 0;
                    el.textContent = '0';
                    animateCountUp(el, target);
                }
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    statNumbers.forEach(el => statsObserver.observe(el));

    // ============================================
    // 4. التأثير عند Hover على Reviews
    // ============================================
    const reviewItems = document.querySelectorAll('.review-item');

    reviewItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const stars = item.querySelectorAll('.review-stars span');
            stars.forEach((star, index) => {
                setTimeout(() => {
                    star.style.transform = 'scale(1.3)';
                    star.style.transition = 'transform 0.2s ease';
                    setTimeout(() => {
                        star.style.transform = 'scale(1)';
                    }, 200);
                }, index * 60);
            });
        });
    });

    // ============================================
    // 5. دالة التنبيهات
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