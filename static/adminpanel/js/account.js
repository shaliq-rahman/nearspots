$("#loginSubmit").on("click", function (event) {
  event.preventDefault();
  $("#loginSubmit").submit();
});

$("#loginForm").validate({
  rules: {
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true,
    },
  },
  errorPlacement: function (error, element) {
    error.insertAfter(element.closest(".input-group"));
  },

  submitHandler: function (form) {
    var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    var formData = $(form).serialize();
    var formUrl = $(form).attr("action");
    var currentUrl = window.location.href;
    formData += "&current_url=" + encodeURIComponent(currentUrl);
    var headers = {
      "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
    };

    $.ajax({
      type: $(form).attr("method"),
      url: formUrl,
      data: formData,
      headers: headers,
      dataType: "json", // Specify the expected data type
      beforeSend: function () {
        $("#loginSubmit").prop("disabled", true);
        $("#loginSubmit").html("Logging in...");
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
        $("#loginSubmit").html("Login");
        $("#loginSubmit").prop("disabled", false);
      },
    });

    return false; // Prevent the form from submitting via the usual way
  },
});

$("#profileForm").validate({
  rules: {
    current_password: {
      required: true,
    },
    new_password: {
      required: true,
    },
    confirm_new_password: {
      required: true,
      equalTo: "#new_password", // Ensures confirm_password matches the value of #new_password
    },
  },
  messages: {
    confirm_new_password: {
      equalTo: "Passwords do not match", // Corrected field name and message
    },
  },
  errorPlacement: function (error, element) {
    error.insertAfter(element.closest(".input-group"));
  },
  submitHandler: function (form) {
    var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    var formData = new FormData(form);
    var formUrl = $(form).attr("action");
    var headers = {
      "X-CSRFToken": csrfToken,
    };

    $.ajax({
      type: $(form).attr("method"),
      url: formUrl,
      data: formData,
      headers: headers,
      cache: false,
      contentType: false,
      processData: false,

      beforeSend: function () {
        $("#submit_btn").prop("disabled", true);
      },

      success: function (response) {
        if (response.success) {
          $(".msg_desc").text(response.message);
          $("#flash_message_success").attr("style", "display:block;");
          setTimeout(function () {
            $("#flash_message_success").attr("style", "display:none;");
          }, 3500);
          location.href = response.redirect_url;
        } else {
          $(".msg_desc").text(response.message);
          $("#flash_message_error").attr("style", "display:block;");
          setTimeout(function () {
            $("#flash_message_error").attr("style", "display:none;");
          }, 3500);
        }
      },
      complete: function () {},
    });

    return false;
  },
});
