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

        $('#log-workout-button').click(function() {
            $('#logform-div').toggle()
            $('#log-ranking-div').toggle()
            let tp = $('#block-1').offset().top
            setTimeout(function() {window.scrollTo(0, tp-150);},1)
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
            // console.log($('#rank-nav').children().css('font-weight'))
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
        })
        $('#rank-today').click(function(){
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
        })
        $('#rank-men').click(function(){
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
        })
        $('#rank-women').click(function(){
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
        let comment_field = ''
        $('.member-comment').focus(function() {
            comment_field = $(this)
            $('#member-comment-form').removeAttr('id')
            $(this).parent().attr("id", "member-comment-form")
        })

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
            console.log(is_main_comment)
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
                        $('#member-comment-form').parent().parent().parent().before(template)
                        $('#new-comment').text('"'+data.message+'"')
                        let commenting_member = $('#profile-name').html()
                        $('#new-comment-member').text(commenting_member + ":")
                        $('#new-comment-member').not(':hidden').removeAttr('id')
                        $('#new-comment').not(':hidden').removeAttr('id')
                        let new_row = $('.new-row:visible')
                        let old_row = $('.new-row:visible').prev('.row').attr('class')
                        new_row.attr('class', old_row)                    
                        m_comment_ta.val("")
                    }else if (crud_info == 'comment-edit'){
                        m_comment_ta.parent().parent().parent().children('.comment-info').children('em').text('"'+data.message+'"')
                        m_comment_ta.parent().parent('.edit-comment-form').hide()
                        m_comment_ta.parent().parent().parent().children('.comment-info').show()
                    }
                    
                    
                },
                error: function(){
                    console.log("Failed")
                }
            })
       }

       $('.edit-comment').click(function(){
           let clicked_comment = $(this)  //let
           let m_comment_ta = $(this).parent().parent().children('.edit-comment-form').children('form').children('textarea')
           let m_comment = m_comment_ta.val()           
           if ($(this).parent().parent().children('.edit-comment-form').is(':visible')) {
                let cicked_commnent_form = $(this).parent().parent().children('.edit-comment-form:visible')               
                submitComment(m_comment, m_comment_ta)
           }else{
                console.log("opening-form")
                m_comment_ta.focus()  
                clicked_comment.parent().parent().children('.edit-comment-form').removeAttr('hidden').show()
                clicked_comment.parent().parent().children('.comment-info').hide()
           }
       })
        
});