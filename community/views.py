from django.shortcuts import render, redirect, reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from .models import CustomGroup, GroupSelect
from profiles.models import UserProfile, User, HeroLevels
from workouts.models import Workout, Log, MemberComment
# from workouts.views import getGroupSelection
from allauth.account.models import EmailAddress
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
import decimal
import random
import urllib.request
import stripe
import json
import statistics
# from workouts.views import id_list, user_list
from django.template import loader
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from profiles.templatetags.calc_functions import calc_age
import math


def roundup(x):
    return int(math.ceil(x / 10)) * 10


def rounddown(x):
    return int(math.floor(x / 10)) * 10


def community(request):
    template = "community/community.html"
    groups = CustomGroup.objects.filter(group_users=request.user)
    age = calc_age(request.user.userprofile.birthdate)
    age_bottom = str(rounddown(age))
    age_top = str(roundup(age))
    age_group = age_bottom + "-" + age_top + " years"
    selected_group = getGroupSelectionUsers(request)
    selected_group_logs = getGroupSelection(request)
    selected_group = selected_group.order_by("-herolevels__general_level")
    group = Paginator(selected_group, 25)
    group = group.page(1)
    members = selected_group.count()
    male = selected_group.filter(userprofile__gender="M").count()
    female = selected_group.filter(userprofile__gender="F").count()
    date_month = date.today() - timedelta(days=30)
    month = selected_group_logs.filter(date__gte=date_month).count()
    average_user = round(month / members)
    average_l = selected_group.aggregate(Avg('herolevels__general_level'))
    average_level = round(average_l['herolevels__general_level__avg'])
    context = {
        'groups': groups,
        'age_group': age_group,
        'group': group,
        'members': members,
        'male': male,
        'female': female,
        'month': month,
        'average_user': average_user,
        'average_level': average_level
        }
    return render(request, template, context)


@csrf_exempt
def setGroupSelect(request):
    if request.is_ajax:
        age = request.POST["age"]
        custom = request.POST["custom"]
        location = request.POST["location"]
        group_select = {"age": age, "custom": custom, "location": location}
        try:
            user_select = GroupSelect.objects.filter(user=request.user)
            user_select.update(group=group_select)
        except GroupSelect.DoesNotExist:
            user_select = GroupSelect.objects.create(user=request.user, group=group_select)
        data = {"message": "Success"}
    return JsonResponse(data)



# @csrf_exempt
# def popGroup(request):
#     group = CustomGroup.objects.get(id=1)
#     users = User.objects.all()[1:25]
#     user_list = []
#     user_upload =[]
#     for user in users:
#         group.group_users.add(user)
#         user_list.append(user.username)
#     for user in group.group_users.all():
#         user_upload.append(user.username)
#     data = {"message": user_list, "upload": user_upload, "group": group.name}
#     return JsonResponse(data)

def getGroupSelection(request):
     # Determine group selection
    group_s = GroupSelect.objects.get(user=request.user)
    group_select = group_s.group
    if group_select["custom"] == 'false':
        print("HERE")
        if group_select["location"] == "group-global":
            print("GLOBAL")
            select_group_logs = Log.objects.all()
        elif group_select["location"] == "group-country":
            print("COUNTRY")
            select_group_logs = Log.objects.filter(user__userprofile__country=request.user.userprofile.country)
        else:
            print("CITY")
            select_group_logs = Log.objects.filter(user__userprofile__town_or_city=request.user.userprofile.town_or_city)
        if group_select["age"] != 'false':
            print("AGE")
            age = calc_age(request.user.userprofile.birthdate)
            age_bottom = rounddown(age)
            age_top = roundup(age)
            young_age_date = date.today() - timedelta(days=age_bottom*365)
            old_age_date = date.today() - timedelta(days=age_top*365)
            select_group_logs = select_group_logs.filter(user__userprofile__birthdate__gt=old_age_date).filter(user__userprofile__birthdate__lte=young_age_date)
    else:
        print("CUSTOM")
        custom_group = CustomGroup.objects.get(pk=group_select["custom"])
        user_group = custom_group.group_users.all()
        select_group_logs = Log.objects.filter(user__in=user_group)
    return select_group_logs


def getGroupSelectionUsers(request):
     # Determine group selection
    group_s = GroupSelect.objects.get(user=request.user)
    group_select = group_s.group
    if group_select["custom"] == 'false':
        if group_select["location"] == "group-global":
            select_group_users = User.objects.all()
        elif group_select["location"] == "group-country":
            select_group_users = User.objects.filter(userprofile__country=request.user.userprofile.country)
        else:
            select_group_users = User.objects.filter(userprofile__town_or_city=request.user.userprofile.town_or_city)
        if group_select["age"] != 'false':
            age = calc_age(request.user.userprofile.birthdate)
            age_bottom = rounddown(age)
            age_top = roundup(age)
            young_age_date = date.today() - timedelta(days=age_bottom*365)
            old_age_date = date.today() - timedelta(days=age_top*365)
            select_group_users = select_group_users.filter(userprofile__birthdate__gt=old_age_date).filter(userprofile__birthdate__lte=young_age_date)
    else:
        print("CUSTOM")
        custom_group = CustomGroup.objects.get(pk=group_select["custom"])
        user_group = custom_group.group_users.all()
        select_group_users = user_group
    return select_group_users


@csrf_exempt
def resetStats(request):
    selected_group = getGroupSelectionUsers(request)
    selected_group_logs = getGroupSelection(request)
    selected_group = selected_group.order_by("-herolevels__general_level")
    group = Paginator(selected_group, 25)
    group = group.page(1)
    members = selected_group.count()
    male = selected_group.filter(userprofile__gender="M").count()
    female = selected_group.filter(userprofile__gender="F").count()
    date_month = date.today() - timedelta(days=30)
    month = selected_group_logs.filter(date__gte=date_month).count()
    average_user = round(month / members)
    average_l = selected_group.aggregate(Avg('herolevels__general_level'))
    average_level = round(average_l['herolevels__general_level__avg'])
    stats_html = loader.render_to_string(
        'community/includes/groupstats.html',
        {
        'members': members,
        'male': male,
        'female': female,
        'month': month,
        'average_user': average_user,
        'average-level': average_level
        }
    )
    members_html = loader.render_to_string(
        'community/includes/groupmembers.html',
        {
        'group': group,
        }
    )
    # package output data and return it as a JSON object
    output_data = {
        'stats_html': stats_html,
        'members_html': members_html,
    }
    return JsonResponse(output_data)
