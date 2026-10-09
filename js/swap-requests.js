/* ============================================
   ===== SWAP REQUESTS PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. نظام الـ Tabs
    // ============================================
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // إزالة active من كل الـ tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // إخفاء كل المحتوى
            tabContents.forEach(content => content.classList.remove('active'));

            // إظهار المحتوى المطلوب
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // إعادة تطبيق الفلاتر
            applyFilters();
        });
    });

    // ============================================
    // 2. الفلاتر والبحث
    // ============================================
    const filterChips = document.querySelectorAll('.filter-chip');
    const searchInput = document.getElementById('searchInput');
    const emptyState = document.getElementById('emptyState');

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

    // ============================================
    // 3. تطبيق الفلاتر
    // ============================================
    function applyFilters() {
        const activeContent = document.querySelector('.tab-content.active');
        if (!activeContent) return;

        const cards = activeContent.querySelectorAll('.request-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const status = card.dataset.status || '';
            const userName = card.querySelector('.request-user-info strong')?.textContent.toLowerCase() || '';

            // التحقق من الفلتر
            const matchesFilter = currentFilter === 'all' || status === currentFilter;

            // التحقق من البحث
            const matchesSearch = !currentSearch || userName.includes(currentSearch);

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

    // ============================================
    // 4. أزرار Accept / Reject
    // ============================================
    const acceptButtons = document.querySelectorAll('.accept-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');

    acceptButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.request-card');
            const userName = card.querySelector('.request-user-info strong')?.textContent || 'this user';

            // تحديث الحالة في الواجهة
            const badge = card.querySelector('.badge');
            if (badge) {
                badge.className = 'badge badge-success';
                badge.textContent = 'Accepted';
            }
            card.dataset.status = 'accepted';

            // تغيير الأزرار
            const actions = card.querySelector('.request-actions');
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
            const card = btn.closest('.request-card');

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

    // ============================================
    // 5. زر Cancel Request (Outgoing)
    // ============================================
    const cancelButtons = document.querySelectorAll('.cancel-request-btn');

    cancelButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.request-card');

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

    // ============================================
    // 6. أزرار Message
    // ============================================
    function attachMessageButton() {
        const messageButtons = document.querySelectorAll('.message-btn');
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

    // ============================================
    // 7. زر "New Request"
    // ============================================
    const findPartnersBtn = document.getElementById('findPartnersBtn');

    if (findPartnersBtn) {
        findPartnersBtn.addEventListener('click', () => {
            window.location.href = 'skill-partners.html';
        });
    }

    // ============================================
    // 8. تقييم النجوم (Completed Tab)
    // ============================================
    const reviewStarsInput = document.querySelectorAll('.review-stars-input');

    reviewStarsInput.forEach(container => {
        const stars = container.querySelectorAll('span');

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

    // ============================================
    // 9. دالة التنبيهات
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
        }, 2200);
    }

});