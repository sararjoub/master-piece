

document.addEventListener('DOMContentLoaded', () => {

    let searchInput = document.getElementById('searchInput');
    let searchBtn = document.getElementById('searchBtn');
    let filterButtons = document.querySelectorAll('.filter-btn');
    let partnerCards = document.querySelectorAll('.partner-card');
    let partnersCount = document.getElementById('partnersCount');
    let emptyState = document.getElementById('emptyState');
    let partnersList = document.getElementById('partnersList');

    let currentFilter = 'all';
    let currentSearch = '';

    // 1. الفلاتر
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // 2. البحث
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim().toLowerCase();
                applyFilters();
            }
        });
    }

    // 3. تطبيق الفلاتر
    function applyFilters() {
        let visibleCount = 0;
        let cards = Array.from(partnerCards);

        // الترتيب حسب الفلتر
        if (currentFilter === 'rating') {
            cards.sort((a, b) => {
                return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
            });
            // إعادة ترتيب العناصر في DOM
            cards.forEach(card => partnersList.appendChild(card));
        } else if (currentFilter === 'available') {
            cards.sort((a, b) => {
                return (b.dataset.available === 'true' ? 1 : 0) - 
                       (a.dataset.available === 'true' ? 1 : 0);
            });
            cards.forEach(card => partnersList.appendChild(card));
        }

        cards.forEach(card => {
            let name = card.querySelector('.partner-name').textContent.toLowerCase();
            let skillTags = Array.from(card.querySelectorAll('.skill-tag'))
                .map(tag => tag.textContent.toLowerCase())
                .join(' ');

            let matchesSearch = !currentSearch || 
                name.includes(currentSearch) || 
                skillTags.includes(currentSearch);

            if (matchesSearch) {
                card.style.display = 'grid';
                card.classList.add('animate-fade-rise');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('animate-fade-rise');
            }
        });

        partnersCount.textContent = visibleCount;

        if (visibleCount === 0) {
            emptyState.classList.remove('hidden');
            partnersList.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            partnersList.style.display = 'flex';
        }
    }

    // 4. زر View Profile
    let viewProfileButtons = document.querySelectorAll('.view-profile-btn');
    viewProfileButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let partnerSlug = btn.dataset.partner;
            showNotification(`Loading profile...`, 'info');

            setTimeout(() => {
                window.location.href = `partner-profile.html?partner=${partnerSlug}`;
            }, 700);
        });
    });

    // 5. النقر على البطاقة
    partnerCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-profile-btn')) return;
            let btn = card.querySelector('.view-profile-btn');
            if (btn) btn.click();
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
        }, 1800);
    }




    // 7. Count-up Animation للعدد
    function animateCount(element, target, duration = 800) {
        let start = 0;
        let startTime = performance.now();

        let animate = (currentTime) => {
            let elapsed = currentTime - startTime;
            let progress = Math.min(elapsed / duration, 1);
            let current = Math.floor(start + (target - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 400);
            }
        };

        requestAnimationFrame(animate);
    }

    // تفعيل Count-up عند تحميل الصفحة
    if (partnersCount) {
        let initialCount = parseInt(partnersCount.textContent) || 12;
        partnersCount.textContent = '0';
        setTimeout(() => animateCount(partnersCount, initialCount), 300);
    }

    // 8. تحسين applyFilters لاستخدام Count-up
    let originalApplyFilters = applyFilters;
    applyFilters = function() {
        let visibleCount = 0;
        let cards = Array.from(partnerCards);

        if (currentFilter === 'rating') {
            cards.sort((a, b) => parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating));
            cards.forEach(card => partnersList.appendChild(card));
        } else if (currentFilter === 'available') {
            cards.sort((a, b) => 
                (b.dataset.available === 'true' ? 1 : 0) - 
                (a.dataset.available === 'true' ? 1 : 0)
            );
            cards.forEach(card => partnersList.appendChild(card));
        }

        cards.forEach(card => {
            let name = card.querySelector('.partner-name').textContent.toLowerCase();
            let skillTags = Array.from(card.querySelectorAll('.skill-tag'))
                .map(tag => tag.textContent.toLowerCase())
                .join(' ');

            let matchesSearch = !currentSearch || 
                name.includes(currentSearch) || 
                skillTags.includes(currentSearch);

            if (matchesSearch) {
                card.style.display = 'grid';
                // إعادة تفعيل أنيميشن الدخول
                card.style.animation = 'none';
                card.offsetHeight; // Trigger reflow
                card.style.animation = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // استخدام Count-up بدلاً من التحديث المباشر
        animateCount(partnersCount, visibleCount, 500);

        if (visibleCount === 0) {
            emptyState.classList.remove('hidden');
            partnersList.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            partnersList.style.display = 'flex';
        }
    };

    // 9. تأثير النقر على الـ Filter (Ripple)
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // إنشاء عنصر الموجة
            let ripple = document.createElement('span');
            let rect = this.getBoundingClientRect();
            let size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 10. Hover على البطاقة - تأثير إضافي
    partnerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // تأثير على Avatar
            let avatar = this.querySelector('.partner-avatar');
            if (avatar) {
                avatar.style.transform = 'scale(1.1) translateY(-3px)';
                avatar.style.boxShadow = '0 8px 24px rgba(139, 124, 246, 0.35)';
            }
        });

        card.addEventListener('mouseleave', function() {
            let avatar = this.querySelector('.partner-avatar');
            if (avatar) {
                avatar.style.transform = '';
                avatar.style.boxShadow = '';
            }
        });
    });


    // 11. Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        // الضغط على "/" لتفعيل البحث
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        // الضغط على Escape لإغلاق البحث
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.blur();
            currentSearch = '';
            applyFilters();
        }
    });

    });
    