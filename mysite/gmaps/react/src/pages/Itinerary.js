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
import background from './assets/background.jpg'
import {firstpara, restpara} from './ItineraryEnhance.js'

const Itinerary = () => {
    const location = useLocation();
    const { myLocation, myRestaurant, placesAttractions, selectedDate } = location.state || {};
    const { latitude = 0, longitude = 0 } = myLocation || {};
    const [orderedAttractions, setOrderedAttractions] = useState([]);
    const [morningAttractions, setMorningAttractions] = useState([]);
    const [afternoonAttractions, setAfternoonAttractions] = useState([]);
    const [lunchRestaurants, setLunchRestaurants] = useState([]);
    const [selectedLunchRestaurant, setSelectedLunchRestaurant] = useState(null);
    const [dinnerRestaurants, setDinnerRestaurants] = useState([]);
    const [selectedDinnerRestaurant, setSelectedDinnerRestaurant] = useState(null);
    const local = "http://localhost:8000"
    const midPoint = Math.floor(orderedAttractions.length / 2);
    let para1=[firstpara(),restpara(),restpara(),restpara(),restpara()]
    let para2 = [restpara(),restpara(),restpara(),restpara()]
    const time = [["9:00-12:00"],["9:00-12:00","14:00-17:00"],["9:00-12:00","14:00-17:00","18:00-20:00"],["9:00-12:00","13:00-16:00","17:00-20:00","21:00-22:00"],["9:00-11:00","12:00-14:00","15:00-17:00","18:00-20:00","21:00-22:00"]];

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
            console.log(response.data);
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

    const fetchRestaurantsByAttraction = (attractionId, setRestaurantsFunction) => {
        fetch(`${process.env.REACT_APP_API_URL}/api/attractions/${attractionId}/restaurants/?format=json`)
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
        const user = JSON.parse(localStorage.getItem('user'));
    
        axios.post(`${process.env.REACT_APP_API_URL}/api/itinerary/save/`, {
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
    
            // console.log("selectedLunchRestaurantData" + selectedLunchRestaurantData);
            // console.log("selectedDinnerRestaurantData" + selectedDinnerRestaurantData);
    
            // add the new itinerary to the history
            const newItinerary = {
                id: response.data.itineraryId,
                user: user.username,
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
                refreshToken(handleSaveItinerary);
            } else {
                // console.log(error.response.data);
                alert("An error occurred while saving your itinerary.");
            }
        });
    };
    

    return (
        <div className={styles.container}>
            {/* <Header /> */}
            <div className={styles.image}>
                <img className={styles.img} src={background}></img>
            </div>
            <div className={styles.title}>
                <p className={styles.itinerary}>In New York!</p>
                <p className={styles.day}>concreate jungle where dreams are made of</p>
                <p className={styles.day1}>There's nothing you can't do!</p>
            </div>
            <div className={styles.container2}>

                <p className={styles.container2_title}>Your itinerary for the day</p>
                <div className={styles.container3}>
                                       
                    {/* <p className={styles.header}>Morning</p>
                    <p className={styles.description}>Amidst Central Park's lush greenery, a leisurely stroll unveils urban serenity.</p> */}
                    
                    
                    {morningAttractions.map((attraction, index) => (
                        <div className={styles.container4}>  
                            <img src= {local + attraction.image} alt={attraction.image} className={styles.attraction_img}/>
                            <div className={styles.attraction} key={index}>{attraction.name}</div>
                            <p className={styles.time}>{time[orderedAttractions.length-1][index]}</p>
                            <p className={styles.container4_p} key={index}>{para1[index]}<b>{attraction.name}.</b></p>
                            
                        </div>
                    ))}
                </div>


                {/* <img className={styles.img3} src={lunch}></img>
                <h2 className={styles.header}>14:00-16:00 Lunch</h2>
                <p className={styles.description}>Indulge in classic lunch experience with mouthwatering deli sandwiches and a side of city charm.</p> */}
                <div className={styles.restcontainer}>
                {/* <select className={styles.restaurantSelector} value={selectedLunchRestaurant} onChange={(e) => handleSetLunchRestaurant(e.target.value)}>
                    <option value="">Select Restaurant</option>
                    {lunchRestaurants.map((restaurant, index) => (
                        <option key={index} value={restaurant.id}>
                            {restaurant.name}
                        </option>
                    ))}
                </select> */}
                </div>

                {/* <img className={styles.img4} src={evening}></img>
                <h2 className={styles.header}>18:00-20:00 Evening</h2>
                <p className={styles.description}>A vibrant kaleidoscope of lights, entertainment, and bustling energy in the heart of Manhattan.</p> */}
                {afternoonAttractions.map((attraction, index) => (
                     <div className={styles.container4}>
                     <img src= {local + attraction.image} alt={attraction.image} className={styles.attraction_img}/>
                     <div className={styles.attraction} key={index}>{attraction.name}</div>
                     <p className={styles.time}>{time[orderedAttractions.length-1][index+midPoint]}</p>
                     <p className={styles.container4_p} key={index}>{para2[index]}<b>{attraction.name}.</b></p>
                    </div>
                ))}

                {/* <img className={styles.img3} src={dinner}></img>
                <h2 className={styles.header}>20:00-22:00 Dinner</h2>
                <p className={styles.description}>Treat yourself to a gourmet dinner in an upscale ambience while taking in the night views of the city.</p> */}
                {/* Use the term finally here */}
                <div className={styles.restcontainer}>
                    {/* <select className={styles.restaurantSelector} value={selectedDinnerRestaurant} onChange={(e) => handleSetDinnerRestaurant(e.target.value)}>
                        <option value="">Select Restaurant</option>
                        {dinnerRestaurants.map((restaurant, index) => (
                            <option key={index} value={restaurant.id}>
                                {restaurant.name}
                            </option>
                        ))}
                    </select> */}
                </div>
                
                <button className={styles.saveButton} onClick={handleSaveItinerary}>Save Itinerary</button>

            </div>

            <Navigation />
        </div>
    );
}

export default Itinerary;
