from django.shortcuts import get_object_or_404
from .models import UserProfile


def user_info(request):
    """ processor to pass user profile image and possible other user info to all templates """
    print("START")
    if request.user.is_authenticated:
        try:
            profile = UserProfile.objects.get(user=request.user)
            try:
                image = profile.image.url
            except ValueError:
                image = '/media/noprofpic.jpg'
        except UserProfile.DoesNotExist:
            image = '/media/noprofpic.jpg'
    else:
        image = ''

    return {'image': image}
