
document.addEventListener('DOMContentLoaded', () => {

    // 1. منطق التنقل بين الخطوات
    window.goToStep = (stepNumber) => {
        // إخفاء كل الخطوات
        document.querySelectorAll('.setup-step').forEach(step => step.classList.remove('active'));
        // إظهار الخطوة المطلوبة
        document.getElementById(`step-${stepNumber}`).classList.add('active');

        // تحديث شريط التقدم
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            if (stepNum < stepNumber) {
                step.classList.add('completed');
                step.querySelector('.progress-circle').textContent = '✓';
            } else if (stepNum === stepNumber) {
                step.classList.add('active');
            }
        });
        
        // إعادة تعيين النص للخطوة النشطة
        const activeCircle = document.querySelector(`.progress-step[data-step="${stepNumber}"] .progress-circle`);
        if (activeCircle) activeCircle.textContent = stepNumber;
    };

    // 2. اختيار المهارات (Chips)
    document.querySelectorAll('.skill-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
        });
    });

    


    // 4. إنهاء الإعداد
    window.finishSetup = () => {
        const btn = event.target;
        const originalText = btn.innerHTML;
        
        // تأثير التحميل
        btn.innerHTML = 'Saving...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // محاكاة الحفظ (لاحقاً سيتم إرسال البيانات للباك إند)
        setTimeout(() => {
            btn.innerHTML = '✓ Setup Complete!';
            btn.style.background = 'var(--success)';
            
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 1000);
        }, 1200);
    };

    // 5. Avatar Upload Logic

    const avatarInput = document.getElementById('avatarInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const avatarPreview = document.getElementById('avatarPreview');

    // عندما يضغط المستخدم على زر Upload Photo
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            avatarInput.click(); // فتح مستكشف الملفات
        });
    }

    // عندما يختار المستخدم صورة
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            if (file) {
                // التحقق من حجم الصورة (مثلاً أقل من 2 ميجا)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Image is too large. Please choose an image under 2MB.');
                    return;
                }

                // استخدام FileReader لقراءة الصورة
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    // تحديث الـ Avatar بالصورة الجديدة
                    avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Profile Picture">`;
                    avatarPreview.classList.add('has-image'); // إضافة كلاس لتغيير الستايل
                };
                
                reader.readAsDataURL(file); // قراءة الصورة كـ Base64
            }
        });
    }
});