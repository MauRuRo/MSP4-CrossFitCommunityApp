$(document).ready(function () {
    // SET VARIABLES
    // none
    
    // DECLARE FUNCTIONS

    // Reset the CSS for the levels (bar heights/colors)
    function updateLevelCSS() {
        $(".level-bar").each(function () {
            let height = $(this).next().text() + "px"
            if (height == "nonepx") {
                height = '0px'
            }
            $(this).css("min-height", height)
            let name = $(this).parent().next(".level-cat-name")[0]
            let namewidth = name.offsetWidth
            let namespan = $(this).parent().next(".level-cat-name").children("span")[0]
            let namespanwidth = namespan.offsetWidth
            if (namespanwidth > namewidth) {
                $(this).parent().next(".level-cat-name").css("margin-left", "-100%")
                $(this).parent().next(".level-cat-name").css("margin-right", "-100%")
            }
            if ($(".acc-high").length > 4) {
                $("#gen-level").css("color", "blue")
            } else if ($(".acc-low").length > 3) {
                $("#gen-level").css("color", "red")
            } else if ($(".acc-none").length > 3) {
                $("#gen-level").css("color", "red")
            } else {
                $("#gen-level").css("color", "#ffc107")
            }
        })
    }
    
    // Get latest statistics for user levels.
    function updateLevels() {
        $("#level-loader").removeAttr("hidden")
        $("#level-loader").show()
        $.ajax({
            type: "POST",
            url: "/profile/calc_level/",
            data: {
                user: "request",
            },
            dataType: "json",
            success: function (data) {
                $("#level-loader").hide()
                $("#level-block").html(data.new_levels_html)
                updateLevelCSS()
                var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
                var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
                    return new bootstrap.Popover(popoverTriggerEl)
                })
            },
            error: function () {
                console.log("Failed Updating Levels")
                $("#level-loader").children("p").html("Failed to get most recent statistics. Please refresh page to try again.")
            }
        })
    };

    // EVENT HANDLERS

    // Set text for newly selected image
    $('#new-image').change(function () {
        var file = $('#new-image')[0].files[0];
        $('#filename').text(`Image will be set to: ${file.name}`);
    });

    // Click to show profile edit form.
    $("#toggle-edit-profile-button").click(function () {
        $("#user-info-block").hide()
        $("#edit-form-block").removeAttr('hidden')
        $("#edit-form-block").show()
    })

     // Click to cancel and hide profile edit form.
    $("#cancel-profile-edit").click(function (e) {
        e.preventDefault()
        $("#user-info-block").show()
        $("#edit-form-block").hide()

    })

    // Click to toggle info about Level module.
    $(document).on("click", "#level-info-modal-hl", function () {
        if ($("#level-info-hl").is(":visible")) {
            $("#level-info-hl").hide()
        } else {
            $("#level-info-hl").removeAttr('hidden').show()
        }

    })

    // EXECUTE FUNCTIONS ON DOCUMENT READY

    updateLevelCSS()
    updateLevels()

})