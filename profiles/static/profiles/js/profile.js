$(document).ready(function(){

    $('#new-image').change(function() {
        var file = $('#new-image')[0].files[0];
        $('#filename').text(`Image will be set to: ${file.name}`);
    });
    $("#toggle-edit-profile-button").click(function(){
        $("#user-info-block").hide()
        $("#edit-form-block").removeAttr('hidden')
        $("#edit-form-block").show()

    })
    $("#cancel-profile-edit").click(function(e){
        e.preventDefault()
        $("#user-info-block").show()
        $("#edit-form-block").hide()

    })
    $('#test-submit-button').click(function(e) {
        e.preventDefault()
        $.ajax({
            type:"POST",
            url: "/profile/test/",
            data: {test:"test"},
            dataType: 'json',
            success: function(data){
                console.log(data.message)
                alert("SUCCESs!!")
            },
            error: function(){
                console.log("Failed")
            }
        })
    })
    $('#user-populate').click(function() {
    $.ajax({
    url: 'https://randomuser.me/api/?results=500&format=json&dl',
    dataType: 'json',
    success: function(data) {
        console.log(data);
        let p_data=JSON.stringify(data)
        $("#printout").val(p_data)
        console.log("Succesfully uploaded userfile2")
    }
    });
    });

    function updateLevelCSS(){
        $(".level-bar").each(function(){
            let height = $(this).next().text() + "px"
            if (height == "nonepx"){
                height = '0px'
            }
            $(this).css("min-height", height)
            let name = $(this).parent().next(".level-cat-name")[0]
            let namewidth = name.offsetWidth
            let namespan = $(this).parent().next(".level-cat-name").children("span")[0]
            let namespanwidth = namespan.offsetWidth
            if (namespanwidth > namewidth){
                $(this).parent().next(".level-cat-name").css("margin-left", "-100%")
                $(this).parent().next(".level-cat-name").css("margin-right", "-100%")
            }
            if ($(".acc-high").length > 4) {
                $("#gen-level").css("color", "blue")
            }else if ($(".acc-low").length > 3) {
                $("#gen-level").css("color", "red")
            }else if ($(".acc-none").length > 3){
                $("#gen-level").css("color", "red")
            }else{
                $("#gen-level").css("color", "#ffc107")
            }
        })
    }
    updateLevelCSS()

    function updateLevels(){
        $("#level-loader").removeAttr("hidden")
        $("#level-loader").show()
        let userid = $("#user-id-no").attr('data')
         $.ajax({
                type:"POST",
                url: "/profile/calc_level/",
                // data: {
                //     user:userid
                // },
                // dataType: 'json',
                success: function(data){
                  console.log("UPDATED! :D")
                  $("#level-loader").hide()
                  $("#level-block").html(data.new_levels_html)
                  updateLevelCSS()
                },
                error: function(){
                    console.log("Failed Updating Levels")
                    $("#level-loader").children("p").html("Failed to get most recent statistics. Please refresh page to try again.")
                }
            })
       };
       updateLevels()

       $(document).on("click", "#level-info-modal", function(){
           if ($("#level-info").is(":visible")){
                $("#level-info").hide()
           }else{
                $("#level-info").removeAttr('hidden')
                $("#level-info").show()
           }
           
       })
})