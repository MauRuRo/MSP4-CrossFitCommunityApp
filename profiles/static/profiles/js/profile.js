$(document).ready(function(){
    $('#new-image').change(function() {
        var file = $('#new-image')[0].files[0];
        $('#filename').text(`Image will be set to: ${file.name}`);
    });
    $("#toggle-edit-profile-button").click(function(){
        $("#user-info-block").hide()
        $("#edit-form-block").removeAttr('hidden')
        $("#edit-form-block").show()

    })
    $("#cancel-profile-edit").click(function(e){
        e.preventDefault()
        $("#user-info-block").show()
        $("#edit-form-block").hide()

    })
    $('#test-submit-button').click(function(e) {
        e.preventDefault()
        $.ajax({
            type:"POST",
            url: "/profile/test/",
            data: {test:"test"},
            dataType: 'json',
            success: function(data){
                console.log(data.message)
                alert("SUCCESs!!")
            },
            error: function(){
                console.log("Failed")
            }
        })
    })
    $('#user-populate').click(function() {
    $.ajax({
    url: 'https://randomuser.me/api/?results=500&format=json&dl',
    dataType: 'json',
    success: function(data) {
        console.log(data);
        let p_data=JSON.stringify(data)
        $("#printout").val(p_data)
        console.log("Succesfully uploaded userfile2")
    }
    });
    });

    function updateLevelCSS(){
        $(".level-bar").each(function(){
            let height = $(this).next().text() + "px"
            if (height == "nonepx"){
                height = '0px'
            }
            $(this).css("min-height", height)
            let name = $(this).parent().next(".level-cat-name")[0]
            let namewidth = name.offsetWidth
            let namespan = $(this).parent().next(".level-cat-name").children("span")[0]
            let namespanwidth = namespan.offsetWidth
            if (namespanwidth > namewidth){
                $(this).parent().next(".level-cat-name").css("margin-left", "-100%")
                $(this).parent().next(".level-cat-name").css("margin-right", "-100%")
            }
            if ($(".acc-high").length > 4) {
                $("#gen-level").css("color", "blue")
            }else if ($(".acc-low").length > 3) {
                $("#gen-level").css("color", "red")
            }else if ($(".acc-none").length > 3){
                $("#gen-level").css("color", "red")
            }else{
                $("#gen-level").css("color", "#ffc107")
            }
        })
    }
    updateLevelCSS()

    function updateLevels(){
        $("#level-loader").removeAttr("hidden")
        $("#level-loader").show()
         $.ajax({
                type:"POST",
                url: "/profile/calc_level/",
                success: function(data){
                    $("#level-loader").hide()
                    $("#level-block").html(data.new_levels_html)
                    updateLevelCSS()
                    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
                    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
                    return new bootstrap.Popover(popoverTriggerEl)})
                },
                error: function(){
                    console.log("Failed Updating Levels")
                    $("#level-loader").children("p").html("Failed to get most recent statistics. Please refresh page to try again.")
                }
            })
       };
       updateLevels()

       $(document).on("click", "#level-info-modal", function(){
           if ($("#level-info").is(":visible")){
                $("#level-info").hide()
           }else{
                $("#level-info").removeAttr('hidden')
                $("#level-info").show()
           }
           
       })
       $("#his-me").click(function(){
           console.log("check")
           lazyLoadLogsPHis()
       })
let scroll_constant = true
function lazyLoadLogsPHis() {
                let pagedata = $("#his-me")
                $(".his-dir-down:visible").html('<i class="fas fa-circle-notch fa-spin"></i>')            
                var pageno = pagedata.data('page');
                if (pageno == "x"){
                    scroll_constant = true
                    return;
                }
                var page = 2;
                $.ajax({
                type: 'POST',
                url: '/profile/getPersonalHistory/',
                data: {
                    page: pageno,
                },
                dataType: "json",
                success: function(data) {
                    if (data.no_page==true){
                        scroll_constant = true
                        $(".his-dir-down:visible").remove()
                        return;
                    }
                    // if there are still more pages to load,
                    // add 1 to the "Load More Posts" link's page data attribute
                    // else hide the link
                        // if (data.has_next) {
                        //     pagedata.data('page', pageno+1);
                        // } else {
                        //     pagedata.data('page', "x");
                        // }
                    // append html to the posts div
                    let appendlist
                    appendlist = $(".log-phistory:visible").attr("class").split(" ")[1]
                    $('.log-phistory:visible').append(data.calling_group_html);
                    $('.log-phistory:visible').append('<div class="row mx-0 my-1 align-items-center justify-content-center direction direction-down-his direction-his"><i class="fas fa-angle-double-down"></i></div>')
                    // if (pagedata.data('page')=="x"){
                    //     $(".direction-down-his:visible").remove()
                    // }else{
                    //     $(".his-dir-down:visible").remove()
                    //     $(".direction-down-his").addClass('his-dir-down')
                    // }
                    $('.extra-log-info').hide()
                    dateStyling($(".his-date-new"))
                    $(".his-date-new").addClass("his-date")
                    $(".his-date-new").removeClass("his-date-new")
                    // $(".log-his-XX").addClass(appendlist+"X")
                    // $(".log-his-XX").removeClass("log-his-XX")
                    // scroll_constant = true
                },
                error: function(xhr, status, error) {
                }
                });
                
        };




})
// import { dateStyling } from '/static/js/workouts.js';