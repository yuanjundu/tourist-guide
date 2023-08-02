from django.contrib import admin
from .models import Restaurant, Attractions, AttractionRestaurants, Itinerary, CommunityItinerary, UserItinerary

# Register your models here.

admin.site.register(Restaurant)
admin.site.register(Attractions)
admin.site.register(AttractionRestaurants)
admin.site.register(Itinerary)
admin.site.register(CommunityItinerary)
admin.site.register(UserItinerary)