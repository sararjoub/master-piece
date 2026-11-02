
document.addEventListener('DOMContentLoaded', () => {

    // 1. منطق التنقل بين الخطوات
    window.goToStep = (stepNumber) => {
        // إخفاء كل الخطوات
        document.querySelectorAll('.setup-step').forEach(step => step.classList.remove('active'));
        // إظهار الخطوة المطلوبة
        document.getElementById(`step-${stepNumber}`).classList.add('active');

        // تحديث شريط التقدم
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            let stepNum = index + 1;
            step.classList.remove('active', 'completed');
            if (stepNum < stepNumber) {
                step.classList.add('completed');
                step.querySelector('.progress-circle').textContent = '✓';
            } else if (stepNum === stepNumber) {
                step.classList.add('active');
            }
        });
        
        // إعادة تعيين النص للخطوة النشطة
        let activeCircle = document.querySelector(`.progress-step[data-step="${stepNumber}"] .progress-circle`);
        if (activeCircle) activeCircle.textContent = stepNumber;
    };

    // 2. اختيار المهارات (Chips)
    document.querySelectorAll('.skill-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
        });
    });

    


    // 4. إنهاء الإعداد
    window.finishSetup = () => {
        let btn = event.target;
        let originalText = btn.innerHTML;
        
        // تأثير التحميل
        btn.innerHTML = 'Saving...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // محاكاة الحفظ (لاحقاً سيتم إرسال البيانات للباك إند)
        setTimeout(() => {
            btn.innerHTML = '✓ Setup Complete!';
            btn.style.background = 'var(--success)';
            
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 1000);
        }, 1200);
    };

    // 5. Avatar Upload Logic

    let avatarInput = document.getElementById('avatarInput');
    let uploadBtn = document.getElementById('uploadBtn');
    let avatarPreview = document.getElementById('avatarPreview');

    // عندما يضغط المستخدم على زر Upload Photo
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            avatarInput.click(); // فتح مستكشف الملفات
        });
    }

    // عندما يختار المستخدم صورة
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            let file = e.target.files[0];
            
            if (file) {
                // التحقق من حجم الصورة (مثلاً أقل من 2 ميجا)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Image is too large. Please choose an image under 2MB.');
                    return;
                }

                // استخدام FileReader لقراءة الصورة
                let reader = new FileReader();
                
                reader.onload = (event) => {
                    // تحديث الـ Avatar بالصورة الجديدة
                    avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Profile Picture">`;
                    avatarPreview.classList.add('has-image'); // إضافة كلاس لتغيير الستايل
                };
                
                reader.readAsDataURL(file); // قراءة الصورة كـ Base64
            }
        });
    }
        
    // قائمة المهارات (Mock Data)

   let allSkills = [
    "Web Development", "HTML5", "CSS3", "JavaScript", "React.js", "Node.js",
    "Python", "Django", "SQL", "MongoDB", "Git & GitHub", "UI/UX Design",
    "Figma", "Data Science", "Machine Learning", "Mobile Development",
    "Flutter", "React Native", "Cybersecurity", "Ethical Hacking",
    "Mathematics", "Physics", "Chemistry", "Biology", "English Language",
    "Arabic Language", "French Language", "IELTS", "TOEFL", "History",
    "Geography", "Painting", "Drawing", "Knitting", "Crochet", "Sewing",
    "DIY Projects", "Photography", "Videography", "Video Editing",
    "Music Production", "Guitar", "Piano", "Singing", "Acting",
    "Digital Marketing", "Social Media Marketing", "SEO", "Copywriting",
    "Sales", "Project Management", "Entrepreneurship", "Finance",
    "Accounting", "Excel", "Yoga", "Pilates", "Personal Training",
    "Nutrition", "Weightlifting", "Meditation", "Public Speaking"
];

// دالة إعداد البحث الذكي
function setupSmartSearch(inputId, resultsId, selectedContainerId) {
    let input = document.getElementById(inputId);
    let results = document.getElementById(resultsId);
    let selectedContainer = document.getElementById(selectedContainerId);

    if (!input || !results) return;

    // 1. البحث الفوري عند الكتابة
    input.addEventListener('input', (e) => {
        let query = e.target.value.toLowerCase().trim();
        results.innerHTML = '';

        if (query.length === 0) {
            results.classList.add('hidden');
            return;
        }

        // فلترة المهارات
        let filtered = allSkills.filter(skill => 
            skill.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            results.innerHTML = '<div class="search-no-results">No skills found</div>';
            results.classList.remove('hidden');
            return;
        }

        // عرض النتائج
        filtered.forEach(skill => {
            let item = document.createElement('div');
            item.className = 'search-result-item';
            item.textContent = skill; // <-- تم إزالة الأيقونة هنا
            item.addEventListener('click', () => {
                addSelectedSkill(skill, selectedContainer);
                input.value = '';
                results.classList.add('hidden');
            });
            results.appendChild(item);
        });

        results.classList.remove('hidden');
    });

    // 2. إظهار اقتراحات عند النقر على الحقل (Focus)
    input.addEventListener('focus', () => {
        if (input.value.trim().length === 0) {
            results.innerHTML = '';
            // عرض أول 5 مهارات كاقتراحات
            allSkills.slice(0, 5).forEach(skill => {
                let item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = skill; // <-- تم إزالة الأيقونة هنا
                item.addEventListener('click', () => {
                    addSelectedSkill(skill, selectedContainer);
                    input.value = '';
                    results.classList.add('hidden');
                });
                results.appendChild(item);
            });
            results.classList.remove('hidden');
        }
    });

    // 3. إخفاء النتائج عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !results.contains(e.target)) {
            results.classList.add('hidden');
        }
    });
}

// دالة إضافة المهارة المختارة
function addSelectedSkill(skillName, container) {
    // التحقق من عدم التكرار
    let existing = container.querySelector(`[data-skill="${skillName}"]`);
    if (existing) return;

    let tag = document.createElement('div');
    tag.className = 'selected-skill-tag';
    tag.dataset.skill = skillName;
    tag.innerHTML = `
        <span>${skillName}</span>
        <button type="button" class="remove-skill-btn">✕</button>
    `;
    
    tag.querySelector('.remove-skill-btn').addEventListener('click', () => {
        tag.remove();
    });

    container.appendChild(tag);
}

// تفعيل البحث في الخطوتين
setupSmartSearch('teachSkillSearch', 'teachSearchResults', 'selectedTeachSkills');
setupSmartSearch('learnSkillSearch', 'learnSearchResults', 'selectedLearnSkills');
});