from django.shortcuts import render, redirect, reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from .models import UserProfile, User, HeroLevels
from workouts.models import Workout, Log, MemberComment
from allauth.account.models import EmailAddress
from .forms import UserProfileForm
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.files import File
from django.contrib import messages
from django.conf import settings
from datetime import date, datetime, timedelta
from django.core.exceptions import ValidationError
from django.db.models import Avg, Max, Min, Sum
from django.template import loader
from django.http import Http404, HttpResponse, JsonResponse
from asgiref.sync import sync_to_async
import decimal
import random
import urllib.request
import stripe
import json
import statistics
from workouts.views import id_list
from django.template import loader
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .templatetags.calc_functions import calc_age
from asgiref.sync import sync_to_async
import asyncio
import time
from multiprocessing import Process, Manager
from threading import Thread

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
    if not request.user.is_authenticated:
        return render(request, 'home/index.html')
    try:
        profile = UserProfile.objects.get(user=request.user)
        template = 'profiles/profile.html'
        profile = UserProfile.objects.get(user=request.user)
        form = UserProfileForm(instance=profile)
        # cat_levels = calc_level(request.user)
        hero_levels = HeroLevels.objects.get(user=request.user)
        # print(hero_levels)
        level_data = hero_levels.level_data
        general_level = hero_levels.general_level
        # print(level_data)
        cat_levels = level_data
        categories = ["Power Lifts", "Olympic Lifts", "Body Weight", "Heavy", "Light", "Long", "Speed", "Endurance"]
        year_date = date.today() - timedelta(days=365)
        month_date = date.today() - timedelta(days=30)
        week_date = date.today() - timedelta(days=7)
        user_logs_year = Log.objects.filter(user=request.user).filter(date__gt=year_date).count()
        user_logs_month = Log.objects.filter(user=request.user).filter(date__gt=month_date).count()
        user_logs_week = Log.objects.filter(user=request.user).filter(date__gt=week_date).count()
        pry = Log.objects.filter(user=request.user).filter(date__gt=year_date).filter(personal_record=True).count()
        prm = Log.objects.filter(user=request.user).filter(date__gt=month_date).filter(personal_record=True).count()
        prw = Log.objects.filter(user=request.user).filter(date__gt=week_date).filter(personal_record=True).count()
        if (user_logs_year/12) > user_logs_month:
            perf_month = "low"
        else:
            perf_month = "high"
        if (user_logs_year/52) > user_logs_week:
            perf_week = "low"
        else:
            perf_week = "high"
        context = {
            'profile': profile,
            'form': form,
            'cat_levels': cat_levels,
            'general_level': general_level,
            'categories': categories,
            "year": user_logs_year,
            "month": user_logs_month,
            "week": user_logs_week,
            "perfm": perf_month,
            "perfw": perf_week     ,
            "pry": pry,
            "prm": prm,
            "prw": prw       
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
            hero_l = HeroLevels()
            hero_l.user = request.user
            hero_l.general_level = 0
            hero_l.level_data = [{"cat": "Power Lifts", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}, {"cat": "Olympic Lifts", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}, {"cat": "Body Weight", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}, {"cat": "Heavy", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}, {"cat": "Light", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}, {"cat": "Long", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}, {"cat": "Speed", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}, {"cat": "Endurance", "perc": "none", "acc": "none", "wod_level": [{"wod": "none", "wodperc": "none", "wodpk": 0}]}]
            hero_l.save()
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


def user_list():
    users = User.objects.all()
    user_l = []
    for user in users:
        user_l.append(user.id)
    user_data = {"user_l": user_l, "users": users}
    return user_data


def cat_levels_info(percentiles, cat_levels, cat, wod_level, wod_cat):
    if len(percentiles) >= 3:
        accuracy = "high"
    elif len(percentiles) == 2:
        accuracy = "medium"
    elif len(percentiles) == 1:
        accuracy = "low"
    else:
        accuracy = "none"
    if accuracy != "none":
        avg_percentile = round(statistics.mean(percentiles))
    else:
        avg_percentile = "none"
    cat_levels.append({"cat": cat, "perc": avg_percentile, "acc": accuracy, "wod_level": wod_level})
    return cat_levels


def calc_level(request):
    start_time = time.time()
    if request.is_ajax():
        print("CHECK")
        #determine for which user the levels need to be calculated
        if request.POST["user"] == "request":
            user = request.user
        else:
            user = User.objects.get(pk=request.POST["user"])
        # create catagory list and 'reverse' dictionary for queries an initialize list for category levels
        categories = ["Power Lifts", "Olympic Lifts", "Body Weight", "Heavy", "Light", "Long", "Speed", "Endurance"]
        cat_reverse = {"Power Lifts": "PL", "Olympic Lifts": "OL", "Body Weight": "BW", "Heavy": "HE", "Light": "LI", "Long": "LO", "Speed": "SP", "Endurance": "EN"}
        cat_levels = []
        # loop through categories to calculate level per category
        workouts = Workout.objects.all().order_by("workout_category")
        percentiles = []
        wod_level = []
        cat = ''
        last_log = False
        for wod in workouts:
            wod_cat = wod.get_workout_category_display()
            if cat == '':
                cat = wod_cat
            elif cat != wod_cat:
                cat_levels = cat_levels_info(percentiles, cat_levels, cat, wod_level, wod_cat)
                percentiles = []
                wod_level = []
                cat = wod_cat
            data = getLevels(user, wod)
            percentile = data["percentile"]
            result = data["result"]
            if percentile is not None:
                wod_level.append({"wod": wod.workout_name, "wodperc": percentile, "wodpk": wod.pk, "result": result})
                percentiles.append(percentile)
        cat_levels = cat_levels_info(percentiles, cat_levels, cat, wod_level, wod_cat)
        print("HALFWAY " + user.username)
        avg_list = []
        for item in cat_levels:
            if item["perc"] != "none":
                avg_list.append(item["perc"])
        if len(avg_list) != 0:
            general_level = round(statistics.mean(avg_list))
        else:
            general_level = 0
        level_data = HeroLevels.objects.filter(user=user)
        level_data.update(level_data=cat_levels)
        level_data.update(general_level=general_level)
        new_levels_html = loader.render_to_string(
        'profiles/includes/herolevel.html',
        {
            "general_level": general_level,
            "cat_levels": cat_levels
        })
        data = {
            'new_levels_html': new_levels_html
        }
        print("SUCCESS "  + user.username)
        total = (time.time() - start_time)
        print("total time: ", total)
        return JsonResponse(data)
    else:
        print("FAILED HERE")
        data = {"message": "Failed update"}
        return HttpResponse(json.dumps(data), content_type='application/json')
        

def getLevels(user, wod):
    start_time = time.time()
    # check which date is exactly a year ago
    lapse_date = date.today() - timedelta(days=365)
    if Log.objects.filter(user=user, workout=wod, rx=True, date__gt=lapse_date).count() == 0:
        percentile = None
        user_result = None
        data = {
        "percentile": percentile,
        "result": user_result
        }
        return data
    else:
        ft = False
        amrap = False
        if wod.workout_type == 'FT':
            ft = True
            rank_result = 'ft_result'
            rank_result_order = 'ft_result'
        elif wod.workout_type == 'AMRAP':
            amrap = True
            rank_result = 'amrap_result'
            rank_result_order = '-amrap_result'
        else:
            rank_result = 'mw_result'
            rank_result_order = '-mw_result'
        all_logs = Log.objects.filter(user__userprofile__gender=user.userprofile.gender, workout=wod, rx=True, date__gt=lapse_date).order_by(f'{rank_result_order}')
        all_logs_l = list(all_logs.values())
        # all_logs_l = all_logs.values_list(flat=True)
        log_id_list =[]
        log_user_id_list = []
        user_result = ''
        user_index = False
        result_index = False
        for log in all_logs_l:
            if not log["user_id"] in log_user_id_list:
                log_user_id_list.append(log["user_id"])
                log_id_list.append(log)
                # If the log is for the requested user then get indexes and result
                if log["user_id"] == user.pk:
                    user_result = str(log[f'{rank_result}'])
                    user_index = log_id_list.index(log)
                # Get the index of the first result that's BETTER than the users result.
                if ft and user_index and result_index == False:
                    for log in reversed(log_id_list):
                        if log["ft_result"] < log_id_list[user_index]["ft_result"]:
                            result_index = log_id_list.index(log)
                            break
                elif user_index and result_index == False:
                    for log in reversed(log_id_list):
                        if log[f'{rank_result}'] > log_id_list[user_index][f'{rank_result}']:
                            result_index = log_id_list.index(log)
                            break
        if result_index == False:
            result_index = 0
        result_index += 1
        total_results = len(log_id_list)
        percentile = round((total_results - result_index)/total_results* 100)
        if ft:
            while user_result[0] == "0" or user_result[0] == ":":
                user_result = user_result[1:]
        else:
            while (user_result[-1] == "0" and "." in user_result) or user_result[-1] == ".":
                user_result = user_result[0:-1]
            if amrap:
                user_result = user_result + " rounds"
            else:
                user_result = user_result + "kg"
        data = {
            "percentile": percentile,
            "result": user_result
            }
        total = (time.time() -  start_time)
        print("single loop time: ", total, wod.workout_name)
        return data

def calc_level_pop(user):
    start_time = time.time()
    # create catagory list and 'reverse' dictionary for queries an initialize list for category levels
    categories = ["Power Lifts", "Olympic Lifts", "Body Weight", "Heavy", "Light", "Long", "Speed", "Endurance"]
    cat_reverse = {"Power Lifts": "PL", "Olympic Lifts": "OL", "Body Weight": "BW", "Heavy": "HE", "Light": "LI", "Long": "LO", "Speed": "SP", "Endurance": "EN"}
    cat_levels = []
    # loop through categories to calculate level per category
    workouts = Workout.objects.all().order_by("workout_category")
    percentiles = []
    wod_level = []
    cat = ''
    last_log = False
    for wod in workouts:
        wod_cat = wod.get_workout_category_display()
        if cat == '':
            cat = wod_cat
        elif cat != wod_cat:
            cat_levels = cat_levels_info(percentiles, cat_levels, cat, wod_level, wod_cat)
            percentiles = []
            wod_level = []
            cat = wod_cat
        data = getLevels(user, wod)
        percentile = data["percentile"]
        result = data["result"]
        if percentile is not None:
            wod_level.append({"wod": wod.workout_name, "wodperc": percentile, "wodpk": wod.pk, "result": result})
            percentiles.append(percentile)
    cat_levels = cat_levels_info(percentiles, cat_levels, cat, wod_level, wod_cat)
    print("HALFWAY " + user.username)
    avg_list = []
    for item in cat_levels:
        if item["perc"] != "none":
            avg_list.append(item["perc"])
    if len(avg_list) != 0:
        general_level = round(statistics.mean(avg_list))
    else:
        general_level = 0
    level_data = HeroLevels.objects.filter(user=user)
    level_data.update(level_data=cat_levels)
    level_data.update(general_level=general_level)


def refreshLevels(request):
    starttime = time.time()
    users = User.objects.all()
    for user in users:
        calc_level_pop(user)
    total = time.time() - starttime
    print("total runtime", total)
