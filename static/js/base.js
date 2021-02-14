 $(document).ready(function () {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    // code for toast messages and arrow attributions 
    if ($('#emblem-circle').length == 0) {
        $('.message-container').addClass('message-container-home');
    }
    $('.toast').toast('show');
    $("#arrow-emblem").addClass($('.arrow-up').attr('class'));
    $("#arrow-emblem-home").addClass($('.arrow-up').attr('class'));
    // added this to enable close button on toast, which did not work without it.
    $('.close').click(function () {
        $('.toast').hide();
    });
    // code for attributing active class to nav item
    let current = "/" + window.location.pathname.split("/")[1] + "/";
    if (current == "/accounts/" || current == "//") {
        current = window.location.pathname;
    }
    $('.nav-link').each(function () {
        let link = "/" + $(this).attr("href").split("/")[1] + "/";
        $(this).removeClass("active");
        if (link == current) {
            $(this).addClass("active");
        }
    });
    // Code for hover and click effect for emblem info layover: also for touch devices.
    let mouseleave_cons = true;
    let touchdevice = false;
    let tapped = true;
    $("#emblem-circle, .logopic").on("mouseenter", function(){
        if (touchdevice == false){
            $("#emblem-circle").addClass("emblem-circle-hover");
            $("#hero-co-info").fadeIn(500);
            }
    });
    $("#emblem-circle, .logopic").on("mouseleave", function(){
        if (mouseleave_cons == true && touchdevice == false){
            $("#emblem-circle").removeClass("emblem-circle-hover");
            $("#hero-co-info").hide();
        }
    });
    $("#emblem-circle, .logopic, #close-info-overlay").on("click", function(){
        if (touchdevice == false){
            if (mouseleave_cons == false){
                mouseleave_cons = true;
                $("#hero-co-info").hide();
                $("#emblem-circle").removeClass("emblem-circle-hover");

            }else{
                mouseleave_cons = false;
                $("#hero-co-info").fadeIn(500);
                $("#emblem-circle").addClass("emblem-circle-hover");
            }
        }
    });
    $("#emblem-circle, .logopic, #close-info-overlay").on("touchstart", function(e){
        e.preventDefault();
        touchdevice = true;
        if (tapped == false){
            tapped = true;
            $("#hero-co-info").hide();
            $("#emblem-circle").removeClass("emblem-circle-hover");
        }else{
            tapped = false;
            $("#hero-co-info").fadeIn(500);
            $("#emblem-circle").addClass("emblem-circle-hover");
        }
    });
    // collapse navbar on click anywhere else
    $(":not(#navbarNavDropdown)").click(function(){
        $("#navbarNavDropdown").collapse('hide');
    });

    // Close single notification toast.
    $(document).on("click", ".close-notification", function(){
        let note_id = $(this).closest(".toast").find(".note-col:first").attr('id');
        $(this).closest(".toast").remove();
        markAsRead(note_id);
    });

    // Format notification toast.
    $(".note-col").each(function(){
        if ($(this).data('note-type') == "comment"){
        let text = $(this).text();
        let note = text.split("$%$%")[0];
        let message = text.split("$%$%")[1];
        let toasthtml = `<p>${note}<hr><em>${message}</em></p>`;
        $(this).html(toasthtml);
        }
    });
    // Mark notification as read to stop it from reappearing.
    function markAsRead(note_id){
        $.ajax({
            type: "POST",
            url: "/profile/markAsRead/",
            data: {
                note_id: note_id,
            },
            dataType: "json",
            success: function () {
                console.log("marked as read");
            },
            error: function() {
                console.log("failed ajax mark as read");
            }
        });
    }
    // Set on/off mail notification.
    $(document).on("click", ".set-mail-not", function(){
        let on_off = $(this).data("onoff");
        $.ajax({
            type: "POST",
            url: "/profile/SetMailNot/",
            data: {
                on_off: on_off,
            },
            dataType: "json",
            success: function (data) {
                if (on_off == "on"){
                    $("#turn-on-mail").html('Turn Notifications Off');
                    $("#turn-on-mail").data('onoff','off');
                    $("#turn-on-mail").attr('id', 'turn-off-mail');
                } else {
                    $("#turn-off-mail").html('Turn Notifications On');
                    $("#turn-off-mail").data('onoff','on');
                    $("#turn-off-mail").attr('id', 'turn-on-mail');
                }
            }, error: function(){
                console.log("set mail not ajax failed");
            }
        });
    });

    // remove allauth labels from allauth forms.
    $(".password_change, .signup, .login, .password_reset, .add_email").find("label:not(.form-check-label)").remove();

});