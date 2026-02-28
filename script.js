document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    const revealElements = document.querySelectorAll('.reveal');

    // Smooth Custom Cursor
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
        requestAnimationFrame(animateCursor);
    };
    if (cursor) animateCursor();

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.9;
        revealElements.forEach(item => {
            const elTop = item.getBoundingClientRect().top;
            if (elTop < triggerBottom) item.classList.add('active');
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // Hover UI interactions
    const linkHover = (s, b, br) => { if (!cursor) return; cursor.style.transform = `scale(${s})`; cursor.style.background = b; cursor.style.border = br; };
    document.querySelectorAll('a').forEach(l => {
        l.addEventListener('mouseenter', () => linkHover(4, 'rgba(0,0,0,0.1)', '1px solid #000'));
        l.addEventListener('mouseleave', () => linkHover(1, '#000', 'none'));
    });
    document.querySelectorAll('.skill-item, .project-item, .exp-item, .edu-item').forEach(i => {
        i.addEventListener('mouseenter', () => linkHover(2.5, 'rgba(0, 122, 255, 0.3)', '2px solid #007aff'));
        i.addEventListener('mouseleave', () => linkHover(1, '#fff', 'none'));
    });

    // ============================================================
    //  GITHUB CONTRIBUTION CALENDAR (STRICTLY 2026)
    // ============================================================
    const generateContributionCalendar = async () => {
        const grid = document.getElementById('contributionGrid');
        const monthsEl = document.getElementById('calendarMonths');
        if (!grid || !monthsEl) return;

        const GITHUB_USERNAME = 'komalkant-mohapatro';
        const YEAR = 2026;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Standard GitHub-like grid: Start on the first Sunday of the year (or the Sunday before Jan 1)
        const startDate = new Date(YEAR, 0, 1);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const endDate = new Date(YEAR, 11, 31);

        let contribs = {};
        try {
            const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${YEAR}`);
            if (res.ok) {
                const json = await res.json();
                json.contributions.forEach(c => { contribs[c.date] = { count: c.count, level: c.level }; });
            }
        } catch (err) { console.warn(`GitHub fetch error:`, err); }

        grid.innerHTML = ''; monthsEl.innerHTML = '';
        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let lastMonth = -1;

        const CELL_PX = 12, GAP_PX = 3, COLS = 53;
        for (let col = 0; col < COLS; col++) {
            const colSunday = new Date(startDate);
            colSunday.setDate(startDate.getDate() + col * 7);

            // Month labels alignment
            const colMonth = colSunday.getMonth();
            if (colMonth !== lastMonth && colSunday.getFullYear() === YEAR) {
                const span = document.createElement('span');
                span.textContent = MONTH_NAMES[colMonth];
                span.style.left = (col * (CELL_PX + GAP_PX)) + 'px';
                monthsEl.appendChild(span);
                lastMonth = colMonth;
            }

            for (let row = 0; row < 7; row++) {
                const cellD = new Date(colSunday);
                cellD.setDate(colSunday.getDate() + row);
                const cell = document.createElement('div');
                cell.className = 'calendar-day';

                const key = `${cellD.getFullYear()}-${String(cellD.getMonth() + 1).padStart(2, '0')}-${String(cellD.getDate()).padStart(2, '0')}`;

                // Hide cells that aren't in 2026 (padding for standard 53-week layout)
                if (cellD.getFullYear() !== YEAR) {
                    cell.style.visibility = 'hidden';
                } else {
                    const info = contribs[key];
                    const count = info ? info.count : 0;
                    cell.setAttribute('data-level', info ? info.level : 0);

                    // Future date visual
                    if (cellD > today) {
                        cell.style.opacity = '0.2';
                        cell.style.cursor = 'default';
                    }

                    const dLab = cellD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    cell.title = count === 0 ? `No contributions on ${dLab}` : `${count} contribution${count !== 1 ? 's' : ''} on ${dLab}`;
                }

                cell.addEventListener('mouseenter', () => {
                    if (cursor && cell.style.visibility !== 'hidden') {
                        cursor.style.transform = 'scale(2)';
                        cursor.style.background = 'rgba(57, 211, 83, 0.6)';
                    }
                });
                cell.addEventListener('mouseleave', () => {
                    if (cursor) {
                        cursor.style.transform = 'scale(1)';
                        cursor.style.background = '#fff';
                    }
                });
                grid.appendChild(cell);
            }
        }
    };
    generateContributionCalendar();

    // ============================================================
    //  INTERACTIVE HOBBIES (SCROLL & POINTER TRIGGERED)
    // ============================================================
    const sliders = document.querySelectorAll('.hobby-slider-wrapper');
    sliders.forEach((wrapper, idx) => {
        const slider = wrapper.querySelector('.hobby-slider');
        const card = wrapper.closest('.hobby-card');
        let isDown = false, startX, scrollPos = 0, isHover = false, active = false;

        const animate = () => {
            if (!isDown && !isHover && active) {
                scrollPos -= 0.5;
                const min = wrapper.offsetWidth - slider.offsetWidth;
                if (scrollPos <= min) scrollPos = 0;
                slider.style.transform = `translateX(${scrollPos}px)`;
            }
            requestAnimationFrame(animate);
        };
        animate();

        // Mouse follow glow
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        });

        // Trigger logic
        if (idx === 1) {
            // Photography: Trigger on pointer entering the card
            card.addEventListener('mouseenter', () => active = true);
        } else {
            // Others: Trigger on visibility
            const obs = new IntersectionObserver((es) => { if (es[0].isIntersecting) active = true; }, { threshold: 0.1 });
            obs.observe(card);
        }

        wrapper.addEventListener('mouseenter', () => isHover = true);
        wrapper.addEventListener('mouseleave', () => { isHover = false; isDown = false; });
        wrapper.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - wrapper.offsetLeft - scrollPos; });
        wrapper.addEventListener('mouseup', () => isDown = false);
        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            scrollPos = (e.pageX - wrapper.offsetLeft) - startX;
            const min = wrapper.offsetWidth - slider.offsetWidth;
            if (scrollPos > 0) scrollPos = 0; else if (scrollPos < min) scrollPos = min;
            slider.style.transform = `translateX(${scrollPos}px)`;
        });

        wrapper.addEventListener('touchstart', (e) => { isDown = true; startX = e.touches[0].clientX - scrollPos; });
        wrapper.addEventListener('touchend', () => isDown = false);
        wrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            scrollPos = e.touches[0].clientX - startX;
            const min = wrapper.offsetWidth - slider.offsetWidth;
            if (scrollPos > 0) scrollPos = 0; else if (scrollPos < min) scrollPos = min;
            slider.style.transform = `translateX(${scrollPos}px)`;
        });
    });

    // Lightbox
    const lb = document.getElementById('lightbox'), lbI = document.getElementById('lightbox-img'), lbV = document.getElementById('lightbox-video'), lbC = document.getElementById('lightbox-caption');
    const openLB = (el) => {
        const isV = el.tagName.toLowerCase() === 'video';
        lbI.style.display = 'none'; lbV.style.display = 'none';
        if (isV) { lbV.src = el.src; lbV.style.display = 'block'; lbV.play(); }
        else { lbI.src = el.src; lbI.style.display = 'block'; }
        const s = el.closest('.album-slot').querySelector('.slot-overlay span');
        lbC.textContent = s ? s.textContent : 'Hobby Content';
        lb.style.display = 'flex'; setTimeout(() => lb.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    };
    const closeLB = () => { lb.classList.remove('active'); document.body.style.overflow = ''; lbV.pause(); setTimeout(() => { lb.style.display = 'none'; lbV.src = ''; }, 400); };
    document.querySelectorAll('.album-slot').forEach(s => { const c = s.querySelector('img, video'); if (c) s.addEventListener('click', () => openLB(c)); });
    document.querySelector('.close-lightbox')?.addEventListener('click', closeLB);
    lb?.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('active')) closeLB(); });
});
