from django.contrib import admin
from .models import Workout
from .models import Log


class WorkoutAdmin(admin.ModelAdmin):
    fields = (
        'workout_name',
        'workout_is_wod',
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

    list_display = (
        'wod_name',
        'user',
        'date',
        'amrap_result'
    )

    readonly_fields = (
        'wod_name',
        'user',
        'personal_record',
    )

    fields = (
        'wod_name',
        'user',
        'date',
        'ft_result',
        'amrap_result',
        'mw_result',
        'rx',
        'user_comment',
        'personal_record'
    )
admin.site.register(Log, LogAdmin)
