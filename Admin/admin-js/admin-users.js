/* ============================================
   ===== MANAGE USERS PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const searchInput = document.getElementById('usersSearchInput');
    const filterBtns = document.querySelectorAll('.admin-filter-btn');
    const tableRows = document.querySelectorAll('#usersTableBody tr');
    const emptyState = document.getElementById('usersEmptyState');
    const tableWrapper = document.querySelector('.admin-table-wrapper');
    const totalUsersEl = document.getElementById('totalUsers');

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

            // التحقق من الفلتر
            const matchesFilter = currentFilter === 'all' || status === currentFilter;

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

        // تحديث عدد المستخدمين
        if (totalUsersEl) {
            totalUsersEl.textContent = visibleCount;
        }

        // إلغاء تحديد الكل
        const selectAll = document.getElementById('selectAllUsers');
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
    // 5. تحديد الكل (Select All)
    // ============================================
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            userCheckboxes.forEach(cb => {
                const row = cb.closest('tr');
                if (row && row.style.display !== 'none') {
                    cb.checked = selectAllCheckbox.checked;
                    row.classList.toggle('selected', selectAllCheckbox.checked);
                }
            });
            updateBulkBar();
        });
    }

    // ============================================
    // 6. تحديد فردي
    // ============================================
    userCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const row = cb.closest('tr');
            if (row) {
                row.classList.toggle('selected', cb.checked);
            }
            updateBulkBar();

            // تحديث "Select All"
            const visibleCheckboxes = Array.from(userCheckboxes).filter(c => 
                c.closest('tr') && c.closest('tr').style.display !== 'none'
            );
            const allChecked = visibleCheckboxes.length > 0 && 
                              visibleCheckboxes.every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    // ============================================
    // 7. Bulk Actions Bar
    // ============================================
    const bulkBar = document.getElementById('bulkActionsBar');
    const selectedCountEl = document.getElementById('selectedCount');

    function updateBulkBar() {
        const selected = document.querySelectorAll('.user-checkbox:checked');
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
    // 8. Bulk Cancel
    // ============================================
    const bulkCancel = document.getElementById('bulkCancel');
    if (bulkCancel) {
        bulkCancel.addEventListener('click', () => {
            userCheckboxes.forEach(cb => {
                cb.checked = false;
                const row = cb.closest('tr');
                if (row) row.classList.remove('selected');
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkBar();
        });
    }

    // ============================================
    // 9. Bulk Actions (Activate / Ban / Delete)
    // ============================================
    const bulkActivate = document.getElementById('bulkActivate');
    const bulkBan = document.getElementById('bulkBan');
    const bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.user-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }
    if (bulkActivate) {
        bulkActivate.addEventListener('click', () => {
            const rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'active';
                    const statusBadge = row.querySelector('td:nth-child(4) .admin-badge');
                    if (statusBadge) {
                        statusBadge.className = 'admin-badge admin-badge-success';
                        statusBadge.textContent = '● Active';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} users activated.`, 'success');
            clearSelection();
        });
    }

    if (bulkBan) {
        bulkBan.addEventListener('click', () => {
            const rows = getSelectedRows();
            if (!confirm(`Ban ${rows.length} selected users?`)) return;

            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'banned';
                    const statusBadge = row.querySelector('td:nth-child(4) .admin-badge');
                    if (statusBadge) {
                        statusBadge.className = 'admin-badge admin-badge-danger';
                        statusBadge.textContent = '● Banned';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} users banned.`, 'info');
            clearSelection();
        });
    }

    if (bulkDelete) {
        bulkDelete.addEventListener('click', () => {
            const rows = getSelectedRows();
            if (!confirm(`Delete ${rows.length} selected users? This cannot be undone.`)) return;

            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => row.remove(), 400);
                }, index * 80);
            });

            setTimeout(() => {
                showAdminNotification(`${rows.length} users deleted.`, 'success');
                applyFilters();
            }, rows.length * 80 + 400);

            clearSelection();
        });
    }

    function clearSelection() {
        userCheckboxes.forEach(cb => {
            cb.checked = false;
            const row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    // ============================================
    // 10. Export CSV (Placeholder)
    // ============================================
    const exportBtn = document.getElementById('exportUsersBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Exporting users to CSV... (Coming soon)', 'info');
            // ✅ لاحقاً: سيتم تصدير البيانات من الـ API
        });
    }

    // ============================================
    // 11. Pagination (Placeholder)
    // ============================================
    const pageBtns = document.querySelectorAll('.admin-page-btn:not(:disabled)');
    pageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active') || 
                btn.textContent === '←' || 
                btn.textContent === '→' ||
                btn.classList.contains('admin-page-dots')) return;

            // تحديث الحالة النشطة
            document.querySelectorAll('.admin-page-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            showAdminNotification(`Loading page ${btn.textContent}...`, 'info');
            // ✅ لاحقاً: سيتم جلب البيانات من الـ API
        });
    });

});