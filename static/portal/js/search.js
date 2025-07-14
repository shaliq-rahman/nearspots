// Search functionality for search page
document.addEventListener('DOMContentLoaded', function() {
    // Search button functionality for search page
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
    }

    // Handle Enter key press on search input
    const searchInput = document.getElementById('destination-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchText = document.getElementById('destination-input').value.trim();
        const distance = document.querySelector('.radius-select').value;
        const urlParams = new URLSearchParams();
        
        if (searchText) {
            urlParams.append('q', searchText);
        }
        if (distance) {
            urlParams.append('distance', distance);
        }
        
        // Get active category from header
        const activeCategorySlug = window.getActiveCategorySlug ? window.getActiveCategorySlug() : null;
        if (activeCategorySlug) {
            urlParams.append('category', activeCategorySlug);
        }
        
        // Get current location from URL if available
        const currentUrl = new URL(window.location.href);
        const lat = currentUrl.searchParams.get('lat');
        const lon = currentUrl.searchParams.get('lon');
        
        if (lat) {
            urlParams.append('lat', lat);
        }
        if (lon) {
            urlParams.append('lon', lon);
        }
        
        // Redirect to search page with parameters
        const searchUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.location.href = searchUrl;
    }

    // Handle sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const currentUrl = new URL(window.location.href);
            const sortValue = this.value;
            
            if (sortValue) {
                currentUrl.searchParams.set('sort', sortValue);
            } else {
                currentUrl.searchParams.delete('sort');
            }
            
            window.location.href = currentUrl.toString();
        });
    }
}); 