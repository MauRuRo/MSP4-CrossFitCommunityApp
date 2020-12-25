from django.shortcuts import render
from .models import Workout
# Create your views here.


def workouts(request):
    wod = Workout.objects.get(workout_name="J.T.")
    context = {
        'wod': wod
    }
    template = "workouts/workouts.html"
    return render(request, template, context)
