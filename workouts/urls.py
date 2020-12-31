from django.contrib import admin
from django.conf.urls import url
from django.urls import path
from . import views

urlpatterns = [
    path('<wod_id>/', views.workouts, name='workouts'),
    path('0/commentMember/', views.commentMember, name='commentMember'),
    # url(r'^comment/$', views.comment, name='comment'),
]
