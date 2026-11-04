
document.addEventListener('DOMContentLoaded', () => {

    let searchInput = document.getElementById('requestsSearchInput');
    let filterBtns = document.querySelectorAll('.admin-filter-btn');
    let tableRows = document.querySelectorAll('#requestsTableBody tr');
    let emptyState = document.getElementById('requestsEmptyState');
    let tableWrapper = document.querySelector('.admin-table-wrapper');

    let currentFilter = 'all';
    let currentSearch = '';

    // 
    // تطبيق الفلاتر
    // 
    function applyFilters() {
        let visibleCount = 0;

        tableRows.forEach(row => {
            let status = row.dataset.status;
            let isFlagged = row.dataset.flagged === 'true';
            let searchText = (row.dataset.search || '').toLowerCase();

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

        let selectAll = document.getElementById('selectAllRequests');
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

    // 
    // Select All + Individual
    // 
    let selectAllCheckbox = document.getElementById('selectAllRequests');
    let requestCheckboxes = document.querySelectorAll('.request-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            requestCheckboxes.forEach(cb => {
                let row = cb.closest('tr');
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
            let row = cb.closest('tr');
            if (row) row.classList.toggle('selected', cb.checked);
            updateBulkBar();

            let visibleCheckboxes = Array.from(requestCheckboxes).filter(c => 
                c.closest('tr') && c.closest('tr').style.display !== 'none'
            );
            let allChecked = visibleCheckboxes.length > 0 && 
                              visibleCheckboxes.every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    // 
    // Bulk Actions Bar
    // 
    let bulkBar = document.getElementById('bulkActionsBar');
    let selectedCountEl = document.getElementById('selectedCount');

    function updateBulkBar() {
        let selected = document.querySelectorAll('.request-checkbox:checked');
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

    // 
    // Bulk Cancel
    // 
    let bulkCancel = document.getElementById('bulkCancel');
    if (bulkCancel) {
        bulkCancel.addEventListener('click', () => {
            requestCheckboxes.forEach(cb => {
                cb.checked = false;
                let row = cb.closest('tr');
                if (row) row.classList.remove('selected');
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkBar();
        });
    }

    // 
    // Bulk Actions
    // 
    let bulkApprove = document.getElementById('bulkApprove');
    let bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.request-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }

    if (bulkApprove) {
        bulkApprove.addEventListener('click', () => {
            let rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'accepted';
                    delete row.dataset.flagged;
                    let badge = row.querySelector('td:nth-child(6) .admin-badge');
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
            let rows = getSelectedRows();
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
            let row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    // 
    // Export CSV
    // 
    let exportBtn = document.getElementById('exportRequestsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Exporting requests to CSV... (Coming soon)', 'info');
        });
    }

    // 
    // Pagination
    // 
    let pageBtns = document.querySelectorAll('.admin-page-btn:not(:disabled)');
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