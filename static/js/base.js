 $(document).ready(function () {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
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
    })
    // code for attributing active class to nav item
    let current = "/" + window.location.pathname.split("/")[1] + "/"
    if (current == "/accounts/" || current == "//") {
        current = window.location.pathname
    }
    $('.nav-link').each(function () {
        let link = "/" + $(this).attr("href").split("/")[1] + "/"
        $(this).removeClass("active");
        if (link == current) {
            $(this).addClass("active");
        }
    });
    // Code for hover and click effect for emblem info layover: also for touch devices.
    let mouseleave_cons = true
    let touchdevice = false
    let tapped = true
    $("#emblem-circle, .logopic").on("mouseenter", function(){
        if (touchdevice == false){
            $("#emblem-circle").addClass("emblem-circle-hover")
            $("#hero-co-info").fadeIn(500)
            }
    })
    $("#emblem-circle, .logopic").on("mouseleave", function(){
        if (mouseleave_cons == true && touchdevice == false){
            $("#emblem-circle").removeClass("emblem-circle-hover")
            $("#hero-co-info").hide()
        }
    })
    $("#emblem-circle, .logopic, #close-info-overlay").on("click", function(){
        if (touchdevice == false){
            if (mouseleave_cons == false){
                mouseleave_cons = true
                $("#hero-co-info").hide()
                $("#emblem-circle").removeClass("emblem-circle-hover")

            }else{
                mouseleave_cons = false
                $("#hero-co-info").fadeIn(500)
                $("#emblem-circle").addClass("emblem-circle-hover")
            }
        }
    })
    $("#emblem-circle, .logopic, #close-info-overlay").on("touchstart", function(e){
        e.preventDefault()
        touchdevice = true
        if (tapped == false){
            tapped = true
            $("#hero-co-info").hide()
            $("#emblem-circle").removeClass("emblem-circle-hover")
        }else{
            tapped = false
            $("#hero-co-info").fadeIn(500)
            $("#emblem-circle").addClass("emblem-circle-hover")
        }
    })
    // collapse navbar on click anywhere else
    $(document).on("click", "body:not(#navbarNavDropdown)", function(){
        $("#navbarNavDropdown").collapse('hide')
    })
    $(document).on("touchstart", "body:not(#navbarNavDropdown)", function(){
        $("#navbarNavDropdown").collapse('hide')
    })
});