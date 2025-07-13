// Quick Category Form Handler
$("#quick-category-form").validate({
    rules: {
      title: {
        required: true,
        minlength: 2,
      },
    },
    errorPlacement: function (error, element) {
      error.insertAfter(element);
    },
  
    submitHandler: function (form) {
      var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
      var formData = new FormData(form);
      var categoryId = $('#category_id').val();
      var formUrl = categoryId ? `/adminpanel/categories/${categoryId}/edit/` : $(form).attr("action");
  
      $.ajax({
        type: $(form).attr("method"),
        url: formUrl,
        data: formData,
        headers: {
          "X-CSRFToken": csrfToken,
        },
        cache: false,
        contentType: false,
        processData: false,
  
        beforeSend: function () {
          $("#quick-category-form button[type='submit']").prop("disabled", true);
          $("#quick-category-form button[type='submit']").html('<i class="fe fe-loader fa-spin"></i> Saving...');
        },
        success: function (response) {
          // Remove any existing alerts first
          $('.alert').remove();
          
          if (response.success) {
            // Show success message on page
            var successHtml = '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
                              '<i class="fe fe-check-circle me-2"></i>' + response.message +
                              '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                              '</div>';
            $('.page-header').after(successHtml);
            
            // Clear the form and close modal
            $("#quick-category-form")[0].reset();
            $('#category-popup-modal').modal('hide');
            
            // Auto-hide success message and reload the page
            setTimeout(function() {
              $('.alert').fadeOut(300, function() {
                $(this).remove();
                FilterMaster('')
                // window.location.reload();
              });
            }, 1500);
          } else {
            // Show error message on page
            var errorHtml = '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                           '<i class="fe fe-alert-circle me-2"></i>' + response.message +
                           '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                           '</div>';
            $('.page-header').after(errorHtml);
            
            // Auto-hide error message after 3 seconds
            setTimeout(function() {
              $('.alert').fadeOut(300, function() {
                $(this).remove();
              });
            }, 3000);
          }
        },
        error: function (xhr, status, error) {
          // Remove any existing alerts first
          $('.alert').remove();
          
          // Handle errors
          console.error(xhr.responseText);
          var errorHtml = '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                         '<i class="fe fe-alert-circle me-2"></i>Something went wrong. Please try again.' +
                         '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                         '</div>';
          $('.page-header').after(errorHtml);
          
          // Auto-hide error message after 3 seconds
          setTimeout(function() {
            $('.alert').fadeOut(300, function() {
              $(this).remove();
            });
          }, 3000);
        },
        complete: function () {
          $("#quick-category-form button[type='submit']").prop("disabled", false);
          var isEdit = $('#category_id').val() ? true : false;
          var btnText = isEdit ? 'Update Category' : 'Save Category';
          $("#quick-category-form button[type='submit']").html('<i class="fe fe-save"></i> ' + btnText);
        },
      });
  
      return false; // Prevent the form from submitting via the usual way
    },
  });

// Handle edit button clicks
$(document).on('click', '.edit-category-btn', function() {
    var categoryId = $(this).data('category-id');
    var categoryName = $(this).data('category-name');
    
    // Update modal for edit mode
    $('#modal-title-text').text('Edit Category');
    $('#submit-btn-text').text('Update Category');
    $('#category_id').val(categoryId);
    $('#category_name').val(categoryName);
    $('#category_name').focus();
});

// Handle add button clicks (reset modal to create mode)
$(document).on('click', '[data-bs-target="#category-popup-modal"]', function() {
    // Check if this is the add button (not edit button)
    if (!$(this).hasClass('edit-category-btn')) {
        // Reset modal for create mode
        $('#modal-title-text').text('Add New Category');
        $('#submit-btn-text').text('Save Category');
        $('#category_id').val('');
        $('#category_name').val('');
        $('#quick-category-form')[0].reset();
    }
});

// Reset modal when closed
$('#category-popup-modal').on('hidden.bs.modal', function () {
    $('#modal-title-text').text('Add New Category');
    $('#submit-btn-text').text('Save Category');
    $('#category_id').val('');
    $('#category_name').val('');
    $('#quick-category-form')[0].reset();
});

// Spots Form Handler
$("#spotsForm").validate({
    rules: {
        name: {
            required: true,
            minlength: 2,
        },
        category: {
            required: true,
        },
        latitude: {
            required: true,
            number: true,
            range: [-90, 90],
        },
        longitude: {
            required: true,
            number: true,
            range: [-180, 180],
        },
        coordinates: {
            required: true,
        },
        address: {
            required: true,
        },
        building_name: {
            required: true,
        },
        landmark: {
            required: true,
        },
        city: {
            required: true,
        },
        description: {
            required: true,
        },
        spot_images: {
            required: function() {
                var selectedFiles = window.selectedFiles || [];
                var existingImages = $('.cover-checkbox').length;
                return (selectedFiles.length + existingImages) === 0;
            }
        },
    },
    messages: {
        name: {
            required: "Please enter a spot name",
            minlength: "Spot name must be at least 2 characters long",
        },
        category: {
            required: "Please select a category",
        },
        latitude: {
            required: "Please enter latitude",
            number: "Please enter a valid latitude",
            range: "Latitude must be between -90 and 90",
        },
        longitude: {
            required: "Please enter longitude",
            number: "Please enter a valid longitude",
            range: "Longitude must be between -180 and 180",
        },
        coordinates: {
            required: "Please enter coordinates",
        },
        address: {
            required: "Please enter address",
        },
        building_name: {
            required: "Please enter building name",
        },
        landmark: {
            required: "Please enter landmark",
        },
        city: {
            required: "Please enter city",
        },
        description: {
            required: "Please enter description",
        },
        spot_images: {
            required: "At least one image is required",
        },
    },
    errorPlacement: function (error, element) {
        if (element.hasClass("dropify")) {
            error.insertAfter(element.closest(".mb-lg-0"));
        } else if (element.attr('name') === 'spot_images') {
            // Place image error after the image upload container
            error.insertAfter('.image-upload-container');
        } else {
            error.insertAfter(element);
        }
    },

    submitHandler: function (form) {
        // Update cover image selection before submission
        if (typeof updateCoverImageSelection === 'function') {
            updateCoverImageSelection();
        }
        
        var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
        var formData = new FormData(form);
        var formUrl = $(form).attr("action");
        var isEdit = formUrl.includes('/edit/');

        // Validate image count and cover selection
        var selectedFiles = window.selectedFiles || [];
        var existingImages = $('.cover-checkbox').length;
        var totalImages = selectedFiles.length + existingImages;
        
        if (totalImages > 5) {
            showAlert('Maximum 5 images allowed. Please remove some images.', 'error');
            return false;
        }

        // Validate cover image selection for new images
        var newCoverSelected = $('.new-cover-checkbox:checked').length > 0;
        var existingCoverSelected = $('.cover-checkbox:checked').length > 0;
        
        // Only require cover selection if there are new images and no existing cover
        if (selectedFiles.length > 0 && !existingCoverSelected && !newCoverSelected) {
            showAlert('Please select a cover image for the new images.', 'error');
            return false;
        }

        $.ajax({
            type: $(form).attr("method"),
            url: formUrl,
            data: formData,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            cache: false,
            contentType: false,
            processData: false,

            beforeSend: function () {
                $("#spotsbtn").prop("disabled", true);
                $("#spotsbtn").html('<i class="fe fe-loader fa-spin"></i> ' + (isEdit ? 'Updating...' : 'Creating...'));
            },
            success: function (response) {
                // Remove any existing alerts first
                $('.alert').remove();
                
                if (response.success) {
                    // Show success message on page
                    var successHtml = '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
                                      '<i class="fe fe-check-circle me-2"></i>' + response.message +
                                      '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                                      '</div>';
                    $('.page-header').after(successHtml);
                    
                    // Auto-hide success message and redirect
                    setTimeout(function() {
                        $('.alert').fadeOut(300, function() {
                            $(this).remove();
                            if (response.redirect_url) {
                                window.location.href = response.redirect_url;
                            } else {
                                window.location.href = '/adminpanel/spots/';
                            }
                        });
                    }, 1500);
                } else {
                    // Show error message on page
                    var errorHtml = '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                                   '<i class="fe fe-alert-circle me-2"></i>' + response.message +
                                   '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                                   '</div>';
                    $('.page-header').after(errorHtml);
                    
                    // Auto-hide error message after 3 seconds
                    setTimeout(function() {
                        $('.alert').fadeOut(300, function() {
                            $(this).remove();
                        });
                    }, 3000);
                }
            },
            error: function (xhr, status, error) {
                // Remove any existing alerts first
                $('.alert').remove();
                
                // Handle errors
                console.error(xhr.responseText);
                var errorMessage = 'Something went wrong. Please try again.';
                
                // Try to parse error response
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.message) {
                        errorMessage = response.message;
                    } else if (response.error) {
                        errorMessage = response.error;
                    }
                } catch (e) {
                    // If parsing fails, use default message
                }
                
                var errorHtml = '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                               '<i class="fe fe-alert-circle me-2"></i>' + errorMessage +
                               '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                               '</div>';
                $('.page-header').after(errorHtml);
                
                // Auto-hide error message after 3 seconds
                setTimeout(function() {
                    $('.alert').fadeOut(300, function() {
                        $(this).remove();
                    });
                }, 3000);
            },
            complete: function () {
                $("#spotsbtn").prop("disabled", false);
                var btnText = isEdit ? 'Update Spot' : 'Create Spot';
                $("#spotsbtn").html('<i class="fe fe-save"></i> ' + btnText);
            },
        });

        return false; // Prevent the form from submitting via the usual way
    },
});

// Function to show alerts (if not already defined)
function showAlert(message, type) {
    // Remove existing alerts
    $('.alert').remove();
    
    var alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    var alertHtml = '<div class="alert ' + alertClass + ' alert-dismissible fade show" role="alert">' +
        '<i class="fe fe-' + (type === 'success' ? 'check-circle' : 'alert-circle') + ' me-2"></i>' +
        message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
        '</div>';
    
    $('.page-header').after(alertHtml);
    
    // Auto-hide after 3 seconds
    setTimeout(function() {
        $('.alert').fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}