from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    # path('', views.workouts, name='workouts'),
    path('<wod_id>/', views.workouts, name='workouts'),
]
