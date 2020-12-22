from django.shortcuts import get_object_or_404
from .models import UserProfile


def user_info(request):
    """ processor to pass user profile image and possible other user info to all templates """
    if request.user.is_authenticated:
        profile = get_object_or_404(UserProfile, user=request.user)
        image = profile.image.url
    else:
        image = ''

    return {'image': image}
