
/* ==========================================
   SKILLS SWAP - MANAGE SKILLS
   Frontend Demo
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // 1. Demo Data
    let skills = [
        {
            id: 1,
            name: "Python Programming",
            description: "Programming language",
            icon: "🐍",
            category: "Technology",
            level: "beginner",
            type: "free",
            users: 45
        },
        {
            id: 2,
            name: "Graphic Design",
            description: "Visual design skills",
            icon: "🎨",
            category: "Handmade",
            level: "intermediate",
            type: "premium",
            users: 32
        },
        {
            id: 3,
            name: "Web Development",
            description: "Full-stack development",
            icon: "💻",
            category: "Technology",
            level: "advanced",
            type: "premium",
            users: 68
        },
        {
            id: 4,
            name: "Yoga Basics",
            description: "Fitness and wellness",
            icon: "🧘",
            category: "Health",
            level: "beginner",
            type: "free",
            users: 24
        },
        {
            id: 5,
            name: "JavaScript",
            description: "Programming language",
            icon: "⚡",
            category: "Technology",
            level: "beginner",
            type: "free",
            users: 52
        },
        {
            id: 6,
            name: "UI/UX Design",
            description: "User interface design",
            icon: "🎨",
            category: "Technology",
            level: "intermediate",
            type: "premium",
            users: 38
        },
        {
            id: 7,
            name: "Photography",
            description: "Camera and composition",
            icon: "📷",
            category: "Handmade",
            level: "beginner",
            type: "free",
            users: 29
        },
        {
            id: 8,
            name: "React",
            description: "Frontend framework",
            icon: "⚛️",
            category: "Technology",
            level: "advanced",
            type: "premium",
            users: 41
        }
    ];

    // 2. State
    let pageSize = 5;

    let currentPage = 1;
    let currentFilter = "all";
    let searchQuery = "";
    let selectedIds = new Set();

    // 3. Elements
    let $ = id => document.getElementById(id);

    let tableBody = $("skillsTableBody");
    let skillsTable = $("skillsTable");
    let emptyState = $("skillsEmptyState");
    let searchInput = $("skillsSearchInput");
    let selectAll = $("selectAllSkills");
    let bulkBar = $("bulkActionsBar");

    // 4. Helpers
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

    function capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function getFilteredSkills() {
        return skills.filter(skill => {
            let text = [
                skill.name,
                skill.description,
                skill.category,
                skill.level,
                skill.type
            ].join(" ").toLowerCase();

            let matchesSearch = text.includes(searchQuery);

            let matchesFilter =
                currentFilter === "all" ||
                skill.type === currentFilter ||
                skill.level === currentFilter;

            return matchesSearch && matchesFilter;
        });
    }

    // 5. Render Table
    function renderSkills() {
        let filtered = getFilteredSkills();

        let totalPages = Math.max(
            1,
            Math.ceil(filtered.length / pageSize)
        );

        currentPage = Math.min(currentPage, totalPages);

        let start = (currentPage - 1) * pageSize;
        let visible = filtered.slice(start, start + pageSize);

        tableBody.innerHTML = visible.map(skill => {
            let typeClass = skill.type === "free"
                ? "admin-badge-success"
                : "admin-badge-warning";

            let levelClass = skill.level === "advanced"
                ? "admin-badge-warning"
                : "admin-badge-info";

            return `
                <tr data-id="${skill.id}">
                    <td>
                        <input
                            type="checkbox"
                            class="skill-checkbox"
                            data-id="${skill.id}"
                            aria-label="Select ${escapeHTML(skill.name)}"
                            ${selectedIds.has(skill.id) ? "checked" : ""}
                        >
                    </td>

                    <td>
                        <div class="admin-table-user">
                            <div class="admin-table-avatar">
                                ${skill.icon}
                            </div>

                            <div class="admin-table-user-info">
                                <div class="admin-table-user-name">
                                    ${escapeHTML(skill.name)}
                                </div>
                                <div class="admin-table-user-email">
                                    ${escapeHTML(skill.description)}
                                </div>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="admin-badge admin-badge-primary">
                            ${escapeHTML(skill.category)}
                        </span>
                    </td>

                    <td>
                        <span class="admin-badge ${levelClass}">
                            ${capitalize(skill.level)}
                        </span>
                    </td>

                    <td>
                        <span class="admin-badge ${typeClass}">
                            ${capitalize(skill.type)}
                        </span>
                    </td>

                    <td>
                        <strong>${skill.users}</strong> users
                    </td>

                    <td>
                        <div class="admin-table-actions">
                            <a
                                href="add-edit-skill.html"
                                class="admin-table-action-btn"
                                title="Edit skill"
                                aria-label="Edit ${escapeHTML(skill.name)}"
                            >✏️</a>

                            <button
                                type="button"
                                class="admin-table-action-btn danger"
                                data-action="delete"
                                data-id="${skill.id}"
                                title="Delete skill"
                                aria-label="Delete ${escapeHTML(skill.name)}"
                            >🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        // Empty State
        let hasResults = filtered.length > 0;

        skillsTable.hidden = !hasResults;
        emptyState.hidden = hasResults;
        emptyState.classList.toggle("hidden", hasResults);

        // Pagination Info
        let from = hasResults ? start + 1 : 0;
        let to = Math.min(start + pageSize, filtered.length);

        $("skillsShowingText").textContent =
            hasResults
                ? `Showing ${from}–${to} of ${filtered.length} demo skills`
                : "Showing 0 demo skills";

        $("skillsPageInfo").textContent =
            `Page ${currentPage} of ${totalPages}`;

        $("prevSkillsPage").disabled = currentPage <= 1;
        $("nextSkillsPage").disabled = currentPage >= totalPages;

        updateSelection();
    }

    // 6. Search
    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        selectedIds.clear();
        renderSkills();
    });

    // 7. Filters
    document.querySelectorAll(".admin-filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".admin-filter-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");
            currentFilter = button.dataset.filter;
            currentPage = 1;
            selectedIds.clear();

            renderSkills();
        });
    });

    // 8. Selection
    function updateSelection() {
        let checkboxes = Array.from(
            tableBody.querySelectorAll(".skill-checkbox")
        );

        checkboxes.forEach(checkbox => {
            let id = Number(checkbox.dataset.id);
            checkbox.checked = selectedIds.has(id);

            checkbox.closest("tr").classList.toggle(
                "selected",
                checkbox.checked
            );
        });

        let allChecked =
            checkboxes.length > 0 &&
            checkboxes.every(cb => cb.checked);

        selectAll.checked = allChecked;

        selectAll.indeterminate =
            checkboxes.some(cb => cb.checked) && !allChecked;

        $("selectedCount").textContent = selectedIds.size;

        let hasSelection = selectedIds.size > 0;

        bulkBar.classList.toggle("hidden", !hasSelection);
        bulkBar.classList.toggle("show", hasSelection);
    }

    selectAll.addEventListener("change", () => {
        tableBody.querySelectorAll(".skill-checkbox")
            .forEach(checkbox => {
                let id = Number(checkbox.dataset.id);

                if (selectAll.checked) {
                    selectedIds.add(id);
                } else {
                    selectedIds.delete(id);
                }
            });

        updateSelection();
    });

    // Table Events
    tableBody.addEventListener("change", event => {
        if (!event.target.matches(".skill-checkbox")) return;

        let id = Number(event.target.dataset.id);

        if (event.target.checked) {
            selectedIds.add(id);
        } else {
            selectedIds.delete(id);
        }

        updateSelection();
    });

    // 9. Delete Single Skill
    tableBody.addEventListener("click", event => {
        let button = event.target.closest('[data-action="delete"]');

        if (!button) return;

        let id = Number(button.dataset.id);
        let skill = skills.find(item => item.id === id);

        if (!skill) return;

        let confirmed = confirm(
            `Delete "${skill.name}" from the demo list?`
        );

        if (!confirmed) return;

        skills = skills.filter(item => item.id !== id);
        selectedIds.delete(id);

        renderSkills();

        notify("Demo skill removed from this page.", "success");
    });

    // 10. Bulk Actions
    function getSelectedSkills() {
        return skills.filter(skill => selectedIds.has(skill.id));
    }

    function clearSelection() {
        selectedIds.clear();
        updateSelection();
    }

    $("bulkCancel").addEventListener("click", clearSelection);

    $("bulkActivate").addEventListener("click", () => {
        let selected = getSelectedSkills();

        if (!selected.length) return;

        selected.forEach(skill => {
            skill.type = "free";
        });

        clearSelection();
        renderSkills();

        notify(
            `${selected.length} demo skills marked as Free.`,
            "success"
        );
    });

    $("bulkBan").addEventListener("click", () => {
        let selected = getSelectedSkills();

        if (!selected.length) return;

        selected.forEach(skill => {
            skill.type = "premium";
        });

        clearSelection();
        renderSkills();

        notify(
            `${selected.length} demo skills marked as Premium.`,
            "success"
        );
    });

    $("bulkDelete").addEventListener("click", () => {
        let selected = getSelectedSkills();

        if (!selected.length) return;

        let confirmed = confirm(
            `Delete ${selected.length} selected demo skills?`
        );

        if (!confirmed) return;

        skills = skills.filter(skill => !selectedIds.has(skill.id));

        clearSelection();
        renderSkills();

        notify(
            `${selected.length} demo skills removed.`,
            "success"
        );
    });

    // 11. Pagination
    $("prevSkillsPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            selectedIds.clear();
            renderSkills();
        }
    });

    $("nextSkillsPage").addEventListener("click", () => {
        let totalPages = Math.ceil(
            getFilteredSkills().length / pageSize
        );

        if (currentPage < totalPages) {
            currentPage++;
            selectedIds.clear();
            renderSkills();
        }
    });

    // 12. Export CSV
    $("exportSkillsBtn").addEventListener("click", () => {
        let filtered = getFilteredSkills();

        if (!filtered.length) {
            notify("No skills available to export.", "info");
            return;
        }

        function csvValue(value) {
            let text = String(value ?? "");

            if (/^\s*[=+\-@\t\r]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        }

        let rows = [
            ["Skill", "Category", "Level", "Type", "Users"],
            ...filtered.map(skill => [
                skill.name,
                skill.category,
                skill.level,
                skill.type,
                skill.users
            ])
        ];

        let csv = rows
            .map(row => row.map(csvValue).join(","))
            .join("\r\n");

        let blob = new Blob(
            ["\uFEFF", csv],
            { type: "text/csv;charset=utf-8;" }
        );

        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");

        link.href = url;
        link.download = "skills-swap-skills-demo.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        notify("Demo skills exported successfully.", "success");
    });

    // 13. Mobile Sidebar Accessibility
    let sidebarToggle = $("adminSidebarToggle");
    let sidebar = $("adminSidebar");
    let overlay = $("adminSidebarOverlay");

    if (sidebarToggle && sidebar) {
        function syncSidebarState() {
            sidebarToggle.setAttribute(
                "aria-expanded",
                String(sidebar.classList.contains("open"))
            );
        }

        sidebarToggle.addEventListener("click", () => {
            syncSidebarState();
        });

        if (overlay) {
            overlay.addEventListener("click", syncSidebarState);
        }

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                sidebar.classList.remove("open");

                if (overlay) {
                    overlay.classList.remove("open");
                }

                syncSidebarState();
            }
        });
    }

    // 14. Initial Render
    renderSkills();
});
