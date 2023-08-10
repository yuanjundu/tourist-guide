import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './Community.module.css';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { refreshToken } from '../components/refreshToken';



const Community = () => {
    const [sharedItineraries, setSharedItineraries] = useState([]);
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const comparedUserId = JSON.parse(localStorage.getItem('userId'))
    const local = `${process.env.REACT_APP_API_URL}`;
    const time = [["10:00-12:00","13:00-14:00","20:00-21:00"],["10:00-12:00","13:00-15:00","16:00-19:00","20:00-21:00"],["10:00-12:00","13:00-14:00","15:00-17:00","18:00-20:00","21:00-22:00"],["9:00-11:00","12:00-14:00","15:00-16:00","17:00-18:00","19:00-20:00","21:00-22:00"],["9:00-10:00","11:00-12:00","13:00-14:00","15:00-16:00","17:00-18:00","19:00-20:00","21:00-22:00"]];
    var length;
    const midPoint = Math.floor(length / 2);


    const fetchSharedItineraries = useCallback(async () => {
        const token = localStorage.getItem('access');
        axios.get(`${process.env.REACT_APP_API_URL}/api/community_itinerary/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                setSharedItineraries(response.data);
                console.log(sharedItineraries);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(fetchSharedItineraries);
                } else {
                    console.log(error);
                }
            });
    }, []);

    useEffect(() => {
        fetchSharedItineraries();
    }, [fetchSharedItineraries]);

    const handleJoin = async (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.post(`${process.env.REACT_APP_API_URL}/api/community_itinerary/${itineraryId}/join/`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Joined the itinerary successfully!");
                axios.get(`${process.env.REACT_APP_API_URL}/api/community_itinerary/`)
                    .then(response => {
                        setSharedItineraries(response.data);
                    });
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleJoin(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    const handleDelete = (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.delete(`${process.env.REACT_APP_API_URL}/api/itinerary/${itineraryId}/share/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Deleted the itinerary successfully!");
                fetchSharedItineraries();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleDelete(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    const handleExit = (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.delete(`${process.env.REACT_APP_API_URL}/api/community_itinerary/${itineraryId}/exit/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Exited the itinerary successfully!");
                fetchSharedItineraries();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleExit(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    

    return (
        <div className={styles.communityContainer}>
            {/* <Header /> */}
            <h1 className={styles.header}>Community</h1>
            {sharedItineraries.map((itinerary, index) => (
                <div key={index} className={styles.itinerary} >
                    {/* <img className={styles.backgroundimg} src={local + itinerary.itinerary.morning_attractions[0].image}></img> */}
                    
                    <h3 className={styles.title}>Created by {itinerary.user.first_name + " " + itinerary.user.last_name}</h3>
                    <h3 className={styles.joined}>(Joined by {itinerary.joined_users.length} users)</h3>
                    <p className={styles.p_none}>{length = (itinerary.itinerary.morning_attractions.length+itinerary.itinerary.afternoon_attractions.length-1)}</p>
                    <div className={styles.date}>
                        <p className={styles.sectiondate}>{itinerary.itinerary.saved_date}</p>
                    </div>
                    <div className={styles.attractionSection}>
                        <h3 className={styles.styling}>Morning Attractions:</h3>
                        {itinerary.itinerary.morning_attractions?.map((attraction, index) => (
                            <div className={styles.box}>
                                <h3 className={styles.time}>{time[length][index]}</h3>
                                <p className={styles.styling} key={index}>{attraction.name}</p>
                            </div>
                        ))}
                    </div>
                    <div className={styles.attractionSection}>
                        <h3 className={styles.styling}>Lunch Restaurant:</h3>
                        <div  className={styles.box}>
                            <p className={styles.styling}>{itinerary.itinerary.lunch_restaurant?.name}</p>
                            <p className={styles.time}>{time[length][midPoint]}</p>
                        </div>
                    </div>

                    <div className={styles.attractionSection}>
                        <h3 className={styles.styling}>Afternoon Attractions:</h3>
                        {itinerary.itinerary.afternoon_attractions?.map((attraction, index) => (
                            <div  className={styles.box}>
                                <h2 className={styles.time}>{time[length][index+midPoint+1]}</h2>
                                <p className={styles.styling} key={index}>{attraction.name}</p>
                                
                            </div>
                        ))}
                    </div>
                    <div className={styles.attractionSection}>
                        <h3 className={styles.styling}>Dinner Restaurant:</h3>
                        <div  className={styles.box}>
                            <h2 className={styles.time}>{time[length][length+2]}</h2>
                            <p className={styles.styling}>{itinerary.itinerary.dinner_restaurant?.name}</p>
                            
                        </div>
                    </div>

                    {itinerary.user.id === comparedUserId
                            ? <button className={styles.deleteButton} onClick={() => handleDelete(itinerary.id)}>Delete</button>
                            : itinerary.joined_users.includes(comparedUserId)
                                ? <button className={styles.exitButton} onClick={() => handleExit(itinerary.id)}>Exit</button>
                                : <button className={styles.joinButton} onClick={() => handleJoin(itinerary.id)}>Join</button>
                    }

                </div>
                
                
            ))}
            <div className='nav-box'>
                <Navigation onLocationChange={() => { }} />
            </div>
        </div>
    );
};

export default Community;