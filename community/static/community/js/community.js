$(document).ready(function(){
    let group_data = $("#group-select-data").attr('data')
    group_data = group_data.toString()
    // console.log(group_data)
    group_data = JSON.parse(group_data)
    console.log(group_data)
    // console.log(group_data["custom"])
    $(".selected-group").removeClass('selected-group').addClass('disabled-group')
    if (group_data["custom"] != "false"){
        console.log("here")
        customgroup_id = "#" + group_data["custom"]
        $(customgroup_id).addClass('selected-group')
    } else {
        $(".disabled-group").removeClass("disabled-group")
        if (group_data["age"] != "false"){
            console.log("age is true")
            $("#group-age").addClass('selected-group')
        }
        if (group_data["location"] == "group-city"){
            console.log("city is true")
            $("#group-city").addClass('selected-group')
        }else if (group_data["location"] == "group-country"){
            console.log("country is true")
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
            $(".group-options:visible").hide()
            $(".custom-row").css('height', '100%')
            $(".group-select").removeClass("group-clicked")
            $(this).addClass("group-clicked")
        if ($(".disabled-group").length != 0) {              
            $(".selected-group").removeClass("selected-group")
            $(".disabled-group").removeClass("disabled-group").addClass("selected-group")
        }
        if ($(this).closest(".row-groups").hasClass("custom-groups")){
            // popGroup()
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
        console.log("SET clicked!")
        $(".row-groups:not(.custom-groups)").find(".selected-group").removeClass("selected-group").addClass("disabled-group")
        // $(".group-clicked").closest(".row-groups").find(".selected-group").removeClass("selected-group").attr('data-bs-content',"<p class='p-popover'><i class='far fa-check-circle'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i></p>")
        $(".group-clicked").addClass("selected-group")
        // if ($(".group-clicked").closest(".row-groups").hasClass("age-groups")){
        $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-window-close'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i></p>")
        console.log("TEST")
        // }
    })
    $(document).on("click", ".fa-window-close", function(){
        console.log("UNSET clicked!")
        $(".disabled-group").removeClass("disabled-group").addClass("selected-group")
        $(".group-clicked").closest(".row-groups").find(".selected-group").removeClass("selected-group")
        $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-check-circle'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i></p>")
    })
    $(document).on("click", ".fa-edit", function(){
        console.log("EDIT clicked!")
    })
    $(document).on("click", ".fa-trash-alt", function(){
        console.log("DELETE clicked!")
    })
    $(document).on("click", ".fa-info-circle", function(){
        console.log("INFO clicked!")
    })
    
    if ($(".location-groups").find(".selected-group").length == 0 && $(".location-groups").find(".disabled-group").length == 0){
        $("#group-global").addClass("selected-group")
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
            type:"POST",
            url: "setGroupSelect/",
            data: {
                age: age,
                custom: custom,
                location: location
            },
            dataType: 'json',
            success: function(data){
                console.log("ajax Succes")
            },
            error: function(){
                console.log("ajax FAIL")          
            }
        })
    }
})