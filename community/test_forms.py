
from django.test import TestCase
from .forms import CustomGroupForm


class TestCustomGroupForm(TestCase):

    def test_item_name_is_required(self):
        form = CustomGroupForm({'name':''})
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors.keys())
        self.assertEqual(form.errors['name'][0],'This field is required.')

    def test_share_field_is_not_required(self):
        form = CustomGroupForm({'name': 'Groupname'})
        self.assertTrue(form.is_valid())

    def test_fields_are_explicit_in_form_metaclass(self):
        form = CustomGroupForm()
        self.assertEqual(form.Meta.fields, ('name', 'share'))
