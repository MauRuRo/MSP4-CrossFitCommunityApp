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
        }else{
            $("#group-global").addClass('selected-group')
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
    // $(document).on("click", ".fa-check-circle", function(){
    //     $(".row-groups:not(.custom-groups)").find(".selected-group").removeClass("selected-group").addClass("disabled-group")
    //     $(".group-clicked").addClass("selected-group")
    //     $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-window-close'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i></p>")
    // })
    // $(document).on("click", ".fa-window-close", function(){
    //     $(".disabled-group").removeClass("disabled-group").addClass("selected-group")
    //     $(".group-clicked").closest(".row-groups").find(".selected-group").removeClass("selected-group")
    //     $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-check-circle'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i></p>")
    // })

    function getGroupEditInfo(id){
        let group_id = id
        let group_members
        let group_share
        let group_name
        $.ajax({
            type: "POST",
            url: "getGroupEditInfo/",
            data: {
                group_id:group_id
            },
            dataType: "json",
            success: function(data){
                group_members = data.group_members
                group_name = data.group_name
                group_share = data.group_share
                console.log(group_members)
                console.log(group_name)
                console.log(group_share)
                edit_data = {"members":group_members, "name":group_name, "share":group_share}
                console.log(edit_data)
                setEditForm(edit_data, group_id)
            },
            error: function(){
                console.log("ajax failed")
            }
        })
        
    }

    function setEditForm(data, id){
        $("#no-members-added").hide()
        $(".fa-user-plus").parent(".add-user").removeAttr("hidden").show()
        let edit_data = data
        let group_id = id
        let name = edit_data["name"]
        let members = JSON.parse(edit_data["members"])
        let share = edit_data["share"]
        $("#id_name").val(name).attr('data-group-id', group_id)
        for (i = 0; i < members.length; i++){
            member = members[i]
            console.log(member["name"])
            console.log(member["id"])
            let list_html = "<li id='li-" + member["id"] + "' data-id='" + member["id"] + "'>" + member["name"] + "</li>"
            $("#add-users-form-list").append(list_html)
            $(`#${member["id"]}.rank-card`).find(".rank-name").children("strong").css('color', 'blue')
            $(`#${member["id"]}.rank-card`).find(".fa-user-plus").parent(".add-user").hide()
            $(`#${member["id"]}.rank-card`).find(".fa-user-minus").parent(".add-user").removeAttr('hidden').show()
        }
        if (share == true){
            $("#id_share").prop("checked", true)
        } else {
            $("#id_share").prop("checked", false)
        }
        $("#group-make-div").removeAttr('hidden').show()
        $("#group-select-div").hide()
        $("#make-group-title").hide()
        $("#edit-group-title").removeAttr("hidden").show()
        $("#groupform-submit-button").hide()
        $("#groupform-edit-button").removeAttr("hidden").show()
    }
    $(document).on("click", ".fa-edit", function(){
        let group_id = $(this).closest(".row").find(".group-select").attr('id')
        getGroupEditInfo(group_id)
    })
    $(document).on("click", ".fa-trash-alt", function(){
    })
    // $(document).on("click", ".fa-info-circle", function(){
    // })
    
    if ($(".location-groups").find(".selected-group").length == 0 && $(".location-groups").find(".disabled-group").length == 0){
        $("#group-global").addClass("selected-group")
    }
    let load_constant = 0
    function searchMember(input){
        $(".search-member-item").remove()
        scroll_constant = false
        let make = false
        // console.log($("#make-group-div").is(":visible"))
        if ($("#group-make-div").is(":visible") == true){
            make = true
        }
        $.ajax({
            type: "POST",
            url: "searchMember/",
            data: {
                input: input,
                make: make,
            },
            dataType: 'json',
            success: function(data){
                if (load_constant < 2){
                    $('.group-members:visible').append(data.calling_group_html);
                }
                load_constant -= 1
                if (load_constant <= 0){
                    load_constant = 0
                    $(".search-wait").hide()
                }
                scroll_constant = true
                if ($(".search-wait:visible").length == 0 && $(".rank-card:visible").length == 0) {
                    $('.group-members:visible').append("<div class='row justify-content-center no-result-search'>Member not found in group.</div>")
                }
                if ($("#group-make-div:visible").length != 0){
                    $(".search-member-item").find(".fa-user-plus").parent(".add-user").removeAttr("hidden").show()
                }
                $(".search-member-item").each(function(){
                    let user_id = $(this).attr('id')
                    if ($("#add-users-form-list").find(`[data-id='${user_id}']`).length != 0){
                        $(this).find(".rank-name").children("strong").css('color', 'blue')
                        $(this).find(".fa-user-plus").parent(".add-user").hide()
                        $(this).find(".fa-user-minus").parent(".add-user").removeAttr("hidden").show()
                    }
                })
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
        $(".no-result-search").hide()
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
            $(".search-wait").hide()
            $(".rank-card").show()
            $(".group-dir-down").show()
            $(".search-member-item").remove()
            load_constant = 0
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
        if ($("#group-make-div:visible").length != 0){
                $(".scroll-load").find(".fa-user-plus").parent(".add-user").removeAttr("hidden").show()
                $(".scroll-load").removeClass("scroll-load")
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

    $(document).on("click", ".add-group", function(){
        $("#group-make-div").removeAttr("hidden").show()
        $("#group-select-div").hide()
        $(".fa-user-plus").parent(".add-user").removeAttr("hidden").show()
    })
    $(document).on("click", ".fa-user-plus", function(){
        $(this).closest(".circles-and-more").prevAll(".card-col:first").find(".rank-name").children("strong").css('color','blue')
        $(this).parent(".add-user").siblings(".add-user").removeAttr("hidden").show()
        $(this).parent(".add-user").hide()
        let member_id = $(this).closest(".rank-card").attr('id')
        let member_name = $(this).closest(".circles-and-more").prevAll(".card-col:first").find(".rank-name").children("strong").text()
        let list_html = "<li id='li-" + member_id + "' data-id='" + member_id + "'>" + member_name + "</li>"
        $("#add-users-form-list").append(list_html)
        $("#no-members-added").hide()
    })
    $(document).on("click", ".fa-user-minus", function(){
        $(this).closest(".circles-and-more").prevAll(".card-col:first").find(".rank-name").children("strong").css('color','black')
        $(this).parent(".add-user").siblings(".add-user").removeAttr("hidden").show()
        $(this).parent(".add-user").hide()
        let member_id = $(this).closest(".rank-card").attr('id')
        $(`#li-${member_id}`).remove()
        if ($("#add-users-form-list").children("li").length == 0) {
            $("#no-members-added").show()
        }
    })
    $(document).on("click", "#cancel-group", function(){
        $("#group-make-div").hide()
        $("#group-select-div").show()
        $(".add-user").hide()
        $("#add-users-form-list").html('')
        $("#no-members-added").show()
        $("#id_share").prop("checked", true)
        $("#id_name").val('')
    })

    // MAKE GROUP
    function makeGroup(){
        let groupname = $("#id_name").val()
        let sharegroup = $("#id_share").prop('checked')
        let groupmembers = []
        $("#add-users-form-list").children("li").each(function(){
            groupmembers.push($(this).data('id'))
        })
        groupmembers = JSON.stringify(groupmembers)
        $.ajax({
            type: "POST",
            url: "makeGroup/",
            data:{
                groupname: groupname,
                sharegroup: sharegroup,
                groupmembers: groupmembers,
            },
            dataType: "json",
            success: function(data){
                console.log("AJAX MAKE GROUP SUCCESS")
                location.reload()
            },
            error: function(){

            }
        })
    }
    function hidePop(){
            if ($("#pop-incomplete").is(':visible')) {
                $("#groupform-submit-button").popover('hide')
            }
        }
    $(document).click(function(){
        hidePop()
    })
    $(document).on("click", "#groupform-submit-button", function(e){
        e.stopPropagation()
        if ($("#id_name").val().length != 0 && $("#add-users-form-list").find("li").length != 0){
            makeGroup()
            return
        }else if ($("#id_name").val().length == 0 && $("#add-users-form-list").find("li").length == 0){
            $("#id_name").addClass("placeholder-fail")
            $("#no-members-added").css('color','red')
        }else if ($("#add-users-form-list").find("li").length == 0){
            console.log("no users")
            $("#no-members-added").css('color','red')
        }else{
            $("#id_name").addClass("placeholder-fail")
        }
        $("#groupform-submit-button").popover('show')
    })
    

})