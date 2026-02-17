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

    // Add parallax effect to section items on scroll
    const addParallaxEffect = () => {
        const scrolled = window.pageYOffset;
        const items = document.querySelectorAll('.skill-item, .project-item, .exp-item, .edu-item');

        items.forEach((item, index) => {
            const speed = 0.05;
            const yPos = -(scrolled * speed * (index % 3 + 1) * 0.1);
            item.style.transform = `translateY(${yPos}px)`;
        });
    };

    window.addEventListener('scroll', () => {
        revealOnScroll();
        requestAnimationFrame(addParallaxEffect);
    });
    revealOnScroll(); // Initial check

    // Enhanced hover interactions for links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(4)';
            cursor.style.background = 'rgba(0,0,0,0.1)';
            cursor.style.border = '1px solid #000';
        });
        link.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = '#000';
            cursor.style.border = 'none';
        });
    });

    // Add hover effect for section items
    const sectionItems = document.querySelectorAll('.skill-item, .project-item, .exp-item, .edu-item');
    sectionItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2.5)';
            cursor.style.background = 'rgba(0, 122, 255, 0.3)';
            cursor.style.border = '2px solid #007aff';
        });
        item.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = '#fff';
            cursor.style.border = 'none';
        });
    });

    // Generate GitHub Contribution Calendar with Real Data
    const generateContributionCalendar = async () => {
        const grid = document.getElementById('contributionGrid');
        if (!grid) return;

        // ⚠️ REPLACE WITH YOUR GITHUB USERNAME
        const GITHUB_USERNAME = 'YOUR_GITHUB_USERNAME';

        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        let contributionData = {};

        // Fetch real GitHub contribution data
        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`);

            if (response.ok) {
                const events = await response.json();

                // Process events to count contributions per day
                events.forEach(event => {
                    const eventDate = new Date(event.created_at);
                    const dateKey = eventDate.toISOString().split('T')[0];

                    // Count various contribution types
                    if (['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent'].includes(event.type)) {
                        contributionData[dateKey] = (contributionData[dateKey] || 0) + 1;
                    }
                });

                // Fetch additional contribution data from multiple pages
                for (let page = 2; page <= 3; page++) {
                    const pageResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100&page=${page}`);
                    if (pageResponse.ok) {
                        const pageEvents = await pageResponse.json();
                        pageEvents.forEach(event => {
                            const eventDate = new Date(event.created_at);
                            const dateKey = eventDate.toISOString().split('T')[0];
                            if (['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent'].includes(event.type)) {
                                contributionData[dateKey] = (contributionData[dateKey] || 0) + 1;
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to fetch GitHub data, using simulated data:', error);
        }

        // Convert contribution count to level (0-4)
        const getContributionLevel = (count) => {
            if (count === 0) return 0;
            if (count <= 2) return 1;
            if (count <= 5) return 2;
            if (count <= 10) return 3;
            return 4;
        };

        // Fallback: Generate simulated data if no real data available
        const generateSimulatedLevel = () => {
            const rand = Math.random();
            if (rand < 0.3) return 0;
            if (rand < 0.5) return 1;
            if (rand < 0.7) return 2;
            if (rand < 0.85) return 3;
            return 4;
        };

        const weeks = 53;
        const daysInWeek = 7;

        // Create grid cells
        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < daysInWeek; day++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day';

                const currentDate = new Date(oneYearAgo);
                currentDate.setDate(oneYearAgo.getDate() + (week * 7) + day);
                const dateKey = currentDate.toISOString().split('T')[0];

                // Don't show future dates
                if (currentDate > today) {
                    cell.style.opacity = '0.3';
                    cell.setAttribute('data-level', '0');
                } else {
                    // Use real data if available, otherwise use simulated data
                    const contributions = contributionData[dateKey] || 0;
                    const level = Object.keys(contributionData).length > 0
                        ? getContributionLevel(contributions)
                        : generateSimulatedLevel();

                    cell.setAttribute('data-level', level);

                    // Add tooltip with date and contribution count
                    const displayCount = Object.keys(contributionData).length > 0
                        ? contributions
                        : (level === 0 ? 0 : Math.floor(Math.random() * 10) + level * 3);

                    cell.title = `${currentDate.toLocaleDateString()}: ${displayCount} contribution${displayCount !== 1 ? 's' : ''}`;
                }

                grid.appendChild(cell);
            }
        }

        // Add hover effect for calendar days
        const calendarDays = document.querySelectorAll('.calendar-day');
        calendarDays.forEach(day => {
            day.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(2)';
                cursor.style.background = 'rgba(0, 212, 255, 0.5)';
            });
            day.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = '#fff';
            });
        });
    };

    generateContributionCalendar();
});
