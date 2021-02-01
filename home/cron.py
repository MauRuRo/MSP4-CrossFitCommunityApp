"""This file is created to perform a cronjob:
Specifically it needs to check from time to time if users
have been active and if not it needs to update their levels
in order for the stats for other users to be more or less accurate.
This cronjob will be commented out in settings.py as the app is just a developing excercise
deployed on a host with a limited number of free requests."""
from datetime import datetime, timedelta
from django.utils.dateparse import parse_datetime
from django.contrib.auth.models import User
from workouts.views import calc_level


def cron_check_levels():
    """Function to update statistics of inactive users"""
    User.objects.filter(pk="1").update(full_name="Bubo de Hoho")
    today = datetime.now()
    today = today.replace(tzinfo=None)
    one_day = timedelta(days=1)
    users = User.objects.all()
    for user in users:
        last_active = user.last_login
        if last_active is None:
            calc_level(user)
        else:
            last_active = last_active.replace(tzinfo=None)
            time_passed = today - last_active
            print(time_passed)
            if time_passed > one_day:
                print("calculating for: ", user)
                calc_level(user)