from django.shortcuts import render, redirect, reverse
from datetime import date, datetime, timedelta
from .models import Workout, MemberComment, Log
from profiles.models import HeroLevels
from .forms import LogForm, MemberCommentForm, WorkoutForm
from django.utils.dateparse import parse_duration
from django.db.models import Max, Min
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template import loader
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from decimal import Decimal
from community.views import getGroupSelection, getGroup
from profiles.views import cat_levels_info, getLevels
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
import json
import math
import statistics


def striphours(duration):
    """slice of the unnecessary zero's in a time duration string"""
    for x in duration:
        if x == "0" or x == ':':
            no_hours = duration.split(x, 1)[1]
        else:
            break
    return no_hours


@require_POST
def dateInput(request):
    """Reformat the date variable for editing log form"""
    if request.is_ajax:
        date_input = request.POST["log_date"]
        date_log = datetime.strptime(date_input, "%b. %d, %Y")
        date_log_s = datetime.strftime(date_log, "%d %b %Y")
        data = {"date_input": date_log_s}
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        return JsonResponse({"error": "Date failed"}, status=400)


def workouts(request, wod_id):
    """A view to render the workouts page on \
        GET and upload a Log object on POST"""
    if not request.user.is_authenticated:
        return render(request, 'home/index.html')
    elif not hasattr(request.user, 'userprofile'):
        return redirect(reverse('create_profile'))
    selected_group = getGroupSelection(request)
    # Check if specific workout is queried, otherwise go to WOD
    if wod_id == "0":
        wod = Workout.objects.get(workout_is_wod=True)
    else:
        wod = Workout.objects.get(id=wod_id)
    if request.method == "GET":
        ft_seconds = True
        # check which date is exactly a year ago
        lapse_date = date.today() - timedelta(days=365)
        # get all comments
        member_comments = MemberComment.objects.all()
        # Create log groups for member activity module
        all_logs = selected_group.order_by('-date')
        all_logs_wod = selected_group.filter(workout=wod).order_by('-date')
        user_logs = selected_group.filter(user=request.user).order_by('-date')
        user_logs_wod = user_logs.filter(workout=wod).order_by('-date')
        log_groups = [
            all_logs[:25],
            all_logs_wod[:25],
            user_logs[:25],
            user_logs_wod[:25]
            ]
        # For rank list, find out type of wod,
        # set proper result field and order.
        if wod.workout_type == 'FT':
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('ft_result')
            rank_result = 'ft_result'
        elif wod.workout_type == 'AMRAP':
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('-amrap_result')
            rank_result = 'amrap_result'
        else:
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('-mw_result')
            rank_result = 'mw_result'
        # Create a list of log id's for max result for the past year
        all_logs_l = list(all_logs_rank.values())
        log_max_list = []
        log_user_id_list = []
        for log in all_logs_l:
            if not log["user_id"] in log_user_id_list:
                log_user_id_list.append(log["user_id"])
                log_max_list.append(log["id"])
        # create a query for logs of current day.
        all_logs_rank_today = all_logs_rank.filter(date=date.today())
        # filter out all none max results from query
        all_logs_rank = all_logs_rank.filter(id__in=log_max_list)
        # create query for today's logs, for women,\
        # for men, and rank logs for the whole past year.
        all_logs_rank_women = all_logs_rank.filter(
            user__userprofile__gender="F"
            )
        all_logs_rank_men = all_logs_rank.filter(
            user__userprofile__gender="M"
            )
        all_logs_rank_women_today = all_logs_rank_today.filter(
            user__userprofile__gender="F"
            )
        all_logs_rank_men_today = all_logs_rank_today.filter(
            user__userprofile__gender="M"
            )
        # Set variables for setting the ranks of the logs
        all_men_index_user = 0
        all_men_today_index_user = 0
        all_women_index_user = 0
        all_women_today_index_user = 0
        rank = 0
        prevresult = [0, 0]
        all_men_index = 1
        all_men_today_index = 1
        all_women_index = 1
        all_women_today_index = 1
        rlistmenall = []
        rlistmentoday = []
        rlistwomenall = []
        rlistwomentoday = []
        # Make lists of logs and their corresponding ranks.
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
        prevresult = [0, 0]
        rank = 0
        for log in all_logs_rank_women_today:
            if getattr(log, rank_result) == prevresult[0]:
                prevresult[1] += 1
            else:
                rank = rank + 1 + prevresult[1]
                prevresult[1] = 0
            prevresult[0] = getattr(log, rank_result)
            rlistwomentoday.append([log.pk, rank])
            if log.user == request.user:
                all_women_today_index_user = all_women_today_index
            else:
                all_women_today_index += 1
        # Get best and worst results for workout
        # to set initial level slider value.
        data = setInitialSliderLevel(
            request,
            wod,
            lapse_date,
            rank_result,
            all_logs_rank_men,
            all_logs_rank_women
            )
        initial_slider_level = data["init"]
        best = data["best"]
        worst = data["worst"]
        # Determine the page on which the user's log
        # is so it will render this page on view load.
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
        # Set page info to determine from
        # template if page has next or previous.
        if p_all_logs_rank_men.has_next() is False:
            all_men_page = {"down": "x", "up": all_men_page}
        else:
            all_men_page = {"down": all_men_page, "up": all_men_page}
        p_wy = Paginator(all_logs_rank_women, 25)
        p_all_logs_rank_women = p_wy.page(all_women_page)
        if p_all_logs_rank_women.has_next() is False:
            all_women_page = {"down": "x", "up": all_women_page}
        else:
            all_women_page = {"down": all_women_page, "up": all_women_page}
        p_mt = Paginator(all_logs_rank_men_today, 25)
        p_all_logs_rank_men_today = p_mt.page(all_men_today_page)
        if p_all_logs_rank_men_today.has_next() is False:
            all_men_today_page = {"down": "x", "up": all_men_today_page}
        else:
            all_men_today_page = {
                "down": all_men_today_page,
                "up": all_men_today_page
                }
        p_wt = Paginator(all_logs_rank_women_today, 25)
        p_all_logs_rank_women_today = p_wt.page(all_women_today_page)
        if p_all_logs_rank_women_today.has_next() is False:
            all_women_today_page = {"down": "x", "up": all_women_today_page}
        else:
            all_women_today_page = {
                "down": all_women_today_page,
                "up": all_women_today_page
                }
        # Set groups for loading in the rank module
        rank_groups = [
            p_all_logs_rank_men,
            p_all_logs_rank_women,
            p_all_logs_rank_men_today,
            p_all_logs_rank_women_today
            ]
        # set further context data and set context.
        date_today = date.today()
        date_initial = date_today.strftime("%d %b %Y")
        form_log = LogForm()
        workout_form = WorkoutForm()
        wod_collection = Workout.objects.all()
        categories = [
            "Power Lifts",
            "Olympic Lifts",
            "Body Weight",
            "Heavy", "Light",
            "Long",
            "Speed",
            "Endurance"
            ]
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
            "workout_form": workout_form,
            "best": best,
            "worst": worst,
            "initial_slider_level": initial_slider_level
        }
        template = "workouts/workouts.html"
        return render(request, template, context)
    # else if request is POST
    else:
        # Determine workout type and set appropriate values
        # to get the right data from the request.POST
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
        # Check if the log is not set in the future
        tday = date.today().strftime("%Y-%m-%d")
        today = datetime.strptime(tday, "%Y-%m-%d")
        if form_data["date"] > today:
            messages.error(request, 'You cannot log for a future date.')
            return redirect(reverse('workouts', args=wod_id))
        else:
            # Upload new log object.
            log_form = LogForm(form_data)
            if log_form.is_valid():
                new_log = log_form.save(commit=False)
                new_log.workout = wod
                new_log.user = request.user
                new_log.personal_record = True
                new_log.save()
                # Determine if log result is personal record
                updatePR(request.user, wod, wod.workout_type, result)
                messages.success(request, 'Workout logged: Great work!')
                calc_level(request.user)
                return redirect(reverse('workouts', args=(wod_id,)))
            else:
                messages.error(request, 'There was an error with your form. \
                    Please double check your information.')
                return redirect(reverse('workouts', args=wod_id))


@require_POST
def editLog(request):
    """Function for editing a previously submitted Log object"""
    if request.is_ajax() and request.user.is_authenticated \
            and hasattr(request.user, 'userprofile'):
        log_id = request.POST["log_id"]
        log = Log.objects.get(pk=log_id)
        log_f = Log.objects.filter(pk=log_id)
        if log.user == request.user or request.user.is_superuser:
            wod_type = log.workout.workout_type
            rx_input = request.POST["rx"]
            date = datetime.strptime(request.POST["date"], "%d %b %Y")
            if rx_input == "false":
                rx_input = False
            else:
                rx_input = True
            log_f.update(rx=rx_input)
            log_f.update(date=date)
            log_f.update(
                user_comment=request.POST["comment"]
                )
            new_result = request.POST["result"]
            if wod_type == "FT":
                result = 'ft_result'
                new_result = parse_duration(new_result)
            elif wod_type == "AMRAP":
                result = 'amrap_result'
            else:
                result = 'mw_result'
            result_upd = {f'{result}': new_result}
            log_f.update(**result_upd)
            # Determine if log result is personal record.
            updatePR(request.user, log.workout, wod_type, result)
            data = {"message": "Succesfull edit"}
            messages.success(request, "Your log was updated successfully.")
            user = request.user
            calc_level(user)
            return HttpResponse(
                json.dumps(data),
                content_type='application/json'
                )
        else:
            data = {"message": "Error"}
            messages.error(request, "You cannot update another member's log.")
            return HttpResponse(
                json.dumps(data),
                content_type='application/json'
                )
    else:
        data = {"message": "Error"}
        messages.error(request, "Your update failed.")
        return HttpResponse(json.dumps(data), content_type='application/json')


@require_POST
def deleteLog(request):
    """Function for deleting a previously submitted Log"""
    if request.is_ajax() and request.user.is_authenticated \
            and hasattr(request.user, 'userprofile'):
        log_id = request.POST["log_id"]
        log = Log.objects.get(pk=log_id)
        user_upd = log.user
        workout_upd = log.workout
        wtype_upd = log.workout.workout_type
        if wtype_upd == "FT":
            result_upd = 'ft_result'
        elif wtype_upd == "AMRAP":
            result_upd = 'amrap_result'
        else:
            result_upd = 'mw_result'
        if request.user == log.user or request.user.is_superuser:
            log.delete()
            updatePR(user_upd, workout_upd, wtype_upd, result_upd)
            data = {"message": "Your log is deleted."}
            messages.success(request, "Your log is deleted.")
            calc_level(request.user)
            return HttpResponse(
                json.dumps(data),
                content_type='application/json'
                )
        else:
            data = {"message": "You cannot delete another user's log."}
            messages.error(request, "You cannot delete another member's log.")
            return HttpResponse(
                json.dumps(data),
                content_type='application/json'
                )
    else:
        return JsonResponse({"error": "Delete Failed"}, status=400)


def updatePR(user, workout, wod_type, result):
    """Function to recheck all logs if they
    were PR or not after log (prev date), edit or delete."""
    user_wod_logs = Log.objects.filter(
        user=user,
        workout=workout,
    ).order_by('date')
    if wod_type == "FT":
        for u_log in user_wod_logs:
            if u_log == user_wod_logs[0]:
                u_log.personal_record = True
            else:
                curr_date = u_log.date
                prev_max = user_wod_logs.filter(
                    date__lt=curr_date
                    ).aggregate(Min(f'{result}'))[f'{result}__min']
                if getattr(u_log, f'{result}') < prev_max:
                    u_log.personal_record = True
                else:
                    u_log.personal_record = False
            u_log.save()
    else:
        for u_log in user_wod_logs:
            if u_log == user_wod_logs[0]:
                u_log.personal_record = True
            else:
                curr_date = u_log.date
                prev_max = user_wod_logs.filter(
                    date__lt=curr_date
                    ).aggregate(Max(f'{result}'))[f'{result}__max']
                if getattr(u_log, f'{result}') > prev_max:
                    u_log.personal_record = True
                else:
                    u_log.personal_record = False
            u_log.save()


@require_POST
def deleteCommentMember(request):
    """Function for deleting a comment by user"""
    if request.is_ajax() and request.user.is_authenticated \
            and hasattr(request.user, 'userprofile'):
        comment_id = request.POST["comment_id"]
        comment_type = request.POST["comment_type"]
        # Determine comment type, because user- vs. member-
        # comment are saved differently in the Database.
        if comment_type == 'user-comment':
            db_comment = get_object_or_404(Log, pk=comment_id)
            if db_comment.user == request.user or request.user.is_superuser:
                Log.objects.filter(pk=db_comment.pk).update(user_comment='')
                data = {"message": comment_id}
                return HttpResponse(
                    json.dumps(data),
                    content_type='application/json'
                    )
            else:
                data = {
                    "message": "You cannot delete another member's post.",
                    }
                messages.error(
                    request,
                    "You cannot delete another member's post."
                    )
                return HttpResponse(
                    json.dumps(data),
                    content_type='application/json'
                    )
        else:
            db_comment = get_object_or_404(MemberComment, pk=comment_id)
            if db_comment.member == request.user or request.user.is_superuser:
                MemberComment.objects.filter(pk=comment_id).delete()
                data = {"message": comment_id}
                return HttpResponse(
                    json.dumps(data),
                    content_type='application/json'
                    )
            else:
                data = {
                    "message": "You cannot delete another member's post.",
                    "del_false": "False"
                }
                messages.error(
                    request,
                    "You cannot delete another member's post."
                    )
                return HttpResponse(
                    json.dumps(data),
                    content_type='application/json'
                    )
    else:
        return JsonResponse({"error": "Delete Failed"}, status=400)


@require_POST
def commentMember(request):
    """Function to post OR edit a comment on a log"""
    if request.is_ajax() and request.user.is_authenticated \
            and hasattr(request.user, 'userprofile'):
        # Determine if the request is to upload or to edit.
        if request.POST["info_crud"] == "comment-upload":
            # Upload a comment.
            form_data = {
                "message": request.POST["member_comment"],
                "member": request.user,
                "log_id": request.POST["log_id"],
            }
            form = MemberCommentForm(form_data)
            if form.is_valid():
                new_comment = form.save()
                new_comment_id = new_comment.pk
                data = {
                    "message": form_data["message"],
                    "new_comment_id": new_comment_id
                    }
                send_comment_notification(
                    request.user,
                    request.POST["log_id"],
                    request.POST["member_comment"]
                    )
                return HttpResponse(
                    json.dumps(data),
                    content_type='application/json'
                    )
            else:
                return JsonResponse({"error": form.errors}, status=400)
        elif request.POST["info_crud"] == "comment-edit":
            # Edit a comment.
            comment_id = request.POST["id_comment"]
            # Determine comment type, because user- vs. member-
            # comment are saved differently in the Database.
            if request.POST["main_comment"] == 'true':
                db_comment = get_object_or_404(
                    Log,
                    pk=comment_id
                    )
                if db_comment.user == request.user or \
                        request.user.is_superuser:
                    Log.objects.filter(
                        pk=db_comment.pk
                        ).update(
                            user_comment=request.POST["member_comment"]
                            )
                    data = {"message": request.POST["member_comment"]}
                    return HttpResponse(
                        json.dumps(data),
                        content_type='application/json'
                        )
                else:
                    data = {
                        "message": "You cannot edit another member's post.",
                        "del_false": "False"
                        }
                    messages.error(
                        request,
                        "You cannot edit another member's post."
                        )
                    return HttpResponse(
                        json.dumps(data),
                        content_type='application/json'
                        )
            else:
                db_comment = get_object_or_404(MemberComment, pk=comment_id)
                if db_comment.member == request.user or \
                        request.user.is_superuser:
                    form_data = {
                        "message": request.POST["member_comment"],
                        "member": request.user,
                        "log_id": request.POST["log_id"],
                    }
                    form = MemberCommentForm(form_data, instance=db_comment)
                    if form.is_valid():
                        form.save()
                        data = {"message": form_data['message']}
                        return HttpResponse(
                            json.dumps(data),
                            content_type='application/json'
                            )
                    else:
                        return JsonResponse({"error": form.errors}, status=400)
                else:
                    data = {
                        "message": "You cannot edit another member's post.",
                        "del_false": "False"
                        }
                    messages.error(
                        request,
                        "You cannot edit another member's post."
                        )
                    return HttpResponse(
                        json.dumps(data),
                        content_type='application/json'
                    )
        else:
            return JsonResponse({"error": "No edit, no upload"}, status=400)


# Made possible with help from:
# https://alphacoder.xyz/lazy-loading-with-django-and-jquery/
@require_POST
def loopList(request):
    """Function to get next 'page' of logs for the activity module"""
    if request.is_ajax and request.user.is_authenticated \
            and hasattr(request.user, 'userprofile'):
        selected_group = getGroupSelection(request)
        no_page = False
        wod_id = request.POST["wod"]
        wod = int(wod_id)
        page = request.POST.get('page')
        # get all comments
        member_comments = MemberComment.objects.all()
        # check for superuser to determine loading of CRUD options.
        superuser = False
        if request.user.is_superuser:
            superuser = True
        # check profile
        profile = request.user
        # sort logs by date, filter for current workout,
        # same for logs of user only; then make list of queries
        called_group = request.POST["call_group"]
        all_logs = selected_group.order_by('-date')
        if called_group == "this_everybody":
            calling_group = all_logs.filter(workout=wod)
        elif called_group == "all_everybody":
            calling_group = all_logs
        elif called_group == "all_me":
            calling_group = all_logs.filter(user=request.user)
        else:
            calling_group = all_logs.filter(
                user=request.user
                ).filter(workout=wod)
        # use Django's pagination
        results_per_page = 25
        paginator_calling_group = Paginator(calling_group, results_per_page)
        try:
            calling_group = paginator_calling_group.page(page)
        except PageNotAnInteger:
            calling_group = paginator_calling_group.page(2)
        except EmptyPage:
            calling_group = paginator_calling_group.page(
                paginator_calling_group.num_pages
                )
            no_page = True
        # build a html posts list with the paginated posts
        calling_group_html = loader.render_to_string(
            'workouts/includes/historyloop.html',
            {
                'h_group': calling_group,
                'member_comments': member_comments,
                'superuser': superuser,
                "profile": profile
            }
        )
        # package output data and return it as a JSON object
        output_data = {
            'calling_group_html': calling_group_html,
            'has_next': calling_group.has_next(),
            "no_page": no_page
        }
        return JsonResponse(output_data)


@require_POST
def loopListRank(request):
    """Function to get next or previous page for the Rank module."""
    if request.is_ajax and request.user.is_authenticated \
            and hasattr(request.user, 'userprofile'):
        selected_group = getGroupSelection(request)
        wod_id = request.POST["wod"]
        workout = int(wod_id)
        wod = Workout.objects.get(pk=workout)
        page = request.POST.get('page')
        # sort logs by date, filter for current workout,
        # same for logs of user only; then make list of queries
        called_group = request.POST["call_group"]
        # check which date is exactly a year ago
        lapse_date = date.today() - timedelta(days=365)
        # get all comments
        member_comments = MemberComment.objects.all()
        # check for superuser to enable CRUD options.
        superuser = False
        if request.user.is_superuser:
            superuser = True
        # check profile
        profile = request.user
        # For rank list, find out type of wod,
        # set proper result field and order.
        if wod.workout_type == 'FT':
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('ft_result')
            rank_result = 'ft_result'
        elif wod.workout_type == 'AMRAP':
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('-amrap_result')
            rank_result = 'amrap_result'
        else:
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('-mw_result')
            rank_result = 'mw_result'
        all_logs_rank_today = all_logs_rank.filter(date=date.today())
        all_logs_l = list(all_logs_rank.values())
        log_max_list = []
        log_user_id_list = []
        # Make list of log id's that are
        # max results for each user for the past year.
        for log in all_logs_l:
            if not log["user_id"] in log_user_id_list:
                log_user_id_list.append(log["user_id"])
                log_max_list.append(log["id"])
        # filter out all none max results from query
        all_logs_rank = all_logs_rank.filter(id__in=log_max_list)
        # create query for today's logs,
        # for women, for men, and rank logs for the whole past year.
        if called_group == "men_year":
            calling_group = all_logs_rank.filter(user__userprofile__gender="M")
        elif called_group == "women_year":
            calling_group = all_logs_rank.filter(user__userprofile__gender="F")
        elif called_group == "men_today":
            calling_group = all_logs_rank_today.filter(
                user__userprofile__gender="M"
                )
        else:
            calling_group = all_logs_rank_today.filter(
                user__userprofile__gender="F"
                )
        results_per_page = 25
        paginator_calling_group = Paginator(calling_group, results_per_page)
        try:
            calling_group = paginator_calling_group.page(page)
        except PageNotAnInteger:
            calling_group = paginator_calling_group.page(2)
        except EmptyPage:
            calling_group = paginator_calling_group.page(
                paginator_calling_group.num_pages
                )
        # build a html posts list with the paginated posts
        calling_group_html = loader.render_to_string(
            'workouts/includes/rankloop.html',
            {
                'r_group': calling_group,
                'rank_result': rank_result,
                'member_comments': member_comments,
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


@require_POST
def createWorkout(request, wod_id):
    """Function to create a Workout object, only available to superuser"""
    if request.user.is_superuser:
        form = WorkoutForm(request.POST)
        if form.is_valid:
            new = form.save()
            new_wod_id = new.pk
            messages.success(request, "The workout was created successfully.")
            return redirect(reverse('workouts', args=(new_wod_id,)))
        else:
            messages.error(request, "Your form was not filled out correctly.")
            return redirect(reverse('workouts', args=wod_id))


@require_POST
def editWorkout(request):
    """Function to edit Workout object, only available for superuser"""
    if request.is_ajax() and request.user.is_superuser:
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


@require_POST
def deleteWorkout(request):
    """Function to delete Workout object, only available for superuser"""
    if request.is_ajax() and request.user.is_superuser:
        wod = get_object_or_404(Workout, pk=request.POST["wod_id"])
        # Set a new workout of the day if deleted workout was WOD.
        if wod.workout_is_wod is True:
            new_wod = Workout.objects.all().first()
            new_wod.update(workout_is_wod=True)
        wod.delete()
        data = {"message": "Succesfull"}
        messages.success(request, "The workout was deleted successfully.")
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        data = {"message": "Error"}
        messages.error(request, "Something went wrong. Workout not deleted.")
        return HttpResponse(json.dumps(data), content_type='application/json')


@require_POST
def setWod(request):
    """Function to set Workout object as WOD (workout of the day),
    only available for superuser"""
    if request.is_ajax() and request.user.is_superuser:
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


@require_POST
def getSliderLevel(request):
    """Function to get the Level for a given result
    on the preview Slider on the workout page"""
    prep_result = request.POST["prep_result"]
    wod = request.POST["wod"]
    if request.is_ajax():
        wod = Workout.objects.get(pk=wod)
        # check which date is exactly a year ago
        lapse_date = date.today() - timedelta(days=365)
        if wod.workout_type == 'FT':
            rank_result = 'ft_result'
            rank_result_order = 'ft_result'
        elif wod.workout_type == 'AMRAP':
            rank_result = 'amrap_result'
            rank_result_order = '-amrap_result'
        else:
            rank_result = 'mw_result'
            rank_result_order = '-mw_result'
        # sort logs by date, filter for current workout,
        # same for logs of user only; then make list of queries
        all_logs = Log.objects.all().filter(
            user__userprofile__gender=request.user.userprofile.gender
            ).filter(workout=wod).filter(rx=True).filter(
                date__gt=lapse_date
                ).order_by(f'{rank_result_order}')
        # create list of log id's max result for this workout for every user
        all_logs_l = list(all_logs.values())
        log_max_list = []
        log_user_id_list = []
        for log in all_logs_l:
            if not log["user_id"] in log_user_id_list:
                log_user_id_list.append(log["user_id"])
                log_max_list.append(log["id"])
        # filter out all none max results from query
        all_logs_rank = all_logs.filter(id__in=log_max_list)
        rank = 0
        prevresult = [0, 0]
        rlistgenderall = []
        prep_rank = 0
        # Determine rank for each log.
        for log in all_logs_rank:
            if getattr(log, rank_result) == prevresult[0]:
                prevresult[1] += 1
            else:
                rank = rank + 1 + prevresult[1]
                prevresult[1] = 0
            prevresult[0] = getattr(log, rank_result)
            rlistgenderall.append([log.pk, rank])
            if wod.workout_type == 'FT':
                if getattr(log, rank_result).seconds >= int(prep_result):
                    if prep_rank == 0:
                        prep_rank = rank
            else:
                if getattr(log, rank_result) <= Decimal(prep_result):
                    if prep_rank == 0:
                        prep_rank = rank
        if prep_rank != 0:
            # last_rank = rlistgenderall[-1][1]
            last_rank = len(rlistgenderall)
            prep_rank = prep_rank - 1
            percentile = round((((last_rank - prep_rank)/last_rank)) * 100)
        else:
            percentile = 0
        data = {"percentile": percentile}
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        data = {"percentile": "Failed to get level."}
        return HttpResponse(json.dumps(data), content_type='application/json')


def calc_level(user):
    """A function that calculates and returns Levels, per WOD,
    per Category and General,
    incl. the relevant results and the accuracy of the assesment.
    Instead of callable by AJAX this is just a
    helper function without a return."""
    user = user
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


def setInitialSliderLevel(request, wod, lapse_date, rank_result, men_logs, women_logs):
    """Determine the result needed for a level of around 50 (median result)"""
    ft_seconds = True
    group_s = json.loads(getGroup(request))
    if group_s["custom"] != "false" or group_s["age"] == "true" or group_s["location"] != "group-global":
        selected_group = Log.objects.all()
        if wod.workout_type == 'FT':
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('ft_result')
            rank_result = 'ft_result'
        elif wod.workout_type == 'AMRAP':
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('-amrap_result')
            rank_result = 'amrap_result'
        else:
            all_logs_rank = selected_group.filter(
                workout=wod,
                rx=True,
                date__gt=lapse_date
                ).order_by('-mw_result')
            rank_result = 'mw_result'
        # Create a list of log id's for max result for the past year
        all_logs_l = list(all_logs_rank.values())
        log_max_list = []
        log_user_id_list = []
        for log in all_logs_l:
            if not log["user_id"] in log_user_id_list:
                log_user_id_list.append(log["user_id"])
                log_max_list.append(log["id"])
        # filter out all none max results from query
        all_logs_rank = all_logs_rank.filter(id__in=log_max_list)
        # create query of logs, for women,\
        # for men, and rank logs for the whole past year.
        all_logs_rank_women = all_logs_rank.filter(
            user__userprofile__gender="F"
            )
        all_logs_rank_men = all_logs_rank.filter(
            user__userprofile__gender="M"
            )
    else:
        all_logs_rank_men = men_logs
        all_logs_rank_women = women_logs
    if request.user.userprofile.gender == "M":
        if all_logs_rank_men.count() > 0:
            best = getattr(all_logs_rank_men[0], rank_result)
            worst = getattr(all_logs_rank_men.reverse()[0], rank_result)
            med_count = round(all_logs_rank_men.count() / 2)
            med = getattr(all_logs_rank_men[med_count], rank_result)
        else:
            best = 1
            worst = 1
            med = 1
            ft_seconds = False
    else:
        if all_logs_rank_women.count() > 0:
            best = getattr(all_logs_rank_women[0], rank_result)
            worst = getattr(all_logs_rank_women.reverse()[0], rank_result)
            med_count = round(all_logs_rank_women.count() / 2)
            med = getattr(all_logs_rank_women[med_count], rank_result)
        else:
            best = 1
            worst = 1
            med = 1
            ft_seconds = False
    if wod.workout_type == "FT" and ft_seconds:
        best = best.seconds
        worst = worst.seconds
        med = med.seconds
    initial_slider_level = med
    data = {
        'init': initial_slider_level,
        'best': best,
        'worst': worst
        }
    return data


def send_comment_notification(user, logid, message):
    """ Send th user comment notification email"""
    comment_name = user.userprofile.full_name
    log_user = Log.objects.get(id=logid).user
    if log_user == user:
        return
    log_name = log_user.userprofile.full_name
    wod_name = Log.objects.get(id=logid).workout.workout_name
    wod_date = Log.objects.get(id=logid).date
    email = log_user.email
    subject = "Somebody commented on your performance!"
    body = render_to_string(
        'workouts/messages/comment_notification.txt',
        {
            'log_name': log_name,
            'comment_name': comment_name,
            'message': message,
            'wod_name': wod_name,
            'wod_date': wod_date
        }
        )
    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [email]
    )
