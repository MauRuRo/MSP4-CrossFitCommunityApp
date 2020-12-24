from django.db import models
# from django.contrib.auth.models import User
# from django_countries.fields import CountryField
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.conf import settings

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

    def __str__(self):
        return self.workout_name


