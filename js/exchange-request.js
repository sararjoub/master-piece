/* ============================================
   ===== EXCHANGE REQUEST PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. اختيار الـ Chips (Teach, Learn, Time)
    // ============================================
    const allChipGroups = document.querySelectorAll('.choice-chips, .time-chips');

    allChipGroups.forEach(group => {
        const chips = group.querySelectorAll('.chip');

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                // إزالة التحديد من كل الـ chips في نفس المجموعة
                chips.forEach(c => c.classList.remove('selected'));
                // تحديد الـ chip المضغوط
                chip.classList.add('selected');
            });
        });
    });

    // ============================================
    // 2. اختيار افتراضي مسبقاً (من الـ Mockup)
    // ============================================
    // تحديد "Graphic Design" كافتراضي في "What can you teach"
    const teachGroup = document.querySelector('[data-name="teach"]');
    if (teachGroup) {
        const defaultTeach = teachGroup.querySelector('[data-value="Graphic Design"]');
        if (defaultTeach) defaultTeach.classList.add('selected');
    }

    // تحديد "Web Development" كافتراضي في "What do you want to learn"
    const learnGroup = document.querySelector('[data-name="learn"]');
    if (learnGroup) {
        const defaultLearn = learnGroup.querySelector('[data-value="Web Development"]');
        if (defaultLearn) defaultLearn.classList.add('selected');
    }

    // تحديد "Weekdays 5–8 PM" كافتراضي في "Preferred time"
    const timeGroup = document.querySelector('[data-name="time"]');
    if (timeGroup) {
        const defaultTime = timeGroup.querySelector('[data-value="Weekdays 5–8 PM"]');
        if (defaultTime) defaultTime.classList.add('selected');
    }

    // ============================================
    // 3. زر "Cancel"
    // ============================================
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
                window.location.href = 'partner-profile.html?partner=ahmad-hassan';
            }
        });
    }

    // ============================================
    // 4. إرسال النموذج
    // ============================================
    const exchangeForm = document.getElementById('exchangeForm');
    const submitBtn = document.getElementById('submitBtn');

    if (exchangeForm) {
        exchangeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // جلب القيم المختارة
            const teachChip = document.querySelector('[data-name="teach"] .chip.selected');
            const learnChip = document.querySelector('[data-name="learn"] .chip.selected');
            const timeChip = document.querySelector('[data-name="time"] .chip.selected');
            const message = document.getElementById('message').value.trim();

            // التحقق من الحقول
            if (!teachChip) {
                showNotification('Please select a skill you can teach.', 'error');
                return;
            }

            if (!learnChip) {
                showNotification('Please select a skill you want to learn.', 'error');
                return;
            }

            if (!timeChip) {
                showNotification('Please select your preferred time.', 'error');
                return;
            }

            if (!message) {
                showNotification('Please write a message.', 'error');
                return;
            }

            // ✅ هنا لاحقاً سيتم إرسال البيانات إلى الـ Backend
            // حالياً: نعرض رسالة نجاح وننتقل للصفحة التالية

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                showNotification('Request sent successfully!', 'success');

                setTimeout(() => {
                    window.location.href = 'request-sent.html?partner=ahmad-hassan';
                }, 1200);
            }, 1000);
        });
    }

    // ============================================
    // 5. دالة التنبيهات
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
    // 6. Magnetic Hover Effect (انجذاب البطاقة للماوس)
    // ============================================
    const partnerCard = document.querySelector('.partner-summary-card');
    
    if (partnerCard && window.innerWidth > 992) {
        partnerCard.addEventListener('mousemove', (e) => {
            const rect = partnerCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // حساب الإزاحة (بحد أقصى 8px)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const moveX = ((x - centerX) / centerX) * 6;
            const moveY = ((y - centerY) / centerY) * 6;
            
            partnerCard.style.transform = `translate(${moveX}px, ${moveY - 6}px)`;
        });
        
        partnerCard.addEventListener('mouseleave', () => {
            partnerCard.style.transform = '';
        });
    }

    // ============================================
    // 7. Avatar Click Effect (تأثير عند النقر)
    // ============================================
    const summaryAvatar = document.querySelector('.summary-avatar');
    
    if (summaryAvatar) {
        summaryAvatar.style.cursor = 'pointer';
        summaryAvatar.addEventListener('click', () => {
            summaryAvatar.style.animation = 'none';
            summaryAvatar.offsetHeight;
            summaryAvatar.style.animation = '';
            
            // تأثير موجة
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
                animation: avatarRipple 0.8s ease-out;
                pointer-events: none;
            `;
            summaryAvatar.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 800);
            
            showNotification('Viewing Ahmad\'s full profile...', 'info');
        });
    }

    // ============================================
    // 8. Pulse on Rating Click
    // ============================================
    const summaryRating = document.querySelector('.summary-rating');
    
    if (summaryRating) {
        summaryRating.style.cursor = 'pointer';
        summaryRating.addEventListener('click', () => {
            showNotification('Loading reviews...', 'info');
        });
    }