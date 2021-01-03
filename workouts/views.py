from django.shortcuts import render, redirect, reverse
from datetime import date, datetime, timedelta
from profiles.models import UserProfile, User
from .models import Workout, MemberComment, Log
from .forms import LogForm, MemberCommentForm
from django.utils.dateparse import parse_duration
from django.db.models import Avg, Max, Min, Sum
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.core import serializers
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404
import json
# Create your views here.


def user_list():
    users = User.objects.all()
    user_l = []
    for user in users:
        user_l.append(user.id)
    return user_l


def id_list(userlist, queryset, wodtype):
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
        all_logs_wod = all_logs.filter(wod_name=wod.workout_name)
        user_logs = all_logs.filter(user=request.user)
        user_logs_wod = user_logs.filter(wod_name=wod.workout_name)
        log_groups = [all_logs, all_logs_wod, user_logs, user_logs_wod]
        # For rank list, find out type of wod, set proper result field and order.
        if wod.workout_type == 'FT':
            all_logs_rank = Log.objects.filter(wod_name=wod.workout_name).order_by('ft_result')
            rank_result = 'ft_result'
        elif wod.workout_type == 'AMRAP':
            all_logs_rank = Log.objects.filter(wod_name=wod.workout_name).order_by('-amrap_result')
            rank_result = 'amrap_result'
        else:
            all_logs_rank = Log.objects.filter(wod_name=wod.workout_name).order_by('-mw_result')
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
        rank_groups = [all_logs_rank_men, all_logs_rank_women, all_logs_rank_men_today, all_logs_rank_women_today]
        # ##### REDUNDANT CODE?
        # if log is None:
        #     result = "No logs for this WOD"
        # else:
        #     duration = str(log.ft_result)
        #     result = striphours(duration)
        #######
        # Get todays date and convert it to string
        date_today = date.today()
        date_initial = date_today.strftime("%d %b %Y")
        form_log = LogForm()
        context = {
            'wod': wod,
            'member_comments': member_comments,
            'log_groups': log_groups,
            'rank_groups': rank_groups,
            'rank_result': rank_result,
            'form_log': form_log,
            'date_initial': date_initial,
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
        
        log_form = LogForm(form_data)
        # fresult = request.POST[f"{result}"]
        if log_form.is_valid():  #  and fresult != '':
            new_log = log_form.save(commit=False)
            new_log.wod_name = wod.workout_name
            new_log.user = request.user
            if wod.workout_type == "FT":
                new_result = new_log.ft_result.seconds
                max_result = Log.objects.filter(user=request.user, wod_name=wod.workout_name).aggregate(Min('ft_result'))
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
                max_result = Log.objects.filter(user=request.user, wod_name=wod.workout_name).aggregate(Max('amrap_result'))
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
                max_result = Log.objects.filter(user=request.user, wod_name=wod.workout_name).aggregate(Max('mw_result'))
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


def deleteLog(request):
    if request.is_ajax() and request.POST:
        log_id = request.POST["log_id"]
        log = Log.objects.get(pk=log_id)
        if request.user == log.user:
            log.delete()
            data = {"message": "Your log is deleted."}
            messages.success(request, "Your log is deleted.")
            return HttpResponse(json.dumps(data), content_type='application/json')
        else:
            data = {"message": "You cannot delete another user's log."}
            messages.success(request, "You cannot delete another member's log.")
            return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        return JsonResponse({"error": "Delete Failed"}, status=400)


def deleteCommentMember(request):
    if request.is_ajax() and request.POST:
        comment_id = request.POST["comment_id"]
        comment_type = request.POST["comment_type"]
        if comment_type == 'user-comment':
            db_comment = get_object_or_404(Log, pk=comment_id)
            if db_comment.user == request.user:
                Log.objects.filter(pk=db_comment.pk).update(user_comment='')
                data = {"message": comment_id}
                return HttpResponse(json.dumps(data), content_type='application/json')
            else:
                data = {"message": "You cannot delete another member's post.", "del_false": "False"}
                messages.error(request, "You cannot delete another member's post.")
                return HttpResponse(json.dumps(data), content_type='application/json')
        else:
            db_comment = get_object_or_404(MemberComment, pk=comment_id)
            if db_comment.member == request.user:
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
                print(new_comment_id)
                data = {"message": form_data['message'], "new_comment_id": new_comment_id}
                return HttpResponse(json.dumps(data), content_type='application/json')
            else:
                # some form errors occured.
                return JsonResponse({"error": form.errors}, status=400)
        elif request.POST["info_crud"] == "comment-edit":
            # get the form data
            comment_id = request.POST["id_comment"]
            if request.POST["main_comment"] == 'true':
                print("correct")
                db_comment = get_object_or_404(Log, pk=comment_id)
                if db_comment.user == request.user:
                    Log.objects.filter(pk=db_comment.pk).update(user_comment=request.POST["member_comment"])
                    data = {"message": request.POST["member_comment"]}
                    return HttpResponse(json.dumps(data), content_type='application/json')
                else:
                    data = {"message": "You cannot edit another member's post.", "del_false": "False"}
                    messages.error(request, "You cannot edit another member's post.")
                    return HttpResponse(json.dumps(data), content_type='application/json')
            else:
                print("incorrect")
                db_comment = get_object_or_404(MemberComment, pk=comment_id)
                if db_comment.member == request.user:
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