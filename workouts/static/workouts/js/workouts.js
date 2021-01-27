$(document).ready(function() {

    // SET VARIABLES AND ADJUST HTML/CSS ON PAGE LOAD

    let country_select = false
    let country_selected = ""
    let country_count = ""
    let scroll_constant = true
    let i = 1
    let gender = $('#gender').text()
    let period = 'today'
    let people = 'everybody'
    let wodhistory = 'thiswod'
    let scroll_level = 1
    let scroll_level_rank = 1
    let shift = false
    let click_const = 0
    let initial_slider = $("#rangeLevel").data('initial-value')
    let min_slider
    let max_slider 
    let step_val

    $("#categories-div").hide()
    $(".cat-wods").hide()
    $(".wod-cat-wods").show()
    $(".search-cat").hide()
    $(".workout-form-div").hide()
    $('.log-ranking').hide()
    $('#rank-today').css({'font-weight': '700', 'text-decoration': 'underline'})
    $(".tooltip").attr('hidden', 'hidden')

    // Reset classes for different log groups, for later DOM manipulation.
    for( i = 1; i < 5; i++) {
            let group = $('.log-his').first()
            group.removeClass('log-his')
            group.addClass('log-his-' + i)
        }
    for( i = 1; i < 5; i++) {
        let group = $('.log-rank').first()
        group.removeClass('log-rank')
        group.addClass('log-rank-' + i)
        }
    
    // Reset log card classes, for later DOM manipulation.
    $(".log-ranking").find(".rank-card").each(function(){
            let group_no = $(this).parent(".log-ranking").attr("class").slice(-1)
            let currid= $(this).attr("id")
            let newid= currid + "-group-" + group_no
            $(this).attr("id", newid)
        })

    // Set visibility on rank list elements
    if (gender == "F"){
        $('.log-rank-4').show()
        $('#rank-women').css({'font-weight': '700', 'text-decoration': 'underline'})
    }else{
        $('#rank-men').css({'font-weight': '700', 'text-decoration': 'underline'})
        $('.log-rank-3').show()
    }

    // Format result strings.
    $('.r-log, .h-log').each(function(){
        if (!$(this).hasClass('ft-log')) {
            while ($(this).text().slice(-1) == '0' || $(this).text().slice(-1) == '.') {
                if ($(this).text().slice(-1) == '.'){
                    let log_text = $(this).text().slice(0, -1);
                    $(this).text(log_text);
                    break
                }else{
                    let log_text = $(this).text().slice(0, -1);
                    $(this).text(log_text);
                }
            }
        } else {
            while ($(this).text().slice(0,1) == '0' || $(this).text().slice(0,1) == ':'){
                if ($(this).text().slice(0,1) == ':'){
                    let log_text = $(this).text().slice(1);
                    $(this).text(log_text);
                    break
                }else{
                    let log_text = $(this).text().slice(1);
                    $(this).text(log_text);
                }
            }
        }
    })

    // Set classes for extra info blocks
    $('.extra-log-info').each(function(){
        let group_class_name = $(this).parent().attr('class')
        let group_id = group_class_name.split(" ")[1]
        $(this).addClass(group_id + "X")
    })
    $('.extra-log-info').hide()

    // Hold down shift to enable return key = next line, instead of = submit, on user comment focus.
    if ($('.user-comment').focus()) {
        let shift = false
        $('.user-comment').on('keydown', function (e) {
            if(e.which === 16){
                shift = true
            }
        });
        $('.user-comment').on('keyup', function (e) {
            if(e.which === 16){
                shift = false
            }
        });
        $('.user-comment').on('keypress', function (e) {
            let m_comment_ta = $(this)
            let m_comment = m_comment_ta.val()
            if(e.which === 13 && shift == false){
                $(this).attr("disabled", "disabled");
                submitComment(m_comment, m_comment_ta)
                $(this).removeAttr("disabled");
            }
        });
    }

    // Set "no logs" text if there are no logs for the requested category.
    $(".log-ranking, .log-history").each(function(){
        if ($(this).children(".rank-card").length == 0){
            $(this).append("<h4 class='no-logs'>NO LOGS AVAILABLE YET.</h4>")
        }
    })

    // Determine slider attributes based on best/worst results and workout type.
    if (parseFloat($("#rangeLevelData").data('worst')) < parseFloat($("#rangeLevelData").data('best'))){
        min_slider = parseFloat($("#rangeLevelData").data('worst'))
        max_slider = parseFloat($("#rangeLevelData").data('best'))
        step_val = 0.1
        $('#rangeLevelSliderVal').html(initial_slider)
    }else{
        min_slider = $("#rangeLevelData").data('best')
        max_slider = $("#rangeLevelData").data('worst') 
        step_val = 1 
        sliderValueTime($("#rangeLevel").data('initial-value'))  
    }    

    // Set slider attributes.
    // https://codepen.io/caseymhunt/pen/kertA
    $("#rangeLevel").slider({
        min: min_slider,
        max: max_slider,
        value: initial_slider,
        step: step_val,
    });

    // DECLARE FUNCTIONS

    // Submit a comment on a log.
    function submitComment(m_comment, m_comment_ta) {
        let is_main_comment = false
        if (m_comment_ta.parent('form').parent('.edit-comment-form').attr('name') == 'edit-comment-form-user'){
            is_main_comment = true
        }
        let crud_info = m_comment_ta.parent('form').attr('class')
        let comment_id = ''
        if (crud_info != "comment-upload") {
            comment_id = m_comment_ta.prev('.comment-id').text()
        }
        let m_log_id = $('#m-log-id').attr('data')
        $.ajax({
            type:"POST",
            url: "/workouts/0/commentMember/",
            data: {
                member_comment:m_comment,
                log_id:m_log_id,
                info_crud: crud_info,
                id_comment:comment_id,
                main_comment:is_main_comment
            },
            dataType: 'json',
            success: function(data){
                if (crud_info == 'comment-upload'){
                    $('#comment-id').text(data.new_comment_id)
                    $('#comment-id').attr("data-comment-id", data.new_comment_id)
                    let template = $('#hidden-row-template').html()
                    let log_card_name = m_comment_ta.closest(".row").prevAll(".rank-card:first").attr('name')
                    let last_rows = $(`.add-border-last[data-logid=${log_card_name}]`).find("textarea")
                    last_rows.closest(".row").before(template)
                    let newrow = last_rows.closest('.row').prev(".row")
                    newrow.hide()
                    let newrow_curr = m_comment_ta.closest('.row').prev(".row")
                    newrow_curr.show()
                    newrow.find('.new-comment:first').text('"' + data.message + '"')
                    newrow.find("textarea").text(data.message)
                    let commenting_member = $('#profile-name').html()
                    newrow.find('.new-comment-member:first').text(commenting_member + ":")
                    m_comment_ta.closest("form").removeAttr("id")
                    newrow.find("textarea").removeAttr('id')
                    let hidden_row = $("#hidden-row-template").find(".new-row")
                    let new_rows = $(".new-row").not(hidden_row)
                    new_rows.each(function(){
                        old_row = $(this).prev('.row').attr('class')
                        $(this).attr("class", old_row)
                    })               
                    m_comment_ta.val("")
                }else if (crud_info == 'comment-edit'){
                    m_comment_ta.closest(".x-info").find('.comment-log:first').text('"'+data.message+'"')
                    m_comment_ta.closest('.edit-comment-form').hide()
                    m_comment_ta.closest(".x-info").find('.comment-info:first').show()
                }
            $('#active-edit-form').removeAttr('id')
            $('#active-edit-hidden-info').removeAttr('id')
            $("#clicked-edit").removeAttr('id')
            $('#member-comment-form').removeAttr('id')
            click_const=0
            },
            error: function(){
                console.log("Failed")
            }
        })
    }

    // Delete a comment on a log.
    function deleteComment(comment_id, comment_type) {
        $.ajax({
            type:"POST",
            url: "/workouts/0/deleteCommentMember/",
            data: {
                comment_id:comment_id,
                comment_type:comment_type
            },
            dataType: 'json',
            success: function(data){
                if (data.del_false == "False") {
                    location.reload()
                }
            },
            error: function(){
                console.log("Failed Delete")
            }
        })
    };

    // Delete a log.
    function deleteLog(log_id) {
        $.ajax({
            type:"POST",
            url: "/workouts/0/deleteLog/",
            data: {
                log_id:log_id
            },
            dataType: 'json',
            success: function(data){
                if (data.del_false == "False") {
                    location.reload()
                }
            },
            error: function(){
                console.log("Failed Delete")
            }
        })
    };

    // Get the right type and format for date input field from date string.
    function getDate(log_date) {
        $.ajax({
            type:"POST",
            url: "/workouts/0/dateInput/",
            data: {
                log_date:log_date
            },
            dataType: 'json',
            success: function(data){
                $('#date').val(data.date_input )
                return data.date_input                    
            },
            error: function(){
                console.log("Failed Date Getting")
            }
        })
    };

    // Cancel comment edit.
    function cancelEdit() {
        $("#active-edit-form").hide()
        $("#active-edit-hidden-info").show()
        $('#active-edit-form').removeAttr('id')
        $('#active-edit-hidden-info').removeAttr('id')
        $('#clicked-edit').removeAttr('id')
        $('#member-comment-form').removeAttr('id')
        click_const = 0
    }

    // Reformat date as input for max attribute for date input field.
    function maxLogDate() {
        // https://stackoverflow.com/questions/32378590/set-date-input-fields-max-date-to-today
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth()+1;
        let yyyy = today.getFullYear();
        if(dd<10){
                dd='0'+dd
            } 
            if(mm<10){
                mm='0'+mm
            } 
        today = yyyy+'-'+mm+'-'+dd;
        $("#test-date").attr("max", today);
    }

    // Reformat date as input for hidden date field.
    function convertDate(input_date) {
        let day = input_date.split(" ")[0]
        let month = input_date.split(" ")[1]
        let year = input_date.split(" ")[2]
        let set_month = ''
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Nov", "Dec"]
        for( i = 0; i < 13; i++ ) {
            if (months[i]==month){
                set_month = String(i + 1)
                break;
            }
        }
        if (set_month < 10) {
            month = "0" + set_month
        }else{
            month = set_month
        }
        converted_date = year + "-" + month + "-" + day
        return converted_date
    }

    // Scroll to top of element
    function  scrollToTopRank(element){
        element.animate({
            scrollTop: 0}, 800)
    };

    // Scroll to top of element FAST.
    function  scrollToTopRankFast(element){
        element.animate({
            scrollTop: 0}, 0)
    };

    // Scroll to the rank of the user (and emphasise user log)
    function scrollMyRank(){
        try{
            let uid = $("#user-id-no").attr("data")
            let group = $(".log-ranking:visible").attr("class").split(" ")[1]
            let group_no = group.split("-")[2]
            // let memberid = "#member-id-" + uid + "-group-" + group_no
            let memberid = "#rank-user-" + uid + "-group-" + group_no
            $(memberid).children(".rank-counter").css({"color": "#ffc107", "text-shadow": "2px 2px 1px blue"})
            let scroll = $(".block-header").offset().top + 67
            $("#block-1").animate({
                scrollTop: ($(memberid).offset().top - scroll)
            }, 800)
            directionArrow()
        }catch{
        }              
    };

    // Resize number for ranking if they are multiple digits.
    function sizeLargeNumbers(number) {
        let no = parseInt(number.text())
        if ( no > 9 && no < 100) {
            number.addClass("size-ten")
        }else if (no > 99 && no < 1000 ){
            number.addClass("size-hundred")
        }else if (no > 999 && no < 10000){
            number.addClass("size-thousand")
        }else if (no > 9999 && no < 100000){
            number.addClass("size-tenK")
        }else if (no > 99999){
            number.addClass("size-hunK")
        }
    }

    // Find all rank numbers and apply resize function.
    function resizeRanks(){
        $(".rank-counter").children("span").each(function(){
        sizeLargeNumbers($(this))
        })
    }
    
    // Load next page of rank logs if previous ajax call is done.
    function goScrollDown(){
                if (scroll_constant == true){
                    scroll_constant = false
                    if (country_select == true){
                        country_count = $(".log-ranking").children(`.rank-card[data-country=${country_selected}]:visible`).length
                    }
                    lazyLoadLogsRank("down")
                }
            }
    
    // Load previous page of rank logs if previous ajax call is done.
    function goScrollUp(){
        if (scroll_constant == true){
            scroll_constant = false
            if (country_select == true){
                country_count = $(".log-ranking").children(`.rank-card[data-country=${country_selected}]:visible`).length
            }
            lazyLoadLogsRank("up")
        }
    }

    // Load next page of history logs if previous ajax call is done.
    function goScrollDownHis(){
        if (scroll_constant == true){
            scroll_constant = false
            if (country_select == true){
                country_count = $(".log-history").children(`.rank-card[data-country=${country_selected}]:visible`).length
            }
            lazyLoadLogs()
        }
    }

    // Load next page for history logs.
    function lazyLoadLogs() {
        $(".his-dir-down:visible").html('<i class="fas fa-circle-notch fa-spin"></i>')
        if ($("#his-everybody").css("text-decoration").split(" ")[0] == "underline" && $("#his-this-wod").css("text-decoration").split(" ")[0] == "underline"){
            pagedata = $("#his-everybody")
            call_group = "this_everybody"
        }else if ($("#his-me").css("text-decoration").split(" ")[0] == "underline" && $("#his-this-wod").css("text-decoration").split(" ")[0] == "underline"){
            pagedata = $("#his-me")
            call_group = "this_me"
        }else if ($("#his-everybody").css("text-decoration").split(" ")[0] == "underline" && $("#his-all-wod").css("text-decoration").split(" ")[0] == "underline") {
            pagedata = $("#his-all-wod")
            call_group = "all_everybody"
        }else{
            pagedata = $("#his-this-wod")
            call_group = "all_me"
        }
        var pageno = pagedata.data('page');
        if (pageno == "x"){
            scroll_constant = true
            return;
        }
        var wod = $("#wod-id-no").attr("data")
        $.ajax({
        type: 'POST',
        url: '/workouts/0/loopList/',
        data: {
            page: pageno,
            wod: wod,
            call_group: call_group,
        },
        dataType: "json",
        success: function(data) {
            if (data.no_page==true){
                scroll_constant = true
                $(".his-dir-down:visible").remove()
                return;
            }
            if (data.has_next) {
                pagedata.data('page', pageno+1);
            } else {
                pagedata.data('page', "x");
            }
            appendlist = $(".log-history:visible").attr("class").split(" ")[1]
            $('.log-history:visible').append(data.calling_group_html);
            $('.log-history:visible').append('<div class="row mx-0 my-1 align-items-center justify-content-center direction direction-down-his direction-his"><i class="fas fa-angle-double-down"></i></div>')
            if (pagedata.data('page')=="x"){
                $(".direction-down-his:visible").remove()
            }else{
                $(".his-dir-down:visible").remove()
                $(".direction-down-his").addClass('his-dir-down')
            }
            $('.extra-log-info').hide()
            dateStyling($(".his-date-new"))
            $(".his-date-new").addClass("his-date")
            $(".his-date-new").removeClass("his-date-new")
            $(".log-his-XX").addClass(appendlist+"X")
            $(".log-his-XX").removeClass("log-his-XX")
            if (country_select==true){
                let same_c_logs = $(`.rank-card[data-country=${country_selected}`)
                $(".rank-card").not(same_c_logs).hide()
                if (country_count == $(".log-history").children(`.rank-card[data-country=${country_selected}]:visible`).length){
                    scroll_constant = true
                    goScrollDownHis()
                }
            } 
            scroll_constant = true
        },
        error: function(xhr, status, error) {
            }
        });       
    };

    // Load requested page (next or previous) of rank logs.
    function lazyLoadLogsRank(direction) { 
        if ($("#rank-all-time").css("text-decoration").split(" ")[0] == "underline" && $("#rank-men").css("text-decoration").split(" ")[0] == "underline"){
            pagedata = $("#rank-all-time")
            call_group = "men_year"
        }else if ($("#rank-today").css("text-decoration").split(" ")[0] == "underline" && $("#rank-men").css("text-decoration").split(" ")[0] == "underline"){
            pagedata = $("#rank-today")
            call_group = "men_today"
        }else if ($("#rank-all-time").css("text-decoration").split(" ")[0] == "underline" && $("#rank-women").css("text-decoration").split(" ")[0] == "underline") {
            pagedata = $("#rank-men")
            call_group = "women_year"
        }else{
            pagedata = $("#rank-women")
            call_group = "women_today"
        }
        if (direction == "down"){
            $(".rank-dir-down:visible").html('<i class="fas fa-circle-notch fa-spin"></i>')
            var pageno = pagedata.data('page')
            if (pageno == "x"){
                scroll_constant = true
                $(".rank-dir-down:visible").remove()
                return;
            } 
            pageno = pageno + 1;
        }else{
            $(".rank-dir-up:visible").html('<i class="fas fa-circle-notch fa-spin"></i>')
            var pageno = pagedata.data('pageup') - 1;
            if (pageno==0){
                scroll_constant = true
                $(".rank-dir-up:visible").remove()
                return;
            }
        }
        var wod = $("#wod-id-no").attr("data")
        $.ajax({
        type: 'POST',
        url: '/workouts/0/loopListRank/',
        data: {
            page: pageno,
            wod: wod,
            call_group: call_group,
        },
        dataType: "json",
        success: function(data) {
            appendlist = $(".log-ranking:visible").attr("class").split(" ")[1]
            if (direction == "up"){
                pagedata.data('pageup', pageno);
                $('.log-ranking:visible').prepend(data.calling_group_html);
                $('.log-ranking:visible').prepend('<div class="row mx-0 my-1 align-items-center justify-content-center direction direction-up direction-rank"><i class="fas fa-angle-double-up"></i></div>')
                if (pageno == 1){
                    $(".direction-up").remove()
                }else{
                    $(".rank-dir-up:visible").remove()
                    $(".direction-up").addClass('rank-dir-up')
                }
                if (country_select==true){
                        if (country_count == $(".log-ranking").children(`.rank-card[data-country=${country_selected}]:visible`).length){
                            scroll_constant = true
                            goScrollUp()
                        }
                    }    
            }else{
                if (data.has_next) {
                    $('.log-ranking:visible').append(data.calling_group_html);
                    $('.log-ranking:visible').append('<div class="row mx-0 my-1 align-items-center justify-content-center direction direction-down direction-rank"><i class="fas fa-angle-double-down"></i></div>')
                    pagedata.data('page', pageno);
                    $(".rank-dir-down:visible").remove()
                    $(".direction-down").addClass('rank-dir-down')
                    if (country_select==true){
                        if (country_count == $(".log-ranking").children(`.rank-card[data-country=${country_selected}]:visible`).length){
                            scroll_constant = true
                            goScrollDown()
                        }
                    }                         
                }else{
                    $('.log-ranking:visible').append(data.calling_group_html);
                    $('.log-ranking:visible').append('<div class="row mx-0 my-1 align-items-center justify-content-center direction direction-down direction-rank"><i class="fas fa-angle-double-down"></i></div>')
                    pagedata.data('page', "x");
                    $(".rank-dir-down:visible").remove()
                    $(".direction-down").addClass('rank-dir-down')
                    if (country_select==true){
                        if (country_count == $(".log-ranking").children(`.rank-card[data-country=${country_selected}]:visible`).length){
                            scroll_constant = true
                            goScrollDown()
                        }
                    } 
                    $(".direction-down:visible").remove()
                }
            }
            $('.extra-log-info').hide()
            $(".log-rank-XX").addClass(appendlist+"X")
            $(".log-rank-XX").removeClass("log-rank-XX")
            if (country_select==true){
                let same_c_logs = $(`.rank-card[data-country=${country_selected}`)
            $(".rank-card").not(same_c_logs).hide()
            }
            ranker()
            scroll_constant = true
        },
        error: function(xhr, status, error) {
            }
        });
        
    };

    // Get rank data for logs and assign ranks to log cards.
    function ranker(){
        $(".rank-log").each(function(){
            let logid = $(this).attr("name").split("-")[2]
            let list = ''
            if ($(this).parent().hasClass("log-rank-1")){
                list = $("#rlistmenall").data('list')
            }else if ($(this).parent().hasClass("log-rank-2")){
                list = $("#rlistwomenall").data('list')
            }else if ($(this).parent().hasClass("log-rank-3")){
                list = $("#rlistmentoday").data('list')
            }else{
                list = $("#rlistwomentoday").data('list')
            }
            for (i = 0; i < list.length; i++){
                if (list[i][0] == logid){
                    $(this).children(".rank-counter").children("span").text(list[i][1])
                    break
                }
            }
        })
        resizeRanks()
    }

    // Determine if the up/down arrows for the log pagination need to be shown or hidden, and then do that.
    function directionArrow(){
        let pagedata = ''
            if ($("#rank-all-time").css("text-decoration").split(" ")[0] == "underline" && $("#rank-men").css("text-decoration").split(" ")[0] == "underline"){
                pagedata = $("#rank-all-time")
            }else if ($("#rank-today").css("text-decoration").split(" ")[0] == "underline" && $("#rank-men").css("text-decoration").split(" ")[0] == "underline"){
                pagedata = $("#rank-today")
            }else if ($("#rank-all-time").css("text-decoration").split(" ")[0] == "underline" && $("#rank-women").css("text-decoration").split(" ")[0] == "underline") {
                pagedata = $("#rank-men")
            }else{
                pagedata = $("#rank-women")
            }
        $(".direction-up").each(function(){
            if (pagedata.data('pageup') == 1) {
                $(this).hide()
            }else{
                $(this).show()
            }
        })
        if(pagedata.data('page')=="x"){
            $(".direction-down:visible").remove()
        }
        if ($(".log-ranking").children(".rank-card:visible").length < 1){
            $(".rank-dir-down").hide()
        }else{
            $(".rank-dir-down").show()
        }
        if ($(""))
        if ($(".log-history").children(".rank-card:visible").length < 1){
            $(".his-dir-down").hide()
        }else{
            $(".his-dir-down").show()
        }
    }

    // Set information for Workout edit form fields.
    function setWodEditForm(){
        name = $("#workout-name").text()
        $("#id_workout_name").val(name)
        type = $("#wod-type").text()
        $("#id_workout_type").val(type)
        category = $("#wod-cat").text()
        $("#id_workout_category").val(category)
        description = $(".workout-description").text()
        $("#id_description").val(description)
    }

    // Reformat time value for displaying slider result.
    function sliderValueTime(val) {
        var hours = Math.floor(val/3600)
        var minutes = Math.floor((val - (3600 * hours)) / 60);
        var seconds = val - (hours * 3600 + minutes * 60);
        if (hours.length == 1) hours = '0' + hours;
        hours = hours + ":"
        if (hours == "00:" || hours == "0:") hours = '';
        if (minutes <= 9) minutes = '0' + minutes;
        if (minutes == 0) minutes = '00';
        minutes = minutes + ":"
        if (seconds <= 9) {
            seconds = '0' + seconds;
        }
        if (seconds == 0) seconds = '00';
        $('#rangeLevelSliderVal').html(hours + minutes + seconds);
        $('.tooltip-main').children('tooltip-inner').html(hours + minutes + seconds);
    }

    // Get the level for the result that's been slided to.
    function getWodLevel() {
        $("#rangeLevelSliderLevelVal").html('<i class="fas fa-circle-notch fa-spin"></i>')
        let slider_level = $("#rangeLevel").attr('value')
        let wod=$("#wod-id-no").attr('data')
        $.ajax({
            type:"POST",
            url: "/workouts/0/getSliderLevel/",
            data: {
                prep_result: slider_level,
                wod: wod
            },
            dataType: 'json',
            success: function(data){
                $("#rangeLevelSliderLevelVal").html(data.percentile)
            },
            error: function(){
                $("#rangeLevelSliderLevelVal").html("Failed to get level.")
                console.log("ajax FAIL")          
            }
        })
    }

    // Style the date display on the activity log cards.
    function dateStyling(element){
        $(element).each(function() {
            let date = $(this).text()
            let month = ''
            let day = ''
            try {
                month = date.split(".")[0]
                day = date.split(". ")[1].split(",")[0]
                let year = date.split(", ")[1].slice(-2)
            }catch{
                month = date.split(" ")[0]
                if (month != "May"){
                    month = month.slice(0, -1)
                }
                if (month == "Apri" || month == "Marc") {
                    month = month.slice(0, -1)
                }
                day = date.split(" ")[1].split(",")[0]
                let year = date.split(", ")[1].slice(-2)
            }
            $(this).html(`<div class='display-month'>${month}</div><div class='display-day'>${day}</div>`)
        })
    }

    // Function to edit a Log object
    function submitEditLog(){
        let result = $(".score-result:visible").val()
        let rx = $("#id_rx").prop('checked')
        let date = $("#date").val()
        let comment = $("#id_user_comment").val()
        let log_id = $("#log-to-edit-id").text()
        $.ajax({
            type:"POST",
            url: "/workouts/0/editLog/",
            data: {
                log_id:log_id,
                result:result,
                rx:rx,
                date:date,
                comment:comment
            },
            dataType: 'json',
            success: function(data){
                location.reload()              
            },
            error: function(){
                console.log("Failed Log Edit")
            }
        })
    }

    // EVENT HANDLERS

    // Click button to show/hide log form.
    $('#toggle-log-button').click(function() {
        if ($("#logform-edit-button").is(":visible")){
            $("#logform-edit-button").hide()
            $("#logform-submit-button").show()
        }
        $('#logform-div').toggle()
        $('#log-ranking-div').toggle()
        if ($('#logform-div').is(":visible")){
            $("#toggle-log-button").text("Ranking")
        }else{
            $("#toggle-log-button").text("Log")
        }
        pagec = $(".page-content").offset().top
        scroll = $("#block-1").offset().top
        $('html, body').animate({
                    scrollTop: ($("#block-1").offset().top - pagec -70)
                }, 800)            
        $('#id_ft_result').val("")
        $('#id_amrap_result').val("")
        $('#id_mw_result').val("")
        initial_date = $('#date').attr('data-initial')
        $("#date").val(initial_date)
        $('#id_rx').prop('checked', true)
        $('#id_user_comment').text("")
    });

    // Edit Log on return key (NOT submit new log)
    $(document).keypress(function(e) {
        if(e.which === 13 && $("#logform-edit-button").is(":visible") == true){
            e.preventDefault()
            $("#logform-edit-button").prop("disabled",true)
            submitEditLog()             
        }
    })

    // Click to cancel logging and show ranking module.
    $('#cancel-log').click(function() {
            $('#logform-div').css('display', 'none')
            $('#log-ranking-div').css('display', 'block')
            $("#toggle-log-button").text("Log")
        });

    // Click to show chosen filtering of activity logs.
    $(".his-people, .his-wods").click(function() {
        scroll_level = 1
        $(".rank-card").show()
        country_select = false
    })

    // Click to show chosen gender filtering of rank logs.
    $(".period, .gender").click(function() {
        scroll_level_rank = 1
        $(".rank-card").show()
        country_select = false
    })

    // Click to show activity of all members for selected wods or all wods.
    $('#his-everybody').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            let element =$("#block-3")
            scrollToTopRankFast(element)
        }
        $('.his-people').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#his-everybody').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (wodhistory == "thiswod") {
            $('.log-history').hide()
            $('.log-his-2').show()
        } else {
            $('.log-history').hide()
            $('.log-his-1').show()
        }
        people = 'everybody'
        if ($(".log-history").find(".rank-card:visible").length == 0){
            $(".his-dir-down").hide()
        }else{
            $(".his-dir-down").show()
        }               
    })

    // Click to show activity of user only for selected wods or all wods.
    $('#his-me').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            let element =$("#block-3")
            scrollToTopRankFast(element)
        }
        $('.his-people').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#his-me').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (wodhistory == "thiswod") {
            $('.log-history').hide()
            $('.log-his-4').show()
        } else {
            $('.log-history').hide()
            $('.log-his-3').show()
        }
        people = 'me'
        if ($(".log-history").find(".rank-card:visible").length == 0){
            $(".his-dir-down").hide()
        }else{
            $(".his-dir-down").show()
        }  
    })

    // Click to show activity for selected wod for all or just user.
    $('#his-all-wod').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            element =$("#block-3")
            scrollToTopRankFast(element)
        }
        $('.his-wods').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#his-all-wod').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (people == "everybody") {
            $('.log-history').hide()
            $('.log-his-1').show()
        } else {
            $('.log-history').hide()
            $('.log-his-3').show()
        }
        wodhistory = 'allwods'
        if ($(".log-history").find(".rank-card:visible").length == 0){
            $(".his-dir-down").hide()
        }else{
            $(".his-dir-down").show()
        }  
    })

    // Click to show activity for all wods for all or just user.
    $('#his-this-wod').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            let element =$("#block-3")
            scrollToTopRankFast(element)
        }
        $('.his-wods').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#his-this-wod').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (people == "everybody") {
            $('.log-history').hide()
            $('.log-his-2').show()
        } else {
            $('.log-history').hide()
            $('.log-his-4').show()
        }
        wodhistory = 'thiswod'
        if ($(".log-history").find(".rank-card:visible").length == 0){
            $(".his-dir-down").hide()
        }else{
            $(".his-dir-down").show()
        }  
    })

    // On page load start selection for activity of Everybody for selected wod.
    $("#his-everybody").trigger("click")
    $("#his-this-wod").trigger("click")

    // Click to show rank for the past year for specified gender.
    $('#rank-all-time').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            element =$("#block-1")
            scrollToTopRankFast(element)
        }
        $('.period').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#rank-all-time').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (gender == "F") {
            $('.log-ranking').hide()
            $('.log-rank-2').show()
        } else {
            $('.log-ranking').hide()
            $('.log-rank-1').show()
        }
        period = 'alltime'
        scrollMyRank()
        ranker() 
        directionArrow()   
                
    })

    // Click to show rank for today for specified gender.
    $('#rank-today').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            element =$("#block-1")
            scrollToTopRankFast(element)
        }
        $('.period').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#rank-today').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (gender == "F") {
            $('.log-ranking').hide()
            $('.log-rank-4').show()
        } else {
            $('.log-ranking').hide()
            $('.log-rank-3').show()
        }
        period = 'today'
        scrollMyRank()
        ranker()    
        directionArrow()
    })

    // Click to show rank for men for specified period.
    $('#rank-men').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            element =$("#block-1")
            scrollToTopRankFast(element)
        }
        $('.gender').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#rank-men').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (period == "today") {
            $('.log-ranking').hide()
            $('.log-rank-3').show()
        } else {
            $('.log-ranking').hide()
            $('.log-rank-1').show()
        }
        gender = 'M'
        scrollMyRank()
        ranker()
        directionArrow()
    })

    // Click to show rank for women for specified period.
    $('#rank-women').click(function(){
        if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
            element =$("#block-1")
            scrollToTopRankFast(element)
        }
        $('.gender').css({'font-weight': '400', 'text-decoration': 'none'})
        $('#rank-women').css({'font-weight': '700', 'text-decoration': 'underline'})
        if (period == "today") {
            $('.log-ranking').hide()
            $('.log-rank-4').show()
        } else {
            $('.log-ranking').hide()
            $('.log-rank-2').show()
        }
        gender = 'F'
        scrollMyRank()
        ranker()
        directionArrow()  
    })

    // Show/Hide extra info for selected log.
    $(document).on("click", ".card-col", function(){
        if ($(this).parent().hasClass('rank-card') == true){
            let main_card = "#" + $(this).parent().attr('id')
            let log_name = $(this).parents().attr('name')
            let log_name_class = "." + log_name
            let group_class_name = $(this).closest(".log-ranking, .log-history").attr('class')
            let group_id = log_name_class + "." + group_class_name.split(" ")[1] + "X"
            let extra_info_cards = $(group_id);
            extra_info_cards.slideToggle(100)
            $('.extra-log-info').not(group_id).slideUp()
        $('.rank-card').not(main_card).removeClass('remove-borders-main')
            if ($(this).parent().hasClass('remove-borders-main')) {
                $(this).parent().removeClass('remove-borders-main');
                $(main_card).prev('.m-log-id').removeAttr('id');
                $(this).parent().css("border-bottom", "1px solid grey")
                $(this).parent().css("box-shadow", "0px 0px 3px black")
            }else{
                $(this).parent().addClass('remove-borders-main');
                $(main_card).prev('.m-log-id').attr('id', 'm-log-id');
            }
        }
    })

    // Set ID for active comment section for later DOM manipulation.
    $('.member-comment').focus(function() {
        $('#member-comment-form').removeAttr('id')
        $(this).parent().attr("id", "member-comment-form")
    })

    // Hold down shift to enable return key = next line, instead of = submit.
    $(document).on('keydown', '.member-comment', function (e) {
        if(e.which === 16){
            shift = true
        }
    });
    $(document).on('keyup', '.member-comment', function (e) {
        if(e.which === 16){
            shift = false
        }
    });
    $(document).on('keypress', '.member-comment', function (e) {
        let m_comment_ta = $(this)
        let m_comment = m_comment_ta.val()
        if(e.which === 13 && shift == false){
            $(this).attr("disabled", "disabled");
            submitComment(m_comment, m_comment_ta)
            $(this).removeAttr("disabled");                   
        }
    });

    // Click to submit a comment.
    $('.member-comment-button').click(function(e) {
        e.preventDefault()
        let m_comment_ta =  $(this).siblings('textarea')
        let m_comment = m_comment_ta.val()
        submitComment(m_comment, m_comment_ta)
    })

    // Click to delete a comment.
    $(document).on("click", ".delete-comment", function(){
        let comment_type = $(this).closest('.col-2').siblings('.card-col').find('textarea:first').attr('class')            
        let comment_id = $(this).closest('.col-2').siblings('.card-col').find('.comment-id:first').text()
        let comment_id_data = $(this).closest(".col-2").siblings(".card-col").find(".comment-id:first").attr("data-comment-id")
        let same_comments = $(`.comment-id[data-comment-id=${comment_id_data}]`).closest(".extra-log-info")
        deleteComment(comment_id, comment_type)
        same_comments.remove()
    })

    // Click to delete log.
    $(document).on("click", ".delete-log", function(){
        let log_id = $(this).closest('.rank-card').prev('.m-log-id').attr('data')
        deleteLog(log_id)
        location.reload()
    })
    
    // Click to edit a Log object.
    $("#logform-edit-button").click(function(e){
        e.preventDefault()
        $("#logform-edit-button").prop("disabled",true)
        submitEditLog()
    })

    // Click to show edit log form and populate the fields with the relevant data.
    $(document).on("click", ".edit-log", function(){
        let log_id = $(this).closest('.rank-card').prev('.m-log-id').attr('data')
        $("#log-to-edit-id").html(log_id)
        let info = $(this).closest('.rank-card').children('.card-col')
        let result = info.find('.r-log:first, .h-log:first')
        let result_type = result.attr('class').split(" ")[0]
        let result_log= result.text()
        let extra_info = $(this).closest('.rank-card').next('.extra-log-info')
        let log_date = extra_info.find('.log-date:first').html()
        getDate(log_date)
        let rx_log = extra_info.find('.log-rx:first').text()
        let comment_log = extra_info.next('.extra-log-info').find('.comment-log:first').text().slice(1,-1)
        if (result_type == 'ft-log'){
            $('#id_ft_result').val(result_log)
        } else if (result_type == 'amrap-log') {
            $('#id_amrap_result').val(result_log)
        } else {
            $('#id_mw_result').val(result_log)
        }
        if (rx_log == "Scaled") {
            $('#id_rx').prop('checked', false)
        }
        $('#id_user_comment').text(comment_log)
        $("#logform-submit-button").hide()
        $("#logform-edit-button").show().removeAttr('hidden')
        $('#logform-div').toggle()
        $('#log-ranking-div').toggle()
    })

    // Click to cancel logging and show ranking module.
    $("#cancel-log").click(function(e) {
        e.preventDefault()
        $('#id_ft_result').val("")
        $('#id_amrap_result').val("")
        $('#id_mw_result').val("")
        $('#date').val("")
        $('#id_rx').prop('checked', true)
        $('#id_user_comment').text("")
        $("#logform-edit-button").hide()
        $("#logform-submit-button").show()
    })

    // Click to enable comment editing.
    $(document).on("click", ".edit-comment", function(){
        let clicked_comment = $(this)
        let m_comment_ta = $(this).closest('.col-2').siblings('.card-col').find('textarea:first')
        let m_comment = m_comment_ta.val()
        //    Check if the form is currently visible/open        
        if ($(this).attr('id') == 'clicked-edit') {         
            submitComment(m_comment, m_comment_ta)
            clicked_comment.removeAttr('id')
        } else if ($(this).attr('id') != 'clicked-edit') {
            cancelEdit()
            m_comment_ta.focus()
            clicked_comment.closest('.col-2').siblings('.card-col').find('.edit-comment-form').removeAttr('hidden').show()
            clicked_comment.closest('.col-2').siblings('.card-col').find('.comment-info').hide()
            clicked_comment.closest('.col-2').siblings('.card-col').find('.edit-comment-form').attr('id', 'active-edit-form')
            clicked_comment.closest('.col-2').siblings('.card-col').find('.comment-info').attr('id', 'active-edit-hidden-info')
            clicked_comment.attr('id', 'clicked-edit')
        }
    })

    // Click anywhere to cancel comment edit.
    $(document).click(function() {               
        if (click_const != 0) {
            cancelEdit()
        }
        if ($("#active-edit-form").is(":visible")) {
            click_const = 1
        }
    });

    // Stop immediate "cancellation" upon clicking edit form first time.
    $(document).on("click", ".edit-comment-form", function(e) {
        e.stopPropagation(); 
    });

    // Stop immediate "cancellation" upon clicking edit form first time.
    $(document).on("click", "#clicked-edit", function(e) {
        e.stopPropagation(); 
    });

    // On datefield input change, change hidden datefield with reformatted input.
    $("#date").change(function(){
        let log_date = $("#date").val()
        let c_date = convertDate(log_date)
        $("#test-date").val(c_date)
    })

    // Adjust CSS to show border when content scrolls beneath header.
    $("#block-1, #block-3").scroll(function(){
        if ($(this).scrollTop() > 4){
            $(this).find(".block-header").css('border-bottom', 'dotted 3px grey')
        }else{
            $(this).find(".block-header").css('border-bottom', '')
        }
    });

    // Click to toggle between scroll to top and scroll to rank.
    $(".block-title").click(function() {
        element = $(this).closest(".fillblock")
        scrollToTopRank(element)
    });

    // Emphasize log card on hover.
    $(".card-col").mouseenter(function(){
        if ($(this).closest(".rank-card").next(".extra-log-info").is(":visible")){
            $(this).closest(".rank-card").css("border-color", "blue")
            $(this).closest(".rank-card").css("border-bottom", "none")
            $(this).closest(".rank-card").nextUntil(".add-border-last").css("border-color", "blue")
            $(this).closest(".rank-card").nextUntil(".add-border-last").css("border-top", "none")
            $(this).closest(".rank-card").nextUntil(".add-border-last").css("border-bottom", "none")
            $(this).closest(".rank-card").nextAll(".add-border-last:first").css("border-color", "blue")
            $(this).closest(".rank-card").nextAll(".add-border-last:first").css("border-top", "none")
        }else{
            $(this).closest(".rank-card").css("border-color", "blue");
        }
    })

    // De-emphasize log card on hover.
    $(".card-col").mouseleave(function(){
        $(this).closest(".rank-card").css("border-color", "");
        $(this).closest(".rank-card").nextUntil(".add-border-last").css("border-color", "")
        $(this).closest(".rank-card").nextAll(".add-border-last:first").css("border-color", "")
    })

    // To correct for mobile devices without a cursor.
    $(".card-col").mouseup(function(){
        $(this).closest(".rank-card").css("border-color", "");
        $(this).closest(".rank-card").nextUntil(".add-border-last").css("border-color", "")
        $(this).closest(".rank-card").nextAll(".add-border-last:first").css("border-color", "")
    })

    // Click to quickly filter for country in visible ranks.
    $(document).on("click", "i.fflag", function(){
        if (country_select == false){
            let country = $(this).attr("aria-label")
            country_selected = country
            let same_c_logs = $(`.rank-card[data-country=${country}]`)
            $(".rank-card").not(same_c_logs).hide()
            country_select = true
        }else{
            $(".rank-card").show()
            country_select = false
            country_selected = ""
        }
    })

    // On scroll down of History module request next page.
    $("#block-3").scroll(function(){
        if ($(this).scrollTop() > (scroll_level * 1500) && scroll_constant == true){
            goScrollDownHis()
            scroll_level += 1
        }
    });

    // On scroll down of Rank module request next page.
    $("#block-1").scroll(function(){
        if ($(this).scrollTop() > (scroll_level_rank * 1000) && scroll_constant == true){
            goScrollDown()
            scroll_level_rank += 1
        }
    })

    // Click to get next rank log page
    $(document).on("click", ".rank-dir-down", function () {
        goScrollDown()
    })

    // Click to get next history log page
    $(document).on("click", ".his-dir-down", function () {
        goScrollDownHis()
    })

    // Click to get previous rank log page
    $(document).on("click", ".direction-up", function () {
        goScrollUp()
    })

    // Click to toggle between activity module and explore workouts module.
    $("#toggle-workouts-button").click(function(){
        if ($("#log-history-div").is(":visible")){
            $("#log-history-div").hide()
            $("#categories-div").show()
            $("#toggle-workouts-button").text("Activity")
        }else{
            $("#log-history-div").show()
            $("#categories-div").hide()
            $("#toggle-workouts-button").text("Workouts")
        }
        pagec = $(".page-content").offset().top
        scroll = $("#block-3").offset().top
        $('html, body').animate({
            scrollTop: ($("#block-3").offset().top - pagec -70)
        }, 800)              
    })

        // Click to toggle workout list for category.
    $(".cat").click(function(){
        if ($(this).next(".cat-wods").is(":visible")){
            $(this).next(".cat-wods").hide()
        }else{
            $(this).next(".cat-wods").show()
        }
    })

    // Prevent submission on return key for workout search.
    $(".search-wod").keypress(function(e){
        if (e.which===13){
            e.preventDefault()
        }            
    })

    // Show wods that match partial input on input change.
    $(".search-wod").on("input", function(e){
        if ($(".search-wod").val()!=""){
            $(".search-cat").show()
            $(".cat-div").hide()
            sctext = $(".search-wod").val().toLowerCase()
            $(".search-cat-item").each(function(){
                thistext = $(this).text().toLowerCase()
                incl = thistext.includes(sctext)
                if (incl == true){
                    $(this).show()
                }else{
                    $(this).hide()
                }
            })
        }else{
            $(".cat-div").show()
            $(".search-cat").hide()
        }
    })

    // Click to show form for creating workout (only available for super user)
    $("#toggle-create-wod-button").click(function(){
        $(".main-wod-div").hide()
        $(".superuser-buttons").hide()
        $(".workout-form-div").show()
        $("#edit-wod-submit").hide()
        $("#create-wod-submit").show()
    })

    // Click to show form for editing workout (only available for super user)
    $("#toggle-edit-wod-button").click(function(){
        $(".main-wod-div").hide()
        $(".superuser-buttons").hide()
        $(".workout-form-div").show()
        $("#create-wod-submit").hide()
        $("#edit-wod-submit").show()
        setWodEditForm()
    })

    // Click to hide form for creating/editing workout (only available for super user)
    $("#cancel-wod-submit").click(function(){
        $(".main-wod-div").show()
        $(".superuser-buttons").show()
        $(".workout-form-div").hide()
        $("#create-wod-submit").show()
    })

    // Click to edit Workout object (only available for superuser.)
    $("#edit-wod-submit").click(function(e){
        e.preventDefault()
        workout_name=$("#id_workout_name").val()
        workout_type=$("#id_workout_type").val()
        workout_category=$("#id_workout_category").val()
        description = $("#id_description").val()
        wod_id=$("#wod-id-no").attr('data')     
        $.ajax({
            type:"POST",
            url: "/workouts/0/editWorkout/",
            data: {
                workout_name:workout_name,
                workout_type:workout_type,
                workout_category:workout_category,
                description:description,
                wod_id:wod_id
            },
            dataType: 'json',
            success: function(data){
                location.reload()              
            },
            error: function(){
                console.log("Failed Log Edit")
            }
        })
    })

    // Click to delete workout (only available for superuser).
    $("#toggle-delete-wod-button").click(function(e){
        e.preventDefault()
        wod_id=$("#wod-id-no").attr('data')     
        $.ajax({
            type:"POST",
            url: "/workouts/0/deleteWorkout/",
            data: {
                wod_id:wod_id
            },
            dataType: 'json',
            success: function(data){
                window.location.replace("/workouts/0")
            },
            error: function(){
                console.log("Failed Delete")
            }
        })
    })

    // Click to set workout as WOD (only available for superuser).
    $("#set-wod-button").click(function(e){
        e.preventDefault()
        wod_id=$("#wod-id-no").attr('data')     
        $.ajax({
            type:"POST",
            url: "/workouts/0/setWod/",
            data: {
                wod_id:wod_id
            },
            dataType: 'json',
            success: function(data){
                location.reload()              
            },
            error: function(){
                console.log("Failed Wodset")
            }
        })
    })

        // On log submit disable log button to prevent accidental multiple logs before page reload.
    $("#log-workout-form").submit(function(){
        $("#logform-submit-button").prop("disabled", true)
        return true;
    })

    // On slider chagne, reset Slider result display to new value, reformatted if it's a time value.
    // Necessary for click on slider. Ensure enabling for touch screen.
    $("#rangeLevel").on("change", function(){
        val= $(".min-slider-handle:first").attr('aria-valuenow')
            if (parseFloat($("#rangeLevelData").data('worst')) > parseFloat($("#rangeLevelData").data('best'))){
            sliderValueTime(val)
            }else{
            $('#rangeLevelSliderVal').html(val)
            }
    })

    // On slider chagne, reset Slider result display to new value, reformatted if it's a time value.
    // Necessary for drag on slider. Ensure enabling for touch screen.
    $("#rangeLevel").on("slide", function(ui) {
        val = ui.value
            if (parseFloat($("#rangeLevelData").data('worst')) > parseFloat($("#rangeLevelData").data('best'))){
            sliderValueTime(val)
            }else{
            $('#rangeLevelSliderVal').html(val)
            }
    });

    // Enable slider for touchscreens.
    $(".slider-row").on("touchstart", function(){
        $(document).on("touchend", function(){
            getWodLevel()
            $(document).off("touchend");
        })
    })

    // Ensure proper slider functionality if not properly clicked on slider handle.
    $(".slider-row").mousedown(function(){
        $(document).mouseup(function(){
            getWodLevel()
            $(document).off("mouseup");
        })
    })

    // EXECUTE ON DOCUMENT READY
    
    maxLogDate()
    scrollMyRank()
    dateStyling($(".his-date"))
    resizeRanks()
    ranker()
    directionArrow()
    getWodLevel()

});
// DOCUMENT END