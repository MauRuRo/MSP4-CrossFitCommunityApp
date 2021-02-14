from django.test import TestCase
from .views import getAgeGroup
from datetime import datetime


class TestViews(TestCase):

    def test_get_age_group(self):
        """To test function, replace 'request.user.userprofile.birthdate' and 'request' with 'x'."""
        dob = datetime.strptime("1990-08-01", "%Y-%m-%d")
        self.assertEqual(getAgeGroup(dob), "30-40 years")
