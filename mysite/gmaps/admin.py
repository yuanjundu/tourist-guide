from django.contrib import admin
from .models import Museum, Library, Hotel, Cafe, Artwork, Office, Restaurant, University, Attractions

# Register your models here.
admin.site.register(Museum)
admin.site.register(Library)
admin.site.register(Hotel)
admin.site.register(Cafe)
admin.site.register(Artwork)
admin.site.register(Office)
admin.site.register(Restaurant)
admin.site.register(University)

admin.site.register(Attractions)

admin.site.unregister(Museum)
admin.site.unregister(Library)
admin.site.unregister(Hotel)
admin.site.unregister(Cafe)
admin.site.unregister(Artwork)
admin.site.unregister(Office)
admin.site.unregister(Restaurant)
admin.site.unregister(University)

