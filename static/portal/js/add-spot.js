// Map functionality for add spot page
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing map...');
  
  // Check if Leaflet is available
  if (typeof L === 'undefined') {
    console.error('Leaflet is not loaded!');
    document.getElementById('add-spot-map').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">Error: Map library not loaded</div>';
    return;
  }
  
  // Initialize the map with Malaysia coordinates (Kuala Lumpur)
  var map = L.map('add-spot-map').setView([3.1390, 101.6869], 13);
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Remove loading message
  var mapContainer = document.getElementById('add-spot-map');
  var loadingDiv = mapContainer.querySelector('div');
  if (loadingDiv) {
    loadingDiv.remove();
  }
  
  // Add a draggable marker at Malaysia location
  var marker = L.marker([3.1390, 101.6869], {draggable: true}).addTo(map);
  
  // Function to update coordinates and reverse geocode
  function updateCoords(latlng, updateAddress = true) {
    var lat = latlng.lat.toFixed(6);
    var lng = latlng.lng.toFixed(6);
    document.getElementById('spot-coords').value = lat + ', ' + lng;
    
    // Only update address field if explicitly requested
    if (updateAddress) {
      // Reverse geocode to update address field
      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            document.getElementById('spot-address').value = data.display_name;
          }
        })
        .catch(error => {
          console.log('Reverse geocoding error:', error);
        });
    }
  }
  
  // Handle map clicks
  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    updateCoords(e.latlng);
  });
  
  // Handle marker drag end
  marker.on('dragend', function(e) {
    updateCoords(marker.getLatLng());
  });
  
  // Clear address field on page load
  document.getElementById('spot-address').value = '';
  
  // Set initial coordinates without updating address field
  updateCoords(marker.getLatLng(), false);
  
  // Geocode address and update map
  var addressInput = document.getElementById('spot-address');
  
  // Function to show error message below the input field
  function showAddressError(message) {
    // Remove any existing error message
    var existingError = addressInput.parentNode.querySelector('.address-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Create error message element
    var errorDiv = document.createElement('div');
    errorDiv.className = 'address-error';
    errorDiv.style.cssText = 'color: #dc3545; font-size: 14px; margin-top: 5px; display: block;';
    errorDiv.textContent = message;
    
    // Insert error message after the input field
    addressInput.parentNode.insertBefore(errorDiv, addressInput.nextSibling);
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
  
  function geocodeAddress() {
    var address = addressInput.value.trim();
    if (!address) return;
    
    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(address))
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          var lat = parseFloat(data[0].lat);
          var lon = parseFloat(data[0].lon);
          var latlng = {lat: lat, lng: lon};
          map.setView(latlng, 16);
          marker.setLatLng(latlng);
          updateCoords(latlng);
          
          // Remove any existing error message on success
          var existingError = addressInput.parentNode.querySelector('.address-error');
          if (existingError) {
            existingError.remove();
          }
        } else {
          showAddressError('The location not found, Try selecting the pointer from the map to get accurate location');
        }
      })
      .catch(error => {
        console.log('Geocoding error:', error);
        showAddressError('The location not found, Try selecting the pointer from the map to get accurate location');
      });
  }
  
  // Handle address input events
  addressInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      geocodeAddress();
    }
  });
  
  addressInput.addEventListener('blur', function() {
    geocodeAddress();
  });
});

// Modal functionality
(function() {
  // Show file name on photo upload
  var photoInputs = document.querySelectorAll('.photos-section input[type="file"]');
  photoInputs.forEach(function(input) {
    input.addEventListener('change', function() {
      var label = input.nextElementSibling;
      var photoBox = input.closest('.photo-box');
      
      if (input.files && input.files.length > 0) {
        var fileName = input.files[0].name;
        var textSpan = label.querySelector('.photo-filename');
        if (!textSpan) {
          textSpan = document.createElement('span');
          textSpan.className = 'photo-filename';
          label.appendChild(textSpan);
        }
        textSpan.textContent = fileName;
        
        // Add visual feedback for cover photo
        if (input.id === 'cover-photo') {
          photoBox.classList.add('has-file');
          photoBox.classList.remove('error');
          // Remove any error styling
          label.classList.remove('error');
          var errorMessage = photoBox.querySelector('.error-message');
          if (errorMessage) {
            errorMessage.remove();
          }
        }
        
        // Optionally hide the default label text
        var defaultText = label.childNodes[2];
        if (defaultText && defaultText.nodeType === 3) {
          defaultText.textContent = '';
        }
      } else {
        // Remove visual feedback if no file selected
        if (input.id === 'cover-photo') {
          photoBox.classList.remove('has-file');
        }
      }
    });
  });

  // Success Modal Close Functionality
  var successModal = document.getElementById('success-modal');
  var modalCloseBtn = successModal.querySelector('.modal-close');
  var modalHomeBtn = successModal.querySelector('.modal-home-btn');

  // Close modal when close button is clicked
  modalCloseBtn.addEventListener('click', function() {
    successModal.style.display = 'none';
  });

  // Close modal and redirect to home when "Back to home" button is clicked
  // modalHomeBtn.addEventListener('click', function() {
  //   successModal.style.display = 'none';
  //   window.location.href = '/'; // Redirect to home page
  // });

  // Close modal when clicking outside the modal container
  successModal.addEventListener('click', function(e) {
    if (e.target === successModal) {
      successModal.style.display = 'none';
    }
  });

  // Close modal when pressing Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && successModal.style.display === 'block') {
      successModal.style.display = 'none';
    }
  });
})();
