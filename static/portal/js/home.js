$("#loginSubmit").on("click", function (event) {
    event.preventDefault();
    $("#loginSubmit").submit();
  });
  
$("#register-form").validate({
  rules: {
    first_name: {
      required: true,
      minlength: 2
    },
    last_name: {
      required: true,
      minlength: 2
    },
    email: {
      required: true,
      email: true
    },
    mobile: {
      required: true,
      minlength: 6,
      maxlength: 15,
      digits: true
    },
    password: {
      required: true,
      minlength: 8
    },
    terms_and_conditions: {
      required: true
    }
  },
  messages: {
    first_name: {
      required: "This field is required",
      minlength: "First name must be at least 2 characters"
    },
    last_name: {
      required: "This field is required",
      minlength: "Last name must be at least 2 characters"
    },
    email: {
      required: "This field is required",
      email: "Please enter a valid email address"
    },
    mobile: {
      required: "This field is required",
      minlength: "Mobile number must contain at least 6 digits",
      maxlength: "Mobile number must contain at most 15 digits",
      digits: "Mobile number must contain only digits"
    },
    password: {
      required: "This field is required",
      minlength: "Password must be at least 8 characters"
    },
    terms_and_conditions: {
      required: "You must accept the terms and conditions"
    }
  },
  errorPlacement: function(error, element) {
    // For checkbox, place error after the label
    if (element.attr("type") === "checkbox") {
      error.insertAfter(element.next("label"));
    } else {
      // For other inputs, place error after the input
      error.insertAfter(element);
    }
  },
  highlight: function(element) {
    $(element).addClass("error");
  },
  unhighlight: function(element) {
    $(element).removeClass("error");
  },
  submitHandler: function(form) {
    // Get form data
    const formData = $(form).serialize();
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    
    // Disable submit button and show loading
    const submitBtn = $(form).find('button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn.prop('disabled', true).text('Registering...');
    
    // Submit form via AJAX
    $.ajax({
      type: "POST",
      url: "/register/",
      data: formData,
      headers: {
        "X-CSRFToken": csrfToken,
      },
      dataType: "json",
      success: function(response) {
        if (response.status === 'success') {
          // First completely hide the registration modal
          $('#register-modal-overlay').hide();
          $('#register-modal-overlay').css('display', 'none');
          $('#register-modal-overlay').removeClass('active');
          
          // Clear any existing success modal
          $('#success-modal-overlay').remove();
          
          // Show success message in a new modal overlay
          const successOverlay = $('<div id="success-modal-overlay" class="modal-overlay" style="display:flex;z-index:9999;background-color:rgba(0,0,0,0.5);">');
          const successContainer = $(`
            <div class="modal-container" role="dialog" aria-modal="true" style="text-align:center;">
              <div class="modal-tick-circle">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#22c55e"/>
                  <path d="M20 28.5L16 24.5L14.5 26L20 31.5L34 17.5L32.5 16L20 28.5Z" fill="white"/>
                </svg>
              </div>
              <h2 class="modal-success-title">Registration Successful!</h2>
              <p class="modal-success-subtext">Welcome to LocalWonders.</p>
            </div>
          `);
          
          successOverlay.append(successContainer);
          $('body').append(successOverlay);
          
          // Auto-hide and close success modal after 2 seconds
          setTimeout(function() {
            successOverlay.remove();
            // Redirect to home page
            if (response.redirect_url) {
              window.location.href = response.redirect_url;
            }
          }, 2000);
        }
      },
      error: function(xhr, status, error) {
        const response = xhr.responseJSON;
        
        if (response && response.errors) {
          // Clear previous errors
          $('.error').removeClass('error');
          $('.error-message').remove();
          
          // Display field-specific errors
          Object.keys(response.errors).forEach(function(field) {
            const errorMessage = response.errors[field];
            const fieldElement = $(`[name="${field}"]`);
            
            // Add error class to field
            fieldElement.addClass('error');
            
            // Add error message
            if (field === 'terms_and_conditions') {
              fieldElement.next('label').after('<div class="error-message">' + errorMessage + '</div>');
            } else {
              fieldElement.after('<div class="error-message">' + errorMessage + '</div>');
            }
          });
        } else if (response && response.message) {
          // Display general error message
          alert(response.message);
        } else {
          // Generic error
          alert('Registration failed. Please try again.');
        }
      },
      complete: function() {
        // Re-enable submit button
        submitBtn.prop('disabled', false).text(originalText);
      }
    });
    
    return false; // Prevent the form from submitting via the usual way
  }
});

$("#auth-form").validate({
  rules: {
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minlength: 1
    }
  },
  messages: {
    email: {
      required: "Email is required",
      email: "Please enter a valid email address"
    },
    password: {
      required: "Password is required"
    }
  },
  errorPlacement: function(error, element) {
    // Place error after the input
    error.insertAfter(element);
    // Add error-message class to the error element
    error.addClass('error-message');
  },
  highlight: function(element) {
    $(element).addClass("error");
  },
  unhighlight: function(element) {
    $(element).removeClass("error");
  },
  submitHandler: function(form) {
    // Get form data
    const formData = $(form).serialize();
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    
    // Disable submit button and show loading
    const submitBtn = $(form).find('button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn.prop('disabled', true).text('Signing in...');
    
    // Clear any existing error messages
    $('.auth-error-message').remove();
    
    // Submit form via AJAX
    $.ajax({
      type: "POST",
      url: $(form).attr('action'),
      data: formData,
      headers: {
        "X-CSRFToken": csrfToken,
      },
      dataType: "json",
      success: function(response) {
        if (response.status === 'success') {
          // Show success message in modal with green color and tick icon
          const modalContainer = $('#auth-modal-overlay .modal-container');
          const originalContent = modalContainer.html();
          
          // Create success content
          const successContent = `
            <div class="modal-tick-circle">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#22c55e"/>
                <path d="M20 28.5L16 24.5L14.5 26L20 31.5L34 17.5L32.5 16L20 28.5Z" fill="white"/>
              </svg>
            </div>
            <h2 class="modal-success-title">Login Successful!</h2>
            <p class="modal-success-subtext">Welcome back.</p>
          `;
          
          // Replace modal content with success message
          modalContainer.html(successContent);
          
          // Auto-hide and close modal after 2 seconds
          setTimeout(function() {
            closeAuthModal();
            // Redirect to home page
            if (response.redirect_url) {
              window.location.href = response.redirect_url;
            }
          }, 2000);
        }
      },
      error: function(xhr, status, error) {
        const response = xhr.responseJSON;
        
        if (response && response.errors) {
          // Clear previous errors
          $('.error').removeClass('error');
          $('.error-message').remove();
          
          // Display field-specific errors
          Object.keys(response.errors).forEach(function(field) {
            const errorMessage = response.errors[field];
            const fieldElement = $(`[name="${field}"]`);
            
            // Add error class to field
            fieldElement.addClass('error');
            
            // Add error message
            fieldElement.after('<div class="error-message">' + errorMessage + '</div>');
          });
        } else if (response && response.message) {
          // Display error message in red color below the password input
          const passwordInput = $('input[name="password"]');
          const errorMessage = '<div class="auth-error-message">' + response.message + '</div>';
          
          // Remove any existing error message
          $('.auth-error-message').remove();
          
          // Add error message after the password input
          passwordInput.after(errorMessage);
          
          // Auto-hide error message after 3.5 seconds
          setTimeout(function() {
            $('.auth-error-message').fadeOut(300, function() {
              $(this).remove();
            });
          }, 3500);
        } else {
          // Generic error message
          const passwordInput = $('input[name="password"]');
          const errorMessage = '<div class="auth-error-message">Login failed. Please try again.</div>';
          
          // Remove any existing error message
          $('.auth-error-message').remove();
          
          // Add error message after the password input
          passwordInput.after(errorMessage);
          
          // Auto-hide error message after 3.5 seconds
          setTimeout(function() {
            $('.auth-error-message').fadeOut(300, function() {
              $(this).remove();
            });
          }, 3500);
        }
      },
      complete: function() {
        // Re-enable submit button
        submitBtn.prop('disabled', false).text(originalText);
      }
    });
    
    return false; // Prevent the form from submitting via the usual way
  }
});

// Add custom validation method for file inputs
$.validator.addMethod("fileRequired", function(value, element) {
  return element.files && element.files.length > 0;
}, "This field is required.");

$("#add-spot-form").validate({
  rules: {
    "spot-name": {
      required: true,
      minlength: 2,
      maxlength: 100
    },
    "spot-description": {
      required: true,
      minlength: 10,
      maxlength: 500
    },
    "spot-address": {
      required: true,
      minlength: 5
    },
    "spot-coords": {
      required: true,
    },
    "cover-photo": {
      fileRequired: true
    }
  },
  messages: {
    "spot-name": {
      required: "Spot name is required",
      minlength: "Spot name must be at least 2 characters",
      maxlength: "Spot name cannot exceed 100 characters"
    },
    "spot-description": {
      required: "Description is required",
      minlength: "Description must be at least 10 characters",
      maxlength: "Description cannot exceed 500 characters"
    },
    "spot-address": {
      required: "Address is required",
      minlength: "Please enter a valid address"
    },
    "spot-coords": {
      pattern: "Please enter coordinates in format: latitude, longitude (e.g., 25.1972, 55.2744)"
    },
    "cover-photo": {
      required: "Cover photo is required"
    }
  },
  errorPlacement: function(error, element) {
    // For file inputs, place error after the label
    if (element.attr("type") === "file") {
      error.insertAfter(element.next("label"));
    } else {
      // For other inputs, place error after the input
      error.insertAfter(element);
    }
    // Add error-message class to the error element
    error.addClass('error-message');
  },
  highlight: function(element) {
    $(element).addClass("error");
  },
  unhighlight: function(element) {
    $(element).removeClass("error");
  },
  submitHandler: function(form) {
    // Get form data
    const formData = new FormData(form);
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    
    // Disable submit button and show loading
    const submitBtn = $(form).find('button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn.prop('disabled', true).text('Submitting...');
    
    // Submit form via AJAX
    $.ajax({
      type: "POST",
      url: $(form).attr('action'),
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        "X-CSRFToken": csrfToken,
      },
      dataType: "json",
      success: function(response) {
        if (response.status === 'success') {
          // Show success modal
          $('#success-modal').show();
          // Reset form
          form.reset();
        } else {
          alert(response.message || 'Failed to add spot. Please try again.');
        }
      },
      error: function(xhr, status, error) {
        const response = xhr.responseJSON;
        
        if (response && response.errors) {
          // Clear previous errors
          $('.error').removeClass('error');
          $('.error-message').remove();
          
          // Display field-specific errors
          Object.keys(response.errors).forEach(function(field) {
            const errorMessage = response.errors[field];
            const fieldElement = $(`[name="${field}"]`);
            
            // Add error class to field
            fieldElement.addClass('error');
            
            // Add error message
            fieldElement.after('<div class="error-message">' + errorMessage + '</div>');
          });
        } else if (response && response.message) {
          // Display general error message
          alert(response.message);
        } else {
          // Generic error
          alert('Failed to add spot. Please try again.');
        }
      },
      complete: function() {
        // Re-enable submit button
        submitBtn.prop('disabled', false).text(originalText);
      }
    });
    
    return false; // Prevent the form from submitting via the usual way
  }
});

// Search button functionality for home page
$(document).ready(function() {
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

      // Get active category from header
      const activeCategorySlug = window.getActiveCategorySlug ? window.getActiveCategorySlug() : null;
      if (activeCategorySlug) {
        urlParams.append('category', activeCategorySlug);
        console.log('Active category:', activeCategorySlug);
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
});


// $("#write-review-form").validate({
//   rules: {
//     "review": {
//       required: true,
//       minlength: 10,
//       maxlength: 1000
//     }
//   },
//   messages: {
//     "review": {
//       required: "Please write your review",
//       minlength: "Review must be at least 10 characters",
//       maxlength: "Review cannot exceed 1000 characters"
//     }
//   },
//   errorPlacement: function(error, element) {
//     // For review textarea, place error after the textarea
//     error.insertAfter(element);
//     // Add error-message class to the error element
//     error.addClass('error-message');
//   },
//   highlight: function(element) {
//     $(element).addClass("error");
//   },
//   unhighlight: function(element) {
//     $(element).removeClass("error");
//   },
//   submitHandler: function(form) {
//     // Get form data
//     const formData = new FormData(form);
//     const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    
//     // Disable submit button and show loading
//     const submitBtn = $(form).find('button[type="submit"]');
//     const originalText = submitBtn.text();
//     submitBtn.prop('disabled', true).text('Submitting...');
    
//     // Submit form via AJAX
//     $.ajax({
//       type: "POST",
//       url: $(form).attr('action'),
//       data: formData,
//       processData: false,
//       contentType: false,
//       headers: {
//         "X-CSRFToken": csrfToken,
//       },
//       dataType: "json",
//       success: function(response) {
//         if (response.status === 'success') {
//           // Show success modal
//           $('#success-modal').show();
//           // Reset form
//           form.reset();
//         } else {
//           alert(response.message || 'Failed to add spot. Please try again.');
//         }
//       },
//       error: function(xhr, status, error) {
//         const response = xhr.responseJSON;
        
//         if (response && response.errors) {
//           // Clear previous errors
//           $('.error').removeClass('error');
//           $('.error-message').remove();
          
//           // Display field-specific errors
//           Object.keys(response.errors).forEach(function(field) {
//             const errorMessage = response.errors[field];
//             const fieldElement = $(`[name="${field}"]`);
            
//             // Add error class to field
//             fieldElement.addClass('error');
            
//             // Add error message
//             fieldElement.after('<div class="error-message">' + errorMessage + '</div>');
//           });
//         } else if (response && response.message) {
//           // Display general error message
//           alert(response.message);
//         } else {
//           // Generic error
//           alert('Failed to add spot. Please try again.');
//         }
//       },
//       complete: function() {
//         // Re-enable submit button
//         submitBtn.prop('disabled', false).text(originalText);
//       }
//     });
    
//     return false; // Prevent the form from submitting via the usual way
//   }
// });

// Profile Update Validation and AJAX Submission
$(".profile-update-form").validate({
  rules: {
    firstName: {
      required: true,
      minlength: 2,
      maxlength: 50,
      lettersOnly: true
    },
    lastName: {
      required: true,
      minlength: 2,
      maxlength: 50,
      lettersOnly: true
    }
  },
  messages: {
    firstName: {
      required: "First name is required",
      minlength: "First name must be at least 2 characters long",
      maxlength: "First name cannot exceed 50 characters",
      lettersOnly: "First name can only contain letters"
    },
    lastName: {
      required: "Last name is required",
      minlength: "Last name must be at least 2 characters long",
      maxlength: "Last name cannot exceed 50 characters",
      lettersOnly: "Last name can only contain letters"
    }
  },
  errorPlacement: function(error, element) {
    error.insertAfter(element);
    error.addClass('error-message');
  },
  highlight: function(element) {
    $(element).addClass("error");
  },
  unhighlight: function(element) {
    $(element).removeClass("error");
  },
  submitHandler: function(form) {
    console.log('Profile form submitted');
    // Get form data
    const formData = {
      first_name: $('#firstName').val().trim(),
      last_name: $('#lastName').val().trim(),
      csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
    };
    console.log('Form data:', formData);
    
    // Disable submit button and show loading
    const submitBtn = $(form).find('button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn.prop('disabled', true).text('Updating...');
    
    // Submit form via AJAX
    $.ajax({
      type: "POST",
      url: "/update-profile/",
      data: formData,
      headers: {
        "X-CSRFToken": formData.csrfmiddlewaretoken,
      },
      dataType: "json",
      success: function(response) {
        console.log('Profile update success:', response);
        if (response.status === 'success') {
          // Show success popup
          showProfileUpdateSuccess();
        }
      },
      error: function(xhr, status, error) {
        const response = xhr.responseJSON;

        if (response && response.errors) {
          // Clear previous errors
          $('.error').removeClass('error');
          $('.error-message').remove();

          // Display field-specific errors
          Object.keys(response.errors).forEach(function(field) {
            const errorMessage = response.errors[field];
            let fieldElement;

            if (field === 'first_name') {
              fieldElement = $('#firstName');
            } else if (field === 'last_name') {
              fieldElement = $('#lastName');
            }

            if (fieldElement) {
              // Add error class to field
              fieldElement.addClass('error');
              // Add error message
              fieldElement.after('<div class="error-message">' + errorMessage + '</div>');
            }
          });
        } else if (response && response.message) {
          // Display general error message
          alert(response.message);
        } else {
          // Generic error
          alert('Profile update failed. Please try again.');
        }
      },
      complete: function() {
        // Re-enable submit button
        submitBtn.prop('disabled', false).text(originalText);
      }
    });

    return false; // Prevent the form from submitting via the usual way
  }
});

// Add custom validation method for letters only
$.validator.addMethod("lettersOnly", function(value, element) {
  return this.optional(element) || /^[a-zA-Z\s]+$/.test(value);
}, "This field can only contain letters");


// Function to show profile update success popup
function showProfileUpdateSuccess() {
  // Create popup HTML
  const popupHTML = `
    <div id="profile-success-popup" class="profile-success-popup">
      <div class="profile-success-content">
        <div class="profile-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#4CAF50"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Profile Updated Successfully!</h3>
        <p>Your profile information has been updated.</p>
        <button onclick="closeProfileSuccessPopup()" class="btn-primary">OK</button>
      </div>
    </div>
  `;
  
  // Add popup to body
  $('body').append(popupHTML);
  
  // Show popup with animation
  setTimeout(function() {
    $('#profile-success-popup').addClass('show');
  }, 100);
}

// Function to close profile success popup
function closeProfileSuccessPopup() {
  $('#profile-success-popup').removeClass('show');
  setTimeout(function() {
    $('#profile-success-popup').remove();
  }, 300);
}

// Close popup when clicking outside
$(document).on('click', '#profile-success-popup', function(e) {
  if (e.target.id === 'profile-success-popup') {
    closeProfileSuccessPopup();
  }
});

// Close popup with Escape key
$(document).on('keydown', function(e) {
  if (e.key === 'Escape' && $('#profile-success-popup').length) {
    closeProfileSuccessPopup();
  }
});

// Category cards scrolling and center alignment functionality
$(document).ready(function() {
  function handleCategoryCardsAlignment() {
    $('.categories-list').each(function() {
      const container = $(this);
      const containerWidth = container.width();
      const scrollWidth = container[0].scrollWidth;

      // If content overflows, align to start for scrolling, otherwise center
      if (scrollWidth > containerWidth) {
        container.addClass('has-overflow');
        container.css('justify-content', 'flex-start');

        // Force scrollbar visibility on mobile
        if (window.innerWidth <= 1024) {
          container.css({
            'scrollbar-width': 'auto',
            'overflow-x': 'scroll'
          });
        }
      } else {
        container.removeClass('has-overflow');
        container.css('justify-content', 'center');
      }
    });
  }

  // Handle category cards alignment on load and resize
  handleCategoryCardsAlignment();

  // Debounced resize handler for better performance
  let resizeTimeout;
  $(window).on('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleCategoryCardsAlignment, 150);
  });

  // Re-check alignment when images load
  $('.category-card img').on('load', function() {
    setTimeout(handleCategoryCardsAlignment, 100);
  });

  // Smooth scrolling for category cards on mobile
  $('.categories-list').on('touchstart', function(e) {
    this.startX = e.originalEvent.touches[0].pageX;
    this.scrollLeft = this.scrollLeft;
  });

  $('.categories-list').on('touchmove', function(e) {
    if (!this.startX) return;

    const x = e.originalEvent.touches[0].pageX;
    const walk = (x - this.startX) * 2; // Scroll speed multiplier
    this.scrollLeft = this.scrollLeft - walk;
  });

  $('.categories-list').on('touchend', function() {
    this.startX = null;
  });

  // Handle category toggle and re-align cards
  $('.toggle-btn').on('click', function() {
    // Wait for the category switch animation to complete
    setTimeout(handleCategoryCardsAlignment, 100);
  });

  // Add keyboard navigation for category cards
  $('.category-card').on('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const cards = $('.categories-list:visible .category-card');
      const currentIndex = cards.index(this);
      let nextIndex;

      if (e.key === 'ArrowLeft') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      } else {
        nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
      }

      cards.eq(nextIndex).focus();

      // Scroll the focused card into view
      const container = $('.categories-list:visible');
      const card = cards.eq(nextIndex);
      const cardOffset = card.position().left;
      const cardWidth = card.outerWidth();
      const containerWidth = container.width();

      if (cardOffset < 0) {
        container.scrollLeft(container.scrollLeft() + cardOffset - 20);
      } else if (cardOffset + cardWidth > containerWidth) {
        container.scrollLeft(container.scrollLeft() + cardOffset + cardWidth - containerWidth + 20);
      }
    }
  });

  // Make category cards focusable for accessibility
  $('.category-card').attr('tabindex', '0');

  // Force scrollbar visibility on mobile devices
  function ensureMobileScrollbarVisibility() {
    if (window.innerWidth <= 1024) {
      $('.categories-list').each(function() {
        const $this = $(this);
        const element = this;

        // Force scrollbar to be visible
        $this.css({
          'overflow-x': 'scroll',
          'scrollbar-width': 'auto',
          '-webkit-overflow-scrolling': 'touch'
        });

        // Add a temporary scroll event to ensure scrollbar appears
        $this.on('scroll.forceScrollbar', function() {
          // Remove the event after first scroll
          $this.off('scroll.forceScrollbar');
        });

        // Trigger a minimal scroll to show scrollbar
        if (element.scrollWidth > element.clientWidth) {
          element.scrollLeft = 1;
          setTimeout(() => {
            element.scrollLeft = 0;
          }, 100);
        }
      });
    }
  }

  // Call on load and resize
  ensureMobileScrollbarVisibility();
  $(window).on('resize', ensureMobileScrollbarVisibility);
});