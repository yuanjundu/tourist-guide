import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { refreshToken } from '../components/refreshToken';
import styles from './Itinerary.module.css';


const Itinerary = () => {
    const location = useLocation();
    const { myLocation, placesAttractions, selectedDate } = location.state || {};
    const { latitude = 0, longitude = 0 } = myLocation || {};
    const [orderedAttractions, setOrderedAttractions] = useState([]);
    const [morningAttractions, setMorningAttractions] = useState([]);
    const [afternoonAttractions, setAfternoonAttractions] = useState([]);

    const [lunchRestaurants, setLunchRestaurants] = useState([]);
    const [selectedLunchRestaurant, setSelectedLunchRestaurant] = useState(null);
    const [dinnerRestaurants, setDinnerRestaurants] = useState([]);
    const [selectedDinnerRestaurant, setSelectedDinnerRestaurant] = useState(null);

    const [busynessData, setBusynessData] = useState([]);


    const fetchBusynessForDay = async (zoneId, startOfDay) => {
        try {
            const token = localStorage.getItem('access');
            const response = await axios.get(
                `http://localhost:8000/api/busyness/${zoneId}/${Math.floor(startOfDay / 1000)}/day/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                if (Array.isArray(response.data)) {
                    const busynessValues = response.data.map(item => item.busyness);
                    setBusynessData(busynessValues);
                }
            } else {
                console.error('Error occurred:', response.data.error);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                const newToken = await refreshToken();
                localStorage.setItem('access', newToken);
                return fetchBusynessForDay(zoneId, startOfDay);
            } else {
                console.error('Error occurred:', error);
            }
        }
    };

    // Assume each attraction takes 2 hours, and the day starts at 8 AM
    const startOfDay = new Date(selectedDate).setHours(8, 0, 0, 0);  // Set to 8 AM of selected date
    const timePerAttraction = 2 * 60 * 60 * 1000;  // 2 hours in milliseconds

    useEffect(() => {
        if (morningAttractions.length > 0) {
            morningAttractions.forEach((attraction, index) => {
                const startOfAttraction = startOfDay + index * timePerAttraction;
                fetchBusynessForDay(attraction.zone, startOfAttraction);

                console.log(attraction.zone);
                console.log(startOfAttraction);
            });
            console.log(busynessData);
        }
    }, [morningAttractions]);



    //<------------------Test--------------------->
    useEffect(() => {
        console.log(location.state);
        console.log(selectedDate);
        console.log('selectedLunchRestaurant', selectedLunchRestaurant);
        console.log('selectedDinnerRestaurant', selectedDinnerRestaurant);
        console.log('lunchRestaurants', lunchRestaurants);
        console.log('dinnerRestaurants', dinnerRestaurants);
    }, [location.state]);
    
    //<------------------Test--------------------->


    const fetchOptimalOrder = async () => {
        const response = await axios.post("http://localhost:8000/api/tsp/?format=json", {
            selectedDate,
            latitude,
            longitude,
            placesAttractions,
        });

        if (response.status === 200) {
            console.log(response.data);
            setOrderedAttractions(response.data);
        } else {
            console.error('Error occurred:', response.data.error);
        }
    };

    useEffect(() => {
        fetchOptimalOrder();
    }, []);

    const fetchRestaurantsByAttraction = (attractionId, setRestaurantsFunction) => {
        fetch(`http://localhost:8000/api/attractions/${attractionId}/restaurants/?format=json`)
            .then((response) => response.json())
            .then((data) => setRestaurantsFunction(data));
    };

    useEffect(() => {
        if (orderedAttractions && orderedAttractions.length > 0) {
            const midPoint = Math.floor(orderedAttractions.length / 2);
            setMorningAttractions(orderedAttractions.slice(0, midPoint));
            setAfternoonAttractions(orderedAttractions.slice(midPoint));
            fetchRestaurantsByAttraction(orderedAttractions[midPoint].id, setLunchRestaurants);
            fetchRestaurantsByAttraction(orderedAttractions[orderedAttractions.length - 1].id, setDinnerRestaurants);
        }
    }, [orderedAttractions]);


    const handleSetLunchRestaurant = (restaurant) => {
        setSelectedLunchRestaurant(restaurant);
    };

    const handleSetDinnerRestaurant = (restaurant) => {
        setSelectedDinnerRestaurant(restaurant);
    };

    const handleSaveItinerary = () => {
        const token = localStorage.getItem('access');

        axios.post('http://localhost:8000/api/itinerary/save', {
            morningAttractions,
            afternoonAttractions,
            selectedLunchRestaurant,
            selectedDinnerRestaurant,
            selectedDate
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                // handle success
                console.log(response.data);
                alert("Itinerary saved successfully!");

                // get the existing history
                const history = JSON.parse(localStorage.getItem('history')) || [];

                // get the selected lunch and dinner restaurant data
                const selectedLunchRestaurantData = lunchRestaurants.find(restaurant => restaurant.id === Number(selectedLunchRestaurant));
                const selectedDinnerRestaurantData = dinnerRestaurants.find(restaurant => restaurant.id === Number(selectedDinnerRestaurant));

                console.log("selectedLunchRestaurantData" + selectedLunchRestaurantData);
                console.log("selectedDinnerRestaurantData" + selectedDinnerRestaurantData);

                // add the new itinerary to the history
                const newItinerary = {
                    id: response.data.itineraryId,
                    user: 'test',
                    morning_attractions: morningAttractions,
                    afternoon_attractions: afternoonAttractions,
                    lunch_restaurant: selectedLunchRestaurantData,
                    dinner_restaurant: selectedDinnerRestaurantData,
                    saved_date: selectedDate
                };
                history.push(newItinerary);
                // save the updated history back to localStorage
                localStorage.setItem('history', JSON.stringify(history));
            })
            .catch((error) => {
                // handle error
                if (error.response && error.response.status === 401) {
                    refreshToken();
                } else {
                    console.log(error.response.data);
                    alert("An error occurred while saving your itinerary.");
                }
            });
    };


    const data = busynessData.map((value, index) => ({
        name: `Attraction ${index + 1}`,
        busyness: value,
    }));

    return (
        <div className={styles.container}>
            <Header />

            <h2 className={styles.header}>Morning</h2>
            {morningAttractions.map((attraction, index) => (
                <div className={styles.attraction} key={index}>{attraction.name}</div>
            ))}

            <h2 className={styles.header}>Lunch</h2>
            <select className={styles.restaurantSelector} value={selectedLunchRestaurant} onChange={(e) => handleSetLunchRestaurant(e.target.value)}>
                <option value="">Select Restaurant</option>
                {lunchRestaurants.map((restaurant, index) => (
                    <option key={index} value={restaurant.id}>
                        {restaurant.name}
                    </option>
                ))}
            </select>

            <h2 className={styles.header}>Afternoon</h2>
            {afternoonAttractions.map((attraction, index) => (
                <div className={styles.attraction} key={index}>{attraction.name}</div>
            ))}

            <h2 className={styles.header}>Dinner</h2>
            <select className={styles.restaurantSelector} value={selectedDinnerRestaurant} onChange={(e) => handleSetDinnerRestaurant(e.target.value)}>
                <option value="">Select Restaurant</option>
                {dinnerRestaurants.map((restaurant, index) => (
                    <option key={index} value={restaurant.id}>
                        {restaurant.name}
                    </option>
                ))}
            </select>

            <button onClick={handleSaveItinerary} className={styles.saveHistory}>Save Itinerary</button>

            <div className='nav-box'>
                <Navigation onLocationChange={() => { }} />
            </div>
        </div>
    );
};

export default Itinerary;
