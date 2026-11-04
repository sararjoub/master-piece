/* ============================================
   ===== MANAGE COURSES PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    let searchInput = document.getElementById('coursesSearchInput');
    let filterBtns = document.querySelectorAll('.admin-filter-btn');
    let tableRows = document.querySelectorAll('#coursesTableBody tr');
    let emptyState = document.getElementById('coursesEmptyState');
    let tableWrapper = document.querySelector('.admin-table-wrapper');

    let currentFilter = 'all';
    let currentSearch = '';

    // ============================================
    // 2. تطبيق الفلاتر والبحث
    // ============================================
    function applyFilters() {
        let visibleCount = 0;

        tableRows.forEach(row => {
            let status = row.dataset.status;
            let searchText = (row.dataset.search || '').toLowerCase();

            let matchesFilter = currentFilter === 'all' || status === currentFilter;
            let matchesSearch = !currentSearch || searchText.includes(currentSearch);

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

        let selectAll = document.getElementById('selectAllCourses');
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
    let selectAllCheckbox = document.getElementById('selectAllCourses');
    let courseCheckboxes = document.querySelectorAll('.course-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            courseCheckboxes.forEach(cb => {
                let row = cb.closest('tr');
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
            let row = cb.closest('tr');
            if (row) {
                row.classList.toggle('selected', cb.checked);
            }
            updateBulkBar();

            let visibleCheckboxes = Array.from(courseCheckboxes).filter(c => 
                c.closest('tr') && c.closest('tr').style.display !== 'none'
            );
            let allChecked = visibleCheckboxes.length > 0 && 
                              visibleCheckboxes.every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    // ============================================
    // 6. Bulk Actions Bar
    // ============================================
    let bulkBar = document.getElementById('bulkActionsBar');
    let selectedCountEl = document.getElementById('selectedCount');

    function updateBulkBar() {
        let selected = document.querySelectorAll('.course-checkbox:checked');
        let count = selected.length;

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
    let bulkCancel = document.getElementById('bulkCancel');
    if (bulkCancel) {
        bulkCancel.addEventListener('click', () => {
            courseCheckboxes.forEach(cb => {
                cb.checked = false;
                let row = cb.closest('tr');
                if (row) row.classList.remove('selected');
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkBar();
        });
    }

    // ============================================
    // 8. Bulk Actions
    // ============================================
    let bulkPublish = document.getElementById('bulkPublish');
    let bulkDraft = document.getElementById('bulkDraft');
    let bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.course-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }

    if (bulkPublish) {
        bulkPublish.addEventListener('click', () => {
            let rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'published';
                    let badge = row.querySelector('td:nth-child(6) .admin-badge');
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
            let rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'draft';
                    let badge = row.querySelector('td:nth-child(6) .admin-badge');
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
            let rows = getSelectedRows();
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
            let row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    // ============================================
    // 9. Add Course Button
    // ============================================
    let addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            showAdminNotification('Opening course editor... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 10. Export CSV
    // ============================================
    let exportBtn = document.getElementById('exportCoursesBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Exporting courses to CSV... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 11. Pagination
    // ============================================
    let pageBtns = document.querySelectorAll('.admin-page-btn:not(:disabled)');
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