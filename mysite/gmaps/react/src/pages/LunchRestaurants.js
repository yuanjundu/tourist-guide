import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { refreshToken } from '../components/refreshToken';
import styles from './Restaurants.module.css';
import Attraction from '../Attraction';
import { MdDone } from 'react-icons/md';
import Card from './Card';
import * as icons from 'react-bootstrap-icons';
import Footer from '../components/Footer';

const Restaurants = () => {
    const location = useLocation();
    const { myLocation, placesAttractions, selectedDate, selectedTime } = location.state || {};
    const { latitude = 0, longitude = 0 } = myLocation || {};
    const [orderedAttractions, setOrderedAttractions] = useState([]);
    const [morningAttractions, setMorningAttractions] = useState([]);
    const [afternoonAttractions, setAfternoonAttractions] = useState([]);
    const [lunchRestaurants, setLunchRestaurants] = useState([]);
    const [dinnerRestaurants, setDinnerRestaurants] = useState([]);
    const [Lunchplaces, setLunchPlaces] = useState([]);
    const [Dinnerplaces, setDinnerPlaces] = useState([]);
    const [Lunch, setLunchRestaurant] = useState(null);
    const [Dinner, setDinnerRestaurant] = useState(null);

    const handleSelectRestaurant = (restaurant, mealType) => {
        if (mealType === 'lunch') {
            setLunchRestaurant(restaurant);
        } else {
            setDinnerRestaurant(restaurant);
        }
    };




    const fetchOptimalOrder = async () => {
        const token = localStorage.getItem('access');
        axios.post(`${process.env.REACT_APP_API_URL}/api/gene/?format=json`, {
            selectedDate,
            latitude,
            longitude,
            placesAttractions,
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                setOrderedAttractions(response.data);
            })
            .catch((error) => {
                // handle error
                if (error.response && error.response.status === 401) {
                    refreshToken(fetchOptimalOrder);
                } else {
                    console.error('Error occurred:', error);
                }
            });
    }

    useEffect(() => {
        fetchOptimalOrder();
    }, []);

    useEffect(() => {
        if (orderedAttractions && orderedAttractions.length > 0) {
            const midPoint = Math.floor(orderedAttractions.length / 2);
            setMorningAttractions(orderedAttractions.slice(0, midPoint));
            setAfternoonAttractions(orderedAttractions.slice(midPoint));
            fetchRestaurantsByAttraction(orderedAttractions[midPoint].id, setLunchRestaurants);
            fetchRestaurantsByAttraction(orderedAttractions[orderedAttractions.length - 1].id, setDinnerRestaurants);
        }
    }, [orderedAttractions]);

    const fetchRestaurantsByAttraction = (attractionId, setRestaurantsFunction) => {
        fetch(`${process.env.REACT_APP_API_URL}/api/attractions/${attractionId}/restaurants/?format=json`)
            .then((response) => response.json())
            .then((data) => setRestaurantsFunction(data));
    };


    const navigate = useNavigate();

    useEffect(() => {
        console.log(Lunch);
        console.log(Dinner);
        console.log(orderedAttractions);
        console.log(morningAttractions);
        console.log(dinnerRestaurants);
    });

    const redirectToItinerary = () => {
        navigate('/itinerary', { state: { myLocation, Lunch, Dinner, orderedAttractions, morningAttractions, afternoonAttractions, selectedDate } });

    }

    return (
        <div className={styles.container}>
            {/* <Header /> */}
            <h1 className={styles.resttitle}>What would you like to eat for lunch?</h1>
            <p className={styles.resttitle1}>We have loads of options to eat</p>
            <div className={styles.allcards}>
                {lunchRestaurants.map((restaurant, index) => (

                    
                        <Card
                            key={restaurant.id}
                            title={restaurant.name}
                            restaurant={restaurant}
                            index={index + 1}
                            contact={restaurant.phone}
                            address={restaurant.street}
                            website={restaurant.website}
                            isSelected={Lunch && Lunch.id === restaurant.id}
                            onSelect={() => handleSelectRestaurant(restaurant, 'lunch')}
                        />

                    
                ))}
            </div>


            <h1 className={styles.resttitle}>What would you like to eat for dinner?</h1>
            <p className={styles.resttitle1}>Select any one from below.</p>
            <div className={styles.allcards}>
                {dinnerRestaurants.map((restaurant, index) => (


                
                        <Card
                            key={restaurant.id}
                            title={restaurant.name}
                            restaurant={restaurant}
                            index={index + 21}
                            contact={restaurant.phone}
                            address={restaurant.street}
                            website={restaurant.website}
                            isSelected={Dinner && Dinner.id === restaurant.id}
                            onSelect={() => handleSelectRestaurant(restaurant, 'dinner')}
                        />

         
                ))}
            </div>

            <button className={styles.finaliselunch} onClick={redirectToItinerary}>Save</button>
            <Footer />
            {/* <!-- End page content --> */}
        </div>

    );
}

export default Restaurants;
