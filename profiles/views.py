from django.shortcuts import render, redirect, reverse
from django.http import HttpResponse, HttpResponseRedirect
from .models import UserProfile, User, HeroLevels
from workouts.models import Workout, Log
from .forms import UserProfileForm
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.conf import settings
from datetime import date, datetime, timedelta
from django.template import loader
from django.http import JsonResponse
from notifications.models import Notification
import stripe
import json
import statistics


@require_POST
def cache_payment_create_profile(request):
    try:
        pid = request.POST.get('client_secret').split('_secret')[0]
        print("pid:", pid)
        stripe.api_key = settings.STRIPE_SECRET_KEY
        print("seckey:", stripe.api_key)
        stripe.PaymentIntent.modify(pid, metadata={
            'user': request.user.pk,
            'email': request.user.email,
            'full_name': request.POST["full_name"],
            'town_or_city': request.POST["town_or_city"],
            'country': request.POST["country"],
            'gender': request.POST["gender"],
            'weight': request.POST["weight"],
            'birthdate': request.POST["birthdate"]
        })
        return HttpResponse(status=200)
    except Exception as e:
        print("FAILED THE CACHE")
        messages.error(request, 'Sorry, your payment cannot be \
            processed right now. Please try again later.')

        return HttpResponse(content=e, status=400)


def profile(request):
    """ a view to render the profile page, incl edit profileform"""
    if not request.user.is_authenticated:
        return render(request, 'home/index.html')
    try:
        # Get all info needed to render Profile Page
        profile = UserProfile.objects.get(user=request.user)
        template = 'profiles/profile.html'
        profile = UserProfile.objects.get(user=request.user)
        form = UserProfileForm(instance=profile)
        hero_levels = HeroLevels.objects.get(user=request.user)
        level_data = hero_levels.level_data
        general_level = hero_levels.general_level
        cat_levels = level_data
        # Calculate user Stats.
        year_date = date.today() - timedelta(days=365)
        month_date = date.today() - timedelta(days=30)
        week_date = date.today() - timedelta(days=7)
        user_logs_year = Log.objects.filter(
            user=request.user
            ).filter(date__gt=year_date).count()
        user_logs_month = Log.objects.filter(
            user=request.user
            ).filter(date__gt=month_date).count()
        user_logs_week = Log.objects.filter(
            user=request.user
            ).filter(date__gt=week_date).count()
        pry = Log.objects.filter(user=request.user).filter(
            date__gt=year_date
            ).filter(personal_record=True).count()
        prm = Log.objects.filter(user=request.user).filter(
            date__gt=month_date
            ).filter(personal_record=True).count()
        prw = Log.objects.filter(user=request.user).filter(
            date__gt=week_date
            ).filter(personal_record=True).count()
        if (user_logs_year/12) > user_logs_month or user_logs_month == 0:
            perf_month = "low"
        else:
            perf_month = "high"
        if (user_logs_year/52) > user_logs_week or user_logs_week == 0:
            perf_week = "low"
        else:
            perf_week = "high"
        context = {
            'profile': profile,
            'form': form,
            'cat_levels': cat_levels,
            'general_level': general_level,
            "year": user_logs_year,
            "month": user_logs_month,
            "week": user_logs_week,
            "perfm": perf_month,
            "perfw": perf_week,
            "pry": pry,
            "prm": prm,
            "prw": prw
        }
        return render(request, template, context)
    except UserProfile.DoesNotExist:
        # If profile does not exist redirect to create_profile page.
        return redirect(reverse('create_profile'))


def create_profile(request):
    """A view to render the create profile page
    AND on POST upload a profile object to the database."""
    stripe_public_key = settings.STRIPE_PUBLIC_KEY
    stripe_secret_key = settings.STRIPE_SECRET_KEY
    if request.user.is_authenticated:
        if request.method == "GET":
            if UserProfile.objects.filter(user=request.user).exists():
                messages.error(request, 'Your profile is already created.')
                return redirect(reverse('profile'))
            else:
                profile_form = UserProfileForm()
                # Set price for creating profile.
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
            # Get form data and create new UserProfile object.
            profile_form = UserProfileForm(request.POST, request.FILES)
            if profile_form.is_valid() and request.POST['date'] != '':
                pid = request.POST.get('client_secret').split('_secret')[0]
                new_profile = profile_form.save(commit=False)
                if not new_profile.image:
                    new_profile.image = 'media/noprofpic.jpg'
                new_profile.birthdate = datetime.strptime(
                    request.POST.get('date'),
                    "%d %b %Y"
                    )
                new_profile.stripe_pid = pid
                new_profile.email = request.user.email
                new_profile.user = request.user
                new_profile.save()
                createDefaultHeroLevels(request.user)
                messages.success(
                    request,
                    'Profile succesfully created and payment succesfully processed! \
                Please explore and enjoy our digital hero community!')
                return redirect(reverse('profile'))
            else:
                messages.error(request, 'There was an error with your form. \
                    Please double check your information.')
                return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
    else:
        return render(request, 'home/index.html')


def createDefaultHeroLevels(user):
    """A function to create the default levels for a new user."""
    hero_l = HeroLevels()
    hero_l.user = user
    hero_l.general_level = 0
    # Set default level data for new Profile.
    default_wodlevel = [{
        "wod": "none", "wodperc": "none", "wodpk": 0
        }]
    hero_l.level_data = [
        {"cat": "Power Lifts", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel},
        {"cat": "Olympic Lifts", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel},
        {"cat": "Body Weight", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel},
        {"cat": "Heavy", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel},
        {"cat": "Light", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel},
        {"cat": "Long", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel},
        {"cat": "Speed", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel},
        {"cat": "Endurance", "perc": "none", "acc": "none",
            "wod_level": default_wodlevel}
    ]
    hero_l.save()


@require_POST
def edit_profile(request):
    """A function that edits a UserProfile object."""
    if request.user.is_authenticated and hasattr(request.user, 'userprofile'):
        instance = UserProfile.objects.get(user=request.user)
        profile_form = UserProfileForm(
            request.POST, request.FILES,
            instance=instance
            )
        if profile_form.is_valid():
            edited_profile = profile_form.save(commit=False)
            if not edited_profile.image:
                edited_profile.image = 'media/noprofpic.jpg'
            edited_profile.email = request.user.email
            edited_profile.user = request.user
            edited_profile.save()
            messages.success(request, 'Profile succesfully updated!')
            return redirect(reverse('profile'))
        else:
            messages.error(request, 'There was an error with your form. \
                Please double check your information.')
        return redirect('profile')


def cat_levels_info(percentiles, cat_levels, cat, wod_level, wod_cat):
    """A helper function that returns Level information for a category"""
    # Determine accuracy of averages dependent
    # on amount of logs.
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
    cat_levels.append({
        "cat": cat, "perc": avg_percentile,
        "acc": accuracy, "wod_level": wod_level
        })
    return cat_levels


@require_POST
def calc_level(request):
    print("PROFILE CALC")
    """A function that calculates and returns Levels, per WOD,
    per Category and General,
    incl. the relevant results and the accuracy of the assesment."""
    if request.is_ajax() and request.user.is_authenticated and hasattr(request.user, 'userprofile'):
        # Determine for which user the levels need to be calculated
        if request.POST["user"] == "request":
            user = request.user
        else:
            user = User.objects.get(pk=request.POST["user"])
        # loop through workouts to calculate level per workout and category.
        workouts = Workout.objects.all().order_by("workout_category")
        cat_levels = []
        percentiles = []
        wod_level = []
        cat = ''
        for wod in workouts:
            wod_cat = wod.get_workout_category_display()
            if cat == '':
                cat = wod_cat
            elif cat != wod_cat:
                # If different cat then determine avg level for category
                # and reset lists for the loop.
                cat_levels = cat_levels_info(
                    percentiles, cat_levels, cat, wod_level, wod_cat
                    )
                percentiles = []
                wod_level = []
                cat = wod_cat
            data = getLevels(user, wod)
            percentile = data["percentile"]
            result = data["result"]
            if percentile is not None:
                wod_level.append({
                    "wod": wod.workout_name,
                    "wodperc": percentile,
                    "wodpk": wod.pk,
                    "result": result
                    })
                percentiles.append(percentile)
        cat_levels = cat_levels_info(
            percentiles, cat_levels, cat, wod_level, wod_cat
            )
        # Get category levels to determine general level average.
        avg_list = []
        for item in cat_levels:
            if item["perc"] != "none":
                avg_list.append(item["perc"])
        if len(avg_list) != 0:
            general_level = round(statistics.mean(avg_list))
        else:
            general_level = 0
        # Update HeroLevel Object.
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
        return JsonResponse(data)
    else:
        data = {"message": "Failed update"}
        return HttpResponse(json.dumps(data), content_type='application/json')


def getLevels(user, wod):
    """A helper function which returns the Level of
    a user for a particular workout and the relevant result."""
    # Check which date is exactly a year ago
    lapse_date = date.today() - timedelta(days=365)
    logcount = Log.objects.filter(
        user=user, workout=wod, rx=True, date__gt=lapse_date).count()
    # If no logs for this workout and this user then skip rest of function.
    if logcount == 0:
        percentile = None
        user_result = None
        data = {
            "percentile": percentile,
            "result": user_result
        }
        return data
    else:
        # Determine workout type.
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
        # Get query of relevant logs.
        all_logs = Log.objects.filter(
            user__userprofile__gender=user.userprofile.gender,
            workout=wod, rx=True,
            date__gt=lapse_date).order_by(f'{rank_result_order}')
        all_logs_l = list(all_logs.values())
        log_id_list = []
        log_user_id_list = []
        user_result = ''
        user_index = False
        result_index = False
        # Determine rank position of user,
        # count members with better results,
        # determine level for this workout.
        for log in all_logs_l:
            if not log["user_id"] in log_user_id_list:
                log_user_id_list.append(log["user_id"])
                log_id_list.append(log)
                # If the log is for the requested user
                # then get indexes and result
                if log["user_id"] == user.pk:
                    user_result = str(log[f'{rank_result}'])
                    user_index = log_id_list.index(log)
                # Get the index of the first result
                # that's BETTER than the users result.
                if ft and user_index and result_index is False:
                    for log in reversed(log_id_list):
                        nextresult = log["ft_result"]
                        userresult = log_id_list[user_index]["ft_result"]
                        if nextresult < userresult:
                            result_index = log_id_list.index(log)
                            break
                elif user_index and result_index is False:
                    for log in reversed(log_id_list):
                        nextresult = log[f'{rank_result}']
                        userresult = log_id_list[user_index][f'{rank_result}']
                        if nextresult > userresult:
                            result_index = log_id_list.index(log)
                            break
        if result_index is False:
            result_index = 0
        # result_index += 1
        total_results = len(log_id_list)
        percentile = round(
            (total_results - result_index) / total_results * 100
            )
        # Adjust format of results, depending on type.
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
        return data


@require_POST
def markAsRead(request):
    if request.user.is_authenticated and request.is_ajax:
        note_id = request.POST["note_id"]
        note = Notification.objects.filter(pk=note_id)
        note.mark_all_as_read()
        data = {"message": "Success"}
        return JsonResponse(data)
