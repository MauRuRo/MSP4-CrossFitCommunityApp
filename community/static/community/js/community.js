$(document).ready(function () {

    // SET VARIABLES AND ADJUST HTML/CSS ON PAGE LOAD
    let group_data = $("#group-select-data").attr('data');
    group_data = group_data.toString();
    group_data = JSON.parse(group_data);
    let load_constant = 0;
    let scroll_level = 1;
    let scroll_constant = true;
    let xhr;
    let active = false;
    let makinggroup = false;


    $(".selected-group").removeClass('selected-group').addClass('disabled-group');

    // DECLARE FUNCTIONS

    // Get the group info for the edit form.
    function getGroupEditInfo(id) {
        let group_id = id;
        let group_members;
        let group_share;
        let group_name;
        $.ajax({
            type: "POST",
            url: "getGroupEditInfo/",
            data: {
                group_id: group_id
            },
            dataType: "json",
            success: function (data) {
                group_members = data.group_members;
                group_name = data.group_name;
                group_share = data.group_share;
                let edit_data = { "members": group_members, "name": group_name, "share": group_share };
                setEditForm(edit_data, group_id);
            },
            error: function () {
                console.log("ajax failed");
            }
        });
    }
    
    // Put default info in to group edit form.
    function setEditForm(data, id) {
        $("#no-members-added").hide();
        $(".fa-user-plus").parent(".add-user").removeAttr("hidden").show();
        let edit_data = data;
        let group_id = id;
        let name = edit_data.name;
        let members = JSON.parse(edit_data.members);
        let share = edit_data.share;
      	let i;
        $("#id_name").val(name).attr('data-group-id', group_id);
        for (i = 0; i < members.length; i++) {
            let member = members[i];
            let list_html = "<li id='li-" + member.id + "' data-id='" + member.id + "'>" + member.name + "</li>";
            $("#add-users-form-list").append(list_html);
            $(`#${member.id}.rank-card`).find(".rank-name").children("strong").css('color', 'blue');
            $(`#${member.id}.rank-card`).find(".fa-user-plus").parent(".add-user").hide();
            $(`#${member.id}.rank-card`).find(".fa-user-minus").parent(".add-user").removeAttr('hidden').show();
        }
        if (share == true) {
            $("#id_share").prop("checked", true);
        } else {
            $("#id_share").prop("checked", false);
        }
        $("#group-make-div").removeAttr('hidden').show();
        $("#group-select-div").hide();
        $("#make-group-title").hide();
        $("#edit-group-title").removeAttr("hidden").show();
        $("#groupform-submit-button").hide();
        $("#groupform-edit-button").removeAttr("hidden").show();
    }

    // Find members with partial matching string.
    function searchMember(input) {
        $(".search-member-item").remove();
        scroll_constant = false;
        let make = false;
        if ($("#group-make-div").is(":visible") == true) {
            make = true;
        }
        $.ajax({
            type: "POST",
            url: "searchMember/",
            data: {
                input: input,
                make: make,
            },
            dataType: 'json',
            success: function (data) {
                if (load_constant < 2) {
                    $('.group-members:visible').append(data.calling_group_html);
                }
                load_constant -= 1;
                if (load_constant <= 0) {
                    load_constant = 0;
                    $(".search-wait").hide();
                }
                scroll_constant = true;
                if ($(".search-wait:visible").length == 0 && $(".rank-card:visible").length == 0) {
                    $('.group-members:visible').append("<div class='row justify-content-center no-result-search'>Member not found in group.</div>");
                }
                if ($("#group-make-div:visible").length != 0) {
                    $(".search-member-item").find(".fa-user-plus").parent(".add-user").removeAttr("hidden").show();
                }
                $(".search-member-item").each(function () {
                    let user_id = $(this).attr('id');
                    if ($("#add-users-form-list").find(`[data-id='${user_id}']`).length != 0) {
                        $(this).find(".rank-name").children("strong").css('color', 'blue');
                        $(this).find(".fa-user-plus").parent(".add-user").hide();
                        $(this).find(".fa-user-minus").parent(".add-user").removeAttr("hidden").show();
                    }
                });
            },
            error: function () {
                console.log("ajax FAIL");
            }
        });
    }

    // EXECUTE ON DOCUMENT READY

    // check if there's another page of users to be loaded.
    if ($("#members-title").data('hasnext') == "False") {
        $(".group-dir-down").remove();
    }

    // show selected group
    if (group_data.custom != "false") {
        let customgroup_id = "#" + group_data.custom;
        $(customgroup_id).addClass('selected-group');
    } else {
        $(".disabled-group").removeClass("disabled-group");
        if (group_data.age != "false") {
            $("#group-age").addClass('selected-group');
        }
        if (group_data.location == "group-city") {
            $("#group-city").addClass('selected-group');
        } else if (group_data.location == "group-country") {
            $("#group-country").addClass('selected-group');
        } else {
            $("#group-global").addClass('selected-group');
        }
    }

    // Set div size dependent on admin status.
    $(".group-options").each(function () {
        if ($(this).find(".edit-group").length == 0) {
            $(this).css('width', '30px');
            $(this).css('margin-left', 'calc(100% - 36px');
        }
    });

    // Make sure that a group is shown as selected.
    if ($(".location-groups").find(".selected-group").length == 0 && $(".location-groups").find(".disabled-group").length == 0) {
        $("#group-global").addClass("selected-group");
    }

    // Reset the Stats module depending on newly selected group.
    function resetStats() {
        $.ajax({
            type: "POST",
            url: "resetStats/",
            dataType: 'json',
            success: function (data) {
                $(".block-stats").html(data.stats_html);
                $(".block-stats").prepend("<div class='shadow-div'></div>");
                $(".comm-members-div").html(data.members_html);
                if (data.has_next == false) {
                    $("#members-title").data('page', 'x');
                    $(".group-dir-down").remove();
                }
                setAddUserIcons();
            },
            error: function () {
                console.log("failed resetStats");
            }
        });
    }

    // Set Group Selection object for user to newly selected group.
    function setGroupSelection() {
        let age;
        let custom;
        let location;
        if ($(".location-groups").find(".selected-group").length != 0) {
            location = $(".location-groups").find(".selected-group").attr('id');
        } else {
            location = $(".location-groups").find(".disabled-group").attr('id');
        }
        if ($(".age-groups").find(".selected-group").length != 0) {
            age = true;
        } else {
            age = false;
        }
        if ($(".custom-groups").find(".selected-group").length != 0) {
            custom = $(".custom-groups").find(".selected-group").attr('id');
        } else {
            custom = false;
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
            success: function (data) {
                resetStats();
            },
            error: function () {
                console.log("ajax FAIL");
            }
        });
    }

    // Check scroll constant before returning function for member loading.
    function goScrollDownGroup() {
        if (scroll_constant == true) {
            scroll_constant = false;
            lazyLoadGroup();
        }
    }

    // Load next page of members.
    function lazyLoadGroup() {
        $(".group-dir-down:visible").html('<i class="fas fa-circle-notch fa-spin"></i>');
        let pagedata = $("#members-title");
        var pageno = pagedata.data('page');
        if (pageno == "x") {
            scroll_constant = true;
            return;
        }
        $.ajax({
            type: 'POST',
            url: 'lazyLoadGroup/',
            data: {
                page: pageno,
            },
            dataType: "json",
            success: function (data) {
                if (data.no_page == true) {
                    scroll_constant = true;
                    $(".group-dir-down:visible").remove();
                    return;
                }
                if (data.has_next) {
                    pagedata.data('page', pageno + 1);
                } else {
                    pagedata.data('page', "x");
                }
                $('.group-members:visible').append(data.calling_group_html);
                $('.group-members:visible').append('<div class="row mx-0 my-1 align-items-center justify-content-center direction direction-down-group direction-group"><i class="fas fa-angle-double-down"></i></div>');
                if (pagedata.data('page') == "x") {
                    $(".direction-down-group:visible").remove();
                } else {
                    $(".group-dir-down:visible").remove();
                    $(".direction-down-group").addClass('group-dir-down');
                }
                if ($("#group-make-div:visible").length != 0 || $(".add-user:visible").length != 0) {
                    setAddUserIcons();
                    $(".scroll-load").removeClass("scroll-load");
                }
                scroll_constant = true;
            },
            error: function (xhr, status, error) {
            }
        });
    }

    // Scroll to top of list.
    function scrollToTopFast(element) {
        element.animate({
            scrollTop: 0
        }, 0);
    }

    // Make a new Custom Group object.
    function makeGroup() {
        let groupname = $("#id_name").val();
        let sharegroup = $("#id_share").prop('checked');
        let groupmembers = [];
        $("#add-users-form-list").children("li").each(function () {
            groupmembers.push($(this).data('id'));
        });
        groupmembers = JSON.stringify(groupmembers);
        $.ajax({
            type: "POST",
            url: "makeGroup/",
            data: {
                groupname: groupname,
                sharegroup: sharegroup,
                groupmembers: groupmembers,
            },
            dataType: "json",
            success: function (data) {
                location.reload(true);
            },
            error: function () {
            }
        });
    }

    // Keep showing add-user icons while navigating through page if making group is true.
    function setAddUserIcons(){
        if (makinggroup == true){
                let grouparr = [];
                $("#add-users-form-list").children().each(function(){
                    grouparr.push($(this).data('id').toString());
                });
                console.log(grouparr);
                $(".rank-card").each(function(){
                    let memberid = $(this).attr('id').toString();
                    console.log(memberid);
                    if ( grouparr.includes(memberid) ){
                        $(this).find(".fa-user-minus").parent(".add-user").removeAttr('hidden').show();
                        $(this).find(".rank-name").children("strong").css('color', 'blue');
                    } else {
                        $(this).find(".fa-user-plus").parent(".add-user").removeAttr('hidden').show();
                    }
                });
            }
    }

    // Hide popover for incomplete form (validation).
    function hidePop() {
        if ($("#pop-incomplete").is(':visible')) {
            $("#groupform-submit-button").popover('hide');
        }
    }

    // Edit Custom Group Object.
    function editGroup() {
        let group_id = $("#id_name").data("group-id");
        let groupname = $("#id_name").val();
        let sharegroup = $("#id_share").prop('checked');
        let groupmembers = [];
        $("#add-users-form-list").children("li").each(function () {
            groupmembers.push($(this).data('id'));
        });
        groupmembers = JSON.stringify(groupmembers);
        $.ajax({
            type: "POST",
            url: "editGroup/",
            data: {
                group_id: group_id,
                groupname: groupname,
                sharegroup: sharegroup,
                groupmembers: groupmembers,
            },
            dataType: "json",
            success: function (data) {
                location.reload(true);
            },
            error: function () {

            }
        });
    }

    // Delete Custom Group object.
    function deleteGroup(id, element) {
        let group_id = id;
        resetGroupSelection();
        $(".disabled-group").removeClass("disabled-group").addClass("selected-group");
        $.ajax({
            type: "POST",
            url: "deleteGroup/",
            data: {
                group_id: group_id
            },
            dataType: "json",
            success: function (data) {
                element.remove();
            },
            error: function () {
                console.log("delete failed ajax");
            }
        });
    }

    // Reset user's group selection object.
    function resetGroupSelection() {
        $.ajax({
            type: "POST",
            url: "setGroupSelect/",
            data: {
                age: false,
                custom: false,
                location: "group-global"
            },
            dataType: 'json',
            success: function (data) {
                resetStats();
            },
            error: function () {
                console.log("ajax FAIL");
            }
        });
    }

    // Get member info and levels to display.
    function getMemberInfo(memberid) {
        let user_id = memberid;
        $.ajax({
            type: "POST",
            url: "getMemberInfo/",
            data: {
                user_id: user_id
            },
            dataType: "json",
            success: function (data) {
                $(".level-bar-box").popover('hide');
                $("#group-select-div, #group-make-div, #group-stats-div").hide();
                let herolevels = data.calling_group_html;
                let userinfo = data.calling_group_two;
                $(".hl-container:visible, #user-info-block:visible").remove();
                $(".block-main").append(herolevels);
                $(".block-stats").append(userinfo);
                $(".fa-edit-profile").closest(".row").remove();
                $(".user-info-header").css('margin-top', '8px');
                updateLevelCSS();
                $("#close-hl").show();
                var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'));
                var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
                    return new bootstrap.Popover(popoverTriggerEl);
                });
                updateLevels(user_id);
            },
            error: function () {
                console.log("getMemberInfo Ajax failed");
            }
        });
    }

    // Update the CSS for the levels (bar height and color adjusting)
    function updateLevelCSS() {
        $(".level-bar").each(function () {
            let height = $(this).next().text() + "px";
            if (height == "nonepx") {
                height = '0px';
            }
            $(this).css("min-height", height);
            let name = $(this).parent().next(".level-cat-name")[0];
            let namewidth = name.offsetWidth;
            let namespan = $(this).parent().next(".level-cat-name").children("span")[0];
            let namespanwidth = namespan.offsetWidth;
            if (namespanwidth > namewidth) {
                $(this).parent().next(".level-cat-name").css("margin-left", "-100%");
                $(this).parent().next(".level-cat-name").css("margin-right", "-100%");
            }
            if ($(".acc-high").length > 4) {
                $("#gen-level").css("color", "blue");
            } else if ($(".acc-low").length > 3) {
                $("#gen-level").css("color", "red");
            } else if ($(".acc-none").length > 3) {
                $("#gen-level").css("color", "red");
            } else {
                $("#gen-level").css("color", "#ffc107");
            }
        });
    }

    // Get the latest statistics for level of selected member.
    function updateLevels(id) {
        let user_id = id;
        $("#level-loader").removeAttr("hidden");
        $("#level-loader").show();
        if (active) {
            xhr.abort();
            $("#level-loader").html("<p>Getting most recent statistics...<i class='fas fa-circle-notch fa-spin'></i></p>");
        }
        active = true;
        xhr = $.ajax({
            type: "POST",
            url: "/profile/calc_level/",
            data: {
                user: user_id
            },
            dataType: "json",
            success: function (data) {
                $('[data-toggle="popover"]').popover("hide");
                // Add this line to fix safari iOS bug.
                $('[data-toggle="popover"]:not(#groupform-submit-button)').addClass('hide-it');
                $("#level-loader").hide();
                $(".hl-container").remove();
                $(".block-main").append(data.new_levels_html);
                $("#close-hl").show();
                updateLevelCSS();
                var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'));
                var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
                    return new bootstrap.Popover(popoverTriggerEl);
                });
                active = false;
                if ($(".block-main").hasClass("block-levels") == false){
                $(".block-main").addClass("block-levels");
                }
            },
            error: function () {
                console.log("Failed Updating Levels " + user_id);
                $("#level-loader").children("p").html("Failed to get most recent statistics. Please refresh page to try again.");
                active = false;
            }
        });
    }

    // EVENT HANDLERS

    // Show/Hide info about group selection
    $(document).on("click", "#level-info-modal-gm", function () {
        if ($("#level-info-gm").is(":visible")) {
            $("#level-info-gm").hide();
        } else {
            $("#level-info-gm").removeAttr('hidden');
            $("#level-info-gm").show();
        }
    });

    // Show/Hide info about Hero levels.
    $(document).on("click", "#level-info-modal-hl", function () {
        if ($("#level-info-hl").is(":visible")) {
            $("#level-info-hl").hide();
        } else {
            $("#level-info-hl").removeAttr('hidden').show();
        }
    });

    // Select a group.
    $(document).on("click", ".group-select:not(.add-group)", function () {
        if ($(".add-user:visible").length > 0){
            makinggroup = true;
        }
        console.log(makinggroup);
        let element = $(".block-members:first");
        scrollToTopFast(element);
        scroll_level = 1;
        $(".group-options:visible").hide();
        $(".custom-row").css('height', '100%');
        $(".group-select").removeClass("group-clicked");
        $(this).addClass("group-clicked");
        if ($(".disabled-group").length != 0) {
            $(".selected-group").removeClass("selected-group");
            $(".disabled-group").removeClass("disabled-group").addClass("selected-group");
        }
        if ($(this).closest(".row-groups").hasClass("custom-groups")) {
            $(".row-groups:not(.custom-groups)").find(".selected-group").removeClass("selected-group").addClass("disabled-group");
            $(".selected-group").removeClass("selected-group");
            $(".group-clicked").addClass("selected-group");
            $(".group-clicked").next(".group-options").removeAttr('hidden').show();
            $(".custom-row").css('height', 'auto');
        }
        if ($(this).hasClass("selected-group") && $(this).closest(".row-groups").hasClass("age-groups")) {
            $(this).closest(".row-groups").find(".selected-group").removeClass("selected-group");
        } else {
            $(this).closest(".row-groups").find(".selected-group").removeClass("selected-group");
            $(this).addClass("selected-group");
        }
        setGroupSelection();
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });

    // Edit Group
    $(document).on("click", ".fa-edit", function () {
        let group_id = $(this).closest(".row").find(".group-select").attr('id');
        getGroupEditInfo(group_id);
    });
    
    // Adjust css when scroll content goes behind header.
    $(".fillblock").scroll(function () {
        if ($(this).scrollTop() > 4) {
            $(this).find(".block-header").css('border-bottom', 'dotted 3px grey');
        } else {
            $(this).find(".block-header").css('border-bottom', '');
        }
    });
    
    // No submission on return key for member search function.
    $(document).on("keypress", ".search-member", function (e) {
        if (e.which === 13) {
            e.preventDefault();
        }
    });

    // Submit member search on input change.
    $(document).on("input", ".search-member", function (e) {
        load_constant += 1;
        $(".no-result-search").hide();
        $(".search-wait").removeAttr('hidden').show();
        if ($(".search-member").val() != "") {
            $(".group-dir-down").hide();
            $(".rank-card").hide();
            let sctext = $(".search-member").val().toLowerCase();
            searchMember(sctext);
            $(".rank-name").each(function () {
                let thistext = $(this).children("strong").text().toLowerCase();
                let incl = thistext.includes(sctext);
                if (incl == false) {
                    $(this).closest(".rank-card").hide();
                }
            });
        } else {
            $(".search-wait").hide();
            $(".rank-card").show();
            $(".group-dir-down").show();
            $(".search-member-item").remove();
            load_constant = 0;
        }
    });

    // Load rest of member list on scroll.
    $(".block-members").scroll(function () {
        if ($(this).scrollTop() > (scroll_level * 600) && scroll_constant == true) {
            goScrollDownGroup();
            scroll_level += 1;
        }
    });

    // Load rest of member list on button click.
    $(document).on("click", ".group-dir-down", function () {
        goScrollDownGroup();
    });

    // Click to show the make a group fields.
    $(document).on("click", ".add-group", function () {
        $("#group-make-div").removeAttr("hidden").show();
        $("#group-select-div").hide();
        if ($(".add-user:visible").length == 0 ){
            $(".fa-user-plus").parent(".add-user").removeAttr("hidden").show();
        }
    });

    // Click to add user to group.
    $(document).on("click", ".fa-user-plus", function () {
        $(this).closest(".circles-and-more").prevAll(".card-col:first").find(".rank-name").children("strong").css('color', 'blue');
        $(this).parent(".add-user").siblings(".add-user").removeAttr("hidden").show();
        $(this).parent(".add-user").hide();
        let member_id = $(this).closest(".rank-card").attr('id');
        let member_name = $(this).closest(".circles-and-more").prevAll(".card-col:first").find(".rank-name").children("strong").text();
        let list_html = "<li id='li-" + member_id + "' data-id='" + member_id + "'>" + member_name + "</li>";
        $("#add-users-form-list").append(list_html);
        $("#no-members-added").hide();
    });

    // Click to remove user from group.
    $(document).on("click", ".fa-user-minus", function () {
        $(this).closest(".circles-and-more").prevAll(".card-col:first").find(".rank-name").children("strong").css('color', 'black');
        $(this).parent(".add-user").siblings(".add-user").removeAttr("hidden").show();
        $(this).parent(".add-user").hide();
        let member_id = $(this).closest(".rank-card").attr('id');
        $(`#li-${member_id}`).remove();
        if ($("#add-users-form-list").children("li").length == 0) {
            $("#no-members-added").show();
        }
    });

    // Click to abort making a new group.
    $(document).on("click", "#cancel-group", function () {
        $("#group-make-div").hide();
        $("#group-select-div").show();
        $(".add-user").hide();
        $("#add-users-form-list").html('');
        $("#no-members-added").show();
        $("#id_share").prop("checked", true);
        $("#id_name").val('');
        $(".rank-name").children("strong").css('color', 'black');
    });

    // Click anywhere to hide validation popover.
    $(document).click(function () {
        hidePop();
    });

    // Click to make group, if form not validated show popup.
    $(document).on("click", "#groupform-submit-button", function (e) {
        e.stopPropagation();
        if ($("#id_name").val().length != 0 && $("#add-users-form-list").find("li").length != 0) {
            makeGroup();
            return;
        } else if ($("#id_name").val().length == 0 && $("#add-users-form-list").find("li").length == 0) {
            $("#id_name").addClass("placeholder-fail");
            $("#no-members-added").css('color', 'red');
        } else if ($("#add-users-form-list").find("li").length == 0) {
            $("#no-members-added").css('color', 'red');
        } else {
            $("#id_name").addClass("placeholder-fail");
        }
        $("#groupform-submit-button").popover('show');
    });

    // Emphasize members module for group editing.
    $(document).on("click", "#goto-members", function () {
        $("#members-title").animate({ fontSize: "2rem" }, 500);
        $("#members-title").animate({ fontSize: "1.5rem" }, 500);
        $('html, body').animate({
            scrollTop: 0
        }, 800);
    });

    // Click to edit Group.
    $(document).on("click", "#groupform-edit-button", function () {
        editGroup();
    });

    // Click to delete Group.
    $(document).on("click", ".delete-group", function () {
        let group_id = $(this).closest(".row").find(".group-select").attr('id');
        let element = $(this).closest(".col-12");
        deleteGroup(group_id, element);
    });

    // Click to get member info and levels.
    $(document).on("click", ".card-col", function () {
        let memberid = $(this).closest(".rank-card").attr('id');
        getMemberInfo(memberid);
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });
      
    // Click to get admin info and levels.
    $(document).on("click", ".admin-group", function () {
        let memberid = $(this).data('id');
        getMemberInfo(memberid);
    });

    // Click to close member info and level display and return to group selection.
    $(document).on("click", "#close-hl, .user-info-header", function () {
        $(".hl-container:visible, #user-info-block:visible").remove();
        $("#group-select-div, #group-stats-div").show();
        $(".block-main").removeClass("block-levels");
    });
      
    // Click to close group make/edit tab and show group 
    // selection in order to change selection to choose members from.
    $(document).on("click", "#close-mg, #close-eg", function () {
        $("#group-make-div").hide();
        $("#group-select-div, #group-stats-div").show();
    });

    // EXECUTE FUNCTIONS ON DOCUMENT READ
    // none

});