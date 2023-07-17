import requests
from gmaps.models import Attractions
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import GEOSGeometry
import itertools
import logging

logger = logging.getLogger(__name__)

# Compute distance between loc1 and loc2
def dist(loc1, loc2):
    loc1_transformed = loc1.transform(2263, clone=True)  # NAD83 / New York Long Island (ftUS)
    loc2_transformed = loc2.transform(2263, clone=True)  # NAD83 / New York Long Island (ftUS)
    distance_in_ft = loc1_transformed.distance(loc2_transformed)
    distance_in_km = distance_in_ft / 3280.84  # convert from feet to kilometers
    return distance_in_km

# Compute the optimal order
def TSP(date, lat, lon, attractions):
    logger.info('TSP function called with date: %s, lat: %s, lon: %s, attractions: %s', date, lat, lon, attractions)
    try:
        myloc = Point(lon, lat, srid=4326)
        minDist = 1e9
        myPermutaion = None

        length = len(attractions)
        ps = list(itertools.permutations(range(length)))

        for p in ps:
            res = 0
            res += dist(myloc, GEOSGeometry(attractions[p[0]]['geom']))
            for i in range(1, length):
                loc1 = GEOSGeometry(attractions[p[i]]['geom'])
                loc2 = GEOSGeometry(attractions[p[i - 1]]['geom'])
                res += dist(loc1, loc2)
                if res > minDist:
                    continue
            if res < minDist:
                myPermutaion = p
                minDist = res
        
        ans = []
        for i in myPermutaion:
            ans.append(attractions[i])

        return ans
    except Exception as e:
        logger.error('Error in TSP function: %s', e)
        raise e

def greedy_TSP(date, lat, lon, attractions):
    logger.info('Greedy TSP function called with date: %s, lat: %s, lon: %s, attractions: %s', date, lat, lon, attractions)
    try:
        myloc = Point(lon, lat, srid=4326)
        not_visited = attractions.copy()
        current_loc = myloc
        ans = []

        while not_visited:
            next_loc = min(not_visited, key=lambda x: dist(current_loc, GEOSGeometry(x['geom'])))
            not_visited.remove(next_loc)
            ans.append(next_loc)
            current_loc = GEOSGeometry(next_loc['geom'])

        return ans
    except Exception as e:
        logger.error('Error in Greedy TSP function: %s', e)
        raise e



