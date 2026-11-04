


document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    let $ = id => document.getElementById(id);

    // 1. Default Categories and Demo Subcategories
    let categories = [
        {
            id: 1,
            name: "Technology",
            icon: "💻",
            description: "Programming, design, and IT skills",
            protected: true,
            subcategories: [
                {
                    id: 101,
                    name: "Web Development",
                    description: "Websites and web applications"
                },
                {
                    id: 102,
                    name: "Programming",
                    description: "Programming languages and fundamentals"
                },
                {
                    id: 103,
                    name: "Cybersecurity",
                    description: "Security skills"
                }
            ]
        },
        {
            id: 2,
            name: "Education",
            icon: "🎓",
            description: "Academic and teaching skills",
            protected: true,
            subcategories: [
                {
                    id: 201,
                    name: "Language Learning",
                    description: "Languages and communication"
                },
                {
                    id: 202,
                    name: "Tutoring",
                    description: "Academic support"
                }
            ]
        },
        {
            id: 3,
            name: "Handmade",
            icon: "🎨",
            description: "Crafts, arts, and DIY projects",
            protected: true,
            subcategories: [
                {
                    id: 301,
                    name: "Crafts",
                    description: "Creative handmade projects"
                }
            ]
        },
        {
            id: 4,
            name: "Entertainment",
            icon: "🎬",
            description: "Music, video, and performance",
            protected: true,
            subcategories: [
                {
                    id: 401,
                    name: "Music",
                    description: "Instruments and music skills"
                }
            ]
        },
        {
            id: 5,
            name: "Business",
            icon: "💼",
            description: "Marketing, management, and sales",
            protected: true,
            subcategories: [
                {
                    id: 501,
                    name: "Marketing",
                    description: "Digital and traditional marketing"
                }
            ]
        },
        {
            id: 6,
            name: "Health & Fitness",
            icon: "❤️",
            description: "Sports, nutrition, and wellness",
            protected: true,
            subcategories: [
                {
                    id: 601,
                    name: "Fitness",
                    description: "Movement and physical training"
                }
            ]
        }
    ];

    // 2. State
    let nextCategoryId = 7;
    let nextSubcategoryId = 1000;

    let editingCategoryId = null;
    let activeCategoryId = null;
    let editingSubcategoryId = null;
    let returnToDetails = false;

    let grid = $("categoriesGrid");

    let modals = [
        ...document.querySelectorAll(".modal-overlay")
    ];

    let palettes = [
        "#dbe4ff",
        "#d4e8ff",
        "#fbe1f0",
        "#fff0c2",
        "#d4f9e8",
        "#ffe0e0"
    ];

    // 3. Helpers
    function categoryById(id) {
        return categories.find(category => category.id === id);
    }

    function notify(message, type = "info") {
        if (typeof window.showAdminNotification === "function") {
            window.showAdminNotification(message, type);
        } else {
            alert(message);
        }
    }

    function element(tag, className, text) {
        let node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        if (text !== undefined) {
            node.textContent = text;
        }

        return node;
    }

    function actionButton(label, title, handler, disabled = false) {
        let button = element("button", "", label);

        button.type = "button";
        button.title = title;
        button.setAttribute("aria-label", title);
        button.disabled = disabled;

        button.addEventListener("click", handler);

        return button;
    }

    // 4. Modal Functions
    function openModal(id) {
        modals.forEach(modal => {
            modal.classList.add("hidden");
        });

        let modal = $(id);

        if (!modal) return;

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";

        let first = modal.querySelector(
            'input:not([readonly]), button'
        );

        if (first) {
            first.focus();
        }
    }

    function closeModal() {
        modals.forEach(modal => {
            modal.classList.add("hidden");
        });

        document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-close-modal]")
        .forEach(button => {
            button.addEventListener("click", closeModal);
        });

    modals.forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal();
            }
        });
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            modals.some(modal => !modal.classList.contains("hidden"))
        ) {
            closeModal();
        }
    });

    // 5. Render Category Cards
    function renderCategories() {
        grid.replaceChildren();

        categories.forEach((category, index) => {
            let card = element("article", "category-card");

            let header = element(
                "div",
                "category-card-header"
            );

            let icon = element(
                "div",
                "category-card-icon",
                category.icon
            );

            icon.style.background =
                palettes[index % palettes.length];

            let actions = element(
                "div",
                "category-card-actions"
            );

            actions.append(
                actionButton(
                    "👁️",
                    "View " + category.name,
                    () => showDetails(category.id)
                ),

                actionButton(
                    "✏️",
                    "Edit " + category.name,
                    () => openCategoryForm(category.id)
                ),

                actionButton(
                    "🗑️",
                    category.protected
                        ? "Default categories cannot be deleted"
                        : "Delete " + category.name,
                    () => deleteCategory(category.id),
                    category.protected
                )
            );

            header.append(icon, actions);

            let footer = element(
                "div",
                "category-card-footer"
            );

            footer.append(
                element(
                    "small",
                    "",
                    `${category.subcategories.length} demo subcategories`
                ),
                element(
                    "span",
                    "admin-badge admin-badge-success",
                    "Active"
                )
            );

            let addSub = actionButton(
                "+ Add Subcategory",
                "Add subcategory to " + category.name,
                () => openSubcategoryForm(category.id)
            );

            addSub.className = "category-card-subaction";

            card.append(
                header,
                element(
                    "h3",
                    "category-card-title",
                    category.name
                ),
                element(
                    "p",
                    "category-card-desc",
                    category.description
                ),
                footer,
                addSub
            );

            grid.append(card);
        });

        // Add New Category Card
        let add = actionButton(
            "+",
            "Add New Category",
            () => openCategoryForm()
        );

        add.className = "category-card category-card-add";

        add.replaceChildren(
            element("span", "category-add-icon", "+"),
            element(
                "span",
                "category-add-text",
                "Add New Category"
            )
        );

        grid.append(add);
    }

    // 6. Add / Edit Category
    function openCategoryForm(id = null) {
        editingCategoryId = id;

        let category =
            id === null ? null : categoryById(id);

        $("categoryModalTitle").textContent = category
            ? "Edit Category"
            : "Add New Category";

        $("saveCategoryBtn").textContent = category
            ? "Save Changes"
            : "Add Category";

        $("categoryName").value = category?.name || "";
        $("categoryIcon").value = category?.icon || "";
        $("categoryDescription").value =
            category?.description || "";

        openModal("categoryModal");
    }

    $("addCategoryBtn").addEventListener("click", () => {
        openCategoryForm();
    });

    $("categoryForm").addEventListener("submit", event => {
        event.preventDefault();

        let name = $("categoryName").value.trim();

        let icon =
            $("categoryIcon").value.trim() || "📁";

        let description =
            $("categoryDescription").value.trim() ||
            "No description provided";

        if (!name) {
            notify("Please enter a category name.", "error");
            return;
        }

        let duplicate = categories.some(category =>
            category.name.toLowerCase() === name.toLowerCase() &&
            category.id !== editingCategoryId
        );

        if (duplicate) {
            notify("This category already exists.", "error");
            return;
        }

        if (editingCategoryId === null) {
            categories.push({
                id: nextCategoryId++,
                name,
                icon,
                description,
                protected: false,
                subcategories: []
            });
        } else {
            let category = categoryById(editingCategoryId);

            if (!category) return;

            Object.assign(category, {
                name,
                icon,
                description
            });
        }

        closeModal();
        renderCategories();

        notify(
            "Demo category saved for this session.",
            "success"
        );
    });

    // 7. Delete Category
    function deleteCategory(id) {
        let category = categoryById(id);

        if (!category) return;

        if (category.protected) {
            notify(
                "Default categories cannot be deleted.",
                "error"
            );
            return;
        }

        if (category.subcategories.length) {
            notify(
                "Remove or move its subcategories before deleting this category.",
                "error"
            );
            return;
        }

        let confirmed = confirm(
            `Delete "${category.name}" from the demo?`
        );

        if (!confirmed) return;

        categories.splice(categories.indexOf(category), 1);

        renderCategories();

        notify("Demo category deleted.", "info");
    }

    // 8. View Category Details
    function showDetails(id) {
        let category = categoryById(id);

        if (!category) return;

        activeCategoryId = id;

        $("detailsTitle").textContent = "Category Details";
        $("detailsIcon").textContent = category.icon;
        $("detailsName").textContent = category.name;
        $("detailsDescription").textContent =
            category.description;

        renderSubcategories(category);

        openModal("detailsModal");
    }

    // 9. Render Subcategories
    function renderSubcategories(category) {
        let list = $("subcategoriesList");

        list.replaceChildren();

        if (!category.subcategories.length) {
            list.append(
                element(
                    "div",
                    "subcategory-empty",
                    "No subcategories yet. Add the first one."
                )
            );
            return;
        }

        category.subcategories.forEach(subcategory => {
            let row = element("div", "subcategory-row");

            let info = element("div");

            info.append(
                element("strong", "", subcategory.name),
                element(
                    "p",
                    "",
                    subcategory.description || "No description"
                )
            );

            let actions = element(
                "div",
                "subcategory-actions"
            );

            actions.append(
                actionButton(
                    "✏️",
                    "Edit " + subcategory.name,
                    () => openSubcategoryForm(
                        category.id,
                        subcategory.id
                    )
                ),

                actionButton(
                    "🗑️",
                    "Delete " + subcategory.name,
                    () => deleteSubcategory(
                        category.id,
                        subcategory.id
                    )
                )
            );

            row.append(info, actions);
            list.append(row);
        });
    }

    // 10. Add / Edit Subcategory
    function openSubcategoryForm(categoryId, subId = null) {
        let category = categoryById(categoryId);

        if (!category) return;

        activeCategoryId = categoryId;
        editingSubcategoryId = subId;

        let subcategory = category.subcategories.find(
            sub => sub.id === subId
        );

        $("subcategoryModalTitle").textContent = subcategory
            ? "Edit Subcategory"
            : "Add Subcategory";

        $("subcategoryParent").value = category.name;
        $("subcategoryName").value =
            subcategory?.name || "";

        $("subcategoryDescription").value =
            subcategory?.description || "";

        returnToDetails = !$("detailsModal")
            .classList.contains("hidden");

        openModal("subcategoryModal");
    }

    $("addSubcategoryBtn").addEventListener("click", () => {
        openSubcategoryForm(activeCategoryId);
    });

    $("subcategoryForm").addEventListener("submit", event => {
        event.preventDefault();

        let category = categoryById(activeCategoryId);

        if (!category) return;

        let name = $("subcategoryName").value.trim();

        let description =
            $("subcategoryDescription").value.trim();

        if (!name) {
            notify(
                "Please enter a subcategory name.",
                "error"
            );
            return;
        }

        let duplicate = category.subcategories.some(
            sub =>
                sub.name.toLowerCase() === name.toLowerCase() &&
                sub.id !== editingSubcategoryId
        );

        if (duplicate) {
            notify(
                "This subcategory already exists in this category.",
                "error"
            );
            return;
        }

        if (editingSubcategoryId === null) {
            category.subcategories.push({
                id: nextSubcategoryId++,
                name,
                description
            });
        } else {
            let subcategory = category.subcategories.find(
                sub => sub.id === editingSubcategoryId
            );

            if (!subcategory) return;

            Object.assign(subcategory, {
                name,
                description
            });
        }

        renderCategories();

        if (returnToDetails) {
            showDetails(category.id);
        } else {
            closeModal();
        }

        notify(
            "Demo subcategory saved for this session.",
            "success"
        );
    });

    // 11. Delete Subcategory
    function deleteSubcategory(categoryId, subId) {
        let category = categoryById(categoryId);

        if (!category) return;

        let subcategory = category.subcategories.find(
            sub => sub.id === subId
        );

        if (!subcategory) return;

        let confirmed = confirm(
            `Delete "${subcategory.name}"? ` +
            "In the real system, linked skills must be checked first."
        );

        if (!confirmed) return;

        category.subcategories.splice(
            category.subcategories.indexOf(subcategory),
            1
        );

        renderCategories();
        renderSubcategories(category);

        notify("Demo subcategory deleted.", "info");
    }

    // 12. Initial Render
    renderCategories();
});
