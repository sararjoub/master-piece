/* ============================================
   ===== CAREER PATH SETUP - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const steps = document.querySelectorAll('.setup-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const goalOptions = document.querySelectorAll('.goal-option');

    let currentStep = 1;
    const totalSteps = 3;

    // ============================================
    // 2. اختيار الهدف (Step 1)
    // ============================================
    goalOptions.forEach(option => {
        option.addEventListener('click', () => {
            goalOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            nextBtn.disabled = false;
        });
    });

    // في البداية، Next معطل حتى يختار المستخدم هدفه
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
    nextBtn.style.cursor = 'not-allowed';

    // مراقبة اختيار الهدف
    const goalObserver = new MutationObserver(() => {
        const hasSelection = document.querySelector('.goal-option.selected');
        if (hasSelection) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    });

    goalOptions.forEach(option => {
        goalObserver.observe(option, { attributes: true, attributeFilter: ['class'] });
    });

    // ============================================
    // 3. التنقل بين الخطوات
    // ============================================
    nextBtn.addEventListener('click', () => {
        // التحقق من اختيار الهدف في الخطوة 1
        if (currentStep === 1) {
            const selectedGoal = document.querySelector('.goal-option.selected');
            if (!selectedGoal) {
                showNotification('Please select a career goal first.', 'error');
                return;
            }
        }

        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
        } else {
            // الخطوة الأخيرة: توليد المسار
            generateCareerPath();
        }
    });

    backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    // ============================================
    // 4. تحديث الواجهة حسب الخطوة
    // ============================================
    function updateStep() {
        // إخفاء كل الخطوات
        steps.forEach(step => step.classList.remove('active'));
        
        // إظهار الخطوة الحالية
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // تحديث Progress Steps
        progressSteps.forEach((ps, index) => {
            ps.classList.remove('active', 'completed');
            const stepNum = index + 1;
            
            if (stepNum < currentStep) {
                ps.classList.add('completed');
                const numberEl = ps.querySelector('.progress-step-number');
                if (numberEl) numberEl.textContent = '✓';
            } else if (stepNum === currentStep) {
                ps.classList.add('active');
                const numberEl = ps.querySelector('.progress-step-number');
                if (numberEl) numberEl.textContent = stepNum;
            }
        });

        // تحديث Progress Lines
        progressLines.forEach((line, index) => {
            if (index < currentStep - 1) {
                line.style.backgroundColor = 'var(--success)';
            } else {
                line.style.backgroundColor = 'var(--border-light)';
            }
        });

        // تحديث الأزرار
        if (currentStep === 1) {
            backBtn.classList.add('hidden');
        } else {
            backBtn.classList.remove('hidden');
        }

        if (currentStep === totalSteps) {
            nextBtn.innerHTML = '🎯 Generate My Career Path';
        } else {
            nextBtn.innerHTML = 'Next Step →';
        }

        // Scroll للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================
    // 5. توليد المسار (الخطوة النهائية)
    // ============================================
    function generateCareerPath() {
        const selectedGoal = document.querySelector('.goal-option.selected');
        const selectedLevel = document.querySelector('input[name="level"]:checked');
        const selectedTime = document.querySelector('input[name="time"]:checked');

        if (!selectedGoal) {
            showNotification('Please select a career goal.', 'error');
            return;
        }

        // جمع البيانات
        const goal = selectedGoal.dataset.goal;
        const goalName = selectedGoal.querySelector('h3').textContent;
        const level = selectedLevel ? selectedLevel.value : 'beginner';
        const time = selectedTime ? selectedTime.value : 'moderate';

        // ✅ هنا لاحقاً: سيتم إرسال البيانات إلى الـ AI/Backend
        // حالياً: نعرض رسالة تحميل ثم ننتقل

        nextBtn.innerHTML = '⏳ Generating...';
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.7';

        showNotification('Analyzing your preferences...', 'info');

        setTimeout(() => {
            showNotification(`Creating personalized path for "${goalName}"...`, 'info');
        }, 800);

        setTimeout(() => {
            showNotification('Career path ready! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = `career-path.html?goal=${goal}&level=${level}&time=${time}`;
            }, 1000);
        }, 2000);
    }

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
        }, 2200);
    }

});