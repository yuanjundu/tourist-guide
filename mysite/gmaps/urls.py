from rest_framework import routers
from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import AttractionsViewSet, SignupView


router = routers.DefaultRouter()
router.register(r'attractions', AttractionsViewSet)

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/signup/', SignupView.as_view(), name='signup_api'),
    path('api/', include(router.urls)),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('myspace', views.my_space, name='my_space'),
    path('settings', views.settings, name='settings'),
    path('logout_user/', views.logout_user, name='logout'),
    path('main/', views.default, name='main'),
    path('login/', views.loginPage, name='loginPage'),
    path('user_login/', views.user_login, name='user_login'),
    path('signup/', views.signup, name='signup'),
]

