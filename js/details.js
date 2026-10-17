document.addEventListener('DOMContentLoaded', () => {

    // 1. حماية المهارات المدفوعة (Premium Lock)
    let premiumLockBanner = document.getElementById('premiumLockBanner');
    let isPremiumSkill = false; // ← غيّريها إلى true لتجربة البانر

    if (isPremiumSkill && premiumLockBanner) {
        premiumLockBanner.classList.remove('hidden');
        let startLearningBtn = document.getElementById('startLearningBtn');
        if (startLearningBtn) {
            startLearningBtn.disabled = true;
            startLearningBtn.style.opacity = '0.5';
            startLearningBtn.innerHTML = '🔒 Premium Skill';
        }
    }

    // 2. زر "Start Learning"
    let startLearningBtn = document.getElementById('startLearningBtn');

    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', () => {
            showNotification('Enrolling you in Web Development...', 'info');
            setTimeout(() => {
                window.location.href = 'career-path.html';
            }, 1000);
        });
    }

    // 3. زر "Find Skill Partners"
    let findPartnersBtn = document.getElementById('findPartnersBtn');

    if (findPartnersBtn) {
        findPartnersBtn.addEventListener('click', () => {
            showNotification('Finding skill partners...', 'info');
            setTimeout(() => {
                window.location.href = 'skill-partners.html?skill=web-development';
            }, 800);
        });
    }

    // 4. النقر على "Related Skills"
    let relatedTags = document.querySelectorAll('.related-skill-tag');

    relatedTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            let skillName = tag.textContent.trim();
            showNotification(`Loading ${skillName}...`, 'info');

            setTimeout(() => {
                window.location.href = `skill-details.html?skill=${skillName.toLowerCase().replace(/\s+/g, '-')}`;
            }, 800);
        });
    });

    // 5. دالة التنبيهات
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
        }, 2000);
    }

    // 6. تأثير عند التمرير (Scroll Reveal)
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

});