$(document).ready(function() {

    var country_select = false
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
        
        $(".log-ranking").find(".rank-card").each(function(){
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
        let people = 'everybody'
        let wodhistory = 'thiswod'

        // history-logs navigator:
          $('#his-everybody').click(function(){
            if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
                element =$("#block-3")
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
        })
        $('#his-me').click(function(){
            if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
                element =$("#block-3")
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
        })
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
        })
        $('#his-this-wod').click(function(){
            if ($(this).css('text-decoration').split(" ")[0] != 'underline'){
                element =$("#block-3")
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
        })
        $("#his-everybody").trigger("click")
        $("#his-this-wod").trigger("click")

        // rank-logs navigator:
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
                 
        })
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
        })
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
        })
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
        })
        // // log-history navigator:
        // $('.log-history').hide()
        // $('.log-his-2').show()
        // $('#all-all').click(function(){
        //     $('.log-history').hide()
        //     $('.log-his-1').show()
        // })
        // $('#all-wod').click(function(){
        //     $('.log-history').hide()
        //     $('.log-his-2').show()
        // })
        // $('#user-all').click(function(){
        //     $('.log-history').hide()
        //     $('.log-his-3').show()
        // })
        // $('#user-wod').click(function(){
        //     $('.log-history').hide()
        //     $('.log-his-4').show()
        // })
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
            let group_class_name = $(this).closest(".log-ranking, .log-history").attr('class')
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
                $(this).parent().css("border-bottom", "1px solid grey")
                $(this).parent().css("box-shadow", "0px 0px 3px black")
            }else{
                $(this).parent().addClass('remove-borders-main');
                $(main_card).prev('.m-log-id').attr('id', 'm-log-id');
                // console.log("test")
                // $(this).parent().css("box-shadow", "")
            }
        })

        
        $('.member-comment').focus(function() {
            $('#member-comment-form').removeAttr('id')
            $(this).parent().attr("id", "member-comment-form")
        })


        let shift = false
        $(document).on('keydown', '.member-comment', function (e) {
            if(e.which === 16){
                shift = true
                console.log("SHIFT")
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
                //Disable textbox to prevent multiple submit
                $(this).attr("disabled", "disabled");
                //Do Stuff, submit, etc..
                submitComment(m_comment, m_comment_ta)
                //Enable the textbox again if needed.
                $(this).removeAttr("disabled");                   
            }
        });    

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
            // let m_log_id = m_comment_ta.closest(".row").prevAll('.m-log-id').attr('data')
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
            let comment_type = $(this).closest('.col-2').siblings('.card-col').find('textarea:first').attr('class')            
            let comment_id = $(this).closest('.col-2').siblings('.card-col').find('.comment-id:first').text()
            let comment_id_data = $(this).closest(".col-2").siblings(".card-col").find(".comment-id:first").attr("data-comment-id")
            let same_comments = $(`.comment-id[data-comment-id=${comment_id_data}]`).closest(".extra-log-info")
            console.log(comment_id_data)
            deleteComment(comment_id, comment_type)
            same_comments.remove()
            //  $(this).closest('.extra-log-info').remove()

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
            console.log(log_id)
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
            let result = info.find('.r-log:first, .h-log:first')
            let result_type = result.attr('class').split(" ")[0]
            console.log(result_type)
            let result_log= result.text()
            console.log(result_log)
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
           let m_comment_ta = $(this).closest('.col-2').siblings('.card-col').find('textarea:first')
           let m_comment = m_comment_ta.val()
            //    Check if the form is currently visible/open
            // if ($(this).closest('.col-2').siblings('.card-col').find('.edit-comment-form').is(':visible')) {         
            if ($(this).attr('id') == 'clicked-edit') {         
                submitComment(m_comment, m_comment_ta)
                clicked_comment.removeAttr('id')
            } else if ($(this).attr('id') != 'clicked-edit') {
                console.log("test")
                console.log(m_comment)
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
            function rankCounting(country) {
                console.log(country_select)
                console.log("check")
                if (country_select == false){
                    console.log("check2")
                    $(".log-ranking").find(".rank-counter").each(function(){
                    let curr = $(this)
                    let par = curr.closest(".log-ranking")
                    let parrank = par.find(".rank-card:first").find(".rank-counter:first")
                    // let rankname = parrank.next().children(".rank-name").text()                
                    if ( parrank.is(curr)){
                        parrank.children("span").text("1")
                        parrank.attr("data-counter", 0)
                    }else{    
                        let prevscore = $(this).closest(".rank-card").prevAll(".rank-card:first").find(".r-log:first")
                        let currscore = $(this).closest(".rank-card").find(".r-log:first")
                        let prevcount = $(this).closest(".rank-card").prevAll(".rank-card:first").find(".rank-counter:first")
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
                })
            } else {
                $(".log-ranking").find(".rank-counter").each(function(){
                    let curr = $(this)
                    let par = curr.closest(".log-ranking")
                    let parrank = par.find(`.rank-card[data-country=${country}]:first`).find(".rank-counter:first")
                    // let rankname = parrank.next().children(".rank-name").text()                
                    if ( parrank.is(curr)){
                        parrank.children("span").text("1")
                        parrank.attr("data-counter", 0)
                    }else{    
                        let prevscore = $(this).closest(`.rank-card[data-country=${country}]`).prevAll(`.rank-card[data-country=${country}]:first`).find(".r-log:first")
                        let currscore = $(this).closest(`.rank-card[data-country=${country}]`).find(".r-log:first")
                        let prevcount = $(this).closest(`.rank-card[data-country=${country}]`).prevAll(`.rank-card[data-country=${country}]:first`).find(".rank-counter:first")
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
                })
            }
        };
            rankCounting(null)
            // $(".log-ranking").find(".rank-counter").each(function(){
            //     let curr = $(this)
            //     let par = curr.closest(".log-ranking")
            //     let parrank = par.find(".rank-card:first").find(".rank-counter:first")
            //     let rankname = parrank.next().children(".rank-name").text()                
            //     if ( parrank.is(curr)){
            //     }else{    
            //         let prevscore = $(this).closest(".rank-card").prevAll(".rank-card:first").find(".r-log:first")
            //         let currscore = $(this).closest(".rank-card").find(".r-log:first")
            //         let prevcount = $(this).closest(".rank-card").prevAll(".rank-card:first").find(".rank-counter:first")
            //         let currcount = $(this)
            //         if (prevscore.text() == currscore.text()){
            //             let newtiecount = parseInt(prevcount.attr("data-counter")) + 1
            //             currcount.attr("data-counter", newtiecount)
            //             let prevrank = parseInt(prevcount.text())
            //             let newrank = prevrank
            //             currcount.children("span").text(newrank)
            //         }else{
            //             let addcount = parseInt(prevcount.attr("data-counter"))
            //             let newrank = parseInt(prevcount.children("span").text()) + addcount + 1
            //             currcount.children("span").text(newrank)
            //             currcount.attr("data-counter", "0")
            //         }
            //     }
            $("#block-1, #block-3").scroll(function(){
                if ($(this).scrollTop() > 4){
                    $(this).find(".block-header").css('border-bottom', 'dotted 3px grey')
                }else{
                    $(this).find(".block-header").css('border-bottom', '')
                }
            });

            function  scrollToTopRank(element){
                console.log("TEST")
                element.animate({
                    scrollTop: 0}, 800)
            };
            function  scrollToTopRankFast(element){
                element.animate({
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
                element = $(this).closest(".fillblock")
                scrollToTopRank(element)
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

            $(".his-date").each(function() {
                let date = $(this).text()
                let month = ''
                let day = ''
                try {
                    month = date.split(".")[0]
                    day = date.split(". ")[1].split(",")[0]
                    let year = date.split(", ")[1].slice(-2)
                }catch{
                    month = date.split(" ")[0].slice(0, -1)
                    day = date.split(" ")[1].split(",")[0]
                    let year = date.split(", ")[1].slice(-2)
                }
                $(this).html(`<div class='display-month'>${month}</div><div class='display-day'>${day}</div>`)
            })
            
            function sizeLargeNumbers(number) {
                no = parseInt(number.text())
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

            $(".rank-counter").children("span").each(function(){
                sizeLargeNumbers($(this))
            })

            $(".card-col").mouseenter(function(){
                console.log("BEST")
                if ($(this).closest(".rank-card").next(".extra-log-info").is(":visible")){
                    console.log("TEST")
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

            // SELECT BY COUNTRY
            var country_filter = ''
            $(document).on("click", "i.fflag", function(){
                if (country_select == false){
                    console.log("false")
                    let country = $(this).attr("aria-label")
                    let same_c_logs = $(`.rank-card[data-country=${country}`)
                    $(".rank-card").not(same_c_logs).hide()
                    country_select = true
                    rankCounting(country)
                }else{
                    $(".rank-card").show()
                    country_select = false
                    rankCounting("All")
                }
                
            })

            
});