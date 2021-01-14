from django.shortcuts import get_object_or_404
from .models import UserProfile


def user_info(request):
    """ processor to pass user profile image and possible other user info to all templates """
    if request.user.is_authenticated:
        try:
            profile = UserProfile.objects.get(user=request.user)
            try:
                if isinstance(profile.image, str):
                    image = profile.image
                    print("TEST PROFILE PIC")
                else:
                    image = profile.image.url
            except ValueError:
                image = '/media/noprofpic.jpg'
        except UserProfile.DoesNotExist:
            image = '/media/noprofpic.jpg'
            profile = None
    else:
        image = ''
        profile = None
    return {
        'image': image,
        'profile': profile
        }
