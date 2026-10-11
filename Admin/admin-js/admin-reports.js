/* ============================================
   ===== REPORTS PAGE - JavaScript =====
   ===== Charts + Animations =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. BAR CHART - Users Growth
    // ============================================
    const usersChart = document.getElementById('usersChart');

    // بيانات تجريبية (12 شهر)
    const usersData = [120, 145, 132, 168, 195, 178, 210, 245, 268, 290, 312, 358];

    function createBarChart() {
        if (!usersChart) return;

        usersChart.innerHTML = '';

        const maxValue = Math.max(...usersData);

        usersData.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.dataset.value = value + ' users';

            // حساب الارتفاع النسبي
            const heightPercent = (value / maxValue) * 100;

            // تأخير متدرج
            const delay = index * 80;

            setTimeout(() => {
                bar.style.height = heightPercent + '%';
                bar.classList.add('animate');
            }, delay + 300);

            usersChart.appendChild(bar);
        });
    }

    // تشغيل عند ظهور الـ Chart
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createBarChart();
                chartObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (usersChart) chartObserver.observe(usersChart);

    // ============================================
    // 2. LINE CHART - Swaps Over Time
    // ============================================
    const swapsChart = document.getElementById('swapsChart');

    const swapsData = [42, 58, 65, 82, 95, 110];
    const chartWidth = 100;
    const chartHeight = 100;

    function createLineChart() {
        if (!swapsChart) return;

        const maxValue = Math.max(...swapsData);
        const padding = 10;

        // حساب النقاط
        const points = swapsData.map((value, index) => {
            const x = padding + (index * (chartWidth - 2 * padding) / (swapsData.length - 1));
            const y = chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
            return { x, y, value };
        });

        // إنشاء Path للـ Line
        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        // إنشاء Path للـ Area
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

        // إنشاء SVG
        const svg = `
            <svg class="chart-line-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#8b7cf6"/>
                        <stop offset="100%" stop-color="#a78bfa"/>
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#8b7cf6" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#8b7cf6" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <path class="chart-area-path" d="${areaPath}"/>
                <path class="chart-line-path" d="${linePath}"/>
                ${points.map(p => `
                    <circle class="chart-point" cx="${p.x}" cy="${p.y}" r="4">
                        <title>${p.value} swaps</title>
                    </circle>
                `).join('')}
            </svg>
        `;

        swapsChart.innerHTML = svg;
    }

    const lineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createLineChart();
                lineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (swapsChart) lineObserver.observe(swapsChart);

    // ============================================
    // 3. TOP SKILLS BARS - Animation
    // ============================================
    const skillFills = document.querySelectorAll('.top-skill-fill');

    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const targetWidth = fill.dataset.width;
                setTimeout(() => {
                    fill.style.width = targetWidth;
                }, 200);
                skillsObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(fill => skillsObserver.observe(fill));

    // ============================================
    // 4. Count-up Animation (Summary Cards)
    // ============================================
    const statValues = document.querySelectorAll('.admin-stat-value[data-count]');

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.dataset.animated) {
                    el.dataset.animated = 'true';
                    animateCountUp(el);
                }
                countObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    statValues.forEach(el => countObserver.observe(el));

    function animateCountUp(element) {
        const target = parseFloat(element.dataset.count);
        const isDecimal = element.dataset.decimal === 'true';
        const duration = 1500;
        const startTime = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (target - startValue) * eased;

            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (isDecimal) {
                    element.textContent = target.toFixed(1);
                } else {
                    element.textContent = target.toLocaleString();
                }
            }
        };

        requestAnimationFrame(animate);
    }

    // ============================================
    // 5. Time Range Select
    // ============================================
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', (e) => {
            const range = e.target.value;
            const rangeLabels = {
                '7d': 'Last 7 days',
                '30d': 'Last 30 days',
                '90d': 'Last 90 days',
                '1y': 'Last year'
            };

            showAdminNotification(`Loading data for: ${rangeLabels[range]}`, 'info');

            // إعادة تشغيل الـ Charts
            setTimeout(() => {
                createBarChart();
                createLineChart();
            }, 300);
        });
    }

    // ============================================
    // 6. Export Report
    // ============================================
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showAdminNotification('Generating PDF report... (Coming soon)', 'info');
        });
    }

    // ============================================
    // 7. Chart Bar Click
    // ============================================
    document.addEventListener('click', (e) => {
        const bar = e.target.closest('.chart-bar');
        if (bar) {
            showAdminNotification(`Value: ${bar.dataset.value}`, 'info');
        }
    });

});