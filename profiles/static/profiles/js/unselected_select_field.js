// Script to set colors for active/inactive selected/unselected choicefields in form.
let countrySelected = $('#id_country').val();
if (!countrySelected) {
    $('#id_country').css('color', '#aab7c4');
}
$('#id_country').change(function () {
    countrySelected = $(this).val();
    if (!countrySelected) {
        $(this).css('color', '#aab7c4');
    } else {
        $(this).css('color', '#000');
    }
});

let genderSelected = $('#id_gender').val();
if (!genderSelected) {
    $('#id_gender').css('color', '#aab7c4');
}
$('#id_gender').change(function () {
    genderSelected = $(this).val();
    if (!genderSelected) {
        $(this).css('color', '#aab7c4');
    } else {
        $(this).css('color', '#000');
    }
});