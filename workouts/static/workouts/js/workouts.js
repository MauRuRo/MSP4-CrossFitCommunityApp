$(document).ready(function() {
        // add classes to log history groups.
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
        
        $(".rank-card").each(function(){
            let group_no = $(this).parent(".log-ranking").attr("class").slice(-1)
            let currid= $(this).attr("id")
            let newid= currid + "-group-" + group_no
            $(this).attr("id", newid)
        })

        $('#log-workout-button').click(function() {
            if ($("#logform-edit-button").is(":visible")){
                $("#logform-edit-button").hide()
                $("#logform-submit-button").show()
            }
            $('#logform-div').toggle()
            $('#log-ranking-div').toggle()
            let tp = $('#block-1').offset().top
            setTimeout(function() {window.scrollTo(0, tp-150);},1)
            $('#id_ft_result').val("")
            $('#id_amrap_result').val("")
            $('#id_mw_result').val("")
            initial_date = $('#date').attr('data-initial')
            $("#date").val(initial_date)
            $('#id_rx').prop('checked', true)
            $('#id_user_comment').text("")
        });

        $('#cancel-log').click(function() {
            $('#logform-div').css('display', 'none')
            $('#log-ranking-div').css('display', 'block')
        });

        // set visibility on page elements
        $('.log-ranking').hide()
        let gender = $('#gender').text()
        if (gender == "F"){
            $('.log-rank-4').show()
            $('#rank-women').css({'font-weight': '700', 'text-decoration': 'underline'})
        }else{
            $('#rank-men').css({'font-weight': '700', 'text-decoration': 'underline'})
            $('.log-rank-3').show()
        }
        $('#rank-today').css({'font-weight': '700', 'text-decoration': 'underline'})
        let period = 'today'
        
        // rank-logs navigator:
        $('#rank-all-time').click(function(){
            if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
                scrollToTopRankFast()
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
                 
        })
        $('#rank-today').click(function(){
            if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
                scrollToTopRankFast()
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
        })
        $('#rank-men').click(function(){
            if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
                scrollToTopRankFast()
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
        })
        $('#rank-women').click(function(){
            if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
                scrollToTopRankFast()
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
        })
        // log-history navigator:
        $('.log-history').hide()
        $('.log-his-2').show()
        $('#all-all').click(function(){
            $('.log-history').hide()
            $('.log-his-1').show()
        })
        $('#all-wod').click(function(){
            $('.log-history').hide()
            $('.log-his-2').show()
        })
        $('#user-all').click(function(){
            $('.log-history').hide()
            $('.log-his-3').show()
        })
        $('#user-wod').click(function(){
            $('.log-history').hide()
            $('.log-his-4').show()
        })
        $('.r-log').each(function(){
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
            }
        })
        $('.extra-log-info').each(function(){
            let group_class_name = $(this).parent().attr('class')
            let group_id = group_class_name.split(" ")[1]
            $(this).addClass(group_id + "X")
        })
        $('.extra-log-info').hide()
        $('.rank-card').children('.card-col').click(function(){
            let main_card = "#" + $(this).parent().attr('id')
            let log_name = $(this).parents().attr('name')
            let log_name_class = "." + log_name
            let group_class_name = $(this).parent().parent().attr('class')
            let group_id = log_name_class + "." + group_class_name.split(" ")[1] + "X"
            let extra_info_cards = $(group_id);
            // let last_info_card = extra_info_cards.last()
            // last_info_card.addClass('add-border-last')
            extra_info_cards.slideToggle(100)
            $('.extra-log-info').not(group_id).slideUp()
           $('.rank-card').not(main_card).removeClass('remove-borders-main')
            if ($(this).parent().hasClass('remove-borders-main')) {
                $(this).parent().removeClass('remove-borders-main');
                $(main_card).prev('.m-log-id').removeAttr('id');
            }else{
                $(this).parent().addClass('remove-borders-main');
                $(main_card).prev('.m-log-id').attr('id', 'm-log-id');
            }
        })

        
        $('.member-comment').focus(function() {
            $('#member-comment-form').removeAttr('id')
            $(this).parent().attr("id", "member-comment-form")
        })

        function focusFields() {
            if ($('.member-comment').focus()) { 
                    let shift = false
                    $('.member-comment').on('keydown', function (e) {
                        if(e.which === 16){
                            shift = true
                        }
                    });
                    $('.member-comment').on('keyup', function (e) {
                        if(e.which === 16){
                            shift = false
                        }
                    });
                    $('.member-comment').on('keypress', function (e) {
                        let m_comment_ta = $(this)
                        let m_comment = m_comment_ta.val()
                        if(e.which === 13 && shift == false){
                            //Disable textbox to prevent multiple submit
                            $(this).attr("disabled", "disabled");
                            //Do Stuff, submit, etc..
                            submitComment(m_comment, m_comment_ta)
                            //Enable the textbox again if needed.
                            $(this).removeAttr("disabled");                   
                        }
                    });
                }
        };
        focusFields()

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
                    //Disable textbox to prevent multiple submit
                    $(this).attr("disabled", "disabled");
                    //Do Stuff, submit, etc..
                    submitComment(m_comment, m_comment_ta)
                    //Enable the textbox again if needed.
                    $(this).removeAttr("disabled");
                   
                }
            });
        }

        $('.member-comment-button').click(function(e) {
            e.preventDefault()
            let m_comment_ta =  $(this).siblings('textarea')
            let m_comment = m_comment_ta.val()
            submitComment(m_comment, m_comment_ta)
        })

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
                        let nci = $('#comment-id').parent('form:visible').children('#comment-id')
                        nci.removeAttr('id')
                        let template = $('#hidden-row-template').html()
                        $('#member-comment-form').closest('.row').before(template)
                        let newrow = $('#member-comment-form').closest('.row').prev(".row")
                        newrow.find('.new-comment').text('"' + data.message + '"')
                        $('#member-comment-ta').text(data.message)
                        let commenting_member = $('#profile-name').html()
                        newrow.find('.new-comment-member').text(commenting_member + ":")
                        // $('#new-comment-member').not(':hidden').removeAttr('id')
                        // $('#new-comment').not(':hidden').removeAttr('id')
                        $('#member-comment-form').removeAttr('id')
                        $('#member-comment-ta').removeAttr('id')
                        let new_row = $('.new-row:visible')
                        let old_row = $('.new-row:visible').prev('.row').attr('class')
                        new_row.attr('class', old_row)                    
                        m_comment_ta.val("")
                    }else if (crud_info == 'comment-edit'){
                        m_comment_ta.closest(".x-info").find('.comment-log').text('"'+data.message+'"')
                        m_comment_ta.closest('.edit-comment-form').hide()
                        m_comment_ta.closest(".x-info").find('.comment-info').show()
                    }
                $('#active-edit-form').removeAttr('id')
                $('#active-edit-hidden-info').removeAttr('id')
                $("#clicked-edit").removeAttr('id')
                $('#member-comment-form').removeAttr('id')
                focusFields()
                click_const=0
                    
                },
                error: function(){
                    console.log("Failed")
                }
            })
       }

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
       
       $(document).on("click", ".delete-comment", function(){
            // let comment_type = $(this).parent().siblings('.edit-comment-form').find('textarea').attr('class')
            // let comment_id = $(this).parent().siblings('.edit-comment-form').find('.comment-id').text()
            let comment_type = $(this).closest('.col-2').siblings('.card-col').find('textarea').attr('class')            
            let comment_id = $(this).closest('.col-2').siblings('.card-col').find('.comment-id').text()
            deleteComment(comment_id, comment_type)
            // $(this).closest('.extra-log-info').remove()
             $(this).closest('.extra-log-info').remove()

        })

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

        $(document).on("click", ".delete-log", function(){
            let log_id = $(this).closest('.rank-card').prev('.m-log-id').attr('data')
            deleteLog(log_id)
            location.reload()
        })
        
        $("#logform-edit-button").click(function(e){
            e.preventDefault()
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
        })

        $(document).on("click", ".edit-log", function(){
            let log_id = $(this).closest('.rank-card').prev('.m-log-id').attr('data')
            $("#log-to-edit-id").html(log_id)
            let info = $(this).closest('.rank-card').children('.card-col')
            let result = info.find('.r-log')
            let result_type = result.attr('class').split(" ")[0]
            let result_log= result.text()
            let extra_info = $(this).closest('.rank-card').next('.extra-log-info')
            let log_date = extra_info.find('.log-date').html()
            getDate(log_date)
            let rx_log = extra_info.find('.log-rx').text()
            let comment_log = extra_info.next('.extra-log-info').find('.comment-log').text().slice(1,-1)
            if (result_type == 'ft_log'){
                $('#id_ft_result').val(result_log)
            } else if (result_type == 'amrap_log') {
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
        $(document).on("click", ".edit-comment", function(){
           let clicked_comment = $(this)
           let m_comment_ta = $(this).closest('.col-2').siblings('.card-col').find('textarea')
           let m_comment = m_comment_ta.val()
            if ($(this).closest('.col-2').siblings('.card-col').find('.edit-comment-form').is(':visible')) {             
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
            
            let click_const = 0
            function cancelEdit() {
                $("#active-edit-form").hide()
                $("#active-edit-hidden-info").show()
                $('#active-edit-form').removeAttr('id')
                $('#active-edit-hidden-info').removeAttr('id')
                $('#clicked-edit').removeAttr('id')
                $('#member-comment-form').removeAttr('id')
                click_const = 0
            }
            $(document).click(function() {               
               if (click_const != 0) {
                   cancelEdit()
               }
               if ($("#active-edit-form").is(":visible")) {
                   click_const = 1
               }
            });
            $(document).on("click", ".edit-comment-form", function(e) {
                e.stopPropagation(); 
            });
            $(document).on("click", "#clicked-edit", function(e) {
                e.stopPropagation(); 
            });

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
            maxLogDate()

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

            $("#date").change(function(){
                let log_date = $("#date").val()
                let c_date = convertDate(log_date)
                $("#test-date").val(c_date)
            })
            
            // ALLOW FOR TIES IN RANKING
            $(".rank-counter").each(function(){
                let curr = $(this)
                let par = curr.closest(".log-ranking")
                let parrank = par.find(".rank-card:first").find(".rank-counter:first")
                let rankname = parrank.next().children(".rank-name").text()                
                if ( parrank.is(curr)){
                }else{    
                    let prevscore = $(this).closest(".rank-card").prevAll(".rank-card:first").find(".r-log")
                    let currscore = $(this).closest(".rank-card").find(".r-log")
                    let prevcount = $(this).closest(".rank-card").prevAll(".rank-card:first").find(".rank-counter")
                    let currcount = $(this)
                    if (prevscore.text() == currscore.text()){
                        let newtiecount = parseInt(prevcount.attr("data-counter")) + 1
                        currcount.attr("data-counter", newtiecount)
                        let prevrank = parseInt(prevcount.text())
                        let newrank = prevrank
                        currcount.children("span").text(newrank)
                    }else{
                        let addcount = parseInt(prevcount.attr("data-counter"))
                        let newrank = parseInt(prevcount.children("span").text()) + addcount + 1
                        currcount.children("span").text(newrank)
                        currcount.attr("data-counter", "0")
                    }
                }
            
                
            });
            function  scrollToTopRank(){
                $("#block-1").animate({
                    scrollTop: 0}, 800)
            };
            function  scrollToTopRankFast(){
                $("#block-1").animate({
                    scrollTop: 0}, 0)
            };
            function scrollMyRank(){
                try{
                    let uid = $("#user-id-no").attr("data")
                    let group = $(".log-ranking:visible").attr("class").split(" ")[1]
                    let group_no = group.split("-")[2]
                    let memberid = "#member-id-" + uid + "-group-" + group_no
                    $(memberid).children(".rank-counter").css({"color": "#ffc107", "text-shadow": "2px 2px 1px blue"})
                    let scroll = $(".block-header").offset().top + 67
                    $("#block-1").animate({
                        scrollTop: ($(memberid).offset().top - scroll)
                    }, 800)
                }catch{
                    console.log("No scrollable element found.")

                }              
            };

            $(".block-title").click(function() {
                scrollToTopRank()
            });
               scrollMyRank()
              
            $(".log-ranking").each(function(){
                if ($(this).children(".rank-card").length == 0){
                    $(this).append("<h4 class='no-logs'>NO LOGS AVAILABLE YET.</h4>")
                }
            }) 
            $("#block-1").scroll(function() {
                if ($("block-1").scrolTop > 4){
                    $("block-header").css("border-bottom", "solid 3px black")
                }else{
                    $("block-header").css("border-bottom", "")
                }
            });
            
});