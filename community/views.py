from django.shortcuts import render
from .models import CustomGroup, GroupSelect
from .forms import CustomGroupForm
from profiles.models import User, HeroLevels
from workouts.models import Log
from django.views.decorators.http import require_POST
from datetime import date, timedelta
from django.db.models import Avg
from django.template import loader
from django.http import JsonResponse
import json
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from profiles.templatetags.calc_functions import calc_age
import math


def community(request):
    """A view to render the community page, including makeGroup form."""
    template = "community/community.html"
    groups1 = CustomGroup.objects.filter(group_users=request.user).filter(share=True).exclude(users_delete=request.user)
    groups2 = CustomGroup.objects.filter(admin=request.user).exclude(users_delete=request.user)
    groups = groups1.union(groups2)
    age_group = getAgeGroup(request)
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
    groupname = ''
    if group_s["custom"] != "false":
        c_group = CustomGroup.objects.get(pk=group_s["custom"])
        groupname = c_group.name
        admin = c_group.admin
    else:
        if group_s["location"] == "group-city":
            groupname = request.user.userprofile.town_or_city
        elif group_s["location"] == "group-country":
            groupname = request.user.userprofile.get_country_display()
        else:
            groupname = "global"
        if group_s["age"] == "true":
            groupname = str(groupname) + ' ' + age_group.split(' ')[0]
    average_user = round(month / members)
    average_l = selected_group.aggregate(Avg('herolevels__general_level'))
    average_level = round(average_l['herolevels__general_level__avg'])
    form = CustomGroupForm()
    context = {
        'form': form,
        'groupname': groupname,
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


@require_POST
def setGroupSelect(request):
    """A function to update the GroupSelect object for the user to save the filter settings the user has selected."""
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


def getGroupSelection(request):
    """A function to get the filter selection of the user. Returns all workout logs for members of the selected group."""
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
    """Helper function that gets the selected group of the user. If it doesn't exist it will select and create a default selection."""
    try:
        group_s = GroupSelect.objects.get(user=request.user)
        group_select = group_s.group
    except GroupSelect.DoesNotExist:
        group_select = {"age": "false", "custom": "false", "location": "group-global"}
        gs_obj = GroupSelect.objects.create(user=request.user, group=group_select)
    return group_select


def getGroupSelectionUsers(request):
    """Helper function that returns all the users of the selected group."""
    # Determine group selection
    group_select = getGroup(request)
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

@require_POST
def resetStats(request):
    """A function that will return the statistics for the newly selected group."""
    if request.is_ajax:
        selected_group = getGroupSelectionUsers(request)
        selected_group_logs = getGroupSelection(request)
        selected_group = selected_group.order_by("-herolevels__general_level")
        group = Paginator(selected_group, 25)
        group = group.page(1)
        age_group = getAgeGroup(request)
        members = selected_group.count()
        male = selected_group.filter(userprofile__gender="M").count()
        female = selected_group.filter(userprofile__gender="F").count()
        date_month = date.today() - timedelta(days=30)
        month = selected_group_logs.filter(date__gte=date_month).count()
        admin = False
        group_s = getGroup(request)
        groupname = ''
        if group_s["custom"] != "false":
            c_group = CustomGroup.objects.get(pk=group_s["custom"])
            groupname = c_group.name
            admin = c_group.admin
        else:
            if group_s["location"] == "group-city":
                groupname = request.user.userprofile.town_or_city
            elif group_s["location"] == "group-country":
                groupname = request.user.userprofile.get_country_display()
            else:
                groupname = "global"
            if group_s["age"] == "true":
                groupname = str(groupname) + ' ' + age_group.split(' ')[0]
        average_user = round(month / members)
        average_l = selected_group.aggregate(Avg('herolevels__general_level'))
        average_level = round(average_l['herolevels__general_level__avg'])
        stats_html = loader.render_to_string(
            'community/includes/groupstats.html',
            {
            'groupname': groupname,
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

@require_POST
def lazyLoadGroup(request):
    """A function that will return html to append to the userlist from the queryset of the users in the selected group."""
    if request.is_ajax:
        selected_group = getGroupSelection(request)
        no_page = False
        page = request.POST["page"]
        selected_group = getGroupSelectionUsers(request)
        selected_group = selected_group.order_by("-herolevels__general_level")
        group = Paginator(selected_group, 25)
        try:
            group = group.page(page)
        except PageNotAnInteger:
            group = group.page(2)
        except EmptyPage:
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

@require_POST
def searchMember(request):
    """A function that will return members (in the form of html) that have a partial string match for the search input string."""
    if request.is_ajax:
        make = json.loads(request.POST["make"])
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


@require_POST
def makeGroup(request):
    """A function that will create a CustomGroup object."""
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
        data={"message":"Success"}
        return JsonResponse(data)

@require_POST
def getGroupEditInfo(request):
    """A Function that gets the CustomGroup info and returns it to the Group Edit form."""
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


@require_POST
def editGroup(request):
    """A function to update a CustomGroup object."""
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


@require_POST
def deleteGroup(request):
    """A function to delete a CustomGroup object."""
    if request.is_ajax:
        r_user = request.user
        group_id = request.POST["group_id"]
        group = CustomGroup.objects.get(pk=group_id)
        group.users_delete.add(r_user)
        users_delete = group.users_delete.all()
        group_users = group.group_users.all()
        del_admin = False
        if r_user == group.admin:
            del_admin = True
        delete = True
        for user in group_users:
            if not user in users_delete:
                delete = False
                if del_admin:
                    group.admin = user
                    group.save()
                break
        if group.share == False:
            delete = True
        if delete:
            group.delete()        
        data={"message":"Success"}
        return JsonResponse(data)


@require_POST
def getMemberInfo(request):
    """A function to get Level and Profile info for a member. Returns the information as two different html's."""
    if request.is_ajax:
        member = request.POST["user_id"]
        profile_user = User.objects.get(pk=member)
        profile = profile_user.userprofile
        hero_levels = HeroLevels.objects.get(user__pk=member)
        cat_levels = hero_levels.level_data
        general_level = hero_levels.general_level
        categories = ["Power Lifts", "Olympic Lifts", "Body Weight", "Heavy", "Light", "Long", "Speed", "Endurance"]
        calling_group_html = loader.render_to_string(
        '../../profiles/templates/profiles/includes/herolevel.html',
        {
            'cat_levels': cat_levels,
            'general_level': general_level,
            'categories': categories,
        }
        )
        calling_group_two = loader.render_to_string(
        '../../profiles/templates/profiles/includes/profile_info.html',
        {
            'profile': profile,
        }
        )
    output_data = {
        'calling_group_html': calling_group_html,
        'calling_group_two': calling_group_two,
    }
    return JsonResponse(output_data)


def roundup(x):
    """Helper function to roundup a float."""
    return int(math.ceil(x / 10)) * 10


def rounddown(x):
    """Helper function to rounddown a float."""
    return int(math.floor(x / 10)) * 10


def getAgeGroup(request):
    """Helper function to get the agegroup for the user."""
    age = calc_age(request.user.userprofile.birthdate)
    age_bottom = str(rounddown(age))
    age_top = str(roundup(age))
    age_group = age_bottom + "-" + age_top + " years"
    return age_group