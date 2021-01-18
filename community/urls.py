from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.community, name='community'),
    # path('create_profile/', views.create_profile, name='create_profile'),
]
