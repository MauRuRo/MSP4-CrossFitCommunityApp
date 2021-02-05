"""This file is created to perform a cronjob:
Specifically it needs to check from time to time if users
have been active and if not it needs to update their levels
in order for the stats for other users to be more or less accurate.
This cronjob will be commented out in settings.py as the app is just a developing excercise
deployed on a host with a limited number of free requests."""
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from workouts.views import calc_level
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Makes sure all members level statistics are up to date.'

    def handle(self, *args, **options):
        """Function to update statistics of inactive users"""
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
                if time_passed > one_day:
                    calc_level(user)
        return
