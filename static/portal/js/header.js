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
        });
    });
    
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