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
      minlength: 10,
      maxlength: 10,
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
      minlength: "Mobile number must be exactly 10 digits",
      maxlength: "Mobile number must be exactly 10 digits",
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
          // Show success message
          alert(response.message);
          // Close modal
          $('#register-modal-overlay').hide();
          // Redirect to home page
          if (response.redirect_url) {
            window.location.href = response.redirect_url;
          }
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
          // Show success message
          alert(response.message);
          // Close modal
          $('#auth-modal-overlay').hide();
          // Redirect to home page
          if (response.redirect_url) {
            window.location.href = response.redirect_url;
          }
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
          alert('Login failed. Please try again.');
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


$("#write-review-form").validate({
  rules: {
    "review": {
      required: true,
      minlength: 10,
      maxlength: 1000
    }
  },
  messages: {
    "review": {
      required: "Please write your review",
      minlength: "Review must be at least 10 characters",
      maxlength: "Review cannot exceed 1000 characters"
    }
  },
  errorPlacement: function(error, element) {
    // For review textarea, place error after the textarea
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