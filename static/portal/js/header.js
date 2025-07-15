document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav a');

    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Store the active category in sessionStorage
            const categorySlug = this.getAttribute('data-category-slug');
            if (categorySlug) {
                sessionStorage.setItem('activeCategorySlug', categorySlug);
            }

            // Close mobile menu if open
            closeMobileMenu();
        });
    });

    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            toggleMobileMenu();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !mainNav.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close mobile menu on window resize if screen becomes larger
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        // Handle escape key to close mobile menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        if (mainNav.classList.contains('mobile-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mainNav.classList.add('mobile-open');
        menuIcon.innerHTML = '✕';
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeMobileMenu() {
        mainNav.classList.remove('mobile-open');
        menuIcon.innerHTML = '☰';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Make functions globally available
    window.openMobileMenu = openMobileMenu;
    window.closeMobileMenu = closeMobileMenu;

    // Handle logo click to go to home page
    const logo = document.getElementById('portal-logo');
    if (logo) {
        logo.addEventListener('click', function() {
            // Get current lat/lon from URL if available
            const urlParams = new URLSearchParams(window.location.search);
            const lat = urlParams.get('lat');
            const lon = urlParams.get('lon');

            let homeUrl = '/';
            if (lat && lon) {
                homeUrl += `?lat=${lat}&lon=${lon}`;
            }

            window.location.href = homeUrl;
        });
    }

    // Function to get active category slug
    window.getActiveCategorySlug = function() {
        // First try to get from active nav link
        const activeLink = document.querySelector('.nav a.active');
        if (activeLink) {
            return activeLink.getAttribute('data-category-slug');
        }

        // Fallback to sessionStorage
        return sessionStorage.getItem('activeCategorySlug');
    };
});