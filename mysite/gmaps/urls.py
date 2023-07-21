from rest_framework import routers
from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import AttractionsViewSet, SignupView, UserProfileUpdateView, RestaurantsByAttractionView, TSPView, ItineraryView, ItineraryHistoryView, DeleteItineraryView, ChangePasswordView, UserProfileView, ShareItineraryView, JoinItineraryView, CommunityItineraryListView, ExitItineraryView, ExitItineraryView, BusynessView, BusynessDayView
router = routers.DefaultRouter()
router.register(r'attractions', AttractionsViewSet)

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/signup/', SignupView.as_view(), name='signup_api'),
    path('api/update_profile/', UserProfileUpdateView.as_view(), name='profile_api'),
    path('api/user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/change_password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('api/tsp/', TSPView.as_view(), name='tsp'), 
    path('api/save_itinerary/', ItineraryView.as_view(), name='save_itinerary'), 
    path('api/history/', ItineraryHistoryView.as_view()),
    path('api/itinerary/<int:id>/delete/', DeleteItineraryView.as_view(), name='delete_itinerary'),
    path('api/itinerary/<int:id>/share/', ShareItineraryView.as_view()),  # can both share and delete
    path('api/community_itinerary/<int:id>/join/', JoinItineraryView.as_view()),
    path('api/community_itinerary/', CommunityItineraryListView.as_view()),
    path('api/community_itinerary/<int:id>/exit/', ExitItineraryView.as_view(), name='exit-itinerary'),
    path('api/busyness/<int:zone_id>/<int:timestamp>/', BusynessView.as_view(), name='busyness'),
    path('api/busyness/<int:zone_id>/<int:timestamp>/day/', BusynessDayView.as_view()),
    path('api/', include(router.urls)),
    path('api/attractions/<int:pk>/restaurants/', RestaurantsByAttractionView.as_view(), name='attractions_restaurants'),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
]

