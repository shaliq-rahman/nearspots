$("#categoriesForm").validate({
    rules: {
      title: {
        required: true,
      },
      title_ar: {
        required: true,
      },
      start_date: {
        required: true,
      },
      expiry_date: {
        required: true,
      },
      // description: {
      //   required: true,
      // },
      // cat_image: {
      //   required: true,
      // },
      // cat_doc: {
      //   required: true,
      // },
    },
    errorPlacement: function (error, element) {
      if (element.hasClass("dropify")) {
        error.insertAfter(element.closest(".mb-lg-0"));
      } else {
        error.insertAfter(element);
      }
    },
  
    submitHandler: function (form) {
      var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
      var formData = new FormData(form);
      var formUrl = $(form).attr("action");
  
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
          $("#catbtn").prop("disabled", true);
          $("#catbtn").html("Submitting ...");
        },
        success: function (response) {
          if (response.success) {
            // window.location.href = response.redirect_url;
            FilterMaster('')
          } else {
            $(".login_error_label").text(response.message);
            $("#login_error_label").attr("style", "display:block;");
            setTimeout(function () {
              $("#login_error_label").attr("style", "display:none;");
            }, 3500);
          }
        },
        error: function (xhr, status, error) {
          // Handle errors
          console.error(xhr.responseText);
        },
        complete: function () {
          $("#catbtn").html("Submit");
          // $("#catbtn").prop("disabled", false);
        },
      });
  
      return false; // Prevent the form from submitting via the usual way
    },
  });

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