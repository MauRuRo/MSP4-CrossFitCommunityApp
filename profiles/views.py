from django.shortcuts import (
    render, redirect, reverse
)
from django.http import HttpResponse, HttpResponseRedirect, Http404
from .models import UserProfile, User
from allauth.account.models import EmailAddress
from .forms import UserProfileForm
from django.views.decorators.http import require_POST
from django.core.files import File
from django.contrib import messages
from django.conf import settings
from datetime import date, datetime
from django.core.exceptions import ValidationError
import decimal
import random
import urllib.request
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
    """ a view to render the profile page """
    try:
        profile = UserProfile.objects.get(user=request.user)
        template = 'profiles/profile.html'
        context = {
            'profile': profile,
        }
        return render(request, template, context)
    except UserProfile.DoesNotExist:
        return redirect(reverse('create_profile'))


def create_profile(request):
    stripe_public_key = settings.STRIPE_PUBLIC_KEY
    stripe_secret_key = settings.STRIPE_SECRET_KEY

    if request.method == "GET":
        if UserProfile.objects.filter(user=request.user).exists():
            messages.error(request, 'Your profile is already created.')
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
        profile_form = UserProfileForm(request.POST, request.FILES)
        if profile_form.is_valid() and request.POST['date'] != '':
            pid = request.POST.get('client_secret').split('_secret')[0]
            new_profile = profile_form.save(commit=False)
            new_profile.birthdate = datetime.strptime(request.POST.get('date'), "%d %b %Y")
            new_profile.stripe_pid = pid
            new_profile.email = request.user.email
            new_profile.user = request.user
            new_profile.save()
            messages.success(request, 'Profile succesfully created and payment succesfully processed! \
            Please explore and enjoy our digital hero community!')
            return redirect(reverse('profile'))
        else:
            messages.error(request, 'There was an error with your form. \
                Please double check your information.')
            return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

def edit_profile(request):
    if request.method == "GET":

        if request.user.is_authenticated:
            if not UserProfile.objects.filter(user=request.user).exists():
                messages.error(request, 'You need to create a profile first!')
                return redirect(reverse('create_profile'))
        else:
            messages.error(request, 'You need to sign in or sign up first!')
            return redirect(reverse('account_login'))

        profile = UserProfile.objects.get(user=request.user)
        profile_form = UserProfileForm(instance=profile)
        template = 'profiles/edit_profile.html'
        context = {
            'form': profile_form,
        }
        return render(request, template, context)

    else:
        instance = UserProfile.objects.get(user=request.user)
        profile_form = UserProfileForm(request.POST, request.FILES, instance=instance)

        if profile_form.is_valid():
            edited_profile = profile_form.save(commit=False)
            edited_profile.email = request.user.email
            edited_profile.user = request.user
            edited_profile.save()
            messages.success(request, 'Profile succesfully updated!')
            return redirect(reverse('profile'))
        else:
            messages.error(request, 'There was an error with your form. \
                Please double check your information.')

        return redirect('edit_profile')


def test(request):
    print("MADE IT TO TEST VIEW")
    if request.is_ajax() and request.POST:
        msg = "This was the message: " + request.POST.get('test')
        data = {"message": msg}
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        raise Http404


# def populate(request):
#     print("populating")
#     # if request.is_ajax() and request.POST:
#     print("TEST")
#     f = open("userpopulate.json", "w")
#     print("Test2")
#     # print(request.POST["printout"])
#     printout = request.POST["printout"]
#     print("Test3")
#     f.write(request.POST["printout"])
#     f.close()
#     return redirect('edit_profile')

def populate(request):
    f = open("static/userpopulate.txt")
    file = json.load(f)

    for item in file["results"]:
        firstname = item["name"]["first"]
        lastname = item["name"]["last"]
        username = item["login"]["username"]
        password = item["login"]["password"]
        full_name = firstname + " " + lastname
        town_or_city = item["location"]["city"]
        country = item["nat"]
        email = item["email"]
        birthday = item["dob"]["date"][0:10]
        gender = item["gender"].title()
        # firstname = file["results"][0]["name"]["first"]
        # lastname = file["results"][0]["name"]["last"]
        # username = file["results"][0]["login"]["username"]
        # password = file["results"][0]["login"]["password"]
        # full_name = firstname + " " + lastname
        # town_or_city = file["results"][0]["location"]["city"]
        # country = file["results"][0]["nat"]
        # email = file["results"][0]["email"]
        # birthday = file["results"][0]["dob"]["date"][0:9]
        # gender = file["results"][0]["gender"].title()
        if gender == "Male":
            gender = "M"
            weight = 60 + decimal.Decimal(random.randrange(0, 50))
        else:
            gender = "F"
            weight = 40 + decimal.Decimal(random.randrange(0, 40))
        # image_url = file["results"][0]["picture"]["large"]
        image_url = item["picture"]["large"]
        result = urllib.request.urlretrieve(image_url)
        userdata={
            "username":username,
            "password":password,
        }
        newuser = User.objects.create(username=username)
        newuser.password = password
        newuser.save()
        newuserprofile = UserProfile.objects.create(user=newuser, weight=weight)
        newuserprofile.full_name = full_name
        newuserprofile.email = email
        newuserprofile.town_or_city = town_or_city
        newuserprofile.country = country
        newuserprofile.gender = gender
        newuserprofile.birthdate = birthday
        newuserprofile.weight = weight
        newuserprofile.save()
        with open(result[0], 'rb') as d_image:
            newuserprofile.image.save(f'media/{username}.jpg', File(d_image))
        newemail = EmailAddress.objects.create(user=newuser)
        newemail.email = email
        newemail.verified = True
        newemail.primary = True
        newemail.save()
    return redirect('profile')
