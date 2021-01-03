from django.db import models
from datetime import date, datetime
from django.contrib.auth.models import User
from django.conf import settings


class Workout(models.Model):
    """
    A model for workouts
    """
    WORKOUT_TYPE_CHOICES = (
        ('FT', 'For Time'),
        ('AMRAP', 'As Many Rounds As Possible'),
        ('MW', 'Max. Weight'),
    )

    WORKOUT_CATEGORY_CHOICES = (
        ('PL', 'Power Lifts'),
        ('OL', 'Olympic Lifts'),
        ('SP', 'Speed'),
        ('EN', 'Endurance'),
        ('BW', 'Body Weight'),
        ('HE', 'Heavy'),
        ('LI', 'Light'),
        ('LO', 'Long'),
    )
    
    workout_name = models.CharField(max_length=40, null=False, blank=False, default='')
    workout_type = models.CharField(max_length=5, choices=WORKOUT_TYPE_CHOICES, null=False, blank=False)
    workout_category = models.CharField(max_length=5, choices=WORKOUT_CATEGORY_CHOICES, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    workout_is_wod = models.BooleanField(blank=False, default=False)

    def __str__(self):
        return self.workout_name

class Log(models.Model):
    """ a model for workout logs """
    workout = models.ForeignKey(Workout, blank=False, null=False, on_delete=models.CASCADE, default='1')
    ft_result = models.DurationField(blank=False, null=True)
    amrap_result = models.DecimalField(blank=False, decimal_places=2, max_digits=5)
    mw_result = models.DecimalField(blank=False, decimal_places=2, max_digits=5)
    rx = models.BooleanField(blank=True, default=True)
    user_comment = models.TextField(blank=True,null=True)
    member_comment = models.TextField(blank=True,null=True)
    date = models.DateField(null=False, blank=False, default=date.today)
    user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE, default='1')
    personal_record = models.BooleanField(default=False)


    def __str__(self):
        return self.workout.workout_name + " | " + self.user.username


class MemberComment(models.Model):
    """ a model for member comments """
    member = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE, default='1')
    message = models.CharField(blank=False, null=False, max_length=250)
    log_id = models.ForeignKey(Log, blank=False, null=False, on_delete=models.CASCADE, default='1')

    def __str__(self):
        return self.member.username
