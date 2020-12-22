from django.shortcuts import render, get_object_or_404
from .models import UserProfile
from .forms import UserProfileForm

def profile(request):
    """ a view to render the home page """
    profile = get_object_or_404(UserProfile, user=request.user)
    form = UserProfileForm(instance=profile)

    template = 'profiles/profile.html'
    context = {
        'form': form,
    }

    return render(request, template, context)
