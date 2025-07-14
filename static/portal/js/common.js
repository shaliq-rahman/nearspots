 // Test Register Modal button logic
 document.getElementById('test-register-modal-btn').addEventListener('click', function() {
    document.getElementById('register-modal-overlay').style.display = 'flex';
  });

  // Register Modal close button logic
  document.querySelector('#register-modal-overlay .modal-close').addEventListener('click', function() {
    document.getElementById('register-modal-overlay').style.display = 'none';
  });

  // Test OTP Modal button logic
  document.getElementById('test-otp-modal-btn').addEventListener('click', function() {
    document.getElementById('otp-modal-overlay').style.display = 'flex';
  });

  // OTP Modal close button logic
  document.querySelector('#otp-modal-overlay .modal-close').addEventListener('click', function() {
    document.getElementById('otp-modal-overlay').style.display = 'none';
  });


  // Search button functionality
  console.log('Setting up search button functionality...');
  const searchBtn = document.getElementById('search-btn-home');
  console.log('Search button found:', searchBtn);
  
  if (searchBtn) {
    searchBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent any default form behavior
      e.stopPropagation(); // Stop event bubbling
      console.log('Search button clicked!');
      const searchText = document.getElementById('destination-input').value.trim();
      const distance = document.querySelector('.radius-select').value;
      const urlParams = new URLSearchParams();
      
      console.log('Search text:', searchText);
      console.log('Distance:', distance);
      
      if (searchText) {
        urlParams.append('q', searchText);
      }
      if (distance) {
        urlParams.append('distance', distance);
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
      const searchUrl = '/search/' + (urlParams.toString() ? '?' + urlParams.toString() : '');
      console.log('Redirecting to:', searchUrl);
      window.location.href = searchUrl;
    });
  } else {
    console.error('Search button not found!');
  }