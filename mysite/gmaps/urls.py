from django.urls import path
from . import views

urlpatterns = [
    path('', views.map_view, name='map_view'),
    path('/register/', views.register, name='register'),
    path('/user_login/', views.user_login, name='user_login'),
    path('/myspace', views.my_space, name='my_space'),
    path('/settings', views.settings, name='settings'),
    path('/logout_user/', views.logout_user, name='logout'),
]

