

document.addEventListener('DOMContentLoaded', () => {

    let searchInput = document.getElementById('searchInput');
    let categoryCards = document.querySelectorAll('.category-card');
    let categoriesGrid = document.getElementById('categoriesGrid');
    let emptyState = document.getElementById('emptyState');

    // 1. البحث الفوري
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            let query = searchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            categoryCards.forEach(card => {
                let name = card.dataset.name.toLowerCase();
                let title = card.querySelector('.category-name').textContent.toLowerCase();
                let desc = card.querySelector('.category-desc').textContent.toLowerCase();

                let matches = !query || 
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

    // 2. تأثير 3D على البطاقة (Magnetic Effect)
    if (window.innerWidth > 992) {
        categoryCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                let rect = card.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                let centerX = rect.width / 2;
                let centerY = rect.height / 2;
                
                let rotateX = ((y - centerY) / centerY) * -3;
                let rotateY = ((x - centerX) / centerX) * 3;

                card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // 3. تأثير عند النقر على البطاقة
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            let categoryName = card.querySelector('.category-name').textContent;

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

    // 4. دالة التنبيهات
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

});