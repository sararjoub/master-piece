/* ============================================
   ===== ADD/EDIT SKILL FORM - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const skillForm = document.getElementById('skillForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const skillName = document.getElementById('skillName');
    const skillCategory = document.getElementById('skillCategory');
    const skillLevel = document.getElementById('skillLevel');
    const skillType = document.getElementById('skillType');
    const skillDescription = document.getElementById('skillDescription');
    const skillIcon = document.getElementById('skillIcon');
    const charCount = document.getElementById('charCount');

    // Preview Elements
    const previewName = document.getElementById('previewName');
    const previewCategory = document.getElementById('previewCategory');
    const previewLevel = document.getElementById('previewLevel');
    const previewType = document.getElementById('previewType');
    const previewIcon = document.getElementById('previewIcon');
    const previewDescription = document.getElementById('previewDescription');

    // ============================================
    // 2. Live Preview Updates
    // ============================================

    // Skill Name
    if (skillName && previewName) {
        skillName.addEventListener('input', () => {
            previewName.textContent = skillName.value || 'Skill Name';
        });
    }

    // Category
    if (skillCategory && previewCategory) {
        skillCategory.addEventListener('change', () => {
            const categoryNames = {
                'technology': 'Technology',
                'education': 'Education',
                'handmade': 'Handmade',
                'entertainment': 'Entertainment',
                'business': 'Business',
                'health': 'Health'
            };
            previewCategory.textContent = categoryNames[skillCategory.value] || 'Category';
        });
    }

    // Level
    if (skillLevel && previewLevel) {
        skillLevel.addEventListener('change', () => {
            const levelNames = {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate',
                'advanced': 'Advanced'
            };
            previewLevel.textContent = levelNames[skillLevel.value] || 'Level';

            // Update badge class
            previewLevel.className = 'admin-badge';
            if (skillLevel.value === 'beginner') {
                previewLevel.classList.add('admin-badge-info');
            } else if (skillLevel.value === 'intermediate') {
                previewLevel.classList.add('admin-badge-primary');
            } else {
                previewLevel.classList.add('admin-badge-warning');
            }
        });
    }

    // Type
    if (skillType && previewType) {
        skillType.addEventListener('change', () => {
            const type = skillType.value;
            if (type === 'free') {
                previewType.textContent = 'Free';
                previewType.className = 'admin-badge admin-badge-success';
            } else {
                previewType.textContent = 'Premium';
                previewType.className = 'admin-badge admin-badge-warning';
            }
        });
    }

    // Icon
    if (skillIcon && previewIcon) {
        skillIcon.addEventListener('input', () => {
            previewIcon.textContent = skillIcon.value || '🎯';
        });
    }

    // Description
    if (skillDescription && previewDescription) {
        skillDescription.addEventListener('input', () => {
            const value = skillDescription.value;
            previewDescription.textContent = value || 'Description will appear here...';

            // Update char count
            if (charCount) {
                charCount.textContent = value.length;
            }

            // Max length check
            if (value.length > 500) {
                skillDescription.value = value.substring(0, 500);
            }
        });
    }

    // ============================================
    // 3. Learn Items - Add
    // ============================================
    const addLearnItemBtn = document.getElementById('addLearnItemBtn');
    const learnItemsList = document.getElementById('learnItemsList');

    if (addLearnItemBtn) {
        addLearnItemBtn.addEventListener('click', () => {
            const newItem = document.createElement('div');
            newItem.className = 'learn-item-row';
            newItem.innerHTML = `
                <span class="learn-item-handle">⋮⋮</span>
                <input type="text" class="form-input learn-item-input" placeholder="Learning outcome...">
                <button type="button" class="learn-item-remove" title="Remove">✕</button>
            `;
            learnItemsList.appendChild(newItem);

            // Focus on new input
            const newInput = newItem.querySelector('.learn-item-input');
            if (newInput) newInput.focus();

            // Attach remove event
            attachRemoveEvent(newItem.querySelector('.learn-item-remove'));

            showAdminNotification('New learning outcome added.', 'success');
        });
    }

    // ============================================
    // 4. Learn Items - Remove
    // ============================================
    function attachRemoveEvent(btn) {
        if (!btn || btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
            const row = btn.closest('.learn-item-row');
            if (row) {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                setTimeout(() => row.remove(), 300);
            }
        });
    }

    // Attach to existing remove buttons
    document.querySelectorAll('.learn-item-remove').forEach(attachRemoveEvent);

    // ============================================
    // 5. Cancel Button
    // ============================================
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                window.location.href = 'manage-skills.html';
            }
        });
    }

    // ============================================
    // 6. Form Submit
    // ============================================
    if (skillForm) {
        skillForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validation
            if (!skillName.value.trim()) {
                showAdminNotification('Please enter a skill name.', 'error');
                skillName.focus();
                return;
            }

            if (!skillCategory.value) {
                showAdminNotification('Please select a category.', 'error');
                skillCategory.focus();
                return;
            }

            if (!skillDescription.value.trim()) {
                showAdminNotification('Please enter a description.', 'error');
                skillDescription.focus();
                return;
            }

            // Simulate save
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.7';

            setTimeout(() => {
                saveBtn.textContent = '✓ Saved!';

                setTimeout(() => {
                    window.location.href = 'skill-saved.html';
                }, 800);
            }, 1200);
        });
    }

    // ============================================
    // 7. Character Counter Init
    // ============================================
    if (skillDescription && charCount) {
        charCount.textContent = skillDescription.value.length;
    }

    // ============================================
    // 8. Draft Auto-Save (تأثير بصري فقط)
    // ============================================
    // عند الكتابة، نعرض مؤشر "Draft saved" بشكل وهمي
    const formInputs = document.querySelectorAll('.skill-form input, .skill-form textarea, .skill-form select');
    let draftTimer;

    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(draftTimer);
            draftTimer = setTimeout(() => {
                // تأثير بصري فقط - لا يوجد حفظ فعلي
                showAdminNotification('Draft saved locally ✓', 'success');
            }, 2000);
        });
    });

});