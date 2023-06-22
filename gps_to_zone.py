import pickle
from shapely.geometry import Point

# unpickle taxi_zone_polygons file
with open('taxi_zone_polygons.pickle', 'rb') as handle:
    zones = pickle.load(handle)

def gps_to_zone(lat, lon):
    p = Point(lat, lon)
    for zone, polygons in zones.items():
        for polygon in polygons:
            if (polygon.contains(p)):
                return zone
    return None
