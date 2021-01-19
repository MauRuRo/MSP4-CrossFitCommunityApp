from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.community, name='community'),
    path('setGroupSelect/', views.setGroupSelect, name='setGroupSelect'),
    path('resetStats/', views.resetStats, name='resetStats'),
    # path('popGroup/', views.popGroup, name='popGroup'),
]
