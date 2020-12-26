from django.shortcuts import render, redirect, reverse
from datetime import date, datetime
from .models import Workout
from .models import Log
from .forms import LogForm
from django.utils.dateparse import parse_duration
from django.db.models import Avg, Max, Min, Sum
from django.contrib import messages
# Create your views here.


def striphours(duration):
    for x in duration:
        # print(x)
        if x == "0" or x == ':':
            # print("DELETE")
            no_hours = duration.split(x, 1)[1]
            # print(no_hours)
        else:
            break
    return no_hours


def workouts(request):
    wod = Workout.objects.get(workout_name="Murph")
    if request.method == "GET":
        # wod = Workout.objects.get(workout_name="Murph")
        # wod = Workout.objects.filter().first()
        log = Log.objects.filter().first()
        if log is None:
            result = "No logs for this WOD"
        else:
            duration = str(log.ft_result)
            result = striphours(duration)
        # result = "No logs for this WOD"
        form_log = LogForm()
        context = {
            'wod': wod,
            'log': result,
            'form_log': form_log,
        }
        template = "workouts/workouts.html"
        return render(request, template, context)
    else:
        log_form = LogForm(request.POST)
        if log_form.is_valid():
            new_log = log_form.save(commit=False)
            new_log.wod_name = wod.workout_name
            new_log.user = request.user
            new_result = new_log.ft_result.seconds
            # new_log.wod_date = datetime.now

            max_result = Log.objects.filter(user=request.user, wod_name=wod.workout_name).aggregate(Min('ft_result'))
            print(max_result)
            if max_result['ft_result__min'] == None:
                new_log.personal_record = True
            else:
                best_result = max_result['ft_result__min'].seconds
                if best_result > new_result:
                    new_log.personal_record = True
                else:
                    new_log.personal_record = False
            new_log.save()
            messages.success(request, 'Workout logged: Great work!')
            return redirect(reverse('workouts'))
        else:
            messages.error(request, 'There was an error with your form. \
                Please double check your information.')

