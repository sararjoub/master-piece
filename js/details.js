/* ============================================
   ===== SKILL DETAILS PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. زر "Start Learning"
    // ============================================
    const startLearningBtn = document.getElementById('startLearningBtn');

    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', () => {
            // ✅ لاحقاً: سيتم تسجيل المستخدم في الكورس
            showNotification('Enrolling you in Web Development...', 'info');

            setTimeout(() => {
                // ننتقل إلى صفحة المسار المهني (أو صفحة الكورس)
                window.location.href = 'career-path.html';
            }, 1000);
        });
    }

    // ============================================
    // 2. زر "Find Skill Partners"
    // ============================================
    const findPartnersBtn = document.getElementById('findPartnersBtn');

    if (findPartnersBtn) {
        findPartnersBtn.addEventListener('click', () => {
            showNotification('Finding skill partners...', 'info');

            setTimeout(() => {
                // ننتقل إلى صفحة شركاء المهارة
                window.location.href = 'skill-partners.html?skill=web-development';
            }, 800);
        });
    }

    // ============================================
    // 3. النقر على "Related Skills"
    // ============================================
    const relatedTags = document.querySelectorAll('.related-skill-tag');

    relatedTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const skillName = tag.textContent.trim();
            showNotification(`Loading ${skillName}...`, 'info');

            setTimeout(() => {
                // ✅ لاحقاً: سيتم تمرير slug المهارة
                window.location.href = `skill-details.html?skill=${skillName.toLowerCase().replace(/\s+/g, '-')}`;
            }, 800);
        });
    });

    // ============================================
    // 4. دالة عرض التنبيهات
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
        }, 2000);
    }

    // ============================================
    // 5. تأثير عند التمرير (Scroll Reveal)
    // ============================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

});