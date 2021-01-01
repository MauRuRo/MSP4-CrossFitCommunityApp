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
        
        // compare heights of blocks to determine height for block-3
        // let element = document.getElementById('block-2')
        // let style = getComputedStyle(element)
        // let block2_height = style.height
        // element = document.getElementById('block-1')
        // style = getComputedStyle(element)
        // let block1_height = style.height
        // let block_height = Math.max(block1_height, block2_height)
        // console.log(block2_height)
        // $('#block-3').css("max-height", `${block2_height}`);

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
            }else{
                $(this).parent().addClass('remove-borders-main');
            }
        })
        let comment_field = ''
        $('.member-comment').focus(function() {
            console.log("focus")
            comment_field = $(this)
            $('#member-comment-form').removeAttr('id')
            $(this).parent().attr("id", "member-comment-form")
        })

                // $('.member-comment').focusout(function() {
                // console.log("focusout")
                // $(this).parent().removeAttr("id")
                // })
        // if (comment_field != '') {
        //     comment_field.focusout(function() {
        //         console.log("focusout")
        //         $(this).removeAttr("id")
        //     })
        // }

        if ($('.member-comment').focus()) {            
            let shift = false
            $('.member-comment').on('keydown', function (e) {
                if(e.which === 16){
                    shift = true
                    console.log("shiftkey")
                }
            });
            $('.member-comment').on('keyup', function (e) {
                if(e.which === 16){
                    shift = false
                    console.log("shiftkey")
                }
            });
            $('.member-comment').on('keypress', function (e) {
                let m_comment_ta = $(this)
                let m_comment = m_comment_ta.val()
                if(e.which === 13 && shift == false){
                    //Disable textbox to prevent multiple submit
                    $(this).attr("disabled", "disabled");
                    //Do Stuff, submit, etc..
                    console.log("testing keypress")
                    //Enable the textbox again if needed.
                    $(this).removeAttr("disabled");
                    submitComment(m_comment, m_comment_ta)
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
            // let m_comment = $(this).siblings('textarea').val()
            let m_log_id = $('#m-log-id').attr('data')
            $.ajax({
                type:"POST",
                url: "/workouts/0/commentMember/",
                data: {
                    member_comment:m_comment,
                    log_id:m_log_id
                },
                dataType: 'json',
                success: function(data){
                    console.log(data.message)
                    let template = $('#hidden-row-template').html()
                    $('#member-comment-form').parent().parent().parent().before(template)
                    $('#new-comment').text(data.message)
                    let commenting_member = $('#profile-name').html()
                    $('#new-comment-member').text(commenting_member + ":")
                    $('#new-comment-member').not(':hidden').removeAttr('id')
                    $('#new-comment').not(':hidden').removeAttr('id')
                    let new_row = $('.new-row:visible')
                    let old_row = $('.new-row:visible').prev('.row').attr('class')
                    new_row.attr('class', old_row)
                    m_comment_ta.val("")
                    
                    console.log("GOT HERE")
                },
                error: function(){
                    console.log("Failed")
                }
            })
       }
        
});