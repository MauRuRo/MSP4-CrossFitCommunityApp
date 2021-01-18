from django.shortcuts import render, redirect, reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from .models import CustomGroup, GroupSelect
from profiles.models import UserProfile, User, HeroLevels
from workouts.models import Workout, Log, MemberComment
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
    context = {
        'groups': groups,
        'age_group': age_group
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