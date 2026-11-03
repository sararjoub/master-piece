

document.addEventListener('DOMContentLoaded', () => {

    // 
    // 1. تفعيل الرابط النشط في Sidebar
    // 
    let currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    let sidebarLinks = document.querySelectorAll('.admin-sidebar-link');

    sidebarLinks.forEach(link => {
        let href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 
    // 2. Sidebar Toggle (للشاشات الصغيرة)
    // 
    let sidebarToggle = document.getElementById('adminSidebarToggle');
    let sidebar = document.getElementById('adminSidebar');
    let overlay = document.getElementById('adminSidebarOverlay');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('open');
        });
    }

    if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }

    // 
    // 3. Admin Dropdown (User Menu)
    // 
    let adminUserBtn = document.getElementById('adminUserBtn');
    let adminDropdown = document.getElementById('adminDropdown');
    let adminUserMenu = document.getElementById('adminUserMenu');

    if (adminUserBtn && adminDropdown) {
        adminUserBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            adminDropdown.classList.toggle('open');
            adminUserBtn.classList.toggle('active');
        });

        // إغلاق عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (adminUserMenu && !adminUserMenu.contains(e.target)) {
                adminDropdown.classList.remove('open');
                adminUserBtn.classList.remove('active');
            }
        });

        // إغلاق عند الضغط على Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                adminDropdown.classList.remove('open');
                adminUserBtn.classList.remove('active');
            }
        });
    }

    // 
    // 4. Logout
    // 
    let logoutBtns = document.querySelectorAll('#adminLogout, .admin-dropdown-logout');

    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                // ✅ لاحقاً: سيتم مسح الجلسة من الـ Backend
                showAdminNotification('Logging out...', 'info');
                setTimeout(() => {
                    window.location.href = 'admin-login.html';
                }, 800);
            }
        });
    });

    // 
    // 5. Notifications Button
    // 
    let adminNotificationsBtn = document.getElementById('adminNotificationsBtn');
    if (adminNotificationsBtn) {
        adminNotificationsBtn.addEventListener('click', () => {
            showAdminNotification('You have 5 new notifications', 'info');
        });
    }

    // 
    // 6. Count-up Animation للأرقام
    // 
    let statValues = document.querySelectorAll('.admin-stat-value[data-count]');

    let animateCountUp = (element) => {
        let target = parseInt(element.dataset.count) || 0;
        let duration = 1200;
        let startTime = performance.now();
        let startValue = 0;

        let animate = (currentTime) => {
            let elapsed = currentTime - startTime;
            let progress = Math.min(elapsed / duration, 1);
            // Easing Function
            let eased = 1 - Math.pow(1 - progress, 3);
            let current = Math.floor(startValue + (target - startValue) * eased);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(animate);
    };

    // مراقبة البطاقات عند الظهور
    let statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let el = entry.target;
                if (!el.dataset.animated) {
                    el.dataset.animated = 'true';
                    animateCountUp(el);
                }
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    statValues.forEach(el => statsObserver.observe(el));

    // 
    // 7. Search Bar (Filter داخل الصفحة)
    // 
    let searchInputs = document.querySelectorAll('[data-admin-search]');

    searchInputs.forEach(input => {
        input.addEventListener('input', () => {
            let query = input.value.trim().toLowerCase();
            let targetSelector = input.dataset.adminSearch;
            let items = document.querySelectorAll(targetSelector);

            items.forEach(item => {
                let text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 
    // 8. Filter Buttons
    // 
    let filterBtns = document.querySelectorAll('.admin-filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let group = btn.parentElement;
            group.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 
    // 9. Table Row Click (فتح التفاصيل)
    // 
    let tableRows = document.querySelectorAll('.admin-table tbody tr[data-href]');
    tableRows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            // تجاهل إذا كان النقر على زر
            if (e.target.closest('.admin-table-action-btn')) return;
            window.location.href = row.dataset.href;
        });
    });

    // 
    // 10. Danger Actions (Delete, Block)
    // 
    let dangerBtns = document.querySelectorAll('[data-confirm-danger]');

    dangerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let message = btn.dataset.confirmDanger || 'Are you sure?';
            if (confirm(message)) {
                // ✅ لاحقاً: سيتم إرسال الطلب للـ Backend
                let row = btn.closest('tr') || btn.closest('.admin-card');
                if (row) {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => row.remove(), 400);
                }
                showAdminNotification('Action completed successfully.', 'success');
            }
        });
    });

    // 
    // 11. Toggle Switches
    // 
    let switches = document.querySelectorAll('.admin-switch input');
    switches.forEach(sw => {
        sw.addEventListener('change', () => {
            let label = sw.dataset.label || 'Setting';
            let status = sw.checked ? 'enabled' : 'disabled';
            showAdminNotification(`${label} ${status}.`, 'info');
        });
    });

    // 
    // 12. Ripple Effect على الأزرار
    // 
    let rippleButtons = document.querySelectorAll('.admin-btn, .admin-sidebar-link, .admin-table-action-btn');

    rippleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            let ripple = document.createElement('span');
            ripple.className = 'admin-ripple';
            
            let rect = this.getBoundingClientRect();
            let size = Math.max(rect.width, rect.height);
            let x = e.clientX - rect.left - size / 2;
            let y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
                border-radius: 50%;
                transform: scale(0);
                animation: adminRippleAnim 0.6s ease-out;
                pointer-events: none;
            `;

            // التأكد أن العنصر الأب position: relative
            if (getComputedStyle(this).position === 'static') {
                this.style.position = 'relative';
            }
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 
    // 13. دالة التنبيهات
    // 
    window.showAdminNotification = function(message, type = 'info') {
        let oldNotification = document.querySelector('.admin-notification-toast');
        if (oldNotification) oldNotification.remove();

        let notification = document.createElement('div');
        notification.className = `admin-notification-toast admin-notification-${type}`;
        notification.innerHTML = `
            <span class="admin-notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span class="admin-notification-message">${message}</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    };

    // مرادف سهل
    let showAdminNotification = window.showAdminNotification;

    // 
    // 14. Keyboard Shortcuts
    // 
    document.addEventListener('keydown', (e) => {
        // "/" للبحث
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            let searchInput = document.querySelector('[data-admin-search]') || 
                                document.querySelector('.admin-search-input') ||
                                document.querySelector('.admin-topbar-search input');
            if (searchInput) searchInput.focus();
        }

        // "Esc" لإغلاق الـ Dropdowns
        if (e.key === 'Escape') {
            document.querySelectorAll('.admin-dropdown.open').forEach(d => d.classList.remove('open'));
            document.querySelectorAll('.admin-sidebar.open').forEach(s => s.classList.remove('open'));
        }
    });

    function isInputFocused() {
        let active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
    }

});