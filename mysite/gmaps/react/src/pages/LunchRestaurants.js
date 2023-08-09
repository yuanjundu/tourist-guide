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

const Restaurants = () => {
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
    const [Lunchplaces, setLunchPlaces] = useState([]);
    const [Dinnerplaces, setDinnerPlaces] = useState([]);
    const [Lunch, setLunchRestaurant] = useState([]);
    const [Dinner, setDinnerRestaurant] = useState([]);
    
    const local = "http://localhost:8000"
    const midPoint = Math.floor(orderedAttractions.length / 2);
    

    const handleAddLunch = (restaurant) => {
        // Restrict the number of attractions
        if (Lunchplaces.length >= 1) {
          alert("You could choose at most 1 restaurant!");
          return;
        }
        const newPlace = (
          <div className="add-places">
            
          </div>
        );
    
        // Add the new place into array
        setLunchPlaces([...Lunchplaces, newPlace]);
        setLunchRestaurant([...Lunch, restaurant]);
      };

      const handleAddDinner = (restaurant) => {
        // Restrict the number of attractions
        if (Dinnerplaces.length >= 1) {
          alert("You could choose at most 1 restaurant!");
          return;
        }
        const newPlace = (
          <div className="add-places">
            <icons.Geo />
            <span className="details">
              <p className="place-details">{restaurant.name}</p>
            </span>
          </div>
        );
    
        // Add the new place into array
        setDinnerPlaces([...Dinnerplaces, newPlace]);
        setDinnerRestaurant([...Dinner, restaurant]);
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

    
    const navigate = useNavigate();

    
    const redirectToItinerary = () => {
        navigate('/itinerary', { state: { myLocation, placesAttractions: placesAttractions, Lunch: Lunch, Dinner:Dinner, selectedDate} });
    }



    return (
            <div className={styles.container}>
                {/* <Header /> */}
                <h1 className={styles.resttitle}>What would you like to eat for lunch?</h1>
                <p className={styles.resttitle1}>We have loads of options to eat</p>
                <div className={styles.allcards}>
                    {lunchRestaurants.map((restaurant, index) => (
                        
                        <div className={styles.cards}>
                            <Card 
                            key={restaurant.id} 
                            title={restaurant.name} 
                            index={index+1}
                            contact={restaurant.phone}
                            address={restaurant.street}
                            website={restaurant.website}
                            isSelected={restaurant.isSelected} 
                            onAddLunch={handleAddLunch}/>
                        </div>
                        ))}
                </div>
                
                
                
                    <h1 className={styles.resttitle}>What would you like to eat for dinner?</h1>
                    <p className={styles.resttitle1}>Select any one from below.</p>
                    <div className={styles.allcards}>
                    {dinnerRestaurants.map((restaurant, index) => (


                        <div className={styles.cards}>
                            <Card 
                            key={restaurant.id} 
                            title={restaurant.name} 
                            index={index+21}
                            contact={restaurant.phone}
                            address={restaurant.street}
                            website={restaurant.website}
                            isSelected={restaurant.isSelected} 
                            onAddLunch={handleAddDinner}/>
                        </div>
                        ))}
                    </div>
                    
                    <button className={styles.finaliselunch} onClick={redirectToItinerary}>Save</button>

                    {/* <!-- End page content --> */}
            </div>
        
    );
}

export default Restaurants;
