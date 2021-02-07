from django.db.models.signals import post_save
from django.dispatch import receiver
# from notifications.signals import notify
from .models import MemberComment
# from django.contrib.auth.models import User


# @receiver(post_save, sender=MemberComment)
# def notify_comment(sender, instance, created, **kwargs):
#     user = instance.member
#     receiver = instance.log_id.user
#     user_name = user.userprofile.full_name
#     workout = instance.log_id.workout.workout_name
#     wod_date = instance.log_id.date
#     wod_date = wod_date.strftime("%d %b %Y")
#     comment = instance.message
#     message = f'{user_name} commented on your {workout} result of {wod_date}$%$%{comment}'
#     notify.send(user, recipient=receiver, verb=message)
#     print(message)
