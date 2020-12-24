from datetime import date
from django import template

register = template.Library()


@register.filter(name='calc_age')
def calc_age(birth_date):
    current_day = date.today()
    age = (current_day.year - birth_date.year)
    return age
