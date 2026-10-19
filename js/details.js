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

        // 1. زر "Start Learning" يفتح نافذة الخيارات
    let startLearningBtn = document.getElementById('startLearningBtn');
    let learningOptionsModal = document.getElementById('learningOptionsModal');
    let closeLearningModal = document.getElementById('closeLearningModal');

    if (startLearningBtn && learningOptionsModal) {
        startLearningBtn.addEventListener('click', () => {
            learningOptionsModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // منع التمرير
        });
    }

    // 2. إغلاق النافذة
    if (closeLearningModal) {
        closeLearningModal.addEventListener('click', () => {
            learningOptionsModal.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }

    // إغلاق عند النقر خارج النافذة
    if (learningOptionsModal) {
        learningOptionsModal.addEventListener('click', (e) => {
            if (e.target === learningOptionsModal) {
                learningOptionsModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    // إغلاق بزر Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && learningOptionsModal && !learningOptionsModal.classList.contains('hidden')) {
            learningOptionsModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });
    

   
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