

document.addEventListener('DOMContentLoaded', () => {

    // 1. Progress Bar Animation (عند التحميل)
    let progressFill = document.getElementById('progressFill');

    if (progressFill) {
        // تأخير بسيط لبدء الأنيميشن
        setTimeout(() => {
            progressFill.style.width = '35%';
        }, 300);
    }

    // 2. أزرار "Continue Learning"
    let continueButtons = document.querySelectorAll('.continue-btn');

    continueButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let skill = btn.dataset.skill;
            showNotification(`Continuing ${skill.replace(/-/g, ' ')}...`, 'info');

            setTimeout(() => {
                window.location.href = `skill-details.html?skill=${skill}`;
            }, 800);
        });
    });

    // 3. زر "Change Goal"
    let changeGoalBtn = document.getElementById('changeGoalBtn');

    if (changeGoalBtn) {
        changeGoalBtn.addEventListener('click', () => {
            if (confirm('Changing your goal will reset your progress. Are you sure?')) {
                showNotification('Opening goal selection...', 'info');
                setTimeout(() => {
                    window.location.href = 'career-path-setup.html';
                }, 800);
            }
        });
    }

    // 4. النقر على Milestone مكتمل
    let completedMilestones = document.querySelectorAll('.milestone.completed');

    completedMilestones.forEach(milestone => {
        milestone.style.cursor = 'pointer';
        milestone.addEventListener('click', (e) => {
            if (e.target.closest('.continue-btn')) return;
            
            let title = milestone.querySelector('h3')?.textContent || '';
            showNotification(`Viewing "${title}" details...`, 'info');
        });
    });

    // 5. النقر على Milestone مقفل
    let lockedMilestones = document.querySelectorAll('.milestone.locked');

    lockedMilestones.forEach(milestone => {
        milestone.addEventListener('click', () => {
            let title = milestone.querySelector('h3')?.textContent || '';
            showNotification(`🔒 "${title}" is locked. Complete previous milestones first.`, 'info');
        });
    });

    // 6. Count-up للـ Progress Stats

    let statValues = document.querySelectorAll('.progress-stat-value');

    let animateCountUp = (element, target) => {
        let duration = 1000;
        let startTime = performance.now();

        let animate = (currentTime) => {
            let elapsed = currentTime - startTime;
            let progress = Math.min(elapsed / duration, 1);
            let eased = 1 - (1 - progress) * (1 - progress);
            let current = Math.floor(target * eased);
            
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(animate);
    };

    let statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let el = entry.target;
                if (!el.dataset.animated) {
                    el.dataset.animated = 'true';
                    let target = parseInt(el.textContent) || 0;
                    el.textContent = '0';
                    animateCountUp(el, target);
                }
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    statValues.forEach(el => statsObserver.observe(el));

    
    function showNotification(message, type = 'info') {
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
        }, 2200);
    }

});