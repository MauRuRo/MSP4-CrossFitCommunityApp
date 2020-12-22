var stripePublicKey = $('#id_stripe_public_key').text().slice(1, -1);
var clientSecret = $('#id_client_secret').text().slice(1, -1);
var stripe = Stripe(stripePublicKey);
var elements = stripe.elements()
var style = {
  base: {
    color: '#000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    },
    ':-webkit-autofill': {
      color: '#32325d',
    },
  },
  invalid: {
    color: '#dc3545',
    iconColor: '#dc3545',
    ':-webkit-autofill': {
      color: '#dc3545',
    },
  }
};

var card = elements.create('card', {style: style});
card.mount('#card-element')

// //  handle realtime validation errors on the card element.

// card.addEventListener('change', function (event){
//     var errorDiv = document.getElementById('card-errors');
//     if (event.error) {
//         var html = `<span class="icon" role="alert"></span><i class="fas fa-times"></i></span><span>${event.error.message}</span>`;
//         $(errorDiv).html(html);
//     } else {
//         errorDiv.textContent = '';
//     }
// });

// // handle form submit

// var form = document.getElementById('create_profile_form');

// form.addEventListener('submit', function(ev) {
//   ev.preventDefault();
//   card.update({'disabled': true});
//   $('#submit-button').attr('disabled', true);
// //   $('#payment-form').fadeToggle(100);
// //   $('#loading-overlay').fadeToggle(100);

//   var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
//   var postData = {
//       'csrfmiddlewaretoken': csrfToken,
//       'client_secret': clientSecret,
//   };

// var url = '/profile/cache_payment_create_profile/';

//   $.post(url, postData).done(function() {
//     stripe.confirmCardPayment(clientSecret, {
//         payment_method: {
//         card: card,
//         profile_details: {
//             user: request.user,
//             name: $.trim(form.full_name.value),
//             email: $.trim(form.email.value),
//             town_or_city: $.trim(form.town_or_city.value),
//             country: $.trim(form.country.value),
//             gender: $.trim(form.gender.value),
//             weight: $.trim(form.weight.value),
//             age: $.trim(form.age.value),
//             image: $.trim(form.image.value),
//           }
//         },
//     }).then(function(result) {
//         if (result.error) {
//             var errorDiv = document.getElementById('card-errors');
//             var html = `<span class="icon" role="alert"></span><i class="fas fa-times"></i></span><span>${result.error.message}</span>`;
//             $(errorDiv).html(html);
//             $('#payment-form').fadeToggle(100);
//             $('#loading-overlay').fadeToggle(100);
//             card.update({'disabled': false});
//             $('#submit-button').attr('disabled', false);
//         } else {
//             if (result.paymentIntent.status === 'succeeded') {
//             form.submit();
//         }
//     }
//   });
// }).fail(function () {
//     // just reload page to show error message from django
//     location.reload();
// })
// });
