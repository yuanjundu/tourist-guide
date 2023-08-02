from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.auth.models import User

class Place(models.Model):
    id = models.AutoField(primary_key=True)
    housenumber = models.CharField(max_length=255, blank=True, null=True)
    street = models.CharField(max_length=255, blank=True, null=True)
    postcode = models.CharField(max_length=255, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    opening_hours = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    geom = gis_models.GeometryField(srid=4326, null=True)
    image = models.ImageField(upload_to='place_images/', blank=True, null=True)
    zone = models.IntegerField(null = True)
    tag = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        abstract = True

    def to_dict(self):
        return {
            "id": self.id,
            "housenumber": self.housenumber,
            "street": self.street,
            "postcode": self.postcode,
            "name": self.name,
            "opening_hours": self.opening_hours,
            "phone": self.phone,
            "website": self.website,
            "zone": self.zone,
            "tag": self.tag
        }


class Museum(Place):
    class Meta:
        db_table = 'museum'

class Hotel(Place):
    class Meta:
        db_table = 'hotel'

class Cafe(Place):
    class Meta:
        db_table = 'cafe'

class Library(Place):
    class Meta:
        db_table = 'library'

class Artwork(Place):
    class Meta:
        db_table = 'artwork'

class Office(Place):
    class Meta:
        db_table = 'office'

class Restaurant(Place):
    class Meta:
        db_table = 'restaurant'

class University(Place):
    class Meta:
        db_table = 'university'

class Attractions(Place):
    class Meta:
        db_table = 'attractions'
    
    

class AttractionRestaurants(models.Model):
    attraction = models.ForeignKey(Attractions, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    class Meta:
        db_table = 'attraction_restaurants'

    def to_dict(self):
        return {
            "attraction": self.attraction.to_dict(),
            "restaurant": self.restaurant.to_dict()
        }

class Itinerary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    morning_attractions = models.ManyToManyField(Attractions, related_name="morning_itineraries")
    afternoon_attractions = models.ManyToManyField(Attractions, related_name="afternoon_itineraries")
    lunch_restaurant = models.ForeignKey(Restaurant, on_delete=models.SET_NULL, null=True, related_name='lunch_itineraries')
    dinner_restaurant = models.ForeignKey(Restaurant, on_delete=models.SET_NULL, null=True, related_name='dinner_itineraries')
    saved_date = models.DateField(null=True, blank=True) 

    class Meta:
        db_table = 'itinerary'
    
    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "morning_attractions": [attraction.to_dict() for attraction in self.morning_attractions.all()],
            "afternoon_attractions": [attraction.to_dict() for attraction in self.afternoon_attractions.all()],
            "lunch_restaurant": self.lunch_restaurant.to_dict() if self.lunch_restaurant else None,
            "dinner_restaurant": self.dinner_restaurant.to_dict() if self.dinner_restaurant else None,
            "saved_date": self.saved_date.isoformat() if self.saved_date else None
        }


class CommunityItinerary(models.Model):
    itinerary = models.OneToOneField(Itinerary, on_delete=models.CASCADE)
    shared_on = models.DateTimeField(auto_now_add=True)
    joined_users = models.ManyToManyField(User, through='UserItinerary', related_name='joined_itineraries')

class UserItinerary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    community_itinerary = models.ForeignKey(CommunityItinerary, on_delete=models.CASCADE)
    joined_on = models.DateTimeField(auto_now_add=True)