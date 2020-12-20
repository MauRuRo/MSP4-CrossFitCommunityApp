from django.shortcuts import render


def profile(request):
    """ a view to render the home page """
    return render(request, 'my_profile/profile.html')
