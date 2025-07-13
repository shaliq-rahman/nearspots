// $( document ).ready(function() {
//   alert( "ready!" );
// });

// Offers
$("#offersForm").validate({
  rules: {
    title: {
      required: true,
    },
    title_ar: {
      required: true,
    },
    expiry_date: {
      required: true,
    },
    start_date: {
      required: true,
    },
    description: {
      required: true,
    },
    description_ar: {
      required: true,
    },
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
        $("#offerbtn").prop("disabled", true);
        $("#offerbtn").html("Submitting...");
      },
      success: function (response) {
        if (response.success) {
          window.location.href = response.redirect_url;
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
        $("#offerbtn").html("Submit");
        // $("#offerbtn").prop("disabled", false);
      },
    });

    return false; // Prevent the form from submitting via the usual way
  },
});

// highlights
$("#highlightsForm").validate({
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
    // hlts_image: {
    //   required: true,
    // },
    // hlts_doc: {
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
        $("#hilghtbtn").prop("disabled", true);
        $("#hilghtbtn").html("Submitting ...");
      },
      success: function (response) {
        if (response.success) {
          window.location.href = response.redirect_url;
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
        $("#hilghtbtn").html("Submit");
        // $("#hilghtbtn").prop("disabled", false);
      },
    });

    return false; // Prevent the form from submitting via the usual way
  },
});

// CMS
$("#cmsForm").validate({
  rules: {
    title: {
      required: true,
    },
    description: {
      required: true,
    },
    description_ar: {
      required: true,
    },
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
        $("#cmsbtn").prop("disabled", true);
        $("#cmsbtn").html("Submitting ...");
      },
      success: function (response) {
        console.log(response);
        if (response.success) {
          window.location.href = response.redirect_url;
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
        $("#cmsbtn").html("Submit");
        $("#cmsbtn").prop("disabled", false);
      },
    });

    return false; // Prevent the form from submitting via the usual way
  },
});

//VoucherPoints
$("#PointsForm").validate({
  rules: {
    min_value: {
      required: true,
      number: true,
    },
    points_value: {
      required: true,
      number: true,
    },
    sar_value: {
      required: true,
      number: true,
    },
    points_increment:{
      required: true,
      number: true,
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
        $("#loginSubmit").prop("disabled", true);
        $("#loginSubmit").html("Logging in...");
      },
      success: function (response) {
        console.log(response);
        if (response.success) {
          window.location.href = response.redirect_url;
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
        $("#loginSubmit").html("Login");
        $("#loginSubmit").prop("disabled", false);
      },
    });

    return false; // Prevent the form from submitting via the usual way
  },
});


//PROMOCODES
$("#PromocodeForm").validate({
  rules: {
    code: {
      required: true,
    },
    user: {
      required: true,
    },
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
        $("#loginSubmit").prop("disabled", true);
        $("#loginSubmit").html("Logging in...");
      },
      success: function (response) {
        console.log(response);
        if (response.success) {
          window.location.href = response.redirect_url;
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
        $("#loginSubmit").html("Login");
        $("#loginSubmit").prop("disabled", false);
      },
    });

    return false; // Prevent the form from submitting via the usual way
  },
});



$("#BulkUploadForm").validate({
  rules: {
    code: {
      required: true,
    },
    user: {
      required: true,
    },
  },
  errorPlacement: function (error, element) {
    if (element.hasClass("dropify")) {
      error.insertAfter(element.closest(".dropify-wrapper"));
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
        $("#loginSubmit").prop("disabled", true);
        $("#loginSubmit").html("Logging in...");
      },
      success: function (response) {
        console.log(response);
        if (response.success) {
          window.location.href = response.redirect_url;
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
        $("#loginSubmit").html("Login");
        $("#loginSubmit").prop("disabled", false);
      },
    });

    return false; // Prevent the form from submitting via the usual way
  },
});
