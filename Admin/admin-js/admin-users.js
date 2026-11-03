
/* let
   SKILLS SWAP - MANAGE USERS
   Frontend Demo
   File: admin-users.js
let */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    // let
    // 1. DEMO USERS DATA
    // let

    // Frontend demonstration only.
    // Real data will come from ASP.NET Core backend.

    let users = [
        {
            id: 1,
            name: "Ahmad Ali",
            email: "ahmad@example.com",
            role: "User",
            emailVerified: true,
            status: "active",
            joined: "2026-10-28",
            skills: 8,
            expert: false,
            suspensionReason: null
        },
        {
            id: 2,
            name: "Sara Khaled",
            email: "sara@example.com",
            role: "User",
            emailVerified: true,
            status: "active",
            joined: "2026-10-25",
            skills: 5,
            expert: false,
            suspensionReason: null
        },
        {
            id: 3,
            name: "Omar Mahmoud",
            email: "omar@example.com",
            role: "User",
            emailVerified: true,
            status: "suspended",
            joined: "2026-10-20",
            skills: 12,
            expert: false,
            suspensionReason: "Violation of platform guidelines."
        },
        {
            id: 4,
            name: "Lana Omar",
            email: "lana@example.com",
            role: "User",
            emailVerified: true,
            status: "active",
            joined: "2026-10-18",
            skills: 7,
            expert: true,
            suspensionReason: null
        },
        {
            id: 5,
            name: "Jana Khaled",
            email: "jana@example.com",
            role: "User",
            emailVerified: false,
            status: "active",
            joined: "2026-10-15",
            skills: 0,
            expert: false,
            suspensionReason: null
        },
        {
            id: 6,
            name: "Noor Ali",
            email: "noor@example.com",
            role: "User",
            emailVerified: true,
            status: "active",
            joined: "2026-10-12",
            skills: 6,
            expert: false,
            suspensionReason: null
        },
        {
            id: 7,
            name: "Yousef Sami",
            email: "yousef@example.com",
            role: "User",
            emailVerified: false,
            status: "active",
            joined: "2026-10-10",
            skills: 0,
            expert: false,
            suspensionReason: null
        },
        {
            id: 8,
            name: "Maya Hassan",
            email: "maya@example.com",
            role: "User",
            emailVerified: true,
            status: "active",
            joined: "2026-10-08",
            skills: 9,
            expert: false,
            suspensionReason: null
        }
    ];

    // let
    // 2. PAGE STATE
    // let

    let pageSize = 5;

    let currentPage = 1;
    let currentFilter = "all";
    let searchQuery = "";
    let selectedUserId = null;
    let activeModal = null;
    let lastFocusedElement = null;

    // let
    // 3. ELEMENT REFERENCES
    // let

    let $ = id => document.getElementById(id);

    let tableBody = $("usersTableBody");
    let usersTable = $("usersTable");
    let emptyState = $("usersEmptyState");

    let searchInput = $("usersSearchInput");

    let detailsModal = $("userDetailsModal");
    let suspendModal = $("suspendUserModal");
    let reactivateModal = $("reactivateUserModal");

    let suspensionReasonInput = $("suspensionReason");
    let suspensionReasonError = $("suspensionReasonError");

    // let
    // 4. HELPERS
    // let

    function escapeHTML(value) {
        return String(value).replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );
    }

    function notify(message, type = "info") {
        if (typeof window.showAdminNotification === "function") {
            window.showAdminNotification(message, type);
        } else {
            alert(message);
        }
    }

    function getUserById(id) {
        return users.find(user => user.id === id);
    }

    function getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("");
    }

    function formatDate(dateString) {
        let date = new Date(dateString + "T00:00:00");

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    // let
    // 5. STATISTICS
    // let

    
function updateStatistics() {
    $("statTotal").textContent = "—";
    $("statVerified").textContent = "—";
    $("statSuspended").textContent = "—";
    $("statExperts").textContent = "—";
}

    // let
    // 6. SEARCH AND FILTER
    // let

    function getFilteredUsers() {
        return users.filter(user => {

            let matchesSearch =
                user.name.toLowerCase().includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery);

            let matchesFilter = true;

            switch (currentFilter) {
                case "active":
                    matchesFilter = user.status === "active";
                    break;

                case "suspended":
                    matchesFilter = user.status === "suspended";
                    break;

                case "unverified":
                    matchesFilter = !user.emailVerified;
                    break;
            }

            return matchesSearch && matchesFilter;
        });
    }

    // let
    // 7. RENDER USER TABLE
    // let

    function renderUsers() {

        let filteredUsers = getFilteredUsers();

        let totalPages = Math.max(
            1,
            Math.ceil(filteredUsers.length / pageSize)
        );

        currentPage = Math.min(currentPage, totalPages);

        let startIndex = (currentPage - 1) * pageSize;

        let visibleUsers = filteredUsers.slice(
            startIndex,
            startIndex + pageSize
        );

        tableBody.innerHTML = visibleUsers.map(user => {

            let isSuspended = user.status === "suspended";

            let verificationBadge = user.emailVerified
                ? `<span class="users-badge verified">
                       ✓ Verified
                   </span>`
                : `<span class="users-badge unverified">
                       ○ Unverified
                   </span>`;

            let statusBadge = isSuspended
                ? `<span class="users-badge suspended">
                       Suspended
                   </span>`
                : `<span class="users-badge active">
                       Active
                   </span>`;

            return `
                <tr>
                    <td>
                        <div class="users-person">
                            <span class="users-avatar">
                                ${getInitials(user.name)}
                            </span>

                            <div class="users-person-info">
                                <strong>${escapeHTML(user.name)}</strong>
                                <small>${escapeHTML(user.email)}</small>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="users-role">
                            ${escapeHTML(user.role)}
                        </span>

                        ${user.expert
                            ? `<span class="users-expert-tag">
                                   ★ Expert
                               </span>`
                            : ""}
                    </td>

                    <td>${verificationBadge}</td>

                    <td>${statusBadge}</td>

                    <td>${formatDate(user.joined)}</td>

                    <td>
                        <div class="users-row-actions">

                            <button
                                type="button"
                                class="users-action-btn"
                                data-action="view"
                                data-id="${user.id}"
                                title="View Details">
                                View
                            </button>

                            ${isSuspended
                                ? `
                                    <button
                                        type="button"
                                        class="users-action-btn success"
                                        data-action="reactivate"
                                        data-id="${user.id}">
                                        Reactivate
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="users-action-btn danger"
                                        data-action="suspend"
                                        data-id="${user.id}">
                                        Suspend
                                    </button>
                                `
                            }

                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        let hasResults = filteredUsers.length > 0;

        usersTable.hidden = !hasResults;
        emptyState.hidden = hasResults;

        let from = hasResults ? startIndex + 1 : 0;
        let to = Math.min(
            startIndex + pageSize,
            filteredUsers.length
        );

        $("usersShowingText").textContent =
            `Showing ${from}–${to} of ${filteredUsers.length} users`;

        $("usersPageInfo").textContent =
            `Page ${currentPage} of ${totalPages}`;

        $("prevUsersPage").disabled = currentPage <= 1;
        $("nextUsersPage").disabled = currentPage >= totalPages;

        updateStatistics();
    }

    // let
    // 8. MODAL MANAGEMENT
    // let

    function openModal(modal) {
        if (!modal) return;

        lastFocusedElement = document.activeElement;
        activeModal = modal;

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        let focusTarget = modal.querySelector(
            "button, input, textarea"
        );

        if (focusTarget) focusTarget.focus();
    }

    function closeModal(modal) {
        if (!modal) return;

        modal.hidden = true;
        document.body.style.overflow = "";

        activeModal = null;
        selectedUserId = null;

        if (
            lastFocusedElement &&
            lastFocusedElement.isConnected
        ) {
            lastFocusedElement.focus();
        }

        lastFocusedElement = null;
    }

    // let
    // 9. VIEW USER DETAILS
    // let

    function viewUser(id) {

        let user = getUserById(id);
        if (!user) return;

        let detailsContent = $("userDetailsContent");

        detailsContent.innerHTML = `
            <div class="users-details-list">

                <div>
                    <span>Full Name</span>
                    <strong>${escapeHTML(user.name)}</strong>
                </div>

                <div>
                    <span>Email Address</span>
                    <strong>${escapeHTML(user.email)}</strong>
                </div>

                <div>
                    <span>Role</span>
                    <strong>${escapeHTML(user.role)}</strong>
                </div>

                <div>
                    <span>Email Verification</span>
                    <strong>
                        ${user.emailVerified
                            ? "Verified"
                            : "Unverified"}
                    </strong>
                </div>

                <div>
                    <span>Account Status</span>
                    <strong>${escapeHTML(user.status)}</strong>
                </div>

                <div>
                    <span>Joined</span>
                    <strong>${formatDate(user.joined)}</strong>
                </div>

                <div>
                    <span>Skills</span>
                    <strong>${user.skills}</strong>
                </div>

                <div>
                    <span>Expert Status</span>
                    <strong>
                        ${user.expert ? "Verified Expert" : "Regular User"}
                    </strong>
                </div>

                ${user.suspensionReason
                    ? `
                        <div>
                            <span>Suspension Reason</span>
                            <strong>
                                ${escapeHTML(user.suspensionReason)}
                            </strong>
                        </div>
                    `
                    : ""}

            </div>
        `;

        openModal(detailsModal);
    }

    // let
    // 10. SUSPEND USER
    // let

    function openSuspendModal(id) {

        let user = getUserById(id);

        if (!user || user.status === "suspended") {
            return;
        }

        selectedUserId = id;

        suspensionReasonInput.value = "";
        suspensionReasonError.hidden = true;

        openModal(suspendModal);
    }

    function confirmSuspension() {

        let user = getUserById(selectedUserId);
        if (!user) return;

        let reason = suspensionReasonInput.value.trim();

        if (reason.length < 10) {
            suspensionReasonError.textContent =
                "Please provide a reason of at least 10 characters.";

            suspensionReasonError.hidden = false;
            suspensionReasonInput.focus();

            return;
        }

        user.status = "suspended";
        user.suspensionReason = reason;

        closeModal(suspendModal);
        renderUsers();

        notify(
            `${user.name}'s account was suspended (demo).`,
            "success"
        );
    }

    // let
    // 11. REACTIVATE USER
    // let

    function openReactivateModal(id) {

        let user = getUserById(id);

        if (!user || user.status !== "suspended") {
            return;
        }

        selectedUserId = id;

        $("reactivateUserName").textContent = user.name;

        openModal(reactivateModal);
    }

    function confirmReactivation() {

        let user = getUserById(selectedUserId);
        if (!user) return;

        user.status = "active";
        user.suspensionReason = null;

        closeModal(reactivateModal);
        renderUsers();

        notify(
            `${user.name}'s account was reactivated (demo).`,
            "success"
        );
    }

    // let
    // 12. TABLE BUTTON EVENTS
    // let

    tableBody.addEventListener("click", function (event) {

        let button = event.target.closest("[data-action]");

        if (!button) return;

        let id = Number(button.dataset.id);
        let action = button.dataset.action;

        if (action === "view") {
            viewUser(id);
        }

        if (action === "suspend") {
            openSuspendModal(id);
        }

        if (action === "reactivate") {
            openReactivateModal(id);
        }
    });

    // let
    // 13. SEARCH
    // let

    searchInput.addEventListener("input", function () {

        searchQuery = this.value.trim().toLowerCase();

        currentPage = 1;

        renderUsers();
    });

    // let
    // 14. FILTER BUTTONS
    // let

    document.querySelectorAll(".users-filter").forEach(
        button => {

            button.addEventListener("click", function () {

                document.querySelectorAll(".users-filter")
                    .forEach(btn => btn.classList.remove("active"));

                this.classList.add("active");

                currentFilter = this.dataset.filter;
                currentPage = 1;

                renderUsers();
            });
        }
    );

    // let
    // 15. PAGINATION
    // let

    $("prevUsersPage").addEventListener("click", function () {

        if (currentPage > 1) {
            currentPage--;
            renderUsers();
        }
    });

    $("nextUsersPage").addEventListener("click", function () {

        let totalPages = Math.ceil(
            getFilteredUsers().length / pageSize
        );

        if (currentPage < totalPages) {
            currentPage++;
            renderUsers();
        }
    });

    // let
    // 16. MODAL BUTTON EVENTS
    // let

    $("closeUserDetails").addEventListener("click", () => {
        closeModal(detailsModal);
    });

    $("doneUserDetails").addEventListener("click", () => {
        closeModal(detailsModal);
    });

    $("closeSuspendModal").addEventListener("click", () => {
        closeModal(suspendModal);
    });

    $("cancelSuspend").addEventListener("click", () => {
        closeModal(suspendModal);
    });

    $("confirmSuspend").addEventListener(
        "click",
        confirmSuspension
    );

    $("closeReactivateModal").addEventListener("click", () => {
        closeModal(reactivateModal);
    });

    $("cancelReactivate").addEventListener("click", () => {
        closeModal(reactivateModal);
    });

    $("confirmReactivate").addEventListener(
        "click",
        confirmReactivation
    );

    // Close when clicking outside modal.
    [
        detailsModal,
        suspendModal,
        reactivateModal
    ].forEach(modal => {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Escape key closes active modal.
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && activeModal) {
            closeModal(activeModal);
        }

        // Keep keyboard focus inside open modal.
        if (event.key === "Tab" && activeModal) {

            let focusable = Array.from(
                activeModal.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), textarea:not([disabled])'
                )
            ).filter(element => element.offsetParent !== null);

            if (!focusable.length) return;

            let first = focusable[0];
            let last = focusable[focusable.length - 1];

            if (event.shiftKey &&
                document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === last
            ) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    // let
    // 17. EXPORT CSV
    // let

    $("exportUsersBtn").addEventListener("click", function () {

        let filteredUsers = getFilteredUsers();

        if (filteredUsers.length === 0) {
            notify("No users available to export.");
            return;
        }

        function csvValue(value) {
            // Escape spreadsheet formulas and CSV quotes.
            let text = String(value ?? "");

            if (/^[\s]*[=+\-@\t\r]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        }

        let rows = [
            [
                "Name",
                "Email",
                "Role",
                "Email Verified",
                "Account Status",
                "Joined",
                "Skills",
                "Expert"
            ],

            ...filteredUsers.map(user => [
                user.name,
                user.email,
                user.role,
                user.emailVerified ? "Yes" : "No",
                user.status,
                user.joined,
                user.skills,
                user.expert ? "Yes" : "No"
            ])
        ];

        let csvContent = rows
            .map(row => row.map(csvValue).join(","))
            .join("\r\n");

        let blob = new Blob(
            ["\uFEFF", csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");

        link.href = url;
        link.download = "skills-swap-users-demo.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        notify("Demo users exported successfully.", "success");
    });

    // let
    // 18. INITIAL RENDER
    // let

    renderUsers();

});
