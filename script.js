document.addEventListener('DOMContentLoaded', () => {

    // Trigger hero animations immediately
    setTimeout(() => {
        document.body.classList.remove('loading');
        const heroReveals = document.querySelectorAll('.hero-section .reveal');
        heroReveals.forEach(el => el.classList.add('active'));
    }, 100);

    /* ============================================================
       TOUCH DEVICE DETECTION
       ============================================================ */
    const isTouchDevice = ('ontouchstart' in window) ||
                          (navigator.maxTouchPoints > 0) ||
                          window.matchMedia('(hover: none)').matches;

    /* ============================================================
       CUSTOM CURSOR (Desktop only)
       ============================================================ */
    const cursorRing = document.getElementById('cursorRing');
    const cursorDot = document.getElementById('cursorDot');

    if (!isTouchDevice && cursorRing && cursorDot) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;
        let dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animateCursor = () => {
            // Smooth trailing for ring
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';

            // Faster follow for dot
            dotX += (mouseX - dotX) * 0.5;
            dotY += (mouseY - dotY) * 0.5;
            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top = dotY + 'px';

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Cursor States
        const setupInteractiveState = (selector, action) => {
            document.querySelectorAll(selector).forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add(action));
                el.addEventListener('mouseleave', () => document.body.classList.remove(action));
            });
        };

        setupInteractiveState('a, button, .magnetic-btn', 'cursor-pointer');
        setupInteractiveState('.bento-card, .project-item, .album-slot', 'cursor-hover');

    } else {
        if (cursorRing) cursorRing.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
        document.body.style.cursor = 'auto';
        document.querySelectorAll('a, button').forEach(el => el.style.cursor = 'pointer');
    }

    /* ============================================================
       NAVBAR SCROLL & MOBILE MENU
       ============================================================ */
    const navbar = document.getElementById('navbar');
    const navHamburger = document.getElementById('navHamburger');
    const navMobile = document.getElementById('navMobile');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    if(navHamburger && navMobile) {
        navHamburger.addEventListener('click', () => {
            const isExpanded = navHamburger.getAttribute('aria-expanded') === 'true';
            navHamburger.setAttribute('aria-expanded', !isExpanded);
            navMobile.classList.toggle('active');
        });

        // Close on link click
        navMobile.querySelectorAll('.nav-mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                navHamburger.setAttribute('aria-expanded', 'false');
                navMobile.classList.remove('active');
            });
        });
    }

    /* ============================================================
       SCROLL REVEAL logic
       ============================================================ */
    const revealElements = document.querySelectorAll('.reveal:not(.hero-section .reveal)');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(item => {
            const rect = item.getBoundingClientRect();
            // Add active if it enters view
            if (rect.top < triggerBottom && rect.bottom > 0) {
                item.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    // Trigger immediately for above-the-fold
    setTimeout(revealOnScroll, 500);

    /* ============================================================
       TYPEWRITER EFFECT (HERO ROLE)
       ============================================================ */
    const roles = ["Data Scientist", "Machine Learning Analyst", "Creative Technologist", "Cinematographer"];
    const typeText = document.getElementById('typewriterText');
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    if(typeText) {
        const typeLoop = () => {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                typeText.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typeText.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 40 : 100;

            if (!isDeleting && charIndex === currentRole.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 500; // Pause before new word
            }

            setTimeout(typeLoop, typeSpeed);
        };
        setTimeout(typeLoop, 2500); // Start after intro animation
    }

    /* ============================================================
       MAGNETIC BUTTONS
       ============================================================ */
    if (!isTouchDevice) {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    /* ============================================================
       SKILLS PROGRESS BAR ANIMATION
       ============================================================ */
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    if(skillBars.length > 0) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const targetWidth = bar.getAttribute('style').match(/--target-width:\s*([^;]+)/)[1];
                    bar.style.width = targetWidth;
                    skillsObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });
        
        skillBars.forEach(bar => skillsObserver.observe(bar));
    }

    /* ============================================================
       STATS COUNTER ANIMATION
       ============================================================ */
    const statNumbers = document.querySelectorAll('.stat-number');
    if(statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'));
                    let count = 0;
                    const speed = 2000 / target; // total ms / target

                    const updateCount = () => {
                        count++;
                        el.innerText = count;
                        if(count < target) setTimeout(updateCount, speed);
                    };
                    updateCount();
                    statsObserver.unobserve(el);
                }
            });
        });
        statNumbers.forEach(stat => statsObserver.observe(stat));
    }

    /* ============================================================
       PROJECT FULLSCREEN MODAL
       ============================================================ */
    const projectModal = document.getElementById('projectModal');
    const closeProjectModal = document.getElementById('closeProjectModal');
    const pmTag = document.getElementById('pmTag');
    const pmTitle = document.getElementById('pmTitle');
    const pmDesc = document.getElementById('pmDesc');
    const pmLink = document.getElementById('pmLink');

    document.querySelectorAll('.project-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Populate data
            if(pmTag) pmTag.textContent = btn.getAttribute('data-tag') || 'Project';
            if(pmTitle) pmTitle.textContent = btn.getAttribute('data-title') || 'Untitled';
            if(pmDesc) pmDesc.textContent = btn.getAttribute('data-desc') || '';
            
            const linkHref = btn.getAttribute('data-link');
            if(pmLink && linkHref) {
                pmLink.href = linkHref;
                pmLink.style.display = 'inline-flex';
            } else if(pmLink) {
                pmLink.style.display = 'none';
            }
            
            // Open modal
            if(projectModal) {
                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // prevent bg scroll
            }
        });
    });

    const closePM = () => {
        if(projectModal) {
            projectModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if(closeProjectModal) closeProjectModal.addEventListener('click', closePM);
    if(projectModal) {
        projectModal.addEventListener('click', (e) => {
            if(e.target === projectModal || e.target.classList.contains('project-modal-bg')) {
                closePM();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
            closePM();
        }
    });

    /* ============================================================
       HORIZONTAL SCROLL (EXPERIENCE SECTION)
       ============================================================ */
    const horizContainer = document.querySelector('.horizontal-scroll-container');
    const pinWrap = document.querySelector('.pin-wrap');

    if(horizContainer && pinWrap) {
        window.addEventListener('scroll', () => {
            const rect = horizContainer.getBoundingClientRect();
            // Start when top of container hits top of viewport
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                // We are inside the pinned area. Calculate progress (0 to 1)
                const scrollProgress = Math.abs(rect.top) / (rect.height - window.innerHeight);
                const maxScroll = pinWrap.scrollWidth - window.innerWidth;
                
                pinWrap.style.transform = `translateX(-${scrollProgress * maxScroll}px)`;
            } else if (rect.top > 0) {
                pinWrap.style.transform = `translateX(0px)`;
            } else if (rect.bottom < window.innerHeight) {
                const maxScroll = pinWrap.scrollWidth - window.innerWidth;
                pinWrap.style.transform = `translateX(-${maxScroll}px)`;
            }
        }, { passive: true });
    }

    /* ============================================================
       GITHUB CONTRIBUTION CALENDAR (STRICTLY 2026)
       ============================================================ */
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

        const CELL_PX = 12, GAP_PX = 4, COLS = 53;
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
                        cell.style.pointerEvents = 'none';
                    }

                    const dLab = cellD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    cell.title = count === 0 ? `No contributions on ${dLab}` : `${count} contribution${count !== 1 ? 's' : ''} on ${dLab}`;
                }
                grid.appendChild(cell);
            }
        }
    };
    generateContributionCalendar();

    /* ============================================================
       3D TILT EFFECT & SLIDERS FOR HOBBIES
       ============================================================ */
    const sliders = document.querySelectorAll('.hobby-slider-wrapper');
    
    // 3D Tilt for Hobby Cards (Desktop only)
    if(!isTouchDevice) {
        document.querySelectorAll('.hobby-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Background orb tracking
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                
                // 3D Tilt logic
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg tilt
                const rotateY = ((x - centerX) / centerX) * 5;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
            });
        });
    }

    // Slider Drag & Touch Logic
    sliders.forEach((wrapper) => {
        const slider = wrapper.querySelector('.hobby-slider');
        let isDown = false, startX, scrollLeft;

        // Auto move logic
        let autoPos = 0;
        let isHover = false;
        let isVisible = false;

        const observer = new IntersectionObserver((e) => {
            isVisible = e[0].isIntersecting;
        });
        observer.observe(wrapper);

        const animate = () => {
            if (!isDown && !isHover && isVisible) {
                autoPos -= 0.5; // Speed
                const minPos = wrapper.offsetWidth - slider.scrollWidth;
                
                // Reset to start if reached end (infinite feel)
                if (autoPos <= minPos - 50) {
                    autoPos = 0; 
                }
                slider.style.transform = `translateX(${autoPos}px)`;
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

        // Mouse Events
        wrapper.addEventListener('mouseenter', () => isHover = true);
        wrapper.addEventListener('mouseleave', () => { isHover = false; isDown = false; });
        
        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - wrapper.offsetLeft;
            // Capture current transform X for drag calculation
            const transformMatrix = window.getComputedStyle(slider).getPropertyValue('transform');
            if(transformMatrix !== 'none') {
                autoPos = parseFloat(transformMatrix.split(',')[4]);
            }
        });
        
        wrapper.addEventListener('mouseup', () => isDown = false);
        
        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag speed multiplier
            
            let newPos = autoPos + walk;
            const minPos = wrapper.offsetWidth - slider.scrollWidth;
            
            if (newPos > 0) newPos = 0;
            if (newPos < minPos) newPos = minPos;
            
            slider.style.transform = `translateX(${newPos}px)`;
            autoPos = newPos; // Update base for next tick/drag
            startX = x; // Reset start x
        });

        // Touch Events
        wrapper.addEventListener('touchstart', (e) => {
            isDown = true;
            isHover = true;
            startX = e.touches[0].pageX;
            const transformMatrix = window.getComputedStyle(slider).getPropertyValue('transform');
            if(transformMatrix !== 'none') {
                autoPos = parseFloat(transformMatrix.split(',')[4]);
            }
        }, { passive: true });
        
        wrapper.addEventListener('touchend', () => { isDown = false; isHover = false; });
        
        wrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX;
            const walk = (x - startX);
            
            let newPos = autoPos + walk;
            const minPos = wrapper.offsetWidth - slider.scrollWidth;
            
            if (newPos > 0) newPos = 0;
            if (newPos < minPos) newPos = minPos;
            
            slider.style.transform = `translateX(${newPos}px)`;
            autoPos = newPos;
            startX = x;
        }, { passive: true });
    });

    /* ============================================================
       LIGHTBOX
       ============================================================ */
    const lb = document.getElementById('lightbox'),
          lbI = document.getElementById('lightbox-img'),
          lbV = document.getElementById('lightbox-video'),
          lbC = document.getElementById('lightbox-caption');

    const openLB = (el) => {
        const isV = el.tagName.toLowerCase() === 'video';
        lbI.style.display = 'none';
        lbV.style.display = 'none';
        
        if (isV) {
            lbV.src = el.src;
            lbV.style.display = 'block';
            lbV.play();
        } else {
            lbI.src = el.src;
            lbI.style.display = 'block';
        }
        
        const s = el.closest('.album-slot').querySelector('.slot-overlay span');
        lbC.textContent = s ? s.textContent : 'Hobby Content';
        
        lb.style.display = 'flex';
        setTimeout(() => lb.classList.add('active'), 10);
        document.body.style.overflow = 'hidden'; // Stop background scroll
    };

    const closeLB = () => {
        lb.classList.remove('active');
        document.body.style.overflow = '';
        lbV.pause();
        setTimeout(() => {
            lb.style.display = 'none';
            lbV.src = '';
        }, 400);
    };

    document.querySelectorAll('.album-slot').forEach(s => {
        const c = s.querySelector('img, video');
        if (c) s.addEventListener('click', () => openLB(c));
    });
    
    document.querySelector('.close-lightbox')?.addEventListener('click', closeLB);
    lb?.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('active')) closeLB(); });

    // YouTube links logic in hobbies
    document.querySelectorAll('.yt-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // prevent image lightbox trigger
            const vidId = link.getAttribute('data-video');
            window.open(`https://www.youtube.com/watch?v=${vidId}`, '_blank');
        });
    });

});
