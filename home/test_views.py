from django.test import TestCase


class TestViews(TestCase):

    def test_get_landing_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "home/index.html")