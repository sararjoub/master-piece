document.addEventListener('DOMContentLoaded', () => {

    // 1. محاكاة جلب اسم المستخدم (لاحقاً من الباك إند)
    let userName = localStorage.getItem('userName') || 'Ahmad';
    let userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = userName;
    }

    // 2. تأثير الـ Confetti (الاحتفال)
    let confettiContainer = document.getElementById('confetti-container');
    let colors = ['#8b7cf6', '#a78bfa', '#ec4899', '#10b981', '#fbbf24', '#3b82f6'];
    
    function createConfetti() {
        if (!confettiContainer) return;

        for (let i = 0; i < 50; i++) {
            let confetti = document.createElement('div');
            confetti.classList.add('confetti-piece');
            
            // خصائص عشوائية
            let color = colors[Math.floor(Math.random() * colors.length)];
            let left = Math.random() * 100;
            let animationDuration = Math.random() * 2 + 2; // 2-4 ثواني
            let delay = Math.random() * 0.5;
            let size = Math.random() * 8 + 6;

            confetti.style.backgroundColor = color;
            confetti.style.left = `${left}%`;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.animationDuration = `${animationDuration}s`;
            confetti.style.animationDelay = `${delay}s`;
            
            // أشكال مختلفة (دائرة أو مربع)
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }

            confettiContainer.appendChild(confetti);

            // إزالة العنصر بعد انتهاء الأنيميشن
            setTimeout(() => {
                confetti.remove();
            }, (animationDuration + delay) * 1000);
        }
    }

    // تشغيل الـ Confetti عند فتح الصفحة
    setTimeout(createConfetti, 300);
});