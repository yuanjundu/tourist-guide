from django.contrib import admin
from .models import Museum, Library, Hotel, Cafe, Artwork, Office, Restaurant, University, Attractions, AttractionRestaurants, Itinerary

# Register your models here.

admin.site.register(Restaurant)
admin.site.register(Attractions)
admin.site.register(AttractionRestaurants)
admin.site.register(Itinerary)