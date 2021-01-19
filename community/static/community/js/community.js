$(document).ready(function(){
    if ($("#members-title").data('hasnext') == "False"){
        $(".group-dir-down").remove()
    }
    let group_data = $("#group-select-data").attr('data')
    group_data = group_data.toString()
    group_data = JSON.parse(group_data)
    $(".selected-group").removeClass('selected-group').addClass('disabled-group')
    if (group_data["custom"] != "false"){
        customgroup_id = "#" + group_data["custom"]
        $(customgroup_id).addClass('selected-group')
    } else {
        $(".disabled-group").removeClass("disabled-group")
        if (group_data["age"] != "false"){
            $("#group-age").addClass('selected-group')
        }
        if (group_data["location"] == "group-city"){
            $("#group-city").addClass('selected-group')
        }else if (group_data["location"] == "group-country"){
            $("#group-country").addClass('selected-group')
        }
    }
    $(document).on("click", "#level-info-modal", function(){
           if ($("#level-info").is(":visible")){
                $("#level-info").hide()
           }else{
                $("#level-info").removeAttr('hidden')
                $("#level-info").show()
           }
       })

    $(".group-options").each(function(){
        if ($(this).find(".edit-group").length == 0){
            $(this).css('width', '30px')
            $(this).css('margin-left', 'calc(100% - 36px')
        }
    })
    $(document).on("click", ".group-select:not(.add-group)", function(){
            element = $(".block-members:first")
            scrollToTopFast(element)
            scroll_level = 1
            $(".group-options:visible").hide()
            $(".custom-row").css('height', '100%')
            $(".group-select").removeClass("group-clicked")
            $(this).addClass("group-clicked")
        if ($(".disabled-group").length != 0) {              
            $(".selected-group").removeClass("selected-group")
            $(".disabled-group").removeClass("disabled-group").addClass("selected-group")
        }
        if ($(this).closest(".row-groups").hasClass("custom-groups")){
            $(".row-groups:not(.custom-groups)").find(".selected-group").removeClass("selected-group").addClass("disabled-group")
            $(".selected-group").removeClass("selected-group")
            $(".group-clicked").addClass("selected-group")
            $(".group-clicked").next(".group-options").removeAttr('hidden').show()
            $(".custom-row").css('height', 'auto')
        }
        if ($(this).hasClass("selected-group") && $(this).closest(".row-groups").hasClass("age-groups")){
            $(this).closest(".row-groups").find(".selected-group").removeClass("selected-group")
        }else{
        $(this).closest(".row-groups").find(".selected-group").removeClass("selected-group")
        $(this).addClass("selected-group")
        }
        setGroupSelection()
    })
    $(document).on("click", ".fa-check-circle", function(){
        $(".row-groups:not(.custom-groups)").find(".selected-group").removeClass("selected-group").addClass("disabled-group")
        $(".group-clicked").addClass("selected-group")
        $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-window-close'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i></p>")
    })
    $(document).on("click", ".fa-window-close", function(){
        $(".disabled-group").removeClass("disabled-group").addClass("selected-group")
        $(".group-clicked").closest(".row-groups").find(".selected-group").removeClass("selected-group")
        $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-check-circle'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i></p>")
    })
    $(document).on("click", ".fa-edit", function(){
    })
    $(document).on("click", ".fa-trash-alt", function(){
    })
    $(document).on("click", ".fa-info-circle", function(){
    })
    
    if ($(".location-groups").find(".selected-group").length == 0 && $(".location-groups").find(".disabled-group").length == 0){
        $("#group-global").addClass("selected-group")
    }
    let load_constant = 0
    function searchMember(input){
        $(".search-member-item").remove()
        // console.log(input)
        scroll_constant = false
        $.ajax({
            type: "POST",
            url: "searchMember/",
            data: {
                input: input,
            },
            dataType: 'json',
            success: function(data){
                console.log(load_constant)
                if (load_constant < 2){
                    $('.group-members:visible').append(data.calling_group_html);
                }
                load_constant -= 1
                if (load_constant <= 0){
                    load_constant = 0
                    $(".search-wait").hide()
                }
                console.log(load_constant)
                scroll_constant = true
            },
            error: function(){
                console.log("ajax FAIL")          
            }
        })
    }

    // function popGroup(){
    //     $.ajax({
    //         type:"POST",
    //         url: "popGroup/",
    //         // data: {
    //         //     age: age,
    //         //     custom: custom,
    //         //     location: location
    //         // },
    //         // dataType: 'json',
    //         success: function(data){
    //             console.log("ajax Succes")
    //             console.log(data.message)
    //             console.log(data.upload)
    //             console.log(data.group)
    //         },
    //         error: function(){
    //             console.log("ajax FAIL")          
    //         }
    //     })
    // }
    function resetStats(){
        $.ajax({
            type: "POST",
            url: "resetStats/",
            dataType: 'json',
            success: function(data){
                $(".block-stats").html(data.stats_html)
                $(".block-members").html(data.members_html)
                console.log(data.has_next)
                if (data.has_next == false){
                    $("#members-title").data('page', 'x')
                    $(".group-dir-down").remove()
                }
                
            },
            error: function(){
                console.log("failed resetStats")
            }
        })
    }
    function setGroupSelection() {
        let age
        let custom
        let location
        if ($(".location-groups").find(".selected-group").length != 0){
            location = $(".location-groups").find(".selected-group").attr('id')
        } else {
            location = $(".location-groups").find(".disabled-group").attr('id')
        }
        if ($(".age-groups").find(".selected-group").length != 0){
            age = true
        } else {
            age = false
        }
        if ($(".custom-groups").find(".selected-group").length != 0){
            custom = $(".custom-groups").find(".selected-group").attr('id')
        } else {
            custom = false
        }
        $.ajax({
            type: "POST",
            url: "setGroupSelect/",
            data: {
                age: age,
                custom: custom,
                location: location
            },
            dataType: 'json',
            success: function(data){
                console.log("ajax Succes")
                resetStats()
            },
            error: function(){
                console.log("ajax FAIL")          
            }
        })
    }
    $(".fillblock").scroll(function(){
        if ($(this).scrollTop() > 4){
            $(this).find(".block-header").css('border-bottom', 'dotted 3px grey')
        }else{
            $(this).find(".block-header").css('border-bottom', '')
        }
    });
    $(document).on("keypress", ".search-member", function(e){
        if (e.which===13){
            e.preventDefault()
        }            
    })
    $(document).on("input", ".search-member", function(e){
        load_constant += 1
        $(".search-wait").removeAttr('hidden').show()
        if ($(".search-member").val()!=""){
            $(".group-dir-down").hide()
            $(".rank-card").hide()

            sctext = $(".search-member").val().toLowerCase()

            searchMember(sctext)

            $(".rank-name").each(function(){
                thistext = $(this).children("strong").text().toLowerCase()
                incl = thistext.includes(sctext)
                if (incl == true){
                    // $(this).closest(".rank-card").show()
                }else{
                    $(this).closest(".rank-card").hide()
                }
            })
        }else{
            $(".rank-card").show()
            $(".group-dir-down").show()
            $(".search-member-item").remove()
            load_constant = 0
            console.log(load_constant)
        }
    })


// loading members
let scroll_level = 1
let scroll_constant = true
// $(document).on("scroll", ".block-members", function(){
    $(".block-members").scroll(function(){
        if ($(this).scrollTop() > (scroll_level * 600) && scroll_constant == true){
            goScrollDownGroup()
            scroll_level += 1
        }
    });
$(document).on("click", ".group-dir-down", function () {
        goScrollDownGroup()
    })
function goScrollDownGroup(){
        if (scroll_constant == true){
            scroll_constant = false
            lazyLoadGroup()
        }
    }
function lazyLoadGroup() {
    $(".group-dir-down:visible").html('<i class="fas fa-circle-notch fa-spin"></i>')          
    pagedata = $("#members-title")
    var pageno = pagedata.data('page');
    if (pageno == "x"){
        scroll_constant = true
        return;
    }
    $.ajax({
    type: 'POST',
    url: 'lazyLoadGroup/',
    data: {
        page: pageno,
    },
    dataType: "json",
    success: function(data) {
        if (data.no_page==true){
            scroll_constant = true
            $(".group-dir-down:visible").remove()
            return;
        }
        if (data.has_next) {
            pagedata.data('page', pageno+1);
        } else {
            pagedata.data('page', "x");
        }
        $('.group-members:visible').append(data.calling_group_html);
        $('.group-members:visible').append('<div class="row mx-0 my-1 align-items-center justify-content-center direction direction-down-group direction-group"><i class="fas fa-angle-double-down"></i></div>')
        if (pagedata.data('page')=="x"){
            $(".direction-down-group:visible").remove()
        }else{
            $(".group-dir-down:visible").remove()
            $(".direction-down-group").addClass('group-dir-down')
        } 
        scroll_constant = true
    },
    error: function(xhr, status, error) {
    }
    });
    
};

function  scrollToTopFast(element){
        element.animate({
            scrollTop: 0}, 0)
    };


})