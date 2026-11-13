document.addEventListener("DOMContentLoaded", function() {

    // Theme toggle with a saved preference.
    const themeToggle = document.getElementById('themeToggle');
    let savedTheme = null;
    try {
        savedTheme = window.localStorage.getItem('portfolio-theme');
    } catch (error) {
        // Keep the theme toggle usable when browser storage is unavailable.
    }

    function setTheme(isDark) {
        document.body.classList.toggle('theme-dark', isDark);
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        themeToggle.innerHTML = isDark
            ? '<i class="fa-regular fa-sun mr-1" aria-hidden="true"></i><span>Light</span>'
            : '<i class="fa-regular fa-moon mr-1" aria-hidden="true"></i><span>Dark</span>';
    }

    setTheme(savedTheme === 'dark');
    themeToggle.addEventListener('click', function() {
        const isDark = !document.body.classList.contains('theme-dark');
        setTheme(isDark);
        try {
            window.localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
        } catch (error) {
            // The selected theme still applies for this page view.
        }
    });
    
    // 1. Initialize AOS (Animate On Scroll)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true, // Whether animation should happen only once - while scrolling down
        offset: 60,
        disable: reduceMotion
    });

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('mainNav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initial check in case page is loaded scrolled down
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a.nav-link, a.btn').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if it is a hash link
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }

                    // Scroll to element accounting for fixed navbar height
                    const navHeight = navbar.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;
  
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });

    // 4. Contact Form Validation
    const contactForm = document.getElementById('contactForm');
    
    if(contactForm) {
        contactForm.addEventListener('submit', function(event) {
            if (!contactForm.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            contactForm.classList.add('was-validated');
        }, false);
    }
});
