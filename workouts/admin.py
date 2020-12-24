from django.contrib import admin
from .models import Workout


class WorkoutAdmin(admin.ModelAdmin):
    fields = (
        'workout_name',
        'workout_type',
        'workout_category',
        'description',
    )
    list_display = (
        'workout_name',
        'workout_category'
    )

admin.site.register(Workout, WorkoutAdmin)
