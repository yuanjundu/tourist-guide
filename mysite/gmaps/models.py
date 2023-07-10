from django.db import models
from django.contrib.gis.db import models as gis_models

class Place(models.Model):
    id = models.AutoField(primary_key=True)
    housenumber = models.CharField(max_length=255)
    street = models.CharField(max_length=255)
    postcode = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    opening_hours = models.CharField(max_length=255)
    phone = models.CharField(max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    geom = gis_models.GeometryField(srid=4326)
    image = models.ImageField(upload_to='place_images/', blank=True, null=True)
    zone = models.IntegerField(null = True)
    tag = models.CharField(max_length=255, default='')

    class Meta:
        abstract = True

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


