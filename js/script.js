/* HERO VIDEO FADE LOOP (اختياري)  */
document.addEventListener('DOMContentLoaded', () => {
    let video = document.querySelector('.hero-bg-video');
    if (!video) return;

    let rafId = null;
    let isFadingOut = false;

    /**
    / * دالة التلاشي باستخدام requestAnimationFrame*/
     
    let fadeTo = (targetOpacity, duration = 600) => {
        if (rafId) cancelAnimationFrame(rafId);

        let startOpacity = parseFloat(video.style.opacity || '1');
        let startTime = performance.now();

        let animate = (currentTime) => {
            let elapsed = currentTime - startTime;
            let progress = Math.min(elapsed / duration, 1);
            let currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
            
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

/* 2. SCROLL REVEAL ANIMATIONS  */
document.addEventListener('DOMContentLoaded', () => {
    let observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    let revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
});


/* 3. MAIN CATEGORY MODAL LOGIC  */
document.addEventListener('DOMContentLoaded', () => {
    let categoryModal = document.getElementById('categoryModal');
    let closeCategoryModal = document.getElementById('closeCategoryModal');
    let modalCategoryTitle = document.getElementById('modalCategoryTitle');
    let modalCategoryIcon = document.getElementById('modalCategoryIcon');
    
    // دالة لفتح النافذة
    function openCategoryModal(categoryKey, categoryName, icon) {
        if (!categoryModal) return;

        if (modalCategoryTitle) modalCategoryTitle.textContent = categoryName;
        if (modalCategoryIcon) modalCategoryIcon.textContent = icon;

        let allGrids = document.querySelectorAll('.sub-category-grid');
        allGrids.forEach(grid => grid.classList.add('hidden'));

        let targetGrid = document.getElementById(`sub-${categoryKey}`);
        if (targetGrid) {
            targetGrid.classList.remove('hidden');
        }

        categoryModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // دالة لإغلاق النافذة
    function closeModalFn() {
        if (!categoryModal) return;
        categoryModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ربط بطاقات الفئات الرئيسية
    let categoryCards = document.querySelectorAll('.categories .category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            
            let categoryName = card.querySelector('h3').textContent;
            let icon = card.querySelector('.cat-icon').textContent;
            let categoryKey = categoryName.toLowerCase().split(' ')[0]; 

            openCategoryModal(categoryKey, `${categoryName} Skills`, icon);
        });
    });

    // إغلاق النافذة
    if (closeCategoryModal) closeCategoryModal.addEventListener('click', closeModalFn);

    if (categoryModal) {
        categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) closeModalFn();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && categoryModal && !categoryModal.classList.contains('hidden')) {
            closeModalFn();
        }
    });
});

