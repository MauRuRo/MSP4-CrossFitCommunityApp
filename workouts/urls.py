from django.contrib import admin
from django.conf.urls import url
from django.urls import path
from . import views

urlpatterns = [
    path('<wod_id>/', views.workouts, name='workouts'),
    path('0/commentMember/', views.commentMember, name='commentMember'),
    path('0/deleteCommentMember/', views.deleteCommentMember, name='deleteCommentMember'),
    path('0/deleteLog/', views.deleteLog, name='deleteLog'),
    path('0/dateInput/', views.dateInput, name='dateInput'),
    path('0/editLog/', views.editLog, name='editLog'),
    # url(r'^comment/$', views.comment, name='comment'),
]
