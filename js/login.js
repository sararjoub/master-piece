

document.addEventListener('DOMContentLoaded', () => {

    
    // . إظهار/إخفاء كلمة المرور
    let togglePassword = document.getElementById('togglePassword');
    let passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            let type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // 2. إرسال النموذج

    let loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let email = document.getElementById('email').value.trim();
            let password = passwordInput.value;

            // التحقق من الحقول
            if (!email || !password) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // ✅ هنا لاحقاً سيتم إرسال البيانات إلى الـ Backend
            // حالياً: نعرض رسالة نجاح وننتقل للـ dashboard

            let submitBtn = loginForm.querySelector('button[type="submit"]');
            let originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            // محاكاة الاتصال بالسيرفر
            setTimeout(() => {
                showNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);
            }, 1200);
        });
    }


    //  التحقق من صحة البريد الإلكتروني

    function isValidEmail(email) {
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // دالة عرض التنبيهات
    function showNotification(message, type = 'info') {
        // إزالة أي تنبيه قديم
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
        }, 3000);
    }

    //  تأثير عند التركيز على الحقول
    let allInputs = document.querySelectorAll('.form-input');
    allInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.01)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });


    // أزرار التواصل الاجتماعي (Placeholder)
    let socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            let provider = btn.textContent.trim();
            showNotification(`${provider} login coming soon!`, 'info');
           
        });
    });

});