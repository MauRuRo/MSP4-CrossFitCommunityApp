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
    email = request.user.email
    try:
        # profile = get_object_or_404(UserProfile, user=request.user)
        profile = UserProfile.objects.get(user=request.user)
        form = UserProfileForm(instance=profile)
        template = 'profiles/profile.html'
        context = {
            'form': form,
            'email': email,
        }
        return render(request, template, context)
    except UserProfile.DoesNotExist:
        return redirect(reverse('create_profile'))


def create_profile(request):
    stripe_public_key = settings.STRIPE_PUBLIC_KEY
    stripe_secret_key = settings.STRIPE_SECRET_KEY

    if request.method == "GET":
        if UserProfile.objects.get(user=request.user):
            messages.warning(request, 'Your profile is already created.')
            return redirect(reverse('profile'))
        else:
            profile_form = UserProfileForm()
            stripe_total = 999
            stripe.api_key = stripe_secret_key
            intent = stripe.PaymentIntent.create(
                amount=stripe_total,
                currency=settings.STRIPE_CURRENCY,
            )
            template = 'profiles/create_profile.html'
            context = {
                'form': profile_form,
                'stripe_public_key': stripe_public_key,
                'client_secret': intent.client_secret,
            }
            if not stripe_public_key:
                messages.warning(request, 'Stripe public key is missing. \
                Did you forget to set it in your environment?')

            return render(request, template, context)
    else:
        # form_data = {
        #     'full_name': request.POST['full_name'],
        #     'town_or_city': request.POST['town_or_city'],
        #     'country': request.POST['country'],
        #     'gender': request.POST['gender'],
        #     'weight': request.POST['weight'],
        #     'age': request.POST['age'],
        #     'image': request.POST['image']
        # }
        profile_form = UserProfileForm(request.POST, request.FILES)
        if profile_form.is_valid():
            pid = request.POST.get('client_secret').split('_secret')[0]
            new_profile = profile_form.save(commit=False)
            # user_profile = UserProfileForm(user=request.user, stripe_pid=pid, email=request.user.email, **form_data, **request.FILES)
            new_profile.stripe_pid = pid
            new_profile.email = request.user.email
            new_profile.user = request.user
            new_profile.save()
            # user_profile = UserProfile(**form_data, **request.FILES, user=request.user, stripe_pid=pid, email=request.user.email)
            # user_profile.save()
                # user=request.user,
                # full_name=form_data.full_name,
                # town_or_city=
                # )
            # user_profile = UserProfile(form_data).save
            # user_profile = profile_form.save(commit=False)
                # user_profile.user = request.user
                # user_profile.stripe_pid = pid
                # user_profile.email = request.user.email
            # UserProfile.objects.create(user=instance)
            # user_profile.save()
            # Save the info to the user's profile if all is well
            # request.session['save_info'] = 'save-info' in request.POST
            # messages.success(request, f'Profile succesfully created and payment succesfully processed! \
            # Please explore and enjoy our digital hero community!')
            return redirect(reverse('profile'))
        else:
            messages.error(request, 'There was an error with your form. \
                Please double check your information.')     

        # return render(request, template, context)


# def creation_success(request, order_number):
#     """
#     Handle successful profile creation
#     """
#     messages.success(request, f'Profile succesfully created and payment succesfully processed! \
#         Please explore and enjoy our digital hero community!')

#     template = 'checkout/checkout_success.html'

#     return render(request, template)