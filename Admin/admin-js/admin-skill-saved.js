/* ============================================
   ===== SKILL SAVED PAGE - JavaScript =====
   ===== تأثير Confetti (اختياري) =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. Confetti Effect (احتفال بسيط)
    // ============================================
    function createConfetti() {
        const colors = ['#8b7cf6', '#10b981', '#fbbf24', '#3b82f6', '#ec4899'];
        const confettiCount = 30;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -20px;
                left: ${Math.random() * 100}%;
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                opacity: 0;
                pointer-events: none;
                z-index: 9999;
                animation: confettiFall ${Math.random() * 2 + 2}s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }
    }

    // تشغيل الـ Confetti بعد تحميل الصفحة
    setTimeout(createConfetti, 600);
});

// ===== Confetti Animation =====
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
        }
    }
`;
document.head.appendChild(style);