from .models import UserProfile
from community.models import GroupSelect
from django.conf import settings
import json


def user_info(request):
    """ processor to pass user profile image 
    and possible other user info to all templates """
    if request.user.is_authenticated:
        group_select = {"age": False, "custom": False, "location": "global"}
        try:
            profile = UserProfile.objects.get(user=request.user)
            try:
                if not profile.image:
                    profile.image = f'{settings.MEDIA_URL}noprofpic.jpg'
                    profile.save()
                if isinstance(profile.image, str):
                    image = profile.image
                else:
                    image = profile.image.url
                try:
                    group_s = GroupSelect.objects.get(user=request.user)
                    group_select = group_s.group
                except GroupSelect.DoesNotExist:
                    group_select = {
                        "age": False,
                        "custom": False,
                        "location": "group-city"
                        }
            except ValueError:
                image = f'{settings.MEDIA_URL}noprofpic.jpg'
                try:
                    group_s = GroupSelect.objects.get(user=request.user)
                    group_select = group_s.group
                except GroupSelect.DoesNotExist:
                    group_select = {
                        "age": False,
                        "custom": False,
                        "location": "group-city"
                        }
        except UserProfile.DoesNotExist:
            image = f'{settings.MEDIA_URL}noprofpic.jpg'
            profile = None
    else:
        image = ''
        profile = None
        group_select = {"age": True, "custom": False, "location": "global"}
    group_select = json.dumps(group_select)
    return {
        'image': image,
        'profile': profile,
        'group_select': group_select,
        'active_user': request.user
        }
