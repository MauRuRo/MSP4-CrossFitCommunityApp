from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.profile, name='profile'),
    path('create_profile/', views.create_profile, name='create_profile'),
    path('edit_profile/', views.edit_profile, name='edit_profile'),
    path('calc_level/', views.calc_level, name='calc_level'),
    path('refreshLevels/', views.refreshLevels, name='refreshLevels'),
    # path('test/', views.test, name='test'),
    # path('populate/', views.populate, name='populate'),
    # path('logPopulation/', views.logPopulation, name='logPopulation'),
    # path('deleteLogs/', views.deleteLogs, name='deleteLogs'),
    # path('leveler/', views.leveler, name='leveler'),
    # path('getPersonalHistory/', views.getPersonalHistory, name='getPersonalHistory'),
    
]
