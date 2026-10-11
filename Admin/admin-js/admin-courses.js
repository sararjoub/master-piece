/* ============================================
   ===== MANAGE COURSES PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const searchInput = document.getElementById('coursesSearchInput');
    const filterBtns = document.querySelectorAll('.admin-filter-btn');
    const tableRows = document.querySelectorAll('#coursesTableBody tr');
    const emptyState = document.getElementById('coursesEmptyState');
    const tableWrapper = document.querySelector('.admin-table-wrapper');

    let currentFilter = 'all';
    let currentSearch = '';

    // ============================================
    // 2. تطبيق الفلاتر والبحث
    // ============================================
    function applyFilters() {
        let visibleCount = 0;

        tableRows.forEach(row => {
            const status = row.dataset.status;
            const searchText = (row.dataset.search || '').toLowerCase();

            const matchesFilter = currentFilter === 'all' || status === currentFilter;
            const matchesSearch = !currentSearch || searchText.includes(currentSearch);

            if (matchesFilter && matchesSearch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (tableWrapper) tableWrapper.style.display = 'none';
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            if (tableWrapper) tableWrapper.style.display = '';
        }

        const selectAll = document.getElementById('selectAllCourses');
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
    const selectAllCheckbox = document.getElementById('selectAllCourses');
    const courseCheckboxes = document.querySelectorAll('.course-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            courseCheckboxes.forEach(cb => {
                const row = cb.closest('tr');
                if (row && row.style.display !== 'none') {
                    cb.checked = selectAllCheckbox.checked;
                    row.classList.toggle('selected', selectAllCheckbox.checked);
                }
            });
            updateBulkBar();
        });
    }

    courseCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const row = cb.closest('tr');
            if (row) {
                row.classList.toggle('selected', cb.checked);
            }
            updateBulkBar();

            const visibleCheckboxes = Array.from(courseCheckboxes).filter(c => 
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
        const selected = document.querySelectorAll('.course-checkbox:checked');
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
            courseCheckboxes.forEach(cb => {
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
    const bulkPublish = document.getElementById('bulkPublish');
    const bulkDraft = document.getElementById('bulkDraft');
    const bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.course-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }

    if (bulkPublish) {
        bulkPublish.addEventListener('click', () => {
            const rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'published';
                    const badge = row.querySelector('td:nth-child(6) .admin-badge');
                    if (badge) {
                        badge.className = 'admin-badge admin-badge-success';
                        badge.textContent = '● Published';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} courses published.`, 'success');
            clearSelection();
        });
    }

    if (bulkDraft) {
        bulkDraft.addEventListener('click', () => {
            const rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'draft';
                    const badge = row.querySelector('td:nth-child(6) .admin-badge');
                    if (badge) {
                        badge.className = 'admin-badge admin-badge-gray';
                        badge.textContent = '● Draft';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} courses set to draft.`, 'info');
            clearSelection();
        });
    }

    if (bulkDelete) {
        bulkDelete.addEventListener('click', () => {
            const rows = getSelectedRows();
            if (!confirm(`Delete ${rows.length} selected courses? This cannot be undone.`)) return;

            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => row.remove(), 400);
                }, index * 80);
            });

            setTimeout(() => {
                showAdminNotification(`${rows.length} courses deleted.`, 'success');
                applyFilters();
            }, rows.length * 80 + 400);

            clearSelection();
        });
    }

    function clearSelection() {
        courseCheckboxes.forEach(cb => {
            cb.checked = false;
            const row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    // ============================================
    // 9. Add Course Button
    // ============================================
    const addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            showAdminNotification('Opening course editor... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 10. Export CSV
    // ============================================
    const exportBtn = document.getElementById('exportCoursesBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Exporting courses to CSV... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 11. Pagination
    // ============================================
    const pageBtns = document.querySelectorAll('.admin-page-btn:not(:disabled)');
    pageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active') || 
                btn.textContent === '←' || 
                btn.textContent === '→') return;

            document.querySelectorAll('.admin-page-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            showAdminNotification(`Loading page ${btn.textContent}...`, 'info');
        });
    });

});