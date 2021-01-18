$(document).ready(function(){

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
            $(".row-groups:not(.custom-groups)").find(".selected-group").removeClass("selected-group").addClass("disabled-group")
            $(".selected-group").removeClass("selected-group")
            $(".group-clicked").addClass("selected-group")
            $(".group-clicked").next(".group-options").removeAttr('hidden').show()
            $(".custom-row").css('height', 'auto')
        }
        // else{
            
            if ($(this).hasClass("selected-group") && $(this).closest(".row-groups").hasClass("age-groups")){
                $(this).closest(".row-groups").find(".selected-group").removeClass("selected-group")
            }else{
            $(this).closest(".row-groups").find(".selected-group").removeClass("selected-group")
            $(this).addClass("selected-group")
            }
        
        // }
        
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

})