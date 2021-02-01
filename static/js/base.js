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
});