import json
import numpy as np
from shapely.geometry.polygon import Polygon
import pickle

# open and read json file
f = open("taxi_zones.json")
taxi_zones = json.load(f)
f.close()

data = taxi_zones["data"]

# polygon at pos 10 in array
# zone at pos 12 in array

zones = {}

for key in data:
    # create entry in dictionary: taxi zone name -> list (of polygons)
    zones[key[12]] = []
    # get list of gps points which define the MULTIPOLYGON
    points = key[10]
    # split the MULTIPOLYGON into list of points defining indvidual polygons
    points = points.split("))")
    for i in range(len(points) - 1):
        points[i] = points[i].lstrip('MULTIPOLYGON ,()')
    # pop last element from list as it is empty
    points.pop()
    # for each list of points create a polygon using those points and append it to the list in our dictionary
    for a in points:
        poly_points = a.split(',')
        for i in range(len(poly_points)):
            poly_points[i] = poly_points[i].split()
            poly_points[i] = (poly_points[i][1], poly_points[i][0])
        poly_points = np.asarray(poly_points)
        polygon = Polygon(poly_points)
        zones[key[12]].append(polygon)

# dump zones dictionary to pickle file
with open('taxi_zone_polygons.pickle', 'wb') as handle:
    pickle.dump(zones, handle)
