from django.shortcuts import render, get_object_or_404
from .models import UserProfile
from .forms import UserProfileForm

def profile(request):
    """ a view to render the home page """
    try:
        # profile = get_object_or_404(UserProfile, user=request.user)
        profile = UserProfile.objects.get(user=request.user)
        form = UserProfileForm(instance=profile)
    except UserProfile.DoesNotExist:
        form = UserProfileForm()

    template = 'profiles/profile.html'
    context = {
        'form': form,
    }

    return render(request, template, context)


def create_profile(request):
    """ a view to render the home page """
    form = UserProfileForm()

    template = 'profiles/create_profile.html'
    context = {
        'form': form,
    }

    return render(request, template, context)