
document.addEventListener('DOMContentLoaded', () => {
    
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = '10px 0';
            nav.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            nav.style.padding = '20px 0';
            nav.style.background = 'rgba(10, 10, 10, 0.8)';
        }
    });

    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); 

  
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const highlightNav = () => {
        const scrollY = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav);
    highlightNav();

   
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const words = ['Software Developer', 'Web Developer', 'Data Analyst', 'Problem Solver'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeProperties = {
            typingSpeed: 100,
            deletingSpeed: 50,
            delayBetweenWords: 2000
        };

        const type = () => {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingText.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = typeProperties.typingSpeed;

            if (isDeleting) {
                typeSpeed = typeProperties.deletingSpeed;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = typeProperties.delayBetweenWords;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        };

        type();
    }

    const seeMoreBtn = document.getElementById('see-more-certs');

    // Fetch dynamic stats
    const fetchStats = async () => {
        // Count-up animation helper
        const animateCount = (el, target) => {
            const duration = 1500; // ms
            const startTime = performance.now();
            const startVal = 0;

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(startVal + (target - startVal) * eased);
                el.textContent = current + '+';
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };
            requestAnimationFrame(step);
        };

        // GitHub public repos
        try {
            const ghRes = await fetch('https://api.github.com/users/saurabhyadav0810');
            const ghData = await ghRes.json();
            const projectsEl = document.getElementById('stat-projects');
            if (projectsEl && ghData.public_repos !== undefined) {
                animateCount(projectsEl, ghData.public_repos);
            }
        } catch {
            const el = document.getElementById('stat-projects');
            if (el) el.textContent = '16+';
        }

        // GitHub contributions/commits
        try {
            const contribRes = await fetch('https://github-contributions-api.jogruber.de/v4/saurabhyadav0810');
            const contribData = await contribRes.json();
            const commitsEl = document.getElementById('stat-commits');
            if (commitsEl && contribData.total) {
                const totalCommits = Object.values(contribData.total).reduce((a, b) => a + b, 0);
                animateCount(commitsEl, totalCommits);
            }
        } catch {
            const el = document.getElementById('stat-commits');
            if (el) el.textContent = '170+';
        }

        // Coding questions — fetch from backend API
        try {
            const dsaRes = await fetch('http://localhost:3000/dsa-stats');
            const dsaData = await dsaRes.json();
            const dsaEl = document.getElementById('stat-dsa');
            if (dsaEl && dsaData.totalSolved) {
                animateCount(dsaEl, dsaData.totalSolved);
            } else if (dsaEl) {
                dsaEl.textContent = '200+';
            }
        } catch {
            const dsaEl = document.getElementById('stat-dsa');
            if (dsaEl) dsaEl.textContent = '200+';
        }
    };

    // Trigger stats count-up only when the .stats section scrolls into view
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        let statsFetched = false;
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsFetched) {
                    statsFetched = true;
                    fetchStats();
                    statsObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            const hiddenCerts = document.querySelectorAll('.hidden-cert');
            const isHidden = hiddenCerts[0].style.display === 'none';
            
            hiddenCerts.forEach(cert => {
                if (isHidden) {
                    cert.style.display = 'flex';
                    
                } else {
                    cert.style.display = 'none';
                }
            });
            
            if (isHidden) {
                seeMoreBtn.textContent = 'Show Less';
            } else {
                seeMoreBtn.textContent = 'See More';
            
                document.getElementById('certificates').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
