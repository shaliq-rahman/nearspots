console.log('JavaScript file loaded successfully!');

// Get user's current location and update page with coordinates
function getUserLocation() {
  console.log('getUserLocation called');
  
  // Show loading state on button
  const allowBtn = document.querySelector('.location-allow-btn');
  if (allowBtn) {
    allowBtn.innerHTML = 'Getting Location...';
    allowBtn.style.background = '#999';
    allowBtn.disabled = true;
  }
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        console.log('Location obtained:', lat, lon);
        
        // Update URL with coordinates
        const url = new URL(window.location);
        url.searchParams.set('lat', lat);
        url.searchParams.set('lon', lon);
        window.history.replaceState({}, '', url);
        
        // Hide the loading screen and show main content
        hideLoadingScreen();
        showMainContent();
        
        // Reload page to get updated distances
        window.location.reload();
      },
      function(error) {
        console.log('Geolocation error:', error.message);
        showLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  } else {
    console.log('Geolocation is not supported by this browser');
    showLocationError('Geolocation is not supported by this browser');
  }
}

// Show location error message
function showLocationError(message) {
  const errorPopup = document.createElement('div');
  errorPopup.className = 'location-error-popup';
  errorPopup.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
      <h3 style="margin: 0 0 15px 0; color: #e74c3c; font-size: 1.3rem;">Location Access Failed</h3>
      <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">${message}</p>
      <p style="margin: 0 0 20px 0; color: #e74c3c; font-weight: 600;">Location access is required to use this website.</p>
      <button onclick="retryLocation()" style="background: #006073; color: white; border: none; padding: 12px 25px; border-radius: 25px; font-size: 1rem; font-weight: 500; cursor: pointer; margin-right: 10px;">Try Again</button>
      <button onclick="showLocationHelp()" style="background: #f5f5f5; color: #666; border: none; padding: 12px 25px; border-radius: 25px; font-size: 1rem; font-weight: 500; cursor: pointer;">Need Help?</button>
    </div>
  `;
  
  errorPopup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
  `;
  
  document.body.appendChild(errorPopup);
}

// Retry location access
function retryLocation() {
  const errorPopup = document.querySelector('.location-error-popup');
  if (errorPopup) {
    errorPopup.remove();
  }
  showLoadingScreen();
}

// Show location help
function showLocationHelp() {
  const helpPopup = document.createElement('div');
  helpPopup.className = 'location-help-popup';
  helpPopup.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div style="font-size: 3rem; margin-bottom: 15px;">💡</div>
      <h3 style="margin: 0 0 20px 0; color: #222; font-size: 1.3rem;">How to Enable Location Access</h3>
      <div style="text-align: left; margin: 20px 0;">
        <div style="display: flex; align-items: flex-start; margin-bottom: 15px; gap: 15px;">
          <span style="background: #006073; color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">1</span>
          <p style="margin: 0; color: #666; line-height: 1.5;">Look for the location permission prompt in your browser</p>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 15px; gap: 15px;">
          <span style="background: #006073; color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">2</span>
          <p style="margin: 0; color: #666; line-height: 1.5;">Click "Allow" or "Yes" when prompted</p>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 15px; gap: 15px;">
          <span style="background: #006073; color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">3</span>
          <p style="margin: 0; color: #666; line-height: 1.5;">Make sure location services are enabled on your device</p>
        </div>
      </div>
      <button onclick="hideLocationHelp()" style="background: #006073; color: white; border: none; padding: 12px 25px; border-radius: 25px; font-size: 1rem; font-weight: 500; cursor: pointer;">Got It</button>
    </div>
  `;
  
  helpPopup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10002;
  `;
  
  document.body.appendChild(helpPopup);
}

// Hide location help
function hideLocationHelp() {
  const helpPopup = document.querySelector('.location-help-popup');
  if (helpPopup) {
    helpPopup.remove();
  }
}

// Show blocking loading screen
function showLoadingScreen() {
  // Hide all main content
  hideMainContent();
  
  // Create loading screen
  const loadingScreen = document.createElement('div');
  loadingScreen.className = 'location-loading-screen';
  loadingScreen.innerHTML = `
    <div style="text-align: center; color: white;">
      <div style="font-size: 4rem; margin-bottom: 20px;">📍</div>
      <h2 style="margin: 0 0 10px 0; font-size: 2rem; font-weight: 600;">Welcome to LocalWonders</h2>
      <p style="margin: 0 0 30px 0; font-size: 1.1rem; opacity: 0.9;">Location access is required to show you accurate distances to nearby spots.</p>
      <button class="location-allow-btn" onclick="getUserLocation()" style="background: #006073; color: white; border: none; padding: 15px 30px; border-radius: 25px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0, 96, 115, 0.3);">Allow Location Access</button>
      <div style="margin-top: 20px; font-size: 0.9rem; opacity: 0.8;">
        🔒 Your location data is only used to calculate distances
      </div>
    </div>
  `;
  
  loadingScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #006073 0%, #004d5c 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  document.body.appendChild(loadingScreen);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  console.log('Loading screen shown');
}

// Hide loading screen
function hideLoadingScreen() {
  const loadingScreen = document.querySelector('.location-loading-screen');
  if (loadingScreen) {
    loadingScreen.remove();
    document.body.style.overflow = '';
    console.log('Loading screen hidden');
  }
}

// Hide main content until location is granted
function hideMainContent() {
  // Hide all main content sections
  const mainContent = document.querySelectorAll('.hero, .top-rated-section, .categories-section, .latest-attractions-section, .cta-section');
  mainContent.forEach(section => {
    section.style.display = 'none';
  });
  console.log('Main content hidden');
}

// Show main content after location is granted
function showMainContent() {
  // Show all main content sections
  const mainContent = document.querySelectorAll('.hero, .top-rated-section, .categories-section, .latest-attractions-section, .cta-section');
  mainContent.forEach(section => {
    section.style.display = '';
  });
  console.log('Main content shown');
}

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready');
  
  // Check if we already have location coordinates
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('lat') || !urlParams.has('lon')) {
    console.log('No location found - showing loading screen');
    // Show blocking loading screen
    showLoadingScreen();
  } else {
    console.log('Location already provided - showing main content');
    // Location already provided, show main content
    showMainContent();
  }
}); 