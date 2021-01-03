from django.contrib import admin
from .models import Workout, Log, MemberComment


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
        'workout',
        'user',
        'date',
        'amrap_result',
        'ft_result',
        'mw_result'
    )

    readonly_fields = (
        'user',
        'personal_record',
    )

    fields = (
        'workout',
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


class MemberCommentAdmin(admin.ModelAdmin):
    list_display = (
        'member',
        'message',
        'log_id'
    )

    fields = (
        'member',
        'message',
        'log_id'
    )


admin.site.register(MemberComment, MemberCommentAdmin)
