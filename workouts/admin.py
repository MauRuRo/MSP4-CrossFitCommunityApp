from django.contrib import admin
from .models import Workout
from .models import Log


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

class LogAdmin(admin.ModelAdmin):
    fields = (
        'ft_result',
        'amrap_result',
        'mw_result',
        'rx',
        'user_comment',
        'user',
        'personal_record'
    )
admin.site.register(Log, LogAdmin)
