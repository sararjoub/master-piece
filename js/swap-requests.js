

document.addEventListener('DOMContentLoaded', () => {

    // 1. نظام الـ Tabs
    let tabs = document.querySelectorAll('.tab');
    let tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            let targetTab = tab.dataset.tab;

            // إزالة active من كل الـ tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // إخفاء كل المحتوى
            tabContents.forEach(content => content.classList.remove('active'));

            // إظهار المحتوى المطلوب
            let targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // إعادة تطبيق الفلاتر
            applyFilters();
        });
    });

    // 2. الفلاتر والبحث
    let filterChips = document.querySelectorAll('.filter-chip');
    let searchInput = document.getElementById('searchInput');
    let emptyState = document.getElementById('emptyState');

    let currentFilter = 'all';
    let currentSearch = '';

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.filter;
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }

    // 3. تطبيق الفلاتر
    function applyFilters() {
        let activeContent = document.querySelector('.tab-content.active');
        if (!activeContent) return;

        let cards = activeContent.querySelectorAll('.request-card');
        let visibleCount = 0;

        cards.forEach(card => {
            let status = card.dataset.status || '';
            let userName = card.querySelector('.request-user-info strong')?.textContent.toLowerCase() || '';

            // التحقق من الفلتر
            let matchesFilter = currentFilter === 'all' || status === currentFilter;

            // التحقق من البحث
            let matchesSearch = !currentSearch || userName.includes(currentSearch);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
                card.classList.add('animate-fade-rise');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('animate-fade-rise');
            }
        });

        // إظهار/إخفاء الحالة الفارغة
        if (emptyState) {
            if (visibleCount === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
        }
    }

    // 4. أزرار Accept / Reject
    let acceptButtons = document.querySelectorAll('.accept-btn');
    let rejectButtons = document.querySelectorAll('.reject-btn');

    acceptButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let card = btn.closest('.request-card');
            let userName = card.querySelector('.request-user-info strong')?.textContent || 'this user';

            // تحديث الحالة في الواجهة
            let badge = card.querySelector('.badge');
            if (badge) {
                badge.className = 'badge badge-success';
                badge.textContent = 'Accepted';
            }
            card.dataset.status = 'accepted';

            // تغيير الأزرار
            let actions = card.querySelector('.request-actions');
            actions.innerHTML = `
                <button class="btn btn-primary btn-sm message-btn">
                    💬 Open Chat
                </button>
            `;

            // إعادة ربط زر Message
            attachMessageButton();

            showNotification(`Request accepted! You can now chat with ${userName}.`, 'success');
        });
    });

    rejectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let card = btn.closest('.request-card');

            if (confirm('Are you sure you want to decline this request?')) {
                // إخفاء البطاقة بحركة
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    card.remove();
                    applyFilters();
                }, 300);

                showNotification('Request declined.', 'info');
            }
        });
    });

    // 5. زر Cancel Request (Outgoing)
    let cancelButtons = document.querySelectorAll('.cancel-request-btn');

    cancelButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let card = btn.closest('.request-card');

            if (confirm('Are you sure you want to cancel this request?')) {
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    card.remove();
                    applyFilters();
                }, 300);

                showNotification('Request cancelled.', 'info');
            }
        });
    });

    // 6. أزرار Message
    function attachMessageButton() {
        let messageButtons = document.querySelectorAll('.message-btn');
        messageButtons.forEach(btn => {
            if (!btn.dataset.bound) {
                btn.dataset.bound = 'true';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showNotification('Opening chat...', 'info');
                    setTimeout(() => {
                        window.location.href = 'chat.html';
                    }, 700);
                });
            }
        });
    }

    attachMessageButton();


    // 7. زر "New Request"
    let findPartnersBtn = document.getElementById('findPartnersBtn');

    if (findPartnersBtn) {
        findPartnersBtn.addEventListener('click', () => {
            window.location.href = 'skill-partners.html';
        });
    }

    // 8. تقييم النجوم (Completed Tab)
    let reviewStarsInput = document.querySelectorAll('.review-stars-input');

    reviewStarsInput.forEach(container => {
        let stars = container.querySelectorAll('span');

        stars.forEach((star, index) => {
            star.style.cursor = 'pointer';

            star.addEventListener('mouseenter', () => {
                stars.forEach((s, i) => {
                    s.style.color = i <= index ? '#fbbf24' : '#d1d5db';
                });
            });

            star.addEventListener('click', () => {
                stars.forEach((s, i) => {
                    s.style.color = i <= index ? '#fbbf24' : '#d1d5db';
                });
                showNotification(`Thank you for rating ${index + 1} stars!`, 'success');
            });
        });

        container.addEventListener('mouseleave', () => {
            stars.forEach(s => s.style.color = '#fbbf24');
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
        }, 2200);
    }

});