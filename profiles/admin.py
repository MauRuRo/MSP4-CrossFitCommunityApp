from django.contrib import admin
from .models import UserProfile, HeroLevels


class UserProfileAdmin(admin.ModelAdmin):
    fields = ('user', 'full_name', 'email',
                'town_or_city', 'country',
                'gender', 'weight', 'birthdate', 'image')

admin.site.register(UserProfile, UserProfileAdmin)


class HeroLevelsAdmin(admin.ModelAdmin):
    fields = ('user', 'level_data', 'general_level')

admin.site.register(HeroLevels, HeroLevelsAdmin)