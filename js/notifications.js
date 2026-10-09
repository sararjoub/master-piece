/* ============================================
   ===== NOTIFICATIONS PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const tabs = document.querySelectorAll('.notif-tab');
    const notificationItems = document.querySelectorAll('.notification-item');
    const markAllBtn = document.getElementById('markAllBtn');
    const emptyState = document.getElementById('emptyState');
    const navBadge = document.getElementById('navBadge');

    let currentTab = 'all';

    // ============================================
    // 2. تحديث العدادات
    // ============================================
    function updateCounts() {
        const all = document.querySelectorAll('.notification-item').length;
        const unread = document.querySelectorAll('.notification-item.unread').length;
        const requests = document.querySelectorAll('.notification-item[data-type="requests"]').length;
        const messages = document.querySelectorAll('.notification-item[data-type="messages"]').length;

        document.getElementById('countAll').textContent = all;
        document.getElementById('countUnread').textContent = unread;
        document.getElementById('countRequests').textContent = requests;
        document.getElementById('countMessages').textContent = messages;

        // تحديث Badge في الـ Navbar
        if (navBadge) {
            if (unread > 0) {
                navBadge.textContent = unread;
                navBadge.style.display = 'flex';
            } else {
                navBadge.style.display = 'none';
            }
        }
    }

    // ============================================
    // 3. نظام الـ Tabs
    // ============================================
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            applyFilter();
        });
    });

    function applyFilter() {
        let visibleCount = 0;

        notificationItems.forEach(item => {
            const type = item.dataset.type;
            const isUnread = item.classList.contains('unread');

            let shouldShow = false;

            switch (currentTab) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'unread':
                    shouldShow = isUnread;
                    break;
                case 'requests':
                    shouldShow = type === 'requests';
                    break;
                case 'messages':
                    shouldShow = type === 'messages';
                    break;
            }

            if (shouldShow) {
                item.style.display = 'flex';
                item.classList.add('animate-fade-rise');
                visibleCount++;
            } else {
                item.style.display = 'none';
                item.classList.remove('animate-fade-rise');
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
    // 4. Mark All as Read
    // ============================================
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            const unreadItems = document.querySelectorAll('.notification-item.unread');
            
            if (unreadItems.length === 0) {
                showNotification('All notifications are already read.', 'info');
                return;
            }

            unreadItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.remove('unread');
                    const dot = item.querySelector('.notif-dot');
                    if (dot) {
                        dot.style.transition = 'all 0.4s ease';
                        dot.style.opacity = '0';
                        dot.style.transform = 'scale(0)';
                        setTimeout(() => dot.remove(), 400);
                    }
                }, index * 80);
            });

            updateCounts();
            showNotification('All notifications marked as read ✓', 'success');
        });
    }

    // ============================================
    // 5. النقر على إشعار (تحديد كمقروء)
    // ============================================
    notificationItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // إذا كان النقر على زر أو رابط، لا نعالج
            if (e.target.closest('button') || e.target.closest('a')) return;

            if (item.classList.contains('unread')) {
                item.classList.remove('unread');
                const dot = item.querySelector('.notif-dot');
                if (dot) {
                    dot.style.transition = 'all 0.4s ease';
                    dot.style.opacity = '0';
                    dot.style.transform = 'scale(0)';
                    setTimeout(() => dot.remove(), 400);
                }
                updateCounts();
            }
        });
    });

    // ============================================
    // 6. أزرار Accept / Decline داخل الإشعار
    // ============================================
    const acceptBtns = document.querySelectorAll('.notif-accept-btn');
    const declineBtns = document.querySelectorAll('.notif-decline-btn');

    acceptBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.notification-item');
            const name = item.querySelector('.notif-text strong')?.textContent || 'the user';

            // تحديث الإشعار
            item.classList.remove('unread');
            item.querySelector('.notif-icon').className = 'notif-icon notif-icon-success';
            item.querySelector('.notif-icon').textContent = '✓';
            item.querySelector('.notif-header strong').textContent = 'Request Accepted';
            item.querySelector('.notif-text').innerHTML = `You accepted <strong>${name}</strong>'s request. You can now start chatting!`;
            
            const actions = item.querySelector('.notif-actions');
            if (actions) {
                actions.innerHTML = `
                    <a href="chat.html" class="btn btn-primary btn-sm">
                        💬 Start Chat
                    </a>
                `;
            }

            const dot = item.querySelector('.notif-dot');
            if (dot) dot.remove();

            updateCounts();
            showNotification(`Request from ${name} accepted!`, 'success');
        });
    });

    declineBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.notification-item');
            const name = item.querySelector('.notif-text strong')?.textContent || 'the user';

            if (confirm(`Decline ${name}'s request?`)) {
                item.style.transition = 'all 0.4s ease';
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95) translateX(-20px)';

                setTimeout(() => {
                    item.remove();
                    updateCounts();
                    applyFilter();
                }, 400);

                showNotification('Request declined.', 'info');
            }
        });
    });

    // ============================================
    // 7. دالة التنبيهات
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

    // ============================================
    // 8. تحديث العدادات عند التحميل
    // ============================================
    updateCounts();

});