/* ============================================
   ===== MANAGE REQUESTS PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('requestsSearchInput');
    const filterBtns = document.querySelectorAll('.admin-filter-btn');
    const tableRows = document.querySelectorAll('#requestsTableBody tr');
    const emptyState = document.getElementById('requestsEmptyState');
    const tableWrapper = document.querySelector('.admin-table-wrapper');

    let currentFilter = 'all';
    let currentSearch = '';

    // ============================================
    // تطبيق الفلاتر
    // ============================================
    function applyFilters() {
        let visibleCount = 0;

        tableRows.forEach(row => {
            const status = row.dataset.status;
            const isFlagged = row.dataset.flagged === 'true';
            const searchText = (row.dataset.search || '').toLowerCase();

            let matchesFilter = false;

            switch (currentFilter) {
                case 'all':
                    matchesFilter = true;
                    break;
                case 'flagged':
                    matchesFilter = isFlagged;
                    break;
                default:
                    matchesFilter = status === currentFilter;
            }

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

        const selectAll = document.getElementById('selectAllRequests');
        if (selectAll) selectAll.checked = false;
        updateBulkBar();
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // ============================================
    // Select All + Individual
    // ============================================
    const selectAllCheckbox = document.getElementById('selectAllRequests');
    const requestCheckboxes = document.querySelectorAll('.request-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            requestCheckboxes.forEach(cb => {
                const row = cb.closest('tr');
                if (row && row.style.display !== 'none') {
                    cb.checked = selectAllCheckbox.checked;
                    row.classList.toggle('selected', selectAllCheckbox.checked);
                }
            });
            updateBulkBar();
        });
    }

    requestCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const row = cb.closest('tr');
            if (row) row.classList.toggle('selected', cb.checked);
            updateBulkBar();

            const visibleCheckboxes = Array.from(requestCheckboxes).filter(c => 
                c.closest('tr') && c.closest('tr').style.display !== 'none'
            );
            const allChecked = visibleCheckboxes.length > 0 && 
                              visibleCheckboxes.every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    // ============================================
    // Bulk Actions Bar
    // ============================================
    const bulkBar = document.getElementById('bulkActionsBar');
    const selectedCountEl = document.getElementById('selectedCount');

    function updateBulkBar() {
        const selected = document.querySelectorAll('.request-checkbox:checked');
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
    // Bulk Cancel
    // ============================================
    const bulkCancel = document.getElementById('bulkCancel');
    if (bulkCancel) {
        bulkCancel.addEventListener('click', () => {
            requestCheckboxes.forEach(cb => {
                cb.checked = false;
                const row = cb.closest('tr');
                if (row) row.classList.remove('selected');
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkBar();
        });
    }

    // ============================================
    // Bulk Actions
    // ============================================
    const bulkApprove = document.getElementById('bulkApprove');
    const bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.request-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }

    if (bulkApprove) {
        bulkApprove.addEventListener('click', () => {
            const rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'accepted';
                    delete row.dataset.flagged;
                    const badge = row.querySelector('td:nth-child(6) .admin-badge');
                    if (badge) {
                        badge.className = 'admin-badge admin-badge-success';
                        badge.textContent = '● Accepted';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} requests approved.`, 'success');
            clearSelection();
        });
    }

    if (bulkDelete) {
        bulkDelete.addEventListener('click', () => {
            const rows = getSelectedRows();
            if (!confirm(`Delete ${rows.length} selected requests?`)) return;

            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => row.remove(), 400);
                }, index * 80);
            });

            setTimeout(() => {
                showAdminNotification(`${rows.length} requests deleted.`, 'success');
                applyFilters();
            }, rows.length * 80 + 400);

            clearSelection();
        });
    }

    function clearSelection() {
        requestCheckboxes.forEach(cb => {
            cb.checked = false;
            const row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    // ============================================
    // Export CSV
    // ============================================
    const exportBtn = document.getElementById('exportRequestsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Exporting requests to CSV... (Coming soon)', 'info');
        });
    }

    // ============================================
    // Pagination
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