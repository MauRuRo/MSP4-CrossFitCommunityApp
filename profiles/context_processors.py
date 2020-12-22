from django.shortcuts import get_object_or_404
from .models import UserProfile


def user_info(request):
    """ processor to pass user profile image and possible other user info to all templates """
    if request.user.is_authenticated:
        try:
            # profile = get_object_or_404(UserProfile, user=request.user)
            profile = UserProfile.objects.get(user=request.user)
            if profile.image.url:
                image = profile.image.url
            else:
                image = '/media/noprofpic.jpg'
        except UserProfile.DoesNotExist:
                image = '/media/noprofpic.jpg'
    else:
        image = ''

    return {'image': image}
