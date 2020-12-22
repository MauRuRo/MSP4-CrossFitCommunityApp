from django.contrib import admin
from .models import UserProfile


class UserProfileAdmin(admin.ModelAdmin):
    fields = ('user', 'full_name', 'email',
                'town_or_city', 'country',
                'gender', 'weight', 'age', 'image')

admin.site.register(UserProfile, UserProfileAdmin)