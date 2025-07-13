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
  