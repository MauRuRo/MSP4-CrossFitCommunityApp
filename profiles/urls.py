from django.contrib import admin
from django.urls import path
from .webhooks import webhook
from . import views

urlpatterns = [
    path('', views.profile, name='profile'),
    path('create_profile/', views.create_profile, name='create_profile'),
    path('edit_profile/', views.edit_profile, name='edit_profile'),
    path('calc_level/', views.calc_level, name='calc_level'),
    path('markAsRead/', views.markAsRead, name='markAsRead'),
    path('SetMailNot/', views.SetMailNot, name='SetMailNot'),
    path('wh/', webhook, name="webhook"),
    path('cache_payment_create_profile/', views.cache_payment_create_profile, name="cache_payment_create_profile"),
]
