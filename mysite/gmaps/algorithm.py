from django.contrib.gis.geos import Point
from django.contrib.gis.geos import GEOSGeometry
import itertools
import logging
import random
import copy
from copy import deepcopy
import pickle
from datetime import datetime
import os
import joblib
import pandas as pd

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
    

def get_day_and_closest_quarter_minute(date_str):
    """
    Calculate the day of the year and the total minutes for the closest quarter hour.
    Parameters:
        date_str (str): A date-time string in the format "dd-mm-yyyy HH:MM:SS".
    Returns:
        day_of_year (int): An integer representing the day of the year (1 to 365/366).
        total_minutes (int): An integer representing the total minutes in the day, 
                             including the closest minute to 15 minutes.
    """
    if " " not in date_str: # there is no time part in the date string
        date_str += " 00:00:00" # add a default time part

    # Convert the input string to a datetime object    
    date_obj = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")

    # Get the day of the year (1 to 365/366)
    day_of_year = date_obj.timetuple().tm_yday
    # Calculate the closest minute to 15 minutes
    minute = date_obj.minute
    closest_quarter_minute = round(minute / 15) * 15
    # Calculate the total minutes
    total_minutes = closest_quarter_minute + (date_obj.hour * 60)
    # Create a new datetime object with the closest quarter minute
    closest_datetime = date_obj.replace(minute=closest_quarter_minute, second=0)
    return day_of_year, total_minutes





time_slots = {
    1: ("9:00 - 12:00"),
    2: ("9:00 - 12:00", "14:00 - 17:00"),
    3: ("9:00 - 12:00", "14:00 - 17:00", "18:00 - 22:00"),
    4: ("9:00 - 12:00", "13:00 - 16:00", "17:00 - 20:00", "21:00 - 22:00"),
    5: ("9:00 - 11:00", "12:00 - 14:00", "15:00 - 17:00", "18:00 - 20:00", "21:00 - 22:00")
}


# def fitness_function(busyness_locations, itinerary):
#     total_busyness = 0
#     for slot, location in itinerary.items():
#         total_busyness += busyness_locations[location][slot]
#     return -total_busyness

def fitness_function(busyness_locations, itinerary):
    total_busyness = 0
    for slot, location_id in itinerary.items():
        if slot in busyness_locations[location_id]:
            total_busyness += busyness_locations[location_id][slot]
    return -total_busyness


def initialize_population(slots, locations, population_size):
    population = []
    slots = list(range(slots))
    for i in range(0, population_size):
        random.shuffle(slots)
        population.append(dict(zip(slots, locations)))
    return population

def generate_random_itinerary(slots, locations):
    available_slots = list(range(slots))
    random.shuffle(available_slots)
    return {available_slots[slot]: location for slot, location in enumerate(locations)}

def create_child(parent1, parent2, crossover_point):
    child = dict()
    slots = list(range(len(parent1)))
    added_gene = []

    if crossover_point == len(slots):
        n = 0
        for slot in slots:
            if parent2[slot] not in added_gene:
                child[n] = parent2[slot]
                n += 1
    else:
        for slot in slots[crossover_point:]:
            child[slot] = parent1[slot]
            added_gene.append(child[slot])

        n = 0
        for slot in slots:
            if parent2[slot] not in added_gene:
                child[n] = parent2[slot]
                n += 1

    return child


def crossover(parent1, parent2):
    slots = range(len(parent1))
    crossover_point = random.randint(1, len(slots) - 1) 

    child1 = create_child(parent1, parent2, crossover_point)
    child2 = create_child(parent2, parent1, crossover_point)

    return child1, child2


def mutate(itinerary):
    slot1, slot2 = random.sample(itinerary.keys(), 2)
    itinerary[slot1], itinerary[slot2] = itinerary[slot2], itinerary[slot1]
    return itinerary


def genetic_algorithm(slots, busyness_locations):
    logger.info('Genetic Algorithm called with: slots: %s, busyness_locations: %s', slots, busyness_locations)

    generations = 100
    population_size = 100

    locations = list(busyness_locations.keys())

    # population = initialize_population(slots, locations, population_size=100)
    population = [generate_random_itinerary(slots, locations) for _ in range(population_size)]


    fitness_key = lambda x: -fitness_function(busyness_locations=busyness_locations, itinerary=x)

    for i in range(generations):
        population.sort(key=lambda x: fitness_function(busyness_locations=busyness_locations, itinerary=x))
        selected_parents = population[:population_size//2]
    

        offspring = []

        for i in range(0, len(selected_parents), 2):
            parent1, parent2 = crossover(selected_parents[i], selected_parents[i+1])
            
            child1, child2 = crossover(parent1,parent2)

            if random.random() > 0.5:
                child1 = mutate(child1)
            if random.random() > 0.5:
                child2 = mutate(child2)
            offspring.extend([child1, child2])

        population = selected_parents + offspring
        population.sort(key=fitness_key)
        population = population[:len(population)//2]
        
    best_itinerary = max(population, key = fitness_key)
    print(fitness_function(busyness_locations, best_itinerary))
    return best_itinerary

def convert_time_to_minutes(time_str):
    hours, minutes = map(int, time_str.split(":"))
    return hours * 60 + minutes

def get_month_week_day_and_closest_quarter_minute(date_str):
    """
    Calculate the month, week of the year, day of the year, and the total minutes 
    for the closest quarter hour.
    """
    # Convert the input string to a datetime object
    if " " not in date_str: # there is no time part in the date string
        date_str += " 00:00:00" # add a default time part
    date_obj = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    # Get the month
    month = date_obj.month
    # Get the week of the year
    week_of_year = date_obj.isocalendar()[1]
    # Get the day of the year (1 to 365/366)
    day_of_year = date_obj.timetuple().tm_yday
    # Calculate the closest minute to 15 minutes
    minute = date_obj.minute
    closest_quarter_minute = round(minute / 15) * 15
    # Calculate the total minutes
    total_minutes = closest_quarter_minute + (date_obj.hour * 60)
    
    return month, week_of_year, day_of_year, total_minutes

def get_busyness_locations(locations, date_str):
    print(date_str)
    model_path = 'gmaps/pkl/random_forest_model.pkl'
    if not os.path.exists(model_path):
        raise FileNotFoundError

    model = joblib.load(model_path)

    month, week_of_year, day_of_year, _ = get_month_week_day_and_closest_quarter_minute(date_str)

    busyness_locations = {}
    for location in locations:
        busyness_times = {}
        zone_id = location['zone']
        for time_slot in time_slots[len(locations) - 1]:
            start_time, end_time = map(convert_time_to_minutes, time_slot.split(" - "))
            print(start_time, end_time)
            start_data = {
                'LocationID': [zone_id],
                'day_of_year': [day_of_year],
                'minute_of_day': [start_time],
                'month': [month],
                'week': [week_of_year], 
                'day': [day_of_year]
            }
            end_data = {
                'LocationID': [zone_id],
                'day_of_year': [day_of_year],
                'minute_of_day': [end_time],
                'month': [month],
                'week': [week_of_year], 
                'day': [day_of_year]
            }
            busyness_times[time_slot] = (model.predict(pd.DataFrame(start_data))[0] + model.predict(pd.DataFrame(end_data))[0]) / 2
        busyness_locations[location['id']] = busyness_times

    return busyness_locations
