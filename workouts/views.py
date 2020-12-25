from django.shortcuts import render
from .models import Workout
from .models import Log
from .forms import LogForm
from django.utils.dateparse import parse_duration
# Create your views here.


def striphours(duration):
    for x in duration:
        print(x)
        if x == "0" or x == ':':
            print("DELETE")
            no_hours = duration.split(x, 1)[1]
            print(no_hours)
        else:
            break
    return no_hours


def workouts(request):
    wod = Workout.objects.get(workout_name="Murph")
    # wod = Workout.objects.filter().first()
    log = Log.objects.filter().first()
    duration = str(log.ft_result)
    result = striphours(duration)
    form_log = LogForm()
    context = {
        'wod': wod,
        'log': result,
        'form_log': form_log,
    }
    template = "workouts/workouts.html"
    return render(request, template, context)
