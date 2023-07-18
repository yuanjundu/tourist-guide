import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { refreshToken } from '../components/refreshToken';
import styles from './Itinerary.module.css';


const Itinerary = () => {
    const location = useLocation();
    const { myLocation, myRestaurant, placesAttractions, selectedDate } = location.state || {};
    const { latitude = 0, longitude = 0 } = myLocation || {};
    const [orderedAttractions, setOrderedAttractions] = useState([]);
    const [morningAttractions, setMorningAttractions] = useState([]);
    const [afternoonAttractions, setAfternoonAttractions] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
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
                if(Array.isArray(response.data)) {
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
        // console.log(myLocation);
        // console.log(placesAttractions);
        // console.log(myRestaurant);
        console.log(selectedDate);
    });
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


    useEffect(() => {
        if (orderedAttractions && orderedAttractions.length > 0) {
            const midPoint = Math.floor(orderedAttractions.length / 2);
            setMorningAttractions(orderedAttractions.slice(0, midPoint));
            setAfternoonAttractions(orderedAttractions.slice(midPoint));
            fetchRestaurantsByAttraction(orderedAttractions[midPoint].id);
        }
    }, [orderedAttractions]);

    const fetchRestaurantsByAttraction = (attractionId) => {
        fetch(`http://localhost:8000/api/attractions/${attractionId}/restaurants/?format=json`)
            .then((response) => response.json())
            .then((data) => setRestaurants(data));
    };

    const handleSetMyRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant);
    };

    const handleSaveItinerary = () => {
        const token = localStorage.getItem('access');

        axios.post('http://localhost:8000/api/saveitinerary/', {
            morningAttractions,
            afternoonAttractions,
            selectedRestaurant,
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
                // add the new itinerary to the history
                const newItinerary = {
                    id: response.data.itineraryId, // Assuming your response data includes the id of the new itinerary
                    user: 'test', // Replace this with the actual user information
                    morning_attractions: morningAttractions,
                    afternoon_attractions: afternoonAttractions,
                    selected_restaurant: selectedRestaurant,
                    saved_date: selectedDate
                };
                history.push(newItinerary);
                // save the updated history back to localStorage
                localStorage.setItem('history', JSON.stringify(history));
            })
            .catch((error) => {
                // handle error
                if (error.response.status === 401) {
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
            {restaurants.map((restaurant, index) => (
                <div className={`${styles.lunch} ${selectedRestaurant === restaurant ? styles.selected : ''}`} key={index} onClick={() => handleSetMyRestaurant(restaurant)}>
                    {restaurant.name}
                </div>
            ))}

            <h2 className={styles.header}>Afternoon</h2>
            {afternoonAttractions.map((attraction, index) => (
                <div className={styles.attraction} key={index}>{attraction.name}</div>
            ))}

            <button onClick={handleSaveItinerary} className={styles.saveHistory}>Save Itinerary</button>

            <Footer onLocationChange={() => { }} />
        </div>
    );
};

export default Itinerary;
