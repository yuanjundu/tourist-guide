from django.shortcuts import render
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
]

# Create your views here.
