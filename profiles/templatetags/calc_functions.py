from datetime import date
from django import template
from django.forms.widgets import TextInput
from django.utils.dateparse import parse_duration

register = template.Library()


@register.filter(name='calc_age')
def calc_age(birth_date):
    current_day = date.today()
    age = (current_day.year - birth_date.year)
    return age

# class DurationInput(TextInput):

#     def calc_duration(self, value):
#         duration = parse_duration(value)

#         seconds = duration.seconds

#         minutes = seconds // 60
#         seconds = seconds % 60

#         minutes = minutes % 60

#         return '{:02d}:{:02d}'.format(minutes, seconds)