/* ============================================
   ===== ADMIN LOGIN PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const loginForm = document.getElementById('adminLoginForm');
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    const togglePassword = document.getElementById('toggleAdminPassword');
    const loginBtn = document.getElementById('adminLoginBtn');

    // ============================================
    // 2. إظهار/إخفاء كلمة المرور
    // ============================================
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // ============================================
    // 3. التحقق من صحة البريد
    // ============================================
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ============================================
    // 4. إرسال النموذج
    // ============================================
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // التحقق
            if (!email || !password) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            if (password.length < 6) {
                showNotification('Password must be at least 6 characters.', 'error');
                return;
            }

            // تأثير التحميل
            const btnText = loginBtn.querySelector('span:first-child');
            const originalText = btnText.textContent;
            btnText.textContent = 'Logging in...';
            loginBtn.disabled = true;
            loginBtn.style.opacity = '0.7';

            showNotification('Authenticating...', 'info');

            // ✅ لاحقاً: سيتم إرسال البيانات للـ API
            setTimeout(() => {
                btnText.textContent = '✓ Success!';

                showNotification('Welcome back, Admin! ✓', 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            }, 1200);
        });
    }

    // ============================================
    // 5. تأثير عند التركيز
    // ============================================
    const inputs = document.querySelectorAll('.admin-form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.01)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // ============================================
    // 6. دالة التنبيهات
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
        }, 2500);
    }

});