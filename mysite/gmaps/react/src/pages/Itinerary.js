import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import moment from 'moment';
import { useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { refreshToken } from '../components/refreshToken';
import styles from './Itinerary.module.css';
import background from './assets/background.jpg'
import lunchpic from './assets/lunch.jpg'
import dinnerpic from './assets/dinner.jpg'
import {firstpara, restpara} from './ItineraryEnhance.js'
import Card from './Card';

const Itinerary = () => {
    const location = useLocation();
    const { myLocation, myRestaurant, placesAttractions,Lunch: Lunch,Dinner:Dinner, selectedDate } = location.state || {};
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
    const time = [["10:00-12:00","13:00-14:00","20:00-21:00"],["10:00-12:00","13:00-15:00","16:00-19:00","20:00-21:00"],["10:00-12:00","13:00-14:00","15:00-17:00","18:00-20:00","21:00-22:00"],["9:00-11:00","12:00-14:00","15:00-16:00","17:00-18:00","19:00-20:00","21:00-22:00"],["9:00-10:00","11:00-12:00","13:00-14:00","15:00-16:00","17:00-18:00","19:00-20:00","21:00-22:00"]];
    const timeindex = placesAttractions.length;
    
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
        
    };

    const handleSetDinnerRestaurant = (restaurant) => {
        
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
            const selectedLunchRestaurantData = setSelectedLunchRestaurant(Lunch);
            const selectedDinnerRestaurantData = setSelectedDinnerRestaurant(Dinner);
            
    
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
                                       
                   
                    {morningAttractions.map((attraction, index) => (
                        <div className={styles.container4}>  
                            <img src= {local + attraction.image} alt={attraction.image} className={styles.attraction_imgs}/>
                            <div className={styles.attraction} key={index}>{attraction.name}</div>
                            <p className={styles.time}>{time[orderedAttractions.length-1][index]}</p>
                            <p className={styles.container4_p} key={index}>{para1[index]}<b>{attraction.name}.</b></p>
                            
                        </div>
                    ))}
                </div>

                <div className={styles.container4}>  
                    <img src= {lunchpic} className={styles.attraction_imgs}/>
                    <div className={styles.attraction}>{Lunch}</div>
                    <p className={styles.time}>{time[timeindex-1][midPoint]}</p>
                    <p className={styles.container4_p}>Indulge in a delectable lunch amidst the vibrant energy of New York City, where culinary delights meet urban excitement at <b>{Lunch}.</b></p>
                            
                </div>


                
                {afternoonAttractions.map((attraction, index) => (
                     <div className={styles.container4}>
                     <img src= {local + attraction.image} alt={attraction.image} className={styles.attraction_imgs}/>
                     <div className={styles.attraction} key={index}>{attraction.name}</div>
                     <p className={styles.time}>{time[orderedAttractions.length-1][index+midPoint+1]}</p>
                     <p className={styles.container4_p} key={index}>{para2[index]}<b>{attraction.name}.</b></p>
                    </div>
                ))}

                
                

                <div className={styles.container4}>  
                    <img src= {dinnerpic} className={styles.attraction_imgs}/>
                    <div className={styles.attraction}>{Dinner}</div>
                    <p className={styles.time}>{time[timeindex-1][timeindex+1]}</p>
                    <p className={styles.container4_p}>Wrap up your day with a flavorful dinner in the heart of New York, where the city's iconic skyline illuminates your culinary journey at <b>{Dinner}.</b></p>
                            
                </div>
                
                <button className={styles.saveButton} onClick={handleSaveItinerary}>Save Itinerary</button>

            </div>

            <Navigation />
        </div>
    );
}

export default Itinerary;
