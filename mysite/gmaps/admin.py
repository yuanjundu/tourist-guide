from django.contrib import admin
from .models import Museum, Library, Hotel, Cafe, Artwork, Office, Restaurant, University, Attractions, AttractionRestaurants

# Register your models here.

admin.site.register(Restaurant)
admin.site.register(Attractions)
admin.site.register(AttractionRestaurants)
