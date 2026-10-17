

document.addEventListener('DOMContentLoaded', () => {

    // 1. عناصر الصفحة
    let searchInput = document.getElementById('searchInput');
    let searchBtn = document.getElementById('searchBtn');
    let filterButtons = document.querySelectorAll('.filter-btn');
    let skillCards = document.querySelectorAll('.skill-card');
    let skillsCount = document.getElementById('skillsCount');
    let emptyState = document.getElementById('emptyState');
    let skillsGrid = document.getElementById('skillsGrid');

    // 2. حالة الفلاتر
    let currentFilter = 'all';
    let currentSearch = '';

    // 3. تفعيل الفلاتر
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // إزالة الحالة النشطة من جميع الأزرار
            filterButtons.forEach(b => b.classList.remove('active'));
            // تفعيل الزر المضغوط
            btn.classList.add('active');
            // تحديث الفلتر الحالي
            currentFilter = btn.dataset.filter;
            // إعادة تطبيق الفلترة
            applyFilters();
        });
    });

    // 4. البحث
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }

    // البحث عند الضغط على Enter
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim().toLowerCase();
                applyFilters();
            }
        });

        // البحث الفوري عند الكتابة (اختياري)
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }

    // 5. تطبيق الفلاتر والبحث
    function applyFilters() {
        let visibleCount = 0;

        skillCards.forEach(card => {
            let level = card.dataset.level;
            let title = card.querySelector('.skill-title').textContent.toLowerCase();
            let description = card.querySelector('.skill-description').textContent.toLowerCase();

            // التحقق من الفلتر
            let matchesFilter = currentFilter === 'all' || level === currentFilter;

            // التحقق من البحث
            let matchesSearch = !currentSearch || 
                title.includes(currentSearch) || 
                description.includes(currentSearch);

            // عرض/إخفاء البطاقة
            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
                card.classList.add('animate-fade-rise');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('animate-fade-rise');
            }
        });

        // تحديث العدد
        skillsCount.textContent = visibleCount;

        // إظهار/إخفاء الحالة الفارغة
        if (visibleCount === 0) {
            emptyState.classList.remove('hidden');
            skillsGrid.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            skillsGrid.style.display = 'grid';
        }
    }

    // 6. النقر على بطاقة المهارة
    skillCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // إذا كان النقر على الزر، لا تفعل شيئاً هنا (الزر له معالج خاص)
            if (e.target.classList.contains('skill-btn')) return;

            let skill = card.querySelector('.skill-btn').dataset.skill;
            navigateToSkill(skill);
        });
    });

    // 7. النقر على زر "View Skill"
    let skillButtons = document.querySelectorAll('.skill-btn');
    skillButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        let card = btn.closest('.skill-card');
        let isPremium = card.dataset.premium === 'true';

        if (isPremium) {
            // عرض Modal "Upgrade"
            if (confirm('This is a Premium skill. Upgrade to Plus to access it?\n\nGo to pricing page?')) {
                window.location.href = 'pricing.html';
            }
            return;
        }

        let skill = btn.dataset.skill;
        navigateToSkill(skill);
    });
    });

    // 8. الانتقال إلى صفحة تفاصيل المهارة
    function navigateToSkill(skillSlug) {
        // ✅ لاحقاً: سيتم تمرير ID المهارة من الـ Backend
        // حالياً: ننتقل إلى صفحة تفاصيل ثابتة
        showNotification(`Loading ${skillSlug.replace(/-/g, ' ')}...`, 'info');

        setTimeout(() => {
            window.location.href = `skill-details.html?skill=${skillSlug}`;
        }, 800);
    }

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

    // 10. تأثير عند التمرير (Scroll Reveal)
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