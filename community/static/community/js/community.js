$(document).ready(function(){

    $(document).on("click", ".group-select", function(){
        $(".group-select").removeClass("group-clicked")
        $(this).addClass("group-clicked")
    })
    $(document).on("click", ".fa-check-circle", function(){
        console.log("SET clicked!")
        $(".group-clicked").closest(".row-groups").find(".selected-group").removeClass("selected-group")
        $(".group-clicked").addClass("selected-group")
        if ($(".group-clicked").closest(".row-groups").hasClass("age-groups")){
            $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-window-close'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i>  <i class='fas fa-info-circle'></i></p>")
            console.log("TEST")
        }
    })
    $(document).on("click", ".fa-window-close", function(){
        console.log("UNSET clicked!")
        $(".group-clicked").closest(".row-groups").find(".selected-group").removeClass("selected-group")
        $(".group-clicked").attr('data-bs-content', "<p class='p-popover'><i class='far fa-check-circle'></i>  <i class='far fa-edit'></i>  <i class='far fa-trash-alt'></i>  <i class='fas fa-info-circle'></i></p>")
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