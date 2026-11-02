document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. قائمة المهارات (Mock Data)
    // ============================================
    const allSkills = [
        "Web Development", "HTML5", "CSS3", "JavaScript", "React.js", "Node.js",
        "Python", "Django", "SQL", "MongoDB", "Git & GitHub", "UI/UX Design",
        "Figma", "Data Science", "Machine Learning", "Mobile Development",
        "Flutter", "React Native", "Cybersecurity", "Ethical Hacking",
        "Mathematics", "Physics", "Chemistry", "Biology", "English Language",
        "Arabic Language", "French Language", "IELTS", "TOEFL", "History",
        "Geography", "Painting", "Drawing", "Knitting", "Crochet", "Sewing",
        "DIY Projects", "Photography", "Videography", "Video Editing",
        "Music Production", "Guitar", "Piano", "Singing", "Acting",
        "Digital Marketing", "Social Media Marketing", "SEO", "Copywriting",
        "Sales", "Project Management", "Entrepreneurship", "Finance",
        "Accounting", "Excel", "Yoga", "Pilates", "Personal Training",
        "Nutrition", "Weightlifting", "Meditation", "Public Speaking"
    ];

    let selectedSkillName = ''; // المتغير الذي سيحفظ المهارة

    // ============================================
    // 2. نظام التبويبات (Tabs)
    // ============================================
    let tabs = document.querySelectorAll('.skills-tab');
    let tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            let targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));

            let targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ============================================
    // 3. نافذة إضافة المهارة (Modal)
    // ============================================
    let addSkillBtn = document.getElementById('addSkillBtn');
    let addTeachSkill = document.getElementById('addTeachSkill');
    let addLearnSkill = document.getElementById('addLearnSkill');
    let modal = document.getElementById('addSkillModal');
    let closeModal = document.getElementById('closeModal');
    let cancelAdd = document.getElementById('cancelAdd');
    let confirmAdd = document.getElementById('confirmAdd');

    let currentSkillType = 'teach'; // teach or learn

    function openModal(type = 'teach') {
        currentSkillType = type;
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModalFn() {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            resetModalFields();
        }
    }

    function resetModalFields() {
        document.getElementById('modalCategory').value = '';
        document.getElementById('modalLevel').value = 'beginner';
        document.getElementById('modalExperience').value = '';
        
        // إعادة تعيين القائمة المنسدلة
        let selectedText = document.getElementById('skillSelectedText');
        if (selectedText) {
            selectedText.textContent = 'Select a skill...';
            selectedText.style.color = '#999';
        }
        let searchInput = document.getElementById('skillSearchInput');
        if (searchInput) searchInput.value = '';
        
        selectedSkillName = ''; // مسح المهارة المختارة
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
    // 4. منطق القائمة المنسدلة المخصصة (Custom Dropdown)
    // ============================================
    const trigger = document.getElementById('skillSelectTrigger');
    const optionsBox = document.getElementById('skillOptions');
    const optionsList = document.getElementById('skillOptionsList');
    const searchInput = document.getElementById('skillSearchInput');
    const selectedText = document.getElementById('skillSelectedText');

    function renderOptions(filterText = '') {
        if (!optionsList) return;
        optionsList.innerHTML = '';
        
        const filtered = allSkills.filter(skill => 
            skill.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            optionsList.innerHTML = '<div style="padding: 12px; text-align: center; color: #999;">No skills found</div>';
            return;
        }

        filtered.forEach(skill => {
            const item = document.createElement('div');
            item.className = 'custom-option-item';
            if (skill === selectedSkillName) item.classList.add('selected');
            item.textContent = skill;
            
            item.addEventListener('click', () => {
                selectedSkillName = skill;
                if (selectedText) {
                    selectedText.textContent = skill;
                    selectedText.style.color = 'var(--text-dark)';
                }
                optionsBox.classList.add('hidden');
                trigger.classList.remove('active');
                if (searchInput) searchInput.value = ''; 
            });
            
            optionsList.appendChild(item);
        });
    }

    if (trigger) {
        // فتح/إغلاق القائمة
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = optionsBox.classList.contains('hidden');
            
            if (isHidden) {
                optionsBox.classList.remove('hidden');
                trigger.classList.add('active');
                renderOptions(); // عرض كل الخيارات
                if (searchInput) searchInput.focus();
            } else {
                optionsBox.classList.add('hidden');
                trigger.classList.remove('active');
            }
        });

        // البحث داخل القائمة
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderOptions(e.target.value);
            });
        }

        // إغلاق عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !optionsBox.contains(e.target)) {
                optionsBox.classList.add('hidden');
                trigger.classList.remove('active');
            }
        });
    }

    // ============================================
    // 5. إضافة مهارة جديدة (Confirm Add)
    // ============================================
    if (confirmAdd) {
        confirmAdd.addEventListener('click', () => {
            let category = document.getElementById('modalCategory').value;
            let skillName = selectedSkillName; 
            let level = document.getElementById('modalLevel').value;
            let experience = document.getElementById('modalExperience').value.trim();

            if (!category) {
                showNotification('Please select a category.', 'error');
                return;
            }

            if (!skillName) {
                showNotification('Please select a skill from the list.', 'error');
                return;
            }

            // تحديد الشبكة المستهدفة
            let targetGrid = currentSkillType === 'teach' 
                ? document.getElementById('teachGrid')
                : document.getElementById('learnGrid');

            // تحديد الـ Badge
            let badgeClasses = {
                'beginner': 'badge-primary',
                'intermediate': 'badge-info',
                'advanced': 'badge-warning'
            };
            let badgeLabels = {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate',
                'advanced': 'Advanced'
            };

            // إنشاء البطاقة
            let newCard = document.createElement('div');
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

            // إضافة البطاقة
            let addCard = targetGrid.querySelector('.add-skill-card');
            targetGrid.insertBefore(newCard, addCard);

            attachCardActions(newCard);
            updateCounts();
            closeModalFn();
            showNotification(`Skill "${skillName}" added successfully!`, 'success');
        });
    }

    // ============================================
    // 6. حذف وتعديل البطاقة
    // ============================================
    function attachCardActions(card) {
        let deleteBtn = card.querySelector('.delete-btn');
        let editBtn = card.querySelector('.edit-btn');

        if (deleteBtn && !deleteBtn.dataset.bound) {
            deleteBtn.dataset.bound = 'true';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                let skillName = card.querySelector('.skill-card-title').textContent;
                
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
                let skillName = card.querySelector('.skill-card-title').textContent;
                showNotification(`Editing "${skillName}"...`, 'info');
            });
        }
    }

    document.querySelectorAll('.my-skill-card').forEach(card => {
        attachCardActions(card);
    });

    // ============================================
    // 7. تحديث العدادات
    // ============================================
    function updateCounts() {
        let teachCount = document.querySelectorAll('#teachGrid .my-skill-card').length;
        let learnCount = document.querySelectorAll('#learnGrid .my-skill-card').length;

        let teachCountEl = document.getElementById('teachCount');
        let learnCountEl = document.getElementById('learnCount');

        if (teachCountEl) teachCountEl.textContent = teachCount;
        if (learnCountEl) learnCountEl.textContent = learnCount;
    }

    // ============================================
    // 8. دوال مساعدة
    // ============================================
    function getCategoryName(key) {
        let names = {
            'technology': 'Technology',
            'education': 'Education',
            'handmade': 'Handmade',
            'entertainment': 'Entertainment',
            'business': 'Business',
            'health': 'Health & Fitness'
        };
        return names[key] || key;
    }

    function escapeHtml(text) {
        let div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

    // ============================================
    // 9. تحديث العدادات عند التحميل
    // ============================================
    updateCounts();

});