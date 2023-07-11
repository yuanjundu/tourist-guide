from rest_framework import routers, serializers, viewsets
from .models import Attractions
from django.urls import path, include
from . import views

class AttractionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attractions
        fields = ['id', 'housenumber', 'street', 'postcode', 'name', 'opening_hours', 'phone', 'website', 'geom', 'image', 'zone', 'tag']

class AttractionsViewSet(viewsets.ModelViewSet):
    queryset = Attractions.objects.all()
    serializer_class = AttractionsSerializer

router = routers.DefaultRouter()
router.register(r'attractions', AttractionsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('myspace', views.my_space, name='my_space'),
    path('settings', views.settings, name='settings'),
    path('logout_user/', views.logout_user, name='logout'),
    path('main/', views.default, name='main'),
    path('login/', views.loginPage, name='loginPage'),
    path('signup/', views.signup, name='signup'),
]

