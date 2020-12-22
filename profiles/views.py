from django.shortcuts import (
    render, redirect, reverse, get_object_or_404, HttpResponse
)
from .models import UserProfile
from .forms import UserProfileForm
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.conf import settings

import stripe
import json


# @require_POST
# def cache_payment_create_profile(request):
#     try:
#         pid = request.POST.get('client_secret').split('_secret')[0]
#         stripe.api_key = settings.STRIPE_SECRET_KEY
#         stripe.PaymentIntent.modify(pid, metadata={
#             'username': request.user,
#         })
#         return HttpResponse(status=200)
#     except Exception as e:
#         messages.error(request, 'Sorry, your payment cannot be \
#             processed right now. Please try again later.')

#         return HttpResponse(content=e, status=400)


def profile(request):
    """ a view to render the home page """
    try:
        # profile = get_object_or_404(UserProfile, user=request.user)
        profile = UserProfile.objects.get(user=request.user)
        form = UserProfileForm(instance=profile)
        template = 'profiles/profile.html'
    except UserProfile.DoesNotExist:
        form = UserProfileForm()
        template = 'profiles/create_profile.html'
    
    email = request.user.email

    context = {
        'form': form,
        'email': email,
    }

    return render(request, template, context)


def create_profile(request):
    profile_form = UserProfileForm()
    template = 'profiles/create_profile.html'
    context = {
        'form': profile_form,
        'stripe_public_key': 'pk_test_51HsDgjDkrpalIwBc7BEDcca6MTlERYinria7OXBUoKsGDYEqsFGJIzQrsAZgIbwy0r7H8xckVrwnN55KUZi7UKVx00YYVxm0aD',
        'client_secret': 'test client secret',
    }

    return render(request, template, context)

    # """ a view to render the home page """
    # stripe_public_key = 'pk_test_51HsDgjDkrpalIwBc7BEDcca6MTlERYinria7OXBUoKsGDYEqsFGJIzQrsAZgIbwy0r7H8xckVrwnN55KUZi7UKVx00YYVxm0aD'
    # # settings.STRIPE_PUBLIC_KEY
    # stripe_secret_key = settings.STRIPE_SECRET_KEY

    # if request.method == "GET":
    #     form = UserProfileForm()

    #     stripe_total = 999
    #     stripe.api_key = stripe_secret_key
    #     intent = stripe.PaymentIntent.create(
    #         amount=stripe_total,
    #         currency=settings.STRIPE_CURRENCY,
    #     )

    #     template = 'profiles/create_profile.html'
    #     context = {
    #         'form': form,
    #         'stripe_public_key': stripe_public_key,
    #         'client_secret': intent.client_secret,
    #     }

    #     if not stripe_public_key:
    #         messages.warning(request, 'Stripe public key is missing. \
    #         Did you forget to set it in your environment?')

    #     return render(request, template, context)
    # else:
    #     form_data = {
    #         'full_name': request.POST['full_name'],
    #         'email': request.POST['email'],
    #         'town_or_city': request.POST['town_or_city'],
    #         'country': request.POST['country'],
    #         'gender': request.POST['gender'],
    #         'weight': request.POST['weight'],
    #         'age': request.POST['age'],
    #         'image': request.POST['image']
    #     }
    #     user_profile_form = UserProfileForm(form_data)
    #     if user_profile_form.is_valid():
    #         user_profile = user_profile_form.save(commit=False)
    #         pid = request.POST.get('client_secret').split('_secret')[0]
    #         user_profile.stripe_pid = pid
    #         user_profile.user = request.user
    #         user_profile.save()
    #         # Save the info to the user's profile if all is well
    #         # request.session['save_info'] = 'save-info' in request.POST
    #         return redirect(reverse('checkout_success'))
    #     else:
    #         messages.error(request, 'There was an error with your form. \
    #             Please double check your information.')     

    # return render(request, template, context)