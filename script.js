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

        // Group items by their section to handle staggering properly
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
                    // Apply delay class based on index within section
                    setTimeout(() => {
                        item.classList.add('active');
                    }, index * 100); // Stagger by 100ms
                }
            });
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Enhanced hover interactions for links
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

    // Add hover effect for section items
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
    //  GITHUB CONTRIBUTION CALENDAR — Exact GitHub Layout
    // ============================================================
    const generateContributionCalendar = async () => {
        const grid = document.getElementById('contributionGrid');
        const monthsEl = document.getElementById('calendarMonths');
        if (!grid || !monthsEl) return;

        const GITHUB_USERNAME = 'komalkant-mohapatro';

        // Helper: format date as YYYY-MM-DD in LOCAL time (avoids UTC shift)
        const fmt = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        // ---- Date range: Strictly Jan 1, 2026 to Dec 31, 2026 ----
        const YEAR = 2026;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start on the first Sunday of 2026 (or common GitHub start)
        const startDate = new Date(YEAR, 0, 1);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Go to preceding Sunday

        const endDate = new Date(YEAR, 11, 31);

        // ---- Fetch real data for year 2026 ----
        let contribs = {};
        try {
            const res = await fetch(
                `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${YEAR}`
            );
            if (res.ok) {
                const json = await res.json();
                json.contributions.forEach(c => {
                    contribs[c.date] = { count: c.count, level: c.level };
                });
            }
        } catch (err) {
            console.warn('Could not fetch GitHub contributions:', err);
        }

        // ---- Build the 53 × 7 grid (top→bottom, left→right) ----
        const CELL_PX = 12;   // must match CSS grid-template-rows value
        const GAP_PX = 3;     // must match CSS gap value
        const COLS = 53;
        const ROWS = 7;

        grid.innerHTML = '';
        monthsEl.innerHTML = '';

        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let lastMonth = -1;

        for (let col = 0; col < COLS; col++) {
            // Sunday of this column
            const colSunday = new Date(startDate);
            colSunday.setDate(startDate.getDate() + col * 7);

            // ---- Month label ----
            // Place label at the start of the column if the month changes.
            const colMonth = colSunday.getMonth();
            if (colMonth !== lastMonth) {
                const xOffset = col * (CELL_PX + GAP_PX);
                const span = document.createElement('span');
                span.textContent = MONTH_NAMES[colMonth];
                span.style.left = xOffset + 'px';
                monthsEl.appendChild(span);
                lastMonth = colMonth;
            }

            // ---- 7 day cells for this column ----
            for (let row = 0; row < ROWS; row++) {
                const cellDate = new Date(colSunday);
                cellDate.setDate(colSunday.getDate() + row);

                const cell = document.createElement('div');
                cell.className = 'calendar-day';

                if (cellDate > endDate || cellDate < startDate) {
                    // Padding cells outside the range — keep structure, hide visually
                    cell.style.visibility = 'hidden';
                    cell.setAttribute('data-level', '0');
                } else if (cellDate > today) {
                    // Future date
                    cell.style.opacity = '0.15';
                    cell.setAttribute('data-level', '0');
                    cell.title = 'Future date';
                } else {
                    const key = fmt(cellDate);
                    const info = contribs[key];
                    const count = info ? info.count : 0;
                    const level = info ? info.level : 0;

                    cell.setAttribute('data-level', level);

                    // Tooltip matching GitHub's style
                    const dateLabel = cellDate.toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    });
                    if (count === 0) {
                        cell.title = `No contributions on ${dateLabel}`;
                    } else {
                        cell.title = `${count} contribution${count !== 1 ? 's' : ''} on ${dateLabel}`;
                    }
                }

                // Cursor hover effect
                cell.addEventListener('mouseenter', () => {
                    if (cursor) {
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
});
