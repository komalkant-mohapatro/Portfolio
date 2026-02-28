document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  INTERACTIVE COSMIC CANVAS BACKGROUND
    // ============================================================
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        document.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class AntigravityDash {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Properties for dash rendering (Very small as requested)
                this.length = Math.random() * 3 + 1.5;
                this.thickness = Math.random() * 0.8 + 0.5;
                // Orbital mechanics
                let centerX = width / 2;
                let centerY = height / 2;
                this.radius = Math.sqrt(Math.pow(this.x - centerX, 2) + Math.pow(this.y - centerY, 2));
                this.angle = Math.atan2(this.y - centerY, this.x - centerX);
                // Speed depends inversely on distance from center to mimic a galaxy/vortex
                this.angularVelocity = (Math.random() * 0.001 + 0.0005) * (1500 / Math.max(this.radius, 100));

                // Track base position to allow elasticity against mouse
                this.baseRadius = this.radius;
            }

            getColor(opacity) {
                // Map X position to Hue. Left side: Blues (220), Right side: Reds/Yellows (0 - 60)
                let normalizedX = this.x / width;

                // Color curve:
                // 0.0 -> Blue (200)
                // 1.0 -> Yellow/Orange (30 - 50)
                let hue = 200 - (normalizedX * 180);
                if (hue < 0) hue += 360;

                let saturation = 90 + Math.random() * 10;
                let lightness = 55 + Math.random() * 15;
                return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
            }

            update() {
                let centerX = width / 2;
                let centerY = height / 2;
                let opacity = 0; // Default invisible

                // Advance orbit
                this.angle += this.angularVelocity;

                // Return slowly to base orbit
                if (this.radius !== this.baseRadius) {
                    this.radius += (this.baseRadius - this.radius) * 0.05;
                }

                // Mouse Interaction and Visibility
                let actualX = centerX + Math.cos(this.angle) * this.radius;
                let actualY = centerY + Math.sin(this.angle) * this.radius;

                if (mouse.x != null) {
                    let dx = mouse.x - actualX;
                    let dy = mouse.y - actualY;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    let visibilityRadius = 250; // Visible within 250px of cursor

                    if (distance < visibilityRadius) {
                        // Fade out smoothly towards the edge of the radius
                        opacity = 1 - (distance / visibilityRadius);
                        // Apply easing to make it glow stronger near the center
                        opacity = Math.pow(opacity, 1.5);

                        // Gentle Repulsion
                        if (distance < mouse.radius) {
                            let force = (mouse.radius - distance) / mouse.radius;
                            // Push radius outwards slightly
                            this.radius += force * 5;
                        }
                    }
                }

                // Recalculate physical position
                this.x = centerX + Math.cos(this.angle) * this.radius;
                this.y = centerY + Math.sin(this.angle) * this.radius;

                // Only draw if visible to save performance
                if (opacity > 0.01) {
                    this.draw(opacity);
                }
            }

            draw(opacity) {
                ctx.save();
                ctx.translate(this.x, this.y);

                // Tangential alignment: orbit angle + 90 degrees (Math.PI/2)
                ctx.rotate(this.angle + Math.PI / 2);

                ctx.beginPath();
                ctx.moveTo(0, -this.length / 2);
                ctx.lineTo(0, this.length / 2);

                ctx.strokeStyle = this.getColor(opacity);
                ctx.lineWidth = this.thickness;
                ctx.lineCap = 'round';
                ctx.stroke();

                ctx.restore();
            }
        }

        const initParticles = () => {
            particles = [];
            // High particle count to form a lush swirl
            const numParticles = Math.floor((width * height) / 4000);
            for (let i = 0; i < numParticles; i++) {
                particles.push(new AntigravityDash());
            }
        };

        const animateCanvas = () => {
            // Because particles are only visible near the mouse, we can fully clear 
            // the canvas without needing the dark trail effect overlay.
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            requestAnimationFrame(animateCanvas);
        };

        resize();
        animateCanvas();
    }

    // Trigger staggered cinematic text reveal on load
    setTimeout(() => {
        document.body.classList.add('ready');
    }, 100);

    const cursor = document.querySelector('.cursor');
    const revealElements = document.querySelectorAll('.reveal');

    // ============================================================
    //  TOUCH DEVICE DETECTION
    // ============================================================
    const isTouchDevice = ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        window.matchMedia('(hover: none)').matches;

    // ============================================================
    //  CUSTOM CURSOR (Desktop only)
    // ============================================================
    if (!isTouchDevice && cursor) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.25;
            cursorY += (mouseY - cursorY) * 0.25;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Hover UI interactions (desktop only)
        const linkHover = (s, b, br) => {
            cursor.style.transform = `scale(${s})`;
            cursor.style.background = b;
            cursor.style.border = br;
        };
        document.querySelectorAll('a').forEach(l => {
            l.addEventListener('mouseenter', () => linkHover(4, 'rgba(255,255,255,0.1)', '1px solid rgba(255,255,255,0.5)'));
            l.addEventListener('mouseleave', () => linkHover(1, '#fff', 'none'));
        });
        document.querySelectorAll('.skill-item, .project-item, .exp-item, .edu-item').forEach(i => {
            i.addEventListener('mouseenter', () => linkHover(2.5, 'rgba(0, 122, 255, 0.3)', '2px solid #007aff'));
            i.addEventListener('mouseleave', () => linkHover(1, '#fff', 'none'));
        });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    // ============================================================
    //  SCROLL REVEAL
    // ============================================================
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.9;
        revealElements.forEach(item => {
            const elTop = item.getBoundingClientRect().top;
            if (elTop < triggerBottom) item.classList.add('active');
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // ============================================================
    //  PROJECT CARD CLICK-TO-FLIP (All devices)
    // ============================================================
    document.querySelectorAll('.project-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.project-item');
            card.classList.add('flipped');
        });
    });

    document.querySelectorAll('.project-back').forEach(back => {
        back.addEventListener('click', (e) => {
            if (!e.target.closest('.project-link')) {
                const card = back.closest('.project-item');
                card.classList.remove('flipped');
            }
        });
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

                if (cellD.getFullYear() !== YEAR) {
                    cell.style.visibility = 'hidden';
                } else {
                    const info = contribs[key];
                    const count = info ? info.count : 0;
                    cell.setAttribute('data-level', info ? info.level : 0);

                    if (cellD > today) {
                        cell.style.opacity = '0.2';
                        cell.style.cursor = 'default';
                    }

                    const dLab = cellD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    cell.title = count === 0 ? `No contributions on ${dLab}` : `${count} contribution${count !== 1 ? 's' : ''} on ${dLab}`;
                }

                // Cursor interaction (desktop only)
                if (!isTouchDevice) {
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
                }
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

        // Mouse follow glow (desktop only)
        if (!isTouchDevice) {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
            });
        }

        // On touch devices: always use IntersectionObserver for all sliders
        // On desktop: use hover-based trigger for photography, observer for others
        if (isTouchDevice) {
            const obs = new IntersectionObserver((es) => { if (es[0].isIntersecting) active = true; }, { threshold: 0.1 });
            obs.observe(card);
        } else {
            if (idx === 1) {
                card.addEventListener('mouseenter', () => active = true);
            } else {
                const obs = new IntersectionObserver((es) => { if (es[0].isIntersecting) active = true; }, { threshold: 0.1 });
                obs.observe(card);
            }
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

        // Touch events for swipe-to-scroll
        wrapper.addEventListener('touchstart', (e) => {
            isDown = true;
            isHover = true; // Pause auto-scroll while touching
            startX = e.touches[0].clientX - scrollPos;
        }, { passive: true });
        wrapper.addEventListener('touchend', () => {
            isDown = false;
            isHover = false; // Resume auto-scroll
        });
        wrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            scrollPos = e.touches[0].clientX - startX;
            const min = wrapper.offsetWidth - slider.offsetWidth;
            if (scrollPos > 0) scrollPos = 0; else if (scrollPos < min) scrollPos = min;
            slider.style.transform = `translateX(${scrollPos}px)`;
        }, { passive: true });
    });

    // ============================================================
    //  LIGHTBOX
    // ============================================================
    const lb = document.getElementById('lightbox'),
        lbI = document.getElementById('lightbox-img'),
        lbV = document.getElementById('lightbox-video'),
        lbC = document.getElementById('lightbox-caption');

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

    const closeLB = () => {
        lb.classList.remove('active');
        document.body.style.overflow = '';
        lbV.pause();
        setTimeout(() => { lb.style.display = 'none'; lbV.src = ''; }, 400);
    };

    document.querySelectorAll('.album-slot').forEach(s => {
        const c = s.querySelector('img, video');
        if (c) s.addEventListener('click', () => openLB(c));
    });
    document.querySelector('.close-lightbox')?.addEventListener('click', closeLB);
    lb?.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('active')) closeLB(); });
});

