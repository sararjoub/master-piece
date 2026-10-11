/* ============================================
   ===== MANAGE SKILLS PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const searchInput = document.getElementById('skillsSearchInput');
    const filterBtns = document.querySelectorAll('.admin-filter-btn');
    const tableRows = document.querySelectorAll('#skillsTableBody tr');
    const emptyState = document.getElementById('skillsEmptyState');
    const tableWrapper = document.querySelector('.admin-table-wrapper');
    const totalSkillsEl = document.getElementById('totalSkills');

    let currentFilter = 'all';
    let currentSearch = '';

    // ============================================
    // 2. تطبيق الفلاتر والبحث
    // ============================================
    function applyFilters() {
        let visibleCount = 0;

        tableRows.forEach(row => {
            const type = row.dataset.type;
            const level = row.dataset.level;
            const searchText = (row.dataset.search || '').toLowerCase();

            // التحقق من الفلتر
            let matchesFilter = currentFilter === 'all' || 
                               type === currentFilter || 
                               level === currentFilter;

            // التحقق من البحث
            const matchesSearch = !currentSearch || searchText.includes(currentSearch);

            if (matchesFilter && matchesSearch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // إظهار/إخفاء الحالة الفارغة
        if (visibleCount === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (tableWrapper) tableWrapper.style.display = 'none';
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            if (tableWrapper) tableWrapper.style.display = '';
        }

        if (totalSkillsEl) totalSkillsEl.textContent = visibleCount;

        // إلغاء تحديد الكل
        const selectAll = document.getElementById('selectAllSkills');
        if (selectAll) selectAll.checked = false;
        updateBulkBar();
    }

    // ============================================
    // 3. البحث
    // ============================================
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }

    // ============================================
    // 4. الفلاتر
    // ============================================
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // ============================================
    // 5. Select All + Individual Selection
    // ============================================
    const selectAllCheckbox = document.getElementById('selectAllSkills');
    const skillCheckboxes = document.querySelectorAll('.skill-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            skillCheckboxes.forEach(cb => {
                const row = cb.closest('tr');
                if (row && row.style.display !== 'none') {
                    cb.checked = selectAllCheckbox.checked;
                    row.classList.toggle('selected', selectAllCheckbox.checked);
                }
            });
            updateBulkBar();
        });
    }

    skillCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const row = cb.closest('tr');
            if (row) {
                row.classList.toggle('selected', cb.checked);
            }
            updateBulkBar();

            const visibleCheckboxes = Array.from(skillCheckboxes).filter(c => 
                c.closest('tr') && c.closest('tr').style.display !== 'none'
            );
            const allChecked = visibleCheckboxes.length > 0 && 
                              visibleCheckboxes.every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    // ============================================
    // 6. Bulk Actions Bar
    // ============================================
    const bulkBar = document.getElementById('bulkActionsBar');
    const selectedCountEl = document.getElementById('selectedCount');

    function updateBulkBar() {
        const selected = document.querySelectorAll('.skill-checkbox:checked');
        const count = selected.length;

        if (selectedCountEl) selectedCountEl.textContent = count;

        if (bulkBar) {
            if (count > 0) {
                bulkBar.classList.remove('hidden');
                setTimeout(() => bulkBar.classList.add('show'), 10);
            } else {
                bulkBar.classList.remove('show');
                setTimeout(() => bulkBar.classList.add('hidden'), 400);
            }
        }
    }

    // ============================================
    // 7. Bulk Cancel
    // ============================================
    const bulkCancel = document.getElementById('bulkCancel');
    if (bulkCancel) {
        bulkCancel.addEventListener('click', () => {
            skillCheckboxes.forEach(cb => {
                cb.checked = false;
                const row = cb.closest('tr');
                if (row) row.classList.remove('selected');
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkBar();
        });
    }

    // ============================================
    // 8. Bulk Actions
    // ============================================
    const bulkActivate = document.getElementById('bulkActivate');
    const bulkBan = document.getElementById('bulkBan');
    const bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.skill-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }

    if (bulkActivate) {
        bulkActivate.addEventListener('click', () => {
            const rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.type = 'free';
                    const typeBadge = row.querySelector('td:nth-child(5) .admin-badge');
                    if (typeBadge) {
                        typeBadge.className = 'admin-badge admin-badge-success';
                        typeBadge.textContent = 'Free';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} skills marked as Free.`, 'success');
            clearSelection();
        });
    }

    if (bulkBan) {
        bulkBan.addEventListener('click', () => {
            const rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.type = 'premium';
                    const typeBadge = row.querySelector('td:nth-child(5) .admin-badge');
                    if (typeBadge) {
                        typeBadge.className = 'admin-badge admin-badge-warning';
                        typeBadge.textContent = 'Premium';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} skills marked as Premium.`, 'info');
            clearSelection();
        });
    }

    if (bulkDelete) {
        bulkDelete.addEventListener('click', () => {
            const rows = getSelectedRows();
            if (!confirm(`Delete ${rows.length} selected skills? This cannot be undone.`)) return;

            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => row.remove(), 400);
                }, index * 80);
            });

            setTimeout(() => {
                showAdminNotification(`${rows.length} skills deleted.`, 'success');
                applyFilters();
            }, rows.length * 80 + 400);

            clearSelection();
        });
    }

    function clearSelection() {
        skillCheckboxes.forEach(cb => {
            cb.checked = false;
            const row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    // ============================================
    // 9. Export CSV (Placeholder)
    // ============================================
    const exportBtn = document.getElementById('exportSkillsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Exporting skills to CSV... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 10. Pagination
    // ============================================
    const pageBtns = document.querySelectorAll('.admin-page-btn:not(:disabled)');
    pageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active') || 
                btn.textContent === '←' || 
                btn.textContent === '→' ||
                btn.classList.contains('admin-page-dots')) return;

            document.querySelectorAll('.admin-page-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            showAdminNotification(`Loading page ${btn.textContent}...`, 'info');
        });
    });

});