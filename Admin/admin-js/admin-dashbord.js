
document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('dashboardUserSearch');
    const usersTable = document.getElementById('dashboardUsersTable');
    const usersCount = document.getElementById('dashboardUsersCount');
    const emptyState = document.getElementById('dashboardUsersEmpty');

    if (!searchInput || !usersTable || !usersCount || !emptyState) {
        return;
    }

    const rows = Array.from(
        usersTable.querySelectorAll('tbody tr[data-user-row]')
    );

    function filterUsers() {

        const query = searchInput.value.trim().toLowerCase();

        let visibleCount = 0;

        rows.forEach(row => {

            const userText = row.textContent.toLowerCase();
            const isMatch = userText.includes(query);

            row.style.display = isMatch ? '' : 'none';

            if (isMatch) {
                visibleCount++;
            }

        });

        usersCount.textContent =
            `${visibleCount} of ${rows.length} users`;

        emptyState.hidden = visibleCount !== 0;
    }

    searchInput.addEventListener('input', filterUsers);

    filterUsers();

});
