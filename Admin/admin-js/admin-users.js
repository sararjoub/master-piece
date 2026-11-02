/* ============================================
   ===== MANAGE USERS PAGE - JavaScript =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // 1. عناصر الصفحة
    let searchInput = document.getElementById('usersSearchInput');
    let filterBtns = document.querySelectorAll('.admin-filter-btn');
    let tableRows = document.querySelectorAll('#usersTableBody tr');
    let emptyState = document.getElementById('usersEmptyState');
    let tableWrapper = document.querySelector('.admin-table-wrapper');
    let totalUsersEl = document.getElementById('totalUsers');

    let currentFilter = 'all';
    let currentSearch = '';

    // 2. تطبيق الفلاتر والبحث
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

        if (totalUsersEl) totalUsersEl.textContent = visibleCount;

        let selectAll = document.getElementById('selectAllUsers');
        if (selectAll) selectAll.checked = false;
        updateBulkBar();
    }

    // 3. البحث
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }

    // 4. الفلاتر
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // 5. Select All
    let selectAllCheckbox = document.getElementById('selectAllUsers');
    let userCheckboxes = document.querySelectorAll('.user-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            userCheckboxes.forEach(cb => {
                let row = cb.closest('tr');
                if (row && row.style.display !== 'none') {
                    cb.checked = selectAllCheckbox.checked;
                    row.classList.toggle('selected', selectAllCheckbox.checked);
                }
            });
            updateBulkBar();
        });
    }

    // 6. تحديد فردي
    userCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            let row = cb.closest('tr');
            if (row) {
                row.classList.toggle('selected', cb.checked);
            }
            updateBulkBar();

            let visibleCheckboxes = Array.from(userCheckboxes).filter(c => 
                c.closest('tr') && c.closest('tr').style.display !== 'none'
            );
            let allChecked = visibleCheckboxes.length > 0 && 
                              visibleCheckboxes.every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    // 7. Bulk Actions Bar
    let bulkBar = document.getElementById('bulkActionsBar');
    let selectedCountEl = document.getElementById('selectedCount');

    function updateBulkBar() {
        let selected = document.querySelectorAll('.user-checkbox:checked');
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

    // 8. Bulk Cancel
    let bulkCancel = document.getElementById('bulkCancel');
    if (bulkCancel) {
        bulkCancel.addEventListener('click', () => {
            userCheckboxes.forEach(cb => {
                cb.checked = false;
                let row = cb.closest('tr');
                if (row) row.classList.remove('selected');
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkBar();
        });
    }

    // 9. Bulk Actions
    let bulkActivate = document.getElementById('bulkActivate');
    let bulkBan = document.getElementById('bulkBan');
    let bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.user-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }

    if (bulkActivate) {
        bulkActivate.addEventListener('click', () => {
            let rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'active';
                    let statusBadge = row.querySelector('td:nth-child(4) .admin-badge');
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
            let rows = getSelectedRows();
            if (!confirm(`Ban ${rows.length} selected users?`)) return;
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'banned';
                    let statusBadge = row.querySelector('td:nth-child(4) .admin-badge');
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
            let rows = getSelectedRows();
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
            let row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    // 10. Export CSV
    let exportBtn = document.getElementById('exportUsersBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Exporting users to CSV... (Coming soon)', 'info');
        });
    }

    // 11. MAKE EXPERT MODAL (هذا هو الجزء الخاص بالنجمة)
    let expertModal = document.getElementById('expertModal');
    let closeExpertModal = document.getElementById('closeExpertModal');
    let cancelExpert = document.getElementById('cancelExpert');
    let confirmExpert = document.getElementById('confirmExpert');
    let expertUserName = document.getElementById('expertUserName');
    let makeExpertBtns = document.querySelectorAll('.make-expert-btn');

    let currentExpertBtn = null;

    makeExpertBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentExpertBtn = btn;
            let userName = btn.dataset.name;
            
            if (expertUserName) expertUserName.textContent = userName;
            if (expertModal) {
                expertModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeExpertModalFn() {
        if (expertModal) {
            expertModal.classList.add('hidden');
            document.body.style.overflow = '';
            currentExpertBtn = null;
        }
    }

    if (closeExpertModal) closeExpertModal.addEventListener('click', closeExpertModalFn);
    if (cancelExpert) cancelExpert.addEventListener('click', closeExpertModalFn);

    if (expertModal) {
        expertModal.addEventListener('click', (e) => {
            if (e.target === expertModal) closeExpertModalFn();
        });
    }

    if (confirmExpert) {
        confirmExpert.addEventListener('click', () => {
            if (currentExpertBtn) {
                currentExpertBtn.style.color = '#fbbf24';
                currentExpertBtn.style.background = '#fef3c7';
                currentExpertBtn.title = 'Expert';
                currentExpertBtn.innerHTML = '✓';
                
                let row = currentExpertBtn.closest('tr');
                let nameElement = row.querySelector('.admin-table-user-name');
                if (nameElement && !nameElement.innerHTML.includes('Expert')) {
                    nameElement.innerHTML += ' <span class="admin-badge admin-badge-warning" style="font-size: 9px;">Expert</span>';
                }

                closeExpertModalFn();
                showAdminNotification('User approved as Expert successfully!', 'success');
            }
        });
    }

});