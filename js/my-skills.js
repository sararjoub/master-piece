/* ============================================
   ===== MY SKILLS PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. نظام الـ Tabs
    // ============================================
    const tabs = document.querySelectorAll('.skills-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));

            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ============================================
    // 2. Modal - إضافة مهارة جديدة
    // ============================================
    const addSkillBtn = document.getElementById('addSkillBtn');
    const addTeachSkill = document.getElementById('addTeachSkill');
    const addLearnSkill = document.getElementById('addLearnSkill');
    const modal = document.getElementById('addSkillModal');
    const closeModal = document.getElementById('closeModal');
    const cancelAdd = document.getElementById('cancelAdd');
    const confirmAdd = document.getElementById('confirmAdd');

    let currentSkillType = 'teach'; // teach or learn

    // فتح Modal
    function openModal(type = 'teach') {
        currentSkillType = type;
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    // إغلاق Modal
    function closeModalFn() {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            resetModalFields();
        }
    }

    function resetModalFields() {
        document.getElementById('modalCategory').value = '';
        document.getElementById('modalSkillName').value = '';
        document.getElementById('modalLevel').value = 'beginner';
        document.getElementById('modalExperience').value = '';
    }

    // ربط الأزرار
    if (addSkillBtn) addSkillBtn.addEventListener('click', () => openModal('teach'));
    if (addTeachSkill) addTeachSkill.addEventListener('click', () => openModal('teach'));
    if (addLearnSkill) addLearnSkill.addEventListener('click', () => openModal('learn'));
    if (closeModal) closeModal.addEventListener('click', closeModalFn);
    if (cancelAdd) cancelAdd.addEventListener('click', closeModalFn);

    // إغلاق عند النقر على Overlay
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModalFn();
        });
    }

    // إغلاق بـ Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModalFn();
        }
    });

    // ============================================
    // 3. إضافة مهارة جديدة
    // ============================================
    if (confirmAdd) {
        confirmAdd.addEventListener('click', () => {
            const category = document.getElementById('modalCategory').value;
            const skillName = document.getElementById('modalSkillName').value.trim();
            const level = document.getElementById('modalLevel').value;
            const experience = document.getElementById('modalExperience').value.trim();

            // التحقق
            if (!category) {
                showNotification('Please select a category.', 'error');
                return;
            }

            if (!skillName) {
                showNotification('Please enter a skill name.', 'error');
                return;
            }

            // تحديد الشبكة المستهدفة
            const targetGrid = currentSkillType === 'teach' 
                ? document.getElementById('teachGrid')
                : document.getElementById('learnGrid');

            // تحديد الـ Badge حسب المستوى
            const badgeClasses = {
                'beginner': 'badge-primary',
                'intermediate': 'badge-info',
                'advanced': 'badge-warning'
            };
            const badgeLabels = {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate',
                'advanced': 'Advanced'
            };

            // إنشاء البطاقة الجديدة
            const newCard = document.createElement('div');
            newCard.className = 'my-skill-card animate-scale-in' + (currentSkillType === 'learn' ? ' learn-card' : '');
            newCard.innerHTML = `
                <div class="skill-card-header">
                    <div class="skill-card-icon skill-icon-technology">🎯</div>
                    <div class="skill-card-actions">
                        ${currentSkillType === 'teach' 
                            ? '<button class="skill-action-btn edit-btn" title="Edit">✏️</button>' 
                            : ''}
                        <button class="skill-action-btn delete-btn" title="Delete">🗑️</button>
                    </div>
                </div>
                <h3 class="skill-card-title">${escapeHtml(skillName)}</h3>
                <p class="skill-card-category">${getCategoryName(category)}</p>
                <div class="skill-card-footer">
                    <span class="badge ${badgeClasses[level]}">${badgeLabels[level]}</span>
                    ${experience ? `<span class="skill-experience">${escapeHtml(experience)}</span>` : ''}
                </div>
            `;

            // إضافة البطاقة قبل زر "Add Skill"
            const addCard = targetGrid.querySelector('.add-skill-card');
            targetGrid.insertBefore(newCard, addCard);

            // ربط الأزرار الجديدة
            attachCardActions(newCard);

            // تحديث العداد
            updateCounts();

            // إغلاق Modal
            closeModalFn();

            // إشعار
            showNotification(`Skill "${skillName}" added successfully!`, 'success');
        });
    }

    // ============================================
    // 4. حذف بطاقة
    // ============================================
    function attachCardActions(card) {
        const deleteBtn = card.querySelector('.delete-btn');
        const editBtn = card.querySelector('.edit-btn');

        if (deleteBtn && !deleteBtn.dataset.bound) {
            deleteBtn.dataset.bound = 'true';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const skillName = card.querySelector('.skill-card-title').textContent;
                
                if (confirm(`Remove "${skillName}"?`)) {
                    card.style.transition = 'all 0.4s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8) translateY(-20px)';
                    
                    setTimeout(() => {
                        card.remove();
                        updateCounts();
                        showNotification(`"${skillName}" removed.`, 'info');
                    }, 400);
                }
            });
        }

        if (editBtn && !editBtn.dataset.bound) {
            editBtn.dataset.bound = 'true';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const skillName = card.querySelector('.skill-card-title').textContent;
                showNotification(`Editing "${skillName}"...`, 'info');
            });
        }
    }

    // ربط الأزرار لكل البطاقات الحالية
    document.querySelectorAll('.my-skill-card').forEach(card => {
        attachCardActions(card);
    });

    // ============================================
    // 5. تحديث العدادات
    // ============================================
    function updateCounts() {
        const teachCount = document.querySelectorAll('#teachGrid .my-skill-card').length;
        const learnCount = document.querySelectorAll('#learnGrid .my-skill-card').length;

        const teachCountEl = document.getElementById('teachCount');
        const learnCountEl = document.getElementById('learnCount');

        if (teachCountEl) teachCountEl.textContent = teachCount;
        if (learnCountEl) learnCountEl.textContent = learnCount;
    }

    // ============================================
    // 6. اسم التصنيف بالعربي/الإنجليزية
    // ============================================
    function getCategoryName(key) {
        const names = {
            'technology': 'Technology',
            'education': 'Education',
            'handmade': 'Handmade',
            'entertainment': 'Entertainment',
            'business': 'Business',
            'health': 'Health & Fitness'
        };
        return names[key] || key;
    }

    // ============================================
    // 7. حماية XSS
    // ============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // 8. دالة التنبيهات
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

    // ============================================
    // 9. تحديث العدادات عند التحميل
    // ============================================
    updateCounts();

});