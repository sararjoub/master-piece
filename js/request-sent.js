/* ============================================
   ===== REQUEST SENT PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. زر "View My Requests"
    // ============================================
    const viewRequestsBtn = document.getElementById('viewRequestsBtn');

    if (viewRequestsBtn) {
        viewRequestsBtn.addEventListener('click', () => {
            showNotification('Loading your requests...', 'info');

            setTimeout(() => {
                window.location.href = 'swap-requests.html';
            }, 700);
        });
    }

    // ============================================
    // 2. زر "Back to Home"
    // ============================================
    const backHomeBtn = document.getElementById('backHomeBtn');

    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', () => {
            showNotification('Going back to home...', 'info');

            setTimeout(() => {
                window.location.href = 'home.html';
            }, 700);
        });
    }

    // ============================================
    // 3. تأثير عند النقر على Timeline
    // ============================================
    const timelineSteps = document.querySelectorAll('.timeline-step');

    timelineSteps.forEach(step => {
        step.addEventListener('click', () => {
            if (step.classList.contains('active')) {
                showNotification('Request sent ✓', 'success');
            } else {
                showNotification('This step is still pending...', 'info');
            }
        });
        step.style.cursor = 'pointer';
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