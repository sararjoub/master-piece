/* ============================================
   ===== CATEGORIES PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('searchInput');
    const categoryCards = document.querySelectorAll('.category-card');
    const categoriesGrid = document.getElementById('categoriesGrid');
    const emptyState = document.getElementById('emptyState');

    // ============================================
    // 1. البحث الفوري
    // ============================================
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            categoryCards.forEach(card => {
                const name = card.dataset.name.toLowerCase();
                const title = card.querySelector('.category-name').textContent.toLowerCase();
                const desc = card.querySelector('.category-desc').textContent.toLowerCase();

                const matches = !query || 
                    name.includes(query) || 
                    title.includes(query) || 
                    desc.includes(query);

                if (matches) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // إظهار/إخفاء الحالة الفارغة
            if (emptyState) {
                if (visibleCount === 0) {
                    emptyState.classList.remove('hidden');
                    categoriesGrid.style.display = 'none';
                } else {
                    emptyState.classList.add('hidden');
                    categoriesGrid.style.display = 'grid';
                }
            }
        });
    }

    // ============================================
    // 2. تأثير 3D على البطاقة (Magnetic Effect)
    // ============================================
    if (window.innerWidth > 992) {
        categoryCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;

                card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ============================================
    // 3. تأثير عند النقر على البطاقة
    // ============================================
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const categoryName = card.querySelector('.category-name').textContent;

            // إذا كان الرابط `#` فقط، نعرض تنبيهاً
            if (card.getAttribute('href') === '#') {
                e.preventDefault();
                showNotification(`${categoryName} coming soon!`, 'info');
            } else {
                // تأثير النقر
                card.style.transform = 'scale(0.97)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }
        });
    });

    // ============================================
    // 4. دالة التنبيهات
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