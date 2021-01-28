from django.shortcuts import get_object_or_404
from .models import UserProfile
from community.models import GroupSelect
import json


def user_info(request):
    """ processor to pass user profile image and possible other user info to all templates """
    if request.user.is_authenticated:
        group_select = {"age": False, "custom": False, "location": "global"}
        try:
            profile = UserProfile.objects.get(user=request.user)
            try:
                if isinstance(profile.image, str):
                    image = profile.image
                else:
                    image = profile.image.url
                try:
                    group_s = GroupSelect.objects.get(user=request.user)
                    group_select = group_s.group
                except GroupSelect.DoesNotExist:                    
                    group_select = {"age": False, "custom": False, "location": "group-city"}
            except ValueError:
                image = '/media/noprofpic.jpg'
                # image = {"url": '/media/noprofpic.jpg'}
                try:
                    group_s = GroupSelect.objects.get(user=request.user)
                    group_select = group_s.group
                except GroupSelect.DoesNotExist:
                    group_select = {"age": False, "custom": False, "location": "group-city"}
        except UserProfile.DoesNotExist:
            image = '/media/noprofpic.jpg'
            profile = None
    else:
        image = ''
        profile = None
        group_select = {"age": True, "custom": False, "location": "global"}
    group_select = json.dumps(group_select)
    return {
        'image': image,
        'profile': profile,
        'group_select': group_select
        }
