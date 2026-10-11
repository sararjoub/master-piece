/* ============================================
   ===== MANAGE CATEGORIES PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addCategoryCard = document.getElementById('addCategoryCard');
    const addCategoryModal = document.getElementById('addCategoryModal');
    const closeCategoryModal = document.getElementById('closeCategoryModal');
    const cancelCategory = document.getElementById('cancelCategory');
    const confirmCategory = document.getElementById('confirmCategory');
    const categoryName = document.getElementById('categoryName');
    const categoryIcon = document.getElementById('categoryIcon');
    const categoryDescription = document.getElementById('categoryDescription');
    const categoriesGrid = document.querySelector('.categories-grid');

    // ============================================
    // 2. فتح Modal
    // ============================================
    function openModal() {
        if (addCategoryModal) {
            addCategoryModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            // مسح الحقول
            categoryName.value = '';
            categoryIcon.value = '';
            categoryDescription.value = '';
            // تركيز على الاسم
            setTimeout(() => categoryName.focus(), 100);
        }
    }

    if (addCategoryBtn) addCategoryBtn.addEventListener('click', openModal);
    if (addCategoryCard) addCategoryCard.addEventListener('click', openModal);

    // ============================================
    // 3. إغلاق Modal
    // ============================================
    function closeModal() {
        if (addCategoryModal) {
            addCategoryModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (closeCategoryModal) closeCategoryModal.addEventListener('click', closeModal);
    if (cancelCategory) cancelCategory.addEventListener('click', closeModal);

    if (addCategoryModal) {
        addCategoryModal.addEventListener('click', (e) => {
            if (e.target === addCategoryModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addCategoryModal && !addCategoryModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // ============================================
    // 4. إضافة تصنيف جديد
    // ============================================
    if (confirmCategory) {
        confirmCategory.addEventListener('click', () => {
            const name = categoryName.value.trim();
            const icon = categoryIcon.value.trim() || '📁';
            const description = categoryDescription.value.trim() || 'No description provided';

            // التحقق
            if (!name) {
                showAdminNotification('Please enter a category name.', 'error');
                categoryName.focus();
                return;
            }

            // إنشاء البطاقة الجديدة
            const newCard = document.createElement('div');
            newCard.className = 'category-card animate-scale-in';
            newCard.innerHTML = `
                <div class="category-card-header">
                    <div class="category-card-icon" style="background: linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%); color: #4a3ce0;">
                        ${icon}
                    </div>
                    <div class="category-card-actions">
                        <button class="admin-table-action-btn" title="Edit">✏️</button>
                        <button 
                            class="admin-table-action-btn danger" 
                            title="Delete"
                            data-confirm-danger="Delete ${name} category?"
                        >🗑️</button>
                    </div>
                </div>
                <h3 class="category-card-title">${escapeHtml(name)}</h3>
                <p class="category-card-desc">${escapeHtml(description)}</p>
                <div class="category-card-footer">
                    <div class="category-card-stats">
                        <span class="category-stat"><strong>0</strong> Skills</span>
                        <span class="category-stat"><strong>0</strong> Users</span>
                    </div>
                    <span class="admin-badge admin-badge-success">Active</span>
                </div>
            `;

            // إضافة البطاقة قبل زر "Add New Category"
            const addCard = document.querySelector('.category-card-add');
            categoriesGrid.insertBefore(newCard, addCard);

            // ربط الأزرار الجديدة
            attachCardActions(newCard);

            // إغلاق Modal
            closeModal();

            // إشعار
            showAdminNotification(`Category "${name}" added successfully!`, 'success');
        });
    }

    // ============================================
    // 5. ربط أزرار البطاقة (Edit / Delete)
    // ============================================
    function attachCardActions(card) {
        const editBtn = card.querySelector('[title="Edit"]');
        const deleteBtn = card.querySelector('.danger');

        if (editBtn && !editBtn.dataset.bound) {
            editBtn.dataset.bound = 'true';
            editBtn.addEventListener('click', () => {
                const name = card.querySelector('.category-card-title').textContent;
                showAdminNotification(`Editing "${name}"... (Coming soon)`, 'info');
            });
        }

        if (deleteBtn && !deleteBtn.dataset.bound) {
            deleteBtn.dataset.bound = 'true';
            deleteBtn.addEventListener('click', () => {
                const name = card.querySelector('.category-card-title').textContent;
                const message = deleteBtn.dataset.confirmDanger || `Delete "${name}"?`;

                if (confirm(message)) {
                    card.style.transition = 'all 0.4s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8) translateY(-20px)';

                    setTimeout(() => {
                        card.remove();
                        showAdminNotification(`Category "${name}" deleted.`, 'info');
                    }, 400);
                }
            });
        }
    }

    // ربط كل البطاقات الحالية
    document.querySelectorAll('.category-card:not(.category-card-add)').forEach(card => {
        attachCardActions(card);
    });

    // ============================================
    // 6. Escape HTML (حماية)
    // ============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

});