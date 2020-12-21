from django.db import models
from django_countries.fields import CountryField
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    """
    A user profile
    """
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )
    full_name = models.CharField(max_length=40, null=True, blank=True)
    email = models.EmailField(max_length=254, null=False, blank=False)
    town_or_city = models.CharField(max_length=40, null=True, blank=True)
    country = CountryField(blank_label="Country", max_length=40, null=True,blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    weight = models.DecimalField(max_digits=4, decimal_places=1)
    age = models.IntegerField(null=False, blank=False)
    image = models.ImageField(null=True, blank=True)


