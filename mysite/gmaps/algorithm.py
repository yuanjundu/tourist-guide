import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'mysite.settings'
django.setup()

import requests
from gmaps.models import Attractions
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import GEOSGeometry

def dist(loc1, loc2):
    loc1_transformed = loc1.transform(2263, clone=True)  # NAD83 / New York Long Island (ftUS)
    loc2_transformed = loc2.transform(2263, clone=True)  # NAD83 / New York Long Island (ftUS)
    distance_in_ft = loc1_transformed.distance(loc2_transformed)
    distance_in_km = distance_in_ft / 3280.84  # convert from feet to kilometers
    return distance_in_km

def TSP(date, lat, lon, attractions):
    ans = []
    myloc = Point(lon, lat, srid=4326)
    attraction_loc = GEOSGeometry(attractions[0]['geom'])
    print(dist(myloc, attraction_loc))
    return





