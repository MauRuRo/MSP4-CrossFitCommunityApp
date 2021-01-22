from django.shortcuts import render, redirect, reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from .models import CustomGroup, GroupSelect
from .forms import CustomGroupForm
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
    groups1 = CustomGroup.objects.filter(group_users=request.user).filter(share=True).exclude(users_delete=request.user)
    groups2 = CustomGroup.objects.filter(admin=request.user).exclude(users_delete=request.user)
    groups = groups1.union(groups2)
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
    admin = False
    group_s = getGroup(request)
    if group_s["custom"] != "false":
        c_group = CustomGroup.objects.get(pk=group_s["custom"])
        admin = c_group.admin
    average_user = round(month / members)
    average_l = selected_group.aggregate(Avg('herolevels__general_level'))
    average_level = round(average_l['herolevels__general_level__avg'])
    form = CustomGroupForm()
    context = {
        'form': form,
        'admin': admin,
        'groups': groups,
        'age_group': age_group,
        'group': group,
        'has_next': group.has_next(),
        'members': members,
        'male': male,
        'female': female,
        'month': month,
        'average_user': average_user,
        'average_level': average_level
        }
    return render(request, template, context)


# @csrf_exempt
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
    try:
        group_s = GroupSelect.objects.get(user=request.user)
        group_select = group_s.group
    except GroupSelect.DoesNotExist:
        group_select = {"age": "false", "custom": "false", "location": "group-global"}
        gs_obj = GroupSelect.objects.create(user=request.user, group=group_select)
    if group_select["custom"] == 'false':
        if group_select["location"] == "group-global":
            select_group_logs = Log.objects.all()
        elif group_select["location"] == "group-country":
            select_group_logs = Log.objects.filter(user__userprofile__country=request.user.userprofile.country)
        else:
            select_group_logs = Log.objects.filter(user__userprofile__town_or_city=request.user.userprofile.town_or_city)
        if group_select["age"] != 'false':
            age = calc_age(request.user.userprofile.birthdate)
            age_bottom = rounddown(age)
            age_top = roundup(age)
            young_age_date = date.today() - timedelta(days=age_bottom*365)
            old_age_date = date.today() - timedelta(days=age_top*365)
            select_group_logs = select_group_logs.filter(user__userprofile__birthdate__gt=old_age_date).filter(user__userprofile__birthdate__lte=young_age_date)
    else:
        custom_group = CustomGroup.objects.get(pk=group_select["custom"])
        user_group = custom_group.group_users.all()
        select_group_logs = Log.objects.filter(user__in=user_group)
    return select_group_logs


def getGroup(request):
    try:
        group_s = GroupSelect.objects.get(user=request.user)
        group_select = group_s.group
    except GroupSelect.DoesNotExist:
        group_select = {"age": "false", "custom": "false", "location": "group-global"}
        gs_obj = GroupSelect.objects.create(user=request.user, group=group_select)
    return group_select


def getGroupSelectionUsers(request):
    # Determine group selection
    group_select = getGroup(request)
    # try:
    #     group_s = GroupSelect.objects.get(user=request.user)
    #     group_select = group_s.group
    # except GroupSelect.DoesNotExist:
    #     group_select = {"age": "false", "custom": "false", "location": "group-global"}
    #     gs_obj = GroupSelect.objects.create(user=request.user, group=group_select)
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
        custom_group = CustomGroup.objects.get(pk=group_select["custom"])
        user_group = custom_group.group_users.all()
        select_group_users = user_group
    return select_group_users


# @csrf_exempt
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
    admin = False
    group_s = getGroup(request)
    if group_s["custom"] != "false":
        c_group = CustomGroup.objects.get(pk=group_s["custom"])
        admin = c_group.admin
    average_user = round(month / members)
    average_l = selected_group.aggregate(Avg('herolevels__general_level'))
    average_level = round(average_l['herolevels__general_level__avg'])
    stats_html = loader.render_to_string(
        'community/includes/groupstats.html',
        {
        'admin': admin,
        'members': members,
        'male': male,
        'female': female,
        'month': month,
        'average_user': average_user,
        'average_level': average_level
        }
    )
    members_html = loader.render_to_string(
        'community/includes/groupmembers.html',
        {
        'group': group,
        }
    )
    output_data = {
        'stats_html': stats_html,
        'members_html': members_html,
        'has_next': group.has_next(),
    }
    return JsonResponse(output_data)


# @csrf_exempt
def lazyLoadGroup(request):
    selected_group = getGroupSelection(request)
    no_page = False
    page = request.POST["page"]
    selected_group = getGroupSelectionUsers(request)
    selected_group = selected_group.order_by("-herolevels__general_level")
    group = Paginator(selected_group, 25)
    # group = group.page(page)
    try:
        group = group.page(page)
    except PageNotAnInteger:
        group = group.page(2)
    except EmptyPage:
        print("ERROR LAST PAGE")
        group = group.page(group.num_pages)
        no_page = True
    calling_group_html = loader.render_to_string(
        'community/includes/groupmembersextra.html',
        {
        'group': group
        }
    )
    output_data = {
        'calling_group_html': calling_group_html,
        'has_next': group.has_next(),
        "no_page": no_page
    }
    return JsonResponse(output_data)


# @csrf_exempt
def searchMember(request):
    make = json.loads(request.POST["make"])
    print(make)
    if make:
        selected_group = User.objects.all()
    else:
        selected_group = getGroupSelectionUsers(request)
    searchtext = request.POST["input"]
    search_group = []
    for user in selected_group:
        name = user.userprofile.full_name.lower()
        if searchtext in name:
            search_group.append(user)
    calling_group_html = loader.render_to_string(
        'community/includes/groupmembersearch.html',
        {
        'group': search_group
        }
        )
    output_data = {
        'calling_group_html': calling_group_html,
    }
    return JsonResponse(output_data)


# @csrf_exempt
def makeGroup(request):
    if request.is_ajax:
        admin = request.user
        groupname = request.POST["groupname"]
        sharegroup = json.loads(request.POST["sharegroup"])
        groupmembers = json.loads(request.POST["groupmembers"])
        members = []
        for member in groupmembers:
            user = User.objects.get(pk=member)
            members.append(user)
        members.append(request.user)
        new_group = CustomGroup.objects.create(admin=admin, name=groupname, share=sharegroup)
        new_group.group_users.set(members)
        # return redirect(reverse('community'))
        data={"message":"Success"}
        return JsonResponse(data)

@csrf_exempt
def getGroupEditInfo(request):
    if request.is_ajax:
        group_id = request.POST["group_id"]
        group = CustomGroup.objects.get(pk=group_id)
        group_name = group.name
        group_share = group.share
        group_members = []
        for member in group.group_users.all():
            m_name = member.userprofile.full_name
            m_id = member.pk
            member = {"name": m_name, "id": m_id}
            group_members.append(member)
        group_members=json.dumps(group_members)
        data = {
            "group_name": group_name,
            "group_share": group_share,
            "group_members": group_members
        }
        return JsonResponse(data)


def editGroup(request):
    if request.is_ajax:
        group_id = request.POST["group_id"]
        groupname = request.POST["groupname"]
        sharegroup = json.loads(request.POST["sharegroup"])
        groupmembers = json.loads(request.POST["groupmembers"])
        members = []
        for member in groupmembers:
            user = User.objects.get(pk=member)
            members.append(user)
        members.append(request.user)
        edit_group = CustomGroup.objects.get(pk=group_id)
        edit_group.name = groupname
        edit_group.share = sharegroup
        edit_group.group_users.set(members)
        edit_group.save()
        data={"message":"Success"}
        return JsonResponse(data)


def deleteGroup(request):
    if request.is_ajax:
        user = request.user
        group_id = request.POST["group_id"]
        group = CustomGroup.objects.get(pk=group_id)
        group.users_delete.add(user)
        users_delete = group.users_delete.all()
        group_users = group.group_users.all()
        delete = True
        for user in group_users:
            if not user in users_delete:
                delete = False
                break
        if delete:
            group.delete()        
        data={"message":"Success"}
        return JsonResponse(data)