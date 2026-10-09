/* ============================================
   ===== SIGN UP PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. إظهار/إخفاء كلمة المرور
    // ============================================
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // ============================================
    // 2. مؤشر قوة كلمة المرور
    // ============================================
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', () => {
            const value = passwordInput.value;
            const strength = calculateStrength(value);

            // إزالة الأصناف القديمة
            strengthFill.classList.remove('weak', 'medium', 'strong');

            if (value.length === 0) {
                strengthFill.style.width = '0%';
                strengthText.textContent = 'Password strength';
                strengthText.style.color = 'var(--text-light)';
            } else if (strength === 'weak') {
                strengthFill.classList.add('weak');
                strengthText.textContent = 'Weak';
                strengthText.style.color = 'var(--danger)';
            } else if (strength === 'medium') {
                strengthFill.classList.add('medium');
                strengthText.textContent = 'Medium';
                strengthText.style.color = 'var(--warning)';
            } else {
                strengthFill.classList.add('strong');
                strengthText.textContent = 'Strong';
                strengthText.style.color = 'var(--success)';
            }
        });
    }

    /**
     * حساب قوة كلمة المرور
     */
    function calculateStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    }

    // ============================================
    // 3. التحقق من تطابق كلمتي المرور
    // ============================================
    const confirmPassword = document.getElementById('confirmPassword');

    if (confirmPassword && passwordInput) {
        confirmPassword.addEventListener('input', () => {
            if (confirmPassword.value && confirmPassword.value !== passwordInput.value) {
                confirmPassword.style.borderColor = 'var(--danger)';
            } else {
                confirmPassword.style.borderColor = 'var(--border-light)';
            }
        });
    }

    // ============================================
    // 4. إرسال النموذج
    // ============================================
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirm = confirmPassword.value;
            const terms = document.getElementById('terms').checked;

            // التحقق من الحقول
            if (!fullName || !email || !password || !confirm) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            if (password !== confirm) {
                showNotification('Passwords do not match.', 'error');
                return;
            }

            if (password.length < 8) {
                showNotification('Password must be at least 8 characters.', 'error');
                return;
            }

            if (!terms) {
                showNotification('Please agree to the Terms of Service.', 'error');
                return;
            }

            // ✅ هنا لاحقاً سيتم إرسال البيانات إلى الـ Backend
            // حالياً: نعرض رسالة نجاح وننتقل للصفحة التالية

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            // محاكاة الاتصال بالسيرفر
            setTimeout(() => {
                showNotification('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }, 1200);
        });
    }

    // ============================================
    // 5. دالة عرض التنبيهات
    // ============================================
    function showNotification(message, type = 'info') {
        // إنشاء عنصر التنبيه
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span class="notification-message">${message}</span>
        `;

        document.body.appendChild(notification);

        // إظهار التنبيه
        setTimeout(() => notification.classList.add('show'), 10);

        // إخفاء التنبيه بعد 3 ثوانٍ
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============================================
    // 6. تأثير عند التركيز على الحقول (اختياري)
    // ============================================
    const allInputs = document.querySelectorAll('.form-input');
    allInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.01)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

});