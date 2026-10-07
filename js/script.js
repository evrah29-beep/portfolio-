document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'slide',
        once: true, // Whether animation should happen only once - while scrolling down
        offset: 50
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
            } else {
                // Prevent actual submission for demo purposes, show alert instead
                event.preventDefault();
                alert("Thank you! Your message has been sent successfully.");
                contactForm.reset();
                contactForm.classList.remove('was-validated');
                return;
            }
            contactForm.classList.add('was-validated');
        }, false);
    }
});