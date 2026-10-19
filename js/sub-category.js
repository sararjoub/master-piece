document.addEventListener('DOMContentLoaded', () => {

    // 1. قراءة الفئة من الرابط (URL)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryKey = urlParams.get('cat') || 'web-development';

    // 2. قاعدة بيانات وهمية (مؤقتة) للمهارات
    // لاحقاً في الباك إند، هذه البيانات ستأتي من قاعدة البيانات
    const skillsDatabase = {
        'web-development': {
            title: 'Web Development', icon: '💻',
            skills: [
                { name: 'HTML & CSS', level: 'Beginner', price: 'Free', desc: 'Build the structure and style of websites.' },
                { name: 'JavaScript', level: 'Intermediate', price: 'Free', desc: 'Add interactivity and logic to your pages.' },
                { name: 'React.js', level: 'Advanced', price: 'Premium', desc: 'Build modern, component-based user interfaces.' }
            ]
        },
        'ui-ux': {
            title: 'UI/UX Design', icon: '🎨',
            skills: [
                { name: 'Figma Basics', level: 'Beginner', price: 'Free', desc: 'Learn to design user interfaces.' },
                { name: 'User Research', level: 'Intermediate', price: 'Premium', desc: 'Understand user needs and behaviors.' }
            ]
        },
        // يمكنك إضافة باقي الفئات هنا بنفس الطريقة...
    };

    // 3. تحديث واجهة الصفحة بناءً على الفئة
    const categoryData = skillsDatabase[categoryKey] || skillsDatabase['web-development'];
    
    document.getElementById('subCategoryTitle').textContent = categoryData.title;
    document.getElementById('subCategoryIcon').textContent = categoryData.icon;
    document.getElementById('breadcrumbCategory').textContent = categoryData.title;

    // 4. عرض المهارات
    const skillsGrid = document.getElementById('skillsGrid');
    skillsGrid.innerHTML = ''; // مسح المحتوى القديم

    categoryData.skills.forEach(skill => {
        const badgeClass = skill.price === 'Premium' ? 'badge-warning' : 'badge-success';
        
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.innerHTML = `
            <div class="skill-badges">
                <span class="badge badge-info">${skill.level}</span>
                <span class="badge ${badgeClass}">${skill.price}</span>
            </div>
            <h3 class="skill-title">${skill.name}</h3>
            <p class="skill-desc">${skill.desc}</p>
            <button class="start-learning-btn" onclick="showLoginRequired()">Start Learning</button>
        `;
        skillsGrid.appendChild(card);
    });

    // 5. منطق ظهور نافذة تسجيل الدخول
    window.showLoginRequired = () => {
        document.getElementById('loginRequiredModal').classList.remove('hidden');
    };

    document.getElementById('closeLoginModal').addEventListener('click', () => {
        document.getElementById('loginRequiredModal').classList.add('hidden');
    });
});