from django.shortcuts import render, redirect, reverse
from datetime import date, datetime, timedelta, time
from profiles.models import UserProfile, User
from .models import Workout, MemberComment, Log
from .forms import LogForm, MemberCommentForm, WorkoutForm
from django.utils.dateparse import parse_duration
from django.db.models import Avg, Max, Min, Sum
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.core import serializers
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.template import loader
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
# from django.template import Library
# from django.template.defaultfilters import stringfilter
import json
import math


def user_list():
    users = User.objects.all()
    user_l = []
    for user in users:
        user_l.append(user.id)
    return user_l


def id_list(userlist, queryset, wodtype):
    """Create list of Log id's that are best results for each user"""
    log_id_list = []
    if wodtype == 'FT':
        for log_user in userlist:
            max_result_user = queryset.filter(user=log_user).aggregate(Min('ft_result'))['ft_result__min']
            max_log_id = queryset.filter(user=log_user).filter(ft_result=max_result_user).aggregate(Max('id'))['id__max']
            if max_log_id != None:
                log_id_list.append(max_log_id)
    elif wodtype == 'AMRAP':
        for log_user in userlist:
            max_result_user = queryset.filter(user=log_user).aggregate(Max('amrap_result'))['amrap_result__max']
            max_log_id = queryset.filter(user=log_user).filter(amrap_result=max_result_user).aggregate(Max('id'))['id__max']
            if max_log_id != None:
                log_id_list.append(max_log_id)
    else:
        for log_user in userlist:
            max_result_user = queryset.filter(user=log_user).aggregate(Max('mw_result'))['mw_result__max']
            max_log_id = queryset.filter(user=log_user).filter(mw_result=max_result_user).aggregate(Max('id'))['id__max']
            if max_log_id != None:
                log_id_list.append(max_log_id)
    return log_id_list


def striphours(duration):
    for x in duration:
        if x == "0" or x == ':':
            no_hours = duration.split(x, 1)[1]
        else:
            break
    return no_hours


def dateInput(request):
    if request.is_ajax and request.method == "POST":
        date_input = request.POST["log_date"]
        date_log = datetime.strptime(date_input, "%b. %d, %Y")
        date_log_s = datetime.strftime(date_log, "%d %b %Y")
        data = {"date_input": date_log_s}
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        return JsonResponse({"error": "Date failed"}, status=400)


def workouts(request, wod_id):
    # Check if specific workout is queried, otherwise go to WOD
    if wod_id == "0":
        wod = Workout.objects.get(workout_is_wod=True)
    else:
        wod = Workout.objects.get(id=wod_id)
    if request.method == "GET":
        # create list of all user id's
        user_l = user_list()
        # check which date is exactly a year ago
        lapse_date = date.today() - timedelta(days=365)
        # make query of all women and one of all men
        all_women_q = UserProfile.objects.filter(gender='F')
        all_men_q = UserProfile.objects.filter(gender='M')
        # get all comments
        member_comments = MemberComment.objects.all()
        # make lists of all women/men
        all_women = []
        for woman in all_women_q:
            all_women.append(woman.user.username)
        all_men = []
        for man in all_men_q:
            all_men.append(man.user.username)
        # sort logs by date, filter for current workout, same for logs of user only; then make list of queries
        all_logs = Log.objects.all().order_by('-date')
        all_logs_wod = all_logs.filter(workout=wod)
        user_logs = all_logs.filter(user=request.user)
        user_logs_wod = user_logs.filter(workout=wod)
        log_groups = [all_logs[:25], all_logs_wod[:25], user_logs[:25], user_logs_wod[:25]]
        # For rank list, find out type of wod, set proper result field and order.
        if wod.workout_type == 'FT':
            all_logs_rank = Log.objects.filter(workout=wod).order_by('ft_result')
            rank_result = 'ft_result'
        elif wod.workout_type == 'AMRAP':
            all_logs_rank = Log.objects.filter(workout=wod).order_by('-amrap_result')
            rank_result = 'amrap_result'
        else:
            all_logs_rank = Log.objects.filter(workout=wod).order_by('-mw_result')
            rank_result = 'mw_result'
        # filter out all logs that are not Rx
        filter_rx = all_logs_rank.filter(rx=True)
        # filter out all logs that are more than a year old
        filter_lapsed = filter_rx.filter(date__gt=lapse_date)
        # create list of log id's max result for this workout for every user
        log_id_list = id_list(user_l, filter_lapsed, wod.workout_type)
        # filter out all none max results from query
        all_logs_rank = filter_lapsed.filter(id__in=log_id_list)
        # create query for today's logs, for women, for men, and rank logs for the whole past year.
        all_logs_rank_today = filter_rx.filter(date=date.today())
        all_logs_rank_women = all_logs_rank.filter(user__username__in=all_women)
        all_logs_rank_men = all_logs_rank.filter(user__username__in=all_men)
        all_logs_rank_women_today = all_logs_rank_today.filter(user__username__in=all_women)
        all_logs_rank_men_today = all_logs_rank_today.filter(user__username__in=all_men)
        # list queries to pass to context
        # all_men_start = 0
        # all_men_today_start = 0
        # all_women_start = 0
        # all_women_today_start = 0
        # all_men_end = 25
        # all_men_today_end = 25
        # all_women_end = 25
        # all_women_today_end = 25
        all_men_index_user = 0
        all_men_today_index_user = 0
        all_women_index_user = 0
        all_women_today_index_user = 0
        rank = 0
        prevresult = [0,0]
        all_men_index = 1
        all_men_today_index = 1
        all_women_index = 1
        all_women_today_index = 1
        rlistmenall = []
        rlistmentoday = []
        rlistwomenall = []
        rlistwomentoday = []
        for log in all_logs_rank_men:
            if getattr(log, rank_result) == prevresult[0]:
                prevresult[1] += 1
            else:
                rank = rank + 1 + prevresult[1]
                prevresult[1] = 0
            prevresult[0] = getattr(log, rank_result)
            rlistmenall.append([log.pk, rank])
            if log.user == request.user:
                all_men_index_user = all_men_index
            else:
                all_men_index += 1
        prevresult = [0, 0]
        rank = 0
        for log in all_logs_rank_men_today:
            if getattr(log, rank_result) == prevresult[0]:
                prevresult[1] += 1
            else:
                rank = rank + 1 + prevresult[1]
                prevresult[1] = 0
            prevresult[0] = getattr(log, rank_result)
            rlistmentoday.append([log.pk, rank])
            if log.user == request.user:
                all_men_today_index_user = all_men_today_index
            else:
                all_men_today_index += 1
        all_men_page = math.ceil(all_men_index_user / 25)
        all_men_today_page = math.ceil(all_men_today_index_user / 25)
        prevresult = [0, 0]
        rank = 0
        for log in all_logs_rank_women:
            if getattr(log, rank_result) == prevresult[0]:
                prevresult[1] += 1
            else:
                rank = rank + 1 + prevresult[1]
                prevresult[1] = 0
            prevresult[0] = getattr(log, rank_result)
            rlistwomenall.append([log.pk, rank])
            if log.user == request.user:
                all_women_index_user = all_women_index
            else:
                all_women_index += 1
        prev_result=[0,0]
        rank = 0
        for log in all_logs_rank_women_today:
            if getattr(log, rank_result) == prevresult[0]:
                prevresult[1] += 1
            else:
                rank = rank + 1 + prevresult[1]
                prevresult[1] = 0
            prevresult[0] = lgetattr(log, rank_result)
            rlistwomentoday.append([log.pk, rank])
            if log.user == request.user:
                all_women_today_index_user = all_women_today_index
            else:
                all_women_today_index += 1
        all_women_page = math.ceil(all_women_index_user / 25)
        all_women_today_page = math.ceil(all_women_today_index_user / 25)
        if all_women_page == 0:
            all_women_page = 1
        if all_women_today_page == 0:
            all_women_today_page = 1
        if all_men_today_page == 0:
            all_men_today_page = 1
        if all_men_page == 0:
            all_men_page = 1
        p_my = Paginator(all_logs_rank_men, 25)
        p_all_logs_rank_men = p_my.page(all_men_page)
        p_wy = Paginator(all_logs_rank_women, 25)
        p_all_logs_rank_women = p_wy.page(all_women_page)
        p_mt = Paginator(all_logs_rank_men_today, 25)
        p_all_logs_rank_men_today = p_mt.page(all_men_today_page)
        p_wt = Paginator(all_logs_rank_women_today, 25)
        p_all_logs_rank_women_today = p_wt.page(all_women_today_page)
        rank_groups = [p_all_logs_rank_men, p_all_logs_rank_women, p_all_logs_rank_men_today, p_all_logs_rank_women_today]
        # Get todays date and convert it to string
        date_today = date.today()
        date_initial = date_today.strftime("%d %b %Y")
        form_log = LogForm()
        workout_form = WorkoutForm()
        wod_collection = Workout.objects.all()
        categories = ["Power Lifts", "Olympic Lifts", "Body Weight", "Heavy", "Light", "Long", "Speed", "Endurance"]
        context = {
            'wod': wod,
            'member_comments': member_comments,
            'log_groups': log_groups,
            'rank_groups': rank_groups,
            'rank_result': rank_result,
            'form_log': form_log,
            'date_initial': date_initial,
            "rlistmenall": rlistmenall,
            "rlistmentoday": rlistmentoday,
            "rlistwomenall": rlistwomenall,
            "rlistwomentoday": rlistwomentoday,
            "all_men_page": all_men_page,
            "all_women_page": all_women_page,
            "all_men_today_page": all_men_today_page,
            "all_women_today_page": all_women_today_page,
            "wod_collection": wod_collection,
            "categories": categories,
            "workout_form": workout_form
        }
        template = "workouts/workouts.html"
        return render(request, template, context)
    else:
        if wod.workout_type == 'FT':
            result = 'ft_result'
            non_result_1 = 'amrap_result'
            non_result_2 = 'mw_result'
        elif wod.workout_type == 'AMRAP':
            result = 'amrap_result'
            non_result_1 = 'ft_result'
            non_result_2 = 'mw_result'
        else:
            result = 'mw_result'
            non_result_1 = 'amrap_result'
            non_result_2 = 'ft_result'
        form_data = {
            f"{result}": request.POST[f"{result}"],
            f"{non_result_1}": 0,
            f"{non_result_2}": 0,
            'rx': request.POST['rx'],
            'date': datetime.strptime(request.POST.get('date'), "%d %b %Y"),
            'user_comment': request.POST['user_comment'],
        }
        tday = date.today().strftime("%Y-%m-%d")
        today = datetime.strptime(tday, "%Y-%m-%d")
        if form_data["date"] > today:
            messages.error(request, 'You cannot log for a future date.')
            return redirect(reverse('workouts', args=wod_id))
        else:
            log_form = LogForm(form_data)
            # fresult = request.POST[f"{result}"]
            if log_form.is_valid():  #  and fresult != '':
                new_log = log_form.save(commit=False)
                # new_log.wod_name = wod.workout_name
                new_log.workout = wod
                new_log.user = request.user
                if wod.workout_type == "FT":
                    new_result = new_log.ft_result.seconds
                    max_result = Log.objects.filter(user=request.user, workout=wod).aggregate(Min('ft_result'))
                    if max_result['ft_result__min'] == None:
                        new_log.personal_record = True
                    else:
                        best_result = max_result['ft_result__min'].seconds
                        if best_result > new_result:
                            new_log.personal_record = True
                        else:
                            new_log.personal_record = False
                elif wod.workout_type == "AMRAP":
                    new_result = new_log.amrap_result
                    max_result = Log.objects.filter(user=request.user, workout=wod).aggregate(Max('amrap_result'))
                    if max_result['amrap_result__max'] == None:
                        new_log.personal_record = True
                    else:
                        best_result = max_result['amrap_result__max']
                        if best_result < new_result:
                            new_log.personal_record = True
                        else:
                            new_log.personal_record = False
                else:
                    new_result = new_log.mw_result
                    max_result = Log.objects.filter(user=request.user, workout=wod).aggregate(Max('mw_result'))
                    if max_result['mw_result__max'] == None:
                        new_log.personal_record = True
                    else:
                        best_result = max_result['mw_result__max']
                        if best_result < new_result:
                            new_log.personal_record = True
                        else:
                            new_log.personal_record = False
                new_log.save()
                messages.success(request, 'Workout logged: Great work!')
                return redirect(reverse('workouts', args=(wod_id,)))
            else:
                messages.error(request, 'There was an error with your form. \
                    Please double check your information.')
                return redirect(reverse('workouts', args=wod_id))


def editLog(request):
    if request.is_ajax() and request.POST:
        log_id = request.POST["log_id"]
        log = Log.objects.get(pk=log_id)
        if log.user == request.user or request.user.is_superuser:
            wod_type = log.workout.workout_type
            rx_input = request.POST["rx"]
            date = datetime.strptime(request.POST["date"], "%d %b %Y")
            if rx_input == "false":
                rx_input = False
            else:
                rx_input = True
            if wod_type == "FT":
                new_result = parse_duration(request.POST["result"])
                if new_result == None:
                    data = {"message": "Error"}
                    messages.error(request, "Your update failed.")
                    return HttpResponse(json.dumps(data), content_type='application/json')
                max_result = Log.objects.filter(user=request.user, workout=log.workout).aggregate(Min('ft_result'))
                Log.objects.filter(pk=log_id).update(ft_result=new_result)
                if max_result['ft_result__min'] == None:
                    Log.objects.filter(pk=log_id).update(personal_record= True)
                else:
                    best_result = max_result['ft_result__min'].seconds
                    new_result_s = new_result.seconds
                    if best_result > new_result_s:
                        Log.objects.filter(pk=log_id).update(personal_record= True)
                    else:
                        Log.objects.filter(pk=log_id).update(personal_record= False)
            elif wod_type == "AMRAP":
                max_result = Log.objects.filter(user=request.user, workout=log.workout).aggregate(Max('amrap_result'))
                Log.objects.filter(pk=log_id).update(amrap_result=request.POST["result"])
                new_result = float(request.POST["result"])
                if max_result['amrap_result__max'] == None:
                    Log.objects.filter(pk=log_id).update(personal_record= True)
                else:
                    best_result = max_result['amrap_result__max']
                    if best_result < new_result:
                        Log.objects.filter(pk=log_id).update(personal_record= True)
                    else:
                        Log.objects.filter(pk=log_id).update(personal_record= False)
            else:
                max_result = Log.objects.filter(user=request.user, workout=log.workout).aggregate(Max('mw_result'))
                Log.objects.filter(pk=log_id).update(mw_result=request.POST["result"])
                new_result = float(request.POST["result"])
                if max_result['mw_result__max'] == None:
                    Log.objects.filter(pk=log_id).update(personal_record= True)
                else:
                    best_result = max_result['mw_result__max']
                    if best_result < new_result:
                        Log.objects.filter(pk=log_id).update(personal_record= True)
                    else:
                        Log.objects.filter(pk=log_id).update(personal_record= False)
            Log.objects.filter(pk=log_id).update(rx=rx_input)
            Log.objects.filter(pk=log_id).update(date=date)
            Log.objects.filter(pk=log_id).update(user_comment=request.POST["comment"])
            data = {"message": "Succesfull edit"}
            messages.success(request, "Your log was updated successfully.")
            return HttpResponse(json.dumps(data), content_type='application/json')
        else:
            data = {"message": "Error"}
            messages.error(request, "You cannot update another member's log.")
            return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        data = {"message": "Error"}
        messages.error(request, "Your update failed.")
        return HttpResponse(json.dumps(data), content_type='application/json')


def deleteLog(request):
    if request.is_ajax() and request.POST:
        log_id = request.POST["log_id"]
        log = Log.objects.get(pk=log_id)
        if request.user == log.user or request.user.is_superuser:
            log.delete()
            data = {"message": "Your log is deleted."}
            messages.success(request, "Your log is deleted.")
            return HttpResponse(json.dumps(data), content_type='application/json')
        else:
            data = {"message": "You cannot delete another user's log."}
            messages.error(request, "You cannot delete another member's log.")
            return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        return JsonResponse({"error": "Delete Failed"}, status=400)


def deleteCommentMember(request):
    if request.is_ajax() and request.POST:
        comment_id = request.POST["comment_id"]
        comment_type = request.POST["comment_type"]
        if comment_type == 'user-comment':
            db_comment = get_object_or_404(Log, pk=comment_id)
            if db_comment.user == request.user or request.user.is_superuser:
                Log.objects.filter(pk=db_comment.pk).update(user_comment='')
                data = {"message": comment_id}
                return HttpResponse(json.dumps(data), content_type='application/json')
            else:
                data = {"message": "You cannot delete another member's post.", "del_false": "False"}
                messages.error(request, "You cannot delete another member's post.")
                return HttpResponse(json.dumps(data), content_type='application/json')
        else:
            db_comment = get_object_or_404(MemberComment, pk=comment_id)
            if db_comment.member == request.user or request.user.is_superuser:
                MemberComment.objects.filter(pk=comment_id).delete()
                data = {"message": comment_id}
                return HttpResponse(json.dumps(data), content_type='application/json')
            else:
                data = {"message": "You cannot delete another member's post.", "del_false": "False"}
                messages.error(request, "You cannot delete another member's post.")
                return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        return JsonResponse({"error": "Delete Failed"}, status=400)


def commentMember(request):
    # request should be ajax and method should be POST.
    if request.is_ajax() and request.POST:
        if request.POST["info_crud"] == "comment-upload":
            # get the form data
            form_data = {
                "message": request.POST["member_comment"],
                "member": request.user,
                "log_id": request.POST["log_id"],
            }
            form = MemberCommentForm(form_data)
            # save the data and after fetch the object in instance
            if form.is_valid():
                new_comment = form.save()
                # serialize in new friend object in json
                # ser_instance = serializers.serialize('json', [instance, ])
                # send to client side.
                new_comment_id = new_comment.pk
                data = {"message": form_data["message"], "new_comment_id": new_comment_id}
                return HttpResponse(json.dumps(data), content_type='application/json')
            else:
                # some form errors occured.
                return JsonResponse({"error": form.errors}, status=400)
        elif request.POST["info_crud"] == "comment-edit":
            # get the form data
            comment_id = request.POST["id_comment"]
            if request.POST["main_comment"] == 'true':
                db_comment = get_object_or_404(Log, pk=comment_id)
                if db_comment.user == request.user or request.user.is_superuser:
                    Log.objects.filter(pk=db_comment.pk).update(user_comment=request.POST["member_comment"])
                    data = {"message": request.POST["member_comment"]}
                    return HttpResponse(json.dumps(data), content_type='application/json')
                else:
                    data = {"message": "You cannot edit another member's post.", "del_false": "False"}
                    messages.error(request, "You cannot edit another member's post.")
                    return HttpResponse(json.dumps(data), content_type='application/json')
            else:
                db_comment = get_object_or_404(MemberComment, pk=comment_id)
                if db_comment.member == request.user or request.user.is_superuser:
                    form_data = {
                        "message": request.POST["member_comment"],
                        "member": request.user,
                        "log_id": request.POST["log_id"],
                    }
                    form = MemberCommentForm(form_data, instance=db_comment)
                    # save the data and after fetch the object in instance
                    if form.is_valid():
                        form.save()
                        data = {"message": form_data['message']}
                        return HttpResponse(json.dumps(data), content_type='application/json')
                    else:
                        # some form errors occured.
                        return JsonResponse({"error": form.errors}, status=400)
                else:
                    data = {"message": "You cannot edit another member's post.", "del_false": "False"}
                    messages.error(request, "You cannot edit another member's post.")
                    return HttpResponse(json.dumps(data), content_type='application/json') 
        else:
            return JsonResponse({"error": "No edit, no upload"}, status=400)


# https://alphacoder.xyz/lazy-loading-with-django-and-jquery/
def loopList(request):
    no_page = False
    wod_id = request.POST["wod"]
    wod = int(wod_id)
    page = request.POST.get('page')
    # get all comments
    member_comments = MemberComment.objects.all()
    # check for superuser
    superuser = False
    if request.user.is_superuser:
        superuser = True
    # check profile
    profile = request.user
    # sort logs by date, filter for current workout, same for logs of user only; then make list of queries
    called_group = request.POST["call_group"]
    all_logs = Log.objects.all().order_by('-date')
    if called_group == "this_everybody":
        calling_group = all_logs.filter(workout=wod)
    elif called_group == "all_everybody":
        calling_group = all_logs
    elif called_group == "all_me":
        calling_group = all_logs.filter(user=request.user)
    else:
        calling_group = all_logs.filter(user=request.user).filter(workout=wod)
    # use Django's pagination
    # https://docs.djangoproject.com/en/dev/topics/pagination/
    results_per_page = 25
    paginator_calling_group = Paginator(calling_group, results_per_page)
    try:
        calling_group = paginator_calling_group.page(page)
    except PageNotAnInteger:
        calling_group = paginator_calling_group.page(2)
    except EmptyPage:
        print("ERROR LAST PAGE")
        calling_group = paginator_calling_group.page(paginator_calling_group.num_pages)
        no_page = True
    # build a html posts list with the paginated posts
    calling_group_html = loader.render_to_string(
        'workouts/includes/historyloop.html',
        {
        'h_group': calling_group,
        'member_comments':member_comments,
        'superuser': superuser,
        "profile": profile
        }
    )
    # package output data and return it as a JSON object
    output_data = {
        'calling_group_html': calling_group_html,
        'has_next': calling_group.has_next(),
        "no_page":no_page
    }
    return JsonResponse(output_data)


def loopListRank(request):
    wod_id = request.POST["wod"]
    workout = int(wod_id)
    wod = Workout.objects.get(pk=workout)
    page = request.POST.get('page')
    # sort logs by date, filter for current workout, same for logs of user only; then make list of queries
    called_group = request.POST["call_group"]
    user_l = user_list()
    # check which date is exactly a year ago
    lapse_date = date.today() - timedelta(days=365)
    # make query of all women and one of all men
    all_women_q = UserProfile.objects.filter(gender='F')
    all_men_q = UserProfile.objects.filter(gender='M')
    # get all comments
    member_comments = MemberComment.objects.all()
    # check for superuser
    superuser = False
    if request.user.is_superuser:
        superuser = True
    # check profile
    profile = request.user
    # make lists of all women/men
    all_women = []
    for woman in all_women_q:
        all_women.append(woman.user.username)
    all_men = []
    for man in all_men_q:
        all_men.append(man.user.username)
    # For rank list, find out type of wod, set proper result field and order.
    print(wod.workout_type)
    if wod.workout_type == 'FT':
        all_logs_rank = Log.objects.filter(workout=wod).order_by('ft_result')
        rank_result = 'ft_result'
    elif wod.workout_type == 'AMRAP':
        all_logs_rank = Log.objects.filter(workout=wod).order_by('-amrap_result')
        rank_result = 'amrap_result'
    else:
        all_logs_rank = Log.objects.filter(workout=wod).order_by('-mw_result')
        rank_result = 'mw_result'
    # filter out all logs that are not Rx
    filter_rx = all_logs_rank.filter(rx=True)
    # filter out all logs that are more than a year old
    filter_lapsed = filter_rx.filter(date__gt=lapse_date)
    # create list of log id's max result for this workout for every user
    log_id_list = id_list(user_l, filter_lapsed, wod.workout_type)
    # filter out all none max results from query
    all_logs_rank = filter_lapsed.filter(id__in=log_id_list)
    # create query for today's logs, for women, for men, and rank logs for the whole past year.
    all_logs_rank_today = filter_rx.filter(date=date.today())
    # all_logs_rank_women = all_logs_rank.filter(user__username__in=all_women)
    # all_logs_rank_men = all_logs_rank.filter(user__username__in=all_men)
    # all_logs_rank_women_today = all_logs_rank_today.filter(user__username__in=all_women)
    # all_logs_rank_men_today = all_logs_rank_today.filter(user__username__in=all_men)
    if called_group == "men_year":
        calling_group = all_logs_rank.filter(user__username__in=all_men)
    elif called_group == "women_year":
        calling_group = all_logs_rank.filter(user__username__in=all_women)
    elif called_group == "men_today":
        calling_group = all_logs_rank_today.filter(user__username__in=all_men)
    else:
        calling_group = all_logs_rank_today.filter(user__username__in=all_women)
    # use Django's pagination
    # https://docs.djangoproject.com/en/dev/topics/pagination/
    results_per_page = 25
    no_more = False
    paginator_calling_group = Paginator(calling_group, results_per_page)
    try:
        calling_group = paginator_calling_group.page(page)
    except PageNotAnInteger:
        calling_group = paginator_calling_group.page(2)
    except EmptyPage:
        no_more = True
        print("ERROR LAST PAGE")
        calling_group = paginator_calling_group.page(paginator_calling_group.num_pages)
    # build a html posts list with the paginated posts
    calling_group_html = loader.render_to_string(
        'workouts/includes/rankloop.html',
        {
        'r_group': calling_group,
        'rank_result': rank_result,
        'member_comments':member_comments,
        'superuser': superuser,
        "profile": profile
        }
    )
    # package output data and return it as a JSON object
    output_data = {
        'calling_group_html': calling_group_html,
        'has_next': calling_group.has_next()
    }
    return JsonResponse(output_data)


def createWorkout(request, wod_id):
    if request.method == "POST" and request.user.is_superuser:
        form = WorkoutForm(request.POST)
        if form.is_valid:
            new = form.save()
            print(new)
            new_wod_id = new.pk
            print(new_wod_id)
            messages.success(request, "The workout was created successfully.")
            return redirect(reverse('workouts', args=(new_wod_id,)))
        else:
            messages.error(request, "Your form was not filled out correctly.")
            return redirect(reverse('workouts', args=wod_id))


def editWorkout(request):
    if request.is_ajax() and request.POST and request.user.is_superuser:
        wod = Workout.objects.filter(pk=request.POST["wod_id"])
        wod.update(workout_name=request.POST["workout_name"])
        wod.update(workout_type=request.POST["workout_type"])
        wod.update(workout_category=request.POST["workout_category"])
        wod.update(description=request.POST["description"])
        data = {"message": "Succesfull edit"}
        messages.success(request, "The workout was updated successfully.")
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        data = {"message": "Error"}
        messages.error(request, "Your form was not filled out correctly.")
        return HttpResponse(json.dumps(data), content_type='application/json')


def deleteWorkout(request):
    if request.is_ajax() and request.POST and request.user.is_superuser:
        wod = get_object_or_404(Workout, pk=request.POST["wod_id"])
        if wod.workout_is_wod is True:
            new_wod = Workout.objects.all().first()
            new_wod.update(workout_is_wod=True)
        wod.delete()
        data = {"message": "Succesfull"}
        messages.success(request, "The workout was deleted successfully.")
        # return redirect(reverse('workouts', args=(0,)))
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        data = {"message": "Error"}
        messages.error(request, "Something went wrong. Workout not deleted.")
        # return redirect(reverse('workouts', args=(request.POST["wod_id"],)))
        return HttpResponse(json.dumps(data), content_type='application/json')


def setWod(request):
    if request.is_ajax() and request.POST and request.user.is_superuser:
        wod = Workout.objects.filter(pk=request.POST["wod_id"])
        Workout.objects.all().update(workout_is_wod=False)
        wod.update(workout_is_wod=True)
        data = {"message": "Succesfull"}
        messages.success(request, "The workout was set as WOD successfully.")
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        data = {"message": "Error"}
        messages.error(request, "Something went wrong. Workout not set as WOD")
        return HttpResponse(json.dumps(data), content_type='application/json')
