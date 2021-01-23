from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.community, name='community'),
    path('setGroupSelect/', views.setGroupSelect, name='setGroupSelect'),
    path('resetStats/', views.resetStats, name='resetStats'),
    path('lazyLoadGroup/', views.lazyLoadGroup, name='lazyLoadGroup'),
    path('searchMember/', views.searchMember, name='searchMember'),
    path('makeGroup/', views.makeGroup, name='makeGroup'),
    path('getGroupEditInfo/', views.getGroupEditInfo, name='getGroupEditInfo'),
    path('editGroup/', views.editGroup, name='editGroup'),
    path('deleteGroup/', views.deleteGroup, name='deleteGroup'),
    path('getMemberInfo/', views.getMemberInfo, name='getMemberInfo'),
    # path('popGroup/', views.popGroup, name='popGroup'),
]
