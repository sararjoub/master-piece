/* ============================================
   ===== SETTINGS PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. التبديل بين الأقسام (Sidebar Navigation)
    // ============================================
    const navItems = document.querySelectorAll('.settings-nav-item');
    const panels = document.querySelectorAll('.settings-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;

            // إزالة active من الجميع
            navItems.forEach(n => n.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // تفعيل المحدد
            item.classList.add('active');
            const targetPanel = document.getElementById(`panel-${section}`);
            if (targetPanel) targetPanel.classList.add('active');

            // Scroll للأعلى
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // ============================================
    // 2. Save Buttons (مع تنبيه)
    // ============================================
    const saveButtons = document.querySelectorAll('.settings-panel .btn-primary');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const originalText = btn.textContent;
            btn.textContent = 'Saving...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // ✅ لاحقاً: سيتم إرسال البيانات للـ Backend
            setTimeout(() => {
                btn.textContent = '✓ Saved!';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 1200);
                showNotification('Changes saved successfully!', 'success');
            }, 1000);
        });
    });

    // ============================================
    // 3. Toggle Switches (إشعار)
    // ============================================
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(sw => {
        sw.addEventListener('change', () => {
            const label = sw.closest('.notification-pref, .settings-block-row')
                ?.querySelector('h3')?.textContent || 'Setting';
            const status = sw.checked ? 'enabled' : 'disabled';
            showNotification(`${label} ${status}.`, 'info');
        });
    });

    // ============================================
    // 4. Delete Account Modal
    // ============================================
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const deleteConfirmInput = document.getElementById('deleteConfirmInput');

    // فتح Modal
    if (deleteAccountBtn && deleteModal) {
        deleteAccountBtn.addEventListener('click', () => {
            deleteModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            deleteConfirmInput.value = '';
            confirmDelete.disabled = true;
        });
    }

    // إغلاق Modal
    function closeModalFn() {
        if (deleteModal) {
            deleteModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeModalFn);
    if (cancelDelete) cancelDelete.addEventListener('click', closeModalFn);

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeModalFn();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal && !deleteModal.classList.contains('hidden')) {
            closeModalFn();
        }
    });

    // ============================================
    // 5. التحقق من كلمة "DELETE"
    // ============================================
    if (deleteConfirmInput) {
        deleteConfirmInput.addEventListener('input', () => {
            const value = deleteConfirmInput.value.trim();
            if (value === 'DELETE') {
                confirmDelete.disabled = false;
                confirmDelete.style.opacity = '1';
                confirmDelete.style.cursor = 'pointer';
            } else {
                confirmDelete.disabled = true;
                confirmDelete.style.opacity = '0.5';
                confirmDelete.style.cursor = 'not-allowed';
            }
        });
    }

    // ============================================
    // 6. تأكيد حذف الحساب
    // ============================================
    if (confirmDelete) {
        confirmDelete.addEventListener('click', () => {
            // ✅ لاحقاً: سيتم إرسال طلب الحذف للـ Backend
            confirmDelete.textContent = 'Deleting...';
            confirmDelete.disabled = true;

            setTimeout(() => {
                showNotification('Account deletion request submitted.', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }, 1200);
        });
    }

    // ============================================
    // 7. Deactivate Account
    // ============================================
    const deactivateBtn = document.getElementById('deactivateBtn');
    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to deactivate your account? You can reactivate anytime by logging in.')) {
                showNotification('Account deactivated. Redirecting...', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        });
    }

    // ============================================
    // 8. Connected Accounts (Connect Buttons)
    // ============================================
    const connectBtns = document.querySelectorAll('.connected-account .btn');
    connectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.textContent.trim() === 'Connect') {
                showNotification('Connecting... (Coming soon)', 'info');
            }
        });
    });

    // ============================================
    // 9. Revoke Session
    // ============================================
    const revokeBtns = document.querySelectorAll('.session-item .btn');
    revokeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Revoke this session?')) {
                const sessionItem = btn.closest('.session-item');
                sessionItem.style.transition = 'all 0.4s ease';
                sessionItem.style.opacity = '0';
                sessionItem.style.transform = 'translateX(-20px)';
                setTimeout(() => sessionItem.remove(), 400);
                showNotification('Session revoked.', 'success');
            }
        });
    });

    // ============================================
    // 10. دالة التنبيهات
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

    // ============================================
    // 11. Ripple Effect على Sidebar Items
    // ============================================
    const sidebarItems = document.querySelectorAll('.settings-nav-item');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // إنشاء موجة
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 700);
        });

        // تأثير المغناطيس على Hover
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.settings-nav-icon');
            if (icon) {
                icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }
        });
    });