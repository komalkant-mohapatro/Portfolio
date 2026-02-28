document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    const revealElements = document.querySelectorAll('.reveal');

    // Smooth Custom Cursor (Lerp)
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        // Lerp for smoothness
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    };

    // Ensure cursor is visible from the start
    if (cursor) {
        animateCursor();
    }

    // Enhanced Staggered Reveal Logic
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.9;
        const sectionItems = {};

        revealElements.forEach(el => {
            const section = el.closest('.section');
            if (!section) return;
            const sectionId = section.className;
            if (!sectionItems[sectionId]) sectionItems[sectionId] = [];
            sectionItems[sectionId].push(el);
        });

        Object.values(sectionItems).forEach(items => {
            items.forEach((item, index) => {
                const elTop = item.getBoundingClientRect().top;
                if (elTop < triggerBottom) {
                    setTimeout(() => {
                        item.classList.add('active');
                    }, index * 100);
                }
            });
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // Link hover interactions
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            if (cursor) {
                cursor.style.transform = 'scale(4)';
                cursor.style.background = 'rgba(0,0,0,0.1)';
                cursor.style.border = '1px solid #000';
            }
        });
        link.addEventListener('mouseleave', () => {
            if (cursor) {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = '#000';
                cursor.style.border = 'none';
            }
        });
    });

    const interactiveItems = document.querySelectorAll('.skill-item, .project-item, .exp-item, .edu-item, .social-bar a');
    interactiveItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (cursor) {
                cursor.style.transform = 'scale(2.5)';
                cursor.style.background = 'rgba(0, 122, 255, 0.3)';
                cursor.style.border = '2px solid #007aff';
            }
        });
        item.addEventListener('mouseleave', () => {
            if (cursor) {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = '#fff';
                cursor.style.border = 'none';
            }
        });
    });

    // ============================================================
    //  GITHUB CONTRIBUTION CALENDAR
    // ============================================================
    const generateContributionCalendar = async () => {
        const grid = document.getElementById('contributionGrid');
        const monthsEl = document.getElementById('calendarMonths');
        if (!grid || !monthsEl) return;

        const GITHUB_USERNAME = 'komalkant-mohapatro';
        const fmt = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const YEAR = 2026;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
        } catch (err) { console.warn('Could not fetch GitHub contributions:', err); }

        const CELL_PX = 12, GAP_PX = 3, COLS = 53, ROWS = 7;
        grid.innerHTML = ''; monthsEl.innerHTML = '';
        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let lastMonth = -1;

        for (let col = 0; col < COLS; col++) {
            const colSunday = new Date(startDate);
            colSunday.setDate(startDate.getDate() + col * 7);
            const colMonth = colSunday.getMonth();
            if (colMonth !== lastMonth) {
                const xOffset = col * (CELL_PX + GAP_PX);
                const span = document.createElement('span');
                span.textContent = MONTH_NAMES[colMonth];
                span.style.left = xOffset + 'px';
                monthsEl.appendChild(span);
                lastMonth = colMonth;
            }

            for (let row = 0; row < ROWS; row++) {
                const cellDate = new Date(colSunday);
                cellDate.setDate(colSunday.getDate() + row);
                const cell = document.createElement('div');
                cell.className = 'calendar-day';

                if (cellDate > endDate || cellDate < startDate) {
                    cell.style.visibility = 'hidden';
                    cell.setAttribute('data-level', '0');
                } else if (cellDate > today) {
                    cell.style.opacity = '0.15';
                    cell.setAttribute('data-level', '0');
                } else {
                    const key = fmt(cellDate);
                    const info = contribs[key];
                    const count = info ? info.count : 0;
                    const level = info ? info.level : 0;
                    cell.setAttribute('data-level', level);
                    const dateLabel = cellDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    cell.title = count === 0 ? `No contributions on ${dateLabel}` : `${count} contribution${count !== 1 ? 's' : ''} on ${dateLabel}`;
                }

                cell.addEventListener('mouseenter', () => { if (cursor) { cursor.style.transform = 'scale(2)'; cursor.style.background = 'rgba(57, 211, 83, 0.6)'; } });
                cell.addEventListener('mouseleave', () => { if (cursor) { cursor.style.transform = 'scale(1)'; cursor.style.background = '#fff'; } });
                grid.appendChild(cell);
            }
        }
    };

    generateContributionCalendar();

    // ============================================================
    //  MOUSE-FOLLOW GLOW & AUTO-SCROLL SLIDER
    // ============================================================
    const hobbyCards = document.querySelectorAll('.hobby-card');
    hobbyCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    const sliderWrappers = document.querySelectorAll('.hobby-slider-wrapper');
    sliderWrappers.forEach(wrapper => {
        const slider = wrapper.querySelector('.hobby-slider');
        let isDown = false, startX, scrollPos = 0, speed = 0.5, animationID, isHovered = false;

        const animate = () => {
            if (!isDown && !isHovered) {
                scrollPos -= speed;
                const minTranslate = wrapper.offsetWidth - slider.offsetWidth;
                if (scrollPos <= minTranslate) scrollPos = 0;
                slider.style.transform = `translateX(${scrollPos}px)`;
            }
            animationID = requestAnimationFrame(animate);
        };
        animate();

        wrapper.addEventListener('mouseenter', () => isHovered = true);
        wrapper.addEventListener('mouseleave', () => { isHovered = false; isDown = false; });
        wrapper.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - wrapper.offsetLeft - scrollPos; });
        wrapper.addEventListener('mouseup', () => isDown = false);
        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            scrollPos = (e.pageX - wrapper.offsetLeft) - startX;
            const minTranslate = wrapper.offsetWidth - slider.offsetWidth;
            if (scrollPos > 0) scrollPos = 0;
            if (scrollPos < minTranslate) scrollPos = minTranslate;
            slider.style.transform = `translateX(${scrollPos}px)`;
        });

        wrapper.addEventListener('touchstart', (e) => { isDown = true; startX = e.touches[0].clientX - scrollPos; });
        wrapper.addEventListener('touchend', () => isDown = false);
        wrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            scrollPos = e.touches[0].clientX - startX;
            const minTranslate = wrapper.offsetWidth - slider.offsetWidth;
            if (scrollPos > 0) scrollPos = 0;
            if (scrollPos < minTranslate) scrollPos = minTranslate;
            slider.style.transform = `translateX(${scrollPos}px)`;
        });
    });

    // Lightbox Logic
    const albumSlots = document.querySelectorAll('.album-slot');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.close-lightbox');

    function openLightbox(element) {
        const isVideo = element.tagName.toLowerCase() === 'video';
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'none';

        if (isVideo) {
            lightboxVideo.src = element.src;
            lightboxVideo.style.display = 'block';
            const overlay = element.closest('.album-slot').querySelector('.slot-overlay span');
            lightboxCaption.textContent = overlay ? overlay.textContent : 'Performance';
            lightboxVideo.play();
        } else {
            lightboxImg.src = element.src;
            lightboxImg.style.display = 'block';
            const overlay = element.closest('.album-slot').querySelector('.slot-overlay span');
            lightboxCaption.textContent = overlay ? overlay.textContent : 'Hobby Photo';
        }

        lightbox.style.display = 'flex';
        setTimeout(() => lightbox.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxVideo.pause();
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightboxVideo.src = '';
        }, 400);
    };

    albumSlots.forEach(slot => {
        const content = slot.querySelector('img, video');
        if (content) {
            slot.addEventListener('click', () => openLightbox(content));
            slot.style.cursor = 'zoom-in';
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
});
