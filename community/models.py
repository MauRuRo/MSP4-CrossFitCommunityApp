from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from jsonfield import JSONField


class CustomGroup(models.Model):
    name = models.CharField(max_length=15, null=False, blank=False, default='')
    group_users = models.ManyToManyField(User, related_name="group_user", blank=False)
    admin = models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)
    share = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class GroupSelect(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = JSONField()

    def __str__(self):
        return ("group" + self.user.username)