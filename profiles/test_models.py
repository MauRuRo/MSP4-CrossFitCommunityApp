from django.test import TestCase
from .models import MailNotificationSettings
from django.contrib.auth.models import User

class TestModels(TestCase):

    def test_notify_defaults_to_true(self):
        user = User.objects.create(username="UserOne")
        mailsettings = MailNotificationSettings.objects.create(user=user)
        self.assertTrue(mailsettings.notify)
