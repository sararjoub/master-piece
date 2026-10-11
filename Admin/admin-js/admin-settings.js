/* ============================================
   ===== ADMIN SETTINGS PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. التبديل بين الأقسام
    // ============================================
    const navItems = document.querySelectorAll('.settings-nav-item');
    const panels = document.querySelectorAll('.settings-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;

            navItems.forEach(n => n.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const targetPanel = document.getElementById(`panel-${section}`);
            if (targetPanel) targetPanel.classList.add('active');

            // تأثير ظهور المحتوى
            targetPanel.style.opacity = '0';
            setTimeout(() => {
                targetPanel.style.transition = 'opacity 0.3s ease';
                targetPanel.style.opacity = '1';
            }, 50);
        });
    });

    // ============================================
    // 2. Color Pickers (تحديث النص عند التغيير)
    // ============================================
    const colorInputs = document.querySelectorAll('.color-picker-input');

    colorInputs.forEach(input => {
        input.addEventListener('input', () => {
            const textInput = input.nextElementSibling;
            if (textInput) {
                textInput.value = input.value.toUpperCase();
            }
        });
    });

    // تحديث لون الـ Color Picker من النص
    const colorTextInputs = document.querySelectorAll('.color-picker-text');
    colorTextInputs.forEach(textInput => {
        textInput.addEventListener('input', () => {
            const colorInput = textInput.previousElementSibling;
            if (colorInput && /^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
                colorInput.value = textInput.value;
            }
        });
    });

    // ============================================
    // 3. Confirm Modal
    // ============================================
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmModalClose = document.getElementById('confirmModalClose');
    const confirmModalCancel = document.getElementById('confirmModalCancel');
    const confirmModalConfirm = document.getElementById('confirmModalConfirm');

    let currentAction = null;

    function openConfirmModal(options) {
        const { title, message, action, confirmText = 'Confirm' } = options;

        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmModalConfirm.textContent = confirmText;
        currentAction = action;

        confirmModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeConfirmModal() {
        confirmModal.classList.add('hidden');
        document.body.style.overflow = '';
        currentAction = null;
    }

    if (confirmModalClose) confirmModalClose.addEventListener('click', closeConfirmModal);
    if (confirmModalCancel) confirmModalCancel.addEventListener('click', closeConfirmModal);

    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) closeConfirmModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && confirmModal && !confirmModal.classList.contains('hidden')) {
            closeConfirmModal();
        }
    });

    if (confirmModalConfirm) {
        confirmModalConfirm.addEventListener('click', () => {
            if (currentAction) currentAction();
            closeConfirmModal();
        });
    }

    // ============================================
    // 4. Clear Cache Button
    // ============================================
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            openConfirmModal({
                title: '⚠️ Clear Cache',
                message: 'Are you sure you want to clear all cached data? Users may experience slower loading temporarily.',
                confirmText: 'Clear Cache',
                action: () => {
                    clearCacheBtn.textContent = 'Clearing...';
                    clearCacheBtn.disabled = true;

                    setTimeout(() => {
                        clearCacheBtn.textContent = '✓ Cache Cleared';
                        showAdminNotification('Cache cleared successfully.', 'success');

                        setTimeout(() => {
                            clearCacheBtn.textContent = 'Clear Cache';
                            clearCacheBtn.disabled = false;
                        }, 2000);
                    }, 1500);
                }
            });
        });
    }

    // ============================================
    // 5. Export Data Button
    // ============================================
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            showAdminNotification('Preparing data export... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 6. Reset Platform Button
    // ============================================
    const resetPlatformBtn = document.getElementById('resetPlatformBtn');
    if (resetPlatformBtn) {
        resetPlatformBtn.addEventListener('click', () => {
            openConfirmModal({
                title: '🗑️ Reset Platform',
                message: 'Are you absolutely sure? This will DELETE ALL DATA including users, skills, courses, and reviews. This action CANNOT be undone.',
                confirmText: 'Yes, Reset Everything',
                action: () => {
                    showAdminNotification('Platform reset initiated...', 'error');
                    setTimeout(() => {
                        showAdminNotification('Redirecting to setup...', 'info');
                        setTimeout(() => {
                            window.location.href = 'admin-login.html';
                        }, 1500);
                    }, 1500);
                }
            });
        });
    }

    // ============================================
    // 7. Integration Buttons
    // ============================================
    const integrationBtns = document.querySelectorAll('.integration-card .admin-btn');
    integrationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.integration-card');
            const name = card.querySelector('h4').textContent;

            if (btn.textContent.trim() === 'Connect') {
                btn.textContent = 'Connecting...';
                btn.disabled = true;
                btn.style.opacity = '0.7';

                setTimeout(() => {
                    const statusBadge = card.querySelector('.integration-status .admin-badge');
                    if (statusBadge) {
                        statusBadge.className = 'admin-badge admin-badge-success';
                        statusBadge.textContent = 'Connected';
                    }
                    btn.textContent = 'Manage';
                    btn.className = 'admin-btn admin-btn-outline admin-btn-sm';
                    btn.disabled = false;
                    btn.style.opacity = '1';

                    showAdminNotification(`${name} connected successfully!`, 'success');
                }, 1500);
            } else {
                showAdminNotification(`Managing ${name}...`, 'info');
            }
        });
    });

    // ============================================
    // 8. Test Email Button
    // ============================================
    const testEmailBtns = document.querySelectorAll('#panel-email .admin-btn-outline');
    testEmailBtns.forEach(btn => {
        if (btn.textContent.includes('Test Email')) {
            btn.addEventListener('click', () => {
                btn.textContent = 'Sending...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.textContent = '✓ Email Sent';
                    showAdminNotification('Test email sent successfully!', 'success');

                    setTimeout(() => {
                        btn.textContent = 'Test Email';
                        btn.disabled = false;
                    }, 2000);
                }, 1500);
            });
        }
    });

    // ============================================
    // 9. Save Buttons
    // ============================================
    const saveBtns = document.querySelectorAll('.settings-panel .admin-btn-primary');
    saveBtns.forEach(btn => {
        if (btn.textContent.includes('Save Changes')) {
            btn.addEventListener('click', () => {
                const originalText = btn.textContent;
                btn.textContent = 'Saving...';
                btn.disabled = true;
                btn.style.opacity = '0.7';

                setTimeout(() => {
                    btn.textContent = '✓ Saved!';
                    showAdminNotification('Settings saved successfully!', 'success');

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    }, 1500);
                }, 1000);
            });
        }
    });

});