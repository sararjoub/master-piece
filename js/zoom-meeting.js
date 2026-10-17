
document.addEventListener('DOMContentLoaded', () => {

    // 1. عناصر الصفحة
    let startZoomBtn = document.getElementById('startZoomBtn');
    let zoomPlaceholder = document.getElementById('zoomPlaceholder');
    let zoomMeetingContainer = document.getElementById('zoomMeetingContainer');
    let meetingStatusBadge = document.getElementById('meetingStatusBadge');
    let toggleMicBtn = document.getElementById('toggleMicBtn');
    let toggleCamBtn = document.getElementById('toggleCamBtn');
    let toggleShareBtn = document.getElementById('toggleShareBtn');
    let leaveMeetingBtn = document.getElementById('leaveMeetingBtn');

    // 2. زر بدء الاجتماع
    if (startZoomBtn) {
        startZoomBtn.addEventListener('click', () => {
            // ✅ لاحقاً: هنا سيتم استدعاء Zoom SDK الحقيقي بعد جلب الـ Signature من الباك إند
            // حالياً: نعرض Placeholder

            showNotification('Preparing your Zoom meeting...', 'info');

            // إخفاء الـ Placeholder
            zoomPlaceholder.style.display = 'none';

            // تحديث حالة الاجتماع
            meetingStatusBadge.classList.add('live');
            meetingStatusBadge.innerHTML = `
                <span class="status-dot"></span>
                Meeting In Progress
            `;

            // عرض Placeholder للاجتماع الجاري (سيتم استبداله بـ Zoom SDK لاحقاً)
            zoomMeetingContainer.innerHTML = `
                <div class="zoom-live-placeholder">
                    <div class="zoom-live-icon">🎥</div>
                    <h3>Meeting Started</h3>
                    <p>You are now connected to the Zoom meeting.</p>
                    <p class="zoom-live-note">(This is a preview. Real Zoom integration will be added with the backend.)</p>
                    <div class="zoom-live-participants">
                        <div class="live-participant">
                            <div class="live-participant-avatar">AH</div>
                            <span>You (Host)</span>
                        </div>
                        <div class="live-participant">
                            <div class="live-participant-avatar">LK</div>
                            <span>Lana Khalid</span>
                        </div>
                    </div>
                </div>
            `;

            // تفعيل أزرار التحكم
            enableControls(true);

            showNotification('Meeting started successfully! ✓', 'success');
        });
    }

    // 3. أزرار التحكم
    function enableControls(enabled) {
        let controls = [toggleMicBtn, toggleCamBtn, toggleShareBtn, leaveMeetingBtn];
        controls.forEach(btn => {
            if (btn) btn.disabled = !enabled;
        });
    }

    // تعطيل الأزرار في البداية
    enableControls(false);

    // 4. زر الميكروفون
    if (toggleMicBtn) {
        toggleMicBtn.addEventListener('click', () => {
            toggleMicBtn.classList.toggle('active');
            let isActive = toggleMicBtn.classList.contains('active');
            showNotification(isActive ? 'Microphone muted' : 'Microphone unmuted', 'info');
        });
    }

    // 5. زر الكاميرا
    if (toggleCamBtn) {
        toggleCamBtn.addEventListener('click', () => {
            toggleCamBtn.classList.toggle('active');
            let isActive = toggleCamBtn.classList.contains('active');
            showNotification(isActive ? 'Camera off' : 'Camera on', 'info');
        });
    }

    // 6. زر المشاركة
    if (toggleShareBtn) {
        toggleShareBtn.addEventListener('click', () => {
            showNotification('Screen sharing will be available with the Zoom SDK.', 'info');
        });
    }

    // 7. زر الخروج

    if (leaveMeetingBtn) {
        leaveMeetingBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to leave the meeting?')) {
                showNotification('Leaving meeting...', 'info');

                setTimeout(() => {
                    // ✅ لاحقاً: سيتم استدعاء Zoom SDK لإنهاء الاجتماع
                    window.location.href = 'chat.html';
                }, 800);
            }
        });
    }


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