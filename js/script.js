/* ============================================
   ===== HERO VIDEO FADE LOOP (اختياري) =====
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.hero-bg-video');
    if (!video) return;

    let rafId = null;
    let isFadingOut = false;

    /**
     * دالة التلاشي باستخدام requestAnimationFrame
     */
    const fadeTo = (targetOpacity, duration = 600) => {
        if (rafId) cancelAnimationFrame(rafId);

        const startOpacity = parseFloat(video.style.opacity || '1');
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
            
            video.style.opacity = currentOpacity.toString();

            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
            }
        };

        rafId = requestAnimationFrame(animate);
    };

    // إزالة loop لأننا سنتحكم بالتكرار يدوياً
    video.removeAttribute('loop');

    // عند اقتراب النهاية: تلاشي للاختفاء
    video.addEventListener('timeupdate', () => {
        if (video.duration && video.duration - video.currentTime <= 0.6 && !isFadingOut) {
            isFadingOut = true;
            fadeTo(0, 600);
        }
    });

    // عند انتهاء الفيديو: إعادة التشغيل + تلاشي للظهور
    video.addEventListener('ended', () => {
        video.style.opacity = '0';
        
        setTimeout(() => {
            video.currentTime = 0;
            video.play().catch(err => console.log('Replay error:', err));
            fadeTo(1, 600);
            isFadingOut = false;
        }, 150);
    });

    // في حال كان الفيديو جاهزاً مسبقاً
    if (video.readyState >= 3) {
        video.style.opacity = '1';
    }
});