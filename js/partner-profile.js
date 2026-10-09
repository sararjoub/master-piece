/* ============================================
   ===== PARTNER PROFILE PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. زر "Send Exchange Request"
    // ============================================
    const sendRequestBtn = document.getElementById('sendRequestBtn');

    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', () => {
            showNotification('Opening exchange request form...', 'info');

            setTimeout(() => {
                // ننتقل إلى صفحة إرسال الطلب
                window.location.href = 'exchange-request.html?partner=ahmad-hassan';
            }, 800);
        });
    }

    // ============================================
    // 2. دالة التنبيهات
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