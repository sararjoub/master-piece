/* ============================================
   ===== USER DETAILS PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. أزرار الصفحة
    // ============================================
    const editUserBtn = document.getElementById('editUserBtn');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const suspendBtn = document.getElementById('suspendBtn');
    const deleteUserBtn = document.getElementById('deleteUserBtn');

    // ============================================
    // 2. Confirm Modal
    // ============================================
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmModalHeader = document.getElementById('confirmModalHeader');
    const confirmModalClose = document.getElementById('confirmModalClose');
    const confirmModalCancel = document.getElementById('confirmModalCancel');
    const confirmModalConfirm = document.getElementById('confirmModalConfirm');

    let currentAction = null;

    function openConfirmModal(options) {
        const { title, message, action, isDanger = false, confirmText = 'Confirm' } = options;

        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmModalConfirm.textContent = confirmText;
        currentAction = action;

        // Danger styling
        if (isDanger) {
            confirmModalHeader.classList.add('danger');
            confirmModalConfirm.classList.remove('admin-btn-primary');
            confirmModalConfirm.classList.add('admin-btn-danger');
        } else {
            confirmModalHeader.classList.remove('danger');
            confirmModalConfirm.classList.remove('admin-btn-danger');
            confirmModalConfirm.classList.add('admin-btn-primary');
        }

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

    // تأكيد الإجراء
    if (confirmModalConfirm) {
        confirmModalConfirm.addEventListener('click', () => {
            if (currentAction) currentAction();
            closeConfirmModal();
        });
    }

    // ============================================
    // 3. Edit User
    // ============================================
    if (editUserBtn) {
        editUserBtn.addEventListener('click', () => {
            showAdminNotification('Opening edit form... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 4. Send Message
    // ============================================
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', () => {
            showAdminNotification('Opening chat with Ahmad Ali...', 'info');
        });
    }

    // ============================================
    // 5. Suspend Account
    // ============================================
    if (suspendBtn) {
        suspendBtn.addEventListener('click', () => {
            openConfirmModal({
                title: '⚠️ Suspend Account',
                message: 'Are you sure you want to suspend Ahmad Ali\'s account? They won\'t be able to log in until you reactivate it.',
                confirmText: 'Suspend Account',
                isDanger: true,
                action: () => {
                    // تحديث الحالة في الواجهة
                    const statusBadge = document.querySelector('.user-details-meta .admin-badge-success');
                    if (statusBadge) {
                        statusBadge.className = 'admin-badge admin-badge-warning';
                        statusBadge.textContent = '● Suspended';
                    }
                    const statusDot = document.querySelector('.user-details-status');
                    if (statusDot) {
                        statusDot.classList.remove('online');
                        statusDot.classList.add('offline');
                    }
                    showAdminNotification('User account suspended.', 'success');
                }
            });
        });
    }

    // ============================================
    // 6. Delete User
    // ============================================
    if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', () => {
            openConfirmModal({
                title: '🗑️ Delete User',
                message: 'Are you sure you want to permanently delete Ahmad Ali? This action cannot be undone. All their data will be removed.',
                confirmText: 'Delete Permanently',
                isDanger: true,
                action: () => {
                    showAdminNotification('User deleted successfully.', 'success');
                    setTimeout(() => {
                        window.location.href = 'manage-users.html';
                    }, 1200);
                }
            });
        });
    }

});