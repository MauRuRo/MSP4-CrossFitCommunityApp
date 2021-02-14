from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.signals import notify
from .models import MemberComment


@receiver(post_save, sender=MemberComment)
def notify_comment(sender, instance, created, **kwargs):
    """Notify the user that somebody commented on their log."""
    user = instance.member
    receiver = instance.log_id.user
    notify_other_commenters(instance)
    if user == receiver:
        return
    user_name = user.userprofile.full_name
    workout = instance.log_id.workout.workout_name
    wod_date = instance.log_id.date
    wod_date = wod_date.strftime("%d %b %Y")
    comment = instance.message
    message = f'{user_name} commented on your {workout} result of {wod_date}$%$%{comment}'
    notify.send(user, recipient=receiver, verb=message, description="comment")


def notify_other_commenters(instance):
    """Notify anybody who has commented on a log when somebody else comments on it."""
    user = instance.member
    receiver = instance.log_id.user
    commenters = []
    comments = MemberComment.objects.filter(log_id=instance.log_id)
    for comment in comments:
        if comment.member not in commenters:
            commenters.append(comment.member)
    user_name = user.userprofile.full_name
    receiver_name = receiver.userprofile.full_name
    workout = instance.log_id.workout.workout_name
    wod_date = instance.log_id.date
    wod_date = wod_date.strftime("%d %b %Y")
    comment = instance.message
    message = f'{user_name} also commented on {receiver_name}\'s {workout} result of {wod_date}$%$%{comment}'
    for commenter in commenters:
        if commenter != user and commenter != receiver:
            notify.send(user, recipient=commenter, verb=message, description="comment")
