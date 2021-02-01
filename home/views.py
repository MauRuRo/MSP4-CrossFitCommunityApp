from django.shortcuts import render, redirect, reverse
from django.contrib.sites.models import Site


def index(request):
    """ a view to render the home page """
    sites = Site.objects.all()
    for site in sites:
        print(site, site.pk)
    print(Site.objects.filter(id=4))
    if request.user.is_authenticated:
        return redirect(reverse('profile'))
    else:
        return render(request, 'home/index.html')
