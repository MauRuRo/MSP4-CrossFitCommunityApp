from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from jsonfield import JSONField


class CustomGroup(models.Model):
    name = models.CharField(max_length=15, null=False, blank=False, default='')
    group_users = models.ManyToManyField(User, related_name="group_user")
    admin = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name