function FilterMaster(page) {
  if (page == "") {
    page = $("#current_page").val();
  }
  var keyword = $("#keyword_search").val();
  var search_url = $("#keyword_search").attr("data-url");
  var status = $("#filter_status").val();
  var package_type = $("#package_type").val();
  var activity = $("#activity").val();
  var coupon_type = $("#coupon_type").val();
  var vendor = $("#select_vendor").val();
  var discount_type = $("#select_discount_type").val();
  var booking_date = $("#booking_date").val();
  var user_type = $("#user_type").val();
  var filter_user = $("#filter_user").val();
  var filter_vendor = $("#filter_vendor").val();
  var coupon_code = $("#coupon_code").val();
  var booking_status = $("#booking_status").val();

  $.ajax({
    url: search_url,
    headers: {
      "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val(),
    },
    method: "GET",
    data: {
      page: page,
      keyword: keyword,
      status: status,
      package_type: package_type,
      activity: activity,
      coupon_type: coupon_type,
      vendor: vendor,
      discount_type: discount_type,
      booking_date: booking_date,
      user_type: user_type,
      filter_user: filter_user,
      filter_vendor: filter_vendor,
      coupon_code: coupon_code,
      booking_status: booking_status,
    },
    beforeSend: function () {},
    success: function (response) {
      $("#master-tbody").html(response.template);
      $("#master-pagination").html(response.pagination);
    },
  });
}

function ResetFilter() {
  $("#filter_status").val("all").trigger("change");
  $("#keyword_search").val("");
  $("#package_type").val("").trigger("change");
  $("#activity").val("").trigger("change");
  $("#select_vendor").val("").trigger("change");
  $("#select_discount_type").val("").trigger("change");
  $("#coupon_type").val("").trigger("change");
  $("#booking_date").val("").trigger("change");
  $("#user_type").val("").trigger("change");
  $("#filter_user").val("").trigger("change");
  $("#filter_vendor").val("").trigger("change");
  $("#booking_status").val("").trigger("change");
  $("#coupon_code").val("");
  FilterMaster("1");
}

function ToggleMaster(id, status, toggle_url) {
  $.ajax({
    url: toggle_url,
    headers: {
      "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val(),
    },
    method: "POST",
    data: {
      id: id,
      status: status,
    },
    beforeSend: function () {},
    success: function (response) {
      if (response.success) {
        $(".msg_desc").text(response.message);
        $("#flash_message_success").attr("style", "display:block;");
        setTimeout(function () {
          $("#flash_message_success").attr("style", "display:none;");
        }, 3500);
      } else {
        $(".msg_desc").text(response.message);
        $("#flash_message_error").attr("style", "display:block;");
        setTimeout(function () {
          $("#flash_message_error").attr("style", "display:none;");
        }, 3500);
      }
    },
  });
}

$(".master-toggle").on("change", function () {
  var id = $(this).attr("data-item_id");
  var toggle_url = $(this).attr("data-url");
  if ($(this).is(":checked")) {
    ToggleMaster(id, "checked", toggle_url);
  } else {
    console.log("Toggle button is unchecked");
    ToggleMaster(id, "unchecked", toggle_url);
  }
});

$(document).on("click", ".delete-item", function (event) {
  event.preventDefault();

  var data_url = $(this).attr("data-url");
  var item_id = $(this).attr("data-item-id");
  var button = document.getElementById("delete-btn-confirm");
  button.setAttribute("data-url", data_url);
  button.setAttribute("data-item-id", item_id);
});

$(document).on("click", "#delete-btn-confirm", function (event) {
  event.preventDefault();

  var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
  var data_url = $(this).attr("data-url");
  var item_id = $(this).attr("data-item-id");
  var headers = {
    "X-CSRFToken": csrfToken,
  };

  $.ajax({
    type: "post",
    url: data_url,
    data: {
      id: item_id,
    },
    headers: headers,
    beforeSend: function () {
      $("#modal-close-btn").click();
    },

    success: function (response) {
      if (response.success) {
        $(".msg_desc").text(response.message);
        $("#flash_message_success").attr("style", "display:block;");
        setTimeout(function () {
          $("#flash_message_success").attr("style", "display:none;");
        }, 3500);
        FilterMaster("");
        // location.href = response.redirect_url;
      } else {
        alert("FAIL")
        $(".msg_desc").text(response.message);
        $("#flash_message_error").attr("style", "display:block;");
        setTimeout(function () {
          $("#flash_message_error").attr("style", "display:none;");
        }, 3500);
      }
    },
    complete: function () {},
  });
});
