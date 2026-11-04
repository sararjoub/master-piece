
document.addEventListener('DOMContentLoaded', () => {

    let searchInput = document.getElementById('pathsSearchInput');
    let filterBtns = document.querySelectorAll('.admin-filter-btn');
    let tableRows = document.querySelectorAll('#pathsTableBody tr');
    let emptyState = document.getElementById('pathsEmptyState');
    let tableWrapper = document.querySelector('.admin-table-wrapper');

    let currentFilter = 'all';
    let currentSearch = '';

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

        let selectAll = document.getElementById('selectAllPaths');
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

    let selectAllCheckbox = document.getElementById('selectAllPaths');
    let pathCheckboxes = document.querySelectorAll('.path-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            pathCheckboxes.forEach(cb => {
                let row = cb.closest('tr');
                if (row && row.style.display !== 'none') {
                    cb.checked = selectAllCheckbox.checked;
                    row.classList.toggle('selected', selectAllCheckbox.checked);
                }
            });
            updateBulkBar();
        });
    }

    pathCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            let row = cb.closest('tr');
            if (row) row.classList.toggle('selected', cb.checked);
            updateBulkBar();

            let visibleCheckboxes = Array.from(pathCheckboxes).filter(c => 
                c.closest('tr') && c.closest('tr').style.display !== 'none'
            );
            let allChecked = visibleCheckboxes.length > 0 && 
                              visibleCheckboxes.every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        });
    });

    let bulkBar = document.getElementById('bulkActionsBar');
    let selectedCountEl = document.getElementById('selectedCount');

    function updateBulkBar() {
        let selected = document.querySelectorAll('.path-checkbox:checked');
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

    let bulkCancel = document.getElementById('bulkCancel');
    if (bulkCancel) {
        bulkCancel.addEventListener('click', () => {
            pathCheckboxes.forEach(cb => {
                cb.checked = false;
                let row = cb.closest('tr');
                if (row) row.classList.remove('selected');
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkBar();
        });
    }

    let bulkActivate = document.getElementById('bulkActivate');
    let bulkDraft = document.getElementById('bulkDraft');
    let bulkDelete = document.getElementById('bulkDelete');

    function getSelectedRows() {
        return Array.from(document.querySelectorAll('.path-checkbox:checked'))
            .map(cb => cb.closest('tr'));
    }

    if (bulkActivate) {
        bulkActivate.addEventListener('click', () => {
            let rows = getSelectedRows();
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.dataset.status = 'active';
                    let badge = row.querySelector('td:nth-child(6) .admin-badge');
                    if (badge) {
                        badge.className = 'admin-badge admin-badge-success';
                        badge.textContent = '● Active';
                    }
                }, index * 50);
            });
            showAdminNotification(`${rows.length} paths activated.`, 'success');
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
            showAdminNotification(`${rows.length} paths set to draft.`, 'info');
            clearSelection();
        });
    }

    if (bulkDelete) {
        bulkDelete.addEventListener('click', () => {
            let rows = getSelectedRows();
            if (!confirm(`Delete ${rows.length} selected paths?`)) return;

            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => row.remove(), 400);
                }, index * 80);
            });

            setTimeout(() => {
                showAdminNotification(`${rows.length} paths deleted.`, 'success');
                applyFilters();
            }, rows.length * 80 + 400);

            clearSelection();
        });
    }

    function clearSelection() {
        pathCheckboxes.forEach(cb => {
            cb.checked = false;
            let row = cb.closest('tr');
            if (row) row.classList.remove('selected');
        });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateBulkBar();
    }

    let addPathBtn = document.getElementById('addPathBtn');
    if (addPathBtn) {
        addPathBtn.addEventListener('click', () => {
            showAdminNotification('Opening path editor... (Coming soon)', 'info');
        });
    }

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