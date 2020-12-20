from django.shortcuts import render, redirect, reverse


def index(request):
    """ a view to render the home page """
    if request.user.is_authenticated:
        return redirect(reverse('profile'))
    else:
        return render(request, 'home/index.html')
